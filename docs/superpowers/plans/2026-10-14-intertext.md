# `\intertext` / `\shortintertext` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render amsmath's `\intertext{...}` and mathtools' `\shortintertext{...}` inside `align*`-family environments as a wrapping, margin-flush prose row that preserves the alignment, in native MathML, in all three browser engines.

**Architecture:** A MathJax 3 TeX extension registered inside the latexblocks build worker (no MathJax fork) pushes a marked row onto the alignment's own `mtable`. A worker post-pass adds flank columns and spans and rewrites the prose cell to an HTML span (inside `mtext`, an HTML integration point) with nested inline `math`. Library CSS does the full-width/centering/wrapping layout, measured in Chromium, Firefox and WebKit.

**Tech Stack:** MathJax 3.2.2 es5 bundle (`MathJax._` internals), Node 24 ESM worker, PostCSS-built library stylesheet, Python 3.14 + pylatexenc, pytest (latexblocks via `./dev.sh`), Playwright (crawler image) for layout verification.

**Spec:** `docs/superpowers/specs/2026-10-14-intertext-design.md`

## Global Constraints

- No MathJax fork; no vendored third-party code; Node ≥ 24; Python ≥ 3.14.
- Unsupported LaTeX is a loud build error with `file:line`, never silent.
- latexblocks web assets are generated (`./dev.sh node build.mjs`); edit `frontend/css/latexblocks.css`, commit the regenerated `src/latexblocks/assets/latexblocks.css`.
- No inline JS; CSS only in stylesheets.
- Commits only when the user asks ("ship it").
- Behavior must mirror amsmath/mathtools (allowed environments, mid-row use, last-line use).

## Review Focus

1. `\intertext` right after `\begin{align*}` (before any equation): must produce a text row first, no empty equation row.
2. Two `\intertext` in a row: two text rows, no empty row between.
3. A `\tag{}` row in the same table: flanks must wrap the equation cells, not the label; the Core rewrite must still move the label last.
4. Prose containing `<`, `&`, `"`: must stay escaped inside the span; a nested matrix in `$...$` inside the prose must not confuse the cell scanner.
5. A page whose only math is one such display: description and snippet derivation must not see MathML fragments (nested `math` regex).

---

### Task 1: Worker TeX extension and post-pass (latexblocks)

**Files:**
- Create: `src/latexblocks/assets/tex-intertext.mjs`
- Modify: `src/latexblocks/assets/tex2mml-worker.mjs` (init config, `tex2mml`, output pipeline)
- Test: `test/test_mathml.py`

**Interfaces:**
- Produces: `registerIntertext(MathJax)` (call from `startup.ready` before `defaultReady`), `layoutIntertext(root) -> boolean` (MmlNode post-pass; true if any table had intertext rows), `intertextCellsToHtml(mml) -> string` (serialized-MathML pass).
- Markup contract: see spec. Classes: `math.has-intertext`, `mtable.intertext`, `mtd.intertext-flank`, `mtr.intertext`, `mtd.intertext[.intertext-short]`, `span.intertext-text`.

- [ ] Write failing worker tests (`test/test_mathml.py`):

```python
def test_worker_intertext_markup_contract():
    (r,) = worker_roundtrip([{"id": 1, "latex":
        "\\begin{align*} a &= b \\\\ \\intertext{and so, since $x<1$ we get} c &= d \\end{align*}",
        "display": True}])
    m = r["mathml"]
    assert "error" not in r, r
    assert m.startswith('<math') and 'class="has-intertext"' in m.split(">")[0]
    assert 'class="intertext"' in m and 'width="100%"' in m
    assert 'columnalign="center right left center"' in m
    assert m.count('class="intertext-flank"') == 4
    assert '<mtr class="intertext"><mtd columnalign="left" class="intertext" columnspan="4">' in m
    assert '<mtext><span class="intertext-text">and so, since <math>' in m
    assert '</math> we get</span></mtext></mtd></mtr>' in m
    assert '&lt;' in m  # the < inside the nested math stays escaped
    assert m.count('<math') == 2


def test_worker_intertext_variants():
    reqs = [{"id": i, "latex": t, "display": True} for i, t in enumerate([
        "\\begin{gather*} a = b \\\\ \\intertext{thus} c = d \\end{gather*}",    # 1 column
        "\\begin{align*} a &= b \\intertext{mid-row, no \\\\\\\\ before} c &= d \\end{align*}",
        "\\begin{align*} a &= b \\\\ \\intertext{last line} \\end{align*}",
        "\\begin{align*} \\intertext{first} a &= b \\end{align*}",
        "\\begin{align*} a &= b \\\\ \\shortintertext{short} c &= d \\end{align*}",
        "\\begin{align*} a &= b \\\\ \\intertext{line one\n   line two} c &= d \\end{align*}",
        "\\begin{align*} a &= b \\tag{1} \\\\ \\intertext{tagged} c &= d \\end{align*}",
    ])]
    rs = worker_roundtrip(reqs)
    for r in rs:
        assert "error" not in r, r
    assert 'columnspan="3"' in rs[0]["mathml"]
    assert rs[1]["mathml"].count("<mtr") == 3          # row ended automatically
    assert rs[2]["mathml"].count("<mtr") == 2          # text row may be last
    assert rs[3]["mathml"].count("<mtr") == 2 and rs[3]["mathml"].index('class="intertext"') < rs[3]["mathml"].index("<mi>a</mi>")
    assert 'class="intertext intertext-short"' in rs[4]["mathml"]
    assert "line one line two" in rs[5]["mathml"]
    tagged = rs[6]["mathml"]
    assert "mlabeledtr" not in tagged and 'class="math-tagged"' in tagged
    assert re.search(r'<mtr><mtd class="intertext-flank"></mtd>.*<mtd class="intertext-flank"></mtd><mtd class="math-tag"', tagged)


def test_worker_intertext_invalid_uses_are_errors():
    bad = [
        "\\begin{aligned} a &= b \\\\ \\intertext{x} c &= d \\end{aligned}",
        "\\begin{align*} \\begin{split} a &= b \\\\ \\intertext{x} c &= d \\end{split} \\end{align*}",
        "\\begin{cases} 1 & x \\\\ \\intertext{x} 0 & y \\end{cases}",
        "\\begin{align*} a &= \\left( b \\intertext{x} \\right) \\end{align*}",
        "a \\intertext{x} b",
    ]
    for r in worker_roundtrip([{"id": i, "latex": t, "display": True} for i, t in enumerate(bad)]):
        assert "error" in r and "Invalid use of \\intertext" in r["error"], r
```

- [ ] Run `./dev.sh pytest test/test_mathml.py -q -k intertext`; expect failures ("Undefined control sequence").
- [ ] Create `src/latexblocks/assets/tex-intertext.mjs` (code in the implementation; exports above).
- [ ] Wire the worker: `startup.ready` registers the configuration; `packages['[+]']` adds `intertext`; `tex2mml` runs `layoutIntertext(root)` and sets `class="has-intertext"` on the root; the output pipeline runs `intertextCellsToHtml` after newline stripping and before `toMathMLCore`.
- [ ] Run the worker tests; expect pass. Run the whole suite.

### Task 2: Library CSS

**Files:**
- Modify: `frontend/css/latexblocks.css` (variable prelude: `--font-prose`, `--lb-math-scale`; MathML fixups section)
- Regenerate: `src/latexblocks/assets/latexblocks.css` via `./dev.sh node build.mjs`

- [ ] Add to the prelude `--font-prose` (mathnotes body font list) and `--lb-math-scale: 1.125`; change `math { font-size: 1.125em }` to `calc(1em * var(--lb-math-scale))`.
- [ ] Add the intertext rules after the `mrow.mml-cancel` rule (see spec recipe; flank rule must come after the `math-tagged` first-child rule).
- [ ] Rebuild assets; `git diff --stat` shows only the expected generated changes.

### Task 3: Nesting-aware math element scanner (latexblocks)

**Files:**
- Modify: `src/latexblocks/structured_math.py` (`_MATH_EL_RE` users), `src/latexblocks/page_renderer.py:90`
- Test: `test/test_structured_math.py`

- [ ] Failing test:

```python
def test_math_to_dollar_text_tolerates_nested_math():
    h = ('<p>A <math alttext="\\begin{align*} a \\intertext{so $x$} \\end{align*}" display="block">'
         '<mtable><mtr><mtd><mtext><span>so <math><mi>x</mi></math> then</span></mtext></mtd></mtr></mtable>'
         '</math> B <math alttext="y"><mi>y</mi></math> C</p>')
    assert math_to_dollar_text(h) == "<p>A $$\\begin{align*} a \\intertext{so $x$} \\end{align*}$$ B $y$ C</p>"
```

- [ ] Add `iter_math_elements(html)` / `sub_math_elements(html, repl)` to `structured_math.py`; use in `math_to_dollar_text` and in `page_renderer._generate_description`.
- [ ] Tests pass.

### Task 4: Processor tests and library docs (latexblocks)

**Files:**
- Modify: `test/test_latex_processor.py`, `README.md` (dialect section)

- [ ] Tests: `prose()` of an `align*` with `\intertext` contains `class="intertext-text"`; `\bal a &= b \\ \intertext{x} \eal` is a `LatexDialectError` whose message contains `Invalid use of \intertext`.
- [ ] README: in the display-math sentence, add that `\intertext{...}` / `\shortintertext{...}` work inside `align*`/`gather*` (prose plus `$...$`), not inside `aligned`/`\bal`.

### Task 5: mathnotes side

**Files:**
- Modify: `latex/mathnotes.sty` (add `\RequirePackage{mathtools}` after amsmath), `latex/README.md:79-82`, `styles/theme.css` (`--font-prose`), `styles/main.css:54` (body uses it)

- [ ] Compile a sample with both macros via `TEXINPUTS=./latex: pdflatex`; expect success.
- [ ] README line "`\intertext` is not supported" becomes a description of support and limits.

### Task 6: Verification

- [ ] `docker restart mathnotes-static-builder` (the watcher's worker process must reload the new `.mjs`), add a temporary content page using both macros, confirm it builds and the crawler reports no console/CSP errors.
- [ ] Rerun the Playwright bounding-box probe against the served page in Chromium, Firefox and WebKit: alignment point equal across rows, table width equals container width, text block starts at the container's left edge, text height ≥ 2 lines for a long sentence, `scrollWidth` equals client width.
- [ ] Remove the temporary page.
