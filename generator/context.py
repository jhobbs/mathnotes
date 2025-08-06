"""Context building functions for templates."""

import os
import json
import subprocess
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


def get_version() -> str:
    """Get application version from various sources."""
    version = "unknown"
    try:
        # Try to read from Docker build location first
        if os.path.exists("/version/version.txt"):
            with open("/version/version.txt", "r") as f:
                version = f.read().strip()
        # Try local version.txt (for non-volume-mounted Docker)
        elif os.path.exists("version.txt"):
            with open("version.txt", "r") as f:
                version = f.read().strip()
        # Fallback to git command for local development
        elif os.path.exists(".git"):
            try:
                version = (
                    subprocess.check_output(
                        ["git", "describe", "--always", "--tags", "--dirty"],
                        stderr=subprocess.DEVNULL,
                    )
                    .decode("utf-8")
                    .strip()
                )
            except:
                pass
    except Exception as e:
        logger.warning(f"Could not determine version: {e}")
    
    return version


def load_asset_manifest() -> Dict[str, str]:
    """Load asset manifest for cache-busted filenames."""
    manifest_path = Path("static/dist/manifest.json")
    if manifest_path.exists():
        try:
            with open(manifest_path) as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Could not load asset manifest: {e}")
    return {}


def get_asset_urls(manifest: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    """Get URLs for CSS and JS assets."""
    if manifest is None:
        manifest = load_asset_manifest()
    
    # Default filenames (what the manifest keys are)
    css_key = "main.css"
    main_js_key = "main.js"
    mathjax_js_key = "mathjax.js"
    
    # Get hashed filenames from manifest, or use defaults
    if manifest:
        css_file = manifest.get(css_key, css_key)
        main_js = manifest.get(main_js_key, main_js_key)
        mathjax_js = manifest.get(mathjax_js_key, mathjax_js_key)
    else:
        css_file = css_key
        main_js = main_js_key
        mathjax_js = mathjax_js_key
    
    return {
        "css_url": f"/static/dist/{css_file}",
        "main_js_url": f"/static/dist/{main_js}",
        "mathjax_js_url": f"/static/dist/{mathjax_js}"
    }


def build_global_context(
    base_url: str = '',
    tooltip_data: Optional[Dict[str, Any]] = None,
    is_development: bool = False
) -> Dict[str, Any]:
    """Build global context for all templates.
    
    Args:
        base_url: Base URL for the site (empty for relative URLs)
        tooltip_data: Data for tooltip references
        is_development: Whether in development mode
        
    Returns:
        Dictionary of context variables
    """
    # Create a config object that templates expect
    config = {
        'SITE_TITLE': 'Mathnotes',
        'SITE_DESCRIPTION': 'A collection of mathematics notes and interactive demonstrations'
    }
    
    context = {
        "config": config,  # Add config object for templates
        "current_year": datetime.now().year,
        "app_version": get_version(),
        "base_url": base_url,
        "is_development": is_development,
    }
    
    # Add asset URLs
    asset_urls = get_asset_urls()
    context.update(asset_urls)
    
    # Process tooltip data if provided
    if tooltip_data:
        tooltip_list = []
        for label, data in tooltip_data.items():
            tooltip_list.append({
                'label': label,
                'type': data['type'],
                'title': data['title'],
                'content': data['content'],
                'url': data.get('url', '')
            })
        context["tooltip_data"] = json.dumps(tooltip_list)
    else:
        context["tooltip_data"] = None
    
    return context


def build_page_context(
    title: str = '',
    content: str = '',
    description: str = '',
    path: str = '',
    **kwargs
) -> Dict[str, Any]:
    """Build context for a specific page.
    
    Args:
        title: Page title
        content: Page content HTML
        description: Meta description
        path: URL path for this page
        **kwargs: Additional context variables
        
    Returns:
        Dictionary of page-specific context
    """
    context = {
        "title": title,
        "content": content,
        "description": description,
        "path": path,
    }
    context.update(kwargs)
    return context