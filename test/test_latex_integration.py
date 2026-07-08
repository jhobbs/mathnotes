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
