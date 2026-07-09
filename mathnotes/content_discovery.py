from pathlib import Path
from typing import Dict
from .config import CONTENT_DIRS
from .content_loader import load_content_file


class ContentDiscovery:
    """Discovers content files and manages URL mappings for the application."""

    def __init__(self):
        self.url_mappings: Dict[str, str] = {}  # Maps canonical URLs to file paths
        self.file_to_canonical: Dict[str, str] = {}  # Maps file paths to canonical URLs

    def build_url_mappings(self):
        """Build URL mappings from all content files."""
        # Clear in place (other components hold references to these dicts) so
        # deleted/moved files don't linger across incremental rebuilds
        self.url_mappings.clear()
        self.file_to_canonical.clear()

        for section in CONTENT_DIRS:
            section_path = Path(section)

            stray_md = sorted(section_path.rglob("*.md"))
            if stray_md:
                raise ValueError(
                    f"Markdown content is no longer supported: {stray_md[0]} — convert to .tex"
                )
            content_files = sorted(section_path.rglob("*.tex"))
            for content_file in content_files:
                metadata, _ = load_content_file(content_file)

                # Build canonical URL
                relative_path = content_file.relative_to(Path("."))

                # Check if there's a custom slug that should override the filename
                custom_slug = metadata.get("slug")
                if custom_slug:
                    # Custom slug replaces the filename but preserves the directory
                    # path, so nested sections keep their full URL (e.g.
                    # content/applied-math/information-theory/01-discrete-entropy.tex
                    # -> applied-math/information-theory/<slug>).
                    parts = relative_path.parts
                    start = 1 if parts[0] == "content" else 0
                    dir_parts = parts[start:-1]  # directories between content/ and the file
                    canonical_url = "/".join([*dir_parts, custom_slug])
                else:
                    # No custom slug - use full directory structure
                    # Remove content/ prefix and extension
                    url_path = "/".join(relative_path.parts[1:])
                    url_path = url_path[: -len(content_file.suffix)]
                    canonical_url = url_path

                # Ensure canonical URL has trailing slash
                canonical_url += "/"

                # Store mappings
                file_path = str(relative_path).replace("\\", "/")
                if canonical_url in self.url_mappings:
                    raise ValueError(
                        f"URL collision: {file_path} and "
                        f"{self.url_mappings[canonical_url]} both map to /{canonical_url}"
                    )
                self.url_mappings[canonical_url] = file_path
                self.file_to_canonical[file_path] = canonical_url

        print(f"Built {len(self.url_mappings)} URL mappings")

    def get_canonical_url(self, file_path: str) -> str:
        """Get the canonical URL for a file path."""
        file_path_normalized = file_path.replace("\\", "/")
        # URLs are now stored with trailing slashes
        return self.file_to_canonical.get(file_path_normalized)

    def get_file_path(self, canonical_url: str) -> str:
        """Get the file path for a canonical URL."""
        return self.url_mappings.get(canonical_url)
