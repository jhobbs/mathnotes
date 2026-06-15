// Information Theory Demo - Self-information and entropy of a Zipfian distribution
// @ts-ignore - plotly.js-dist-min doesn't have types
import Plotly from 'plotly.js-dist-min';
import type { DemoInstance, DemoConfig, DemoMetadata } from '@framework/types';
import { isDarkMode, getCssColors } from '@framework/demo-utils';

interface BaseInfo {
  value: number;        // numeric base
  symbol: string;       // clean display symbol (2, e, 10)
  sub: string;          // subscript form for "log_b"
  unit: string;         // unit name (bits, nats, hartleys)
  label: string;        // selector label
}

const BASES: BaseInfo[] = [
  { value: 2, symbol: '2', sub: '₂', unit: 'bits', label: 'base 2 (bits)' },
  { value: Math.E, symbol: 'e', sub: '<sub>e</sub>', unit: 'nats', label: 'base e (nats)' },
  { value: 10, symbol: '10', sub: '₁₀', unit: 'hartleys', label: 'base 10 (hartleys)' },
];

class ZipfEntropyDemo implements DemoInstance {
  private container!: HTMLElement;
  private controlPanel!: HTMLElement;
  private readout!: HTMLElement;
  private distPlot!: HTMLElement;
  private entropyPlot!: HTMLElement;

  // State
  private N = 12;
  private alpha = 1.0;
  private base: BaseInfo = BASES[0];

  // Controls
  private nSlider!: HTMLInputElement;
  private nValue!: HTMLElement;
  private alphaSlider!: HTMLInputElement;
  private alphaValue!: HTMLElement;

  private isDark = false;
  private colors!: ReturnType<typeof getCssColors>;
  private resizeObserver: ResizeObserver | null = null;
  private plotsInitialized = false;

  private readonly ALPHA_MAX = 10;

  init(container: HTMLElement, config: DemoConfig): void {
    this.container = container;
    this.isDark = isDarkMode(config);
    this.colors = getCssColors(this.isDark);

    this.setupUI();
    this.update();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
  }

  // --- Math ----------------------------------------------------------------

  // Generalized harmonic number Z = sum_{n=1}^{N} n^{-alpha}
  private partition(alpha: number, N: number): number {
    let z = 0;
    for (let n = 1; n <= N; n++) z += Math.pow(n, -alpha);
    return z;
  }

  // Zipfian probabilities p_n proportional to n^{-alpha}
  private probabilities(alpha: number, N: number): number[] {
    const z = this.partition(alpha, N);
    const p: number[] = [];
    for (let n = 1; n <= N; n++) p.push(Math.pow(n, -alpha) / z);
    return p;
  }

  // log in the chosen base
  private log(x: number): number {
    return Math.log(x) / Math.log(this.base.value);
  }

  // Entropy H = -sum p log_b p
  private entropy(p: number[]): number {
    let h = 0;
    for (const pi of p) {
      if (pi > 0) h -= pi * this.log(pi);
    }
    return h;
  }

  // --- UI ------------------------------------------------------------------

  private setupUI(): void {
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.gap = 'var(--spacing-md, 1rem)';
    this.container.style.padding = 'var(--spacing-md, 1rem)';

    this.controlPanel = document.createElement('div');
    this.controlPanel.style.display = 'flex';
    this.controlPanel.style.flexDirection = 'column';
    this.controlPanel.style.gap = 'var(--spacing-md, 1rem)';
    this.controlPanel.style.padding = 'var(--spacing-md, 1rem)';
    this.controlPanel.style.backgroundColor = this.isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.05)';
    this.controlPanel.style.borderRadius = 'var(--radius-md, 0.5rem)';

    // Sliders row
    const slidersRow = document.createElement('div');
    slidersRow.style.display = 'flex';
    slidersRow.style.gap = 'var(--spacing-lg, 1.5rem)';
    slidersRow.style.alignItems = 'center';
    slidersRow.style.flexWrap = 'wrap';

    // N slider
    const { wrapper: nWrap, slider: nSlider, value: nValue } = this.createSlider(
      'N (symbols)', 1, 50, this.N, 1, () => {
        this.N = parseInt(this.nSlider.value, 10);
        this.nValue.textContent = String(this.N);
        this.update();
      });
    this.nSlider = nSlider;
    this.nValue = nValue;
    slidersRow.appendChild(nWrap);

    // alpha slider
    const { wrapper: aWrap, slider: aSlider, value: aValue } = this.createSlider(
      'α (skew)', 0, this.ALPHA_MAX, this.alpha, 0.01, () => {
        this.alpha = parseFloat(this.alphaSlider.value);
        this.alphaValue.textContent = this.alpha.toFixed(2);
        this.update();
      });
    this.alphaSlider = aSlider;
    this.alphaValue = aValue;
    slidersRow.appendChild(aWrap);

    // base selector
    slidersRow.appendChild(this.createBaseSelector());

    this.controlPanel.appendChild(slidersRow);

    // Readout
    this.readout = document.createElement('div');
    this.readout.style.fontSize = '0.95em';
    this.readout.style.lineHeight = '1.6';
    this.controlPanel.appendChild(this.readout);

    this.container.appendChild(this.controlPanel);

    // Plots
    this.distPlot = document.createElement('div');
    this.distPlot.style.width = '100%';
    this.distPlot.style.minHeight = '360px';
    this.container.appendChild(this.distPlot);

    this.entropyPlot = document.createElement('div');
    this.entropyPlot.style.width = '100%';
    this.entropyPlot.style.minHeight = '320px';
    this.container.appendChild(this.entropyPlot);
  }

  private createSlider(
    label: string, min: number, max: number, value: number, step: number, onInput: () => void
  ): { wrapper: HTMLElement; slider: HTMLInputElement; value: HTMLElement } {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '0.25rem';
    wrapper.style.minWidth = '220px';
    wrapper.style.flex = '1';

    const labelRow = document.createElement('div');
    labelRow.style.display = 'flex';
    labelRow.style.justifyContent = 'space-between';
    labelRow.style.alignItems = 'baseline';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.style.fontWeight = 'bold';

    const valueEl = document.createElement('span');
    valueEl.textContent = step < 1 ? value.toFixed(2) : String(value);
    valueEl.style.fontFamily = 'var(--font-mono, monospace)';
    valueEl.style.opacity = '0.85';

    labelRow.appendChild(labelEl);
    labelRow.appendChild(valueEl);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = String(min);
    slider.max = String(max);
    slider.step = String(step);
    slider.value = String(value);
    slider.style.width = '100%';
    slider.addEventListener('input', onInput);
    // Keep arrow keys local to the slider
    slider.addEventListener('keydown', (e) => {
      if (e.key.startsWith('Arrow')) e.stopPropagation();
    });

    wrapper.appendChild(labelRow);
    wrapper.appendChild(slider);

    return { wrapper, slider, value: valueEl };
  }

  private createBaseSelector(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '0.25rem';

    const labelEl = document.createElement('label');
    labelEl.textContent = 'log base';
    labelEl.style.fontWeight = 'bold';

    const select = document.createElement('select');
    select.style.padding = '0.25rem 0.5rem';
    select.style.borderRadius = '0.25rem';
    select.style.border = '1px solid var(--color-border, #ccc)';
    select.style.background = this.isDark ? 'rgba(255,255,255,0.1)' : 'white';
    select.style.color = 'var(--color-text, inherit)';

    BASES.forEach((b, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = b.label;
      select.appendChild(opt);
    });
    select.value = '0';
    select.addEventListener('change', () => {
      this.base = BASES[parseInt(select.value, 10)];
      this.update();
    });

    wrapper.appendChild(labelEl);
    wrapper.appendChild(select);
    return wrapper;
  }

  // --- Update / render -----------------------------------------------------

  private update(): void {
    const p = this.probabilities(this.alpha, this.N);
    const ranks = p.map((_, i) => i + 1);
    const selfInfo = p.map((pi) => -this.log(pi));
    const H = this.entropy(p);
    const Hmax = this.log(this.N);
    const efficiency = Hmax > 0 ? H / Hmax : 1;
    const perplexity = Math.pow(this.base.value, H);

    this.renderReadout(H, Hmax, efficiency, perplexity, p);
    this.renderDistribution(ranks, p, selfInfo, H);
    this.renderEntropyCurve(H);
  }

  private renderReadout(
    H: number, Hmax: number, efficiency: number, perplexity: number, p: number[]
  ): void {
    const u = this.base.unit;
    const accent = this.colors.accent;
    this.readout.innerHTML = `
      <div style="display: flex; gap: 1.5rem 2rem; flex-wrap: wrap; align-items: baseline;">
        <span><strong style="color:${accent}">H(X) = ${H.toFixed(3)} ${u}</strong>
          &nbsp;<span style="opacity:0.7">(average self-information per symbol)</span></span>
        <span>H<sub>max</sub> = log${this.base.sub} ${this.N} = ${Hmax.toFixed(3)} ${u}</span>
        <span>efficiency H/H<sub>max</sub> = ${(efficiency * 100).toFixed(1)}%</span>
        <span>perplexity = ${this.base.symbol}<sup>H</sup> = ${perplexity.toFixed(2)} symbols</span>
        <span>p(1) = ${(p[0] * 100).toFixed(1)}%</span>
      </div>`;
  }

  private renderDistribution(
    ranks: number[], p: number[], selfInfo: number[], H: number
  ): void {
    const data: any[] = [
      {
        type: 'bar',
        x: ranks,
        y: p,
        name: 'probability p(n)',
        marker: { color: this.colors.accent },
        yaxis: 'y',
        hovertemplate: 'rank %{x}<br>p = %{y:.4f}<extra></extra>',
      },
      {
        type: 'scatter',
        mode: 'lines+markers',
        x: ranks,
        y: selfInfo,
        name: `self-information I(n)`,
        marker: { color: this.colors.warning, size: 6 },
        line: { color: this.colors.warning, width: 2 },
        yaxis: 'y2',
        hovertemplate: `rank %{x}<br>I = %{y:.3f} ${this.base.unit}<extra></extra>`,
      },
    ];

    const layout = {
      ...this.baseLayout(),
      title: {
        text: `Distribution & self-information  (H = ${H.toFixed(3)} ${this.base.unit})`,
        font: { size: 14 },
      },
      bargap: 0.15,
      xaxis: { ...this.axis(), title: 'symbol rank n', dtick: this.N > 25 ? 5 : 1 },
      yaxis: { ...this.axis(), title: 'probability p(n)', rangemode: 'tozero' },
      yaxis2: {
        ...this.axis(),
        title: `self-information (${this.base.unit})`,
        overlaying: 'y',
        side: 'right',
        rangemode: 'tozero',
        showgrid: false,
      },
      legend: { ...this.legend(), x: 0.5, y: 1.0, xanchor: 'center', orientation: 'h' },
    };

    this.draw(this.distPlot, data, layout);
  }

  private renderEntropyCurve(currentH: number): void {
    const steps = 150;
    const alphas: number[] = [];
    const Hs: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * this.ALPHA_MAX;
      alphas.push(a);
      Hs.push(this.entropy(this.probabilities(a, this.N)));
    }
    const Hmax = this.log(this.N);

    const data: any[] = [
      {
        type: 'scatter',
        mode: 'lines',
        x: alphas,
        y: Hs,
        name: 'H(α)',
        line: { color: this.colors.accent, width: 2.5 },
        hovertemplate: `α = %{x:.2f}<br>H = %{y:.3f} ${this.base.unit}<extra></extra>`,
      },
      {
        type: 'scatter',
        mode: 'markers',
        x: [this.alpha],
        y: [currentH],
        name: 'current α',
        marker: { color: this.colors.error, size: 12, symbol: 'circle' },
        hovertemplate: `α = %{x:.2f}<br>H = %{y:.3f} ${this.base.unit}<extra></extra>`,
      },
      {
        type: 'scatter',
        mode: 'lines',
        x: [0, this.ALPHA_MAX],
        y: [Hmax, Hmax],
        name: `H<sub>max</sub> = log ${this.N}`,
        line: { color: this.colors.axis, width: 1, dash: 'dash' },
        hoverinfo: 'skip',
      },
    ];

    const layout = {
      ...this.baseLayout(),
      title: {
        text: `Entropy vs. skew α  (N = ${this.N})`,
        font: { size: 14 },
      },
      xaxis: { ...this.axis(), title: 'α  (0 = uniform, larger = more skewed)' },
      yaxis: { ...this.axis(), title: `entropy H (${this.base.unit})`, rangemode: 'tozero' },
      legend: { ...this.legend(), x: 0.98, y: 0.98, xanchor: 'right' },
    };

    this.draw(this.entropyPlot, data, layout);
  }

  // --- Plotly helpers ------------------------------------------------------

  private baseLayout() {
    return {
      paper_bgcolor: 'transparent',
      plot_bgcolor: this.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.9)',
      font: { color: this.isDark ? '#fff' : '#000' },
      margin: { l: 60, r: 60, t: 50, b: 55 },
      hovermode: 'closest',
      showlegend: true,
    };
  }

  private axis() {
    return {
      gridcolor: this.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      zerolinecolor: this.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
    };
  }

  private legend() {
    return {
      bgcolor: this.isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)',
      bordercolor: this.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
      borderwidth: 1,
    };
  }

  private draw(el: HTMLElement, data: any[], layout: any): void {
    const config = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
    };
    if (!this.plotsInitialized) {
      Plotly.newPlot(el, data, layout, config);
    } else {
      Plotly.react(el, data, layout, config);
    }
  }

  // --- Lifecycle -----------------------------------------------------------

  resize(): void {
    if (this.distPlot) Plotly.Plots.resize(this.distPlot);
    if (this.entropyPlot) Plotly.Plots.resize(this.entropyPlot);
  }

  cleanup(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.distPlot) Plotly.purge(this.distPlot);
    if (this.entropyPlot) Plotly.purge(this.entropyPlot);
  }
}

export const metadata: DemoMetadata = {
  title: 'Self-Information & Entropy (Zipfian)',
  category: 'Information Theory',
  description:
    'Interactive exploration of self-information and entropy for a discrete alphabet whose symbols follow a Zipfian distribution p(n) ∝ n^(-α). Adjust the number of symbols N and the skew α to see how the per-symbol self-information and the overall entropy respond.',
};

export default function initZipfEntropyDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new ZipfEntropyDemo();
  demo.init(container, config || {});
  return demo;
}
