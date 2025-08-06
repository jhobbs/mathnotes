# Static Site Deployment Plan

## Overview
Convert the Flask-based mathnotes application into a fully static site that can be served by nginx without requiring a Python runtime.

## Architecture

### Build Phase
1. **Crawl all routes**: Use a Python script to discover and render all pages
2. **Generate HTML**: Save each Flask-rendered page as static HTML
3. **Build Vite assets**: Compile TypeScript/JavaScript and CSS
4. **Copy static assets**: Include images, fonts, and other static files
5. **Generate sitemap**: Create sitemap.xml for SEO

### Serving Phase
- nginx serves all content from `/usr/share/nginx/html`
- Pre-rendered HTML pages with proper directory structure
- Static assets with long cache headers
- 404 handling for missing pages

## Implementation Strategy

### 1. Static Site Generator (`scripts/build_static.py`)
- Start Flask app in a special build mode
- Crawl all markdown files to discover routes
- For each route:
  - Make internal request to Flask
  - Save rendered HTML to output directory
  - Preserve URL structure (e.g., `/mathnotes/algebra/groups` → `mathnotes/algebra/groups/index.html`)

### 2. Asset Building
- Run Vite build for production assets
- Copy built assets to static output
- Update asset paths in HTML if needed

### 3. Docker Build Process (`Dockerfile`)
- Multi-stage build:
  - Stage 1: Python environment to run Flask and generate HTML
  - Stage 2: Node environment to build Vite assets
  - Stage 3: nginx with only the generated static files

### 4. nginx Configuration
- Serve static files efficiently
- Proper MIME types for all content
- Cache headers for assets
- Fallback 404 page
- Security headers (CSP already in HTML)

### 5. Docker Compose (`docker-compose.yml`)
- Simple nginx container
- Volume mapping for testing
- Production-ready configuration

## File Structure

```
/static-build/              # Generated static site
├── index.html             # Homepage
├── mathnotes/             # Content pages
│   ├── algebra/
│   │   └── groups/
│   │       └── index.html
│   └── ...
├── static/                # Static assets
│   ├── dist/             # Vite build output
│   ├── css/
│   ├── js/
│   └── images/
└── sitemap.xml           # Generated sitemap
```

## Benefits
- No Python runtime required in production
- Faster page loads (no server-side rendering)
- Better caching and CDN compatibility
- Reduced server resources
- Improved security (no dynamic code execution)

## Considerations
- Build time will increase (need to render all pages)
- Updates require full rebuild
- Search functionality would need client-side implementation
- No server-side redirects (handle with nginx rules)