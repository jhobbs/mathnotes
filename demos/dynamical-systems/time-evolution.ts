// Time Evolution - x(t) vs t plot for 1D dynamical systems ẋ = f(x)
import p5 from 'p5';
import type { DemoConfig, DemoInstance, DemoMetadata } from '@framework/types';
import { P5DemoBase } from '@framework';
import { parse, derivative } from 'mathjs';
import type { MathNode, EvalFunction } from 'mathjs';

type StabilityType = 'stable' | 'unstable' | 'half-stable-left' | 'half-stable-right';

interface FixedPoint {
  x: number;
  stability: StabilityType;
}

interface CriticalPoint {
  x: number;
}

interface TrajectoryPoint {
  t: number;
  x: number;
}

interface Trajectory {
  points: TrajectoryPoint[];
  color: string;
  active: boolean; // still animating
}

// Color palette for trajectories
const TRAJECTORY_COLORS = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
  '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4'
];

class TimeEvolutionDemo extends P5DemoBase {
  // Function state
  private exprString: string = 'sin(x)';
  private compiledF: EvalFunction | null = null;
  private compiledDf: EvalFunction | null = null;
  private parseError: boolean = false;

  // View parameters
  private tMin: number = 0;
  private tMax: number = 20;
  private xMin: number = -10;
  private xMax: number = 10;

  // Fixed points, critical points, and trajectories
  private fixedPoints: FixedPoint[] = [];
  private criticalPoints: CriticalPoint[] = [];
  private trajectories: Trajectory[] = [];
  private colorIndex: number = 0;


  // UI elements
  private inputEl!: HTMLInputElement;

  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
  }

  protected getStylePrefix(): string {
    return 'time-evol';
  }

  protected getContainerId(): string {
    return 'time-evol-container';
  }

  protected getAspectRatio(): number {
    return 0.5;
  }

  protected getMaxHeightPercent(): number {
    return 0.6;
  }

  private f(x: number): number {
    if (!this.compiledF) return 0;
    try {
      const result = this.compiledF.evaluate({ x });
      return typeof result === 'number' ? result : 0;
    } catch {
      return 0;
    }
  }

  private df(x: number): number {
    if (!this.compiledDf) return 0;
    try {
      const result = this.compiledDf.evaluate({ x });
      return typeof result === 'number' ? result : 0;
    } catch {
      return 0;
    }
  }

  private parseExpression(): void {
    try {
      const node: MathNode = parse(this.exprString);
      this.compiledF = node.compile();
      const dfNode = derivative(node, 'x');
      this.compiledDf = dfNode.compile();
      this.parseError = false;
      this.inputEl.style.borderColor = '';
    } catch {
      this.parseError = true;
      this.compiledF = null;
      this.compiledDf = null;
      this.inputEl.style.borderColor = 'red';
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

  private findFixedPoints(): void {
    this.fixedPoints = [];
    if (this.parseError) return;

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
      const isDuplicate = this.fixedPoints.some(fp => Math.abs(fp.x - c) < tolerance);
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

        this.fixedPoints.push({ x: c, stability });
      }
    }

    this.fixedPoints.sort((a, b) => a.x - b.x);
  }

  private findCriticalPoints(): void {
    this.criticalPoints = [];
    if (this.parseError) return;

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
        // Bisection to find the zero of df
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

    // Deduplicate
    const tolerance = 1e-4;
    for (const c of candidates) {
      const isDuplicate = this.criticalPoints.some(cp => Math.abs(cp.x - c) < tolerance);
      // Also skip if it's at a fixed point (where f(x) = 0)
      const isFixedPoint = this.fixedPoints.some(fp => Math.abs(fp.x - c) < tolerance);
      if (!isDuplicate && !isFixedPoint) {
        this.criticalPoints.push({ x: c });
      }
    }

    this.criticalPoints.sort((a, b) => a.x - b.x);
  }

  private computeTimeScale(): void {
    // Find the characteristic timescale from stable equilibria
    // Near a stable point x*, decay is ~ e^(f'(x*)·t), so τ = -1/f'(x*)

    let maxTau = 0;

    for (const fp of this.fixedPoints) {
      if (fp.stability === 'stable' || fp.stability === 'half-stable-left' || fp.stability === 'half-stable-right') {
        const dfx = this.df(fp.x);
        if (dfx < -1e-6) {
          const tau = -1 / dfx;
          maxTau = Math.max(maxTau, tau);
        }
      }
    }

    if (maxTau > 0) {
      // Show ~5 time constants (gets to ~99% of equilibrium)
      this.tMax = Math.min(Math.max(maxTau * 5, 5), 100);
    } else {
      // No stable points or can't compute - estimate from typical velocity
      let maxVelocity = 0;
      const numSamples = 50;
      for (let i = 0; i <= numSamples; i++) {
        const x = this.xMin + (i / numSamples) * (this.xMax - this.xMin);
        maxVelocity = Math.max(maxVelocity, Math.abs(this.f(x)));
      }

      if (maxVelocity > 0.1) {
        // Time to cross the visible range
        const crossTime = (this.xMax - this.xMin) / maxVelocity;
        this.tMax = Math.min(Math.max(crossTime * 2, 5), 50);
      } else {
        this.tMax = 20; // default
      }
    }
  }

  private updateFunction(): void {
    this.parseExpression();
    this.findFixedPoints();
    this.findCriticalPoints();
    this.computeTimeScale();
    this.trajectories = [];
    this.colorIndex = 0;
  }

  private worldToScreen(p: p5, wt: number, wx: number): { x: number; y: number } {
    const sx = p.map(wt, this.tMin, this.tMax, 0, p.width);
    const sy = p.map(wx, this.xMin, this.xMax, p.height, 0);
    return { x: sx, y: sy };
  }

  private screenToWorld(p: p5, sx: number, sy: number): { t: number; x: number } {
    const wt = p.map(sx, 0, p.width, this.tMin, this.tMax);
    const wx = p.map(sy, p.height, 0, this.xMin, this.xMax);
    return { t: wt, x: wx };
  }

  protected createSketch(p: p5): void {
    p.setup = () => {
      this.setupUI();
      this.updateFunction();
    };

    p.draw = () => {
      p.background(this.colors.background);

      this.drawAxes(p);
      this.drawCriticalLines(p);
      this.drawEquilibriumLines(p);
      this.updateTrajectories();
      this.drawTrajectories(p);
    };

    p.mousePressed = () => {
      if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
        return;
      }

      // Only spawn if click is near left edge (t ≈ 0)
      const t0Screen = this.worldToScreen(p, 0, 0).x;
      if (Math.abs(p.mouseX - t0Screen) < 30) {
        const world = this.screenToWorld(p, p.mouseX, p.mouseY);
        this.spawnTrajectory(world.x);
      }
    };
  }

  private spawnTrajectory(x0: number): void {
    const color = TRAJECTORY_COLORS[this.colorIndex % TRAJECTORY_COLORS.length];
    this.colorIndex++;

    this.trajectories.push({
      points: [{ t: 0, x: x0 }],
      color,
      active: true
    });
  }

  private updateTrajectories(): void {
    // How much time to advance per frame (in world time units)
    const dtFrame = this.tMax / 300; // ~300 frames to cross the screen

    for (const traj of this.trajectories) {
      if (!traj.active) continue;

      const lastPoint = traj.points[traj.points.length - 1];

      let t = lastPoint.t;
      let x = lastPoint.x;

      // Adaptive integration: subdivide until steps are small enough
      let tRemaining = dtFrame;
      const maxDx = 0.1; // max position change per substep
      const minDt = 1e-6; // prevent infinite loops

      while (tRemaining > minDt) {
        const velocity = this.f(x);
        const absVel = Math.abs(velocity);

        // Compute step size: limit dx to maxDx
        let dt = absVel > 0.01 ? Math.min(tRemaining, maxDx / absVel) : tRemaining;
        dt = Math.max(dt, minDt);
        dt = Math.min(dt, tRemaining);

        x += velocity * dt;
        t += dt;
        tRemaining -= dt;
      }

      traj.points.push({ t, x });

      // Deactivate if out of bounds
      if (t > this.tMax || x < this.xMin - 1 || x > this.xMax + 1) {
        traj.active = false;
      }
    }
  }

  private setupUI(): void {
    const panel = this.createControlPanel();

    const inputRow = document.createElement('div');
    inputRow.style.display = 'flex';
    inputRow.style.alignItems = 'center';
    inputRow.style.gap = 'var(--spacing-sm, 0.5rem)';
    inputRow.style.marginBottom = 'var(--spacing-sm, 0.5rem)';

    const label = document.createElement('label');
    label.textContent = 'f(x) =';
    label.style.fontWeight = 'bold';
    label.style.fontFamily = 'var(--font-mono, monospace)';

    this.inputEl = document.createElement('input');
    this.inputEl.type = 'text';
    this.inputEl.value = this.exprString;
    this.inputEl.style.padding = '0.25rem 0.5rem';
    this.inputEl.style.borderRadius = '0.25rem';
    this.inputEl.style.border = '1px solid var(--color-border, #ccc)';
    this.inputEl.style.background = this.isDarkMode ? 'rgba(255,255,255,0.1)' : 'white';
    this.inputEl.style.color = 'var(--color-text, inherit)';
    this.inputEl.style.fontFamily = 'var(--font-mono, monospace)';
    this.inputEl.style.width = '200px';

    this.inputEl.addEventListener('input', () => {
      this.exprString = this.inputEl.value;
      this.updateFunction();
    });

    this.inputEl.addEventListener('keydown', (e) => {
      e.stopPropagation();
    });

    inputRow.appendChild(label);
    inputRow.appendChild(this.inputEl);

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.padding = '0.25rem 0.5rem';
    clearBtn.style.borderRadius = '0.25rem';
    clearBtn.style.border = '1px solid var(--color-border, #ccc)';
    clearBtn.style.background = this.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    clearBtn.style.cursor = 'pointer';
    clearBtn.addEventListener('click', () => {
      this.trajectories = [];
      this.colorIndex = 0;
    });
    inputRow.appendChild(clearBtn);

    panel.appendChild(inputRow);

    const presetRow = document.createElement('div');
    presetRow.style.display = 'flex';
    presetRow.style.gap = 'var(--spacing-sm, 0.5rem)';
    presetRow.style.flexWrap = 'wrap';

    const presets = [
      { label: 'sin(x)', expr: 'sin(x)' },
      { label: 'x(1-x)', expr: 'x*(1-x)' },
      { label: 'x²-1', expr: 'x^2-1' },
      { label: 'x-x³', expr: 'x-x^3' },
      { label: 'x²', expr: 'x^2' },
      { label: '-x²', expr: '-x^2' }
    ];

    for (const preset of presets) {
      const btn = document.createElement('button');
      btn.textContent = preset.label;
      btn.style.padding = '0.25rem 0.5rem';
      btn.style.borderRadius = '0.25rem';
      btn.style.border = '1px solid var(--color-border, #ccc)';
      btn.style.background = this.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => {
        this.exprString = preset.expr;
        this.inputEl.value = preset.expr;
        this.updateFunction();
      });
      presetRow.appendChild(btn);
    }

    panel.appendChild(presetRow);
  }

  private drawAxes(p: p5): void {
    p.stroke(this.colors.stroke);
    p.strokeWeight(1);

    // t-axis (horizontal, at x=0 if visible, otherwise at bottom)
    const x0Screen = this.worldToScreen(p, 0, 0).y;
    const tAxisY = (x0Screen >= 0 && x0Screen <= p.height) ? x0Screen : p.height - 20;
    p.line(0, tAxisY, p.width, tAxisY);

    // x-axis (vertical, at t=0)
    const t0Screen = this.worldToScreen(p, 0, 0).x;
    p.line(t0Screen, 0, t0Screen, p.height);

    // Tick marks on t-axis - compute nice tick interval
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(10);
    p.fill(this.colors.stroke);
    const tRange = this.tMax - this.tMin;
    const tTickStep = tRange <= 10 ? 2 : tRange <= 25 ? 5 : tRange <= 50 ? 10 : 20;
    for (let t = 0; t <= this.tMax; t += tTickStep) {
      const sx = this.worldToScreen(p, t, 0).x;
      p.stroke(this.colors.stroke);
      p.line(sx, tAxisY - 3, sx, tAxisY + 3);
      p.noStroke();
      p.text(Math.round(t).toString(), sx, tAxisY + 5);
    }

    // Tick marks on x-axis
    p.textAlign(p.RIGHT, p.CENTER);
    for (let x = Math.ceil(this.xMin); x <= Math.floor(this.xMax); x += 2) {
      if (x === 0) continue;
      const sy = this.worldToScreen(p, 0, x).y;
      p.stroke(this.colors.stroke);
      p.line(t0Screen - 3, sy, t0Screen + 3, sy);
      p.noStroke();
      p.text(x.toString(), t0Screen - 5, sy);
    }

    // Axis labels
    p.textAlign(p.CENTER, p.TOP);
    p.text('t', p.width - 10, tAxisY + 5);
    p.textAlign(p.RIGHT, p.CENTER);
    p.text('x', t0Screen - 5, 15);
  }

  private drawEquilibriumLines(p: p5): void {
    const stableColor = this.isDarkMode ? '#66ff66' : '#228822';
    const unstableColor = this.isDarkMode ? '#ff6666' : '#cc2222';
    const halfStableColor = this.isDarkMode ? '#ffaa44' : '#cc7722';

    p.strokeWeight(1.5);
    p.drawingContext.setLineDash([8, 4]);

    for (const fp of this.fixedPoints) {
      const sy = this.worldToScreen(p, 0, fp.x).y;

      if (fp.stability === 'stable') {
        p.stroke(stableColor);
      } else if (fp.stability === 'unstable') {
        p.stroke(unstableColor);
      } else {
        p.stroke(halfStableColor);
      }

      p.line(0, sy, p.width, sy);
    }

    p.drawingContext.setLineDash([]);
  }

  private drawCriticalLines(p: p5): void {
    const criticalColor = this.isDarkMode ? '#888888' : '#999999';

    p.stroke(criticalColor);
    p.strokeWeight(1);
    p.drawingContext.setLineDash([4, 4]);

    for (const cp of this.criticalPoints) {
      const sy = this.worldToScreen(p, 0, cp.x).y;
      p.line(0, sy, p.width, sy);
    }

    p.drawingContext.setLineDash([]);
  }

  private drawTrajectories(p: p5): void {
    const particleRadius = 6;

    for (const traj of this.trajectories) {
      if (traj.points.length < 2) continue;

      // Draw trail
      p.stroke(traj.color);
      p.strokeWeight(2);
      p.noFill();
      p.beginShape();
      for (const pt of traj.points) {
        const screen = this.worldToScreen(p, pt.t, pt.x);
        p.vertex(screen.x, screen.y);
      }
      p.endShape();

      // Draw particle at current position (if still active)
      if (traj.active) {
        const lastPt = traj.points[traj.points.length - 1];
        const screen = this.worldToScreen(p, lastPt.t, lastPt.x);
        p.fill(traj.color);
        p.noStroke();
        p.circle(screen.x, screen.y, particleRadius * 2);
      }
    }
  }
}

export const metadata: DemoMetadata = {
  title: 'Time Evolution',
  category: 'Dynamical Systems',
  description: 'Interactive x(t) vs t plot for 1D dynamical systems ẋ = f(x). Click near the left edge to set initial conditions and watch trajectories evolve.'
};

export default function createTimeEvolutionDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new TimeEvolutionDemo(container, config);
  return demo.init();
}
