// Relative entropy (Kullback–Leibler divergence) between two discrete distributions.
// Drag the bars of a reference distribution P and an approximating distribution Q over the
// same alphabet of n = 2..5 symbols and watch D(P‖Q) = Σ Pᵢ log(Pᵢ/Qᵢ) update live, along
// with the reverse divergence D(Q‖P) (asymmetry) and the decomposition D = H(P,Q) − H(P).
// Modeled on the stochastic-matrix demo: raw bar heights normalized to a probability vector
// on use, per-bar dragging via draggingBar.
import p5 from 'p5';
import type { DemoConfig, DemoInstance } from '@framework/types';
import { P5DemoBase } from '@framework';
import type { DemoMetadata } from '@framework';

type Side = 'P' | 'Q';

interface BaseInfo {
  value: number;   // logarithm base
  label: string;   // selector label
  unit: string;    // unit name
}

const BASES: BaseInfo[] = [
  { value: 2, label: 'bits (log₂)', unit: 'bits' },
  { value: Math.E, label: 'nats (ln)', unit: 'nats' },
  { value: 10, label: 'hartleys (log₁₀)', unit: 'hartleys' },
];

// A dragged bar's probability is clamped to [MIN_P, MAX_P]: the floor keeps every probability
// strictly positive (a Q bar dragged to MIN_P still leaves Pᵢ/Qᵢ finite but large — the D → ∞
// regime), and the cap leaves headroom above the tallest bar for its value label.
const MIN_P = 4e-3;
const MAX_P = 0.9;

// --- pure math helpers ---

function normalize(v: number[]): number[] {
  const s = v.reduce((a, b) => a + Math.max(0, b), 0);
  if (s <= 0) return v.map(() => 1 / v.length);
  return v.map((x) => Math.max(0, x) / s);
}

const logB = (x: number, base: number): number => Math.log(x) / Math.log(base);

// H(P) = −Σ Pᵢ log Pᵢ, with the convention 0·log 0 = 0.
function entropy(P: number[], base: number): number {
  return -P.reduce((s, p) => (p > 0 ? s + p * logB(p, base) : s), 0);
}

// H(P,Q) = −Σ Pᵢ log Qᵢ.
function crossEntropy(P: number[], Q: number[], base: number): number {
  return -P.reduce((s, p, i) => (p > 0 ? s + p * logB(Math.max(Q[i], Number.MIN_VALUE), base) : s), 0);
}

// Per-symbol contributions Pᵢ log(Pᵢ/Qᵢ); these sum to D(P‖Q).
function klTerms(P: number[], Q: number[], base: number): number[] {
  return P.map((p, i) => (p > 0 ? p * logB(p / Math.max(Q[i], Number.MIN_VALUE), base) : 0));
}

function klDivergence(P: number[], Q: number[], base: number): number {
  return klTerms(P, Q, base).reduce((a, b) => a + b, 0);
}

export const metadata: DemoMetadata = {
  title: 'Relative Entropy (KL Divergence)',
  category: 'Information Theory',
  description:
    'Drag the bars of a reference distribution P and an approximating distribution Q to see how the ' +
    'relative entropy D(P‖Q) = Σ Pᵢ log(Pᵢ/Qᵢ) responds, alongside the reverse divergence D(Q‖P) and ' +
    'the decomposition into cross-entropy minus entropy.',
  instructions:
    'Drag any bar to reshape P (reference, left) or Q (approximating, right); each distribution is ' +
    'renormalized to sum to 1. Watch D(P‖Q) change — it is zero only when Q = P, is asymmetric, and ' +
    'blows up as Q sends a symbol’s probability toward 0 while P keeps it. The lower strip shows each ' +
    'symbol’s contribution Pᵢ log(Pᵢ/Qᵢ).',
};

class RelativeEntropyDemo extends P5DemoBase {
  private n = 3;
  private base: BaseInfo = BASES[0];

  private pRaw: number[] = [];
  private qRaw: number[] = [];

  private draggingBar: { side: Side; index: number } | null = null;

  private readoutEl!: HTMLElement;

  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
  }

  protected getStylePrefix(): string { return 'relent'; }
  protected getContainerId(): string { return 'relent-container'; }
  protected getAspectRatio(): number { return 0.6; }
  protected getMaxHeightPercent(): number { return 0.7; }

  // --- colors ---
  private get pColor(): string { return this.isDarkMode ? '#66aaff' : '#3366cc'; } // reference P
  private get qColor(): string { return this.isDarkMode ? '#ffb84d' : '#dd7700'; } // approximating Q
  private get mutedColor(): string { return this.isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'; }
  private get ghostColor(): string { return this.isDarkMode ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)'; }

  // --- state ---

  private descending(n: number): number[] { return Array.from({ length: n }, (_, i) => n - i); }
  private uniform(n: number): number[] { return new Array<number>(n).fill(1); }

  private resetDistributions(): void {
    this.pRaw = this.descending(this.n); // peaked reference
    this.qRaw = this.uniform(this.n);     // flat approximation
  }

  private get P(): number[] { return normalize(this.pRaw); }
  private get Q(): number[] { return normalize(this.qRaw); }

  // --- lifecycle ---

  protected createSketch(p: p5): void {
    p.setup = () => {
      this.n = 3;
      this.resetDistributions();
      this.setupUI();
      this.updateReadout();
    };

    p.draw = () => this.render(p);

    p.mousePressed = () => this.onPress(p);
    p.mouseDragged = () => this.onDrag(p);
    p.mouseReleased = () => { this.draggingBar = null; };
  }

  // --- layout (recomputed each frame from canvas size) ---

  private layout(p: p5) {
    const pad = 16;
    const chartTop = 44;
    const bottomPad = 24;
    const chartBottom = p.height * 0.55;
    const stripTop = p.height * 0.65;
    const stripBottom = p.height - bottomPad;
    return {
      pad, chartTop, chartBottom,
      chartAreaH: chartBottom - chartTop,
      leftX0: pad, leftX1: p.width * 0.48,
      rightX0: p.width * 0.52, rightX1: p.width - pad,
      stripTop, stripBottom,
      stripZero: (stripTop + stripBottom) / 2,
      stripHalfH: (stripBottom - stripTop) / 2,
      fullX0: pad, fullX1: p.width - pad,
    };
  }

  private barSlots(x0: number, x1: number) {
    const slotW = (x1 - x0) / this.n;
    const barW = Math.min(slotW * 0.6, 56);
    return { slotW, barW, centerOf: (i: number) => x0 + slotW * (i + 0.5) };
  }

  // --- rendering ---

  private render(p: p5): void {
    p.background(this.colors.background);
    const L = this.layout(p);
    const P = this.P;
    const Q = this.Q;

    // Formula title
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(this.colors.text);
    p.textSize(15);
    p.text('D(P‖Q) = Σᵢ Pᵢ log(Pᵢ / Qᵢ)', p.width / 2, 16);

    // Chart sublabels
    p.textSize(12);
    p.fill(this.pColor);
    p.text('reference  P', (L.leftX0 + L.leftX1) / 2, 32);
    p.fill(this.qColor);
    p.text('approximating  Q', (L.rightX0 + L.rightX1) / 2, 32);

    // Charts (with a faint ghost of the other distribution behind each). Bar height is the
    // probability directly (full chart height = probability 1), so a dragged bar tracks the cursor.
    this.drawChart(p, P, Q, L, L.leftX0, L.leftX1, this.pColor);
    this.drawChart(p, Q, P, L, L.rightX0, L.rightX1, this.qColor);

    this.drawStrip(p, klTerms(P, Q, this.base.value), L);
  }

  private drawChart(
    p: p5, values: number[], ghost: number[],
    L: ReturnType<RelativeEntropyDemo['layout']>,
    x0: number, x1: number, color: string,
  ): void {
    const { barW, centerOf } = this.barSlots(x0, x1);
    p.stroke(this.mutedColor);
    p.strokeWeight(1);
    p.line(x0, L.chartBottom, x1, L.chartBottom);
    for (let i = 0; i < this.n; i++) {
      const cx = centerOf(i);
      const h = Math.max(0, values[i] * L.chartAreaH);
      const gh = Math.max(0, ghost[i] * L.chartAreaH);

      // solid bar for this distribution
      p.noStroke();
      p.fill(color);
      p.rectMode(p.CORNER);
      p.rect(cx - barW / 2, L.chartBottom - h, barW, h, 3, 3, 0, 0);

      // ghost outline of the other distribution
      p.noFill();
      p.stroke(this.ghostColor);
      p.strokeWeight(1.5);
      p.rect(cx - barW / 2, L.chartBottom - gh, barW, gh, 3, 3, 0, 0);

      // value label
      p.noStroke();
      p.fill(this.colors.text);
      p.textSize(11);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.text(values[i].toFixed(2), cx, L.chartBottom - Math.max(h, gh) - 2);
      // index label
      p.fill(this.mutedColor);
      p.textAlign(p.CENTER, p.TOP);
      p.text(`${i + 1}`, cx, L.chartBottom + 4);
    }
  }

  private drawStrip(
    p: p5, terms: number[], L: ReturnType<RelativeEntropyDemo['layout']>,
  ): void {
    const { barW, centerOf } = this.barSlots(L.fullX0, L.fullX1);
    const tmax = Math.max(1e-3, ...terms.map((t) => Math.abs(t)));

    // caption
    p.noStroke();
    p.fill(this.mutedColor);
    p.textSize(11);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text('per-symbol  Pᵢ log(Pᵢ / Qᵢ)   (sums to D(P‖Q))', p.width / 2, L.stripTop - 4);

    // zero axis
    p.stroke(this.mutedColor);
    p.strokeWeight(1);
    p.line(L.fullX0, L.stripZero, L.fullX1, L.stripZero);

    for (let i = 0; i < this.n; i++) {
      const cx = centerOf(i);
      const h = (terms[i] / tmax) * L.stripHalfH;
      const positive = terms[i] >= 0;
      p.noStroke();
      // positive term ⇒ Pᵢ > Qᵢ (color with P); negative ⇒ Qᵢ > Pᵢ (color with Q)
      p.fill(positive ? this.pColor : this.qColor);
      p.rectMode(p.CORNER);
      if (positive) {
        p.rect(cx - barW / 2, L.stripZero - h, barW, h);
      } else {
        p.rect(cx - barW / 2, L.stripZero, barW, -h);
      }
      // index label at the bottom of the strip
      p.fill(this.mutedColor);
      p.textSize(11);
      p.textAlign(p.CENTER, p.TOP);
      p.text(`${i + 1}`, cx, L.stripBottom + 2);
    }
  }

  // --- interaction ---

  private hitChart(p: p5, L: ReturnType<RelativeEntropyDemo['layout']>): Side | null {
    if (p.mouseY < L.chartTop - 12 || p.mouseY > L.chartBottom + 12) return null;
    if (p.mouseX >= L.leftX0 && p.mouseX <= L.leftX1) return 'P';
    if (p.mouseX >= L.rightX0 && p.mouseX <= L.rightX1) return 'Q';
    return null;
  }

  private onPress(p: p5): void {
    if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return;
    const L = this.layout(p);
    const side = this.hitChart(p, L);
    if (!side) return;
    const [x0, x1] = side === 'P' ? [L.leftX0, L.leftX1] : [L.rightX0, L.rightX1];
    const { slotW, centerOf } = this.barSlots(x0, x1);
    for (let i = 0; i < this.n; i++) {
      if (Math.abs(p.mouseX - centerOf(i)) <= slotW / 2) {
        this.draggingBar = { side, index: i };
        this.onDrag(p);
        return;
      }
    }
  }

  private onDrag(p: p5): void {
    if (!this.draggingBar) return;
    const L = this.layout(p);
    // Cursor height maps straight to the grabbed bar's probability (chart height = 1).
    const frac = (L.chartBottom - p.mouseY) / L.chartAreaH;
    const target = Math.min(MAX_P, Math.max(MIN_P, frac));

    const { side, index } = this.draggingBar;
    const cur = side === 'P' ? this.P : this.Q;
    const others = cur.reduce((s, v, j) => (j === index ? s : s + v), 0);
    // Hold the grabbed bar at `target`; scale the rest to fill the remaining 1 − target,
    // preserving their relative shape (Σ = 1). If the rest have collapsed, spread evenly.
    const next = cur.map((v, j) => {
      if (j === index) return target;
      return others > 1e-9 ? (v * (1 - target)) / others : (1 - target) / (this.n - 1);
    });
    if (side === 'P') this.pRaw = next; else this.qRaw = next;
    this.updateReadout();
  }

  // --- DOM controls ---

  private setupUI(): void {
    const panel = this.createControlPanel();

    const row = this.makeRow();
    row.appendChild(this.makeLabel('n:'));
    row.appendChild(this.makeSelect(
      [2, 3, 4, 5].map((k) => ({ value: String(k), label: String(k) })),
      String(this.n),
      (v) => this.setN(parseInt(v, 10)),
    ));
    row.appendChild(this.makeLabel('units:'));
    row.appendChild(this.makeSelect(
      BASES.map((b, i) => ({ value: String(i), label: b.label })),
      '0',
      (v) => { this.base = BASES[parseInt(v, 10)]; this.updateReadout(); },
    ));
    row.appendChild(this.makeBtn('Reset', () => { this.resetDistributions(); this.updateReadout(); }));
    row.appendChild(this.makeBtn('Q := P', () => { this.qRaw = this.pRaw.slice(); this.updateReadout(); }));
    panel.appendChild(row);

    this.readoutEl = document.createElement('div');
    this.readoutEl.style.fontFamily = 'var(--font-mono, monospace)';
    this.readoutEl.style.marginTop = 'var(--spacing-sm, 0.5rem)';
    this.readoutEl.style.lineHeight = '1.5';
    panel.appendChild(this.readoutEl);
  }

  private setN(n: number): void {
    this.n = n;
    this.resetDistributions();
    this.draggingBar = null;
    this.updateReadout();
  }

  private updateReadout(): void {
    if (!this.readoutEl) return;
    const P = this.P;
    const Q = this.Q;
    const b = this.base.value;
    const unit = this.base.unit;
    const dPQ = klDivergence(P, Q, b);
    const dQP = klDivergence(Q, P, b);
    const hP = entropy(P, b);
    const hPQ = crossEntropy(P, Q, b);

    this.readoutEl.innerHTML = '';

    // Prominent D(P‖Q)
    const main = document.createElement('div');
    main.style.fontWeight = 'bold';
    main.style.fontSize = 'var(--font-size-lg, 1.1rem)';
    main.textContent = `D(P‖Q) = ${dPQ.toFixed(3)} ${unit}`;
    this.readoutEl.append(main);

    // Reverse divergence + asymmetry note
    const rev = document.createElement('div');
    const asym = Math.abs(dPQ - dQP) > 1e-3;
    rev.append(document.createTextNode(`D(Q‖P) = ${dQP.toFixed(3)} ${unit}`));
    if (asym) {
      const tag = document.createElement('span');
      tag.style.color = this.mutedColor;
      tag.textContent = '   — asymmetric: D(P‖Q) ≠ D(Q‖P)';
      rev.append(tag);
    }
    this.readoutEl.append(rev);

    // Decomposition D(P‖Q) = H(P,Q) − H(P)
    const decomp = document.createElement('div');
    decomp.style.color = this.mutedColor;
    decomp.textContent =
      `= H(P,Q) − H(P) = ${hPQ.toFixed(3)} − ${hP.toFixed(3)} ${unit}   (cross-entropy − entropy)`;
    this.readoutEl.append(decomp);

    // Blow-up caption: Q ≈ 0 where P is non-trivial ⇒ D → ∞
    const blow = P.some((p, i) => p > 0.05 && Q[i] < 0.02);
    const note = document.createElement('div');
    if (blow) {
      note.style.color = this.qColor;
      note.style.fontWeight = 'bold';
      note.textContent = 'Q ≈ 0 where P > 0  ⇒  D(P‖Q) → ∞';
    } else if (dPQ < 1e-6) {
      note.style.color = this.pColor;
      note.textContent = 'P = Q  ⇒  D(P‖Q) = 0  (Gibbs’ inequality: D ≥ 0, equality iff P = Q)';
    } else {
      note.style.color = this.mutedColor;
      note.textContent = 'Drag the P or Q bars to change the distributions.';
    }
    this.readoutEl.append(note);
  }

  protected onColorSchemeChange(): void {
    this.updateReadout();
  }

  // --- DOM helpers (same pattern as stochastic-matrix.ts) ---

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
  return new RelativeEntropyDemo(container, config).init();
}
