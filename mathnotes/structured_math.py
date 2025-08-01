"""
Structured Mathematical Content System for Mathnotes

This module provides a system for parsing and rendering structured mathematical
content (theorems, definitions, proofs, etc.) with explicit boundaries and metadata.
"""

import re
import markdown
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any, Tuple
from enum import Enum
from .math_utils import MathProtector, BlockReferenceProcessor


class MathBlockType(Enum):
    """Types of mathematical content blocks."""

    DEFINITION = "definition"
    THEOREM = "theorem"
    LEMMA = "lemma"
    PROPOSITION = "proposition"
    COROLLARY = "corollary"
    PROOF = "proof"
    EXAMPLE = "example"
    REMARK = "remark"
    NOTE = "note"
    INTUITION = "intuition"
    EXERCISE = "exercise"
    SOLUTION = "solution"


@dataclass
class MathBlock:
    """Represents a structured mathematical content block."""

    block_type: MathBlockType
    content: str
    title: Optional[str] = None
    label: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    children: List["MathBlock"] = field(default_factory=list)
    parent: Optional["MathBlock"] = None

    @property
    def css_class(self) -> str:
        """Generate CSS class name for this block type."""
        return f"math-block math-{self.block_type.value}"

    @property
    def display_name(self) -> str:
        """Get the display name for this block type."""
        names = {
            MathBlockType.DEFINITION: "Definition",
            MathBlockType.THEOREM: "Theorem",
            MathBlockType.LEMMA: "Lemma",
            MathBlockType.PROPOSITION: "Proposition",
            MathBlockType.COROLLARY: "Corollary",
            MathBlockType.PROOF: "Proof",
            MathBlockType.EXAMPLE: "Example",
            MathBlockType.REMARK: "Remark",
            MathBlockType.NOTE: "Note",
            MathBlockType.INTUITION: "Intuition",
            MathBlockType.EXERCISE: "Exercise",
            MathBlockType.SOLUTION: "Solution",
        }
        return names.get(self.block_type, self.block_type.value.title())

    @property
    def content_snippet(self) -> str:
        """Get the first 7 words of content as a snippet for references."""
        # Strip markdown and get plain text
        import re

        # Remove markdown formatting but preserve content
        text = self.content

        # Remove any math protection markers that might be present
        text = re.sub(r"[A-Z]+MATH\d+MARKER", "", text)
        text = re.sub(r"[A-Z]+BLOCK\d+MARKER", "", text)

        # Remove display math blocks ($$...$$) completely
        text = re.sub(r"\$\$.*?\$\$", "", text, flags=re.DOTALL)

        # Keep inline math ($...$) as-is for rendering
        # No need to replace - let MathJax handle it

        # Remove markdown emphasis markers
        text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)  # Bold
        text = re.sub(r"\*([^*]+)\*", r"\1", text)  # Italic
        text = re.sub(r"__([^_]+)__", r"\1", text)  # Bold
        text = re.sub(r"_([^_]+)_", r"\1", text)  # Italic

        # Remove links but keep text
        text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)

        # Remove headers
        text = re.sub(r"^#+\s+", "", text, flags=re.MULTILINE)

        # Clean up whitespace
        text = " ".join(text.split())

        # Get first 7 words
        words = text.split()[:7]

        if len(words) == 0:
            return self.label or "untitled"

        snippet = " ".join(words)

        # Add ellipsis if there were more words
        if len(text.split()) > 7:
            snippet += "..."

        return snippet

    @staticmethod
    def normalize_label_from_title(title: str) -> str:
        """Generate a normalized label from a title."""
        import re

        # Convert to lowercase
        label = title.lower()

        # Replace whitespace, commas, and other punctuation with hyphens
        label = re.sub(r"[\s,]+", "-", label)

        # Remove any remaining non-alphanumeric characters except hyphens
        label = re.sub(r"[^a-z0-9-]", "", label)

        # Remove leading/trailing hyphens and collapse multiple hyphens
        label = re.sub(r"-+", "-", label).strip("-")

        return label


class StructuredMathParser:
    """Parser for structured mathematical content."""

    # Pattern for block start: :::+type "optional title" {optional: metadata}
    # Now captures the number of colons for nesting level
    BLOCK_START_PATTERN = re.compile(
        r'^(:::+)(\w+)(?:\s+"([^"]+)")?(?:\s+\{([^}]+)\})?\s*$', re.MULTILINE
    )

    # Pattern for block end: :::+ or :::+end (must match opening colons)
    BLOCK_END_PATTERN = re.compile(r"^(:::+)(?:end)?\s*$", re.MULTILINE)

    def __init__(self, current_file: str = None, block_index=None):
        self.blocks: List[MathBlock] = []
        self._block_markers: Dict[str, MathBlock] = {}
        self.current_file = current_file
        self.block_index = block_index

    def parse(self, content: str) -> Tuple[str, Dict[str, MathBlock]]:
        """
        Parse structured mathematical content and return processed markdown.

        Returns a tuple of (processed_content, block_markers) where block_markers
        maps placeholder IDs to MathBlock objects.

        Syntax:
        :::theorem "Fundamental Theorem of Calculus" {label: ftc}
        Content here...

        ::::lemma "Supporting Lemma"
        Lemma content...
        ::::

        ::::proof
        Main proof content...
        ::::

        :::
        """
        self.blocks = []
        self._block_markers = {}
        lines = content.split("\n")

        # Parse all blocks recursively
        parsed_lines, _ = self._parse_blocks(lines, 0, None, 0)

        return "\n".join(parsed_lines), self._block_markers

    def _parse_blocks(
        self,
        lines: List[str],
        start_idx: int,
        parent_block: Optional[MathBlock],
        expected_level: int,
    ) -> Tuple[List[str], int]:
        """
        Parse blocks starting from the given index at the expected nesting level.

        Args:
            lines: List of lines to parse
            start_idx: Starting index
            parent_block: Parent block for nested blocks
            expected_level: Expected nesting level (number of colons - 3)

        Returns:
            Tuple of (processed_lines, next_index)
        """
        processed_lines = []
        i = start_idx

        while i < len(lines):
            line = lines[i]

            # Check for block start
            start_match = self.BLOCK_START_PATTERN.match(line)
            if start_match:
                colons = start_match.group(1)
                level = len(colons) - 3  # ::: is level 0, :::: is level 1, etc.

                # If this block is at a deeper level than expected, stop processing
                if level > expected_level:
                    return processed_lines, i

                # If this block is at a shallower level than expected, stop processing
                if level < expected_level:
                    return processed_lines, i

                block_type_str = start_match.group(2).lower()
                title = start_match.group(3)
                metadata_str = start_match.group(4)

                # Parse block type
                try:
                    block_type = MathBlockType(block_type_str)
                except ValueError:
                    # Unknown block type, treat as regular content
                    processed_lines.append(line)
                    i += 1
                    continue

                # Parse metadata
                metadata = self._parse_metadata(metadata_str) if metadata_str else {}

                # Auto-generate label for definitions if not explicitly provided
                label = metadata.get("label")
                if not label and block_type == MathBlockType.DEFINITION and title:
                    label = MathBlock.normalize_label_from_title(title)

                # Create block
                block = MathBlock(
                    block_type=block_type,
                    content="",
                    title=title,
                    label=label,
                    metadata=metadata,
                    parent=parent_block,
                )

                # Add to parent's children if nested
                if parent_block:
                    parent_block.children.append(block)
                else:
                    self.blocks.append(block)

                # Parse block content
                block_content_lines = []
                i += 1

                while i < len(lines):
                    end_match = self.BLOCK_END_PATTERN.match(lines[i])
                    if end_match and len(end_match.group(1)) == len(colons):
                        # Found matching end marker
                        # Set block content
                        block.content = "\n".join(block_content_lines).strip()

                        # Create a unique marker for this block
                        marker_id = f"MATHBLOCK{len(self._block_markers)}MARKER"
                        self._block_markers[marker_id] = block

                        # Add marker
                        processed_lines.append(marker_id)

                        i += 1
                        break
                    else:
                        # Check if this is a nested block
                        nested_start_match = self.BLOCK_START_PATTERN.match(lines[i])
                        if nested_start_match:
                            nested_level = len(nested_start_match.group(1)) - 3
                            if nested_level == level + 1:
                                # This is a direct child block
                                child_lines, next_i = self._parse_blocks(
                                    lines, i, block, nested_level
                                )
                                block_content_lines.extend(child_lines)
                                i = next_i
                            else:
                                # Not a direct child, treat as content
                                block_content_lines.append(lines[i])
                                i += 1
                        else:
                            # Regular content line
                            block_content_lines.append(lines[i])
                            i += 1
                else:
                    # No matching end found - unclosed block error
                    block_start_line = start_idx + i - len(block_content_lines) - 1
                    error_html = self._render_block_error(
                        f"Unclosed {block_type.value} block",
                        f"Block started with '{colons}{block_type_str}' but no matching closing '{colons}' found",
                        line_number=block_start_line + 1,  # Convert to 1-based line numbering
                    )
                    processed_lines.append(error_html)
                    # Don't try to process the rest as part of this block
            else:
                # Check for end marker that doesn't match any open block
                end_match = self.BLOCK_END_PATTERN.match(line)
                if end_match:
                    end_level = len(end_match.group(1)) - 3
                    if end_level < expected_level:
                        # This ends a parent block, stop processing
                        return processed_lines, i
                    elif end_level > expected_level:
                        # Orphaned closing tag
                        error_html = self._render_block_error(
                            "Mismatched closing tag",
                            f"Found closing tag '{end_match.group(1)}' but no matching opening block at this nesting level",
                            line_number=start_idx + i + 1,  # Convert to 1-based line numbering
                        )
                        processed_lines.append(error_html)
                        i += 1
                        continue

                # Regular content line
                processed_lines.append(line)
                i += 1

        return processed_lines, i

    def _parse_metadata(self, metadata_str: str) -> Dict[str, Any]:
        """Parse metadata string into dictionary."""
        metadata = {}
        # Simple key:value parser
        pairs = metadata_str.split(",")
        for pair in pairs:
            if ":" in pair:
                key, value = pair.split(":", 1)
                metadata[key.strip()] = value.strip()
        return metadata

    def _render_block_error(
        self, error_title: str, error_message: str, line_number: int = None
    ) -> str:
        """Render a visible error block for parsing errors."""
        line_info = f" (around line {line_number})" if line_number else ""
        return f"""<div class="math-block-error">
    <div class="math-block-error-header">
        <strong>⚠️ Math Block Error{line_info}</strong>
    </div>
    <div class="math-block-error-content">
        <strong>{error_title}</strong><br>
        {error_message}
    </div>
</div>"""

    def render_block_html(
        self, block: MathBlock, content_html: str, block_markers: Dict[str, MathBlock], md_processor
    ) -> str:
        """
        Render a math block to HTML with pre-processed content.

        Args:
            block: The MathBlock to render
            content_html: The markdown-processed HTML content for the block
            block_markers: Dictionary of all block markers for rendering children
            md_processor: Markdown processor for rendering child content
        """
        # Build the opening div with appropriate classes and attributes
        css_classes = [block.css_class]
        if block.parent:
            css_classes.append("math-block-nested")

        attrs = [f'class="{" ".join(css_classes)}"']

        if block.label:
            attrs.append(f'id="{block.label}"')
            attrs.append(f'data-label="{block.label}"')

        # Add any additional metadata as data attributes
        for key, value in block.metadata.items():
            if key != "label":  # Already handled
                attrs.append(f'data-{key}="{value}"')

        html_parts = [f'<div {" ".join(attrs)}>']

        # Add header if applicable
        if block.block_type != MathBlockType.PROOF:
            header_parts = [f'<div class="math-block-header">']

            if block.title:
                # Type: Title format
                header_parts.append(f'<span class="math-block-type">{block.display_name}:</span>')
                header_parts.append(f'<span class="math-block-title">{block.title}</span>')
            else:
                # Just type without colon
                header_parts.append(f'<span class="math-block-type">{block.display_name}</span>')

            header_parts.append("</div>")
            html_parts.extend(header_parts)
        else:
            # For proofs, use bold "Proof" header (without colon)
            html_parts.append(
                '<div class="math-block-header"><span class="math-block-type">Proof</span></div>'
            )

        # Add content - already processed as markdown
        html_parts.append('<div class="math-block-content">')

        # Process content and render any child blocks
        processed_content = content_html

        # Render child blocks that are referenced in the content
        for marker_id, child_block in block_markers.items():
            if child_block.parent == block and marker_id in processed_content:
                # Render the child block
                child_html = self._render_child_block(child_block, block_markers, md_processor)
                # Replace marker with rendered child
                processed_content = processed_content.replace(f"<p>{marker_id}</p>", child_html)
                processed_content = processed_content.replace(marker_id, child_html)

        html_parts.append(processed_content)

        # Add QED symbol for proofs if not already present
        if block.block_type == MathBlockType.PROOF and not processed_content.rstrip().endswith(
            "$\\square$"
        ):
            html_parts.append(" $\\square$")

        html_parts.append("</div>")
        html_parts.append("</div>")

        return "\n".join(html_parts)

    def _render_child_block(
        self, block: MathBlock, block_markers: Dict[str, MathBlock], md_processor
    ) -> str:
        """Render a child block with its content."""
        # Process the block's content through markdown
        block_content = block.content

        # Process cross-references in child blocks if available
        # md_processor here is the markdown instance, but we need access to the MarkdownProcessor
        # For now, let's add a simple reference processor directly
        block_content = self._process_child_block_references(block_content, block_markers)

        # Protect math before markdown processing
        child_math_protector = MathProtector(prefix="CHILDMATH")
        block_content = child_math_protector.protect_math(block_content)

        # Process through markdown
        block_html = md_processor.convert(block_content)
        md_processor.reset()

        # Restore math
        block_html = child_math_protector.restore_math(block_html)

        # Render the block with nested support
        return self.render_block_html(block, block_html, block_markers, md_processor)

    def get_blocks_by_type(self, block_type: MathBlockType) -> List[MathBlock]:
        """Get all blocks of a specific type."""
        return [block for block in self.blocks if block.block_type == block_type]

    def get_block_by_label(self, label: str) -> Optional[MathBlock]:
        """Get a block by its label."""
        for block in self.blocks:
            if block.label == label:
                return block
        return None

    def _process_child_block_references(
        self, content: str, block_markers: Dict[str, MathBlock]
    ) -> str:
        """Process cross-references to structured blocks within child blocks using the unified processor.

        Supports both local and cross-file references using the global block index.

        Supported formats:
        - @label - Auto-generated link text
        - @type:label - Auto-generated link text with type prefix
        - @{custom text|label} - Custom link text
        - @{custom text|type:label} - Custom link text with type validation
        """
        # Use the unified BlockReferenceProcessor
        processor = BlockReferenceProcessor(
            block_markers=block_markers,
            current_file=self.current_file,
            block_index=self.block_index,
        )
        return processor.process_references(content)


def process_structured_math_content(
    html_content: str,
    block_markers: Dict[str, MathBlock],
    md_processor,
    current_file: str = None,
    block_index=None,
) -> str:
    """
    Replace block markers in HTML content with rendered math blocks.

    Args:
        html_content: The markdown-processed HTML content
        block_markers: Dictionary mapping marker IDs to MathBlock objects
        md_processor: The markdown processor to use for block content
        current_file: Path to the current file being processed
        block_index: Global block index for cross-file references
    """
    parser = StructuredMathParser(current_file=current_file, block_index=block_index)

    # Process only top-level blocks (blocks without parents)
    # Child blocks will be processed recursively by their parents
    for marker_id, block in block_markers.items():
        if block.parent is None:  # Only process top-level blocks
            # Protect math in block content before markdown processing
            block_content = block.content

            # Process cross-references in block content
            block_content = parser._process_child_block_references(block_content, block_markers)

            # Protect math before markdown processing
            block_math_protector = MathProtector(prefix="BLOCKMATH")
            block_content = block_math_protector.protect_math(block_content)

            # Process the block's content through markdown
            block_html = md_processor.convert(block_content)
            # Reset the markdown processor for the next conversion
            md_processor.reset()

            # Restore protected math
            block_html = block_math_protector.restore_math(block_html)

            # Render the complete block with nested blocks support
            rendered_block = parser.render_block_html(
                block, block_html, block_markers, md_processor
            )

            # Replace the marker with the rendered block
            # Look for the marker in a paragraph tag or standalone
            html_content = html_content.replace(f"<p>{marker_id}</p>", rendered_block)
            html_content = html_content.replace(marker_id, rendered_block)

    return html_content
