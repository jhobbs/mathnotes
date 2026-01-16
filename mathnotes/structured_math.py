"""
Structured Mathematical Content System for Mathnotes

This module provides a system for parsing and rendering structured mathematical
content (theorems, definitions, proofs, etc.) with explicit boundaries and metadata.
"""

import re
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any, Tuple
from enum import Enum


class MathBlockType(Enum):
    """Types of mathematical content blocks."""

    DEFINITION = "definition"
    THEOREM = "theorem"
    LEMMA = "lemma"
    PROPOSITION = "proposition"
    COROLLARY = "corollary"
    AXIOM = "axiom"
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
    content_html: Optional[str] = None  # Stores the inner HTML content (without wrapper)
    synonyms: List[Tuple[str, str]] = field(default_factory=list)  # List of (synonym_title, synonym_label)
    auto_generated_synonyms: List[Tuple[str, str]] = field(default_factory=list)  # Auto-generated synonyms (not shown in UI)
    tags: List[str] = field(default_factory=list)  # List of tags for categorization

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
            MathBlockType.AXIOM: "Axiom",
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
    
    @staticmethod
    def generate_plural(word: str) -> Optional[str]:
        """Generate the plural form of a word.
        
        Returns None if the word is already plural or if pluralization doesn't make sense.
        """
        if not word:
            return None
        
        # Skip if already plural (basic heuristic)
        if word.endswith('s') and not word.endswith('ss'):
            return None
        
        # Common irregular plurals
        irregular_plurals = {
            'matrix': 'matrices',
            'vertex': 'vertices', 
            'index': 'indices',
            'axis': 'axes',
            'analysis': 'analyses',
            'basis': 'bases',
            'crisis': 'crises',
            'hypothesis': 'hypotheses',
            'parenthesis': 'parentheses',
            'thesis': 'theses',
            'formula': 'formulas',
            'datum': 'data',
            'criterion': 'criteria',
            'phenomenon': 'phenomena',
            'radius': 'radii',
            'locus': 'loci',
            'focus': 'foci',
            'nucleus': 'nuclei',
            'syllabus': 'syllabi',
            'corpus': 'corpora',
            'genus': 'genera',
            # Mathematical terms
            'modulus': 'moduli',
            'torus': 'tori',
            'annulus': 'annuli',
            'calculus': 'calculi',
        }
        
        word_lower = word.lower()
        if word_lower in irregular_plurals:
            # Preserve the original case
            if word[0].isupper():
                return irregular_plurals[word_lower].capitalize()
            return irregular_plurals[word_lower]
        
        # Regular plural rules
        if word.endswith('y'):
            # If preceded by a consonant, change y to ies
            if len(word) > 1 and word[-2] not in 'aeiou':
                return word[:-1] + 'ies'
            else:
                return word + 's'
        elif word.endswith(('s', 'ss', 'sh', 'ch', 'x', 'z', 'o')):
            return word + 'es'
        else:
            return word + 's'


class StructuredMathParser:
    """Parser for structured mathematical content."""

    # Pattern for block start: :::+type "optional title" {optional: metadata}
    # Now captures the number of colons for nesting level
    BLOCK_START_PATTERN = re.compile(r'^(:::+)(\w+)(?:\s+"([^"]+)")?(?:\s+\{([^}]+)\})?\s*$', re.MULTILINE)

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
        
        # Track counts of nested blocks by type for auto-numbering
        nested_block_counts = {}

        while i < len(lines):
            line = lines[i]

            # Check for block start
            start_match = self.BLOCK_START_PATTERN.match(line)
            if start_match:
                colons = start_match.group(1)
                level = len(colons) - 3  # ::: is level 0, :::: is level 1, etc.

                # If this block is at a deeper level than expected, it's an error
                if level > expected_level:
                    # This is a nested block without a parent - error
                    error_html = self._render_block_error(
                        f"Invalid nesting level for {start_match.group(2).lower()} block",
                        f"Block uses {colons} ({len(colons)} colons) but should use {':::' + ':' * expected_level} ({3 + expected_level} colons) at this nesting level",
                        line_number=start_idx + i + 1,  # Convert to 1-based line numbering
                    )
                    processed_lines.append(error_html)
                    # Skip this line and continue
                    i += 1
                    continue

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
                
                # Auto-generate labels for proof blocks and certain nested blocks
                if not label:
                    # Generate label for proof blocks
                    if block_type == MathBlockType.PROOF:
                        if parent_block and parent_block.label:
                            # Nested proof - use parent's label with count if needed
                            base_label = f"proof-of-{parent_block.label}"
                            # Check if we need to add a count to make it unique
                            block_type_key = f"{id(parent_block)}-proof"
                            if block_type_key not in nested_block_counts:
                                nested_block_counts[block_type_key] = 0
                            nested_block_counts[block_type_key] += 1
                            count = nested_block_counts[block_type_key]
                            if count == 1:
                                label = base_label
                            else:
                                label = f"{base_label}-{count}"
                        else:
                            # Top-level proof or parent has no label - generate unique label
                            # Use the block count to ensure uniqueness
                            label = f"proof-{len(self._block_markers) + 1}"
                    
                    # Generate labels for nested non-corollary/non-lemma blocks
                    elif parent_block and parent_block.label and block_type in [
                        MathBlockType.NOTE,
                        MathBlockType.EXAMPLE,
                        MathBlockType.REMARK,
                        MathBlockType.INTUITION,
                        MathBlockType.EXERCISE,
                        MathBlockType.SOLUTION,
                    ]:
                        # Count how many blocks of this type we've seen under this parent
                        block_type_key = f"{id(parent_block)}-{block_type.value}"
                        if block_type_key not in nested_block_counts:
                            nested_block_counts[block_type_key] = 0
                        nested_block_counts[block_type_key] += 1
                        count = nested_block_counts[block_type_key]
                        
                        # Generate label based on parent and type
                        if count == 1:
                            label = f"{parent_block.label}-{block_type.value}"
                        else:
                            label = f"{parent_block.label}-{block_type.value}-{count}"
                    
                    # Generate implicit labels for all other unlabeled blocks
                    else:
                        # Use block type and count to generate unique label
                        label = f"{block_type.value}-{len(self._block_markers) + 1}"

                # Parse synonyms for definitions
                synonyms = []  # Manual synonyms (shown in UI)
                auto_generated_synonyms = []  # Auto-generated synonyms (not shown in UI)
                
                if block_type == MathBlockType.DEFINITION:
                    # First add manual synonyms from metadata
                    manual_synonym_labels = set()
                    if "synonyms" in metadata:
                        synonyms_str = metadata["synonyms"]
                        # Parse comma-separated synonyms
                        for synonym_title in synonyms_str.split(","):
                            synonym_title = synonym_title.strip()
                            # Remove quotes if present
                            if synonym_title.startswith('"') and synonym_title.endswith('"'):
                                synonym_title = synonym_title[1:-1]
                            if synonym_title:
                                # Generate label for synonym
                                synonym_label = MathBlock.normalize_label_from_title(synonym_title)
                                synonyms.append((synonym_title, synonym_label))
                                manual_synonym_labels.add(synonym_label)
                                
                                # Also generate plural for manual synonyms
                                synonym_plural = MathBlock.generate_plural(synonym_title)
                                if synonym_plural:
                                    synonym_plural_label = MathBlock.normalize_label_from_title(synonym_plural)
                                    if synonym_plural_label not in manual_synonym_labels:
                                        auto_generated_synonyms.append((synonym_plural, synonym_plural_label))
                    
                    # Automatically add plural form of title as a synonym
                    if title:
                        plural = MathBlock.generate_plural(title)
                        if plural:
                            plural_label = MathBlock.normalize_label_from_title(plural)
                            # Only add if not already in manual synonyms
                            if plural_label not in manual_synonym_labels:
                                auto_generated_synonyms.append((plural, plural_label))

                # Parse tags from metadata
                tags = []
                if "tags" in metadata:
                    tags_str = metadata["tags"]
                    # Parse comma-separated tags
                    for tag in tags_str.split(","):
                        tag = tag.strip()
                        # Remove quotes if present
                        if tag.startswith('"') and tag.endswith('"'):
                            tag = tag[1:-1]
                        if tag:
                            tags.append(tag)

                # Create block
                block = MathBlock(
                    block_type=block_type,
                    content="",
                    title=title,
                    label=label,
                    metadata=metadata,
                    parent=parent_block,
                    synonyms=synonyms,
                    auto_generated_synonyms=auto_generated_synonyms,
                    tags=tags,
                )
                
                # Assert labeling requirements
                # Top-level theorems, lemmas, propositions, corollaries, and axioms MUST have explicit labels
                if parent_block is None and block_type in [
                    MathBlockType.THEOREM,
                    MathBlockType.LEMMA,
                    MathBlockType.PROPOSITION,
                    MathBlockType.COROLLARY,
                    MathBlockType.AXIOM,
                ]:
                    assert label, f"Top-level {block_type.value} blocks must have an explicit label (title: {title})"
                
                # All blocks should now have labels (either explicit or implicit)
                assert label, f"All blocks should have labels after implicit generation, but {block_type.value} has none"

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
                                # Note: nested_block_counts is scoped to this level, child blocks get their own
                                child_lines, next_i = self._parse_blocks(lines, i, block, nested_level)
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

        # Parse different metadata fields
        # Support multiple fields in same metadata block
        # e.g., {label: foo, synonyms: bar, baz, tags: tag1, tag2}

        # Split by commas but be careful of nested structures
        # Simple approach: extract each known field separately

        # Parse label
        if "label:" in metadata_str:
            # Extract label value - find the next comma or end
            label_match = re.search(r'label:\s*([^,}]+)', metadata_str)
            if label_match:
                metadata["label"] = label_match.group(1).strip()

        # Parse synonyms
        if "synonyms:" in metadata_str:
            # Extract synonyms - everything after "synonyms:" until next field or end
            synonyms_match = re.search(r'synonyms:\s*([^}]*?)(?:,\s*(?:label|tags):|$|})', metadata_str)
            if synonyms_match:
                metadata["synonyms"] = synonyms_match.group(1).strip()

        # Parse tags
        if "tags:" in metadata_str:
            # Extract tags - everything after "tags:" until next field or end
            tags_match = re.search(r'tags:\s*([^}]*?)(?:,\s*(?:label|synonyms):|$|})', metadata_str)
            if tags_match:
                metadata["tags"] = tags_match.group(1).strip()

        return metadata

    def render_block_html(
        self, block: MathBlock, content_html: str, block_markers: Dict[str, MathBlock], md_processor, url: str
    ) -> str:
        """
        Render a math block to HTML with pre-processed content.

        Args:
            block: The MathBlock to render
            content_html: The markdown-processed HTML content for the block
            block_markers: Dictionary of all block markers for rendering children
            md_processor: Markdown processor for rendering child content
            url: URL to link the title to
        """
        # Build the opening div with appropriate classes and attributes
        css_classes = [block.css_class]
        if block.parent:
            css_classes.append("math-block-nested")

        attrs = [f'class="{" ".join(css_classes)}"']

        # All blocks now have labels
        attrs.append(f'id="{block.label}"')
        attrs.append(f'data-label="{block.label}"')

        # Add any additional metadata as data attributes
        for key, value in block.metadata.items():
            if key != "label":  # Already handled
                attrs.append(f'data-{key}="{value}"')

        html_parts = [f'<div {" ".join(attrs)}>']

        # Add header
        header_parts = ['<div class="math-block-header">']
        
        if block.block_type != MathBlockType.PROOF:
            if block.title:
                # Type: Title format
                header_parts.append(f'<span class="math-block-type">{block.display_name}:</span>')
                header_parts.append(f'<span class="math-block-title"><a href="{url}">{block.title}</a></span>')
            else:
                # Just type without colon
                header_parts.append(f'<span class="math-block-type">{block.display_name}</span>')
        else:
            # For proofs, use bold "Proof" header (without colon)
            header_parts.append('<span class="math-block-type">Proof</span>')
        
        # Add manual synonyms if they exist (for definitions) - don't show auto-generated ones
        if block.synonyms:
            synonym_titles = [syn[0] for syn in block.synonyms]
            header_parts.append(f'<span class="block-synonyms">(also: {", ".join(synonym_titles)})</span>')

        # Add tags if they exist
        if block.tags:
            tags_html = ''.join([f'<span class="block-tag">{tag}</span>' for tag in block.tags])
            header_parts.append(f'<span class="block-tags">{tags_html}</span>')

        # Add reference label (all blocks now have labels)
        header_parts.append(f'<span class="block-label-ref">@{block.label}</span>')
        
        header_parts.append("</div>")
        html_parts.extend(header_parts)

        # Add content - already processed as markdown
        html_parts.append('<div class="math-block-content">')

        # Process content and render any child blocks
        processed_content = content_html

        # Render child blocks that are referenced in the content
        for marker_id, child_block in block_markers.items():
            if child_block.parent == block and marker_id in processed_content:
                # Child blocks are always processed first, so rendered_html is available
                child_html = child_block.rendered_html
                # Replace marker with rendered child
                processed_content = processed_content.replace(f"<p>{marker_id}</p>", child_html)
                processed_content = processed_content.replace(marker_id, child_html)

        html_parts.append(processed_content)

        # Add QED symbol for proofs if not already present
        if block.block_type == MathBlockType.PROOF and not processed_content.rstrip().endswith("$\\square$"):
            html_parts.append(" $\\square$")

        html_parts.append("</div>")
        html_parts.append("</div>")

        return "\n".join(html_parts)

    def _render_block_error(self, error_title: str, error_message: str, line_number: int = None) -> str:
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
    # Process only top-level blocks (blocks without parents)
    # Child blocks will be processed recursively by their parents
    for marker_id, block in block_markers.items():
        if block.parent is None:  # Only process top-level blocks
            # Use pre-rendered HTML from the block index
            rendered_block = block.rendered_html

            if rendered_block is None:
                raise ValueError(
                    f"Block '{block.label}' (type: {block.block_type.value}) has no rendered HTML. "
                    f"File: {current_file}, marker: {marker_id}"
                )

            # Replace the marker with the rendered block
            # Look for the marker in a paragraph tag or standalone
            html_content = html_content.replace(f"<p>{marker_id}</p>", rendered_block)
            html_content = html_content.replace(marker_id, rendered_block)

    return html_content
