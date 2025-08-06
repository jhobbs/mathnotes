"""
Helper functions for generating relative URLs in static builds.
"""

from flask import url_for as flask_url_for
from urllib.parse import urljoin, urlparse
import os


def make_relative_url(from_path, to_path):
    """
    Create a relative URL from one path to another.
    
    Args:
        from_path: The path of the current page (e.g., '/mathnotes/algebra/groups')
        to_path: The target path (e.g., '/mathnotes/topology/basics')
    
    Returns:
        A relative URL (e.g., '../../topology/basics')
    """
    # Remember if to_path had a trailing slash
    had_trailing_slash = to_path.endswith('/')
    
    # Normalize paths - remove leading/trailing slashes
    from_path = from_path.strip('/')
    to_path = to_path.strip('/')
    
    # Handle root paths
    if not from_path:
        result = to_path if to_path else '.'
        if had_trailing_slash and result != '.':
            result += '/'
        return result
    if not to_path:
        # Going to root from somewhere
        depth = len(from_path.split('/'))
        result = '/'.join(['..'] * depth) if depth > 0 else '.'
        if had_trailing_slash and result != '.':
            result += '/'
        return result
    
    # Split paths into components
    from_parts = from_path.split('/')
    to_parts = to_path.split('/')
    
    # Find common prefix
    common_len = 0
    for i in range(min(len(from_parts), len(to_parts))):
        if from_parts[i] == to_parts[i]:
            common_len += 1
        else:
            break
    
    # Build relative path
    # Go up from current location to common ancestor
    up_levels = len(from_parts) - common_len
    relative_parts = ['..'] * up_levels
    
    # Then go down to target
    relative_parts.extend(to_parts[common_len:])
    
    # Handle case where we're in the same directory
    if not relative_parts:
        result = '.'
    else:
        result = '/'.join(relative_parts)
    
    # Restore trailing slash if original had one
    if had_trailing_slash and result != '.':
        result += '/'
    
    return result


def relative_url_for(endpoint, current_path=None, **values):
    """
    Generate a relative URL for a Flask endpoint.
    
    This function wraps Flask's url_for but returns relative URLs
    suitable for static site generation.
    
    Args:
        endpoint: The Flask endpoint name
        current_path: The current page's path (for calculating relative URL)
        **values: Additional values for the endpoint
    
    Returns:
        A relative URL string
    """
    # Get the absolute URL from Flask
    absolute_url = flask_url_for(endpoint, **values)
    
    # If no current path provided, return the absolute URL
    if current_path is None:
        return absolute_url
    
    # For external URLs, return as-is
    if absolute_url.startswith(('http://', 'https://', '//')):
        return absolute_url
    
    # Calculate relative path
    return make_relative_url(current_path, absolute_url)


def relative_asset_url(asset_path, current_path=None):
    """
    Generate a relative URL for static assets.
    
    Args:
        asset_path: The asset path (e.g., '/static/css/main.css')
        current_path: The current page's path
    
    Returns:
        A relative URL to the asset
    """
    if current_path is None:
        return asset_path
    
    # For external URLs, return as-is
    if asset_path.startswith(('http://', 'https://', '//')):
        return asset_path
    
    return make_relative_url(current_path, asset_path)


def get_relative_depth(path):
    """
    Get the depth of a path (number of directories).
    
    Args:
        path: The path to analyze
    
    Returns:
        The number of directory levels
    """
    path = path.strip('/')
    if not path:
        return 0
    return len(path.split('/'))


def get_base_href(current_path):
    """
    Get a base href for the current path.
    
    This can be used in a <base> tag to make all relative URLs
    work correctly.
    
    Args:
        current_path: The current page's path
    
    Returns:
        A base href string
    """
    depth = get_relative_depth(current_path)
    if depth == 0:
        return './'
    return '/'.join(['..'] * depth) + '/'