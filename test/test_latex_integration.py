"""End-to-end test: two .tex pages exercise the full pipeline together.

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
    from mathnotes.page_renderer import PageRenderer, clear_page_cache
    from mathnotes.content_loader import clear_content_cache
    from mathnotes.navigation import clear_navigation_cache

    clear_page_cache()
    clear_content_cache()
    clear_navigation_cache()
    discovery = ContentDiscovery()
    discovery.build_url_mappings()
    index = BlockIndex(discovery)
    index.build_index()
    return discovery, index, PageRenderer(discovery, index)


def test_tex_pages_end_to_end():
    def check(td):
        with open("content/test/page-a.tex", "w") as f:
            f.write(PAGE_A)
        with open("content/test/page-b.tex", "w") as f:
            f.write(PAGE_B)

        discovery, index, renderer = fresh_pipeline()
        assert "test/page-a/" in discovery.url_mappings
        assert "test/page-b/" in discovery.url_mappings

        b = renderer.render_page("content/test/page-b.tex")
        b_html = b["content"]
        assert 'id="b-thm"' in b_html
        assert 'id="proof-of-b-thm"' in b_html
        assert 'alttext="\\square"' in b_html
        assert ('<a href="/mathnotes/test/page-a/#gizmo" class="block-reference" '
                'data-ref-type="definition" data-ref-label="gizmo">') in b_html
        assert 'class="block-reference synonym-reference"' in b_html
        assert 'data-ref-label="gadgets"' in b_html
        assert '<h1 id="main">Main</h1>' in b_html
        assert "block-reference-error" not in b_html
        assert b["metadata"]["sources"] == [
            {"title": "Test Book", "author": "A. Author", "type": "book"}
        ]

        a = renderer.render_page("content/test/page-a.tex")
        a_html = a["content"]
        assert '<div class="embedded-block" data-embed-label="b-thm">' in a_html
        assert 'id="b-thm"' in a_html
        assert 'class="embedded-source"' in a_html
        assert "/mathnotes/test/page-b/" in a_html
        assert '<a href="/mathnotes/test/page-b/">Page B</a>' in a_html
        assert a["has_integrated_demos"] is True
        assert 'data-demo="pendulum"' in a_html
        # b-thm is dembed'd (fully inlined), so it never becomes a hoverable
        # @dref link and gets no tooltip entry of its own. But the embedded
        # content still contains b-thm's own @dref links to gizmo/gadgets,
        # and those nested references *do* need tooltip data (see the
        # labels_from_rendered_html pass in page_renderer.render_page).
        assert "gizmo" in a["tooltip_data"]

        from pathlib import Path
        from mathnotes.navigation import get_page_title
        assert get_page_title(Path("content/test/page-b.tex")) == "Page B"

    in_temp_site(check)


PAGE_C = r"""\title{Page C}
\begin{definition}[Widget]\label{widget}
A widget is a thing.
\end{definition}
"""

PAGE_D = r"""\title{Page D}
\begin{example}[Left Cosets of $3\mathbb{Z}$]\label{cosets-example}
Every \dref{widget} is fine.
\end{example}
"""


def test_referenced_by_panel_renders_math_in_titles():
    def check(td):
        with open("content/test/page-c.tex", "w") as f:
            f.write(PAGE_C)
        with open("content/test/page-d.tex", "w") as f:
            f.write(PAGE_D)

        discovery, index, renderer = fresh_pipeline()
        c_html = renderer.render_page("content/test/page-c.tex")["content"]
        start = c_html.index('id="widget"')
        panel = c_html[start:]
        assert "Referenced by" in panel, panel[:500]
        # The referring block's title contains math: it must render through
        # the math seam, not appear as raw TeX in the link text
        assert "$3\\mathbb{Z}$" not in panel, panel[:2000]
        assert 'alttext="3\\mathbb{Z}"' in panel, panel[:2000]

    in_temp_site(check)


def test_url_collision_errors():
    def check(td):
        with open("content/test/dup-a.tex", "w") as f:
            f.write("\\title{Dup One}\n\\slug{dup}\nx\n")
        with open("content/test/dup-b.tex", "w") as f:
            f.write("\\title{Dup Two}\n\\slug{dup}\nx\n")
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


def main():
    tests = [test_tex_pages_end_to_end, test_url_collision_errors, test_markdown_content_rejected,
             test_referenced_by_panel_renders_math_in_titles]
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
