# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Mathnotes is a Flask-based web application serving as a personal collection of mathematics notes. The application is containerized with Docker and can be deployed to platforms like fly.io.

## Common Commands

```bash
# Local development with Docker
docker-compose up

# Build Docker image
docker build -t mathnotes .

# Run production container locally
docker run -p 5000:5000 mathnotes

# Deploy to fly.io
flyctl deploy

# Install Python dependencies (for non-Docker development)
pip install -r requirements.txt

# Run Flask app directly
python app.py
```

## Architecture

### Flask Application Structure
- **Web framework**: Flask 3.0.0 with Gunicorn for production
- **Content files**: Markdown with LaTeX math formatting (MathJax for rendering)
- **Templates**: Flask/Jinja2 templates in `templates/` directory
- **Configuration**: Site config loaded from `_config.yml` for backward compatibility

### Content Organization
Mathematical topics are organized in subject-specific directories:
- Core mathematics: algebra, calculus, complex, linear algebra, trigonometry
- Applied mathematics: ode, partial differential equations, numerical analysis, discrete math
- Physics and other topics: physics, logic and proofs, graphics, probability and statistics

### Interactive Components
The repository includes several types of interactive content:

1. **JavaScript Visualizations** (using p5.js)
   - Located in various subject directories (e.g., cellular/, graphics/, physics/)
   - Served as static files through Flask
   - No build process required

2. **Python Scripts**
   - Standalone scripts for simulations (e.g., markov.py, boolean.py, gol.py)
   - Run directly with Python 3

3. **Jupyter Notebooks**
   - Located in `partial differential equations/notebooks/`
   - Used for computational explorations

### Key Technical Details
- **Math Rendering**: LaTeX expressions rendered client-side with MathJax 3
- **Markdown Processing**: python-markdown with math extension
- **URL Routing**: Flask handles both content pages and static files
- **Docker**: Multi-platform support (linux/amd64, linux/arm64)
- **CI/CD**: GitHub Actions automatically builds and publishes Docker images to ghcr.io

### Deployment
- **Container Registry**: Images published to `ghcr.io/jhobbs/mathnotes`
- **Fly.io Configuration**: Defined in `fly.toml` with auto-scaling settings
- **Health Checks**: Configured at root path `/`