# Notation References Design

Date: 2026-07-11
Status: Approved

## Goal

Complete the original mission of the LaTeX rewrite: notation macros like
`\integers` usable inside math (`$x \in \integers$`) that render as proper
LaTeX notation (ℤ) and act as cross-references to the block that defines
them — link, tooltip, and reverse-index entry, like `\dref` for prose.

## Authoring format

```latex
\begin{definition}[Integers]\label{integers}
\notation{\integers}{\mathbb{Z}}
The \emph{integers} are ...
\end{definition}
```

- `\notation{\<name>}{<expansion>}` is declared inside a block; the
  enclosing block is the reference target. Explicit and auto-labels both
  work (resolution happens fresh each build).
- Zero-argument symbol macros only in v1. Parameterized notation
  (`\abs{x}`-style) is deferred.
- The declaration renders visibly in the block header, styled like the
  existing synonyms annotation: "Notation: ℤ".
- Any block type may declare notation, though definitions are the
  expected home.

## Build pipeline

1. **Pre-scan.** Before any file is parsed, a brace-balanced regex sweep
   over `content/**/*.tex` collects `name → expansion`. Loud build errors
   on: duplicate declarations (same name declared twice anywhere) and
   collisions with names in the `.sty` MATH MACROS section.
2. **Worker.** The worker eagerly loads the `html` TeX extension
   (provides `\class`; eager for the same reason `cancel` is — the
   synchronous tex2mml API cannot service autoload). It never learns the
   notation macros themselves: expansions substitute in Python (next
   step), so the worker needs no respawn when the registry changes. The
   request protocol gains an optional `alttext` field so the emitted
   `<math alttext>` carries the author's original TeX, not the wrapper.
3. **Wrapping.** `render_math()` pre-processes TeX before sending it to
   the worker: each registered macro occurrence `\integers` (matched with
   a word-boundary-safe regex) is rewritten to
   `\class{notation-ref notation-ref--integers}{<expansion>}`, so the
   emitted MathML carries identifiable class attributes on the right
   element. Because substitution is a single textual pass, expansions may
   not reference other notation macros (enforced at scan time).
4. **Resolution.** During block/page HTML assembly, elements with
   `notation-ref--<name>` classes are resolved: macro → declaring block
   label → block index. The element is stamped with `data-ref-label` and
   `data-ref-url`. No `<a>` wrapper — anchors are invalid inside MathML
   and Chrome/Safari ignore `href` on MathML elements; navigation is
   client-side JS.
   - Self-references (the macro used inside its own defining block)
     render as plain math: no link stamp, no reverse-index entry.
   - Resolved labels feed the per-page tooltip JSON and the reverse
     index ("Referenced by" includes notation usages — deliberately
     complete, even for common symbols).
5. **Cache invalidation.** The notation registry is global input to every
   page's math. A change to the registry (added/removed/changed
   `\notation`) invalidates all cached pages, the same class of event as
   a `.sty` edit. The watcher handles this; `test_cache_invalidation.py`
   covers it.

## PDF output

- `mathnotes.sty` defines `\notation{#1}{#2}` to typeset the same visible
  annotation ("Notation: $#1$") inline in the block.
- Cross-file usage compiles because the build regenerates
  `latex/mathnotes-notation.sty` — a checked-in, lockfile-style generated
  file containing one `\providecommand` per notation — which
  `mathnotes.sty` inputs. Any content file then compiles standalone with
  pdflatex even when it uses notation defined in another file.

## Client

- `tooltip-system.ts`: target selector extended to match notation-ref
  elements inside `<math>` (in addition to `a.block-reference`); hover
  and touch behavior identical to block references.
- Click on a notation ref navigates to `data-ref-url` (external JS,
  CSP-compliant; no inline handlers).
- Styling in CSS only: faint dotted `border-bottom` matching the
  `.block-reference` dotted-underline look (MathML elements don't
  reliably support `text-decoration`, but border properties are in
  MathML Core), plus `cursor: pointer`. Light and dark modes.

## Error handling summary

- Duplicate `\notation` name → build error with both file:line locations.
- Name collides with `.sty` MATH MACROS macro → build error.
- Malformed `\notation` (missing braces, non-macro first argument) →
  `LatexDialectError` with file:line.
- Deleted/renamed defining block leaving usages behind → build error at
  resolution time (macro registered by pre-scan but target label gone is
  impossible by construction; the failure mode is the whole declaration
  removed, which makes `\integers` an undefined macro → existing loud
  MathJax error).

## Testing

- Python (standalone assert scripts, run via docker exec): pre-scan
  parsing and error cases; `render_math` wrapping; resolution including
  self-suppression, tooltip data, reverse index; cache invalidation on
  registry change.
- Frontend: `./scripts/crawl-dev.sh` for JS/CSP errors; visual check of a
  real page using `$\integers$` in both light and dark modes; tooltip and
  click-through behavior.
