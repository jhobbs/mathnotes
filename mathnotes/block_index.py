"""
Global block index for cross-file references in structured mathematical content.

This module provides a system for indexing all labeled blocks across all content
files, enabling cross-file references using the @label syntax.
"""

import html
import os
from typing import Dict, Optional, List
from dataclasses import dataclass
from .structured_math import MathBlock, render_block_html, CHILD_MARKER_RE
from .ref_resolver import RefResolver
from .reverse_index import ReverseIndex
from .content_loader import load_content_file


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
        self.notation_map: Dict[str, BlockReference] = {}  # Notation macro name -> declaring block
        self._is_built = False
        # Initialize reverse index for tracking references
        self.reverse_index = ReverseIndex()

    def build_index(self):
        """Build the global index by scanning all content files."""
        # Refresh the notation registry first: a changed registry clears the
        # content and page caches (see notation.refresh_registry), forcing
        # re-parse of every page whose math embeds a stale expansion.
        from . import notation

        if notation.refresh_registry():
            print("Notation registry changed: invalidated all content/page caches")

        # Reset any residue from a build that failed partway (e.g. a content
        # dialect error during an incremental rebuild) so blocks aren't
        # double-registered on the next attempt
        self._pending_files = []

        content_dir = "content"

        # Snapshot label signatures before rebuilding so we can detect which
        # blocks were added, removed, or changed and invalidate the cached
        # renders of pages that reference them (their own mtime is unchanged,
        # so the page-render cache would otherwise serve stale HTML).
        previous_signatures = self._label_signatures() if self._is_built else None

        # Clear existing data structures to allow rebuilding
        self.index.clear()
        self.all_blocks.clear()
        self.notation_map.clear()
        self.reverse_index = ReverseIndex()

        # Phase 1: Scan and index all blocks
        self._scan_directory(content_dir)

        # Phase 2: Build the reverse index by collecting all references
        self._collect_all_references()

        # Phase 3: Compute transitive references
        self.reverse_index.compute_transitive_references()

        # Phase 4: Render all blocks with reference information now available
        self._render_all_blocks()

        # On incremental rebuilds, invalidate cached renders of files that
        # reference any block whose definition was added, removed, or changed.
        if previous_signatures is not None:
            self._invalidate_stale_renders(previous_signatures)

        self._is_built = True

        # Log index statistics
        print(
            f"Block index built: {len(self.index)} labeled blocks found, {self._rendered_count} total blocks rendered"
        )

        # Log reverse index statistics
        stats = self.reverse_index.get_summary_stats()
        print(f"Reverse index built: {stats['blocks_with_references']} blocks referenced, {stats['total_direct_references']} direct references")

    def _label_signatures(self) -> Dict[str, tuple]:
        """Map each label to a signature of the block it currently resolves to."""
        # Known dev-watcher staleness edge: this signature doesn't cover the
        # backlink ("Referenced by") panel, so an incremental rebuild that
        # only changes block B's referrers can leave a cached page that
        # @@embeds B serving B's stale backlink panel. Full builds unaffected.
        return {
            label: (ref.canonical_url, ref.block.block_type.value, ref.block.title, ref.block.content)
            for label, ref in self.index.items()
        }

    def _invalidate_stale_renders(self, previous_signatures: Dict[str, tuple]):
        """Invalidate cached page renders affected by added/removed/changed blocks.

        Pages embed referenced blocks' content (tooltips and @@label embeds), which in
        turn contains links for the references inside those blocks. So a change
        to one label can affect any page that reaches it through the reference
        graph; treat the changed labels and every block that transitively
        references them as dirty, then invalidate all files that reference a
        dirty label directly.
        """
        current_signatures = self._label_signatures()
        changed_labels = {
            label
            for label in previous_signatures.keys() | current_signatures.keys()
            if previous_signatures.get(label) != current_signatures.get(label)
        }
        if not changed_labels:
            return

        dirty_labels = set(changed_labels)
        for label in changed_labels:
            entry = self.reverse_index.get_references_for_label(label)
            for ref_info in entry.direct_references:
                if ref_info.source_label:
                    dirty_labels.add(ref_info.source_label)
            for refs in entry.transitive_references.values():
                for ref_info in refs:
                    if ref_info.source_label:
                        dirty_labels.add(ref_info.source_label)

        affected_files = set()
        for label in dirty_labels:
            entry = self.reverse_index.get_references_for_label(label)
            for ref_info in entry.direct_references:
                affected_files.add(ref_info.source_file)

        if affected_files:
            from .page_renderer import invalidate_page_cache

            for file_path in affected_files:
                invalidate_page_cache(file_path)
            print(
                f"Invalidated {len(affected_files)} cached page(s) referencing "
                f"{len(changed_labels)} changed block label(s)"
            )

    def _scan_directory(self, directory: str):
        """Recursively scan a directory for content files and index their blocks."""
        for root, dirs, files in os.walk(directory):
            # Skip hidden directories; sort for a deterministic scan order so
            # colliding auto-generated labels (e.g. two files both containing
            # an unlabeled 'remark-5') resolve the same way in every build
            dirs[:] = sorted(d for d in dirs if not d.startswith("."))

            for file in sorted(files):
                if file.endswith(".tex"):
                    file_path = os.path.join(root, file)
                    self._index_file(file_path)

    def _index_file(self, file_path: str):
        """Index all labeled blocks in a single content file."""
        metadata, pagedoc = load_content_file(file_path)

        # Get page title from metadata
        page_title = metadata.get("title", None)

        top_blocks = pagedoc.top_blocks()
        all_blocks = [b for t in top_blocks for b in t.walk()]

        # Get canonical URL for this file
        file_path_normalized = file_path.replace("\\", "/")
        canonical_url = self.url_mapper.get_canonical_url(file_path_normalized)

        # Store the doc and metadata for phases 2-4
        if not hasattr(self, "_pending_files"):
            self._pending_files = []
        self._pending_files.append(
            {
                "file_path": file_path,
                "canonical_url": canonical_url,
                "page_title": page_title,
                "pagedoc": pagedoc,
                "top_blocks": top_blocks,
            }
        )

        # Index blocks for reference and display
        for block in all_blocks:
            ref = BlockReference(
                block=block,
                file_path=file_path,
                canonical_url=f"/mathnotes/{canonical_url}",
                page_title=page_title,
            )

            for notation_name, _ in block.notations:
                if notation_name in self.notation_map:
                    existing = self.notation_map[notation_name]
                    print(
                        f"Warning: Duplicate notation '\\{notation_name}' in "
                        f"{file_path} (previously in {existing.file_path})"
                    )
                self.notation_map[notation_name] = ref

            # Only add top-level blocks to all_blocks (for index pages)
            # Nested blocks will appear inside their parents
            if block.parent is None:
                self.all_blocks.append(ref)

            # Add to the label index for cross-references (all blocks now have labels)
            # Normalize label for storage (case-insensitive lookup)
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
            # Include both manual synonyms and auto-generated synonyms
            all_synonyms = list(block.synonyms) + list(getattr(block, 'auto_generated_synonyms', []))

            if all_synonyms:
                for synonym_title, synonym_label in all_synonyms:
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

    def _collect_all_references(self):
        """Phase 2: Collect all references to build the reverse index."""
        for file_info in self._pending_files:
            file_path = file_info["file_path"]
            canonical_url = file_info["canonical_url"]
            page_title = file_info.get("page_title", "")
            base_url = f"/mathnotes/{canonical_url}"

            # Page-level references (prose outside of any block)
            page_resolver = RefResolver(self, self.url_mapper, current_file=file_path)
            for item in file_info["pagedoc"].items:
                if isinstance(item, str):
                    page_resolver.collect(item)
            # sorted(): referenced_labels/embedded_labels are sets, whose
            # iteration order depends on Python's per-process string hash
            # seed. Each label here targets an independent reverse-index
            # entry, so this particular ordering is not the source of the
            # cross-build "Referenced by" nondeterminism (see reverse_index's
            # compute_transitive_references), but sorting keeps every
            # traversal that touches these sets equally reproducible.
            for label in sorted(page_resolver.referenced_labels):
                self.reverse_index.add_reference(
                    referenced_label=label, source_file=file_path, source_label=None,
                    source_title=page_title, source_url=base_url, context="",
                    is_embed=False, is_from_block=False)
            for label in sorted(page_resolver.embedded_labels):
                self.reverse_index.add_reference(
                    referenced_label=label, source_file=file_path, source_label=None,
                    source_title=page_title, source_url=base_url, context="",
                    is_embed=True, is_from_block=False)

            # References from inside blocks (any depth)
            for top in file_info["top_blocks"]:
                for block in top.walk():
                    r = RefResolver(self, self.url_mapper, current_file=file_path,
                                    current_block_label=block.label)
                    r.collect(block.body_html)
                    full_url = f"{base_url}#{block.label}"
                    for label in sorted(r.referenced_labels):
                        self.reverse_index.add_reference(
                            referenced_label=label, source_file=file_path,
                            source_label=block.label, source_title=block.title or block.label,
                            source_url=full_url, context="", is_embed=False)
                    for label in sorted(r.embedded_labels):
                        self.reverse_index.add_reference(
                            referenced_label=label, source_file=file_path,
                            source_label=block.label, source_title=block.title or block.label,
                            source_url=full_url, context="", is_embed=True)

    def _render_all_blocks(self):
        """Phase 4: Render all blocks now that the index and references are complete."""
        rendered = 0
        for file_info in self._pending_files:
            file_path = file_info["file_path"]
            base_url = f"/mathnotes/{file_info['canonical_url']}"

            def render_tree(block):
                nonlocal rendered
                for child in block.children:
                    render_tree(child)
                self._process_block_content(block, file_path, f"{base_url}#{block.label}")
                rendered += 1

            for top in file_info["top_blocks"]:
                render_tree(top)
        self._rendered_count = rendered
        del self._pending_files

    def _process_block_content(self, block: MathBlock, file_path: str, full_url: str):
        """Resolve references in a block's body and render its final HTML."""
        resolver = RefResolver(self, self.url_mapper, current_file=file_path,
                               current_block_label=block.label)
        content_html = resolver.resolve(block.body_html)

        # Tooltip content: this block's own content only, children removed
        block.content_html = CHILD_MARKER_RE.sub("", content_html).strip()

        rendered_html = render_block_html(block, content_html, full_url)

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
                        ref_html.append(html.escape(ref.source_title or ref.source_label or ref.source_file.replace('content/', '')))
                        ref_html.append('</a>')
                    else:
                        ref_html.append(html.escape(ref.source_title or ref.source_label or ref.source_file))
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
                            ref_html.append(html.escape(ref.source_title or ref.source_label or ref.source_file.replace('content/', '')))
                            ref_html.append('</a>')
                        else:
                            ref_html.append(html.escape(ref.source_title or ref.source_label or ref.source_file))
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
        normalized_label = MathBlock.normalize_label_from_title(label)
        return self.index.get(normalized_label)

    def find_blocks_by_type(self, block_type: str) -> List[BlockReference]:
        """Find all blocks of a specific type."""
        return [ref for ref in self.all_blocks if ref.block.block_type.value == block_type]
