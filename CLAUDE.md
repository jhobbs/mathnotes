# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Mathnotes is a Flask application serving mathematics notes with interactive demonstrations. The application has been refactored into a modular Python package structure for better maintainability and testability.

## Common Commands

### Local Development with Docker
```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d

# Rebuild after changes
docker-compose build
docker-compose restart

# IMPORTANT: For dev mode, use specific compose file
docker-compose -f docker-compose.dev.yml
```

### Direct Python Development
```bash
# Quick setup (creates venv and installs dependencies)
./setup-dev.sh

# Run development server
python run.py
# or
python -m mathnotes
```

**Note**: For testing changes, prefer using Docker as it ensures a consistent environment with all dependencies properly installed.

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

# Run full tox test suite
make tox
make tox-py311     # Python 3.11 specific
make tox-lint      # Just linting
make tox-coverage  # Coverage specific
```

### Deployment
```bash
# Deploy to fly.io (via GitHub Actions - preferred)
git push origin main

# Check deployment status
flyctl status

# View logs
flyctl logs

# Monitor deployment
./scripts/monitor_deployment.sh
```

### Development Tools
```bash
# Set up pre-commit hook for redirect checking
./scripts/setup_precommit_hook.sh

# Check for missing redirects in moved files
python3 scripts/check_redirects.py

# Automatically add missing redirects to moved files
python3 scripts/check_redirects.py --fix

# Move files safely with automatic redirect handling
./scripts/move_file.sh old/path.md new/path.md

# Check for broken internal links
python3 scripts/link_checker.py

# Scale Fly.io regions
./scripts/scale_regions.sh

# Find mathematical definitions not using structured blocks
python3 scripts/find_unstructured_definitions.py

# Test Docker build locally with GitHub Actions configuration
./scripts/test-github-build.sh

# Test multi-platform builds (linux/amd64, linux/arm64)
./scripts/test-multiplatform-build.sh

# Build frontend assets (TypeScript/Vite)
make build-frontend

# Run integrated dev environment (Flask + Vite)
make dev-frontend  # or: docker-compose -f docker-compose.dev.yml up
```

## Architecture

### Modular Package Structure
The application uses Flask's application factory pattern with a clean package structure:

```
mathnotes/
├── __init__.py              # Flask app factory (create_app)
├── config.py                # Centralized configuration
├── markdown_processor.py    # Markdown rendering with Jekyll-style includes
├── structured_math.py       # Mathematical content system
├── url_mapper.py           # URL routing and redirect handling
├── routes.py               # Flask route definitions
├── block_index.py          # Global index for math references
├── math_utils.py           # Math protection and block references
├── security.py             # CSP nonces and security headers
├── context_processors.py   # Template context injection
├── file_utils.py           # File system utilities
├── utils.py                # General utilities
└── demos/                   # Frontend TypeScript source (built with Vite)
```

### Frontend Build System
- **Vite** configured for TypeScript and p5.js demos
- Source code in `mathnotes/demos/`
- Build output to `mathnotes/static/dist/`
- Development server proxies to Flask on port 5000
- docker-compose.dev.yml provides integrated Flask + Vite development

### Key Implementation Details

1. **Markdown Processing** (`markdown_processor.py`):
   - Jekyll-style `{% include_relative %}` tags are converted to iframes
   - NEW: `{% include_integrated_relative %}` embeds HTML/JS directly in the page
     - Extracts body content
     - Wraps JS in function scopes with unique demo IDs
     - Adds CSP nonces to inline scripts
     - Supports `-integrated.js` file variants
   - Math expressions ($...$, $$...$$) are preserved for MathJax rendering
   - Wiki-style internal links: `[[slug]]` or `[[text|slug]]` for resilient cross-references
   - Frontmatter parsing with layout field ignored

2. **URL Mapping** (`url_mapper.py`):
   - Builds URL map on startup from frontmatter slugs
   - Handles redirects from `redirect_from` frontmatter
   - File-based URLs redirect to canonical slug-based URLs
   - Supports arbitrary directory nesting

3. **Structured Mathematics** (`structured_math.py`):
   - Semantic markup for mathematical content
   - Block types: definition, theorem, lemma, proposition, corollary, proof, example, remark, note, intuition, exercise, solution
   - Cross-references: `@label`, `@type:label`, `@{Custom text|label}`, `@@label` (embed)
   - Global block index built on startup

4. **Security** (`security.py`):
   - CSP with per-request nonces
   - Comprehensive security headers
   - Smart caching based on file type and environment

5. **Content Discovery**:
   - Recursive traversal of content directories
   - Supports spaces in directory names
   - Alphabetical sorting of files and directories

### Interactive Demonstrations

#### Modern TypeScript Demos (Preferred)
- **Framework**: `demos-framework/src/` - Contains main.ts, types.ts, utilities
- **Implementations**: `demos/` - Organized by subject (e.g., `demos/physics/electric-field.ts`)
- **Usage**: `{% include_demo "demo-name" %}` in markdown files
- **Dark Mode**: Automatically detected via `window.matchMedia('(prefers-color-scheme: dark)')`
- **Development**: TypeScript served directly by Vite with HMR
- **Production**: Bundled and code-split by Vite

#### Legacy HTML/JS Demos (Being Phased Out)
Located in various subject directories with dark mode support:
- Use `/static/demo-style.css` for consistent styling
- Include `/static/demo-dark-mode.js` for theme detection
- P5.js demos should call `applyTextStyle()` for proper text color
- For integrated demos, ensure CSP nonces are properly applied

## Important Notes

- Site deployed to fly.io at mathnotes.fly.dev
- Custom domain: www.lacunary.org
- When working with demos, always test in Docker
- Use the sitemap (`/sitemap.xml`) to quickly find URLs
- CSP nonces are required for all inline scripts

## File Movement and Renaming Protocol

When moving or renaming markdown files, ALWAYS follow this checklist:

1. **Before moving/renaming**: Note the current canonical URL (check slug or file path)
2. **After moving/renaming**: Add `redirect_from` to the frontmatter
3. **Test**: Verify the old URL redirects properly
4. **Use tools**: Prefer `./scripts/move_file.sh` for automatic redirect handling

## Allowed Commands and Operations

These commands and operations have been explicitly allowed by the user:

1. **Git Commands**:
   - `git describe --always --tags --dirty` - Version information
   - All standard git operations
   - `git restore` - Reverting changes

2. **File Operations**:
   - Modifying Dockerfile, .gitignore, fly.toml
   - Creating version.txt during build
   - Creating/modifying scripts in scripts/
   - Using chmod for executable permissions

3. **Project-Specific Operations**:
   - Modifying any files in the mathnotes/ package
   - Updating templates and static files
   - Creating integrated demos with CSP support

4. **Git Commit Guidelines**:
   - Never include "Generated with Claude Code" or attribution
   - Never add Claude as co-author
   - Keep commit messages technical and concise
   - Only commit when explicitly asked to "ship it"
   - Pre-commit hook warns about moved/deleted files

5. **Deployment Operations**:
   - Monitoring via GitHub Actions (preferred over direct deploys)
   - Using deployment monitoring scripts
   - Checking deployment status with curl

## Security Implementation

### CSP Nonce Requirements
- All inline `<script>` tags must include `nonce="{{ csp_nonce }}"`
- No inline event handlers (onclick, onload, etc.)
- Use `addEventListener` and event delegation
- Use data attributes for parameters
- CSP nonce available in templates via `{{ csp_nonce }}`

### Current CSP Configuration
```
script-src 'self' 'nonce-{unique-per-request}' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com
style-src 'self' 'unsafe-inline'
img-src 'self' data:
font-src 'self' https://cdn.jsdelivr.net
connect-src 'self'
frame-src 'self'
frame-ancestors 'self'
base-uri 'self'
form-action 'self'
object-src 'none'
upgrade-insecure-requests
```

### Security Headers
- HSTS: max-age=31536000; includeSubDomains; preload
- Cross-Origin-Opener-Policy: same-origin
- Cross-Origin-Embedder-Policy: credentialless
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

## Development Workflow

1. **Making Changes**:
   - Use Docker for testing: `docker-compose up --build`
   - For integrated frontend development: `docker-compose -f docker-compose.dev.yml up`
   - Check for JavaScript errors in browser console
   - Verify CSP compliance for new scripts
   - Test both light and dark modes

2. **Adding Interactive Demos**:
   - Create HTML file with proper structure
   - Use `{% include_relative demo.html %}` for iframe embedding
   - Use `{% include_integrated_relative demo.html %}` for direct embedding
   - Include dark mode CSS/JS
   - Test CSP nonce handling
   - TypeScript demos go in `mathnotes/demos/` and are built with Vite

3. **Testing**:
   - Run tests before committing: `make test`
   - Check coverage: `make coverage`
   - Lint code: `make lint`
   - Format code: `make format` (Black configured for 100-char lines)
   - Run type checking: `make type` (mypy in strict mode)
   - Use Playwright for integration testing when needed

## Todo and Ideas Management

For long-term project ideas:
- Add to `IDEAS.md` file in root directory
- Organize by category
- Do not use TodoWrite tool for these (that's for current session only)

## Deployment Process

GitHub Actions CI/CD pipeline:

1. **Trigger**: Push to main branch
2. **Build**: Docker image with git version tag
3. **Registry**: Push to ghcr.io
4. **Deploy**: Fly.io via GitHub Actions
5. **Monitor**: Use `./scripts/monitor_deployment.sh`

The pipeline builds multi-platform Docker images (linux/amd64, linux/arm64) using buildx and automatically deploys to Fly.io on successful builds.

## Common Troubleshooting

- **CSP Errors**: Check that inline scripts have nonces
- **404 Errors**: Use sitemap to find correct URLs
- **Dark Mode Issues**: Site uses CSS media queries `@media (prefers-color-scheme: dark)`, NOT a class-based system
- **Cache Issues**: Development mode auto-detected via localhost
- **Test Failures**: Run in Docker for consistency

When testing: you MUST use Docker to test changes
- In dev mode, ALWAYS use `docker-compose -f docker-compose.dev.yml`

### Vite Development Server Configuration (IMPORTANT)

The Vite dev server configuration is tricky due to base path requirements:

1. **Base Path**: Vite ALWAYS uses `/static/dist/` as base in both dev and production
2. **Development URLs**: 
   - Vite client: Not needed (Vite injects it automatically)
   - Main entry: `http://localhost:5173/static/dist/demos-framework/src/main.ts`
3. **Production URLs**: 
   - Main entry: `/static/dist/main.js` (served by Flask)
4. **Proxy Configuration**: 
   - `/mathnotes` → Flask
   - `/static/` (except `/static/dist/`) → Flask
   - `/static/dist/` → Served by Vite in dev, Flask in prod
5. **Key Gotchas**:
   - Don't try to detect dev/prod mode in vite.config.ts
   - TypeScript files are served directly in development
   - The built files use the same base path structure

## Project Configuration

### Python Configuration (pyproject.toml)
- Python 3.11 minimum requirement
- Black formatter: 100-character line length
- Pytest with coverage configuration
- Flake8 and mypy for code quality
- Tox for multi-environment testing

### Key Dependencies
- **Backend**: Flask 3.0.0, Markdown 3.5.1, python-frontmatter 1.0.1, gunicorn 21.2.0
- **Frontend**: TypeScript, Vite, p5.js for visualizations
- **Development**: pytest, black, flake8, mypy, tox, pre-commit

### Future Development Plans
- **JS Demo Modernization** (JS_DEMO_MODERNIZATION_PLAN.md): TypeScript conversion, Vite integration, module-based system
- **Math Blocks Refactor** (REFACTOR-MATHBLOCKS-PLAN.md): Simplified structured math parsing
- **Feature Ideas** (IDEAS.md): Tags system, automatic theorem numbering, desktop layout improvements