"""LaTeX content dialect for mathnotes.

Transpiles .tex content files (a disciplined LaTeX subset defined in
docs/superpowers/specs/2026-07-07-latex-content-format-design.md) into the
internal markdown dialect consumed by the existing parsing pipeline
(:::type blocks, @label refs, [[slug]] links, {% include_demo %} tags).
"""

import re
from typing import Any, Dict, List, Optional, Tuple

from pylatexenc import latexwalker, macrospec
from pylatexenc.latexwalker import (
    LatexCharsNode,
    LatexCommentNode,
    LatexEnvironmentNode,
    LatexGroupNode,
    LatexMacroNode,
    LatexMathNode,
    LatexSpecialsNode,
    LatexWalker,
)

from .structured_math import MathBlockType


class LatexDialectError(ValueError):
    """LaTeX outside the supported mathnotes dialect. Message is file:line: what."""


_BLOCK_ENV_NAMES = {t.value for t in MathBlockType}
_METADATA_MACROS = ("title", "description", "slug")
_IGNORED_MACROS = {"documentclass", "usepackage", "maketitle"}
_STYLE_MACROS = {"emph": "*", "textit": "*", "textbf": "**", "texttt": "`"}
_SECTION_LEVELS = {"section": 1, "subsection": 2, "subsubsection": 3, "paragraph": 4, "subparagraph": 5}
_ESCAPED_CHAR_MACROS = {"%", "&", "#", "_", "{", "}", " "}

_THEOREM_LIKE = {"theorem", "lemma", "proposition"}
_ATTACHABLE_NOTES = {"note", "remark", "example", "intuition"}
_LABEL_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_:-]*$")


class _BlockNode:
    def __init__(
        self,
        env_name: str,
        title: Optional[str],
        label: Optional[str],
        content: str,
        synonyms: Optional[str] = None,
        tags: Optional[str] = None,
    ):
        self.env_name = env_name
        self.title = title
        self.label = label
        self.content = content  # may contain \x02<i>\x02 markers for inline children
        self.synonyms = synonyms
        self.tags = tags
        self.children: List["_BlockNode"] = []         # attached amsthm siblings
        self.inline_children: List["_BlockNode"] = []  # literally nested environments


class _LstlistingArgsParser(macrospec.VerbatimArgsParser):
    """Verbatim-content parser for \\begin{lstlisting}...\\end{lstlisting}.

    pylatexenc's VerbatimArgsParser hardcodes \\end{verbatim}; this variant
    scans for \\end{lstlisting} instead. Any leading [options] remain part of
    the verbatim text and are handled by the transpiler.
    """

    def __init__(self):
        super().__init__(verbatim_arg_type="verbatim-environment")

    def parse_args(self, w, pos, parsing_state=None):
        end_marker = r"\end{lstlisting}"
        endpos = w.s.find(end_marker, pos)
        if endpos == -1:
            raise latexwalker.LatexWalkerParseError(
                s=w.s, pos=pos, msg=r"Cannot find matching \end{lstlisting}"
            )
        len_ = endpos - pos
        argd = macrospec.ParsedVerbatimArgs(
            verbatim_chars_node=w.make_node(
                latexwalker.LatexCharsNode,
                parsing_state=parsing_state,
                chars=w.s[pos:pos + len_],
                pos=pos,
                len=len_,
            )
        )
        return (argd, pos, len_)


def _latex_context():
    ctx = latexwalker.get_default_latex_context_db()
    ctx.add_context_category(
        "mathnotes",
        prepend=True,
        macros=[
            macrospec.MacroSpec("dref", "[{"),
            macrospec.MacroSpec("pagelink", "[{"),
            macrospec.MacroSpec("includedemo", "{"),
            macrospec.MacroSpec("description", "{"),
            macrospec.MacroSpec("slug", "{"),
            macrospec.MacroSpec("detach", ""),
            macrospec.MacroSpec("source", "{"),
            macrospec.MacroSpec("synonyms", "{"),
            macrospec.MacroSpec("tags", "{"),
            macrospec.MacroSpec("href", "{{"),
            macrospec.MacroSpec("paragraph", "*[{"),
            macrospec.MacroSpec("subparagraph", "*[{"),
            macrospec.MacroSpec("includegraphics", "[{"),
        ],
        environments=[
            macrospec.EnvironmentSpec(name, "[") for name in sorted(_BLOCK_ENV_NAMES)
        ] + [
            macrospec.EnvironmentSpec("lstlisting", args_parser=_LstlistingArgsParser()),
        ],
    )
    return ctx


_CONTEXT = _latex_context()


def parse_latex_file(source: str, filepath: str = "<latex>") -> Tuple[Dict[str, Any], str]:
    """Parse a .tex content file into (metadata, internal_markdown)."""
    return _Transpiler(source, filepath).run()


class _Transpiler:
    def __init__(self, source: str, filepath: str):
        self.source = source
        self.filepath = filepath

    def run(self) -> Tuple[Dict[str, Any], str]:
        try:
            walker = LatexWalker(self.source, latex_context=_CONTEXT, tolerant_parsing=False)
            nodes, _, _ = walker.get_latex_nodes()
        except latexwalker.LatexWalkerParseError as e:
            raise LatexDialectError(f"{self.filepath}: {e}") from e

        metadata: Dict[str, Any] = {"layout": "page"}
        body = nodes
        for n in nodes:
            if isinstance(n, LatexEnvironmentNode) and n.environmentname == "document":
                body = n.nodelist
                break
        self._scan_metadata(nodes, metadata)
        if body is not nodes:
            self._scan_metadata(body, metadata)

        content = self._transpile_body(body)
        content = re.sub(r"\n{3,}", "\n\n", content).strip() + "\n"
        return metadata, content

    # --- helpers ---

    def _err(self, node, message: str):
        line = self.source[: node.pos].count("\n") + 1
        raise LatexDialectError(f"{self.filepath}:{line}: {message}")

    def _chars_arg(self, macro_node) -> str:
        """Plain-text mandatory (last) argument of a macro, e.g. \\label{...}."""
        args = macro_node.nodeargd.argnlist if macro_node.nodeargd else []
        group = args[-1] if args else None
        if group is None:
            self._err(macro_node, f"\\{macro_node.macroname} requires an argument")
        text = "".join(
            n.chars for n in group.nodelist if isinstance(n, LatexCharsNode)
        ).strip()
        if not text:
            self._err(macro_node, f"\\{macro_node.macroname} argument must be plain text")
        return text

    def _url_text(self, group, n) -> str:
        """URL/path text from a braced group: chars, specials (~), and
        escaped characters (\\% \\# etc., hyperref's documented URL form)."""
        parts = []
        for c in group.nodelist:
            if isinstance(c, LatexCharsNode):
                parts.append(c.chars)
            elif isinstance(c, LatexSpecialsNode):
                parts.append(c.specials_chars)
            elif isinstance(c, LatexMacroNode) and c.macroname in _ESCAPED_CHAR_MACROS | {"$"}:
                parts.append(c.macroname)
            elif isinstance(c, LatexGroupNode):
                parts.append(self._url_text(c, n))
            elif isinstance(c, LatexCommentNode):
                self._err(n, "escape % as \\% inside URLs/paths")
            else:
                self._err(n, "URLs/paths must be plain text (escape specials with \\)")
        return "".join(parts).strip()

    def _scan_metadata(self, nodes, metadata: Dict[str, Any]):
        for n in nodes:
            if isinstance(n, LatexMacroNode) and n.macroname in _METADATA_MACROS:
                metadata[n.macroname] = self._chars_arg(n)
            elif isinstance(n, LatexMacroNode) and n.macroname == "source":
                metadata.setdefault("sources", []).append(self._parse_source(n))

    def _parse_source(self, n) -> Dict[str, str]:
        """Parse \\source{key=value, key={braced value}, ...} into a dict.

        Mirrors the sources.yaml entry schema; braced values may contain
        commas, bare values may not.
        """
        args = n.nodeargd.argnlist if n.nodeargd else []
        group = args[-1] if args else None
        if group is None:
            self._err(n, "\\source requires an argument")
        parts: List[str] = []
        groups: List[Any] = []
        for c in group.nodelist:
            if isinstance(c, LatexCharsNode):
                parts.append(c.chars)
            elif isinstance(c, LatexGroupNode):
                parts.append(f"\x00{len(groups)}\x00")
                groups.append(c)
            elif isinstance(c, LatexCommentNode):
                parts.append(c.comment_post_space)
            else:
                self._err(c, "\\source values must be plain text or {braced text}")
        entry: Dict[str, str] = {}
        for piece in "".join(parts).split(","):
            piece = piece.strip()
            if not piece:
                continue
            if "=" not in piece:
                self._err(n, f"\\source expects key=value pairs, got '{piece}'")
            key, value = piece.split("=", 1)
            key, value = key.strip(), value.strip()
            placeholder = re.fullmatch(r"\x00(\d+)\x00", value)
            if placeholder:
                value = self._prose(groups[int(placeholder.group(1))].nodelist).strip()
            if not key or not value:
                self._err(n, "\\source keys and values must be non-empty")
            entry[key] = value
        if not entry:
            self._err(n, "\\source requires at least one key=value pair")
        return entry

    # --- transpilation (extended in later tasks) ---

    def _transpile_body(self, nodes) -> str:
        out: List[str] = []
        anchor: Optional[_BlockNode] = None      # open root block accepting attachments
        proof_target: Optional[_BlockNode] = None  # where the next proof attaches

        def flush():
            nonlocal anchor, proof_target
            if anchor is not None:
                out.append(self._emit_block(anchor, 0))
            anchor = None
            proof_target = None

        for n in nodes:
            if isinstance(n, LatexEnvironmentNode) and n.environmentname in _BLOCK_ENV_NAMES:
                blk = self._parse_block_env(n)
                name = blk.env_name
                if name in _THEOREM_LIKE or name == "exercise":
                    flush()
                    anchor = blk
                    proof_target = blk
                elif name in ("definition", "axiom"):
                    flush()
                    out.append(self._emit_block(blk, 0))
                elif name == "corollary":
                    if anchor is not None:
                        anchor.children.append(blk)
                    else:
                        anchor = blk
                    proof_target = blk
                elif name == "proof":
                    if proof_target is None:
                        self._err(n, "proof has no preceding theorem-like statement")
                    proof_target.children.append(blk)
                elif name == "solution":
                    if anchor is None or anchor.env_name != "exercise":
                        self._err(n, "solution has no preceding exercise")
                    anchor.children.append(blk)
                else:  # _ATTACHABLE_NOTES
                    if anchor is not None:
                        anchor.children.append(blk)
                    else:
                        out.append(self._emit_block(blk, 0))
            elif isinstance(n, LatexMacroNode) and n.macroname == "detach":
                flush()
            elif isinstance(n, LatexMacroNode) and n.macroname == "source":
                # Page metadata, already collected by _scan_metadata; does not
                # break theorem/proof attachment
                continue
            elif isinstance(n, LatexMacroNode) and n.macroname in _SECTION_LEVELS:
                flush()
                out.append(self._macro(n))
            elif isinstance(n, LatexCharsNode) and not n.chars.strip():
                if anchor is None:
                    out.append(re.sub(r"\n[ \t]+", "\n", n.chars))
            elif isinstance(n, LatexCommentNode):
                continue
            else:
                flush()
                out.append(self._prose([n]))
        flush()
        return "".join(out)

    def _parse_block_env(self, n) -> _BlockNode:
        title = None
        args = n.nodeargd.argnlist if n.nodeargd else []
        if args and args[0] is not None:
            title = self._prose(args[0].nodelist).strip()
            title = " ".join(title.split())
            if '"' in title:
                self._err(n, "block title may not contain a double quote")
        body = list(n.nodelist)
        extracted: Dict[str, str] = {}
        i = 0
        while i < len(body):
            child = body[i]
            if isinstance(child, LatexMacroNode) and child.macroname in ("label", "synonyms", "tags"):
                name = child.macroname
                if name in extracted:
                    self._err(child, f"multiple \\{name} commands in one environment")
                if name == "synonyms" and n.environmentname != "definition":
                    self._err(child, "\\synonyms is only supported on definition environments")
                value = self._chars_arg(child)
                if name == "label" and not _LABEL_RE.match(value):
                    self._err(child, f"invalid block label '{value}'")
                extracted[name] = value
                del body[i]
                continue
            i += 1
        # Literally nested block environments become inline children at
        # marker positions, preserving surrounding prose exactly
        inline_children: List[_BlockNode] = []
        pieces: List[str] = []
        buffer: List[Any] = []

        def flush_buffer():
            if buffer:
                pieces.append(self._prose(buffer))
                buffer.clear()

        for child in body:
            if isinstance(child, LatexEnvironmentNode) and child.environmentname in _BLOCK_ENV_NAMES:
                flush_buffer()
                pieces.append(f"\x02{len(inline_children)}\x02")
                inline_children.append(self._parse_block_env(child))
            else:
                buffer.append(child)
        flush_buffer()
        content = "".join(pieces).strip()
        blk = _BlockNode(
            n.environmentname,
            title,
            extracted.get("label"),
            content,
            synonyms=extracted.get("synonyms"),
            tags=extracted.get("tags"),
        )
        blk.inline_children = inline_children
        return blk

    def _emit_block(self, blk: _BlockNode, depth: int) -> str:
        fence = ":" * (3 + depth)
        header = f"{fence}{blk.env_name}"
        if blk.title:
            header += f' "{blk.title}"'
        meta_parts = []
        if blk.label:
            meta_parts.append(f"label: {blk.label}")
        if blk.synonyms:
            meta_parts.append(f"synonyms: {blk.synonyms}")
        if blk.tags:
            meta_parts.append(f"tags: {blk.tags}")
        if meta_parts:
            # Order matters: _parse_metadata's synonyms regex terminates on
            # ", tags:" so tags must come last
            header += " {" + ", ".join(meta_parts) + "}"
        content = blk.content
        if blk.inline_children:
            content = re.sub(
                "\x02(\\d+)\x02",
                lambda m: "\n" + self._emit_block(
                    blk.inline_children[int(m.group(1))], depth + 1
                ).strip("\n") + "\n",
                content,
            )
        parts = [header]
        if content:
            parts += ["", content]
        for child in blk.children:
            parts += ["", self._emit_block(child, depth + 1).strip("\n")]
        parts += [fence]
        return "\n\n" + "\n".join(parts) + "\n\n"

    def _prose(self, nodes) -> str:
        out = []
        for n in nodes:
            if isinstance(n, LatexCharsNode):
                out.append(re.sub(r"\n[ \t]+", "\n", n.chars))
            elif isinstance(n, LatexCommentNode):
                out.append(re.sub(r"\n[ \t]+", "\n", n.comment_post_space))
            elif isinstance(n, LatexGroupNode):
                out.append(self._prose(n.nodelist))
            elif isinstance(n, LatexMacroNode):
                out.append(self._macro(n))
            elif isinstance(n, LatexMathNode):
                out.append(self._math(n))
            elif isinstance(n, LatexSpecialsNode):
                out.append(" " if n.specials_chars == "~" else n.specials_chars)
            elif isinstance(n, LatexEnvironmentNode):
                out.append(self._environment(n))
            else:
                self._err(n, f"unsupported LaTeX construct ({type(n).__name__})")
        return "".join(out)

    def _macro(self, n) -> str:
        name = n.macroname
        if name in _STYLE_MACROS:
            args = n.nodeargd.argnlist if n.nodeargd else []
            group = args[-1] if args else None
            if group is None:
                self._err(n, f"\\{name} requires an argument")
            d = _STYLE_MACROS[name]
            inner = self._prose(group.nodelist)
            stripped = inner.strip()
            if not stripped:
                self._err(n, f"\\{name} argument is empty")
            # edge whitespace moves outside the markdown delimiters (markdown
            # would not recognize `* text*` as emphasis); renders identically
            lead = inner[: len(inner) - len(inner.lstrip())]
            trail = inner[len(inner.rstrip()):]
            return f"{lead}{d}{stripped}{d}{trail}"
        if name in _SECTION_LEVELS:
            title = self._prose(n.nodeargd.argnlist[-1].nodelist).strip()
            return f"\n\n{'#' * _SECTION_LEVELS[name]} {title}\n\n"
        if name in ("dots", "ldots"):
            return "..."
        if name == "textasciitilde":
            return "~"
        if name == "textasciicircum":
            return "^"
        if name == "$":
            # A bare $ would be mis-paired into inline math by MathProtector
            # downstream; emit the HTML entity instead
            return "&#36;"
        if name in _ESCAPED_CHAR_MACROS:
            return name
        if name == "href":
            url_group, text_group = n.nodeargd.argnlist[-2], n.nodeargd.argnlist[-1]
            url = self._url_text(url_group, n)
            if not url:
                self._err(n, "\\href requires a plain-text URL")
            text = self._prose(text_group.nodelist).strip()
            return f"[{text}]({url})"
        if name == "includegraphics":
            opt, mand = n.nodeargd.argnlist
            path = self._url_text(mand, n)
            if not path:
                self._err(n, "\\includegraphics requires a path")
            options: Dict[str, str] = {}
            if opt is not None:
                groups = [c for c in opt.nodelist if isinstance(c, LatexGroupNode)]
                flat = "".join(
                    c.chars if isinstance(c, LatexCharsNode) else "\x00"
                    for c in opt.nodelist
                )
                group_index = 0
                for piece in flat.split(","):
                    piece = piece.strip()
                    if not piece:
                        continue
                    if "=" not in piece:
                        self._err(n, "\\includegraphics options must be key=value pairs")
                    key, value = piece.split("=", 1)
                    key, value = key.strip(), value.strip()
                    if value == "\x00":
                        value = self._prose(groups[group_index].nodelist).strip()
                        group_index += 1
                    if key not in ("alt", "title", "width", "height"):
                        self._err(n, f"\\includegraphics option '{key}' has no meaning on the site (alt, title, width, height)")
                    options[key] = value
            if "width" in options or "height" in options:
                # sizing has no markdown syntax; emit a raw img tag, which is
                # exactly how the markdown dialect expresses sized images
                if "title" in options:
                    self._err(n, "\\includegraphics: title cannot be combined with width/height")
                attrs = [f'src="{path}"']
                if options.get("alt"):
                    attrs.append(f'alt="{options["alt"]}"')
                for key in ("width", "height"):
                    if key in options:
                        value = options[key]
                        if value.endswith("px"):
                            value = value[:-2]
                        attrs.append(f'{key}="{value}"')
                return f'<img {" ".join(attrs)}>'
            alt = options.get("alt", "")
            if "title" in options:
                return f'![{alt}]({path} "{options["title"]}")'
            return f"![{alt}]({path})"
        if name == "dref":
            return self._dref(n)
        if name == "pagelink":
            return self._pagelink(n)
        if name == "includedemo":
            return self._includedemo(n)
        if name in _METADATA_MACROS or name in _IGNORED_MACROS or name == "detach":
            return ""
        if name == "label":
            self._err(n, "\\label is only supported at the top of a block environment")
        if name in ("synonyms", "tags"):
            self._err(n, f"\\{name} is only supported at the top of a block environment")
        if name == "source":
            self._err(n, "\\source is only supported at page level, outside block environments")
        self._err(n, f"unsupported command \\{name} — extend the dialect in latex_processor.py if needed")

    def _math(self, n) -> str:
        verbatim = n.latex_verbatim()
        open_d, close_d = n.delimiters
        inner = verbatim[len(open_d): len(verbatim) - len(close_d)].strip()
        if n.displaytype == "display":
            return f"$$ {inner} $$"
        return f"${inner}$"

    def _environment(self, n) -> str:
        name = n.environmentname
        if name in ("itemize", "enumerate"):
            return self._list(n, ordered=(name == "enumerate"))
        if name in ("verbatim", "lstlisting"):
            return self._code_block(n)
        if name in _BLOCK_ENV_NAMES:
            self._err(
                n,
                f"{name} environment nested inside a non-block construct — block "
                f"environments may nest only directly inside other block environments",
            )
        self._err(n, f"unsupported environment '{name}'")

    def _code_block(self, n) -> str:
        """verbatim / lstlisting environments become fenced code blocks."""
        text = n.nodeargd.verbatim_text
        lang = ""
        if n.environmentname == "lstlisting":
            options = re.match(r"^\[([^\]]*)\]", text)
            if options:
                text = text[options.end():]
                lang_opt = re.search(r"language\s*=\s*([A-Za-z0-9+#-]+)", options.group(1))
                if lang_opt:
                    lang = lang_opt.group(1).lower()
        return f"\n\n```{lang}\n{text.strip(chr(10))}\n```\n\n"

    def _list(self, n, ordered: bool) -> str:
        return "\n\n" + "\n".join(self._list_lines(n, ordered, indent=0)) + "\n\n"

    def _list_lines(self, n, ordered: bool, indent: int) -> List[str]:
        items: List[list] = []
        for child in n.nodelist:
            if isinstance(child, LatexMacroNode) and child.macroname == "item":
                items.append([])
            elif isinstance(child, LatexCommentNode):
                continue
            elif not items:
                if isinstance(child, LatexCharsNode) and not child.chars.strip():
                    continue
                self._err(child, "list content before the first \\item")
            else:
                items[-1].append(child)
        marker = "1." if ordered else "-"
        pad = " " * indent
        lines: List[str] = []
        for item in items:
            sublists = [
                c for c in item
                if isinstance(c, LatexEnvironmentNode) and c.environmentname in ("itemize", "enumerate")
            ]
            sublist_ids = {id(s) for s in sublists}
            text_nodes = [c for c in item if id(c) not in sublist_ids]
            lines.append(f"{pad}{marker} {' '.join(self._prose(text_nodes).split())}")
            for sub in sublists:
                lines.extend(self._list_lines(sub, sub.environmentname == "enumerate", indent + 4))
        return lines

    def _dref(self, n) -> str:
        opt, mand = n.nodeargd.argnlist
        label = "".join(
            c.chars for c in mand.nodelist if isinstance(c, LatexCharsNode)
        ).strip()
        if not label:
            self._err(n, "\\dref requires a non-empty label")
        if opt is None:
            return f"@{label}"
        text = self._prose(opt.nodelist).strip()
        return f"@{{{text}|{label}}}"

    def _pagelink(self, n) -> str:
        opt, mand = n.nodeargd.argnlist
        slug = "".join(
            c.chars for c in mand.nodelist if isinstance(c, LatexCharsNode)
        ).strip()
        if not slug:
            self._err(n, "\\pagelink requires a non-empty slug")
        if opt is None:
            return f"[[{slug}]]"
        text = self._prose(opt.nodelist).strip()
        return f"[[{text}|{slug}]]"

    def _includedemo(self, n) -> str:
        demo = self._chars_arg(n)
        return f'\n\n{{% include_demo "{demo}" %}}\n\n'
