"""
Security middleware and utilities for the Mathnotes application.
"""

import secrets
import os
from flask import g, request
from .config import STATIC_FILE_CACHE_CONFIG

def generate_nonce():
    """Generate a unique nonce for CSP."""
    g.csp_nonce = secrets.token_urlsafe(16)

def add_security_headers(response):
    """
    Add security headers including CSP to all responses.
    
    Args:
        response: Flask response object
        
    Returns:
        Modified response with security headers
    """
    # Get the nonce for this request
    nonce = getattr(g, 'csp_nonce', '')
    
    # Content Security Policy with nonce
    csp_directives = [
        "default-src 'self'",
        f"script-src 'self' 'nonce-{nonce}' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self' https://cdn.jsdelivr.net",
        "connect-src 'self'",
        "frame-src 'self'",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "upgrade-insecure-requests"
    ]
    
    response.headers['Content-Security-Policy'] = '; '.join(csp_directives)
    
    # Additional security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
    
    # HTTP Strict Transport Security (HSTS)
    # max-age=31536000 (1 year), includeSubDomains, preload
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
    
    # Cross-Origin-Opener-Policy for origin isolation
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    
    # Cross-Origin-Embedder-Policy (using credentialless for better compatibility)
    response.headers['Cross-Origin-Embedder-Policy'] = 'credentialless'
    
    # Apply static file caching headers
    response = apply_static_file_caching(response)
    
    return response

def apply_static_file_caching(response):
    """
    Apply appropriate caching headers for static files based on file extension.
    Disables caching entirely in development mode.
    
    Args:
        response: Flask response object
        
    Returns:
        Response with caching headers applied
    """
    from flask import current_app
    
    # Check if we're in development mode
    is_development = (
        current_app.debug or 
        os.environ.get('FLASK_ENV') == 'development' or
        os.environ.get('FLASK_DEBUG') == '1' or
        'localhost' in request.host or
        '127.0.0.1' in request.host
    )
    
    # Only apply to static files
    if request.endpoint == 'static' or request.path.startswith('/static/'):
        if not is_development:
            # Production: Apply caching based on file type
            _, ext = os.path.splitext(request.path)
            ext = ext.lower()
            
            if ext in STATIC_FILE_CACHE_CONFIG:
                cache_config = STATIC_FILE_CACHE_CONFIG[ext]
                max_age = cache_config['max_age']
                is_public = cache_config.get('public', True)
                
                # Set cache control headers
                cache_control_parts = [f'max-age={max_age}']
                if is_public:
                    cache_control_parts.append('public')
                else:
                    cache_control_parts.append('private')
                
                response.headers['Cache-Control'] = ', '.join(cache_control_parts)
                
                # Remove the no-cache header if it exists
                if 'Cache-Control' in response.headers and 'no-cache' in response.headers['Cache-Control']:
                    response.headers['Cache-Control'] = ', '.join(cache_control_parts)
        else:
            # Development: Explicitly disable caching for static files only
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
    
    return response