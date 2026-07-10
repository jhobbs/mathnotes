"""Unit tests for placeholder resolution (ref_resolver.py).

Run: docker exec -i mathnotes-static-builder python3 - < test/test_ref_resolver.py
"""
import os, sys, traceback
try:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
except NameError:
    sys.path.insert(0, "/app")

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
    o = MathBlock(block_type=MathBlockType.DEFINITION, content="A growth bound.",
                  title="Big $O$ Notation", label="big-o-notation")
    o.rendered_html = '<div id="big-o-notation">O</div>'
    refs = {
        "metric-space": SimpleNamespace(block=d, full_url="/mathnotes/topology/x/#metric-space",
                                        page_title="X Page"),
        "metric-spaces": SimpleNamespace(block=d, full_url="/mathnotes/topology/x/#metric-space",
                                         page_title="X Page", is_synonym=True,
                                         synonym_title="Metric Spaces"),
        "thm-1": SimpleNamespace(block=t, full_url="/mathnotes/topology/x/#thm-1",
                                 page_title="X Page"),
        "big-o-notation": SimpleNamespace(block=o, full_url="/mathnotes/algebra/y/#big-o-notation",
                                          page_title="Y Page"),
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


def test_definition_title_lowercase_skips_math():
    # prose lowercases for mid-sentence link text; TeX inside $...$ must not
    # ($O$ -> $o$ would change math meaning), and converts through the seam
    index, mapper = make_index()
    r = RefResolver(index, mapper)
    out = r.resolve('<p>see <a data-dref="big-o-notation"></a></p>')
    assert ">big <math" in out
    assert 'alttext="O"' in out
    assert " notation</a>" in out


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


def test_custom_text_missing_ref_error_format():
    index, mapper = make_index()
    out = RefResolver(index, mapper).resolve('<p><a data-dref="nope">click here</a></p>')
    assert '<span class="block-reference-error" data-ref="nope">@{click here|nope}</span>' in out


def test_dembed_order_dependency_raises():
    # Simulates block-index phase 4: a block body embeds a label whose
    # target exists in the index but hasn't rendered yet (rendered_html is
    # still None). This must raise loudly, not silently render an error span
    # (that would be indistinguishable from a genuinely missing label).
    t = MathBlock(block_type=MathBlockType.THEOREM, content="Statement.",
                  title=None, label="thm-2")
    t.rendered_html = None
    refs = {"thm-2": SimpleNamespace(block=t, full_url="/mathnotes/x/#thm-2", page_title="X")}
    index = SimpleNamespace(get_reference=lambda label, _r=refs: _r.get(label))
    mapper = SimpleNamespace(url_mappings={})
    r = RefResolver(index, mapper)
    try:
        r.resolve('<div data-dembed="thm-2"></div>')
        assert False, "expected ValueError"
    except ValueError as e:
        assert "thm-2" in str(e) and "not yet rendered" in str(e), str(e)
    # A genuinely missing label must still yield the error span, not raise.
    out = RefResolver(index, mapper).resolve('<div data-dembed="nope"></div>')
    assert "embed-error" in out


def test_dembed_type_mismatch_error_span():
    index, mapper = make_index()
    out = RefResolver(index, mapper).resolve('<div data-dembed="definition:thm-1"></div>')
    assert "embed-error" in out


def test_dref_type_mismatch_custom_text_error_span():
    index, mapper = make_index()
    out = RefResolver(index, mapper).resolve('<a data-dref="definition:thm-1">click</a>')
    assert 'block-reference-error' in out
    assert '@{click|definition:thm-1}' in out


def test_synonym_title_escaping():
    d = MathBlock(block_type=MathBlockType.DEFINITION, content="Test.",
                  title="Test", label="test-label")
    d.rendered_html = '<div id="test-label">TEST</div>'
    refs = {
        "bad-synonym": SimpleNamespace(block=d, full_url="/mathnotes/x/#test",
                                       page_title="X", is_synonym=True,
                                       synonym_title="A<B & C"),
    }
    index = SimpleNamespace(get_reference=lambda label, _r=refs: _r.get(label))
    mapper = SimpleNamespace(url_mappings={})
    out = RefResolver(index, mapper).resolve('<p><a data-dref="bad-synonym"></a></p>')
    assert 'a&lt;b &amp; c' in out, f"Expected escaped lowercase synonym_title in output, got: {out}"
    assert '<B' not in out, f"Raw HTML tag should not appear: {out}"


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
