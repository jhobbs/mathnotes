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


class StructuredMathParser:
    """Parser for structured mathematical content."""
    
    # Pattern for block start: :::type "optional title" {optional: metadata}
    BLOCK_START_PATTERN = re.compile(
        r'^:::(\w+)(?:\s+"([^"]+)")?(?:\s+\{([^}]+)\})?\s*$',
        re.MULTILINE
    )
    
    # Pattern for block end: ::: or :::end
    BLOCK_END_PATTERN = re.compile(r'^:::(?:end)?\s*$', re.MULTILINE)
    
    def __init__(self):
        self.blocks: List[MathBlock] = []
        self._block_markers: Dict[str, MathBlock] = {}
    
    def parse(self, content: str) -> Tuple[str, Dict[str, MathBlock]]:
        """
        Parse structured mathematical content and return processed markdown.
        
        Returns a tuple of (processed_content, block_markers) where block_markers
        maps placeholder IDs to MathBlock objects.
        
        Syntax:
        :::theorem "Fundamental Theorem of Calculus" {label: ftc}
        Content here...
        :::
        
        :::proof
        Proof content...
        :::
        """
        self.blocks = []
        self._block_markers = {}
        processed_content = []
        lines = content.split('\n')
        i = 0
        
        while i < len(lines):
            line = lines[i]
            
            # Check for block start
            match = self.BLOCK_START_PATTERN.match(line)
            if match:
                block_type_str = match.group(1).lower()
                title = match.group(2)
                metadata_str = match.group(3)
                
                # Parse block type
                try:
                    block_type = MathBlockType(block_type_str)
                except ValueError:
                    # Unknown block type, treat as regular content
                    processed_content.append(line)
                    i += 1
                    continue
                
                # Parse metadata
                metadata = self._parse_metadata(metadata_str) if metadata_str else {}
                
                # Find block end
                block_lines = []
                i += 1
                block_start_line = i
                
                while i < len(lines):
                    if self.BLOCK_END_PATTERN.match(lines[i]):
                        # Found end of block
                        block_content = '\n'.join(block_lines)
                        
                        # Create block
                        block = MathBlock(
                            block_type=block_type,
                            content=block_content.strip(),
                            title=title,
                            label=metadata.get('label'),
                            metadata=metadata
                        )
                        self.blocks.append(block)
                        
                        # Create a unique marker for this block
                        marker_id = f"MATHBLOCK{len(self._block_markers)}MARKER"
                        self._block_markers[marker_id] = block
                        
                        # Add marker on its own line to preserve block structure
                        processed_content.append(marker_id)
                        
                        i += 1
                        break
                    else:
                        block_lines.append(lines[i])
                        i += 1
                else:
                    # No end found, treat original line as regular content
                    processed_content.append(line)
                    # Add the lines we consumed back
                    processed_content.extend(lines[block_start_line:i])
            else:
                processed_content.append(line)
                i += 1
        
        return '\n'.join(processed_content), self._block_markers
    
    def _parse_metadata(self, metadata_str: str) -> Dict[str, Any]:
        """Parse metadata string into dictionary."""
        metadata = {}
        # Simple key:value parser
        pairs = metadata_str.split(',')
        for pair in pairs:
            if ':' in pair:
                key, value = pair.split(':', 1)
                metadata[key.strip()] = value.strip()
        return metadata
    
    def render_block_html(self, block: MathBlock, content_html: str) -> str:
        """
        Render a math block to HTML with pre-processed content.
        
        Args:
            block: The MathBlock to render
            content_html: The markdown-processed HTML content for the block
        """
        # Build the opening div with appropriate classes and attributes
        attrs = [f'class="{block.css_class}"']
        
        if block.label:
            attrs.append(f'id="{block.label}"')
            attrs.append(f'data-label="{block.label}"')
        
        # Add any additional metadata as data attributes
        for key, value in block.metadata.items():
            if key != 'label':  # Already handled
                attrs.append(f'data-{key}="{value}"')
        
        html_parts = [f'<div {" ".join(attrs)}>']
        
        # Add header if applicable
        if block.block_type != MathBlockType.PROOF:
            header_parts = [f'<div class="math-block-header">']
            header_parts.append(f'<span class="math-block-type">{block.display_name}</span>')
            
            if block.title:
                header_parts.append(f'<span class="math-block-title">({block.title})</span>')
            
            header_parts.append('</div>')
            html_parts.extend(header_parts)
        else:
            # For proofs, use italic "Proof:" header
            html_parts.append('<div class="math-block-header"><em>Proof:</em></div>')
        
        # Add content - already processed as markdown
        html_parts.append('<div class="math-block-content">')
        html_parts.append(content_html)
        
        # Add QED symbol for proofs if not already present
        if block.block_type == MathBlockType.PROOF and not content_html.rstrip().endswith('$\\square$'):
            html_parts.append(' $\\square$')
        
        html_parts.append('</div>')
        html_parts.append('</div>')
        
        return '\n'.join(html_parts)
    
    def get_blocks_by_type(self, block_type: MathBlockType) -> List[MathBlock]:
        """Get all blocks of a specific type."""
        return [block for block in self.blocks if block.block_type == block_type]
    
    def get_block_by_label(self, label: str) -> Optional[MathBlock]:
        """Get a block by its label."""
        for block in self.blocks:
            if block.label == label:
                return block
        return None


def process_structured_math_content(html_content: str, block_markers: Dict[str, MathBlock], md_processor) -> str:
    """
    Replace block markers in HTML content with rendered math blocks.
    
    Args:
        html_content: The markdown-processed HTML content
        block_markers: Dictionary mapping marker IDs to MathBlock objects
        md_processor: The markdown processor to use for block content
    """
    parser = StructuredMathParser()
    
    # Process each block marker
    for marker_id, block in block_markers.items():
        # Process the block's content through markdown
        block_html = md_processor.convert(block.content)
        # Reset the markdown processor for the next conversion
        md_processor.reset()
        
        # Render the complete block
        rendered_block = parser.render_block_html(block, block_html)
        
        # Replace the marker with the rendered block
        # Look for the marker in a paragraph tag or standalone
        html_content = html_content.replace(f'<p>{marker_id}</p>', rendered_block)
        html_content = html_content.replace(marker_id, rendered_block)
    
    return html_content