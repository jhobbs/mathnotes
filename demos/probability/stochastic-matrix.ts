// Stochastic matrices applied to a probability vector.
// Pick a row- / column- / doubly-stochastic matrix and a multiplication convention
// (A·x column vs xᵀA row), then watch the input distribution map to the output as bar
// charts. Doubly-stochastic matrices are built as convex combinations of permutation
// matrices (Birkhoff–von Neumann). Repeated application iterates toward the stationary
// distribution.
import p5 from 'p5';
import type { DemoConfig, DemoInstance } from '@framework/types';
import { P5DemoBase } from '@framework';
import type { DemoMetadata } from '@framework';

type MatrixType = 'row' | 'column' | 'doubly';
type ApplyDir = 'left' | 'right'; // left = A·x (x a column), right = xᵀA (x a row)
type Preset = 'identity' | 'shift' | 'uniform' | 'random';

interface Term {
  permIndex: number; // index into permOptions
  weight: number;    // raw weight; normalized on use
}

// --- pure math helpers ---

function normalize(v: number[]): number[] {
  const s = v.reduce((a, b) => a + Math.max(0, b), 0);
  if (s <= 0) return v.map(() => 1 / v.length);
  return v.map((x) => Math.max(0, x) / s);
}

// (A·x)_i = Σ_j A_ij x_j  — x treated as a column vector.
function applyLeft(A: number[][], x: number[]): number[] {
  return A.map((row) => row.reduce((s, a, j) => s + a * x[j], 0));
}

// (xᵀA)_j = Σ_i x_i A_ij  — x treated as a row vector (the Markov convention).
function applyRight(A: number[][], x: number[]): number[] {
  const n = A.length;
  const out = new Array<number>(n).fill(0);
  for (let j = 0; j < n; j++) {
    let s = 0;
    for (let i = 0; i < n; i++) s += x[i] * A[i][j];
    out[j] = s;
  }
  return out;
}

function transpose(A: number[][]): number[][] {
  const n = A.length;
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => A[j][i]));
}

function randomRowStochastic(n: number): number[][] {
  return Array.from({ length: n }, () =>
    normalize(Array.from({ length: n }, () => 0.05 + Math.random())),
  );
}

function permutationMatrix(perm: number[]): number[][] {
  const n = perm.length;
  const A = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < n; i++) A[i][perm[i]] = 1;
  return A;
}

function combinePermutations(perms: number[][], weights: number[]): number[][] {
  const n = perms[0].length;
  const w = normalize(weights);
  const A = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  perms.forEach((perm, k) => {
    for (let i = 0; i < n; i++) A[i][perm[i]] += w[k];
  });
  return A;
}

function allPermutations(n: number): number[][] {
  const result: number[][] = [];
  const cur: number[] = [];
  const used = new Array<boolean>(n).fill(false);
  const rec = (): void => {
    if (cur.length === n) { result.push(cur.slice()); return; }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = true; cur.push(i);
      rec();
      cur.pop(); used[i] = false;
    }
  };
  rec();
  return result;
}

const identityPerm = (n: number): number[] => Array.from({ length: n }, (_, i) => i);
const shiftPerm = (n: number): number[] => Array.from({ length: n }, (_, i) => (i + 1) % n);

const rowSums = (A: number[][]): number[] => A.map((row) => row.reduce((a, b) => a + b, 0));
const colSums = (A: number[][]): number[] =>
  A.length === 0 ? [] : A[0].map((_, j) => A.reduce((s, row) => s + row[j], 0));
const sum = (v: number[]): number => v.reduce((a, b) => a + b, 0);
const permLabel = (perm: number[]): string => perm.map((v) => v + 1).join(' ');
const findPermIndex = (perms: number[][], target: number[]): number =>
  perms.findIndex((p) => p.join(',') === target.join(','));

export const metadata: DemoMetadata = {
  title: 'Stochastic Matrices',
  category: 'Probability & Statistics',
  description:
    'Apply a row-, column-, or doubly-stochastic matrix to a probability vector and compare the ' +
    'input and output distributions, with repeated application toward the stationary distribution.',
  instructions:
    'Drag the input bars to reshape the distribution. Choose the matrix type and whether to apply ' +
    'it as A·x (column) or xᵀA (row) — only some combinations keep the output a valid distribution. ' +
    'Build doubly-stochastic matrices from permutation matrices, and Step/Play to iterate.',
};

class StochasticMatrixDemo extends P5DemoBase {
  private n = 3;
  private matrixType: MatrixType = 'row';
  private applyDir: ApplyDir = 'right';
  private preset: Preset = 'random';

  private A: number[][] = [];
  private permOptions: number[][] = [];
  private terms: Term[] = [];

  private baseRaw: number[] = []; // user-set raw input weights
  private state: number[] = [];   // current (normalized-at-iter-0) vector shown as input bars
  private iterCount = 0;
  private playing = false;
  private lastStepFrame = 0;
  private static readonly STEP_INTERVAL = 42; // frames between auto-steps
  private static readonly MAX_ITER = 200;

  private draggingBar: number | null = null;

  // UI refs
  private constructionEl!: HTMLElement;
  private readoutEl!: HTMLElement;
  private iterEl!: HTMLElement;
  private playBtn!: HTMLButtonElement;
  private weightSliders: HTMLInputElement[] = [];
  private weightSpans: HTMLElement[] = [];

  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
  }

  protected getStylePrefix(): string { return 'stochmat'; }
  protected getContainerId(): string { return 'stochmat-container'; }
  protected getAspectRatio(): number { return 0.52; }
  protected getMaxHeightPercent(): number { return 0.6; }

  // --- colors ---
  private get inputColor(): string { return this.isDarkMode ? '#66aaff' : '#3366cc'; }
  private get outputColor(): string { return this.isDarkMode ? '#ffb84d' : '#dd7700'; }
  private get validColor(): string { return this.isDarkMode ? '#66ff99' : '#118844'; }
  private get invalidColor(): string { return this.isDarkMode ? '#ff7777' : '#cc2222'; }
  private get mutedColor(): string { return this.isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'; }

  // --- state management ---

  private uniform(n: number): number[] { return new Array<number>(n).fill(1 / n); }

  private defaultTerms(n: number): Term[] {
    return [
      { permIndex: findPermIndex(this.permOptions, identityPerm(n)), weight: 0.6 },
      { permIndex: findPermIndex(this.permOptions, shiftPerm(n)), weight: 0.4 },
    ];
  }

  private presetMatrix(): number[][] {
    switch (this.preset) {
      case 'identity': return permutationMatrix(identityPerm(this.n));
      case 'shift': return permutationMatrix(shiftPerm(this.n));
      case 'uniform': return Array.from({ length: this.n }, () => this.uniform(this.n));
      case 'random': return randomRowStochastic(this.n);
    }
  }

  private regenerateMatrix(): void {
    if (this.matrixType === 'doubly') {
      const perms = this.terms.map((t) => this.permOptions[t.permIndex]);
      const weights = this.terms.map((t) => t.weight);
      this.A = combinePermutations(perms, weights);
    } else {
      const M = this.presetMatrix();
      this.A = this.matrixType === 'column' ? transpose(M) : M;
    }
  }

  private resetIteration(): void {
    this.state = normalize(this.baseRaw);
    this.iterCount = 0;
    this.setPlaying(false);
  }

  private applyOp(x: number[]): number[] {
    return this.applyDir === 'left' ? applyLeft(this.A, x) : applyRight(this.A, x);
  }

  private outputVec(): number[] { return this.applyOp(this.state); }

  private step(): void {
    if (this.iterCount >= StochasticMatrixDemo.MAX_ITER) { this.setPlaying(false); return; }
    const next = this.outputVec();
    // Stop auto-play once it has effectively converged.
    if (this.playing) {
      const delta = next.reduce((s, v, i) => s + Math.abs(v - this.state[i]), 0);
      if (delta < 1e-6) { this.setPlaying(false); }
    }
    this.state = next;
    this.iterCount++;
    this.updateReadout();
  }

  private setPlaying(v: boolean): void {
    this.playing = v;
    if (this.playBtn) this.playBtn.textContent = v ? 'Pause' : 'Play';
  }

  // --- lifecycle ---

  protected createSketch(p: p5): void {
    p.setup = () => {
      this.n = 3;
      this.permOptions = allPermutations(this.n);
      this.terms = this.defaultTerms(this.n);
      this.baseRaw = this.uniform(this.n);
      this.regenerateMatrix();
      this.state = normalize(this.baseRaw);
      this.setupUI();
      this.updateReadout();
    };

    p.draw = () => {
      if (this.playing && p.frameCount - this.lastStepFrame >= StochasticMatrixDemo.STEP_INTERVAL) {
        this.step();
        this.lastStepFrame = p.frameCount;
      }
      this.render(p);
    };

    p.mousePressed = () => this.onPress(p);
    p.mouseDragged = () => this.onDrag(p);
    p.mouseReleased = () => { this.draggingBar = null; };
  }

  // --- layout helpers (recomputed each frame from canvas size) ---

  private layout(p: p5) {
    const pad = 14;
    const topPad = 48;
    const bottomPad = 40;
    const baseline = p.height - bottomPad;
    const barTop = topPad;
    return {
      pad, baseline, barTop,
      barAreaH: baseline - barTop,
      leftX0: pad, leftX1: p.width * 0.30,
      midX0: p.width * 0.34, midX1: p.width * 0.66,
      rightX0: p.width * 0.70, rightX1: p.width - pad,
    };
  }

  private barSlots(x0: number, x1: number) {
    const slotW = (x1 - x0) / this.n;
    const barW = Math.min(slotW * 0.62, 60);
    return { slotW, barW, centerOf: (i: number) => x0 + slotW * (i + 0.5) };
  }

  private vmax(): number {
    const out = this.outputVec();
    return Math.max(1, ...this.state, ...out) * 1.08;
  }

  // --- rendering ---

  private render(p: p5): void {
    p.background(this.colors.background);
    const L = this.layout(p);
    const out = this.outputVec();
    const vmax = this.vmax();

    // Titles
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(this.colors.text);
    p.textSize(15);
    const formula = this.applyDir === 'left' ? 'output = A · x' : 'output = xᵀ A';
    p.text(formula, p.width / 2, 16);
    p.textSize(12);
    p.fill(this.mutedColor);
    // Once we start iterating, the left panel is the current state xₖ (not the fixed
    // input) and the right is one more application, xₖ₊₁ — so both march forward.
    const k = this.iterCount;
    const leftLabel = k === 0 ? 'input  x' : `state  xₖ  (k = ${k})`;
    const rightLabel = k === 0 ? 'output' : 'next  xₖ₊₁';
    p.text(leftLabel, (L.leftX0 + L.leftX1) / 2, 30);
    p.text(rightLabel, (L.rightX0 + L.rightX1) / 2, 30);

    // Reference line at value = 1 (only meaningful when something exceeds it)
    if (vmax > 1.02) {
      const y1 = L.baseline - (1 / vmax) * L.barAreaH;
      p.stroke(this.mutedColor);
      p.strokeWeight(1);
      const ctx = p.drawingContext as CanvasRenderingContext2D;
      ctx.setLineDash([4, 4]);
      p.line(L.leftX0, y1, L.leftX1, y1);
      p.line(L.rightX0, y1, L.rightX1, y1);
      ctx.setLineDash([]);
      p.noStroke();
      p.fill(this.mutedColor);
      p.textSize(10);
      p.textAlign(p.LEFT, p.CENTER);
      p.text('1', L.leftX0 + 2, y1 - 6);
    }

    this.drawBars(p, this.state, L, L.leftX0, L.leftX1, vmax, this.inputColor);
    this.drawBars(p, out, L, L.rightX0, L.rightX1, vmax, this.outputColor);
    this.drawMatrix(p, L);
    this.drawArrows(p, L);
    this.drawSums(p, out, L);
  }

  private drawBars(
    p: p5, values: number[], L: ReturnType<StochasticMatrixDemo['layout']>,
    x0: number, x1: number, vmax: number, color: string,
  ): void {
    const { barW, centerOf } = this.barSlots(x0, x1);
    // baseline
    p.stroke(this.mutedColor);
    p.strokeWeight(1);
    p.line(x0, L.baseline, x1, L.baseline);
    for (let i = 0; i < this.n; i++) {
      const cx = centerOf(i);
      const h = Math.max(0, (values[i] / vmax) * L.barAreaH);
      p.noStroke();
      p.fill(color);
      p.rectMode(p.CORNER);
      p.rect(cx - barW / 2, L.baseline - h, barW, h, 3, 3, 0, 0);
      // value label
      p.fill(this.colors.text);
      p.textSize(11);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.text(values[i].toFixed(2), cx, L.baseline - h - 2);
      // index label
      p.fill(this.mutedColor);
      p.textAlign(p.CENTER, p.TOP);
      p.text(`${i + 1}`, cx, L.baseline + 4);
    }
  }

  private drawMatrix(p: p5, L: ReturnType<StochasticMatrixDemo['layout']>): void {
    const n = this.n;
    const gridW = L.midX1 - L.midX0;
    const cellW = (gridW * 0.78) / n;
    const cellH = Math.min(cellW, (L.barAreaH - 18) / n);
    const gridTop = L.barTop + (L.barAreaH - cellH * n) / 2;
    const mx0 = L.midX0 + 8;
    const rs = rowSums(this.A);
    const cs = colSums(this.A);
    const rowConstrained = this.matrixType === 'row' || this.matrixType === 'doubly';
    const colConstrained = this.matrixType === 'column' || this.matrixType === 'doubly';

    // type label
    const typeName =
      this.matrixType === 'row' ? 'row-stochastic'
        : this.matrixType === 'column' ? 'column-stochastic'
          : 'doubly-stochastic';
    p.noStroke();
    p.fill(this.mutedColor);
    p.textSize(12);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text(`A — ${typeName}`, (L.midX0 + L.midX1) / 2, gridTop - 8);

    // brackets
    const bx0 = mx0 - 5;
    const bx1 = mx0 + cellW * n + 3;
    const by0 = gridTop;
    const by1 = gridTop + cellH * n;
    p.stroke(this.colors.text);
    p.strokeWeight(1.5);
    p.noFill();
    p.line(bx0, by0, bx0, by1); p.line(bx0, by0, bx0 + 5, by0); p.line(bx0, by1, bx0 + 5, by1);
    p.line(bx1, by0, bx1, by1); p.line(bx1, by0, bx1 - 5, by0); p.line(bx1, by1, bx1 - 5, by1);

    // entries
    p.noStroke();
    const fs = Math.min(13, cellH * 0.42);
    p.textSize(fs);
    p.textAlign(p.CENTER, p.CENTER);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const v = this.A[i][j];
        if (v > 0.001) p.fill(this.colors.text); else p.fill(this.mutedColor);
        p.text(v.toFixed(2), mx0 + cellW * (j + 0.5), gridTop + cellH * (i + 0.5));
      }
    }

    // row sums (right of matrix)
    p.textSize(10);
    p.textAlign(p.LEFT, p.CENTER);
    for (let i = 0; i < n; i++) {
      p.fill(rowConstrained && Math.abs(rs[i] - 1) < 1e-6 ? this.validColor : this.mutedColor);
      p.text(rs[i].toFixed(2), bx1 + 6, gridTop + cellH * (i + 0.5));
    }
    // col sums (below matrix)
    p.textAlign(p.CENTER, p.TOP);
    for (let j = 0; j < n; j++) {
      p.fill(colConstrained && Math.abs(cs[j] - 1) < 1e-6 ? this.validColor : this.mutedColor);
      p.text(cs[j].toFixed(2), mx0 + cellW * (j + 0.5), by1 + 4);
    }
  }

  private drawArrows(p: p5, L: ReturnType<StochasticMatrixDemo['layout']>): void {
    p.noStroke();
    p.fill(this.mutedColor);
    p.textSize(18);
    p.textAlign(p.CENTER, p.CENTER);
    const y = L.barTop + L.barAreaH / 2;
    p.text('→', (L.leftX1 + L.midX0) / 2, y);
    p.text('→', (L.midX1 + L.rightX0) / 2, y);
  }

  private drawSums(p: p5, out: number[], L: ReturnType<StochasticMatrixDemo['layout']>): void {
    p.noStroke();
    p.textSize(11);
    p.textAlign(p.CENTER, p.TOP);
    const y = L.baseline + 18;
    p.fill(this.mutedColor);
    p.text(`Σ = ${sum(this.state).toFixed(2)}`, (L.leftX0 + L.leftX1) / 2, y);
    const outSum = sum(out);
    const valid = Math.abs(outSum - 1) < 1e-6;
    p.fill(valid ? this.validColor : this.invalidColor);
    p.text(`Σ = ${outSum.toFixed(2)} ${valid ? '✓' : '✗'}`, (L.rightX0 + L.rightX1) / 2, y);
  }

  // --- interaction ---

  private onPress(p: p5): void {
    if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return;
    const L = this.layout(p);
    if (p.mouseX < L.leftX0 || p.mouseX > L.leftX1) return;
    if (p.mouseY < L.barTop - 10 || p.mouseY > L.baseline + 10) return;
    const { slotW, centerOf } = this.barSlots(L.leftX0, L.leftX1);
    for (let i = 0; i < this.n; i++) {
      if (Math.abs(p.mouseX - centerOf(i)) <= slotW / 2) {
        this.draggingBar = i;
        this.resetIteration();
        this.onDrag(p);
        return;
      }
    }
  }

  private onDrag(p: p5): void {
    if (this.draggingBar === null) return;
    const L = this.layout(p);
    const vmax = this.vmax();
    const val = ((L.baseline - p.mouseY) / L.barAreaH) * vmax;
    this.baseRaw[this.draggingBar] = Math.min(vmax, Math.max(0.001, val));
    this.state = normalize(this.baseRaw);
    this.iterCount = 0;
    this.updateReadout();
  }

  // --- DOM controls ---

  private setupUI(): void {
    const panel = this.createControlPanel();

    // Row 1: size, type, direction
    const row1 = this.makeRow();
    row1.appendChild(this.makeLabel('n:'));
    row1.appendChild(this.makeSelect(
      [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }],
      String(this.n),
      (v) => this.setN(parseInt(v, 10)),
    ));
    row1.appendChild(this.makeLabel('matrix:'));
    row1.appendChild(this.makeSelect(
      [
        { value: 'row', label: 'row-stochastic' },
        { value: 'column', label: 'column-stochastic' },
        { value: 'doubly', label: 'doubly-stochastic' },
      ],
      this.matrixType,
      (v) => this.setType(v as MatrixType),
    ));
    row1.appendChild(this.makeLabel('apply as:'));
    row1.appendChild(this.makeSelect(
      [{ value: 'left', label: 'A·x (column)' }, { value: 'right', label: 'xᵀA (row)' }],
      this.applyDir,
      (v) => { this.applyDir = v as ApplyDir; this.resetIteration(); this.updateReadout(); },
    ));
    panel.appendChild(row1);

    // Row 2: construction (rebuilt on type change)
    this.constructionEl = document.createElement('div');
    panel.appendChild(this.constructionEl);
    this.rebuildConstruction();

    // Row 3: iteration controls
    const row3 = this.makeRow();
    row3.appendChild(this.makeLabel('iterate:'));
    row3.appendChild(this.makeBtn('Step', () => { this.setPlaying(false); this.step(); }));
    this.playBtn = this.makeBtn('Play', () => this.togglePlay());
    row3.appendChild(this.playBtn);
    row3.appendChild(this.makeBtn('Reset', () => { this.resetIteration(); this.updateReadout(); }));
    this.iterEl = document.createElement('span');
    this.iterEl.style.fontFamily = 'var(--font-mono, monospace)';
    this.iterEl.style.marginLeft = 'var(--spacing-sm, 0.5rem)';
    row3.appendChild(this.iterEl);
    panel.appendChild(row3);

    // Readout
    this.readoutEl = document.createElement('div');
    this.readoutEl.style.fontFamily = 'var(--font-mono, monospace)';
    this.readoutEl.style.marginTop = 'var(--spacing-sm, 0.5rem)';
    panel.appendChild(this.readoutEl);
  }

  private setN(n: number): void {
    this.n = n;
    this.permOptions = allPermutations(n);
    this.terms = this.defaultTerms(n);
    this.baseRaw = this.uniform(n);
    this.regenerateMatrix();
    this.resetIteration();
    this.rebuildConstruction();
    this.updateReadout();
  }

  private setType(t: MatrixType): void {
    this.matrixType = t;
    if (t !== 'doubly') this.preset = 'random';
    this.regenerateMatrix();
    this.resetIteration();
    this.rebuildConstruction();
    this.updateReadout();
  }

  private togglePlay(): void {
    if (this.iterCount >= StochasticMatrixDemo.MAX_ITER) this.resetIteration();
    this.setPlaying(!this.playing);
    this.lastStepFrame = this.p5Instance ? this.p5Instance.frameCount : 0;
  }

  /** Build the matrix-construction controls appropriate to the current type. */
  private rebuildConstruction(): void {
    this.constructionEl.innerHTML = '';
    if (this.matrixType === 'doubly') {
      this.buildDoublyBuilder();
    } else {
      const row = this.makeRow();
      row.appendChild(this.makeLabel('preset:'));
      row.appendChild(this.makeSelect(
        [
          { value: 'random', label: 'random' },
          { value: 'identity', label: 'identity' },
          { value: 'shift', label: 'shift' },
          { value: 'uniform', label: 'uniform' },
        ],
        this.preset,
        (v) => { this.preset = v as Preset; this.regenerateMatrix(); this.resetIteration(); this.updateReadout(); },
      ));
      row.appendChild(this.makeBtn('Randomize', () => {
        this.preset = 'random';
        this.regenerateMatrix();
        this.resetIteration();
        this.rebuildConstruction();
        this.updateReadout();
      }));
      this.constructionEl.appendChild(row);
    }
  }

  private buildDoublyBuilder(): void {
    const header = this.makeRow();
    header.appendChild(this.makeLabel('A = Σ wₖ Pₖ:'));
    header.appendChild(this.makeBtn('+ permutation', () => this.addTerm()));
    header.appendChild(this.makeBtn('Randomize', () => this.randomizeDoubly()));
    this.constructionEl.appendChild(header);

    this.weightSliders = [];
    this.weightSpans = [];
    const single = this.terms.length === 1;
    const permOpts = this.permOptions.map((perm, idx) => ({ value: String(idx), label: permLabel(perm) }));
    this.terms.forEach((term, k) => {
      const row = this.makeRow();
      row.appendChild(this.makeLabel(`P${k + 1}`));
      row.appendChild(this.makeSelect(permOpts, String(term.permIndex), (v) => {
        term.permIndex = parseInt(v, 10);
        this.regenerateMatrix();
        this.resetIteration();
        this.updateReadout();
      }));
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '0';
      slider.max = '1';
      slider.step = '0.01';
      slider.value = String(term.weight);
      slider.style.width = '110px';
      slider.disabled = single; // one term ⇒ weight is fixed at 1
      // Weights are a convex combination: dragging one redistributes the rest so Σ wₖ = 1.
      this.addEventListener(slider, 'input', () => this.setDoublyWeight(k, parseFloat(slider.value)));
      row.appendChild(slider);
      const valSpan = document.createElement('span');
      valSpan.style.fontFamily = 'var(--font-mono, monospace)';
      valSpan.style.minWidth = '2.6em';
      valSpan.textContent = term.weight.toFixed(2);
      row.appendChild(valSpan);
      if (!single) row.appendChild(this.makeBtn('−', () => this.removeTerm(k)));
      this.weightSliders.push(slider);
      this.weightSpans.push(valSpan);
      this.constructionEl.appendChild(row);
    });

    const sumRow = this.makeRow();
    const sumLabel = this.makeLabel('Σ wₖ = 1');
    sumLabel.style.color = this.mutedColor;
    sumRow.appendChild(sumLabel);
    this.constructionEl.appendChild(sumRow);
  }

  /** Set term k's weight and redistribute the others proportionally so Σ wₖ = 1. */
  private setDoublyWeight(k: number, v: number): void {
    const t = this.terms;
    if (t.length === 1) {
      t[0].weight = 1;
    } else {
      const nv = Math.min(1, Math.max(0, v));
      const otherSum = t.reduce((s, term, i) => (i === k ? s : s + term.weight), 0);
      const remaining = 1 - nv;
      if (otherSum > 1e-9) {
        const scale = remaining / otherSum;
        t.forEach((term, i) => { if (i !== k) term.weight *= scale; });
      } else {
        const each = remaining / (t.length - 1);
        t.forEach((term, i) => { if (i !== k) term.weight = each; });
      }
      t[k].weight = nv;
    }
    this.syncWeightSliders();
    this.regenerateMatrix();
    this.resetIteration();
    this.updateReadout();
  }

  /** Push the current term weights back into the slider positions and value labels. */
  private syncWeightSliders(): void {
    this.terms.forEach((term, i) => {
      if (this.weightSliders[i]) this.weightSliders[i].value = String(term.weight);
      if (this.weightSpans[i]) this.weightSpans[i].textContent = term.weight.toFixed(2);
    });
  }

  private normalizeTermWeights(): void {
    const w = normalize(this.terms.map((t) => t.weight));
    this.terms.forEach((t, i) => { t.weight = w[i]; });
  }

  private addTerm(): void {
    if (this.terms.length >= this.permOptions.length) return;
    // pick a permutation not already used, if possible
    const used = new Set(this.terms.map((t) => t.permIndex));
    let idx = 0;
    for (let i = 0; i < this.permOptions.length; i++) { if (!used.has(i)) { idx = i; break; } }
    this.terms.push({ permIndex: idx, weight: 0.3 });
    this.normalizeTermWeights();
    this.regenerateMatrix();
    this.resetIteration();
    this.rebuildConstruction();
    this.updateReadout();
  }

  private removeTerm(k: number): void {
    if (this.terms.length <= 1) return;
    this.terms.splice(k, 1);
    this.normalizeTermWeights();
    this.regenerateMatrix();
    this.resetIteration();
    this.rebuildConstruction();
    this.updateReadout();
  }

  private randomizeDoubly(): void {
    const count = Math.min(this.permOptions.length, 2 + Math.floor(Math.random() * 2)); // 2–3 terms
    const idxs = [...this.permOptions.keys()];
    // shuffle
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    this.terms = idxs.slice(0, count).map((permIndex) => ({ permIndex, weight: 0.1 + Math.random() }));
    this.normalizeTermWeights();
    this.regenerateMatrix();
    this.resetIteration();
    this.rebuildConstruction();
    this.updateReadout();
  }

  private updateReadout(): void {
    if (!this.readoutEl) return;
    if (this.iterEl) this.iterEl.textContent = `iteration ${this.iterCount}`;
    const out = this.outputVec();
    const outSum = sum(out);
    const valid = Math.abs(outSum - 1) < 1e-6;
    const formula = this.applyDir === 'left' ? 'A·x' : 'xᵀA';
    const msg = valid
      ? 'output is a valid probability distribution'
      : 'output is NOT a probability distribution (Σ ≠ 1)';
    this.readoutEl.innerHTML = '';
    const line1 = document.createElement('div');
    const a = document.createElement('span');
    a.textContent = `${formula} → Σ = ${outSum.toFixed(3)}  `;
    const b = document.createElement('span');
    b.textContent = valid ? `✓ ${msg}` : `✗ ${msg}`;
    b.style.color = valid ? this.validColor : this.invalidColor;
    b.style.fontWeight = 'bold';
    line1.append(a, b);
    this.readoutEl.append(line1);

    // Second line explains what iteration (Step/Play) is doing.
    const line2 = document.createElement('div');
    line2.style.color = this.mutedColor;
    if (this.iterCount === 0) {
      line2.textContent = 'Step / Play feeds each output back in as the next input, iterating toward the stationary distribution.';
    } else {
      const delta = out.reduce((s, v, i) => s + Math.abs(v - this.state[i]), 0);
      line2.textContent = delta < 1e-4
        ? `converged after ${this.iterCount} steps: xₖ is (approximately) stationary — M·xₖ = xₖ.`
        : `step ${this.iterCount}: output xₖ₊₁ becomes the next input. Reset to restore your original x.`;
    }
    this.readoutEl.append(line2);
  }

  protected onColorSchemeChange(): void {
    this.updateReadout();
  }

  // --- DOM helpers (same pattern as jensens-inequality.ts) ---

  private makeSelect(
    options: { value: string; label: string }[],
    current: string,
    onChange: (value: string) => void,
  ): HTMLSelectElement {
    const select = document.createElement('select');
    select.style.padding = '0.25rem 0.5rem';
    for (const opt of options) {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      select.appendChild(o);
    }
    select.value = current;
    this.addEventListener(select, 'change', () => onChange(select.value));
    return select;
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
  return new StochasticMatrixDemo(container, config).init();
}
