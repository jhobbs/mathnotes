"""Refactored builder using page-centric architecture."""

import logging
import shutil
from pathlib import Path
from typing import Optional

from .core import StaticSiteGenerator
from .router import Router
from .urls import URLGenerator
from .context import build_global_context
from .pages import PageRegistry, SitemapPage

from mathnotes.url_mapper import URLMapper
from mathnotes.markdown_processor import MarkdownProcessor
from mathnotes.block_index import BlockIndex

logger = logging.getLogger(__name__)


class SiteBuilder:
    """Simplified site builder using page registry pattern."""
    
    def __init__(self, output_dir: str = "static-build", base_url: str = ''):
        """Initialize the site builder.
        
        Args:
            output_dir: Directory for output files
            base_url: Base URL for the site (empty for relative URLs)
        """
        self.output_dir = Path(output_dir)
        self.base_url = base_url
        
        # Initialize core generator
        self.generator = StaticSiteGenerator(
            template_dir='templates',
            output_dir=str(self.output_dir),
            base_url=base_url
        )
        
        # Initialize router for url_for function
        self.router = Router()
        self._setup_routes()
        
        # Initialize URL generator and add to template globals
        self.url_gen = URLGenerator(self.router, base_url)
        self.generator.add_global('url_for', self.url_gen.url_for)
        
        # Initialize data components
        self.url_mapper = URLMapper()
        self.url_mapper.build_url_mappings()
        
        self.block_index = BlockIndex(self.url_mapper)
        self.block_index.build_index()
        
        self.markdown_processor = MarkdownProcessor(self.url_mapper, self.block_index)
        
        # Build site context for pages
        site_context = {
            'url_mapper': self.url_mapper,
            'block_index': self.block_index,
            'markdown_processor': self.markdown_processor,
            'base_url': base_url,
            'generator': self.generator
        }
        
        # Initialize page registry
        self.page_registry = PageRegistry(site_context)
        
        logger.info(f"Initialized site builder: output={output_dir}")
    
    def _setup_routes(self):
        """Set up URL routes for url_for() function."""
        self.router.add_route('/', lambda: None, 'index')
        self.router.add_route('/mathnotes/<path:filepath>', lambda: None, 'page')
        self.router.add_route('/sitemap.xml', lambda: None, 'sitemap')
        self.router.add_route('/demos', lambda: None, 'demos')
        self.router.add_route('/mathnotes/definitions', lambda: None, 'definition_index')
    
    def clean_output_dir(self):
        """Clean the output directory."""
        if self.output_dir.exists():
            logger.info(f"Cleaning existing output directory: {self.output_dir}")
            shutil.rmtree(self.output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def setup_global_context(self):
        """Set up global context for all templates."""
        # Convert block index to tooltip data format
        tooltip_data = None
        if self.block_index and hasattr(self.block_index, 'index'):
            tooltip_data = {}
            for label, ref in self.block_index.index.items():
                tooltip_data[label] = {
                    'type': ref.block.block_type.value,
                    'title': ref.block.title or '',
                    'content': ref.block.content,
                    'url': ref.full_url
                }
        
        global_context = build_global_context(
            base_url=self.base_url,
            tooltip_data=tooltip_data,
            is_development=False
        )
        
        # Add global context to generator
        for key, value in global_context.items():
            self.generator.add_global(key, value)
    
    def render_all_pages(self):
        """Render all pages using the page registry."""
        # Get all page specifications
        all_specs = self.page_registry.get_all_specs()
        
        logger.info(f"Rendering {len(all_specs)} pages...")
        
        for page, spec in all_specs:
            try:
                # Special handling for sitemap (raw XML)
                if isinstance(page, SitemapPage):
                    xml_content = page.generate_xml()
                    output_path = self.output_dir / spec.output_path
                    output_path.parent.mkdir(parents=True, exist_ok=True)
                    output_path.write_text(xml_content)
                    logger.info(f"Generated {spec.output_path}")
                else:
                    # Normal template rendering
                    context = {
                        'title': spec.title,
                        'description': spec.description,
                        **spec.context
                    }
                    
                    html = self.generator.render_template(spec.template, **context)
                    self.generator.write_page(spec.output_path, html)
                    logger.debug(f"Rendered {spec.template} -> {spec.output_path}")
                    
            except Exception as e:
                logger.error(f"Failed to render {spec.output_path}: {e}")
    
    def copy_static_assets(self):
        """Copy all static assets to output directory."""
        logger.info("Copying static assets...")
        
        # Copy static directory
        static_src = Path('static')
        if static_src.exists():
            static_dst = self.output_dir / 'static'
            if static_dst.exists():
                shutil.rmtree(static_dst)
            shutil.copytree(static_src, static_dst)
            logger.info(f"Copied static directory to {static_dst}")
        
        # Copy favicon if exists
        favicon = Path('favicon.ico')
        if favicon.exists():
            shutil.copy(favicon, self.output_dir / 'favicon.ico')
        
        # Copy robots.txt if exists
        robots = Path('robots.txt')
        if robots.exists():
            shutil.copy(robots, self.output_dir / 'robots.txt')
        
        # Copy images from content directories
        self._copy_content_images()
    
    def _copy_content_images(self):
        """Copy images from content directories."""
        logger.info("Copying content images...")
        content_dir = Path('content')
        image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'}
        image_count = 0
        
        for image_file in content_dir.rglob('*'):
            if image_file.is_file() and image_file.suffix.lower() in image_extensions:
                # Maintain directory structure
                relative_path = image_file.relative_to(content_dir)
                output_path = self.output_dir / 'mathnotes' / relative_path
                
                # Create parent directory if needed
                output_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Copy the image
                shutil.copy2(image_file, output_path)
                image_count += 1
        
        logger.info(f"Copied {image_count} images from content directories")
    
    def build(self):
        """Execute the complete build process."""
        logger.info("Starting static site build...")
        
        # 1. Clean output directory
        self.clean_output_dir()
        
        # 2. Set up global template context
        self.setup_global_context()
        
        # 3. Render all pages
        self.render_all_pages()
        
        # 4. Copy static assets
        self.copy_static_assets()
        
        # Report statistics
        total_files = sum(1 for _ in self.output_dir.rglob('*') if _.is_file())
        total_size = sum(f.stat().st_size for f in self.output_dir.rglob('*') if f.is_file())
        
        logger.info(f"Build complete! Output in {self.output_dir}")
        logger.info(f"Generated {total_files} files, total size: {total_size / 1024 / 1024:.2f} MB")