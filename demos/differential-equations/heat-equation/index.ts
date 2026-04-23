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
const ALPHA = 1;
const N_X = 400;
const LN_100 = Math.log(100);

const DEFAULT_DURATION_S = 20;
const MIN_DURATION_S = 5;
const MAX_DURATION_S = 60;

class HeatEquationDemo extends P5DemoBase {
  private bc: BC = 'dirichlet';
  private icName: ICName = 'gaussian';
  private mode: number = 1;
  private seed: number = 0xC0FFEE;

  private coeffs!: Coeffs;
  private xs!: Float64Array;
  private uBuffer!: Float64Array;

  private tSim: number = 0;
  private playing: boolean = true;
  private lastFrameMs: number = 0;
  private durationS: number = DEFAULT_DURATION_S;

  private scrubberSlider?: p5.Element;
  private speedSlider?: p5.Element;
  private modeSlider?: p5.Element;
  private modeRowEl?: HTMLElement;
  private playPauseButton?: HTMLButtonElement;
  private scrubbing: boolean = false;

  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
  }

  protected getStylePrefix(): string { return 'heat-equation'; }
  protected getAspectRatio(): number { return 0.5; }
  protected getMaxHeightPercent(): number { return 0.55; }

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
        this.tSim += (dtMs / 1000) * (tMax / this.durationS);
        if (this.tSim >= tMax) {
          this.tSim = tMax;
          this.playing = false;
          this.updatePlayPauseLabel();
        }
      }

      evaluate(this.coeffs, this.xs, this.tSim, ALPHA, this.uBuffer);

      p.background(this.colors.background);
      this.renderStrip(p);
      this.renderLinePlot(p);

      if (!this.scrubbing && this.scrubberSlider) {
        this.scrubberSlider.value(this.tSim / tMax);
      }
    };
  }

  protected onResize(_p: p5, _size: CanvasSize): void {
    // Render resolution is tied to canvas width per-frame; nothing to rebuild.
  }

  protected onColorSchemeChange(_isDark: boolean): void {
    // Colors are re-read per-frame via this.colors (refreshed by updateColors),
    // and the colormap midpoint uses this.isDarkMode directly.
  }

  private setupGrid(): void {
    this.xs = new Float64Array(N_X);
    for (let i = 0; i < N_X; i++) this.xs[i] = (i / (N_X - 1)) * L;
    this.uBuffer = new Float64Array(N_X);
  }

  private getTMax(): number {
    return LN_100 / (ALPHA * slowestNonzeroEigenvalue(this.bc, L));
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
    this.addEventListener(window, 'mouseup', () => { this.scrubbing = false; });
    this.addEventListener(window, 'touchend', () => { this.scrubbing = false; });

    this.speedSlider = this.createSlider(
      p, 'Decay over (s)', MIN_DURATION_S, MAX_DURATION_S, DEFAULT_DURATION_S, 1,
      () => { this.durationS = Number(this.speedSlider!.value()); }
    );

    this.modeSlider = this.createSlider(p, 'Sine mode n', 1, 8, this.mode, 1, () => {
      this.mode = Number(this.modeSlider!.value());
      if (this.icName === 'sine') this.rebuildCoefficients();
    });
    this.modeRowEl = this.modeSlider.elt.parentElement as HTMLElement;
    this.modeRowEl.classList.add('heat-equation-mode-row');
    this.updateModeRowVisibility();
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

  private renderStrip(p: p5): void {
    const w = p.width;
    const h = p.height;
    const stripTop = 10;
    const stripHeight = Math.floor(h * 0.35);

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
    const plotTop = Math.floor(h * 0.45);
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
