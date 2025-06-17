"""
WSGI entry point for production deployment.

This module provides the WSGI application instance for deployment
to production servers like Gunicorn, uWSGI, or Apache mod_wsgi.
"""

from mathnotes import create_app

# Create the application instance
application = create_app()
app = application  # Some WSGI servers expect 'app' specifically

if __name__ == "__main__":
    # This won't be called in production, but useful for testing
    application.run(debug=False, host='0.0.0.0', port=5000)