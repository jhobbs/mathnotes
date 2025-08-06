"""
Asset management utilities for handling Vite-generated assets with hashes.
"""

import json
import os
from flask import current_app


_manifest_cache = None


def get_manifest():
    """Load and cache the Vite manifest file."""
    global _manifest_cache
    
    if _manifest_cache is not None:
        return _manifest_cache
    
    manifest_path = os.path.join(current_app.root_path, '..', 'static', 'dist', '.vite', 'manifest.json')
    
    # In development, we don't use the manifest
    if current_app.debug:
        return {}
    
    try:
        with open(manifest_path, 'r') as f:
            _manifest_cache = json.load(f)
            return _manifest_cache
    except (FileNotFoundError, json.JSONDecodeError):
        # If manifest doesn't exist, return empty dict
        return {}


def get_asset_url(asset_name):
    """
    Get the URL for a Vite-generated asset, accounting for hash in production.
    
    Args:
        asset_name: The original asset name (e.g., 'styles/main.css')
    
    Returns:
        The URL for the asset, with hash in production
    """
    manifest = get_manifest()
    
    # Look up the asset in the manifest
    if asset_name in manifest:
        # Get the hashed filename
        hashed_filename = manifest[asset_name]['file']
        return f'/static/dist/{hashed_filename}'
    else:
        # Fallback to non-hashed name (for development or missing manifest)
        return f'/static/dist/{asset_name}'


def get_css_url():
    """Get the URL for the main CSS file."""
    return get_asset_url('main.css')


def get_main_js_url():
    """Get the URL for the main JavaScript file."""
    return get_asset_url('main.js')


def get_mathjax_js_url():
    """Get the URL for the MathJax JavaScript file."""
    return get_asset_url('mathjax.js')