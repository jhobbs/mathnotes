"""Refactored builder using page-centric architecture."""

import logging
import shutil
from pathlib import Path

from .core import StaticSiteGenerator
from .router import Router
from .context import build_global_context
from .pages import PageRegistry

from mathnotes.content_discovery import ContentDiscovery
from mathnotes.markdown_processor import MarkdownProcessor
from mathnotes.block_index import BlockIndex
from mathnotes.config import BASE_URL

logger = logging.getLogger(__name__)


class SiteBuilder:
    """Simplified site builder using page registry pattern."""

    def __init__(self, output_dir: str = "static-build"):
        """Initialize the site builder.

        Args:
            output_dir: Directory for output files
        """
        self.output_dir = Path(output_dir)
        self.base_url = BASE_URL

        # Initialize core generator
        self.generator = StaticSiteGenerator(
            template_dir="templates", output_dir=str(self.output_dir), base_url=self.base_url
        )

        # Initialize data components first
        self.url_mapper = ContentDiscovery()
        self.url_mapper.build_url_mappings()

        self.block_index = BlockIndex(self.url_mapper)
        self.block_index.build_index()

        self.markdown_processor = MarkdownProcessor(self.url_mapper, self.block_index)

        # Build site context for pages
        site_context = {
            "url_mapper": self.url_mapper,
            "block_index": self.block_index,
            "markdown_processor": self.markdown_processor,
            "base_url": self.base_url,
            "generator": self.generator,
        }

        # Initialize page registry
        self.page_registry = PageRegistry(site_context)

        # Initialize router and set up routes from page registry
        self.router = Router()
        self.page_registry.setup_routes(self.router)

        # Add url_for to template globals
        self.generator.add_global("url_for", self._url_for)

        logger.info(f"Initialized site builder: output={output_dir}")

    def _url_for(self, endpoint: str, **kwargs) -> str:
        """Generate URL for an endpoint.

        Args:
            endpoint: Name of the endpoint or special values like 'static'
            **kwargs: Parameters for the URL

        Returns:
            Generated URL string
        """
        # Check page registry for the endpoint
        url = self.page_registry.get_url_for_endpoint(endpoint)

        if url:
            # Found in registry
            return url

        if endpoint == "page" or endpoint == "serve_content":
            # Special case for content pages with dynamic paths
            path = kwargs.get("path", kwargs.get("filepath", ""))
            # Keep the path as-is - it should already have proper trailing slashes
            return f"/mathnotes/{path}"

        # Unknown endpoint
        raise ValueError(f"Unknown endpoint: {endpoint}")

    def clean_output_dir(self):
        """Clean the output directory."""
        if self.output_dir.exists():
            logger.info(f"Cleaning existing output directory: {self.output_dir}")
            shutil.rmtree(self.output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def setup_global_context(self):
        """Set up global context for all templates."""
        # Convert block index to tooltip data format
        tooltip_data = {}
        for label, ref in self.block_index.index.items():
            # Use the processed HTML content (with references converted to links)
            tooltip_data[label] = {
                "type": ref.block.block_type.value,
                "title": ref.block.title or "",
                "content": ref.block.content_html,
                "url": ref.full_url,
                # Add synonym metadata if applicable
                "is_synonym": getattr(ref, 'is_synonym', False),
                "synonym_of": ref.block.title if getattr(ref, 'is_synonym', False) else None,
                "synonym_title": getattr(ref, 'synonym_title', None),
            }

        global_context = build_global_context(base_url=self.base_url, tooltip_data=tooltip_data, is_development=False)

        # Add global context to generator
        for key, value in global_context.items():
            self.generator.add_global(key, value)

    def render_all_pages(self):
        """Render all pages using the page registry."""
        # Get all page specifications
        all_specs = self.page_registry.get_all_specs()

        logger.info(f"Rendering {len(all_specs)} pages...")

        for page, spec in all_specs:
            # Build context for rendering
            context = {"title": spec.title, "description": spec.description, **spec.context}

            # Render template and write to file
            html = self.generator.render_template(spec.template, **context)
            self.generator.write_page(spec.output_path, html)
            logger.debug(f"Rendered {spec.template} -> {spec.output_path}")

    def copy_static_assets(self):
        """Copy all static assets to output directory."""
        logger.info("Copying static assets...")

        # Copy static directory
        static_src = Path("static")
        if static_src.exists():
            static_dst = self.output_dir / "static"
            if static_dst.exists():
                shutil.rmtree(static_dst)
            shutil.copytree(static_src, static_dst)
            logger.info(f"Copied static directory to {static_dst}")

        # Copy favicon if exists
        favicon = Path("favicon.ico")
        if favicon.exists():
            shutil.copy(favicon, self.output_dir / "favicon.ico")

        # Copy robots.txt if exists
        robots = Path("robots.txt")
        if robots.exists():
            shutil.copy(robots, self.output_dir / "robots.txt")

        # Copy images from content directories
        self._copy_content_images()

    def _copy_content_images(self):
        """Copy images from content directories."""
        logger.info("Copying content images...")
        content_dir = Path("content")
        image_extensions = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}
        image_count = 0

        for image_file in content_dir.rglob("*"):
            if image_file.is_file() and image_file.suffix.lower() in image_extensions:
                # Maintain directory structure
                relative_path = image_file.relative_to(content_dir)
                output_path = self.output_dir / "mathnotes" / relative_path

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
        total_files = sum(1 for _ in self.output_dir.rglob("*") if _.is_file())
        total_size = sum(f.stat().st_size for f in self.output_dir.rglob("*") if f.is_file())

        logger.info(f"Build complete! Output in {self.output_dir}")
        logger.info(f"Generated {total_files} files, total size: {total_size / 1024 / 1024:.2f} MB")
