#!/usr/bin/env python3
"""
Build an index of all math blocks for Vim autocompletion.
Outputs a JSON file with all theorem/definition/proof labels and their metadata.
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Any

def extract_math_blocks(content: str, filepath: str) -> List[Dict[str, Any]]:
    """Extract all math blocks with labels from markdown content."""
    blocks = []
    
    # Pattern for structured math blocks
    block_pattern = r':::(\w+)\s+(\w+)(.*?):::'
    
    for match in re.finditer(block_pattern, content, re.DOTALL):
        block_type = match.group(1)
        label = match.group(2)
        block_content = match.group(3).strip()
        
        # Extract title if present
        title_match = re.search(r'^#\s+(.+?)$', block_content, re.MULTILINE)
        title = title_match.group(1) if title_match else ""
        
        # Get first line of content for preview (excluding title)
        lines = block_content.split('\n')
        preview_lines = []
        for line in lines:
            if not line.startswith('#') and line.strip():
                preview_lines.append(line.strip())
                if len(preview_lines) >= 2:
                    break
        preview = ' '.join(preview_lines)[:100]
        
        blocks.append({
            'label': label,
            'type': block_type,
            'title': title,
            'preview': preview,
            'file': str(filepath),
            'reference': f"@{label}",
            'typed_reference': f"@{block_type}:{label}"
        })
    
    return blocks

def build_index(content_dir: Path) -> Dict[str, Any]:
    """Build complete index of all math blocks."""
    all_blocks = []
    
    # Walk through all markdown files
    for md_file in content_dir.rglob('*.md'):
        # Skip non-content files
        if 'node_modules' in str(md_file) or '.git' in str(md_file):
            continue
            
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
                blocks = extract_math_blocks(content, md_file.relative_to(content_dir))
                all_blocks.extend(blocks)
        except Exception as e:
            print(f"Error processing {md_file}: {e}")
    
    # Sort by label for easier searching
    all_blocks.sort(key=lambda x: x['label'])
    
    return {
        'version': '1.0',
        'blocks': all_blocks,
        'total': len(all_blocks)
    }

def main():
    # Check for --json flag to output to stdout
    output_json_to_stdout = '--json' in sys.argv
    
    # Find project root
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    content_dir = project_root / 'content'
    
    if not content_dir.exists():
        if not output_json_to_stdout:
            print(f"Content directory not found: {content_dir}", file=sys.stderr)
        return 1
    
    # Build the index
    if not output_json_to_stdout:
        print(f"Building math block index from {content_dir}...", file=sys.stderr)
    index = build_index(content_dir)
    
    if output_json_to_stdout:
        # Output JSON to stdout for consumption by other tools
        json.dump(index, sys.stdout, indent=2)
    else:
        # Always output to project root, creating a .vim-mathblocks directory
        output_dir = project_root / '.vim-mathblocks'
        
        # Create output directory if needed
        output_dir.mkdir(exist_ok=True)
        
        # Write to JSON file
        output_file = output_dir / 'mathblock-index.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(index, f, indent=2)
        
        print(f"Index built successfully!")
        print(f"  Total blocks: {index['total']}")
        print(f"  Output: {output_file}")
        
        # Also create a simple text file for quick grep
        txt_file = output_dir / 'mathblock-index.txt'
        with open(txt_file, 'w', encoding='utf-8') as f:
            for block in index['blocks']:
                line = f"{block['reference']}\t{block['type']}\t{block['title']}\t{block['file']}\n"
                f.write(line)
        print(f"  Text index: {txt_file}")
    
    return 0

if __name__ == '__main__':
    exit(main())