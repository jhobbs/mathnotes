# Flask Removal Plan

## Overview
Remove Flask from the static site generator, keeping only the essential components: Jinja2 for templating and a simple URL-to-file mapping system for generating static HTML files.

## Current Flask Dependencies

### Core Components Being Used
- **Jinja2 Templating**: 8 templates with inheritance and context variables
- **URL Routing**: 11+ routes mapping URLs to handler functions
- **Context Processors**: 6 processors injecting template variables
- **url_for()**: Used throughout templates for URL generation
- **Test Client**: Makes internal HTTP requests during static generation
- **Request Context**: Environment detection (dev vs prod)
- **Security Headers**: After-request handlers for CSP and other headers

### What We Actually Need
1. **Jinja2**: Template rendering with variable injection
2. **URL Mapping**: Path to handler function mapping
3. **Context Building**: Template variables (year, version, base_url, etc.)
4. **URL Generation**: Cross-referencing between pages
5. **Static File Generation**: Render templates to HTML files

## Proposed Architecture

### 1. Direct Jinja2 Setup
```python
# generator.py
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path

class StaticSiteGenerator:
    def __init__(self, template_dir='templates', output_dir='output'):
        self.env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=select_autoescape(['html', 'xml']),
            trim_blocks=True,
            lstrip_blocks=True
        )
        self.output_dir = Path(output_dir)
        self.routes = {}
        self.global_context = {}
```

### 2. Simple Route Registration
```python
# Instead of Flask's @app.route decorator
class Router:
    def __init__(self):
        self.routes = {}
        
    def add_route(self, path_pattern, handler):
        """Register a path pattern with its handler function"""
        self.routes[path_pattern] = handler
        
    def match(self, path):
        """Match a path to its handler and extract parameters"""
        # Simple pattern matching without Flask's complexity
        for pattern, handler in self.routes.items():
            if params := self._match_pattern(pattern, path):
                return handler, params
        return None, None
```

### 3. URL Generation Without Flask
```python
# url_utils.py
class URLGenerator:
    def __init__(self, routes):
        self.routes = routes
        self.base_url = ''
        
    def url_for(self, endpoint, **kwargs):
        """Generate URL for an endpoint"""
        # Simple endpoint to URL mapping
        if endpoint == 'static':
            return f"/static/{kwargs.get('filename', '')}"
        elif endpoint == 'page':
            return f"/mathnotes/{kwargs.get('path', '')}"
        # Add more mappings as needed
        return '/'
```

### 4. Context Building
```python
# context.py
from datetime import datetime
import subprocess

def build_global_context():
    """Build context variables for all templates"""
    return {
        'year': datetime.now().year,
        'version': get_version(),
        'base_url': '',  # Always relative for static sites
        'tooltip_data': load_tooltip_data(),
        'assets': load_asset_manifest(),
    }

def get_version():
    """Get version from git or Docker"""
    try:
        return subprocess.check_output(
            ['git', 'describe', '--tags', '--always'],
            text=True
        ).strip()
    except:
        return 'dev'
```

### 5. Page Rendering Pipeline
```python
# render.py
class PageRenderer:
    def __init__(self, generator, url_mapper, block_index):
        self.generator = generator
        self.url_mapper = url_mapper
        self.block_index = block_index
        
    def render_page(self, path):
        """Render a single page"""
        # Get content from markdown
        content = self.process_markdown(path)
        
        # Build page context
        context = {
            **self.generator.global_context,
            'content': content,
            'title': extract_title(content),
            'path': path,
        }
        
        # Render template
        template = self.generator.env.get_template('page.html')
        return template.render(**context)
        
    def render_all(self):
        """Render all pages to static files"""
        for path in self.url_mapper.get_all_paths():
            html = self.render_page(path)
            output_path = self.path_to_file(path)
            output_path.write_text(html)
```

### 6. Static Generation Script
```python
# build_static.py
#!/usr/bin/env python3

def main():
    # Initialize components
    generator = StaticSiteGenerator()
    url_mapper = URLMapper('content')
    block_index = BlockIndex()
    renderer = PageRenderer(generator, url_mapper, block_index)
    
    # Build global context
    generator.global_context = build_global_context()
    
    # Register URL generator in Jinja2 globals
    generator.env.globals['url_for'] = URLGenerator(router.routes).url_for
    
    # Process all markdown files
    for md_file in Path('content').rglob('*.md'):
        url_mapper.add_file(md_file)
        block_index.index_file(md_file)
    
    # Render all pages
    renderer.render_all()
    
    # Generate special pages
    generate_sitemap(url_mapper)
    generate_index_page()
    generate_demo_viewer()
    
    # Copy static assets
    copy_static_assets()

if __name__ == '__main__':
    main()
```

## Migration Steps

### Phase 1: Create Core Components
1. **Standalone Jinja2 environment** with file system loader
2. **Simple router class** for URL pattern matching
3. **URL generator** to replace Flask's url_for()
4. **Context builder** for template variables

### Phase 2: Convert Routes
1. Extract route handlers from `routes.py` to standalone functions
2. Remove Flask decorators and request dependencies
3. Convert handlers to accept context dict instead of Flask request

### Phase 3: Update Templates
1. Replace Flask-specific template functions if any
2. Ensure url_for() calls work with new implementation
3. Update any Flask-specific template variables

### Phase 4: Replace Static Generation
1. Remove Flask test client usage from `build_static.py`
2. Direct function calls instead of HTTP request simulation
3. Simplify URL to file path conversion

### Phase 5: Update Components
1. **URLMapper**: Remove Flask dependencies
2. **MarkdownProcessor**: Ensure works without Flask context
3. **BlockIndex**: Should already be Flask-independent
4. **Security headers**: Convert to meta tags in HTML templates

### Phase 6: Testing
1. Update tests to work without Flask app
2. Direct testing of rendering functions
3. Verify all pages generate correctly

## Benefits

### Simplicity
- **Fewer dependencies**: Just Jinja2, Markdown, and standard library
- **Clearer code flow**: Direct function calls, no magic
- **Easier debugging**: No request context or middleware layers

### Performance
- **Faster builds**: No HTTP request overhead
- **Less memory**: No Flask app instance or request contexts
- **Quicker startup**: Minimal initialization

### Maintenance
- **Less abstraction**: Direct control over rendering pipeline
- **Simpler testing**: Test functions directly without app context
- **Clearer dependencies**: Explicit rather than implicit

## Potential Challenges

### URL Generation
- Need to maintain URL consistency across templates
- Manual implementation of URL patterns and parameter substitution

### Context Management
- No automatic context processor injection
- Need explicit context passing to templates

### Asset Management
- No Flask-Static integration
- Need custom asset URL generation with cache busting

### Development Workflow
- No built-in dev server
- Need file watcher for regeneration
- Could use nginx locally or just open HTML files directly

## Implementation Order

1. **Create minimal proof of concept** with single page rendering
2. **Port URL mapping and routing** logic
3. **Convert context processors** to explicit functions
4. **Update templates** for new url_for()
5. **Migrate all route handlers** to standalone functions
6. **Update build script** for new architecture
7. **Remove Flask** from requirements
8. **Update Docker build** process
9. **Update documentation** and tests

## File Structure After Migration

```
mathnotes/
├── generator/
│   ├── __init__.py
│   ├── core.py          # StaticSiteGenerator class
│   ├── router.py        # URL routing without Flask
│   ├── context.py       # Context building functions
│   ├── renderer.py      # Page rendering logic
│   └── urls.py          # URL generation utilities
├── processors/
│   ├── markdown.py      # Markdown processing (unchanged)
│   ├── blocks.py        # Block indexing (unchanged)
│   └── urls.py          # URL mapping (simplified)
├── templates/           # Jinja2 templates (minimal changes)
├── content/            # Markdown files (unchanged)
├── static/             # Assets (unchanged)
├── build_static.py     # Main build script (simplified)
└── requirements.txt    # Just Jinja2, Markdown, etc.
```

## Estimated Timeline

- **Week 1**: Core components and proof of concept
- **Week 2**: Route conversion and template updates
- **Week 3**: Full migration and testing
- **Week 4**: Documentation and deployment updates

This migration will result in a simpler, more maintainable static site generator that does exactly what's needed without the overhead of a web framework designed for serving HTTP requests.