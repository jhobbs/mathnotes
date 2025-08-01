"""
Markdown processing utilities for the Mathnotes application.
"""

import re
from pathlib import Path
from typing import Dict, Optional
import frontmatter
from .config import create_markdown_instance
from .structured_math import StructuredMathParser, process_structured_math_content
from .math_utils import MathProtector, BlockReferenceProcessor
from .tooltip_collector import TooltipCollectingBlockReferenceProcessor, collect_tooltip_data_from_html


class MarkdownProcessor:
    """Handles markdown processing with Jekyll includes, wiki links, and structured math."""

    def __init__(self, url_mapper, block_index=None):
        self.md = create_markdown_instance()
        self.url_mapper = url_mapper
        self.block_index = block_index

    def render_markdown_file(self, filepath: str) -> Optional[Dict]:
        """
        Read and render a markdown file with frontmatter.

        Args:
            filepath: Path to the markdown file

        Returns:
            Dictionary with content, metadata, and other rendering info
        """
        # Track demos for this render
        integrated_demos = []

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                post = frontmatter.load(f)

                # Process Jekyll-style includes
                content = post.content

                # Handle new demo module includes
                demo_pattern = r'{%\s*include_demo\s+"([^"]+)"\s*%}'

                def replace_demo_include(match):
                    demo_name = match.group(1)
                    # Generate unique ID for this demo instance
                    demo_id = f"demo-{demo_name}-{hash(f'{filepath}-{match.start()}') & 0x7FFFFFFF}"

                    # Don't add main.js here - it's already loaded in base.html
                    # based on development/production environment

                    # Track that we need to initialize this demo
                    integrated_demos.append(f"{demo_name}:{demo_id}")

                    return (
                        f'<div class="demo-component" data-demo="{demo_name}" id="{demo_id}"></div>'
                    )

                content = re.sub(demo_pattern, replace_demo_include, content)

                # Process wiki-style internal links [[slug]] or [[text|slug]]
                content = re.sub(r"\[\[([^\]]+)\]\]", self._replace_wiki_link, content)

                # Process structured mathematical content - first pass
                math_parser = StructuredMathParser()
                content, block_markers = math_parser.parse(content)

                # Process cross-references to structured blocks (@label or @type:label)
                # Store the processor to use it later for embedded blocks
                # Use tooltip-collecting version
                self.block_ref_processor = TooltipCollectingBlockReferenceProcessor(
                    block_markers=block_markers, current_file=filepath, block_index=self.block_index
                )
                content = self.block_ref_processor.process_references(content)
                
                # Start collecting tooltip data
                tooltip_data = self.block_ref_processor.get_tooltip_data()

                # Protect math delimiters from markdown processing
                math_protector = MathProtector()
                content = math_protector.protect_math(content)

                # Convert markdown to HTML
                html_content = self.md.convert(content)

                # Restore math blocks with their original content
                html_content = math_protector.restore_math(html_content)
                html_content = math_protector.fix_math_backslashes(html_content)

                # Process embedded blocks after markdown conversion
                if (
                    hasattr(self, "block_ref_processor")
                    and self.block_ref_processor.embedded_blocks
                ):
                    html_content = self.block_ref_processor.process_embedded_blocks(
                        html_content, self.md
                    )

                # Fix relative image paths to include content/ prefix
                html_content = self._fix_relative_image_paths(html_content, filepath)

                # Process structured mathematical content - second pass
                if block_markers:
                    html_content = process_structured_math_content(
                        html_content,
                        block_markers,
                        self.md,
                        current_file=filepath,
                        block_index=self.block_index,
                    )
                    
                    # Collect any additional references from structured math content
                    additional_labels = collect_tooltip_data_from_html(html_content, tooltip_data)
                    if additional_labels:
                        # Create a temporary processor to get data for these labels
                        temp_processor = TooltipCollectingBlockReferenceProcessor(
                            block_markers={}, current_file=filepath, block_index=self.block_index
                        )
                        temp_processor.referenced_labels = additional_labels
                        additional_data = temp_processor.get_tooltip_data()
                        tooltip_data.update(additional_data)

                # Fix escaped asterisks and tildes that should be rendered normally
                # Note: This must happen AFTER structured math processing to preserve LaTeX escapes
                html_content = html_content.replace(r"\*", "*")
                html_content = html_content.replace(r"\~", "~")

                # Get canonical URL for this file
                file_path_normalized = filepath.replace("\\", "/")
                canonical_url = self.url_mapper.get_canonical_url(file_path_normalized)
                if canonical_url:
                    canonical_path = f"/mathnotes/{canonical_url}"
                else:
                    # Fallback to current URL structure
                    file_path_no_ext = file_path_normalized.replace(".md", "")
                    canonical_path = f"/mathnotes/{file_path_no_ext}"

                # Generate description from frontmatter or content
                description = self._generate_description(post.metadata, html_content)

                return {
                    "content": html_content,
                    "metadata": post.metadata,
                    "title": post.metadata.get(
                        "title", Path(filepath).stem.replace("-", " ").title()
                    ),
                    "page_description": description,
                    "source_path": filepath,
                    "canonical_url": canonical_path,
                    "has_integrated_demos": len(integrated_demos) > 0,
                    "tooltip_data": tooltip_data,
                }
        except Exception as e:
            import traceback

            print(f"Error reading {filepath}: {e}")
            print(f"Traceback: {traceback.format_exc()}")
            return None

    def _replace_wiki_link(self, match):
        """Replace wiki-style links with proper markdown links."""
        link_content = match.group(1)
        if "|" in link_content:
            # Format: [[Link Text|slug]]
            link_text, slug = link_content.split("|", 1)
            link_text = link_text.strip()
            slug = slug.strip()
        else:
            # Format: [[slug]]
            slug = link_content.strip()
            link_text = slug.replace("-", " ").title()

        # Check if slug contains a section prefix
        if "/" in slug:
            # Direct section/slug reference
            canonical_url = slug
        else:
            # Search for the slug in our mappings
            canonical_url = self._find_slug_in_mappings(slug)

        if canonical_url:
            return f"[{link_text}](/mathnotes/{canonical_url})"
        else:
            # If slug not found, return the original text with a broken link indicator
            return f"[{link_text}](#broken-link-{slug})"

    def _find_slug_in_mappings(self, slug: str) -> Optional[str]:
        """Find a slug in the URL mappings."""
        # First try exact match in current section (this would require context)
        # For now, search all sections
        for url in self.url_mapper.url_mappings:
            if url.endswith(f"/{slug}") or url == slug:
                return url
        return None

    def _process_block_references(
        self, content: str, block_markers: Dict, current_file: str
    ) -> str:
        """Process cross-references to structured blocks using the unified processor.

        Supported formats:
        - @label - Auto-generated link text
        - @type:label - Auto-generated link text with type prefix
        - @{custom text|label} - Custom link text
        - @{custom text|type:label} - Custom link text with type validation
        """
        # Use the unified BlockReferenceProcessor
        processor = BlockReferenceProcessor(
            block_markers=block_markers, current_file=current_file, block_index=self.block_index
        )
        return processor.process_references(content)

    def _generate_description(self, metadata: Dict, html_content: str) -> str:
        """Generate page description from frontmatter or content."""
        description = metadata.get("description", "")
        if not description:
            # Generate description from first paragraph of content
            # Remove HTML tags and math expressions for a clean description
            clean_content = re.sub(r"<[^>]+>", "", html_content)  # Remove HTML tags
            clean_content = re.sub(r"\$\$[^$]+\$\$", "", clean_content)  # Remove display math
            clean_content = re.sub(r"\$[^$]+\$", "", clean_content)  # Remove inline math
            clean_content = re.sub(r"\s+", " ", clean_content).strip()  # Normalize whitespace

            # Take first sentence or up to 160 characters
            if clean_content:
                sentences = clean_content.split(". ")
                if sentences:
                    description = sentences[0]
                    if len(description) > 160:
                        description = description[:157] + "..."
                    elif not description.endswith("."):
                        description += "."

        return description

    def _fix_relative_image_paths(self, html_content: str, filepath: str) -> str:
        """Fix image paths in HTML to ensure they're absolute paths under /mathnotes/."""
        import os
        
        # Get directory path
        directory = os.path.dirname(filepath).replace('content/', '', 1).replace('content', '')
        
        # Prepend to anything that's not http/https/data/absolute
        # Using replace to clean up any double slashes
        return re.sub(
            r'<img([^>]*\s)src="(?!(?:https?:|data:|/))([^"]+)"',
            lambda m: f'<img{m.group(1)}src="{f"/mathnotes/{directory}/{m.group(2)}".replace("//", "/")}"',
            html_content
        )
