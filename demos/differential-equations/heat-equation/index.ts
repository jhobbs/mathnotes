// 1D heat equation demo. See docs/superpowers/specs/2026-04-23-heat-equation-demo-design.md.

import p5 from 'p5';
import { P5DemoBase, createSelect, createControlRow } from '@framework';
import type { DemoConfig, DemoInstance, DemoMetadata, CanvasSize } from '@framework';
import {
  computeCoefficients,
  slowestNonzeroEigenvalue,
  Stepper,
  type StepperSnapshot,
  DEFAULT_N_MODES,
  type BC,
  type Coeffs,
  type ICFn,
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
const MIN_ALPHA = 0;
const MAX_ALPHA = 3.0;
const ALPHA_STEP = 0.01;

const SOURCE_SIGMA = 0.05;
const CHECKPOINT_INTERVAL_S = 0.003;
const MAX_INTEGRATION_DT = 0.002;
const MAX_OMEGA = 500;
// For piecewise-constant ETD to resolve the forcing, we want ω·dt ≲ ω_SAFE_PRODUCT,
// so at high ω we sub-step more aggressively.
const OMEGA_DT_SAFETY = 0.1;

class HeatEquationDemo extends P5DemoBase {
  private bc: BC = 'dirichlet';
  private icName: ICName = 'gaussian';
  private mode: number = 1;
  private seed: number = (Math.random() * 0xFFFFFFFF) >>> 0;
  private alpha: number = DEFAULT_ALPHA;
  private tempLeft: number = 0;
  private tempRight: number = 0;

  // Dynamic-forcing state (Dirichlet only).
  private leftAmp: number = 0;
  private leftOmega: number = 10;
  private sourceAmp: number = 0;
  private sourceOmega: number = 0;
  private sourceX0: number = 0.5;

  // Solver state — all BCs now use the unified stepper (sine / cosine / mean modes).
  private coeffs!: Coeffs;
  private stepper?: Stepper;
  // Source projection: coefficients of the spatial profile in the current BC's eigenbasis.
  private sourceCoeffs?: Coeffs;
  // Projection of (1 − x/L) onto the Dirichlet sine basis — 2/(nπ). Only used when BC is
  // Dirichlet with left-end oscillation.
  private bcLeftProjection!: Float64Array;
  private qSineBuffer!: Float64Array;
  private qCosineBuffer!: Float64Array;
  private qMeanValue: number = 0;
  private checkpoints: Array<{ t: number; snap: StepperSnapshot }> = [];
  private lastCheckpointT: number = -Infinity;
  // For the on-canvas solution display: the initial sine-basis coefficients of the
  // Dirichlet residual IC (before evolution). Populated on every rebuild.
  private dirichletInitialSines?: Float64Array;

  private xs!: Float64Array;
  private uBuffer!: Float64Array;

  private tSim: number = 0;
  private scrubberMax: number = 0;
  private playing: boolean = true;
  private lastFrameMs: number = 0;

  private scrubberSlider?: p5.Element;
  private alphaSlider?: p5.Element;
  private modeSlider?: p5.Element;
  private tempLeftSlider?: p5.Element;
  private tempRightSlider?: p5.Element;
  private leftAmpSlider?: p5.Element;
  private leftOmegaSlider?: p5.Element;
  private sourceAmpSlider?: p5.Element;
  private sourceX0Slider?: p5.Element;
  private sourceOmegaSlider?: p5.Element;

  private scrubberLabelEl?: HTMLElement;
  private alphaLabelEl?: HTMLElement;
  private tempLeftLabelEl?: HTMLElement;
  private tempRightLabelEl?: HTMLElement;
  private leftAmpLabelEl?: HTMLElement;
  private leftOmegaLabelEl?: HTMLElement;
  private sourceAmpLabelEl?: HTMLElement;
  private sourceX0LabelEl?: HTMLElement;
  private sourceOmegaLabelEl?: HTMLElement;

  private modeRowEl?: HTMLElement;
  private tempLeftRowEl?: HTMLElement;
  private tempRightRowEl?: HTMLElement;
  private leftAmpRowEl?: HTMLElement;
  private leftOmegaRowEl?: HTMLElement;
  private sourceAmpRowEl?: HTMLElement;
  private sourceX0RowEl?: HTMLElement;
  private sourceOmegaRowEl?: HTMLElement;

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
      this.setupStepperInvariants();
      this.rebuildCoefficients();
      this.setupControls(p);
      this.lastFrameMs = p.millis();
      p.noStroke();
    };

    p.draw = () => {
      const now = p.millis();
      const dtMs = this.lastFrameMs === 0 ? 0 : now - this.lastFrameMs;
      this.lastFrameMs = now;

      if (this.playing && !this.scrubbing) {
        this.tSim += (dtMs / 1000) * SIM_PER_WALL_S;
      }

      // Grow the scrubber's range when the playhead would fall off its right edge,
      // so the slider always covers all visited time with some headroom.
      if (this.tSim > this.scrubberMax) {
        this.scrubberMax = this.tSim * 1.5;
      }

      this.advanceSimulation();

      p.background(this.colors.background);
      this.renderEquation(p);
      this.renderStrip(p);
      this.renderLinePlot(p);

      if (!this.scrubbing && this.scrubberSlider) {
        this.scrubberSlider.value(this.tSim / this.scrubberMax);
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
    this.qSineBuffer = new Float64Array(DEFAULT_N_MODES);
    this.qCosineBuffer = new Float64Array(DEFAULT_N_MODES);
  }

  private setupStepperInvariants(): void {
    // c_n^{BC,L} = (2/L) ∫_0^L (1 − x/L) sin(nπx/L) dx = 2/(nπ) — projection of the
    // left-end BC "bump shape" onto the Dirichlet sine basis.
    this.bcLeftProjection = new Float64Array(DEFAULT_N_MODES);
    for (let n = 1; n <= DEFAULT_N_MODES; n++) {
      this.bcLeftProjection[n - 1] = 2 / (n * Math.PI);
    }
  }

  // Sim-time at which the slowest nonzero mode has decayed to 1% (independent of α;
  // α affects how fast this sim-time is "spent" via the decay exponent inside evaluate()).
  private getTMax(): number {
    return LN_100 / slowestNonzeroEigenvalue(this.bc, L);
  }

  // Full rebuild: called on IC/BC/mode/tempLeft/tempRight changes and Reset. Resets to t=0.
  private rebuildCoefficients(): void {
    const spec = IC_SPECS.find((s) => s.name === this.icName)!;
    const rawIc = spec.build({ mode: this.mode, bc: this.bc, seed: this.seed });
    const ic = normalize(rawIc);

    // For non-zero Dirichlet we split u = U(x, t) + v(x, t) where U is the time-varying
    // linear interpolant satisfying the inhomogeneous BCs. The stepper tracks v, whose
    // initial condition is the residual f(x) − steadyLinear(x). For other BCs, the
    // stepper tracks u directly (no BC-interpolant).
    const effectiveIc: ICFn =
      this.bc === 'dirichlet'
        ? (x) => ic(x) - this.steadyStateLinear(x)
        : ic;
    this.coeffs = computeCoefficients(effectiveIc, this.bc, L, DEFAULT_N_MODES);

    if (this.bc === 'dirichlet') {
      this.dirichletInitialSines = new Float64Array(this.coeffs.sineCoeffs);
    } else {
      this.dirichletInitialSines = undefined;
    }

    if (!this.stepper || this.stepper.bc !== this.bc) {
      this.stepper = new Stepper(this.bc, L, DEFAULT_N_MODES);
    }
    this.stepper.resetFromCoeffs(this.coeffs, 0);

    this.refreshSourceProjection();
    this.clearCheckpoints();
    this.addCheckpoint();

    this.tSim = 0;
    this.scrubberMax = this.getTMax();
    this.playing = true;
    this.lastFrameMs = 0;
    this.updatePlayPauseLabel();
  }

  // Soft update: a forcing-parameter slider changed (leftAmp, leftOmega, sourceAmp, sourceOmega,
  // sourceX0). The initial condition and basis are unchanged, so we don't rebuild. We do drop
  // any checkpoints beyond the current time — their trajectory is invalidated — and we recompute
  // the source projection if the source changed.
  private onForcingParamChange(sourceChanged: boolean): void {
    if (sourceChanged) this.refreshSourceProjection();
    while (this.checkpoints.length > 0 && this.checkpoints[this.checkpoints.length - 1].t > this.tSim) {
      this.checkpoints.pop();
    }
    this.lastCheckpointT = this.checkpoints.length > 0
      ? this.checkpoints[this.checkpoints.length - 1].t
      : -Infinity;
  }

  private refreshSourceProjection(): void {
    if (this.sourceAmp === 0) {
      this.sourceCoeffs = undefined;
      return;
    }
    const x0 = this.sourceX0;
    const sigma = SOURCE_SIGMA;
    // Rescale the spatial profile so sourceAmp reads roughly as "peak steady-state
    // temperature at a centered source with α=1" — calibrated against the Dirichlet
    // Green's function. Effect is similar-ish for Neumann/Periodic too.
    const gain = 4 / (sigma * Math.sqrt(Math.PI));
    this.sourceCoeffs = computeCoefficients(
      (x) => gain * Math.exp(-(((x - x0) / sigma) ** 2)),
      this.bc,
      L,
      DEFAULT_N_MODES
    );
  }

  private steadyStateLinear(x: number): number {
    return this.tempLeft + (this.tempRight - this.tempLeft) * (x / L);
  }

  // The full time-varying linear interpolant U(x, t) = steadyLinear(x) + A_L·sin(ω_L t)·(1 − x/L).
  // Used as the "base" that the stepper adds to when reconstructing u.
  private interpolantU(x: number, t: number): number {
    return this.steadyStateLinear(x) + this.leftAmp * Math.sin(this.leftOmega * t) * (1 - x / L);
  }

  private endsAreZero(): boolean {
    return this.tempLeft === 0 && this.tempRight === 0;
  }

  private isDriven(): boolean {
    return this.leftAmp !== 0 || this.sourceAmp !== 0;
  }

  // Fill qSineBuffer / qCosineBuffer / qMeanValue with Q_*(t) — the projection of
  // (P(x, t) − ∂_t U(x, t)) onto the current BC's eigenbasis. ∂_t U is only nontrivial
  // for Dirichlet with non-zero left-end oscillation.
  private computeQn(t: number): void {
    const N = DEFAULT_N_MODES;
    const bcForcing =
      this.bc === 'dirichlet' && this.leftAmp !== 0
        ? -this.leftAmp * this.leftOmega * Math.cos(this.leftOmega * t)
        : 0;
    const srcForcing = this.sourceAmp * Math.cos(this.sourceOmega * t);
    const src = this.sourceCoeffs;

    this.qMeanValue = src && srcForcing !== 0 ? srcForcing * src.mean : 0;

    for (let n = 0; n < N; n++) {
      let qs = 0;
      let qc = 0;
      if (bcForcing !== 0) qs += bcForcing * this.bcLeftProjection[n];
      if (src && srcForcing !== 0) {
        qs += srcForcing * src.sineCoeffs[n];
        qc += srcForcing * src.cosineCoeffs[n];
      }
      this.qSineBuffer[n] = qs;
      this.qCosineBuffer[n] = qc;
    }
  }

  private addCheckpoint(): void {
    if (!this.stepper) return;
    this.checkpoints.push({ t: this.stepper.t, snap: this.stepper.snapshot() });
    this.lastCheckpointT = this.stepper.t;
  }

  private clearCheckpoints(): void {
    this.checkpoints = [];
    this.lastCheckpointT = -Infinity;
  }

  private findCheckpointAtOrBefore(t: number): { t: number; snap: StepperSnapshot } | null {
    const ck = this.checkpoints;
    if (ck.length === 0 || ck[0].t > t) return null;
    let lo = 0, hi = ck.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (ck[mid].t <= t) lo = mid;
      else hi = mid - 1;
    }
    return ck[lo];
  }

  // Drive the simulation to match this.tSim, and fill uBuffer with u(x, tSim).
  private advanceSimulation(): void {
    this.driveStepperTo(this.tSim);
    const base = this.bc === 'dirichlet'
      ? (x: number) => this.interpolantU(x, this.tSim)
      : (_x: number) => 0;
    this.stepper!.evaluate(this.xs, this.uBuffer, base);
  }

  private driveStepperTo(targetT: number): void {
    const s = this.stepper!;
    if (s.t > targetT + 1e-12) {
      const cp = this.findCheckpointAtOrBefore(targetT);
      if (cp) {
        s.restoreSnapshot(cp.snap, cp.t);
      } else {
        // Shouldn't happen (we always add a t=0 checkpoint after rebuild); fall through
        // by re-projecting the IC.
        this.rebuildCoefficients();
        return;
      }
    }
    const driven = this.isDriven();
    // Cap the integration dt so the forcing stays well-resolved at high ω.
    const omegaMax = Math.max(this.leftOmega, this.sourceOmega, 1);
    const safeDt = Math.min(MAX_INTEGRATION_DT, OMEGA_DT_SAFETY / omegaMax);
    while (s.t < targetT - 1e-12) {
      const dt = Math.min(safeDt, targetT - s.t);
      if (driven) {
        this.computeQn(s.t);
      } else {
        this.qSineBuffer.fill(0);
        this.qCosineBuffer.fill(0);
        this.qMeanValue = 0;
      }
      s.step(dt, this.alpha, this.qSineBuffer, this.qCosineBuffer, this.qMeanValue);
      if (driven && s.t - this.lastCheckpointT >= CHECKPOINT_INTERVAL_S) {
        this.addCheckpoint();
      }
    }
  }

  private setupControls(p: p5): void {
    const panel = this.createControlPanel();

    const icSelect = createSelect<ICName>(
      'Initial condition',
      IC_SPECS.map((s) => ({ value: s.name, label: s.label })),
      this.icName,
      (value) => {
        this.icName = value;
        if (value === 'random') this.randomizeSeed();
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
        this.updateDirichletRowsVisibility();
        this.rebuildCoefficients();
      },
      this.getStylePrefix()
    );

    this.playPauseButton = this.createButton('Pause', () => {
      this.playing = !this.playing;
      this.updatePlayPauseLabel();
    });

    const resetBtn = this.createButton('Reset', () => {
      if (this.icName === 'random') {
        this.randomizeSeed();
        this.rebuildCoefficients();
      } else {
        this.tSim = 0;
        this.scrubberMax = this.getTMax();
        this.playing = true;
        this.updatePlayPauseLabel();
      }
    });

    const topRow = createControlRow([icSelect, bcSelect, this.playPauseButton, resetBtn], { gap: '16px' });
    panel.appendChild(topRow);

    this.scrubberSlider = this.createSlider(p, 'Time', 0, 1, 0, 0.001, () => {
      const v = Number(this.scrubberSlider!.value());
      this.scrubbing = true;
      this.tSim = v * this.scrubberMax;
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

    this.tempLeftSlider = this.createSlider(p, 'Left end T_L', -1, 1, 0, 0.05, () => {
      this.tempLeft = Number(this.tempLeftSlider!.value());
      this.updateTempLeftLabel();
      this.rebuildCoefficients();
    });
    this.tempLeftRowEl = this.tempLeftSlider.elt.parentElement as HTMLElement;
    this.tempLeftLabelEl = this.findLabelForSlider(this.tempLeftSlider);
    this.updateTempLeftLabel();

    this.tempRightSlider = this.createSlider(p, 'Right end T_R', -1, 1, 0, 0.05, () => {
      this.tempRight = Number(this.tempRightSlider!.value());
      this.updateTempRightLabel();
      this.rebuildCoefficients();
    });
    this.tempRightRowEl = this.tempRightSlider.elt.parentElement as HTMLElement;
    this.tempRightLabelEl = this.findLabelForSlider(this.tempRightSlider);
    this.updateTempRightLabel();

    this.leftAmpSlider = this.createSlider(p, 'Left osc. A_L', 0, 1, 0, 0.05, () => {
      const prev = this.leftAmp;
      this.leftAmp = Number(this.leftAmpSlider!.value());
      this.updateLeftAmpLabel();
      this.updateForcingVisibility();
      if ((prev === 0) !== (this.leftAmp === 0)) {
        // Transition between driven/undriven: checkpoints beyond current t are invalidated.
        this.onForcingParamChange(false);
      } else {
        this.onForcingParamChange(false);
      }
    });
    this.leftAmpRowEl = this.leftAmpSlider.elt.parentElement as HTMLElement;
    this.leftAmpLabelEl = this.findLabelForSlider(this.leftAmpSlider);
    this.updateLeftAmpLabel();

    this.leftOmegaSlider = this.createSlider(p, 'Left osc. ω_L', 0, MAX_OMEGA, 10, 0.5, () => {
      this.leftOmega = Number(this.leftOmegaSlider!.value());
      this.updateLeftOmegaLabel();
      this.onForcingParamChange(false);
    });
    this.leftOmegaRowEl = this.leftOmegaSlider.elt.parentElement as HTMLElement;
    this.leftOmegaLabelEl = this.findLabelForSlider(this.leftOmegaSlider);
    this.updateLeftOmegaLabel();

    this.sourceAmpSlider = this.createSlider(p, 'Source A', -5, 5, 0, 0.05, () => {
      this.sourceAmp = Number(this.sourceAmpSlider!.value());
      this.updateSourceAmpLabel();
      this.updateForcingVisibility();
      this.onForcingParamChange(true);
    });
    this.sourceAmpRowEl = this.sourceAmpSlider.elt.parentElement as HTMLElement;
    this.sourceAmpLabelEl = this.findLabelForSlider(this.sourceAmpSlider);
    this.updateSourceAmpLabel();

    this.sourceX0Slider = this.createSlider(p, 'Source x₀', 0, 1, 0.5, 0.01, () => {
      this.sourceX0 = Number(this.sourceX0Slider!.value());
      this.updateSourceX0Label();
      this.onForcingParamChange(true);
    });
    this.sourceX0RowEl = this.sourceX0Slider.elt.parentElement as HTMLElement;
    this.sourceX0LabelEl = this.findLabelForSlider(this.sourceX0Slider);
    this.updateSourceX0Label();

    this.sourceOmegaSlider = this.createSlider(p, 'Source ω', 0, MAX_OMEGA, 0, 0.5, () => {
      this.sourceOmega = Number(this.sourceOmegaSlider!.value());
      this.updateSourceOmegaLabel();
      this.onForcingParamChange(false);
    });
    this.sourceOmegaRowEl = this.sourceOmegaSlider.elt.parentElement as HTMLElement;
    this.sourceOmegaLabelEl = this.findLabelForSlider(this.sourceOmegaSlider);
    this.updateSourceOmegaLabel();

    // Wrap all sliders in a single row so they lay out horizontally on wide screens,
    // wrap to multiple rows when space is tight, and stack on mobile. createControlRow's
    // appendChild calls move the existing slider containers out of the panel and into
    // this new wrapper.
    const sliderRow = createControlRow(
      [
        this.scrubberSlider!.elt.parentElement as HTMLElement,
        this.alphaSlider!.elt.parentElement as HTMLElement,
        this.modeRowEl!,
        this.tempLeftRowEl!,
        this.tempRightRowEl!,
        this.leftAmpRowEl!,
        this.leftOmegaRowEl!,
        this.sourceAmpRowEl!,
        this.sourceX0RowEl!,
        this.sourceOmegaRowEl!,
      ],
      { gap: '24px', wrap: true, mobileStack: true }
    );
    panel.appendChild(sliderRow);

    this.updateDirichletRowsVisibility();
    this.updateForcingVisibility();
  }

  private randomizeSeed(): void {
    this.seed = (Math.random() * 0xFFFFFFFF) >>> 0;
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

  private updateTempLeftLabel(): void {
    if (this.tempLeftLabelEl) {
      this.tempLeftLabelEl.textContent = `Left end T_L = ${this.tempLeft.toFixed(2)}`;
    }
  }

  private updateTempRightLabel(): void {
    if (this.tempRightLabelEl) {
      this.tempRightLabelEl.textContent = `Right end T_R = ${this.tempRight.toFixed(2)}`;
    }
  }

  private updateLeftAmpLabel(): void {
    if (this.leftAmpLabelEl) {
      this.leftAmpLabelEl.textContent = `Left osc. A_L = ${this.leftAmp.toFixed(2)}`;
    }
  }

  private updateLeftOmegaLabel(): void {
    if (this.leftOmegaLabelEl) {
      this.leftOmegaLabelEl.textContent = `Left osc. ω_L = ${this.leftOmega.toFixed(1)}`;
    }
  }

  private updateSourceAmpLabel(): void {
    if (this.sourceAmpLabelEl) {
      this.sourceAmpLabelEl.textContent = `Source A = ${this.sourceAmp.toFixed(2)}`;
    }
  }

  private updateSourceX0Label(): void {
    if (this.sourceX0LabelEl) {
      this.sourceX0LabelEl.textContent = `Source x₀ = ${this.sourceX0.toFixed(2)}`;
    }
  }

  private updateSourceOmegaLabel(): void {
    if (this.sourceOmegaLabelEl) {
      this.sourceOmegaLabelEl.textContent = `Source ω = ${this.sourceOmega.toFixed(1)}`;
    }
  }

  private updateModeRowVisibility(): void {
    if (!this.modeRowEl) return;
    const spec = IC_SPECS.find((s) => s.name === this.icName)!;
    this.modeRowEl.classList.toggle('heat-equation-hidden', !spec.usesMode);
  }

  private updateDirichletRowsVisibility(): void {
    // T_L/T_R and left-end oscillation only make sense for Dirichlet BC.
    const nonDirichlet = this.bc !== 'dirichlet';
    this.tempLeftRowEl?.classList.toggle('heat-equation-hidden', nonDirichlet);
    this.tempRightRowEl?.classList.toggle('heat-equation-hidden', nonDirichlet);
    this.leftAmpRowEl?.classList.toggle('heat-equation-hidden', nonDirichlet);
    this.updateForcingVisibility();
  }

  // Hide ω_L unless left amplitude is nonzero (and BC is Dirichlet). Source sliders
  // are shown for all BCs; ω and x₀ only when amplitude is nonzero.
  private updateForcingVisibility(): void {
    const leftOff = this.bc !== 'dirichlet' || this.leftAmp === 0;
    const srcOff = this.sourceAmp === 0;
    this.leftOmegaRowEl?.classList.toggle('heat-equation-hidden', leftOff);
    this.sourceX0RowEl?.classList.toggle('heat-equation-hidden', srcOff);
    this.sourceOmegaRowEl?.classList.toggle('heat-equation-hidden', srcOff);
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

    // Row 1: PDE | IC | BC (size 20)
    p.textSize(20);
    const hasSource = this.sourceAmp !== 0;
    const pde = hasSource
      ? `uₜ = ${this.alpha.toFixed(2)} · uₓₓ + P(x, t)`
      : `uₜ = ${this.alpha.toFixed(2)} · uₓₓ`;
    const ic = this.getICEquationText();
    const bc = this.getBCEquationText();
    const y0 = 4;
    const gap = Math.max(8, Math.min(24, p.width * 0.02));
    let x = 8;
    p.text(pde, x, y0);
    x += p.textWidth(pde) + gap;
    p.text(ic, x, y0);
    x += p.textWidth(ic) + gap;
    p.text(bc, x, y0);

    // Row 2: explicit solution (size 14)
    p.textSize(14);
    p.text(this.getSolutionText(), 8, y0 + 28);

    // Row 3 (conditional): P(x, t) definition if source is active
    if (hasSource) {
      p.text(this.getSourceText(), 8, y0 + 46);
    }

    p.pop();
  }

  private getSolutionText(): string {
    const alpha = this.alpha.toFixed(2);
    switch (this.bc) {
      case 'dirichlet': {
        if (this.isDriven()) {
          return 'u(x, t) = U(x, t) + Σₙ bₙ(t)·sin(nπx),   bₙ(t) integrated (ETD)';
        }
        const series = this.formatSineSeries(this.dirichletInitialSines, alpha, false);
        if (this.endsAreZero()) return `u(x, t) = ${series}`;
        return `u(x, t) = u_∞(x) + ${series},   u_∞(x) = ${this.tempLeft.toFixed(2)} + ${(this.tempRight - this.tempLeft).toFixed(2)}·x`;
      }
      case 'neumann': {
        if (this.sourceAmp !== 0) {
          return 'u(x, t) = m(t) + Σₙ aₙ(t)·cos(nπx),   aₙ(t), m(t) integrated (ETD)';
        }
        const series = this.formatCosineSeries(this.coeffs, alpha, false);
        const mean = this.coeffs.mean;
        const meanStr = Math.abs(mean) < 0.005 ? '' : `${mean.toFixed(2)} + `;
        return `u(x, t) = ${meanStr}${series}`;
      }
      case 'periodic': {
        if (this.sourceAmp !== 0) {
          return 'u(x, t) = m(t) + Σₙ [sₙ(t)·sin(2πnx) + cₙ(t)·cos(2πnx)],   integrated (ETD)';
        }
        const series = this.formatPeriodicSeries(this.coeffs, alpha);
        const mean = this.coeffs.mean;
        const meanStr = Math.abs(mean) < 0.005 ? '' : `${mean.toFixed(2)} + `;
        return `u(x, t) = ${meanStr}${series}`;
      }
    }
  }

  private getSourceText(): string {
    const a = this.sourceAmp.toFixed(2);
    const x0 = this.sourceX0.toFixed(2);
    const sig = SOURCE_SIGMA.toFixed(2);
    const timePart = this.sourceOmega === 0 ? '' : `·cos(${this.sourceOmega.toFixed(1)}t)`;
    // ψ(x) is the narrow Gaussian rescaled so A is read as the peak steady-state temperature
    // at a centered source with α=1 — see refreshSourceProjection for the gain.
    return `P(x, t) = ${a}${timePart}·ψ(x − ${x0}),   ψ(y) ∝ exp(−(y/${sig})²)`;
  }

  // Pick the first `maxTerms` coefficients with |c| above threshold; returns the list
  // plus the index of the next-biggest-n we didn't show (for the O(...) remainder hint).
  private pickSignificantTerms(coeffs: Float64Array | undefined, maxTerms: number, threshold: number = 0.01):
    { terms: Array<{ n: number; c: number }>; nextN: number } {
    const terms: Array<{ n: number; c: number }> = [];
    if (!coeffs) return { terms, nextN: 1 };
    for (let n = 1; n <= coeffs.length; n++) {
      if (Math.abs(coeffs[n - 1]) >= threshold) {
        terms.push({ n, c: coeffs[n - 1] });
        if (terms.length >= maxTerms) break;
      }
    }
    const nextN = terms.length > 0 ? terms[terms.length - 1].n + 1 : 1;
    return { terms, nextN };
  }

  // Dirichlet (sine) basis: φₙ(x) = sin(nπx), decay rate λₙ = n²π².
  private formatSineSeries(coeffs: Float64Array | undefined, alpha: string, periodic: boolean): string {
    const { terms, nextN } = this.pickSignificantTerms(coeffs, 3);
    if (terms.length === 0) return '0';
    const parts = terms.map(({ n, c }, i) => {
      const abs = Math.abs(c).toFixed(2);
      const sign = c < 0 ? '−' : '+';
      const kx = periodic ? 2 * n : n;
      const arg = kx === 1 ? 'πx' : `${kx}πx`;
      const lambdaN = periodic ? 4 * n * n : n * n;
      const exp = lambdaN === 1 ? `e^(−π²·${alpha}t)` : `e^(−${lambdaN}π²·${alpha}t)`;
      const term = `${abs}·sin(${arg})·${exp}`;
      if (i === 0) return c < 0 ? `−${term}` : term;
      return `${sign} ${term}`;
    });
    const lambdaNext = periodic ? 4 * nextN * nextN : nextN * nextN;
    const remainder = ` + O(e^(−${lambdaNext}π²·${alpha}t))`;
    return parts.join(' ') + remainder;
  }

  // Neumann (cosine) basis: φₙ(x) = cos(nπx), decay rate λₙ = n²π².
  private formatCosineSeries(coeffs: Coeffs | undefined, alpha: string, _periodic: boolean): string {
    const { terms, nextN } = this.pickSignificantTerms(coeffs?.cosineCoeffs, 3);
    if (terms.length === 0) return '0';
    const parts = terms.map(({ n, c }, i) => {
      const abs = Math.abs(c).toFixed(2);
      const sign = c < 0 ? '−' : '+';
      const arg = n === 1 ? 'πx' : `${n}πx`;
      const lambdaN = n * n;
      const exp = lambdaN === 1 ? `e^(−π²·${alpha}t)` : `e^(−${lambdaN}π²·${alpha}t)`;
      const term = `${abs}·cos(${arg})·${exp}`;
      if (i === 0) return c < 0 ? `−${term}` : term;
      return `${sign} ${term}`;
    });
    const lambdaNext = nextN * nextN;
    const remainder = ` + O(e^(−${lambdaNext}π²·${alpha}t))`;
    return parts.join(' ') + remainder;
  }

  // Periodic: both sine and cosine terms at wavenumber 2πn, decay 4n²π².
  private formatPeriodicSeries(coeffs: Coeffs | undefined, alpha: string): string {
    if (!coeffs) return '0';
    // Pick at most 2 significant pairs; for each n, show whichever of sin/cos is larger.
    const pairs: Array<{ n: number; c: number; basis: 'sin' | 'cos' }> = [];
    for (let n = 1; n <= coeffs.sineCoeffs.length && pairs.length < 2; n++) {
      const s = coeffs.sineCoeffs[n - 1];
      const c = coeffs.cosineCoeffs[n - 1];
      if (Math.abs(s) < 0.01 && Math.abs(c) < 0.01) continue;
      if (Math.abs(s) >= Math.abs(c)) pairs.push({ n, c: s, basis: 'sin' });
      else pairs.push({ n, c, basis: 'cos' });
    }
    if (pairs.length === 0) return '0';
    const parts = pairs.map(({ n, c, basis }, i) => {
      const abs = Math.abs(c).toFixed(2);
      const sign = c < 0 ? '−' : '+';
      const arg = n === 1 ? '2πx' : `${2 * n}πx`;
      const lambdaN = 4 * n * n;
      const exp = `e^(−${lambdaN}π²·${alpha}t)`;
      const term = `${abs}·${basis}(${arg})·${exp}`;
      if (i === 0) return c < 0 ? `−${term}` : term;
      return `${sign} ${term}`;
    });
    const nextN = (pairs[pairs.length - 1]?.n ?? 0) + 1;
    const lambdaNext = 4 * nextN * nextN;
    return parts.join(' ') + ` + O(e^(−${lambdaNext}π²·${alpha}t))`;
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
      case 'dirichlet': {
        const leftRhs = this.leftRhsText();
        const rightRhs = this.tempRight.toFixed(2);
        if (!this.isDriven() && this.endsAreZero()) return 'u(0, t) = u(1, t) = 0';
        return `u(0, t) = ${leftRhs},  u(1, t) = ${rightRhs}`;
      }
      case 'neumann':  return 'uₓ(0, t) = uₓ(1, t) = 0';
      case 'periodic': return 'u(0, t) = u(1, t)';
    }
  }

  private leftRhsText(): string {
    const constPart = this.tempLeft.toFixed(2);
    if (this.leftAmp === 0) return constPart;
    const osc = `${this.leftAmp.toFixed(2)}·sin(${this.leftOmega.toFixed(1)}t)`;
    return this.tempLeft === 0 ? osc : `${constPart} + ${osc}`;
  }

  private getStripTop(): number {
    // Row 1 (PDE/IC/BC) always present; row 2 (solution) always present; row 3 (P def) only
    // when a source term is active.
    return this.sourceAmp !== 0 ? 82 : 62;
  }

  private renderStrip(p: p5): void {
    const w = p.width;
    const h = p.height;
    const stripTop = this.getStripTop();
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
    const stripTop = this.getStripTop();
    const stripHeight = Math.floor((h - stripTop - 20) * 0.42);
    const plotTop = stripTop + stripHeight + 16;
    const plotBottom = h - 10;
    const plotMid = (plotTop + plotBottom) / 2;
    const plotHalfHeight = (plotBottom - plotTop) / 2;

    // Baseline at u=0.
    p.stroke(this.colors.axis);
    p.strokeWeight(1);
    p.line(0, plotMid, w, plotMid);
    p.noStroke();

    // Mean temperature — dashed line and numeric readout. Clamp visually to the plot
    // window but show the true numeric value in the label.
    const mean = this.computeMean();
    const meanClamped = Math.max(-1, Math.min(1, mean));
    const meanY = plotMid - meanClamped * plotHalfHeight;
    p.push();
    const ctx = p.drawingContext as CanvasRenderingContext2D;
    ctx.setLineDash([4, 4]);
    p.stroke(this.colors.warning);
    p.strokeWeight(1);
    p.line(0, meanY, w, meanY);
    ctx.setLineDash([]);
    p.pop();

    // Solution curve.
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

    // Mean label at the right edge of the dashed line.
    p.fill(this.colors.warning);
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.textSize(12);
    p.text(`⟨u⟩ = ${mean.toFixed(3)}`, w - 6, meanY - 2);
  }

  /** Spatial mean of the current u(x) buffer via trapezoidal rule on the render grid. */
  private computeMean(): number {
    const n = this.uBuffer.length;
    let s = 0.5 * (this.uBuffer[0] + this.uBuffer[n - 1]);
    for (let i = 1; i < n - 1; i++) s += this.uBuffer[i];
    return s / (n - 1);
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
