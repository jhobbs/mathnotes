import os
import re
import subprocess
import secrets
from pathlib import Path
from datetime import datetime
from flask import Flask, render_template, send_from_directory, abort, url_for, make_response, redirect, request, g
import markdown
import frontmatter
import yaml
import unicodedata
from urllib.parse import quote, unquote

app = Flask(__name__)

# Generate CSP nonce for each request
@app.before_request
def generate_nonce():
    """Generate a unique nonce for CSP."""
    g.csp_nonce = secrets.token_urlsafe(16)

# Content Security Policy middleware
@app.after_request
def add_security_headers(response):
    """Add security headers including CSP to all responses."""
    # Get the nonce for this request
    nonce = getattr(g, 'csp_nonce', '')
    
    # Content Security Policy with nonce
    csp_directives = [
        "default-src 'self'",
        f"script-src 'self' 'nonce-{nonce}' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self' https://cdn.jsdelivr.net",
        "connect-src 'self'",
        "frame-src 'self'",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "upgrade-insecure-requests"
    ]
    
    response.headers['Content-Security-Policy'] = '; '.join(csp_directives)
    
    # Additional security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
    
    # HTTP Strict Transport Security (HSTS)
    # max-age=31536000 (1 year), includeSubDomains, preload
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
    
    # Cross-Origin-Opener-Policy for origin isolation
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    
    # Cross-Origin-Embedder-Policy (using credentialless for better compatibility)
    response.headers['Cross-Origin-Embedder-Policy'] = 'credentialless'
    
    return response

# URL mapping for permalinks
url_mappings = {}  # Maps canonical URLs to file paths
redirect_mappings = {}  # Maps old URLs to canonical URLs
file_to_canonical = {}  # Maps file paths to canonical URLs

def slugify(text):
    """Convert text to URL-friendly slug."""
    # Convert to lowercase and normalize unicode
    text = unicodedata.normalize('NFKD', text.lower())
    # Remove non-alphanumeric characters except spaces and hyphens
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    # Replace spaces with hyphens
    text = re.sub(r'\s+', '-', text.strip())
    # Remove multiple consecutive hyphens
    text = re.sub(r'-+', '-', text)
    return text

def build_url_mappings():
    """Build URL mappings from all content files."""
    global url_mappings, redirect_mappings, file_to_canonical
    
    for section in CONTENT_DIRS:
        section_path = Path(section)
        if not section_path.exists():
            continue
            
        for md_file in section_path.rglob('*.md'):
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    post = frontmatter.load(f)
                    
                # Get slug from frontmatter or generate from title
                slug = post.metadata.get('slug')
                if not slug:
                    title = post.metadata.get('title', md_file.stem.replace('-', ' '))
                    slug = slugify(title)
                
                # Build canonical URL
                relative_path = md_file.relative_to(Path('.'))
                section_name = relative_path.parts[0]
                canonical_url = f"{section_name}/{slug}"
                
                # Store mappings
                file_path = str(relative_path).replace('\\', '/')
                url_mappings[canonical_url] = file_path
                file_to_canonical[file_path] = canonical_url
                
                # Handle redirects
                redirect_from = post.metadata.get('redirect_from', [])
                if isinstance(redirect_from, str):
                    redirect_from = [redirect_from]
                    
                for old_url in redirect_from:
                    # Clean up old URL
                    old_url = old_url.strip('/')
                    if old_url.startswith('mathnotes/'):
                        old_url = old_url[len('mathnotes/'):]
                    redirect_mappings[old_url] = canonical_url
                    
                # Also map the file-based URL to canonical
                file_based_url = file_path
                if file_based_url.endswith('.md'):
                    file_based_url = file_based_url[:-3]
                if file_based_url != canonical_url:
                    redirect_mappings[file_based_url] = canonical_url
                    
            except Exception as e:
                print(f"Error processing {md_file}: {e}")
                
    print(f"Built {len(url_mappings)} URL mappings and {len(redirect_mappings)} redirects")

# Add current year to all templates
@app.context_processor
def inject_year():
    return {'current_year': datetime.now().year}

# Add CSP nonce to all templates
@app.context_processor
def inject_nonce():
    return {'csp_nonce': getattr(g, 'csp_nonce', '')}

# Add version info to all templates
@app.context_processor
def inject_version():
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

# Configuration
CONTENT_DIRS = [
    "algebra", "calculus", "differential equations", "trigonometry", "logic and proofs", 
    "linear algebra", "physics", "complex analysis", "graphics", 
    "probability and statistics", 
    "misc", "numerical analysis", "discrete math", "cellular automata", "real analysis",
]

# Site configuration
app.config['SITE_TITLE'] = 'Mathnotes'
app.config['SITE_DESCRIPTION'] = 'A collection of mathematics notes and interactive demonstrations'

# Initialize Markdown with extensions
md = markdown.Markdown(extensions=[
    'extra',
    'codehilite',
    'toc',
    'tables',
    'fenced_code'
])

# Build URL mappings on startup
build_url_mappings()

def render_markdown_file(filepath):
    """Read and render a markdown file with frontmatter."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)
            
            # Process Jekyll-style includes
            content = post.content
            include_pattern = r'{%\s*include_relative\s+([^\s%}]+)\s*%}'
            
            def replace_include(match):
                include_file = match.group(1)
                # Get the directory of the current markdown file
                current_dir = os.path.dirname(filepath)
                # Create the URL path for the included file
                url_path = os.path.join(current_dir, include_file).replace('\\', '/')
                # Return an iframe that loads the HTML file with fullscreen button
                iframe_id = f"demo-{hash(url_path)}"
                return f'''<div class="demo-container">
                    <iframe id="{iframe_id}" src="/mathnotes/{url_path}" width="100%" height="800" frameborder="0"></iframe>
                    <button class="fullscreen-btn" onclick="openFullscreen('{iframe_id}', '/mathnotes/{url_path}')" title="Open in fullscreen">⛶</button>
                </div>'''
            
            content = re.sub(include_pattern, replace_include, content)
            
            # Protect math delimiters from markdown processing
            # First handle display math ($$...$$), then inline math ($...$)
            
            # Replace $$ ... $$ with placeholder and store original content
            display_math_blocks = {}
            display_counter = 0
            def replace_display_math(match):
                nonlocal display_counter
                placeholder = f'DISPLAYMATH{display_counter}PLACEHOLDER'
                display_math_blocks[placeholder] = match.group(0)  # Store complete $$...$$ 
                display_counter += 1
                return placeholder
            
            content = re.sub(r'\$\$.*?\$\$', replace_display_math, content, flags=re.DOTALL)
            
            # Replace $ ... $ with placeholder and store original content
            inline_math_blocks = {}
            inline_counter = 0
            def replace_inline_math(match):
                nonlocal inline_counter
                placeholder = f'INLINEMATH{inline_counter}PLACEHOLDER'
                inline_math_blocks[placeholder] = match.group(0)  # Store complete $...$
                inline_counter += 1
                return placeholder
            
            content = re.sub(r'(?<!\$)\$(?!\$).*?\$(?!\$)', replace_inline_math, content)
            
            # Convert markdown to HTML
            html_content = md.convert(content)
            
            # Restore math blocks with their original content
            for placeholder, math_content in display_math_blocks.items():
                html_content = html_content.replace(placeholder, math_content)
            
            for placeholder, math_content in inline_math_blocks.items():
                html_content = html_content.replace(placeholder, math_content)
            
            # Fix escaped asterisks and tildes that should be rendered normally
            html_content = html_content.replace(r'\*', '*')
            html_content = html_content.replace(r'\~', '~')
            
            # Get canonical URL for this file
            file_path_normalized = filepath.replace('\\', '/')
            canonical_url = file_to_canonical.get(file_path_normalized)
            if canonical_url:
                canonical_path = f"/mathnotes/{canonical_url}"
            else:
                # Fallback to current URL structure
                file_path_no_ext = file_path_normalized.replace('.md', '')
                canonical_path = f"/mathnotes/{file_path_no_ext}"
            
            # Generate description from frontmatter or content
            description = post.metadata.get('description', '')
            if not description:
                # Generate description from first paragraph of content
                # Remove HTML tags and math expressions for a clean description
                clean_content = re.sub(r'<[^>]+>', '', html_content)  # Remove HTML tags
                clean_content = re.sub(r'\$\$[^$]+\$\$', '', clean_content)  # Remove display math
                clean_content = re.sub(r'\$[^$]+\$', '', clean_content)  # Remove inline math
                clean_content = re.sub(r'\s+', ' ', clean_content).strip()  # Normalize whitespace
                
                # Take first sentence or up to 160 characters
                if clean_content:
                    sentences = clean_content.split('. ')
                    if sentences:
                        description = sentences[0]
                        if len(description) > 160:
                            description = description[:157] + '...'
                        elif not description.endswith('.'):
                            description += '.'
            
            return {
                'content': html_content,
                'metadata': post.metadata,
                'title': post.metadata.get('title', Path(filepath).stem.replace('-', ' ').title()),
                'page_description': description,
                'source_path': filepath,  # Add the source file path
                'canonical_url': canonical_path
            }
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None

def get_directory_contents(directory):
    """Get list of markdown files and subdirectories in a directory."""
    path = Path(directory)
    if not path.exists():
        return [], []
    
    files = []
    subdirs = []
    
    for item in sorted(path.iterdir()):
        if item.is_file() and item.suffix == '.md':
            file_path_raw = str(item.relative_to(Path('.')))
            file_path = file_path_raw.replace('\\', '/')
            canonical_url = file_to_canonical.get(file_path)
            if canonical_url:
                url = canonical_url
            else:
                url = file_path.replace('.md', '')
            
            files.append({
                'name': item.stem.replace('-', ' ').title(),
                'path': url
            })
        elif item.is_dir() and not item.name.startswith('.'):
            # Check if directory contains markdown files
            if any(f.suffix == '.md' for f in item.iterdir() if f.is_file()):
                subdirs.append({
                    'name': item.name.replace('-', ' ').title(),
                    'path': str(item.relative_to(Path('.'))).replace('\\', '/')
                })
    
    return files, subdirs

def get_all_content_for_section(section_path):
    """Recursively get all content files for a section."""
    content_files = []
    path = Path(section_path)
    
    if not path.exists():
        return content_files
    
    def process_directory(dir_path, depth=0):
        items = []
        for item in sorted(dir_path.iterdir()):
            if item.is_file() and item.suffix == '.md':
                file_path_raw = str(item.relative_to(Path('.')))
                file_path = file_path_raw.replace('\\', '/')
                canonical_url = file_to_canonical.get(file_path)
                if canonical_url:
                    url = canonical_url
                else:
                    url = file_path.replace('.md', '')
                    
                items.append({
                    'name': item.stem.replace('-', ' ').title(),
                    'path': url,
                    'is_subdir': False
                })
            elif item.is_dir() and not item.name.startswith('.') and not item.name.startswith('__'):
                # Recursively get files from subdirectories
                subdir_content = process_directory(item, depth + 1)
                if subdir_content:
                    items.append({
                        'name': item.name.replace('-', ' ').title(),
                        'is_subdir': True,
                        'files': subdir_content
                    })
        return items
    
    return process_directory(path)

@app.route('/')
def homepage():
    """Main homepage with links to different sections"""
    # The context processors (inject_year and inject_version) will automatically
    # provide current_year and app_version to the template
    return render_template('homepage.html')

@app.route('/mathnotes/')
def index():
    """Home page listing all sections."""
    sections = []
    for section in CONTENT_DIRS:
        path = Path(section)
        if path.exists():
            content = get_all_content_for_section(section)
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
    if filepath in redirect_mappings:
        canonical_url = redirect_mappings[filepath]
        return redirect(f"/mathnotes/{canonical_url}", code=301)
    
    # Check if this is a canonical URL
    if filepath in url_mappings:
        md_path = url_mappings[filepath]
        content = render_markdown_file(md_path)
        if content:
            return render_template('page.html', **content)
    
    # Check if it's a directory
    if Path(filepath).exists() and Path(filepath).is_dir():
        files, subdirs = get_directory_contents(filepath)
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
        canonical_url = file_to_canonical.get(md_path_normalized)
        if canonical_url:
            return redirect(f"/{canonical_url}", code=301)
        # Otherwise serve directly
        content = render_markdown_file(md_path)
        if content:
            return render_template('page.html', **content)
    
    # Check for HTML files (interactive demos)
    if filepath.endswith('.html') and Path(filepath).exists():
        return send_from_directory('.', filepath)
    
    # Check for static files (js, css, images)
    if Path(filepath).exists() and Path(filepath).is_file():
        directory = os.path.dirname(filepath)
        filename = os.path.basename(filepath)
        return send_from_directory(directory or '.', filename)
    
    abort(404)

@app.route('/mathnotes/static/<path:filename>')
def static_files(filename):
    """Serve static files."""
    return send_from_directory('static', filename)

@app.route('/robots.txt')
def robots():
    """Serve robots.txt."""
    return send_from_directory('.', 'robots.txt')

@app.route('/sitemap.xml')
def sitemap():
    """Generate sitemap.xml for SEO."""
    pages = []
    base_url = 'https://www.lacunary.org'
    
    # Add main home page
    pages.append({
        'loc': base_url,
        'changefreq': 'weekly',
        'priority': '1.0'
    })
    
    # Add mathnotes section
    pages.append({
        'loc': f"{base_url}/mathnotes/",
        'changefreq': 'weekly',
        'priority': '0.9'
    })
    
    # Add all canonical URLs from the URL mappings
    for canonical_url in url_mappings:
        pages.append({
            'loc': f"{base_url}/mathnotes/{canonical_url}",
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
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
