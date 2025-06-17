"""
Configuration settings for the Mathnotes Flask application.
"""

import markdown

# Site configuration
SITE_TITLE = 'Mathnotes'
SITE_DESCRIPTION = 'A collection of mathematics notes and interactive demonstrations'

# Content directories
CONTENT_DIRS = [
    "algebra", 
    "calculus", 
    "differential equations", 
    "trigonometry", 
    "logic and proofs", 
    "linear algebra", 
    "physics", 
    "complex analysis", 
    "graphics", 
    "probability and statistics", 
    "misc", 
    "numerical analysis", 
    "discrete math", 
    "cellular automata", 
    "real analysis",
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