"""Unified loader for content files.

Returns (metadata, content) for either source format, where content is in
the internal markdown dialect. .md files are frontmatter documents; .tex
files are transpiled by latex_processor (cached by mtime, since a full
build loads each file in several phases).
"""

import os
from typing import Any, Dict, Tuple

import frontmatter

CONTENT_EXTENSIONS = (".md", ".tex")

_tex_cache: Dict[str, Tuple[float, Dict[str, Any], str]] = {}


def clear_content_cache():
    _tex_cache.clear()


def load_content_file(filepath) -> Tuple[Dict[str, Any], str]:
    path = str(filepath)
    if path.endswith(".tex"):
        from .latex_processor import parse_latex_file

        mtime = os.path.getmtime(path)
        cached = _tex_cache.get(path)
        if cached and cached[0] >= mtime:
            return dict(cached[1]), cached[2]
        with open(path, "r", encoding="utf-8") as f:
            source = f.read()
        metadata, content = parse_latex_file(source, filepath=path)
        _tex_cache[path] = (mtime, metadata, content)
        return dict(metadata), content
    with open(path, "r", encoding="utf-8") as f:
        post = frontmatter.load(f)
    return post.metadata, post.content
