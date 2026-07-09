# Build-Time MathML Rendering — Design (Part 2)

**Date:** 2026-07-09
**Status:** Approved

## Goal

Replace client-side MathJax with build-time LaTeX→MathML conversion. The
`render_math()` seam installed in Part 1 (`latex_processor.py`) swaps its
body; pages ship native MathML rendered by the browser's MathML Core
engine, styled with a bundled STIX Two Math webfont. No math JavaScript on
the client at all.

This is **Part 2** of the markdown-removal/MathML effort. Part 1
(`2026-07-09-remove-markdown-layer-design.md`, shipped as `3600a97`)
guaranteed that `render_math(latex, display)` is the only place math
becomes output markup.

## Background / facts established during design

- All major browsers render MathML Core (Chrome 109+, Firefox, Safari).
- The `mathjax` npm package v3.2.2 — the same engine and version the
  client uses today — is already installed in the builder container and
  ships a Node entry point (`mathjax/es5/node-main.js`). Same parser
  server-side ⇒ every expression that renders today parses tomorrow.
- Math macros are single-sourced in `latex/mathnotes.sty` between
  `% BEGIN MATH MACROS` / `% END MATH MACROS`, currently parsed by
  `parseStyMacros` in `demos-framework/src/mathjax-init.ts`.
- Content inventory: ~9,000 math expressions; amsmath environments used:
  aligned (79), bmatrix (31), pmatrix (22), vmatrix (17), cases (8). No
  equation numbering, no `\eqref`, no `\enclose` (the configured MathJax
  `enclose` package is dead weight).
- **Plain-text math surfaces**: 289 auto-generated reference snippets and
  5 block titles contain `$…$` that client MathJax currently typesets
  inside link text / block headers / tooltip titles. These must be
  converted at build time too or they regress to raw dollar signs.
- Client MathJax touchpoints: `mathjax-entry.ts`, `mathjax-init.ts`,
  `mathjax.d.ts`, `mathjax_js_url` script tag in `templates/base.html`,
  one `typesetPromise` call in `tooltip-system.ts`, MathJax woff2 fonts
  copied into `static/dist/fonts/mathjax`. No demo uses MathJax.

## Decisions (made during brainstorm)

- **Engine:** MathJax v3.2.2 server-side (over temml / latex2mathml) — a
  different parser would invite a long tail of breakage across 9k
  expressions for no fidelity gain.
- **Font:** bundle **STIX Two Math** (woff2); pure MathML Core, no
  client fallback of any kind.
- **No hybrid mode:** MathJax is removed from the client entirely.

## Architecture

### Converter worker — `scripts/tex2mml-worker.mjs`

Node script, spawned once per build:
- Loads `mathjax/es5/node-main.js`, configured with the same TeX settings
  the client uses today minus dead weight: ams packages, macros parsed
  from `latex/mathnotes.sty` (the `parseStyMacros` logic moves here;
  the TS original is deleted with the client teardown). No `enclose`.
- Protocol: JSON lines on stdin/stdout. Request
  `{"id": n, "latex": "...", "display": true|false}` → response
  `{"id": n, "mathml": "<math ...>"}` or `{"id": n, "error": "message"}`.
- Output: serialized MathML (`display="block"` for display math) with
  `alttext` set to the original TeX source — for accessibility and for
  the verification harness.
- A TeX parse error is a per-request `error` response, never a worker
  crash; malformed protocol input terminates the worker with a nonzero
  exit.

### Python side — `mathnotes/mathml.py`

`MathConverter`: lazily spawns the worker on first use, writes requests
and reads responses synchronously (one in flight; the build is
single-threaded), restarts the worker if it dies, exposes `close()`. A
module-level singleton with an `atexit` hook covers the build script and
watch mode.

`render_math(latex, display)` in `latex_processor.py` keeps its exact
signature and delegates to the converter, returning the MathML string
(inserted raw — serializer output is well-formed markup). On a conversion
`error` it raises `MathConversionError`; the emitter's `_math(n)` catches
it and re-raises via `self._err(n, ...)` → `LatexDialectError` with
file:line. **Every unconvertible expression is a loud build failure.**
The proof-QED call in `render_block_html` (`\square`) cannot fail.

Performance: ~9k conversions through one persistent process ≈ seconds per
full build; the PageDoc mtime cache limits watch-mode rebuilds to changed
files. No disk cache (YAGNI unless full builds measurably hurt).

### Plain-text math surfaces — `text_with_math_to_html()`

One helper (in `structured_math.py`): HTML-escape prose, convert `$…$`
spans via `render_math(…, display=False)`. Used at exactly three places:
1. `ref_resolver.py` — auto link text from `content_snippet` (289 blocks)
   and synonym/title link text (replacing the current `html.escape`-only
   paths for text that may contain math).
2. `render_block_html` — block header titles (5 titles with math).
3. Tooltip `title`/`type` strings in `get_tooltip_data` and the builder's
   global tooltip JSON.

`page_renderer._generate_description` strips `<math>…</math>` elements
(replacing the dead `$…$` regexes) so page descriptions stay plain prose.

### Client teardown

Delete: `demos-framework/src/mathjax-entry.ts`, `mathjax-init.ts`,
`mathjax.d.ts`; the `mathjax_js_url` script tag in `templates/base.html`
and its context global; the `typesetPromise` call in `tooltip-system.ts`
(tooltips now carry baked MathML); the esbuild entry for the MathJax
bundle; the MathJax font copying into `static/dist/fonts/mathjax`. The
`mathjax` npm package remains a dependency — the build worker needs it.

### Font and CSS

- `STIX Two Math` woff2 (single file, full face — subsetting is out of
  scope) in `static/fonts/`, `@font-face` with `font-display: block` (brief
  invisibility beats math reflowing from fallback glyphs).
- `math { font-family: 'STIX Two Math', math; }` plus a display-math
  wrapper rule giving wide equations `overflow-x: auto` (MathJax's scroll
  containers are gone). Follow STYLE.md conventions for file placement
  and custom properties.
- Dark mode: nothing to do — MathML inherits `currentColor`.

## Error handling

- Unconvertible TeX: `LatexDialectError` with file:line (build fails).
- Worker startup failure (node/package missing): immediate hard error
  naming the command it tried to run.
- Worker crash mid-build: one restart + retry of the in-flight request;
  a second failure is a hard error.

## Non-goals

- Changing any `.tex` content or the dialect.
- Equation numbering, `\eqref`, other new math features.
- A JS or image fallback for non-MathML browsers (MathML Core coverage
  is universal in current browsers).
- Server-side rendering of demo-internal text (demos never used MathJax).

## Verification

1. **The build is the test:** all ~9k expressions must convert or the
   build fails with file:line.
2. **Semantic diff:** extend `scripts/semantic_diff.py` to extract math
   from `<math alttext="…">` when present (falling back to `$…$` text
   for the baseline side). Compare the new build against the current
   production baseline: math *content* must match modulo delimiter
   cosmetics; all other fields must stay within the accepted-differences
   set from Part 1.
3. **Unit tests:** worker protocol round-trip (incl. error responses and
   macro expansion, e.g. `\vec`), `render_math` MathML shape,
   `text_with_math_to_html` (prose escaping + math conversion + no
   double-escaping), description stripping.
4. **Crawl:** zero console/CSP errors; page-weight spot-check (MathJax
   bundle gone).
5. **Owner visual inspection** — the real quality gate for MathML Core
   rendering, light and dark, desktop and mobile.

## Success criteria

- No math JavaScript shipped to the client; MathJax bundle and its fonts
  gone from `static/dist`.
- All math (page prose, block bodies, headings, block titles, reference
  link text, tooltips) renders as MathML with STIX Two Math.
- Build fails loudly on unconvertible TeX.
- Semantic diff clean per above; crawl clean; owner approves visually.
