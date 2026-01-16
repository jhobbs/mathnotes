// Phase Portrait + Time Evolution - Combined view for 1D dynamical systems ẋ = f(x)
import p5 from 'p5';
import type { DemoConfig, DemoInstance, DemoMetadata } from '@framework/types';
import { isDarkMode, getDemoColors, getResponsiveCanvasSize } from '@framework/demo-utils';
import type { DemoColors } from '@framework/demo-utils';
import { addDemoStyles } from '@framework/ui-components';
import { FlowDynamics, PRESETS, TRAJECTORY_COLORS } from './shared/flow-dynamics';

interface TrajectoryPoint {
  t: number;
  x: number;
}

interface Particle {
  x: number;
  startX: number;
  t: number;
  color: string;
  active: boolean;
  trail: TrajectoryPoint[];
}

class PhaseAndTimeDemo {
  private container: HTMLElement;
  private config?: DemoConfig;
  private _isDarkMode: boolean;
  private colors!: DemoColors;

  // Two p5 instances
  private phaseP5: p5 | null = null;
  private timeP5: p5 | null = null;

  // Shared dynamics
  private dynamics: FlowDynamics;
  private exprString: string = 'sin(x)';

  // View parameters (xMin/xMax computed dynamically from dynamics.viewRange)
  private yMin: number = -2;
  private yMax: number = 2;
  private tMin: number = 0;

  // Search bounds (wider than view)
  private readonly searchMin: number = -20;
  private readonly searchMax: number = 20;

  // Shared particles
  private particles: Particle[] = [];
  private colorIndex: number = 0;

  // UI elements
  private inputEl!: HTMLInputElement;
  private containerEl!: HTMLElement;
  private canvasRow!: HTMLElement;
  private phaseContainer!: HTMLElement;
  private timeContainer!: HTMLElement;

  // Event cleanup
  private eventListeners: Array<{ target: EventTarget; type: string; listener: EventListener }> = [];

  constructor(container: HTMLElement, config?: DemoConfig) {
    this.container = container;
    this.config = config;
    this._isDarkMode = isDarkMode(config);
    this.dynamics = new FlowDynamics(this.searchMin, this.searchMax);
  }

  init(): DemoInstance {
    this.setupContainer();
    addDemoStyles(this.container, 'phase-time');
    this.setupUI();
    this.dynamics.update(this.exprString);
    this.createPhaseSketch();
    this.createTimeSketch();
    this.setupResizeHandler();

    return {
      cleanup: this.cleanup.bind(this),
      resize: this.resize.bind(this),
      pause: this.pause.bind(this),
      resume: this.resume.bind(this)
    };
  }

  private setupContainer(): void {
    this.containerEl = document.createElement('div');
    this.containerEl.id = 'phase-time-container';
    this.containerEl.style.textAlign = 'center';

    // Canvas row with two canvases side by side
    this.canvasRow = document.createElement('div');
    this.canvasRow.style.display = 'flex';
    this.canvasRow.style.gap = '1rem';
    this.canvasRow.style.justifyContent = 'center';
    this.canvasRow.style.marginTop = 'var(--spacing-sm, 0.5rem)';

    this.phaseContainer = document.createElement('div');
    this.phaseContainer.className = 'demo-canvas-container';
    this.phaseContainer.id = 'phase-canvas';

    this.timeContainer = document.createElement('div');
    this.timeContainer.className = 'demo-canvas-container';
    this.timeContainer.id = 'time-canvas';

    this.canvasRow.appendChild(this.phaseContainer);
    this.canvasRow.appendChild(this.timeContainer);
    this.containerEl.appendChild(this.canvasRow);

    // Add instructions
    if (metadata.instructions) {
      const instructionsEl = document.createElement('div');
      instructionsEl.className = 'demo-info';
      instructionsEl.style.marginTop = 'var(--spacing-md, 1rem)';
      instructionsEl.style.textAlign = 'center';
      instructionsEl.textContent = typeof metadata.instructions === 'function'
        ? metadata.instructions()
        : metadata.instructions;
      this.containerEl.appendChild(instructionsEl);
    }

    this.container.appendChild(this.containerEl);
  }

  private getCanvasSize(): { width: number; height: number } {
    // Get full container size, then split in half (minus gap)
    const fullSize = getResponsiveCanvasSize(this.container, this.config, 0.5, 0.5);
    const gap = 16; // 1rem
    const width = (fullSize.width - gap) / 2;
    const height = fullSize.height;
    return { width, height };
  }

  private setupUI(): void {
    const panel = document.createElement('div');
    panel.className = 'demo-controls';
    panel.style.marginBottom = 'var(--spacing-sm, 0.5rem)';

    // Function input row
    const inputRow = document.createElement('div');
    inputRow.style.display = 'flex';
    inputRow.style.alignItems = 'center';
    inputRow.style.gap = 'var(--spacing-sm, 0.5rem)';
    inputRow.style.marginBottom = 'var(--spacing-sm, 0.5rem)';
    inputRow.style.justifyContent = 'center';

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
    this.inputEl.style.background = this._isDarkMode ? 'rgba(255,255,255,0.1)' : 'white';
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
    clearBtn.style.background = this._isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    clearBtn.style.cursor = 'pointer';
    clearBtn.addEventListener('click', () => {
      this.particles = [];
      this.colorIndex = 0;
    });
    inputRow.appendChild(clearBtn);

    panel.appendChild(inputRow);

    // Preset buttons row
    const presetRow = document.createElement('div');
    presetRow.style.display = 'flex';
    presetRow.style.gap = 'var(--spacing-sm, 0.5rem)';
    presetRow.style.flexWrap = 'wrap';
    presetRow.style.justifyContent = 'center';

    for (const preset of PRESETS) {
      const btn = document.createElement('button');
      btn.textContent = preset.label;
      btn.style.padding = '0.25rem 0.5rem';
      btn.style.borderRadius = '0.25rem';
      btn.style.border = '1px solid var(--color-border, #ccc)';
      btn.style.background = this._isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => {
        this.exprString = preset.expr;
        this.inputEl.value = preset.expr;
        this.updateFunction();
      });
      presetRow.appendChild(btn);
    }

    panel.appendChild(presetRow);

    // Insert panel before canvas row
    this.containerEl.insertBefore(panel, this.canvasRow);
  }

  private updateFunction(): void {
    const success = this.dynamics.update(this.exprString);
    this.inputEl.style.borderColor = success ? '' : 'red';
    this.particles = [];
    this.colorIndex = 0;
  }

  private spawnParticle(x0: number): void {
    const color = TRAJECTORY_COLORS[this.colorIndex % TRAJECTORY_COLORS.length];
    this.colorIndex++;

    this.particles.push({
      x: x0,
      startX: x0,
      t: 0,
      color,
      active: true,
      trail: [{ t: 0, x: x0 }]
    });
  }

  private updateParticles(): void {
    const tMax = this.dynamics.tMax;
    const dtFrame = tMax / 300;
    const fixedPointTolerance = 0.05;
    const speedThreshold = 0.01;

    for (const particle of this.particles) {
      if (!particle.active) continue;

      // Adaptive integration
      let tRemaining = dtFrame;
      const maxDx = 0.1;
      const minDt = 1e-6;

      while (tRemaining > minDt) {
        const velocity = this.dynamics.f(particle.x);
        const absVel = Math.abs(velocity);

        let dt = absVel > 0.01 ? Math.min(tRemaining, maxDx / absVel) : tRemaining;
        dt = Math.max(dt, minDt);
        dt = Math.min(dt, tRemaining);

        particle.x += velocity * dt;
        particle.t += dt;
        tRemaining -= dt;
      }

      particle.trail.push({ t: particle.t, x: particle.x });

      // Deactivate if out of bounds or reached end of time
      const { xMin, xMax } = this.dynamics.viewRange;
      if (particle.t > tMax || particle.x < xMin - 1 || particle.x > xMax + 1) {
        particle.active = false;
        continue;
      }

      // Check if near fixed point and slowing down
      for (const fp of this.dynamics.fixedPoints) {
        const velocity = this.dynamics.f(particle.x);
        if (Math.abs(particle.x - fp.x) < fixedPointTolerance && Math.abs(velocity) < speedThreshold) {
          particle.active = false;
          break;
        }
      }
    }
  }

  // Phase portrait coordinate transforms
  private phaseWorldToScreen(p: p5, wx: number, wy: number): { x: number; y: number } {
    const { xMin, xMax } = this.dynamics.viewRange;
    const sx = p.map(wx, xMin, xMax, 0, p.width);
    const sy = p.map(wy, this.yMin, this.yMax, p.height, 0);
    return { x: sx, y: sy };
  }

  private phaseScreenToWorld(p: p5, sx: number, sy: number): { x: number; y: number } {
    const { xMin, xMax } = this.dynamics.viewRange;
    const wx = p.map(sx, 0, p.width, xMin, xMax);
    const wy = p.map(sy, p.height, 0, this.yMin, this.yMax);
    return { x: wx, y: wy };
  }

  // Time evolution coordinate transforms
  private timeWorldToScreen(p: p5, wt: number, wx: number): { x: number; y: number } {
    const { xMin, xMax } = this.dynamics.viewRange;
    const sx = p.map(wt, this.tMin, this.dynamics.tMax, 0, p.width);
    const sy = p.map(wx, xMin, xMax, p.height, 0);
    return { x: sx, y: sy };
  }

  private timeScreenToWorld(p: p5, sx: number, sy: number): { t: number; x: number } {
    const { xMin, xMax } = this.dynamics.viewRange;
    const wt = p.map(sx, 0, p.width, this.tMin, this.dynamics.tMax);
    const wx = p.map(sy, p.height, 0, xMin, xMax);
    return { t: wt, x: wx };
  }

  private createPhaseSketch(): void {
    this.phaseP5 = new p5((p: p5) => {
      p.setup = () => {
        const size = this.getCanvasSize();
        const canvas = p.createCanvas(size.width, size.height);
        canvas.parent(this.phaseContainer);
        this.colors = getDemoColors(p, this.config);
      };

      p.draw = () => {
        p.background(this.colors.background);
        this.updateParticles();
        this.drawPhaseAxes(p);
        this.drawPhaseCurve(p);
        this.drawPhaseFlowArrows(p);
        this.drawPhaseFixedPoints(p);
        this.drawPhaseParticles(p);
      };

      p.mousePressed = () => {
        if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
          return;
        }
        const world = this.phaseScreenToWorld(p, p.mouseX, p.mouseY);
        const axisY = this.phaseWorldToScreen(p, 0, 0).y;
        if (Math.abs(p.mouseY - axisY) < 30) {
          this.spawnParticle(world.x);
        }
      };
    });
  }

  private createTimeSketch(): void {
    this.timeP5 = new p5((p: p5) => {
      p.setup = () => {
        const size = this.getCanvasSize();
        const canvas = p.createCanvas(size.width, size.height);
        canvas.parent(this.timeContainer);
      };

      p.draw = () => {
        p.background(this.colors.background);
        this.drawTimeAxes(p);
        this.drawTimeCriticalLines(p);
        this.drawTimeEquilibriumLines(p);
        this.drawTimeTrajectories(p);
      };

      p.mousePressed = () => {
        if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
          return;
        }
        const t0Screen = this.timeWorldToScreen(p, 0, 0).x;
        if (Math.abs(p.mouseX - t0Screen) < 30) {
          const world = this.timeScreenToWorld(p, p.mouseX, p.mouseY);
          this.spawnParticle(world.x);
        }
      };
    });
  }

  // Phase portrait drawing methods
  private drawPhaseAxes(p: p5): void {
    p.stroke(this.colors.stroke);
    p.strokeWeight(1);

    const y0 = this.phaseWorldToScreen(p, 0, 0).y;
    p.line(0, y0, p.width, y0);

    const x0 = this.phaseWorldToScreen(p, 0, 0).x;
    if (x0 >= 0 && x0 <= p.width) {
      p.line(x0, 0, x0, p.height);
    }

    p.textAlign(p.CENTER, p.TOP);
    p.textSize(10);
    p.fill(this.colors.stroke);
    p.noStroke();
    const { xMin, xMax } = this.dynamics.viewRange;
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 2) {
      if (x === 0) continue;
      const sx = this.phaseWorldToScreen(p, x, 0).x;
      p.stroke(this.colors.stroke);
      p.line(sx, y0 - 3, sx, y0 + 3);
      p.noStroke();
      p.text(x.toString(), sx, y0 + 5);
    }
  }

  private drawPhaseCurve(p: p5): void {
    if (this.dynamics.parseError) return;

    const { xMin, xMax } = this.dynamics.viewRange;
    p.stroke(this._isDarkMode ? '#6699ff' : '#3366cc');
    p.strokeWeight(2);
    p.noFill();

    p.beginShape();
    const numPoints = 400;
    for (let i = 0; i <= numPoints; i++) {
      const x = xMin + (i / numPoints) * (xMax - xMin);
      const y = this.dynamics.f(x);
      const yc = Math.max(this.yMin - 1, Math.min(this.yMax + 1, y));
      const screen = this.phaseWorldToScreen(p, x, yc);
      p.vertex(screen.x, screen.y);
    }
    p.endShape();
  }

  private drawPhaseFixedPoints(p: p5): void {
    const y0 = this.phaseWorldToScreen(p, 0, 0).y;
    const radius = 8;

    const stableColor = this._isDarkMode ? '#66ff66' : '#228822';
    const unstableColor = this._isDarkMode ? '#ff6666' : '#cc2222';

    for (const fp of this.dynamics.fixedPoints) {
      const sx = this.phaseWorldToScreen(p, fp.x, 0).x;

      if (fp.stability === 'stable') {
        p.fill(stableColor);
        p.noStroke();
        p.circle(sx, y0, radius * 2);
      } else if (fp.stability === 'unstable') {
        p.noFill();
        p.stroke(unstableColor);
        p.strokeWeight(2);
        p.circle(sx, y0, radius * 2);
      } else {
        p.noFill();
        p.stroke(unstableColor);
        p.strokeWeight(2);
        p.circle(sx, y0, radius * 2);
        p.fill(stableColor);
        p.noStroke();
        if (fp.stability === 'half-stable-left') {
          p.arc(sx, y0, radius * 2, radius * 2, p.HALF_PI, -p.HALF_PI);
        } else {
          p.arc(sx, y0, radius * 2, radius * 2, -p.HALF_PI, p.HALF_PI);
        }
      }
    }
  }

  private drawPhaseFlowArrows(p: p5): void {
    if (this.dynamics.parseError) return;

    const { xMin, xMax } = this.dynamics.viewRange;
    const y0 = this.phaseWorldToScreen(p, 0, 0).y;
    const arrowSpacing = 0.5;
    const arrowSize = 8;
    const fixedPointClearance = 0.3;

    p.stroke(this.colors.stroke);
    p.strokeWeight(2);

    for (let x = Math.ceil(xMin / arrowSpacing) * arrowSpacing; x <= xMax; x += arrowSpacing) {
      const nearFixedPoint = this.dynamics.fixedPoints.some(fp => Math.abs(fp.x - x) < fixedPointClearance);
      if (nearFixedPoint) continue;

      const fx = this.dynamics.f(x);
      if (Math.abs(fx) < 0.01) continue;

      const sx = this.phaseWorldToScreen(p, x, 0).x;
      const direction = fx > 0 ? 1 : -1;

      const tipX = sx + direction * arrowSize;
      p.line(sx - direction * arrowSize * 0.5, y0, tipX, y0);
      p.line(tipX, y0, tipX - direction * 4, y0 - 4);
      p.line(tipX, y0, tipX - direction * 4, y0 + 4);
    }
  }

  private drawPhaseParticles(p: p5): void {
    const y0 = this.phaseWorldToScreen(p, 0, 0).y;
    const particleRadius = 6;

    p.noStroke();
    for (const particle of this.particles) {
      const sx = this.phaseWorldToScreen(p, particle.x, 0).x;
      p.fill(particle.color);
      p.circle(sx, y0, particleRadius * 2);
    }
  }

  // Time evolution drawing methods
  private drawTimeAxes(p: p5): void {
    p.stroke(this.colors.stroke);
    p.strokeWeight(1);

    const x0Screen = this.timeWorldToScreen(p, 0, 0).y;
    const tAxisY = (x0Screen >= 0 && x0Screen <= p.height) ? x0Screen : p.height - 20;
    p.line(0, tAxisY, p.width, tAxisY);

    const t0Screen = this.timeWorldToScreen(p, 0, 0).x;
    p.line(t0Screen, 0, t0Screen, p.height);

    p.textAlign(p.CENTER, p.TOP);
    p.textSize(10);
    p.fill(this.colors.stroke);
    const tRange = this.dynamics.tMax - this.tMin;
    const tTickStep = tRange <= 10 ? 2 : tRange <= 25 ? 5 : tRange <= 50 ? 10 : 20;
    for (let t = 0; t <= this.dynamics.tMax; t += tTickStep) {
      const sx = this.timeWorldToScreen(p, t, 0).x;
      p.stroke(this.colors.stroke);
      p.line(sx, tAxisY - 3, sx, tAxisY + 3);
      p.noStroke();
      p.text(Math.round(t).toString(), sx, tAxisY + 5);
    }

    p.textAlign(p.RIGHT, p.CENTER);
    const { xMin, xMax } = this.dynamics.viewRange;
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 2) {
      if (x === 0) continue;
      const sy = this.timeWorldToScreen(p, 0, x).y;
      p.stroke(this.colors.stroke);
      p.line(t0Screen - 3, sy, t0Screen + 3, sy);
      p.noStroke();
      p.text(x.toString(), t0Screen - 5, sy);
    }

    p.textAlign(p.CENTER, p.TOP);
    p.text('t', p.width - 10, tAxisY + 5);
    p.textAlign(p.RIGHT, p.CENTER);
    p.text('x', t0Screen - 5, 15);
  }

  private drawTimeEquilibriumLines(p: p5): void {
    const stableColor = this._isDarkMode ? '#66ff66' : '#228822';
    const unstableColor = this._isDarkMode ? '#ff6666' : '#cc2222';
    const halfStableColor = this._isDarkMode ? '#ffaa44' : '#cc7722';

    p.strokeWeight(1.5);
    p.drawingContext.setLineDash([8, 4]);

    for (const fp of this.dynamics.fixedPoints) {
      const sy = this.timeWorldToScreen(p, 0, fp.x).y;

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

  private drawTimeCriticalLines(p: p5): void {
    const criticalColor = this._isDarkMode ? '#888888' : '#999999';

    p.stroke(criticalColor);
    p.strokeWeight(1);
    p.drawingContext.setLineDash([4, 4]);

    for (const cp of this.dynamics.criticalPoints) {
      const sy = this.timeWorldToScreen(p, 0, cp.x).y;
      p.line(0, sy, p.width, sy);
    }

    p.drawingContext.setLineDash([]);
  }

  private drawTimeTrajectories(p: p5): void {
    const particleRadius = 6;

    for (const particle of this.particles) {
      if (particle.trail.length < 2) continue;

      // Draw trail
      p.stroke(particle.color);
      p.strokeWeight(2);
      p.noFill();
      p.beginShape();
      for (const pt of particle.trail) {
        const screen = this.timeWorldToScreen(p, pt.t, pt.x);
        p.vertex(screen.x, screen.y);
      }
      p.endShape();

      // Draw particle at current position
      if (particle.active) {
        const lastPt = particle.trail[particle.trail.length - 1];
        const screen = this.timeWorldToScreen(p, lastPt.t, lastPt.x);
        p.fill(particle.color);
        p.noStroke();
        p.circle(screen.x, screen.y, particleRadius * 2);
      }
    }
  }

  private setupResizeHandler(): void {
    const listener = () => this.resize();
    window.addEventListener('resize', listener);
    this.eventListeners.push({ target: window, type: 'resize', listener });
  }

  private resize(): void {
    const size = this.getCanvasSize();
    if (this.phaseP5) {
      this.phaseP5.resizeCanvas(size.width, size.height);
    }
    if (this.timeP5) {
      this.timeP5.resizeCanvas(size.width, size.height);
    }
  }

  private cleanup(): void {
    if (this.phaseP5) {
      this.phaseP5.remove();
      this.phaseP5 = null;
    }
    if (this.timeP5) {
      this.timeP5.remove();
      this.timeP5 = null;
    }
    for (const { target, type, listener } of this.eventListeners) {
      target.removeEventListener(type, listener);
    }
    this.eventListeners = [];
    this.container.innerHTML = '';
  }

  private pause(): void {
    if (this.phaseP5) this.phaseP5.noLoop();
    if (this.timeP5) this.timeP5.noLoop();
  }

  private resume(): void {
    if (this.phaseP5) this.phaseP5.loop();
    if (this.timeP5) this.timeP5.loop();
  }
}

export const metadata: DemoMetadata = {
  title: 'Phase Portrait & Time Evolution',
  category: 'Dynamical Systems',
  description: 'Combined view showing phase portrait (left) and time evolution (right) for 1D dynamical systems ẋ = f(x).',
  instructions: 'Click on the x-axis in the left view or on the t = 0 axis in the right view to spawn a particle visible in both.'
};

export default function createPhaseAndTimeDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new PhaseAndTimeDemo(container, config);
  return demo.init();
}
