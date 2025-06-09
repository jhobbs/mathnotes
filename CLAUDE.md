# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Mathnotes is a dual-purpose repository:
1. **Flask Application** (main branch): A web application serving mathematics notes with interactive demonstrations
2. **Jekyll Site** (GitHub Pages branch): A redirect site pointing to https://www.lacunary.org

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
```

### Direct Python Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run Flask development server
python app.py
# or
flask run --host=0.0.0.0 --port=5000 --reload
```

**Note**: For testing changes, prefer using Docker as it ensures a consistent environment with all dependencies properly installed.

### Deployment
```bash
# Deploy to fly.io
flyctl deploy

# Check deployment status
flyctl status

# View logs
flyctl logs
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

# Monitor deployment status
./scripts/monitor_deployment.sh

# Check if deployment is ready
./scripts/check_deployment.sh

# Scale Fly.io regions
./scripts/scale_regions.sh
```

## Architecture

### Flask Application Structure
- **app.py**: Main Flask application with routing and markdown rendering
- **Content Organization**: Mathematical topics in subject directories (algebra/, calculus/, etc.)
- **Interactive Demos**: HTML/JavaScript files embedded via iframes
- **Templates**: Jinja2 templates in templates/ directory

### Key Implementation Details

1. **Markdown Processing**:
   - Jekyll-style `{% include_relative %}` tags are converted to iframes
   - Math expressions ($...$, $$...$$) are preserved for MathJax rendering
   - Frontmatter is parsed but layout field is ignored
   - Wiki-style internal links: `[[slug]]` or `[[text|slug]]` for resilient cross-references

2. **Dark Mode Support**:
   - CSS variables in base template adapt to system preference
   - Interactive demos use `/static/demo-style.css` and `/static/demo-dark-mode.js`
   - P5.js demos need `applyTextStyle()` for proper text color

3. **Content Discovery**:
   - `get_all_content_for_section()` recursively finds all .md files
   - Supports arbitrary directory nesting (e.g., differential equations/ordinary differential equations/chapter 01/)
   - Files and subdirectories are sorted alphabetically
   - Slug-based URL system with automatic slug generation from titles

### Interactive Demonstrations
Located in various subject directories:
- **cellular automata/**: Conway's Game of Life (gol.py) and Elementary Cellular Automata (cellular.html, elementary.html)
- **differential equations/ordinary differential equations/**: Pursuit curves (turntable.html), dilution calculator, pendulum simulation
- **physics/**: Electric field visualization (electric-field.html)
- **graphics/**: Projection demonstrations (projection.html)

All demos should include the dark mode CSS/JS for proper theme support.

## Important Notes

- The site is deployed to fly.io at mathnotes.fly.dev
- Custom domain: www.lacunary.org
- When modifying interactive demos, ensure they include dark mode support
- The Flask app handles spaces in directory names via URL encoding

## File Movement and Renaming Protocol

When moving or renaming markdown files, ALWAYS follow this checklist:

1. **Before moving/renaming**: Note the current canonical URL by checking the frontmatter `slug` field, or if none exists, the current file path
2. **After moving/renaming**: Add `redirect_from` to the frontmatter with the old URL
3. **Test**: Verify the old URL redirects to the new one
4. **Common scenarios**:
   - Moving `algebra/groups.md` → `group-theory/intro.md`: Add `redirect_from: [algebra/groups]`
   - Renaming `integration.md` → `integration-strategies.md`: Add `redirect_from: [calculus/integration]`
   - Changing slug from `groups` to `group-theory-basics`: Add `redirect_from: [algebra/groups]`

## Allowed Commands and Operations

These commands and operations have been explicitly allowed by the user and should be permitted in all future sessions:

1. **Git Commands**:
   - `git describe --always --tags --dirty` - Used to get version information
   - All standard git operations for version control
   - `git restore` - Reverting changes to files

2. **File Operations**:
   - Reading and modifying Dockerfile
   - Creating version.txt during Docker build process
   - Modifying .gitignore
   - Modifying fly.toml

3. **Project-Specific Operations**:
   - Adding version display to the footer
   - Modifying app.py context processors
   - Updating template files
   - Modifying health check configurations
   - Creating and modifying scripts in the scripts/ directory
   - Using chmod to make scripts executable

4. **Git Commit Guidelines**:
   - Never include "Generated with Claude Code" or similar attribution in commit messages
   - Never add Claude as a co-author
   - Keep commit messages focused on the technical changes only
   - Only commit and push changes when explicitly asked to "ship it" or similar by the user
   - Pre-commit hook will warn about moved/deleted markdown files to prevent broken links

5. **Deployment Operations**:
   - Monitoring deployments via GitHub Actions (not direct fly.io deploys)
   - Using curl to check deployment status
   - Creating deployment monitoring scripts

Note: Any command or operation the user explicitly tells Claude to remember should be added to this list.

## Deployment Process

The application uses GitHub Actions for CI/CD:

1. **Workflow Trigger**: Push to main branch
2. **Build Process**: 
   - Docker image built with version tag from git
   - Image pushed to GitHub Container Registry (ghcr.io)
3. **Deployment**:
   - Fly.io deployment triggered via GitHub Actions
   - Multi-region deployment with rolling updates
   - Auto-scaling configured (min 0 machines)
4. **Monitoring**: Use `./scripts/monitor_deployment.sh` to track deployment progress

## Security Implementation

The application implements comprehensive security headers and Content Security Policy (CSP) to protect against XSS and other attacks. When creating new files or modifying existing ones, you MUST follow these security requirements:

### CSP Nonce Requirements
- All inline `<script>` tags must include `nonce="{{ csp_nonce }}"`
- No `onclick`, `onload`, or other inline event handlers are allowed
- Use `addEventListener` and event delegation patterns instead
- Use data attributes (`data-*`) for passing parameters to event handlers
- The CSP nonce is available in all templates via the `{{ csp_nonce }}` context variable

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

### Security Headers Applied
- Content Security Policy (CSP) with nonces
- HTTP Strict Transport Security (HSTS): max-age=31536000; includeSubDomains; preload
- Cross-Origin-Opener-Policy: same-origin
- Cross-Origin-Embedder-Policy: credentialless
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### Implementation Details
- CSP nonces are generated per-request using `secrets.token_urlsafe(16)`
- Nonces are added to Flask's `g` object and injected into templates via context processor
- All inline scripts in templates use the nonce for security
- Interactive demos load p5.js from cdnjs.cloudflare.com (approved in CSP)
- MathJax loads from cdn.jsdelivr.net (approved in CSP)
- Removed polyfill.io dependency for better security

### For New Files
- HTML templates: Use `nonce="{{ csp_nonce }}"` for any inline scripts
- Interactive demos: Scripts must load from approved CDNs or be inline with nonces
- No inline event handlers (onclick, onload, etc.) anywhere
- Use proper event listeners with `addEventListener` instead
- All security headers are automatically applied via Flask middleware