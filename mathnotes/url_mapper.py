"""
URL mapping and routing utilities for the Mathnotes application.
"""

from pathlib import Path
import frontmatter
from typing import Dict
from .utils import slugify
from .config import CONTENT_DIRS


class URLMapper:
    """Handles URL mappings for the application."""

    def __init__(self):
        self.url_mappings: Dict[str, str] = {}  # Maps canonical URLs to file paths
        self.file_to_canonical: Dict[str, str] = {}  # Maps file paths to canonical URLs

    def build_url_mappings(self):
        """Build URL mappings from all content files."""
        for section in CONTENT_DIRS:
            section_path = Path(section)
            if not section_path.exists():
                continue

            for md_file in section_path.rglob("*.md"):
                try:
                    with open(md_file, "r", encoding="utf-8") as f:
                        post = frontmatter.load(f)

                    # Build canonical URL
                    relative_path = md_file.relative_to(Path("."))
                    
                    # Check if there's a custom slug that should override the path
                    custom_slug = post.metadata.get("slug")
                    if custom_slug:
                        # Custom slug provided - use it with section prefix
                        section_name = (
                            relative_path.parts[1]
                            if relative_path.parts[0] == "content"
                            else relative_path.parts[0]
                        )
                        canonical_url = f"{section_name}/{custom_slug}"
                    else:
                        # No custom slug - use full directory structure
                        # Remove content/ prefix and .md extension
                        if relative_path.parts[0] == "content":
                            url_path = "/".join(relative_path.parts[1:])
                        else:
                            url_path = str(relative_path)
                        # Remove .md extension
                        if url_path.endswith(".md"):
                            url_path = url_path[:-3]
                        canonical_url = url_path

                    # Store mappings
                    file_path = str(relative_path).replace("\\", "/")
                    self.url_mappings[canonical_url] = file_path
                    self.file_to_canonical[file_path] = canonical_url

                except Exception as e:
                    print(f"Error processing {md_file}: {e}")

        print(
            f"Built {len(self.url_mappings)} URL mappings"
        )

    def get_canonical_url(self, file_path: str) -> str:
        """Get the canonical URL for a file path."""
        file_path_normalized = file_path.replace("\\", "/")
        return self.file_to_canonical.get(file_path_normalized)

    def get_file_path(self, canonical_url: str) -> str:
        """Get the file path for a canonical URL."""
        return self.url_mappings.get(canonical_url)
