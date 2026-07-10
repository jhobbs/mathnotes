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

from .structured_math import MathBlockType, lowercase_outside_math, text_with_math_to_html

_DEMBED_RE = re.compile(r'<div data-dembed="([^"]+)"></div>')
_DREF_RE = re.compile(r'<a data-dref="([^"]+)">(.*?)</a>', re.DOTALL)
_PAGELINK_RE = re.compile(r'<a data-pagelink="([^"]+)">(.*?)</a>', re.DOTALL)
_REF_LABEL_RE = re.compile(r'<a[^>]+class="block-reference[^"]*"[^>]+data-ref-label="([^"]+)"')


def tooltip_entry(bref) -> Dict[str, Any]:
    """Client-shaped tooltip payload for one block reference (the shape
    tooltip-system.ts consumes) — the single source for both the global
    index JSON and each page's own tooltip JSON."""
    block = bref.block
    is_synonym = getattr(bref, "is_synonym", False)
    synonym_title = getattr(bref, "synonym_title", None)
    title = text_with_math_to_html(block.title) if block.title else ""
    url = bref.full_url or ""
    return {
        "type": block.block_type.value,
        "title": title,
        "content": block.content_html,
        "url": url if not url.startswith("#") else "",
        "is_synonym": is_synonym,
        "synonym_of": title if is_synonym and title else None,
        "synonym_title": (text_with_math_to_html(synonym_title)
                          if synonym_title else None),
    }


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
            tooltip_data[label] = tooltip_entry(bref)
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
                    text = lowercase_outside_math(text)
                text = text_with_math_to_html(text)
            elif block.title:
                text = block.title
                if block.block_type == MathBlockType.DEFINITION and ref_type is None:
                    text = lowercase_outside_math(text)
                text = text_with_math_to_html(text)
            else:
                text = text_with_math_to_html(block.content_snippet)
            return (f'<a href="{bref.full_url}" class="{css}" '
                    f'data-ref-type="{block.block_type.value}" '
                    f'data-ref-label="{html_lib.escape(label, quote=True)}">{text}</a>')
        shown_ref = html_lib.escape(ref)
        if custom_text.strip():
            shown = f"@{{{html_lib.escape(custom_text)}|{shown_ref}}}"
        else:
            shown = f"@{shown_ref}"
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
        type_matches = bref and (ref_type is None or bref.block.block_type.value == ref_type)
        if type_matches:
            if not bref.block.rendered_html:
                raise ValueError(
                    f"\\dembed{{{ref}}}: target '{label}' exists but is not yet "
                    f"rendered — \\dembed inside block bodies is order-dependent "
                    f"and unsupported; move it to page level"
                )
            url = bref.full_url
            source_info = ""
            if url and not url.startswith("#"):
                source_info = (f'<div class="embedded-source">from '
                               f'<a href="{url}">{bref.page_title}</a></div>')
            return (f'<div class="embedded-block" data-embed-label="{label}">\n'
                    f"{bref.block.rendered_html}\n{source_info}\n</div>")
        return (f'<span class="embed-error" data-ref="{html_lib.escape(ref, quote=True)}">'
                f"\\dembed{{{html_lib.escape(ref)}}} (not found)</span>")


def labels_from_rendered_html(html_content: str, exclude: Dict) -> Set[str]:
    """Labels referenced inside already-rendered block HTML that still need tooltip data."""
    return {m.group(1) for m in _REF_LABEL_RE.finditer(html_content)
            if m.group(1) not in exclude}
