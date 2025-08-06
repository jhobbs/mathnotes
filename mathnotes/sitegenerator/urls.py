"""URL generation utilities for static site generation."""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


class URLGenerator:
    """Generate URLs for various endpoints."""
    
    def __init__(self, router=None, base_url=''):
        """Initialize URL generator.
        
        Args:
            router: Router instance for dynamic URL generation
            base_url: Base URL for absolute URLs (empty for relative)
        """
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
        # Handle special endpoints
        if endpoint == 'static':
            filename = kwargs.get('filename', '')
            url = f"/static/{filename}"
        elif endpoint == 'index':
            url = '/'
        elif endpoint == 'page' or endpoint == 'serve_content':
            # Handle mathnotes pages
            path = kwargs.get('path', kwargs.get('filepath', ''))
            if path:
                # Keep the path as-is - it should already have proper trailing slashes
                url = f"/mathnotes/{path}"
            else:
                url = '/mathnotes/'
        elif endpoint == 'sitemap':
            url = '/sitemap.xml'
        elif endpoint == 'demos':
            url = '/demos/'
        elif endpoint == 'definition_index':
            url = '/mathnotes/definitions/'
        elif endpoint == 'demo_viewer':
            url = '/demos/'  # The demo viewer is at /demos/, not /demos/viewer
        elif self.router:
            # Try to use router for dynamic generation
            url = self.router.url_for(endpoint, **kwargs)
        else:
            # Fallback for unknown endpoints
            logger.warning(f"Unknown endpoint: {endpoint}")
            url = '/'
        
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