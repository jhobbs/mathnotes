# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Mathnotes is a Flask application serving mathematics notes with interactive demonstrations. The application features:
- Structured mathematical content with semantic markup (theorems, proofs, definitions)
- TypeScript/p5.js interactive demos built with Vite
- Wiki-style cross-references using `[[slug]]` syntax
- Dark mode support with automatic detection
- Comprehensive security headers including CSP with nonces
- Modern CSS system with PostCSS, CSS custom properties, and hot module replacement

## Security and Best Practices

**Demo Crawler Guidelines**:
* do not every read the screenshots from the demo crawler directly, only use --ask

## Development Guidelines

### Coding Best Practices

* Don't check types after every single change
* Do not hardcode colors - always use CSS custom properties from the theme (e.g., `var(--color-primary)`, `var(--space-md)`)
* CSS changes in development have hot module replacement - no need to restart the server
* **NEVER use inline styles** - Always use CSS classes instead. The codebase uses a modern CSS system with:
  - CSS Modules for component-scoped styles (e.g., `import styles from './Component.module.css'`)
  - Global styles in `/styles/` directory
  - Theme variables defined in `/styles/theme.css`
  - All inline styles have been removed - maintain this standard

## Common Commands

### Running Tests
```bash
# Run all tests
./run_tests.sh
```

### Development Server
```bash
# Integrated development (Flask + Vite HMR) - RECOMMENDED
docker-compose -f docker-compose.dev.yml up

# Build and run with production docker
docker-compose up --build
```

### Frontend Development
```bash
# Test a specific page for JavaScript errors
./scripts/crawl-dev.sh --single-page "http://web-dev:5000/mathnotes/page-slug"

# Test framework changes by crawling entire site
./scripts/crawl-dev.sh "http://web-dev:5000"

# Check TypeScript type errors in the Vite container
docker-compose -f docker-compose.dev.yml exec vite npm run type-check
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
./scripts/crawl-demos.py -d pendulum --viewport mobile

# Get AI description of a demo (useful for documentation)
./scripts/crawl-demos.py -d pendulum --describe
./scripts/crawl-demos.py -d pendulum --describe --viewport mobile  # Analyze mobile version

# Check if a demo meets the standards in DEMO-STANDARD.md
./scripts/crawl-demos.py -d pendulum --check-standards

# Check if a demo scales properly from desktop to mobile
./scripts/crawl-demos.py -d pendulum --check-scaling

# Check if a demo has good dark mode handling
./scripts/crawl-demos.py -d pendulum --check-dark-mode


# Ask specific questions about demos
./scripts/crawl-demos.py -d diagonalization --ask "is the widget flombulating properly in @\$BASE_PATH?"

# Compare demo container to full page (check for layout issues)
./scripts/crawl-demos.py -d neighborhood --ask "compare @\$BASE_PATH to @\$FULL_PATH. is the demo area visible in the full page?"
```

When implementing or documenting demos, use these commands to:
- Get textual descriptions of visual demos for accessibility
- Verify demos render correctly without scrolling issues
- Document what each demo demonstrates
- Check for visual bugs or layout problems

### Content Management
```bash
# Move files with automatic redirect handling
./scripts/move_file.sh old/path.md new/path.md
```

## Architecture Overview

### Request Flow
1. **URL Resolution** (`url_mapper.py`): Maps slugs to file paths, handles redirects
2. **Markdown Processing** (`markdown_processor.py`): 
   - Protects math expressions from markdown parsing
   - Processes wiki-style links `[[slug]]`
   - Handles `{% include_demo %}` tags
3. **Structured Math** (`structured_math.py`): 
   - Parses `:::type` blocks (definition, theorem, proof, etc.)
   - Builds global index for cross-references
   - Handles `@label` references and `@@label` embeds
4. **Security** (`security.py`): Applies CSP nonces and security headers
5. **Rendering**: Flask/Jinja2 templates with MathJax for LaTeX

### Key Architectural Decisions

1. **URL System**: Content uses slug-based canonical URLs (`/mathnotes/section/slug`) with automatic redirects from file-based paths. This allows content reorganization without breaking links.

2. **Math Processing Pipeline**: 
   - Math expressions are protected before markdown parsing
   - Structured blocks are parsed and indexed globally
   - Cross-references resolved using the global index
   - MathJax handles final LaTeX rendering client-side

3. **Demo System**: TypeScript demos are registered in `demos-framework/src/main.ts` and loaded dynamically. Vite handles bundling with code splitting.

4. **CSP Implementation**: Per-request nonces ensure inline scripts are secure. All demos must use event listeners instead of inline handlers.

5. **Development/Production Detection**: Automatic via localhost detection, affects caching headers and asset loading.

6. **Modern CSS System**: 
   - PostCSS for modern CSS features (nesting, custom media queries)
   - CSS custom properties for theming (colors, spacing, typography)
   - CSS entry point at `styles/main.css` processed by Vite
   - Hot module replacement in development for instant style updates
   - Theme variables defined in `styles/theme.css`, utilities in `styles/utilities.css`

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
- CSP-compliant (no inline scripts)

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

### CSP Compliance
- All inline scripts need `nonce="{{ csp_nonce }}"`
- No inline event handlers (onclick, onload)
- Use `addEventListener` and data attributes
- Demos must be CSP-compliant

### URL Best Practices
- Choose stable, descriptive slugs
- Always add redirects when moving files
- Use wiki-style links for resilience: `[[slug]]`
- Canonical URLs adapt automatically for dev/prod

## Configuration

### Environment Detection
Development mode auto-detected via:
- `localhost` or `127.0.0.1` in URL
- `FLASK_ENV=development`
- `FLASK_DEBUG=1`
- `app.debug=True`

### Vite Configuration
- Base path: Always `/static/dist/` in dev and prod
- Dev: TypeScript served directly from `http://localhost:5173`
- Prod: Bundled assets served by Flask
- Proxy config handles routing between Vite and Flask
- CSS is loaded as a Vite entry point, enabling HMR in development

### Python Dependencies
- Python 3.11+ required
- Key packages: Flask 3.0.0, Markdown 3.5.1, python-frontmatter 1.0.1
- Dev tools: pytest, black, flake8, mypy, tox

## Deployment

### GitHub Actions Pipeline
1. Push to main triggers build
2. Multi-platform Docker images (amd64, arm64)
3. Push to ghcr.io registry
4. Automatic deployment to Fly.io

### Production URLs
- Primary: https://www.lacunary.org

## Troubleshooting

### Common Issues
- **CSP Errors**: Check for missing nonces on inline scripts
- **404 Errors**: Use `/sitemap.xml` to find correct URLs
- **Dark Mode**: Uses CSS `@media (prefers-color-scheme)`, not classes
- **Test Failures**: Run in Docker for consistency
- **Permission Errors**: Clean with `rm -rf htmlcov .pytest_cache`

### Debug Commands
```bash
# Verify demo registration
grep -r "registerDemo" mathnotes/demos-framework/src/main.ts

# Check for CSP violations
# Open browser console and look for CSP errors
```

## Debug Techniques

### Console Probe Debugging
- You can use console.log("[probe] ...") to debug JavaScript/CSS/DOM issues in conjunction with the page crawler
- Example: `console.log('[probe] Copyright display:', getComputedStyle(element).display)`
- Run with: `./scripts/crawl-dev.sh --single-page "http://web-dev:5000/demo-viewer#demo-name" 2>&1 | grep "\[probe\]"`

### Demo Screenshot Analysis
The demo crawler (`./scripts/crawl-demos.py`) supports AI-powered visual analysis:

```bash
# Check demo scaling between desktop and mobile
./scripts/crawl-demos.py -d demo-name --check-scaling

# Ask specific questions about screenshots using placeholders
./scripts/crawl-demos.py -d demo-name --viewport mobile --ask "Look at $FULL_PATH. Is the footer readable?"

# Available placeholders:
# - $BASE_PATH: The base demo screenshot
# - $FULL_PATH: Full page screenshot including surrounding content
# - $CANVAS_PATH: Just the canvas area

# Enable verbose mode to see OpenAI prompts
./scripts/crawl-demos.py -v -d demo-name --ask "question"
```

### Mobile-Specific Testing
```bash
# Test mobile viewport only
./scripts/crawl-demos.py -d demo-name --viewport mobile

# Common mobile issues to check:
# - Text breaking awkwardly (use $FULL_PATH to see footer/header)
# - Canvas elements being cropped
# - Interactive controls stacking properly
# - Arrow/visual element visibility at smaller sizes
```

### CSS Development
With the modern CSS system:
1. **Main CSS entry**: `styles/main.css` imports theme and utilities
2. **Theme variables**: Edit `styles/theme.css` for colors, spacing, typography
3. **PostCSS features**: Use CSS nesting, custom media queries, modern color functions
4. **Hot module replacement**: CSS changes appear instantly in development
5. **CSS Modules**: Available for component-scoped styles (e.g., `DemoControls.module.css`)

### Responsive Scaling Best Practices
When implementing responsive demos:
1. Scale constants based on canvas size:
   ```typescript
   private updateScaling(p: p5): void {
     const scaleFactor = Math.min(p.width, p.height) / baseSize;
     this.RADIUS = baseRadius * scaleFactor;
     this.ARROW_SIZE = Math.max(minSize, baseArrowSize * scaleFactor);
   }
   ```

2. Use different values for mobile:
   ```typescript
   const strokeWeight = p.width < 768 ? 4 : 3; // Thicker on mobile
   const minArrowScalar = p.width < 768 ? 25 : 15; // Larger minimum on mobile
   ```

3. Handle resize events:
   ```typescript
   protected onResize(p: p5, size: CanvasSize): void {
     this.updateScaling(p);
   }
   ```