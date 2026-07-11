"""Tests for mathnotes/latex_processor.py (LaTeX content dialect).

Standalone assert script (repo convention; pytest is not installed in the
builder container). Run:

    docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py

Covers the prose-only emitter (Task 2) and block-environment parsing
(Task 3).
"""

import os
import sys
import traceback

try:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
except NameError:
    sys.path.insert(0, "/app")

from mathnotes.latex_processor import parse_latex_file, render_math, LatexDialectError  # noqa: E402
from mathnotes.structured_math import PageDoc, MathBlock, MathBlockType  # noqa: E402

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
    m = render_math("x<y", False)
    assert m.startswith("<math") and 'alttext="x&lt;y"' in m
    d = render_math("\\int f", True)
    assert 'display="block"' in d and 'alttext="\\int f"' in d
    h = prose("Inline $a<b$ and display $$c \\to d$$ done.")
    assert 'alttext="a&lt;b"' in h and 'alttext="c \\to d"' in h
    assert 'display="block"' in h


def test_bal_eal_shorthand():
    h = prose("Before\n\\bal\na &= b \\\\\n&= c\n\\eal\nafter.")
    ref = prose("Before\n\\[\\begin{aligned}\na &= b \\\\\n&= c\n"
                "\\end{aligned}\\]\nafter.")
    assert h == ref, (h, ref)
    # \balance etc. must not be mistaken for \bal
    expect_error("\\balance", "balance")


def test_preexpansion_macro_parsing():
    from mathnotes.latex_processor import _parse_preexpansion_macros
    sty = ("junk before\n"
           "% BEGIN PRE-EXPANSION MACROS\n"
           "\\def\\bal{\\[\\begin{aligned}}\n"
           "\\def\\eal{\\end{aligned}\\]}\n"
           "% END PRE-EXPANSION MACROS\n"
           "\\def\\outside{ignored}\n")
    m = _parse_preexpansion_macros(sty)
    assert m == {"bal": "\\[\\begin{aligned}", "eal": "\\end{aligned}\\]"}, m
    # missing markers is a loud error, not a silent no-op
    try:
        _parse_preexpansion_macros("\\def\\bal{x}")
        assert False, "expected ValueError for missing markers"
    except ValueError:
        pass
    # multi-line bodies would break source-line mapping in errors
    try:
        _parse_preexpansion_macros("% BEGIN PRE-EXPANSION MACROS\n"
                                   "\\def\\x{a\nb}\n"
                                   "% END PRE-EXPANSION MACROS\n")
        assert False, "expected ValueError for multi-line body"
    except ValueError:
        pass


def test_preexpansion_from_real_sty():
    # latex/mathnotes.sty is the single source of truth shared with pdflatex
    from mathnotes.latex_processor import _load_preexpansion_macros
    m = _load_preexpansion_macros()
    assert m["bal"] == "\\[\\begin{aligned}" and m["eal"] == "\\end{aligned}\\]", m


def test_preexpansion_expansion_rules():
    from mathnotes.latex_processor import _expand_preexpansion
    macros = {"bx": "\\begin{xx}", "b": "B"}
    # longest name wins; \bxy matches neither (letter follows); bodies with
    # backslashes must not be re-escaped by the substitution
    s = _expand_preexpansion("\\bx \\bxy \\b{}", macros)
    assert s == "\\begin{xx} \\bxy B{}", s


def test_sections():
    h = prose("\\section{Big Idea}\nText.\n\\subsection{Small $x$ Idea}")
    assert '<h1 id="big-idea">Big Idea</h1>' in h
    assert '<h2 id="small-x-idea">' in h and 'alttext="x"' in h
    assert "<p>Text.</p>" in h


def test_lists():
    h = prose("\\begin{itemize}\n\\item one\n\\item two\n"
              "\\begin{enumerate}\n\\item a\n\\end{enumerate}\n\\end{itemize}")
    # <li> elements are newline-separated (not packed edge-to-edge): with no
    # whitespace between adjacent tags, plain-text extraction of the page
    # (screen readers, textContent) glues the last word of one item to the
    # first word of the next.
    assert h == "<ul>\n<li>one</li>\n<li>two\n<ol>\n<li>a</li>\n</ol></li>\n</ul>"


def test_list_item_verbatim_preserves_newlines():
    h = prose("\\begin{itemize}\n\\item text\n"
              "\\begin{verbatim}\nline1\nline2\n\\end{verbatim}\n\\end{itemize}")
    assert "<pre><code>line1\nline2</code></pre>" in h
    li_start, li_end = h.index("<li>"), h.rindex("</li>")
    assert "<pre><code>line1\nline2</code></pre>" in h[li_start:li_end]
    # no <p> ever wraps a block element
    assert "<p><ul" not in h and "<p><ol" not in h and "<p><pre" not in h


def test_code_blocks():
    h = prose("\\begin{lstlisting}[language=Python]\nx = 1 < 2\n\\end{lstlisting}")
    assert '<pre><code class="language-python">x = 1 &lt; 2</code></pre>' in h
    h2 = prose("\\begin{verbatim}\nplain & <raw>\n\\end{verbatim}")
    assert "<pre><code>plain &amp; &lt;raw&gt;</code></pre>" in h2


def test_html_comment_line_now_visible_in_prose():
    # The markdown-era whole-line-<!-- -->-is-invisible shim is gone: HTML
    # comments have no special meaning in the dialect, so a standalone
    # `<!-- ... -->` line is just literal (escaped) prose text now. Authors
    # should use LaTeX's native `%` comment instead.
    h = prose("One.\n\n<!-- TODO: fix this -->\n\nTwo.")
    assert h == "<p>One.</p>\n<p>&lt;!-- TODO: fix this --&gt;</p>\n<p>Two.</p>"


def test_html_comment_line_preserved_in_verbatim():
    # Regression: verbatim/lstlisting content was never touched by the
    # (now-removed) comment shim — it's byte-for-byte preserved either way.
    h = prose("\\begin{verbatim}\nline1\n<!-- this is html comment example -->\nline2\n\\end{verbatim}")
    assert ("<pre><code>line1\n&lt;!-- this is html comment example --&gt;\nline2</code></pre>"
            in h)


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
    expect_error("\\begin{array}{c} x \\end{array}", "unsupported environment")


def test_dref_text_rejects_nested_link():
    expect_error("\\dref[see \\href{https://x.com}{this}]{lbl}",
                 "may not contain links or block-level content")


def test_dref_text_rejects_nested_dref():
    expect_error("\\dref[see \\dref{other}]{lbl}",
                 "may not contain links or block-level content")


def test_pagelink_text_rejects_nested_link():
    expect_error("\\pagelink[see \\href{https://x.com}{this}]{other-page}",
                 "may not contain links or block-level content")


def test_dref_text_plain_styling_still_fine():
    h = prose("\\dref[a \\emph{nice}]{prop}")
    assert '<a data-dref="prop">a <em>nice</em></a>' in h


def test_at_shorthand_is_dref():
    h = prose("See \\@{metric-space} and \\@[the spaces]{compact-set}.")
    assert '<a data-dref="metric-space"></a>' in h
    assert '<a data-dref="compact-set">the spaces</a>' in h


def test_at_shorthand_requires_label():
    expect_error("\\@{}", "requires a non-empty label")


def test_tabular_basic():
    h = prose("\\begin{tabular}{lr}\nA & B \\\\\nx & y \\\\\n\\end{tabular}")
    assert h == (
        "<table>\n"
        "<thead>\n"
        "<tr>\n"
        '<th style="text-align: left;">A</th>\n'
        '<th style="text-align: right;">B</th>\n'
        "</tr>\n"
        "</thead>\n"
        "<tbody>\n"
        "<tr>\n"
        '<td style="text-align: left;">x</td>\n'
        '<td style="text-align: right;">y</td>\n'
        "</tr>\n"
        "</tbody>\n"
        "</table>"
    )


def test_tabular_math_ampersand_not_split():
    # & inside $...$ is part of the opaque math node at the AST level (the
    # walker consumes the whole $...$ span before the tabular-row splitter
    # ever sees it), so a matrix cell must stay one cell, not two.
    h = prose("\\begin{tabular}{lc}\nSym & Val \\\\\n$H(X|Y)$ & "
              "$\\begin{pmatrix} a & b \\end{pmatrix}$ \\\\\n"
              "$I(X;Y)$ & $\\begin{pmatrix} c & d \\end{pmatrix}$ \\\\\n\\end{tabular}")
    assert 'alttext="H(X|Y)"' in h
    # header row renders as <th>, not <td>; two data rows x two columns = 4
    assert h.count("<td") == 4  # 2x2 table: the math & did not split a cell


def test_tabular_hline_ignored():
    h = prose("\\begin{tabular}{ll}\nA & B \\\\\n\\hline\nx & y \\\\\n\\end{tabular}")
    assert "hline" not in h
    assert '<td style="text-align: left;">x</td>' in h
    assert '<td style="text-align: left;">y</td>' in h


def test_tabular_too_many_cells_is_loud():
    expect_error("\\begin{tabular}{ll}\nA & B & C \\\\\n\\end{tabular}", "cells")


def test_tabular_bad_colspec_char_is_loud():
    expect_error("\\begin{tabular}{p{2cm}} x \\end{tabular}",
                 "unsupported tabular column spec character")


THM = ("\\begin{theorem}[Named]\\label{t1}\nBody $x$.\n\\end{theorem}\n"
       "\\begin{proof}\nBecause \\dref{t1}.\n\\end{proof}")


def test_block_basic():
    doc = page(THM)
    blocks = doc.top_blocks()
    assert len(blocks) == 1
    t = blocks[0]
    assert t.block_type == MathBlockType.THEOREM
    assert t.label == "t1" and t.title == "Named"
    assert t.body_html.startswith("<p>Body <math")
    assert 'alttext="x"' in t.body_html and t.body_html.endswith(".</p>")
    assert t.content == "Body $x$."   # alttext round-trip via body_text
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
    assert ("Gizmoes", "gizmoes") in d.auto_generated_synonyms  # generate_plural: words ending in 'o' get +es
    assert d.tags == ["testing"]
    assert d.metadata["synonyms"] == "gadget"  # raw string kept for data-attrs


def test_prose_between_blocks_order():
    doc = page("Before.\n" + THM + "\nAfter.")
    kinds = [type(it).__name__ for it in doc.items]
    assert kinds == ["str", "MathBlock", "str"]
    assert doc.items[0] == "<p>Before.</p>" and doc.items[2] == "<p>After.</p>"


def test_unlabeled_theorem_auto_labels():
    doc = page("\\begin{theorem}\nFirst.\n\\end{theorem}\n"
               "\\begin{theorem}\nSecond.\n\\end{theorem}")
    blocks = doc.top_blocks()
    assert [b.label for b in blocks] == ["theorem-1", "theorem-2"]


def test_block_errors():
    expect_error("\\begin{proof}\nOrphan.\n\\end{proof}", "no preceding theorem")
    expect_error("\\begin{itemize}\\item \\begin{theorem}x\\end{theorem}\\end{itemize}",
                 "nested inside a non-block construct")


def test_unconvertible_math_is_dialect_error_with_line():
    import tempfile
    src = "\\title{T}\n\nGood text.\n\n$\\notarealmacro$\n"
    with tempfile.NamedTemporaryFile("w", suffix=".tex", delete=False) as f:
        f.write(src)
    try:
        parse_latex_file(src, filepath=f.name)
        assert False, "expected LatexDialectError"
    except LatexDialectError as e:
        assert f.name in str(e) and ":5:" in str(e)
    finally:
        os.remove(f.name)


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
        except AssertionError:
            raise
        except Exception:
            pass
    finally:
        notation.reset_registry()


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
    # Pre-scan saw nothing: parse/scan drift. _parse_notation retries with a
    # real rescan before erroring, so the probe name must be one that can
    # never appear in actual repo content.
    notation.set_registry({})
    try:
        expect_error(
            "\\begin{definition}[Drift Probe]\n"
            "\\notation{\\zzqdriftprobe}{\\mathbb{T}}\nBody.\n\\end{definition}",
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


def test_render_math_without_registry_unchanged():
    from mathnotes import notation
    notation.set_registry({})
    try:
        mml = render_math("x^2", display=False)
        assert "notation-ref" not in mml
    finally:
        notation.reset_registry()


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
