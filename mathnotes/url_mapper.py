"""
URL mapping and routing utilities for the Mathnotes application.
"""

from pathlib import Path
import frontmatter
from typing import Dict
from .utils import slugify
from .config import CONTENT_DIRS


class URLMapper:
    """Handles URL mappings and redirects for the application."""

    def __init__(self):
        self.url_mappings: Dict[str, str] = {}  # Maps canonical URLs to file paths
        self.redirect_mappings: Dict[str, str] = {}  # Maps old URLs to canonical URLs
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

                    # Get slug from frontmatter or generate from title
                    slug = post.metadata.get("slug")
                    if not slug:
                        title = post.metadata.get("title", md_file.stem.replace("-", " "))
                        slug = slugify(title)

                    # Build canonical URL
                    relative_path = md_file.relative_to(Path("."))
                    # Remove "content/" prefix from section name for URLs
                    section_name = (
                        relative_path.parts[1]
                        if relative_path.parts[0] == "content"
                        else relative_path.parts[0]
                    )
                    canonical_url = f"{section_name}/{slug}"

                    # Store mappings
                    file_path = str(relative_path).replace("\\", "/")
                    self.url_mappings[canonical_url] = file_path
                    self.file_to_canonical[file_path] = canonical_url

                    # Handle redirects
                    redirect_from = post.metadata.get("redirect_from", [])
                    if isinstance(redirect_from, str):
                        redirect_from = [redirect_from]

                    for old_url in redirect_from:
                        # Clean up old URL
                        old_url = old_url.strip("/")
                        if old_url.startswith("mathnotes/"):
                            old_url = old_url[len("mathnotes/") :]
                        self.redirect_mappings[old_url] = canonical_url

                    # Also map the file-based URL to canonical
                    file_based_url = file_path
                    if file_based_url.endswith(".md"):
                        file_based_url = file_based_url[:-3]
                    if file_based_url != canonical_url:
                        self.redirect_mappings[file_based_url] = canonical_url

                except Exception as e:
                    print(f"Error processing {md_file}: {e}")

        print(
            f"Built {len(self.url_mappings)} URL mappings and {len(self.redirect_mappings)} redirects"
        )

    def get_canonical_url(self, file_path: str) -> str:
        """Get the canonical URL for a file path."""
        file_path_normalized = file_path.replace("\\", "/")
        return self.file_to_canonical.get(file_path_normalized)

    def get_file_path(self, canonical_url: str) -> str:
        """Get the file path for a canonical URL."""
        return self.url_mappings.get(canonical_url)

    def get_redirect_url(self, old_url: str) -> str:
        """Get the redirect URL for an old URL."""
        return self.redirect_mappings.get(old_url)
