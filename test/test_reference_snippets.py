"""Regression test: auto-generated reference link text must not leak refs.

When a title-less block is referenced with \\dref{label}, the link text
falls back to the target block's content_snippet. If the target's content
itself starts with cross-references (e.g. "The $\\log$ [function] is
[concave], ..."), those nested @dref placeholders must be flattened to
plain text, not left literally in the link.

Run standalone (no pytest needed):
    python3 test/test_reference_snippets.py
or inside the dev builder container:
    docker exec -i -w /app mathnotes-static-builder python3 - < test/test_reference_snippets.py
"""

import os
import sys
import tempfile

try:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
except NameError:
    pass  # running via stdin; cwd must be the repo/app root

from mathnotes.structured_math import MathBlock, MathBlockType, body_text

DEFINING = r"""\title{Defining Page}

\begin{definition}[Function]
A rule assigning outputs to inputs.
\end{definition}

\begin{definition}[Concave Function]\label{concave}
A function is concave if its negative is convex.
\end{definition}

\begin{theorem}\label{log-is-concave}
The $\log$ \dref{function} is \dref{concave}, i.e. $-\log$ is convex.
\end{theorem}
"""

REFERENCING = r"""\title{Referencing Page}

Because \dref{log-is-concave}, we are happy.
"""


def blk(t, title=None, label=None, body_html="", metadata=None):
    """Construct a MathBlock the way latex_processor does: content is derived
    from body_html via body_text(), not authored separately."""
    b = MathBlock(block_type=MathBlockType(t), content=body_text(body_html),
                  title=title, label=label, metadata=metadata or {})
    b.body_html = body_html
    return b


def test_content_snippet_flattens_references():
    block = blk("theorem", label="log-is-concave",
                body_html='<p>The $\\log$ <a data-dref="function"></a> is '
                          '<a data-dref="concave"></a>, i.e. $-\\log$ is convex.</p>')
    snippet = block.content_snippet
    assert "@" not in snippet, f"snippet leaks raw @refs: {snippet!r}"
    assert "function" in snippet and "concave" in snippet, (
        f"snippet should keep the reference text as plain words: {snippet!r}"
    )


def test_content_snippet_flattens_custom_and_typed_references():
    block = blk("theorem", label="typed-refs",
                body_html='<p>By <a data-dref="chain-rule">the chain rule</a> and '
                          '<a data-dref="theorem:mvt"></a> we win.</p>')
    snippet = block.content_snippet
    assert "@" not in snippet, f"snippet leaks raw @refs: {snippet!r}"
    assert "the chain rule" in snippet, f"custom link text lost: {snippet!r}"
    assert "mvt" in snippet, f"typed ref not flattened: {snippet!r}"


def test_rendered_link_text_has_no_raw_references():
    from mathnotes.content_discovery import ContentDiscovery
    from mathnotes.block_index import BlockIndex
    from mathnotes.page_renderer import PageRenderer, clear_page_cache
    from mathnotes.content_loader import clear_content_cache

    old_cwd = os.getcwd()
    with tempfile.TemporaryDirectory() as tmp:
        os.chdir(tmp)
        try:
            os.makedirs("content/test")
            with open("content/test/defining.tex", "w") as f:
                f.write(DEFINING)
            with open("content/test/referencing.tex", "w") as f:
                f.write(REFERENCING)

            clear_page_cache()
            clear_content_cache()
            url_mapper = ContentDiscovery()
            url_mapper.build_url_mappings()
            block_index = BlockIndex(url_mapper)
            block_index.build_index()
            processor = PageRenderer(url_mapper, block_index)

            result = processor.render_page("content/test/referencing.tex")
            html = result["content"]
            assert 'data-ref-label="log-is-concave"' in html, (
                "sanity check failed: reference did not resolve"
            )
            assert "@function" not in html and "@concave" not in html, (
                f"raw @refs leaked into rendered link text: {html}"
            )
        finally:
            os.chdir(old_cwd)
            clear_page_cache()
            clear_content_cache()


if __name__ == "__main__":
    test_content_snippet_flattens_references()
    print("PASS: content_snippet flattens simple references")
    test_content_snippet_flattens_custom_and_typed_references()
    print("PASS: content_snippet flattens custom and typed references")
    test_rendered_link_text_has_no_raw_references()
    print("PASS: rendered link text has no raw references")
