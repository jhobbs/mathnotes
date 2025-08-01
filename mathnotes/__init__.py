"""
Mathnotes - A Flask application for serving mathematical notes with interactive demonstrations.

This package provides a web interface for mathematics content with features like:
- Structured mathematical content (theorems, definitions, proofs)
- Interactive HTML demonstrations
- Dark mode support
- LaTeX math rendering
- Cross-referenced content
"""

__version__ = "1.0.0"

from flask import Flask
import logging
from .config import (
    SITE_TITLE,
    SITE_DESCRIPTION,
    SEND_FILE_MAX_AGE_DEFAULT,
    STATIC_FILE_CACHE_CONFIG,
)
from .security import generate_nonce, add_security_headers
from .context_processors import (
    inject_year,
    inject_nonce,
    inject_version,
    inject_env,
    inject_base_url,
    inject_tooltip_data,
)
from .url_mapper import URLMapper
from .markdown_processor import MarkdownProcessor
from .routes import register_routes
from .block_index import BlockIndex


def create_app(config=None):
    """
    Flask application factory.

    Args:
        config: Optional configuration dictionary

    Returns:
        Configured Flask application instance
    """
    import os

    # Get the parent directory of the package for template/static file paths
    package_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(package_dir)

    app = Flask(
        __name__,
        template_folder=os.path.join(parent_dir, "templates"),
        static_folder=os.path.join(parent_dir, "static"),
    )

    # Apply any custom configuration
    if config:
        app.config.update(config)

    # Site configuration
    app.config["SITE_TITLE"] = SITE_TITLE
    app.config["SITE_DESCRIPTION"] = SITE_DESCRIPTION
    app.config["SEND_FILE_MAX_AGE_DEFAULT"] = SEND_FILE_MAX_AGE_DEFAULT

    # Initialize components
    url_mapper = URLMapper()
    url_mapper.build_url_mappings()

    # Build global block index
    block_index = BlockIndex(url_mapper)
    block_index.build_index()

    markdown_processor = MarkdownProcessor(url_mapper, block_index)

    # Register middleware
    app.before_request(generate_nonce)
    app.after_request(add_security_headers)

    # Register context processors
    app.context_processor(inject_year)
    app.context_processor(inject_nonce)
    app.context_processor(inject_version)
    app.context_processor(inject_env)
    app.context_processor(inject_base_url)
    app.context_processor(inject_tooltip_data)

    # Register routes
    register_routes(app, url_mapper, markdown_processor)

    # Configure logging if in production (gunicorn will handle this)
    # In development, Flask's default logger will work
    if not app.debug:
        # Configure app logger to use the same format as gunicorn
        gunicorn_logger = logging.getLogger('gunicorn.error')
        app.logger.handlers = gunicorn_logger.handlers
        app.logger.setLevel(gunicorn_logger.level)

    return app
