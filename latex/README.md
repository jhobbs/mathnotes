# LaTeX content support

Content files under `content/` may be written in `.tex` instead of `.md`.
The site build transpiles them (`mathnotes/latex_processor.py`); this
directory exists so the same files also compile to PDF locally.

## Compile a content file

    cd <repo-root>
    TEXINPUTS=./latex: pdflatex -output-directory=/tmp content/topology/compact-sets.tex

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
  theorem.
- `\dref{label}` / `\dref[text]{label}` = `@label` / `@{text|label}`.
- `\pagelink{slug}`, `\includedemo{name}`, display math via `\[ ... \]`.
- Unsupported LaTeX is a build error by design; extend the dialect in
  `mathnotes/latex_processor.py` deliberately.
