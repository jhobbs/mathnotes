"""
Configuration settings for the Mathnotes Flask application.
"""

import os
import markdown

# Site configuration
SITE_TITLE = 'Mathnotes'
SITE_DESCRIPTION = 'A collection of mathematics notes and interactive demonstrations'

# Content directories
CONTENT_DIRS = [
    "content/algebra", 
    "content/calculus", 
    "content/differential equations", 
    "content/trigonometry", 
    "content/logic and proofs", 
    "content/linear algebra", 
    "content/physics", 
    "content/complex analysis", 
    "content/graphics", 
    "content/probability and statistics", 
    "content/misc", 
    "content/numerical analysis", 
    "content/discrete math", 
    "content/cellular automata", 
    "content/real analysis",
]

# Markdown configuration
def create_markdown_instance():
    """Create and configure a Markdown instance with required extensions."""
    return markdown.Markdown(extensions=[
        'extra',
        'codehilite',
        'toc',
        'tables',
        'fenced_code'
    ])

# URL configuration
BASE_URL = 'https://www.lacunary.org'

# Static file caching configuration
SEND_FILE_MAX_AGE_DEFAULT = 3600  # 1 hour default for static files

# Cache headers for different file types (production values)
STATIC_FILE_CACHE_CONFIG = {
    # CSS and JS files - cache for 1 hour to allow for updates
    '.css': {'max_age': 3600, 'public': True},   # 1 hour
    '.js': {'max_age': 3600, 'public': True},    # 1 hour
    
    # Images - cache for 1 day maximum
    '.png': {'max_age': 86400, 'public': True},  # 1 day
    '.jpg': {'max_age': 86400, 'public': True},  # 1 day
    '.jpeg': {'max_age': 86400, 'public': True}, # 1 day
    '.gif': {'max_age': 86400, 'public': True},  # 1 day
    '.svg': {'max_age': 86400, 'public': True},  # 1 day
    '.ico': {'max_age': 86400, 'public': True},  # 1 day
    
    # Fonts - cache for longer since they rarely change
    '.woff': {'max_age': 86400, 'public': True},  # 1 day
    '.woff2': {'max_age': 86400, 'public': True}, # 1 day
    '.ttf': {'max_age': 86400, 'public': True},   # 1 day
    '.eot': {'max_age': 86400, 'public': True},   # 1 day
    
    # HTML files - shorter cache for interactive demos
    '.html': {'max_age': 3600, 'public': True},   # 1 hour
}

# Demo integration is now handled automatically by file presence
# No configuration needed - demos use direct integration if *-integrated.html exists