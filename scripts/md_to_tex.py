#!/usr/bin/env python3
"""Convert internal-markdown content files to the mathnotes LaTeX dialect.

Runs inside the dev builder container (host python lacks the deps):

    docker exec -w /app mathnotes-static-builder python3 scripts/md_to_tex.py \
        content/topology/metric-spaces.md

Prints the converted LaTeX to <file>.tex NEXT TO the original only with
--write; otherwise it just reports whether conversion + verification
succeeded. The original .md is never deleted by this script.

The converter is deliberately conservative: any markdown construct it does
not recognize aborts the conversion for that file with an error naming the
construct, rather than risking silent corruption.

Verification: the emitted LaTeX is transpiled back through
mathnotes.latex_processor and compared, after canonical normalization on
both sides, against the original markdown. Any drift is shown as a diff and
fails the conversion.
"""

import argparse
import difflib
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import frontmatter  # noqa: E402

from mathnotes.structured_math import StructuredMathParser, MathBlockType  # noqa: E402
from mathnotes.math_utils import MathProtector  # noqa: E402
from mathnotes.latex_processor import parse_latex_file  # noqa: E402


class ConversionError(Exception):
    pass


# Block types that the amsthm sibling convention can re-attach.
ANCHOR_TYPES = {"theorem", "lemma", "proposition", "exercise", "corollary"}
ATTACHABLE = {"corollary", "note", "remark", "example", "intuition"}
CHILD_TYPES_ON_ROOT = {"proof", "corollary", "note", "remark", "example", "intuition", "solution"}
CHILD_TYPES_ON_COROLLARY = {"proof"}

_PLACEHOLDER = "XLTXCMD{}XPH"


class ProseConverter:
    """Converts internal-markdown prose (no ::: blocks) to LaTeX prose."""

    def __init__(self, context: str):
        self.context = context  # for error messages

    def err(self, message: str):
        raise ConversionError(f"{self.context}: {message}")

    def convert(self, text: str) -> str:
        self._commands = []
        # 0. HTML comments (invisible on the site) become LaTeX comments
        text = re.sub(r"<!--(.*?)-->", self._html_comment, text, flags=re.DOTALL)
        # 1. Code fences out first (their content is exempt from everything)
        text = re.sub(r"```([A-Za-z0-9+#-]*)\n(.*?)```", self._fence, text, flags=re.DOTALL)
        # 2. Math out (verbatim passthrough; display math re-delimited)
        protector = MathProtector(prefix="XCNV")
        text = protector.protect_math(text)
        # 2b. Literal dollars written as HTML entities (markdown's only way
        # to keep a $ away from MathProtector) become the tidier \$
        text = re.sub(r"&#36;", lambda m: self._stash("\\$"), text)
        # 3. Demo includes
        text = re.sub(r'{%\s*include_demo\s+"([^"]+)"\s*%}',
                      lambda m: self._stash(f"\\includedemo{{{m.group(1)}}}"), text)
        # 4. Headers (h1-h3 only)
        text = re.sub(r"^(#{1,6})\s+(.*)$", self._header, text, flags=re.MULTILINE)
        # 5. Wiki links
        text = re.sub(r"\[\[([^\]|]+)\|([^\]]+)\]\]",
                      lambda m: self._stash(f"\\pagelink[{m.group(1).strip()}]{{{m.group(2).strip()}}}"), text)
        text = re.sub(r"\[\[([^\]]+)\]\]",
                      lambda m: self._stash(f"\\pagelink{{{m.group(1).strip()}}}"), text)
        # 5a2. Images, optionally with a title (tooltip)
        def image(m):
            alt, path, title = m.group(1), m.group(2), m.group(3)
            opts = []
            if alt:
                opts.append(f"alt={{{alt}}}")
            if title:
                opts.append(f"title={{{title}}}")
            optstr = f"[{', '.join(opts)}]" if opts else ""
            return self._stash(f"\\includegraphics{optstr}{{{path}}}")
        text = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)(?:\s+\"([^\"]*)\")?\s*\)", image, text)
        # 5a3. Raw img tags (markdown's only way to size an image)
        def raw_img(m):
            attrs = dict(re.findall(r'([a-z]+)\s*=\s*"([^"]*)"', m.group(0)))
            unknown = set(attrs) - {"src", "alt", "width", "height"}
            if unknown or "src" not in attrs:
                self.err(f"img tag with unsupported attributes {sorted(unknown)}: {m.group(0)[:80]!r}")
            opts = [f"{k}={{{attrs[k]}}}" if k == "alt" else f"{k}={attrs[k]}px"
                    for k in ("alt", "width", "height") if k in attrs]
            optstr = f"[{', '.join(opts)}]" if opts else ""
            return self._stash(f"\\includegraphics{optstr}{{{attrs['src']}}}")
        text = re.sub(r"<img\b[^>]*>", raw_img, text)
        # 5b. Markdown links (not images: no preceding !). URLs may contain
        # one level of balanced parens; % and # are escaped for LaTeX
        # (hyperref's documented URL form)
        def link(m):
            url = m.group(2).replace("%", "\\%").replace("#", "\\#")
            return self._stash(f"\\href{{{url}}}{{{m.group(1)}}}")
        text = re.sub(r"(?<!!)\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)", link, text)
        # 6. Block references (custom text first, then plain)
        text = re.sub(r"@\{([^|{}]+)\|([a-zA-Z0-9_:-]+)\}",
                      lambda m: self._stash(f"\\dref[{m.group(1)}]{{{m.group(2)}}}"), text)
        text = re.sub(r"(?<![a-zA-Z0-9])@([a-zA-Z0-9_-]+(?::[a-zA-Z0-9_-]+)?)",
                      lambda m: self._stash(f"\\dref{{{m.group(1)}}}"), text)
        # 7. Inline code, bold, emphasis. Markdown pairs asterisks left to
        # right; emphasis may span line breaks within a paragraph, and edge
        # whitespace moves outside the LaTeX command (rendering-identical).
        text = re.sub(r"`([^`\n]+)`", lambda m: self._stash(f"\\texttt{{{m.group(1)}}}"), text)

        def styled(macro):
            def sub(m):
                inner = m.group(1)
                if not inner.strip():
                    return m.group(0)
                lead = inner[: len(inner) - len(inner.lstrip())]
                trail = inner[len(inner.rstrip()):]
                return lead + self._stash(f"\\{macro}{{{inner.strip()}}}") + trail
            return sub

        text = re.sub(r"\*\*(?!\s)((?:(?!\n\n)[^*])+?)\*\*", styled("textbf"), text)
        text = re.sub(r"\*(?!\s)((?:(?!\n\n)[^*])+?)\*", styled("emph"), text)
        text = re.sub(r"(?<![a-zA-Z0-9\\])_([^_\n]+)_(?![a-zA-Z0-9])",
                      lambda m: self._stash(f"\\emph{{{m.group(1)}}}"), text)
        # 8. Lists
        text = self._convert_lists(text)
        # 9. Escape LaTeX specials in what prose remains
        text = self._escape_specials(text)
        # 10. Leftover-construct audit on the prose (placeholders are inert)
        self._audit(text)
        # 11. Restore inserted commands, then math, then fences
        for i, cmd in reversed(list(enumerate(self._commands))):
            text = text.replace(_PLACEHOLDER.format(i), cmd)
        text = self._restore_math(text, protector)
        return text

    def _stash(self, command: str) -> str:
        self._commands.append(command)
        return _PLACEHOLDER.format(len(self._commands) - 1)

    def _html_comment(self, m) -> str:
        lines = m.group(1).strip("\n").split("\n")
        return self._stash("\n".join("% " + line if line.strip() else "%" for line in lines))

    def _fence(self, m) -> str:
        lang, code = m.group(1), m.group(2).rstrip("\n")
        if lang:
            cmd = f"\\begin{{lstlisting}}[language={lang.capitalize()}]\n{code}\n\\end{{lstlisting}}"
        else:
            cmd = f"\\begin{{verbatim}}\n{code}\n\\end{{verbatim}}"
        return self._stash(cmd)

    def _header(self, m) -> str:
        depth = len(m.group(1))
        if depth > 5:
            self.err(f"heading level {depth} not supported (h1-h5 only): {m.group(0)!r}")
        name = {1: "section", 2: "subsection", 3: "subsubsection",
                4: "paragraph", 5: "subparagraph"}[depth]
        # markdown allows (and strips) closing hashes; # is illegal in LaTeX text
        title = m.group(2).strip().rstrip(" #")
        return self._stash(f"\\{name}{{{title}}}")

    def _convert_lists(self, text: str) -> str:
        out = []
        run = []          # accumulated \item / nested-list lines
        run_kind = None   # "itemize" | "enumerate"
        sub = []          # accumulated nested \item lines
        sub_kind = None

        def close_sub():
            nonlocal sub, sub_kind
            if sub:
                body = "\n".join(sub)
                run.append(f"\\begin{{{sub_kind}}}\n{body}\n\\end{{{sub_kind}}}")
                sub, sub_kind = [], None

        def close():
            nonlocal run, run_kind
            close_sub()
            if run:
                body = "\n".join(run)
                out.append(self._stash(f"\\begin{{{run_kind}}}\n{body}\n\\end{{{run_kind}}}"))
                run, run_kind = [], None

        def item_text(raw):
            # items are stashed whole, so escape/audit here — the global
            # pass never sees inside placeholders
            item = self._escape_specials(raw)
            self._audit(item)
            return item

        previous_blank = True
        for line in text.split("\n"):
            nested = re.match(r"^(?: {4,}|\t)([*-]|\d+\.)\s+(.*)$", line)
            top = re.match(r"^ {0,3}([*-]|\d+\.)\s+(.*)$", line)
            if top and not run and not previous_blank:
                self.err(
                    f"list item directly follows text with no blank line — markdown "
                    f"renders this as paragraph text, not a list; add a blank line "
                    f"in the source if a list was intended: {line!r}"
                )
            previous_blank = not line.strip()
            if nested:
                if not run:
                    self.err(f"indented list item with no enclosing list: {line!r}")
                kind = "enumerate" if nested.group(1)[0].isdigit() else "itemize"
                if sub_kind not in (None, kind):
                    close_sub()
                sub_kind = kind
                sub.append(f"\\item {item_text(nested.group(2))}")
            elif top:
                close_sub()
                kind = "enumerate" if top.group(1)[0].isdigit() else "itemize"
                if run_kind not in (None, kind):
                    close()
                run_kind = kind
                run.append(f"\\item {item_text(top.group(2))}")
            else:
                if run and line.strip():
                    self.err(f"list continuation lines not supported: {line!r}")
                close()
                out.append(line)
        close()
        return "\n".join(out)

    def _escape_specials(self, text: str) -> str:
        if "\\" in text:
            snippet = text[max(0, text.find("\\") - 30): text.find("\\") + 30]
            self.err(f"character '\\' in prose is not representable in the dialect: ...{snippet!r}...")
        text = re.sub(r"[%&#$_{}]", lambda m: "\\" + m.group(0), text)
        text = text.replace("~", "\\textasciitilde{}")
        text = text.replace("^", "\\textasciicircum{}")
        return text

    def _audit(self, text: str):
        for pattern, what in [
            (r"\]\(", "markdown link"),
            (r"<[a-zA-Z]", "raw HTML"),
            (r"{%", "template tag"),
            (r"\[\[", "wiki link"),
            (r"```", "code fence"),
            (r"(?<![a-zA-Z0-9])@[a-zA-Z]", "block reference"),
            # a lone space-surrounded * (multiplication) renders literally in
            # both dialects; only flag asterisks markdown could treat as emphasis
            (r"(?<! )\*|\*(?! )", "asterisk"),
            (r"`", "backtick"),
            (r"!\[", "image"),
        ]:
            m = re.search(pattern, text)
            if m:
                snippet = text[max(0, m.start() - 40): m.start() + 40]
                self.err(f"unconverted {what} remains: ...{snippet!r}...")

    def _restore_math(self, text: str, protector: MathProtector) -> str:
        for placeholder, math in protector.display_math.items():
            inner = math[2:-2].strip()
            # blank/whitespace-only lines inside \[ \] are TeX errors, and
            # align cannot nest in a display — MathJax tolerates both
            inner = re.sub(r"\n[ \t]*(?:\n[ \t]*)+", "\n", inner)
            inner = re.sub(r"\\(begin|end)\{align\}", r"\\\1{aligned}", inner)
            text = text.replace(placeholder, f"\\[ {inner} \\]")
        for placeholder, math in protector.inline_math.items():
            text = text.replace(placeholder, math)
        return text


class Converter:
    def __init__(self, md_path: str):
        self.md_path = md_path

    def err(self, message: str):
        raise ConversionError(f"{self.md_path}: {message}")

    def convert(self) -> str:
        with open(self.md_path, "r", encoding="utf-8") as f:
            post = frontmatter.load(f)
        metadata, content = dict(post.metadata), post.content
        self.original_content = content
        self.original_metadata = metadata

        parser = StructuredMathParser()
        content_with_markers, block_markers = parser.parse(content)
        self.block_markers = block_markers

        lines = [
            "\\documentclass{article}",
            "\\usepackage{mathnotes}",
            "",
        ]
        lines += self._emit_metadata(metadata)
        lines += ["", "\\begin{document}", ""]
        lines += self._emit_body(content_with_markers)
        lines += ["", "\\end{document}", ""]
        tex = "\n".join(lines)
        tex = re.sub(r"\n{3,}", "\n\n", tex)
        return tex

    def _emit_metadata(self, metadata: dict) -> list:
        known = {"title", "description", "slug", "layout", "sources"}
        unknown = set(metadata) - known
        if unknown:
            self.err(f"frontmatter keys with no LaTeX equivalent: {sorted(unknown)}")
        if metadata.get("layout", "page") != "page":
            self.err(f"layout {metadata['layout']!r} is not the default")
        out = []
        for key in ("title", "description", "slug"):
            if metadata.get(key):
                value = str(metadata[key]).strip()
                if any(c in value for c in "\\{}%"):
                    self.err(f"{key} contains LaTeX specials: {value!r}")
                out.append(f"\\{key}{{{value}}}")
        for source in metadata.get("sources") or []:
            pairs = ", ".join(f"{k}={{{v}}}" for k, v in source.items())
            out.append(f"\\source{{{pairs}}}")
        return out

    def _emit_body(self, content_with_markers: str) -> list:
        out = []
        sim_anchor_open = False
        prose_buffer = []

        def flush_prose():
            nonlocal sim_anchor_open
            chunk = "\n".join(prose_buffer)
            prose_buffer.clear()
            if chunk.strip():
                sim_anchor_open = False
            if chunk.strip() or chunk:
                converter = ProseConverter(self.md_path)
                out.append(converter.convert(chunk))

        for line in content_with_markers.split("\n"):
            block = self.block_markers.get(line.strip())
            if block is not None and block.parent is None:
                flush_prose()
                if block.block_type.value in ATTACHABLE and sim_anchor_open:
                    out.append("\\detach")
                    out.append("")
                if block.block_type.value in ("proof", "solution"):
                    self.err(f"top-level {block.block_type.value} block cannot be represented")
                out.extend(self._emit_block_group(block))
                sim_anchor_open = block.block_type.value in ANCHOR_TYPES
            else:
                prose_buffer.append(line)
        flush_prose()
        return out

    def _children_in_order(self, block) -> list:
        """Child blocks in the order their markers appear in block.content."""
        positions = []
        for marker, child in self.block_markers.items():
            if child.parent is block:
                pos = block.content.find(marker)
                if pos == -1:
                    self.err(f"child marker missing from content of '{block.label}'")
                positions.append((pos, marker, child))
        return [c for _, _, c in sorted(positions)]

    def _statement_text(self, block) -> str:
        """Block content up to the first child marker; trailing text after
        child markers is unrepresentable in the sibling convention."""
        content = block.content
        first = len(content)
        for marker, child in self.block_markers.items():
            if child.parent is block:
                pos = content.find(marker)
                first = min(first, pos)
        statement, tail = content[:first], content[first:]
        for marker, child in self.block_markers.items():
            if child.parent is block:
                tail = tail.replace(marker, "")
        if tail.strip():
            self.err(
                f"block '{block.label}' has text after/between nested blocks, "
                f"which the amsthm sibling convention cannot represent: {tail.strip()[:80]!r}"
            )
        return statement.strip()

    def _env_head(self, block) -> str:
        head = f"\\begin{{{block.block_type.value}}}"
        if block.title:
            # math ($, {}) is fine in titles; brackets would break the
            # optional-arg parse, and raw backslash commands outside math
            # won't round-trip (verify catches those)
            if any(c in block.title for c in "[]\""):
                self.err(f"title contains characters needing manual handling: {block.title!r}")
            head += f"[{block.title}]"
        for key, macro in (("label", "label"), ("synonyms", "synonyms"), ("tags", "tags")):
            value = block.metadata.get(key)
            if value:
                head += f"\\{macro}{{{value}}}"
        return head

    def _emit_env(self, block) -> list:
        statement = self._statement_text(block)
        converter = ProseConverter(f"{self.md_path} [{block.label}]")
        body = converter.convert(statement)
        return [self._env_head(block), body, f"\\end{{{block.block_type.value}}}", ""]

    def _emit_nested(self, block) -> list:
        """Emit a block with its children literally nested at their original
        positions — used when the amsthm sibling convention cannot represent
        the structure (prose between children, non-theorem parents, deep
        nesting)."""
        env = block.block_type.value
        child_markers = {
            marker: child for marker, child in self.block_markers.items()
            if child.parent is block
        }
        if child_markers:
            pattern = "(" + "|".join(re.escape(m) for m in child_markers) + ")"
            parts = re.split(pattern, block.content)
        else:
            parts = [block.content]
        lines = [self._env_head(block)]
        for part in parts:
            if part in child_markers:
                lines.extend(self._emit_nested(child_markers[part]))
            elif part.strip():
                converter = ProseConverter(f"{self.md_path} [{block.label}]")
                lines.extend([converter.convert(part.strip("\n")).strip("\n"), ""])
        lines.extend([f"\\end{{{env}}}", ""])
        return lines

    def _emit_block_group(self, root) -> list:
        # Prefer the amsthm sibling convention; where it cannot represent the
        # structure, fall back to literally nested environments (which the
        # dialect also supports)
        try:
            return self._emit_sibling_group(root)
        except ConversionError:
            return self._emit_nested(root)

    def _emit_sibling_group(self, root) -> list:
        out = self._emit_env(root)
        root_type = root.block_type.value
        seen_corollary = False
        children = self._children_in_order(root)
        if children and root_type not in ANCHOR_TYPES and root_type != "exercise":
            self.err(
                f"'{root.label}' is a {root_type} with nested blocks; the amsthm "
                f"sibling convention only re-attaches to theorem-like blocks"
            )
        for child in children:
            ctype = child.block_type.value
            if ctype not in CHILD_TYPES_ON_ROOT:
                self.err(f"nested {ctype} inside '{root.label}' cannot be represented as a sibling")
            if ctype == "solution" and root_type != "exercise":
                self.err(f"nested solution inside non-exercise '{root.label}'")
            if ctype == "proof" and seen_corollary:
                self.err(f"proof of '{root.label}' appears after a corollary; ordering unrepresentable")
            if ctype == "corollary":
                seen_corollary = True
                out.extend(self._emit_env(child))
                for grand in self._children_in_order(child):
                    if grand.block_type.value not in CHILD_TYPES_ON_COROLLARY:
                        self.err(f"nested {grand.block_type.value} inside corollary '{child.label}'")
                    out.extend(self._emit_env(grand))
            else:
                if self._children_in_order(child):
                    self.err(f"nested blocks inside {ctype} of '{root.label}' not supported")
                out.extend(self._emit_env(child))
        return out


# --- verification -----------------------------------------------------------

def _canonicalize(content: str, semantic: bool = True) -> str:
    """Normalize internal-markdown content for round-trip comparison.

    With semantic=False only rendering-neutral structural normalizations are
    applied; the result is still real markdown, suitable for rendering both
    sides through the markdown library and comparing HTML (which judges
    emphasis/list semantics exactly).
    """
    content = content.replace("\xa0", " ")  # nbsp renders as a space
    # HTML comments are invisible; they become % comments in .tex (dropped
    # from the transpiled output)
    content = re.sub(r"<!--(.*?)-->", "", content, flags=re.DOTALL)
    protector = MathProtector(prefix="XNRM")
    content = re.sub(r"```([A-Za-z0-9+#-]*)\n(.*?)```",
                     lambda m: "```" + m.group(1).lower() + "\n"
                     + m.group(2).rstrip("\n") + "\n```",
                     content, flags=re.DOTALL)
    content = protector.protect_math(content)
    content = content.replace("&#36;", "$")
    if semantic:
        # unify bullets and emphasis forms (rendering-equivalent rewrites the
        # HTML comparison below would otherwise judge; kept out of the
        # semantic=False stage)
        content = re.sub(r"^(\s*)\*(\s+)", r"\1-\2", content, flags=re.MULTILINE)
        content = re.sub(r"^(\s*)(\d+)\.(\s+)", r"\g<1>1.\3", content, flags=re.MULTILINE)
        content = re.sub(r"(?<![a-zA-Z0-9\\])_([^_\n]+)_(?![a-zA-Z0-9])", r"*\1*", content)

        def _edges(m, d):
            inner = m.group(1)
            if not inner.strip():
                return m.group(0)
            lead = inner[: len(inner) - len(inner.lstrip())]
            trail = inner[len(inner.rstrip()):]
            return f"{lead}{d}{inner.strip()}{d}{trail}"

        content = re.sub(r"\*\*(?!\s)((?:(?!\n\n)[^*])+?)\*\*", lambda m: _edges(m, "**"), content)
        content = re.sub(r"\*(?!\s)((?:(?!\n\n)[^*])+?)\*", lambda m: _edges(m, "*"), content)
    # canonicalize ::: block headers (metadata order/spacing)
    def header(m):
        colons, btype, title, meta = m.group(1), m.group(2), m.group(3), m.group(4)
        parts = {}
        if meta:
            for key in ("label", "synonyms", "tags"):
                km = re.search(rf"{key}:\s*([^}}]*?)(?:,\s*(?:label|synonyms|tags):|$)", meta)
                if km and km.group(1).strip():
                    parts[key] = re.sub(r"\s+", " ", km.group(1).strip().rstrip(","))
        canonical = f"{colons}{btype}"
        if title:
            canonical += f' "{title}"'
        if parts:
            canonical += " {" + ", ".join(f"{k}: {v}" for k, v in parts.items()) + "}"
        return canonical
    content = re.sub(StructuredMathParser.BLOCK_START_PATTERN, header, content)
    # normalize display math spacing/whitespace (comparison only)
    for placeholder, math in protector.display_math.items():
        inner = re.sub(r"\s+", " ", math[2:-2].strip())
        content = content.replace(placeholder, f"$$ {inner} $$")
    for placeholder, math in protector.inline_math.items():
        inner = re.sub(r"\s+", " ", math[1:-1]).strip()
        content = content.replace(placeholder, f"${inner}$")
    # canonicalize raw img tags (attribute order/spacing)
    def img_tag(m):
        attrs = dict(re.findall(r'([a-z]+)\s*=\s*"([^"]*)"', m.group(0)))
        parts = [f'{k}="{attrs[k]}"' for k in ("src", "alt", "width", "height") if k in attrs]
        return "<img " + " ".join(parts) + ">"
    content = re.sub(r"<img\b[^>]*>", img_tag, content)
    # a heading with no blank line after (or before) it renders identically
    content = re.sub(r"^(#{1,5} [^\n]*)\n(?!\n)", r"\1\n\n", content, flags=re.MULTILINE)
    content = re.sub(r"([^\n])\n(#{1,5} )", r"\1\n\n\2", content)
    # blank lines around ::: fence lines are presentation-insignificant:
    # give every fence line exactly one blank line on each side, then
    # collapse blank runs globally
    content = re.sub(r"\n(:::+)", r"\n\n\1", content)
    content = re.sub(r"^(:::+[^\n]*)\n", r"\1\n\n", content, flags=re.MULTILINE)
    # whitespace: strip line edges (the transpiler normalizes leading
    # indentation; markdown renders it identically), collapse blank runs
    lines = [line.strip() for line in content.split("\n")]
    content = "\n".join(lines)
    content = re.sub(r"[ \t]+", " ", content)
    content = re.sub(r"\n{2,}", "\n\n", content)
    return content.strip()


def verify(converter: Converter, tex: str) -> list:
    """Round-trip the LaTeX and compare; returns a list of problem strings."""
    problems = []
    from mathnotes.latex_processor import LatexDialectError
    try:
        meta2, content2 = parse_latex_file(tex, filepath="<roundtrip>")
    except LatexDialectError as e:
        lines = tex.split("\n")
        m = re.search(r":(\d+):", str(e))
        context = ""
        if m:
            ln = int(m.group(1))
            context = "\n    ".join(lines[max(0, ln - 3):ln + 2])
        return [f"emitted LaTeX does not round-trip: {e}\n    {context}"]
    original = converter.original_metadata
    for key in ("title", "description", "slug"):
        if str(original.get(key) or "") != str(meta2.get(key) or ""):
            problems.append(f"metadata {key!r}: {original.get(key)!r} != {meta2.get(key)!r}")
    orig_sources = original.get("sources") or []
    new_sources = meta2.get("sources") or []
    norm = lambda srcs: [{k: str(v) for k, v in s.items()} for s in srcs]
    if norm(orig_sources) != norm(new_sources):
        problems.append(f"sources differ: {orig_sources!r} != {new_sources!r}")
    a = _canonicalize(converter.original_content)
    b = _canonicalize(content2)
    if a != b:
        diff = "\n".join(difflib.unified_diff(
            a.split("\n"), b.split("\n"), "original.md", "roundtrip", lineterm="", n=1))
        problems.append("content drift after round-trip:\n" + diff)
    else:
        # canonical text matches — additionally render both sides (with only
        # rendering-neutral normalizations applied) through the markdown
        # library and compare HTML, which judges emphasis/list/paragraph
        # semantics exactly rather than via the regex approximations above
        import markdown as md_lib
        safe_a = _canonicalize(converter.original_content, semantic=False)
        safe_b = _canonicalize(content2, semantic=False)
        html_a = md_lib.Markdown(extensions=["extra"]).convert(safe_a)
        html_b = md_lib.Markdown(extensions=["extra"]).convert(safe_b)
        def norm(h):
            # whitespace just inside an emphasis boundary renders the same
            # as whitespace just outside it
            h = re.sub(r"\s+(</(?:em|strong)>)", r"\1 ", h)
            h = re.sub(r"(<(?:em|strong)>)\s+", r" \1", h)
            return re.sub(r"\s+", " ", h).strip()
        if norm(html_a) != norm(html_b):
            diff = "\n".join(difflib.unified_diff(
                html_a.split("\n"), html_b.split("\n"),
                "original.md rendered", "roundtrip rendered", lineterm="", n=1))
            problems.append("rendered HTML drift after round-trip:\n" + diff)
    return problems


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("files", nargs="+")
    ap.add_argument("--write", action="store_true", help="write <file>.tex on success")
    ap.add_argument("--stdout", action="store_true",
                    help="print the converted LaTeX to stdout (single file only; "
                         "for use when the content tree is mounted read-only)")
    args = ap.parse_args()
    if args.stdout and len(args.files) != 1:
        ap.error("--stdout takes exactly one file")

    failures = 0
    for md_path in args.files:
        try:
            converter = Converter(md_path)
            tex = converter.convert()
            problems = verify(converter, tex)
            if problems:
                failures += 1
                print(f"FAIL {md_path}")
                for p in problems:
                    print(f"  {p}")
                continue
            if args.stdout:
                sys.stdout.write(tex)
            elif args.write:
                tex_path = Path(md_path).with_suffix(".tex")
                tex_path.write_text(tex, encoding="utf-8")
                print(f"OK   {md_path} -> {tex_path} (round-trip verified)")
            else:
                print(f"OK   {md_path} (round-trip verified; use --write to emit)")
        except ConversionError as e:
            failures += 1
            print(f"FAIL {e}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
