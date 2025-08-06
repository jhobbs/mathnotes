"""Page rendering without Flask."""

import logging
from pathlib import Path
from typing import Dict, Any, Optional
from mathnotes.config import CONTENT_DIRS

logger = logging.getLogger(__name__)


class PageRenderer:
    """Render pages using the static site generator."""
    
    def __init__(
        self,
        generator,
        url_mapper=None,
        markdown_processor=None,
        block_index=None
    ):
        """Initialize the renderer.
        
        Args:
            generator: StaticSiteGenerator instance
            url_mapper: URLMapper for resolving paths
            markdown_processor: MarkdownProcessor for converting markdown
            block_index: BlockIndex for cross-references
        """
        self.generator = generator
        self.url_mapper = url_mapper
        self.markdown_processor = markdown_processor
        self.block_index = block_index
    
    def render_page(
        self,
        template_name: str,
        output_path: str,
        **context
    ) -> str:
        """Render a page and optionally write to file.
        
        Args:
            template_name: Name of the template to use
            output_path: Path where to write the output (relative to output_dir)
            **context: Context variables for the template
            
        Returns:
            Rendered HTML string
        """
        html = self.generator.render_template(template_name, **context)
        
        if output_path:
            self.generator.write_page(output_path, html)
            logger.info(f"Rendered {template_name} to {output_path}")
        
        return html
    
    def render_markdown_page(
        self,
        md_path: str,
        output_path: Optional[str] = None,
        template_name: str = 'page.html'
    ) -> str:
        """Render a markdown file to HTML.
        
        Args:
            md_path: Path to markdown file
            output_path: Where to write the output
            template_name: Template to use for rendering
            
        Returns:
            Rendered HTML string
        """
        if not self.markdown_processor:
            raise ValueError("MarkdownProcessor required for rendering markdown")
        
        # Process the markdown file
        result = self.markdown_processor.render_markdown_file(md_path)
        
        # Build context for the page
        context = {
            'title': result.get('title', ''),
            'content': result.get('content', ''),
            'description': result.get('description', ''),
            'path': md_path,
            'frontmatter': result.get('frontmatter', {}),
        }
        
        # Add tooltip data if we have references
        if self.block_index and hasattr(self.block_index, 'index') and 'references' in result:
            tooltip_data = {}
            for ref_label in result['references']:
                if ref_label in self.block_index.index:
                    ref = self.block_index.index[ref_label]
                    tooltip_data[ref_label] = {
                        'type': ref.block.block_type.value,
                        'title': ref.block.title or '',
                        'content': ref.block.content,
                        'url': ref.full_url
                    }
            if tooltip_data:
                context['tooltip_data'] = tooltip_data
        
        # Determine output path if not provided
        if output_path is None and self.url_mapper:
            canonical_url = self.url_mapper.get_canonical_url(md_path)
            if canonical_url:
                output_path = f'mathnotes/{canonical_url}'
        
        return self.render_page(template_name, output_path or '', **context)
    
    def render_all_markdown(self, content_dir: str = 'content') -> int:
        """Render all markdown files in a directory.
        
        Args:
            content_dir: Directory containing markdown files
            
        Returns:
            Number of files rendered
        """
        if not self.url_mapper:
            raise ValueError("URLMapper required for rendering all markdown")
        
        count = 0
        content_path = Path(content_dir)
        
        for md_file in content_path.rglob('*.md'):
            try:
                self.render_markdown_page(str(md_file))
                count += 1
            except Exception as e:
                logger.error(f"Failed to render {md_file}: {e}")
        
        logger.info(f"Rendered {count} markdown files")
        return count
    
    def render_homepage(self):
        """Render the main lacunary homepage."""
        return self.render_page('homepage.html', 'index.html')
    
    def render_mathnotes_index(self):
        """Render the mathnotes index with all sections."""
        from mathnotes.file_utils import get_all_content_for_section
        
        # Map directory names to display names
        display_names = {
            "analysis": "Analysis",
            "applied-math": "Applied",
            "geometry": "Geometry", 
            "topology": "Topology",
            "discrete-math": "Discrete",
            "algebra": "Algebra"
        }
        
        sections = []
        for section in CONTENT_DIRS:
            path = Path(section)
            if path.exists():
                # Get section name without content/ prefix
                section_name = (
                    section.replace("content/", "")
                    if section.startswith("content/")
                    else section
                )
                
                # Skip test directory in production
                if section_name == "test":
                    continue
                
                # Get all content for this section
                if self.url_mapper:
                    content = get_all_content_for_section(section, self.url_mapper.file_to_canonical)
                    if content:
                        # Use display name if available
                        display_name = display_names.get(section_name, section_name.title())
                        sections.append({"name": display_name, "path": section, "content": content})
        
        # Sort sections alphabetically by name
        sections.sort(key=lambda x: x["name"])
        
        return self.render_page('index.html', 'mathnotes/index.html', sections=sections)
    
    def render_404(self):
        """Render the 404 error page."""
        return self.render_page(
            '404.html',
            '404.html',
            title='Page Not Found',
            description='The requested page could not be found'
        )
    
    def render_special_pages(self):
        """Render special pages like index, sitemap, etc."""
        # Homepage
        self.render_homepage()
        
        # 404 page
        self.render_404()
        
        logger.info("Rendered special pages")
