# Remove the Markdown Layer — Design

**Date:** 2026-07-09
**Status:** Approved

## Goal

Eliminate the internal markdown dialect from the rendering pipeline. `.tex`
content files are parsed once into typed structures (prose HTML + `MathBlock`
trees) and rendered directly to the final page HTML. python-markdown,
python-frontmatter, and every markdown-era text-marker scheme are removed.

This is **Part 1 of a two-part effort**:

- **Part 1 (this spec):** no markdown anywhere; math still rendered
  client-side by MathJax, but emitted through a single seam function. Gate:
  the author visually inspects the rebuilt site.
- **Part 2 (separate spec, after the gate):** swap the math seam for a
  build-time LaTeX→MathML converter and delete MathJax from the client.
  Engine choice (MathJax-node vs TeXmath vs KaTeX), macro feeding from
  `mathnotes.sty`, and CSS fallout are Part 2 questions.

**Standing constraint (both parts):** content files keep compiling standalone
with `pdflatex` / TeXstudio / Overleaf via `latex/mathnotes.sty`. Neither part
touches `.tex` sources, so this is a don't-break-it requirement.

## Background

The dialect (`:::type` fenced blocks, `@label` refs, `[[slug]]` links,
`{% include_demo %}` tags, markdown prose) was the pipeline's native format
when content was authored in markdown. The July 2026 LaTeX conversion kept it
as an intermediate representation so `.tex` and `.md` could coexist; the
transpiler emitted the dialect and everything downstream was untouched.
`content/` is now 146 `.tex` files and 0 `.md` files — the compatibility
layer has no remaining consumers, but costs a full extra parse pass
(LaTeX → dialect string → fence re-parse → python-markdown) and three
placeholder-marker schemes (`MATHBLOCK{n}MARKER`, math protection
placeholders, `EMBED_MARKER`) that exist only to shepherd content through
text passes that can mangle it.

## Non-goals

- Any change to `.tex` sources, the authoring dialect, or `mathnotes.sty` —
  with one exception: transclusion gets a real macro (see "Transclusion"
  below), replacing the `\dref{embed}\{label\}` hack in the three files that
  use it.
- MathML / removing MathJax (Part 2).
- Byte- or visually-identical output. The bar is **semantic equivalence**,
  verified mechanically (see Verification).
- New dialect features (tables, blockquotes stay unsupported, loud errors).

## Architecture

Approach chosen: **evolve the existing parser into a renderer** (over a
clean-room rewrite or a pandoc-style document IR). `latex_processor.py`
already encodes the hard decisions on the pylatexenc AST — amsthm sibling
re-attachment, auto-labels, synonyms/plurals, `\detach`, metadata scanning,
loud `LatexDialectError`s with file:line. All of that stays. Only the
emission layer changes.

### Data flow

Two-phase build, same shape as today; the markdown string is replaced by a
typed result:

1. `parse_latex_file(source, filepath) -> (metadata, PageDoc)`.
   A `PageDoc` is an ordered list of top-level items: **prose segments**
   (HTML strings) and **`MathBlock` trees** (existing dataclass). Parsed once
   per file, cached by mtime in `content_loader` as today.
2. **Phase 1 — block index:** walk all `PageDoc`s, register labels in the
   global index, build the reverse-reference graph, pre-render each block's
   HTML via the existing `render_block_html` (with "Referenced by" sections
   and tooltip collection unchanged).
3. **Phase 2 — page render:** new `page_renderer.py` (replaces
   `markdown_processor.py`) assembles each page: prose segments +
   pre-rendered blocks in document order, resolves deferred references,
   collects tooltip data, computes description/canonical URL. It returns the
   same output dict shape, so `sitegenerator/pages.py` and the Jinja2
   templates are untouched.

### HTML emitter (inside `latex_processor.py`)

A small AST→HTML visitor replaces markdown-string emission:

| LaTeX | HTML |
|---|---|
| `\emph`, `\textit` | `<em>` |
| `\textbf` | `<strong>` |
| `\texttt` | `<code>` |
| `\section`…`\subparagraph` | `<h1>`–`<h5>` with slugified `id` (anchor parity with the old `toc` extension) |
| `itemize` / `enumerate` | `<ul>` / `<ol>`, nested |
| `verbatim` / `lstlisting` | Pygments-highlighted HTML with the existing `codehilite` CSS classes |
| `\href` | `<a>` |
| `\includegraphics` | `<img>`, with relative-path fixing done here once (today duplicated in `markdown_processor` and `block_index`) |
| escaped chars, `\dots`, `~`, etc. | HTML entities / literals |
| blank-line separation | `<p>` paragraphs |

### Math seam (the Part 2 hook)

Every `LatexMathNode` renders through exactly one function:

```python
render_math(latex: str, display: bool) -> str
```

Part 1: returns MathJax delimiter text (`\( … \)` / `$$ … $$`), same client
behavior as today. Part 2 swaps this function's body for build-time MathML
and deletes the client script. Nothing else in the codebase knows how math
becomes pixels. There is no math "protection" — math is an AST node and no
downstream text pass exists that could mangle it.

### Reference resolution

`\dref` and `\pagelink` cannot resolve at parse time (the index doesn't exist
yet). The emitter outputs self-describing placeholder elements — e.g.
`<a data-dref="label">`, `<a data-pagelink="slug">` — and Phase 2 resolves
them against the block index / URL mapper: fills href and auto-generated link
text, collects tooltip data. We generate these placeholders ourselves, so
matching them is safe, unlike today's regexes over author text.
Unresolved targets keep current behavior (broken-link markers / visible
error spans), not build failures. `\includedemo` emits the demo `<div>`
directly at parse time.

**Resolution timing:** placeholders inside block content resolve during the
Phase 1 block pre-render (all files are parsed before any block renders, so
the label index is complete); placeholders in page prose resolve in Phase 2.
One resolver serves both.

### Transclusion (`\dembed`)

Today's `.tex` files transclude a block by writing `\dref{embed}\{label\}`,
which only works because the transpiler's *text* output concatenates into
`@embed{label}` for the markdown-era regex layer to find. Direct rendering
breaks the hack — and it was already broken in PDF output (a dangling
`\hyperref` to a nonexistent `embed` label). Fix: a first-class
`\dembed{label}` macro — defined in `mathnotes.sty` so PDFs render something
sensible (a "see <ref>" pointer), emitted by the parser as an embed
placeholder that Phase 1/2 resolution splices the target block's
pre-rendered HTML into. The three content files using the hack
(`analysis/sequences.tex`, `topology/perfect-sets-and-more.tex`,
`topology/connected-sets.tex`) are updated to `\dembed{...}`.

### Block snippets

`MathBlock.content` today holds dialect text; `content_snippet` regex-strips
markdown from it for auto-generated link text. New rule: the parser stores
**plain text with inline math preserved** (`$…$`) as `MathBlock.content` —
the exact form `content_snippet` needs, so the snippet logic simplifies
rather than ports. Guarded by `test_reference_snippets.py`.

## Component changes

**Changed:**
- `latex_processor.py` — emission layer replaced (HTML emitter, `PageDoc`,
  math seam, ref placeholders). Parsing/attachment/label logic untouched.
  `\dembed` added to the recognized macros.
- `latex/mathnotes.sty` — `\dembed` definition added. Three content files
  switch from the `\dref{embed}\{...\}` hack to `\dembed{...}` (the only
  content edits in this project).
- `content_loader.py` — returns `(metadata, PageDoc)`; `.tex` only. A `.md`
  file in `content/` is a build error. mtime cache kept.
- `structured_math.py` — keeps `MathBlockType`, `MathBlock`,
  `render_block_html`, error rendering; loses `StructuredMathParser`'s `:::`
  text parser and marker machinery.
- `block_index.py` — consumes `PageDoc`s instead of re-parsing dialect text;
  drops its private `Markdown` instance and `_fix_relative_image_paths`
  duplicate. Index storage, reverse index, review queues, tooltip collection,
  cache invalidation unchanged.
- `markdown_processor.py` → **renamed** `page_renderer.py`; becomes a page
  assembler (splice, resolve refs, description, caching). All markdown
  conversion, wiki-link regexes, include_demo regexes deleted.
- `math_utils.py` — `MathProtector` deleted; `BlockReferenceProcessor`'s
  dialect regexes replaced by placeholder-element resolution
  (`tooltip_collector.py` adapts to the same interface).
- `reverse_index.py` — collects references from `PageDoc`/AST refs instead of
  regexing dialect text.
- `scripts/find_unstructured_definitions.py` — rewritten against parsed
  blocks instead of dialect text.
- Metadata-only consumers (`content_discovery.py`, `navigation.py`,
  `file_utils.py`, `sources.py`) — trivial signature follow-through only.

**Deleted:**
- `scripts/md_to_tex.py` (migration + round-trip verifier; migration done).
- `Markdown`, `python-markdown-math`, `python-frontmatter` from
  requirements. Pygments stays (used directly now).
- `test/block-references-test.md`, `test/structured-math-test.md` (dead
  fixtures, referenced by nothing).

**Untouched:** Jinja2 templates, `sitegenerator/` (except what
`pages.py` imports), sources system, demos framework, CSS, nginx/deploy.

## Error handling

- Unsupported LaTeX: unchanged — `LatexDialectError` with `file:line`.
- `.md` in `content/`: build error naming the file.
- Unresolved `\dref` / `\pagelink`: current behavior preserved
  (broken-link marker / error span, build succeeds).
- A block marker/HTML mismatch class of errors disappears with the markers.

## Verification

1. **Semantic diff harness** (a script in `scripts/`): build the site on
   `main` and save the output; build with the new pipeline; extract per-page
   semantics from both — heading tree, block tree (type/label/title/nesting),
   every math expression, every ref target and href, image srcs, demo names,
   normalized visible text — and diff. Markup cosmetics are invisible;
   dropped content, broken refs, or missing blocks are loud. Run over all
   146 pages plus generated pages (definition/theorem indexes, bibliography,
   sitemap).
2. **Tests** (standalone assert scripts, run via stdin into the builder
   container):
   - `test_latex_processor.py` — same dialect-coverage cases, assertions
     retargeted to `PageDoc`/HTML output.
   - `test_latex_integration.py` — `.tex`-only end-to-end (cross-format
     cases deleted as meaningless); `.md`-rejection case added.
   - `test_cache_invalidation.py`, `test_reference_snippets.py` — updated
     imports, same scenarios.
3. **Site crawler** (`crawl-site`) for console/JS/CSP errors.
4. **Author visual inspection** — the Part 1 → Part 2 gate.

## Success criteria

- Zero markdown machinery: no python-markdown import anywhere, no dialect
  text form, no placeholder markers, no `.md` content support.
- Semantic diff clean (or every diff explained and accepted).
- All tests pass; crawler clean; `pdflatex` compilation of content files
  still works (spot-check a page).
- `render_math` is the only site of math formatting, ready for Part 2.
