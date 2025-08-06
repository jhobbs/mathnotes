# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Mathnotes is a static site generator that renders mathematics notes with interactive demonstrations into static HTML files served by nginx. The application features:
- Structured mathematical content with semantic markup (theorems, proofs, definitions)
- TypeScript/p5.js interactive demos with bundled JavaScript
- Wiki-style cross-references using `[[slug]]` syntax
- Dark mode support with automatic detection
- Comprehensive security headers with Content Security Policy
- Modern CSS system with PostCSS, CSS custom properties, and hot module replacement

## Security and Best Practices

**Demo Crawler Guidelines**:
* do not every read the screenshots from the demo crawler directly, only use --ask
* Hey - you're not supposed to look at screenshots yourself. Only use --ask to do that.

## Development Guidelines

### Coding Best Practices

* Don't check types after every single change
* For styling guidelines, see [STYLE.md](./STYLE.md)

## Common Commands

### Running Tests
```bash
# Run all tests
./run_tests.sh
```

### Development Server
```bash
# Development mode (for local testing only)
docker-compose -f docker-compose.dev.yml up
```

### Static Site Generation (Production)
```bash
# Generate static site (the ONLY deployment method)
docker-compose up --build

# Production Docker build process:
# 1. Generator crawls all markdown content
# 2. Jinja2 templates render each page to static HTML
# 3. All assets copied to static output directory
# 4. Sitemap.xml generated for SEO
# 5. nginx serves the static files
```

### Frontend Development
```bash
# Test a specific page for JavaScript errors
./scripts/crawl-dev.sh --single-page "http://web-dev:5000/mathnotes/page-slug"

# Test framework changes by crawling entire site
./scripts/crawl-dev.sh "http://web-dev:5000"

# Check TypeScript type errors
npm run type-check
```

### Demo Screenshots and AI Descriptions
You have to use the venv to run ./scripts/crawl-demos.py

```bash
# Capture screenshots of all demos (both desktop and mobile viewports)
./scripts/crawl-demos.py

# Capture a specific demo
./scripts/crawl-demos.py -d electric-field
./scripts/crawl-demos.py -d game-of-life

# Capture with specific viewport
./scripts/crawl-demos.py --viewport desktop    # Desktop only
./scripts/crawl-demos.py --viewport mobile     # Mobile only
```

For advanced demo testing commands (AI analysis, standards checking, scaling verification, etc.), see [DEBUGGING.md](./DEBUGGING.md#demo-testing-workflow).

### Content Management
```bash
# Move files with automatic redirect handling
./scripts/move_file.sh old/path.md new/path.md
```

## Architecture Overview

### Static Generation Pipeline

1. **Core Generator** (`generator/core.py`): Manages Jinja2 environment and template rendering
2. **URL Router** (`generator/router.py`): Simple pattern matching for URL generation
3. **Page Renderer** (`generator/renderer.py`): Orchestrates page rendering from markdown to HTML
4. **Site Builder** (`generator/builder.py`): Main orchestration for the entire build process
5. **Build Script** (`scripts/build_static_simple.py`): Minimal entry point (~45 lines)

#### Processing Components
1. **URL Resolution** (`url_mapper.py`): Maps slugs to file paths, handles redirects
2. **Markdown Processing** (`markdown_processor.py`): 
   - Protects math expressions from markdown parsing
   - Processes wiki-style links `[[slug]]`
   - Handles `{% include_demo %}` tags
3. **Structured Math** (`structured_math.py`): 
   - Parses `:::type` blocks (definition, theorem, proof, etc.)
   - Builds global index for cross-references
   - Handles `@label` references and `@@label` embeds
4. **Security** (`security.py`): Embeds CSP and security headers in HTML
5. **Rendering**: Jinja2 templates generate static HTML with MathJax for LaTeX
6. **Output**: Complete static site ready for nginx serving

### Key Architectural Decisions

1. **URL System**: Content uses slug-based canonical URLs (`/mathnotes/section/slug`) with automatic redirects from file-based paths. This allows content reorganization without breaking links.

2. **Math Processing Pipeline**: 
   - Math expressions are protected before markdown parsing
   - Structured blocks are parsed and indexed globally
   - Cross-references resolved using the global index
   - MathJax handles final LaTeX rendering client-side

3. **Demo System**: TypeScript demos are registered in `demos-framework/src/main.ts` and loaded dynamically with code splitting.

4. **CSP Implementation**: No inline JavaScript or inline event handlers are permitted. All JavaScript must be in external files to keep content static and cacheable.

5. **Development Mode Detection**: Development server runs only locally for testing. Production always uses pre-generated static files served by nginx.

6. **Modern CSS System**: See [STYLE.md](./STYLE.md) for detailed CSS and styling guidelines

## Important Implementation Details

### Math Content Protection
The markdown processor uses a two-phase approach:
1. **Protection Phase**: Replace `$...$` and `$$...$$` with placeholders
2. **Restoration Phase**: Restore math after markdown conversion
This prevents markdown from interfering with LaTeX syntax.

### Cross-Reference System
- `@label` - Links to a block with auto-generated text
- `@type:label` - Links with type validation (e.g., `@theorem:ftc`)
- `@{Custom text|label}` - Custom link text
- `@@label` - Embeds the entire block content inline

### Demo Integration
```markdown
{% include_demo "demo-name" %}
```
- Demo must be registered in `demos-framework/src/main.ts`
- TypeScript source in `mathnotes/demos/`
- Automatic dark mode support
- CSP-compliant (no inline scripts or event handlers)

### File Movement Protocol
When moving/renaming content files:
1. Note the current canonical URL
2. Add `redirect_from: [old-url]` to frontmatter
3. Test redirect works
4. Or use: `./scripts/move_file.sh old/path.md new/path.md`

## Development Guidelines

### Git Commit Rules
- No "Generated with Claude Code" or AI attribution
- Technical, concise commit messages
- Only commit when explicitly requested ("ship it")
- Pre-commit hook warns about moved/deleted files

### Testing Requirements
- Always test in Docker for consistency
- Use `docker-compose -f docker-compose.dev.yml` for development
- Verify both light and dark modes
- Check browser console for CSP violations
- Test demos on mobile devices

### CSP Compliance and JavaScript Policy
- **NEVER use inline JavaScript** - all JavaScript must be in external files
- **NEVER generate nonces** - we don't need them since we don't use inline scripts
- **No inline event handlers** (onclick, onload, etc.)
- Use `addEventListener` and data attributes instead
- All demos must be CSP-compliant
- This policy keeps our content static and cacheable without per-request processing
- For CSS-specific guidelines, see [STYLE.md](./STYLE.md)

### URL Best Practices
- Choose stable, descriptive slugs
- Always add redirects when moving files
- Use wiki-style links for resilience: `[[slug]]`
- Canonical URLs adapt automatically for dev/prod

## Configuration

### Environment Detection
Development mode auto-detected via:
- `localhost` or `127.0.0.1` in URL
- Development environment variables

### Build Configuration
- Assets served from `/static/dist/` in production
- TypeScript/JavaScript bundled with code splitting
- CSS processed with PostCSS
- For CSS configuration and guidelines, see [STYLE.md](./STYLE.md)

### Python Dependencies
- Python 3.11+ required
- Key packages: Jinja2, Markdown 3.5.1, python-frontmatter 1.0.1
- Dev tools: pytest, black, flake8, mypy, tox

## Deployment

### Static Site Generation and Deployment

1. **Build Phase**: Docker multi-stage build
   - Stage 1: Python generator crawls and renders all content to static HTML using Jinja2 directly
   - Stage 2: Static HTML and assets copied to nginx image (no Python runtime)
   - URL structure preserved (e.g., `/mathnotes/algebra/groups` → `mathnotes/algebra/groups/index.html`)
   - All assets included with proper cache headers
   - sitemap.xml generated for SEO

2. **Production Serving**: nginx only
   - Pure static file serving
   - No Python runtime in production container
   - Pre-rendered HTML for instant page loads
   - Full CDN compatibility
   - Maximum security (no dynamic code execution)

3. **Generated File Structure**:
   ```
   /usr/share/nginx/html/      # Inside nginx container
   ├── index.html             # Homepage
   ├── mathnotes/             # Content pages
   │   ├── algebra/
   │   │   └── groups/
   │   │       └── index.html
   │   └── ...
   ├── static/                # Static assets
   │   ├── dist/             # Bundled JS/CSS
   │   ├── css/
   │   └── images/
   └── sitemap.xml           # Generated sitemap
   ```

### GitHub Actions Pipeline
1. Push to main triggers build
2. Docker build runs static site generation
3. Multi-platform Docker images (amd64, arm64) with nginx
4. Push to ghcr.io registry
5. Automatic deployment to Fly.io

### Production URLs
- Primary: https://lacunary.org

## Debugging and Troubleshooting

For comprehensive debugging techniques, troubleshooting tips, and testing workflows, see [DEBUGGING.md](./DEBUGGING.md).

Key debugging tools available:
- Console probe debugging for JavaScript/CSS/DOM issues
- Demo screenshot analysis with AI-powered visual testing
- Mobile-specific testing and responsive scaling
- JavaScript policy compliance and CSP debugging
- Docker container debugging
```