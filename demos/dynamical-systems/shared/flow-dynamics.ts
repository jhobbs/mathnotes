// Shared logic for 1D dynamical systems ẋ = f(x)
import { parse, derivative } from 'mathjs';
import type { MathNode, EvalFunction } from 'mathjs';

export type StabilityType = 'stable' | 'unstable' | 'half-stable-left' | 'half-stable-right';

export interface FixedPoint {
  x: number;
  stability: StabilityType;
}

export interface CriticalPoint {
  x: number;
}

export interface ViewRange {
  xMin: number;
  xMax: number;
}

export class FlowDynamics {
  private compiledF: EvalFunction | null = null;
  private compiledDf: EvalFunction | null = null;
  private _parseError: boolean = false;
  private _fixedPoints: FixedPoint[] = [];
  private _criticalPoints: CriticalPoint[] = [];
  private _tMax: number = 20;
  private _viewRange: ViewRange;
  private _r: number = 0;

  constructor(
    private xMin: number = -5,
    private xMax: number = 5
  ) {
    this._viewRange = { xMin, xMax };
  }

  get r(): number {
    return this._r;
  }

  set r(value: number) {
    this._r = value;
  }

  get parseError(): boolean {
    return this._parseError;
  }

  get fixedPoints(): FixedPoint[] {
    return this._fixedPoints;
  }

  get criticalPoints(): CriticalPoint[] {
    return this._criticalPoints;
  }

  get tMax(): number {
    return this._tMax;
  }

  get viewRange(): ViewRange {
    return this._viewRange;
  }

  f(x: number): number {
    if (!this.compiledF) return 0;
    try {
      const result = this.compiledF.evaluate({ x, r: this._r });
      return typeof result === 'number' ? result : 0;
    } catch {
      return 0;
    }
  }

  df(x: number): number {
    if (!this.compiledDf) return 0;
    try {
      const result = this.compiledDf.evaluate({ x, r: this._r });
      return typeof result === 'number' ? result : 0;
    } catch {
      return 0;
    }
  }

  parseExpression(exprString: string): boolean {
    try {
      const node: MathNode = parse(exprString);
      this.compiledF = node.compile();
      const dfNode = derivative(node, 'x');
      this.compiledDf = dfNode.compile();
      this._parseError = false;
      return true;
    } catch {
      this._parseError = true;
      this.compiledF = null;
      this.compiledDf = null;
      return false;
    }
  }

  private newtonRaphson(x0: number, tol: number = 1e-10, maxIter: number = 100): number | null {
    if (!this.compiledF || !this.compiledDf) return null;

    let x = x0;
    for (let i = 0; i < maxIter; i++) {
      const fx = this.f(x);
      const dfx = this.df(x);
      if (Math.abs(dfx) < 1e-14) return null;
      const xNew = x - fx / dfx;
      if (Math.abs(xNew - x) < tol) return xNew;
      x = xNew;
    }
    return null;
  }

  findFixedPoints(): void {
    this._fixedPoints = [];
    if (this._parseError) return;

    const numSamples = 200;
    const step = (this.xMax - this.xMin) / numSamples;
    const candidates: number[] = [];
    const zeroThreshold = 1e-10;

    let prevX = this.xMin;
    let prevY = this.f(this.xMin);

    if (Math.abs(prevY) < zeroThreshold) {
      const root = this.newtonRaphson(prevX);
      candidates.push(root !== null ? root : prevX);
    }

    for (let i = 1; i <= numSamples; i++) {
      const x = this.xMin + i * step;
      const y = this.f(x);

      if (Math.abs(y) < zeroThreshold) {
        const root = this.newtonRaphson(x);
        candidates.push(root !== null ? root : x);
      } else if (prevY * y < 0) {
        const midpoint = (prevX + x) / 2;
        const root = this.newtonRaphson(midpoint);
        if (root !== null && root >= this.xMin && root <= this.xMax) {
          candidates.push(root);
        }
      }

      prevX = x;
      prevY = y;
    }

    const tolerance = 1e-6;
    const derivThreshold = 1e-6;
    for (const c of candidates) {
      const isDuplicate = this._fixedPoints.some(fp => Math.abs(fp.x - c) < tolerance);
      if (!isDuplicate) {
        const dfx = this.df(c);
        let stability: StabilityType;

        if (Math.abs(dfx) < derivThreshold) {
          const delta = 0.01;
          const fLeft = this.f(c - delta);
          const fRight = this.f(c + delta);

          if (fLeft > 0 && fRight > 0) {
            stability = 'half-stable-left';
          } else if (fLeft < 0 && fRight < 0) {
            stability = 'half-stable-right';
          } else if (fLeft > 0 && fRight < 0) {
            stability = 'stable';
          } else {
            stability = 'unstable';
          }
        } else if (dfx < 0) {
          stability = 'stable';
        } else {
          stability = 'unstable';
        }

        this._fixedPoints.push({ x: c, stability });
      }
    }

    this._fixedPoints.sort((a, b) => a.x - b.x);
  }

  findCriticalPoints(): void {
    this._criticalPoints = [];
    if (this._parseError) return;

    const numSamples = 200;
    const step = (this.xMax - this.xMin) / numSamples;
    const candidates: number[] = [];
    const zeroThreshold = 1e-8;

    let prevX = this.xMin;
    let prevDf = this.df(this.xMin);

    for (let i = 1; i <= numSamples; i++) {
      const x = this.xMin + i * step;
      const dfx = this.df(x);

      // Check for near-zero at sample point
      if (Math.abs(dfx) < zeroThreshold) {
        candidates.push(x);
      } else if (prevDf * dfx < 0) {
        let lo = prevX, hi = x;
        for (let j = 0; j < 50; j++) {
          const mid = (lo + hi) / 2;
          const dfMid = this.df(mid);
          if (Math.abs(dfMid) < zeroThreshold) {
            candidates.push(mid);
            break;
          }
          if (this.df(lo) * dfMid < 0) {
            hi = mid;
          } else {
            lo = mid;
          }
        }
        candidates.push((lo + hi) / 2);
      }

      prevX = x;
      prevDf = dfx;
    }

    const tolerance = 1e-4;
    for (const c of candidates) {
      const isDuplicate = this._criticalPoints.some(cp => Math.abs(cp.x - c) < tolerance);
      const isFixedPoint = this._fixedPoints.some(fp => Math.abs(fp.x - c) < tolerance);
      if (!isDuplicate && !isFixedPoint) {
        this._criticalPoints.push({ x: c });
      }
    }

    this._criticalPoints.sort((a, b) => a.x - b.x);
  }

  computeTimeScale(): void {
    let maxTau = 0;

    for (const fp of this._fixedPoints) {
      if (fp.stability === 'stable' || fp.stability === 'half-stable-left' || fp.stability === 'half-stable-right') {
        const dfx = this.df(fp.x);
        if (dfx < -1e-6) {
          const tau = -1 / dfx;
          maxTau = Math.max(maxTau, tau);
        }
      }
    }

    if (maxTau > 0) {
      this._tMax = Math.min(Math.max(maxTau * 5, 5), 100);
    } else {
      let maxVelocity = 0;
      const numSamples = 50;
      for (let i = 0; i <= numSamples; i++) {
        const x = this.xMin + (i / numSamples) * (this.xMax - this.xMin);
        maxVelocity = Math.max(maxVelocity, Math.abs(this.f(x)));
      }

      if (maxVelocity > 0.1) {
        const crossTime = (this.xMax - this.xMin) / maxVelocity;
        this._tMax = Math.min(Math.max(crossTime * 2, 5), 50);
      } else {
        this._tMax = 20;
      }
    }
  }

  computeViewRange(): void {
    const defaultRange = this.xMax - this.xMin;

    if (this._fixedPoints.length > 0) {
      const xs = this._fixedPoints.map(fp => fp.x);
      const minFp = Math.min(...xs);
      const maxFp = Math.max(...xs);
      const span = maxFp - minFp;

      if (span < 0.1) {
        // Single fixed point or cluster - center on it with reasonable range
        const center = (minFp + maxFp) / 2;
        this._viewRange = { xMin: center - 3, xMax: center + 3 };
      } else if (span < defaultRange * 0.4) {
        // Multiple fixed points in a reasonable range - auto-scale
        const padding = Math.max(span * 0.5, 1);
        this._viewRange = { xMin: minFp - padding, xMax: maxFp + padding };
      } else {
        // Fixed points spread too wide - use default range
        this._viewRange = { xMin: this.xMin, xMax: this.xMax };
      }
    } else {
      // No fixed points - use default range
      this._viewRange = { xMin: this.xMin, xMax: this.xMax };
    }
  }

  update(exprString: string): boolean {
    const success = this.parseExpression(exprString);
    this.findFixedPoints();
    this.findCriticalPoints();
    this.computeTimeScale();
    this.computeViewRange();
    return success;
  }

  /** Update after r changes (no re-parsing needed) */
  updateForParameter(): void {
    this.findFixedPoints();
    this.findCriticalPoints();
    this.computeTimeScale();
    this.computeViewRange();
  }
}

// Preset functions for UI (non-parametric)
export const PRESETS = [
  { label: 'sin(x)', expr: 'sin(x)' },
  { label: 'x(1-x)', expr: 'x*(1-x)' },
  { label: 'x²-1', expr: 'x^2-1' },
  { label: 'x-x³', expr: 'x-x^3' },
  { label: 'x²', expr: 'x^2' },
  { label: '-x²', expr: '-x^2' }
];

// Parametric presets with r ranges for bifurcation demos
export interface ParametricPreset {
  label: string;
  expr: string;
  rMin: number;
  rMax: number;
  rDefault: number;
  rStep: number;
}

export const PARAMETRIC_PRESETS: ParametricPreset[] = [
  { label: 'Saddle-node', expr: 'r - x^2', rMin: -5, rMax: 5, rDefault: 0, rStep: 0.1 },
  { label: 'Transcritical', expr: 'r*x - x^2', rMin: -5, rMax: 5, rDefault: 0, rStep: 0.1 },
  { label: 'Supercritical', expr: 'r*x - x^3', rMin: -5, rMax: 5, rDefault: 0, rStep: 0.1 },
  { label: 'Subcritical', expr: 'r*x + x^3', rMin: -5, rMax: 5, rDefault: 0, rStep: 0.1 }
];

// Color palette for trajectories
export const TRAJECTORY_COLORS = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
  '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4'
];
