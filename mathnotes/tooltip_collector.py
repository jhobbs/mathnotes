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
                # Use the fully rendered HTML
                html_content = target_block.rendered_html
                
                tooltip_data[label] = {
                    'type': target_block.block_type.value,
                    'title': target_block.title or '',
                    'content': html_content,
                    'url': target_url if target_url and not target_url.startswith('#') else ''
                }
        
        return tooltip_data
    


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