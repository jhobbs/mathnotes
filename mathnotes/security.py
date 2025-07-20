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
    nonce = getattr(g, "csp_nonce", "")

    # Check if we're in development mode
    is_development = (
        os.environ.get("FLASK_ENV") == "development" or os.environ.get("FLASK_DEBUG") == "1"
    )

    # Content Security Policy with nonce
    # Note: p5.js requires 'unsafe-eval' to work properly
    script_src = f"script-src 'self' 'nonce-{nonce}' 'unsafe-eval'"
    connect_src = "connect-src 'self'"

    # In development, also allow Vite dev server
    if is_development:
        # Allow various hostnames that might be used (no HTTPS in dev)
        script_src += " http://localhost:5173 http://vite:5173 http://127.0.0.1:5173"
        connect_src += " http://localhost:5173 ws://localhost:5173 http://vite:5173 ws://vite:5173 http://127.0.0.1:5173 ws://127.0.0.1:5173"

    csp_directives = [
        "default-src 'self'",
        script_src,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https://upload.wikimedia.org",
        "font-src 'self' https://cdn.jsdelivr.net",
        connect_src,
        "frame-src 'self'",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "upgrade-insecure-requests",
    ]

    response.headers["Content-Security-Policy"] = "; ".join(csp_directives)

    # Additional security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

    # HTTP Strict Transport Security (HSTS)
    # max-age=31536000 (1 year), includeSubDomains, preload
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

    # Cross-Origin-Opener-Policy for origin isolation
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"

    # Cross-Origin-Embedder-Policy (using credentialless for better compatibility)
    response.headers["Cross-Origin-Embedder-Policy"] = "credentialless"

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
        current_app.debug
        or os.environ.get("FLASK_ENV") == "development"
        or os.environ.get("FLASK_DEBUG") == "1"
    )

    # Only apply to static files
    if request.endpoint == "static" or request.path.startswith("/static/"):
        if not is_development:
            # Production: Apply caching based on file type and pattern
            path = request.path
            _, ext = os.path.splitext(path)
            ext = ext.lower()

            # Check if this is a hashed asset (contains hash in filename)
            # Vite generates files like: chunk-ABC123.js, index-DEF456.css
            import re

            is_hashed_asset = bool(re.search(r"-[a-f0-9]{6,}\.", path))

            # Special handling for dist directory files
            if "/static/dist/" in path:
                if is_hashed_asset or "/fonts/" in path:
                    # Hashed assets and fonts can be cached forever
                    max_age = 31536000  # 1 year
                    response.headers["Cache-Control"] = f"public, max-age={max_age}, immutable"
                elif path.endswith(("main.js", "mathjax.js")):
                    # Entry points should have shorter cache
                    max_age = 3600  # 1 hour
                    response.headers["Cache-Control"] = f"public, max-age={max_age}"
                else:
                    # Other dist files get moderate caching
                    max_age = 86400  # 1 day
                    response.headers["Cache-Control"] = f"public, max-age={max_age}"
            elif ext in STATIC_FILE_CACHE_CONFIG:
                # Use configured cache settings for other static files
                cache_config = STATIC_FILE_CACHE_CONFIG[ext]
                max_age = cache_config["max_age"]
                is_public = cache_config.get("public", True)

                # Set cache control headers
                cache_control_parts = [f"max-age={max_age}"]
                if is_public:
                    cache_control_parts.append("public")
                else:
                    cache_control_parts.append("private")

                response.headers["Cache-Control"] = ", ".join(cache_control_parts)
        else:
            # Development: Explicitly disable caching for static files only
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"

    return response
