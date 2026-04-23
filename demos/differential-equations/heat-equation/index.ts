// 1D heat equation demo. See docs/superpowers/specs/2026-04-23-heat-equation-demo-design.md.

import p5 from 'p5';
import { P5DemoBase, createSelect, createControlRow } from '@framework';
import type { DemoConfig, DemoInstance, DemoMetadata, CanvasSize } from '@framework';
import {
  computeCoefficients,
  evaluate,
  slowestNonzeroEigenvalue,
  DEFAULT_N_MODES,
  type BC,
  type Coeffs,
} from './solver';
import { IC_SPECS, normalize, type ICName } from './initial-conditions';
import { temperatureToColor } from './colormap';

export const metadata: DemoMetadata = {
  title: 'Heat Equation on a Wire',
  category: 'Differential Equations',
  description: 'Analytic solution of the 1D heat equation with selectable initial and boundary conditions.',
  instructions: 'Choose an initial condition and boundary condition; scrub or play to watch heat diffuse.',
};

const L = 1;
const N_X = 400;
const LN_100 = Math.log(100);

// Wall-clock pacing: at α=1 with Dirichlet BC, full visible decay (mode 1 shrinks to 1%)
// occurs at t_sim = ln(100)/π². We want that to unfold in ~40 wall-clock seconds.
const DEFAULT_DECAY_WALL_SECONDS = 40;
const SIM_PER_WALL_S = (LN_100 / Math.PI ** 2) / DEFAULT_DECAY_WALL_SECONDS;

const DEFAULT_ALPHA = 1.0;
const MIN_ALPHA = 0.2;
const MAX_ALPHA = 3.0;
const ALPHA_STEP = 0.05;

class HeatEquationDemo extends P5DemoBase {
  private bc: BC = 'dirichlet';
  private icName: ICName = 'gaussian';
  private mode: number = 1;
  private seed: number = 0xC0FFEE;
  private alpha: number = DEFAULT_ALPHA;

  private coeffs!: Coeffs;
  private xs!: Float64Array;
  private uBuffer!: Float64Array;

  private tSim: number = 0;
  private playing: boolean = true;
  private lastFrameMs: number = 0;

  private scrubberSlider?: p5.Element;
  private alphaSlider?: p5.Element;
  private modeSlider?: p5.Element;
  private scrubberLabelEl?: HTMLElement;
  private alphaLabelEl?: HTMLElement;
  private modeRowEl?: HTMLElement;
  private playPauseButton?: HTMLButtonElement;
  private scrubbing: boolean = false;

  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
  }

  protected getStylePrefix(): string { return 'heat-equation'; }
  protected getAspectRatio(): number { return 0.6; }
  protected getMaxHeightPercent(): number { return 0.65; }

  protected createSketch(p: p5): void {
    p.setup = () => {
      this.setupGrid();
      this.rebuildCoefficients();
      this.setupControls(p);
      this.lastFrameMs = p.millis();
      p.noStroke();
    };

    p.draw = () => {
      const now = p.millis();
      const dtMs = this.lastFrameMs === 0 ? 0 : now - this.lastFrameMs;
      this.lastFrameMs = now;

      const tMax = this.getTMax();
      if (this.playing && !this.scrubbing) {
        this.tSim += (dtMs / 1000) * SIM_PER_WALL_S;
        if (this.tSim >= tMax) {
          this.tSim = tMax;
          this.playing = false;
          this.updatePlayPauseLabel();
        }
      }

      evaluate(this.coeffs, this.xs, this.tSim, this.alpha, this.uBuffer);

      p.background(this.colors.background);
      this.renderEquation(p);
      this.renderStrip(p);
      this.renderLinePlot(p);

      if (!this.scrubbing && this.scrubberSlider) {
        this.scrubberSlider.value(this.tSim / tMax);
      }
      this.updateTimeLabel();
    };
  }

  protected onResize(_p: p5, _size: CanvasSize): void {}

  protected onColorSchemeChange(_isDark: boolean): void {}

  private setupGrid(): void {
    this.xs = new Float64Array(N_X);
    for (let i = 0; i < N_X; i++) this.xs[i] = (i / (N_X - 1)) * L;
    this.uBuffer = new Float64Array(N_X);
  }

  // Sim-time at which the slowest nonzero mode has decayed to 1% (independent of α;
  // α affects how fast this sim-time is "spent" via the decay exponent inside evaluate()).
  private getTMax(): number {
    return LN_100 / slowestNonzeroEigenvalue(this.bc, L);
  }

  private rebuildCoefficients(): void {
    const spec = IC_SPECS.find((s) => s.name === this.icName)!;
    const rawIc = spec.build({ mode: this.mode, bc: this.bc, seed: this.seed });
    const ic = normalize(rawIc);
    this.coeffs = computeCoefficients(ic, this.bc, L, DEFAULT_N_MODES);
    this.tSim = 0;
    this.playing = true;
    this.lastFrameMs = 0;
    this.updatePlayPauseLabel();
  }

  private setupControls(p: p5): void {
    const panel = this.createControlPanel();

    const icSelect = createSelect<ICName>(
      'Initial condition',
      IC_SPECS.map((s) => ({ value: s.name, label: s.label })),
      this.icName,
      (value) => {
        this.icName = value;
        this.updateModeRowVisibility();
        this.rebuildCoefficients();
      },
      this.getStylePrefix()
    );

    const bcSelect = createSelect<BC>(
      'Boundary',
      [
        { value: 'dirichlet', label: 'Dirichlet (fixed ends)' },
        { value: 'neumann', label: 'Neumann (insulated)' },
        { value: 'periodic', label: 'Periodic (loop)' },
      ],
      this.bc,
      (value) => {
        this.bc = value;
        this.rebuildCoefficients();
      },
      this.getStylePrefix()
    );

    this.playPauseButton = this.createButton('Pause', () => {
      this.playing = !this.playing;
      if (this.playing && this.tSim >= this.getTMax()) this.tSim = 0;
      this.updatePlayPauseLabel();
    });

    const resetBtn = this.createButton('Reset', () => {
      this.tSim = 0;
      this.playing = true;
      this.updatePlayPauseLabel();
    });

    const topRow = createControlRow([icSelect, bcSelect, this.playPauseButton, resetBtn], { gap: '16px' });
    panel.appendChild(topRow);

    this.scrubberSlider = this.createSlider(p, 'Time', 0, 1, 0, 0.001, () => {
      const v = Number(this.scrubberSlider!.value());
      this.scrubbing = true;
      this.tSim = v * this.getTMax();
      this.playing = false;
      this.updatePlayPauseLabel();
    });
    this.scrubberLabelEl = this.findLabelForSlider(this.scrubberSlider);
    this.addEventListener(window, 'mouseup', () => { this.scrubbing = false; });
    this.addEventListener(window, 'touchend', () => { this.scrubbing = false; });

    this.alphaSlider = this.createSlider(
      p, 'Decay rate α', MIN_ALPHA, MAX_ALPHA, DEFAULT_ALPHA, ALPHA_STEP,
      () => {
        this.alpha = Number(this.alphaSlider!.value());
        this.updateAlphaLabel();
      }
    );
    this.alphaLabelEl = this.findLabelForSlider(this.alphaSlider);
    this.updateAlphaLabel();

    this.modeSlider = this.createSlider(p, 'Sine mode n', 1, 8, this.mode, 1, () => {
      this.mode = Number(this.modeSlider!.value());
      if (this.icName === 'sine') this.rebuildCoefficients();
    });
    this.modeRowEl = this.modeSlider.elt.parentElement as HTMLElement;
    this.modeRowEl.classList.add('heat-equation-mode-row');
    this.updateModeRowVisibility();
  }

  private findLabelForSlider(slider: p5.Element): HTMLElement | undefined {
    const row = slider.elt.parentElement;
    return row?.querySelector('.label') as HTMLElement | undefined;
  }

  private updateTimeLabel(): void {
    if (this.scrubberLabelEl) {
      this.scrubberLabelEl.textContent = `Time t = ${this.tSim.toFixed(3)} s`;
    }
  }

  private updateAlphaLabel(): void {
    if (this.alphaLabelEl) {
      this.alphaLabelEl.textContent = `Decay rate α = ${this.alpha.toFixed(2)}`;
    }
  }

  private updateModeRowVisibility(): void {
    if (!this.modeRowEl) return;
    const spec = IC_SPECS.find((s) => s.name === this.icName)!;
    this.modeRowEl.classList.toggle('heat-equation-hidden', !spec.usesMode);
  }

  private updatePlayPauseLabel(): void {
    if (this.playPauseButton) {
      this.playPauseButton.textContent = this.playing ? 'Pause' : 'Play';
    }
  }

  private renderEquation(p: p5): void {
    p.push();
    p.fill(this.colors.text);
    p.noStroke();
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(20);

    const pde = `uₜ = ${this.alpha.toFixed(2)} · uₓₓ`;
    const ic = this.getICEquationText();
    const bc = this.getBCEquationText();
    const y0 = 4;
    const gap = 32;
    let x = 8;
    p.text(pde, x, y0);
    x += p.textWidth(pde) + gap;
    p.text(ic, x, y0);
    x += p.textWidth(ic) + gap;
    p.text(bc, x, y0);

    p.pop();
  }

  private getICEquationText(): string {
    switch (this.icName) {
      case 'gaussian':
        return 'u(x, 0) = exp(−((x − 0.5)/0.1)²)';
      case 'two-gaussians':
        return 'u(x, 0) = exp(−((x − 0.3)/0.08)²) − exp(−((x − 0.7)/0.08)²)';
      case 'square':
        return 'u(x, 0) = 1 on [0.35, 0.65], 0 elsewhere';
      case 'sine': {
        const k = this.bc === 'periodic' ? 2 * this.mode : this.mode;
        const coef = k === 1 ? '' : `${k}`;
        return `u(x, 0) = sin(${coef}πx)`;
      }
      case 'random':
        return 'u(x, 0) = random piecewise-constant noise';
    }
  }

  private getBCEquationText(): string {
    switch (this.bc) {
      case 'dirichlet': return 'u(0, t) = u(1, t) = 0';
      case 'neumann':   return 'uₓ(0, t) = uₓ(1, t) = 0';
      case 'periodic':  return 'u(0, t) = u(1, t)';
    }
  }

  private renderStrip(p: p5): void {
    const w = p.width;
    const h = p.height;
    const stripTop = 36;
    const stripHeight = Math.floor((h - stripTop - 20) * 0.42);

    for (let px = 0; px < w; px++) {
      const x = (px / (w - 1)) * L;
      const u = this.sampleU(x);
      p.fill(temperatureToColor(p, u, this.isDarkMode));
      p.rect(px, stripTop, 1, stripHeight);
    }

    if (this.bc === 'periodic') {
      p.fill(this.colors.foreground);
      p.rect(0, stripTop, 2, stripHeight);
      p.rect(w - 2, stripTop, 2, stripHeight);
    }
  }

  private renderLinePlot(p: p5): void {
    const w = p.width;
    const h = p.height;
    const stripTop = 36;
    const stripHeight = Math.floor((h - stripTop - 20) * 0.42);
    const plotTop = stripTop + stripHeight + 16;
    const plotBottom = h - 10;
    const plotMid = (plotTop + plotBottom) / 2;
    const plotHalfHeight = (plotBottom - plotTop) / 2;

    p.stroke(this.colors.axis);
    p.strokeWeight(1);
    p.line(0, plotMid, w, plotMid);
    p.noStroke();

    p.stroke(this.colors.accent);
    p.strokeWeight(2);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < N_X; i++) {
      const px = (i / (N_X - 1)) * w;
      const u = this.uBuffer[i];
      const py = plotMid - u * plotHalfHeight;
      p.vertex(px, py);
    }
    p.endShape();
    p.noStroke();
  }

  private sampleU(x: number): number {
    const f = (x / L) * (N_X - 1);
    const i0 = Math.floor(f);
    const i1 = Math.min(N_X - 1, i0 + 1);
    const t = f - i0;
    return this.uBuffer[i0] * (1 - t) + this.uBuffer[i1] * t;
  }
}

export default function (container: HTMLElement, config?: DemoConfig): DemoInstance {
  return new HeatEquationDemo(container, config).init();
}
