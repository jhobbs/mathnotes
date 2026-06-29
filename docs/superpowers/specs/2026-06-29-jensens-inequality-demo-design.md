# Jensen's Inequality Interactive Demo — Design

**Date:** 2026-06-29
**Page:** `content/applied-math/probability-and-statistics/expectation.md` (the `jensens-inequality` theorem)
**Demo name (registry key):** `jensens-inequality`
**Source file:** `demos/probability/jensens-inequality.ts`

## Goal

An interactive demonstration of Jensen's inequality for a discrete random variable with
finite support. The user picks a convex or concave function φ, places 2–5 points
(the support of `X`) along the x-axis, sets a weight `pᵢ` on each, and sees both sides of

$$\varphi(E[X]) \;\lessgtr\; E[\varphi(X)]$$

simultaneously, along with the full region of reachable `(E[X], E[φ(X)])` values.

This illustrates the n-point induction proof already on the page: the achievable region is
the convex hull of the support points lifted onto the curve.

## Approach

Built on `P5DemoBase` (p5.js canvas), modeled on the existing `cobweb` demo, which already
provides: function presets, a custom-expression box parsed with mathjs, axis/curve plotting,
and slider/input controls. Unlike cobweb we do **not** need symbolic derivatives — Jensen only
requires *evaluating* φ at the support points and at the mean.

Plotly was rejected: there is a single 2D curve, draggable dots, and a shaded polygon — all
native to p5; Plotly's 3D camera adds nothing.

## Components

### 1. Function selection
- A `<select>` grouped into:
  - **Convex:** `x^2`, `exp(x)`, `x^4`, `cosh(x)`, `abs(x)`
  - **Concave:** `log(x)`, `sqrt(x)`, `-x^2`, `sin(x)` (on `[0, π]`)
- A custom-expression `<input>` (variable `x`), parsed/compiled with mathjs, reusing cobweb's
  parse-error / parse-warning handling. On parse failure, keep the last good φ and show a warning.
- Each preset carries its domain `[xMin, xMax]`. The y-range auto-fits the plotted curve over the
  domain (with a small margin), recomputed when φ or domain changes.
- **Convexity classification:** for any φ (preset or custom) sample the second finite difference
  across the domain. Sign everywhere `≥ 0` → convex; `≤ 0` → concave; mixed → "neither". A small
  badge shows the result. This drives the inequality direction (`≤` convex, `≥` concave; "neither"
  shows "Jensen may not hold globally" and still displays both values).

### 2. Points (support of X)
- 2–5 dots rendered **on the curve** at `(xᵢ, φ(xᵢ))`.
- Drag horizontally to move `xᵢ`, clamped to the domain. Hit-test by screen-space distance to the
  nearest dot on `mousePressed` (electric-field pattern); update on `mouseDragged`; release clears.
- `[+]` / `[−]` buttons add/remove a point, clamped to the range 2–5. A new point is inserted at a
  sensible default x (e.g. midpoint of the current spread) with a default weight, then weights renormalize.

### 3. Weights `pᵢ`
- One slider per point (range 0–1). Values are **auto-normalized** so `Σ pᵢ = 1` for all displays
  and computations. Live readout of each normalized `pᵢ` and a `Σ = 1.00` line.
- Sliders are created/destroyed as points are added/removed.
- Guard: if all sliders are 0, fall back to uniform weights to avoid divide-by-zero.

### 4. The region (centerpiece)
- Compute the 2D **convex hull** (monotone chain) of `{(xᵢ, φ(xᵢ))}` and fill it translucent.
- This is exactly the set of `(E[X], E[φ(X)])` reachable as the weights range over the simplex —
  "where the expected value could be."
- Degenerate hull (coincident points, or n collinear) collapses to a segment/point; render without error.

### 5. Both sides of the inequality
- Vertical guide line at `x = E[X] = Σ pᵢ xᵢ`.
- `○` hollow marker on the curve at `(E[X], φ(E[X]))` — the LHS, `φ(E[X])`.
- `●` filled marker at `(E[X], E[φ(X)] = Σ pᵢ φ(xᵢ))` — the RHS; always inside the hull.
- The vertical segment between `○` and `●` is the **Jensen gap**, drawn and labeled.
- Readout panel: `φ(E[X]) = …  ≤/≥  E[φ(X)] = …`, plus the gap magnitude. The relation symbol
  flips with the convexity classification; the larger side is emphasized.

## Data flow

State:
```
{ exprString, compiledF, type: 'convex'|'concave'|'neither',
  domain: [xMin, xMax], yRange: [yMin, yMax],
  points: [{ x, weight }],          // 2..5 entries
  draggingIndex: number | null }
```
Any interaction (drag, weight slider, preset change, custom expr, add/remove) updates state, then
recomputes `E[X]`, the `φ(xᵢ)` values, `E[φ(X)]`, `φ(E[X])`, and the hull, and triggers a redraw.
Full redraw every frame (cheap; same as cobweb). Colors come from `this.colors` for dark-mode support.

## Error handling & edge cases
- Invalid custom expression → warning text, retain last good φ.
- Points clamped to the domain on drag and on domain change (preset switch).
- All-zero weights → uniform fallback.
- Coincident points / almost-surely-constant `X` → gap `0`, hull collapses to a point; equality case.
- "neither"-classified φ → still shows both values and the actual gap, with a caution note.

## Placement & registration
- `demos-framework/src/main.ts`: add
  `'jensens-inequality': () => import('@demos/probability/jensens-inequality'),`
- `expectation.md`: insert `{% include_demo "jensens-inequality" %}` immediately **after** the
  Jensen theorem block (`:::` close), leaving the theorem/proof markup untouched.
- File exports: `class JensensDemo extends P5DemoBase`, `export const metadata: DemoMetadata`,
  and `export default function createDemo(container, config) { return new JensensDemo(...).init(); }`.

## Verification
- `npm run type-check` (and confirm the static-builder container did not exit on a TS error).
- Single-page crawl for JS/CSP errors:
  `./scripts/crawl-dev.sh --single-page "http://web-dev:5000/mathnotes/applied-math/probability-and-statistics/expectation"`.
- Screenshot review: `./scripts/crawl-demos.py -d jensens-inequality`, inspected via `--ask`
  (never read screenshots directly).
- Manual check of light + dark mode and mobile viewport.

## Out of scope (YAGNI)
- Continuous random variables / density integration (discrete support only).
- Animating the weights to sweep the region (static current-state dot is enough).
- Tangent-line / supporting-hyperplane proof visualization.
- Persisting state in the URL hash.
