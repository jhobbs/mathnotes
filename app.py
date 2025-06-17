"""
Main Flask application for Mathnotes.
"""

from flask import Flask

# Import our modules
from config import SITE_TITLE, SITE_DESCRIPTION
from security import generate_nonce, add_security_headers
from context_processors import inject_year, inject_nonce, inject_version
from url_mapper import URLMapper
from markdown_processor import MarkdownProcessor
from routes import register_routes

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Site configuration
    app.config['SITE_TITLE'] = SITE_TITLE
    app.config['SITE_DESCRIPTION'] = SITE_DESCRIPTION
    
    # Initialize components
    url_mapper = URLMapper()
    url_mapper.build_url_mappings()
    
    markdown_processor = MarkdownProcessor(url_mapper)
    
    # Register middleware
    app.before_request(generate_nonce)
    app.after_request(add_security_headers)
    
    # Register context processors
    app.context_processor(inject_year)
    app.context_processor(inject_nonce)
    app.context_processor(inject_version)
    
    # Register routes
    register_routes(app, url_mapper, markdown_processor)
    
    return app

# Create the app instance
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)