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
    body_text, finalize_blocks, render_block_html, math_to_dollar_text,
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
    assert b.content_snippet == "Every $x$ in a metric space has..."
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


def test_finalize_unlabeled_theorem_auto_labels():
    t1 = blk("theorem", title="Unlabeled")
    t2 = blk("theorem", title="Also Unlabeled")
    finalize_blocks([t1, t2])
    assert t1.label == "theorem-1"
    assert t2.label == "theorem-2"


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


def test_math_to_dollar_text():
    h = ('<p>Let <math xmlns="http://www.w3.org/1998/Math/MathML" '
         'alttext="x &lt; y"><mi>x</mi><mo>&lt;</mo><mi>y</mi></math> and '
         '<math alttext="\\int f" display="block"><mo>∫</mo></math> end.</p>')
    out = math_to_dollar_text(h)
    assert "$x < y$" in out
    assert "$$\\int f$$" in out
    assert "<math" not in out
    # no-op on HTML without math elements
    assert math_to_dollar_text("<p>plain $a+b$ text</p>") == "<p>plain $a+b$ text</p>"


def test_body_text_restores_math_from_alttext():
    h = '<p>Every <math alttext="\\epsilon"><mi>ε</mi></math> ball is open</p>'
    assert body_text(h) == "Every $\\epsilon$ ball is open"


def test_description_strips_math_elements():
    from mathnotes.page_renderer import PageRenderer
    pr = PageRenderer(None, None)
    desc = pr._generate_description(
        {}, '<p>Intro <math alttext="x^2"><mi>x</mi></math> continues here.</p>')
    assert desc == "Intro continues here."
    assert "<math" not in desc and "x" not in desc.replace("Intro", "")


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
