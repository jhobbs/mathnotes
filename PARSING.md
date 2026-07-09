# Content Parsing Pipeline

This document explains how Mathnotes turns a `.tex` content file into a rendered
page: direct LaTeX parsing, a global block index with pre-rendered blocks, and a
placeholder-resolution pass at page-assembly time. There is no markdown involved
anywhere in this pipeline — the dialect itself is documented in
[latex/README.md](./latex/README.md).

## Overview

```
.tex file  --parse-->  PageDoc  --index+render blocks-->  page assembly  -->  final HTML
           (latex_processor.py)     (block_index.py)      (page_renderer.py)
```

1. **Parse**: `mathnotes/latex_processor.py` walks the real LaTeX AST (via
   pylatexenc) for one file and produces a typed `PageDoc` — no intermediate
   textual dialect, no second parser.
2. **Index**: `mathnotes/block_index.py` parses every content file (through the
   same cached loader), builds a global `label -> block` index and a
   reverse-reference index (`mathnotes/reverse_index.py`), then pre-renders
   every block's HTML exactly once, globally, with full knowledge of who
   references it.
3. **Assemble**: `mathnotes/page_renderer.py` renders one page by splicing in
   its blocks' already-rendered HTML and resolving any reference placeholders
   left in its prose text, via `mathnotes/ref_resolver.py`.

Splitting index-building from page assembly is what makes cross-file
references and "Referenced by" backlinks possible without double-rendering a
block for every page that mentions it.

## Stage 1: Parsing (`latex_processor.py`)

`parse_latex_file(source, filepath) -> (metadata, PageDoc)` is the only entry
point, reached through `mathnotes/content_loader.py`'s `load_content_file()`
(mtime-cached, since a full build loads each file in several phases and the
`PageDoc`/`MathBlock` objects are deliberately shared and mutated in place —
see Stage 2).

Internally, `_Parser` walks the pylatexenc node tree once:

- Page-level metadata macros (`\title`, `\description`, `\slug`, `\source`)
  populate the `metadata` dict.
- Block environments (`\begin{theorem}`, `\begin{proof}`, ...) become
  `MathBlock` objects, nested per the amsthm sibling convention (a `proof`
  attaches to the *preceding* theorem-like block; `\detach` breaks the chain).
  Everything else becomes prose HTML.
- Every math node (`$...$`, `\[...\]`) renders through `render_math()` — see
  "The math seam" below.
- `\begin{tabular}{colspec}` renders directly to `<table>` HTML (first row is
  the header; `l`/`c`/`r` column-spec letters map to alignment; `\hline` is
  ignored) — see [latex/README.md](./latex/README.md#tables-tabular).
- References (`\dref`, `\pagelink`, `\dembed`) are emitted as placeholder
  elements, not resolved yet — see "Placeholder grammar" below. Parsing a
  single file has no visibility into other files, so it cannot resolve them.
- Anything pylatexenc parses that the dialect has no handler for raises
  `LatexDialectError(f"{file}:{line}: ...")` — see "Loud errors" below.

`finalize_blocks()` (in `structured_math.py`) then walks the file's top-level
blocks to assign auto-generated labels (`theorem-7`, `proof-of-thm-1`, ...),
definition synonyms/plurals, and tags, before parsing returns.

### The math seam

`render_math(latex, display)` in `latex_processor.py` is the single function
every math node's rendering passes through — inline and display math both
funnel through it. Because pylatexenc hands the parser real `LatexMathNode`
objects (not text containing `$`), there's no risk of a general text
processor misinterpreting `$`, `_`, `\`, or any other math character; math is
never "protected" or "restored" the way the old markdown pipeline had to
guard `$...$` spans from a third-party markdown parser. `render_math()`
delegates to `mathnotes/mathml.py`, which drives a persistent Node worker
(`scripts/tex2mml-worker.mjs`, MathJax's TeX-to-MathML conversion) over a
JSON-lines protocol and returns serializer output — well-formed MathML,
inserted raw at build time, no client-side typesetting. Unconvertible TeX
raises `MathConversionError`, which becomes a `LatexDialectError` with
`file:line`.

### Placeholder grammar

`latex_processor.py` emits four kinds of machine-generated elements for
things it can't resolve without the global index. Because these are the
parser's *own* output (not arbitrary author text), matching them with regexes
downstream is safe — an author's prose can never accidentally look like one.

| Source macro | Emitted placeholder | Resolved by |
|---|---|---|
| `\dref{label}`, `\dref[text]{label}`, `\dref{type:label}` | `<a data-dref="label-or-type:label">text</a>` | `ref_resolver.py` → `<a href=... class="block-reference">` or a `.block-reference-error` span |
| `\pagelink{slug}`, `\pagelink[text]{slug}` | `<a data-pagelink="slug">text</a>` | `ref_resolver.py` → `<a href="/mathnotes/...">` or a `#broken-link-...` anchor |
| `\dembed{label}` | `<div data-dembed="label"></div>` | `ref_resolver.py` → the target block's full `rendered_html`, wrapped in `.embedded-block`, or a `.embed-error` span |
| `\includedemo{name}` | `<div class="demo-component" data-demo="name" id="demo-name-N"></div>` | *not* resolved server-side — demos-framework's client-side JS mounts into this div at page-load time |

### Loud errors

Any LaTeX construct pylatexenc parses that `latex_processor.py` has no
handler for is a build error (`_Parser._err` raises `LatexDialectError` with
`file:line: message`), never a silent pass-through or drop. Extending the
dialect is deliberate: add a case to `_macro`/`_environment` (or wherever the
construct falls) plus a regression test in `test/test_latex_processor.py`.

## Stage 2: The block index (`block_index.py`, `reverse_index.py`)

`BlockIndex.build_index()` walks `content/` in four phases:

1. **Scan** (`_scan_directory` / `_index_file`): parse every file (via the
   same cached `load_content_file`) and register each block's label — and any
   `\synonyms` — in the global `index: Dict[label, BlockReference]`.
2. **Collect references** (`_collect_all_references`): run a throwaway
   `RefResolver.collect()` (no output, just bookkeeping) over every page's
   top-level prose and every block's body, recording which labels are
   referenced or embedded into `reverse_index.py`'s `ReverseIndex` — the data
   behind each block's "Referenced by (N direct, M transitive)" panel.
3. **Transitive references**: `reverse_index.compute_transitive_references()`
   BFS's the reference graph so a block also shows references-to-things-that-
   reference-it.
4. **Render** (`_render_all_blocks` / `_process_block_content`): now that the
   full index and reference graph exist, resolve each block's own body
   placeholders (`RefResolver.resolve()`) and render its final card HTML
   (`structured_math.render_block_html`), depth-first so children render
   before the parent inlines them (via the `\x02<i>\x02` child markers — see
   below). The "Referenced by" section computed in phase 2–3 is spliced in
   here too.

The result — `block.rendered_html` — is stored on the shared `MathBlock`
object itself, not returned; page assembly (Stage 3) reads it directly off
the same cached `PageDoc`/`MathBlock` instances the index just mutated.

## Stage 3: Page assembly (`page_renderer.py`)

`PageRenderer.render_page(filepath)` loads the same cached `PageDoc` and
walks `pagedoc.items` in order:

- A `MathBlock` item contributes its `rendered_html` as-is (built in Stage 2;
  never re-rendered here — if it's `None` the block index wasn't built first,
  which is a hard error).
- A prose HTML string is resolved fresh, via `RefResolver.resolve()` — page
  prose can contain `\dref`/`\pagelink`/`\dembed` placeholders too, not just
  block bodies.

The resolved parts are joined into the page's `content`; tooltip data is
collected for every referenced label (including labels found transitively
inside embedded/tooltipped block HTML, via
`ref_resolver.labels_from_rendered_html`); the result dict matches the shape
the rest of the site generator (`mathnotes/sitegenerator/pages.py`) expects.

## No protection/marker phases

The old markdown pipeline needed a two-phase protect/restore dance around
math and a `MATHBLOCKnMARKER` string-substitution scheme around blocks,
because it ran a *third-party* markdown parser that didn't know about either.
None of that exists now: block environments and math nodes are first-class
output of a single parser pass over the real LaTeX AST (Stage 1), so there's
nothing to protect from a downstream text transform.

The pipeline does use exactly two internal string sentinels, both scoped to a
single module's own output rather than a cross-module protect/restore pass:

- `\x01` ("island", `latex_processor._ISLAND`) wraps already-final HTML
  (lists, code blocks, headings) inside a single file's prose stream while
  `_paragraphize`/`_collapse_islands` decide paragraph breaks and whitespace
  collapsing around it. It is internal to `latex_processor.py`'s own parsing
  and never appears in emitted output — collapsed away before a `PageDoc` is
  returned.
- `\x02<i>\x02` (`structured_math.CHILD_MARKER_RE`) marks where a block's
  *i*-th child renders inline inside its parent's `body_html`/`content_html`.
  Unlike the island sentinel, this one *does* persist past parsing: it stays
  in a block's `body_html` until the block itself renders (Stage 2, phase 4),
  at which point it's substituted with the child's `rendered_html`.

## Related Files

- `mathnotes/latex_processor.py`: Stage 1 — direct `.tex` parsing, the math
  seam, placeholder emission, tabular rendering.
- `mathnotes/structured_math.py`: the `MathBlock`/`PageDoc` document model,
  block finalization (labels/synonyms/tags), block card HTML rendering.
- `mathnotes/block_index.py`: Stage 2 — global scan, reference collection,
  block rendering.
- `mathnotes/reverse_index.py`: "Referenced by" direct/transitive reference
  tracking, used by Stage 2.
- `mathnotes/ref_resolver.py`: placeholder resolution against the block
  index, used by both Stage 2 (block bodies) and Stage 3 (page prose).
- `mathnotes/page_renderer.py`: Stage 3 — page assembly.
- `mathnotes/content_loader.py`: the shared, mtime-cached `(metadata,
  PageDoc)` entry point used by both Stage 1 callers (Stage 2's scan and
  Stage 3's page render).
