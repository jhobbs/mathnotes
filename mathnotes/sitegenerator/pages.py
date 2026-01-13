"""Page definitions for the static site generator.

Each page is a self-contained unit with its own rendering logic,
similar to views in Flask or Django.
"""

import logging
from typing import Dict, Any, List
from dataclasses import dataclass, field
from abc import ABC, abstractmethod

from mathnotes.navigation import get_page_navigation
from mathnotes.sources import get_sources_for_page

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
        self.url_mapper = site_context.get("url_mapper")
        self.block_index = site_context.get("block_index")
        self.markdown_processor = site_context.get("markdown_processor")
        self.base_url = site_context.get("base_url", "")
        self._specs_cache: List[PageSpec] | None = None

    def get_specs(self) -> List[PageSpec]:
        """Return cached specs, computing them only once."""
        if self._specs_cache is None:
            self._specs_cache = self._compute_specs()
        return self._specs_cache

    @abstractmethod
    def _compute_specs(self) -> List[PageSpec]:
        """Return list of PageSpec objects for this page type.

        This method defines what files to generate. It can return:
        - A single PageSpec for simple pages (homepage, 404, etc.)
        - Multiple PageSpecs for pages that generate many files (all content pages)
        """
        pass

    def get_url(self, spec: PageSpec) -> str:
        """Get the full URL for a page spec (for sitemap generation)."""
        path = spec.output_path
        if path.endswith("/index.html"):
            path = path[:-11]  # Remove /index.html
        elif path.endswith(".html"):
            path = path[:-5]  # Remove .html

        if path == "index":
            return f"{self.base_url}/"

        # Ensure trailing slash for directory-style URLs
        if not path.endswith("/") and not path.endswith(".xml"):
            path += "/"

        return f"{self.base_url}/{path}"

    def get_canonical_path(self, spec: PageSpec) -> str:
        """Get the canonical path for a page spec (for canonical link tag)."""
        # Get the full URL and strip the base URL to get just the path
        full_url = self.get_url(spec)
        return full_url.replace(self.base_url, "")


class HomePage(Page):
    """The main lacunary.org homepage."""

    endpoint_name = "index"  # For url_for('index')

    def _compute_specs(self) -> List[PageSpec]:
        return [
            PageSpec(
                output_path="index.html",
                template="homepage.html",
                title="Lacunary - Mathematical Notes",
                description="A collection of mathematical notes and interactive demonstrations",
                priority=1.0,
            )
        ]


class MathnotesIndexPage(Page):
    """The /mathnotes index page showing all sections."""

    endpoint_name = "mathnotes_index"  # For url_for('mathnotes_index')

    def _compute_specs(self) -> List[PageSpec]:
        from mathnotes.file_utils import get_all_content_for_section
        from mathnotes.config import CONTENT_DIRS

        # Map directory names to display names
        display_names = {
            "analysis": "Analysis",
            "applied-math": "Applied",
            "geometry": "Geometry",
            "topology": "Topology",
            "discrete-math": "Discrete",
            "algebra": "Algebra",
            "machine-learning": "Machine Learning",
        }

        sections = []
        for section in CONTENT_DIRS:
            section_name = section.replace("content/", "") if section.startswith("content/") else section

            # Skip test directory in production
            if section_name == "test":
                continue

            # Get all content for this section
            content = get_all_content_for_section(section, self.url_mapper.file_to_canonical)
            display_name = display_names.get(section_name, section_name.title())
            sections.append({"name": display_name, "path": section, "content": content})

        # Sort sections alphabetically
        sections.sort(key=lambda x: x["name"])

        return [
            PageSpec(
                output_path="mathnotes/index.html",
                template="index.html",
                title="Math Notes Index",
                description="Browse all mathematical notes by topic",
                priority=0.9,
                context={"sections": sections},
            )
        ]


class ContentPages(Page):
    """All markdown content pages."""

    def _compute_specs(self) -> List[PageSpec]:
        specs = []

        # Generate a spec for each content page
        for canonical_url in self.url_mapper.url_mappings.keys():
            md_path = self.url_mapper.get_file_path(canonical_url)

            # Process the markdown to get metadata
            result = self.markdown_processor.render_markdown_file(md_path)

            # Build output path
            output_path = f"mathnotes/{canonical_url}/index.html"

            # Build navigation data for sidebar and prev/next
            navigation = get_page_navigation(md_path, self.url_mapper.file_to_canonical)

            # Collect sources from directory hierarchy and frontmatter
            frontmatter = result.get("frontmatter", {})
            frontmatter_sources = frontmatter.get("sources")
            sources = get_sources_for_page(md_path, frontmatter_sources)

            # Build context
            context = {
                "content": result.get("content", ""),
                "path": md_path,
                "frontmatter": result.get("frontmatter", {}),
                "canonical_url": result.get("canonical_url", ""),
                "navigation": navigation,
                "sources": sources,
            }

            specs.append(
                PageSpec(
                    output_path=output_path,
                    template="page.html",
                    title=result.get("title", ""),
                    description=result.get("description", ""),
                    priority=0.8,
                    context=context,
                )
            )

        return specs


class DemoViewerPage(Page):
    """The interactive demos viewer page."""

    endpoint_name = "demos"  # For url_for('demos')

    def _compute_specs(self) -> List[PageSpec]:
        return [
            PageSpec(
                output_path="demos/index.html",
                template="demo_viewer.html",
                title="Interactive Demos - Mathnotes",
                description="Interactive mathematical demonstrations",
                priority=0.7,
            )
        ]


class BlockIndexPage(Page):
    """Base class for block index pages (definitions, theorems, etc.)."""

    # Subclasses should override these
    block_types: List[str] = []  # Block types to include
    endpoint_name: str = ""  # URL endpoint name
    output_path: str = ""  # Output HTML path
    template: str = ""  # Template file name
    page_title: str = ""  # Page title
    page_description: str = ""  # Page description
    context_key: str = "blocks"  # Key for blocks in template context

    def _compute_specs(self) -> List[PageSpec]:
        # Collect all blocks of the specified types
        blocks = []
        for block_type in self.block_types:
            blocks.extend(self.block_index.find_blocks_by_type(block_type))

        # Sort blocks alphabetically by title or label
        blocks.sort(key=lambda ref: (ref.block.title or ref.block.label or "").lower())
        
        # Enhance blocks with reverse index information
        enhanced_blocks = []
        for ref in blocks:
            if ref.block.label:
                # Get all references for this block
                reverse_entry = self.block_index.reverse_index.get_references_for_label(
                    ref.block.label
                )
                
                # Create enhanced block info
                enhanced_block = {
                    'block': ref,
                    'direct_references': reverse_entry.direct_references,
                    'transitive_references': reverse_entry.transitive_references
                }
            else:
                # Block without label - no references possible
                enhanced_block = {
                    'block': ref,
                    'direct_references': [],
                    'transitive_references': {}
                }
            
            enhanced_blocks.append(enhanced_block)

        # Build context
        context = {
            'blocks': enhanced_blocks,
            'reference_depth': 2  # Configurable depth for transitive references
        }
        
        # Add any additional context processing
        context = self.process_context(context, enhanced_blocks)

        return [
            PageSpec(
                output_path=self.output_path,
                template=self.template,
                title=self.page_title,
                description=self.page_description,
                priority=0.6,
                context=context,
            )
        ]

    def process_context(self, context: Dict[str, Any], blocks: List) -> Dict[str, Any]:
        """Override this to add custom context processing."""
        return context


class DefinitionIndexPage(BlockIndexPage):
    """The definitions index page."""

    block_types = ["definition"]
    endpoint_name = "definition_index"
    output_path = "mathnotes/definitions/index.html"
    template = "block_index.html"
    page_title = "Definition Index - Mathnotes"
    page_description = "Index of all mathematical definitions"
    context_key = "blocks"
    
    def process_context(self, context: Dict[str, Any], blocks: List) -> Dict[str, Any]:
        """Add template-specific context."""
        context['index_title'] = 'Definition Index'
        context['index_description'] = 'This page lists all mathematical definitions found across the site. Click on any definition to jump to its location in the notes.'
        context['no_items_message'] = 'No definitions found in the index.'
        context['item_type'] = 'definition'
        return context


class TheoremIndexPage(BlockIndexPage):
    """The theorems index page (including lemmas and corollaries)."""

    block_types = ["theorem", "lemma", "corollary"]
    endpoint_name = "theorem_index"
    output_path = "mathnotes/theorems/index.html"
    template = "block_index.html"
    page_title = "Theorem Index - Mathnotes"
    page_description = "Index of all mathematical theorems, lemmas, and corollaries"
    context_key = "blocks"
    
    def process_context(self, context: Dict[str, Any], blocks: List) -> Dict[str, Any]:
        """Add additional context for theorem index page."""
        context['index_title'] = 'Theorem Index'
        context['index_description'] = 'This page lists all mathematical theorems, lemmas, and corollaries found across the site. Click on any item to jump to its location in the notes.'
        context['no_items_message'] = 'No theorems, lemmas, or corollaries found in the index.'
        context['item_type'] = 'theorem/lemma/corollary'
        return context


class ErrorPage(Page):
    """404 error page."""

    def _compute_specs(self) -> List[PageSpec]:
        return [
            PageSpec(
                output_path="404.html",
                template="404.html",
                title="Page Not Found",
                description="The requested page could not be found",
                priority=0.0,  # Don't include in sitemap
            )
        ]


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

    def _compute_specs(self) -> List[PageSpec]:
        # Collect URLs from all pages
        urls = []

        for page in self.all_pages:
            if isinstance(page, SitemapPage):
                continue  # Don't include sitemap in sitemap

            for spec in page.get_specs():
                if spec.priority > 0:  # Only include if priority > 0
                    # Use the centralized URL generation
                    url = page.get_url(spec)

                    urls.append({"loc": url, "priority": str(spec.priority)})

        logger.info(f"Generated sitemap with {len(urls)} URLs")

        return [
            PageSpec(
                output_path="sitemap.xml",
                template="sitemap.xml",  # Use the sitemap.xml template
                title="Sitemap",
                description="XML sitemap for search engines",
                context={"urls": urls},
            )
        ]


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
        self.register(TheoremIndexPage)
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
            if hasattr(page, "endpoint_name") and page.endpoint_name:
                # Get the first spec to determine the route pattern
                specs = page.get_specs()
                # Derive route from output path
                output_path = specs[0].output_path
                if output_path == "index.html":
                    route = "/"
                else:
                    route = "/" + output_path[:-11] + "/"  # Remove /index.html

                # Store the mapping
                self.endpoint_urls[page.endpoint_name] = route
                router.add_route(route, lambda: None, page.endpoint_name)

        # Add special routes that don't correspond to single pages
        router.add_route("/mathnotes/<path:filepath>", lambda: None, "page")
        router.add_route("/sitemap.xml", lambda: None, "sitemap")
        self.endpoint_urls["sitemap"] = "/sitemap.xml"

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
                if "canonical_url" not in spec.context:
                    spec.context["canonical_url"] = page.get_canonical_path(spec)
                all_specs.append((page, spec))
        return all_specs
