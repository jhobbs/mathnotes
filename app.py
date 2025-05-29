import os
import re
import subprocess
from pathlib import Path
from datetime import datetime
from flask import Flask, render_template, send_from_directory, abort, url_for, make_response, redirect
import markdown
import frontmatter
import yaml

app = Flask(__name__)

# Add current year to all templates
@app.context_processor
def inject_year():
    return {'current_year': datetime.now().year}

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
    "misc", "numerical analysis", "discrete math", "cellular automata"
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
                # Return an iframe that loads the HTML file
                return f'<iframe src="/{url_path}" width="100%" height="600" frameborder="0"></iframe>'
            
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
            
            return {
                'content': html_content,
                'metadata': post.metadata,
                'title': post.metadata.get('title', Path(filepath).stem.replace('-', ' ').title()),
                'source_path': filepath  # Add the source file path
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
            files.append({
                'name': item.stem.replace('-', ' ').title(),
                'path': str(item.relative_to(Path('.'))).replace('\\', '/')
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
                items.append({
                    'name': item.stem.replace('-', ' ').title(),
                    'path': str(item.relative_to(Path('.'))).replace('\\', '/'),
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
    # Check if it's a directory
    if Path(filepath).exists() and Path(filepath).is_dir():
        files, subdirs = get_directory_contents(filepath)
        return render_template('directory.html', 
                             directory=filepath,
                             files=files,
                             subdirs=subdirs,
                             title=filepath.replace('/', ' - ').title())
    
    # Check for markdown file
    md_path = filepath if filepath.endswith('.md') else f"{filepath}.md"
    if Path(md_path).exists():
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
    
    # Recursively find all markdown files
    def find_all_pages(directory=''):
        for section in CONTENT_DIRS:
            section_path = Path(section)
            if section_path.exists():
                for md_file in section_path.rglob('*.md'):
                    # Skip index files as they're handled by directory URLs
                    if md_file.name == 'index.md':
                        url_path = str(md_file.parent).replace('\\', '/')
                    else:
                        url_path = str(md_file.with_suffix('')).replace('\\', '/')
                    
                    pages.append({
                        'loc': f"{base_url}/mathnotes/{url_path}",
                        'changefreq': 'monthly',
                        'priority': '0.8'
                    })
    
    find_all_pages()
    
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