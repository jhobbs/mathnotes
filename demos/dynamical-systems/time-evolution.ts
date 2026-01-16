// Time Evolution - x(t) vs t plot for 1D dynamical systems ẋ = f(x)
import p5 from 'p5';
import type { DemoConfig, DemoInstance, DemoMetadata } from '@framework/types';
import { P5DemoBase } from '@framework';
import { FlowDynamics, PRESETS, TRAJECTORY_COLORS } from './shared/flow-dynamics';

interface TrajectoryPoint {
  t: number;
  x: number;
}

interface Trajectory {
  points: TrajectoryPoint[];
  color: string;
  active: boolean;
}

class TimeEvolutionDemo extends P5DemoBase {
  // Shared dynamics
  private dynamics: FlowDynamics;
  private exprString: string = 'sin(x)';

  // View parameters
  private tMin: number = 0;
  private xMin: number = -10;
  private xMax: number = 10;

  // Trajectories
  private trajectories: Trajectory[] = [];
  private colorIndex: number = 0;

  // UI elements
  private inputEl!: HTMLInputElement;

  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
    this.dynamics = new FlowDynamics(this.xMin, this.xMax);
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

  private updateFunction(): void {
    const success = this.dynamics.update(this.exprString);
    this.inputEl.style.borderColor = success ? '' : 'red';
    this.trajectories = [];
    this.colorIndex = 0;
  }

  private worldToScreen(p: p5, wt: number, wx: number): { x: number; y: number } {
    const sx = p.map(wt, this.tMin, this.dynamics.tMax, 0, p.width);
    const sy = p.map(wx, this.xMin, this.xMax, p.height, 0);
    return { x: sx, y: sy };
  }

  private screenToWorld(p: p5, sx: number, sy: number): { t: number; x: number } {
    const wt = p.map(sx, 0, p.width, this.tMin, this.dynamics.tMax);
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
    const dtFrame = this.dynamics.tMax / 300;

    for (const traj of this.trajectories) {
      if (!traj.active) continue;

      const lastPoint = traj.points[traj.points.length - 1];

      let t = lastPoint.t;
      let x = lastPoint.x;

      let tRemaining = dtFrame;
      const maxDx = 0.1;
      const minDt = 1e-6;

      while (tRemaining > minDt) {
        const velocity = this.dynamics.f(x);
        const absVel = Math.abs(velocity);

        let dt = absVel > 0.01 ? Math.min(tRemaining, maxDx / absVel) : tRemaining;
        dt = Math.max(dt, minDt);
        dt = Math.min(dt, tRemaining);

        x += velocity * dt;
        t += dt;
        tRemaining -= dt;
      }

      traj.points.push({ t, x });

      if (t > this.dynamics.tMax || x < this.xMin - 1 || x > this.xMax + 1) {
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

    for (const preset of PRESETS) {
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

    const x0Screen = this.worldToScreen(p, 0, 0).y;
    const tAxisY = (x0Screen >= 0 && x0Screen <= p.height) ? x0Screen : p.height - 20;
    p.line(0, tAxisY, p.width, tAxisY);

    const t0Screen = this.worldToScreen(p, 0, 0).x;
    p.line(t0Screen, 0, t0Screen, p.height);

    p.textAlign(p.CENTER, p.TOP);
    p.textSize(10);
    p.fill(this.colors.stroke);
    const tRange = this.dynamics.tMax - this.tMin;
    const tTickStep = tRange <= 10 ? 2 : tRange <= 25 ? 5 : tRange <= 50 ? 10 : 20;
    for (let t = 0; t <= this.dynamics.tMax; t += tTickStep) {
      const sx = this.worldToScreen(p, t, 0).x;
      p.stroke(this.colors.stroke);
      p.line(sx, tAxisY - 3, sx, tAxisY + 3);
      p.noStroke();
      p.text(Math.round(t).toString(), sx, tAxisY + 5);
    }

    p.textAlign(p.RIGHT, p.CENTER);
    for (let x = Math.ceil(this.xMin); x <= Math.floor(this.xMax); x += 2) {
      if (x === 0) continue;
      const sy = this.worldToScreen(p, 0, x).y;
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

  private drawEquilibriumLines(p: p5): void {
    const stableColor = this.isDarkMode ? '#66ff66' : '#228822';
    const unstableColor = this.isDarkMode ? '#ff6666' : '#cc2222';
    const halfStableColor = this.isDarkMode ? '#ffaa44' : '#cc7722';

    p.strokeWeight(1.5);
    p.drawingContext.setLineDash([8, 4]);

    for (const fp of this.dynamics.fixedPoints) {
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

    for (const cp of this.dynamics.criticalPoints) {
      const sy = this.worldToScreen(p, 0, cp.x).y;
      p.line(0, sy, p.width, sy);
    }

    p.drawingContext.setLineDash([]);
  }

  private drawTrajectories(p: p5): void {
    const particleRadius = 6;

    for (const traj of this.trajectories) {
      if (traj.points.length < 2) continue;

      p.stroke(traj.color);
      p.strokeWeight(2);
      p.noFill();
      p.beginShape();
      for (const pt of traj.points) {
        const screen = this.worldToScreen(p, pt.t, pt.x);
        p.vertex(screen.x, screen.y);
      }
      p.endShape();

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
  description: 'Interactive x(t) vs t plot for 1D dynamical systems ẋ = f(x).',
  instructions: 'Click on the left edge (t = 0 axis) to set an initial x value and watch the trajectory evolve over time.'
};

export default function createTimeEvolutionDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new TimeEvolutionDemo(container, config);
  return demo.init();
}
