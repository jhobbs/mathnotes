"""
Development server entry point.

This module provides a convenient way to run the development server
with appropriate settings for local development.
"""

from mathnotes import create_app

def main():
    """Run the development server."""
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == "__main__":
    main()