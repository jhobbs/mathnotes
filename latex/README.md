# LaTeX content support

Content files under `content/` may be written in `.tex` instead of `.md`.
The site build transpiles them (`mathnotes/latex_processor.py`); this
directory exists so the same files also compile to PDF locally.

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
  (repeatable; same keys as `sources.yaml`; equivalent of frontmatter
  `sources:`). Braced values may contain commas; bare values may not.
- `\synonyms{open covers, coverings}` on a definition (next to `\label`)
  = index aliases, like the markdown `{synonyms: ...}` metadata.
  `\tags{topology}` works on any block.
- Theorem-like environments follow the amsthm sibling convention
  (`\begin{proof}` *after* `\end{theorem}`); the site re-nests them.
  `\detach` stops a following note/remark from attaching to the previous
  theorem. Block environments may also nest literally
  (`\begin{note}` inside `\begin{remark}`) for structures the sibling
  convention cannot express; prose around nested blocks stays in place.
- `\dref{label}` / `\dref[text]{label}` = `@label` / `@{text|label}`.
- `\pagelink{slug}`, `\includedemo{name}`, display math via `\[ ... \]`.
- `\href{url}{text}` for external links — escape `%` and `#` in URLs as
  `\%` / `\#` (hyperref's own convention).
- `\includegraphics[alt={...}, title={...}]{path}` for images; with
  `width=344px, height=336px` a sized raw `<img>` is emitted instead
  (title cannot combine with sizing).
- `itemize`/`enumerate` may nest one level.
- `verbatim` or `\begin{lstlisting}[language=Python]` for code blocks.
- Unsupported LaTeX is a build error by design; extend the dialect in
  `mathnotes/latex_processor.py` deliberately.
