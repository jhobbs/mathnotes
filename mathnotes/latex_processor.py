"""Parses .tex content files (the mathnotes LaTeX dialect) directly into a
typed PageDoc: prose HTML segments plus MathBlock trees. References are
emitted as placeholder elements resolved later against the block index
(ref_resolver.py). render_math() is the single seam through which math
becomes output markup.
"""

import os
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

from .structured_math import (
    MathBlockType,
    MathBlock,
    PageDoc,
    body_text,
    finalize_blocks,
    CHILD_MARKER_RE,
)

import html as html_lib


def render_math(latex: str, display: bool) -> str:
    """THE math seam: every math node renders through this one function.

    Part 1: emit MathJax delimiter text (client-side rendering, as before).
    Part 2 will swap this body for build-time MathML.
    """
    inner = html_lib.escape(latex.strip(), quote=False)
    return f"$$ {inner} $$" if display else f"${inner}$"


class LatexDialectError(ValueError):
    """LaTeX outside the supported mathnotes dialect. Message is file:line: what."""


_BLOCK_ENV_NAMES = {t.value for t in MathBlockType}
_METADATA_MACROS = ("title", "description", "slug")
_IGNORED_MACROS = {"documentclass", "usepackage", "maketitle"}
_STYLE_MACROS = {"emph": "em", "textit": "em", "textbf": "strong", "texttt": "code"}
_ISLAND = "\x01"  # wraps block-level HTML islands inside a prose stream
_SECTION_LEVELS = {"section": 1, "subsection": 2, "subsubsection": 3, "paragraph": 4, "subparagraph": 5}
_ESCAPED_CHAR_MACROS = {"%", "&", "#", "_", "{", "}", " "}
_TABULAR_ALIGN = {"l": "left", "c": "center", "r": "right"}

_THEOREM_LIKE = {"theorem", "lemma", "proposition"}
_ATTACHABLE_NOTES = {"note", "remark", "example", "intuition"}
_LABEL_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_:-]*$")


def _esc(text: str) -> str:
    return html_lib.escape(text, quote=False)


def _island(html_str: str) -> str:
    return f"{_ISLAND}{html_str}{_ISLAND}"


def _paragraphize(stream: str) -> str:
    """Convert an inline-HTML stream with \\x01-wrapped block islands and
    blank-line paragraph breaks into final HTML."""
    out = []
    for i, part in enumerate(stream.split(_ISLAND)):
        if i % 2 == 1:
            out.append(part)
        else:
            for para in re.split(r"\n\s*\n", part):
                para = para.strip()
                if not para:
                    continue
                out.append(f"<p>{para}</p>")
    return "\n".join(out)


def _collapse_islands(stream: str) -> str:
    """Whitespace-collapse a prose stream (like ' '.join(s.split())) while
    leaving \\x01-wrapped islands — already-final HTML such as verbatim
    blocks or nested lists — untouched. Used for list-item text, where
    naive whitespace collapsing would destroy newlines inside embedded
    <pre><code> blocks."""
    parts = stream.split(_ISLAND)
    out = []
    for i, part in enumerate(parts):
        out.append(part if i % 2 == 1 else " ".join(part.split()))
    return "".join(out)


def _heading_id(title_html: str) -> str:
    return MathBlock.normalize_label_from_title(re.sub(r"<[^>]+>", "", title_html))


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
            macrospec.MacroSpec("dembed", "{"),
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
            macrospec.EnvironmentSpec("tabular", "{"),
        ],
    )
    return ctx


_CONTEXT = _latex_context()


def parse_latex_file(source: str, filepath: str = "<latex>") -> Tuple[Dict[str, Any], PageDoc]:
    """Parse a .tex content file into (metadata, PageDoc)."""
    return _Parser(source, filepath).run()


class _Parser:
    def __init__(self, source: str, filepath: str):
        self.source = source
        self.filepath = filepath
        self._demo_counter = 0

    def run(self) -> Tuple[Dict[str, Any], PageDoc]:
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

        items = self._build_items(body)
        top_blocks = [it for it in items if isinstance(it, MathBlock)]
        try:
            finalize_blocks(top_blocks)
        except ValueError as e:
            raise LatexDialectError(f"{self.filepath}: {e}") from e
        return metadata, PageDoc(items=items)

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
        for n in group.nodelist:
            if not isinstance(n, (LatexCharsNode, LatexCommentNode)):
                self._err(
                    macro_node,
                    f"\\{macro_node.macroname} argument must be plain text "
                    f"(no math or commands)",
                )
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

    # --- item assembly (block environments extended in Task 3) ---

    def _build_items(self, nodes) -> list:
        items: list = []
        prose_buf: List[str] = []
        anchor: Optional[MathBlock] = None
        proof_target: Optional[MathBlock] = None

        def flush_prose():
            if prose_buf:
                html_str = _paragraphize("".join(prose_buf))
                prose_buf.clear()
                if html_str:
                    items.append(html_str)

        def flush_anchor():
            nonlocal anchor, proof_target
            if anchor is not None:
                items.append(anchor)
            anchor = None
            proof_target = None

        for n in nodes:
            if isinstance(n, LatexEnvironmentNode) and n.environmentname in _BLOCK_ENV_NAMES:
                flush_prose()
                blk = self._parse_block_env(n)
                name = n.environmentname
                if name in _THEOREM_LIKE or name == "exercise":
                    flush_anchor()
                    anchor = blk
                    proof_target = blk
                elif name in ("definition", "axiom"):
                    flush_anchor()
                    items.append(blk)
                elif name == "corollary":
                    if anchor is not None:
                        blk.parent = anchor
                        anchor.children.append(blk)
                    else:
                        anchor = blk
                    proof_target = blk
                elif name == "proof":
                    if proof_target is None:
                        self._err(n, "proof has no preceding theorem-like statement")
                    blk.parent = proof_target
                    proof_target.children.append(blk)
                elif name == "solution":
                    if anchor is None or anchor.block_type != MathBlockType.EXERCISE:
                        self._err(n, "solution has no preceding exercise")
                    blk.parent = anchor
                    anchor.children.append(blk)
                else:  # _ATTACHABLE_NOTES
                    if anchor is not None:
                        blk.parent = anchor
                        anchor.children.append(blk)
                    else:
                        items.append(blk)
            elif isinstance(n, LatexMacroNode) and n.macroname == "detach":
                flush_anchor()
            elif isinstance(n, LatexMacroNode) and n.macroname == "source":
                continue
            elif isinstance(n, LatexMacroNode) and n.macroname in _SECTION_LEVELS:
                flush_anchor()
                prose_buf.append(self._macro(n))
            elif isinstance(n, LatexCharsNode) and not n.chars.strip():
                if anchor is None:
                    prose_buf.append(re.sub(r"\n[ \t]+", "\n", n.chars))
            elif isinstance(n, LatexCommentNode):
                continue
            else:
                flush_anchor()
                prose_buf.append(self._prose([n]))
        flush_anchor()
        flush_prose()
        return items

    def _parse_block_env(self, n) -> MathBlock:
        title = None
        args = n.nodeargd.argnlist if n.nodeargd else []
        if args and args[0] is not None:
            title = body_text(self._prose(args[0].nodelist))
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

        children: List[MathBlock] = []
        pieces: List[str] = []
        buffer: List[Any] = []

        def flush_buffer():
            if buffer:
                pieces.append(self._prose(buffer))
                buffer.clear()

        for child in body:
            if isinstance(child, LatexEnvironmentNode) and child.environmentname in _BLOCK_ENV_NAMES:
                flush_buffer()
                pieces.append(_island(f"\x02{len(children)}\x02"))
                children.append(self._parse_block_env(child))
            else:
                buffer.append(child)
        flush_buffer()

        body_html = _paragraphize("".join(pieces))
        metadata = {k: v for k, v in extracted.items()}
        blk = MathBlock(
            block_type=MathBlockType(n.environmentname),
            content=body_text(CHILD_MARKER_RE.sub(" ", body_html)),
            title=title,
            label=extracted.get("label"),
            metadata=metadata,
        )
        blk.body_html = body_html
        blk.children = children
        for c in children:
            c.parent = blk
        return blk

    def _prose(self, nodes) -> str:
        out = []
        for n in nodes:
            if isinstance(n, LatexCharsNode):
                out.append(_esc(re.sub(r"\n[ \t]+", "\n", n.chars)))
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
            tag = _STYLE_MACROS[name]
            inner = self._prose(group.nodelist)
            stripped = inner.strip()
            if not stripped:
                self._err(n, f"\\{name} argument is empty")
            # edge whitespace moves outside the tag (mirrors markdown's
            # intra-word emphasis rule); renders identically
            lead = inner[: len(inner) - len(inner.lstrip())]
            trail = inner[len(inner.rstrip()):]
            return f"{lead}<{tag}>{stripped}</{tag}>{trail}"
        if name in _SECTION_LEVELS:
            lvl = _SECTION_LEVELS[name]
            title = self._prose(n.nodeargd.argnlist[-1].nodelist).strip()
            return _island(f'<h{lvl} id="{_heading_id(title)}">{title}</h{lvl}>')
        if name in ("dots", "ldots"):
            return "..."
        if name == "textasciitilde":
            return "~"
        if name == "textasciicircum":
            return "^"
        if name == "$":
            # A bare $ in DOM text would pair with another under MathJax's
            # delimiter scan; emit the HTML entity instead
            return "&#36;"
        if name in _ESCAPED_CHAR_MACROS:
            return _esc(name)
        if name == "href":
            url_group, text_group = n.nodeargd.argnlist[-2], n.nodeargd.argnlist[-1]
            url = self._url_text(url_group, n)
            if not url:
                self._err(n, "\\href requires a plain-text URL")
            return f'<a href="{html_lib.escape(url, quote=True)}">{self._prose(text_group.nodelist).strip()}</a>'
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
            src = self._fix_image_path(path)
            attrs = [f'src="{html_lib.escape(src, quote=True)}"',
                     f'alt="{html_lib.escape(options.get("alt", ""), quote=True)}"']
            if "title" in options:
                attrs.append(f'title="{html_lib.escape(options["title"], quote=True)}"')
            for key in ("width", "height"):
                if key in options:
                    value = options[key]
                    if value.endswith("px"):
                        value = value[:-2]
                    attrs.append(f'{key}="{html_lib.escape(value, quote=True)}"')
            return f'<img {" ".join(attrs)}>'
        if name == "dref":
            return self._dref(n)
        if name == "pagelink":
            return self._pagelink(n)
        if name == "dembed":
            return self._dembed(n)
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

    def _fix_image_path(self, path: str) -> str:
        if re.match(r"^(https?:|data:|/)", path):
            return path
        directory = os.path.dirname(self.filepath).replace("content/", "", 1).replace("content", "")
        return f"/mathnotes/{directory}/{path}".replace("//", "/")

    def _check_ref_text(self, n, text: str) -> None:
        """Optional-text arguments to \\dref/\\pagelink render through _prose,
        which can emit <a ...> (nested \\href/\\dref/\\pagelink) or an
        \\x01-wrapped block-level island. Both silently corrupt the
        resolver's non-greedy regex pairing over the emitted placeholders,
        so reject them here instead."""
        if "<a " in text or _ISLAND in text:
            self._err(n, f"\\{n.macroname} text may not contain links or block-level content")

    def _dref(self, n) -> str:
        opt, mand = n.nodeargd.argnlist
        label = "".join(c.chars for c in mand.nodelist if isinstance(c, LatexCharsNode)).strip()
        if not label:
            self._err(n, "\\dref requires a non-empty label")
        text = self._prose(opt.nodelist).strip() if opt is not None else ""
        self._check_ref_text(n, text)
        return f'<a data-dref="{html_lib.escape(label, quote=True)}">{text}</a>'

    def _pagelink(self, n) -> str:
        opt, mand = n.nodeargd.argnlist
        slug = "".join(c.chars for c in mand.nodelist if isinstance(c, LatexCharsNode)).strip()
        if not slug:
            self._err(n, "\\pagelink requires a non-empty slug")
        text = self._prose(opt.nodelist).strip() if opt is not None else ""
        self._check_ref_text(n, text)
        return f'<a data-pagelink="{html_lib.escape(slug, quote=True)}">{text}</a>'

    def _dembed(self, n) -> str:
        label = self._chars_arg(n)
        return _island(f'<div data-dembed="{html_lib.escape(label, quote=True)}"></div>')

    def _includedemo(self, n) -> str:
        demo = self._chars_arg(n)
        demo_id = f"demo-{demo}-{self._demo_counter}"
        self._demo_counter += 1
        return _island(
            f'<div class="demo-component" data-demo="{demo}" id="{demo_id}"></div>'
        )

    def _math(self, n) -> str:
        verbatim = n.latex_verbatim()
        open_d, close_d = n.delimiters
        inner = verbatim[len(open_d): len(verbatim) - len(close_d)].strip()
        return render_math(inner, n.displaytype == "display")

    def _environment(self, n) -> str:
        name = n.environmentname
        if name in ("itemize", "enumerate"):
            return _island(self._list_html(n, ordered=(name == "enumerate")))
        if name in ("verbatim", "lstlisting"):
            return self._code_html(n)
        if name == "tabular":
            return _island(self._tabular_html(n))
        if name in _BLOCK_ENV_NAMES:
            self._err(
                n,
                f"{name} environment nested inside a non-block construct — block "
                f"environments may nest only directly inside other block environments",
            )
        self._err(n, f"unsupported environment '{name}'")

    def _code_html(self, n) -> str:
        """verbatim / lstlisting environments become <pre><code> blocks."""
        text = n.nodeargd.verbatim_text
        lang = ""
        if n.environmentname == "lstlisting":
            options = re.match(r"^\[([^\]]*)\]", text)
            if options:
                text = text[options.end():]
                lang_opt = re.search(r"language\s*=\s*([A-Za-z0-9+#-]+)", options.group(1))
                if lang_opt:
                    lang = lang_opt.group(1).lower()
        lang_attr = f' class="language-{lang}"' if lang else ""
        code = _esc(text.strip("\n"))
        return _island(f"<pre><code{lang_attr}>{code}</code></pre>")

    def _tabular_colspec(self, n, group) -> List[str]:
        """Column alignments from a tabular's mandatory {colspec} argument.
        Only l/c/r are supported (| and whitespace ignored); anything else
        (e.g. p{2cm}) is a loud error naming the offending character."""
        text = group.latex_verbatim()
        if text.startswith("{") and text.endswith("}"):
            text = text[1:-1]
        aligns = []
        for ch in text:
            if ch in _TABULAR_ALIGN:
                aligns.append(_TABULAR_ALIGN[ch])
            elif ch == "|" or ch.isspace():
                continue
            else:
                self._err(n, f"unsupported tabular column spec character '{ch}' "
                              f"(only l, c, r, and | are supported)")
        if not aligns:
            self._err(n, "tabular column spec has no l/c/r columns")
        return aligns

    def _tabular_html(self, n) -> str:
        """tabular environment -> <table>. Rows split on the `\\\\` row
        terminator (a LatexMacroNode named '\\\\'); cells split on top-level
        `&` (a LatexSpecialsNode) — math nodes like $a & b$ are opaque at
        this level, so `&` inside math never splits a cell. `\\hline` nodes
        are dropped (PDF-only decoration). First row is the header."""
        args = n.nodeargd.argnlist if n.nodeargd else []
        group = args[-1] if args else None
        if group is None:
            self._err(n, "\\begin{tabular} requires a column-spec argument")
        aligns = self._tabular_colspec(n, group)

        rows: List[List[Any]] = [[]]
        for child in n.nodelist:
            if isinstance(child, LatexMacroNode) and child.macroname == "hline":
                continue
            if isinstance(child, LatexMacroNode) and child.macroname == "\\":
                rows.append([])
            else:
                rows[-1].append(child)

        def is_blank_row(nodes) -> bool:
            return all(isinstance(c, LatexCharsNode) and not c.chars.strip()
                       for c in nodes)

        while rows and is_blank_row(rows[-1]):
            rows.pop()

        def render_row(nodes, tag: str) -> str:
            cells: List[List[Any]] = [[]]
            for c in nodes:
                if isinstance(c, LatexSpecialsNode) and c.specials_chars == "&":
                    cells.append([])
                else:
                    cells[-1].append(c)
            if len(cells) > len(aligns):
                self._err(n, f"tabular row has {len(cells)} cells, more than "
                              f"the {len(aligns)}-column spec")
            tds = []
            for i, align in enumerate(aligns):
                text = _collapse_islands(self._prose(cells[i])) if i < len(cells) else ""
                tds.append(f'<{tag} style="text-align: {align};">{text}</{tag}>')
            return "<tr>\n" + "\n".join(tds) + "\n</tr>"

        out = ["<table>"]
        if rows:
            out.append("<thead>")
            out.append(render_row(rows[0], "th"))
            out.append("</thead>")
        out.append("<tbody>")
        for row in rows[1:]:
            out.append(render_row(row, "td"))
        out.append("</tbody>")
        out.append("</table>")
        return "\n".join(out)

    def _list_html(self, n, ordered: bool) -> str:
        """Raw (un-islanded) <ul>/<ol> HTML. Callers own island-wrapping: the
        top-level call in _environment wraps once; recursive sublist calls
        here embed the raw result directly in the parent <li> so a nested
        list never contributes extra \\x01 sentinels to the prose stream.

        <li> elements are newline-joined (matching the old markdown
        renderer's list output) rather than packed edge-to-edge: with no
        separating whitespace between adjacent tags, a word ending one item
        and a word starting the next collapse into a single glued token in
        any plain-text extraction of the page (screen readers, textContent,
        this site's own semantic-diff harness)."""
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
        tag = "ol" if ordered else "ul"
        lis = []
        for item in items:
            sublists = [c for c in item if isinstance(c, LatexEnvironmentNode)
                        and c.environmentname in ("itemize", "enumerate")]
            sub_ids = {id(s) for s in sublists}
            text_nodes = [c for c in item if id(c) not in sub_ids]
            inner = _collapse_islands(self._prose(text_nodes))
            for sub in sublists:
                inner += "\n" + self._list_html(sub, sub.environmentname == "enumerate")
            lis.append(f"<li>{inner}</li>")
        return f'<{tag}>\n' + "\n".join(lis) + f'\n</{tag}>'
