# Mathnotes Development Guide

## Package Structure

Mathnotes is now organized as a proper Python package:

```
mathnotes/
├── mathnotes/                    # Main Python package
│   ├── __init__.py              # Flask app factory
│   ├── config.py                # Configuration settings
│   ├── utils.py                 # General utilities
│   ├── security.py              # Security middleware
│   ├── url_mapper.py            # URL mapping logic
│   ├── markdown_processor.py    # Markdown rendering
│   ├── context_processors.py    # Flask context processors
│   ├── routes.py                # Route definitions
│   └── structured_math.py       # Structured math system
├── wsgi.py                      # Production WSGI entry point
├── run.py                       # Development server entry point
├── app.py                       # Backward compatibility
├── templates/                   # Jinja2 templates
├── static/                      # Static assets
└── [content directories]        # Mathematical content
```

## Running the Application

### Development
```bash
# With Docker Compose (recommended)
docker-compose up --build

# Or directly with Python
python run.py
```

### Production
```bash
# Using Gunicorn (production)
gunicorn --bind 0.0.0.0:5000 --workers 4 wsgi:application

# Docker production build
docker build -t mathnotes .
docker run -p 5000:5000 mathnotes
```

## Entry Points

- **`wsgi.py`** - Production WSGI entry point for Gunicorn/uWSGI
- **`run.py`** - Development server with debug mode
- **`app.py`** - Backward compatibility (deprecated, use wsgi.py or run.py)

## Package Features

- **Flask App Factory Pattern** - Clean, testable application initialization
- **Modular Architecture** - Separated concerns across focused modules
- **Structured Math Content** - Support for theorems, definitions, proofs with semantic markup
- **Security Headers** - Comprehensive CSP and security headers
- **URL Mapping** - Canonical URLs with redirect support
- **Markdown Processing** - Advanced markdown with LaTeX math and wiki-style links

## Module Overview

- **`config.py`** - Site configuration and constants
- **`security.py`** - CSP nonces and security headers
- **`url_mapper.py`** - Canonical URL generation and redirect handling
- **`markdown_processor.py`** - Markdown parsing with structured math support
- **`routes.py`** - All Flask route handlers
- **`structured_math.py`** - Semantic markup for mathematical content
- **`file_utils.py`** - File system utilities
- **`context_processors.py`** - Template context injection
- **`utils.py`** - General utility functions

## Testing

The package can be imported and tested:

```python
from mathnotes import create_app

app = create_app()
# Run tests, etc.
```