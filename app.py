from flask import Flask, send_from_directory
from pathlib import Path
import os

app = Flask(__name__, static_folder=None)

# Import and register API blueprint
from api import api
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
        subpath = f'{path}/index.html' if path else 'index.html'
        return send_from_directory(STATIC_BUILD, subpath)

    return 'Not found', 404
