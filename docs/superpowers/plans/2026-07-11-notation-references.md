# Notation References Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `\notation{\integers}{\mathbb{Z}}` declared inside a block makes `$x \in \integers$` render as ℤ everywhere on the site while acting as a cross-reference (subtle underline, tooltip, click-through, reverse-index entry) to the declaring block.

**Architecture:** A pre-scan builds a global `name → expansion` registry before any parse. `render_math()` wraps registered macro occurrences in MathJax `\class{...}` so the emitted MathML carries identifiable classes; `RefResolver` stamps those elements with `data-ref-label`/`data-ref-url` against the block index; external JS makes them hoverable/clickable. A generated `latex/mathnotes-notation.sty` keeps standalone pdflatex compiles working.

**Tech Stack:** Python 3.11 (pylatexenc, no pytest — standalone assert scripts), Node MathJax worker (`scripts/tex2mml-worker.mjs`), TypeScript (esbuild), PostCSS.

Spec: `docs/superpowers/specs/2026-07-11-notation-references-design.md`

## Global Constraints

- All Python tests run inside the dev builder container: `docker exec -i mathnotes-static-builder python3 - < test/<file>.py` (add `-w /app` only for `test_cache_invalidation.py`). The dev compose stack must be up (`docker-compose -f docker-compose.dev.yml up -d`).
- Do NOT restart/rebuild docker after Python/TS/CSS changes — autorebuild handles it. The watcher re-execs itself on `.py` changes.
- No inline JavaScript, no inline event handlers, no nonces (CSP policy). No styles in TypeScript.
- Unsupported LaTeX constructs are loud build errors with `file:line` — never silent.
- Git commits: technical, concise messages; no AI attribution. The user said "send it": commit after each task without asking.
- Zero-argument notation macros only. Expansions may use `.sty` MATH MACROS and MathJax builtins but NOT other notation macros (enforced at scan time).

---

### Task 1: Notation registry module (`mathnotes/notation.py`)

**Files:**
- Create: `mathnotes/notation.py`
- Create: `test/test_notation.py`

**Interfaces:**
- Produces: `scan_content(content_dir="content") -> Dict[str, str]` (name → expansion; raises `NotationError` with file:line on problems); `get_registry() -> Dict[str, str]` (lazy: scans `"content"` under CWD if it exists, else `{}`); `refresh_registry() -> bool` (rescan; returns True if the registry changed); `reset_registry()` (test helper: forget state so the next `get_registry()` rescans); `set_registry(d: Dict[str,str])` (test helper); `NotationError(ValueError)`.

- [ ] **Step 1: Write the failing test**

Create `test/test_notation.py`:

```python
"""Tests for mathnotes/notation.py (notation macro registry pre-scan).

Standalone assert script (repo convention; pytest is not installed in the
builder container). Run:

    docker exec -i mathnotes-static-builder python3 - < test/test_notation.py
"""

import os
import sys
import tempfile

try:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
except NameError:
    sys.path.insert(0, "/app")

from mathnotes.notation import (  # noqa: E402
    NotationError,
    get_registry,
    refresh_registry,
    reset_registry,
    scan_content,
    set_registry,
)


def write(tmp, relpath, text):
    path = os.path.join(tmp, relpath)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(text)


def test_scan_finds_declarations():
    with tempfile.TemporaryDirectory() as tmp:
        write(tmp, "a/ints.tex",
              "\\begin{definition}[Integers]\\label{integers}\n"
              "\\notation{\\integers}{\\mathbb{Z}}\n"
              "Body.\n\\end{definition}\n")
        write(tmp, "b/rats.tex",
              "\\begin{definition}[Rationals]\n"
              "\\notation{\\rationals}{\\mathbb{Q}}\n"
              "Body.\n\\end{definition}\n")
        reg = scan_content(tmp)
        assert reg == {"integers": "\\mathbb{Z}", "rationals": "\\mathbb{Q}"}, reg


def test_scan_handles_nested_braces_in_expansion():
    with tempfile.TemporaryDirectory() as tmp:
        write(tmp, "a.tex", "\\notation{\\pow}{\\mathcal{P}\\{x\\}}")
        reg = scan_content(tmp)
        assert reg == {"pow": "\\mathcal{P}\\{x\\}"}, reg


def test_scan_ignores_comments():
    with tempfile.TemporaryDirectory() as tmp:
        write(tmp, "a.tex",
              "% \\notation{\\dead}{X}\n"
              "text 100\\% pure % \\notation{\\alsodead}{Y}\n"
              "\\notation{\\live}{\\mathbb{L}}\n")
        reg = scan_content(tmp)
        assert reg == {"live": "\\mathbb{L}"}, reg


def test_scan_duplicate_is_error_with_both_locations():
    with tempfile.TemporaryDirectory() as tmp:
        write(tmp, "a.tex", "\\notation{\\integers}{\\mathbb{Z}}")
        write(tmp, "b.tex", "\\notation{\\integers}{\\mathbf{Z}}")
        try:
            scan_content(tmp)
            assert False, "expected NotationError for duplicate"
        except NotationError as e:
            assert "integers" in str(e)
            assert "a.tex" in str(e) and "b.tex" in str(e), str(e)


def test_scan_sty_collision_is_error():
    # \grad lives in latex/mathnotes.sty MATH MACROS
    with tempfile.TemporaryDirectory() as tmp:
        write(tmp, "a.tex", "\\notation{\\grad}{\\nabla}")
        try:
            scan_content(tmp)
            assert False, "expected NotationError for .sty collision"
        except NotationError as e:
            assert "grad" in str(e) and "mathnotes.sty" in str(e), str(e)


def test_scan_rejects_notation_macro_inside_expansion():
    with tempfile.TemporaryDirectory() as tmp:
        write(tmp, "a.tex", "\\notation{\\integers}{\\mathbb{Z}}")
        write(tmp, "b.tex", "\\notation{\\intsq}{\\integers^2}")
        try:
            scan_content(tmp)
            assert False, "expected NotationError for nested notation macro"
        except NotationError as e:
            assert "intsq" in str(e) and "integers" in str(e), str(e)


def test_scan_malformed_is_error():
    with tempfile.TemporaryDirectory() as tmp:
        write(tmp, "a.tex", "\\notation{integers}{\\mathbb{Z}}")  # missing backslash
        try:
            scan_content(tmp)
            assert False, "expected NotationError for malformed declaration"
        except NotationError as e:
            assert "a.tex" in str(e), str(e)


def test_registry_lifecycle():
    old_cwd = os.getcwd()
    with tempfile.TemporaryDirectory() as tmp:
        os.chdir(tmp)
        try:
            write(tmp, "content/a.tex", "\\notation{\\integers}{\\mathbb{Z}}")
            reset_registry()
            assert get_registry() == {"integers": "\\mathbb{Z}"}
            assert refresh_registry() is False  # unchanged
            write(tmp, "content/a.tex", "\\notation{\\integers}{\\mathbf{Z}}")
            assert refresh_registry() is True
            assert get_registry() == {"integers": "\\mathbf{Z}"}
        finally:
            os.chdir(old_cwd)
            reset_registry()


def test_registry_empty_without_content_dir():
    old_cwd = os.getcwd()
    with tempfile.TemporaryDirectory() as tmp:
        os.chdir(tmp)
        try:
            reset_registry()
            assert get_registry() == {}
        finally:
            os.chdir(old_cwd)
            reset_registry()


def test_set_registry_for_tests():
    set_registry({"foo": "\\mathbb{F}"})
    assert get_registry() == {"foo": "\\mathbb{F}"}
    reset_registry()


if __name__ == "__main__":
    test_scan_finds_declarations()
    print("PASS: scan finds declarations")
    test_scan_handles_nested_braces_in_expansion()
    print("PASS: nested braces in expansion")
    test_scan_ignores_comments()
    print("PASS: comments ignored")
    test_scan_duplicate_is_error_with_both_locations()
    print("PASS: duplicate is loud error")
    test_scan_sty_collision_is_error()
    print("PASS: .sty collision is loud error")
    test_scan_rejects_notation_macro_inside_expansion()
    print("PASS: notation macro inside expansion rejected")
    test_scan_malformed_is_error()
    print("PASS: malformed declaration is loud error")
    test_registry_lifecycle()
    print("PASS: registry lifecycle")
    test_registry_empty_without_content_dir()
    print("PASS: registry empty without content dir")
    test_set_registry_for_tests()
    print("PASS: set_registry test helper")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_notation.py`
Expected: FAIL with `ModuleNotFoundError: No module named 'mathnotes.notation'`

- [ ] **Step 3: Write the implementation**

Create `mathnotes/notation.py`:

```python
"""Global notation-macro registry.

\\notation{\\integers}{\\mathbb{Z}} inside a content block declares a
zero-argument math macro whose occurrences in math render as the expansion
AND cross-reference the declaring block. Because any file may use a macro
declared in any other file, the name -> expansion table must exist before
the first file is parsed: scan_content() is a cheap regex pre-scan over
content/**/*.tex (comments stripped), independent of the pylatexenc parse
that later associates each macro with its declaring block.

Expansions may use .sty MATH MACROS and MathJax builtins but not other
notation macros: the Python-side wrapping in render_math() substitutes
expansions textually in a single pass, so a notation macro surviving into
the sent TeX would be undefined in the worker.
"""

import os
import re
from typing import Dict, Optional, Tuple

_STY_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "latex", "mathnotes.sty")

_NAME_RE = re.compile(r"\\notation\s*\{")
_COMMENT_RE = re.compile(r"(?<!\\)%.*")
_STY_MACRO_RE = re.compile(r"\\(?:re)?newcommand\{\\([A-Za-z]+)\}")


class NotationError(ValueError):
    """Invalid notation declaration. Message includes file:line."""


def _sty_macro_names() -> set:
    with open(_STY_PATH, "r", encoding="utf-8") as f:
        sty = f.read()
    begin = sty.index("% BEGIN MATH MACROS")
    end = sty.index("% END MATH MACROS")
    return set(_STY_MACRO_RE.findall(sty[begin:end]))


def _read_group(text: str, pos: int, filepath: str, line: int) -> Tuple[str, int]:
    """Return (contents, position after closing brace) of the {...} group
    starting at text[pos] == '{'. Brace-counted, backslash-escape aware."""
    if pos >= len(text) or text[pos] != "{":
        raise NotationError(f"{filepath}:{line}: \\notation argument must be a {{...}} group")
    depth, i = 1, pos + 1
    while i < len(text) and depth > 0:
        if text[i] == "\\":
            i += 1
        elif text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
        i += 1
    if depth != 0:
        raise NotationError(f"{filepath}:{line}: unbalanced braces in \\notation")
    return text[pos + 1:i - 1], i


def scan_file(filepath: str, source: str) -> Dict[str, Tuple[str, int]]:
    """name -> (expansion, line) for one file's \\notation declarations."""
    found: Dict[str, Tuple[str, int]] = {}
    stripped = "\n".join(_COMMENT_RE.sub("", ln) for ln in source.split("\n"))
    for m in _NAME_RE.finditer(stripped):
        line = stripped[: m.start()].count("\n") + 1
        name_group, after = _read_group(stripped, m.end() - 1, filepath, line)
        name_match = re.fullmatch(r"\s*\\([A-Za-z]+)\s*", name_group)
        if not name_match:
            raise NotationError(
                f"{filepath}:{line}: \\notation's first argument must be a "
                f"single zero-argument macro like {{\\integers}}, got '{name_group}'")
        while after < len(stripped) and stripped[after].isspace():
            after += 1
        expansion, _ = _read_group(stripped, after, filepath, line)
        expansion = expansion.strip()
        if not expansion:
            raise NotationError(f"{filepath}:{line}: \\notation expansion is empty")
        name = name_match.group(1)
        if name in found:
            raise NotationError(
                f"{filepath}:{line}: \\{name} declared more than once in this file")
        found[name] = (expansion, line)
    return found


def scan_content(content_dir: str = "content") -> Dict[str, str]:
    """Pre-scan all .tex files for \\notation declarations.

    Raises NotationError (with every relevant file:line) on duplicate
    names, collisions with .sty MATH MACROS names, and expansions that
    reference other notation macros.
    """
    declared: Dict[str, Tuple[str, str, int]] = {}  # name -> (expansion, file, line)
    sty_names = _sty_macro_names()
    for root, dirs, files in os.walk(content_dir):
        dirs[:] = sorted(d for d in dirs if not d.startswith("."))
        for fname in sorted(files):
            if not fname.endswith(".tex"):
                continue
            filepath = os.path.join(root, fname)
            with open(filepath, "r", encoding="utf-8") as f:
                source = f.read()
            for name, (expansion, line) in scan_file(filepath, source).items():
                if name in declared:
                    prev = declared[name]
                    raise NotationError(
                        f"{filepath}:{line}: \\{name} already declared at "
                        f"{prev[1]}:{prev[2]}")
                if name in sty_names:
                    raise NotationError(
                        f"{filepath}:{line}: \\{name} collides with a macro in "
                        f"latex/mathnotes.sty MATH MACROS")
                declared[name] = (expansion, filepath, line)
    names = set(declared)
    for name, (expansion, filepath, line) in declared.items():
        used = set(re.findall(r"\\([A-Za-z]+)", expansion)) & names
        if used:
            used_list = ", ".join("\\" + u for u in sorted(used))
            raise NotationError(
                f"{filepath}:{line}: \\{name}'s expansion uses other notation "
                f"macro(s) {used_list} — expansions may only use .sty macros "
                f"and MathJax builtins")
    return {name: exp for name, (exp, _, _) in declared.items()}


# --- module-level registry (lazy; explicit refresh from the build) ---

_registry: Optional[Dict[str, str]] = None


def get_registry() -> Dict[str, str]:
    global _registry
    if _registry is None:
        _registry = scan_content("content") if os.path.isdir("content") else {}
    return _registry


def refresh_registry() -> bool:
    """Rescan; True if the registry changed (callers must then invalidate
    every content/page cache — the registry is input to all math)."""
    global _registry
    old = get_registry()
    _registry = scan_content("content") if os.path.isdir("content") else {}
    return _registry != old


def reset_registry() -> None:
    global _registry
    _registry = None


def set_registry(registry: Dict[str, str]) -> None:
    global _registry
    _registry = dict(registry)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_notation.py`
Expected: 10 PASS lines.

- [ ] **Step 5: Commit**

```bash
git add mathnotes/notation.py test/test_notation.py
git commit -m "Add notation-macro registry with content pre-scan"
```

---

### Task 2: `render_math` wrapping + worker `html` package + clean alttext

**Files:**
- Modify: `mathnotes/latex_processor.py:38-46` (render_math)
- Modify: `mathnotes/mathml.py:58-76` (convert signature)
- Modify: `scripts/tex2mml-worker.mjs:49-61,108-118` (html package, alttext override)
- Test: `test/test_mathml.py`, `test/test_latex_processor.py` (append tests)

**Interfaces:**
- Consumes: `notation.get_registry()` from Task 1.
- Produces: `render_math(latex, display)` unchanged signature, but occurrences of registered names are sent as `\class{notation-ref notation-ref--<name>}{<expansion>}` and the emitted `<math>` keeps the ORIGINAL TeX in `alttext` (snippets/heading-ids derive from alttext and must not see the wrapper). `MathConverter.convert(latex, display, alttext=None)` — worker request gains optional `"alttext"` field.

- [ ] **Step 1: Write the failing tests**

Append to `test/test_mathml.py` (before the `if __name__ == "__main__":` block; also add the calls + PASS prints inside it, matching the file's existing pattern):

```python
def test_worker_class_macro_and_alttext_override():
    r1, = worker_roundtrip([{
        "id": 1,
        "latex": "x \\in \\class{notation-ref notation-ref--integers}{\\mathbb{Z}}",
        "alttext": "x \\in \\integers",
        "display": False,
    }])
    assert "notation-ref--integers" in r1["mathml"], r1
    assert 'alttext="x \\in \\integers"' in r1["mathml"], r1
    assert "\\class" not in r1["mathml"].replace('alttext="', "")
```

Append to `test/test_latex_processor.py` (same placement convention):

```python
def test_render_math_wraps_registered_notation():
    from mathnotes import notation
    notation.set_registry({"integers": "\\mathbb{Z}"})
    try:
        mml = render_math("x \\in \\integers", display=False)
        assert "notation-ref--integers" in mml, mml
        assert 'alttext="x \\in \\integers"' in mml, mml
        # word boundary: \integersquared must NOT match (and errors as undefined)
        try:
            render_math("\\integersquared", display=False)
            assert False, "expected MathConversionError for \\integersquared"
        except Exception:
            pass
    finally:
        notation.reset_registry()


def test_render_math_without_registry_unchanged():
    from mathnotes import notation
    notation.set_registry({})
    try:
        mml = render_math("x^2", display=False)
        assert "notation-ref" not in mml
    finally:
        notation.reset_registry()
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
docker exec -i mathnotes-static-builder python3 - < test/test_mathml.py
docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py
```
Expected: the new tests FAIL (worker: `\class` is an undefined control sequence / alttext contains the wrapper; processor: no `notation-ref--integers` in output).

- [ ] **Step 3: Implement**

`scripts/tex2mml-worker.mjs` — load the html extension eagerly (provides `\class`; the synchronous tex2mml API cannot service autoload, same as cancel):

```js
const MathJax = await mathjax.init({
  loader: { load: ['input/tex', '[tex]/cancel', '[tex]/html'] },
  tex: {
    packages: { '[-]': ['noundefined'], '[+]': ['cancel', 'html'] },
    macros: parseStyMacros(readFileSync(styPath, 'utf8')),
    formatError: (_jax, err) => { throw err; },
  },
});
```

and use the request's `alttext` (fall back to `latex`) when stamping the attribute:

```js
    mml = mml.replace('<math', `<math alttext="${escapeAttr(req.alttext ?? req.latex)}"`);
```

`mathnotes/mathml.py` — thread alttext through:

```python
    def convert(self, latex: str, display: bool, alttext: Optional[str] = None) -> str:
        self._next_id += 1
        payload = {"id": self._next_id, "latex": latex, "display": display}
        if alttext is not None and alttext != latex:
            payload["alttext"] = alttext
```

(rest of the method unchanged).

`mathnotes/latex_processor.py` — wrap in the seam. Add `from . import notation` to the imports, then:

```python
def _wrap_notation_macros(latex: str) -> str:
    """Rewrite registered notation macros (\\integers) as
    \\class{notation-ref notation-ref--integers}{<expansion>} so the emitted
    MathML carries an identifiable class for the resolver to stamp. The
    worker never sees notation names — expansions substitute here."""
    registry = notation.get_registry()
    if not registry:
        return latex
    names = "|".join(sorted(registry, key=len, reverse=True))
    pattern = re.compile(r"\\(" + names + r")(?![A-Za-z])")
    return pattern.sub(
        lambda m: "\\class{notation-ref notation-ref--%s}{%s}"
        % (m.group(1), registry[m.group(1)]),
        latex,
    )


def render_math(latex: str, display: bool) -> str:
    """THE math seam: every math node renders through this one function.

    Build-time MathML: delegate to the persistent MathJax node worker. The
    return value is serializer output — well-formed markup, inserted raw.
    Raises MathConversionError on unconvertible TeX; the emitter turns that
    into a LatexDialectError with file:line.
    """
    stripped = latex.strip()
    return get_converter().convert(
        _wrap_notation_macros(stripped), display, alttext=stripped)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
docker exec -i mathnotes-static-builder python3 - < test/test_mathml.py
docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py
```
Expected: all PASS (existing + new).

- [ ] **Step 5: Commit**

```bash
git add scripts/tex2mml-worker.mjs mathnotes/mathml.py mathnotes/latex_processor.py test/test_mathml.py test/test_latex_processor.py
git commit -m "render_math wraps notation macros in \\class; worker loads html package, alttext override"
```

---

### Task 3: Parse `\notation` in blocks + visible header annotation

**Files:**
- Modify: `mathnotes/latex_processor.py` (`_latex_context` ~line 140, `_parse_block_env` ~line 380, `_macro` error fallbacks ~line 549)
- Modify: `mathnotes/structured_math.py` (MathBlock field ~line 119, `render_block_html` ~line 353)
- Test: `test/test_latex_processor.py`, `test/test_structured_math.py` (append)

**Interfaces:**
- Consumes: `notation.get_registry()`.
- Produces: `MathBlock.notations: List[Tuple[str, str]]` — `(name, expansion)` pairs, e.g. `[("integers", "\\mathbb{Z}")]`; header HTML gains `<span class="block-notation">Notation: <math…></span>` when non-empty.

- [ ] **Step 1: Write the failing tests**

Append to `test/test_latex_processor.py`:

```python
def test_notation_declaration_parsed():
    from mathnotes import notation
    notation.set_registry({"integers": "\\mathbb{Z}"})
    try:
        doc = page(
            "\\begin{definition}[Integers]\\label{integers}\n"
            "\\notation{\\integers}{\\mathbb{Z}}\n"
            "Body text.\n\\end{definition}"
        )
        blk = doc.top_blocks()[0]
        assert blk.notations == [("integers", "\\mathbb{Z}")], blk.notations
        assert "\\notation" not in blk.body_html
        # declaration must not leave an empty paragraph behind
        assert "<p></p>" not in blk.body_html
    finally:
        notation.reset_registry()


def test_notation_outside_block_is_error():
    from mathnotes import notation
    notation.set_registry({"integers": "\\mathbb{Z}"})
    try:
        expect_error("\\notation{\\integers}{\\mathbb{Z}}", "\\notation")
    finally:
        notation.reset_registry()


def test_notation_mismatch_with_registry_is_error():
    from mathnotes import notation
    notation.set_registry({})  # pre-scan saw nothing: parse/scan drift
    try:
        expect_error(
            "\\begin{definition}[Integers]\n"
            "\\notation{\\integers}{\\mathbb{Z}}\nBody.\n\\end{definition}",
            "pre-scan",
        )
    finally:
        notation.reset_registry()


def test_duplicate_notation_name_in_block_is_error():
    from mathnotes import notation
    notation.set_registry({"integers": "\\mathbb{Z}"})
    try:
        expect_error(
            "\\begin{definition}[Integers]\n"
            "\\notation{\\integers}{\\mathbb{Z}}\n"
            "\\notation{\\integers}{\\mathbb{Z}}\nBody.\n\\end{definition}",
            "more than once",
        )
    finally:
        notation.reset_registry()
```

Append to `test/test_structured_math.py` (match its existing import/harness style; it already imports `MathBlock`, `MathBlockType`, `render_block_html` or equivalent — follow the file's conventions):

```python
def test_render_block_html_shows_notation():
    from mathnotes import notation
    notation.set_registry({"integers": "\\mathbb{Z}"})
    try:
        blk = MathBlock(
            block_type=MathBlockType.DEFINITION,
            content="Body.",
            title="Integers",
            label="integers",
        )
        blk.notations = [("integers", "\\mathbb{Z}")]
        html_out = render_block_html(blk, "<p>Body.</p>", "#integers")
        assert 'class="block-notation"' in html_out, html_out
        assert "Notation:" in html_out
        # the annotation renders the raw expansion (never a self-link)
        i = html_out.index('class="block-notation"')
        assert "notation-ref--integers" not in html_out[i:i + 400], html_out[i:i + 400]
    finally:
        notation.reset_registry()
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py
docker exec -i mathnotes-static-builder python3 - < test/test_structured_math.py
```
Expected: new tests FAIL (`unsupported command \notation`, no `notations` attribute, no block-notation span).

- [ ] **Step 3: Implement**

`mathnotes/latex_processor.py`:

1. In `_latex_context()` macros list add:
```python
            macrospec.MacroSpec("notation", "{{"),
```

2. In `_parse_block_env`, the extraction loop currently handles `("label", "synonyms", "tags")`. Extend it to also pull `\notation` nodes (multiple allowed). Replace the loop body with:

```python
        body = list(n.nodelist)
        extracted: Dict[str, str] = {}
        notations: List[Tuple[str, str]] = []
        i = 0
        while i < len(body):
            child = body[i]
            if isinstance(child, LatexMacroNode) and child.macroname == "notation":
                notations.append(self._parse_notation(child))
                del body[i]
                continue
            if isinstance(child, LatexMacroNode) and child.macroname in ("label", "synonyms", "tags"):
                name = child.macroname
                if name in extracted:
                    self._err(child, f"multiple \\{name} commands in one environment")
                if name == "synonyms" and n.environmentname != "definition":
                    self._err(child, "\\synonyms is only supported on definition environments")
                value = self._chars_arg(child)
                if name == "label" and not _LABEL_RE.match(value):
                    self._err(child, f"invalid block label '{value}'")
                extracted[name] = value
                del body[i]
                continue
            i += 1
        seen = set()
        for name, _ in notations:
            if name in seen:
                self._err(n, f"\\{name} declared more than once in this block")
            seen.add(name)
```

and after `blk.children = children` set:

```python
        blk.notations = notations
```

(`Tuple` is already imported in the file's typing imports; verify, add if missing.)

3. Add the parser method to `_Parser`:

```python
    def _parse_notation(self, n) -> Tuple[str, str]:
        """\\notation{\\name}{expansion}: name from a single macro node,
        expansion verbatim. Must agree with the notation pre-scan — a
        mismatch means scan_file's regex and this parse have drifted."""
        from . import notation as notation_mod

        name_group, exp_group = n.nodeargd.argnlist
        inner = [c for c in name_group.nodelist
                 if not (isinstance(c, LatexCharsNode) and not c.chars.strip())]
        if len(inner) != 1 or not isinstance(inner[0], LatexMacroNode):
            self._err(n, "\\notation's first argument must be a single macro like {\\integers}")
        name = inner[0].macroname
        expansion = exp_group.latex_verbatim().strip()
        if expansion.startswith("{") and expansion.endswith("}"):
            expansion = expansion[1:-1].strip()
        registry = notation_mod.get_registry()
        if registry.get(name) != expansion:
            self._err(
                n,
                f"\\notation{{\\{name}}} disagrees with the pre-scan registry "
                f"(scan saw {registry.get(name)!r}) — notation.scan_file and the "
                f"parser have drifted",
            )
        return name, expansion
```

4. In `_macro`, next to the synonyms/tags fallback error (line ~549), add:

```python
        if name == "notation":
            self._err(n, "\\notation is only supported at the top of a block environment")
```

`mathnotes/structured_math.py`:

1. Add the field to `MathBlock` (after `tags`):
```python
    notations: List[Tuple[str, str]] = field(default_factory=list)  # (macro name, TeX expansion)
```

2. In `render_block_html`, after the `block.synonyms` span block, add:

```python
    if block.notations:
        from .latex_processor import render_math  # local: latex_processor imports this module

        rendered = ", ".join(
            render_math(expansion, display=False) for _, expansion in block.notations
        )
        parts.append(f'<span class="block-notation">Notation: {rendered}</span>')
```

(The expansion is rendered raw — never wrapped — so the annotation is not a self-link.)

- [ ] **Step 4: Run tests to verify they pass**

```bash
docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py
docker exec -i mathnotes-static-builder python3 - < test/test_structured_math.py
```
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add mathnotes/latex_processor.py mathnotes/structured_math.py test/test_latex_processor.py test/test_structured_math.py
git commit -m "Parse \\notation declarations; render Notation annotation in block headers"
```

---

### Task 4: Resolution — stamp refs, self-suppression, tooltips, reverse index

**Files:**
- Modify: `mathnotes/ref_resolver.py` (new regex + `_resolve_notation`, `collect`, `labels_from_rendered_html`, `RefResolver.__init__`)
- Modify: `mathnotes/block_index.py` (`notation_map` in `build_index`/`_index_file`; pass `current_block_label` in `_collect_all_references` ~line 291 and `_process_block_content` ~line 326)
- Test: `test/test_ref_resolver.py` (append)

**Interfaces:**
- Consumes: MathML containing `class="notation-ref notation-ref--<name>"` (Task 2), `MathBlock.notations` (Task 3).
- Produces: `BlockIndex.notation_map: Dict[str, BlockReference]` (name → declaring block); `RefResolver(block_index, url_mapper, current_file=None, current_block_label=None)`; stamped elements `<mi class="… notation-ref--integers" data-ref-label="integers" data-ref-url="/mathnotes/...#integers">`; stamped labels appear in `resolver.referenced_labels` (feeds tooltips + reverse index).

- [ ] **Step 1: Write the failing tests**

Append to `test/test_ref_resolver.py` (match its existing fake/stub conventions — it already builds RefResolvers against stub indexes; reuse its helpers where they exist):

```python
def test_notation_ref_stamped():
    from mathnotes.structured_math import MathBlock, MathBlockType
    from mathnotes.block_index import BlockReference
    from mathnotes.ref_resolver import RefResolver

    blk = MathBlock(block_type=MathBlockType.DEFINITION, content="c",
                    title="Integers", label="integers")

    class FakeIndex:
        notation_map = {
            "integers": BlockReference(
                block=blk, file_path="content/a.tex",
                canonical_url="/mathnotes/algebra/numbers")
        }
        def get_reference(self, label):
            return None

    r = RefResolver(FakeIndex(), None, current_file="content/b.tex")
    mml = ('<math alttext="x \\in \\integers"><mi>x</mi><mo>&#x2208;</mo>'
           '<mi mathvariant="double-struck" class="notation-ref notation-ref--integers">Z</mi></math>')
    out = r.resolve(mml)
    assert 'data-ref-label="integers"' in out, out
    assert 'data-ref-url="/mathnotes/algebra/numbers#integers"' in out, out
    assert "integers" in r.referenced_labels


def test_notation_self_reference_not_stamped():
    from mathnotes.structured_math import MathBlock, MathBlockType
    from mathnotes.block_index import BlockReference
    from mathnotes.ref_resolver import RefResolver

    blk = MathBlock(block_type=MathBlockType.DEFINITION, content="c",
                    title="Integers", label="integers")

    class FakeIndex:
        notation_map = {
            "integers": BlockReference(
                block=blk, file_path="content/a.tex",
                canonical_url="/mathnotes/algebra/numbers")
        }
        def get_reference(self, label):
            return None

    r = RefResolver(FakeIndex(), None, current_file="content/a.tex",
                    current_block_label="integers")
    mml = '<mi class="notation-ref notation-ref--integers">Z</mi>'
    out = r.resolve(mml)
    assert "data-ref-label" not in out, out
    assert "integers" not in r.referenced_labels


def test_notation_collect_and_rendered_html_labels():
    from mathnotes.structured_math import MathBlock, MathBlockType
    from mathnotes.block_index import BlockReference
    from mathnotes.ref_resolver import RefResolver, labels_from_rendered_html

    blk = MathBlock(block_type=MathBlockType.DEFINITION, content="c",
                    title="Integers", label="integers")

    class FakeIndex:
        notation_map = {
            "integers": BlockReference(
                block=blk, file_path="content/a.tex",
                canonical_url="/mathnotes/algebra/numbers")
        }
        def get_reference(self, label):
            return None

    r = RefResolver(FakeIndex(), None)
    r.collect('<mi class="notation-ref notation-ref--integers">Z</mi>')
    assert "integers" in r.referenced_labels

    stamped = ('<mi class="notation-ref notation-ref--integers" '
               'data-ref-label="integers" data-ref-url="/x#integers">Z</mi>')
    assert labels_from_rendered_html(stamped, {}) == {"integers"}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_ref_resolver.py`
Expected: new tests FAIL (`TypeError: __init__() got an unexpected keyword argument 'current_block_label'` / no stamping).

- [ ] **Step 3: Implement**

`mathnotes/ref_resolver.py`:

1. Module-level regexes (next to the existing ones):
```python
_NOTATION_RE = re.compile(r'<m[a-z]+\b[^>]*\bnotation-ref--([A-Za-z]+)\b[^>]*>')
_MML_REF_LABEL_RE = re.compile(
    r'<m[a-z]+\b[^>]*\bnotation-ref--[A-Za-z]+\b[^>]*\bdata-ref-label="([^"]+)"')
```

2. Constructor gains the block context:
```python
    def __init__(self, block_index, url_mapper, current_file: str = None,
                 current_block_label: str = None):
        self.block_index = block_index
        self.url_mapper = url_mapper
        self.current_file = current_file
        self.current_block_label = current_block_label
        self.referenced_labels: Set[str] = set()
        self.embedded_labels: Set[str] = set()
```

3. `resolve()` gains a notation pass (first, before the anchor passes — the patterns are disjoint, order is just for clarity):
```python
    def resolve(self, html: str) -> str:
        html = _NOTATION_RE.sub(self._resolve_notation, html)
        html = _DEMBED_RE.sub(self._resolve_dembed, html)
        html = _DREF_RE.sub(self._resolve_dref, html)
        html = _PAGELINK_RE.sub(self._resolve_pagelink, html)
        return html
```

4. The resolver method and a shared lookup:
```python
    # -- notation refs (MathML elements class-tagged by render_math) --

    def _notation_target(self, name: str):
        """BlockReference for a notation macro name, or None for a
        self-reference (which renders as plain math)."""
        notation_map = getattr(self.block_index, "notation_map", {}) if self.block_index else {}
        bref = notation_map.get(name)
        if bref is None:
            raise ValueError(
                f"notation macro \\{name} rendered into MathML but is missing "
                f"from the block index's notation_map — registry and index "
                f"disagree (file: {self.current_file})")
        if self.current_block_label and bref.block.label == self.current_block_label:
            return None
        return bref

    def _resolve_notation(self, m) -> str:
        name = m.group(1)
        if "data-ref-label=" in m.group(0):
            return m.group(0)  # already stamped (e.g. re-resolved embed content)
        bref = self._notation_target(name)
        if bref is None:
            return m.group(0)
        self.referenced_labels.add(bref.block.label)
        tag = m.group(0)
        return (tag[:-1]
                + f' data-ref-label="{html_lib.escape(bref.block.label, quote=True)}"'
                + f' data-ref-url="{bref.full_url}">')
```

5. `collect()` gains the same awareness:
```python
        for m in _NOTATION_RE.finditer(html):
            bref = self._notation_target(m.group(1))
            if bref is not None:
                self.referenced_labels.add(bref.block.label)
```

6. `labels_from_rendered_html` also harvests stamped MathML refs:
```python
def labels_from_rendered_html(html_content: str, exclude: Dict) -> Set[str]:
    """Labels referenced inside already-rendered block HTML that still need tooltip data."""
    labels = {m.group(1) for m in _REF_LABEL_RE.finditer(html_content)}
    labels |= {m.group(1) for m in _MML_REF_LABEL_RE.finditer(html_content)}
    return {label for label in labels if label not in exclude}
```

`mathnotes/block_index.py`:

1. In `__init__` and at the top of `build_index()` (next to `self.index.clear()`):
```python
        self.notation_map: Dict[str, BlockReference] = {}
```
(init) and
```python
        self.notation_map.clear()
```
(build_index).

2. In `_index_file`, inside the `for block in all_blocks:` loop after `ref = BlockReference(...)` is created:
```python
            for notation_name, _ in block.notations:
                if notation_name in self.notation_map:
                    existing = self.notation_map[notation_name]
                    print(
                        f"Warning: Duplicate notation '\\{notation_name}' in "
                        f"{file_path} (previously in {existing.file_path})"
                    )
                self.notation_map[notation_name] = ref
```

3. In `_collect_all_references`, the per-block resolver (line ~291) becomes:
```python
                    r = RefResolver(self, self.url_mapper, current_file=file_path,
                                    current_block_label=block.label)
```

4. In `_process_block_content` (line ~326):
```python
        resolver = RefResolver(self, self.url_mapper, current_file=file_path,
                               current_block_label=block.label)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
docker exec -i mathnotes-static-builder python3 - < test/test_ref_resolver.py
docker exec -i mathnotes-static-builder python3 - < test/test_latex_integration.py
docker exec -i mathnotes-static-builder python3 - < test/test_reference_snippets.py
```
Expected: all PASS (integration/snippets guard against regressions).

- [ ] **Step 5: Commit**

```bash
git add mathnotes/ref_resolver.py mathnotes/block_index.py test/test_ref_resolver.py
git commit -m "Resolve notation refs: stamp label/url, self-suppression, tooltips, reverse index"
```

---

### Task 5: Cache invalidation on registry change

**Files:**
- Modify: `mathnotes/block_index.py` (`build_index` start)
- Test: `test/test_cache_invalidation.py` (append)

**Interfaces:**
- Consumes: `notation.refresh_registry()` (Task 1), `clear_content_cache()` (`content_loader.py`), `clear_page_cache()` (`page_renderer.py`).
- Produces: any notation add/remove/expansion-change invalidates ALL cached PageDocs and page renders on the next `build_index()`.

- [ ] **Step 1: Write the failing test**

Append to `test/test_cache_invalidation.py` (uses its existing `incremental_rebuild` helper and harness; add the call + PASS print to `__main__`):

```python
NOTATION_DEFINING = r"""\title{Number Sets}

\begin{definition}[Integers]\label{integers}
\notation{\integers}{%s}
The integers.
\end{definition}
"""

NOTATION_USING = r"""\title{Using Page}

We have $x \in \integers$ here.
"""


def test_notation_change_invalidates_all_pages():
    from mathnotes import notation
    from mathnotes.content_loader import clear_content_cache

    old_cwd = os.getcwd()
    with tempfile.TemporaryDirectory() as tmp:
        os.chdir(tmp)
        try:
            os.makedirs("content/test")
            with open("content/test/using.tex", "w") as f:
                f.write(NOTATION_USING)
            with open("content/test/defining.tex", "w") as f:
                f.write(NOTATION_DEFINING % r"\mathbb{Z}")

            clear_page_cache()
            clear_content_cache()
            notation.reset_registry()
            url_mapper = ContentDiscovery()
            url_mapper.build_url_mappings()
            block_index = BlockIndex(url_mapper)
            block_index.build_index()
            processor = PageRenderer(url_mapper, block_index)

            result = processor.render_page("content/test/using.tex")
            assert 'alttext="x \\in \\integers"' in result["content"], result["content"]
            assert 'data-ref-label="integers"' in result["content"], result["content"]
            # MathJax renders \mathbb{Z} as <mi ...>Z</mi>; ">Z</mi>" is the
            # discriminating fragment ("Z"/"W" alone match prose like "We")
            assert ">Z</mi>" in result["content"], result["content"]

            # Change the expansion; using.tex is untouched, so its
            # mtime-keyed caches would serve stale MathML without global
            # invalidation.
            with open("content/test/defining.tex", "w") as f:
                f.write(NOTATION_DEFINING % r"\mathbb{W}")
            future = time.time() + 1
            os.utime("content/test/defining.tex", (future, future))

            incremental_rebuild(url_mapper, block_index)

            result = processor.render_page("content/test/using.tex")
            assert ">W</mi>" in result["content"], (
                "stale cache: using page still renders the old expansion"
            )
        finally:
            os.chdir(old_cwd)
            clear_page_cache()
            clear_content_cache()
            notation.reset_registry()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -i -w /app mathnotes-static-builder python3 - < test/test_cache_invalidation.py`
Expected: new test FAILS on the final `"W" in result` assert (stale cached render); existing tests still PASS.

- [ ] **Step 3: Implement**

`mathnotes/block_index.py`, at the very top of `build_index()` (before `self._pending_files = []`):

```python
        # The notation registry is input to every page's math (render_math
        # substitutes expansions at parse time), so a registry change makes
        # every cached PageDoc and page render stale regardless of mtimes.
        from . import notation
        from .content_loader import clear_content_cache

        if notation.refresh_registry():
            from .page_renderer import clear_page_cache

            clear_content_cache()
            clear_page_cache()
            print("Notation registry changed: invalidated all content/page caches")
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `docker exec -i -w /app mathnotes-static-builder python3 - < test/test_cache_invalidation.py`
Expected: 4 PASS lines. Also run `docker exec -i mathnotes-static-builder python3 - < test/test_watcher.py` — the watcher path calls `build_index()` on every rebuild, this must stay green.

- [ ] **Step 5: Commit**

```bash
git add mathnotes/block_index.py test/test_cache_invalidation.py
git commit -m "Invalidate all caches when the notation registry changes"
```

---

### Task 6: PDF support — `\notation` in mathnotes.sty + generated notation package

**Files:**
- Modify: `latex/mathnotes.sty` (before the MATH MACROS section)
- Modify: `mathnotes/notation.py` (add `write_notation_sty`)
- Modify: `mathnotes/sitegenerator/builder.py` (`build()` calls it)
- Modify: `latex/README.md` (document the dialect addition)
- Test: `test/test_notation.py` (append)

**Interfaces:**
- Consumes: `get_registry()`.
- Produces: `write_notation_sty(path="latex/mathnotes-notation.sty") -> bool` (True if (re)written; no-op when content is unchanged; OSError is caught and warned, never fatal). Generated file is committed like a lockfile.

- [ ] **Step 1: Write the failing test**

Append to `test/test_notation.py`:

```python
def test_write_notation_sty():
    from mathnotes.notation import write_notation_sty
    with tempfile.TemporaryDirectory() as tmp:
        out = os.path.join(tmp, "mathnotes-notation.sty")
        set_registry({"integers": "\\mathbb{Z}", "rationals": "\\mathbb{Q}"})
        try:
            assert write_notation_sty(out) is True
            text = open(out).read()
            assert "\\ProvidesPackage{mathnotes-notation}" in text
            assert "\\providecommand{\\integers}{\\mathbb{Z}}" in text
            assert "\\providecommand{\\rationals}{\\mathbb{Q}}" in text
            assert text.index("integers") < text.index("rationals")  # sorted
            assert write_notation_sty(out) is False  # unchanged -> no rewrite
        finally:
            reset_registry()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_notation.py`
Expected: FAIL with `ImportError: cannot import name 'write_notation_sty'`.

- [ ] **Step 3: Implement**

`mathnotes/notation.py`, append:

```python
_STY_HEADER = """% mathnotes-notation.sty — GENERATED by the site build from \\notation
% declarations in content/**/*.tex. Do not edit; commit like a lockfile so
% standalone pdflatex compiles resolve cross-file notation macros.
\\NeedsTeXFormat{LaTeX2e}
\\ProvidesPackage{mathnotes-notation}[2026/07/11 Generated notation macros]
"""


def write_notation_sty(path: str = "latex/mathnotes-notation.sty") -> bool:
    """Regenerate the pdflatex notation package. Returns True if written."""
    lines = [_STY_HEADER]
    for name in sorted(get_registry()):
        lines.append(f"\\providecommand{{\\{name}}}{{{get_registry()[name]}}}\n")
    content = "".join(lines)
    try:
        with open(path, "r", encoding="utf-8") as f:
            if f.read() == content:
                return False
    except OSError:
        pass
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return True
```

`mathnotes/sitegenerator/builder.py`, in `build()` after step 1 (`self.clean_output_dir()`):

```python
        # Regenerate the pdflatex notation package (checked in like a
        # lockfile; harmless no-op when nothing changed)
        from mathnotes.notation import write_notation_sty

        try:
            if write_notation_sty():
                logger.info("Regenerated latex/mathnotes-notation.sty")
        except OSError as e:
            logger.warning(f"Could not write latex/mathnotes-notation.sty: {e}")
```

`latex/mathnotes.sty`, after the `\detach` definition and before the `% Definition synonyms` comment, add:

```latex
% Notation declarations: \notation{\integers}{\mathbb{Z}} inside a block
% declares the macro site-wide (the site cross-references every use back to
% the declaring block). For PDF: define the macro if the generated package
% below hasn't already, and typeset the annotation inline.
\IfFileExists{mathnotes-notation.sty}{\RequirePackage{mathnotes-notation}}{}
\NewDocumentCommand{\notation}{m m}{%
  \providecommand{#1}{#2}\emph{(notation: \ensuremath{#1})} %
}
```

`latex/README.md`: add a short subsection documenting `\notation` next to wherever `\synonyms`/`\tags` are documented — one paragraph: declared at the top of a block; declares a zero-argument math macro usable in math on any page; every use links back to the declaring block on the site; expansions may use MATH MACROS/builtins but not other notation macros; `latex/mathnotes-notation.sty` is generated by the build and committed. (Read the file first and match its structure/tone.)

- [ ] **Step 4: Run test to verify it passes; compile check if pdflatex exists**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_notation.py`
Expected: all PASS.

Then on the host: `which pdflatex` — if present, after Task 8's demo content exists, compile that page per `latex/README.md` to confirm the `.sty` changes are valid LaTeX. If absent, note it and move on (the dialect tests + a careful read cover the `.sty`).

- [ ] **Step 5: Commit**

```bash
git add mathnotes/notation.py mathnotes/sitegenerator/builder.py latex/mathnotes.sty latex/README.md test/test_notation.py
git commit -m "PDF support: \\notation in mathnotes.sty, generated mathnotes-notation.sty"
```

---

### Task 7: Client — tooltips, click navigation, CSS

**Files:**
- Modify: `demos-framework/src/tooltip-system.ts`
- Modify: `styles/math.css` (notation ref affordance), `styles/main.css` (`.block-notation` header chip, next to `.block-synonyms` at line ~445)

**Interfaces:**
- Consumes: stamped elements `math .notation-ref[data-ref-label][data-ref-url]` (Task 4), `.block-notation` header span (Task 3), per-page tooltip JSON (already includes notation labels via Task 4).
- Produces: hover/touch tooltip + click navigation on notation refs; dotted-underline affordance.

- [ ] **Step 1: Generalize tooltip targeting in `tooltip-system.ts`**

The file resolves targets via `target.closest('a.block-reference')` in five places and reads `link.dataset.refLabel`. MathML elements are not `HTMLAnchorElement`s (and `dataset` is unreliable on `MathMLElement` in older TS lib targets), so:

1. Add at module scope, above the class:

```typescript
const REF_SELECTOR = 'a.block-reference, .notation-ref[data-ref-label]';
```

and a private helper inside the class:

```typescript
  private findRefTarget(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof Element)) return null;
    return target.closest(REF_SELECTOR) as HTMLElement | null;
  }
```

(MathML elements are typed `Element`; the cast keeps the rest of the class unchanged — positioning uses only `getBoundingClientRect`, present on `Element`.)

2. Replace every `target.closest('a.block-reference') as HTMLAnchorElement` with `this.findRefTarget(e.target)` (lines ~83, ~94, ~104, ~113) and the bare occurrence in the tap-outside handler (line ~130) with `!this.findRefTarget(target)`. Where the code reads `link.dataset.refLabel`, use `link.getAttribute('data-ref-label')` instead (lines ~85, ~106, ~224). Change `handleTouchStart`/`handleMouseEnter`/`showTooltip` parameter types and `currentTarget` field from `HTMLAnchorElement` to `HTMLElement`.

3. In `attachEventListeners()`, add click navigation for notation refs (anchors keep native behavior; MathML elements need JS):

```typescript
    // Notation refs live inside <math> where <a> is invalid; navigate via JS
    document.addEventListener('click', (e) => {
      const target = e.target as Element | null;
      const ref = target?.closest?.('.notation-ref[data-ref-url]');
      if (ref) {
        const url = ref.getAttribute('data-ref-url');
        if (url) window.location.href = url;
      }
    });
```

4. Touch behavior: `handleTouchEnd` currently lets short taps fall through to "default link behavior" — for notation refs there is no default, but the click event fires after touchend and the new click handler navigates, so no extra code is needed. Verify this on the crawl in Task 8.

- [ ] **Step 2: Type-check**

Run: `docker exec mathnotes-static-builder npm run type-check`
Expected: no errors.

- [ ] **Step 3: CSS**

`styles/math.css`, append:

```css
/* Notation references: math symbols that link to their defining block.
   Only stamped refs (data-ref-url present) get the affordance — an
   unstamped ref is a self-reference inside its own definition and renders
   as plain math. text-decoration is unreliable on MathML internals;
   border-bottom is honored (border properties are in MathML Core). Match
   .block-reference's dotted-underline look (styles/main.css). */
math .notation-ref[data-ref-url] {
  cursor: pointer;
  border-bottom: 1px dotted color-mix(in srgb, var(--color-text-secondary) 50%, transparent);
  transition: border-bottom-color 0.2s ease;
}

math .notation-ref[data-ref-url]:hover {
  border-bottom-color: var(--color-text-secondary);
}
```

`styles/main.css`, after the `.block-synonyms` rule (line ~451):

```css
/* Notation display in block headers (\notation declarations) */
.block-notation {
  margin-left: var(--space-sm);
  font-weight: normal;
  font-style: normal;
  color: var(--color-text-muted);
  font-size: 0.95em;
}
```

- [ ] **Step 4: Commit**

```bash
git add demos-framework/src/tooltip-system.ts styles/math.css styles/main.css
git commit -m "Client support for notation refs: tooltip targeting, click nav, styling"
```

---

### Task 8: End-to-end verification and docs

**Files:**
- Create (temporary): `content/test/notation-defining.tex`, `content/test/notation-using.tex` — DELETED before the final commit
- Modify: `CLAUDE.md` (one line in the Cross-Reference System section)

- [ ] **Step 1: Create temporary demo content**

`content/test/notation-defining.tex`:
```latex
\title{Notation Test: Defining}

\begin{definition}[Integers]\label{test-integers}
\notation{\integers}{\mathbb{Z}}
The set of \emph{integers} $\integers$ contains the whole numbers.
\end{definition}
```

`content/test/notation-using.tex`:
```latex
\title{Notation Test: Using}

\begin{theorem}[Closure]\label{test-closure}
For $a, b \in \integers$, we have $a + b \in \integers$.
\end{theorem}

Prose usage: $x \in \integers$ links too. Display math:
\[ \integers \subset \mathbb{Q} \]
```

The dev watcher rebuilds automatically. Watch `docker logs -f mathnotes-static-builder` for a clean rebuild (no LatexDialectError, "Notation registry changed" message appears once).

- [ ] **Step 2: Verify server-side output**

```bash
curl -s http://localhost:5000/mathnotes/test/notation-using/ | grep -o 'notation-ref[^>]*' | head
curl -s http://localhost:5000/mathnotes/test/notation-defining/ | grep -o 'class="block-notation"[^<]*'
```
Expected: using-page elements carry `data-ref-label="test-integers"` and `data-ref-url="/mathnotes/test/notation-defining/#test-integers"`; defining page has the `block-notation` header span, and its own `$\integers$` occurrences have NO `data-ref-label` (self-suppression). Also check the defining page's "Referenced by" panel lists the theorem, and the using page's tooltip JSON (`<script id="tooltip-data">`) contains `test-integers`.

- [ ] **Step 3: Crawl for JS/CSP errors and visually verify**

```bash
./scripts/crawl-dev.sh --single-page "http://web-dev:5000/mathnotes/test/notation-using"
```
Expected: no JavaScript errors, no CSP violations. Then verify interaction per DEBUGGING.md's console-probe technique (hover → tooltip appears; click → navigates; both light and dark modes render the dotted underline). Check `latex/mathnotes-notation.sty` was regenerated and contains `\providecommand{\integers}{\mathbb{Z}}`.

- [ ] **Step 4: Run the full Python test suite**

```bash
docker exec -i mathnotes-static-builder python3 - < test/test_structured_math.py
docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py
docker exec -i mathnotes-static-builder python3 - < test/test_mathml.py
docker exec -i mathnotes-static-builder python3 - < test/test_ref_resolver.py
docker exec -i mathnotes-static-builder python3 - < test/test_latex_integration.py
docker exec -i mathnotes-static-builder python3 - < test/test_reference_snippets.py
docker exec -i -w /app mathnotes-static-builder python3 - < test/test_cache_invalidation.py
docker exec -i mathnotes-static-builder python3 - < test/test_notation.py
docker exec -i mathnotes-static-builder python3 - < test/test_watcher.py
```
Expected: all PASS.

- [ ] **Step 5: Clean up, document, commit**

Delete `content/test/notation-defining.tex` and `content/test/notation-using.tex` (and confirm the watcher rebuild removes them + regenerates `mathnotes-notation.sty` back to empty registry state). Add to `CLAUDE.md`'s Cross-Reference System list:

```markdown
- `\notation{\integers}{\mathbb{Z}}` - Declared in a block: defines a site-wide math macro whose every use links back to the declaring block
```

```bash
git add CLAUDE.md latex/mathnotes-notation.sty
git commit -m "Document \\notation in CLAUDE.md"
```

(Authoring real `\notation` declarations in the content is Jason's — per editing policy, we don't write his math notes.)
