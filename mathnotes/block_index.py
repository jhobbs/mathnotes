"""
Global block index for cross-file references in structured mathematical content.

This module provides a system for indexing all labeled blocks across all markdown
files, enabling cross-file references using the @label syntax.
"""

import os
import frontmatter
from typing import Dict, Optional, List
from dataclasses import dataclass
from markdown import Markdown
from .structured_math import StructuredMathParser, MathBlock
from .math_utils import MathProtector
from .reverse_index import ReverseIndex


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
        # All blocks now have labels (either explicit or implicit)
        return f"{self.canonical_url}#{self.block.label}"


class BlockIndex:
    """Global index of all labeled mathematical blocks across all files."""

    def __init__(self, url_mapper):
        self.url_mapper = url_mapper
        self.index: Dict[str, BlockReference] = {}  # Label-based index for cross-references
        self.all_blocks: List[BlockReference] = []  # All blocks, including unlabeled ones
        self._is_built = False
        # Create markdown processor for content rendering
        self.md = Markdown(extensions=["extra"])
        # Store rendered HTML for all blocks by file path and marker ID
        self.rendered_blocks: Dict[str, Dict[str, str]] = {}
        # Initialize reverse index for tracking references
        self.reverse_index = ReverseIndex()

    def build_index(self):
        """Build the global index by scanning all markdown files."""
        content_dir = "content"

        # Phase 1: Scan and index all blocks
        self._scan_directory(content_dir)

        # Phase 2: Build the reverse index by collecting all references
        self._collect_all_references()
        
        # Phase 3: Compute transitive references
        self.reverse_index.compute_transitive_references()
        
        # Phase 4: Render all blocks with reference information now available
        self._render_all_blocks()

        self._is_built = True

        # Log index statistics
        print(
            f"Block index built: {len(self.index)} labeled blocks found, {sum(len(blocks) for blocks in self.rendered_blocks.values())} total blocks rendered"
        )
        
        # Log reverse index statistics
        stats = self.reverse_index.get_summary_stats()
        print(f"Reverse index built: {stats['blocks_with_references']} blocks referenced, {stats['total_direct_references']} direct references")

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
        with open(file_path, "r", encoding="utf-8") as f:
            post = frontmatter.load(f)
            content = post.content

            # Get page title from frontmatter
            page_title = post.metadata.get("title", None)

            # Parse structured math content
            # Don't pass block_index yet - it's not complete in phase 1
            parser = StructuredMathParser()
            _, block_markers = parser.parse(content)

            # Get canonical URL for this file
            file_path_normalized = file_path.replace("\\", "/")
            canonical_url = self.url_mapper.get_canonical_url(file_path_normalized)

            # Store the blocks and metadata for phase 2 rendering
            if not hasattr(self, "_pending_files"):
                self._pending_files = []
            self._pending_files.append(
                {
                    "file_path": file_path,
                    "canonical_url": canonical_url,
                    "page_title": page_title,
                    "block_markers": block_markers,
                }
            )

            # Index blocks for reference and display
            for block in block_markers.values():
                ref = BlockReference(
                    block=block,
                    file_path=file_path,
                    canonical_url=f"/mathnotes/{canonical_url}",
                    page_title=page_title,
                )
                
                # Only add top-level blocks to all_blocks (for index pages)
                # Nested blocks will appear inside their parents
                if block.parent is None:
                    self.all_blocks.append(ref)
                
                # Add to the label index for cross-references (all blocks now have labels)
                # Normalize label for storage (case-insensitive lookup)
                from .structured_math import MathBlock

                normalized_label = MathBlock.normalize_label_from_title(block.label)

                if normalized_label in self.index:
                    existing = self.index[normalized_label]
                    print(
                        f"Warning: Duplicate label '{block.label}' found in {file_path} (previously in {existing.file_path})"
                    )
                self.index[normalized_label] = ref
                
                # Register with reverse index
                self.reverse_index.add_block_definition(
                    label=block.label,
                    file_path=file_path,
                    title=block.title or block.label,
                    url=f"/mathnotes/{canonical_url}#{block.label}"
                )
                
                # Also register synonyms as aliases pointing to the same block
                if block.synonyms:
                    for synonym_title, synonym_label in block.synonyms:
                        normalized_synonym_label = MathBlock.normalize_label_from_title(synonym_label)
                        
                        if normalized_synonym_label in self.index:
                            existing = self.index[normalized_synonym_label]
                            print(
                                f"Warning: Synonym label '{synonym_label}' conflicts with existing label in {existing.file_path}"
                            )
                        else:
                            # Create a synonym reference that points to the same block
                            synonym_ref = BlockReference(
                                block=block,
                                file_path=file_path,
                                canonical_url=f"/mathnotes/{canonical_url}",
                                page_title=page_title,
                            )
                            # Store the synonym title for later use
                            synonym_ref.synonym_title = synonym_title
                            synonym_ref.is_synonym = True
                            self.index[normalized_synonym_label] = synonym_ref
                            
                            # Register synonym with reverse index
                            self.reverse_index.add_block_definition(
                                label=synonym_label,
                                file_path=file_path,
                                title=synonym_title,
                                url=f"/mathnotes/{canonical_url}#{block.label}"
                            )

    def _render_all_blocks(self):
        """Phase 4: Render all blocks now that the index and references are complete."""
        for file_info in self._pending_files:
            file_path = file_info["file_path"]
            canonical_url = file_info["canonical_url"]
            block_markers = file_info["block_markers"]
            page_title = file_info.get("page_title", "")

            # Create a new parser with the complete block index for proper cross-references
            parser = StructuredMathParser(current_file=file_path, block_index=self)

            # Initialize rendered blocks storage for this file
            self.rendered_blocks[file_path] = {}

            # Process blocks in dependency order: children before parents
            # First, identify root blocks (blocks without parents) and process recursively
            processed_blocks = set()

            def process_block_tree(block, marker_id):
                """Recursively process a block and its children."""
                # First process all child blocks
                for child_marker_id, child_block in block_markers.items():
                    if child_block.parent == block:
                        process_block_tree(child_block, child_marker_id)

                # Now process this block
                base_url = f"/mathnotes/{canonical_url}"
                # All blocks now have labels, so we can always add the fragment
                full_url = f"{base_url}#{block.label}"
                self._process_block_content(block, block_markers, parser, full_url)
                # Store the rendered HTML by marker ID
                self.rendered_blocks[file_path][marker_id] = block.rendered_html
                processed_blocks.add(marker_id)

            # Process all root blocks (blocks without parents)
            for marker_id, block in block_markers.items():
                if block.parent is None:
                    process_block_tree(block, marker_id)

        # Clean up temporary storage
        del self._pending_files
    
    def _collect_all_references(self):
        """Phase 2: Collect all references to build the reverse index."""
        for file_info in self._pending_files:
            file_path = file_info["file_path"]
            canonical_url = file_info["canonical_url"]
            block_markers = file_info["block_markers"]
            page_title = file_info.get("page_title", "")
            
            # Process page-level references (outside of blocks)
            with open(file_path, "r", encoding="utf-8") as f:
                post = frontmatter.load(f)
                original_content = post.content
                
                # Parse again to get content with markers
                from .structured_math import StructuredMathParser as SMParser
                temp_parser = SMParser()
                content_with_markers, _ = temp_parser.parse(original_content)
                
                # Now remove all block markers to get only non-block content
                remaining_content = content_with_markers
                for marker_id in block_markers.keys():
                    lines = remaining_content.split('\n')
                    filtered_lines = [line for line in lines if marker_id not in line]
                    remaining_content = '\n'.join(filtered_lines)
                
                # Only process if there's actual content left
                if remaining_content.strip():
                    from .tooltip_collector import TooltipCollectingBlockReferenceProcessor
                    page_ref_processor = TooltipCollectingBlockReferenceProcessor(
                        block_markers={}, current_file=file_path, block_index=self
                    )
                    page_ref_processor.process_references(remaining_content)
                    
                    if page_ref_processor.referenced_labels or page_ref_processor.embedded_labels:
                        base_url = f"/mathnotes/{canonical_url}"
                        
                        for referenced_label in page_ref_processor.referenced_labels:
                            self.reverse_index.add_reference(
                                referenced_label=referenced_label,
                                source_file=file_path,
                                source_label=None,
                                source_title=page_title,
                                source_url=base_url,
                                context="",
                                is_embed=False,
                                is_from_block=False
                            )
                        
                        for embedded_label in page_ref_processor.embedded_labels:
                            self.reverse_index.add_reference(
                                referenced_label=embedded_label,
                                source_file=file_path,
                                source_label=None,
                                source_title=page_title,
                                source_url=base_url,
                                context="",
                                is_embed=True,
                                is_from_block=False
                            )
            
            # Collect references from all blocks
            def collect_block_references(block, marker_id):
                """Recursively collect references from a block and its children."""
                # First process child blocks
                for child_marker_id, child_block in block_markers.items():
                    if child_block.parent == block:
                        collect_block_references(child_block, child_marker_id)
                
                # Collect references from this block
                from .tooltip_collector import TooltipCollectingBlockReferenceProcessor
                block_ref_processor = TooltipCollectingBlockReferenceProcessor(
                    block_markers=block_markers, current_file=file_path, block_index=self
                )
                block_ref_processor.process_references(block.content)
                
                # Add references to reverse index
                base_url = f"/mathnotes/{canonical_url}"
                # All blocks now have labels, so we can always add the fragment
                full_url = f"{base_url}#{block.label}"
                
                # Determine source info for the reference
                # Now that all blocks have labels (either explicit or implicit), this is simpler
                source_label = block.label
                source_title = block.title or block.label
                
                # Add references
                for referenced_label in block_ref_processor.referenced_labels:
                    self.reverse_index.add_reference(
                        referenced_label=referenced_label,
                        source_file=file_path,
                        source_label=source_label,
                        source_title=source_title,
                        source_url=full_url,
                        context="",
                        is_embed=False
                    )
                
                for embedded_label in block_ref_processor.embedded_labels:
                    self.reverse_index.add_reference(
                        referenced_label=embedded_label,
                        source_file=file_path,
                        source_label=source_label,
                        source_title=source_title,
                        source_url=full_url,
                        context="",
                        is_embed=True
                    )
            
            # Process all root blocks
            for marker_id, block in block_markers.items():
                if block.parent is None:
                    collect_block_references(block, marker_id)

    def _process_block_content(
        self, block: MathBlock, block_markers: Dict[str, MathBlock], parser: StructuredMathParser, full_url: str
    ):
        """Process and render a block using the same pipeline as page view."""
        # Process cross-references in the block content (first pass)
        # Use TooltipCollectingBlockReferenceProcessor to handle references and track them
        from .tooltip_collector import TooltipCollectingBlockReferenceProcessor

        block_ref_processor = TooltipCollectingBlockReferenceProcessor(
            block_markers=block_markers, current_file=parser.current_file, block_index=parser.block_index
        )
        content_with_refs = block_ref_processor.process_references(block.content)
        
        # Get base URL for building URLs
        file_path_normalized = parser.current_file.replace("\\", "/")
        canonical_url = self.url_mapper.get_canonical_url(file_path_normalized)
        base_url = f"/mathnotes/{canonical_url}"
        
        # Note: References are now collected in the separate _collect_all_references phase

        # Protect math expressions
        math_protector = MathProtector()
        protected_content = math_protector.protect_math(content_with_refs)

        # Convert to HTML
        html_content = self.md.convert(protected_content)
        self.md.reset()

        # Restore math expressions
        html_content = math_protector.restore_math(html_content)

        # Fix escaped asterisks and tildes (same as in markdown_processor.py)
        html_content = html_content.replace(r"\*", "*")
        html_content = html_content.replace(r"\~", "~")

        # Remove child block markers for tooltip use
        # Tooltips should only show the block's own content, not nested blocks
        clean_html = html_content
        for marker_id, child_block in block_markers.items():
            if child_block.parent == block and marker_id in clean_html:
                # Remove the marker entirely - don't include child content in tooltips
                clean_html = clean_html.replace(f"<p>{marker_id}</p>", "")
                clean_html = clean_html.replace(marker_id, "")

        # Store the clean inner HTML content (for tooltips and other uses)
        block.content_html = clean_html

        # Render the complete block HTML using the same method as page view
        # This will wrap the content and replace child markers with full child HTML
        rendered_html = parser.render_block_html(block, html_content, block_markers, self.md, full_url)
        
        # Add reference information (all blocks now have labels)
        # Get references for this block
        reverse_entry = self.reverse_index.get_references_for_label(block.label)
        
        if reverse_entry.direct_references or reverse_entry.transitive_references:
            # Build reference HTML that will be hidden by default via CSS
            ref_html = ['<div class="block-references-section">']
            ref_html.append('<details>')
            
            # Count references
            direct_count = len(reverse_entry.direct_references)
            transitive_count = sum(len(refs) for refs in reverse_entry.transitive_references.values())
            summary_parts = [f'{direct_count} direct']
            if transitive_count > 0:
                summary_parts.append(f'{transitive_count} transitive')
            ref_html.append(f'<summary>Referenced by ({", ".join(summary_parts)})</summary>')
            
            # Direct references
            if reverse_entry.direct_references:
                ref_html.append('<div class="direct-references">')
                ref_html.append('<h4>Direct references:</h4>')
                ref_html.append('<ul>')
                for ref in reverse_entry.direct_references:
                    ref_html.append('<li>')
                    if ref.source_url:
                        ref_html.append(f'<a href="{ref.source_url}">')
                        ref_html.append(ref.source_title or ref.source_label or ref.source_file.replace('content/', ''))
                        ref_html.append('</a>')
                    else:
                        ref_html.append(ref.source_title or ref.source_label or ref.source_file)
                    if ref.is_embed:
                        ref_html.append(' <span class="ref-type">(embedded)</span>')
                    ref_html.append('</li>')
                ref_html.append('</ul>')
                ref_html.append('</div>')
            
            # Transitive references
            if reverse_entry.transitive_references:
                ref_html.append('<div class="transitive-references">')
                for depth, refs in reverse_entry.transitive_references.items():
                    ref_html.append(f'<h4>Transitive (depth {depth}):</h4>')
                    ref_html.append('<ul>')
                    for ref in refs:
                        ref_html.append('<li>')
                        if ref.source_url:
                            ref_html.append(f'<a href="{ref.source_url}">')
                            ref_html.append(ref.source_title or ref.source_label or ref.source_file.replace('content/', ''))
                            ref_html.append('</a>')
                        else:
                            ref_html.append(ref.source_title or ref.source_label or ref.source_file)
                        ref_html.append('</li>')
                    ref_html.append('</ul>')
                ref_html.append('</div>')
            
            ref_html.append('</details>')
            ref_html.append('</div>')
            
            # Insert the reference HTML before the closing </div> of the math block
            # The rendered HTML ends with </div></div> (content div and block div)
            reference_section = ''.join(ref_html)
            
            # The HTML has two closing divs at the end (content div and block div)
            # We want to insert the reference section just before the final closing div
            # So we need to find the last </div> and insert before it
            last_div_idx = rendered_html.rfind('</div>')
            if last_div_idx != -1:
                rendered_html = rendered_html[:last_div_idx] + reference_section + rendered_html[last_div_idx:]
        
        block.rendered_html = rendered_html

    def get_reference(self, label: str) -> Optional[BlockReference]:
        """Get a block reference by its label."""
        # Normalize label for lookup
        from .structured_math import MathBlock

        normalized_label = MathBlock.normalize_label_from_title(label)
        return self.index.get(normalized_label)

    def get_rendered_html(self, file_path: str, marker_id: str) -> Optional[str]:
        """Get pre-rendered HTML for a block by file path and marker ID."""
        return self.rendered_blocks[file_path].get(marker_id)

    def find_blocks_by_type(self, block_type: str) -> List[BlockReference]:
        """Find all blocks of a specific type."""
        return [ref for ref in self.all_blocks if ref.block.block_type.value == block_type]
