# `\intertext` and `\shortintertext` design

Date: 2026-10-14. Status: approved in conversation.

## Goal

Content may use amsmath's `\intertext{...}` and mathtools' `\shortintertext{...}`
inside `align*` (and the other outer alignment environments) and the site
renders them the way LaTeX does: a prose interjection at the left margin,
full text width, wrapping as needed, with the equation alignment preserved
across it and the equations still centered. The PDF path keeps compiling.

Upstream MathJax has declined this for a decade (mathjax/MathJax#736; "no
plans" as of Nov 2025). The objection is layout, not parsing: MathML has no
intertext construct and a centered `mtable` cannot put text at the margin.
We do not fork MathJax. The macro is a TeX extension registered inside the
latexblocks worker, and the layout is solved with native-MathML markup plus
CSS that was measured in Chromium, Firefox and WebKit before this design was
written.

## Behavior (mirrors amsmath / mathtools)

- Allowed directly inside `align*`, `gather*`, `alignat*`, `flalign*` and
  their numbered forms (which the dialect rejects anyway). Anywhere else
  (`aligned`, so also `\bal…\eal`; `split`; `cases`; a matrix; inside an
  open group or `\left`) is a TeX error "Invalid use of \intertext", which
  the build reports with `file:line`.
- Works right after `\\`, and also mid-row: amsmath ends the row itself
  (`\ifvmode\else\\\fi`), so do we. May be the last thing in the
  environment.
- The argument is prose plus `$...$` (or `\(...\)`) inline math, parsed by
  MathJax's text-with-math parser, with the text escapes `\& \% \# \_ \$
  \{ \}`, `~` (nbsp), and LaTeX's grouping braces (removed). Newlines
  inside the argument collapse to spaces. Everything else is a loud error,
  as pdflatex would error or render differently: any other control sequence
  (`\emph`, `\ref`, `\\`), a bare `& # ^ _ %`, a blank line.
- `\shortintertext` is identical except for tighter vertical spacing.

## Markup contract (worker output)

For an `align*` with two columns and one intertext row:

```html
<math display="block" class="has-intertext" alttext="...">
  <mtable class="intertext" width="100%" displaystyle="true"
          columnalign="center right left center" columnspacing="0em" rowspacing="3pt">
    <mtr><mtd class="intertext-flank"></mtd><mtd>…</mtd><mtd>…</mtd><mtd class="intertext-flank"></mtd></mtr>
    <mtr class="intertext"><mtd class="intertext" columnalign="left" columnspan="4">
      <mpadded width="0"><mtext><span class="intertext-text">and so, since <math><mi>x</mi><mo>&lt;</mo><mn>1</mn></math> we get</span></mtext></mpadded>
    </mtd></mtr>
    <mtr>…</mtr>
  </mtable>
</math>
```

- `columnspan` = max cells in any equation row + 2 flanks. `columnalign`
  gets `center` prepended and appended (Firefox honors it); a per-gap
  `columnspacing` list gets `0em` at both ends.
- `\shortintertext` rows carry `class="intertext intertext-short"` on the
  `mtd`.
- A `\tag` row (`mlabeledtr`) becomes a plain `mtr` whose right flank IS
  the label cell (`class="intertext-flank math-tag"`, right-aligned). An
  extra auto column beside two 50% flanks sticks out past the display by
  its own width in Gecko and Blink; riding in the flank it sits on the
  margin. Such a table does not get the `math-tagged` class or rules.
- The `mpadded width="0"` around the prose takes it out of the table's
  intrinsic width: Gecko sizes a cell from its MathML content's max-content
  width (the whole sentence) regardless of the block's own width, so without
  it the table grows to the sentence instead of wrapping it (measured; a
  reflow does not fix it, and `contain: inline-size` does not help).
- `mtext` is an HTML text integration point, so the span is real HTML and
  the nested `math` elements are real MathML in every engine.

## Layout recipe (latexblocks CSS, measured)

- `math.has-intertext { container-type: inline-size }`;
  `mtable.intertext { width: 100cqw }` (an absolute length after
  resolution: WebKit resolved a `100%` table width against nothing once the
  prose sat in the `mpadded`, collapsing the table to its content); flanks
  `width: 50%` (placed after the `mtable.math-tagged > mtr > mtd:first-child`
  rule, which it ties on specificity).
- `mtd.intertext { text-align: left; padding-inline: 0 }` with block
  padding ~0.75em (short: ~0.25em top, 0.5em bottom).
- `.intertext-text { display: block; white-space: normal; width: 100cqw;
  -webkit-line-box-contain: block inline }`. The definite width is what the
  block wraps at (its intrinsic contribution is already zero via the
  `mpadded`). WebKit's MathML UA sheet sets `-webkit-line-box-contain:
  glyphs replaced`, inherited through `mtext`, which shrank the prose's line
  boxes to glyph height; the override restores normal leading.
- Flank cells get `padding-inline: 0` (the UA's 0.4em per cell would cost
  an alignment 28px of width in Chromium); a tooltip containing such a
  display gets a definite width (`.math-tooltip:has(math.has-intertext)`),
  since an inline-size container contributes no intrinsic width.
- Browser floor: container-query units (Chrome 105+, Firefox 110+, Safari
  16+). Older engines drop those declarations; Firefox then grows the table
  to the sentence, Safari 15 breaks the layout.
- Prose font and size: the page body font at the body size (undo the
  library's `math` scale). Nested inline math then gets the normal `math`
  scale of that size, the same as inline math in a paragraph.
- Known WebKit quirk, not caused by this work: any display math wider than
  its container grows the `math` box past the container instead of
  scrolling inside it (pre-existing). With intertext that also means the
  prose wraps at that grown width on a phone. Fix (separate change): host
  display math in an HTML wrapper that is the scroll and size container.

Why one table and not a split at the text: separate tables cannot share
column widths, so the alignment point would jump across the text. Why
flanks: with the table at full width, two equal percentage columns are the
only way to keep the equation group centered regardless of text width
(verified; proportional distribution otherwise shifts the alignment point).

## Downstream

Nested `math` elements break the two non-greedy `<math…</math>` regexes in
latexblocks (`structured_math.math_to_dollar_text`, page description in
`page_renderer`). Both move to a depth-aware scanner. The `alttext` override
in the worker already touches only the outer element.

## PDF path

`latex/mathnotes.sty` adds `\RequirePackage{mathtools}` (provides
`\shortintertext`; verified a sample using both macros compiles).

## Testing

- Worker tests (`test/test_mathml.py`): markup contract above; gather* span
  of 3; mid-row and last-line use; every error case; whitespace collapse;
  `\tag` row flank placement.
- Processor tests: an `align*` page renders the span; `\bal` + intertext is
  a loud `file:line` error.
- Nesting-aware math scanner tests.
- Final check: the Playwright probe (bounding boxes, three engines) rerun
  against a real built page served by `web-dev`.
