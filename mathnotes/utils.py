"""
General utility functions for the Mathnotes application.
"""

import re
import unicodedata

def slugify(text):
    """
    Convert text to URL-friendly slug.
    
    Args:
        text: The text to slugify
        
    Returns:
        A URL-friendly slug
    """
    # Convert to lowercase and normalize unicode
    text = unicodedata.normalize('NFKD', text.lower())
    # Remove non-alphanumeric characters except spaces and hyphens
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    # Replace spaces with hyphens
    text = re.sub(r'\s+', '-', text.strip())
    # Remove multiple consecutive hyphens
    text = re.sub(r'-+', '-', text)
    return text