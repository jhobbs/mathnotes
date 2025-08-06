"""URL generation utilities for static site generation."""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


class URLGenerator:
    """Generate URLs for various endpoints."""
    
    def __init__(self, page_registry=None, router=None, base_url=''):
        """Initialize URL generator.
        
        Args:
            page_registry: PageRegistry instance for endpoint lookup
            router: Router instance for dynamic URL generation
            base_url: Base URL for absolute URLs (empty for relative)
        """
        self.page_registry = page_registry
        self.router = router
        self.base_url = base_url.rstrip('/')
    
    def url_for(self, endpoint: str, _external=False, _anchor=None, **kwargs) -> str:
        """Generate URL for an endpoint.
        
        Args:
            endpoint: Name of the endpoint or special values like 'static'
            _external: Whether to generate absolute URL
            _anchor: Fragment identifier to append
            **kwargs: Parameters for the URL
            
        Returns:
            Generated URL string
        """
        # Check page registry for the endpoint
        url = self.page_registry.get_url_for_endpoint(endpoint)
        
        if url:
            # Found in registry
            pass
        elif endpoint == 'static':
            # Special case for static files
            filename = kwargs.get('filename', '')
            url = f"/static/{filename}"
        elif endpoint == 'page' or endpoint == 'serve_content':
            # Special case for content pages with dynamic paths
            path = kwargs.get('path', kwargs.get('filepath', ''))
            if path:
                # Keep the path as-is - it should already have proper trailing slashes
                url = f"/mathnotes/{path}"
            else:
                url = '/mathnotes/'
        else:
            # Unknown endpoint
            raise ValueError(f"Unknown endpoint: {endpoint}")
        
        # Add base URL if external
        if _external and self.base_url:
            url = self.base_url + url
        
        # Add anchor if provided
        if _anchor:
            url = f"{url}#{_anchor}"
        
        return url
    
    def static_url(self, filename: str, **kwargs) -> str:
        """Shortcut for static file URLs.
        
        Args:
            filename: Path to static file
            **kwargs: Additional parameters
            
        Returns:
            URL to static file
        """
        return self.url_for('static', filename=filename, **kwargs)
    
    def asset_url(self, filename: str, manifest: Optional[dict] = None) -> str:
        """Generate URL for asset with cache busting.
        
        Args:
            filename: Original asset filename
            manifest: Asset manifest with hashed filenames
            
        Returns:
            URL to asset (possibly with hash)
        """
        if manifest and filename in manifest:
            filename = manifest[filename]
        
        return self.static_url(f"dist/{filename}")