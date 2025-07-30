"""
Configuration settings for the Mathnotes Flask application.
"""

import os
import markdown

# Site configuration
SITE_TITLE = "Mathnotes"
SITE_DESCRIPTION = "A collection of mathematics notes and interactive demonstrations"

# Content directories
CONTENT_DIRS = [
    "content/algebra",
    "content/analysis",
    "content/differential-equations",
    "content/geometry",
    "content/topology",
    "content/logic-and-proofs",
    "content/physics",
    "content/probability-and-statistics",
    "content/misc",
    "content/numerical-analysis",
    "content/discrete-math",
    "content/cellular-automata",
]


# Markdown configuration
def create_markdown_instance():
    """Create and configure a Markdown instance with required extensions."""
    return markdown.Markdown(extensions=["extra", "codehilite", "toc", "tables", "fenced_code"])


# URL configuration
def get_base_url(request=None):
    """Get the base URL, detecting local development environment."""
    import os
    from flask import request as flask_request

    # Use the provided request or get from Flask context
    req = request or flask_request

    # Check if we're in development mode
    is_development = (
        os.environ.get("FLASK_ENV") == "development"
        or os.environ.get("FLASK_DEBUG") == "1"
        or (req and ("localhost" in req.host or "127.0.0.1" in req.host))
    )

    if is_development and req:
        # Use the current request's scheme and host for local development
        return f"{req.scheme}://{req.host}"
    else:
        # Use production URL
        return "https://www.lacunary.org"


# Legacy constant for backward compatibility (production URL)
BASE_URL = "https://www.lacunary.org"

# Static file caching configuration
SEND_FILE_MAX_AGE_DEFAULT = 3600  # 1 hour default for static files

# Cache headers for different file types (production values)
STATIC_FILE_CACHE_CONFIG = {
    # CSS and JS files - shorter cache for development
    ".css": {"max_age": 60, "public": True},  # 1 minute
    ".js": {"max_age": 60, "public": True},  # 1 minute
    # Images - cache for 1 day maximum
    ".png": {"max_age": 86400, "public": True},  # 1 day
    ".jpg": {"max_age": 86400, "public": True},  # 1 day
    ".jpeg": {"max_age": 86400, "public": True},  # 1 day
    ".gif": {"max_age": 86400, "public": True},  # 1 day
    ".svg": {"max_age": 86400, "public": True},  # 1 day
    ".ico": {"max_age": 86400, "public": True},  # 1 day
    # Fonts - cache for longer since they rarely change
    ".woff": {"max_age": 86400, "public": True},  # 1 day
    ".woff2": {"max_age": 86400, "public": True},  # 1 day
    ".ttf": {"max_age": 86400, "public": True},  # 1 day
    ".eot": {"max_age": 86400, "public": True},  # 1 day
    # HTML files - shorter cache for interactive demos
    ".html": {"max_age": 3600, "public": True},  # 1 hour
}

# Demo integration is now handled automatically by file presence
# No configuration needed - demos use direct integration if *-integrated.html exists
