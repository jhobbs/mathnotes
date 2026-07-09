"""Page assembly: PageDoc -> final page HTML.

Blocks were pre-rendered by the block index (block.rendered_html); prose
segments still hold reference placeholders, resolved here against the
complete index. No markdown, no text-marker schemes.
"""

import os
import re
from pathlib import Path
from typing import Dict, Optional

from .content_loader import load_content_file
from .ref_resolver import RefResolver, labels_from_rendered_html
from .structured_math import MathBlock

_render_cache: Dict[str, tuple] = {}  # filepath -> (mtime, result)


def clear_page_cache():
    _render_cache.clear()


def invalidate_page_cache(filepath: str):
    _render_cache.pop(filepath, None)


class PageRenderer:
    def __init__(self, url_mapper, block_index):
        self.url_mapper = url_mapper
        self.block_index = block_index

    def render_page(self, filepath: str) -> Optional[Dict]:
        try:
            current_mtime = os.path.getmtime(filepath)
            if filepath in _render_cache:
                cached_mtime, cached_result = _render_cache[filepath]
                if cached_mtime >= current_mtime:
                    return cached_result
        except OSError:
            pass

        metadata, pagedoc = load_content_file(filepath)
        resolver = RefResolver(self.block_index, self.url_mapper, current_file=filepath)

        parts = []
        for item in pagedoc.items:
            if isinstance(item, MathBlock):
                if item.rendered_html is None:
                    raise ValueError(
                        f"Block '{item.label}' has no rendered HTML — was the "
                        f"block index built? File: {filepath}"
                    )
                parts.append(item.rendered_html)
            else:
                parts.append(resolver.resolve(item))
        html_content = "\n".join(parts)

        tooltip_data = resolver.get_tooltip_data()
        extra = labels_from_rendered_html(html_content, tooltip_data)
        if extra:
            extra_resolver = RefResolver(self.block_index, self.url_mapper,
                                         current_file=filepath)
            extra_resolver.referenced_labels = extra
            tooltip_data.update(extra_resolver.get_tooltip_data())

        canonical_url = self.url_mapper.get_canonical_url(filepath.replace("\\", "/"))
        result = {
            "content": html_content,
            "metadata": metadata,
            "title": metadata.get("title", Path(filepath).stem.replace("-", " ").title()),
            "page_description": self._generate_description(metadata, html_content),
            "source_path": filepath,
            "canonical_url": f"/mathnotes/{canonical_url}",
            "has_integrated_demos": 'data-demo="' in html_content,
            "tooltip_data": tooltip_data,
        }
        try:
            _render_cache[filepath] = (os.path.getmtime(filepath), result)
        except OSError:
            pass
        return result

    def _generate_description(self, metadata: Dict, html_content: str) -> str:
        # Auto-generate a description from the rendered content when the
        # page doesn't set one explicitly.
        description = metadata.get("description", "")
        if not description:
            clean = re.sub(r"<math\b.*?</math>", " ", html_content, flags=re.DOTALL)
            clean = re.sub(r"<[^>]+>", "", clean)
            clean = re.sub(r"\$\$[^$]+\$\$", "", clean)
            clean = re.sub(r"\$[^$]+\$", "", clean)
            clean = re.sub(r"\s+", " ", clean).strip()
            sentences = clean.split(". ")
            description = sentences[0]
            if len(description) > 160:
                description = description[:157] + "..."
            elif not description.endswith("."):
                description += "."
        return description
