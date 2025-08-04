"""
Development server entry point.

This module provides a convenient way to run the development server
with appropriate settings for local development.
"""

import os
from pathlib import Path
from mathnotes import create_app

def main():
    """Run the development server."""
    app = create_app()
    
    # Get all markdown files in content directory for the reloader to watch
    extra_files = []
    content_dir = Path("content")
    if content_dir.exists():
        # Add all .md files in content directory and subdirectories
        for md_file in content_dir.rglob("*.md"):
            extra_files.append(str(md_file))
    
    # Run with extra files being watched
    app.run(debug=True, host='0.0.0.0', port=5000, extra_files=extra_files)

if __name__ == "__main__":
    main()