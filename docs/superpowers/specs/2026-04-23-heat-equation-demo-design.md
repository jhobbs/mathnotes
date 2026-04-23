# 1D Heat Equation Demo — Design

**Date:** 2026-04-23
**Target page:** `content/applied-math/differential-equations/partial-differential-equations/heat.md`

## Goal

An interactive p5.js demo visualizing the 1D heat equation $u_t = \alpha u_{xx}$ on a wire of length $L$. The user picks an initial condition and a boundary condition, and watches the temperature profile evolve toward equilibrium.

The demo doubles as a visualization of the separation-of-variables solution from the surrounding content: it *is* that solution, evaluated at arbitrary $t$.

## Visual Layout

Two stacked views sharing the x-axis:

1. **Heat strip** (top) — a thick horizontal bar colored pixel-by-pixel by temperature using a diverging colormap (deep blue → white → deep red), centered on $u=0$.
2. **Line plot** (bottom) — the graph of $u(x,t)$ on an axis with fixed vertical range $[-1, 1]$. Shows the function quantitatively and makes the "curvature flattens" intuition of diffusion legible.

Under each view, a subtle labeling convention makes the BC visible (e.g., endpoints pinned / matched / free-slope).

Below both views: a row of controls.

## Math / Solver

### Analytic solution via eigenfunction expansion

Each BC has its own orthonormal basis on $[0, L]$ with eigenvalues $\lambda_n$ of $-\partial_x^2$:

- **Dirichlet** ($u(0)=u(L)=0$): $\phi_n(x) = \sqrt{2/L}\sin(n\pi x/L)$, $\lambda_n = (n\pi/L)^2$, $n=1,2,\dots$
- **Neumann** ($u_x(0)=u_x(L)=0$): $\phi_0 = 1/\sqrt{L}$, $\phi_n(x) = \sqrt{2/L}\cos(n\pi x/L)$, $\lambda_n = (n\pi/L)^2$, $n=0,1,2,\dots$
- **Periodic** ($u(0)=u(L)$): $\phi_n(x) = \frac{1}{\sqrt{L}}e^{i 2\pi n x/L}$, $\lambda_n = (2\pi n/L)^2$, $n\in\mathbb{Z}$. Implementation uses the real sine/cosine pair at each nonzero $|n|$.

The solution is $u(x,t) = \sum_n c_n\,\phi_n(x)\,e^{-\alpha\lambda_n t}$ where $c_n = \langle f, \phi_n\rangle$ is computed numerically from the initial condition $f(x)$ via the trapezoidal rule on a fine grid.

Normalize each IC so $\max|f|=1$ before computing coefficients, so the colormap and line-plot range stay $[-1, 1]$.

### Parameters

- $L = 1$ (dimensionless, fixed).
- $\alpha = 1$ (dimensionless, fixed — the speed slider controls perceived time, so a user-facing diffusivity would be redundant).
- $N_{\text{modes}} = 64$. Captures the first-mode dynamics fully; higher modes decay so fast that truncation is visually unnoticeable after the first fraction of a second.
- $N_x = 400$ sampling points for both the coefficient integrals and the render (approximately pixel-resolution).

### Time scaling

Let $\lambda_1^{\text{BC}}$ be the smallest nonzero eigenvalue for the chosen BC. Define the full-decay simulation time $T_{\text{BC}} = \ln(100) / (\alpha \lambda_1^{\text{BC}})$ — the time for the slowest decaying mode to shrink to 1% of its initial amplitude. The speed slider sets how many wall-clock seconds map to $T_{\text{BC}}$ (default 20s, range 5–60s).

Because the BCs have different slowest eigenvalues, swapping BCs adjusts $T_{\text{BC}}$ automatically so the "full view" always shows a complete decay in the configured wall-clock duration.

## Initial Conditions

Five presets, defined as $f: [0,1] \to \mathbb{R}$ then normalized so $\max|f|=1$:

- **Gaussian bump** — $f(x) = \exp(-((x-0.5)/0.1)^2)$
- **Two Gaussians** — $f(x) = \exp(-((x-0.3)/0.08)^2) - \exp(-((x-0.7)/0.08)^2)$
- **Square pulse** — $f(x) = 1$ for $x \in [0.35, 0.65]$, else $0$
- **Sine** — $f(x) = \sin(n\pi x)$, with $n$ adjustable via a slider that appears only for this preset (range 1–8). For periodic BC, reinterpret as $\sin(2\pi n x)$ so it's compatible with the periodic basis.
- **Random noise** — piecewise-constant values on a coarse grid (say 20 cells) sampled from a fixed seed per session, interpolated to the render grid. Shows high-frequency modes dying fastest.

Important interaction with BCs: some ICs don't satisfy some BCs at $t=0^+$ (e.g., a square pulse doesn't satisfy $u(0)=0$ at its edges). The eigenfunction expansion handles this gracefully — the reconstructed $f$ will exhibit Gibbs-like ringing near the boundaries, and that ringing will diffuse away in the first few frames. This is not a bug; it's a teaching opportunity.

## Controls

Laid out in one or two rows below the canvas, using the existing `createControlPanel` / `createButton` / `createSlider` helpers on `P5DemoBase`:

- **Initial condition** — dropdown (5 presets)
- **Boundary condition** — dropdown (Dirichlet / Neumann / Periodic)
- **Play / Pause** — button
- **Reset** — button (jumps to $t = 0$)
- **Time scrubber** — slider from $0$ to $T_{\text{BC}}$ (as fraction 0–1 internally). Dragging pauses autoplay, releases the playhead when released.
- **Speed** — slider 5s–60s (total wall-clock duration for a full decay), default 20s
- **Sine mode $n$** — slider 1–8, *visible only when Sine IC is selected*

No diffusivity slider — redundant with speed.

## Colormap

A diverging colormap for temperature $u \in [-1, 1]$:

- $u = -1$: deep cold blue (e.g., `#1d3a8a`)
- $u = 0$: neutral (white in light mode, dark-neutral in dark mode to maintain contrast)
- $u = +1$: deep hot red (e.g., `#b2182b`)

Interpolation uses p5's `lerpColor` between a small set of keystops. The midpoint color swaps on dark-mode toggle (via the existing `onColorSchemeChange` hook).

Lives in a small helper module colocated with the demo (`colormap.ts`) — no need to promote to the framework unless a second demo needs it.

## Architecture

Three small files, each with one purpose:

### `mathnotes/demos/differential-equations/heat-equation/solver.ts`

Pure math. No p5, no DOM. Functions:

- `type BC = 'dirichlet' | 'neumann' | 'periodic'`
- `type IC = (x: number) => number`
- `computeCoefficients(ic: IC, bc: BC, N: number, L: number): Coeffs` — runs the basis inner products numerically
- `evaluate(coeffs: Coeffs, x: number[], t: number, alpha: number): Float32Array` — returns $u$ at each query $x$

This is the unit most worth testing independently: given a pure eigenfunction as IC, coefficients should pick out one mode; given a constant IC with Neumann BC, the solution should be constant forever; periodic with $f(x)=\sin(2\pi x)$ should decay at the right rate. A few cheap sanity tests, not a full suite.

### `mathnotes/demos/differential-equations/heat-equation/colormap.ts`

`temperatureToColor(p: p5, u: number, isDark: boolean): p5.Color`. Plus a tiny `initialConditions.ts` (or an inline record) listing the five presets.

### `mathnotes/demos/differential-equations/heat-equation/index.ts`

The demo class, extending `P5DemoBase`. Responsibilities:

- Owns control wiring (dropdowns, sliders, buttons)
- Owns the p5 sketch: each `draw()` computes the current $t$ from wall-clock, calls `solver.evaluate`, renders the heat strip and line plot
- Handles dark-mode repaint via `onColorSchemeChange`
- Recomputes coefficients whenever IC or BC changes
- Exports `default` factory and `metadata`

### CSS

Most controls reuse the existing shared classes from `styles/demo-components.css` (`demo-controls`, `demo-slider-container`, `button`, `select`, `label`, `slider`) via the `createControlPanel` / `createButton` / `createSlider` / `createSelect` helpers from `demos-framework/src/ui-components.ts`. Any demo-specific styling (e.g., margin between heat strip and line plot, dynamic show/hide of the mode-$n$ slider row) goes in a new `styles/heat-equation.module.css` following the same pattern as `dilution-calculator.module.css`. No inline styles. Style prefix `heat-equation`.

### Registration

Add an entry to `demos-framework/src/main.ts` for `'heat-equation'` pointing at the new module.

### Markdown integration

Insert `{% include_demo "heat-equation" %}` into `heat.md`, probably right after the "initial-boundary value problem" equations (7)–(9), before the link to separation-of-variables.

## Data Flow Summary

```
User changes IC or BC
    → recompute coefficients (one-time, ~1ms)
Animation frame
    → compute current sim-time t from wall-clock + playback state
    → solver.evaluate(coeffs, x_grid, t, alpha)
    → render heat strip (colormap each pixel)
    → render line plot (polyline)
    → update scrubber position
```

## Testing / Verification

- Run the dev server; load the heat.md page; confirm the demo appears.
- Test all 15 (IC × BC) combinations load without errors.
- For the Sine IC with Dirichlet BC at $n=3$, confirm the profile decays as $e^{-9\pi^2 t}$ (spot-check with scrubber).
- Flip dark mode; confirm colormap midpoint adjusts and everything stays readable.
- Scrub to the end of the timeline; confirm equilibrium: zero for Dirichlet, mean of IC for Neumann, mean of IC for periodic.
- Screenshot via `./scripts/crawl-demos.py -d heat-equation` and verify visually via `--ask`.

## Out of Scope (YAGNI)

- Non-zero Dirichlet endpoints
- Source term $P(x, t)$
- Spatially varying $\alpha(x)$
- Mouse-draw IC
- 2D heat equation
- Ring visualization for periodic (strip is fine)
- Per-demo colormap choice

## Open Risks

- **Coefficient-integral cost:** 64 modes × 400-pt trapezoidal integration = 25k multiplies per IC change. Fine.
- **Per-frame render cost:** 64 modes × 400 render points = 25k multiplies per frame. At 60fps = 1.5M ops/sec. Trivial.
- **Square-pulse Gibbs:** Mode truncation produces visible ringing at $t=0$ that diffuses quickly. Acceptable; matches physical intuition about sharp fronts.
