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
    return {'current_year': datetime.now().year}

def inject_nonce():
    """Add CSP nonce to all templates."""
    return {'csp_nonce': getattr(g, 'csp_nonce', '')}

def inject_version():
    """Add version info to all templates."""
    version = 'unknown'
    try:
        # Try to read from Docker build location first
        if os.path.exists('/version/version.txt'):
            with open('/version/version.txt', 'r') as f:
                version = f.read().strip()
        # Try local version.txt (for non-volume-mounted Docker)
        elif os.path.exists('version.txt'):
            with open('version.txt', 'r') as f:
                version = f.read().strip()
        # Fallback to git command for local development
        elif os.path.exists('.git'):
            try:
                version = subprocess.check_output(['git', 'describe', '--always', '--tags', '--dirty'], 
                                                stderr=subprocess.DEVNULL).decode('utf-8').strip()
            except:
                pass
    except:
        pass
    return {'app_version': version}

def inject_env():
    """Add environment info to all templates."""
    return {
        'is_development': os.environ.get('FLASK_ENV') == 'development'
    }

def inject_base_url():
    """Add dynamic base URL to all templates."""
    return {
        'base_url': get_base_url(request)
    }