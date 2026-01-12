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
