"""
Navigation utilities for building section-aware page navigation.

Provides a tree-style navigation structure like Windows Explorer.
"""

from pathlib import Path
from typing import Dict, List, Any
import frontmatter

# Module-level caches
_title_cache: Dict[str, str] = {}
_folder_pages_cache: Dict[str, List[Dict[str, Any]]] = {}
_nav_tree_cache: Dict[str, Dict[str, Any]] = {}


def clear_navigation_cache():
    """Clear all navigation caches. Call when content changes."""
    _title_cache.clear()
    _folder_pages_cache.clear()
    _nav_tree_cache.clear()


def get_page_title(file_path: Path) -> str:
    """Get the title from a markdown file's frontmatter, or derive from filename."""
    cache_key = str(file_path)
    if cache_key in _title_cache:
        return _title_cache[cache_key]

    title = file_path.stem.replace("-", " ").title()
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            post = frontmatter.load(f)
            fm_title = post.metadata.get("title", "").strip()
            if fm_title:
                title = fm_title
    except Exception:
        pass

    _title_cache[cache_key] = title
    return title


def get_pages_in_folder(folder_path: Path, file_to_canonical: Dict[str, str]) -> List[Dict[str, Any]]:
    """
    Get all markdown pages in a folder, sorted alphabetically by filename.

    Returns list of dicts with: url, title, filename, file_path
    """
    cache_key = str(folder_path)
    if cache_key in _folder_pages_cache:
        return _folder_pages_cache[cache_key]

    pages = []

    if not folder_path.exists() or not folder_path.is_dir():
        _folder_pages_cache[cache_key] = pages
        return pages

    for item in folder_path.iterdir():
        if item.is_file() and item.suffix == ".md":
            file_path_str = str(item.relative_to(Path("."))).replace("\\", "/")
            canonical_url = file_to_canonical.get(file_path_str)

            if canonical_url:
                pages.append({
                    "url": f"/mathnotes/{canonical_url}",
                    "title": get_page_title(item),
                    "filename": item.name.lower(),
                    "file_path": file_path_str,
                })

    pages.sort(key=lambda x: x["filename"])
    _folder_pages_cache[cache_key] = pages
    return pages


def get_content_root(file_path: Path) -> Path:
    """Get the content/ folder."""
    parts = file_path.parts
    if "content" in parts:
        content_idx = parts.index("content")
        return Path(*parts[:content_idx + 1])
    return file_path.parent


def build_nav_tree(section_path: Path, current_file: Path, file_to_canonical: Dict[str, str]) -> Dict[str, Any]:
    """
    Build a tree structure for the entire section.

    Returns a tree with pages and folders, expanding the path to current page.
    """
    current_file_str = str(current_file).replace("\\", "/")

    def build_level(folder: Path) -> List[Dict[str, Any]]:
        items = []

        # Get pages in this folder
        for page in get_pages_in_folder(folder, file_to_canonical):
            items.append({
                "type": "page",
                "title": page["title"],
                "url": page["url"],
                "is_current": page["file_path"] == current_file_str,
            })

        # Get subfolders
        subfolders = sorted(
            [f for f in folder.iterdir() if f.is_dir() and not f.name.startswith(".") and not f.name.startswith("__")],
            key=lambda x: x.name.lower()
        )

        for subfolder in subfolders:
            subfolder_pages = get_pages_in_folder(subfolder, file_to_canonical)
            if subfolder_pages:
                # Check if current file is inside this subfolder
                try:
                    current_file.relative_to(subfolder)
                    is_ancestor = True
                except ValueError:
                    is_ancestor = False

                items.append({
                    "type": "folder",
                    "name": subfolder.name.replace("-", " ").title(),
                    "expanded": is_ancestor,
                    "children": build_level(subfolder),  # Always include for expand/collapse
                })

        return items

    return {
        "name": section_path.name.replace("-", " ").title(),
        "children": build_level(section_path),
    }


def get_page_navigation(file_path: str, file_to_canonical: Dict[str, str]) -> Dict[str, Any]:
    """
    Build navigation context for a content page.

    Args:
        file_path: Path to the markdown file (e.g., "content/algebra/linear/dotproduct.md")
        file_to_canonical: Mapping of file paths to canonical URLs

    Returns:
        Dict with:
        - prev_page: {url, title} or None
        - next_page: {url, title} or None
        - tree: {name, items} - tree structure for sidebar
    """
    path = Path(file_path)
    current_folder = path.parent
    current_filename = path.name.lower()

    # Get all pages in the current folder for prev/next
    pages_in_folder = get_pages_in_folder(current_folder, file_to_canonical)

    # Find current page index
    current_index = -1
    for i, page in enumerate(pages_in_folder):
        if page["filename"] == current_filename:
            current_index = i
            break

    # Build prev/next
    prev_page = None
    next_page = None

    if current_index > 0:
        prev = pages_in_folder[current_index - 1]
        prev_page = {"url": prev["url"], "title": prev["title"]}

    if current_index >= 0 and current_index < len(pages_in_folder) - 1:
        next_ = pages_in_folder[current_index + 1]
        next_page = {"url": next_["url"], "title": next_["title"]}

    # Build tree from content root (shows all sections)
    content_root = get_content_root(path)
    tree = build_nav_tree(content_root, path, file_to_canonical)

    return {
        "prev_page": prev_page,
        "next_page": next_page,
        "tree": tree,
    }
