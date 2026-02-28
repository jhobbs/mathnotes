// Cobweb Diagram - Visualize iterations of discrete maps x_{n+1} = f(x_n)
import p5 from 'p5';
import type { DemoConfig, DemoInstance } from '@framework/types';
import { P5DemoBase } from '@framework';
import type { DemoMetadata } from '@framework';
import { parse, derivative, evaluate } from 'mathjs';
import type { MathNode, EvalFunction } from 'mathjs';

interface CobwebPreset {
  label: string;
  expr: string;
  rMin: number;
  rMax: number;
  rDefault: number;
  rStep: number;
  xMin: number;
  xMax: number;
  x0Default: number;
}

const COBWEB_PRESETS: CobwebPreset[] = [
  { label: 'Cubic', expr: '3*x - x^3', rMin: 0, rMax: 1, rDefault: 1, rStep: 0.01, xMin: -2, xMax: 2, x0Default: 0.5 },
  { label: 'Logistic', expr: 'r*x*(1-x)', rMin: 0, rMax: 4, rDefault: 2.8, rStep: 0.01, xMin: 0, xMax: 1, x0Default: 0.1 },
  { label: 'Quadratic', expr: 'x^2 + r', rMin: -2, rMax: 0.25, rDefault: -0.5, rStep: 0.01, xMin: -2, xMax: 2, x0Default: 0.5 },
  { label: 'Sine', expr: 'r*sin(x)', rMin: 0, rMax: 3, rDefault: 1.5, rStep: 0.01, xMin: 0, xMax: 3.15, x0Default: 0.5 },
  { label: 'Cosine', expr: 'r*cos(x)', rMin: 0, rMax: 2, rDefault: 1, rStep: 0.01, xMin: -2, xMax: 2, x0Default: 0.5 },
];

interface FixedPoint {
  x: number;
  stable: boolean;
}

class CobwebDemo extends P5DemoBase {
  // Expression parsing
  private compiledF: EvalFunction | null = null;
  private compiledDf: EvalFunction | null = null;
  private parseError: boolean = false;
  private exprString: string = 'r*x*(1-x)';
  private r: number = 2.8;

  // View range
  private xMin: number = 0;
  private xMax: number = 1;
  private yMin: number = 0;
  private yMax: number = 1;
  private zoomLevel: number = 1.0;

  // Cobweb state
  private x0: number = 0.1;
  private cobwebSegments: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  private animating: boolean = false;
  private currentIteration: number = 0;
  private maxIterations: number = 200;
  private frameAccumulator: number = 0;
  private speed: number = 5; // steps per second

  // Fixed points
  private fixedPoints: FixedPoint[] = [];

  // UI elements
  private inputEl!: HTMLInputElement;
  private x0InputEl!: HTMLInputElement;
  private rSliderEl!: HTMLInputElement;
  private rInputEl!: HTMLInputElement;
  private rMinInputEl!: HTMLInputElement;
  private rMaxInputEl!: HTMLInputElement;
  private xMinInputEl!: HTMLInputElement;
  private xMaxInputEl!: HTMLInputElement;
  private speedSliderEl!: HTMLInputElement;
  private speedValueEl!: HTMLSpanElement;
  private zoomSliderEl!: HTMLInputElement;
  private zoomValueEl!: HTMLSpanElement;
  private startBtn!: HTMLButtonElement;
  private stepBtn!: HTMLButtonElement;
  private iterationDisplay!: HTMLSpanElement;

  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
  }

  protected getStylePrefix(): string { return 'cobweb'; }
  protected getContainerId(): string { return 'cobweb-container'; }
  protected getAspectRatio(): number { return 0.85; }
  protected getMaxHeightPercent(): number { return 0.75; }

  // --- Expression handling ---

  private parseExpression(exprString: string): boolean {
    try {
      const node: MathNode = parse(exprString);
      this.compiledF = node.compile();
      try {
        const dfNode = derivative(node, 'x');
        this.compiledDf = dfNode.compile();
      } catch {
        // derivative may fail for some expressions (e.g. min/max)
        this.compiledDf = null;
      }
      this.parseError = false;
      return true;
    } catch {
      this.parseError = true;
      this.compiledF = null;
      this.compiledDf = null;
      return false;
    }
  }

  private f(x: number): number {
    if (!this.compiledF) return 0;
    try {
      const result = this.compiledF.evaluate({ x, r: this.r });
      return typeof result === 'number' ? result : 0;
    } catch { return 0; }
  }

  private df(x: number): number {
    if (!this.compiledDf) return NaN;
    try {
      const result = this.compiledDf.evaluate({ x, r: this.r });
      return typeof result === 'number' ? result : NaN;
    } catch { return NaN; }
  }

  // --- Fixed point detection ---

  private findFixedPoints(): void {
    this.fixedPoints = [];
    if (this.parseError) return;

    // Find where f(x) = x, i.e. g(x) = f(x) - x = 0
    const numSamples = 2000;
    const step = (this.xMax - this.xMin) / numSamples;
    const candidates: number[] = [];

    let prevX = this.xMin;
    let prevG = this.f(this.xMin) - this.xMin;

    for (let i = 1; i <= numSamples; i++) {
      const x = this.xMin + i * step;
      const g = this.f(x) - x;

      if (Math.abs(g) < 1e-8) {
        candidates.push(x);
      } else if (prevG * g < 0) {
        // Sign change — bisect to find root
        let lo = prevX, hi = x;
        for (let j = 0; j < 50; j++) {
          const mid = (lo + hi) / 2;
          const gMid = this.f(mid) - mid;
          if (Math.abs(gMid) < 1e-12) { lo = hi = mid; break; }
          if (prevG * gMid < 0) { hi = mid; } else { lo = mid; prevG = gMid; }
        }
        candidates.push((lo + hi) / 2);
      }

      prevX = x;
      prevG = g;
    }

    const tolerance = 1e-6;
    for (const c of candidates) {
      if (c < this.xMin || c > this.xMax) continue;
      const isDuplicate = this.fixedPoints.some(fp => Math.abs(fp.x - c) < tolerance);
      if (isDuplicate) continue;

      const dfx = this.df(c);
      const stable = !isNaN(dfx) && Math.abs(dfx) < 1;
      this.fixedPoints.push({ x: c, stable });
    }

    this.fixedPoints.sort((a, b) => a.x - b.x);
  }

  // --- View range ---

  private computeViewRange(): void {
    // Compute y range by sampling f over x range
    let fMin = Infinity, fMax = -Infinity;
    const numSamples = 200;
    for (let i = 0; i <= numSamples; i++) {
      const x = this.xMin + (i / numSamples) * (this.xMax - this.xMin);
      const y = this.f(x);
      if (isFinite(y)) {
        fMin = Math.min(fMin, y);
        fMax = Math.max(fMax, y);
      }
    }

    // y range should encompass both the diagonal y=x and the curve y=f(x)
    const allMin = Math.min(this.xMin, isFinite(fMin) ? fMin : this.xMin);
    const allMax = Math.max(this.xMax, isFinite(fMax) ? fMax : this.xMax);
    const padding = (allMax - allMin) * 0.05;
    this.yMin = allMin - padding;
    this.yMax = allMax + padding;
  }

  private applyZoom(): void {
    if (this.zoomLevel !== 1.0) {
      const yCenter = (this.yMin + this.yMax) / 2;
      const yHalf = ((this.yMax - this.yMin) / 2) * this.zoomLevel;
      this.yMin = yCenter - yHalf;
      this.yMax = yCenter + yHalf;
    }
  }

  private getViewXMin(): number {
    if (this.zoomLevel === 1.0) return this.xMin;
    const center = (this.xMin + this.xMax) / 2;
    const half = ((this.xMax - this.xMin) / 2) * this.zoomLevel;
    return center - half;
  }

  private getViewXMax(): number {
    if (this.zoomLevel === 1.0) return this.xMax;
    const center = (this.xMin + this.xMax) / 2;
    const half = ((this.xMax - this.xMin) / 2) * this.zoomLevel;
    return center + half;
  }

  // --- Coordinate transforms ---

  private worldToScreen(p: p5, wx: number, wy: number): { x: number; y: number } {
    const vxMin = this.getViewXMin();
    const vxMax = this.getViewXMax();
    const sx = p.map(wx, vxMin, vxMax, 0, p.width);
    const sy = p.map(wy, this.yMin, this.yMax, p.height, 0);
    return { x: sx, y: sy };
  }

  private screenToWorld(p: p5, sx: number, sy: number): { x: number; y: number } {
    const vxMin = this.getViewXMin();
    const vxMax = this.getViewXMax();
    const wx = p.map(sx, 0, p.width, vxMin, vxMax);
    const wy = p.map(sy, p.height, 0, this.yMin, this.yMax);
    return { x: wx, y: wy };
  }

  // --- Update logic ---

  private updateFunction(): void {
    const success = this.parseExpression(this.exprString);
    this.inputEl.style.borderColor = success ? '' : 'red';
    this.computeViewRange();
    this.applyZoom();
    this.findFixedPoints();
    this.resetCobweb();
  }

  private updateParameter(): void {
    this.computeViewRange();
    this.applyZoom();
    this.findFixedPoints();
    this.resetCobweb();
  }

  private resetCobweb(): void {
    this.cobwebSegments = [];
    this.currentIteration = 0;
    this.animating = false;
    this.frameAccumulator = 0;
    this.startBtn.textContent = 'Start';
    this.updateIterationDisplay();
  }

  private startCobweb(): void {
    this.cobwebSegments = [];
    this.currentIteration = 0;
    this.frameAccumulator = 0;
    this.animating = true;
    this.startBtn.textContent = 'Stop';
    this.updateIterationDisplay();
  }

  private stopCobweb(): void {
    this.animating = false;
    this.startBtn.textContent = 'Start';
  }

  private addNextIteration(): boolean {
    if (this.parseError) return false;

    let xCurrent: number;
    if (this.cobwebSegments.length === 0) {
      xCurrent = this.x0;
    } else {
      const lastSeg = this.cobwebSegments[this.cobwebSegments.length - 1];
      xCurrent = lastSeg.x2;
    }

    const fVal = this.f(xCurrent);
    if (!isFinite(fVal)) { this.stopCobweb(); return false; }

    if (this.cobwebSegments.length === 0) {
      // First segment: vertical from (x0, x0) on diagonal to (x0, f(x0)) on curve
      // But actually start from (x0, 0) up to the diagonal, then to the curve
      // Standard cobweb: start at (x0, 0), go vertical to (x0, f(x0))
      this.cobwebSegments.push({ x1: xCurrent, y1: xCurrent, x2: xCurrent, y2: fVal });
    } else {
      const lastSeg = this.cobwebSegments[this.cobwebSegments.length - 1];
      if (this.cobwebSegments.length % 2 === 1) {
        // Horizontal: from curve point to diagonal
        this.cobwebSegments.push({ x1: lastSeg.x2, y1: lastSeg.y2, x2: lastSeg.y2, y2: lastSeg.y2 });
      } else {
        // Vertical: from diagonal to curve
        this.cobwebSegments.push({ x1: lastSeg.x2, y1: lastSeg.y2, x2: lastSeg.x2, y2: fVal });
      }
    }

    this.currentIteration = Math.floor(this.cobwebSegments.length / 2);
    this.updateIterationDisplay();

    // Check for divergence
    const lastSeg = this.cobwebSegments[this.cobwebSegments.length - 1];
    const vxMin = this.getViewXMin();
    const vxMax = this.getViewXMax();
    const margin = (vxMax - vxMin) * 2;
    if (Math.abs(lastSeg.x2) > Math.abs(vxMax) + margin || Math.abs(lastSeg.y2) > Math.abs(this.yMax) + margin) {
      this.stopCobweb();
      return false;
    }

    return true;
  }

  private updateIterationDisplay(): void {
    if (this.iterationDisplay) {
      this.iterationDisplay.textContent = `n = ${this.currentIteration}`;
    }
  }

  // --- Drawing ---

  private drawAxes(p: p5): void {
    const axisColor = this.isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
    p.stroke(axisColor);
    p.strokeWeight(1);

    const vxMin = this.getViewXMin();
    const vxMax = this.getViewXMax();

    // x-axis
    const y0 = this.worldToScreen(p, 0, 0).y;
    if (y0 >= 0 && y0 <= p.height) {
      p.line(0, y0, p.width, y0);
    }

    // y-axis
    const x0 = this.worldToScreen(p, 0, 0).x;
    if (x0 >= 0 && x0 <= p.width) {
      p.line(x0, 0, x0, p.height);
    }

    // Tick marks
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(10);
    p.fill(this.colors.stroke);
    p.noStroke();

    const xRange = vxMax - vxMin;
    const tickStep = this.niceTickStep(xRange);

    for (let x = Math.ceil(vxMin / tickStep) * tickStep; x <= vxMax; x += tickStep) {
      if (Math.abs(x) < tickStep * 0.01) continue;
      const sx = this.worldToScreen(p, x, 0).x;
      if (y0 >= 0 && y0 <= p.height) {
        p.stroke(axisColor);
        p.line(sx, y0 - 3, sx, y0 + 3);
        p.noStroke();
        p.text(this.formatTick(x), sx, y0 + 5);
      }
    }

    // y-axis ticks
    p.textAlign(p.RIGHT, p.CENTER);
    const yRange = this.yMax - this.yMin;
    const yTickStep = this.niceTickStep(yRange);
    for (let y = Math.ceil(this.yMin / yTickStep) * yTickStep; y <= this.yMax; y += yTickStep) {
      if (Math.abs(y) < yTickStep * 0.01) continue;
      const sy = this.worldToScreen(p, 0, y).y;
      if (x0 >= 0 && x0 <= p.width) {
        p.stroke(axisColor);
        p.line(x0 - 3, sy, x0 + 3, sy);
        p.noStroke();
        p.text(this.formatTick(y), x0 - 6, sy);
      }
    }
  }

  private niceTickStep(range: number): number {
    const rough = range / 8;
    const mag = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / mag;
    if (norm < 1.5) return mag;
    if (norm < 3.5) return 2 * mag;
    if (norm < 7.5) return 5 * mag;
    return 10 * mag;
  }

  private formatTick(value: number): string {
    if (Math.abs(value) >= 100) return value.toFixed(0);
    if (Math.abs(value) >= 1) return parseFloat(value.toFixed(1)).toString();
    return parseFloat(value.toFixed(2)).toString();
  }

  private drawDiagonal(p: p5): void {
    const diagColor = this.isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
    p.stroke(diagColor);
    p.strokeWeight(1.5);

    const vxMin = this.getViewXMin();
    const vxMax = this.getViewXMax();
    const lineMin = Math.max(vxMin, this.yMin);
    const lineMax = Math.min(vxMax, this.yMax);
    const s1 = this.worldToScreen(p, lineMin, lineMin);
    const s2 = this.worldToScreen(p, lineMax, lineMax);
    p.line(s1.x, s1.y, s2.x, s2.y);
  }

  private drawCurve(p: p5): void {
    if (this.parseError) return;

    const curveColor = this.isDarkMode ? '#6699ff' : '#3366cc';
    p.stroke(curveColor);
    p.strokeWeight(2);
    p.noFill();

    const vxMin = this.getViewXMin();
    const vxMax = this.getViewXMax();

    p.beginShape();
    const numPoints = 400;
    for (let i = 0; i <= numPoints; i++) {
      const x = vxMin + (i / numPoints) * (vxMax - vxMin);
      const y = this.f(x);
      if (!isFinite(y)) continue;
      const clamped = Math.max(this.yMin - 1, Math.min(this.yMax + 1, y));
      const screen = this.worldToScreen(p, x, clamped);
      p.vertex(screen.x, screen.y);
    }
    p.endShape();
  }

  private drawFixedPoints(p: p5): void {
    const radius = 8;
    const stableColor = this.isDarkMode ? '#66ff66' : '#228822';
    const unstableColor = this.isDarkMode ? '#ff6666' : '#cc2222';

    for (const fp of this.fixedPoints) {
      const screen = this.worldToScreen(p, fp.x, fp.x);

      if (fp.stable) {
        p.fill(stableColor);
        p.noStroke();
        p.circle(screen.x, screen.y, radius * 2);
      } else {
        p.noFill();
        p.stroke(unstableColor);
        p.strokeWeight(2);
        p.circle(screen.x, screen.y, radius * 2);
      }
    }
  }

  private drawCobweb(p: p5): void {
    if (this.cobwebSegments.length === 0) return;

    const cobwebColor = this.isDarkMode ? '#ff9944' : '#dd5500';
    p.stroke(cobwebColor);
    p.strokeWeight(1.5);

    // Draw initial vertical line from (x0, 0) to diagonal
    if (this.cobwebSegments.length > 0) {
      const startScreen = this.worldToScreen(p, this.x0, 0);
      const diagScreen = this.worldToScreen(p, this.x0, this.x0);
      p.line(startScreen.x, startScreen.y, diagScreen.x, diagScreen.y);
    }

    for (const seg of this.cobwebSegments) {
      const s1 = this.worldToScreen(p, seg.x1, seg.y1);
      const s2 = this.worldToScreen(p, seg.x2, seg.y2);
      p.line(s1.x, s1.y, s2.x, s2.y);
    }

    // Draw a dot at the current position
    if (this.cobwebSegments.length > 0) {
      const last = this.cobwebSegments[this.cobwebSegments.length - 1];
      const dotScreen = this.worldToScreen(p, last.x2, last.y2);
      p.fill(cobwebColor);
      p.noStroke();
      p.circle(dotScreen.x, dotScreen.y, 6);
    }
  }

  private drawStartMarker(p: p5): void {
    const markerColor = this.isDarkMode ? '#ffcc00' : '#ff9900';
    const s = this.worldToScreen(p, this.x0, 0);

    // Small triangle on x-axis
    p.fill(markerColor);
    p.noStroke();
    p.triangle(s.x - 5, s.y + 8, s.x + 5, s.y + 8, s.x, s.y);

    // Label
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(10);
    p.fill(this.colors.stroke);
    p.text('x\u2080', s.x, s.y + 10);
  }

  // --- UI Setup ---

  private makeInput(value: string, width: string): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.style.padding = '0.25rem 0.5rem';
    input.style.borderRadius = 'var(--radius-sm)';
    input.style.border = '1px solid var(--color-border)';
    input.style.background = 'var(--color-card-bg)';
    input.style.color = 'var(--color-text)';
    input.style.fontFamily = 'var(--font-mono, monospace)';
    input.style.width = width;
    this.addEventListener(input, 'keydown', (e) => (e as KeyboardEvent).stopPropagation());
    return input;
  }

  private makeNumberInput(value: number, width: string): HTMLInputElement {
    const input = this.makeInput(value.toString(), width);
    input.type = 'number';
    return input;
  }

  private makeLabel(text: string): HTMLElement {
    const label = document.createElement('label');
    label.textContent = text;
    label.style.fontWeight = 'bold';
    label.style.fontFamily = 'var(--font-mono, monospace)';
    return label;
  }

  private makeBtn(text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.padding = 'var(--space-xs) var(--space-sm)';
    btn.style.borderRadius = 'var(--radius-sm)';
    btn.style.border = 'none';
    btn.style.background = 'var(--color-button-bg)';
    btn.style.color = 'var(--color-button-text)';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = 'var(--font-size-sm)';
    btn.style.fontWeight = '500';
    btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--color-button-hover)'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'var(--color-button-bg)'; });
    this.addEventListener(btn, 'click', onClick);
    return btn;
  }

  private makeRow(): HTMLDivElement {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = 'var(--spacing-sm, 0.5rem)';
    row.style.marginBottom = 'var(--spacing-sm, 0.5rem)';
    row.style.flexWrap = 'wrap';
    return row;
  }

  protected createSketch(p: p5): void {
    p.setup = () => {
      this.setupUI();
      this.applyPreset(COBWEB_PRESETS[0]);
    };

    p.draw = () => {
      p.background(this.colors.background);

      // Animate cobweb
      if (this.animating) {
        this.frameAccumulator += p.deltaTime / 1000;
        const stepInterval = 1 / this.speed;
        // Add two segments per "step" (vertical + horizontal = one iteration)
        while (this.frameAccumulator >= stepInterval && this.animating) {
          this.frameAccumulator -= stepInterval;
          // Each visible iteration = 2 segments (vertical + horizontal)
          if (!this.addNextIteration()) break;
          if (!this.addNextIteration()) break;
          if (this.currentIteration >= this.maxIterations) {
            this.stopCobweb();
            break;
          }
        }
      }

      this.drawAxes(p);
      this.drawDiagonal(p);
      this.drawCurve(p);
      this.drawFixedPoints(p);
      this.drawCobweb(p);
      this.drawStartMarker(p);
    };

    p.mousePressed = () => {
      if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return;

      // Click near x-axis to set x0
      const y0Screen = this.worldToScreen(p, 0, 0).y;
      if (Math.abs(p.mouseY - y0Screen) < 30) {
        const world = this.screenToWorld(p, p.mouseX, p.mouseY);
        this.x0 = world.x;
        this.x0InputEl.value = this.x0.toFixed(4);
        this.resetCobweb();
      }
    };
  }

  private setupUI(): void {
    const panel = this.createControlPanel();

    // Row 1: Function input + domain
    const row1 = this.makeRow();
    row1.appendChild(this.makeLabel('f(x; r) ='));

    this.inputEl = this.makeInput(this.exprString, '180px');
    this.addEventListener(this.inputEl, 'input', () => {
      this.exprString = this.inputEl.value;
      this.updateFunction();
    });
    row1.appendChild(this.inputEl);

    const domainLabel = document.createElement('span');
    domainLabel.textContent = 'x \u2208';
    domainLabel.style.fontFamily = 'var(--font-mono, monospace)';
    row1.appendChild(domainLabel);

    this.xMinInputEl = this.makeNumberInput(this.xMin, '60px');
    row1.appendChild(this.xMinInputEl);

    const toLabel = document.createElement('span');
    toLabel.textContent = 'to';
    toLabel.style.fontFamily = 'var(--font-mono, monospace)';
    row1.appendChild(toLabel);

    this.xMaxInputEl = this.makeNumberInput(this.xMax, '60px');
    row1.appendChild(this.xMaxInputEl);

    const domainHandler = () => {
      const newMin = parseFloat(this.xMinInputEl.value);
      const newMax = parseFloat(this.xMaxInputEl.value);
      if (!isNaN(newMin) && !isNaN(newMax) && newMin < newMax) {
        this.xMin = newMin;
        this.xMax = newMax;
        this.updateFunction();
      }
    };
    this.addEventListener(this.xMinInputEl, 'change', domainHandler);
    this.addEventListener(this.xMaxInputEl, 'change', domainHandler);

    panel.appendChild(row1);

    // Row 2: Parameter r
    const row2 = this.makeRow();
    row2.appendChild(this.makeLabel('r ='));

    this.rSliderEl = document.createElement('input');
    this.rSliderEl.type = 'range';
    this.rSliderEl.min = '0';
    this.rSliderEl.max = '4';
    this.rSliderEl.step = '0.01';
    this.rSliderEl.value = this.r.toString();
    this.rSliderEl.style.width = '160px';
    row2.appendChild(this.rSliderEl);

    this.rInputEl = this.makeInput(this.r.toString(), '80px');
    row2.appendChild(this.rInputEl);

    this.addEventListener(this.rSliderEl, 'input', () => {
      this.rInputEl.value = this.rSliderEl.value;
      this.r = parseFloat(this.rSliderEl.value);
      this.updateParameter();
    });

    this.addEventListener(this.rInputEl, 'input', () => {
      try {
        const val = evaluate(this.rInputEl.value);
        if (typeof val === 'number' && !isNaN(val)) {
          this.rSliderEl.value = Math.max(parseFloat(this.rSliderEl.min), Math.min(parseFloat(this.rSliderEl.max), val)).toString();
          this.rInputEl.style.borderColor = '';
          this.r = val;
          this.updateParameter();
        }
      } catch {
        this.rInputEl.style.borderColor = 'red';
      }
    });

    const rRangeLabel = document.createElement('span');
    rRangeLabel.textContent = 'r \u2208';
    rRangeLabel.style.fontFamily = 'var(--font-mono, monospace)';
    row2.appendChild(rRangeLabel);

    this.rMinInputEl = this.makeNumberInput(0, '50px');
    row2.appendChild(this.rMinInputEl);

    const rToLabel = document.createElement('span');
    rToLabel.textContent = 'to';
    rToLabel.style.fontFamily = 'var(--font-mono, monospace)';
    row2.appendChild(rToLabel);

    this.rMaxInputEl = this.makeNumberInput(4, '50px');
    row2.appendChild(this.rMaxInputEl);

    const rRangeHandler = () => {
      const newMin = parseFloat(this.rMinInputEl.value);
      const newMax = parseFloat(this.rMaxInputEl.value);
      if (!isNaN(newMin) && !isNaN(newMax) && newMin < newMax) {
        this.rSliderEl.min = newMin.toString();
        this.rSliderEl.max = newMax.toString();
        const currentR = parseFloat(this.rSliderEl.value);
        const clampedR = Math.max(newMin, Math.min(newMax, currentR));
        this.rSliderEl.value = clampedR.toString();
        this.rInputEl.value = clampedR.toString();
        this.r = clampedR;
        this.updateParameter();
      }
    };
    this.addEventListener(this.rMinInputEl, 'change', rRangeHandler);
    this.addEventListener(this.rMaxInputEl, 'change', rRangeHandler);

    panel.appendChild(row2);

    // Row 3: x0, Start, Step, Speed
    const row3 = this.makeRow();
    row3.appendChild(this.makeLabel('x\u2080 ='));

    this.x0InputEl = this.makeInput(this.x0.toString(), '80px');
    this.addEventListener(this.x0InputEl, 'input', () => {
      try {
        const val = evaluate(this.x0InputEl.value);
        if (typeof val === 'number' && !isNaN(val)) {
          this.x0 = val;
          this.x0InputEl.style.borderColor = '';
          this.resetCobweb();
        }
      } catch {
        this.x0InputEl.style.borderColor = 'red';
      }
    });
    row3.appendChild(this.x0InputEl);

    this.startBtn = this.makeBtn('Start', () => {
      if (this.animating) {
        this.stopCobweb();
      } else {
        this.startCobweb();
      }
    });
    row3.appendChild(this.startBtn);

    this.stepBtn = this.makeBtn('Step', () => {
      if (this.animating) this.stopCobweb();
      this.addNextIteration();
      this.addNextIteration();
    });
    row3.appendChild(this.stepBtn);

    const clearBtn = this.makeBtn('Clear', () => {
      this.resetCobweb();
    });
    row3.appendChild(clearBtn);

    this.iterationDisplay = document.createElement('span');
    this.iterationDisplay.style.fontFamily = 'var(--font-mono, monospace)';
    this.iterationDisplay.style.marginLeft = 'var(--spacing-sm, 0.5rem)';
    this.iterationDisplay.textContent = 'n = 0';
    row3.appendChild(this.iterationDisplay);

    panel.appendChild(row3);

    // Row 4: Speed + Zoom
    const row4 = this.makeRow();

    row4.appendChild(this.makeLabel('Speed:'));

    this.speedSliderEl = document.createElement('input');
    this.speedSliderEl.type = 'range';
    this.speedSliderEl.min = '1';
    this.speedSliderEl.max = '50';
    this.speedSliderEl.step = '1';
    this.speedSliderEl.value = this.speed.toString();
    this.speedSliderEl.style.width = '100px';
    row4.appendChild(this.speedSliderEl);

    this.speedValueEl = document.createElement('span');
    this.speedValueEl.style.fontFamily = 'var(--font-mono, monospace)';
    this.speedValueEl.style.minWidth = '40px';
    this.speedValueEl.textContent = this.speed + '/s';
    row4.appendChild(this.speedValueEl);

    this.addEventListener(this.speedSliderEl, 'input', () => {
      this.speed = parseInt(this.speedSliderEl.value);
      this.speedValueEl.textContent = this.speed + '/s';
    });

    row4.appendChild(this.makeLabel('Zoom:'));

    this.zoomSliderEl = document.createElement('input');
    this.zoomSliderEl.type = 'range';
    this.zoomSliderEl.min = '0.1';
    this.zoomSliderEl.max = '3';
    this.zoomSliderEl.step = '0.05';
    this.zoomSliderEl.value = '1';
    this.zoomSliderEl.style.width = '100px';
    row4.appendChild(this.zoomSliderEl);

    this.zoomValueEl = document.createElement('span');
    this.zoomValueEl.style.fontFamily = 'var(--font-mono, monospace)';
    this.zoomValueEl.style.minWidth = '40px';
    this.zoomValueEl.textContent = '1.0x';
    row4.appendChild(this.zoomValueEl);

    this.addEventListener(this.zoomSliderEl, 'input', () => {
      this.zoomLevel = parseFloat(this.zoomSliderEl.value);
      this.zoomValueEl.textContent = this.zoomLevel.toFixed(1) + 'x';
      this.computeViewRange();
      this.applyZoom();
    });

    const fitBtn = this.makeBtn('Fit', () => {
      this.zoomLevel = 1.0;
      this.zoomSliderEl.value = '1';
      this.zoomValueEl.textContent = '1.0x';
      this.computeViewRange();
    });
    row4.appendChild(fitBtn);

    panel.appendChild(row4);

    // Row 5: Presets
    const row5 = this.makeRow();
    for (const preset of COBWEB_PRESETS) {
      const btn = this.makeBtn(preset.label, () => this.applyPreset(preset));
      row5.appendChild(btn);
    }
    panel.appendChild(row5);
  }

  private applyPreset(preset: CobwebPreset): void {
    this.exprString = preset.expr;
    this.inputEl.value = preset.expr;
    this.r = preset.rDefault;
    this.rSliderEl.min = preset.rMin.toString();
    this.rSliderEl.max = preset.rMax.toString();
    this.rSliderEl.step = preset.rStep.toString();
    this.rSliderEl.value = preset.rDefault.toString();
    this.rInputEl.value = preset.rDefault.toString();
    this.rMinInputEl.value = preset.rMin.toString();
    this.rMaxInputEl.value = preset.rMax.toString();
    this.xMin = preset.xMin;
    this.xMax = preset.xMax;
    this.xMinInputEl.value = preset.xMin.toString();
    this.xMaxInputEl.value = preset.xMax.toString();
    this.x0 = preset.x0Default;
    this.x0InputEl.value = preset.x0Default.toString();
    this.zoomLevel = 1.0;
    this.zoomSliderEl.value = '1';
    this.zoomValueEl.textContent = '1.0x';
    this.updateFunction();
  }
}

export const metadata: DemoMetadata = {
  title: 'Cobweb Diagram',
  category: 'Dynamical Systems',
  description: 'Visualize iterations of discrete maps x\u2099\u208A\u2081 = f(x\u2099) using cobweb construction.',
  instructions: 'Enter a function f(x; r), set x\u2080, and press Start to animate the cobweb. Click on the x-axis to set x\u2080. Use Step to advance one iteration at a time.'
};

export default function createCobwebDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new CobwebDemo(container, config);
  return demo.init();
}
