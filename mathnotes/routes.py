"""
Flask routes for the Mathnotes application.
"""

from pathlib import Path
from flask import render_template, send_from_directory, abort, redirect, make_response
from .config import CONTENT_DIRS, BASE_URL
from .file_utils import get_directory_contents, get_all_content_for_section

def register_routes(app, url_mapper, markdown_processor):
    """Register all Flask routes with the application."""
    
    @app.route('/')
    def homepage():
        """Main homepage with links to different sections."""
        return render_template('homepage.html')

    @app.route('/mathnotes/')
    def index():
        """Home page listing all sections."""
        sections = []
        for section in CONTENT_DIRS:
            path = Path(section)
            if path.exists():
                content = get_all_content_for_section(section, url_mapper.file_to_canonical)
                if content:
                    sections.append({
                        'name': section.title(),
                        'path': section,
                        'content': content
                    })
        
        # Sort sections alphabetically by name
        sections.sort(key=lambda x: x['name'])
        
        return render_template('index.html', sections=sections)

    @app.route('/mathnotes/<path:filepath>')
    def serve_content(filepath):
        """Serve markdown content or static files."""
        # First check if this URL needs a redirect
        redirect_url = url_mapper.get_redirect_url(filepath)
        if redirect_url:
            return redirect(f"/mathnotes/{redirect_url}", code=301)
        
        # Check if this is a canonical URL
        md_path = url_mapper.get_file_path(filepath)
        if md_path:
            content = markdown_processor.render_markdown_file(md_path)
            if content:
                return render_template('page.html', **content)
        
        # Check if it's a directory
        if Path(filepath).exists() and Path(filepath).is_dir():
            files, subdirs = get_directory_contents(filepath, url_mapper.file_to_canonical)
            return render_template('directory.html', 
                                 directory=filepath,
                                 files=files,
                                 subdirs=subdirs,
                                 title=filepath.strip('/').replace('/', ' - ').title())
        
        # Check for markdown file (backward compatibility)
        md_path = filepath if filepath.endswith('.md') else f"{filepath}.md"
        if Path(md_path).exists():
            # Redirect to canonical URL if it exists
            md_path_normalized = md_path.replace('\\', '/')
            canonical_url = url_mapper.get_canonical_url(md_path_normalized)
            if canonical_url:
                return redirect(f"/{canonical_url}", code=301)
            # Otherwise serve directly
            content = markdown_processor.render_markdown_file(md_path)
            if content:
                return render_template('page.html', **content)
        
        # Check for HTML files (interactive demos)
        if filepath.endswith('.html') and Path(filepath).exists():
            return send_from_directory('.', filepath)
        
        # Check for static files (js, css, images)
        if Path(filepath).exists() and Path(filepath).is_file():
            directory = Path(filepath).parent
            filename = Path(filepath).name
            return send_from_directory(str(directory) or '.', filename)
        
        abort(404)

    @app.route('/mathnotes/static/<path:filename>')
    def static_files(filename):
        """Serve static files."""
        return send_from_directory('static', filename)

    @app.route('/favicon.ico')
    def favicon():
        """Serve favicon.ico."""
        return send_from_directory('.', 'favicon.ico')

    @app.route('/robots.txt')
    def robots():
        """Serve robots.txt."""
        return send_from_directory('.', 'robots.txt')

    @app.route('/sitemap.xml')
    def sitemap():
        """Generate sitemap.xml for SEO."""
        pages = []
        
        # Add main home page
        pages.append({
            'loc': BASE_URL,
            'changefreq': 'weekly',
            'priority': '1.0'
        })
        
        # Add mathnotes section
        pages.append({
            'loc': f"{BASE_URL}/mathnotes/",
            'changefreq': 'weekly',
            'priority': '0.9'
        })
        
        # Add all canonical URLs from the URL mappings
        for canonical_url in url_mapper.url_mappings:
            pages.append({
                'loc': f"{BASE_URL}/mathnotes/{canonical_url}",
                'changefreq': 'monthly', 
                'priority': '0.8'
            })
        
        # Generate XML
        sitemap_xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        sitemap_xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        
        for page in pages:
            sitemap_xml += '  <url>\n'
            sitemap_xml += f'    <loc>{page["loc"]}</loc>\n'
            sitemap_xml += f'    <changefreq>{page["changefreq"]}</changefreq>\n'
            sitemap_xml += f'    <priority>{page["priority"]}</priority>\n'
            sitemap_xml += '  </url>\n'
        
        sitemap_xml += '</urlset>'
        
        response = make_response(sitemap_xml)
        response.headers['Content-Type'] = 'application/xml'
        return response

    @app.errorhandler(404)
    def page_not_found(e):
        """Handle 404 errors."""
        return render_template('404.html'), 404