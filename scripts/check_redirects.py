#!/usr/bin/env python3
"""
Check for potential missing redirects by comparing git history
Usage: python scripts/check_redirects.py [--fix]
  --fix: Automatically add missing redirect_from entries
"""

import subprocess
import re
import os
import sys
from pathlib import Path
import yaml

def get_file_history(current_file):
    """Get the full rename history for a file"""
    try:
        # Use git log --follow to trace the full history of a file through renames
        result = subprocess.run([
            'git', 'log', '--follow', '--name-status', '--pretty=format:', '--', current_file
        ], capture_output=True, text=True, check=True)
        
        # Parse the output to get all previous names
        previous_names = []
        lines = [line for line in result.stdout.strip().split('\n') if line.strip()]
        
        current_name = current_file
        for line in lines:
            if line.startswith('R'):
                # Format: R100	old_file.md	new_file.md
                parts = line.split('\t')
                if len(parts) >= 3:
                    old_file = parts[1]
                    new_file = parts[2]
                    if new_file == current_name:
                        previous_names.append(old_file)
                        current_name = old_file
        
        return previous_names
    except subprocess.CalledProcessError:
        return []

def get_moved_files():
    """Get files that have been moved/renamed in recent commits"""
    try:
        # Get file renames/moves from recent commits
        result = subprocess.run([
            'git', 'log', '--name-status', '--pretty=format:', '--diff-filter=R', '-10'
        ], capture_output=True, text=True, check=True)
        
        moves = []
        current_files = set()
        
        for line in result.stdout.strip().split('\n'):
            if line.startswith('R'):
                # Format: R100	old_file.md	new_file.md
                parts = line.split('\t')
                if len(parts) >= 3 and parts[1].endswith('.md'):
                    old_file = parts[1]
                    new_file = parts[2]
                    
                    # Only include if the new file actually exists and we haven't processed it yet
                    if os.path.exists(new_file) and new_file not in current_files:
                        current_files.add(new_file)
                        
                        # Get the full history for this file
                        all_previous_names = get_file_history(new_file)
                        if all_previous_names:
                            # Use the most recent move for display, but we'll check all previous names
                            moves.append((old_file, new_file, all_previous_names))
                        else:
                            moves.append((old_file, new_file, [old_file]))
        
        return moves
    except subprocess.CalledProcessError:
        print("Error: Could not get git history")
        return []

def check_redirect_exists(new_file, all_previous_names):
    """Check if new file has redirect_from for any of the previous names"""
    try:
        if not os.path.exists(new_file):
            return False, "New file doesn't exist", []
            
        with open(new_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Parse frontmatter manually
        if content.startswith('---\n'):
            try:
                end_pos = content.find('\n---\n', 4)
                if end_pos != -1:
                    frontmatter_text = content[4:end_pos]
                    metadata = yaml.safe_load(frontmatter_text) or {}
                else:
                    metadata = {}
            except yaml.YAMLError:
                metadata = {}
        else:
            metadata = {}
            
        redirect_from = metadata.get('redirect_from', [])
        if isinstance(redirect_from, str):
            redirect_from = [redirect_from]
            
        found_redirects = []
        missing_redirects = []
        
        for old_file in all_previous_names:
            # Check various formats the old URL might be in
            old_url_variants = [
                old_file.replace('.md', ''),  # algebra/groups
                old_file,  # algebra/groups.md
                old_file.replace('.md', '').replace('/', '/'),  # normalized
            ]
            
            found = False
            for variant in old_url_variants:
                if variant in redirect_from:
                    found_redirects.append(variant)
                    found = True
                    break
                    
            if not found:
                missing_redirects.append(old_file.replace('.md', ''))
        
        if missing_redirects:
            return False, f"Missing redirects for: {', '.join(missing_redirects)}", missing_redirects
        else:
            return True, f"Found redirects for: {', '.join(found_redirects)}", []
        
    except Exception as e:
        return False, f"Error checking file: {e}", []

def add_redirects_to_file(new_file, missing_redirects):
    """Add multiple redirect_from entries to a file's frontmatter"""
    try:
        if not os.path.exists(new_file):
            return False, "New file doesn't exist"
            
        with open(new_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Parse existing frontmatter
        if content.startswith('---\n'):
            try:
                end_pos = content.find('\n---\n', 4)
                if end_pos != -1:
                    frontmatter_text = content[4:end_pos]
                    metadata = yaml.safe_load(frontmatter_text) or {}
                    body = content[end_pos + 5:]  # +5 for '\n---\n'
                else:
                    metadata = {}
                    body = content
            except yaml.YAMLError:
                metadata = {}
                body = content
        else:
            metadata = {}
            body = content
            
        # Add redirect_from entries
        redirect_from = metadata.get('redirect_from', [])
        
        if isinstance(redirect_from, str):
            redirect_from = [redirect_from]
        elif not isinstance(redirect_from, list):
            redirect_from = []
            
        added_redirects = []
        for missing_redirect in missing_redirects:
            if missing_redirect not in redirect_from:
                redirect_from.append(missing_redirect)
                added_redirects.append(missing_redirect)
        
        if added_redirects:
            metadata['redirect_from'] = redirect_from
            
            # Write back to file
            new_content = '---\n'
            new_content += yaml.dump(metadata, default_flow_style=False, allow_unicode=True)
            new_content += '---\n'
            new_content += body
            
            with open(new_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
                
            return True, f"Added redirect_from: {added_redirects}"
        else:
            return True, f"All redirects already exist"
            
    except Exception as e:
        return False, f"Error adding redirects: {e}"

def main():
    # Check for --fix argument
    fix_mode = '--fix' in sys.argv
    
    moves = get_moved_files()
    if not moves:
        print("✅ No file moves found in recent commits")
        return
        
    issues_found = False
    fixes_applied = 0
    problematic_files = []
    
    for move_data in moves:
        if len(move_data) == 3:
            old_file, new_file, all_previous_names = move_data
        else:
            # Fallback for old format
            old_file, new_file = move_data
            all_previous_names = [old_file]
            
        has_redirect, message, missing_redirects = check_redirect_exists(new_file, all_previous_names)
        
        if not has_redirect:
            # Only output details for files with issues
            if not issues_found:
                # First issue - print header
                if fix_mode:
                    print("🔧 Fixing missing redirects in recently moved files...\n")
                else:
                    print("🔍 Found missing redirects in recently moved files...\n")
            
            print(f"📁 Moved: {old_file} → {new_file}")
            if len(all_previous_names) > 1:
                print(f"   📜 Full history: {' → '.join(reversed(all_previous_names))} → {new_file}")
            
            print(f"   ❌ {message}")
            issues_found = True
            problematic_files.append((new_file, missing_redirects))
            
            if fix_mode and missing_redirects:
                # Try to add the missing redirects
                success, fix_message = add_redirects_to_file(new_file, missing_redirects)
                if success:
                    print(f"   🔧 {fix_message}")
                    fixes_applied += 1
                else:
                    print(f"   ❌ Failed to fix: {fix_message}")
            else:
                print(f"   💡 Consider adding: redirect_from: {missing_redirects}")
            
            print()
    
    if fix_mode:
        if fixes_applied > 0:
            print(f"✅ Applied {fixes_applied} redirect fixes!")
            print("💡 Review the changes and commit them when ready")
        elif issues_found:
            print("⚠️  Some files couldn't be fixed automatically")
        else:
            print("✅ All moved files already have appropriate redirects")
    else:
        if issues_found:
            print("⚠️  Some moved files may be missing redirects!")
            print("💡 Run with --fix to automatically add missing redirects")
            print("💡 Or use ./scripts/move_file.sh for future moves to avoid this")
        else:
            print("✅ All moved files have appropriate redirects")

if __name__ == "__main__":
    main()