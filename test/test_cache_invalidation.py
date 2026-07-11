"""Regression test: cross-file reference cache invalidation.

When a definition is added/changed in file B, the cached render of file A
that references it must be invalidated, even though A's mtime is unchanged.
This mirrors the incremental rebuild path in scripts/watch_and_build.py.

Run standalone (no pytest needed):
    python3 test/test_cache_invalidation.py
or inside the dev builder container:
    docker exec -i -w /app mathnotes-static-builder python3 - < test/test_cache_invalidation.py
"""

import os
import sys
import tempfile
import time

try:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
except NameError:
    pass  # running via stdin; cwd must be the repo/app root

from mathnotes.content_discovery import ContentDiscovery
from mathnotes.block_index import BlockIndex
from mathnotes.page_renderer import PageRenderer, clear_page_cache

REFERENCING = r"""\title{Referencing Page}

The \dref{my-test-def} is referenced here.
"""

DEFINING_BEFORE = r"""\title{Defining Page}

Nothing here yet.
"""

DEFINING_AFTER = r"""\title{Defining Page}

\begin{definition}[My Test Def]\label{my-test-def}
The definition body.
\end{definition}
"""


def incremental_rebuild(url_mapper, block_index):
    """Same steps as the reused-builder path in scripts/watch_and_build.py."""
    url_mapper.build_url_mappings()
    block_index.build_index()


def test_new_definition_invalidates_referencing_page():
    old_cwd = os.getcwd()
    with tempfile.TemporaryDirectory() as tmp:
        os.chdir(tmp)
        try:
            os.makedirs("content/test")
            with open("content/test/referencing.tex", "w") as f:
                f.write(REFERENCING)
            with open("content/test/defining.tex", "w") as f:
                f.write(DEFINING_BEFORE)

            clear_page_cache()
            url_mapper = ContentDiscovery()
            url_mapper.build_url_mappings()
            block_index = BlockIndex(url_mapper)
            block_index.build_index()
            processor = PageRenderer(url_mapper, block_index)

            result = processor.render_page("content/test/referencing.tex")
            assert "block-reference-error" in result["content"], (
                "sanity check failed: reference should be broken before the definition exists"
            )

            # Add the definition; referencing.tex is left untouched so its
            # mtime-keyed cache entry would be reused without invalidation.
            with open("content/test/defining.tex", "w") as f:
                f.write(DEFINING_AFTER)
            future = time.time() + 1
            os.utime("content/test/defining.tex", (future, future))

            incremental_rebuild(url_mapper, block_index)

            result = processor.render_page("content/test/referencing.tex")
            assert "block-reference-error" not in result["content"], (
                "stale cache: referencing page still shows a broken reference "
                "after the definition was added in another file"
            )
        finally:
            os.chdir(old_cwd)
            clear_page_cache()


def test_removed_definition_invalidates_referencing_page():
    old_cwd = os.getcwd()
    with tempfile.TemporaryDirectory() as tmp:
        os.chdir(tmp)
        try:
            os.makedirs("content/test")
            with open("content/test/referencing.tex", "w") as f:
                f.write(REFERENCING)
            with open("content/test/defining.tex", "w") as f:
                f.write(DEFINING_AFTER)

            clear_page_cache()
            url_mapper = ContentDiscovery()
            url_mapper.build_url_mappings()
            block_index = BlockIndex(url_mapper)
            block_index.build_index()
            processor = PageRenderer(url_mapper, block_index)

            result = processor.render_page("content/test/referencing.tex")
            assert "block-reference-error" not in result["content"], (
                "sanity check failed: reference should resolve while the definition exists"
            )

            with open("content/test/defining.tex", "w") as f:
                f.write(DEFINING_BEFORE)
            future = time.time() + 1
            os.utime("content/test/defining.tex", (future, future))

            incremental_rebuild(url_mapper, block_index)

            result = processor.render_page("content/test/referencing.tex")
            assert "block-reference-error" in result["content"], (
                "stale cache: referencing page still shows a working reference "
                "after the definition was removed"
            )
        finally:
            os.chdir(old_cwd)
            clear_page_cache()


def test_url_mappings_drop_deleted_files():
    """Deleted files must disappear from URL mappings on rebuild, or the
    incremental build crashes trying to render a file that no longer exists."""
    old_cwd = os.getcwd()
    with tempfile.TemporaryDirectory() as tmp:
        os.chdir(tmp)
        try:
            os.makedirs("content/test")
            with open("content/test/keep.tex", "w") as f:
                f.write(DEFINING_BEFORE)
            with open("content/test/doomed.tex", "w") as f:
                f.write(DEFINING_BEFORE)

            url_mapper = ContentDiscovery()
            url_mapper.build_url_mappings()
            assert url_mapper.get_canonical_url("content/test/doomed.tex") is not None

            os.remove("content/test/doomed.tex")
            url_mapper.build_url_mappings()

            assert url_mapper.get_canonical_url("content/test/doomed.tex") is None, (
                "stale URL mapping: deleted file still present after rebuild"
            )
            assert url_mapper.get_canonical_url("content/test/keep.tex") is not None
        finally:
            os.chdir(old_cwd)


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


if __name__ == "__main__":
    test_new_definition_invalidates_referencing_page()
    print("PASS: new definition invalidates referencing page")
    test_removed_definition_invalidates_referencing_page()
    print("PASS: removed definition invalidates referencing page")
    test_url_mappings_drop_deleted_files()
    print("PASS: deleted files drop out of URL mappings")
    test_notation_change_invalidates_all_pages()
    print("PASS: notation change invalidates all pages")
