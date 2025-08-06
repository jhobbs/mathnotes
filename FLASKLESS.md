# Flask-less Static Site Generation Architecture

## Overview

This document describes the architecture for generating the Mathnotes static site without Flask. The new system uses Jinja2 directly for templating and a lightweight custom framework for URL routing and page rendering.

## Why Remove Flask?

Flask is a web application framework designed for handling HTTP requests and responses. Since we only use it as a build tool to generate static HTML files (never serving actual HTTP requests in production), Flask introduces unnecessary complexity and dependencies:

- **Overhead**: Flask's request/response cycle, middleware, and context management aren't needed for static generation
- **Dependencies**: Flask brings in Werkzeug, Click, and other packages we don't use
- **Complexity**: Using Flask's test client to simulate HTTP requests for static generation is indirect and harder to debug
- **Performance**: Direct template rendering is faster than simulating HTTP requests

## Architecture Components

### 1. Core Generator (`generator/core.py`)
- **StaticSiteGenerator**: Main class that manages Jinja2 environment
- Handles template rendering with direct Jinja2 (no Flask wrapper)
- Manages output file writing
- Provides global template context

### 2. URL Router (`generator/router.py`)
- **Router**: Simple pattern matching for URL generation
- Converts Flask-style patterns (`/page/<path:slug>`) to regex
- Used primarily for `url_for()` function in templates
- No actual HTTP routing - just URL pattern management

### 3. URL Generator (`generator/urls.py`)
- **URLGenerator**: Replacement for Flask's `url_for()`
- Maps endpoint names to URL patterns
- Handles special endpoints (static, serve_content, definition_index, etc.)
- Maintains trailing slash consistency

### 4. Context Builder (`generator/context.py`)
- Builds global template context (replaces Flask context processors)
- Manages asset URLs with manifest support for cache-busted filenames
- Provides version info, dates, and configuration
- Handles tooltip data for mathematical references

### 5. Page Renderer (`generator/renderer.py`)
- **PageRenderer**: Orchestrates page rendering
- Renders markdown files to HTML
- Handles special pages (homepage, mathnotes index, 404)
- Manages template context per page

### 6. Site Builder (`generator/builder.py`)
- **SiteBuilder**: Main orchestration class
- Coordinates all components
- Manages build process workflow
- Handles static asset copying (including content images)
- Generates sitemap and special pages

### 7. Build Script (`scripts/build_static_simple.py`)
- Minimal entry point - just 45 lines
- Parses command-line arguments
- Creates SiteBuilder instance
- Calls `builder.build()`

## Build Process Flow

```
1. Initialize Components
   ├── Create StaticSiteGenerator with Jinja2 environment
   ├── Build URL mappings from markdown files
   ├── Index all mathematical blocks for cross-references
   └── Setup markdown processor

2. Build Global Context
   ├── Load asset manifest for cache-busted URLs
   ├── Generate tooltip data from block index
   └── Set global template variables

3. Render Pages
   ├── Render homepage (homepage.html → index.html)
   ├── Render mathnotes index (index.html → mathnotes/index.html)
   ├── Render all markdown content pages
   ├── Generate sitemap.xml
   ├── Render special pages (demos, definitions, 404)
   └── Each page rendered directly without HTTP simulation

4. Copy Static Assets
   ├── Copy /static directory (CSS, JS, fonts)
   ├── Copy favicon.ico and robots.txt
   └── Copy all images from content directories (maintaining structure)

5. Output Structure
   /static-build/
   ├── index.html                 # Main homepage
   ├── mathnotes/
   │   ├── index.html            # Mathnotes index
   │   ├── algebra/              # Content sections
   │   ├── analysis/
   │   └── ...
   ├── static/                   # CSS, JS, fonts
   ├── demos/index.html          # Demo viewer
   └── sitemap.xml              # SEO sitemap
```

## Key Differences from Flask Version

### Direct Template Rendering
**Flask approach:**
```python
with app.test_client() as client:
    response = client.get('/mathnotes/some-page')
    html = response.data
```

**New approach:**
```python
html = renderer.render_markdown_page('content/some-page.md')
```

### Context Management
**Flask approach:**
```python
@app.context_processor
def inject_year():
    return {"current_year": datetime.now().year}
```

**New approach:**
```python
context = build_global_context()  # All context built explicitly
generator.add_global('current_year', context['current_year'])
```

### URL Generation
**Flask approach:**
```python
url_for('serve_content', filepath='algebra/groups')
# Flask handles endpoint mapping internally
```

**New approach:**
```python
url_gen.url_for('serve_content', filepath='algebra/groups/')
# Simple dictionary lookup, returns: /mathnotes/algebra/groups/
```

## Benefits of New Architecture

1. **Simplicity**: ~500 lines of core code vs Flask's thousands
2. **Speed**: Direct rendering without HTTP overhead
3. **Clarity**: Explicit data flow, no magic
4. **Maintainability**: Fewer abstractions to understand
5. **Minimal Dependencies**: Just Jinja2, Markdown, and standard library
6. **Debugging**: Direct function calls are easier to trace

## Docker Integration

The Dockerfile remains largely unchanged:
1. Build assets with Node/esbuild
2. Install Python dependencies (including Jinja2)
3. Run `build_static_simple.py` to generate site
4. Copy output to nginx container
5. Serve static files with nginx

## Migration Path

To fully remove Flask:

1. ✅ Create generator modules (core, router, renderer, etc.)
2. ✅ Implement SiteBuilder to orchestrate generation
3. ✅ Create minimal build script
4. ✅ Test with Docker build
5. ✅ Fix URL trailing slashes and asset paths
6. ⏳ Update production Dockerfile to use new script
7. ⏳ Remove Flask from requirements.txt
8. ⏳ Update CI/CD pipelines

## Testing

The new architecture is easier to test:
- Direct unit tests for each component
- No need for Flask app context in tests
- Simpler mocking (no HTTP layer)
- Faster test execution

## Future Enhancements

The modular architecture makes it easy to add:
- Incremental builds (only regenerate changed pages)
- Parallel page rendering
- Plugin system for custom processors
- Alternative template engines
- Static site optimizations (HTML minification, image optimization)

## Summary

By removing Flask, we've created a simpler, faster, and more maintainable static site generator that does exactly what we need - transforms markdown and templates into static HTML - without the overhead of a web framework designed for dynamic applications.