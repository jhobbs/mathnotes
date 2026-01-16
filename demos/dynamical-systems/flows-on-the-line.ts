// Flows on the Line - Phase portrait for 1D dynamical systems ẋ = f(x)
import p5 from 'p5';
import type { DemoConfig, DemoInstance, DemoMetadata } from '@framework/types';
import { P5DemoBase } from '@framework';
import { FlowDynamics, PRESETS } from './shared/flow-dynamics';

interface Particle {
  x: number;
}

class FlowsOnTheLineDemo extends P5DemoBase {
  // Shared dynamics
  private dynamics: FlowDynamics;
  private exprString: string = 'sin(x)';

  // View parameters
  private xMin: number = -10;
  private xMax: number = 10;
  private yMin: number = -2;
  private yMax: number = 2;

  // Particles
  private particles: Particle[] = [];

  // Animation
  private dt: number = 0.02;

  // UI elements
  private inputEl!: HTMLInputElement;

  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
    this.dynamics = new FlowDynamics(this.xMin, this.xMax);
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

  private updateFunction(): void {
    const success = this.dynamics.update(this.exprString);
    this.inputEl.style.borderColor = success ? '' : 'red';
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
      if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
        return;
      }

      const world = this.screenToWorld(p, p.mouseX, p.mouseY);
      const axisY = this.worldToScreen(p, 0, 0).y;
      if (Math.abs(p.mouseY - axisY) < 30) {
        this.particles.push({ x: world.x });
      }
    };
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
      this.particles = [];
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

    const y0 = this.worldToScreen(p, 0, 0).y;
    p.line(0, y0, p.width, y0);

    const x0 = this.worldToScreen(p, 0, 0).x;
    if (x0 >= 0 && x0 <= p.width) {
      p.line(x0, 0, x0, p.height);
    }

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
    if (this.dynamics.parseError) return;

    p.stroke(this.isDarkMode ? '#6699ff' : '#3366cc');
    p.strokeWeight(2);
    p.noFill();

    p.beginShape();
    const numPoints = 400;
    for (let i = 0; i <= numPoints; i++) {
      const x = this.xMin + (i / numPoints) * (this.xMax - this.xMin);
      const y = this.dynamics.f(x);
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

    for (const fp of this.dynamics.fixedPoints) {
      const sx = this.worldToScreen(p, fp.x, 0).x;

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

  private drawFlowArrows(p: p5): void {
    if (this.dynamics.parseError) return;

    const y0 = this.worldToScreen(p, 0, 0).y;
    const arrowSpacing = 0.5;
    const arrowSize = 8;
    const fixedPointClearance = 0.3;

    p.stroke(this.colors.stroke);
    p.strokeWeight(2);

    for (let x = Math.ceil(this.xMin / arrowSpacing) * arrowSpacing; x <= this.xMax; x += arrowSpacing) {
      const nearFixedPoint = this.dynamics.fixedPoints.some(fp => Math.abs(fp.x - x) < fixedPointClearance);
      if (nearFixedPoint) continue;

      const fx = this.dynamics.f(x);
      if (Math.abs(fx) < 0.01) continue;

      const sx = this.worldToScreen(p, x, 0).x;
      const direction = fx > 0 ? 1 : -1;

      const tipX = sx + direction * arrowSize;
      p.line(sx - direction * arrowSize * 0.5, y0, tipX, y0);
      p.line(tipX, y0, tipX - direction * 4, y0 - 4);
      p.line(tipX, y0, tipX - direction * 4, y0 + 4);
    }
  }

  private updateAndDrawParticles(p: p5): void {
    const y0 = this.worldToScreen(p, 0, 0).y;
    const particleRadius = 6;
    const fixedPointTolerance = 0.05;
    const speedThreshold = 0.01;

    const toRemove: number[] = [];
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const velocity = this.dynamics.f(particle.x);
      particle.x += velocity * this.dt;

      if (particle.x < this.xMin - 1 || particle.x > this.xMax + 1) {
        toRemove.push(i);
        continue;
      }

      for (const fp of this.dynamics.fixedPoints) {
        if (Math.abs(particle.x - fp.x) < fixedPointTolerance && Math.abs(velocity) < speedThreshold) {
          toRemove.push(i);
          break;
        }
      }
    }

    for (let i = toRemove.length - 1; i >= 0; i--) {
      this.particles.splice(toRemove[i], 1);
    }

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
  description: 'Interactive phase portrait for 1D dynamical systems ẋ = f(x).',
  instructions: 'Click on the x-axis (horizontal number line) to spawn a particle and watch it flow.'
};

export default function createFlowsOnTheLineDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new FlowsOnTheLineDemo(container, config);
  return demo.init();
}
