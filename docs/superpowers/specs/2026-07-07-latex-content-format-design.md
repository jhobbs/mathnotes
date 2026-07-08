# LaTeX Content Format — Design

**Date:** 2026-07-07
**Status:** Approved pending spec review

## Goal

Support `.tex` content files alongside `.md` in `content/`, parsed and rendered
through the existing pipeline as full citizens: blocks defined in `.tex` files
join the global block index, are referenceable from `.md` pages (and vice
versa), get tooltips, and render through the same templates. Pilot by
converting `content/topology/compact-sets.md` to `.tex`.

Motivations: (a) evaluate LaTeX as a possible future source format by living
with it on a real page; (b) the author wants to practice writing genuine,
conventional LaTeX.

## Non-goals

- Migrating any content beyond the pilot page.
- PDF build integration in CI. (The `.sty` file makes files compilable with
  `pdflatex` locally, but no build target is added.)
- The notation-reference system (`\integers` → linked ℤ). Separate project;
  this design must not preclude it.
- Deprecating the markdown format.

## The dialect

`.tex` content files are conventional LaTeX, restricted to a supported subset.
All custom commands are defined in a real `mathnotes.sty` shipped in the repo,
so a content file compiles standalone with `pdflatex`.

### Metadata (no YAML)

```latex
\title{Compact Sets}
\description{Introduces compact sets.}
```

`\title` is standard LaTeX; `\description` (and, if ever needed, `\slug`) are
defined in `mathnotes.sty`. The parser reads these commands from the preamble
region of the file; they map to the same metadata dict markdown frontmatter
produces (`title`, `description`, `slug`, `layout` defaults to `page`).

### Structured blocks

Environments named exactly like the existing block types:

```latex
\begin{definition}[Open Cover]\label{open-cover}
An \emph{open cover} of a set $E$ in a \dref{metric-space} $X$ is a
collection $\{G_\alpha\}$ of open subsets of $X$ \dots
\end{definition}

\begin{theorem}\label{finite-sets-are-compact}
Every finite set is compact.
\end{theorem}
\begin{proof}
Suppose $K$ is a finite set in metric space $X$ \dots
\end{proof}
```

- Optional `[...]` argument is the block title; `\label{...}` is the block
  label (same label namespace as markdown blocks — no prefix).
- **amsthm convention, not source nesting:** proofs follow their theorem as
  siblings. The parser associates a `proof` environment with the immediately
  preceding theorem-like block (theorem, proposition, lemma, corollary) and
  attaches it as a child block, so the rendered HTML nests the proof inside
  the theorem card exactly as markdown `::::proof` does today. Corollaries
  and notes that markdown nests inside theorem blocks become siblings in
  `.tex` source; a corollary following a theorem is associated as a child of
  that theorem for rendering/label purposes, mirroring the markdown
  structure.
- Auto-label rules match `structured_math.py`: definitions get labels
  normalized from their titles when `\label` is absent; an unlabeled proof
  gets `<parent-label>-proof`; nested corollaries and similar get
  `<parent-label>-<type>[-<n>]`.
- Supported environments: exactly the `MathBlockType` enum values
  (definition, theorem, lemma, proposition, corollary, proof, example,
  remark, note, intuition, exercise, solution, axiom — per the enum).
  `mathnotes.sty` declares each via `amsthm` `\newtheorem`/`\theoremstyle`
  so they compile.

### References

| Site concept (markdown) | LaTeX form |
|---|---|
| `@label` | `\dref{label}` |
| `@{custom text\|label}` | `\dref[custom text]{label}` |
| `@type:label` (type-validated) | `\dref{type:label}` |
| `[[slug]]` page link | `\pagelink{slug}` / `\pagelink[text]{slug}` |
| `{% include_demo "name" %}` | `\includedemo{name}` |

`\dref` and `\pagelink` are named to avoid colliding with LaTeX's `\ref` /
`\pageref`. In `mathnotes.sty`, `\dref` falls back to a `cleveref`-style
reference for PDF; `\includedemo` renders a small placeholder note in PDF.

### Prose subset

Supported and translated to HTML: `\section`/`\subsection`/`\subsubsection`
(→ h1/h2/h3, matching markdown heading levels), `\emph`, `\textbf`,
`\textit`, `itemize`, `enumerate`, paragraphs (blank-line separated),
`\dots`, verbatim ``\verb`` if trivially available from pylatexenc. Math —
`$...$`, `\[...\]`, and `$$...$$` (accepted, but `\[...\]` is house style) —
is serialized verbatim from the AST and passed through the existing math
protect/restore path to MathJax untouched.

Unsupported commands are a **build error** naming the file, line, and
command, consistent with the existing parser's error-block philosophy. The
subset grows deliberately, not silently.

## Implementation

### New code

- `mathnotes/latex_processor.py` — parses a `.tex` file with **pylatexenc**
  (`LatexWalker`; pure Python, added to `requirements.in`). Produces:
  1. Metadata dict (from `\title`/`\description`/`\slug`).
  2. The same `MathBlock` objects + placeholder-marker content that
     `StructuredMathParser.parse()` produces, including the proof/corollary
     association pass described above.
  3. HTML for prose (a small AST→HTML visitor), with math extracted through
     the existing `MathProtector`.
- `latex/mathnotes.sty` — theorem environments (`amsthm`), `\dref`,
  `\pagelink`, `\includedemo`, `\description`, `\slug`. Plus a minimal
  standalone wrapper doc or documented `pdflatex` invocation so the author
  can compile any content file to PDF locally.

### Touch points in existing code (kept minimal)

- `mathnotes/content_discovery.py` — glob `*.tex` alongside `*.md`; strip
  either extension for canonical URLs; read metadata via the latex processor
  for `.tex` files.
- `mathnotes/block_index.py` — when scanning files, dispatch on extension:
  `.md` → existing path, `.tex` → `latex_processor`. Downstream (index
  storage, `@ref` resolution, tooltip collection, `render_block_html`)
  unchanged — it operates on `MathBlock` objects.
- Page rendering (`markdown_processor.py` / `sitegenerator/renderer.py`) —
  same extension dispatch for the page body.

Cross-format references need no new code: `.md` pages `@ref` blocks defined
in `.tex` and vice versa because both live in the one block index.

### Pilot conversion

Hand-convert `content/topology/compact-sets.md` → `compact-sets.tex` (same
directory and basename, so the canonical URL `/mathnotes/topology/compact-sets`
is unchanged), preserving every existing label. Delete the `.md`. Nested
markdown blocks become conventional siblings (proof after theorem) in the
source.

## Error handling

- Unknown environment or unsupported command: build error with file/line.
- Unclosed environments: pylatexenc reports; surface as build error.
- Duplicate labels across formats: existing block-index duplicate handling
  applies unchanged.
- A `.tex` and `.md` file with the same basename in the same directory:
  build error (URL collision).

## Testing / acceptance

- Unit tests for `latex_processor.py`: metadata extraction, each block type,
  title/label handling, auto-labels, proof association, `\dref` forms, prose
  subset, math passthrough, error cases (unknown command, unclosed env).
- Integration: full site build succeeds; every pre-existing `@ref` from other
  pages into `compact-sets` labels resolves identically (same hrefs as
  before the conversion); refs *from* the `.tex` page out to `.md`-defined
  blocks resolve; tooltips work on the rendered page.
- Crawl `topology/compact-sets` in dev for JS/CSP errors.
- `pdflatex` compiles `compact-sets.tex` locally (manual check, not CI).
