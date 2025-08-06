"""Main builder class that orchestrates the static site generation."""

import logging
import shutil
from pathlib import Path
from typing import Optional

from .core import StaticSiteGenerator
from .router import Router
from .renderer import PageRenderer
from .urls import URLGenerator
from .context import build_global_context

from mathnotes.url_mapper import URLMapper
from mathnotes.markdown_processor import MarkdownProcessor
from mathnotes.block_index import BlockIndex

logger = logging.getLogger(__name__)


class SiteBuilder:
    """Orchestrates the complete static site build process."""
    
    def __init__(self, output_dir: str = "static-build", base_url: str = ''):
        """Initialize the site builder.
        
        Args:
            output_dir: Directory for output files
            base_url: Base URL for the site (empty for relative URLs)
        """
        self.output_dir = Path(output_dir)
        self.base_url = base_url
        
        # Initialize generator
        self.generator = StaticSiteGenerator(
            template_dir='templates',
            output_dir=str(self.output_dir),
            base_url=base_url
        )
        
        # Initialize router
        self.router = Router()
        self._setup_routes()
        
        # Initialize URL generator
        self.url_gen = URLGenerator(self.router, base_url)
        self.generator.add_global('url_for', self.url_gen.url_for)
        
        # Initialize components
        self.url_mapper = URLMapper()
        self.url_mapper.build_url_mappings()
        
        self.block_index = BlockIndex(self.url_mapper)
        self.block_index.build_index()
        
        self.markdown_processor = MarkdownProcessor(self.url_mapper, self.block_index)
        
        # Initialize renderer
        self.renderer = PageRenderer(
            self.generator,
            self.url_mapper,
            self.markdown_processor,
            self.block_index
        )
        
        logger.info(f"Initialized site builder: output={output_dir}")
    
    def _setup_routes(self):
        """Set up URL routes."""
        # These aren't actually used for routing in static generation,
        # but needed for url_for() to work
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
    
    def build_global_context(self):
        """Build and set global context for templates."""
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
        """Render all pages for the site."""
        # Render homepage
        logger.info("Rendering homepage...")
        self.renderer.render_homepage()
        
        # Render mathnotes index
        logger.info("Rendering mathnotes index...")
        self.renderer.render_mathnotes_index()
        
        # Render all content pages
        logger.info("Rendering content pages...")
        for canonical_url in self.url_mapper.url_mappings.keys():
            url = f'/mathnotes/{canonical_url}'
            try:
                md_path = self.url_mapper.get_file_path(canonical_url)
                if md_path and not Path(md_path).is_dir():
                    output_path = f'mathnotes/{canonical_url}'
                    if not output_path.endswith('.html'):
                        output_path = f'{output_path}/index.html'
                    self.renderer.render_markdown_page(md_path, output_path)
            except Exception as e:
                logger.error(f"Failed to render {url}: {e}")
        
        # Render special pages
        logger.info("Rendering special pages...")
        self.render_sitemap()
        self.render_demos()
        self.render_definitions()
        self.renderer.render_404()
    
    def render_sitemap(self):
        """Generate XML sitemap."""
        urls = []
        
        # Add homepage
        urls.append({
            'loc': f'{self.base_url}/',
            'priority': '1.0'
        })
        
        # Add all content pages
        for canonical_url in self.url_mapper.url_mappings.keys():
            url = f'/mathnotes/{canonical_url}'
            urls.append({
                'loc': f'{self.base_url}{url}',
                'priority': '0.8'
            })
        
        xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        
        for url in urls:
            xml += '  <url>\n'
            xml += f'    <loc>{url["loc"]}</loc>\n'
            xml += f'    <priority>{url["priority"]}</priority>\n'
            xml += '  </url>\n'
        
        xml += '</urlset>'
        
        # Write sitemap
        sitemap_path = self.output_dir / 'sitemap.xml'
        sitemap_path.write_text(xml)
        logger.info(f"Generated sitemap with {len(urls)} URLs")
    
    def render_demos(self):
        """Render the demos viewer page."""
        self.renderer.render_page(
            'demo_viewer.html',
            'demos/index.html',
            title='Interactive Demos - Mathnotes',
            description='Interactive mathematical demonstrations'
        )
    
    def render_definitions(self):
        """Render the definitions index page."""
        # Get all definitions from block index
        definitions = []
        if self.block_index and hasattr(self.block_index, 'find_blocks_by_type'):
            definitions = self.block_index.find_blocks_by_type("definition")
        elif self.block_index and hasattr(self.block_index, 'index'):
            for label, ref in self.block_index.index.items():
                if ref.block.block_type.value == 'definition':
                    definitions.append(ref)
        
        # Sort definitions by title (or label if no title)
        definitions.sort(key=lambda ref: (ref.block.title or ref.block.label or "").lower())
        
        self.renderer.render_page(
            'definition_index.html',
            'mathnotes/definitions/index.html',
            title='Definition Index - Mathnotes',
            description='Index of all mathematical definitions',
            definitions=definitions
        )
    
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
        
        # Clean output directory
        self.clean_output_dir()
        
        # Build global context
        self.build_global_context()
        
        # Render all pages
        self.render_all_pages()
        
        # Copy static assets
        self.copy_static_assets()
        
        logger.info(f"Build complete! Output in {self.output_dir}")
        
        # Report statistics
        total_files = sum(1 for _ in self.output_dir.rglob('*') if _.is_file())
        total_size = sum(f.stat().st_size for f in self.output_dir.rglob('*') if f.is_file())
        logger.info(f"Generated {total_files} files, total size: {total_size / 1024 / 1024:.2f} MB")