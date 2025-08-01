"""
Tooltip data collector for math block references.
This module extends BlockReferenceProcessor to track which blocks are referenced
so we can preload their data for tooltips.
"""

from typing import Dict, Set, Optional, Any
from .math_utils import BlockReferenceProcessor, MathProtector
from .structured_math import MathBlock, process_structured_math_content
import re


class TooltipCollectingBlockReferenceProcessor(BlockReferenceProcessor):
    """Extended BlockReferenceProcessor that tracks referenced blocks for tooltips."""
    
    def __init__(self, block_markers: Dict[str, MathBlock], current_file: str = None, block_index=None):
        super().__init__(block_markers, current_file, block_index)
        self.referenced_labels: Set[str] = set()
    
    
    def _replace_simple_reference(self, match) -> str:
        """Override to track referenced labels."""
        ref_text = match.group(1)
        
        # Parse reference format
        if ":" in ref_text:
            ref_type, ref_label = ref_text.split(":", 1)
            ref_label = ref_label.strip()
        else:
            ref_label = ref_text.strip()
        
        # Track this reference
        self.referenced_labels.add(ref_label)
        
        # Call parent implementation
        return super()._replace_simple_reference(match)
    
    def _replace_custom_reference(self, match) -> str:
        """Override to track referenced labels."""
        ref_text = match.group(2)
        
        # Parse reference format
        if ":" in ref_text:
            ref_type, ref_label = ref_text.split(":", 1)
            ref_label = ref_label.strip()
        else:
            ref_label = ref_text.strip()
        
        # Track this reference
        self.referenced_labels.add(ref_label)
        
        # Call parent implementation
        return super()._replace_custom_reference(match)
    
    def get_tooltip_data(self) -> Dict[str, Dict[str, Any]]:
        """Collect tooltip data for all referenced blocks."""
        tooltip_data = {}
        
        for label in self.referenced_labels:
            # Find the block
            target_block, target_url = self._find_target_block(label, None)
            
            if target_block:
                # Extract main content without nested blocks
                content = self._extract_content_without_nested(target_block)
                
                # Process markdown to HTML
                html_content = self._process_markdown_content(content)
                
                tooltip_data[label] = {
                    'type': target_block.block_type.value,
                    'title': target_block.title or '',
                    'content': html_content,
                    'url': target_url if target_url and not target_url.startswith('#') else ''
                }
        
        return tooltip_data
    
    def _extract_content_without_nested(self, block: MathBlock) -> str:
        """Extract block content without nested blocks like proofs."""
        content = block.content
        
        # Remove any nested block markers
        # Pattern: :::type ... :::
        nested_pattern = r':::(?:proof|example|solution|exercise|remark|note|intuition).*?:::'
        content = re.sub(nested_pattern, '', content, flags=re.DOTALL)
        
        # Remove any block markers that might be present
        content = re.sub(r'[A-Z]+BLOCK\d+MARKER', '', content)
        
        # Clean up extra whitespace
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
        content = content.strip()
        
        return content
    
    def _process_markdown_content(self, content: str) -> str:
        """Process markdown content to HTML, preserving math expressions."""
        from markdown import Markdown
        from .math_utils import MathProtector
        
        # Create a simple markdown instance
        md = Markdown(extensions=['extra'])
        
        # Protect math expressions
        math_protector = MathProtector()
        protected_content = math_protector.protect_math(content)
        
        # Convert to HTML
        html = md.convert(protected_content)
        
        # Restore math expressions
        html = math_protector.restore_math(html)
        
        return html


def collect_tooltip_data_from_html(html_content: str, tooltip_data: Dict[str, Dict[str, Any]]) -> Set[str]:
    """
    Scan HTML content for block references and return labels that need tooltip data.
    This is used to handle references in structured math blocks.
    """
    referenced_labels = set()
    
    # Find all block references in the HTML
    # Pattern: <a ... class="block-reference" ... data-ref-label="label">
    pattern = r'<a[^>]+class="block-reference"[^>]+data-ref-label="([^"]+)"'
    
    for match in re.finditer(pattern, html_content):
        label = match.group(1)
        if label not in tooltip_data:
            referenced_labels.add(label)
    
    return referenced_labels