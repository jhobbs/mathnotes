# Flask App Server Design

## Summary

Add a Flask app server with gunicorn to serve both static content and API endpoints. This replaces nginx while keeping the existing static site generation pipeline.

## Architecture

```
┌─────────────────────────────────────────┐
│              gunicorn                   │
│  ┌─────────────────────────────────┐    │
│  │          Flask App              │    │
│  │  ┌─────────┐  ┌──────────────┐  │    │
│  │  │  /api/* │  │ Static files │  │    │
│  │  │ (JSON)  │  │ (pre-built)  │  │    │
│  │  └─────────┘  └──────────────┘  │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Build flow (unchanged):**
```
markdown → static generator → static-build/
```

**Runtime flow:**
```
Request → gunicorn → Flask → static file or API handler → Response
```

## Docker Setup

Two containers sharing a volume (same pattern as before, nginx replaced with gunicorn):

```yaml
services:
  static-builder:
    # unchanged - rebuilds files into static-build volume

  web:
    # runs gunicorn, serves Flask app
    # mounts static-build volume read-only
    # exposes port 5000
```

## File Changes

### New Files

**`app.py`** - Flask application:

```python
from flask import Flask, send_from_directory, Blueprint
from pathlib import Path
import os

app = Flask(__name__)

# API blueprint
api = Blueprint('api', __name__, url_prefix='/api')

@api.route('/compute', methods=['POST'])
def compute():
    # Dynamical systems computation endpoint
    return {'result': 'placeholder'}

app.register_blueprint(api)

# Static file serving
STATIC_BUILD = Path(os.environ.get('STATIC_BUILD_DIR', 'static-build'))

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    file_path = STATIC_BUILD / path
    if file_path.is_file():
        return send_from_directory(STATIC_BUILD, path)

    index_path = file_path / 'index.html'
    if index_path.is_file():
        return send_from_directory(STATIC_BUILD, f'{path}/index.html')

    if path == '':
        return send_from_directory(STATIC_BUILD, 'index.html')

    return 'Not found', 404
```

**`Dockerfile.web`** - Web server container:

```dockerfile
FROM python:3.14-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY api/ ./api/

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--reload", "app:app"]
```

**`api/__init__.py`** - API endpoints (future home of compute endpoint)

### Modified Files

**`requirements.txt`** - add:
```
flask
gunicorn
```

**`docker-compose.dev.yml`** - replace nginx-dev service with:
```yaml
web:
  build:
    context: .
    dockerfile: Dockerfile.web
  ports:
    - "5000:5000"
  volumes:
    - static-build:/app/static-build:ro
    - ./app.py:/app/app.py:ro
    - ./api:/app/api:ro
  depends_on:
    - static-builder
```

## URL Routing

- `/api/*` → API handlers
- `/static/dist/*` → Static assets (JS, CSS)
- `/mathnotes/*` → Pre-built HTML pages
- `/` → Homepage

## Implementation Steps

1. Install flask and gunicorn, pin versions
2. Create `app.py` with static serving and API blueprint
3. Create `api/__init__.py` placeholder
4. Create `Dockerfile.web`
5. Update `docker-compose.dev.yml` to use new web service
6. Test static file serving works
7. Test API endpoint works
