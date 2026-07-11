"""Global notation-macro registry.

\\notation{\\integers}{\\mathbb{Z}} inside a content block declares a
zero-argument math macro whose occurrences in math render as the expansion
AND cross-reference the declaring block. Because any file may use a macro
declared in any other file, the name -> expansion table must exist before
the first file is parsed: scan_content() is a cheap regex pre-scan over
content/**/*.tex (comments stripped), independent of the pylatexenc parse
that later associates each macro with its declaring block.

Expansions may use .sty MATH MACROS and MathJax builtins but not other
notation macros: the Python-side wrapping in render_math() substitutes
expansions textually in a single pass, so a notation macro surviving into
the sent TeX would be undefined in the worker.
"""

import os
import re
from typing import Dict, Optional, Tuple

_STY_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "latex", "mathnotes.sty")

_NAME_RE = re.compile(r"\\notation\s*\{")
_COMMENT_RE = re.compile(r"(?<!\\)%.*")
_STY_MACRO_RE = re.compile(r"\\(?:re)?newcommand\{\\([A-Za-z]+)\}")


class NotationError(ValueError):
    """Invalid notation declaration. Message includes file:line."""


def _sty_macro_names() -> set:
    with open(_STY_PATH, "r", encoding="utf-8") as f:
        sty = f.read()
    begin = sty.index("% BEGIN MATH MACROS")
    end = sty.index("% END MATH MACROS")
    return set(_STY_MACRO_RE.findall(sty[begin:end]))


def _read_group(text: str, pos: int, filepath: str, line: int) -> Tuple[str, int]:
    """Return (contents, position after closing brace) of the {...} group
    starting at text[pos] == '{'. Brace-counted, backslash-escape aware."""
    if pos >= len(text) or text[pos] != "{":
        raise NotationError(f"{filepath}:{line}: \\notation argument must be a {{...}} group")
    depth, i = 1, pos + 1
    while i < len(text) and depth > 0:
        if text[i] == "\\":
            i += 1
        elif text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
        i += 1
    if depth != 0:
        raise NotationError(f"{filepath}:{line}: unbalanced braces in \\notation")
    return text[pos + 1:i - 1], i


def scan_file(filepath: str, source: str) -> Dict[str, Tuple[str, int]]:
    """name -> (expansion, line) for one file's \\notation declarations."""
    found: Dict[str, Tuple[str, int]] = {}
    stripped = "\n".join(_COMMENT_RE.sub("", ln) for ln in source.split("\n"))
    for m in _NAME_RE.finditer(stripped):
        line = stripped[: m.start()].count("\n") + 1
        name_group, after = _read_group(stripped, m.end() - 1, filepath, line)
        name_match = re.fullmatch(r"\s*\\([A-Za-z]+)\s*", name_group)
        if not name_match:
            raise NotationError(
                f"{filepath}:{line}: \\notation's first argument must be a "
                f"single zero-argument macro like {{\\integers}}, got '{name_group}'")
        while after < len(stripped) and stripped[after].isspace():
            after += 1
        expansion, _ = _read_group(stripped, after, filepath, line)
        expansion = expansion.strip()
        if not expansion:
            raise NotationError(f"{filepath}:{line}: \\notation expansion is empty")
        name = name_match.group(1)
        if name in found:
            raise NotationError(
                f"{filepath}:{line}: \\{name} declared more than once in this file")
        found[name] = (expansion, line)
    return found


def scan_content(content_dir: str = "content") -> Dict[str, str]:
    """Pre-scan all .tex files for \\notation declarations.

    Raises NotationError (with every relevant file:line) on duplicate
    names, collisions with .sty MATH MACROS names, and expansions that
    reference other notation macros.
    """
    declared: Dict[str, Tuple[str, str, int]] = {}  # name -> (expansion, file, line)
    sty_names = _sty_macro_names()
    for root, dirs, files in os.walk(content_dir):
        dirs[:] = sorted(d for d in dirs if not d.startswith("."))
        for fname in sorted(files):
            if not fname.endswith(".tex"):
                continue
            filepath = os.path.join(root, fname)
            with open(filepath, "r", encoding="utf-8") as f:
                source = f.read()
            for name, (expansion, line) in scan_file(filepath, source).items():
                if name in declared:
                    prev = declared[name]
                    raise NotationError(
                        f"{filepath}:{line}: \\{name} already declared at "
                        f"{prev[1]}:{prev[2]}")
                if name in sty_names:
                    raise NotationError(
                        f"{filepath}:{line}: \\{name} collides with a macro in "
                        f"latex/mathnotes.sty MATH MACROS")
                declared[name] = (expansion, filepath, line)
    names = set(declared)
    for name, (expansion, filepath, line) in declared.items():
        used = set(re.findall(r"\\([A-Za-z]+)", expansion)) & names
        if used:
            used_list = ", ".join("\\" + u for u in sorted(used))
            raise NotationError(
                f"{filepath}:{line}: \\{name}'s expansion uses other notation "
                f"macro(s) {used_list} — expansions may only use .sty macros "
                f"and MathJax builtins")
    return {name: exp for name, (exp, _, _) in declared.items()}


# --- module-level registry (lazy; explicit refresh from the build) ---

_registry: Optional[Dict[str, str]] = None


def get_registry() -> Dict[str, str]:
    global _registry
    if _registry is None:
        _registry = scan_content("content") if os.path.isdir("content") else {}
    return _registry


def refresh_registry() -> bool:
    """Rescan; True if the registry changed (callers must then invalidate
    every content/page cache — the registry is input to all math)."""
    global _registry
    old = get_registry()
    _registry = scan_content("content") if os.path.isdir("content") else {}
    return _registry != old


def reset_registry() -> None:
    global _registry
    _registry = None


def set_registry(registry: Dict[str, str]) -> None:
    global _registry
    _registry = dict(registry)
