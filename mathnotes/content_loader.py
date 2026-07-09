"""Unified loader for content files.

Returns (metadata, PageDoc) for a .tex content file, cached by mtime (a full
build loads each file in several phases). The PageDoc — and the MathBlock
objects inside it — is deliberately shared between phases: the block index
sets block.rendered_html during its render phase and the page renderer reads
it. Markdown content is no longer supported.
"""

import os
from typing import Any, Dict, Tuple

from .structured_math import PageDoc

CONTENT_EXTENSIONS = (".tex",)

_tex_cache: Dict[str, Tuple[float, Dict[str, Any], PageDoc]] = {}


def clear_content_cache():
    _tex_cache.clear()


def load_content_file(filepath) -> Tuple[Dict[str, Any], PageDoc]:
    path = str(filepath)
    if not path.endswith(".tex"):
        raise ValueError(
            f"Markdown content is no longer supported: {path} — convert to .tex"
        )
    from .latex_processor import parse_latex_file

    mtime = os.path.getmtime(path)
    cached = _tex_cache.get(path)
    if cached and cached[0] >= mtime:
        return dict(cached[1]), cached[2]
    with open(path, "r", encoding="utf-8") as f:
        source = f.read()
    metadata, pagedoc = parse_latex_file(source, filepath=path)
    _tex_cache[path] = (mtime, metadata, pagedoc)
    return dict(metadata), pagedoc
