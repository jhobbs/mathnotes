# Remove the Markdown Layer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Parse `.tex` content directly to structured blocks + HTML, deleting the internal markdown dialect, python-markdown, and all placeholder-marker machinery (Part 1 of the markdown-removal/MathML effort; MathJax stays, behind a `render_math` seam).

**Architecture:** `latex_processor.py` keeps its pylatexenc parse and amsthm-attachment logic but emits a typed `PageDoc` (prose HTML segments + `MathBlock` trees) instead of a dialect string. References become machine-generated placeholder elements (`<a data-dref=…>`) resolved against the block index by a new `ref_resolver.py`. `markdown_processor.py` becomes `page_renderer.py`, a thin assembler. Spec: `docs/superpowers/specs/2026-07-09-remove-markdown-layer-design.md`.

**Tech Stack:** Python 3.11, pylatexenc 2.10, existing Jinja2 sitegenerator. python-markdown / python-frontmatter / python-markdown-math are REMOVED.

## Global Constraints

- **Do NOT `git commit` at any point.** Repo rule: commits only when the user explicitly requests. Tasks end at verification, changes stay in the working tree.
- **No host Python deps.** All Python runs inside the `mathnotes-static-builder` container. `test/` is not mounted, so tests run via stdin: `docker exec -i mathnotes-static-builder python3 - < test/<file>.py`. Repo-mounted scripts run via `docker exec -w /app mathnotes-static-builder python3 scripts/<file>.py`.
- Tests are standalone assert scripts (no pytest in the container).
- **Acceptance bar is semantic equivalence, not byte identity** (Task 10 defines it mechanically). Anchor IDs for explicitly-labeled blocks and `proof-of-*`/`<parent>-<type>` auto-labels MUST be preserved exactly; heading IDs and demo element IDs may differ.
- **Do not edit `.tex` content files**, except the three `\dref{embed}\{…\}` → `\dembed{…}` conversions in Task 8. Content must keep compiling standalone with `pdflatex` via `latex/mathnotes.sty`.
- `render_math()` in `latex_processor.py` must remain the ONLY place math becomes output markup (Part 2 swaps its body for MathML).
- Pygments is NOT installed in the builder image and codehilite ran without it; code blocks render as plain `<pre>`/`<code>` (no highlighting). Do not add a Pygments dependency.
- The site is broken between Tasks 2 and 6 (mid-cutover). That is expected; the baseline for comparison is captured in Task 0 before any change.

---

### Task 0: Capture the baseline site and prepare scaffolding

**Files:**
- Modify: `.gitignore`

**Interfaces:**
- Produces: `site-baseline/` (full static build of the current pipeline), used by Task 10's semantic diff. Nothing else may modify it.

- [ ] **Step 1: Verify the builder container is running**

Run: `docker ps --format '{{.Names}}' | grep static-builder`
Expected: `mathnotes-static-builder`. If missing: `docker-compose -f docker-compose.dev.yml up -d` and re-check (wait for the container's initial build to finish: `docker logs -f mathnotes-static-builder` until idle).

- [ ] **Step 2: Confirm current tests pass (pre-change sanity)**

Run:
```bash
docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py
docker exec -i mathnotes-static-builder python3 - < test/test_latex_integration.py
docker exec -i -w /app mathnotes-static-builder python3 - < test/test_cache_invalidation.py
docker exec -i mathnotes-static-builder python3 - < test/test_reference_snippets.py
```
Expected: each ends with its OK/pass summary line. If any fail, STOP and report — the baseline must be green.

- [ ] **Step 3: Build the baseline site**

Run: `docker exec -w /app mathnotes-static-builder python3 scripts/build_static_simple.py --output site-baseline`
Expected: log ends `Build complete! Output in site-baseline` with ~150+ files generated.

- [ ] **Step 4: Ignore the comparison dirs**

Append to `.gitignore`:
```
site-baseline/
site-new/
```

- [ ] **Step 5: Record page count for later comparison**

Run: `find site-baseline -name index.html | wc -l`
Expected: a number ≥ 150 (146 content pages + generated pages). Note it.

---

### Task 1: New document model in `structured_math.py`

Rewrite `structured_math.py`: keep `MathBlockType`, `MathBlock` identity fields, `normalize_label_from_title`, `generate_plural`, `display_name`, `css_class` exactly as they are; delete `StructuredMathParser` and `process_structured_math_content`; add `PageDoc`, plain-text `content` semantics, `body_html` with child markers, `finalize_blocks`, `body_text`, and the rewritten `render_block_html`.

**Files:**
- Modify: `mathnotes/structured_math.py` (full rewrite; ~400 lines)
- Test: `test/test_structured_math.py` (new)

**Interfaces:**
- Consumes: nothing new.
- Produces (used by every later task):
  - `CHILD_MARKER_RE = re.compile("\x02(\\d+)\x02")` — marks inline-child positions in `body_html`, index into `block.children`.
  - `MathBlock` fields: `block_type, content (plain text), title (plain text), label, metadata (dict; may hold raw 'synonyms'/'tags' strings), children, parent, body_html (str, unresolved-placeholder HTML), content_html (Optional[str]), rendered_html (Optional[str]), synonyms, auto_generated_synonyms, tags`. Method `walk()` — pre-order generator over self + descendants.
  - `PageDoc` dataclass: `items: List[Union[str, MathBlock]]` (prose HTML segments and top-level blocks in document order); method `top_blocks()`.
  - `body_text(html_str: str) -> str` — snippet-grade plain text from emitted HTML (flattens `data-dref` links to label words, drops child markers, strips tags, unescapes entities).
  - `finalize_blocks(top_blocks: List[MathBlock]) -> None` — auto-labels, definition synonyms/plurals, tag parsing; raises `ValueError` on unlabeled top-level theorem-likes.
  - `render_block_html(block: MathBlock, content_html: str, url: str) -> str` — wraps resolved content, substitutes child markers with `child.rendered_html`, appends unmarked children, QED for proofs.

- [ ] **Step 1: Write the failing test**

Create `test/test_structured_math.py`:

```python
"""Unit tests for the typed document model (structured_math.py).

Run: docker exec -i mathnotes-static-builder python3 - < test/test_structured_math.py
"""
import os, sys, traceback
try:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
except NameError:
    sys.path.insert(0, "/app")

from mathnotes.structured_math import (
    MathBlock, MathBlockType, PageDoc, CHILD_MARKER_RE,
    body_text, finalize_blocks, render_block_html,
)


def blk(t, title=None, label=None, body_html="", metadata=None):
    b = MathBlock(block_type=MathBlockType(t), content=body_text(body_html),
                  title=title, label=label, metadata=metadata or {})
    b.body_html = body_html
    return b


def test_body_text():
    assert body_text("<p>A <em>gizmo</em> is $x&lt;y$ neat.</p>") == "A gizmo is $x<y$ neat."
    # auto drefs flatten to label words; custom drefs keep their text
    assert body_text('<p>Every <a data-dref="open-cover"></a> works</p>') == "Every open cover works"
    assert body_text('<p><a data-dref="t:x-y">see this</a></p>') == "see this"
    # child markers vanish
    assert body_text("<p>before</p>\x020\x02<p>after</p>") == "before after"


def test_content_snippet():
    b = blk("theorem", body_html="<p>Every $x$ in a metric space has one two three four five.</p>")
    assert b.content_snippet == "Every $x$ in a metric space..."
    b2 = blk("theorem", body_html="<p>$$ a+b $$</p><p>Short.</p>")
    assert b2.content_snippet == "Short."


def test_finalize_definition_auto_label_and_plural():
    d = blk("definition", title="Open Cover")
    finalize_blocks([d])
    assert d.label == "open-cover"
    assert ("Open Covers", "open-covers") in d.auto_generated_synonyms


def test_finalize_manual_synonyms_and_tags():
    d = blk("definition", title="Element", label="element",
            metadata={"synonyms": "member, point", "tags": "algebra, sets"})
    finalize_blocks([d])
    assert ("member", "member") in d.synonyms and ("point", "point") in d.synonyms
    assert ("members", "members") in d.auto_generated_synonyms
    assert d.tags == ["algebra", "sets"]


def test_finalize_proof_and_nested_labels():
    t = blk("theorem", label="ftc")
    p = blk("proof"); p.parent = t
    n = blk("note"); n.parent = t
    p2 = blk("proof"); p2.parent = t
    t.children = [p, n, p2]
    finalize_blocks([t])
    assert p.label == "proof-of-ftc"
    assert p2.label == "proof-of-ftc-2"
    assert n.label == "ftc-note"


def test_finalize_counter_labels():
    r1 = blk("remark"); r2 = blk("remark")
    finalize_blocks([r1, r2])
    assert r1.label == "remark-1" and r2.label == "remark-2"


def test_finalize_requires_explicit_theorem_labels():
    t = blk("theorem", title="Unlabeled")
    try:
        finalize_blocks([t])
        assert False, "should have raised"
    except ValueError as e:
        assert "explicit label" in str(e)


def test_render_block_html_shape():
    t = blk("theorem", title="FTC", label="ftc",
            body_html="<p>Statement.</p>")
    p = blk("proof", label="proof-of-ftc", body_html="<p>Because.</p>")
    p.parent = t; t.children = [p]
    p.rendered_html = render_block_html(p, p.body_html, "/mathnotes/x/#proof-of-ftc")
    html = render_block_html(t, t.body_html, "/mathnotes/x/#ftc")
    assert 'class="math-block math-theorem"' in html
    assert 'id="ftc"' in html and 'data-label="ftc"' in html
    assert '<span class="math-block-type">Theorem:</span>' in html
    assert '<a href="/mathnotes/x/#ftc">FTC</a>' in html
    assert '<span class="block-label-ref">@ftc</span>' in html
    # unmarked child (amsthm-attached) appended inside the parent
    assert 'math-block-nested' in html and "<p>Because.</p>" in html
    assert "$\\square$" in html  # proof QED


def test_render_block_html_inline_child_marker():
    t = blk("theorem", title=None, label="t1", body_html="<p>Pre.</p>\n\x020\x02\n<p>Post.</p>")
    c = blk("note", label="t1-note", body_html="<p>Inner.</p>")
    c.parent = t; t.children = [c]
    c.rendered_html = render_block_html(c, c.body_html, "/u#t1-note")
    html = render_block_html(t, t.body_html, "/u#t1")
    assert html.index("<p>Pre.</p>") < html.index("<p>Inner.</p>") < html.index("<p>Post.</p>")
    assert CHILD_MARKER_RE.search(html) is None


def test_walk_and_pagedoc():
    t = blk("theorem", label="a"); c = blk("proof", label="proof-of-a"); c.parent = t
    t.children = [c]
    doc = PageDoc(items=["<p>hi</p>", t])
    assert doc.top_blocks() == [t]
    assert [b.label for b in t.walk()] == ["a", "proof-of-a"]


if __name__ == "__main__":
    fns = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    failed = 0
    for fn in fns:
        try:
            fn(); print(f"PASS {fn.__name__}")
        except Exception:
            failed += 1; print(f"FAIL {fn.__name__}"); traceback.print_exc()
    print(f"{len(fns) - failed}/{len(fns)} passed")
    sys.exit(1 if failed else 0)
```

- [ ] **Step 2: Run it to verify it fails**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_structured_math.py`
Expected: ImportError (`cannot import name 'PageDoc'`).

- [ ] **Step 3: Rewrite `mathnotes/structured_math.py`**

Keep from the current file, verbatim: the module docstring (update its first line to say "typed document model"), `MathBlockType`, and inside `MathBlock`: `css_class`, `display_name`, `normalize_label_from_title`, `generate_plural` (including the irregular-plurals table). Replace everything else:

```python
import html as html_lib
import re
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any, Tuple, Union, Iterator
from enum import Enum

# \x02<i>\x02 in body_html marks where children[i] renders inline
CHILD_MARKER_RE = re.compile("\x02(\\d+)\x02")
_DREF_TEXT_RE = re.compile(r'<a data-dref="([^"]+)">(.*?)</a>', re.DOTALL)
_TAG_RE = re.compile(r"<[^>]+>")


def body_text(html_str: str) -> str:
    """Snippet-grade plain text from emitted body HTML.

    Auto drefs (empty link text) flatten to their label with hyphens as
    spaces, mirroring how the old dialect flattened @refs in link text.
    """
    def flatten(m):
        inner = m.group(2)
        if inner.strip():
            return inner
        label = m.group(1).split(":", 1)[-1]
        return label.replace("-", " ")

    text = _DREF_TEXT_RE.sub(flatten, html_str)
    text = CHILD_MARKER_RE.sub(" ", text)
    text = _TAG_RE.sub("", text)
    text = html_lib.unescape(text)
    return " ".join(text.split())
```

`MathBlock` dataclass — same fields as today except: `content` is documented as plain text with inline math preserved; add `body_html: str = ""` and `rendered_html: Optional[str] = None`; keep `content_html`, `synonyms`, `auto_generated_synonyms`, `tags`, `children`, `parent`, `metadata`. Add:

```python
    def walk(self) -> Iterator["MathBlock"]:
        yield self
        for child in self.children:
            yield from child.walk()
```

Rewrite `content_snippet` (the markdown/marker regexes are gone; `content` is already plain text):

```python
    @property
    def content_snippet(self) -> str:
        """First 7 words of content, display math removed, for reference link text."""
        text = re.sub(r"\$\$.*?\$\$", "", self.content, flags=re.DOTALL)
        words = text.split()
        if not words:
            return self.label or "untitled"
        snippet = " ".join(words[:7])
        if len(words) > 7:
            snippet += "..."
        return snippet
```

Add `PageDoc`:

```python
@dataclass
class PageDoc:
    """Parsed page: prose HTML segments and top-level MathBlocks, in order."""

    items: List[Union[str, MathBlock]] = field(default_factory=list)

    def top_blocks(self) -> List[MathBlock]:
        return [it for it in self.items if isinstance(it, MathBlock)]
```

Add `finalize_blocks` — this ports the auto-label / synonym / tag logic from the old `StructuredMathParser._parse_blocks` (lines 335–437 of the old file). The page-wide counter is the block's 1-based pre-order position, which reproduces the old "blocks closed so far + 1" numbering for every reachable case (nested blocks never take the counter path; at top level everything earlier has closed):

```python
_NESTED_AUTO_TYPES = {
    MathBlockType.NOTE, MathBlockType.EXAMPLE, MathBlockType.REMARK,
    MathBlockType.INTUITION, MathBlockType.EXERCISE, MathBlockType.SOLUTION,
}
_EXPLICIT_LABEL_TYPES = {
    MathBlockType.THEOREM, MathBlockType.LEMMA, MathBlockType.PROPOSITION,
    MathBlockType.COROLLARY, MathBlockType.AXIOM,
}


def finalize_blocks(top_blocks: List[MathBlock]) -> None:
    """Assign auto labels, definition synonyms/plurals, and tags, in place."""
    counter = 0
    per_parent: Dict[Tuple[int, str], int] = {}

    def visit(block: MathBlock):
        nonlocal counter
        counter += 1
        if not block.label and block.block_type == MathBlockType.DEFINITION and block.title:
            block.label = MathBlock.normalize_label_from_title(block.title)
        if not block.label:
            parent = block.parent
            if block.block_type == MathBlockType.PROOF and parent and parent.label:
                key = (id(parent), "proof")
                per_parent[key] = per_parent.get(key, 0) + 1
                n = per_parent[key]
                block.label = f"proof-of-{parent.label}" + (f"-{n}" if n > 1 else "")
            elif parent and parent.label and block.block_type in _NESTED_AUTO_TYPES:
                key = (id(parent), block.block_type.value)
                per_parent[key] = per_parent.get(key, 0) + 1
                n = per_parent[key]
                block.label = f"{parent.label}-{block.block_type.value}" + (f"-{n}" if n > 1 else "")
            else:
                block.label = f"{block.block_type.value}-{counter}"
        if block.parent is None and block.block_type in _EXPLICIT_LABEL_TYPES:
            if "label" not in block.metadata:
                raise ValueError(
                    f"Top-level {block.block_type.value} blocks must have an "
                    f"explicit label (title: {block.title})"
                )
        if block.block_type == MathBlockType.DEFINITION:
            _build_definition_synonyms(block)
        if "tags" in block.metadata and not block.tags:
            block.tags = [
                t.strip().strip('"') for t in block.metadata["tags"].split(",") if t.strip()
            ]
        for child in block.children:
            visit(child)

    for b in top_blocks:
        visit(b)


def _build_definition_synonyms(block: MathBlock) -> None:
    manual_labels = set()
    if "synonyms" in block.metadata and not block.synonyms:
        for syn in block.metadata["synonyms"].split(","):
            syn = syn.strip().strip('"')
            if not syn:
                continue
            syn_label = MathBlock.normalize_label_from_title(syn)
            block.synonyms.append((syn, syn_label))
            manual_labels.add(syn_label)
            plural = MathBlock.generate_plural(syn)
            if plural:
                plural_label = MathBlock.normalize_label_from_title(plural)
                if plural_label not in manual_labels:
                    block.auto_generated_synonyms.append((plural, plural_label))
    if block.title:
        plural = MathBlock.generate_plural(block.title)
        if plural:
            plural_label = MathBlock.normalize_label_from_title(plural)
            if plural_label not in manual_labels:
                block.auto_generated_synonyms.append((plural, plural_label))
```

Rewrite `render_block_html` as a module-level function. Port the old method body (old lines 580–666) with these changes: signature `(block, content_html, url)`; child substitution uses `CHILD_MARKER_RE` + `block.children`; unmarked children append after content; title/tags/synonyms are plain text so escape them with `html_lib.escape`; QED comes from the math seam:

```python
def render_block_html(block: MathBlock, content_html: str, url: str) -> str:
    """Wrap resolved block content in the math-block card HTML."""
    css_classes = [block.css_class]
    if block.parent:
        css_classes.append("math-block-nested")
    attrs = [f'class="{" ".join(css_classes)}"',
             f'id="{block.label}"', f'data-label="{block.label}"']
    for key, value in block.metadata.items():
        if key != "label":
            attrs.append(f'data-{key}="{html_lib.escape(str(value))}"')

    parts = [f'<div {" ".join(attrs)}>', '<div class="math-block-header">']
    if block.block_type != MathBlockType.PROOF:
        if block.title:
            parts.append(f'<span class="math-block-type">{block.display_name}:</span>')
            parts.append(
                f'<span class="math-block-title"><a href="{url}">'
                f"{html_lib.escape(block.title)}</a></span>"
            )
        else:
            parts.append(f'<span class="math-block-type">{block.display_name}</span>')
    else:
        parts.append('<span class="math-block-type">Proof</span>')
    if block.synonyms:
        names = ", ".join(html_lib.escape(s[0]) for s in block.synonyms)
        parts.append(f'<span class="block-synonyms">(also: {names})</span>')
    if block.tags:
        tags_html = "".join(
            f'<span class="block-tag">{html_lib.escape(t)}</span>' for t in block.tags
        )
        parts.append(f'<span class="block-tags">{tags_html}</span>')
    parts.append(f'<span class="block-label-ref">@{block.label}</span>')
    parts.append("</div>")

    marked = {int(i) for i in CHILD_MARKER_RE.findall(content_html)}

    def sub_child(m):
        child = block.children[int(m.group(1))]
        if child.rendered_html is None:
            raise ValueError(f"Child block '{child.label}' rendered out of order")
        return child.rendered_html

    processed = CHILD_MARKER_RE.sub(sub_child, content_html)
    for i, child in enumerate(block.children):
        if i not in marked:
            if child.rendered_html is None:
                raise ValueError(f"Child block '{child.label}' rendered out of order")
            processed += "\n" + child.rendered_html

    parts.append('<div class="math-block-content">')
    parts.append(processed)
    if block.block_type == MathBlockType.PROOF:
        from .latex_processor import render_math  # local: latex_processor imports this module

        qed = render_math("\\square", display=False)
        if not processed.rstrip().endswith(qed):
            parts.append(f" {qed}")
    parts.append("</div>")
    parts.append("</div>")
    return "\n".join(parts)
```

Delete: `StructuredMathParser` (entire class), `process_structured_math_content`, `_render_block_error`.

Note: `render_math` does not exist until Task 2; the local import means only the proof-QED test path needs it. For this task's test run, add the seam to `latex_processor.py` now (it is Task 2's first piece, harmless to add early):

In `mathnotes/latex_processor.py`, after the imports add:

```python
import html as html_lib


def render_math(latex: str, display: bool) -> str:
    """THE math seam: every math node renders through this one function.

    Part 1: emit MathJax delimiter text (client-side rendering, as before).
    Part 2 will swap this body for build-time MathML.
    """
    inner = html_lib.escape(latex.strip(), quote=False)
    return f"$$ {inner} $$" if display else f"${inner}$"
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_structured_math.py`
Expected: `10/10 passed`.

---

### Task 2: Prose HTML emitter in `latex_processor.py`

Cut `parse_latex_file` over to `(metadata, PageDoc)`. Prose, inline styles, sections, lists, code, images, links, math, demos, and the three placeholder kinds. Block environments raise a temporary error (Task 3 implements them). The old dialect-emission methods are deleted. **Delete `test/test_latex_processor.py` and start its replacement** — the old file asserts dialect strings that no longer exist.

**Files:**
- Modify: `mathnotes/latex_processor.py`
- Test: `test/test_latex_processor.py` (replace file)

**Interfaces:**
- Consumes: `PageDoc`, `body_text` from Task 1.
- Produces:
  - `parse_latex_file(source: str, filepath: str = "<latex>") -> Tuple[Dict[str, Any], PageDoc]`
  - `render_math(latex: str, display: bool) -> str` (added in Task 1 Step 3)
  - Placeholder grammar (Tasks 4–6 depend on these exact shapes):
    - dref: `<a data-dref="LABEL"></a>` (auto text) or `<a data-dref="LABEL">inline html</a>`
    - pagelink: `<a data-pagelink="SLUG"></a>` or `<a data-pagelink="SLUG">inline html</a>`
    - dembed: `<div data-dembed="LABEL"></div>` (own line, never inside `<p>`)
    - demo: `<div class="demo-component" data-demo="NAME" id="demo-NAME-K"></div>` (K = per-file counter from 0)

- [ ] **Step 1: Write the failing test (replace `test/test_latex_processor.py`)**

Replace the whole file. Use the same harness conventions as the old file (stdin-runnable, `sys.path` shim, per-test PASS/FAIL loop — copy the `__main__` runner block from Task 1's test). Helpers and prose-level tests:

```python
from mathnotes.latex_processor import parse_latex_file, render_math, LatexDialectError
from mathnotes.structured_math import PageDoc, MathBlock, MathBlockType

DOC = "\\title{T}\n\\begin{document}\n%s\n\\end{document}"


def page(body):
    return parse_latex_file(DOC % body, filepath="content/test/page.tex")[1]


def prose(body):
    """Whole-page HTML when the page is prose-only."""
    doc = page(body)
    assert all(isinstance(it, str) for it in doc.items), doc.items
    return "\n".join(doc.items)


def meta(source):
    return parse_latex_file(source, filepath="content/test/page.tex")[0]


def expect_error(body, fragment):
    try:
        page(body)
        assert False, f"expected LatexDialectError mentioning {fragment!r}"
    except LatexDialectError as e:
        assert fragment in str(e), f"{e!r} does not mention {fragment!r}"


def test_metadata():
    m = meta("\\title{Compact Sets}\n\\description{Intro.}\n\\begin{document}x\\end{document}")
    assert m["title"] == "Compact Sets" and m["description"] == "Intro." and m["layout"] == "page"


def test_source_metadata():
    m = meta("\\title{T}\n\\source{title={A Book}, author={A. B.}, type=book}\n"
             "\\begin{document}x\\end{document}")
    assert m["sources"] == [{"title": "A Book", "author": "A. B.", "type": "book"}]


def test_paragraphs():
    assert prose("One.\n\nTwo.") == "<p>One.</p>\n<p>Two.</p>"


def test_inline_styles():
    h = prose("An \\emph{open} and \\textbf{closed} \\texttt{set}.")
    assert h == "<p>An <em>open</em> and <strong>closed</strong> <code>set</code>.</p>"


def test_escapes_and_specials():
    h = prose("50\\% of A \\& B, x \\_ y, a~b, \\dots, 5 \\$")
    assert "50% of A &amp; B" in h and "x _ y" in h and "a b" in h
    assert "..." in h and "5 &#36;" in h


def test_html_escaping_in_prose():
    assert prose("a < b > c") == "<p>a &lt; b &gt; c</p>"


def test_math_seam():
    assert render_math("x<y", False) == "$x&lt;y$"
    assert render_math("\\int f", True) == "$$ \\int f $$"
    h = prose("Inline $a<b$ and display $$c \\to d$$ done.")
    assert "$a&lt;b$" in h and "$$ c \\to d $$" in h


def test_sections():
    h = prose("\\section{Big Idea}\nText.\n\\subsection{Small $x$ Idea}")
    assert '<h1 id="big-idea">Big Idea</h1>' in h
    assert '<h2 id="small-x-idea">Small $x$ Idea</h2>' in h
    assert "<p>Text.</p>" in h


def test_lists():
    h = prose("\\begin{itemize}\n\\item one\n\\item two\n"
              "\\begin{enumerate}\n\\item a\n\\end{enumerate}\n\\end{itemize}")
    assert "<ul>" in h and "<li>one</li>" in h
    assert "<ol>" in h and "<li>a</li>" in h
    # nested list lives inside the parent <li>
    assert h.index("<li>two") < h.index("<ol>") < h.index("</ul>")


def test_code_blocks():
    h = prose("\\begin{lstlisting}[language=Python]\nx = 1 < 2\n\\end{lstlisting}")
    assert '<pre><code class="language-python">x = 1 &lt; 2</code></pre>' in h
    h2 = prose("\\begin{verbatim}\nplain & <raw>\n\\end{verbatim}")
    assert "<pre><code>plain &amp; &lt;raw&gt;</code></pre>" in h2


def test_href_and_images():
    h = prose("See \\href{https://example.com/a\\%20b}{the \\emph{site}}.")
    assert '<a href="https://example.com/a%20b">the <em>site</em></a>' in h
    h2 = prose("\\includegraphics[alt={A plot}]{plot.png}")
    assert '<img src="/mathnotes/test/plot.png" alt="A plot">' in h2
    h3 = prose("\\includegraphics[alt={A}, width=300px]{p.png}")
    assert '<img src="/mathnotes/test/p.png" alt="A" width="300">' in h3
    h4 = prose("\\includegraphics{/static/img.png}")
    assert '<img src="/static/img.png" alt="">' in h4


def test_placeholders():
    h = prose("Every \\dref{metric-space} has \\dref[a \\emph{nice}]{prop} form.")
    assert '<a data-dref="metric-space"></a>' in h
    assert '<a data-dref="prop">a <em>nice</em></a>' in h
    h2 = prose("See \\pagelink{compact-sets} and \\pagelink[this page]{other}.")
    assert '<a data-pagelink="compact-sets"></a>' in h2
    assert '<a data-pagelink="other">this page</a>' in h2
    h3 = prose("Intro.\n\n\\dembed{sequence}\n\nAfter.")
    assert '<div data-dembed="sequence"></div>' in h3
    assert "<p><div" not in h3  # dembed is block-level, never wrapped in <p>


def test_demo():
    h = prose("\\includedemo{pendulum}\n\nAnd \\includedemo{pendulum} again? No: new id.")
    assert '<div class="demo-component" data-demo="pendulum" id="demo-pendulum-0"></div>' in h
    assert 'id="demo-pendulum-1"' in h


def test_unsupported_still_loud():
    expect_error("\\badmacro{x}", "unsupported command")
    expect_error("\\begin{tabular}{c} x \\end{tabular}", "unsupported environment")
```

- [ ] **Step 2: Run to verify failure**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py`
Expected: failures — `parse_latex_file` still returns a string; `\dembed` unknown.

- [ ] **Step 3: Implement the emitter**

In `mathnotes/latex_processor.py`:

**Module docstring:** replace with "Parses .tex content files (the mathnotes LaTeX dialect) directly into a typed PageDoc: prose HTML segments plus MathBlock trees. References are emitted as placeholder elements resolved later against the block index (ref_resolver.py). render_math() is the single seam through which math becomes output markup."

**Imports:** add `import os`; `from .structured_math import MathBlockType, MathBlock, PageDoc, body_text` (replacing the bare `MathBlockType` import).

**Context (`_latex_context`)**: add `macrospec.MacroSpec("dembed", "{")` to the macros list.

**Constants:** replace `_STYLE_MACROS` with tag names:
```python
_STYLE_MACROS = {"emph": "em", "textit": "em", "textbf": "strong", "texttt": "code"}
_ISLAND = "\x01"  # wraps block-level HTML islands inside a prose stream
```

**New helpers** (module level):

```python
def _esc(text: str) -> str:
    return html_lib.escape(text, quote=False)


def _island(html_str: str) -> str:
    return f"{_ISLAND}{html_str}{_ISLAND}"


def _paragraphize(stream: str) -> str:
    """Convert an inline-HTML stream with \\x01-wrapped block islands and
    blank-line paragraph breaks into final HTML."""
    out = []
    for i, part in enumerate(stream.split(_ISLAND)):
        if i % 2 == 1:
            out.append(part)
        else:
            for para in re.split(r"\n\s*\n", part):
                para = para.strip()
                if para:
                    out.append(f"<p>{para}</p>")
    return "\n".join(out)


def _heading_id(title_html: str) -> str:
    return MathBlock.normalize_label_from_title(re.sub(r"<[^>]+>", "", title_html))
```

**`_Transpiler` → rename class to `_Parser`** (update the `parse_latex_file` call). `__init__` gains `self._demo_counter = 0`.

**`run()`**: same metadata scanning; then:
```python
        items = self._build_items(body)
        top_blocks = [it for it in items if isinstance(it, MathBlock)]
        try:
            finalize_blocks(top_blocks)
        except ValueError as e:
            raise LatexDialectError(f"{self.filepath}: {e}") from e
        return metadata, PageDoc(items=items)
```
(`finalize_blocks` import from `.structured_math`; the `re.sub` newline-collapsing of the old `run` is gone.)

**`_transpile_body` → `_build_items(self, nodes) -> list`**: keep the anchor/proof_target attachment logic byte-for-byte in structure, but assemble typed items. For this task, make `_parse_block_env` raise `LatexDialectError(self._err(n, "block environments: implemented in Task 3"))` — the block branch stays wired so Task 3 only fills in `_parse_block_env`. Full body:

```python
    def _build_items(self, nodes) -> list:
        items: list = []
        prose_buf: List[str] = []
        anchor: Optional[MathBlock] = None
        proof_target: Optional[MathBlock] = None

        def flush_prose():
            if prose_buf:
                html_str = _paragraphize("".join(prose_buf))
                prose_buf.clear()
                if html_str:
                    items.append(html_str)

        def flush_anchor():
            nonlocal anchor, proof_target
            if anchor is not None:
                items.append(anchor)
            anchor = None
            proof_target = None

        for n in nodes:
            if isinstance(n, LatexEnvironmentNode) and n.environmentname in _BLOCK_ENV_NAMES:
                flush_prose()
                blk = self._parse_block_env(n)
                name = n.environmentname
                if name in _THEOREM_LIKE or name == "exercise":
                    flush_anchor()
                    anchor = blk
                    proof_target = blk
                elif name in ("definition", "axiom"):
                    flush_anchor()
                    items.append(blk)
                elif name == "corollary":
                    if anchor is not None:
                        blk.parent = anchor
                        anchor.children.append(blk)
                    else:
                        anchor = blk
                    proof_target = blk
                elif name == "proof":
                    if proof_target is None:
                        self._err(n, "proof has no preceding theorem-like statement")
                    blk.parent = proof_target
                    proof_target.children.append(blk)
                elif name == "solution":
                    if anchor is None or anchor.block_type != MathBlockType.EXERCISE:
                        self._err(n, "solution has no preceding exercise")
                    blk.parent = anchor
                    anchor.children.append(blk)
                else:  # _ATTACHABLE_NOTES
                    if anchor is not None:
                        blk.parent = anchor
                        anchor.children.append(blk)
                    else:
                        items.append(blk)
            elif isinstance(n, LatexMacroNode) and n.macroname == "detach":
                flush_anchor()
            elif isinstance(n, LatexMacroNode) and n.macroname == "source":
                continue
            elif isinstance(n, LatexMacroNode) and n.macroname in _SECTION_LEVELS:
                flush_anchor()
                prose_buf.append(self._macro(n))
            elif isinstance(n, LatexCharsNode) and not n.chars.strip():
                if anchor is None:
                    prose_buf.append(re.sub(r"\n[ \t]+", "\n", n.chars))
            elif isinstance(n, LatexCommentNode):
                continue
            else:
                flush_anchor()
                prose_buf.append(self._prose([n]))
        flush_anchor()
        flush_prose()
        return items
```

**`_prose`**: only the chars branch changes — `out.append(_esc(re.sub(r"\n[ \t]+", "\n", n.chars)))`.

**`_macro` rewrite of emission branches** (structure and error branches unchanged):
- styles: same edge-whitespace logic, emitting `f"{lead}<{tag}>{stripped}</{tag}>{trail}"`.
- sections: `title = self._prose(...).strip()`; return `_island(f'<h{lvl} id="{_heading_id(title)}">{title}</h{lvl}>')`.
- `dots/ldots` → `"..."`; `textasciitilde` → `"~"`; `textasciicircum` → `"^"`; `"$"` → `"&#36;"` (comment: a bare `$` in DOM text would pair with another under MathJax's delimiter scan); `_ESCAPED_CHAR_MACROS` → `_esc(name)` (escapes `&`).
- `href`: `f'<a href="{html_lib.escape(url, quote=True)}">{self._prose(text_group.nodelist).strip()}</a>'`.
- `includegraphics`: keep option parsing verbatim; then build the tag directly (path fixing moves here from the deleted post-processors):
```python
            src = self._fix_image_path(path)
            attrs = [f'src="{html_lib.escape(src, quote=True)}"',
                     f'alt="{html_lib.escape(options.get("alt", ""), quote=True)}"']
            if "title" in options:
                attrs.append(f'title="{html_lib.escape(options["title"], quote=True)}"')
            for key in ("width", "height"):
                if key in options:
                    value = options[key]
                    if value.endswith("px"):
                        value = value[:-2]
                    attrs.append(f'{key}="{value}"')
            return f'<img {" ".join(attrs)}>'
```
  Drop the old `title cannot be combined with width/height` error (raw-`<img>` limitation, gone). Add:
```python
    def _fix_image_path(self, path: str) -> str:
        if re.match(r"^(https?:|data:|/)", path):
            return path
        directory = os.path.dirname(self.filepath).replace("content/", "", 1).replace("content", "")
        return f"/mathnotes/{directory}/{path}".replace("//", "/")
```
- `dref`/`pagelink`/`includedemo`/`dembed`:
```python
    def _dref(self, n) -> str:
        opt, mand = n.nodeargd.argnlist
        label = "".join(c.chars for c in mand.nodelist if isinstance(c, LatexCharsNode)).strip()
        if not label:
            self._err(n, "\\dref requires a non-empty label")
        text = self._prose(opt.nodelist).strip() if opt is not None else ""
        return f'<a data-dref="{html_lib.escape(label, quote=True)}">{text}</a>'

    def _pagelink(self, n) -> str:
        opt, mand = n.nodeargd.argnlist
        slug = "".join(c.chars for c in mand.nodelist if isinstance(c, LatexCharsNode)).strip()
        if not slug:
            self._err(n, "\\pagelink requires a non-empty slug")
        text = self._prose(opt.nodelist).strip() if opt is not None else ""
        return f'<a data-pagelink="{html_lib.escape(slug, quote=True)}">{text}</a>'

    def _dembed(self, n) -> str:
        label = self._chars_arg(n)
        return _island(f'<div data-dembed="{html_lib.escape(label, quote=True)}"></div>')

    def _includedemo(self, n) -> str:
        demo = self._chars_arg(n)
        demo_id = f"demo-{demo}-{self._demo_counter}"
        self._demo_counter += 1
        return _island(
            f'<div class="demo-component" data-demo="{demo}" id="{demo_id}"></div>'
        )
```
  and in `_macro`'s dispatch add `if name == "dembed": return self._dembed(n)`. Remove the pipe-character errors (`|` no longer delimits anything).

**`_math`**: keep delimiter-stripping; final line becomes `return render_math(inner, n.displaytype == "display")`.

**`_code_block` → `_code_html`**: keep the lstlisting option handling; emit:
```python
        lang_attr = f' class="language-{lang}"' if lang else ""
        code = _esc(text.strip("\n"))
        return _island(f"<pre><code{lang_attr}>{code}</code></pre>")
```

**`_list` / `_list_lines` → `_list_html(self, n, ordered) -> str`**: same `\item` splitting and sublist separation; build tags:
```python
    def _list_html(self, n, ordered: bool) -> str:
        items = []          # same splitting loop as before (\item / comments / stray content error)
        ...
        tag = "ol" if ordered else "ul"
        lis = []
        for item in items:
            sublists = [c for c in item if isinstance(c, LatexEnvironmentNode)
                        and c.environmentname in ("itemize", "enumerate")]
            sub_ids = {id(s) for s in sublists}
            text_nodes = [c for c in item if id(c) not in sub_ids]
            inner = " ".join(self._prose(text_nodes).split())
            for sub in sublists:
                inner += self._list_html(sub, sub.environmentname == "enumerate")
            lis.append(f"<li>{inner}</li>")
        return _island(f'<{tag}>{"".join(lis)}</{tag}>')
```
`_environment` calls `_list_html` / `_code_html` accordingly; its error branches are unchanged.

**Delete:** `_emit_block` (block emission is Task 3), the old `_dref`/`_pagelink` markdown emitters (replaced above), `_code_block`, `_list`, `_list_lines`, `_transpile_body`, and the `_BlockNode` class (Task 3 builds `MathBlock` directly). Leave `_parse_block_env` as the Task-3 stub described above.

- [ ] **Step 4: Run the test suite for this file**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py`
Expected: all prose-level tests pass (block tests arrive in Task 3). Also re-run Task 1's test — still green.

---

### Task 3: Block environments → `MathBlock` trees

**Files:**
- Modify: `mathnotes/latex_processor.py` (`_parse_block_env`)
- Test: `test/test_latex_processor.py` (append block tests)

**Interfaces:**
- Consumes: `finalize_blocks`, `body_text`, `MathBlock` from Task 1.
- Produces: `PageDoc.items` containing fully-built `MathBlock`s: `body_html` (paragraphized, `\x02i\x02` islands for literally-nested children), `content` (plain text), `title` (plain text), `metadata` with raw `label`/`synonyms`/`tags` strings, `children`/`parent` wired for both nesting styles.

- [ ] **Step 1: Append failing tests to `test/test_latex_processor.py`**

```python
THM = ("\\begin{theorem}[Named]\\label{t1}\nBody $x$.\n\\end{theorem}\n"
       "\\begin{proof}\nBecause \\dref{t1}.\n\\end{proof}")


def test_block_basic():
    doc = page(THM)
    blocks = doc.top_blocks()
    assert len(blocks) == 1
    t = blocks[0]
    assert t.block_type == MathBlockType.THEOREM
    assert t.label == "t1" and t.title == "Named"
    assert t.body_html == "<p>Body $x$.</p>"
    assert t.content == "Body $x$."
    p = t.children[0]
    assert p.block_type == MathBlockType.PROOF and p.label == "proof-of-t1"
    assert p.parent is t
    assert '<a data-dref="t1"></a>' in p.body_html


def test_block_attachment_and_detach():
    doc = page(THM + "\n\\begin{note}\nA note.\n\\end{note}")
    t = doc.top_blocks()[0]
    assert [c.block_type.value for c in t.children] == ["proof", "note"]
    assert t.children[1].label == "t1-note"
    doc2 = page(THM + "\n\\detach\n\\begin{note}\nFree note.\n\\end{note}")
    assert [b.block_type.value for b in doc2.top_blocks()] == ["theorem", "note"]


def test_corollary_attaches_and_takes_proof():
    doc = page(THM + "\n\\begin{corollary}\\label{c1}\nCor.\n\\end{corollary}\n"
                     "\\begin{proof}\nCor proof.\n\\end{proof}")
    t = doc.top_blocks()[0]
    cor = [c for c in t.children if c.block_type == MathBlockType.COROLLARY][0]
    assert cor.label == "c1"
    assert cor.children[0].label == "proof-of-c1"


def test_literal_nesting_markers():
    doc = page("\\begin{theorem}\\label{t2}\nPre.\n"
               "\\begin{note}\nInner.\n\\end{note}\nPost.\n\\end{theorem}")
    t = doc.top_blocks()[0]
    assert "\x020\x02" in t.body_html
    assert t.children[0].body_html == "<p>Inner.</p>"
    assert "Inner" not in t.content  # child content excluded from parent snippet text


def test_definition_synonyms_tags():
    doc = page("\\begin{definition}[Gizmo]\\synonyms{gadget}\\tags{testing}\nA gizmo.\n"
               "\\end{definition}")
    d = doc.top_blocks()[0]
    assert d.label == "gizmo"
    assert ("gadget", "gadget") in d.synonyms
    assert ("Gizmos", "gizmos") in d.auto_generated_synonyms
    assert d.tags == ["testing"]
    assert d.metadata["synonyms"] == "gadget"  # raw string kept for data-attrs


def test_prose_between_blocks_order():
    doc = page("Before.\n" + THM + "\nAfter.")
    kinds = [type(it).__name__ for it in doc.items]
    assert kinds == ["str", "MathBlock", "str"]
    assert doc.items[0] == "<p>Before.</p>" and doc.items[2] == "<p>After.</p>"


def test_unlabeled_theorem_is_error():
    expect_error("\\begin{theorem}\nNo label.\n\\end{theorem}", "explicit label")


def test_block_errors():
    expect_error("\\begin{proof}\nOrphan.\n\\end{proof}", "no preceding theorem")
    expect_error("\\begin{itemize}\\item \\begin{theorem}x\\end{theorem}\\end{itemize}",
                 "nested inside a non-block construct")
```

- [ ] **Step 2: Run to verify failure**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py`
Expected: the new tests fail on the Task-2 stub error.

- [ ] **Step 3: Implement `_parse_block_env`**

Replace the stub. This is the old method (old lines 314–369) with `MathBlock` as the product:

```python
    def _parse_block_env(self, n) -> MathBlock:
        title = None
        args = n.nodeargd.argnlist if n.nodeargd else []
        if args and args[0] is not None:
            title = body_text(self._prose(args[0].nodelist))
        body = list(n.nodelist)
        extracted: Dict[str, str] = {}
        i = 0
        while i < len(body):
            child = body[i]
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

        children: List[MathBlock] = []
        pieces: List[str] = []
        buffer: List[Any] = []

        def flush_buffer():
            if buffer:
                pieces.append(self._prose(buffer))
                buffer.clear()

        for child in body:
            if isinstance(child, LatexEnvironmentNode) and child.environmentname in _BLOCK_ENV_NAMES:
                flush_buffer()
                pieces.append(_island(f"\x02{len(children)}\x02"))
                children.append(self._parse_block_env(child))
            else:
                buffer.append(child)
        flush_buffer()

        body_html = _paragraphize("".join(pieces))
        metadata = {k: v for k, v in extracted.items()}
        blk = MathBlock(
            block_type=MathBlockType(n.environmentname),
            content=body_text(CHILD_MARKER_RE.sub(" ", body_html)),
            title=title,
            label=extracted.get("label"),
            metadata=metadata,
        )
        blk.body_html = body_html
        blk.children = children
        for c in children:
            c.parent = blk
        return blk
```

Add `CHILD_MARKER_RE` and `finalize_blocks` to the `structured_math` import line. Note `body_text` already drops child markers; the explicit `sub` documents intent.

- [ ] **Step 4: Run the whole file**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py`
Expected: all tests pass, prose and block alike.

---

### Task 4: `ref_resolver.py` — placeholder resolution (deletes `math_utils.py` and `tooltip_collector.py`)

**Files:**
- Create: `mathnotes/ref_resolver.py`
- Delete: `mathnotes/math_utils.py`, `mathnotes/tooltip_collector.py`
- Test: `test/test_ref_resolver.py` (new)

**Interfaces:**
- Consumes: placeholder grammar from Task 2; `MathBlock.content_snippet`; block-index duck type: `.get_reference(label) -> Optional[obj]` where obj has `.block`, `.full_url`, `.page_title`, optional `.is_synonym`, `.synonym_title`.
- Produces (Tasks 5–6 depend on):
  - `class RefResolver:` `__init__(self, block_index, url_mapper, current_file=None)`; `resolve(self, html: str) -> str`; `collect(self, html: str) -> None`; sets `referenced_labels: Set[str]`, `embedded_labels: Set[str]`; `get_tooltip_data(self) -> Dict[str, Dict[str, Any]]`.
  - `labels_from_rendered_html(html_content: str, exclude: Dict) -> Set[str]` (port of `collect_tooltip_data_from_html`).
  - Resolved markup identical to today's: `<a href="…" class="block-reference[ synonym-reference]" data-ref-type="…" data-ref-label="…">text</a>`; error spans `<span class="block-reference-error" data-ref="…">…</span>`; embeds `<div class="embedded-block" data-embed-label="…">…</div>`; pagelinks `<a href="/mathnotes/…">Text</a>` or `<a href="#broken-link-slug">Text</a>`.

- [ ] **Step 1: Write the failing test**

`test/test_ref_resolver.py` (same runner harness). Build a minimal fake index:

```python
from types import SimpleNamespace
from mathnotes.structured_math import MathBlock, MathBlockType
from mathnotes.ref_resolver import RefResolver, labels_from_rendered_html


def make_index():
    d = MathBlock(block_type=MathBlockType.DEFINITION, content="A space with a metric.",
                  title="Metric Space", label="metric-space")
    d.rendered_html = '<div id="metric-space">RENDERED</div>'
    t = MathBlock(block_type=MathBlockType.THEOREM, content="Some statement here now ok.",
                  title=None, label="thm-1")
    t.rendered_html = '<div id="thm-1">T</div>'
    refs = {
        "metric-space": SimpleNamespace(block=d, full_url="/mathnotes/topology/x/#metric-space",
                                        page_title="X Page"),
        "metric-spaces": SimpleNamespace(block=d, full_url="/mathnotes/topology/x/#metric-space",
                                         page_title="X Page", is_synonym=True,
                                         synonym_title="Metric Spaces"),
        "thm-1": SimpleNamespace(block=t, full_url="/mathnotes/topology/x/#thm-1",
                                 page_title="X Page"),
    }
    index = SimpleNamespace(get_reference=lambda label, _r=refs: _r.get(label))
    mapper = SimpleNamespace(url_mappings={"topology/compact-sets/": "f1", "algebra/groups/": "f2"})
    return index, mapper


def test_auto_dref_definition_lowercase_title():
    index, mapper = make_index()
    r = RefResolver(index, mapper)
    out = r.resolve('<p>a <a data-dref="metric-space"></a> here</p>')
    assert ('<a href="/mathnotes/topology/x/#metric-space" class="block-reference" '
            'data-ref-type="definition" data-ref-label="metric-space">metric space</a>') in out
    assert r.referenced_labels == {"metric-space"}


def test_custom_text_and_type_validation():
    index, mapper = make_index()
    r = RefResolver(index, mapper)
    out = r.resolve('<p><a data-dref="theorem:thm-1">see <em>it</em></a></p>')
    assert '>see <em>it</em></a>' in out and 'data-ref-label="thm-1"' in out
    bad = r.resolve('<p><a data-dref="definition:thm-1"></a></p>')
    assert 'block-reference-error' in bad


def test_untitled_block_uses_snippet():
    index, mapper = make_index()
    out = RefResolver(index, mapper).resolve('<p><a data-dref="thm-1"></a></p>')
    assert ">Some statement here now ok.</a>" in out


def test_synonym_reference():
    index, mapper = make_index()
    out = RefResolver(index, mapper).resolve('<p><a data-dref="metric-spaces"></a></p>')
    assert "synonym-reference" in out and ">metric spaces</a>" in out


def test_missing_ref_error_span():
    index, mapper = make_index()
    out = RefResolver(index, mapper).resolve('<p><a data-dref="nope"></a></p>')
    assert '<span class="block-reference-error" data-ref="nope">@nope</span>' in out


def test_pagelink():
    index, mapper = make_index()
    r = RefResolver(index, mapper)
    out = r.resolve('<p><a data-pagelink="compact-sets"></a>'
                    '<a data-pagelink="groups">the groups</a>'
                    '<a data-pagelink="missing"></a></p>')
    assert '<a href="/mathnotes/topology/compact-sets/">Compact Sets</a>' in out
    assert '<a href="/mathnotes/algebra/groups/">the groups</a>' in out
    assert '<a href="#broken-link-missing">Missing</a>' in out


def test_dembed():
    index, mapper = make_index()
    r = RefResolver(index, mapper)
    out = r.resolve('<div data-dembed="metric-space"></div>')
    assert '<div class="embedded-block" data-embed-label="metric-space">' in out
    assert "RENDERED" in out
    assert 'from <a href="/mathnotes/topology/x/#metric-space">X Page</a>' in out
    assert r.embedded_labels == {"metric-space"}
    missing = r.resolve('<div data-dembed="nope"></div>')
    assert "embed-error" in missing


def test_collect_only():
    index, mapper = make_index()
    r = RefResolver(index, mapper)
    r.collect('<p><a data-dref="metric-space"></a></p><div data-dembed="thm-1"></div>')
    assert r.referenced_labels == {"metric-space"} and r.embedded_labels == {"thm-1"}


def test_tooltip_data():
    index, mapper = make_index()
    r = RefResolver(index, mapper)
    r.resolve('<p><a data-dref="metric-space"></a></p>')
    data = r.get_tooltip_data()
    assert data["metric-space"]["content"] == '<div id="metric-space">RENDERED</div>'
    assert data["metric-space"]["url"] == "/mathnotes/topology/x/#metric-space"


def test_labels_from_rendered_html():
    html = '<a href="/x" class="block-reference" data-ref-type="definition" data-ref-label="foo">f</a>'
    assert labels_from_rendered_html(html, {}) == {"foo"}
    assert labels_from_rendered_html(html, {"foo": {}}) == set()
```

- [ ] **Step 2: Run to verify failure** (`ModuleNotFoundError: mathnotes.ref_resolver`)

- [ ] **Step 3: Implement `mathnotes/ref_resolver.py`**

```python
"""Resolution of reference placeholders emitted by latex_processor.

The emitter writes machine-generated placeholder elements (data-dref,
data-pagelink, data-dembed); this module resolves them against the global
block index and URL mapper, producing the same markup the site has always
served, and tracks referenced/embedded labels for tooltips and the reverse
index. Placeholders are our own output, so matching them with regexes is
safe (unlike the old regexes over author text).
"""

import html as html_lib
import re
from typing import Any, Dict, Optional, Set, Tuple

from .structured_math import MathBlock, MathBlockType

_DEMBED_RE = re.compile(r'<div data-dembed="([^"]+)"></div>')
_DREF_RE = re.compile(r'<a data-dref="([^"]+)">(.*?)</a>', re.DOTALL)
_PAGELINK_RE = re.compile(r'<a data-pagelink="([^"]+)">(.*?)</a>', re.DOTALL)
_REF_LABEL_RE = re.compile(r'<a[^>]+class="block-reference[^"]*"[^>]+data-ref-label="([^"]+)"')


def _split_ref(ref: str) -> Tuple[Optional[str], str]:
    if ":" in ref:
        ref_type, label = ref.split(":", 1)
        return ref_type.strip(), label.strip()
    return None, ref.strip()


class RefResolver:
    def __init__(self, block_index, url_mapper, current_file: str = None):
        self.block_index = block_index
        self.url_mapper = url_mapper
        self.current_file = current_file
        self.referenced_labels: Set[str] = set()
        self.embedded_labels: Set[str] = set()

    # -- public --

    def resolve(self, html: str) -> str:
        html = _DEMBED_RE.sub(self._resolve_dembed, html)
        html = _DREF_RE.sub(self._resolve_dref, html)
        html = _PAGELINK_RE.sub(self._resolve_pagelink, html)
        return html

    def collect(self, html: str) -> None:
        """Record referenced/embedded labels without producing output."""
        for m in _DREF_RE.finditer(html):
            self.referenced_labels.add(_split_ref(html_lib.unescape(m.group(1)))[1])
        for m in _DEMBED_RE.finditer(html):
            self.embedded_labels.add(_split_ref(html_lib.unescape(m.group(1)))[1])

    def get_tooltip_data(self) -> Dict[str, Dict[str, Any]]:
        tooltip_data: Dict[str, Dict[str, Any]] = {}
        for label in self.referenced_labels:
            bref = self.block_index.get_reference(label) if self.block_index else None
            if not bref:
                continue
            block = bref.block
            is_synonym = getattr(bref, "is_synonym", False)
            synonym_title = getattr(bref, "synonym_title", label)
            if is_synonym and synonym_title:
                display_type = (f"{block.block_type.value} ({synonym_title}), "
                                f"synonym of {block.title or label}")
                display_title = ""
            else:
                display_type = block.block_type.value
                display_title = block.title or ""
            url = bref.full_url
            tooltip_data[label] = {
                "type": display_type,
                "title": display_title,
                "content": block.rendered_html,
                "url": url if url and not url.startswith("#") else "",
            }
        return tooltip_data

    # -- dref --

    def _resolve_dref(self, m) -> str:
        ref = html_lib.unescape(m.group(1))
        custom_text = m.group(2)
        ref_type, label = _split_ref(ref)
        self.referenced_labels.add(label)
        bref = self.block_index.get_reference(label) if self.block_index else None
        if bref and (ref_type is None or bref.block.block_type.value == ref_type):
            block = bref.block
            is_synonym = getattr(bref, "is_synonym", False)
            css = "block-reference synonym-reference" if is_synonym else "block-reference"
            if custom_text.strip():
                text = custom_text
            elif is_synonym and getattr(bref, "synonym_title", None):
                text = bref.synonym_title
                if block.block_type == MathBlockType.DEFINITION:
                    text = text.lower()
            elif block.title:
                text = block.title
                if block.block_type == MathBlockType.DEFINITION and ref_type is None:
                    text = text.lower()
                text = html_lib.escape(text)
            else:
                text = html_lib.escape(block.content_snippet)
            return (f'<a href="{bref.full_url}" class="{css}" '
                    f'data-ref-type="{block.block_type.value}" '
                    f'data-ref-label="{label}">{text}</a>')
        shown = f"@{{{custom_text}|{ref}}}" if custom_text.strip() else f"@{ref}"
        return f'<span class="block-reference-error" data-ref="{html_lib.escape(ref, quote=True)}">{shown}</span>'

    # -- pagelink --

    def _resolve_pagelink(self, m) -> str:
        slug = html_lib.unescape(m.group(1))
        text = m.group(2)
        if not text.strip():
            text = html_lib.escape(slug.rsplit("/", 1)[-1].replace("-", " ").title())
        if "/" in slug:
            canonical = slug if slug.endswith("/") else slug + "/"
            return f'<a href="/mathnotes/{canonical}">{text}</a>'
        for url in self.url_mapper.url_mappings:
            if url == f"{slug}/" or url.endswith(f"/{slug}/"):
                return f'<a href="/mathnotes/{url}">{text}</a>'
        return f'<a href="#broken-link-{html_lib.escape(slug, quote=True)}">{text}</a>'

    # -- dembed --

    def _resolve_dembed(self, m) -> str:
        ref = html_lib.unescape(m.group(1))
        ref_type, label = _split_ref(ref)
        self.embedded_labels.add(label)
        bref = self.block_index.get_reference(label) if self.block_index else None
        if bref and (ref_type is None or bref.block.block_type.value == ref_type) \
                and bref.block.rendered_html:
            url = bref.full_url
            source_info = ""
            if url and not url.startswith("#"):
                source_info = (f'<div class="embedded-source">from '
                               f'<a href="{url}">{bref.page_title}</a></div>')
            return (f'<div class="embedded-block" data-embed-label="{label}">\n'
                    f"{bref.block.rendered_html}\n{source_info}\n</div>")
        return (f'<span class="embed-error" data-ref="{html_lib.escape(ref, quote=True)}">'
                f"\\dembed{{{ref}}} (not found)</span>")


def labels_from_rendered_html(html_content: str, exclude: Dict) -> Set[str]:
    """Labels referenced inside already-rendered block HTML that still need tooltip data."""
    return {m.group(1) for m in _REF_LABEL_RE.finditer(html_content)
            if m.group(1) not in exclude}
```

Behavior notes (deliberate, match old output): the old title-case default for `[[slug]]` was `slug.replace("-", " ").title()` — for section-prefixed slugs use the last path segment (old code title-cased the whole slug including the slash; nobody used prefixed slugs without text — verify in Task 10's diff). Definition titles lowercase only for auto text without an explicit type prefix, exactly as `_replace_simple_reference` did.

Delete `mathnotes/math_utils.py` and `mathnotes/tooltip_collector.py` (`git rm`-style delete is fine; do not commit).

- [ ] **Step 4: Run the tests**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_ref_resolver.py`
Expected: all pass.

---

### Task 5: `block_index.py` consumes `PageDoc`; `content_loader.py` goes .tex-only

**Files:**
- Modify: `mathnotes/block_index.py`
- Modify: `mathnotes/content_loader.py`
- Modify: `mathnotes/content_discovery.py`, `mathnotes/navigation.py`, `mathnotes/file_utils.py` (extension follow-through)

**Interfaces:**
- Consumes: `load_content_file -> (metadata, PageDoc)`; `RefResolver`; `render_block_html`; `CHILD_MARKER_RE`.
- Produces: `BlockIndex` public surface unchanged EXCEPT `get_rendered_html()` and `rendered_blocks` are deleted (pages read `block.rendered_html` directly — the PageDoc cache shares block objects across phases by design).

- [ ] **Step 1: Rewrite `mathnotes/content_loader.py`**

```python
"""Unified loader for content files.

Returns (metadata, PageDoc) for a .tex content file, cached by mtime (a full
build loads each file in several phases). The PageDoc — and the MathBlock
objects inside it — is deliberately shared between phases: the block index
sets block.rendered_html during its render phase and the page renderer reads
it. Markdown content is no longer supported.
"""

import os
from typing import Any, Dict, Tuple

from .structured_math import PageDoc

CONTENT_EXTENSIONS = (".tex",)

_tex_cache: Dict[str, Tuple[float, Dict[str, Any], PageDoc]] = {}


def clear_content_cache():
    _tex_cache.clear()


def load_content_file(filepath) -> Tuple[Dict[str, Any], PageDoc]:
    path = str(filepath)
    if not path.endswith(".tex"):
        raise ValueError(
            f"Markdown content is no longer supported: {path} — convert to .tex"
        )
    from .latex_processor import parse_latex_file

    mtime = os.path.getmtime(path)
    cached = _tex_cache.get(path)
    if cached and cached[0] >= mtime:
        return dict(cached[1]), cached[2]
    with open(path, "r", encoding="utf-8") as f:
        source = f.read()
    metadata, pagedoc = parse_latex_file(source, filepath=path)
    _tex_cache[path] = (mtime, metadata, pagedoc)
    return dict(metadata), pagedoc
```

- [ ] **Step 2: Extension follow-through**

- `content_discovery.py:24`: replace the glob line with a stray-markdown guard plus tex-only glob:
```python
            stray_md = sorted(section_path.rglob("*.md"))
            if stray_md:
                raise ValueError(
                    f"Markdown content is no longer supported: {stray_md[0]} — convert to .tex"
                )
            content_files = sorted(section_path.rglob("*.tex"))
```
- `file_utils.py:29` and `navigation.py:60`: `item.suffix in (".md", ".tex")` → `item.suffix == ".tex"`.
- Fix stale docstrings mentioning frontmatter/markdown in those files while there.

- [ ] **Step 3: Rewrite the four phases of `block_index.py`**

Header: drop `from markdown import Markdown`, `MathProtector`, `StructuredMathParser`; import `RefResolver` from `.ref_resolver`, `render_block_html`, `CHILD_MARKER_RE`, `MathBlock` from `.structured_math`. In `__init__`, delete `self.md` and `self.rendered_blocks`.

`_scan_directory`: `file.endswith((".md", ".tex"))` → `file.endswith(".tex")`.

`_index_file` — replace the parse with PageDoc consumption; registration logic stays identical:
```python
        metadata, pagedoc = load_content_file(file_path)
        page_title = metadata.get("title", None)
        top_blocks = pagedoc.top_blocks()
        all_blocks = [b for t in top_blocks for b in t.walk()]
        ...
        self._pending_files.append({
            "file_path": file_path,
            "canonical_url": canonical_url,
            "page_title": page_title,
            "pagedoc": pagedoc,
            "top_blocks": top_blocks,
        })
        for block in all_blocks:
            # (unchanged registration: BlockReference, all_blocks for parentless,
            #  normalized-label index, duplicate warning, reverse_index
            #  add_block_definition, synonym registration)
```

`_collect_all_references` — no re-load, no re-parse; walk the PageDoc:
```python
    def _collect_all_references(self):
        for file_info in self._pending_files:
            file_path = file_info["file_path"]
            canonical_url = file_info["canonical_url"]
            page_title = file_info.get("page_title", "")
            base_url = f"/mathnotes/{canonical_url}"

            page_resolver = RefResolver(self, self.url_mapper, current_file=file_path)
            for item in file_info["pagedoc"].items:
                if isinstance(item, str):
                    page_resolver.collect(item)
            for label in page_resolver.referenced_labels:
                self.reverse_index.add_reference(
                    referenced_label=label, source_file=file_path, source_label=None,
                    source_title=page_title, source_url=base_url, context="",
                    is_embed=False, is_from_block=False)
            for label in page_resolver.embedded_labels:
                self.reverse_index.add_reference(
                    referenced_label=label, source_file=file_path, source_label=None,
                    source_title=page_title, source_url=base_url, context="",
                    is_embed=True, is_from_block=False)

            for top in file_info["top_blocks"]:
                for block in top.walk():
                    r = RefResolver(self, self.url_mapper, current_file=file_path)
                    r.collect(block.body_html)
                    full_url = f"{base_url}#{block.label}"
                    for label in r.referenced_labels:
                        self.reverse_index.add_reference(
                            referenced_label=label, source_file=file_path,
                            source_label=block.label, source_title=block.title or block.label,
                            source_url=full_url, context="", is_embed=False)
                    for label in r.embedded_labels:
                        self.reverse_index.add_reference(
                            referenced_label=label, source_file=file_path,
                            source_label=block.label, source_title=block.title or block.label,
                            source_url=full_url, context="", is_embed=True)
```

`_render_all_blocks` — children-first over the real tree:
```python
    def _render_all_blocks(self):
        rendered = 0
        for file_info in self._pending_files:
            file_path = file_info["file_path"]
            base_url = f"/mathnotes/{file_info['canonical_url']}"

            def render_tree(block):
                nonlocal rendered
                for child in block.children:
                    render_tree(child)
                self._process_block_content(block, file_path, f"{base_url}#{block.label}")
                rendered += 1

            for top in file_info["top_blocks"]:
                render_tree(top)
        self._rendered_count = rendered
        del self._pending_files
```

`_process_block_content(self, block, file_path, full_url)` — replaces the old markdown pipeline (old lines 414–536). The "Referenced by" `<details>` section builder (old lines 468–534) is kept verbatim; only the front half changes:
```python
        resolver = RefResolver(self, self.url_mapper, current_file=file_path)
        content_html = resolver.resolve(block.body_html)

        # Tooltip content: this block's own content only, children removed
        block.content_html = CHILD_MARKER_RE.sub("", content_html).strip()

        rendered_html = render_block_html(block, content_html, full_url)
        # ... unchanged "Referenced by" section append ...
        block.rendered_html = rendered_html
```

Delete: `get_rendered_html`, `_fix_relative_image_paths`, all `MathProtector`/`Markdown` remnants. Update the build stats print to use `self._rendered_count`. In `_invalidate_stale_renders`, change the import to `from .page_renderer import invalidate_page_cache` and call `invalidate_page_cache(file_path)` (module created next task; block_index only imports it inside the method, so this file stays importable meanwhile).

- [ ] **Step 4: Import smoke check**

Run: `docker exec -w /app mathnotes-static-builder python3 -c "import mathnotes.block_index, mathnotes.content_loader, mathnotes.content_discovery; print('ok')"`
Expected: `ok`. (Functional verification lands with Task 7's integration tests.)

---

### Task 6: `page_renderer.py` and wiring (builder, pages, watcher)

**Files:**
- Create: `mathnotes/page_renderer.py`
- Delete: `mathnotes/markdown_processor.py`
- Modify: `mathnotes/sitegenerator/builder.py`, `mathnotes/sitegenerator/pages.py`, `scripts/watch_and_build.py`

**Interfaces:**
- Consumes: everything above.
- Produces: `class PageRenderer(url_mapper, block_index)` with `render_page(filepath) -> Optional[Dict]` returning the exact dict keys `markdown_processor` returned: `content, metadata, title, page_description, source_path, canonical_url, has_integrated_demos, tooltip_data`. Module functions `clear_page_cache()`, `invalidate_page_cache(filepath)`.

- [ ] **Step 1: Write `mathnotes/page_renderer.py`**

```python
"""Page assembly: PageDoc -> final page HTML.

Blocks were pre-rendered by the block index (block.rendered_html); prose
segments still hold reference placeholders, resolved here against the
complete index. No markdown, no text-marker schemes.
"""

import os
import re
from pathlib import Path
from typing import Dict, Optional

from .content_loader import load_content_file
from .ref_resolver import RefResolver, labels_from_rendered_html
from .structured_math import MathBlock

_render_cache: Dict[str, tuple] = {}  # filepath -> (mtime, result)


def clear_page_cache():
    _render_cache.clear()


def invalidate_page_cache(filepath: str):
    _render_cache.pop(filepath, None)


class PageRenderer:
    def __init__(self, url_mapper, block_index):
        self.url_mapper = url_mapper
        self.block_index = block_index

    def render_page(self, filepath: str) -> Optional[Dict]:
        try:
            current_mtime = os.path.getmtime(filepath)
            if filepath in _render_cache:
                cached_mtime, cached_result = _render_cache[filepath]
                if cached_mtime >= current_mtime:
                    return cached_result
        except OSError:
            pass

        metadata, pagedoc = load_content_file(filepath)
        resolver = RefResolver(self.block_index, self.url_mapper, current_file=filepath)

        parts = []
        for item in pagedoc.items:
            if isinstance(item, MathBlock):
                if item.rendered_html is None:
                    raise ValueError(
                        f"Block '{item.label}' has no rendered HTML — was the "
                        f"block index built? File: {filepath}"
                    )
                parts.append(item.rendered_html)
            else:
                parts.append(resolver.resolve(item))
        html_content = "\n".join(parts)

        tooltip_data = resolver.get_tooltip_data()
        extra = labels_from_rendered_html(html_content, tooltip_data)
        if extra:
            extra_resolver = RefResolver(self.block_index, self.url_mapper,
                                         current_file=filepath)
            extra_resolver.referenced_labels = extra
            tooltip_data.update(extra_resolver.get_tooltip_data())

        canonical_url = self.url_mapper.get_canonical_url(filepath.replace("\\", "/"))
        result = {
            "content": html_content,
            "metadata": metadata,
            "title": metadata.get("title", Path(filepath).stem.replace("-", " ").title()),
            "page_description": self._generate_description(metadata, html_content),
            "source_path": filepath,
            "canonical_url": f"/mathnotes/{canonical_url}",
            "has_integrated_demos": 'data-demo="' in html_content,
            "tooltip_data": tooltip_data,
        }
        try:
            _render_cache[filepath] = (os.path.getmtime(filepath), result)
        except OSError:
            pass
        return result

    def _generate_description(self, metadata: Dict, html_content: str) -> str:
        # ported unchanged from markdown_processor._generate_description
        description = metadata.get("description", "")
        if not description:
            clean = re.sub(r"<[^>]+>", "", html_content)
            clean = re.sub(r"\$\$[^$]+\$\$", "", clean)
            clean = re.sub(r"\$[^$]+\$", "", clean)
            clean = re.sub(r"\s+", " ", clean).strip()
            sentences = clean.split(". ")
            description = sentences[0]
            if len(description) > 160:
                description = description[:157] + "..."
            elif not description.endswith("."):
                description += "."
        return description
```

Delete `mathnotes/markdown_processor.py`.

- [ ] **Step 2: Rewire the sitegenerator**

- `builder.py`: `from mathnotes.page_renderer import PageRenderer`; `self.page_renderer = PageRenderer(self.url_mapper, self.block_index)`; site_context key `"page_renderer": self.page_renderer` (drop `"markdown_processor"`).
- `pages.py:42`: `self.page_renderer = site_context.get("page_renderer")`; `pages.py:162`: `result = self.page_renderer.render_page(md_path)` (rename the local `md_path` to `content_path` while there); update the two docstrings mentioning `markdown_processor`.
- `scripts/watch_and_build.py:19`: `from mathnotes.page_renderer import clear_page_cache` and update its call site (grep for `clear_markdown_cache` in the file).

- [ ] **Step 3: Full-site smoke build**

Run: `docker exec -w /app mathnotes-static-builder python3 scripts/build_static_simple.py --output site-new`
Expected: `Build complete!` with a page count matching Task 0 Step 5. This is the first end-to-end run of the new pipeline — fix whatever surfaces before moving on (missing imports, attribute names). The three pages using the `\dref{embed}` hack will show `block-reference-error` spans for the label `embed`; that is expected until Task 8.

---

### Task 7: Rewrite the integration-level tests

**Files:**
- Modify: `test/test_latex_integration.py` (rewrite), `test/test_cache_invalidation.py`, `test/test_reference_snippets.py`
- Delete: `test/block-references-test.md`, `test/structured-math-test.md` (dead fixtures, referenced by nothing)

**Interfaces:**
- Consumes: the full new pipeline.

- [ ] **Step 1: Rewrite `test/test_latex_integration.py`**

Keep `in_temp_site` and the `fresh_pipeline` shape, importing `PageRenderer`/`clear_page_cache` from `mathnotes.page_renderer`. Replace the cross-format test with .tex-only end-to-end. Fixtures: two `.tex` pages where page B's theorem `\dref`s page A's definition and its synonym, page A `\dembed`s page B's theorem, plus `\includedemo` and `\pagelink`:

```python
PAGE_A = r"""\title{Page A}
\begin{definition}[Gizmo]\label{gizmo}\synonyms{gadget}
A gizmo is a thing.
\end{definition}

Review: \dembed{b-thm}

See \pagelink{page-b} and a demo: \includedemo{pendulum}
"""

PAGE_B = r"""\title{Page B}
\description{Fixture.}
\source{title={Test Book}, author={A. Author}, type=book}

\section{Main}

\begin{theorem}\label{b-thm}
Every \dref{gizmo} and every \dref{gadgets} is fine.
\end{theorem}
\begin{proof}
Trivial.
\end{proof}
"""
```

Assertions (in one test body, after building the pipeline and rendering both pages):
- `discovery.url_mappings` contains `test/page-a/` and `test/page-b/`.
- Page B content: `id="b-thm"`, `id="proof-of-b-thm"`, `$\square$`, a `block-reference` link to `/mathnotes/test/page-a/#gizmo`, a `synonym-reference` link (from `\dref{gadgets}`, the auto-plural of the manual synonym `gadget`), heading `<h1 id="main">Main</h1>`, no `block-reference-error`, `metadata["sources"] == [{"title": "Test Book", "author": "A. Author", "type": "book"}]`.
- Page A content: `embedded-block` div containing `id="b-thm"` and an `embedded-source` link to page B; a pagelink `<a href="/mathnotes/test/page-b/">Page B</a>`; `has_integrated_demos` is True and `data-demo="pendulum"` present; `tooltip_data` has an entry for `b-thm`.
- `get_page_title(Path("content/test/page-b.tex")) == "Page B"`.

Keep `test_url_collision_errors` (two `.tex` files colliding — adapt the old test's fixture to two .tex files with the same `\slug`). Add:

```python
def test_markdown_content_rejected():
    def check(td):
        with open("content/test/legacy.md", "w") as f:
            f.write("# Old\n")
        try:
            fresh_pipeline()
            assert False, "expected a build error for stray .md content"
        except ValueError as e:
            assert "no longer supported" in str(e) and "legacy.md" in str(e)
    in_temp_site(check)
```

- [ ] **Step 2: Update `test/test_cache_invalidation.py`**

Mechanical port, same scenarios: change imports to `from mathnotes.page_renderer import PageRenderer, clear_page_cache`; `MarkdownProcessor(...)` → `PageRenderer(...)`; `render_markdown_file` → `render_page`; `clear_markdown_cache()` → `clear_page_cache()`. Convert its inline fixtures from `.md` frontmatter/`:::` syntax to `.tex` (`\title{...}` + `\begin{definition}[T]\label{l}...\end{definition}`, referencing page uses `\dref{...}`), filenames `.md` → `.tex`. The invalidation semantics under test are unchanged.

- [ ] **Step 3: Update `test/test_reference_snippets.py`**

Unit part: construct blocks via `body_html` + `body_text` (as in Task 1's test helper) instead of dialect strings; the assertion — auto-ref link text inside a snippet flattens to plain words — now targets `body_text`/`content_snippet`. Pipeline part: convert the fixture pages to `.tex`, imports to `PageRenderer`/`render_page`/`clear_page_cache`.

- [ ] **Step 4: Run everything**

Run:
```bash
docker exec -i mathnotes-static-builder python3 - < test/test_structured_math.py
docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py
docker exec -i mathnotes-static-builder python3 - < test/test_ref_resolver.py
docker exec -i mathnotes-static-builder python3 - < test/test_latex_integration.py
docker exec -i -w /app mathnotes-static-builder python3 - < test/test_cache_invalidation.py
docker exec -i mathnotes-static-builder python3 - < test/test_reference_snippets.py
docker exec -i mathnotes-static-builder python3 - < test/test_watcher.py
```
Expected: all green.

---

### Task 8: `\dembed` in the dialect proper

**Files:**
- Modify: `latex/mathnotes.sty`, `latex/README.md`
- Modify: `content/analysis/sequences.tex:13`, `content/topology/perfect-sets-and-more.tex:17`, `content/topology/connected-sets.tex:25`

**Interfaces:**
- Consumes: the `\dembed` parser support added in Task 2.

- [ ] **Step 1: Add the macro to `latex/mathnotes.sty`** (next to `\dref`/`\pagelink`):

```latex
% Transclude a block: the site embeds the target block's full content here.
% In PDF output it degrades to a pointer.
\NewDocumentCommand{\dembed}{m}{\begin{quote}\emph{[Embedded: \hyperref[#1]{#1}]}\end{quote}}
```

- [ ] **Step 2: Convert the three hack sites**

In each of the three files, replace the line `\dref{embed}\{LABEL\}` with `\dembed{LABEL}` (labels: `sequence`, `perfect-set`, `connected-complex` respectively). These are the only content edits in this project.

- [ ] **Step 3: Document the macro in `latex/README.md`** — one row/paragraph alongside `\dref`/`\pagelink`: `\dembed{label}` transclude a block's full content.

- [ ] **Step 4: Verify**

Run: `docker exec -w /app mathnotes-static-builder python3 scripts/build_static_simple.py --output site-new && grep -c "embedded-block" site-new/mathnotes/analysis/sequences/index.html`
Expected: build succeeds; count ≥ 1. Also `grep -rn "block-reference-error" site-new/mathnotes/analysis/sequences/index.html` returns nothing.

---

### Task 9: Deletions and dependency sweep

**Files:**
- Delete: `scripts/md_to_tex.py`
- Modify: `scripts/find_unstructured_definitions.py`, `requirements.in`, `requirements.txt`

- [ ] **Step 1: Delete `scripts/md_to_tex.py`** (migration tool; migration finished, round-trip target no longer exists).

- [ ] **Step 2: Rewrite `scripts/find_unstructured_definitions.py` to scan `.tex` source directly**

Keep the report/summary machinery (lines 147–211) as-is. Changes: glob only `*.tex`; drop the transpile import — analyze the raw source so line numbers are real source lines; replace the pattern table with tex-form patterns and the block/code detectors with environment-aware ones:

```python
DEFINITION_PATTERNS = [
    (re.compile(r'\\textbf\{([^}]+)\}\s+(is|are)\s+', re.IGNORECASE), 'bold_is'),
    (re.compile(r'(is|are)\s+called\s+(a|an|the)?\s*\\textbf\{([^}]+)\}', re.IGNORECASE), 'is_called_bold'),
    (re.compile(r'(is|are)?\s*(defined|define)\s+(as|by|to be)\s+', re.IGNORECASE), 'defined_as'),
    (re.compile(r'denoted\s+(by|as)\s+', re.IGNORECASE), 'denoted_by'),
    (re.compile(r'^(Definition|Def\.?)\s*[-:]?\s*', re.IGNORECASE | re.MULTILINE), 'definition_label'),
    (re.compile(r'(We\s+say\s+that|We\s+call)\s+', re.IGNORECASE), 'we_say_call'),
    (re.compile(r'Let\s+\$[^$]+\$\s+be\s+(a|an)\s+', re.IGNORECASE), 'let_be'),
]

def _is_in_definition_block(self, lines, line_idx):
    depth = 0
    for i in range(line_idx + 1):
        depth += lines[i].count(r'\begin{definition}')
        depth -= lines[i].count(r'\end{definition}')
    return depth > 0

def _is_in_code_block(self, lines, line_idx):
    depth = 0
    for i in range(line_idx + 1):
        for env in ('verbatim', 'lstlisting'):
            depth += lines[i].count(f'\\begin{{{env}}}')
            depth -= lines[i].count(f'\\end{{{env}}}')
    return depth > 0
```

Update the module docstring (no more transpiled-line caveat).

- [ ] **Step 3: Remove dead dependencies**

- `requirements.in`: delete the `Markdown`, `python-markdown-math`, `python-frontmatter` lines.
- `requirements.txt`: delete `Markdown==3.8.2`, `python-markdown-math==0.9`, `python-frontmatter==1.1.0`.

- [ ] **Step 4: Sweep for stragglers**

Run: `grep -rn "import markdown\|from markdown\|import frontmatter\|markdown_processor\|MathProtector\|tooltip_collector\|StructuredMathParser\|@embed\|include_demo" mathnotes/ scripts/ test/ --include="*.py"`
Expected: no hits (comments/docstrings included — fix any). Also check `mathnotes/reverse_index.py`: if `collect_references_from_content` has no remaining callers (it should have none — Task 5 collects via RefResolver), delete that method and its regexes.

Run: `docker exec -w /app mathnotes-static-builder python3 scripts/find_unstructured_definitions.py`
Expected: completes, writes report (finding counts may differ from before; that's fine).

---

### Task 10: Semantic diff harness — prove equivalence against the baseline

**Files:**
- Create: `scripts/semantic_diff.py`

**Interfaces:**
- Consumes: `site-baseline/` (Task 0), `site-new/` (rebuilt here).

- [ ] **Step 1: Write `scripts/semantic_diff.py`**

Stdlib-only. For every `index.html` under each root, extract a semantic summary and compare:

```python
#!/usr/bin/env python3
"""Semantic diff of two generated site trees.

Compares what pages MEAN, not their markup: title/description, heading
texts, math-block structure (type/label/title/nesting), math expressions,
reference targets, link hrefs, image sources, demo names, and normalized
visible text. Whitespace, tag choice, attribute order, heading ids, and
demo element ids are invisible.

Usage: python3 scripts/semantic_diff.py site-baseline site-new
"""

import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

MATH_RE = re.compile(r"\$\$.*?\$\$|\$[^$]+?\$", re.DOTALL)


class Extractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.headings = []      # (level, text)
        self.blocks = []        # (depth, type-class, data-label, title-text)
        self.refs = []          # data-ref-label of block-reference links
        self.links = []         # internal hrefs (deduped, sorted at the end)
        self.imgs = []
        self.demos = []
        self.text_parts = []
        self._stack = []        # open heading/title tracking
        self._block_depth = 0
        self._skip = 0          # inside <script>/<style>

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("script", "style"):
            self._skip += 1
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self._stack.append(("h", tag, []))
        if tag == "title":
            self._stack.append(("title", tag, []))
        cls = a.get("class", "")
        if tag == "div" and "math-block " in cls + " ":
            btype = [c for c in cls.split() if c.startswith("math-") and c != "math-block"]
            self.blocks.append((self._block_depth, " ".join(btype), a.get("data-label", "")))
            self._block_depth += 1
        if "block-reference" in cls:
            self.refs.append((a.get("data-ref-label", ""), a.get("href", "")))
        if tag == "a" and a.get("href", "").startswith(("/mathnotes", "#")):
            self.links.append(a["href"])
        if tag == "img":
            self.imgs.append(a.get("src", ""))
        if a.get("data-demo"):
            self.demos.append(a["data-demo"])
        if a.get("data-embed-label"):
            self.refs.append(("EMBED:" + a["data-embed-label"], ""))

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self._skip:
            self._skip -= 1
        if self._stack and self._stack[-1][1] == tag:
            kind, _, parts = self._stack.pop()
            text = " ".join("".join(parts).split())
            if kind == "h":
                self.headings.append((tag, text))
            else:
                self.title = text
        if tag == "div" and self._block_depth:
            # imprecise for generic divs; block nesting is captured via order+depth at start
            pass

    def handle_data(self, data):
        if self._skip:
            return
        if self._stack:
            self._stack[-1][2].append(data)
        self.text_parts.append(data)


def summarize(path: Path) -> dict:
    src = path.read_text(encoding="utf-8")
    ex = Extractor()
    ex.feed(src)
    text = " ".join("".join(ex.text_parts).split())
    math = sorted(" ".join(m.split()) for m in MATH_RE.findall(text))
    prose = " ".join(MATH_RE.sub(" ", text).split())
    return {
        "title": ex.title,
        "headings": [t for _, t in ex.headings],
        "blocks": ex.blocks,
        "refs": sorted(ex.refs),
        "links": sorted(set(ex.links)),
        "imgs": sorted(ex.imgs),
        "demos": sorted(ex.demos),
        "math": math,
        "text": prose,
    }


def main(old_root, new_root):
    old_root, new_root = Path(old_root), Path(new_root)
    old_pages = {p.relative_to(old_root) for p in old_root.rglob("index.html")}
    new_pages = {p.relative_to(new_root) for p in new_root.rglob("index.html")}
    diffs = 0
    for missing in sorted(old_pages - new_pages):
        print(f"MISSING in new: {missing}"); diffs += 1
    for extra in sorted(new_pages - old_pages):
        print(f"EXTRA in new: {extra}"); diffs += 1
    for page in sorted(old_pages & new_pages):
        a, b = summarize(old_root / page), summarize(new_root / page)
        for key in a:
            if a[key] != b[key]:
                diffs += 1
                print(f"\n=== {page} :: {key} ===")
                print(f"  old: {json.dumps(a[key])[:800]}")
                print(f"  new: {json.dumps(b[key])[:800]}")
    print(f"\n{'CLEAN' if not diffs else str(diffs) + ' differences'} "
          f"across {len(old_pages & new_pages)} shared pages")
    return 1 if diffs else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
```

- [ ] **Step 2: Build and compare**

Run:
```bash
docker exec -w /app mathnotes-static-builder python3 scripts/build_static_simple.py --output site-new
docker exec -w /app mathnotes-static-builder python3 scripts/semantic_diff.py site-baseline site-new
```
Expected: NOT clean on the first run. Triage every reported difference into:
1. **Bug in the new pipeline** → fix, re-run.
2. **Known-accepted change** (this list is exhaustive; anything else is category 1):
   - the three `\dembed` pages: error-span text → embedded block (Task 8's improvement);
   - heading `id` slugs (algorithm changed) — invisible to the diff by design, but `links` may show `#fragment` churn for in-page heading anchors;
   - demo element ids (invisible by design);
   - `&#36;`/entity representation differences that normalize away (invisible via `convert_charrefs`);
   - auto-numbered anonymous-block labels (`remark-N` etc.) IF any page shows a shifted N — verify each is genuinely an anonymous block, not a labeled one.
3. **Harness noise** (extractor bug) → fix the harness.

Iterate until the output is CLEAN or every remaining line is category 2. Record the accepted category-2 list in the task summary for the user's visual inspection.

- [ ] **Step 3: Spot-check math protection edge cases**

The old pipeline's most fragile spot was math-vs-markdown interaction. Verify on real pages that math with `<`, `_`, `*`, `\\` renders identically:

Run: `docker exec -w /app mathnotes-static-builder python3 -c "
import re, pathlib
for p in ['mathnotes/topology/compact-sets/index.html',
          'mathnotes/applied-math/information-theory/01-discrete-entropy/index.html']:
    old = pathlib.Path('site-baseline', p).read_text()
    new = pathlib.Path('site-new', p).read_text()
    om = sorted(re.findall(r'\\\$[^\$]+\\\$', old))
    nm = sorted(re.findall(r'\\\$[^\$]+\\\$', new))
    import html
    print(p, 'MATH OK' if [html.unescape(x) for x in om] == [html.unescape(x) for x in nm] else 'MATH DIFFERS')
"`
Expected: `MATH OK` for both.

---

### Task 11: Full verification and docs

**Files:**
- Modify: `CLAUDE.md`, `PARSING.md`, `latex/README.md` (if not already), `docs` references

- [ ] **Step 1: Full test sweep** — run every file in `test/` as in Task 7 Step 4. Expected: all green.

- [ ] **Step 2: Dev-server crawl for runtime errors**

Ensure the dev stack is up (`docker-compose -f docker-compose.dev.yml up -d`), then run the site crawl per the crawl-site skill / `./scripts/crawl-dev.sh "http://web-dev:5000"`. Expected: no console errors, no CSP violations (MathJax config untouched, so math must render — spot-check a theorem-heavy page and one demo page in the report).

- [ ] **Step 3: Production build check**

Run: `docker-compose up --build` (then Ctrl-C / down after success). Expected: multi-stage build completes — this proves the requirements changes are consistent (no module left importing markdown/frontmatter).

- [ ] **Step 4: pdflatex compilability spot-check** (standing constraint)

If `pdflatex` is available on the host: compile `content/analysis/sequences.tex` (one of the `\dembed` edits) per `latex/README.md`'s documented invocation. Expected: compiles; `\dembed` renders its quote-block pointer. If no host TeX, note it for the user's visual-inspection pass instead of skipping silently.

- [ ] **Step 5: Update docs**

- `CLAUDE.md` — "Content pipeline" paragraph: describe `.tex → PageDoc (prose HTML + MathBlock trees) → block index → page renderer`; remove mentions of the internal markdown dialect, `:::` blocks, `@label` refs as an intermediate, and `scripts/md_to_tex.py`; keep the "loud build errors, extend deliberately" sentence. Also update the "Markdown Processing" / architecture bullet list (items 3–4 under Processing Components) to name `page_renderer.py` and `ref_resolver.py`.
- `PARSING.md` — rewrite to describe the new pipeline (parse → index → resolve → assemble; placeholder grammar; math seam; no protection phases).
- `latex/README.md` — confirm `\dembed` documented (Task 8) and remove any "transpiles to markdown" phrasing.

- [ ] **Step 6: Final report to the user**

Summarize: test results, semantic-diff accepted-differences list, crawl result, and point to `site-new`/dev server for the visual inspection that gates Part 2. Do not commit.

---

## Self-Review (completed)

- **Spec coverage:** direct parse (T2–3), placeholder resolution (T4), phases (T5–6), `.md` rejection (T5/T7), `\dembed` + 3 content edits (T8), deletions + deps (T9), semantic diff + tests + crawl (T10–11), math seam (T1 Step 3, used by T2 `_math` and proof QED), docs (T11). Non-goal guarded: no `.tex` edits outside T8.
- **Type consistency:** `parse_latex_file -> (Dict, PageDoc)` everywhere; `render_block_html(block, content_html, url)`; `RefResolver(block_index, url_mapper, current_file)`; `render_page` dict keys match old `render_markdown_file` keys (pages.py contract).
- **Known judgment calls encoded above:** pre-order counter reproduces old auto-numbering (argued in T1); heading-id algorithm change accepted; demo ids accepted; pagelink default text uses last path segment.
