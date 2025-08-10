"""
File system utilities for the Mathnotes application.
"""

from pathlib import Path
from typing import List, Dict, Tuple


def get_all_content_for_section(section_path: str, file_to_canonical: Dict[str, str]) -> List[Dict]:
    """
    Recursively get all content files for a section.

    Args:
        section_path: Path to the section directory
        file_to_canonical: Mapping of file paths to canonical URLs

    Returns:
        List of content items with nested structure
    """
    content_files = []
    path = Path(section_path)

    def process_directory(dir_path: Path, depth: int = 0) -> List[Dict]:
        items = []
        for item in sorted(dir_path.iterdir()):
            if item.is_file() and item.suffix == ".md":
                file_path_raw = str(item.relative_to(Path(".")))
                file_path = file_path_raw.replace("\\", "/")
                canonical_url = file_to_canonical.get(file_path)
                # canonical_url already has trailing slash from url_mapper
                url = canonical_url

                items.append({"name": item.stem.replace("-", " ").title(), "path": url, "is_subdir": False})
            elif item.is_dir() and not item.name.startswith(".") and not item.name.startswith("__"):
                # Recursively get files from subdirectories
                subdir_content = process_directory(item, depth + 1)
                if subdir_content:
                    items.append(
                        {
                            "name": item.name.replace("-", " ").title(),
                            "is_subdir": True,
                            "files": subdir_content,
                        }
                    )
        return items

    return process_directory(path)
