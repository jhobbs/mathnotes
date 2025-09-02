"""
Reverse index for mathematical blocks.

This module tracks where each mathematical block is referenced from,
supporting transitive reference queries with configurable depth.
"""

from typing import Dict, Set, List, Optional, Tuple
from dataclasses import dataclass, field
from collections import defaultdict, deque
import re


@dataclass
class ReferenceInfo:
    """Information about a reference to a mathematical block."""
    
    source_file: str  # File containing the reference
    source_label: Optional[str] = None  # Label of the block containing the reference (if any)
    source_title: Optional[str] = None  # Title/description of the source
    source_url: str = ""  # URL to the source
    context: str = ""  # Text context around the reference
    is_embed: bool = False  # Whether this is an embed (@@) or link (@)
    is_from_block: bool = True  # Whether this reference is from a block (vs page-level)
    

@dataclass
class ReverseIndexEntry:
    """Entry in the reverse index for a mathematical block."""
    
    label: str  # Label of the referenced block
    direct_references: List[ReferenceInfo] = field(default_factory=list)
    transitive_references: Dict[int, List[ReferenceInfo]] = field(default_factory=dict)
    # transitive_references maps depth -> list of references at that depth
    

class ReverseIndex:
    """
    Maintains a reverse index of mathematical block references.
    
    For each labeled block, tracks:
    - Direct references (places that directly reference this block)
    - Transitive references (blocks that reference blocks that reference this one)
    """
    
    def __init__(self):
        # Main reverse index: label -> ReverseIndexEntry
        self.index: Dict[str, ReverseIndexEntry] = defaultdict(lambda: ReverseIndexEntry(""))
        
        # Graph of references for transitive computation
        # Maps source_label -> set of referenced labels
        self.reference_graph: Dict[str, Set[str]] = defaultdict(set)
        
        # Maps file path -> set of labels defined in that file
        self.file_labels: Dict[str, Set[str]] = defaultdict(set)
        
        # Maps label -> (file_path, title, url)
        self.label_info: Dict[str, Tuple[str, str, str]] = {}
        
    def add_block_definition(self, label: str, file_path: str, title: str = "", url: str = ""):
        """Register that a block with this label is defined in a file."""
        if label:
            normalized_label = self._normalize_label(label)
            self.file_labels[file_path].add(normalized_label)
            self.label_info[normalized_label] = (file_path, title, url)
            if normalized_label not in self.index:
                self.index[normalized_label] = ReverseIndexEntry(normalized_label)
    
    def add_reference(self, 
                     referenced_label: str,
                     source_file: str,
                     source_label: Optional[str] = None,
                     source_title: Optional[str] = None,
                     source_url: str = "",
                     context: str = "",
                     is_embed: bool = False,
                     is_from_block: bool = True):
        """Add a reference from source to target label."""
        
        referenced_label = self._normalize_label(referenced_label)
        
        # Create reference info
        ref_info = ReferenceInfo(
            source_file=source_file,
            source_label=self._normalize_label(source_label) if source_label else None,
            source_title=source_title,
            source_url=source_url,
            context=context,
            is_embed=is_embed,
            is_from_block=is_from_block
        )
        
        # Add to reverse index
        if referenced_label not in self.index:
            self.index[referenced_label] = ReverseIndexEntry(referenced_label)
        self.index[referenced_label].direct_references.append(ref_info)
        
        # Update reference graph for transitive computation
        if source_label:
            normalized_source = self._normalize_label(source_label)
            self.reference_graph[normalized_source].add(referenced_label)
    
    def collect_references_from_content(self, 
                                       content: str, 
                                       source_file: str,
                                       source_label: Optional[str] = None,
                                       source_title: Optional[str] = None,
                                       source_url: str = ""):
        """
        Extract and record all references from markdown content.
        
        Patterns to find:
        - @label or @type:label - Simple references
        - @{text|label} or @{text|type:label} - Custom text references
        - @@label or @@type:label - Embedded blocks
        """
        
        # Pattern for simple references: @label or @type:label
        simple_pattern = r'(?<!@)@([a-zA-Z_-]+(?::[a-zA-Z_-]+)?)'
        
        # Pattern for custom text references: @{text|label}
        custom_pattern = r'@\{([^|]+)\|([^}]+)\}'
        
        # Pattern for embedded blocks: @@label
        embed_pattern = r'@@([a-zA-Z_-]+(?::[a-zA-Z_-]+)?)'
        
        # Find all simple references
        for match in re.finditer(simple_pattern, content):
            ref_text = match.group(1)
            # Extract label (remove type prefix if present)
            if ':' in ref_text:
                _, label = ref_text.split(':', 1)
            else:
                label = ref_text
            
            # Get context (50 chars before and after)
            start = max(0, match.start() - 50)
            end = min(len(content), match.end() + 50)
            context = content[start:end]
            
            self.add_reference(
                referenced_label=label,
                source_file=source_file,
                source_label=source_label,
                source_title=source_title,
                source_url=source_url,
                context=context,
                is_embed=False
            )
        
        # Find all custom text references
        for match in re.finditer(custom_pattern, content):
            ref_text = match.group(2)
            # Extract label (remove type prefix if present)
            if ':' in ref_text:
                _, label = ref_text.split(':', 1)
            else:
                label = ref_text
            
            # Get context
            start = max(0, match.start() - 50)
            end = min(len(content), match.end() + 50)
            context = content[start:end]
            
            self.add_reference(
                referenced_label=label,
                source_file=source_file,
                source_label=source_label,
                source_title=source_title,
                source_url=source_url,
                context=context,
                is_embed=False
            )
        
        # Find all embedded blocks
        for match in re.finditer(embed_pattern, content):
            ref_text = match.group(1)
            # Extract label (remove type prefix if present)
            if ':' in ref_text:
                _, label = ref_text.split(':', 1)
            else:
                label = ref_text
            
            # Get context
            start = max(0, match.start() - 50)
            end = min(len(content), match.end() + 50)
            context = content[start:end]
            
            self.add_reference(
                referenced_label=label,
                source_file=source_file,
                source_label=source_label,
                source_title=source_title,
                source_url=source_url,
                context=context,
                is_embed=True
            )
    
    def compute_transitive_references(self, max_depth: int = 2):
        """
        Compute transitive references up to specified depth.
        
        For each block, find all blocks that reference it transitively:
        - Depth 1: Direct references (already stored)
        - Depth 2: Blocks that reference blocks that reference this one
        - Depth 3: And so on...
        """
        
        # Build reverse graph (referenced_label -> set of labels that reference it)
        reverse_graph: Dict[str, Set[str]] = defaultdict(set)
        for source_label, targets in self.reference_graph.items():
            for target in targets:
                reverse_graph[target].add(source_label)
        
        # For each labeled block, compute transitive references
        for label in self.index.keys():
            entry = self.index[label]
            
            # Use BFS to find transitive references at each depth
            visited = {label}  # Don't include self-references
            current_level = {label}
            
            for depth in range(1, max_depth + 1):
                next_level = set()
                
                for current_label in current_level:
                    # Find all labels that reference the current label
                    for referencing_label in reverse_graph.get(current_label, set()):
                        if referencing_label not in visited:
                            next_level.add(referencing_label)
                            visited.add(referencing_label)
                            
                            # Create reference info for this transitive reference
                            if referencing_label in self.label_info:
                                file_path, title, url = self.label_info[referencing_label]
                                ref_info = ReferenceInfo(
                                    source_file=file_path,
                                    source_label=referencing_label,
                                    source_title=title,
                                    source_url=url,
                                    context=f"Transitive reference at depth {depth}",
                                    is_embed=False
                                )
                                
                                if depth not in entry.transitive_references:
                                    entry.transitive_references[depth] = []
                                entry.transitive_references[depth].append(ref_info)
                
                current_level = next_level
    
    def get_references_for_label(self, label: str, max_depth: int = 0) -> ReverseIndexEntry:
        """
        Get all references for a given label.
        
        Args:
            label: The label to look up
            max_depth: Maximum transitive depth (0 = direct only)
        
        Returns:
            ReverseIndexEntry with direct and transitive references
        """
        normalized_label = self._normalize_label(label)
        
        if normalized_label not in self.index:
            return ReverseIndexEntry(normalized_label)
        
        entry = self.index[normalized_label]
        
        # Filter transitive references by depth
        if max_depth > 0:
            filtered_transitive = {}
            for depth in range(1, max_depth + 1):
                if depth in entry.transitive_references:
                    filtered_transitive[depth] = entry.transitive_references[depth]
            
            # Create a new entry with filtered transitive references
            return ReverseIndexEntry(
                label=entry.label,
                direct_references=entry.direct_references,
                transitive_references=filtered_transitive
            )
        else:
            # Return only direct references
            return ReverseIndexEntry(
                label=entry.label,
                direct_references=entry.direct_references,
                transitive_references={}
            )
    
    def _normalize_label(self, label: Optional[str]) -> str:
        """Normalize a label for consistent lookups."""
        if not label:
            return ""
        # Convert to lowercase and replace spaces/underscores with hyphens
        return label.lower().replace(' ', '-').replace('_', '-')
    
    def get_summary_stats(self) -> Dict[str, int]:
        """Get summary statistics about the reverse index."""
        total_blocks = len(self.index)
        blocks_with_refs = sum(1 for entry in self.index.values() if entry.direct_references)
        total_direct_refs = sum(len(entry.direct_references) for entry in self.index.values())
        total_transitive_refs = sum(
            sum(len(refs) for refs in entry.transitive_references.values())
            for entry in self.index.values()
        )
        
        return {
            'total_blocks': total_blocks,
            'blocks_with_references': blocks_with_refs,
            'total_direct_references': total_direct_refs,
            'total_transitive_references': total_transitive_refs,
            'total_files': len(self.file_labels)
        }