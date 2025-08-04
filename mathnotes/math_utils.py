"""Centralized utilities for protecting and restoring math content in markdown.

This module provides unified functions for temporarily replacing math expressions
with placeholders during markdown processing to prevent them from being interpreted
as markdown syntax.
"""

import re
from typing import Dict, Tuple, Optional, TYPE_CHECKING

# Avoid circular imports
if TYPE_CHECKING:
    from .structured_math import MathBlock


class MathProtector:
    """Handles protection and restoration of math content using placeholders."""

    def __init__(self, prefix: str = "MATH"):
        """Initialize with a specific placeholder prefix.

        Args:
            prefix: The prefix to use for placeholders (e.g., "MATH", "CHILDMATH", "BLOCKMATH")
        """
        self.prefix = prefix
        self.display_counter = 0
        self.inline_counter = 0
        self.display_math: Dict[str, str] = {}
        self.inline_math: Dict[str, str] = {}

    def protect_math(self, content: str) -> str:
        """Protect both display and inline math in content.

        Args:
            content: The markdown content containing math expressions

        Returns:
            Content with math replaced by placeholders
        """
        # First protect display math ($$...$$)
        content = self._protect_display_math(content)
        # Then protect inline math ($...$)
        content = self._protect_inline_math(content)
        return content

    def restore_math(self, content: str) -> str:
        """Restore all protected math content.

        Args:
            content: The content with math placeholders

        Returns:
            Content with placeholders replaced by original math
        """
        # Restore display math
        for placeholder, math_content in self.display_math.items():
            content = content.replace(placeholder, math_content)

        # Restore inline math
        for placeholder, math_content in self.inline_math.items():
            content = content.replace(placeholder, math_content)

        return content

    def _protect_display_math(self, content: str) -> str:
        """Replace display math ($$..$$) with placeholders."""

        def replace_display_math(match):
            math_content = match.group(0)
            placeholder = f"{self.prefix}D{self.display_counter}PLACEHOLDER"
            self.display_math[placeholder] = math_content
            self.display_counter += 1
            return placeholder

        # Match $$...$$ including newlines
        pattern = re.compile(r"\$\$.*?\$\$", re.DOTALL)
        return pattern.sub(replace_display_math, content)

    def _protect_inline_math(self, content: str) -> str:
        """Replace inline math ($...$) with placeholders."""

        def replace_inline_math(match):
            math_content = match.group(0)
            placeholder = f"{self.prefix}I{self.inline_counter}PLACEHOLDER"
            self.inline_math[placeholder] = math_content
            self.inline_counter += 1
            return placeholder

        # Match $...$ but not $$
        pattern = re.compile(r"(?<!\$)\$(?!\$).*?\$(?!\$)", re.DOTALL)
        return pattern.sub(replace_inline_math, content)

    def fix_math_backslashes(self, content: str) -> str:
        """Fix escaped backslashes in LaTeX content.

        Preserve double backslashes within math expressions for LaTeX line breaks.

        Args:
            content: Content that may have escaped backslashes

        Returns:
            Content with backslashes fixed
        """
        # Don't modify math content - the issue is elsewhere
        return content

    def reset(self):
        """Reset counters and clear stored math content."""
        self.display_counter = 0
        self.inline_counter = 0
        self.display_math.clear()
        self.inline_math.clear()


# Convenience functions for backward compatibility
def protect_math(content: str, prefix: str = "MATH") -> Tuple[str, MathProtector]:
    """Protect math content and return both the protected content and the protector instance.

    Args:
        content: The markdown content containing math
        prefix: The placeholder prefix to use

    Returns:
        Tuple of (protected_content, protector_instance)
    """
    protector = MathProtector(prefix)
    protected = protector.protect_math(content)
    return protected, protector


def restore_math(content: str, protector: MathProtector) -> str:
    """Restore math content using a protector instance.

    Args:
        content: The content with placeholders
        protector: The MathProtector instance that did the protection

    Returns:
        Content with math restored
    """
    return protector.restore_math(content)


class BlockReferenceProcessor:
    """Handles processing of cross-references to structured blocks.

    This unified processor ensures consistent behavior for block references
    across both main content and child blocks.

    Supported formats:
    - @label - Auto-generated link text
    - @type:label - Auto-generated link text with type prefix
    - @{custom text|label} - Custom link text
    - @{custom text|type:label} - Custom link text with type validation
    - @embed{label} - Embed/transclude the full block content
    - @embed{type:label} - Embed with type validation
    """

    def __init__(
        self, block_markers: Dict[str, "MathBlock"], current_file: str = None, block_index=None
    ):
        """Initialize the reference processor.

        Args:
            block_markers: Dictionary mapping marker IDs to MathBlock objects
            current_file: Path to the current file being processed
            block_index: Global block index for cross-file references
        """
        self.block_markers = block_markers
        self.current_file = current_file
        self.block_index = block_index
        self.embedded_blocks = {}  # Store embedded blocks for later processing

    def process_references(self, content: str) -> str:
        """Process all block references in the content.

        Args:
            content: The content containing references

        Returns:
            Content with references replaced by links
        """
        # First process embed directives @embed{label} or @embed{type:label}
        # Pattern: @embed{label or type:label}
        embed_pattern = r"@embed\{([a-zA-Z0-9_-]+(?::[a-zA-Z0-9_-]+)?)\}"
        content = re.sub(embed_pattern, self._replace_embed_reference, content)

        # Then process custom references @{text|label}
        # Pattern: @{any text|label or type:label}
        custom_reference_pattern = r"@\{([^|]+)\|([a-zA-Z0-9_-]+(?::[a-zA-Z0-9_-]+)?)\}"
        content = re.sub(custom_reference_pattern, self._replace_custom_reference, content)

        # Finally process simple references @label or @type:label
        # Pattern to match @label or @type:label (avoiding email addresses)
        simple_reference_pattern = r"(?<![a-zA-Z0-9])@([a-zA-Z0-9_-]+(?::[a-zA-Z0-9_-]+)?)"
        content = re.sub(simple_reference_pattern, self._replace_simple_reference, content)

        return content

    def _replace_custom_reference(self, match) -> str:
        """Handle @{text|label} format."""
        link_text = match.group(1)
        ref_text = match.group(2)

        # Parse reference format: either "label" or "type:label"
        if ":" in ref_text:
            ref_type, ref_label = ref_text.split(":", 1)
            ref_type = ref_type.strip()
            ref_label = ref_label.strip()
        else:
            ref_type = None
            ref_label = ref_text.strip()

        # Find the referenced block
        target_block, target_url = self._find_target_block(ref_label, ref_type)

        if target_block:
            # Use the custom link text provided
            return f'<a href="{target_url}" class="block-reference" data-ref-type="{target_block.block_type.value}" data-ref-label="{ref_label}">{link_text}</a>'
        else:
            # Reference not found - return with error styling
            return f'<span class="block-reference-error" data-ref="{ref_text}">@{{{link_text}|{ref_text}}}</span>'

    def _replace_simple_reference(self, match) -> str:
        """Handle @label or @type:label format."""
        ref_text = match.group(1)

        # Parse reference format: either "label" or "type:label"
        if ":" in ref_text:
            ref_type, ref_label = ref_text.split(":", 1)
            ref_type = ref_type.strip()
            ref_label = ref_label.strip()
        else:
            ref_type = None
            ref_label = ref_text.strip()

        # Find the referenced block
        target_block, target_url = self._find_target_block(ref_label, ref_type)

        if target_block:
            # Generate the link text based on what's available and reference format
            if ref_type:
                # For type:label format, always use title or content snippet
                if target_block.title:
                    link_text = target_block.title
                else:
                    link_text = target_block.content_snippet
            else:
                # For simple @label format
                if target_block.title:
                    # Has title: preserve case as written in reference
                    link_text = ref_label
                else:
                    # No title: use content snippet for better context
                    link_text = target_block.content_snippet

            # Create the link with appropriate URL
            return f'<a href="{target_url}" class="block-reference" data-ref-type="{target_block.block_type.value}" data-ref-label="{ref_label}">{link_text}</a>'
        else:
            # Reference not found - return with error styling
            return f'<span class="block-reference-error" data-ref="{ref_text}">@{ref_text}</span>'

    def _find_target_block(
        self, ref_label: str, ref_type: Optional[str]
    ) -> Tuple[Optional["MathBlock"], Optional[str]]:
        """Find the target block for a reference.

        Args:
            ref_label: The label to search for
            ref_type: Optional type to validate against

        Returns:
            Tuple of (block, url) or (None, None) if not found
        """
        # Check local blocks first
        for marker_id, block in self.block_markers.items():
            if block.label == ref_label:
                # If type is specified, verify it matches
                if ref_type is None or block.block_type.value == ref_type:
                    return block, f"#{ref_label}"  # Local reference

        # If not found locally and we have a global index, check there
        if self.block_index:
            block_ref = self.block_index.get_reference(ref_label)
            if block_ref:
                # Verify type if specified
                if ref_type is None or block_ref.block.block_type.value == ref_type:
                    # Check if it's in the same file
                    if block_ref.file_path == self.current_file:
                        target_url = f"#{ref_label}"
                    else:
                        target_url = block_ref.full_url
                    return block_ref.block, target_url

        return None, None

    def _replace_embed_reference(self, match) -> str:
        """Handle @embed{label} format for transcluding content."""
        ref_text = match.group(1)

        # Parse reference format: either "label" or "type:label"
        if ":" in ref_text:
            ref_type, ref_label = ref_text.split(":", 1)
            ref_type = ref_type.strip()
            ref_label = ref_label.strip()
        else:
            ref_type = None
            ref_label = ref_text.strip()

        # Find the referenced block
        target_block, target_url = self._find_target_block(ref_label, ref_type)

        if target_block:
            # Get the source link if this is from another file
            source_info = ""
            if target_url and not target_url.startswith("#"):
                # This is from another file, get the page title
                if self.block_index:
                    block_ref = self.block_index.get_reference(ref_label)
                    source_info = (
                        f'<div class="embedded-source">from <a href="{target_url}">{block_ref.page_title}</a></div>'
                    )

            # Construct the embedded content
            block_type_display = target_block.block_type.value.replace("_", " ").title()
            title_part = f": {target_block.title}" if target_block.title else ""

            # Generate a unique marker for this embedded block
            import uuid

            embed_marker = f"EMBED_MARKER_{uuid.uuid4().hex[:8]}_{ref_label}"

            # Store the block with rendered HTML
            self.embedded_blocks[embed_marker] = {
                "rendered_html": target_block.rendered_html,
                "source_info": source_info,
                "ref_label": ref_label
            }

            # Return the marker - it will be replaced after markdown processing
            return embed_marker
        else:
            # Reference not found - return with error styling
            return f'<span class="embed-error" data-ref="{ref_text}">@embed{{{ref_text}}} (not found)</span>'

    def process_embedded_blocks(self, html_content: str, md_processor) -> str:
        """Process embedded block markers after markdown conversion.

        Args:
            html_content: HTML content containing embed markers
            md_processor: Markdown processor instance

        Returns:
            HTML with embedded blocks properly rendered
        """
        for marker, embed_info in self.embedded_blocks.items():
            # Build the embedded wrapper around the rendered block
            embedded_html = f"""<div class="embedded-block" data-embed-label="{embed_info['ref_label']}">
{embed_info['rendered_html']}
{embed_info['source_info']}
</div>"""

            # Replace the marker with the rendered block
            # Look for the marker in a paragraph tag or standalone
            html_content = html_content.replace(f"<p>{marker}</p>", embedded_html)
            html_content = html_content.replace(marker, embedded_html)

        return html_content
