"""URL generation utilities for static site generation."""

import logging

logger = logging.getLogger(__name__)


class URLGenerator:
    """Generate URLs for various endpoints."""

    def __init__(self, page_registry, base_url):
        """Initialize URL generator.

        Args:
            page_registry: PageRegistry instance for endpoint lookup
            base_url: Base URL for absolute URLs (empty for relative)
        """
        self.page_registry = page_registry
        self.base_url = base_url.rstrip("/")

    def url_for(self, endpoint: str, **kwargs) -> str:
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
