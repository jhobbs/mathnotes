"""Core static site generator class using Jinja2 directly."""

from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape
import logging

logger = logging.getLogger(__name__)


class StaticSiteGenerator:
    """Static site generator using Jinja2 directly."""

    def __init__(self, template_dir="templates", output_dir="output", base_url=""):
        """Initialize the generator with Jinja2 environment.

        Args:
            template_dir: Directory containing Jinja2 templates
            output_dir: Directory where static files will be written
            base_url: Base URL for the site (empty for relative URLs)
        """
        self.template_dir = Path(template_dir)
        self.output_dir = Path(output_dir)
        self.base_url = base_url

        # Create Jinja2 environment
        self.env = Environment(
            loader=FileSystemLoader(str(self.template_dir)),
            autoescape=select_autoescape(["html", "xml"]),
            trim_blocks=True,
            lstrip_blocks=True,
        )

        # Global context available to all templates
        self.global_context = {}

        # Routes registry
        self.routes = {}

        logger.info(f"Initialized generator: templates={template_dir}, output={output_dir}")

    def add_global(self, key, value):
        """Add a global variable available to all templates."""
        self.global_context[key] = value
        self.env.globals[key] = value

    def render_template(self, template_name, **context):
        """Render a template with context.

        Args:
            template_name: Name of the template file
            **context: Variables to pass to the template

        Returns:
            Rendered HTML string
        """
        template = self.env.get_template(template_name)
        full_context = {**self.global_context, **context}
        return template.render(**full_context)

    def write_page(self, output_path, html_content):
        """Write HTML content to a file.

        Args:
            output_path: Path relative to output_dir
            html_content: HTML string to write
        """
        full_path = self.output_dir / output_path
        full_path.parent.mkdir(parents=True, exist_ok=True)

        full_path.write_text(html_content, encoding="utf-8")
        logger.debug(f"Wrote {len(html_content)} bytes to {full_path}")
