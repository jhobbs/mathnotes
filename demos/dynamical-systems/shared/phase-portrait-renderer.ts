// Shared phase portrait rendering for 1D dynamical systems
import p5 from 'p5';
import type { DemoColors } from '@framework/demo-utils';
import type { FlowDynamics } from './flow-dynamics';

export interface Particle {
  x: number;
  startX: number;
  t: number;
  color: string;
  active: boolean;
  trail: Array<{ t: number; x: number }>;
}

export interface PhasePortraitConfig {
  yMin: number;
  yMax: number;
  showParticles: boolean;
  axisLabelX: string;  // e.g., "x"
  axisLabelY: string;  // e.g., "ẋ"
}

const DEFAULT_CONFIG: PhasePortraitConfig = {
  yMin: -2,
  yMax: 2,
  showParticles: true,
  axisLabelX: 'x',
  axisLabelY: 'ẋ'
};

export class PhasePortraitRenderer {
  private config: PhasePortraitConfig;

  constructor(config: Partial<PhasePortraitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  updateConfig(config: Partial<PhasePortraitConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Coordinate transforms
  worldToScreen(p: p5, dynamics: FlowDynamics, wx: number, wy: number): { x: number; y: number } {
    const { xMin, xMax } = dynamics.viewRange;
    const sx = p.map(wx, xMin, xMax, 0, p.width);
    const sy = p.map(wy, this.config.yMin, this.config.yMax, p.height, 0);
    return { x: sx, y: sy };
  }

  screenToWorld(p: p5, dynamics: FlowDynamics, sx: number, sy: number): { x: number; y: number } {
    const { xMin, xMax } = dynamics.viewRange;
    const wx = p.map(sx, 0, p.width, xMin, xMax);
    const wy = p.map(sy, p.height, 0, this.config.yMin, this.config.yMax);
    return { x: wx, y: wy };
  }

  drawAxes(p: p5, dynamics: FlowDynamics, colors: DemoColors): void {
    p.stroke(colors.stroke);
    p.strokeWeight(1);

    // Horizontal axis (y=0)
    const y0 = this.worldToScreen(p, dynamics, 0, 0).y;
    p.line(0, y0, p.width, y0);

    // Vertical axis (x=0)
    const x0 = this.worldToScreen(p, dynamics, 0, 0).x;
    if (x0 >= 0 && x0 <= p.width) {
      p.line(x0, 0, x0, p.height);
    }

    // Tick marks and labels
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(13);
    p.fill(colors.stroke);
    p.noStroke();
    const { xMin, xMax } = dynamics.viewRange;
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 2) {
      if (x === 0) continue;
      const sx = this.worldToScreen(p, dynamics, x, 0).x;
      p.stroke(colors.stroke);
      p.line(sx, y0 - 3, sx, y0 + 3);
      p.noStroke();
      p.text(x.toString(), sx, y0 + 5);
    }

    // Axis labels - prominent positioning
    p.textSize(18);
    p.fill(colors.stroke);
    p.noStroke();

    // X-axis label (bottom right)
    p.textAlign(p.RIGHT, p.TOP);
    p.text(this.config.axisLabelX, p.width - 8, y0 + 8);

    // Y-axis label (top, near axis)
    p.textAlign(p.LEFT, p.TOP);
    const yLabelX = x0 >= 0 && x0 <= p.width ? x0 + 8 : 8;
    p.text(this.config.axisLabelY, yLabelX, 8);
  }

  drawCriticalLines(p: p5, dynamics: FlowDynamics, isDarkMode: boolean): void {
    const criticalColor = isDarkMode ? '#888888' : '#999999';

    p.stroke(criticalColor);
    p.strokeWeight(1);
    p.drawingContext.setLineDash([4, 4]);

    for (const cp of dynamics.criticalPoints) {
      const sx = this.worldToScreen(p, dynamics, cp.x, 0).x;
      p.line(sx, 0, sx, p.height);
    }

    p.drawingContext.setLineDash([]);
  }

  drawCurve(p: p5, dynamics: FlowDynamics, isDarkMode: boolean): void {
    if (dynamics.parseError) return;

    const { xMin, xMax } = dynamics.viewRange;
    p.stroke(isDarkMode ? '#6699ff' : '#3366cc');
    p.strokeWeight(2);
    p.noFill();

    p.beginShape();
    const numPoints = 400;
    for (let i = 0; i <= numPoints; i++) {
      const x = xMin + (i / numPoints) * (xMax - xMin);
      const y = dynamics.f(x);
      const yc = Math.max(this.config.yMin - 1, Math.min(this.config.yMax + 1, y));
      const screen = this.worldToScreen(p, dynamics, x, yc);
      p.vertex(screen.x, screen.y);
    }
    p.endShape();
  }

  drawFixedPoints(p: p5, dynamics: FlowDynamics, isDarkMode: boolean): void {
    const y0 = this.worldToScreen(p, dynamics, 0, 0).y;
    const radius = 8;

    const stableColor = isDarkMode ? '#66ff66' : '#228822';
    const unstableColor = isDarkMode ? '#ff6666' : '#cc2222';

    for (const fp of dynamics.fixedPoints) {
      const sx = this.worldToScreen(p, dynamics, fp.x, 0).x;

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

  drawFlowArrows(p: p5, dynamics: FlowDynamics, colors: DemoColors): void {
    if (dynamics.parseError) return;

    const { xMin, xMax } = dynamics.viewRange;
    const y0 = this.worldToScreen(p, dynamics, 0, 0).y;
    const arrowSpacing = 0.5;
    const arrowSize = 8;
    const fixedPointClearance = 0.3;

    p.stroke(colors.stroke);
    p.strokeWeight(2);

    for (let x = Math.ceil(xMin / arrowSpacing) * arrowSpacing; x <= xMax; x += arrowSpacing) {
      const nearFixedPoint = dynamics.fixedPoints.some(fp => Math.abs(fp.x - x) < fixedPointClearance);
      if (nearFixedPoint) continue;

      const fx = dynamics.f(x);
      if (Math.abs(fx) < 0.01) continue;

      const sx = this.worldToScreen(p, dynamics, x, 0).x;
      const direction = fx > 0 ? 1 : -1;

      const tipX = sx + direction * arrowSize;
      p.line(sx - direction * arrowSize * 0.5, y0, tipX, y0);
      p.line(tipX, y0, tipX - direction * 4, y0 - 4);
      p.line(tipX, y0, tipX - direction * 4, y0 + 4);
    }
  }

  drawParticles(p: p5, dynamics: FlowDynamics, particles: Particle[]): void {
    if (!this.config.showParticles) return;

    const y0 = this.worldToScreen(p, dynamics, 0, 0).y;
    const particleRadius = 6;

    p.noStroke();
    for (const particle of particles) {
      const sx = this.worldToScreen(p, dynamics, particle.x, 0).x;
      p.fill(particle.color);
      p.circle(sx, y0, particleRadius * 2);
    }
  }

  /** Draw the complete phase portrait */
  draw(p: p5, dynamics: FlowDynamics, colors: DemoColors, isDarkMode: boolean, particles: Particle[] = []): void {
    this.drawAxes(p, dynamics, colors);
    this.drawCriticalLines(p, dynamics, isDarkMode);
    this.drawCurve(p, dynamics, isDarkMode);
    this.drawFlowArrows(p, dynamics, colors);
    this.drawFixedPoints(p, dynamics, isDarkMode);
    this.drawParticles(p, dynamics, particles);
  }
}
