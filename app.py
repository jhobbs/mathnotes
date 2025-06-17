"""
Backward compatibility entry point.

This file maintains backward compatibility for any existing deployments
that reference app.py. New deployments should use wsgi.py or run.py.
"""

from mathnotes import create_app

# Create the app instance for backward compatibility
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)