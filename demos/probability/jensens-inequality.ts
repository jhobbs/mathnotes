// Jensen's Inequality — φ(E[X]) vs E[φ(X)] for a discrete random variable.
import p5 from 'p5';
import type { DemoConfig, DemoInstance } from '@framework/types';
import { P5DemoBase } from '@framework';
import type { DemoMetadata } from '@framework';
import { parse } from 'mathjs';
import type { EvalFunction } from 'mathjs';
import {
  classifyConvexity,
  normalizeWeights,
  expectation,
  convexHull,
  type Convexity,
  type Point,
} from './jensen-math';

interface JensenPreset {
  label: string;
  expr: string;
  group: 'Convex' | 'Concave';
  xMin: number;
  xMax: number;
}

const PRESETS: JensenPreset[] = [
  { label: 'x²', expr: 'x^2', group: 'Convex', xMin: -3, xMax: 3 },
  { label: 'eˣ', expr: 'exp(x)', group: 'Convex', xMin: -2, xMax: 2 },
  { label: 'x⁴', expr: 'x^4', group: 'Convex', xMin: -2, xMax: 2 },
  { label: 'cosh(x)', expr: 'cosh(x)', group: 'Convex', xMin: -2.5, xMax: 2.5 },
  { label: '|x|', expr: 'abs(x)', group: 'Convex', xMin: -3, xMax: 3 },
  { label: 'log(x)', expr: 'log(x)', group: 'Concave', xMin: 0.15, xMax: 6 },
  { label: '√x', expr: 'sqrt(x)', group: 'Concave', xMin: 0, xMax: 9 },
  { label: '−x²', expr: '-x^2', group: 'Concave', xMin: -3, xMax: 3 },
  { label: 'sin(x)', expr: 'sin(x)', group: 'Concave', xMin: 0, xMax: 3.14159 },
];

interface SupportPoint {
  x: number;
  weight: number; // raw slider value; normalized on use
}

export const metadata: DemoMetadata = {
  title: "Jensen's Inequality",
  category: 'Probability & Statistics',
  description:
    "Place weighted points on a convex or concave function and compare φ(E[X]) with E[φ(X)].",
  instructions:
    'Pick a function, drag the points along the x-axis, and adjust the weight sliders. ' +
    'The shaded region is every (E[X], E[φ(X)]) the weights can reach; ○ is φ(E[X]) on the curve, ● is E[φ(X)].',
};

class JensensDemo extends P5DemoBase {
  // Function state
  private exprString = 'x^2';
  private compiledF: EvalFunction | null = null;
  private parseError = false;
  private convexity: Convexity = 'convex';

  // View
  private xMin = -3;
  private xMax = 3;
  private yMin = -1;
  private yMax = 9;

  // Support of X
  private points: SupportPoint[] = [
    { x: -2, weight: 1 },
    { x: 0.5, weight: 1 },
    { x: 2, weight: 1 },
  ];
  private draggingIndex: number | null = null;

  // Derived (recomputed in recompute())
  private normWeights: number[] = [];
  private EX = 0;
  private EphiX = 0;
  private phiEX = 0;
  private hull: Point[] = [];
  private weightValSpans: HTMLElement[] = [];

  // UI elements
  private selectEl!: HTMLSelectElement;
  private exprInputEl!: HTMLInputElement;
  private warningEl!: HTMLElement;
  private badgeEl!: HTMLElement;
  private weightsContainer!: HTMLElement;
  private weightSumEl!: HTMLElement;
  private readoutEl!: HTMLElement;
  private removeBtn!: HTMLButtonElement;
  private addBtn!: HTMLButtonElement;

  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
  }

  protected getStylePrefix(): string { return 'jensens'; }
  protected getContainerId(): string { return 'jensens-container'; }
  protected getAspectRatio(): number { return 0.8; }
  protected getMaxHeightPercent(): number { return 0.75; }

  protected onColorSchemeChange(_isDark: boolean): void {
    this.updateBadge();
  }

  // --- Function handling ---

  private parseExpression(s: string): boolean {
    try {
      const compiled = parse(s).compile();
      // Probe once so a bad body (e.g. unknown symbol) is caught now.
      const probe = compiled.evaluate({ x: 1 });
      if (typeof probe !== 'number' && typeof probe !== 'object') throw new Error('non-numeric');
      this.compiledF = compiled;
      this.parseError = false;
      return true;
    } catch {
      this.parseError = true;
      return false;
    }
  }

  private f(x: number): number {
    if (!this.compiledF) return NaN;
    try {
      const r = this.compiledF.evaluate({ x });
      return typeof r === 'number' ? r : NaN;
    } catch { return NaN; }
  }

  private computeViewRange(): void {
    let fMin = Infinity;
    let fMax = -Infinity;
    const n = 240;
    for (let i = 0; i <= n; i++) {
      const y = this.f(this.xMin + (i / n) * (this.xMax - this.xMin));
      if (Number.isFinite(y)) { fMin = Math.min(fMin, y); fMax = Math.max(fMax, y); }
    }
    if (!Number.isFinite(fMin) || !Number.isFinite(fMax) || fMin === fMax) {
      fMin = -1; fMax = 1;
    }
    const pad = (fMax - fMin) * 0.12;
    this.yMin = fMin - pad;
    this.yMax = fMax + pad;
  }

  private clampPointsToDomain(): void {
    for (const pt of this.points) pt.x = Math.min(this.xMax, Math.max(this.xMin, pt.x));
  }

  /** Recompute all derived quantities from current points/weights/function. */
  private recompute(): void {
    this.normWeights = normalizeWeights(this.points.map((p) => p.weight));
    const xs = this.points.map((p) => p.x);
    const phis = xs.map((x) => this.f(x));
    this.EX = expectation(xs, this.normWeights);
    this.EphiX = expectation(phis, this.normWeights);
    this.phiEX = this.f(this.EX);
    this.hull = convexHull(xs.map((x, i) => ({ x, y: phis[i] })));
  }

  private updateFunction(): void {
    const ok = this.parseExpression(this.exprString);
    this.exprInputEl.style.borderColor = ok ? '' : 'red';
    this.warningEl.style.display = ok ? 'none' : 'block';
    this.warningEl.textContent = ok ? '' : 'Could not parse expression (use x as the variable).';
    if (ok) {
      this.convexity = classifyConvexity((x) => this.f(x), this.xMin, this.xMax);
      this.computeViewRange();
      this.clampPointsToDomain();
      this.recompute();
      this.updateReadout();
      this.updateBadge();
      this.rebuildWeights();
    }
  }

  // --- Coordinate transforms (same math as cobweb.ts) ---

  private worldToScreen(p: p5, wx: number, wy: number): { x: number; y: number } {
    return {
      x: p.map(wx, this.xMin, this.xMax, 0, p.width),
      y: p.map(wy, this.yMin, this.yMax, p.height, 0),
    };
  }
  private screenToWorld(p: p5, sx: number, sy: number): { x: number; y: number } {
    return {
      x: p.map(sx, 0, p.width, this.xMin, this.xMax),
      y: p.map(sy, p.height, 0, this.yMin, this.yMax),
    };
  }

  // --- Drawing (axes + curve only for now) ---

  private drawAxes(p: p5): void {
    const axisColor = this.isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
    p.stroke(axisColor);
    p.strokeWeight(1);
    const y0 = this.worldToScreen(p, 0, 0).y;
    if (y0 >= 0 && y0 <= p.height) p.line(0, y0, p.width, y0);
    const x0 = this.worldToScreen(p, 0, 0).x;
    if (x0 >= 0 && x0 <= p.width) p.line(x0, 0, x0, p.height);
  }

  private drawCurve(p: p5): void {
    if (!this.compiledF) return;
    p.stroke(this.isDarkMode ? '#6699ff' : '#3366cc');
    p.strokeWeight(2);
    p.noFill();
    p.beginShape();
    const n = 400;
    for (let i = 0; i <= n; i++) {
      const x = this.xMin + (i / n) * (this.xMax - this.xMin);
      const y = this.f(x);
      if (!Number.isFinite(y)) { p.endShape(); p.beginShape(); continue; }
      const clamped = Math.max(this.yMin - 1, Math.min(this.yMax + 1, y));
      const s = this.worldToScreen(p, x, clamped);
      p.vertex(s.x, s.y);
    }
    p.endShape();
  }

  private readonly POINT_RADIUS = 7;

  private drawPoints(p: p5): void {
    if (!this.compiledF) return;
    p.textSize(12);
    p.textAlign(p.CENTER, p.BOTTOM);
    for (let i = 0; i < this.points.length; i++) {
      const x = this.points[i].x;
      const s = this.worldToScreen(p, x, this.f(x));
      const active = this.draggingIndex === i;
      p.fill(this.isDarkMode ? '#ffcc44' : '#dd8800');
      p.stroke(this.colors.background);
      p.strokeWeight(2);
      p.circle(s.x, s.y, this.POINT_RADIUS * 2 * (active ? 1.3 : 1));
      // x_i tick on the axis
      const axis = this.worldToScreen(p, x, 0);
      p.stroke(this.isDarkMode ? 'rgba(255,204,68,0.5)' : 'rgba(221,136,0,0.5)');
      p.strokeWeight(1);
      p.line(s.x, s.y, axis.x, axis.y);
      p.noStroke();
      p.fill(this.colors.text);
      p.text(`x${i + 1}`, s.x, s.y - this.POINT_RADIUS - 2);
    }
  }

  private drawHull(p: p5): void {
    if (!this.compiledF || this.hull.length < 2) return;
    p.noStroke();
    p.fill(this.isDarkMode ? 'rgba(120,180,255,0.18)' : 'rgba(80,130,220,0.15)');
    p.beginShape();
    for (const v of this.hull) {
      const s = this.worldToScreen(p, v.x, v.y);
      p.vertex(s.x, s.y);
    }
    p.endShape(p.CLOSE);
  }

  private drawInequality(p: p5): void {
    if (!this.compiledF) return;
    // Vertical guide at x = E[X]
    const guideX = this.worldToScreen(p, this.EX, 0).x;
    p.stroke(this.isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)');
    p.strokeWeight(1);
    (p.drawingContext as CanvasRenderingContext2D).setLineDash([4, 4]);
    p.line(guideX, 0, guideX, p.height);
    (p.drawingContext as CanvasRenderingContext2D).setLineDash([]);

    const onCurve = this.worldToScreen(p, this.EX, this.phiEX); // ○ φ(E[X])
    const inHull = this.worldToScreen(p, this.EX, this.EphiX);   // ● E[φ(X)]

    // Jensen gap segment
    p.stroke(this.isDarkMode ? '#ff7777' : '#cc2222');
    p.strokeWeight(2);
    p.line(onCurve.x, onCurve.y, inHull.x, inHull.y);

    // ● E[φ(X)]
    p.noStroke();
    p.fill(this.isDarkMode ? '#ff7777' : '#cc2222');
    p.circle(inHull.x, inHull.y, 11);
    // ○ φ(E[X])
    p.fill(this.colors.background);
    p.stroke(this.isDarkMode ? '#66ff99' : '#118844');
    p.strokeWeight(2.5);
    p.circle(onCurve.x, onCurve.y, 11);

    // E[X] tick label on axis
    p.noStroke();
    p.fill(this.colors.text);
    p.textSize(11);
    p.textAlign(p.CENTER, p.TOP);
    const axisY = this.worldToScreen(p, this.EX, 0).y;
    p.text('E[X]', guideX, Math.min(axisY + 4, p.height - 14));

    // Label the Jensen gap beside the segment, when there's room
    if (Math.abs(onCurve.y - inHull.y) > 16) {
      const gapVal = Math.abs(this.EphiX - this.phiEX);
      const midY = (onCurve.y + inHull.y) / 2;
      p.noStroke();
      p.fill(this.isDarkMode ? '#ff9999' : '#cc2222');
      p.textSize(11);
      p.textAlign(p.LEFT, p.CENTER);
      p.text(`gap ${gapVal.toFixed(2)}`, inHull.x + 9, midY);
    }
  }

  // --- p5 lifecycle ---

  protected createSketch(p: p5): void {
    p.setup = () => {
      this.setupUI();
      this.updateFunction();
    };
    p.draw = () => {
      p.background(this.colors.background);
      this.drawAxes(p);
      this.drawHull(p);
      this.drawCurve(p);
      this.drawPoints(p);
      this.drawInequality(p);
    };

    p.mousePressed = () => {
      if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return;
      let best = -1;
      let bestDist = 18; // px hit radius
      for (let i = 0; i < this.points.length; i++) {
        const x = this.points[i].x;
        const s = this.worldToScreen(p, x, this.f(x));
        const d = p.dist(p.mouseX, p.mouseY, s.x, s.y);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      if (best >= 0) this.draggingIndex = best;
    };

    p.mouseDragged = () => {
      if (this.draggingIndex === null) return;
      const world = this.screenToWorld(p, p.mouseX, p.mouseY);
      const x = Math.min(this.xMax, Math.max(this.xMin, world.x));
      this.points[this.draggingIndex].x = x;
      this.recompute();
      this.updateReadout();
    };

    p.mouseReleased = () => { this.draggingIndex = null; };
  }

  // --- UI (placeholder; filled out in later tasks) ---

  private setupUI(): void {
    const panel = this.createControlPanel();

    // Function selector
    const row1 = this.makeRow();
    row1.appendChild(this.makeLabel('φ(x) ='));
    this.selectEl = document.createElement('select');
    this.selectEl.style.padding = '0.25rem 0.5rem';
    for (const grp of ['Convex', 'Concave'] as const) {
      const og = document.createElement('optgroup');
      og.label = grp;
      for (const preset of PRESETS.filter((pr) => pr.group === grp)) {
        const opt = document.createElement('option');
        opt.value = preset.expr;
        opt.textContent = preset.label;
        og.appendChild(opt);
      }
      this.selectEl.appendChild(og);
    }
    this.selectEl.value = this.exprString;
    this.addEventListener(this.selectEl, 'change', () => this.applyPreset(this.selectEl.value));
    row1.appendChild(this.selectEl);

    // Custom expression
    this.exprInputEl = this.makeInput(this.exprString, '140px');
    this.addEventListener(this.exprInputEl, 'input', () => {
      this.exprString = this.exprInputEl.value;
      this.updateFunction();
    });
    row1.appendChild(this.exprInputEl);

    this.badgeEl = document.createElement('span');
    this.badgeEl.style.fontWeight = 'bold';
    this.badgeEl.style.fontFamily = 'var(--font-mono, monospace)';
    row1.appendChild(this.badgeEl);
    panel.appendChild(row1);

    this.warningEl = document.createElement('div');
    this.warningEl.style.color = '#cc6600';
    this.warningEl.style.fontSize = 'var(--font-size-sm)';
    this.warningEl.style.display = 'none';
    panel.appendChild(this.warningEl);

    // Containers filled in later tasks
    this.weightsContainer = document.createElement('div');
    panel.appendChild(this.weightsContainer);

    const ptRow = this.makeRow();
    ptRow.appendChild(this.makeLabel('points:'));
    this.removeBtn = this.makeBtn('−', () => this.removePoint());
    this.addBtn = this.makeBtn('+', () => this.addPoint());
    ptRow.appendChild(this.removeBtn);
    ptRow.appendChild(this.addBtn);
    panel.appendChild(ptRow);

    this.readoutEl = document.createElement('div');
    this.readoutEl.style.fontFamily = 'var(--font-mono, monospace)';
    this.readoutEl.style.marginTop = 'var(--spacing-sm, 0.5rem)';
    panel.appendChild(this.readoutEl);
  }

  private applyPreset(expr: string): void {
    const preset = PRESETS.find((pr) => pr.expr === expr);
    if (!preset) return;
    this.exprString = preset.expr;
    this.exprInputEl.value = preset.expr;
    this.xMin = preset.xMin;
    this.xMax = preset.xMax;
    this.updateFunction();
  }

  private static readonly MIN_POINTS = 2;
  private static readonly MAX_POINTS = 5;

  private addPoint(): void {
    if (this.points.length >= JensensDemo.MAX_POINTS) return;
    const mid = (this.xMin + this.xMax) / 2;
    this.points.push({ x: mid, weight: 1 });
    this.rebuildWeights();
    this.recompute();
    this.updateReadout();
  }

  private removePoint(): void {
    if (this.points.length <= JensensDemo.MIN_POINTS) return;
    this.points.pop();
    this.rebuildWeights();
    this.recompute();
    this.updateReadout();
  }

  /** Rebuild one weight slider per point. Called on init and add/remove. */
  private rebuildWeights(): void {
    this.weightsContainer.innerHTML = '';
    this.weightValSpans = [];
    this.points.forEach((pt, i) => {
      const row = this.makeRow();
      row.appendChild(this.makeLabel(`p${i + 1}`));
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '0';
      slider.max = '1';
      slider.step = '0.01';
      slider.value = pt.weight.toString();
      slider.style.width = '140px';
      const valSpan = document.createElement('span');
      valSpan.style.fontFamily = 'var(--font-mono, monospace)';
      valSpan.style.minWidth = '3.5em';
      this.addEventListener(slider, 'input', () => {
        pt.weight = parseFloat(slider.value);
        this.recompute();
        this.refreshWeightReadouts();
        this.updateReadout();
      });
      row.appendChild(slider);
      row.appendChild(valSpan);
      this.weightValSpans.push(valSpan);
      this.weightsContainer.appendChild(row);
    });
    // Sum line (always 1.00 after normalization — reinforces Σ pᵢ = 1)
    const sumRow = this.makeRow();
    this.weightSumEl = document.createElement('span');
    this.weightSumEl.style.fontFamily = 'var(--font-mono, monospace)';
    this.weightSumEl.style.fontWeight = 'bold';
    sumRow.appendChild(this.weightSumEl);
    this.weightsContainer.appendChild(sumRow);
    // Disable +/- at bounds
    this.removeBtn.disabled = this.points.length <= JensensDemo.MIN_POINTS;
    this.addBtn.disabled = this.points.length >= JensensDemo.MAX_POINTS;
    this.refreshWeightReadouts();
  }

  /** Update the normalized pᵢ readouts next to each slider, plus the Σ line. */
  private refreshWeightReadouts(): void {
    this.weightValSpans.forEach((span, i) => {
      span.textContent = `= ${this.normWeights[i].toFixed(2)}`;
    });
    if (this.weightSumEl) {
      const sum = this.normWeights.reduce((s, w) => s + w, 0);
      this.weightSumEl.textContent = `Σ = ${sum.toFixed(2)}`;
    }
  }

  private updateBadge(): void {
    const map: Record<Convexity, { text: string; color: string }> = {
      convex: { text: 'convex', color: this.isDarkMode ? '#6699ff' : '#3366cc' },
      concave: { text: 'concave', color: this.isDarkMode ? '#ff9944' : '#dd5500' },
      neither: { text: 'neither (Jensen may not hold)', color: '#cc6600' },
    };
    const b = map[this.convexity];
    this.badgeEl.textContent = `[${b.text}]`;
    this.badgeEl.style.color = b.color;
  }

  private updateReadout(): void {
    if (this.parseError) { this.readoutEl.textContent = ''; return; }
    const rel = this.convexity === 'convex' ? '≤' : this.convexity === 'concave' ? '≥' : '?';
    const lhs = this.phiEX;
    const rhs = this.EphiX;
    const gap = Math.abs(rhs - lhs);
    const fmt = (v: number) => (Number.isFinite(v) ? v.toFixed(3) : '—');
    // Emphasize whichever side is larger (bold); if equal, neither is bold.
    const lhsStr = lhs > rhs ? `<b>${fmt(lhs)}</b>` : fmt(lhs);
    const rhsStr = rhs > lhs ? `<b>${fmt(rhs)}</b>` : fmt(rhs);
    this.readoutEl.innerHTML =
      `φ(E[X]) = ${lhsStr} &nbsp; ${rel} &nbsp; E[φ(X)] = ${rhsStr}` +
      `<br>Jensen gap = ${fmt(gap)}`;
    this.refreshWeightReadouts();
  }

  // --- DOM helpers (copied verbatim from demos/dynamical-systems/cobweb.ts) ---

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
}

export default function createDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  return new JensensDemo(container, config).init();
}
