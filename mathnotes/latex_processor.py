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
_SECTION_LEVELS = {"section": 1, "subsection": 2, "subsubsection": 3}
_ESCAPED_CHAR_MACROS = {"%", "&", "#", "_", "{", "}", " "}

_THEOREM_LIKE = {"theorem", "lemma", "proposition"}
_ATTACHABLE_NOTES = {"note", "remark", "example", "intuition"}
_LABEL_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_:-]*$")


class _BlockNode:
    def __init__(self, env_name: str, title: Optional[str], label: Optional[str], content: str):
        self.env_name = env_name
        self.title = title
        self.label = label
        self.content = content
        self.children: List["_BlockNode"] = []


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
        ],
        environments=[
            macrospec.EnvironmentSpec(name, "[") for name in sorted(_BLOCK_ENV_NAMES)
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

    def _scan_metadata(self, nodes, metadata: Dict[str, Any]):
        for n in nodes:
            if isinstance(n, LatexMacroNode) and n.macroname in _METADATA_MACROS:
                metadata[n.macroname] = self._chars_arg(n)

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
        label = None
        for i, child in enumerate(body):
            if isinstance(child, LatexMacroNode) and child.macroname == "label":
                label = self._chars_arg(child)
                if not _LABEL_RE.match(label):
                    self._err(child, f"invalid block label '{label}'")
                del body[i]
                break
        for child in body:
            if isinstance(child, LatexMacroNode) and child.macroname == "label":
                self._err(child, "multiple \\label commands in one environment")
        content = self._prose(body).strip()
        return _BlockNode(n.environmentname, title, label, content)

    def _emit_block(self, blk: _BlockNode, depth: int) -> str:
        fence = ":" * (3 + depth)
        header = f"{fence}{blk.env_name}"
        if blk.title:
            header += f' "{blk.title}"'
        if blk.label:
            header += f" {{label: {blk.label}}}"
        parts = [header]
        if blk.content:
            parts += ["", blk.content]
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
            return f"{d}{self._prose(group.nodelist).strip()}{d}"
        if name in _SECTION_LEVELS:
            title = self._prose(n.nodeargd.argnlist[-1].nodelist).strip()
            return f"\n\n{'#' * _SECTION_LEVELS[name]} {title}\n\n"
        if name in ("dots", "ldots"):
            return "..."
        if name == "$":
            # A bare $ would be mis-paired into inline math by MathProtector
            # downstream; emit the HTML entity instead
            return "&#36;"
        if name in _ESCAPED_CHAR_MACROS:
            return name
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
        if name in _BLOCK_ENV_NAMES:
            self._err(
                n,
                f"nested {name} environment — mathnotes uses the amsthm sibling "
                f"convention (close the outer environment first)",
            )
        self._err(n, f"unsupported environment '{name}'")

    def _list(self, n, ordered: bool) -> str:
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
                if isinstance(child, LatexEnvironmentNode) and child.environmentname in ("itemize", "enumerate"):
                    self._err(child, "nested lists are not supported in the dialect")
                items[-1].append(child)
        marker = "1." if ordered else "-"
        lines = [f"{marker} {' '.join(self._prose(item).split())}" for item in items]
        return "\n\n" + "\n".join(lines) + "\n\n"

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
