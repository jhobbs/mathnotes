# Jensen's Inequality Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive p5.js demo of Jensen's inequality (2–5 weighted draggable support points, convex/concave φ, shaded reachable region, both sides of the inequality) and embed it on the expectation page.

**Architecture:** A `P5DemoBase` subclass modeled on `demos/dynamical-systems/cobweb.ts`. Pure math (convex hull, convexity classification, weight normalization, expectations) is isolated in a separate no-p5 module so it stays focused and independently reasoned-about. The demo evaluates φ with mathjs, plots the curve, drags points on it, fills the convex hull of `{(xᵢ, φ(xᵢ))}`, and marks `φ(E[X])` vs `E[φ(X)]`.

**Tech Stack:** TypeScript, p5.js (`P5DemoBase`), mathjs (expression parsing), esbuild bundling. Path aliases: `@framework`, `@demos/*`.

**Verification model (read this):** This repo has **no JS/TS unit-test runner** (`run_tests.sh` is empty, no `*.test.ts`, package.json has only `type-check`/`build`). Per `CLAUDE.md`, demos are verified by: `npm run type-check`, a dev-server single-page crawl for JS/CSP errors, and `./scripts/crawl-demos.py` screenshots reviewed **only via `--ask`** (never read screenshots directly). Every task below uses that real loop instead of fabricated unit tests. Dev server auto-rebuilds TS — no manual rebuild needed.

**Commit policy:** Commit after each task. Use plain technical messages, no AI attribution (repo rule).

---

## File Structure

- **Create** `demos/probability/jensen-math.ts` — pure helpers: `Convexity`, `Point`, `classifyConvexity`, `normalizeWeights`, `expectation`, `convexHull`. No p5/DOM imports.
- **Create** `demos/probability/jensens-inequality.ts` — `class JensensDemo extends P5DemoBase`, `metadata`, default `createDemo`.
- **Modify** `demos-framework/src/main.ts` — add one registry line.
- **Modify** `content/applied-math/probability-and-statistics/expectation.md` — add one `{% include_demo %}` line after the Jensen theorem block.

---

## Task 1: Pure math module

**Files:**
- Create: `demos/probability/jensen-math.ts`

- [ ] **Step 1: Write the full module**

```typescript
// Pure math for the Jensen's inequality demo. No p5 / DOM dependencies.

export type Convexity = 'convex' | 'concave' | 'neither';

export interface Point {
  x: number;
  y: number;
}

/**
 * Classify f on [xMin, xMax] by the sign of its second finite difference.
 * Returns 'convex' if f'' >= 0 everywhere (within tolerance), 'concave' if
 * f'' <= 0 everywhere, otherwise 'neither'. Non-finite samples are skipped.
 */
export function classifyConvexity(
  f: (x: number) => number,
  xMin: number,
  xMax: number,
  samples = 200
): Convexity {
  const h = (xMax - xMin) / samples;
  if (!(h > 0)) return 'neither';
  // Scale tolerance to the function's vertical extent so flat-ish regions of
  // steep functions are not misclassified by floating-point noise.
  let yMin = Infinity;
  let yMax = -Infinity;
  for (let i = 0; i <= samples; i++) {
    const y = f(xMin + i * h);
    if (Number.isFinite(y)) {
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    }
  }
  const scale = Number.isFinite(yMax - yMin) && yMax > yMin ? yMax - yMin : 1;
  const tol = 1e-9 * scale + 1e-12;

  let sawPositive = false;
  let sawNegative = false;
  for (let i = 1; i < samples; i++) {
    const x = xMin + i * h;
    const a = f(x - h);
    const b = f(x);
    const c = f(x + h);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) continue;
    const second = a - 2 * b + c; // ~ f''(x) * h^2
    if (second > tol) sawPositive = true;
    else if (second < -tol) sawNegative = true;
  }
  if (sawPositive && sawNegative) return 'neither';
  if (sawPositive) return 'convex';
  if (sawNegative) return 'concave';
  return 'neither'; // affine / constant — Jensen holds with equality
}

/**
 * Normalize non-negative weights to sum to 1. Negative weights are clamped to 0.
 * If the total is ~0 (e.g. all sliders at 0), fall back to uniform weights.
 */
export function normalizeWeights(weights: number[]): number[] {
  const n = weights.length;
  if (n === 0) return [];
  const clamped = weights.map((w) => (Number.isFinite(w) && w > 0 ? w : 0));
  const total = clamped.reduce((s, w) => s + w, 0);
  if (total <= 1e-12) return new Array(n).fill(1 / n);
  return clamped.map((w) => w / total);
}

/** Weighted sum Σ pᵢ vᵢ. Assumes ps is already normalized and same length as vs. */
export function expectation(vs: number[], ps: number[]): number {
  let acc = 0;
  for (let i = 0; i < vs.length; i++) acc += vs[i] * ps[i];
  return acc;
}

/**
 * Convex hull via monotone chain. Returns hull vertices in counter-clockwise
 * order. For 0/1/2 unique points (or all-collinear), returns the sorted unique
 * points (a degenerate hull the caller can still draw as a polyline).
 */
export function convexHull(points: Point[]): Point[] {
  const pts = points
    .slice()
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
    .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  // Dedup
  const uniq: Point[] = [];
  for (const p of pts) {
    const last = uniq[uniq.length - 1];
    if (!last || last.x !== p.x || last.y !== p.y) uniq.push(p);
  }
  if (uniq.length <= 2) return uniq;

  const cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: Point[] = [];
  for (const p of uniq) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: Point[] = [];
  for (let i = uniq.length - 1; i >= 0; i--) {
    const p = uniq[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper); // CCW
}
```

- [ ] **Step 2: Type-check**

Run: `npm run type-check`
Expected: PASS (no errors referencing `jensen-math.ts`). If `node`/`npm` is not on PATH locally, run inside the dev container or rely on the static-builder logs: `docker logs mathnotes-static-builder`.

- [ ] **Step 3: Commit**

```bash
git add demos/probability/jensen-math.ts
git commit -m "Add pure math helpers for Jensen demo"
```

---

## Task 2: Demo skeleton — curve on screen, registered, embedded

This gets an end-to-end render (axes + φ curve) wired into the page before adding interaction.

**Files:**
- Create: `demos/probability/jensens-inequality.ts`
- Modify: `demos-framework/src/main.ts`
- Modify: `content/applied-math/probability-and-statistics/expectation.md`

- [ ] **Step 1: Create the demo file**

```typescript
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

  // UI elements
  private selectEl!: HTMLSelectElement;
  private exprInputEl!: HTMLInputElement;
  private warningEl!: HTMLElement;
  private badgeEl!: HTMLElement;
  private weightsContainer!: HTMLElement;
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

  // --- Function handling ---

  private parseExpression(s: string): boolean {
    try {
      this.compiledF = parse(s).compile();
      // Probe once so a bad body (e.g. unknown symbol) is caught now.
      const probe = this.compiledF.evaluate({ x: 1 });
      if (typeof probe !== 'number' && typeof probe !== 'object') throw new Error('non-numeric');
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
    if (this.parseError) return;
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

  // --- p5 lifecycle ---

  protected createSketch(p: p5): void {
    p.setup = () => {
      this.setupUI();
      this.updateFunction();
    };
    p.draw = () => {
      p.background(this.colors.background);
      this.drawAxes(p);
      this.drawCurve(p);
    };
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

  private updateReadout(): void { /* filled in Task 6 */ }
  private updateBadge(): void { /* filled in Task 6 */ }

  // --- DOM helpers (copy verbatim from demos/dynamical-systems/cobweb.ts) ---
  // makeRow, makeInput, makeNumberInput, makeLabel, makeBtn
  // (paste those five private methods here unchanged)
}

export default function createDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  return new JensensDemo(container, config).init();
}
```

- [ ] **Step 2: Copy the DOM helper methods**

Open `demos/dynamical-systems/cobweb.ts` and copy these five private methods verbatim into `JensensDemo` (they only use DOM + CSS vars, no cobweb-specific state): `makeInput`, `makeNumberInput`, `makeLabel`, `makeBtn`, `makeRow`. The file's only top-level exports must be `export const metadata` (already declared above the class) and the default `createDemo` function — no other exports.

- [ ] **Step 3: Register in main.ts**

In `demos-framework/src/main.ts`, add to the `demoRegistry` object (after the `zipf-entropy` line, fixing the trailing comma):

```typescript
  'zipf-entropy': () => import('@demos/information-theory/zipf-entropy'),
  'jensens-inequality': () => import('@demos/probability/jensens-inequality'),
```

- [ ] **Step 4: Embed in the page**

In `content/applied-math/probability-and-statistics/expectation.md`, immediately after the `:::` that closes the `jensens-inequality` theorem block (the line after the proof's closing `::::` and the theorem's closing `:::`), add a blank line then:

```markdown
{% include_demo "jensens-inequality" %}
```

- [ ] **Step 5: Type-check**

Run: `npm run type-check`
Expected: PASS. Fix any TS errors before continuing (check `docker logs mathnotes-static-builder` if building in Docker).

- [ ] **Step 6: Visual check — curve renders, no console errors**

Start dev (`docker-compose -f docker-compose.dev.yml up` if not already running), then:
Run: `./scripts/crawl-dev.sh --single-page "http://web-dev:5000/mathnotes/applied-math/probability-and-statistics/expectation"`
Expected: no JavaScript errors and no CSP violations reported. The page should show the demo with axes and the x² parabola.

- [ ] **Step 7: Commit**

```bash
git add demos/probability/jensens-inequality.ts demos-framework/src/main.ts content/applied-math/probability-and-statistics/expectation.md
git commit -m "Scaffold Jensen demo: curve render, registry, page embed"
```

---

## Task 3: Draggable support points

**Files:**
- Modify: `demos/probability/jensens-inequality.ts`

- [ ] **Step 1: Add point drawing**

Add this method and call it from `p.draw` after `this.drawCurve(p)`:

```typescript
  private readonly POINT_RADIUS = 7;

  private drawPoints(p: p5): void {
    if (this.parseError) return;
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
```

- [ ] **Step 2: Add hit-testing and drag handlers**

In `createSketch`, add these p5 handlers (alongside `p.setup`/`p.draw`):

```typescript
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
```

- [ ] **Step 3: Type-check**

Run: `npm run type-check`
Expected: PASS.

- [ ] **Step 4: Visual check**

Run: `./scripts/crawl-demos.py -d jensens-inequality`
Then review with: `./scripts/crawl-demos.py -d jensens-inequality --ask "Are three labelled points sitting on the parabola with tick lines down to the x-axis?"`
Expected: three points x1,x2,x3 on the curve. (Dragging is interactive — confirmed in final manual check.)

- [ ] **Step 5: Commit**

```bash
git add demos/probability/jensens-inequality.ts
git commit -m "Add draggable support points to Jensen demo"
```

---

## Task 4: Weight sliders + add/remove points

**Files:**
- Modify: `demos/probability/jensens-inequality.ts`

- [ ] **Step 1: Build the weights UI**

Replace the `this.weightsContainer` block in `setupUI` so it includes add/remove buttons, then add `rebuildWeights()`. Add this after appending `weightsContainer`:

```typescript
    const ptRow = this.makeRow();
    ptRow.appendChild(this.makeLabel('points:'));
    this.removeBtn = this.makeBtn('−', () => this.removePoint());
    this.addBtn = this.makeBtn('+', () => this.addPoint());
    ptRow.appendChild(this.removeBtn);
    ptRow.appendChild(this.addBtn);
    panel.appendChild(ptRow);
```

Then add these methods:

```typescript
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
      (row as any)._valSpan = valSpan; // for refreshWeightReadouts
      this.weightsContainer.appendChild(row);
    });
    // Disable +/- at bounds
    this.removeBtn.disabled = this.points.length <= JensensDemo.MIN_POINTS;
    this.addBtn.disabled = this.points.length >= JensensDemo.MAX_POINTS;
    this.refreshWeightReadouts();
  }

  /** Update the normalized pᵢ readouts next to each slider. */
  private refreshWeightReadouts(): void {
    const rows = Array.from(this.weightsContainer.children);
    rows.forEach((row, i) => {
      const span = (row as any)._valSpan as HTMLElement | undefined;
      if (span) span.textContent = `= ${this.normWeights[i].toFixed(2)}`;
    });
  }
```

- [ ] **Step 2: Call `rebuildWeights()` on init**

In `setupUI`, after creating `this.weightsContainer` and the points row, call `this.rebuildWeights();` (must run after `recompute` populates `normWeights`, so call it at the end of `updateFunction` instead — add `this.rebuildWeights();` as the last line of the `if (ok)` block in `updateFunction`).

- [ ] **Step 3: Type-check**

Run: `npm run type-check`
Expected: PASS.

- [ ] **Step 4: Visual check**

Run: `./scripts/crawl-demos.py -d jensens-inequality --ask "Is there one weight slider per point, each showing a normalized value like '= 0.33', plus + and − buttons?"`
Expected: one slider per point with normalized readouts summing to 1, and working bounds on +/−.

- [ ] **Step 5: Commit**

```bash
git add demos/probability/jensens-inequality.ts
git commit -m "Add weight sliders and add/remove points to Jensen demo"
```

---

## Task 5: The region + both sides of the inequality

**Files:**
- Modify: `demos/probability/jensens-inequality.ts`

- [ ] **Step 1: Draw the hull region**

Add and call from `p.draw` **before** `drawCurve` (so the curve sits on top):

```typescript
  private drawHull(p: p5): void {
    if (this.parseError || this.hull.length < 2) return;
    p.noStroke();
    p.fill(this.isDarkMode ? 'rgba(120,180,255,0.18)' : 'rgba(80,130,220,0.15)');
    p.beginShape();
    for (const v of this.hull) {
      const s = this.worldToScreen(p, v.x, v.y);
      p.vertex(s.x, s.y);
    }
    p.endShape(p.CLOSE);
  }
```

- [ ] **Step 2: Draw E[X] guide and both markers**

Add and call from `p.draw` after `drawPoints`:

```typescript
  private drawInequality(p: p5): void {
    if (this.parseError) return;
    // Vertical guide at x = E[X]
    const guideX = this.worldToScreen(p, this.EX, 0).x;
    p.stroke(this.isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)');
    p.strokeWeight(1);
    p.drawingContext.setLineDash([4, 4]);
    p.line(guideX, 0, guideX, p.height);
    p.drawingContext.setLineDash([]);

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
  }
```

Final `p.draw` body order:
```typescript
      p.background(this.colors.background);
      this.drawAxes(p);
      this.drawHull(p);
      this.drawCurve(p);
      this.drawPoints(p);
      this.drawInequality(p);
```

- [ ] **Step 3: Type-check**

Run: `npm run type-check`
Expected: PASS. (`p.drawingContext` is typed `any` on p5 — if TS complains, cast: `(p.drawingContext as CanvasRenderingContext2D)`.)

- [ ] **Step 4: Visual check**

Run: `./scripts/crawl-demos.py -d jensens-inequality --ask "Is there a shaded region above the parabola, a dashed vertical line at E[X], a hollow green dot on the curve, and a filled red dot above it joined by a red segment?"`
Expected: shaded hull over the curve; for x² the ● sits above the ○ (convex: E[φ(X)] ≥ φ(E[X])).

- [ ] **Step 5: Commit**

```bash
git add demos/probability/jensens-inequality.ts
git commit -m "Draw reachable region and both sides of Jensen's inequality"
```

---

## Task 6: Convexity badge + numeric readout

**Files:**
- Modify: `demos/probability/jensens-inequality.ts`

- [ ] **Step 1: Implement `updateBadge` and `updateReadout`**

Replace the two placeholder methods:

```typescript
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
    this.readoutEl.innerHTML =
      `φ(E[X]) = <b>${fmt(lhs)}</b> &nbsp; ${rel} &nbsp; E[φ(X)] = <b>${fmt(rhs)}</b>` +
      `<br>Jensen gap = ${fmt(gap)}`;
    this.refreshWeightReadouts();
  }
```

- [ ] **Step 2: Ensure both are called**

`updateFunction` already calls `updateReadout()` and `updateBadge()`. Confirm `updateBadge()` is also invoked once after parsing succeeds, and `updateReadout()` runs after every `recompute()` (drag handler, slider handler, add/remove already call it).

- [ ] **Step 3: Type-check**

Run: `npm run type-check`
Expected: PASS.

- [ ] **Step 4: Visual check**

Run: `./scripts/crawl-demos.py -d jensens-inequality --ask "Is there a readout showing 'φ(E[X]) = ... ≤ E[φ(X)] = ...' and a Jensen gap value, plus a '[convex]' badge near the function selector?"`
Expected: readout with `≤` for x²; badge says `[convex]`.

- [ ] **Step 5: Commit**

```bash
git add demos/probability/jensens-inequality.ts
git commit -m "Add convexity badge and inequality readout to Jensen demo"
```

---

## Task 7: Dark-mode redraw, edge cases, final verification

**Files:**
- Modify: `demos/probability/jensens-inequality.ts`

- [ ] **Step 1: React to theme changes**

Add the optional base hook so DOM-driven colors and badge refresh on dark/light toggle (canvas redraws every frame already):

```typescript
  protected onColorSchemeChange(_isDark: boolean): void {
    this.updateBadge();
  }
```

- [ ] **Step 2: Confirm edge-case handling (no code if already correct)**

Verify by reading the code that these hold; fix if not:
- Switching to a concave preset with a restricted domain (e.g. `log(x)`, `[0.15, 6]`) calls `clampPointsToDomain()` inside `updateFunction`, so existing points (e.g. x=−2) are pulled to `xMin`. Confirm `updateFunction` order is: parse → classify → `computeViewRange` → `clampPointsToDomain` → `recompute` → readout/badge/`rebuildWeights`.
- All-zero weights: `normalizeWeights` returns uniform (already handled).
- Coincident points: `convexHull` dedups and returns ≤2 points; `drawHull` early-returns when `hull.length < 2`, and the ●/○ collapse — gap shows ~0.

- [ ] **Step 3: Type-check**

Run: `npm run type-check`
Expected: PASS.

- [ ] **Step 4: Full single-page crawl (JS + CSP)**

Run: `./scripts/crawl-dev.sh --single-page "http://web-dev:5000/mathnotes/applied-math/probability-and-statistics/expectation"`
Expected: zero JavaScript errors, zero CSP violations.

- [ ] **Step 5: Screenshot review, desktop + mobile, light + dark**

Run: `./scripts/crawl-demos.py -d jensens-inequality`
Then ask, e.g.:
`./scripts/crawl-demos.py -d jensens-inequality --ask "On both desktop and mobile, are the controls usable and the region/markers/readout fully visible within the canvas, in both light and dark mode?"`
Expected: layout intact on mobile, colors correct in dark mode, nothing clipped. Fix any issues and re-run.

- [ ] **Step 6: Switch-function sanity (manual, via the demo viewer)**

Open `http://localhost:5000/demos/#jensens-inequality`. Select `−x²` (concave): the readout symbol must flip to `≥` and the ● must sit **below** the ○. Select a custom `x^3` on a domain spanning 0: badge should read `[neither (Jensen may not hold)]`. Drag points and move sliders; the region, markers, and readout update live.

- [ ] **Step 7: Final commit**

```bash
git add demos/probability/jensens-inequality.ts
git commit -m "Polish Jensen demo: theme redraw and edge cases"
```

---

## Self-Review Notes (spec coverage)

- Convex/concave selection → Task 2 (presets + custom box), Task 6 (badge).
- Select 2–5 draggable points → Task 3 (drag) + Task 4 (add/remove).
- Set weights → Task 4 (normalized sliders).
- Region where E-value could be → Task 5 (`drawHull`, hull from Task 1).
- Both sides of the inequality → Task 5 (markers/gap) + Task 6 (numeric readout, flipping symbol).
- Embed on Jensen page → Task 2 (registry + `include_demo`).
- Dark mode / mobile / CSP → Task 7.
