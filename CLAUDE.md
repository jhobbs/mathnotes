# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Mathnotes is a Flask application serving mathematics notes with interactive demonstrations. The application features:
- Structured mathematical content with semantic markup (theorems, proofs, definitions)
- TypeScript/p5.js interactive demos built with Vite
- Wiki-style cross-references using `[[slug]]` syntax
- Dark mode support with automatic detection
- Comprehensive security headers including CSP with nonces

## Common Commands

### Running Tests
```bash
# Run all tests with coverage
make test

# Run specific test file
pytest test/test_math_utils.py -v

# Run tests in Docker (recommended for consistency)
docker-compose run --rm web pytest

# Run with coverage report
make coverage
./run-tests.sh coverage
```

### Code Quality
```bash
# Format code (Black, 100-char line length)
make format

# Lint code (Flake8)
make lint

# Type checking (mypy in strict mode)
make type

# Run all checks
make check
```

### Development Server
```bash
# Integrated development (Flask + Vite HMR) - RECOMMENDED
docker-compose -f docker-compose.dev.yml up

# Build and run with standard Docker
docker-compose up --build

# Direct Python (requires manual frontend build)
./setup-dev.sh  # One-time setup
python run.py   # or: python -m mathnotes
```

### Frontend Development
```bash
# Build frontend assets for production
make build-frontend

# Development with Vite HMR (integrated with Flask)
make dev-frontend

# Test a specific page for JavaScript errors
./scripts/crawl-dev.sh --single-page "http://web-dev:5000/mathnotes/page-slug"

# Test framework changes by crawling entire site
./scripts/crawl-dev.sh "http://web-dev:5000"
```

### Demo Screenshots and AI Descriptions
```bash
# Capture screenshots of all demos
./scripts/crawl-demos.sh

# Capture a specific demo
./scripts/crawl-demos.sh -d electric-field
./scripts/crawl-demos.sh -d game-of-life

# Get AI description of a demo (useful for documentation)
./scripts/crawl-demos.sh -d pendulum --describe

# Ask specific questions about demos
./scripts/crawl-demos.sh -d diagonalization --ask "what mathematical concept is illustrated in @\$BASE_PATH?"

# Compare demo container to full page (check for layout issues)
./scripts/crawl-demos.sh -d neighborhood --ask "compare @\$BASE_PATH to @\$FULL_PATH. is the demo area visible in the full page?"

# Analyze physics simulations
./scripts/crawl-demos.sh -d electric-field --ask "describe the physics being simulated in @\$BASE_PATH and suggest improvements"
```

When implementing or documenting demos, use these commands to:
- Get textual descriptions of visual demos for accessibility
- Verify demos render correctly without scrolling issues
- Document what each demo demonstrates
- Check for visual bugs or layout problems

### Deployment
```bash
# Deploy via GitHub Actions (automatic on push to main)
git push origin main

# Monitor deployment
./scripts/monitor_deployment.sh

# Check deployment status
flyctl status
flyctl logs
```

### Content Management
```bash
# Check for broken internal links
python3 scripts/link_checker.py

# Move files with automatic redirect handling
./scripts/move_file.sh old/path.md new/path.md

# Check/fix missing redirects
python3 scripts/check_redirects.py --fix

# Find unstructured mathematical definitions
python3 scripts/find_unstructured_definitions.py
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
5. Monitor with `./scripts/monitor_deployment.sh`

### Production URLs
- Primary: https://www.lacunary.org
- Fly.io: https://mathnotes.fly.dev

## Troubleshooting

### Common Issues
- **CSP Errors**: Check for missing nonces on inline scripts
- **404 Errors**: Use `/sitemap.xml` to find correct URLs
- **Dark Mode**: Uses CSS `@media (prefers-color-scheme)`, not classes
- **Test Failures**: Run in Docker for consistency
- **Permission Errors**: Clean with `rm -rf htmlcov .pytest_cache`

### Debug Commands
```bash
# Check URL mappings
python3 -c "from mathnotes import create_app; app = create_app(); print(app.url_mapper.url_mappings)"

# Verify demo registration
grep -r "registerDemo" mathnotes/demos-framework/src/main.ts

# Check for CSP violations
# Open browser console and look for CSP errors
```

## Debug Techniques

- You can use console.log("[probe] ...") to debug javasript/css/dom stuff in conjunction with the page crawler (./scripts/crawl-dev.sh)
