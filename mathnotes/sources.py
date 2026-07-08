"""Sources collection and merging for content pages."""

import logging
from pathlib import Path
from typing import Any
import yaml

logger = logging.getLogger(__name__)


def collect_directory_sources(content_path: str) -> list[dict[str, Any]]:
    """Collect sources from all sources.yaml files from root to page directory.

    Args:
        content_path: Path to the content file (e.g., 'content/algebra/groups.md')

    Returns:
        List of source entries, ordered from root to immediate parent directory.
    """
    path = Path(content_path)
    content_root = Path("content")

    # Get the directory containing the page
    page_dir = path.parent

    # Build list of directories from root to page directory
    directories = []
    current = page_dir
    while current != content_root.parent and current != Path("."):
        directories.append(current)
        current = current.parent

    # Reverse to go from root to page directory
    directories.reverse()

    # Collect sources from each directory
    all_sources = []
    for directory in directories:
        sources_file = directory / "sources.yaml"
        if sources_file.exists():
            try:
                with open(sources_file, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    if data and "sources" in data:
                        all_sources.extend(data["sources"])
            except (yaml.YAMLError, OSError) as e:
                logger.warning(f"Could not read sources from {sources_file}: {e}")

    return all_sources


def merge_sources(
    directory_sources: list[dict[str, Any]],
    page_sources: list[dict[str, Any]] | None
) -> list[dict[str, Any]]:
    """Merge directory sources with page-specific sources.

    Args:
        directory_sources: Sources collected from directory hierarchy
        page_sources: Sources from page frontmatter (may be None)

    Returns:
        Combined list with directory sources first, then page sources.
    """
    result = list(directory_sources)
    if page_sources:
        result.extend(page_sources)
    return result


def get_sources_for_page(
    content_path: str,
    frontmatter_sources: list[dict[str, Any]] | None = None
) -> list[dict[str, Any]]:
    """Get all sources applicable to a page.

    Args:
        content_path: Path to the content file
        frontmatter_sources: Sources from page frontmatter

    Returns:
        Merged list of all applicable sources.
    """
    directory_sources = collect_directory_sources(content_path)
    return merge_sources(directory_sources, frontmatter_sources)


def build_bibliography(url_mapper) -> list[dict[str, Any]]:
    """Aggregate sources from every content page into a site-wide bibliography.

    Sources are deduplicated by (title, author). Each entry is the source dict
    plus a ``cited_by`` list of ``{title, url, section?}`` for every page the
    source applies to; ``section`` is included only when a citation's section
    differs from the entry's own.

    Args:
        url_mapper: URLMapper with url_mappings and get_file_path()

    Returns:
        Bibliography entries sorted by title.
    """
    from .content_loader import load_content_file

    entries: dict[tuple[str, str], dict[str, Any]] = {}

    for canonical_url in url_mapper.url_mappings.keys():
        md_path = url_mapper.get_file_path(canonical_url)
        try:
            metadata, _ = load_content_file(md_path)
        except (OSError, yaml.YAMLError) as e:
            logger.warning(f"Could not read metadata from {md_path}: {e}")
            continue

        page_title = metadata.get("title") or canonical_url
        page_url = f"/mathnotes/{canonical_url}/"
        sources = get_sources_for_page(md_path, metadata.get("sources"))

        seen_keys = set()
        for source in sources:
            key = (
                str(source.get("title", "")).strip().lower(),
                str(source.get("author", "")).strip().lower(),
            )
            if key in seen_keys:
                continue
            seen_keys.add(key)

            entry = entries.setdefault(key, {**source, "cited_by": []})
            # Fill in fields a sparser citation of the same source omitted
            for field_name, value in source.items():
                entry.setdefault(field_name, value)

            citation = {"title": page_title, "url": page_url}
            section = source.get("section")
            if section and section != entry.get("section"):
                citation["section"] = section
            entry["cited_by"].append(citation)

    return sorted(entries.values(), key=lambda e: str(e.get("title", "")).lower())
