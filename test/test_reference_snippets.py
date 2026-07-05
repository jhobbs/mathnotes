"""Regression test: auto-generated reference link text must not leak @refs.

When a title-less block is referenced with @label, the link text falls back
to the target block's content_snippet. If the target's content itself starts
with cross-references (e.g. "The $\\log$ @function is @concave, ..."), those
@tokens must be flattened to plain text, not left literally in the link.

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

from mathnotes.structured_math import MathBlock, MathBlockType

DEFINING = """---
title: Defining Page
---

:::definition "Function"
A rule assigning outputs to inputs.
:::

:::definition "Concave Function" {label: concave}
A function is concave if its negative is convex.
:::

:::theorem {label: log-is-concave}
The $\\log$ @function is @concave, i.e. $-\\log$ is convex.
:::
"""

REFERENCING = """---
title: Referencing Page
---

Because @log-is-concave, we are happy.
"""


def test_content_snippet_flattens_references():
    block = MathBlock(
        block_type=MathBlockType.THEOREM,
        content="The $\\log$ @function is @concave, i.e. $-\\log$ is convex.",
        label="log-is-concave",
    )
    snippet = block.content_snippet
    assert "@" not in snippet, f"snippet leaks raw @refs: {snippet!r}"
    assert "function" in snippet and "concave" in snippet, (
        f"snippet should keep the reference text as plain words: {snippet!r}"
    )


def test_content_snippet_flattens_custom_and_typed_references():
    block = MathBlock(
        block_type=MathBlockType.THEOREM,
        content="By @{the chain rule|chain-rule} and @theorem:mvt we win.",
        label="typed-refs",
    )
    snippet = block.content_snippet
    assert "@" not in snippet, f"snippet leaks raw @refs: {snippet!r}"
    assert "the chain rule" in snippet, f"custom link text lost: {snippet!r}"
    assert "mvt" in snippet, f"typed ref not flattened: {snippet!r}"


def test_rendered_link_text_has_no_raw_references():
    from mathnotes.content_discovery import ContentDiscovery
    from mathnotes.block_index import BlockIndex
    from mathnotes.markdown_processor import MarkdownProcessor, clear_markdown_cache

    old_cwd = os.getcwd()
    with tempfile.TemporaryDirectory() as tmp:
        os.chdir(tmp)
        try:
            os.makedirs("content/test")
            with open("content/test/defining.md", "w") as f:
                f.write(DEFINING)
            with open("content/test/referencing.md", "w") as f:
                f.write(REFERENCING)

            clear_markdown_cache()
            url_mapper = ContentDiscovery()
            url_mapper.build_url_mappings()
            block_index = BlockIndex(url_mapper)
            block_index.build_index()
            processor = MarkdownProcessor(url_mapper, block_index)

            result = processor.render_markdown_file("content/test/referencing.md")
            html = result["content"]
            assert 'data-ref-label="log-is-concave"' in html, (
                "sanity check failed: reference did not resolve"
            )
            assert "@function" not in html and "@concave" not in html, (
                f"raw @refs leaked into rendered link text: {html}"
            )
        finally:
            os.chdir(old_cwd)
            clear_markdown_cache()


if __name__ == "__main__":
    test_content_snippet_flattens_references()
    print("PASS: content_snippet flattens simple references")
    test_content_snippet_flattens_custom_and_typed_references()
    print("PASS: content_snippet flattens custom and typed references")
    test_rendered_link_text_has_no_raw_references()
    print("PASS: rendered link text has no raw references")
