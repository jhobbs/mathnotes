"""Page definitions for the static site generator.

Each page is a self-contained unit with its own rendering logic,
similar to views in Flask or Django.
"""

import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


@dataclass
class PageSpec:
    """Specification for a page to be generated."""
    
    output_path: str  # Where to write the file (relative to output dir)
    template: str  # Template to use for rendering
    title: str = ""  # Page title
    description: str = ""  # Meta description
    priority: float = 0.5  # Sitemap priority (0.0-1.0)
    context: Dict[str, Any] = field(default_factory=dict)  # Additional context


class Page(ABC):
    """Base class for all pages in the site."""
    
    def __init__(self, site_context: Dict[str, Any]):
        """Initialize the page with site-wide context.
        
        Args:
            site_context: Contains url_mapper, block_index, markdown_processor, etc.
        """
        self.site_context = site_context
        self.url_mapper = site_context.get('url_mapper')
        self.block_index = site_context.get('block_index')
        self.markdown_processor = site_context.get('markdown_processor')
        self.base_url = site_context.get('base_url', '')
    
    @abstractmethod
    def get_specs(self) -> List[PageSpec]:
        """Return list of PageSpec objects for this page type.
        
        This method defines what files to generate. It can return:
        - A single PageSpec for simple pages (homepage, 404, etc.)
        - Multiple PageSpecs for pages that generate many files (all content pages)
        """
        pass
    
    def get_url(self, spec: PageSpec) -> str:
        """Get the full URL for a page spec (for sitemap generation)."""
        path = spec.output_path
        if path.endswith('/index.html'):
            path = path[:-11]  # Remove /index.html
        elif path.endswith('.html'):
            path = path[:-5]  # Remove .html
        
        if path == 'index':
            return f"{self.base_url}/"
        
        # Ensure trailing slash for directory-style URLs
        if not path.endswith('/') and not path.endswith('.xml'):
            path += '/'
        
        return f"{self.base_url}/{path}"
    
    def get_canonical_path(self, spec: PageSpec) -> str:
        """Get the canonical path for a page spec (for canonical link tag)."""
        # Get the full URL and strip the base URL to get just the path
        full_url = self.get_url(spec)
        return full_url.replace(self.base_url, '')


class HomePage(Page):
    """The main lacunary.org homepage."""
    
    endpoint_name = 'index'  # For url_for('index')
    
    def get_specs(self) -> List[PageSpec]:
        return [PageSpec(
            output_path='index.html',
            template='homepage.html',
            title='Lacunary - Mathematical Notes',
            description='A collection of mathematical notes and interactive demonstrations',
            priority=1.0
        )]


class MathnotesIndexPage(Page):
    """The /mathnotes index page showing all sections."""
    
    endpoint_name = 'mathnotes_index'  # For url_for('mathnotes_index')
    
    def get_specs(self) -> List[PageSpec]:
        from mathnotes.file_utils import get_all_content_for_section
        from mathnotes.config import CONTENT_DIRS
        
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
                    content = get_all_content_for_section(
                        section, 
                        self.url_mapper.file_to_canonical
                    )
                    if content:
                        display_name = display_names.get(section_name, section_name.title())
                        sections.append({
                            "name": display_name,
                            "path": section,
                            "content": content
                        })
        
        # Sort sections alphabetically
        sections.sort(key=lambda x: x["name"])
        
        return [PageSpec(
            output_path='mathnotes/index.html',
            template='index.html',
            title='Math Notes Index',
            description='Browse all mathematical notes by topic',
            priority=0.9,
            context={'sections': sections}
        )]


class ContentPages(Page):
    """All markdown content pages."""
    
    def get_specs(self) -> List[PageSpec]:
        specs = []
        
        if not self.url_mapper or not self.markdown_processor:
            logger.warning("Missing url_mapper or markdown_processor for content pages")
            return specs
        
        # Generate a spec for each content page
        for canonical_url in self.url_mapper.url_mappings.keys():
            try:
                md_path = self.url_mapper.get_file_path(canonical_url)
                if not md_path or Path(md_path).is_dir():
                    continue
                
                # Process the markdown to get metadata
                result = self.markdown_processor.render_markdown_file(md_path)
                
                # Build output path
                output_path = f'mathnotes/{canonical_url}'
                if not output_path.endswith('.html'):
                    output_path = f'{output_path}/index.html'
                
                # Build context
                context = {
                    'content': result.get('content', ''),
                    'path': md_path,
                    'frontmatter': result.get('frontmatter', {}),
                    'canonical_url': result.get('canonical_url', ''),
                }
                
                # Add tooltip data if we have references
                if self.block_index and 'references' in result:
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
                
                specs.append(PageSpec(
                    output_path=output_path,
                    template='page.html',
                    title=result.get('title', ''),
                    description=result.get('description', ''),
                    priority=0.8,
                    context=context
                ))
                
            except Exception as e:
                logger.error(f"Failed to create spec for {canonical_url}: {e}")
        
        return specs


class DemoViewerPage(Page):
    """The interactive demos viewer page."""
    
    endpoint_name = 'demos'  # For url_for('demos')
    
    def get_specs(self) -> List[PageSpec]:
        return [PageSpec(
            output_path='demos/index.html',
            template='demo_viewer.html',
            title='Interactive Demos - Mathnotes',
            description='Interactive mathematical demonstrations',
            priority=0.7
        )]


class DefinitionIndexPage(Page):
    """The definitions index page."""
    
    endpoint_name = 'definition_index'  # For url_for('definition_index')
    
    def get_specs(self) -> List[PageSpec]:
        definitions = []
        
        if self.block_index:
            # Try to get definitions using the appropriate method
            if hasattr(self.block_index, 'find_blocks_by_type'):
                definitions = self.block_index.find_blocks_by_type("definition")
            elif hasattr(self.block_index, 'index'):
                for label, ref in self.block_index.index.items():
                    if ref.block.block_type.value == 'definition':
                        definitions.append(ref)
            
            # Sort definitions by title (or label if no title)
            definitions.sort(
                key=lambda ref: (ref.block.title or ref.block.label or "").lower()
            )
        
        return [PageSpec(
            output_path='mathnotes/definitions/index.html',
            template='definition_index.html',
            title='Definition Index - Mathnotes',
            description='Index of all mathematical definitions',
            priority=0.6,
            context={'definitions': definitions}
        )]


class ErrorPage(Page):
    """404 error page."""
    
    def get_specs(self) -> List[PageSpec]:
        return [PageSpec(
            output_path='404.html',
            template='404.html',
            title='Page Not Found',
            description='The requested page could not be found',
            priority=0.0  # Don't include in sitemap
        )]


class SitemapPage(Page):
    """XML sitemap generator."""
    
    def __init__(self, site_context: Dict[str, Any], all_pages: List[Page]):
        """Initialize with access to all other pages for URL generation.
        
        Args:
            site_context: Site-wide context
            all_pages: List of all Page instances (for getting their URLs)
        """
        super().__init__(site_context)
        self.all_pages = all_pages
    
    def get_specs(self) -> List[PageSpec]:
        # Collect URLs from all pages
        urls = []
        
        # Use the configured base_url for absolute URLs
        base_url = self.base_url
        
        for page in self.all_pages:
            if isinstance(page, SitemapPage):
                continue  # Don't include sitemap in sitemap
            
            for spec in page.get_specs():
                if spec.priority > 0:  # Only include if priority > 0
                    # Use the centralized URL generation
                    url = page.get_url(spec)
                    
                    urls.append({
                        'loc': url,
                        'priority': str(spec.priority)
                    })
        
        logger.info(f"Generated sitemap with {len(urls)} URLs")
        
        return [PageSpec(
            output_path='sitemap.xml',
            template='sitemap.xml',  # Use the sitemap.xml template
            title='Sitemap',
            description='XML sitemap for search engines',
            context={'urls': urls}
        )]


class PageRegistry:
    """Registry of all pages in the site."""
    
    def __init__(self, site_context: Dict[str, Any]):
        """Initialize the registry with site context.
        
        Args:
            site_context: Contains url_mapper, block_index, markdown_processor, etc.
        """
        self.site_context = site_context
        self.pages: List[Page] = []
        self._register_default_pages()
    
    def _register_default_pages(self):
        """Register all default pages."""
        self.register(HomePage)
        self.register(MathnotesIndexPage)
        self.register(ContentPages)
        self.register(DemoViewerPage)
        self.register(DefinitionIndexPage)
        self.register(ErrorPage)
        
        # Sitemap needs special handling as it needs all other pages
        sitemap = SitemapPage(self.site_context, self.pages)
        self.pages.append(sitemap)
    
    def register(self, page_class: type[Page]):
        """Register a page class.
        
        Args:
            page_class: The Page subclass to register
        """
        page = page_class(self.site_context)
        self.pages.append(page)
    
    def setup_routes(self, router):
        """Set up URL routes based on registered pages.
        
        Args:
            router: Router instance to add routes to
        """
        # Build endpoint to URL mapping
        self.endpoint_urls = {}
        
        # Add routes for pages that have endpoint names
        for page in self.pages:
            if hasattr(page, 'endpoint_name') and page.endpoint_name:
                # Get the first spec to determine the route pattern
                specs = page.get_specs()
                if specs:
                    # Derive route from output path
                    output_path = specs[0].output_path
                    if output_path == 'index.html':
                        route = '/'
                    elif output_path.endswith('/index.html'):
                        route = '/' + output_path[:-11]  # Remove /index.html  
                        if not route.endswith('/'):
                            route += '/'
                    elif output_path.endswith('.html'):
                        route = '/' + output_path[:-5]  # Remove .html
                    else:
                        route = '/' + output_path
                    
                    # Store the mapping
                    self.endpoint_urls[page.endpoint_name] = route
                    router.add_route(route, lambda: None, page.endpoint_name)
        
        # Add special routes that don't correspond to single pages
        router.add_route('/mathnotes/<path:filepath>', lambda: None, 'page')
        router.add_route('/sitemap.xml', lambda: None, 'sitemap')
        self.endpoint_urls['sitemap'] = '/sitemap.xml'
    
    def get_url_for_endpoint(self, endpoint: str) -> str:
        """Get the URL for a given endpoint name.
        
        Args:
            endpoint: The endpoint name
            
        Returns:
            The URL path for the endpoint, or None if not found
        """
        return self.endpoint_urls.get(endpoint)
    
    def get_all_specs(self) -> List[tuple[Page, PageSpec]]:
        """Get all page specs from all registered pages.
        
        Returns:
            List of (page_instance, spec) tuples
        """
        all_specs = []
        for page in self.pages:
            for spec in page.get_specs():
                # Ensure canonical_url is in context if not already set
                # (ContentPages already have it from markdown processor)
                if spec.context is None:
                    spec.context = {}
                if 'canonical_url' not in spec.context:
                    spec.context['canonical_url'] = page.get_canonical_path(spec)
                all_specs.append((page, spec))
        return all_specs