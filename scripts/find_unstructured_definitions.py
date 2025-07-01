#!/usr/bin/env python3
"""
Find potential definitions in markdown files that aren't using definition blocks.

This script searches for patterns that commonly indicate definitions:
- Bold text followed by "is" or "are"
- Sentences containing "defined as" or "is defined"
- Other definition-like patterns

Outputs a report file with all findings for later review.
"""

import os
import re
from pathlib import Path
from typing import List, Tuple, Dict
from datetime import datetime

# Pattern for structured definition blocks
STRUCTURED_DEF_PATTERN = re.compile(r':::+\s*definition', re.IGNORECASE)

# Patterns that might indicate unstructured definitions
DEFINITION_PATTERNS = [
    # Bold text followed by "is" or "are" (e.g., "A **group** is...")
    (re.compile(r'\*\*([^*]+)\*\*\s+(is|are)\s+', re.IGNORECASE), 'bold_is'),
    
    # "is/are called" pattern (e.g., "...is called a **homomorphism**")
    (re.compile(r'(is|are)\s+called\s+(a|an|the)?\s*\*\*([^*]+)\*\*', re.IGNORECASE), 'is_called_bold'),
    
    # "defined as/by" patterns
    (re.compile(r'(is|are)?\s*(defined|define)\s+(as|by|to be)\s+', re.IGNORECASE), 'defined_as'),
    
    # "denoted by" patterns (often part of definitions)
    (re.compile(r'denoted\s+(by|as)\s+', re.IGNORECASE), 'denoted_by'),
    
    # Definition with dash or colon (e.g., "Definition: A foo is...")
    (re.compile(r'^(Definition|Def\.?)\s*[-:]?\s*', re.IGNORECASE | re.MULTILINE), 'definition_label'),
    
    # Bold at start of line followed by colon or dash
    (re.compile(r'^\*\*([^*]+)\*\*\s*[-:]', re.MULTILINE), 'bold_start_colon'),
    
    # "We say that" or "We call" patterns
    (re.compile(r'(We\s+say\s+that|We\s+call)\s+', re.IGNORECASE), 'we_say_call'),
    
    # Mathematical "Let X be a Y" patterns
    (re.compile(r'Let\s+\$[^$]+\$\s+be\s+(a|an)\s+', re.IGNORECASE), 'let_be'),
]

class DefinitionFinder:
    def __init__(self, content_dir: str):
        self.content_dir = Path(content_dir)
        self.findings: List[Dict] = []
        
    def find_unstructured_definitions(self):
        """Search all markdown files for potential unstructured definitions."""
        for md_file in self.content_dir.rglob('*.md'):
            self._analyze_file(md_file)
    
    def _analyze_file(self, file_path: Path):
        """Analyze a single markdown file for potential definitions."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Skip if file uses structured definitions
            if STRUCTURED_DEF_PATTERN.search(content):
                # Still check - might have both structured and unstructured
                pass
            
            # Split into lines for context
            lines = content.split('\n')
            
            # Check each pattern
            for pattern, pattern_type in DEFINITION_PATTERNS:
                for match in pattern.finditer(content):
                    # Find line number
                    line_num = content[:match.start()].count('\n') + 1
                    
                    # Get context (3 lines before and after)
                    start_line = max(0, line_num - 4)
                    end_line = min(len(lines), line_num + 3)
                    context_lines = lines[start_line:end_line]
                    
                    # Skip if already in a definition block
                    if self._is_in_definition_block(lines, line_num - 1):
                        continue
                    
                    # Skip if in a code block
                    if self._is_in_code_block(lines, line_num - 1):
                        continue
                    
                    finding = {
                        'file': str(file_path.relative_to(self.content_dir)),
                        'line': line_num,
                        'pattern_type': pattern_type,
                        'matched_text': match.group(0),
                        'context': context_lines,
                        'context_start_line': start_line + 1
                    }
                    
                    self.findings.append(finding)
                    
        except Exception as e:
            print(f"Error analyzing {file_path}: {e}")
    
    def _is_in_definition_block(self, lines: List[str], line_idx: int) -> bool:
        """Check if a line is already inside a definition block."""
        block_depth = 0
        for i in range(line_idx + 1):
            line = lines[i]
            # Check for block start
            if re.match(r'^:::+\s*definition', line, re.IGNORECASE):
                block_depth += 1
            # Check for block end
            elif re.match(r'^:::+\s*$', line) and block_depth > 0:
                block_depth -= 1
        
        return block_depth > 0
    
    def _is_in_code_block(self, lines: List[str], line_idx: int) -> bool:
        """Check if a line is inside a code block."""
        in_code = False
        for i in range(line_idx + 1):
            line = lines[i].strip()
            if line.startswith('```'):
                in_code = not in_code
        return in_code
    
    def generate_report(self, output_file: str):
        """Generate a markdown report of all findings."""
        # Sort findings by file and line number
        self.findings.sort(key=lambda x: (x['file'], x['line']))
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# Unstructured Definitions Report\n\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"Found {len(self.findings)} potential unstructured definitions.\n\n")
            f.write("---\n\n")
            
            current_file = None
            for finding in self.findings:
                # New file section
                if finding['file'] != current_file:
                    current_file = finding['file']
                    f.write(f"\n## {current_file}\n\n")
                
                f.write(f"### Line {finding['line']} - Pattern: {finding['pattern_type']}\n\n")
                f.write(f"**Matched text:** `{finding['matched_text']}`\n\n")
                f.write("**Context:**\n```markdown\n")
                
                for i, line in enumerate(finding['context']):
                    line_num = finding['context_start_line'] + i
                    marker = '>>>' if line_num == finding['line'] else '   '
                    f.write(f"{marker} {line_num:4d}: {line}\n")
                
                f.write("```\n\n")
                f.write("---\n\n")
    
    def generate_summary(self):
        """Generate a summary of findings by pattern type."""
        summary = {}
        for finding in self.findings:
            pattern_type = finding['pattern_type']
            if pattern_type not in summary:
                summary[pattern_type] = []
            summary[pattern_type].append(finding)
        
        print("\n=== Summary by Pattern Type ===")
        for pattern_type, findings in summary.items():
            print(f"\n{pattern_type}: {len(findings)} occurrences")
            # Show a few examples
            for finding in findings[:3]:
                print(f"  - {finding['file']}:{finding['line']} - {finding['matched_text'][:50]}...")

def main():
    content_dir = "/home/jason/mathnotes/content"
    output_file = "/home/jason/mathnotes/unstructured_definitions_report.md"
    
    print("Searching for unstructured definitions...")
    finder = DefinitionFinder(content_dir)
    finder.find_unstructured_definitions()
    
    print(f"\nFound {len(finder.findings)} potential unstructured definitions.")
    
    print(f"\nGenerating report to {output_file}...")
    finder.generate_report(output_file)
    
    finder.generate_summary()
    
    print(f"\nReport saved to: {output_file}")

if __name__ == "__main__":
    main()