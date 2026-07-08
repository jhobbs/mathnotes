# LaTeX Content Format Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Support `.tex` content files alongside `.md` as full citizens of the mathnotes pipeline (shared block index, cross-format `@refs`, tooltips), piloted by converting `content/topology/compact-sets.md` to LaTeX.

**Architecture:** A new `mathnotes/latex_processor.py` transpiles a disciplined LaTeX dialect into the *internal markdown dialect* the existing pipeline already consumes (`:::type` fenced blocks, `@label` refs, `[[slug]]` links, `{% include_demo %}` tags). A single choke point, `mathnotes/content_loader.py`, returns `(metadata, internal_content)` for either extension; five existing call sites switch from `frontmatter.load` to this loader. Everything downstream (StructuredMathParser, BlockIndex, tooltips, templates) is untouched, so cross-format references work by construction. A real `latex/mathnotes.sty` makes content files compile standalone with `pdflatex`.

**Tech Stack:** Python 3.11, pylatexenc 2.10 (`LatexWalker` AST), existing Markdown/Jinja2 pipeline. Spec: `docs/superpowers/specs/2026-07-07-latex-content-format-design.md`.

## Global Constraints

- **Do NOT `git commit` at any point.** Repo rule (CLAUDE.md): commits happen only when the user explicitly requests ("ship it"). Every task ends at verification, leaving changes in the working tree.
- **No host Python deps.** All Python runs inside the `mathnotes-static-builder` container. `test/` is NOT mounted into it, so tests run via stdin: `docker exec -i mathnotes-static-builder python3 - < test/<file>.py`
- Tests are standalone assert scripts (this repo's convention — see `test/test_cache_invalidation.py`), NOT pytest (pytest is not installed in the container).
- `mathnotes/` and `content/` are bind-mounted read-only into the builder container, so host edits are immediately visible inside it.
- pylatexenc is already `pip install`ed in the running container (survives `docker restart`, lost only if the container is recreated — requirements files updated in Task 1 cover that).
- Do not rebuild docker images; `docker restart mathnotes-static-builder` only where a task says so.
- Supported block environments are exactly the `MathBlockType` enum values (`mathnotes/structured_math.py:14`): definition, theorem, lemma, proposition, corollary, axiom, proof, example, remark, note, intuition, exercise, solution.
- Unsupported LaTeX constructs must raise `LatexDialectError` with `<filepath>:<line>: <message>` — never silently pass through.

---

### Task 1: Dependency + `latex_processor.py` skeleton (metadata, prose chars, error type)

**Files:**
- Modify: `requirements.in` (append `pylatexenc`)
- Modify: `requirements.txt` (add pinned `pylatexenc==2.10`)
- Create: `mathnotes/latex_processor.py`
- Create: `test/test_latex_processor.py`

**Interfaces:**
- Consumes: `MathBlockType` from `mathnotes/structured_math.py`.
- Produces: `parse_latex_file(source: str, filepath: str = "<latex>") -> Tuple[Dict[str, Any], str]` returning `(metadata, internal_markdown)`; `class LatexDialectError(ValueError)`. All later tasks extend the private `_Transpiler` class in this file.

- [ ] **Step 1: Add the dependency**

Append `pylatexenc` on its own line at the end of `requirements.in`. In `requirements.txt`, add the line `pylatexenc==2.10` in alphabetical position. Confirm the dev image installs it on future rebuilds:

Run: `grep -n "requirements" Dockerfile.dev`
Expected: a `pip install -r requirements` line (any match confirms). Also confirm it's importable now: `docker exec mathnotes-static-builder python3 -c "import pylatexenc; print(pylatexenc.__version__)"` → `2.10`.

- [ ] **Step 2: Write the failing tests**

Create `test/test_latex_processor.py`:

```python
"""Tests for mathnotes/latex_processor.py (LaTeX content dialect).

Standalone assert script (repo convention; pytest is not installed in the
builder container). Run:

    docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py
"""

import os
import sys
import traceback

try:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
except NameError:
    sys.path.insert(0, "/app")

from mathnotes.latex_processor import LatexDialectError, parse_latex_file  # noqa: E402


def body(source):
    """Transpiled internal-markdown content of a source snippet."""
    return parse_latex_file(source, filepath="test.tex")[1]


def expect_error(source, fragment):
    try:
        parse_latex_file(source, filepath="test.tex")
    except LatexDialectError as e:
        assert fragment in str(e), f"error {e!r} does not mention {fragment!r}"
        return str(e)
    raise AssertionError(f"expected LatexDialectError mentioning {fragment!r}")


# --- Task 1: metadata + skeleton ---

def test_metadata_standalone_document():
    src = r"""\documentclass{article}
\usepackage{mathnotes}
\title{Compact Sets}
\description{Introduces compact sets.}
\begin{document}
\maketitle
Hello world.
\end{document}
"""
    meta, content = parse_latex_file(src, "test.tex")
    assert meta["title"] == "Compact Sets"
    assert meta["description"] == "Introduces compact sets."
    assert meta["layout"] == "page"
    assert content.strip() == "Hello world."


def test_metadata_fragment():
    meta, content = parse_latex_file(
        "\\title{X}\n\\slug{custom-slug}\n\nSome prose.\n", "test.tex"
    )
    assert meta["title"] == "X"
    assert meta["slug"] == "custom-slug"
    assert content.strip() == "Some prose."


def test_no_metadata_is_fine():
    meta, content = parse_latex_file("Just prose.\n", "test.tex")
    assert "title" not in meta
    assert content.strip() == "Just prose."


def test_paragraphs_and_indentation():
    # Blank lines separate paragraphs; per-line leading whitespace is
    # stripped so LaTeX-style indentation can't become a markdown code block.
    src = "First para\n    continued flush.\n\nSecond para.\n"
    assert body(src) == "First para\ncontinued flush.\n\nSecond para.\n"


def test_comments_dropped():
    out = body("Before % a comment\nafter.\n")
    assert "a comment" not in out
    assert "Before" in out and "after." in out


def main():
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_") and callable(v)]
    failures = 0
    for t in tests:
        try:
            t()
            print(f"PASS {t.__name__}")
        except Exception:
            failures += 1
            print(f"FAIL {t.__name__}")
            traceback.print_exc()
    print(f"{len(tests) - failures}/{len(tests)} passed")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py`
Expected: `ModuleNotFoundError: No module named 'mathnotes.latex_processor'`

- [ ] **Step 4: Implement the skeleton**

Create `mathnotes/latex_processor.py`:

```python
"""LaTeX content dialect for mathnotes.

Transpiles .tex content files (a disciplined LaTeX subset defined in
docs/superpowers/specs/2026-07-07-latex-content-format-design.md) into the
internal markdown dialect consumed by the existing parsing pipeline
(:::type blocks, @label refs, [[slug]] links, {% include_demo %} tags).
"""

import re
from typing import Any, Dict, List, Optional, Tuple

from pylatexenc import latexwalker, macrospec
from pylatexenc.latexwalker import (
    LatexCharsNode,
    LatexCommentNode,
    LatexEnvironmentNode,
    LatexGroupNode,
    LatexMacroNode,
    LatexMathNode,
    LatexSpecialsNode,
    LatexWalker,
)

from .structured_math import MathBlockType


class LatexDialectError(ValueError):
    """LaTeX outside the supported mathnotes dialect. Message is file:line: what."""


_BLOCK_ENV_NAMES = {t.value for t in MathBlockType}
_METADATA_MACROS = ("title", "description", "slug")
_IGNORED_MACROS = {"documentclass", "usepackage", "maketitle"}


def _latex_context():
    ctx = latexwalker.get_default_latex_context_db()
    ctx.add_context_category(
        "mathnotes",
        prepend=True,
        macros=[
            macrospec.MacroSpec("dref", "[{"),
            macrospec.MacroSpec("pagelink", "[{"),
            macrospec.MacroSpec("includedemo", "{"),
            macrospec.MacroSpec("description", "{"),
            macrospec.MacroSpec("slug", "{"),
            macrospec.MacroSpec("detach", ""),
        ],
        environments=[
            macrospec.EnvironmentSpec(name, "[") for name in sorted(_BLOCK_ENV_NAMES)
        ],
    )
    return ctx


_CONTEXT = _latex_context()


def parse_latex_file(source: str, filepath: str = "<latex>") -> Tuple[Dict[str, Any], str]:
    """Parse a .tex content file into (metadata, internal_markdown)."""
    return _Transpiler(source, filepath).run()


class _Transpiler:
    def __init__(self, source: str, filepath: str):
        self.source = source
        self.filepath = filepath

    def run(self) -> Tuple[Dict[str, Any], str]:
        try:
            walker = LatexWalker(self.source, latex_context=_CONTEXT, tolerant_parsing=False)
            nodes, _, _ = walker.get_latex_nodes()
        except latexwalker.LatexWalkerParseError as e:
            raise LatexDialectError(f"{self.filepath}: {e}") from e

        metadata: Dict[str, Any] = {"layout": "page"}
        body = nodes
        for n in nodes:
            if isinstance(n, LatexEnvironmentNode) and n.environmentname == "document":
                body = n.nodelist
                break
        self._scan_metadata(nodes, metadata)
        if body is not nodes:
            self._scan_metadata(body, metadata)

        content = self._transpile_body(body)
        content = re.sub(r"\n{3,}", "\n\n", content).strip() + "\n"
        return metadata, content

    # --- helpers ---

    def _err(self, node, message: str):
        line = self.source[: node.pos].count("\n") + 1
        raise LatexDialectError(f"{self.filepath}:{line}: {message}")

    def _chars_arg(self, macro_node) -> str:
        """Plain-text mandatory (last) argument of a macro, e.g. \\label{...}."""
        args = macro_node.nodeargd.argnlist if macro_node.nodeargd else []
        group = args[-1] if args else None
        if group is None:
            self._err(macro_node, f"\\{macro_node.macroname} requires an argument")
        text = "".join(
            n.chars for n in group.nodelist if isinstance(n, LatexCharsNode)
        ).strip()
        if not text:
            self._err(macro_node, f"\\{macro_node.macroname} argument must be plain text")
        return text

    def _scan_metadata(self, nodes, metadata: Dict[str, Any]):
        for n in nodes:
            if isinstance(n, LatexMacroNode) and n.macroname in _METADATA_MACROS:
                metadata[n.macroname] = self._chars_arg(n)

    # --- transpilation (extended in later tasks) ---

    def _transpile_body(self, nodes) -> str:
        return self._prose(nodes)

    def _prose(self, nodes) -> str:
        out = []
        for n in nodes:
            if isinstance(n, LatexCharsNode):
                out.append(re.sub(r"\n[ \t]+", "\n", n.chars))
            elif isinstance(n, LatexCommentNode):
                out.append(re.sub(r"\n[ \t]+", "\n", n.comment_post_space))
            elif isinstance(n, LatexGroupNode):
                out.append(self._prose(n.nodelist))
            elif isinstance(n, LatexMacroNode):
                out.append(self._macro(n))
            else:
                self._err(n, f"unsupported LaTeX construct ({type(n).__name__})")
        return "".join(out)

    def _macro(self, n) -> str:
        name = n.macroname
        if name in _METADATA_MACROS or name in _IGNORED_MACROS or name == "detach":
            return ""
        self._err(n, f"unsupported command \\{name}")
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py`
Expected: `5/5 passed`, exit code 0.

---

### Task 2: Prose transpiler (styles, math, sections, lists, specials, errors)

**Files:**
- Modify: `mathnotes/latex_processor.py`
- Test: `test/test_latex_processor.py` (append)

**Interfaces:**
- Consumes: `_Transpiler._prose` / `_Transpiler._macro` from Task 1.
- Produces: full text-mode dialect. `_prose` additionally handles `LatexMathNode`, `LatexSpecialsNode`, and `LatexEnvironmentNode` (lists; block envs error here — Task 4 intercepts them at body level before `_prose` sees them). `_macro` handles `\emph \textbf \textit \texttt`, `\section \subsection \subsubsection`, `\dots \ldots`, escaped chars. Task 3 fills `_dref/_pagelink/_includedemo`.

- [ ] **Step 1: Append the failing tests**

Append to `test/test_latex_processor.py` (before `main()`):

```python
# --- Task 2: prose dialect ---

def test_styles():
    assert body(r"\emph{open cover} and \textbf{bold} and \textit{it} and \texttt{code}.").strip() \
        == "*open cover* and **bold** and *it* and `code`."


def test_inline_math_verbatim():
    src = r"A set $\{G_\alpha\}, \alpha \in A$ and $K^c$ stay untouched."
    assert body(src).strip() == src


def test_display_math_normalized():
    assert "$$ K \\subset G_{\\alpha_1}. $$" in body(r"Then \[ K \subset G_{\alpha_1}. \] holds.")
    assert "$$ x^2 $$" in body(r"Also $$ x^2 $$ works.")


def test_display_math_multiline_preserved():
    src = "\\[ \\begin{aligned}\na &= b \\\\\nc &= d\n\\end{aligned} \\]"
    out = body(src)
    assert out.startswith("$$ \\begin{aligned}")
    assert "\\end{aligned} $$" in out


def test_sections():
    assert body("\\section{Compact Sets}\n\\subsection{Sub}\n\\subsubsection{Subsub}").strip() \
        == "# Compact Sets\n\n## Sub\n\n### Subsub"


def test_itemize_enumerate():
    src = "\\begin{itemize}\n\\item first thing\n\\item second $x$\n\\end{itemize}"
    assert body(src).strip() == "- first thing\n- second $x$"
    src2 = "\\begin{enumerate}\n\\item one\n\\item two\n\\end{enumerate}"
    assert body(src2).strip() == "1. one\n1. two"


def test_dots_and_escapes_and_tilde():
    assert body(r"a, \dots, b at 50\% \& more~here").strip() == "a, ..., b at 50% & more here"


def test_unknown_macro_errors_with_line():
    msg = expect_error("fine line\n\\frobnicate{x}\n", "frobnicate")
    assert msg.startswith("test.tex:2:")


def test_unknown_environment_errors():
    expect_error("\\begin{tabular}{cc}\na & b\n\\end{tabular}\n", "tabular")


def test_nested_list_errors():
    expect_error(
        "\\begin{itemize}\n\\item outer\n\\begin{itemize}\n\\item inner\n\\end{itemize}\n\\end{itemize}\n",
        "nested lists",
    )
```

- [ ] **Step 2: Run to verify the new tests fail**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py`
Expected: Task 1 tests PASS; each new test FAILs (unsupported-construct errors for math/specials/envs, unsupported command for `\emph`).

- [ ] **Step 3: Implement**

In `mathnotes/latex_processor.py`, add module constants after `_IGNORED_MACROS`:

```python
_STYLE_MACROS = {"emph": "*", "textit": "*", "textbf": "**", "texttt": "`"}
_SECTION_LEVELS = {"section": 1, "subsection": 2, "subsubsection": 3}
_ESCAPED_CHAR_MACROS = {"%", "&", "#", "$", "_", "{", "}", " "}
```

In `_prose`, add branches before the final `else`:

```python
            elif isinstance(n, LatexMathNode):
                out.append(self._math(n))
            elif isinstance(n, LatexSpecialsNode):
                out.append(" " if n.specials_chars == "~" else n.specials_chars)
            elif isinstance(n, LatexEnvironmentNode):
                out.append(self._environment(n))
```

Replace `_macro` with the full dispatcher (the `dref`/`pagelink`/`includedemo` branches raise until Task 3 implements them):

```python
    def _macro(self, n) -> str:
        name = n.macroname
        if name in _STYLE_MACROS:
            args = n.nodeargd.argnlist if n.nodeargd else []
            group = args[-1] if args else None
            if group is None:
                self._err(n, f"\\{name} requires an argument")
            d = _STYLE_MACROS[name]
            return f"{d}{self._prose(group.nodelist).strip()}{d}"
        if name in _SECTION_LEVELS:
            title = self._prose(n.nodeargd.argnlist[-1].nodelist).strip()
            return f"\n\n{'#' * _SECTION_LEVELS[name]} {title}\n\n"
        if name in ("dots", "ldots"):
            return "..."
        if name in _ESCAPED_CHAR_MACROS:
            return name
        if name == "dref":
            return self._dref(n)
        if name == "pagelink":
            return self._pagelink(n)
        if name == "includedemo":
            return self._includedemo(n)
        if name in _METADATA_MACROS or name in _IGNORED_MACROS or name == "detach":
            return ""
        if name == "label":
            self._err(n, "\\label is only supported at the top of a block environment")
        self._err(n, f"unsupported command \\{name} — extend the dialect in latex_processor.py if needed")
```

Add the math, environment, and list handlers:

```python
    def _math(self, n) -> str:
        verbatim = n.latex_verbatim()
        open_d, close_d = n.delimiters
        inner = verbatim[len(open_d): len(verbatim) - len(close_d)].strip()
        if n.displaytype == "display":
            return f"$$ {inner} $$"
        return f"${inner}$"

    def _environment(self, n) -> str:
        name = n.environmentname
        if name in ("itemize", "enumerate"):
            return self._list(n, ordered=(name == "enumerate"))
        if name in _BLOCK_ENV_NAMES:
            self._err(
                n,
                f"nested {name} environment — mathnotes uses the amsthm sibling "
                f"convention (close the outer environment first)",
            )
        self._err(n, f"unsupported environment '{name}'")

    def _list(self, n, ordered: bool) -> str:
        items: List[list] = []
        for child in n.nodelist:
            if isinstance(child, LatexMacroNode) and child.macroname == "item":
                items.append([])
            elif isinstance(child, LatexCommentNode):
                continue
            elif not items:
                if isinstance(child, LatexCharsNode) and not child.chars.strip():
                    continue
                self._err(child, "list content before the first \\item")
            else:
                if isinstance(child, LatexEnvironmentNode) and child.environmentname in ("itemize", "enumerate"):
                    self._err(child, "nested lists are not supported in the dialect")
                items[-1].append(child)
        marker = "1." if ordered else "-"
        lines = [f"{marker} {' '.join(self._prose(item).split())}" for item in items]
        return "\n\n" + "\n".join(lines) + "\n\n"

    def _dref(self, n) -> str:
        self._err(n, "\\dref not implemented yet")

    def _pagelink(self, n) -> str:
        self._err(n, "\\pagelink not implemented yet")

    def _includedemo(self, n) -> str:
        self._err(n, "\\includedemo not implemented yet")
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py`
Expected: `15/15 passed`.

---

### Task 3: Reference macros (`\dref`, `\pagelink`, `\includedemo`)

**Files:**
- Modify: `mathnotes/latex_processor.py`
- Test: `test/test_latex_processor.py` (append)

**Interfaces:**
- Consumes: `_macro` dispatch stubs from Task 2.
- Produces: `\dref{label}` → `@label`; `\dref[text]{label}` → `@{text|label}`; `\dref{type:label}` → `@type:label`; `\pagelink{slug}` → `[[slug]]`; `\pagelink[text]{slug}` → `[[text|slug]]`; `\includedemo{name}` → `{% include_demo "name" %}` on its own paragraph. These are exactly the syntaxes `BlockReferenceProcessor` (`mathnotes/math_utils.py:108`) and `MarkdownProcessor` already handle.

- [ ] **Step 1: Append the failing tests**

```python
# --- Task 3: reference macros ---

def test_dref_plain():
    assert body(r"See \dref{metric-space} here.").strip() == "See @metric-space here."


def test_dref_with_text_and_math():
    out = body(r"Because \dref[every $k$-cell is compact]{every-k-cell-is-compact}.")
    assert out.strip() == "Because @{every $k$-cell is compact|every-k-cell-is-compact}."


def test_dref_type_qualified():
    assert body(r"\dref{theorem:heine-borel}").strip() == "@theorem:heine-borel"


def test_pagelink():
    assert body(r"\pagelink{compact-sets}").strip() == "[[compact-sets]]"
    assert body(r"\pagelink[these notes]{compact-sets}").strip() == "[[these notes|compact-sets]]"


def test_includedemo():
    out = body("Before.\n\\includedemo{electric-field}\nAfter.")
    assert '{% include_demo "electric-field" %}' in out
    # own paragraph so the demo div isn't wrapped mid-sentence
    assert "\n\n{% include_demo" in out and '%}\n\n' in out


def test_dref_empty_label_errors():
    expect_error(r"\dref{}", "dref")
```

- [ ] **Step 2: Run to verify the new tests fail**

Expected: the 6 new tests FAIL with "not implemented yet" / argument errors; prior 15 PASS.

- [ ] **Step 3: Implement**

Replace the three stubs in `mathnotes/latex_processor.py`:

```python
    def _dref(self, n) -> str:
        opt, mand = n.nodeargd.argnlist
        label = "".join(
            c.chars for c in mand.nodelist if isinstance(c, LatexCharsNode)
        ).strip()
        if not label:
            self._err(n, "\\dref requires a non-empty label")
        if opt is None:
            return f"@{label}"
        text = self._prose(opt.nodelist).strip()
        return f"@{{{text}|{label}}}"

    def _pagelink(self, n) -> str:
        opt, mand = n.nodeargd.argnlist
        slug = "".join(
            c.chars for c in mand.nodelist if isinstance(c, LatexCharsNode)
        ).strip()
        if not slug:
            self._err(n, "\\pagelink requires a non-empty slug")
        if opt is None:
            return f"[[{slug}]]"
        text = self._prose(opt.nodelist).strip()
        return f"[[{text}|{slug}]]"

    def _includedemo(self, n) -> str:
        demo = self._chars_arg(n)
        return f'\n\n{{% include_demo "{demo}" %}}\n\n'
```

- [ ] **Step 4: Run tests to verify they pass**

Expected: `21/21 passed`.

---

### Task 4: Block environments and the attachment machine

**Files:**
- Modify: `mathnotes/latex_processor.py`
- Test: `test/test_latex_processor.py` (append)

**Interfaces:**
- Consumes: `_prose`, `_emit`-level helpers from Tasks 1–3; `StructuredMathParser` (round-trip test only).
- Produces: `_transpile_body` replaced by the attachment machine. Source-sibling environments (amsthm convention) become the same nested `:::`/`::::` fence structure the markdown dialect uses, so `StructuredMathParser` reconstructs identical block trees and auto-labels (`proof-of-<parent>` etc.).

**Attachment rules** (from the spec, made exact):
- `theorem`/`lemma`/`proposition`/`exercise` become the open **anchor** (and the proof target).
- `proof` attaches as a child of the current proof target; error if none.
- `corollary` attaches as a child of the open anchor (and becomes the proof target); with no anchor it is top-level and anchors its own proof.
- `solution` attaches to the anchor if the anchor is an `exercise`; error otherwise.
- `note`/`remark`/`example`/`intuition` attach to the open anchor; with no anchor they are top-level.
- `definition`/`axiom` are always top-level and close any open anchor.
- A section heading, any prose, or `\detach` closes the open anchor.
- Blank text between environments does not close the anchor.
- Environment optional arg `[Title]` → block title; `\label{x}` at any top position in the env body → block label (a second `\label` is an error); both optional.

- [ ] **Step 1: Append the failing tests**

```python
# --- Task 4: block environments + attachment ---

THEOREM_PROOF = r"""\begin{theorem}\label{t1}
Statement $x$.
\end{theorem}
\begin{proof}
Because.
\end{proof}
"""


def test_theorem_with_proof_nests():
    out = body(THEOREM_PROOF)
    assert ":::theorem {label: t1}" in out
    assert "::::proof" in out
    # proof fences are inside the theorem fences
    assert out.index("::::proof") < out.rindex(":::")


def test_definition_title_and_autolabel():
    out = body("\\begin{definition}[Open Cover]\nAn \\emph{open cover} is stuff.\n\\end{definition}\n")
    assert ':::definition "Open Cover"' in out
    assert "{label:" not in out  # unlabeled: StructuredMathParser autogenerates from title


def test_roundtrip_through_structured_parser():
    from mathnotes.structured_math import StructuredMathParser

    src = THEOREM_PROOF + r"""\begin{corollary}\label{c1}
Also true.
\end{corollary}
\begin{proof}
Clear.
\end{proof}
"""
    _, content = parse_latex_file(src, "test.tex")
    parser = StructuredMathParser()
    _, markers = parser.parse(content)
    blocks = {b.label: b for b in markers.values()}
    assert set(blocks) == {"t1", "proof-of-t1", "c1", "proof-of-c1"}
    assert blocks["proof-of-t1"].parent is blocks["t1"]
    assert blocks["c1"].parent is blocks["t1"]
    assert blocks["proof-of-c1"].parent is blocks["c1"]


def test_note_attaches_to_anchor():
    src = THEOREM_PROOF + "\\begin{note}\nCareful.\n\\end{note}\n"
    from mathnotes.structured_math import StructuredMathParser
    _, markers = StructuredMathParser().parse(body(src))
    blocks = {b.label: b for b in markers.values()}
    assert blocks["t1-note"].parent is blocks["t1"]


def test_intuition_attaches():
    src = THEOREM_PROOF + "\\begin{intuition}\nRoughly.\n\\end{intuition}\n"
    assert "::::intuition" in body(src)


def test_detach_forces_top_level():
    src = THEOREM_PROOF + "\\detach\n\\begin{note}\nStandalone.\n\\end{note}\n"
    out = body(src)
    assert "\n:::note" in out and "::::note" not in out


def test_standalone_note_is_top_level():
    out = body("\\begin{note}\\label{ref-note}\nSee Rudin.\n\\end{note}\n")
    assert ":::note {label: ref-note}" in out and "::::" not in out


def test_prose_breaks_anchor_so_proof_errors():
    src = "\\begin{theorem}\\label{t2}\nX.\n\\end{theorem}\nInterrupting prose.\n\\begin{proof}\nY.\n\\end{proof}\n"
    expect_error(src, "no preceding")


def test_definition_closes_anchor():
    src = THEOREM_PROOF + "\\begin{definition}[Gadget]\nA gadget.\n\\end{definition}\n"
    out = body(src)
    assert ":::definition" in out and "::::definition" not in out


def test_exercise_solution():
    src = "\\begin{exercise}\\label{e1}\nDo it.\n\\end{exercise}\n\\begin{solution}\nDone.\n\\end{solution}\n"
    out = body(src)
    assert ":::exercise {label: e1}" in out and "::::solution" in out


def test_nested_block_env_errors():
    expect_error(
        "\\begin{theorem}\\label{t3}\nX.\n\\begin{proof}\nY.\n\\end{proof}\n\\end{theorem}\n",
        "sibling convention",
    )


def test_title_with_double_quote_errors():
    expect_error('\\begin{definition}[Say "hi"]\nX.\n\\end{definition}\n', "double quote")


def test_double_label_errors():
    expect_error(
        "\\begin{theorem}\\label{a}\\label{b}\nX.\n\\end{theorem}\n",
        "multiple \\label",
    )
```

- [ ] **Step 2: Run to verify the new tests fail**

Expected: new tests FAIL — currently block environments raise the "nested/unsupported" prose error or produce no fences; 21 prior tests PASS.

- [ ] **Step 3: Implement**

In `mathnotes/latex_processor.py` add after `_ESCAPED_CHAR_MACROS`:

```python
_THEOREM_LIKE = {"theorem", "lemma", "proposition"}
_ATTACHABLE_NOTES = {"note", "remark", "example", "intuition"}
_LABEL_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_:-]*$")


class _BlockNode:
    def __init__(self, env_name: str, title: Optional[str], label: Optional[str], content: str):
        self.env_name = env_name
        self.title = title
        self.label = label
        self.content = content
        self.children: List["_BlockNode"] = []
```

Replace `_transpile_body` in `_Transpiler`:

```python
    def _transpile_body(self, nodes) -> str:
        out: List[str] = []
        anchor: Optional[_BlockNode] = None      # open root block accepting attachments
        proof_target: Optional[_BlockNode] = None  # where the next proof attaches

        def flush():
            nonlocal anchor, proof_target
            if anchor is not None:
                out.append(self._emit_block(anchor, 0))
            anchor = None
            proof_target = None

        for n in nodes:
            if isinstance(n, LatexEnvironmentNode) and n.environmentname in _BLOCK_ENV_NAMES:
                blk = self._parse_block_env(n)
                name = blk.env_name
                if name in _THEOREM_LIKE or name == "exercise":
                    flush()
                    anchor = blk
                    proof_target = blk
                elif name in ("definition", "axiom"):
                    flush()
                    out.append(self._emit_block(blk, 0))
                elif name == "corollary":
                    if anchor is not None:
                        anchor.children.append(blk)
                    else:
                        anchor = blk
                    proof_target = blk
                elif name == "proof":
                    if proof_target is None:
                        self._err(n, "proof has no preceding theorem-like statement")
                    proof_target.children.append(blk)
                elif name == "solution":
                    if anchor is None or anchor.env_name != "exercise":
                        self._err(n, "solution has no preceding exercise")
                    anchor.children.append(blk)
                else:  # _ATTACHABLE_NOTES
                    if anchor is not None:
                        anchor.children.append(blk)
                    else:
                        out.append(self._emit_block(blk, 0))
            elif isinstance(n, LatexMacroNode) and n.macroname == "detach":
                flush()
            elif isinstance(n, LatexMacroNode) and n.macroname in _SECTION_LEVELS:
                flush()
                out.append(self._macro(n))
            elif isinstance(n, LatexCharsNode) and not n.chars.strip():
                if anchor is None:
                    out.append(re.sub(r"\n[ \t]+", "\n", n.chars))
            elif isinstance(n, LatexCommentNode):
                continue
            else:
                flush()
                out.append(self._prose([n]))
        flush()
        return "".join(out)

    def _parse_block_env(self, n) -> _BlockNode:
        title = None
        args = n.nodeargd.argnlist if n.nodeargd else []
        if args and args[0] is not None:
            title = self._prose(args[0].nodelist).strip()
            if '"' in title:
                self._err(n, "block title may not contain a double quote")
        body = list(n.nodelist)
        label = None
        for i, child in enumerate(body):
            if isinstance(child, LatexMacroNode) and child.macroname == "label":
                label = self._chars_arg(child)
                if not _LABEL_RE.match(label):
                    self._err(child, f"invalid block label '{label}'")
                del body[i]
                break
        for child in body:
            if isinstance(child, LatexMacroNode) and child.macroname == "label":
                self._err(child, "multiple \\label commands in one environment")
        content = self._prose(body).strip()
        return _BlockNode(n.environmentname, title, label, content)

    def _emit_block(self, blk: _BlockNode, depth: int) -> str:
        fence = ":" * (3 + depth)
        header = f"{fence}{blk.env_name}"
        if blk.title:
            header += f' "{blk.title}"'
        if blk.label:
            header += f" {{label: {blk.label}}}"
        parts = [header]
        if blk.content:
            parts += ["", blk.content]
        for child in blk.children:
            parts += ["", self._emit_block(child, depth + 1).strip("\n")]
        parts += [fence]
        return "\n\n" + "\n".join(parts) + "\n\n"
```

Note: `_environment` (Task 2) still raises for block envs — that branch is now only reachable for block environments nested *inside* another environment's body, which is exactly the source-nesting error the dialect wants.

- [ ] **Step 4: Run tests to verify they pass**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py`
Expected: `34/34 passed`.

---

### Task 5: Pipeline integration (`content_loader` + five call sites)

**Files:**
- Create: `mathnotes/content_loader.py`
- Modify: `mathnotes/content_discovery.py`
- Modify: `mathnotes/block_index.py:146-164, 306-309`
- Modify: `mathnotes/markdown_processor.py:66-70`
- Modify: `mathnotes/navigation.py:9, 24-41, 61`
- Modify: `mathnotes/file_utils.py:7, 28-45`
- Test: `test/test_latex_integration.py` (new)

**Interfaces:**
- Consumes: `parse_latex_file` from `mathnotes/latex_processor.py`.
- Produces: `load_content_file(filepath) -> Tuple[Dict[str, Any], str]` and `clear_content_cache()` in `mathnotes/content_loader.py`; `CONTENT_EXTENSIONS = (".md", ".tex")`. After this task, `.tex` files are discovered, indexed, cross-referenced, and rendered site-wide.

- [ ] **Step 1: Write the failing integration test**

Create `test/test_latex_integration.py`:

```python
"""End-to-end test: a .tex page is a full citizen of the pipeline.

Run:
    docker exec -i mathnotes-static-builder python3 - < test/test_latex_integration.py
"""

import os
import sys
import tempfile
import traceback

try:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
except NameError:
    sys.path.insert(0, "/app")

MD_PAGE = """---
title: MD Page
description: Markdown fixture.
---

# MD Page

:::definition "Widget" {label: widget}
A **widget** is a thing.
:::

See @tex-thm for more.
"""

TEX_PAGE = r"""\title{Tex Page}
\description{LaTeX fixture.}

\section{Tex Page}

\begin{theorem}\label{tex-thm}
Every \dref{widget} is fine.
\end{theorem}
\begin{proof}
Trivial.
\end{proof}
"""


def in_temp_site(fn):
    from mathnotes.config import CONTENT_DIRS

    old_cwd = os.getcwd()
    with tempfile.TemporaryDirectory() as td:
        for d in CONTENT_DIRS:
            os.makedirs(os.path.join(td, d), exist_ok=True)
        os.chdir(td)
        try:
            fn(td)
        finally:
            os.chdir(old_cwd)


def fresh_pipeline():
    from mathnotes.content_discovery import ContentDiscovery
    from mathnotes.block_index import BlockIndex
    from mathnotes.markdown_processor import MarkdownProcessor, clear_markdown_cache
    from mathnotes.content_loader import clear_content_cache
    from mathnotes.navigation import clear_navigation_cache

    clear_markdown_cache()
    clear_content_cache()
    clear_navigation_cache()
    discovery = ContentDiscovery()
    discovery.build_url_mappings()
    index = BlockIndex(discovery)
    index.build_index()
    return discovery, index, MarkdownProcessor(discovery, index)


def test_cross_format_references():
    def check(td):
        with open("content/test/md-page.md", "w") as f:
            f.write(MD_PAGE)
        with open("content/test/tex-page.tex", "w") as f:
            f.write(TEX_PAGE)

        discovery, index, proc = fresh_pipeline()
        assert "test/tex-page/" in discovery.url_mappings

        tex = proc.render_markdown_file("content/test/tex-page.tex")
        assert tex["title"] == "Tex Page"
        assert 'id="tex-thm"' in tex["content"]
        assert 'id="proof-of-tex-thm"' in tex["content"]
        # .tex page links to a block defined in .md
        assert "/mathnotes/test/md-page/#widget" in tex["content"]

        md = proc.render_markdown_file("content/test/md-page.md")
        # .md page links to a block defined in .tex
        assert "/mathnotes/test/tex-page/#tex-thm" in md["content"]
        assert "block-reference-error" not in md["content"]
        assert "block-reference-error" not in tex["content"]

        from pathlib import Path
        from mathnotes.navigation import get_page_title
        assert get_page_title(Path("content/test/tex-page.tex")) == "Tex Page"

    in_temp_site(check)


def test_url_collision_errors():
    def check(td):
        with open("content/test/dup.md", "w") as f:
            f.write("---\ntitle: Dup\n---\nx\n")
        with open("content/test/dup.tex", "w") as f:
            f.write("\\title{Dup}\nx\n")
        from mathnotes.content_discovery import ContentDiscovery
        from mathnotes.content_loader import clear_content_cache
        clear_content_cache()
        try:
            ContentDiscovery().build_url_mappings()
        except ValueError as e:
            assert "collision" in str(e).lower()
            return
        raise AssertionError("expected URL collision error")

    in_temp_site(check)


def main():
    tests = [test_cross_format_references, test_url_collision_errors]
    failures = 0
    for t in tests:
        try:
            t()
            print(f"PASS {t.__name__}")
        except Exception:
            failures += 1
            print(f"FAIL {t.__name__}")
            traceback.print_exc()
    print(f"{len(tests) - failures}/{len(tests)} passed")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run to verify it fails**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_latex_integration.py`
Expected: FAIL — `No module named 'mathnotes.content_loader'`.

- [ ] **Step 3: Create the loader**

Create `mathnotes/content_loader.py`:

```python
"""Unified loader for content files.

Returns (metadata, content) for either source format, where content is in
the internal markdown dialect. .md files are frontmatter documents; .tex
files are transpiled by latex_processor (cached by mtime, since a full
build loads each file in several phases).
"""

import os
from typing import Any, Dict, Tuple

import frontmatter

CONTENT_EXTENSIONS = (".md", ".tex")

_tex_cache: Dict[str, Tuple[float, Dict[str, Any], str]] = {}


def clear_content_cache():
    _tex_cache.clear()


def load_content_file(filepath) -> Tuple[Dict[str, Any], str]:
    path = str(filepath)
    if path.endswith(".tex"):
        from .latex_processor import parse_latex_file

        mtime = os.path.getmtime(path)
        cached = _tex_cache.get(path)
        if cached and cached[0] >= mtime:
            return dict(cached[1]), cached[2]
        with open(path, "r", encoding="utf-8") as f:
            source = f.read()
        metadata, content = parse_latex_file(source, filepath=path)
        _tex_cache[path] = (mtime, metadata, content)
        return dict(metadata), content
    with open(path, "r", encoding="utf-8") as f:
        post = frontmatter.load(f)
    return post.metadata, post.content
```

- [ ] **Step 4: Switch the five call sites**

**(a) `mathnotes/content_discovery.py`** — replace the imports and the loop head. Old (lines 1-4, 24-26):

```python
from pathlib import Path
import frontmatter
from typing import Dict
from .config import CONTENT_DIRS
```
```python
            for md_file in section_path.rglob("*.md"):
                with open(md_file, "r", encoding="utf-8") as f:
                    post = frontmatter.load(f)
```

New:

```python
from pathlib import Path
from typing import Dict
from .config import CONTENT_DIRS
from .content_loader import load_content_file
```
```python
            content_files = sorted([*section_path.rglob("*.md"), *section_path.rglob("*.tex")])
            for md_file in content_files:
                metadata, _ = load_content_file(md_file)
```

Then in the body of that loop: `post.metadata.get("slug")` → `metadata.get("slug")`; replace the hardcoded extension strip

```python
                    url_path = url_path[:-3]
```
with
```python
                    url_path = url_path[: -len(md_file.suffix)]
```
and immediately before `self.url_mappings[canonical_url] = file_path`, add the collision guard:

```python
                if canonical_url in self.url_mappings:
                    raise ValueError(
                        f"URL collision: {file_path} and "
                        f"{self.url_mappings[canonical_url]} both map to /{canonical_url}"
                    )
```

**(b) `mathnotes/block_index.py`** — line 153: `if file.endswith(".md"):` → `if file.endswith((".md", ".tex")):`. In `_index_file` (lines 158-164), replace

```python
        with open(file_path, "r", encoding="utf-8") as f:
            post = frontmatter.load(f)
            content = post.content

            # Get page title from frontmatter
            page_title = post.metadata.get("title", None)
```

with (and de-indent the rest of the method body one level to match):

```python
        metadata, content = load_content_file(file_path)

        # Get page title from metadata
        page_title = metadata.get("title", None)
```

In `_collect_all_references` (lines 306-309), replace

```python
            with open(file_path, "r", encoding="utf-8") as f:
                post = frontmatter.load(f)
                original_content = post.content
```

with (de-indenting the block below it one level):

```python
            metadata, original_content = load_content_file(file_path)
```

Add `from .content_loader import load_content_file` to the imports and delete the now-unused `import frontmatter`.

**(c) `mathnotes/markdown_processor.py`** — replace (lines 66-70):

```python
        with open(filepath, "r", encoding="utf-8") as f:
            post = frontmatter.load(f)

            # Process Jekyll-style includes
            content = post.content
```

with (de-indent the rest of the method one level):

```python
        metadata, content = load_content_file(filepath)
```

Then replace the three remaining `post.metadata` uses in the method with `metadata` (description generation, `result["metadata"]`, and the `title` default). Add `from .content_loader import load_content_file` and remove the unused `import frontmatter`.

**(d) `mathnotes/navigation.py`** — line 61: `item.suffix == ".md"` → `item.suffix in (".md", ".tex")`. In `get_page_title`, replace

```python
        with open(file_path, "r", encoding="utf-8") as f:
            post = frontmatter.load(f)
            fm_title = post.metadata.get("title", "").strip()
            if fm_title:
                title = fm_title
```

with

```python
        metadata, _ = load_content_file(file_path)
        fm_title = (metadata.get("title") or "").strip()
        if fm_title:
            title = fm_title
```

Swap `import frontmatter` for `from .content_loader import load_content_file`.

**(e) `mathnotes/file_utils.py`** — line 29: `item.suffix == ".md"` → `item.suffix in (".md", ".tex")`. Replace the title block

```python
                try:
                    with open(item, "r", encoding="utf-8") as f:
                        post = frontmatter.load(f)
                        title = post.metadata.get("title", "").strip()
                        if not title:
                            # Fall back to filename-based title
                            title = item.stem.replace("-", " ").title()
                except Exception:
                    # If anything goes wrong reading the file, use filename
                    title = item.stem.replace("-", " ").title()
```

with

```python
                try:
                    metadata, _ = load_content_file(item)
                    title = (metadata.get("title") or "").strip()
                    if not title:
                        # Fall back to filename-based title
                        title = item.stem.replace("-", " ").title()
                except Exception:
                    # If anything goes wrong reading the file, use filename
                    title = item.stem.replace("-", " ").title()
```

Swap `import frontmatter` for `from .content_loader import load_content_file`.

- [ ] **Step 5: Run both test files**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_latex_integration.py`
Expected: `2/2 passed`.
Run: `docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py`
Expected: `34/34 passed`.

- [ ] **Step 6: Regression — the existing site still builds identically**

Run: `docker exec mathnotes-static-builder python3 /app/scripts/build_static_simple.py --output /tmp/task5-regression 2>&1 | tail -5`
Expected: build completes with the same block/URL counts as before this task (no errors, no new duplicate-label warnings). Also run the pre-existing test: `docker exec -i -w /app mathnotes-static-builder python3 - < test/test_cache_invalidation.py` → passes.

---

### Task 6: `mathnotes.sty` — content files compile with pdflatex

**Files:**
- Create: `latex/mathnotes.sty`
- Create: `latex/README.md`

**Interfaces:**
- Consumes: nothing from the pipeline (pure LaTeX).
- Produces: every command/environment in the dialect defined for real LaTeX, so `pdflatex` compiles any standalone content file. The site build never reads these files.

- [ ] **Step 1: Write the package**

Create `latex/mathnotes.sty`:

```latex
% mathnotes.sty — LaTeX support for mathnotes content files.
% Any content/*.tex file written as a standalone document compiles with:
%   TEXINPUTS=<repo>/latex: pdflatex <file>.tex
\NeedsTeXFormat{LaTeX2e}
\ProvidesPackage{mathnotes}[2026/07/07 Mathnotes content dialect]

\RequirePackage{amsmath}
\RequirePackage{amssymb}
\RequirePackage{amsthm}
\RequirePackage[hidelinks]{hyperref}

% Site metadata commands (\title is standard LaTeX; these are no-ops in PDF)
\newcommand{\description}[1]{}
\newcommand{\slug}[1]{}
% Clears the site's block-attachment anchor; does nothing in PDF
\newcommand{\detach}{}

% Block reference: \dref{label} or \dref[custom text]{label}
\NewDocumentCommand{\dref}{o m}{%
  \IfNoValueTF{#1}{\hyperref[#2]{#2}}{\hyperref[#2]{#1}}%
}
% Page link: \pagelink{slug} or \pagelink[text]{slug}
\NewDocumentCommand{\pagelink}{o m}{%
  \IfNoValueTF{#1}{\texttt{#2}}{#1}%
}
% Interactive demo placeholder
\newcommand{\includedemo}[1]{\begin{quote}\emph{[Interactive demo: #1]}\end{quote}}

% Theorem environments matching the site's block types (amsthm's proof
% environment covers proofs)
\theoremstyle{plain}
\newtheorem{theorem}{Theorem}
\newtheorem{lemma}{Lemma}
\newtheorem{proposition}{Proposition}
\newtheorem{corollary}{Corollary}
\newtheorem{axiom}{Axiom}
\theoremstyle{definition}
\newtheorem{definition}{Definition}
\newtheorem{example}{Example}
\newtheorem{exercise}{Exercise}
\newtheorem{solution}{Solution}
\theoremstyle{remark}
\newtheorem{remark}{Remark}
\newtheorem{note}{Note}
\newtheorem{intuition}{Intuition}
```

- [ ] **Step 2: Write the usage doc**

Create `latex/README.md`:

```markdown
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
- Theorem-like environments follow the amsthm sibling convention
  (`\begin{proof}` *after* `\end{theorem}`); the site re-nests them.
  `\detach` stops a following note/remark from attaching to the previous
  theorem.
- `\dref{label}` / `\dref[text]{label}` = `@label` / `@{text|label}`.
- `\pagelink{slug}`, `\includedemo{name}`, display math via `\[ ... \]`.
- Unsupported LaTeX is a build error by design; extend the dialect in
  `mathnotes/latex_processor.py` deliberately.
```

- [ ] **Step 3: Verify (best-effort — pdflatex is not required on this machine)**

Run: `which pdflatex && echo present || echo "pdflatex not installed — skip local compile check"`

If present, write this to the scratchpad as `styprobe.tex` and compile it with `TEXINPUTS=<repo>/latex: pdflatex -interaction=nonstopmode -output-directory=/tmp styprobe.tex` (expected: exit 0, PDF produced):

```latex
\documentclass{article}
\usepackage{mathnotes}
\title{Probe}
\description{Probe file for mathnotes.sty.}
\begin{document}
\begin{theorem}\label{probe-thm}
For all $x$, $x = x$. See \dref[the theorem]{probe-thm} and \pagelink{compact-sets}.
\end{theorem}
\begin{proof}
Trivial. \detach
\end{proof}
\includedemo{electric-field}
\end{document}
```

If pdflatex is absent: print the skip message and move on (manual check per spec, not CI).

---

### Task 7: Pilot — convert `compact-sets.md` to LaTeX and verify site parity

**Files:**
- Create: `content/topology/compact-sets.tex`
- Delete: `content/topology/compact-sets.md`

**Interfaces:**
- Consumes: everything from Tasks 1–6.
- Produces: the pilot page. Canonical URL `/mathnotes/topology/compact-sets/` and every block label are unchanged, so all incoming references keep resolving.

**Known content note (flag to the user, do not silently fix anything else):** `compact-sets.md:186` contains a malformed reference — `@{infinite subsets of a compact set $K$ have a limit point in $K$, $E$ has ...` is never closed with `|label}`, so today it renders as literal text. The conversion below repairs it into a proper `\dref[...]{infinite-subset-of-compact-set-has-limit-point}`, which adds exactly one new link on the page. This is the ONLY intentional rendering difference; everything else (typos included) is converted verbatim.

- [ ] **Step 1: Capture the baseline**

```bash
docker exec mathnotes-static-builder python3 /app/scripts/build_static_simple.py --output /tmp/pilot-baseline 2>&1 | tail -3
docker exec mathnotes-static-builder sh -c "grep -rho 'topology/compact-sets/#[a-zA-Z0-9-]*' /tmp/pilot-baseline | sort | uniq -c" > /tmp/pilot-baseline-refs.txt
docker exec mathnotes-static-builder sh -c "grep -o 'id=\"[a-zA-Z0-9-]*\"' /tmp/pilot-baseline/mathnotes/topology/compact-sets/index.html | sort" > /tmp/pilot-baseline-ids.txt
```

Expected: build succeeds; both baseline files non-empty.

- [ ] **Step 2: Write the converted file**

Create `content/topology/compact-sets.tex` with exactly this content:

```latex
\documentclass{article}
\usepackage{mathnotes}

\title{Compact Sets}
\description{Introduces compact sets.}

\begin{document}

\section{Compact Sets}

\begin{note}\label{compact-sets-reference-note}
This section was developed by following Rudin, \emph{Principles of Mathematical Analysis}, Chapter 2.
\end{note}

\begin{definition}[Open Cover]
An \textbf{open cover} of a set $E$ in a \dref{metric-space} $X$ is a collection $\{G_\alpha\}$ of open subsets of $X$ such that $E \subset \bigcup_\alpha G_\alpha.$
\end{definition}

\begin{definition}[Compact]\label{compact}
A subset $K$ of a metric space $X$ is said to be \textbf{compact} if every open cover of $K$ contains a finite subcover. More explicitly, the requirement is that if $\{G_\alpha\}$ is an open cover of $K,$ then there are finitely many indicies $\alpha_1, \dots, \alpha_n$ such that
\[ K \subset G_{\alpha_1} \cup \cdots \cup G_{\alpha_n}. \]
\end{definition}

\begin{theorem}\label{finite-sets-are-compact}
Every finite set is compact.
\end{theorem}
\begin{proof}
Suppose $K$ is a finite set in metric space $X$ and that $\{G_\alpha\}, \alpha \in A$ is an open cover of $K.$ Since $K$ is finite, we can enumerate its points as $\{k_1, \dots, k_n\},$ for some $n \geq 0.$ Then, for each $i = 1, \dots, n$ (there are none when $n = 0$,) pick an $\alpha(i) \in A$ with $x_i \in G_\alpha(i).$ Define the index set
\[ A_0 = \{\alpha(1), \dots, \alpha(n)\} \subset A. \]
Because $n$ is finite, $A_0$ is finite as well, and
\[ K = \{k_1, \dots, k_n\} \subset \bigcup_{\alpha \in A_0} G_\alpha, \]
so $\{G_\alpha\}, \alpha \in A_0$ is a finite sub-cover of the original open cover. Therefore, every open cover of $K$ has a finite sub-cover, and $K$ is compact.
\end{proof}

\begin{theorem}\label{compact-relative-to-subspace}
Suppose $K \subset Y \subset X.$ Then $K$ is compact relative to $X$ iff $K$ is compact relative to $Y.$
\end{theorem}
\begin{proof}
Suppose $K$ is compact relative to $X$ and that $\{V_\alpha\}$ is an open cover of $K$ relative to $Y,$ such that $K \subset \bigcup_\alpha V_\alpha.$ We need to show that a finite subset of $\{V_\alpha\}$ covers $K.$  Because $\{V_\alpha\}$ is open relative to $Y$ and $Y \subset X$ (see \dref{open-relative-iff-intersection-with-open-subset}) there are sets $G_\alpha,$ open relative to $X,$ such that $V_a = Y \cap G_\alpha,$ for each $\alpha.$ Now, since $K$ is compact relative to $X,$ we have
\[ K \subset G_{\alpha_1} \cup \cdots \cup G_{\alpha_n}, \tag{a} \]
for some finite set of indices $a_1, \dots, a_n.$ Now, since $K \subset Y,$
\[ K \subset V_{\alpha_1} \cup \cdots \cup V_{\alpha_n}, \tag{b} \]
which shows $K$ is compact relative to $Y.$

Conversely, suppose $K$ is compact relative to $Y$ and let $\{G_\alpha\}$ be a cover of $K$ open relative to $X.$ We need to show there is a finite subset of $\{G_\alpha\}$ that covers $K.$ Let $V_\alpha = Y \cap G_\alpha,$ for each $\alpha.$ Then (b) will hold for some set of indicies, $\alpha_1, \dots, \alpha_n,$ and since each $V_\alpha \subset G_\alpha,$ (a) is implied by (b) and we've shown $K$ is compact relative to $X.$
\end{proof}

\begin{theorem}\label{compact-implies-closed}
Any compact subset $K$ of a metric space $X$ is closed.
\end{theorem}
\begin{proof}
Suppose $K$ is compact relative to metric space $X.$ Let $p \in K^c.$ For each $q \in K,$ we can define $r_q = \frac{1}{2} d(p,q),$ and let $P_q$ and $Q_q$ be neighborhoods of radius $r_q$ around $p$ and $q,$ respectively. Note that $P_q$ and $Q_q$ are disjoint, because we defined their radii to be half the distance between them, and they are open.) Now, since $K$ is compact, we can pick a finite number of points in $K,$ $q_1, \dots, q_n,$ such that $K \subset Q_{q_1} \cup \cdots \cup Q_{q_n} = Q$ ($Q$ is a finite subcover of $K.$) Using the same set of points as reference, let $P_{q_1} \cap \cdots \cap P_{q_n} = P.$ Note that $P \cap Q = \{\},$ since each $P_q$ is disjoint with its paired $Q_q$ (to be in $P$, a point must be in all $P_q,$ but any point in $Q$ is not in at least one $P_q.$) $P$ is open, since it is the intersection of finitely many open sets (see \dref{union-and-intersection-of-open-and-closed-sets}) and obviously contains $p,$ since each $P_q$ contains $p$. Therefore, $p$ has a neigborhood $P$ that is disjoint with $K$ (since $P \cap K \subset P \cap Q = \{\}$), and is therefore an interior point of $K^c.$ It follows that $K^c$ is open, and that $K$ is closed.
\end{proof}

\begin{theorem}\label{closed-subsets-of-compact-sets-are-compact}
Closed subsets of compact sets are compact.
\end{theorem}
\begin{proof}
Suppose $F \subset K \subset X,$ with $F$ closed relative to $X,$ and $K$ compact. Let $\{V_\alpha\}$ be an open cover of $F.$ Since $F^c$ is open relative to $X$ (see \dref{open-iff-complement-closed}), if we add it to $\{V_\alpha\},$ we obtain an open cover of $K;$ let's call it $\Omega.$ Since $K$ is compact, we can obtain a finite subcover of $K$ by discarding all but a finite number of sets from $\Omega;$ let's call it $\Phi.$ Since $F \subset K,$ $\Phi$ is also a finite subcover of $F,$ and therefore $F$ is compact.
\end{proof}
\begin{note}
If $F^c \in \Phi,$ we may, but aren't required, to exclude it, and still have a finite open cover of $F.$
\end{note}
\begin{corollary}\label{intersection-of-closed-and-compact-is-compact}
If $F$ is closed and $K$ is compact, then $F \cap K$ is compact.
\end{corollary}
\begin{proof}
Because \dref[compact sets are closed]{compact-implies-closed} and \dref[the intersection of two closed sets is again closed]{union-and-intersection-of-open-and-closed-sets}, $F \cap K$ is closed. Since $F \cap K \subset K$ and \dref[closed subsets of compact sets are compact]{closed-subsets-of-compact-sets-are-compact}, $F \cap K$ is compact.
\end{proof}

\begin{theorem}\label{nonempty-intersection-of-finitely-many-compact-sets}
If $\{K_\alpha\}$ is a collection of compact subsets of a metric space $X$ such that the intersection of every finite subcollection of $\{K_\alpha\}$ is nonempty, then $\bigcap K_\alpha$ is nonempty.
\end{theorem}
\begin{proof}
Let $G_\alpha = K_\alpha^c$ for each $\alpha,$ and note that since $K_\alpha$ is \dref[compact and therefore closed]{compact-implies-closed}, $G_\alpha$ is open. Then, fix a member $K_1$ of $\{K_\alpha\}.$ Assume, for contradiction's sake, that no point of $K_1$ is in all $K_\alpha,$ that is, that $\bigcap K_\alpha = \emptyset.$ Then, any point $x \in K_1$ is in some $K_\alpha^c = G_\alpha,$ so $\{G_\alpha\}$ forms an open cover of $K_1.$ Since $K_1$ is compact, some finite subset $G_{\alpha_1}, \dots, G_{\alpha_n}$ of $\{G_\alpha\}$ forms a finite subcover of $K_1$ such that $K_1 \subset G_{\alpha_1} \cup \cdots \cup G_{\alpha_n} = \left ( K_{\alpha_1} \cap \cdots \cap K_{\alpha_n} \right )^c$ (by De Morgan's.) Therefore $K_1 \cap K_{\alpha_1} \cap \cdots \cap K_{\alpha_n} = \emptyset.$ This is an empty intersection of a finite subcollection of $\{K_\alpha\},$ which contradicts our hypothesis that all finite intersections are nonempty. Therefore, our assumption that no point in $K_1$ is in all $K_\alpha$ is incorrect, and some point in $K_1$ is in all $K_\alpha,$ and therefore $\bigcap K_\alpha$ is not empty.
\end{proof}
\begin{corollary}\label{intersection-of-nonempty-nested-compact-sets-is-nonempty}
If $\{K_\alpha\}$ is a sequence of nonempty compact sets such that $K_{n+1} \subset K_n, n = 1, 2, 3, \dots,$ then $\bigcap_{i=1}^\infty K_n$ is not empty.
\end{corollary}
\begin{proof}
Suppose $x \in K_n, n \geq 2.$ Then, by definition, $x \in K_{n-1},$ and by induction, $x \in K_1.$ Then, every $K_\alpha$ is a nonempty subset of $K_1,$ and so the intersection of any finite number of these $K_\alpha$ will be nonempty, and by \dref{nonempty-intersection-of-finitely-many-compact-sets}, $\bigcap_{i=1}^\infty K_n$ is not empty.
\end{proof}

\begin{theorem}\label{infinite-subset-of-compact-set-has-limit-point}
If $E$ is an infinite subset of a compact set $K,$ then $E$ has a limit point in $K.$
\end{theorem}
\begin{proof}
Assume, for the sake of contradiction, that no point in $K$ is a limit point of $E.$ Then any point $q$ in $K$ has a neighborhood with at most one point in $E;$ $q,$ if $q \in E.$ Since $E$ is infinite, an infinite number of these singleton neighborhoods would be required to cover it, and therefore to cover $K,$ since $E \subset K.$ But, this contradicts our hypothesis that $K$ is compact. Therefore, our provisional assumption must be false, and $K$ must contain a limit point of $E.$
\end{proof}

\begin{theorem}\label{intersection-of-sequence-of-nested-intervals-is-nonempty}
If ${I_n}$ is a sequence of intervals in $R^1,$ such that $I_{n+1} \subset I_n, n = 1,2,3,...,$ then $\bigcap_{i=1}^n I_n$ is not empty.
\end{theorem}
\begin{proof}
Let $I_n = [a_n, b_n],$ and let $E$ be the set of all $a_n.$ Then, $E$ is nonempty, because even if $a_n = b_n$ for all $n,$ it at least contains a single point. It is also bounded above by $b_1,$ since any $b_n$ is in $[a_1, b_1].$ Let $x = \sup E.$ Let $m$ and $n$ be positive integers and we have that
\[ a_n \leq a_{m+n} \leq b_{m+n} \leq b_m, \]
so that $x \leq b_m$ for each $m.$ Since $a_m \leq x,$ we have that $a_m \leq x \leq b_m,$ that is, $x \in I_m$ for all $m = 1, 2, 3, \dots,$ so $x \in \bigcap_{i=1}^n I_n$ and thus $\bigcap_{i=1}^n I_n$ is not empty.
\end{proof}

\begin{theorem}\label{every-k-cell-is-compact}
Every $k$-cell is compact.
\end{theorem}
\begin{proof}
Let $I$ be a $k$-cell, consisting of all points $\vec{x} = (x_1, \dots, x_k)$ such that $a_j \leq x_j \leq b_j, 1 \leq j \leq k.$ Let
\[ \delta = { \sqrt{\sum_{j=1}^k (b_j - a_j)^2}  }, \]
i.e., the maximum distance between any two points in $I$ (the diagonal). Then for any points $\vec{x}, \vec{y} \in I, |\vec{x} - \vec{y}| \leq \delta.$

Suppose, for the sake of contradiction, that there is an open cover $\{G_\alpha\}$ of $I$ that contains no finite subcover of $I.$ Now, let $c_j = (a_j + b_j)/2,$ i.e. $c_j$ is the midpoint of $[a_j, b_j].$ We can subdivide $I$ into $2^k$ $k$-cells $Q_i,$ determined by the intervals $[a_j, c_j]$ and $[c_j, b_j].$ At least one $Q_i,$ call it $I_1,$ cannot be covered by any finite subcollection of $\{G_\alpha\},$ or else $I$ would have a finite subcover in $\{G_\alpha\}.$ We then can subdivide $I_1$ and so on, obtaining a sequence $\{I_n\}$ with the following properties:

(a) $I_{n+1} \subset I_{n}$ (each $k$-cell in the sequence is nested in the previous.)

(b) $I_n$ is not covered by any finite subset of $\{G_\alpha\}.$

(c) If $\vec{x}, \vec{y} \in I_n,$ then $|\vec{x} - \vec{y}| \leq 2^{-n} \delta.$

From (a) and \dref{intersection-of-sequence-of-nested-intervals-is-nonempty}, there is some point $\vec{x}^*$ that is in every $I_n.$ For some $\alpha, x^* \in G_\alpha,$ since $\{G_\alpha\}$ is a cover of all of $I.$ $G_\alpha$ is open, so for some $r > 0, |\vec{y} - \vec{x^*}| < r$ implies that $y \in G_\alpha,$ that is, $\vec{x}$ has a neighborhood that lies entirely within $G_\alpha.$ If we make $n$ big enough, we have that $2^{-n} \delta < r,$ so by (c), $I_n \subset G_\alpha,$ that is, $I_n$ is entirely covered by $G_\alpha.$ But, this contradicts (b), so our provisional assumption is incorrect, and $\{G_\alpha\}$ must have a finite subcover that covers $I,$ and therefore $I$ is compact.
\end{proof}
\begin{intuition}
If a $k$-cell has an open cover $\{G_\alpha\}$, then any point in it will be in some $G_\alpha,$ and can therefore be surrounded by an open ball with some positive radius, lying entirely in $G_\alpha$. That open ball takes up some space, and we can then subdivide the $k$-cell into small enough parts that some part is entirely within that open ball. We still have finitely many subdivisions, and each of those could be covered with a similary constructed open ball, which means we can cover the entire $k$-cell with finitely many open balls covered by finitely many elements of $\{G_\alpha\}.$
\end{intuition}

\begin{theorem}[Heine-Borel]\label{heine-borel}
If a set $E$ in $R^k$ has one of the following three properties, then it has the other two:

(a) $E$ is closed and bounded.

(b) $E$ is compact.

(c) Every infinite subset of $E$ has a limit point in $E.$
\end{theorem}
\begin{proof}
If (a) holds, then $E \subset I$ for some $k$-cell $I,$ and (b) follows from the facts that \dref[every $k$-cell is compact]{every-k-cell-is-compact} and \dref[closed subsets of compact sets are compact]{closed-subsets-of-compact-sets-are-compact}. Then, (c) follows from the fact that \dref[any infinite subset $K$ of a compact set $E$ has a limit point in $E$]{infinite-subset-of-compact-set-has-limit-point}. To complete the cycle of implication, we must now show that (c) implies (a).

Assume, for the sake of contradiction, that $E$ is not bounded. Then, $E$ must contain an indexed set of points $\{x_n\}, n = 1, 2, 3, \dots$ where each $x_n$ must satisfy $|x_n| > n.$ $\{x_n\}$ is obviously infinite, but we will show it has no limit points in $E.$ Let $p \in E.$ Then for some positive integer $N,$ $|p| < N.$ Since $N$ is finite, there can only be finitely many points $\{q_\alpha\}$ in $\{x_n\}$ with $|x_n| < N.$ If $\{q_\alpha\}$ is empty, then $p$ is obviously not a limit point of $\{x_n\}.$ Otherwise, let $r = \min\{d(p, q_\alpha)\}.$ Then $r > 0$ and let $N_r\{p\}$ be a neighborhood of $p.$ Since no point in $\{x_n\},$ other than perhaps $p,$ lies in $\{x_n\},$ $p$ is clearly not a limit point of $\{x_n\}.$ Thus, our provisional assumption is invalid and (c) implies $E$ is bounded.

To show that (c) implies $E$ is closed, assume for the sake of contradiction that $E$ is not closed. Then, there is a point $x_0 \in R^k$ which is a limit point of $E$ but is not in $E.$ We will construct an infinite subset of $E$ and show that it has no limit point in $E.$ For $n = 1, 2, 3, \dots,$ let the point $x_n$ be some point in $E$ such that $|x_n - x_0| < 1/n;$ let $\{x_n\}$ be the set of such points. $\{x_n\}$ is certainly infinite, because $|x_n - x_0|$ will eventually be bigger than $1/n$ for some $n$ if we keep reusing the same $x_n$ infinitely many times. Now, $\{x_n\}$ has $x_0$ as a limit point, and we will show it is its only limit point in $R^k.$ Assume $y \in R^k, y \neq x_0.$ Then, via the triangle inequality,
\[ \begin{aligned}
|x_n - y| & \geq |x_0 - y| - |x_n - x_0| \\
          & \geq |x_0 - y| - \frac{1}{n} \\
          & \geq \frac{1}{2} |x_0 - y|
\end{aligned} \]
for all but finitely many $n,$ and thus $y$ is not a limit point of $\{x_n\}$ because its \dref[its neighborhoods do not contain infinitely many points of $\{x_n\}$]{neighborhood-of-limit-point-contains-infinitely-many-points}. Thus, $\{x_n\}$ has no limit point in $E,$ which contradicts (c), and therefore our provisional assumption that $E$ is not closed is incorrect, and (c) implies that $E$ is closed.
\end{proof}
\begin{note}
Without proof here, (b) and (c) are equivalent in any metric space, but (a) does not imply (b) and (c) in every metric space (we assumed $R^k$ above.)
\end{note}

\begin{theorem}[Weierstrass]\label{weierstrass}
Every bounded infinite subset of $R^k$ has a limit point in $R^k.$
\end{theorem}
\begin{proof}
Suppose $E$ is a bounded infinite subset of $R^k.$ Then, it is a subset of a $k$-cell $I \subset R^k,$ and because \dref[every $k$-cell is compact]{every-k-cell-is-compact}, $I$ is compact. Since \dref[infinite subsets of a compact set $K$ have a limit point in $K$]{infinite-subset-of-compact-set-has-limit-point}, $E$ has a limit point in $I$ and therefore in $R^k.$
\end{proof}
\begin{note}
This theorem shows up in other forms, especially related to sequences. For example, in my intro real analysis class, it was expressed as the much weaker "Every bounded sequence in $R^1$ has a convergent subsequence." Other equivalent forms are

\begin{itemize}
\item Any bounded sequence in $R^k$ has a convergent subsequence.
\item Closed and bounded subsets of $R^k$ are sequentially compact.
\end{itemize}

There seem to be two approaches to topology of metric spaces - the point/set approach used by Rudin and covered here, and a sequence based approach that many other authors like Pugh use in introductory texts. We don't use the term "sequentially compact" anywhere in this page - that's work for a future exercise.
\end{note}

\end{document}
```

Then delete the original: `rm content/topology/compact-sets.md`

- [ ] **Step 3: Build and compare against baseline**

```bash
docker exec mathnotes-static-builder python3 /app/scripts/build_static_simple.py --output /tmp/pilot-after 2>&1 | tail -3
docker exec mathnotes-static-builder sh -c "grep -rho 'topology/compact-sets/#[a-zA-Z0-9-]*' /tmp/pilot-after | sort | uniq -c" > /tmp/pilot-after-refs.txt
docker exec mathnotes-static-builder sh -c "grep -o 'id=\"[a-zA-Z0-9-]*\"' /tmp/pilot-after/mathnotes/topology/compact-sets/index.html | sort" > /tmp/pilot-after-ids.txt
diff /tmp/pilot-baseline-ids.txt /tmp/pilot-after-ids.txt
diff /tmp/pilot-baseline-refs.txt /tmp/pilot-after-refs.txt
```

Expected:
- Build succeeds, no duplicate-label warnings, page exists at `/tmp/pilot-after/mathnotes/topology/compact-sets/index.html`.
- `ids` diff: **empty** (same block anchors, including auto-generated `proof-of-*`, `*-note`, and `open-cover` labels).
- `refs` diff: the ONLY change is +1 occurrence of `topology/compact-sets/#infinite-subset-of-compact-set-has-limit-point` (the repaired Weierstrass reference; it may appear in both the page HTML and its tooltip data). Any other diff is a regression — stop and investigate.
- No error markers: `docker exec mathnotes-static-builder sh -c "grep -c 'math-block-error\|block-reference-error' /tmp/pilot-after/mathnotes/topology/compact-sets/index.html"` → `0`.

- [ ] **Step 4: Verify in the dev server and crawl**

```bash
docker restart mathnotes-static-builder && sleep 20 && docker logs --tail 5 mathnotes-static-builder
docker compose -f docker-compose.dev.yml run --rm crawler sh -c 'npx playwright install chromium-headless-shell && npx tsx crawler.ts "http://web-dev:5000/mathnotes/topology/compact-sets" --single-page true'
```

Expected: builder logs show a completed rebuild; crawler prints `✅ Crawl complete – no errors found` (catches JS console errors and CSP violations; MathJax rendering of the transpiled math included).

- [ ] **Step 5: Full test suite one last time**

Run all three test files via docker exec stdin.
Expected: `34/34`, `2/2`, and `test_cache_invalidation.py` all pass.

- [ ] **Step 6: Report**

Summarize for the user: conversion done, parity verified (ids identical, refs identical modulo the one repaired reference), page crawls clean. Remind them: nothing committed; `compact-sets.md` deleted in working tree; the repaired `compact-sets.md:186` reference is the one intentional change and should be eyeballed on the rendered page.
