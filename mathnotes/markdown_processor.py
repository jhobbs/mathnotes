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
from .math_utils import MathProtector, BlockReferenceProcessor
from flask import g

class MarkdownProcessor:
    """Handles markdown processing with Jekyll includes, wiki links, and structured math."""
    
    def __init__(self, url_mapper, block_index=None):
        self.md = create_markdown_instance()
        self.url_mapper = url_mapper
        self.block_index = block_index
    
    def render_markdown_file(self, filepath: str) -> Optional[Dict]:
        """
        Read and render a markdown file with frontmatter.
        
        Args:
            filepath: Path to the markdown file
            
        Returns:
            Dictionary with content, metadata, and other rendering info
        """
        # Track demos for this render
        integrated_demos = []
        demo_scripts = []
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                post = frontmatter.load(f)
                
                # Process Jekyll-style includes
                content = post.content
                
                
                # Handle integrated includes first
                integrated_pattern = r'{%\s*include_integrated_relative\s+([^\s%}]+)\s*%}'
                def replace_integrated_include(match):
                    include_file = match.group(1)
                    current_dir = os.path.dirname(filepath)
                    return self._integrate_demo_directly(current_dir, include_file, integrated_demos, demo_scripts)
                
                content = re.sub(integrated_pattern, replace_integrated_include, content)
                
                # Handle regular includes (iframe)
                include_pattern = r'{%\s*include_relative\s+([^\s%}]+)\s*%}'
                def replace_include(match):
                    include_file = match.group(1)
                    current_dir = os.path.dirname(filepath)
                    url_path = os.path.join(current_dir, include_file).replace('\\', '/')
                    iframe_id = f"demo-{hash(url_path)}"
                    return f'''<div class="demo-container">
                        <iframe id="{iframe_id}" src="/mathnotes/{url_path}" width="100%" height="400" frameborder="0"></iframe>
                        <button class="fullscreen-btn" data-iframe-id="{iframe_id}" data-src="/mathnotes/{url_path}" title="Open in fullscreen">⛶</button>
                    </div>'''
                
                content = re.sub(include_pattern, replace_include, content)
                
                # Process wiki-style internal links [[slug]] or [[text|slug]]
                content = re.sub(r'\[\[([^\]]+)\]\]', self._replace_wiki_link, content)
                
                # Process structured mathematical content - first pass
                math_parser = StructuredMathParser()
                content, block_markers = math_parser.parse(content)
                
                # Process cross-references to structured blocks (@label or @type:label)
                # Store the processor to use it later for embedded blocks
                self.block_ref_processor = BlockReferenceProcessor(
                    block_markers=block_markers,
                    current_file=filepath,
                    block_index=self.block_index
                )
                content = self.block_ref_processor.process_references(content)
                
                
                # Protect math delimiters from markdown processing
                math_protector = MathProtector()
                content = math_protector.protect_math(content)
                
                # Convert markdown to HTML
                html_content = self.md.convert(content)
                
                # Restore math blocks with their original content
                html_content = math_protector.restore_math(html_content)
                html_content = math_protector.fix_math_backslashes(html_content)
                
                # Process embedded blocks after markdown conversion
                if hasattr(self, 'block_ref_processor') and self.block_ref_processor.embedded_blocks:
                    html_content = self.block_ref_processor.process_embedded_blocks(html_content, self.md)
                
                
                # Fix relative image paths to include content/ prefix
                html_content = self._fix_relative_image_paths(html_content, filepath)
                
                # Process structured mathematical content - second pass
                if block_markers:
                    html_content = process_structured_math_content(
                        html_content, block_markers, self.md, 
                        current_file=filepath, block_index=self.block_index
                    )
                
                # Fix escaped asterisks and tildes that should be rendered normally
                # Note: This must happen AFTER structured math processing to preserve LaTeX escapes
                html_content = html_content.replace(r'\*', '*')
                html_content = html_content.replace(r'\~', '~')
                
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
                    'canonical_url': canonical_path,
                    'has_integrated_demos': len(integrated_demos) > 0,
                    'demo_scripts': demo_scripts
                }
        except Exception as e:
            import traceback
            print(f"Error reading {filepath}: {e}")
            print(f"Traceback: {traceback.format_exc()}")
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
    
    def _process_block_references(self, content: str, block_markers: Dict, current_file: str) -> str:
        """Process cross-references to structured blocks using the unified processor.
        
        Supported formats:
        - @label - Auto-generated link text
        - @type:label - Auto-generated link text with type prefix
        - @{custom text|label} - Custom link text
        - @{custom text|type:label} - Custom link text with type validation
        """
        # Use the unified BlockReferenceProcessor
        processor = BlockReferenceProcessor(
            block_markers=block_markers,
            current_file=current_file,
            block_index=self.block_index
        )
        return processor.process_references(content)
    
    
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
    
    def _integrate_demo_directly(self, current_dir: str, include_file: str, integrated_demos: list, demo_scripts: list) -> str:
        """
        Integrate a demo HTML file directly into the page instead of using an iframe.
        
        Args:
            current_dir: Directory of the current markdown file
            include_file: Name of the HTML file to include
            
        Returns:
            HTML string with the demo integrated directly
        """
        demo_path = os.path.join(current_dir, include_file)
        
        # Track this demo
        integrated_demos.append(include_file)
        
        try:
            with open(demo_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            # First, extract external script references from head
            script_src_pattern = r'<script[^>]+src="([^"]+)"[^>]*></script>'
            for match in re.finditer(script_src_pattern, html_content, re.IGNORECASE):
                src = match.group(1)
                # Skip CDN scripts (they're loaded in base template)
                if not src.startswith('http') and not src.startswith('//'):
                    # Convert relative path to absolute
                    if not src.startswith('/'):
                        script_path = os.path.join(current_dir, src).replace('\\', '/')
                        
                        # Check if there's an integrated version and use that instead
                        base_name = os.path.splitext(src)[0]
                        integrated_version = f"{base_name}-integrated.js"
                        integrated_path = os.path.join(current_dir, integrated_version).replace('\\', '/')
                        
                        if os.path.exists(integrated_path):
                            script_path = integrated_path
                            
                    else:
                        script_path = src.lstrip('/')
                    if script_path not in demo_scripts:
                        demo_scripts.append(script_path)
            
            # Extract content between <body> tags (or entire content if no body tags)
            body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.DOTALL | re.IGNORECASE)
            if body_match:
                demo_content = body_match.group(1)
            else:
                # If no body tags, try to extract main content
                # Remove DOCTYPE, html, head tags
                demo_content = re.sub(r'<!DOCTYPE[^>]*>', '', html_content, flags=re.IGNORECASE)
                demo_content = re.sub(r'<html[^>]*>|</html>', '', demo_content, flags=re.IGNORECASE)
                demo_content = re.sub(r'<head[^>]*>.*?</head>', '', demo_content, flags=re.DOTALL | re.IGNORECASE)
                demo_content = demo_content.strip()
            
            # Extract script tags and add CSP nonces
            script_pattern = r'<script([^>]*)>(.*?)</script>'
            scripts = []
            
            def extract_script(match):
                attrs = match.group(1)
                content = match.group(2)
                
                # Check if it's an external script
                if 'src=' in attrs:
                    # Keep external scripts as-is
                    return match.group(0)
                else:
                    # For inline scripts, we'll add them separately with nonces
                    scripts.append(content)
                    return ''  # Remove from main content
            
            demo_content = re.sub(script_pattern, extract_script, demo_content, flags=re.DOTALL | re.IGNORECASE)
            
            # Generate unique demo ID
            demo_id = f"demo-{hash(demo_path) & 0x7FFFFFFF}"  # Positive hash
            
            # Build the integrated demo HTML
            integrated_html = f'''<div class="demo-component" data-demo-id="{demo_id}" data-demo-file="{include_file}">
                <div class="demo-content">
                    {demo_content}
                </div>'''
            
            # Add scripts with proper nonces and scope isolation
            if scripts:
                integrated_html += '\n'
                for script in scripts:
                    integrated_html += f'''<script nonce="{{{{ csp_nonce }}}}">
(function() {{
    // Scope isolation for {include_file}
    const demoContainer = document.querySelector('[data-demo-id="{demo_id}"]');
    {script}
}})();
</script>'''
            
            integrated_html += '\n</div>'
            
            return integrated_html
            
        except Exception as e:
            print(f"Error integrating demo {demo_path}: {e}")
            # Fallback to iframe approach
            url_path = os.path.join(current_dir, include_file).replace('\\', '/')
            iframe_id = f"demo-{hash(url_path)}"
            return f'''<div class="demo-container">
                <iframe id="{iframe_id}" src="/mathnotes/{url_path}" width="100%" height="800" frameborder="0"></iframe>
                <button class="fullscreen-btn" data-iframe-id="{iframe_id}" data-src="/mathnotes/{url_path}" title="Open in fullscreen">⛶</button>
            </div>'''