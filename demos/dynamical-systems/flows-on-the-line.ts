// Flows on the Line - Phase portrait for 1D dynamical systems ẋ = f(x)
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

interface Particle {
  x: number;
}

class FlowsOnTheLineDemo extends P5DemoBase {
  // Function state
  private exprString: string = 'sin(x)';
  private compiledF: EvalFunction | null = null;
  private compiledDf: EvalFunction | null = null;
  private parseError: boolean = false;

  // View parameters
  private xMin: number = -10;
  private xMax: number = 10;
  private yMin: number = -2;
  private yMax: number = 2;

  // Fixed points and particles
  private fixedPoints: FixedPoint[] = [];
  private particles: Particle[] = [];

  // Animation
  private dt: number = 0.02;

  // UI elements
  private inputEl!: HTMLInputElement;

  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
  }

  protected getStylePrefix(): string {
    return 'flows';
  }

  protected getContainerId(): string {
    return 'flows-container';
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

    // Find sign changes and near-zeros
    let prevX = this.xMin;
    let prevY = this.f(this.xMin);

    // Check first point
    if (Math.abs(prevY) < zeroThreshold) {
      const root = this.newtonRaphson(prevX);
      // If Newton-Raphson fails (e.g., f'(x) = 0), use the sample point directly
      candidates.push(root !== null ? root : prevX);
    }

    for (let i = 1; i <= numSamples; i++) {
      const x = this.xMin + i * step;
      const y = this.f(x);

      // Check for near-zero at sample point
      if (Math.abs(y) < zeroThreshold) {
        const root = this.newtonRaphson(x);
        // If Newton-Raphson fails (e.g., f'(x) = 0), use the sample point directly
        candidates.push(root !== null ? root : x);
      }
      // Check for sign change between samples
      else if (prevY * y < 0) {
        const midpoint = (prevX + x) / 2;
        const root = this.newtonRaphson(midpoint);
        if (root !== null && root >= this.xMin && root <= this.xMax) {
          candidates.push(root);
        }
      }

      prevX = x;
      prevY = y;
    }

    // Deduplicate and classify
    const tolerance = 1e-6;
    const derivThreshold = 1e-6;
    for (const c of candidates) {
      const isDuplicate = this.fixedPoints.some(fp => Math.abs(fp.x - c) < tolerance);
      if (!isDuplicate) {
        const dfx = this.df(c);
        let stability: StabilityType;

        if (Math.abs(dfx) < derivThreshold) {
          // f'(x*) ≈ 0, check for half-stability by looking at f(x) on either side
          const delta = 0.01;
          const fLeft = this.f(c - delta);
          const fRight = this.f(c + delta);

          if (fLeft > 0 && fRight > 0) {
            // Flow goes right on both sides: stable from left, unstable to right
            stability = 'half-stable-left';
          } else if (fLeft < 0 && fRight < 0) {
            // Flow goes left on both sides: unstable to left, stable from right
            stability = 'half-stable-right';
          } else if (fLeft > 0 && fRight < 0) {
            // Flow converges from both sides
            stability = 'stable';
          } else {
            // Flow diverges to both sides
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

    // Sort by x position
    this.fixedPoints.sort((a, b) => a.x - b.x);
  }

  private updateFunction(): void {
    this.parseExpression();
    this.findFixedPoints();
    this.particles = [];
  }

  private worldToScreen(p: p5, wx: number, wy: number): { x: number; y: number } {
    const sx = p.map(wx, this.xMin, this.xMax, 0, p.width);
    const sy = p.map(wy, this.yMin, this.yMax, p.height, 0);
    return { x: sx, y: sy };
  }

  private screenToWorld(p: p5, sx: number, sy: number): { x: number; y: number } {
    const wx = p.map(sx, 0, p.width, this.xMin, this.xMax);
    const wy = p.map(sy, p.height, 0, this.yMin, this.yMax);
    return { x: wx, y: wy };
  }

  protected createSketch(p: p5): void {
    p.setup = () => {
      this.setupUI();
      this.updateFunction();
    };

    p.draw = () => {
      p.background(this.colors.background);

      this.drawAxes(p);
      this.drawCurve(p);
      this.drawFlowArrows(p);
      this.drawFixedPoints(p);
      this.updateAndDrawParticles(p);
    };

    p.mousePressed = () => {
      // Check if click is within canvas
      if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
        return;
      }

      const world = this.screenToWorld(p, p.mouseX, p.mouseY);
      // Only spawn if click is near the x-axis (within some tolerance in screen space)
      const axisY = this.worldToScreen(p, 0, 0).y;
      if (Math.abs(p.mouseY - axisY) < 30) {
        this.particles.push({ x: world.x });
      }
    };
  }

  private setupUI(): void {
    const panel = this.createControlPanel();

    // Function input row
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

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.padding = '0.25rem 0.5rem';
    clearBtn.style.borderRadius = '0.25rem';
    clearBtn.style.border = '1px solid var(--color-border, #ccc)';
    clearBtn.style.background = this.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    clearBtn.style.cursor = 'pointer';
    clearBtn.addEventListener('click', () => {
      this.particles = [];
    });
    inputRow.appendChild(clearBtn);

    panel.appendChild(inputRow);

    // Preset buttons row
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

    // X-axis
    const y0 = this.worldToScreen(p, 0, 0).y;
    p.line(0, y0, p.width, y0);

    // Y-axis
    const x0 = this.worldToScreen(p, 0, 0).x;
    if (x0 >= 0 && x0 <= p.width) {
      p.line(x0, 0, x0, p.height);
    }

    // Tick marks on x-axis
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(10);
    p.fill(this.colors.stroke);
    p.noStroke();
    for (let x = Math.ceil(this.xMin); x <= Math.floor(this.xMax); x++) {
      if (x === 0) continue;
      const sx = this.worldToScreen(p, x, 0).x;
      p.stroke(this.colors.stroke);
      p.line(sx, y0 - 3, sx, y0 + 3);
      p.noStroke();
      p.text(x.toString(), sx, y0 + 5);
    }
  }

  private drawCurve(p: p5): void {
    if (this.parseError) return;

    p.stroke(this.isDarkMode ? '#6699ff' : '#3366cc');
    p.strokeWeight(2);
    p.noFill();

    p.beginShape();
    const numPoints = 400;
    for (let i = 0; i <= numPoints; i++) {
      const x = this.xMin + (i / numPoints) * (this.xMax - this.xMin);
      const y = this.f(x);
      // Clamp y to prevent wild excursions
      const yc = Math.max(this.yMin - 1, Math.min(this.yMax + 1, y));
      const screen = this.worldToScreen(p, x, yc);
      p.vertex(screen.x, screen.y);
    }
    p.endShape();
  }

  private drawFixedPoints(p: p5): void {
    const y0 = this.worldToScreen(p, 0, 0).y;
    const radius = 8;

    const stableColor = this.isDarkMode ? '#66ff66' : '#228822';
    const unstableColor = this.isDarkMode ? '#ff6666' : '#cc2222';

    for (const fp of this.fixedPoints) {
      const sx = this.worldToScreen(p, fp.x, 0).x;

      if (fp.stability === 'stable') {
        // Filled circle for stable
        p.fill(stableColor);
        p.noStroke();
        p.circle(sx, y0, radius * 2);
      } else if (fp.stability === 'unstable') {
        // Hollow circle for unstable
        p.noFill();
        p.stroke(unstableColor);
        p.strokeWeight(2);
        p.circle(sx, y0, radius * 2);
      } else {
        // Half-stable: half-filled circle
        // Draw hollow circle first
        p.noFill();
        p.stroke(unstableColor);
        p.strokeWeight(2);
        p.circle(sx, y0, radius * 2);

        // Fill the stable half
        p.fill(stableColor);
        p.noStroke();
        if (fp.stability === 'half-stable-left') {
          // Stable from left: fill left half
          p.arc(sx, y0, radius * 2, radius * 2, p.HALF_PI, -p.HALF_PI);
        } else {
          // Stable from right: fill right half
          p.arc(sx, y0, radius * 2, radius * 2, -p.HALF_PI, p.HALF_PI);
        }
      }
    }
  }

  private drawFlowArrows(p: p5): void {
    if (this.parseError) return;

    const y0 = this.worldToScreen(p, 0, 0).y;
    const arrowSpacing = 0.5; // World units between arrows
    const arrowSize = 8; // Pixels
    const fixedPointClearance = 0.3; // Don't draw arrows too close to fixed points

    p.stroke(this.colors.stroke);
    p.strokeWeight(2);

    for (let x = Math.ceil(this.xMin / arrowSpacing) * arrowSpacing; x <= this.xMax; x += arrowSpacing) {
      // Skip if too close to a fixed point
      const nearFixedPoint = this.fixedPoints.some(fp => Math.abs(fp.x - x) < fixedPointClearance);
      if (nearFixedPoint) continue;

      const fx = this.f(x);
      if (Math.abs(fx) < 0.01) continue; // Skip if flow is too small

      const sx = this.worldToScreen(p, x, 0).x;
      const direction = fx > 0 ? 1 : -1;

      // Draw arrow
      const tipX = sx + direction * arrowSize;
      p.line(sx - direction * arrowSize * 0.5, y0, tipX, y0);
      // Arrowhead
      p.line(tipX, y0, tipX - direction * 4, y0 - 4);
      p.line(tipX, y0, tipX - direction * 4, y0 + 4);
    }
  }

  private updateAndDrawParticles(p: p5): void {
    const y0 = this.worldToScreen(p, 0, 0).y;
    const particleRadius = 6;
    const fixedPointTolerance = 0.05;
    const speedThreshold = 0.01;

    // Update particles
    const toRemove: number[] = [];
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const velocity = this.f(particle.x);
      particle.x += velocity * this.dt;

      // Check if out of bounds
      if (particle.x < this.xMin - 1 || particle.x > this.xMax + 1) {
        toRemove.push(i);
        continue;
      }

      // Check if near fixed point and slowing down
      for (const fp of this.fixedPoints) {
        if (Math.abs(particle.x - fp.x) < fixedPointTolerance && Math.abs(velocity) < speedThreshold) {
          toRemove.push(i);
          break;
        }
      }
    }

    // Remove particles (in reverse order to preserve indices)
    for (let i = toRemove.length - 1; i >= 0; i--) {
      this.particles.splice(toRemove[i], 1);
    }

    // Draw particles
    p.fill(this.isDarkMode ? '#ffcc00' : '#ff9900');
    p.noStroke();
    for (const particle of this.particles) {
      const sx = this.worldToScreen(p, particle.x, 0).x;
      p.circle(sx, y0, particleRadius * 2);
    }
  }
}

export const metadata: DemoMetadata = {
  title: 'Flows on the Line',
  category: 'Dynamical Systems',
  description: 'Interactive phase portrait for 1D dynamical systems ẋ = f(x). Click on the number line to spawn particles and watch them flow.'
};

export default function createFlowsOnTheLineDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new FlowsOnTheLineDemo(container, config);
  return demo.init();
}
