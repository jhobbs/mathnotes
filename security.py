"""
Security middleware and utilities for the Mathnotes application.
"""

import secrets
from flask import g

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
    
    return response