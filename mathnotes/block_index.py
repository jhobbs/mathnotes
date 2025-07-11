"""
Global block index for cross-file references in structured mathematical content.

This module provides a system for indexing all labeled blocks across all markdown
files, enabling cross-file references using the @label syntax.
"""

import os
import frontmatter
from typing import Dict, Optional, List, Tuple
from dataclasses import dataclass
from .structured_math import StructuredMathParser, MathBlock


@dataclass
class BlockReference:
    """Information about a labeled block for cross-referencing."""
    block: MathBlock
    file_path: str
    canonical_url: str
    
    @property
    def full_url(self) -> str:
        """Get the full URL including the fragment for this block."""
        return f"{self.canonical_url}#{self.block.label}"


class BlockIndex:
    """Global index of all labeled mathematical blocks across all files."""
    
    def __init__(self, url_mapper):
        self.url_mapper = url_mapper
        self.index: Dict[str, BlockReference] = {}
        self._is_built = False
    
    def build_index(self):
        """Build the global index by scanning all markdown files."""
        if self._is_built:
            return
            
        content_dir = 'content'
        self._scan_directory(content_dir)
        self._is_built = True
        
        # Log index statistics
        print(f"Block index built: {len(self.index)} labeled blocks found")
    
    def _scan_directory(self, directory: str):
        """Recursively scan a directory for markdown files and index their blocks."""
        for root, dirs, files in os.walk(directory):
            # Skip hidden directories
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            
            for file in files:
                if file.endswith('.md'):
                    file_path = os.path.join(root, file)
                    self._index_file(file_path)
    
    def _index_file(self, file_path: str):
        """Index all labeled blocks in a single markdown file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                post = frontmatter.load(f)
                content = post.content
                
                # Parse structured math content
                parser = StructuredMathParser()
                _, block_markers = parser.parse(content)
                
                # Get canonical URL for this file
                file_path_normalized = file_path.replace('\\', '/')
                canonical_url = self.url_mapper.get_canonical_url(file_path_normalized)
                if not canonical_url:
                    # Fallback to file path without extension
                    canonical_url = file_path_normalized.replace('.md', '')
                
                # Debug: Show what blocks we're processing
                print(f"\nProcessing {file_path}:")
                print(f"  Total block markers: {len(block_markers)}")
                
                # Index only top-level blocks (not nested ones)
                # The _add_to_index method will recursively handle children
                top_level_blocks = [block for block in block_markers.values() if block.parent is None]
                
                for block in top_level_blocks:
                    print(f"  - Top-level {block.block_type.value} '{block.title or 'untitled'}' (label: {block.label or 'none'})")
                    # This will recursively add the block and all its children
                    self._add_to_index(block, file_path, canonical_url)
                        
        except Exception as e:
            print(f"Error indexing {file_path}: {e}")
    
    def _add_to_index(self, block: MathBlock, file_path: str, canonical_url: str, parent_info: str = "top-level"):
        """Add a block to the index, including nested blocks."""
        if block.label:
            ref = BlockReference(
                block=block,
                file_path=file_path,
                canonical_url=f"/mathnotes/{canonical_url}"
            )
            
            # Check for duplicate labels
            if block.label in self.index:
                existing = self.index[block.label]
                print(f"\n=== DUPLICATE LABEL DETECTED ===")
                print(f"Label: '{block.label}'")
                print(f"Block type: {block.block_type.value}")
                print(f"Title: {block.title or 'None'}")
                print(f"Current parent: {parent_info}")
                print(f"Previously found in:")
                print(f"  - File: {existing.file_path}")
                print(f"  - Block type: {existing.block.block_type.value}")
                print(f"  - Title: {existing.block.title or 'None'}")
                print(f"Now found in:")
                print(f"  - File: {file_path}")
                print(f"  - Is this the same file? {existing.file_path == file_path}")
                print(f"================================\n")
            
            self.index[block.label] = ref
        
        # Recursively index child blocks
        for child in block.children:
            child_parent_info = f"{block.block_type.value}: {block.title or block.label or 'untitled'}"
            self._add_to_index(child, file_path, canonical_url, child_parent_info)
    
    def get_reference(self, label: str) -> Optional[BlockReference]:
        """Get a block reference by its label."""
        return self.index.get(label)
    
    def find_blocks_by_type(self, block_type: str) -> List[BlockReference]:
        """Find all blocks of a specific type."""
        return [
            ref for ref in self.index.values()
            if ref.block.block_type.value == block_type
        ]
    
    def get_blocks_in_file(self, file_path: str) -> List[BlockReference]:
        """Get all labeled blocks in a specific file."""
        normalized_path = file_path.replace('\\', '/')
        return [
            ref for ref in self.index.values()
            if ref.file_path.replace('\\', '/') == normalized_path
        ]