"""
Markdown processing utilities for the Mathnotes application.
"""

import os
import re
from pathlib import Path
from typing import Dict, Optional
import frontmatter
from .config import create_markdown_instance
from .structured_math import StructuredMathParser, process_structured_math_content

class MarkdownProcessor:
    """Handles markdown processing with Jekyll includes, wiki links, and structured math."""
    
    def __init__(self, url_mapper):
        self.md = create_markdown_instance()
        self.url_mapper = url_mapper
    
    def render_markdown_file(self, filepath: str) -> Optional[Dict]:
        """
        Read and render a markdown file with frontmatter.
        
        Args:
            filepath: Path to the markdown file
            
        Returns:
            Dictionary with content, metadata, and other rendering info
        """
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                post = frontmatter.load(f)
                
                # Process Jekyll-style includes
                content = post.content
                include_pattern = r'{%\s*include_relative\s+([^\s%}]+)\s*%}'
                
                def replace_include(match):
                    include_file = match.group(1)
                    # Get the directory of the current markdown file
                    current_dir = os.path.dirname(filepath)
                    # Create the URL path for the included file
                    url_path = os.path.join(current_dir, include_file).replace('\\', '/')
                    # Return an iframe that loads the HTML file with fullscreen button
                    iframe_id = f"demo-{hash(url_path)}"
                    return f'''<div class="demo-container">
                        <iframe id="{iframe_id}" src="/mathnotes/{url_path}" width="100%" height="800" frameborder="0"></iframe>
                        <button class="fullscreen-btn" data-iframe-id="{iframe_id}" data-src="/mathnotes/{url_path}" title="Open in fullscreen">⛶</button>
                    </div>'''
                
                content = re.sub(include_pattern, replace_include, content)
                
                # Process wiki-style internal links [[slug]] or [[text|slug]]
                content = re.sub(r'\[\[([^\]]+)\]\]', self._replace_wiki_link, content)
                
                # Process structured mathematical content - first pass
                math_parser = StructuredMathParser()
                content, block_markers = math_parser.parse(content)
                
                # Protect math delimiters from markdown processing
                content, display_math_blocks = self._protect_display_math(content)
                content, inline_math_blocks = self._protect_inline_math(content)
                
                # Convert markdown to HTML
                html_content = self.md.convert(content)
                
                # Restore math blocks with their original content
                html_content = self._restore_math_blocks(html_content, display_math_blocks, inline_math_blocks)
                
                # Fix relative image paths to include content/ prefix
                html_content = self._fix_relative_image_paths(html_content, filepath)
                
                # Fix escaped asterisks and tildes that should be rendered normally
                html_content = html_content.replace(r'\*', '*')
                html_content = html_content.replace(r'\~', '~')
                
                # Process structured mathematical content - second pass
                if block_markers:
                    html_content = process_structured_math_content(html_content, block_markers, self.md)
                
                # Get canonical URL for this file
                file_path_normalized = filepath.replace('\\', '/')
                canonical_url = self.url_mapper.get_canonical_url(file_path_normalized)
                if canonical_url:
                    canonical_path = f"/mathnotes/{canonical_url}"
                else:
                    # Fallback to current URL structure
                    file_path_no_ext = file_path_normalized.replace('.md', '')
                    canonical_path = f"/mathnotes/{file_path_no_ext}"
                
                # Generate description from frontmatter or content
                description = self._generate_description(post.metadata, html_content)
                
                return {
                    'content': html_content,
                    'metadata': post.metadata,
                    'title': post.metadata.get('title', Path(filepath).stem.replace('-', ' ').title()),
                    'page_description': description,
                    'source_path': filepath,
                    'canonical_url': canonical_path
                }
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            return None
    
    def _replace_wiki_link(self, match):
        """Replace wiki-style links with proper markdown links."""
        link_content = match.group(1)
        if '|' in link_content:
            # Format: [[Link Text|slug]]
            link_text, slug = link_content.split('|', 1)
            link_text = link_text.strip()
            slug = slug.strip()
        else:
            # Format: [[slug]]
            slug = link_content.strip()
            link_text = slug.replace('-', ' ').title()
        
        # Check if slug contains a section prefix
        if '/' in slug:
            # Direct section/slug reference
            canonical_url = slug
        else:
            # Search for the slug in our mappings
            canonical_url = self._find_slug_in_mappings(slug)
        
        if canonical_url:
            return f'[{link_text}](/mathnotes/{canonical_url})'
        else:
            # If slug not found, return the original text with a broken link indicator
            return f'[{link_text}](#broken-link-{slug})'
    
    def _find_slug_in_mappings(self, slug: str) -> Optional[str]:
        """Find a slug in the URL mappings."""
        # First try exact match in current section (this would require context)
        # For now, search all sections
        for url in self.url_mapper.url_mappings:
            if url.endswith(f"/{slug}") or url == slug:
                return url
        return None
    
    def _protect_display_math(self, content: str):
        """Protect display math ($$...$$) from markdown processing."""
        display_math_blocks = {}
        display_counter = 0
        
        def replace_display_math(match):
            nonlocal display_counter
            placeholder = f'DISPLAYMATH{display_counter}PLACEHOLDER'
            math_content = match.group(0)
            display_math_blocks[placeholder] = math_content
            display_counter += 1
            return placeholder
        
        content = re.sub(r'\$\$.*?\$\$', replace_display_math, content, flags=re.DOTALL)
        return content, display_math_blocks
    
    def _protect_inline_math(self, content: str):
        """Protect inline math ($...$) from markdown processing."""
        inline_math_blocks = {}
        inline_counter = 0
        
        def replace_inline_math(match):
            nonlocal inline_counter
            placeholder = f'INLINEMATH{inline_counter}PLACEHOLDER'
            inline_math_blocks[placeholder] = match.group(0)
            inline_counter += 1
            return placeholder
        
        content = re.sub(r'(?<!\$)\$(?!\$).*?\$(?!\$)', replace_inline_math, content)
        return content, inline_math_blocks
    
    def _restore_math_blocks(self, html_content: str, display_math_blocks: Dict, inline_math_blocks: Dict) -> str:
        """Restore protected math blocks in HTML content."""
        # Restore math blocks with their original content
        for placeholder, math_content in display_math_blocks.items():
            # Fix escaped backslashes in math content for proper LaTeX rendering
            fixed_math_content = self._fix_math_backslashes(math_content)
            html_content = html_content.replace(placeholder, fixed_math_content)
        
        for placeholder, math_content in inline_math_blocks.items():
            # Fix escaped backslashes in math content for proper LaTeX rendering
            fixed_math_content = self._fix_math_backslashes(math_content)
            html_content = html_content.replace(placeholder, fixed_math_content)
        
        return html_content
    
    def _fix_math_backslashes(self, math_content: str) -> str:
        """Fix escaped backslashes in math content for proper LaTeX rendering."""
        # In markdown processing, \\ can get converted to single \ which breaks LaTeX line breaks
        # We need to restore proper \\ for LaTeX environments like cases, align, etc.
        
        # Fix line breaks in LaTeX environments
        # Pattern: single backslash followed by whitespace and then & or end of line
        # This typically happens in cases, align, matrix environments
        fixed_content = re.sub(r'(?<!\\)\\(?!\\)(\s*(?:&|\n|\r|$))', r'\\\\\\1', math_content, flags=re.MULTILINE)
        
        return fixed_content
    
    def _generate_description(self, metadata: Dict, html_content: str) -> str:
        """Generate page description from frontmatter or content."""
        description = metadata.get('description', '')
        if not description:
            # Generate description from first paragraph of content
            # Remove HTML tags and math expressions for a clean description
            clean_content = re.sub(r'<[^>]+>', '', html_content)  # Remove HTML tags
            clean_content = re.sub(r'\$\$[^$]+\$\$', '', clean_content)  # Remove display math
            clean_content = re.sub(r'\$[^$]+\$', '', clean_content)  # Remove inline math
            clean_content = re.sub(r'\s+', ' ', clean_content).strip()  # Normalize whitespace
            
            # Take first sentence or up to 160 characters
            if clean_content:
                sentences = clean_content.split('. ')
                if sentences:
                    description = sentences[0]
                    if len(description) > 160:
                        description = description[:157] + '...'
                    elif not description.endswith('.'):
                        description += '.'
        
        return description
    
    def _fix_relative_image_paths(self, html_content: str, filepath: str) -> str:
        """Fix image paths in HTML to include the content directory prefix."""
        import re
        import os
        
        # Get the directory of the current markdown file
        current_dir = os.path.dirname(filepath)
        
        # Pattern to match img tags with src attributes
        img_pattern = r'<img([^>]*)\ssrc="([^"]+)"([^>]*)>'
        
        def replace_img_src(match):
            pre_attrs = match.group(1)
            src = match.group(2)
            post_attrs = match.group(3)
            
            # Skip if it's already an absolute URL or data URI
            if (src.startswith('http://') or src.startswith('https://') or 
                src.startswith('data:')):
                return match.group(0)  # Return unchanged
            
            # Handle absolute paths starting with /mathnotes/ but missing content/ prefix
            if src.startswith('/mathnotes/') and not src.startswith('/mathnotes/content/'):
                # Check if this path refers to a file that should be in content/
                old_path = src[len('/mathnotes/'):]  # Remove /mathnotes/ prefix
                if not old_path.startswith('static/'):  # Don't modify static file paths
                    new_src = f"/mathnotes/content/{old_path}"
                    return f'<img{pre_attrs} src="{new_src}"{post_attrs}>'
            
            # Handle relative paths
            elif not src.startswith('/'):
                # Convert relative path to include the content directory
                if current_dir:
                    new_src = f"/mathnotes/{current_dir}/{src}"
                else:
                    new_src = f"/mathnotes/{src}"
                return f'<img{pre_attrs} src="{new_src}"{post_attrs}>'
            
            return match.group(0)  # Return unchanged
        
        return re.sub(img_pattern, replace_img_src, html_content)