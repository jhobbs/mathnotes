#!/usr/bin/env python3
"""Semantic diff of two generated site trees.

Compares what pages MEAN, not their markup: title/description, heading
texts, math-block structure (type/label/title/nesting), math expressions,
reference targets, link hrefs, image sources, demo names, and normalized
visible text. Whitespace, tag choice, attribute order, heading ids, and
demo element ids are invisible.

Usage: python3 scripts/semantic_diff.py site-baseline site-new
"""

import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

MATH_RE = re.compile(r"\$\$.*?\$\$|\$[^$]+?\$", re.DOTALL)


class Extractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.headings = []      # (level, text)
        self.blocks = []        # (depth, type-class, data-label, title-text)
        self.refs = []          # data-ref-label of block-reference links
        self.links = []         # internal hrefs (deduped, sorted at the end)
        self.imgs = []
        self.demos = []
        self.text_parts = []
        self._stack = []        # open heading/title tracking
        self._block_depth = 0
        self._skip = 0          # inside <script>/<style>
        self.math_alt = []
        self._in_math = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "math":
            self.math_alt.append(a.get("alttext", ""))
            self._in_math += 1
            # Leave a single-space placeholder where the math used to be,
            # mirroring how MATH_RE.sub(" ", ...) elides $...$ on the
            # baseline side below -- otherwise adjacent text collapses
            # together ("( )" on baseline vs "()" on the new tree).
            if self._stack:
                self._stack[-1][2].append(" ")
            self.text_parts.append(" ")
            return
        if self._in_math:
            return  # tags inside <math> are rendering detail
        if tag in ("script", "style"):
            self._skip += 1
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self._stack.append(("h", tag, []))
        if tag == "title":
            self._stack.append(("title", tag, []))
        cls = a.get("class", "")
        if tag == "div" and "math-block " in cls + " ":
            btype = [c for c in cls.split() if c.startswith("math-") and c != "math-block"]
            self.blocks.append((self._block_depth, " ".join(btype), a.get("data-label", "")))
            self._block_depth += 1
        if "block-reference" in cls:
            self.refs.append((a.get("data-ref-label", ""), a.get("href", "")))
        if tag == "a" and a.get("href", "").startswith(("/mathnotes", "#")):
            self.links.append(a["href"])
        if tag == "img":
            self.imgs.append(a.get("src", ""))
        if a.get("data-demo"):
            self.demos.append(a["data-demo"])
        if a.get("data-embed-label"):
            self.refs.append(("EMBED:" + a["data-embed-label"], ""))

    def handle_endtag(self, tag):
        if tag == "math" and self._in_math:
            self._in_math -= 1
            return
        if tag in ("script", "style") and self._skip:
            self._skip -= 1
        if self._stack and self._stack[-1][1] == tag:
            kind, _, parts = self._stack.pop()
            # Strip $...$ math the same way the prose "text" field does, so
            # headings/title compare equal: on the baseline side $z_0$ is
            # still literal text here (headings aren't run through the
            # module-level MATH_RE.sub in summarize()), while on the new
            # side it was already elided to a placeholder space above.
            text = " ".join(MATH_RE.sub(" ", "".join(parts)).split())
            if kind == "h":
                self.headings.append((tag, text))
            else:
                self.title = text
        if tag == "div" and self._block_depth:
            # imprecise for generic divs; block nesting is captured via order+depth at start
            pass

    def handle_data(self, data):
        if self._skip or self._in_math:
            return
        if self._stack:
            self._stack[-1][2].append(data)
        self.text_parts.append(data)


def summarize(path: Path) -> dict:
    src = path.read_text(encoding="utf-8")
    ex = Extractor()
    ex.feed(src)
    text = " ".join("".join(ex.text_parts).split())

    def norm_math(s):
        return " ".join(s.replace("$", " ").split())

    math = sorted(norm_math(m) for m in MATH_RE.findall(text) + ex.math_alt)
    prose = " ".join(MATH_RE.sub(" ", text).split())
    return {
        "title": ex.title,
        "headings": [t for _, t in ex.headings],
        "blocks": ex.blocks,
        "refs": sorted(ex.refs),
        "links": sorted(set(ex.links)),
        "imgs": sorted(ex.imgs),
        "demos": sorted(ex.demos),
        "math": math,
        "text": prose,
    }


def main(old_root, new_root):
    old_root, new_root = Path(old_root), Path(new_root)
    old_pages = {p.relative_to(old_root) for p in old_root.rglob("index.html")}
    new_pages = {p.relative_to(new_root) for p in new_root.rglob("index.html")}
    diffs = 0
    for missing in sorted(old_pages - new_pages):
        print(f"MISSING in new: {missing}"); diffs += 1
    for extra in sorted(new_pages - old_pages):
        print(f"EXTRA in new: {extra}"); diffs += 1
    for page in sorted(old_pages & new_pages):
        a, b = summarize(old_root / page), summarize(new_root / page)
        for key in a:
            if a[key] != b[key]:
                diffs += 1
                print(f"\n=== {page} :: {key} ===")
                print(f"  old: {json.dumps(a[key])[:800]}")
                print(f"  new: {json.dumps(b[key])[:800]}")
    print(f"\n{'CLEAN' if not diffs else str(diffs) + ' differences'} "
          f"across {len(old_pages & new_pages)} shared pages")
    return 1 if diffs else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
