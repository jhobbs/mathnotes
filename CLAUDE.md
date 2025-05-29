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

### Deployment
```bash
# Deploy to fly.io
flyctl deploy

# Check deployment status
flyctl status

# View logs
flyctl logs
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

2. **Dark Mode Support**:
   - CSS variables in base template adapt to system preference
   - Interactive demos use `/static/demo-style.css` and `/static/demo-dark-mode.js`
   - P5.js demos need `applyTextStyle()` for proper text color

3. **Content Discovery**:
   - `get_all_content_for_section()` recursively finds all .md files
   - Supports arbitrary directory nesting (e.g., differential equations/ordinary differential equations/chapter 01/)
   - Files and subdirectories are sorted alphabetically

### Interactive Demonstrations
Located in various subject directories:
- **cellular/**: Conway's Game of Life and Elementary Cellular Automata
- **ode/**: Pursuit curves (turntable.html), dilution calculator, pendulum simulation
- **physics/**: Electric field visualization
- **graphics/**: Projection demonstrations

All demos should include the dark mode CSS/JS for proper theme support.

## Important Notes

- The site is deployed to fly.io at mathnotes.fly.dev
- Custom domain: www.lacunary.org
- When modifying interactive demos, ensure they include dark mode support
- The Flask app handles spaces in directory names via URL encoding

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

5. **Deployment Operations**:
   - Monitoring deployments via GitHub Actions (not direct fly.io deploys)
   - Using curl to check deployment status
   - Creating deployment monitoring scripts

Note: Any command or operation the user explicitly tells Claude to remember should be added to this list.