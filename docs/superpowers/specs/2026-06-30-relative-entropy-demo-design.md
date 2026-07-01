# Relative Entropy (KL Divergence) Interactive Demo — Design

**Date:** 2026-06-30
**Page:** `content/applied-math/misc/information.md` (the `TODO: Relative Entropy` placeholder, ~line 388)
**Demo name (registry key):** `relative-entropy`
**Source file:** `demos/information-theory/relative-entropy.ts`

## Goal

An interactive demonstration of the relative entropy (Kullback–Leibler divergence) between two
discrete distributions over the same finite alphabet of `n` symbols (`n = 2..5`):

$$ D(P \| Q) = \sum_{i} P_i \log \frac{P_i}{Q_i}. $$

The user drags the bars of a **reference** distribution `P` and an **approximating** distribution
`Q` and watches `D(P‖Q)` update live, alongside the reverse divergence `D(Q‖P)` (asymmetry) and the
decomposition into cross-entropy minus entropy, `D(P‖Q) = H(P,Q) − H(P)`.

This makes concrete three facts: relative entropy is non-negative and zero iff `P = Q` (Gibbs),
it is **asymmetric** (`D(P‖Q) ≠ D(Q‖P)` in general), and it blows up (`→ ∞`) when `Q` assigns
near-zero probability to a symbol that `P` considers likely.

## Approach

Built on `P5DemoBase` (p5.js canvas), modeled directly on the existing `stochastic-matrix` demo,
which already provides the exact interaction we need: side-by-side bar charts, per-bar drag
(`draggingBar`, `mousePressed`/`mouseDragged`/`mouseReleased`), raw-height storage normalized to a
probability vector on use (`normalize(baseRaw)`), and a `createControlPanel()` with
`makeRow`/`makeLabel`/`makeSelect`/`makeBtn`/`readoutEl` helpers.

Plotly was rejected: this is 2D bars with drag interaction — native to p5; Plotly's 3D camera and
data-plot machinery add nothing.

## Components

### 1. Two distributions (side-by-side)
- **Left chart: reference `P`.** **Right chart: approximating `Q`.** Each has `n` bars over the same
  symbol index `1..n`, sharing a common y-axis (probability, `[0, vmax]`). Distinct colors for `P`
  and `Q`.
- **Ghost overlay:** behind each chart, draw a faint outline of the *other* distribution at the
  matching x-positions, so `P_i` vs `Q_i` is readable per symbol without looking across the gap.
- Reuse the `barSlots` / `drawBars` layout helpers from `stochastic-matrix` (bar width, centering,
  baseline, `barAreaH`).

### 2. Drag + normalization
- Store `pRaw[]` and `qRaw[]` (raw per-bar heights). The displayed/used distributions are always
  `P = normalize(pRaw)`, `Q = normalize(qRaw)` so `Σ = 1` (the stochastic-matrix precedent).
- Hit-test on `mousePressed`: determine which chart (left/right) and which bar from x-position, only
  when the pointer is within the chart's vertical band. `draggingBar = { side, index }`.
- On `mouseDragged`, set the raw height from `(baseline − mouseY) / barAreaH * vmax`, clamped to
  `[ε, vmax]` with a small `ε` (e.g. `0.001`) so no `Q_i` is ever exactly 0.
- `mouseReleased` clears `draggingBar`.

### 3. Contribution strip
- Between/below the two charts, a signed bar per symbol for the term `P_i log(P_i / Q_i)` (positive
  above a zero axis, negative below). These sum to `D(P‖Q)`, mirroring how `zipf-entropy` shows
  self-information per bar. Color positive vs negative distinctly; label the running sum.

### 4. Readout panel (monospace `readoutEl`)
- `D(P‖Q) = … <unit>` — prominent.
- `D(Q‖P) = … <unit>` — reverse divergence, to expose asymmetry.
- Decomposition line: `D(P‖Q) = H(P,Q) − H(P)` with `H(P) = …`, cross-entropy `H(P,Q) = …`.
- When any `Q_i` is dragged toward `ε` while `P_i` is non-trivial, the corresponding term grows
  large; surface a `D(P‖Q) → ∞` style indication (e.g. show the large value and a caption noting the
  blow-up) rather than a raw huge number only.

### 5. Controls (one control row)
- `n:` selector `{2, 3, 4, 5}` → `setN(n)` (resets `pRaw`/`qRaw` to sensible defaults).
- `base:` selector `bits (log₂) / nats (ln) / hartleys (log₁₀)`, matching `zipf-entropy` on the same
  page; changes the log base and unit label used in all readouts.
- `Reset` button → restore default `P` and `Q`.
- `Q := P` button → copy `pRaw` into `qRaw`, driving `D = 0` (the equality case).

## Data flow

State:
```
{ n: 2..5,
  pRaw: number[],  qRaw: number[],           // raw bar heights, length n
  base: { value, label, unit },              // bits / nats / hartleys
  draggingBar: { side: 'P'|'Q', index } | null }
```
Any interaction (drag, `n` change, base change, reset, `Q := P`) updates state, then the draw pass
recomputes `P = normalize(pRaw)`, `Q = normalize(qRaw)`, and from them `D(P‖Q)`, `D(Q‖P)`, `H(P)`,
`H(P,Q)`, and the per-symbol contributions, and refreshes the readout. Full redraw every frame
(cheap; same as the precedent demos). Colors come from the demo's color set for dark-mode support
(`onColorSchemeChange`).

Math (log base `b` selectable; bits by default):
```
D(P‖Q) = Σ_i P_i · log_b(P_i / Q_i)
H(P)   = − Σ_i P_i · log_b(P_i)
H(P,Q) = − Σ_i P_i · log_b(Q_i)
D(P‖Q) = H(P,Q) − H(P)
```
Terms with `P_i = 0` contribute `0` (limit `0·log 0 = 0`); `Q_i ≥ ε > 0` always, so no true divide-
by-zero, but `D` can be large.

## Error handling & edge cases
- All-zero raw heights for a chart → uniform fallback before normalizing (avoid `0/0`).
- `P_i = 0` handled as a `0` contribution; `Q_i` floored at `ε` so ratios stay finite.
- `n` change rebuilds `pRaw`/`qRaw`; `draggingBar` cleared.
- Very large `D` (a `Q_i → ε` with `P_i` sizeable) → display the value plus a "→ ∞" caption instead
  of an unbounded number filling the panel.

## Placement & registration
- `demos-framework/src/main.ts`: add
  `'relative-entropy': () => import('@demos/information-theory/relative-entropy'),`
- `information.md`: insert **only** `{% include_demo "relative-entropy" %}` at the
  `TODO: Relative Entropy` placeholder. **No prose is authored** — the surrounding notes remain the
  author's to write; the `TODO` line stays.
- File exports: `class RelativeEntropyDemo extends P5DemoBase`,
  `export const metadata: DemoMetadata`, and
  `export default function createDemo(container, config): DemoInstance`.

## Verification
- `npm run type-check` in the static-builder container; confirm the container did not exit on a TS
  error (`docker ps -a | grep static-builder`, `docker logs mathnotes-static-builder`).
- Single-page crawl for JS/CSP errors:
  `./scripts/crawl-dev.sh --single-page "http://web-dev:5000/mathnotes/applied-math/misc/information"`.
- Demo-viewer isolation check at `http://localhost:5000/demos/#relative-entropy`.
- Screenshot review: `./scripts/crawl-demos.py -d relative-entropy`, inspected via `--ask` only
  (never read screenshots directly).
- Manual check of light + dark mode and mobile viewport.

## Out of scope (YAGNI)
- Continuous distributions / density integration (discrete finite support only).
- Authoring any notes prose (definitions, Gibbs' inequality, cross-entropy exposition) — the user
  owns the notes; the demo only ships the interactive figure and its embed.
- Animating `P`/`Q` or sweeping to trace the divergence over time.
- Persisting state in the URL hash.
- More than 5 symbols.
