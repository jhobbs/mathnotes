# LaTeX content support

Content files under `content/` are written in `.tex`. The site build parses
them directly, via the [latexblocks](https://github.com/jhobbs/latexblocks)
library's `latex_processor.py` (this repo consumes it as a pinned dependency;
see `requirements.txt` and `mathnotes/config.py:configure_latexblocks()`) —
there is no intermediate markup format; see [PARSING.md](../PARSING.md) for
the full pipeline. This directory exists so the same files also compile to
PDF locally.

## Compile a content file

    cd <repo-root>
    TEXINPUTS=./latex: pdflatex -output-directory=/tmp content/topology/compact-sets.tex

## Editing in TeXstudio / Overleaf

Content files are self-contained documents; the only non-stock dependency is
`mathnotes.sty` (which itself uses only standard packages: amsmath, amssymb,
amsthm, hyperref, listings, graphicx, xstring, cancel).

- **Overleaf**: upload `mathnotes.sty` alongside the `.tex` file (plus any
  images from the same content directory).
- **TeXstudio/local**: either set `TEXINPUTS` to include `<repo>/latex`, or
  add the repo's `latex/` dir to your distro search path
  (`tlmgr conf texmf TEXMFHOME ...` or just copy the .sty next to the file).

Expected limitations outside the site: `\dref` to blocks defined on *other*
pages are dead links in the PDF (they compile, with warnings); web images
render as a placeholder box; `\includedemo` renders a note.

The math macros section of `mathnotes.sty` (between the `MATH MACROS`
markers) is the single source of truth for both pdflatex and the site's
MathJax — `mathjax-init.ts` parses it at bundle time. Add new math macros
there and both renderers pick them up.

## The dialect

See `docs/superpowers/specs/2026-07-07-latex-content-format-design.md`.
Highlights:

- Standalone documents (`\documentclass{article}` + `\usepackage{mathnotes}`
  + `\begin{document}`) or bare fragments both work on the site; only
  standalone files compile with pdflatex.
- `\title{...}` / `\description{...}` / `\slug{...}` = page metadata.
- `\source{title={...}, author={...}, type=book, ...}` = a page source
  (repeatable; same keys as `sources.yaml`). Braced values may contain
  commas; bare values may not.
- `\synonyms{open covers, coverings}` on a definition (next to `\label`)
  = index aliases (alternate names that also resolve to the block).
  `\tags{topology}` works on any block.
- `\notation{\integers}{\mathbb{Z}}` at the top of a block (next to
  `\label`) declares a zero-argument math macro usable in math on any page;
  on the site every use links back to the declaring block (with tooltip and
  "Referenced by" entry), and the block header shows "Notation: ℤ".
  Expansions may use MATH MACROS and MathJax builtins but not other
  notation macros. For pdflatex, the build regenerates
  `latex/mathnotes-notation.sty` (committed like a lockfile) so cross-file
  uses compile standalone.
- Theorem-like environments follow the amsthm sibling convention
  (`\begin{proof}` *after* `\end{theorem}`); the site re-nests them.
  `\detach` stops a following note/remark from attaching to the previous
  theorem. Block environments may also nest literally
  (`\begin{note}` inside `\begin{remark}`) for structures the sibling
  convention cannot express; prose around nested blocks stays in place.
- `\dref{label}` = link to a block with auto-generated text;
  `\dref[custom text]{label}` = link with custom text;
  `\dref{type:label}` = link with type validation (e.g. `\dref{theorem:ftc}`).
- `\@{label}` / `\@[custom text]{label}` = shorthand for `\dref` (the
  kernel's `\@` only adjusts sentence spacing, which this prose never uses).
- `\pagelink{slug}` / `\pagelink[custom text]{slug}` = page link (rendered as
  plain text in PDF).
- `\includedemo{name}` = interactive demo placeholder.
- `\dembed{label}` = transclude a block's full content (degrades to a pointer in PDF).
- Display math via `\[ ... \]`.
- `\href{url}{text}` for external links — escape `%` and `#` in URLs as
  `\%` / `\#` (hyperref's own convention).
- `\includegraphics[alt={...}, title={...}]{path}` for images; with
  `width=344px, height=336px` a sized raw `<img>` is emitted instead.
- `itemize`/`enumerate` may nest one level.
- `verbatim` or `\begin{lstlisting}[language=Python]` for code blocks.
- `\begin{tabular}{colspec}` for tables — see below.
- Unsupported LaTeX is a build error by design; extend the dialect in
  the [latexblocks](https://github.com/jhobbs/latexblocks) library's
  `latex_processor.py` deliberately.
- Author notes: use LaTeX's native `%` comment. It's parsed as a real
  comment by pylatexenc, so `% ...` text never reaches the page.

## Tables (`tabular`)

`\begin{tabular}{colspec}` renders as a real `<table>`:

```latex
\begin{tabular}{lcr}
Left & Center & Right \\
\hline
a & b & c \\
\end{tabular}
```

- **Column spec**: only the letters `l`, `c`, `r` are supported (mapped to
  `text-align: left/center/right`); `|` and whitespace in the spec are
  ignored. Anything else (e.g. `p{2cm}`, `m{3cm}`) is a loud build error —
  there's no fixed-width-column support.
- **First row is the header**, rendered in `<thead>` as `<th>`; every
  subsequent row is `<tbody>`/`<td>`.
- Cells are separated by `&`; rows end with `\\`. A cell may contain inline
  math, including math with its own `&` (e.g. inside an `aligned`
  environment) — math spans are parsed as opaque units, so `&` inside `$...$`
  never splits a cell.
- `\hline` is accepted and ignored on the site (pure PDF/print decoration).
- A row with more `&`-separated cells than the column spec has columns is a
  loud build error; a row with fewer cells is padded with empty cells.
