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


# --- final-review fixes ---

def test_escaped_dollar_does_not_create_phantom_math():
    out = body(r"It costs \$5 and \$10 total.")
    assert "&#36;5" in out and "&#36;10" in out
    assert "$5" not in out


def test_multiline_block_title_collapses():
    out = body("\\begin{definition}[Open\n  Cover]\nStuff.\n\\end{definition}\n")
    assert ':::definition "Open Cover"' in out


# --- dialect: sources, synonyms, tags ---

def test_source_macros_collect_metadata():
    src = r"""\title{X}
\source{title={Principles of Mathematical Analysis}, author={Walter Rudin}, type=book, published=1976}
\source{title={Real Mathematical Analysis, 2nd}, author={Charles C. Pugh}}

Prose.
"""
    meta, content = parse_latex_file(src, "test.tex")
    assert meta["sources"] == [
        {"title": "Principles of Mathematical Analysis", "author": "Walter Rudin",
         "type": "book", "published": "1976"},
        {"title": "Real Mathematical Analysis, 2nd", "author": "Charles C. Pugh"},
    ]
    assert content.strip() == "Prose."


def test_source_in_document_body():
    src = ("\\documentclass{article}\n\\begin{document}\n"
           "\\source{title={T}, author={A}}\nBody.\n\\end{document}\n")
    meta, content = parse_latex_file(src, "test.tex")
    assert meta["sources"] == [{"title": "T", "author": "A"}]
    assert content.strip() == "Body."


def test_source_between_theorem_and_proof_keeps_attachment():
    src = ("\\begin{theorem}\\label{t9}\nX.\n\\end{theorem}\n"
           "\\source{title={T}}\n"
           "\\begin{proof}\nY.\n\\end{proof}\n")
    out = body(src)
    assert "::::proof" in out


def test_source_bad_pair_errors():
    expect_error(r"\source{just a title}", "key=value")


def test_source_inside_block_errors():
    expect_error(
        "\\begin{theorem}\\label{t}\nX. \\source{title={T}}\n\\end{theorem}\n",
        "page level",
    )


def test_synonyms_and_tags_transpile_and_roundtrip():
    from mathnotes.structured_math import StructuredMathParser

    src = ("\\begin{definition}[Open Cover]\\label{open-cover}"
           "\\synonyms{open covers, covering}\\tags{topology}\n"
           "Stuff.\n\\end{definition}\n")
    _, content = parse_latex_file(src, "test.tex")
    assert (':::definition "Open Cover" '
            "{label: open-cover, synonyms: open covers, covering, tags: topology}") in content
    _, markers = StructuredMathParser().parse(content)
    block = next(iter(markers.values()))
    assert [s[0] for s in block.synonyms] == ["open covers", "covering"]
    assert block.tags == ["topology"]


def test_tags_allowed_on_theorem():
    src = "\\begin{theorem}\\label{t}\\tags{algebra}\nX.\n\\end{theorem}\n"
    assert ":::theorem {label: t, tags: algebra}" in body(src)


def test_synonyms_on_theorem_errors():
    expect_error(
        "\\begin{theorem}\\label{t}\\synonyms{thing}\nX.\n\\end{theorem}\n",
        "definition",
    )


def test_duplicate_synonyms_errors():
    expect_error(
        "\\begin{definition}[A]\\synonyms{x}\\synonyms{y}\nX.\n\\end{definition}\n",
        "multiple \\synonyms",
    )


def test_synonyms_outside_block_errors():
    expect_error(r"\synonyms{foo}", "block environment")


# --- dialect: code blocks ---

def test_verbatim_environment():
    src = "\\begin{verbatim}\nfor i in x:\n    y = i % 2\n\\end{verbatim}\n"
    out = body(src)
    assert "```\nfor i in x:\n    y = i % 2\n```" in out


def test_lstlisting_with_language():
    src = ("Before.\n\\begin{lstlisting}[language=Python]\n"
           "sequence.append(f\"E_{n},{m}\")\n"
           "\\end{lstlisting}\nAfter.\n")
    out = body(src)
    assert "```python\nsequence.append(f\"E_{n},{m}\")\n```" in out
    assert "Before." in out and "After." in out


def test_verbatim_inside_proof():
    src = ("\\begin{theorem}\\label{vt}\nX.\n\\end{theorem}\n"
           "\\begin{proof}\nCode:\n\\begin{verbatim}\na & b $ c\n\\end{verbatim}\nDone.\n\\end{proof}\n")
    out = body(src)
    assert "::::proof" in out
    assert "```\na & b $ c\n```" in out


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
