"""
Global block index for cross-file references in structured mathematical content.

This module provides a system for indexing all labeled blocks across all markdown
files, enabling cross-file references using the @label syntax.
"""

import os
import frontmatter
from typing import Dict, Optional, List, Tuple
from dataclasses import dataclass
from markdown import Markdown
from .structured_math import StructuredMathParser, MathBlock
from .math_utils import MathProtector


@dataclass
class BlockReference:
    """Information about a labeled block for cross-referencing."""

    block: MathBlock
    file_path: str
    canonical_url: str
    page_title: Optional[str] = None

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
        # Create markdown processor for content rendering
        self.md = Markdown(extensions=['extra'])
        # Store rendered HTML for all blocks by file path and marker ID
        self.rendered_blocks: Dict[str, Dict[str, str]] = {}

    def build_index(self):
        """Build the global index by scanning all markdown files."""
        if self._is_built:
            return

        content_dir = "content"
        
        # Phase 1: Scan and index all blocks
        self._scan_directory(content_dir)
        
        # Phase 2: Render all blocks now that the index is complete
        self._render_all_blocks()
        
        self._is_built = True

        # Log index statistics
        print(f"Block index built: {len(self.index)} labeled blocks found, {sum(len(blocks) for blocks in self.rendered_blocks.values())} total blocks rendered")

    def _scan_directory(self, directory: str):
        """Recursively scan a directory for markdown files and index their blocks."""
        for root, dirs, files in os.walk(directory):
            # Skip hidden directories
            dirs[:] = [d for d in dirs if not d.startswith(".")]

            for file in files:
                if file.endswith(".md"):
                    file_path = os.path.join(root, file)
                    self._index_file(file_path)

    def _index_file(self, file_path: str):
        """Index all labeled blocks in a single markdown file."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                post = frontmatter.load(f)
                content = post.content
                
                # Get page title from frontmatter
                page_title = post.metadata.get('title', None)

                # Parse structured math content
                # Don't pass block_index yet - it's not complete in phase 1
                parser = StructuredMathParser()
                _, block_markers = parser.parse(content)

                # Get canonical URL for this file
                file_path_normalized = file_path.replace("\\", "/")
                canonical_url = self.url_mapper.get_canonical_url(file_path_normalized)
                if not canonical_url:
                    # Fallback to file path without extension
                    canonical_url = file_path_normalized.replace(".md", "")

                # Store the blocks and metadata for phase 2 rendering
                if not hasattr(self, '_pending_files'):
                    self._pending_files = []
                self._pending_files.append({
                    'file_path': file_path,
                    'canonical_url': canonical_url,
                    'page_title': page_title,
                    'block_markers': block_markers
                })
                
                # Index only labeled blocks for cross-references
                for block in block_markers.values():
                    if block.label:
                        ref = BlockReference(
                            block=block, 
                            file_path=file_path, 
                            canonical_url=f"/mathnotes/{canonical_url}",
                            page_title=page_title
                        )
                        if block.label in self.index:
                            existing = self.index[block.label]
                            print(
                                f"Warning: Duplicate label '{block.label}' found in {file_path} (previously in {existing.file_path})"
                            )
                        self.index[block.label] = ref

        except Exception as e:
            print(f"Error indexing {file_path}: {e}")

    def _render_all_blocks(self):
        """Phase 2: Render all blocks now that the index is complete."""
        if not hasattr(self, '_pending_files'):
            return
            
        for file_info in self._pending_files:
            file_path = file_info['file_path']
            canonical_url = file_info['canonical_url']
            block_markers = file_info['block_markers']
            
            # Create a new parser with the complete block index for proper cross-references
            parser = StructuredMathParser(current_file=file_path, block_index=self)
            
            # Initialize rendered blocks storage for this file
            self.rendered_blocks[file_path] = {}
            
            # Render all blocks in this file
            for marker_id, block in block_markers.items():
                full_url = f"/mathnotes/{canonical_url}#{block.label}" if block.label else f"/mathnotes/{canonical_url}"
                self._process_block_content(block, block_markers, parser, full_url)
                # Store the rendered HTML by marker ID
                self.rendered_blocks[file_path][marker_id] = block.rendered_html
        
        # Clean up temporary storage
        del self._pending_files

    def _process_block_content(self, block: MathBlock, block_markers: Dict[str, MathBlock], parser: StructuredMathParser, full_url: str):
        """Process and render a block using the same pipeline as page view."""
        if block.content:
            # Process cross-references in the block content (first pass)
            # Use BlockReferenceProcessor to handle @references and @embed directives
            from .math_utils import BlockReferenceProcessor
            block_ref_processor = BlockReferenceProcessor(
                block_markers=block_markers,
                current_file=parser.current_file,
                block_index=parser.block_index
            )
            content_with_refs = block_ref_processor.process_references(block.content)
            
            # Protect math expressions
            math_protector = MathProtector()
            protected_content = math_protector.protect_math(content_with_refs)
            
            # Convert to HTML
            html_content = self.md.convert(protected_content)
            self.md.reset()
            
            # Restore math expressions
            html_content = math_protector.restore_math(html_content)
            
            # Process embedded blocks after markdown conversion (second pass)
            if block_ref_processor.embedded_blocks:
                html_content = block_ref_processor.process_embedded_blocks(html_content, self.md)
            
            # Fix escaped asterisks and tildes (same as in markdown_processor.py)
            html_content = html_content.replace(r"\*", "*")
            html_content = html_content.replace(r"\~", "~")
            
            # Render the complete block HTML using the same method as page view
            block.rendered_html = parser.render_block_html(block, html_content, block_markers, self.md, full_url)
    


    def get_reference(self, label: str) -> Optional[BlockReference]:
        """Get a block reference by its label."""
        return self.index.get(label)
    
    def get_rendered_html(self, file_path: str, marker_id: str) -> Optional[str]:
        """Get pre-rendered HTML for a block by file path and marker ID."""
        if file_path in self.rendered_blocks:
            return self.rendered_blocks[file_path].get(marker_id)
        return None

    def find_blocks_by_type(self, block_type: str) -> List[BlockReference]:
        """Find all blocks of a specific type."""
        return [ref for ref in self.index.values() if ref.block.block_type.value == block_type]

    def get_blocks_in_file(self, file_path: str) -> List[BlockReference]:
        """Get all labeled blocks in a specific file."""
        normalized_path = file_path.replace("\\", "/")
        return [
            ref
            for ref in self.index.values()
            if ref.file_path.replace("\\", "/") == normalized_path
        ]
