"""
Flask routes for the Mathnotes application.
"""

import os
from pathlib import Path
from flask import (
    render_template,
    send_from_directory,
    abort,
    redirect,
    make_response,
    Response,
    request,
    current_app,
)
from .config import CONTENT_DIRS, BASE_URL, STATIC_FILE_CACHE_CONFIG, get_base_url
from .file_utils import get_directory_contents, get_all_content_for_section


def apply_content_file_caching(response, filepath):
    """Apply caching headers to content files based on extension and environment."""
    # Check if we're in development mode
    is_development = (
        current_app.debug
        or os.environ.get("FLASK_ENV") == "development"
        or os.environ.get("FLASK_DEBUG") == "1"
        or "localhost" in request.host
        or "127.0.0.1" in request.host
    )

    if not is_development:
        # Production: Apply caching based on file type
        _, ext = os.path.splitext(filepath)
        ext = ext.lower()

        if ext in STATIC_FILE_CACHE_CONFIG:
            cache_config = STATIC_FILE_CACHE_CONFIG[ext]
            max_age = cache_config["max_age"]
            is_public = cache_config.get("public", True)

            # Set cache control headers
            cache_control_parts = [f"max-age={max_age}"]
            if is_public:
                cache_control_parts.append("public")
            else:
                cache_control_parts.append("private")

            response.headers["Cache-Control"] = ", ".join(cache_control_parts)
    else:
        # Development: Explicitly disable caching
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

    return response


def register_routes(app, url_mapper, markdown_processor):
    """Register all Flask routes with the application."""

    @app.route("/")
    def homepage():
        """Main homepage with links to different sections."""
        return render_template("homepage.html")

    @app.route("/favicon.ico")
    def favicon():
        """Serve favicon.ico."""
        import os

        return send_from_directory(os.getcwd(), "favicon.ico")

    @app.route("/robots.txt")
    def robots():
        """Serve robots.txt."""
        import os

        return send_from_directory(os.getcwd(), "robots.txt")

    @app.route("/mathnotes/")
    def index():
        """Home page listing all sections."""
        # Map directory names to display names
        display_names = {
            "differential-equations": "Differential Equations",
            "complex-analysis": "Complex Analysis",
            "linear-algebra": "Linear Algebra",
            "logic-and-proofs": "Logic and Proofs",
            "probability-and-statistics": "Probability and Statistics",
            "numerical-analysis": "Numerical Analysis",
            "discrete-math": "Discrete Math",
            "cellular-automata": "Cellular Automata",
            "real-analysis": "Real Analysis",
        }

        sections = []
        for section in CONTENT_DIRS:
            path = Path(section)
            if path.exists():
                content = get_all_content_for_section(section, url_mapper.file_to_canonical)
                if content:
                    # Extract section name without content/ prefix
                    section_name = (
                        section.replace("content/", "")
                        if section.startswith("content/")
                        else section
                    )
                    # Use display name if available, otherwise use title case
                    display_name = display_names.get(section_name, section_name.title())
                    sections.append({"name": display_name, "path": section, "content": content})

        # Sort sections alphabetically by name
        sections.sort(key=lambda x: x["name"])

        return render_template("index.html", sections=sections)

    @app.route("/mathnotes/<path:filepath>")
    def serve_content(filepath):
        """Serve markdown content or static files."""
        # Handle static files using proper send_from_directory with absolute paths
        content_filepath = Path(f"content/{filepath}")
        if content_filepath.exists() and content_filepath.is_file():
            if filepath.endswith((".html", ".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg")):
                import os

                directory = os.path.dirname(os.path.abspath(content_filepath))
                filename = os.path.basename(filepath)
                return send_from_directory(directory, filename)

        # First check if this URL needs a redirect
        redirect_url = url_mapper.get_redirect_url(filepath)
        if redirect_url:
            return redirect(f"/mathnotes/{redirect_url}", code=301)

        # Check if this is a canonical URL
        md_path = url_mapper.get_file_path(filepath)
        if md_path:
            content = markdown_processor.render_markdown_file(md_path)
            if content:
                return render_template("page.html", **content)

        # Check if it's a directory
        if Path(f"content/{filepath}").exists() and Path(f"content/{filepath}").is_dir():
            files, subdirs = get_directory_contents(filepath, url_mapper.file_to_canonical)
            return render_template(
                "directory.html",
                directory=filepath,
                files=files,
                subdirs=subdirs,
                title=filepath.strip("/").replace("/", " - ").title(),
            )

        # Check for markdown file (backward compatibility)
        md_path = filepath if filepath.endswith(".md") else f"{filepath}.md"
        if Path(f"content/{md_path}").exists():
            # Redirect to canonical URL if it exists
            md_path_normalized = md_path.replace("\\", "/")
            canonical_url = url_mapper.get_canonical_url(md_path_normalized)
            if canonical_url:
                return redirect(f"/{canonical_url}", code=301)
            # Otherwise serve directly
            content = markdown_processor.render_markdown_file(md_path)
            if content:
                return render_template("page.html", **content)

        # Static files are handled at the top of the function now

        abort(404)

    @app.route("/mathnotes/static/<path:filename>")
    def static_files(filename):
        """Serve static files."""
        return send_from_directory("static", filename)

    @app.route("/sitemap.xml")
    def sitemap():
        """Generate sitemap.xml for SEO."""
        pages = []

        # Get the appropriate base URL for the current request
        base_url = get_base_url(request)

        # Add main home page
        pages.append({"loc": base_url, "changefreq": "weekly", "priority": "1.0"})

        # Add mathnotes section
        pages.append({"loc": f"{base_url}/mathnotes/", "changefreq": "weekly", "priority": "0.9"})

        # Add all canonical URLs from the URL mappings
        for canonical_url in url_mapper.url_mappings:
            pages.append(
                {
                    "loc": f"{base_url}/mathnotes/{canonical_url}",
                    "changefreq": "monthly",
                    "priority": "0.8",
                }
            )

        # Generate XML
        sitemap_xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        sitemap_xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

        for page in pages:
            sitemap_xml += "  <url>\n"
            sitemap_xml += f'    <loc>{page["loc"]}</loc>\n'
            sitemap_xml += f'    <changefreq>{page["changefreq"]}</changefreq>\n'
            sitemap_xml += f'    <priority>{page["priority"]}</priority>\n'
            sitemap_xml += "  </url>\n"

        sitemap_xml += "</urlset>"

        response = make_response(sitemap_xml)
        response.headers["Content-Type"] = "application/xml"
        return response

    @app.route("/demos")
    def demos_showcase():
        """Display all available interactive demos."""
        # Define demo metadata
        demos = [
            {'name': 'electric-field', 'title': 'Electric Field', 'category': 'Physics'},
            {'name': 'neighborhood', 'title': 'Neighborhood in Metric Spaces', 'category': 'Topology'},
            {'name': 'projection', 'title': '3D Projection', 'category': 'Graphics'},
            {'name': 'countable-union', 'title': 'Countable Union', 'category': 'Real Analysis'},
            {'name': 'countable-tuples', 'title': 'Countable Tuples', 'category': 'Real Analysis'},
            {'name': 'diagonalization', 'title': "Cantor's Diagonalization", 'category': 'Real Analysis'},
            {'name': 'turntable', 'title': 'Turntable (Differential Equations)', 'category': 'Differential Equations'},
            {'name': 'pendulum', 'title': 'Pendulum Motion', 'category': 'Differential Equations'},
            {'name': 'dilution-calculator', 'title': 'Dilution Calculator', 'category': 'Differential Equations'},
            {'name': 'cellular-automata/game-of-life', 'title': "Conway's Game of Life", 'category': 'Cellular Automata'},
            {'name': 'cellular-automata/elementary-cellular-automata', 'title': 'Elementary Cellular Automata', 'category': 'Cellular Automata'}
        ]
        
        # Group demos by category
        demos_by_category = {}
        for demo in demos:
            category = demo['category']
            if category not in demos_by_category:
                demos_by_category[category] = []
            demos_by_category[category].append(demo)
        
        return render_template("demos_showcase.html", demos_by_category=demos_by_category)

    @app.errorhandler(404)
    def page_not_found(e):
        """Handle 404 errors."""
        return render_template("404.html"), 404
