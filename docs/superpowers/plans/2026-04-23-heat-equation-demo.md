# Heat Equation Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Interactive 1D heat-equation demo on a wire — user picks initial condition and boundary condition, watches temperature evolve via the analytic eigenfunction-expansion solution, with a colored heat strip and a line plot sharing the x-axis.

**Architecture:** Three colocated modules under `demos/differential-equations/heat-equation/`: a pure-math `solver.ts` doing Fourier/sine/cosine-series coefficient computation and evaluation, an `initial-conditions.ts` holding the five preset IC functions, a `colormap.ts` producing a diverging blue→white→red p5.Color for a given $u \in [-1,1]$, and an `index.ts` demo class extending `P5DemoBase` that owns rendering and control wiring. Demo-specific styling in `styles/heat-equation.module.css`. Registered in `demos-framework/src/main.ts`, embedded in `heat.md` via `{% include_demo "heat-equation" %}`.

**Tech Stack:** TypeScript 5.3+, p5.js 1.9, existing `P5DemoBase` and `ui-components` helpers (`createControlPanel`, `createButton`, `createSlider`, `createSelect`, `createControlRow`). No new dependencies.

**Testing note:** This codebase has no TypeScript unit-test framework — empty `tests/` dir, no `run_tests.sh`, no test runner in `package.json`. Verification is empirical: `npm run type-check` for types, the dev server + browser for behavior, and `./scripts/crawl-demos.py -d heat-equation` with `--ask` for visual regression. Each task ends with type-check + commit; the final task does a full visual verification of all IC×BC combinations.

**Reference spec:** `docs/superpowers/specs/2026-04-23-heat-equation-demo-design.md`

---

## File Plan

Create:
- `demos/differential-equations/heat-equation/solver.ts` — pure math: coefficient computation and evaluation
- `demos/differential-equations/heat-equation/initial-conditions.ts` — five IC presets
- `demos/differential-equations/heat-equation/colormap.ts` — temperature → p5.Color
- `demos/differential-equations/heat-equation/index.ts` — demo class, rendering, controls
- `styles/heat-equation.module.css` — demo-specific layout (conditional mode slider visibility)

Modify:
- `styles/main.css` — add `@import './heat-equation.module.css';`
- `demos-framework/src/main.ts` — add `'heat-equation'` to `demoRegistry`
- `content/applied-math/differential-equations/partial-differential-equations/heat.md` — insert `{% include_demo "heat-equation" %}`

**Project conventions discovered that affect this plan:**
- `.module.css` files here are **global-scoped** CSS (not real CSS Modules) — they're included by being `@import`-ed from `styles/main.css`. Write classes like `.heat-equation-mode-row` (kebab-case, globally scoped).
- The `@framework` alias exports everything from `demos-framework/src/index.ts` (a barrel re-exporting `types`, `p5-base`, `demo-utils`, `ui-components`). Existing demos import from `@framework` directly — follow that pattern.
- `tsconfig.json` has `noUnusedLocals` and `noUnusedParameters` enabled. Prefix intentionally-unused params with `_`.
- The `demos/` directory is at the repo root (not `mathnotes/demos/`) — paths throughout this plan reflect that.
- Per CLAUDE.md: **never put styles directly in TypeScript.** Toggle classes, don't assign to `element.style.*`.

---

## Task 1: Solver module — pure math

**Files:**
- Create: `demos/differential-equations/heat-equation/solver.ts`

- [ ] **Step 1: Write the solver module**

```typescript
// demos/differential-equations/heat-equation/solver.ts
//
// Analytic solution to the 1D heat equation u_t = alpha * u_xx on [0, L]
// via eigenfunction expansion. No p5, no DOM — pure math.
//
// For each boundary condition we use the corresponding orthonormal basis
// of -d^2/dx^2, expand the initial condition into that basis, and evolve
// each mode by its decay factor exp(-alpha * lambda_n * t).

export type BC = 'dirichlet' | 'neumann' | 'periodic';
export type ICFn = (x: number) => number;

export interface Coeffs {
  bc: BC;
  L: number;
  // Parallel arrays. For dirichlet:  u(x,t) = Σ sineCoeffs[n-1] * sin(n π x / L) * exp(-α (n π / L)^2 t), n=1..N
  // For neumann:   u(x,t) = mean + Σ cosineCoeffs[n-1] * cos(n π x / L) * exp(-α (n π / L)^2 t), n=1..N
  // For periodic:  u(x,t) = mean + Σ [sineCoeffs[n-1] sin(2π n x / L) + cosineCoeffs[n-1] cos(2π n x / L)] * exp(-α (2π n / L)^2 t), n=1..N
  sineCoeffs: Float64Array;
  cosineCoeffs: Float64Array;
  mean: number;           // zero for dirichlet; the n=0 term for neumann/periodic
  eigenvalues: Float64Array; // λ_n for n=1..N (matches coeff indexing)
}

export const DEFAULT_N_MODES = 64;
export const INTEGRATION_POINTS = 512; // trapezoidal grid for inner products

/** Smallest nonzero eigenvalue of -d^2/dx^2 for the given BC on [0, L]. Used to set the simulation time. */
export function slowestNonzeroEigenvalue(bc: BC, L: number): number {
  switch (bc) {
    case 'dirichlet':
    case 'neumann':
      return (Math.PI / L) ** 2;
    case 'periodic':
      return (2 * Math.PI / L) ** 2;
  }
}

/** Compute the Fourier-type coefficients of the initial condition in the BC's eigenbasis. */
export function computeCoefficients(
  ic: ICFn,
  bc: BC,
  L: number = 1,
  N: number = DEFAULT_N_MODES,
  M: number = INTEGRATION_POINTS
): Coeffs {
  // Sample the IC on a fine uniform grid for trapezoidal integration.
  // For periodic BC we use M points with x_i = i*L/M (no endpoint duplication).
  // For dirichlet/neumann we use M+1 points including both endpoints.
  const sineCoeffs = new Float64Array(N);
  const cosineCoeffs = new Float64Array(N);
  const eigenvalues = new Float64Array(N);
  let mean = 0;

  if (bc === 'periodic') {
    const dx = L / M;
    const samples = new Float64Array(M);
    for (let i = 0; i < M; i++) samples[i] = ic(i * dx);

    // Mean (n=0 mode).
    let s = 0;
    for (let i = 0; i < M; i++) s += samples[i];
    mean = s / M;

    // Real Fourier coefficients with wavenumber k_n = 2π n / L.
    for (let n = 1; n <= N; n++) {
      const kn = 2 * Math.PI * n / L;
      let a = 0, b = 0;
      for (let i = 0; i < M; i++) {
        const x = i * dx;
        a += samples[i] * Math.cos(kn * x);
        b += samples[i] * Math.sin(kn * x);
      }
      // u(x) = mean + Σ (2/M) * [a cos(kn x) + b sin(kn x)]
      cosineCoeffs[n - 1] = (2 / M) * a;
      sineCoeffs[n - 1]   = (2 / M) * b;
      eigenvalues[n - 1]  = kn * kn;
    }
  } else {
    // dirichlet or neumann — sines / cosines of n π x / L, trapezoidal on [0, L].
    const dx = L / M;
    const samples = new Float64Array(M + 1);
    for (let i = 0; i <= M; i++) samples[i] = ic(i * dx);

    const trap = (vals: Float64Array): number => {
      let s = 0.5 * (vals[0] + vals[M]);
      for (let i = 1; i < M; i++) s += vals[i];
      return s * dx;
    };

    if (bc === 'neumann') {
      // n=0 mode: phi_0 = 1/sqrt(L); coefficient is ∫f/sqrt(L); the physical contribution is mean of f.
      mean = trap(samples) / L;
    }

    const integrand = new Float64Array(M + 1);
    for (let n = 1; n <= N; n++) {
      const kn = Math.PI * n / L;
      if (bc === 'dirichlet') {
        for (let i = 0; i <= M; i++) integrand[i] = samples[i] * Math.sin(kn * i * dx);
        sineCoeffs[n - 1] = (2 / L) * trap(integrand);
        cosineCoeffs[n - 1] = 0;
      } else {
        // neumann
        for (let i = 0; i <= M; i++) integrand[i] = samples[i] * Math.cos(kn * i * dx);
        cosineCoeffs[n - 1] = (2 / L) * trap(integrand);
        sineCoeffs[n - 1] = 0;
      }
      eigenvalues[n - 1] = kn * kn;
    }
  }

  return { bc, L, sineCoeffs, cosineCoeffs, mean, eigenvalues };
}

/** Evaluate u(x, t) at the given query points. Writes into `out` (length = xs.length) and returns it. */
export function evaluate(
  coeffs: Coeffs,
  xs: Float64Array | number[],
  t: number,
  alpha: number,
  out?: Float64Array
): Float64Array {
  const nx = xs.length;
  const result = out && out.length === nx ? out : new Float64Array(nx);

  // Start each point at the mean (zero for dirichlet).
  for (let i = 0; i < nx; i++) result[i] = coeffs.mean;

  const { sineCoeffs, cosineCoeffs, eigenvalues, bc, L } = coeffs;
  const N = eigenvalues.length;

  for (let n = 1; n <= N; n++) {
    const decay = Math.exp(-alpha * eigenvalues[n - 1] * t);
    if (decay < 1e-12) continue; // mode is negligible; remaining higher modes decay faster still
    const s = sineCoeffs[n - 1] * decay;
    const c = cosineCoeffs[n - 1] * decay;
    if (s === 0 && c === 0) continue;

    const kn = bc === 'periodic' ? 2 * Math.PI * n / L : Math.PI * n / L;
    for (let i = 0; i < nx; i++) {
      const x = xs[i];
      if (s !== 0) result[i] += s * Math.sin(kn * x);
      if (c !== 0) result[i] += c * Math.cos(kn * x);
    }
  }

  return result;
}
```

- [ ] **Step 2: Run `npm run type-check`**

Run: `npm run type-check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add demos/differential-equations/heat-equation/solver.ts
git commit -m "Heat equation demo: add analytic eigenfunction solver"
```

---

## Task 2: Initial conditions module

**Files:**
- Create: `demos/differential-equations/heat-equation/initial-conditions.ts`

- [ ] **Step 1: Write the presets**

```typescript
// demos/differential-equations/heat-equation/initial-conditions.ts
//
// Five preset initial-condition functions on [0, 1]. Each is defined as a
// raw function f(x); callers normalize (divide by max|f|) so u stays in
// [-1, 1] for consistent colormap and line-plot scaling.

import type { BC, ICFn } from './solver';

export type ICName = 'gaussian' | 'two-gaussians' | 'square' | 'sine' | 'random';

export interface ICSpec {
  name: ICName;
  label: string;
  /** Build the raw (un-normalized) IC function. `mode` is used only by 'sine'. */
  build: (params: { mode: number; bc: BC; seed: number }) => ICFn;
  /** Whether this IC exposes a mode-n slider. */
  usesMode: boolean;
}

/** Deterministic 0..1 PRNG (mulberry32). */
function makePrng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Clamp a function's output so |f(x)| ≤ 1 everywhere, by sampling and dividing. */
export function normalize(f: ICFn, samples: number = 257): ICFn {
  let maxAbs = 0;
  for (let i = 0; i <= samples; i++) {
    const v = Math.abs(f(i / samples));
    if (v > maxAbs) maxAbs = v;
  }
  if (maxAbs < 1e-12) return f;
  return (x) => f(x) / maxAbs;
}

export const IC_SPECS: ICSpec[] = [
  {
    name: 'gaussian',
    label: 'Gaussian bump',
    usesMode: false,
    build: () => (x) => Math.exp(-((x - 0.5) / 0.1) ** 2),
  },
  {
    name: 'two-gaussians',
    label: 'Two Gaussians',
    usesMode: false,
    build: () => (x) =>
      Math.exp(-((x - 0.3) / 0.08) ** 2) -
      Math.exp(-((x - 0.7) / 0.08) ** 2),
  },
  {
    name: 'square',
    label: 'Square pulse',
    usesMode: false,
    build: () => (x) => (x >= 0.35 && x <= 0.65 ? 1 : 0),
  },
  {
    name: 'sine',
    label: 'Sine',
    usesMode: true,
    build: ({ mode, bc }) => {
      // For periodic BC use the periodic basis frequency; for others use the half-wave frequency.
      const k = bc === 'periodic' ? 2 * Math.PI * mode : Math.PI * mode;
      return (x) => Math.sin(k * x);
    },
  },
  {
    name: 'random',
    label: 'Random noise',
    usesMode: false,
    build: ({ seed }) => {
      const cells = 20;
      const rng = makePrng(seed);
      const vals = new Float64Array(cells);
      for (let i = 0; i < cells; i++) vals[i] = rng() * 2 - 1;
      return (x) => {
        const idx = Math.min(cells - 1, Math.floor(x * cells));
        return vals[idx];
      };
    },
  },
];
```

- [ ] **Step 2: Type-check**

Run: `npm run type-check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add demos/differential-equations/heat-equation/initial-conditions.ts
git commit -m "Heat equation demo: add initial-condition presets"
```

---

## Task 3: Colormap module

**Files:**
- Create: `demos/differential-equations/heat-equation/colormap.ts`

- [ ] **Step 1: Write the colormap**

```typescript
// demos/differential-equations/heat-equation/colormap.ts
//
// Diverging colormap for temperature u ∈ [-1, 1], centered on 0.
// Deep cold blue → neutral mid → deep hot red. The neutral midpoint
// swaps between white (light mode) and dark-gray (dark mode) so the
// canvas always has contrast against the page background.

import type p5 from 'p5';

interface Stop {
  // RGB 0-255
  r: number; g: number; b: number;
  // Position on [-1, 1]
  at: number;
}

const COLD = { r: 29, g: 58, b: 138, at: -1 };    // #1d3a8a
const MID_LIGHT = { r: 245, g: 245, b: 245, at: 0 }; // near-white on light pages
const MID_DARK = { r: 40, g: 40, b: 40, at: 0 };    // blends with dark page bg
const HOT = { r: 178, g: 24, b: 43, at: 1 };       // #b2182b

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function stopsFor(isDark: boolean): Stop[] {
  return [COLD, isDark ? MID_DARK : MID_LIGHT, HOT];
}

/** Map u (any real) to a p5.Color. Values outside [-1, 1] are clamped. */
export function temperatureToColor(p: p5, u: number, isDark: boolean): p5.Color {
  const clamped = Math.max(-1, Math.min(1, u));
  const stops = stopsFor(isDark);
  // Find bracketing stops.
  let a = stops[0], b = stops[1];
  if (clamped > 0) { a = stops[1]; b = stops[2]; }
  const t = (clamped - a.at) / (b.at - a.at);
  return p.color(lerp(a.r, b.r, t), lerp(a.g, b.g, t), lerp(a.b, b.b, t));
}
```

- [ ] **Step 2: Type-check**

Run: `npm run type-check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add demos/differential-equations/heat-equation/colormap.ts
git commit -m "Heat equation demo: add diverging colormap"
```

---

## Task 4: CSS module

**Files:**
- Create: `styles/heat-equation.module.css`
- Modify: `styles/main.css`

- [ ] **Step 1: Write the CSS**

Classes are global (this project's `.module.css` is a naming convention, not real CSS Modules).

```css
/* Heat Equation Demo styles */

.heat-equation-mode-row {
  /* Default visible; hidden via .heat-equation-hidden class toggle. */
}

.heat-equation-hidden {
  display: none !important;
}
```

Most layout (control panel flex, button/slider styles) is inherited from `styles/demo-components.css`. This file only adds what's specific to this demo.

- [ ] **Step 2: Register the stylesheet in main.css**

Edit `styles/main.css`. Find the block of top-of-file `@import` statements (around lines 2-12) and add after the last `@import` line:

```css
@import './heat-equation.module.css';
```

- [ ] **Step 3: Commit**

```bash
git add styles/heat-equation.module.css styles/main.css
git commit -m "Heat equation demo: add CSS module"
```

---

## Task 5: Demo class — rendering and controls

**Files:**
- Create: `demos/differential-equations/heat-equation/index.ts`

- [ ] **Step 1: Write the demo**

```typescript
// demos/differential-equations/heat-equation/index.ts
//
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
const N_X = 400; // sample points along the wire (also render columns for the strip)
const LN_100 = Math.log(100);

// Full-decay wall-clock window: default 20 s, range 5 – 60 s.
const DEFAULT_DURATION_S = 20;
const MIN_DURATION_S = 5;
const MAX_DURATION_S = 60;

class HeatEquationDemo extends P5DemoBase {
  // State
  private bc: BC = 'dirichlet';
  private icName: ICName = 'gaussian';
  private mode: number = 1;
  private seed: number = 0xC0FFEE;

  private coeffs!: Coeffs;
  private xs!: Float64Array;
  private uBuffer!: Float64Array;

  // Time (simulation time in the units of the analytic solution).
  private tSim: number = 0;
  private playing: boolean = true;
  private lastFrameMs: number = 0;
  private durationS: number = DEFAULT_DURATION_S;

  // DOM handles we need to read/write after construction.
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
  protected getAspectRatio(): number { return 0.5; } // wide-and-short: strip on top, plot below
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
      // Advance simulation time from wall clock.
      const now = p.millis();
      const dtMs = now - this.lastFrameMs;
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

      // Solve.
      evaluate(this.coeffs, this.xs, this.tSim, ALPHA, this.uBuffer);

      // Render.
      p.background(this.colors.background);
      this.renderStrip(p);
      this.renderLinePlot(p);

      // Sync scrubber.
      if (!this.scrubbing && this.scrubberSlider) {
        this.scrubberSlider.value(this.tSim / tMax);
      }
    };
  }

  protected onResize(_p: p5, _size: CanvasSize): void {
    // xs stays in [0, L]; render resolution is tied to canvas width by renderStrip pixel sampling.
    // Nothing to rebuild.
  }

  protected onColorSchemeChange(_isDark: boolean): void {
    // Colors are re-read per-frame from this.colors, which updateColors() refreshes.
    // Colormap midpoint also swaps via this.isDarkMode, which is updated automatically.
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
    this.lastFrameMs = 0; // reinitialized next draw
    this.updatePlayPauseLabel();
  }

  private setupControls(p: p5): void {
    const panel = this.createControlPanel();

    // IC dropdown.
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

    // BC dropdown.
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

    // Play / pause.
    this.playPauseButton = this.createButton('Pause', () => {
      this.playing = !this.playing;
      if (this.playing && this.tSim >= this.getTMax()) this.tSim = 0;
      this.updatePlayPauseLabel();
    });

    // Reset.
    const resetBtn = this.createButton('Reset', () => {
      this.tSim = 0;
      this.playing = true;
      this.updatePlayPauseLabel();
    });

    const topRow = createControlRow([icSelect, bcSelect, this.playPauseButton, resetBtn], { gap: '16px' });
    panel.appendChild(topRow);

    // Scrubber.
    this.scrubberSlider = this.createSlider(p, 'Time', 0, 1, 0, 0.001, () => {
      const v = Number(this.scrubberSlider!.value());
      this.scrubbing = true;
      this.tSim = v * this.getTMax();
      this.playing = false;
      this.updatePlayPauseLabel();
    });
    // Release scrubbing on mouse up anywhere.
    this.addEventListener(window, 'mouseup', () => { this.scrubbing = false; });
    this.addEventListener(window, 'touchend', () => { this.scrubbing = false; });

    // Speed (duration of one full decay in wall-clock seconds).
    this.speedSlider = this.createSlider(
      p, 'Decay over (s)', MIN_DURATION_S, MAX_DURATION_S, DEFAULT_DURATION_S, 1,
      () => { this.durationS = Number(this.speedSlider!.value()); }
    );

    // Mode-n slider, shown only when Sine is selected.
    this.modeSlider = this.createSlider(p, 'Sine mode n', 1, 8, this.mode, 1, () => {
      this.mode = Number(this.modeSlider!.value());
      if (this.icName === 'sine') this.rebuildCoefficients();
    });
    // The slider helper appends its row directly to the panel; find it and tag it
    // so we can toggle visibility via CSS class (no inline styles).
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
    // Strip occupies the top ~40% of the canvas, with small margins.
    const w = p.width;
    const h = p.height;
    const stripTop = 10;
    const stripHeight = Math.floor(h * 0.35);
    const stripBottom = stripTop + stripHeight;

    // One vertical stripe per canvas pixel column; sample u at that x.
    for (let px = 0; px < w; px++) {
      const x = (px / (w - 1)) * L;
      const u = this.sampleU(x);
      p.fill(temperatureToColor(p, u, this.isDarkMode));
      p.rect(px, stripTop, 1, stripHeight);
    }

    // Periodic visual hint: draw thin tick marks at both ends to suggest identification.
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

    // Axis line at u=0.
    p.stroke(this.colors.axis);
    p.strokeWeight(1);
    p.line(0, plotMid, w, plotMid);
    p.noStroke();

    // Polyline of u(x).
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

  /** Sample u at a point by interpolating the precomputed uBuffer. */
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
```

- [ ] **Step 2: Type-check**

Run: `npm run type-check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add demos/differential-equations/heat-equation/index.ts
git commit -m "Heat equation demo: add demo class with rendering and controls"
```

---

## Task 6: Register demo

**Files:**
- Modify: `demos-framework/src/main.ts`

- [ ] **Step 1: Add registry entry**

Find the `demoRegistry` object (near line 37) and add this line alongside the other `differential-equations` entries:

```typescript
'heat-equation': () => import('@demos/differential-equations/heat-equation'),
```

- [ ] **Step 2: Type-check**

Run: `npm run type-check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add demos-framework/src/main.ts
git commit -m "Heat equation demo: register in main.ts"
```

---

## Task 7: Embed demo in heat.md

**Files:**
- Modify: `content/applied-math/differential-equations/partial-differential-equations/heat.md`

- [ ] **Step 1: Insert the include**

Immediately after equation (9) (the `u(x,0) = f(x)` initial condition line) and its brief description ("This model is an example of an initial-boundary value problem..."), before the "One more thing to note" paragraph about steady-state, add:

```markdown

{% include_demo "heat-equation" %}

```

The paragraph order becomes: model definition (7)-(9) → demo → steady-state remark → "Separation of Variables" link. This places the interactive view right after the user has seen the problem definition but before they hit the solution method.

- [ ] **Step 2: Commit**

```bash
git add content/applied-math/differential-equations/partial-differential-equations/heat.md
git commit -m "Heat equation: embed interactive demo"
```

---

## Task 8: Verify end-to-end

- [ ] **Step 1: Start the dev server if not already running**

```bash
docker-compose -f docker-compose.dev.yml up -d
```

- [ ] **Step 2: Check for TypeScript build errors**

```bash
docker ps -a | grep static-builder
docker logs mathnotes-static-builder --tail 50
```

Expected: no TypeScript errors. If present, fix and re-run.

- [ ] **Step 3: Smoke-test the page loads**

Run: `./scripts/crawl-dev.sh --single-page "http://web-dev:5000/mathnotes/applied-math/differential-equations/partial-differential-equations/heat"`

Expected: no JavaScript errors, no CSP violations in report.

- [ ] **Step 4: Capture demo screenshots (desktop + mobile)**

```bash
./scripts/crawl-demos.py -d heat-equation
```

- [ ] **Step 5: Visually verify via --ask**

Check all three BCs with at least two ICs each. Sample questions to put through `--ask`:

- "Does the heat strip show a smooth red-to-white-to-blue gradient for a Gaussian bump at t=0?"
- "For the sine preset with n=3 and Dirichlet BC, does the strip show three evenly-spaced warm-cool bands that all fade together over time?"
- "For the Neumann BC with a two-Gaussian IC, does the final state (scrubber at far right) show a nearly-constant color (the mean), not fully cool?"
- "For the Periodic BC with a Gaussian bump, does the heat spread symmetrically in both directions and eventually level off to a uniform color?"

- [ ] **Step 6: Dark mode verification**

In the browser, toggle the OS color scheme or site theme. Confirm:
- The heat strip remains readable (neutral midpoint switches to a dark-gray, not white).
- The line plot axis and curve colors switch appropriately.

- [ ] **Step 7: Final commit (only if tweaks needed)**

If visual issues were found and fixed:

```bash
git add -p
git commit -m "Heat equation demo: visual fixes from verification pass"
```

Otherwise, nothing to commit — verification is complete.
