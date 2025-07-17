# Mathnotes

A modern Flask application for serving mathematical notes and interactive demonstrations. Features structured mathematical content, dark mode support, LaTeX rendering, and interactive HTML/JavaScript demonstrations.

## Features

- **Structured Mathematical Content** - Semantic markup for theorems, definitions, proofs, examples, and more
- **Interactive Demonstrations** - Embedded HTML/JavaScript visualizations with fullscreen support
- **LaTeX Math Rendering** - Full MathJax integration for mathematical expressions
- **Dark Mode Support** - Automatic dark/light theme based on system preference
- **Wiki-style Links** - Cross-referenced content with `[[slug]]` syntax
- **Mobile Responsive** - Optimized for all screen sizes
- **Security Headers** - Comprehensive CSP and security headers
- **Static File Caching** - Smart caching with development-friendly defaults

## Quick Start

### Docker (Recommended)

```bash
# Development
docker-compose up --build

# Production
docker build -t mathnotes .
docker run -p 5000:5000 mathnotes
```

### Local Development

```bash
# Quick setup (creates venv and installs dependencies)
./setup-dev.sh

# Manual setup
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements-dev.txt

# Run development server
python run.py
```

### Testing

```bash
# Run all tests
make test  # or: pytest

# Run with coverage
make coverage

# Run specific test file
pytest test/test_math_utils.py -v

# Use the convenience script
./run-tests.sh unit      # Run unit tests
./run-tests.sh coverage  # Run with coverage
./run-tests.sh docker    # Force Docker mode

# Run linting and formatting
make lint    # Check code style
make format  # Auto-format code
make check   # Run all checks (lint, type, test)
```

## Architecture

### Package Structure

```
mathnotes/
├── mathnotes/                    # Main Python package
│   ├── __init__.py              # Flask app factory
│   ├── config.py                # Configuration settings
│   ├── security.py              # Security middleware & CSP
│   ├── url_mapper.py            # URL mapping & redirects
│   ├── markdown_processor.py    # Markdown rendering
│   ├── structured_math.py       # Mathematical content system
│   ├── routes.py                # Route definitions
│   ├── file_utils.py            # File system utilities
│   ├── context_processors.py    # Template context injection
│   └── utils.py                 # General utilities
├── wsgi.py                      # Production WSGI entry point
├── run.py                       # Development server entry point
├── templates/                   # Jinja2 templates
├── static/                      # Static assets (CSS, JS)
└── [content directories]        # Mathematical content
```

### Content Organization

Mathematical content is organized by subject:

- `algebra/` - Group theory, rings, fields
- `calculus/` - Integration, differentiation, limits
- `real analysis/` - Sequences, series, continuity
- `complex-analysis/` - Complex functions, contour integration
- `differential-equations/` - ODEs, PDEs, solutions
- `linear-algebra/` - Matrices, vector spaces
- `probability-and-statistics/` - Distributions, inference
- And more...

## Features Overview

### Structured Mathematical Content

Use semantic markup for mathematical content:

```markdown
:::theorem "Fundamental Theorem of Calculus"
If $f$ is continuous on $[a,b]$, then...
:::

:::proof
By the mean value theorem...
:::
```

Supported block types:
- `definition` - Mathematical definitions
- `theorem` - Main theorems
- `lemma` - Supporting lemmas
- `proposition` - Propositions
- `corollary` - Corollaries
- `proof` - Proofs (auto-adds QED symbol)
- `example` - Examples and applications
- `remark` - Additional remarks
- `note` - Important notes
- `intuition` - Intuitive explanations
- `exercise` - Practice problems
- `solution` - Solutions to exercises

### Interactive Demonstrations

Embed interactive HTML/JavaScript demos:

```markdown
{% include_relative demo.html %}
```

Features:
- Fullscreen viewing capability
- Dark mode support
- Mobile responsive
- P5.js integration for mathematical visualizations

### Wiki-style Links

Cross-reference content with resilient links that survive file moves:

```markdown
[[groups]]                    # Links to algebra/groups
[[Link Text|custom-slug]]     # Custom link text
[[section/slug]]              # Section-specific links
```

**Benefits:**
- Resilient to file moves (uses slugs, not file paths)
- No URL encoding needed
- No file extensions to manage
- Cleaner markdown syntax

**How it works:**
1. First checks if slug contains a section (e.g., `algebra/groups`)
2. If no section specified, searches current section first
3. Then searches all sections for matching slug
4. Creates broken link indicator if not found

**Examples:**
```markdown
# Instead of this:
[Real Numbers](/mathnotes/real%20analysis/real-numbers)
[Groups](../algebra/groups.html)

# Use this:
[[real-numbers]]
[[groups]]
[[Group Theory Basics|groups]]  # Custom text
```

### LaTeX Math Support

Full MathJax integration:

```markdown
Inline math: $E = mc^2$

Display math:
$$\int_0^1 x^2 dx = \frac{1}{3}$$
```

## Configuration

### Environment Variables

- `FLASK_ENV` - Set to `development` for dev mode
- `FLASK_DEBUG` - Set to `1` to enable debug mode

### Static File Caching

Smart caching with automatic development detection:

**Development Mode** (localhost):
- All static files: `no-cache, no-store, must-revalidate`
- Content pages: No cache headers

**Production Mode**:
- CSS/JS files: 1 hour cache
- Images: 1 day cache  
- Fonts: 1 day cache
- Content pages: No cache headers

Development automatically detected via:
- `app.debug = True`
- `FLASK_ENV=development`
- `FLASK_DEBUG=1`
- `localhost` or `127.0.0.1` in hostname

### Security

Comprehensive security headers applied:

- **Content Security Policy** with nonces
- **HSTS** with preload and subdomain inclusion
- **Cross-Origin policies** for isolation
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: enabled
- **Referrer-Policy**: strict-origin-when-cross-origin

## Deployment

### Production Deployment

```bash
# Using Gunicorn (recommended)
gunicorn --bind 0.0.0.0:5000 --workers 4 wsgi:application

# Using Docker
docker build -t mathnotes .
docker run -p 5000:5000 mathnotes
```

### Fly.io Deployment

The application is configured for deployment to fly.io:

```bash
flyctl deploy
```

## URL System & Permalinks

### Canonical URLs

Pages use stable URLs based on slugs rather than file paths:

```yaml
---
title: "Introduction to Group Theory"
slug: group-theory-intro        # Optional custom slug
description: "Brief description for SEO"
---
```

**URL Generation:**
- Default: `/mathnotes/section/title-as-slug`
- Custom: `/mathnotes/section/custom-slug`
- Automatic redirect from file-based URLs

### Redirects

Preserve old URLs when moving or renaming content:

```yaml
---
title: "Integration Strategies"
slug: integration-techniques
redirect_from:
  - calculus/integration
  - calculus/old-integration-page
---
```

All listed URLs will redirect (301) to the canonical URL.

### SEO Features

- **Meta Descriptions**: Custom or auto-generated from content
- **Canonical URLs**: Proper canonical meta tags
- **Sitemap Generation**: Automatic XML sitemap
- **URL Structure**: Clean, meaningful URLs

### Best Practices

1. **Choose descriptive slugs**: lowercase, hyphens, meaningful
2. **Always add redirects**: when moving or renaming files
3. **Keep slugs stable**: avoid changing once published
4. **Use descriptions**: for better search engine results

## Development

### Entry Points

- **`wsgi.py`** - Production WSGI entry point for Gunicorn/uWSGI
- **`run.py`** - Development server with debug mode

### Adding Content

1. Create markdown files in appropriate subject directories
2. Use frontmatter for metadata:
   ```yaml
   ---
   title: "My Mathematical Topic"
   description: "Brief description"
   slug: custom-url-slug
   ---
   ```
3. Use structured math blocks for theorems, proofs, etc.
4. Add interactive demos as HTML files

### File Movement Protocol

When moving or renaming files:

1. Note the current canonical URL
2. Add `redirect_from` to frontmatter:
   ```yaml
   redirect_from: [old/path, another/old/path]
   ```
3. Test that redirects work

### Testing

```bash
# Docker Compose (recommended for consistency)
docker-compose up --build

# Direct Python (requires local dependencies)
python run.py

# Import as package
python -c "from mathnotes import create_app; app = create_app()"
```

## Contributing

1. Use Docker for development to ensure consistency
2. Follow existing code organization patterns
3. Use structured math blocks for mathematical content
4. Include interactive demos where helpful
5. Test with both light and dark modes
6. Ensure mobile responsiveness

## Technology Stack

- **Backend**: Flask 3.0 with Python 3.11
- **Templating**: Jinja2
- **Markdown**: Python-Markdown with extensions
- **Math**: MathJax 3 for LaTeX rendering
- **Interactive**: P5.js for visualizations
- **Styling**: CSS with custom properties (dark mode)
- **Security**: CSP, HSTS, and comprehensive headers
- **Deployment**: Docker, Gunicorn, Fly.io

## License

All content and code are the property of Jason Hobbs. All rights reserved.

## Links

- **Live Site**: https://www.lacunary.org
- **Source**: This repository contains the complete application

---

*Version controlled with git and deployed via GitHub Actions to fly.io*