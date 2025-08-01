"""
Flask context processors for the Mathnotes application.
"""

import os
import subprocess
from datetime import datetime
from flask import g, request
from .config import get_base_url


def inject_year():
    """Add current year to all templates."""
    return {"current_year": datetime.now().year}


def inject_nonce():
    """Add CSP nonce to all templates."""
    return {"csp_nonce": getattr(g, "csp_nonce", "")}


def inject_version():
    """Add version info to all templates."""
    version = "unknown"
    try:
        # Try to read from Docker build location first
        if os.path.exists("/version/version.txt"):
            with open("/version/version.txt", "r") as f:
                version = f.read().strip()
        # Try local version.txt (for non-volume-mounted Docker)
        elif os.path.exists("version.txt"):
            with open("version.txt", "r") as f:
                version = f.read().strip()
        # Fallback to git command for local development
        elif os.path.exists(".git"):
            try:
                version = (
                    subprocess.check_output(
                        ["git", "describe", "--always", "--tags", "--dirty"],
                        stderr=subprocess.DEVNULL,
                    )
                    .decode("utf-8")
                    .strip()
                )
            except:
                pass
    except:
        pass
    return {"app_version": version}


def inject_env():
    """Add environment info to all templates."""
    is_development = os.environ.get("FLASK_ENV") == "development"
    
    # Determine Vite URL based on the request host
    vite_url = "http://localhost:5173"
    
    if is_development and request:
        request_host = request.headers.get("Host", "localhost:5000").split(":")[0]
        
        # If accessed via localhost or 127.0.0.1, keep using localhost
        if request_host in ["localhost", "127.0.0.1"]:
            vite_url = "http://localhost:5173"
        else:
            # For Docker service names (web-dev, etc), use vite service
            vite_url = "http://vite:5173"
    
    return {
        "is_development": is_development,
        "vite_url": vite_url
    }


def inject_base_url():
    """Add dynamic base URL to all templates."""
    return {"base_url": get_base_url(request)}


def inject_tooltip_data():
    """Add tooltip data for block references to all templates."""
    from flask import g
    import json
    
    # Check if we have tooltip data in the request context
    tooltip_data = getattr(g, 'tooltip_data', None)
    
    if tooltip_data:
        # Convert to JSON-serializable format
        tooltip_list = []
        for label, data in tooltip_data.items():
            tooltip_list.append({
                'label': label,
                'type': data['type'],
                'title': data['title'],
                'content': data['content'],
                'url': data.get('url', '')
            })
        
        return {"tooltip_data": json.dumps(tooltip_list)}
    
    return {"tooltip_data": None}
