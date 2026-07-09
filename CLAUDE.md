# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Mathnotes is a static site generator that renders mathematics notes with interactive demonstrations into static HTML files served by nginx. The application features:
- Content authored in a LaTeX dialect (`content/**/*.tex`) — structured blocks are amsthm-style environments (`\begin{theorem}`, `\begin{proof}`, ...); see [latex/README.md](./latex/README.md) for the dialect and how to compile a page to PDF locally
- Structured mathematical content with semantic markup (theorems, proofs, definitions)
- TypeScript interactive demos using p5.js for 2D/WebGL graphics and Plotly.js for 3D scientific visualizations
- Cross-references via `\dref{label}` (blocks) and `\pagelink{slug}` (pages)
- Dark mode support with automatic detection
- Comprehensive security headers with Content Security Policy
- Modern CSS system with PostCSS, CSS custom properties, and hot module replacement

**Content pipeline**: `.tex` files are parsed directly by `mathnotes/latex_processor.py` into a typed `PageDoc` (prose HTML segments plus `MathBlock` trees) — there is no intermediate markdown dialect. `mathnotes/block_index.py` scans every content file, builds the global cross-file label index, and pre-renders each block's HTML; `mathnotes/page_renderer.py` assembles a page's `PageDoc` into final HTML, resolving the `\dref`/`\pagelink`/`\dembed` placeholder elements `latex_processor.py` emits against that index via `mathnotes/ref_resolver.py`. Unsupported LaTeX constructs are loud build errors with file:line — extend the dialect deliberately in `latex_processor.py`, never silently. Content is 100% `.tex`.

## Security and Best Practices

**Demo Crawler Guidelines**:
* do not every read the screenshots from the demo crawler directly, only use --ask
* Hey - you're not supposed to look at screenshots yourself. Only use --ask to do that.

## Development Guidelines

### Coding Best Practices

* Don't check types after every single change
* For styling guidelines, see [STYLE.md](./STYLE.md)
* we never put styles directly in typescript
* You don't need to manually rebuild everytime we change code in dev mode, unless you're changing the docker stuff itself.

### Common Commands

### Running Tests
Python tests are standalone assert scripts (no pytest in the container); run them via stdin into the dev builder container:
```bash
docker exec -i mathnotes-static-builder python3 - < test/test_structured_math.py
docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py
docker exec -i mathnotes-static-builder python3 - < test/test_ref_resolver.py
docker exec -i mathnotes-static-builder python3 - < test/test_latex_integration.py
docker exec -i mathnotes-static-builder python3 - < test/test_reference_snippets.py
docker exec -i -w /app mathnotes-static-builder python3 - < test/test_cache_invalidation.py
docker exec -i mathnotes-static-builder python3 - < test/test_watcher.py
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
# 1. Generator crawls all .tex content
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

# IMPORTANT: Check for TypeScript build errors in Docker
# When demos don't appear or features don't work, ALWAYS check:
docker ps -a | grep static-builder  # Check if container exited
docker logs mathnotes-static-builder  # See TypeScript errors and build logs

# If the static-builder container has exited with errors:
# 1. Fix the TypeScript errors
# 2. Restart the builder: docker restart mathnotes-static-builder
# 3. Watch the logs: docker logs -f mathnotes-static-builder
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
When moving/renaming a content file: `git mv` it, then update any `\pagelink{...}` or hard links that referenced the old slug (URLs derive from the path unless frontmatter/`\slug{}` overrides). Block labels travel with the file, so `\dref` references keep working.

## Architecture Overview

### Static Generation Pipeline

1. **Core Generator** (`mathnotes/sitegenerator/core.py`): Manages Jinja2 environment and template rendering
2. **URL Router** (`mathnotes/sitegenerator/router.py`): Simple pattern matching for URL generation
3. **Page Registry** (`mathnotes/sitegenerator/pages.py`): Self-contained per-page rendering units (Flask/Django-view-like)
4. **Site Builder** (`mathnotes/sitegenerator/builder.py`): Main orchestration for the entire build process
5. **Build Script** (`scripts/build_static_simple.py`): Minimal entry point

#### Processing Components
1. **URL Resolution** (`url_mapper.py`): Maps slugs to file paths
2. **LaTeX Parsing** (`latex_processor.py`): parses the `.tex` dialect directly
   with pylatexenc into a typed `PageDoc` (prose HTML plus `MathBlock` trees);
   `content_loader.py` is the single `(metadata, PageDoc)` entry point, cached by mtime
3. **Document Model** (`structured_math.py`):
   - Defines the `MathBlock`/`PageDoc` types
   - Assigns auto-labels, definition synonyms/plurals, and tags (`finalize_blocks`)
   - Renders a block's final card HTML (`render_block_html`)
4. **Block Index** (`block_index.py`):
   - Scans all content files and builds the global label index
   - Builds the reverse-reference index (`reverse_index.py`) for "Referenced by" panels
   - Pre-renders every block's HTML once cross-file references are known
5. **Reference Resolution** (`ref_resolver.py`): resolves the placeholder
   elements `latex_processor.py` emits (`data-dref`, `data-pagelink`,
   `data-dembed`) against the block index and URL mapper
6. **Page Assembly** (`page_renderer.py`): combines a page's prose segments and
   pre-rendered blocks, resolves remaining reference placeholders, and produces
   the final page HTML
7. **Security** (`security.py`): Embeds CSP and security headers in HTML
8. **Rendering**: Jinja2 templates generate static HTML with MathJax for LaTeX
9. **Output**: Complete static site ready for nginx serving

### Key Architectural Decisions

1. **URL System**: Content uses slug-based canonical URLs (`/mathnotes/section/slug`). This allows content reorganization without breaking links.

2. **Math Processing Pipeline**: 
   - `latex_processor.py` parses each `.tex` file's math nodes directly out of
     the LaTeX AST (pylatexenc) and renders them through `render_math()`, the
     single math seam
   - Structured blocks are parsed and indexed globally
   - Cross-references resolved using the global index
   - MathJax handles final LaTeX rendering client-side
   - For detailed explanation of the parsing pipeline, see [PARSING.md](./PARSING.md)

3. **Demo System**: TypeScript demos are registered in `demos-framework/src/main.ts` and loaded dynamically with code splitting. Demos can use:
   - **p5.js** (`P5DemoBase` class): For 2D canvas graphics, WebGL, and creative coding
   - **Plotly.js** (direct `DemoInstance` implementation): For 3D scientific visualizations with built-in camera controls

4. **CSP Implementation**: No inline JavaScript or inline event handlers are permitted. All JavaScript must be in external files to keep content static and cacheable.

5. **Development Mode Detection**: Development server runs only locally for testing. Production always uses pre-generated static files served by nginx.

6. **Modern CSS System**: See [STYLE.md](./STYLE.md) for detailed CSS and styling guidelines

## Important Implementation Details

### Math Rendering Seam
`render_math()` in `latex_processor.py` is the single function every math
node (inline `$...$` and display `\[...\]`) renders through. Because
pylatexenc parses math nodes directly out of the LaTeX AST, there is no
markdown to protect math from — no protection/restoration phases exist.
Swapping the renderer (e.g. MathJax delimiters for build-time MathML) only
requires changing this one function.

### Cross-Reference System
- `\dref{label}` - Links to a block with auto-generated text
- `\dref{type:label}` - Links with type validation (e.g., `\dref{theorem:ftc}`)
- `\dref[Custom text]{label}` - Custom link text
- `\dembed{label}` - Transcludes the entire block content inline
- `\pagelink{slug}` / `\pagelink[Custom text]{slug}` - Links to a page

### Demo Integration
```latex
\includedemo{demo-name}
```
- Demo must be registered in `demos-framework/src/main.ts`
- TypeScript source in `mathnotes/demos/`
- Automatic dark mode support
- CSP-compliant (no inline scripts or event handlers)

**Demo Viewer**: To test any demo in isolation, use the demo viewer:
- Dev: `http://localhost:5000/demos/#demo-name`
- Prod: `https://lacunary.org/demos/#demo-name`
- Supports keyboard navigation (arrow keys) and URL hash for direct linking

**Visualization Library Choices**:
- **p5.js**: Best for 2D canvas graphics, particle systems, cellular automata, WebGL custom shaders
  - Extend `P5DemoBase` class for automatic canvas management and responsive sizing
  - Built-in draw loop and event handling
  - Examples: `game-of-life`, `electric-field`, `pendulum`
- **Plotly.js**: Best for 3D scientific visualizations, vector fields, data plots
  - Implement `DemoInstance` directly
  - Built-in 3D camera controls (rotate, zoom, pan)
  - Native support for 3D arrows (cone traces), meshes, scatter plots
  - Examples: `cross-product`

### File Movement Protocol
When moving/renaming content files:
1. Note the current canonical URL
2. `git mv` the `.tex` file
3. Update any `\pagelink{...}` references to the old slug (see Content Management above)

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
- Update internal links when moving files
- Use `\pagelink{slug}` for page links, which resolves via the URL mapper rather than a hardcoded path
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

### Dependencies

**Python**:
- Python 3.11+ required
- Key packages: Jinja2, pylatexenc, PyYAML
- Dev tools: pytest, black, flake8, mypy, tox

**JavaScript/TypeScript**:
- Node.js 24.x
- TypeScript 5.3+
- Visualization: p5.js, Plotly.js (plotly.js-dist-min)
- Build tools: esbuild, PostCSS

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
```
```
- Don't restart/rebuild docker everytime you change typescript, css, python, etc. We have autorebuild built in.