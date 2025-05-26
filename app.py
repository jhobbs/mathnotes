import os
import re
from pathlib import Path
from flask import Flask, render_template, send_from_directory, abort, url_for
import markdown
import frontmatter
import yaml

app = Flask(__name__)

# Configuration
CONTENT_DIRS = [
    "algebra", "calculus", "ode", "trigonometry", "logic and proofs", 
    "linear algebra", "physics", "complex", "graphics", 
    "partial differential equations", "probability and statistics", 
    "misc", "numerical analysis", "discrete math", "cellular"
]

# Load site configuration
with open('_config.yml', 'r') as f:
    site_config = yaml.safe_load(f)
    app.config['SITE_TITLE'] = site_config.get('title', 'Mathnotes')
    app.config['SITE_DESCRIPTION'] = site_config.get('description', '')

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
            # Replace $$ ... $$ with placeholder
            display_math_pattern = r'\$\$(.*?)\$\$'
            display_maths = re.findall(display_math_pattern, content, re.DOTALL)
            for i, math in enumerate(display_maths):
                placeholder = f'DISPLAYMATH{i}PLACEHOLDER'
                content = content.replace(f'$${math}$$', placeholder, 1)
            
            # Replace $ ... $ with placeholder
            inline_math_pattern = r'(?<!\$)\$(?!\$)(.*?)\$(?!\$)'
            inline_maths = re.findall(inline_math_pattern, content)
            for i, math in enumerate(inline_maths):
                placeholder = f'INLINEMATH{i}PLACEHOLDER'
                content = content.replace(f'${math}$', placeholder, 1)
            
            # Convert markdown to HTML
            html_content = md.convert(content)
            
            # Restore math delimiters
            for i, math in enumerate(display_maths):
                placeholder = f'DISPLAYMATH{i}PLACEHOLDER'
                html_content = html_content.replace(placeholder, f'$${math}$$')
            
            for i, math in enumerate(inline_maths):
                placeholder = f'INLINEMATH{i}PLACEHOLDER'
                html_content = html_content.replace(placeholder, f'${math}$')
            
            return {
                'content': html_content,
                'metadata': post.metadata,
                'title': post.metadata.get('title', Path(filepath).stem.replace('-', ' ').title())
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
    
    for item in sorted(path.iterdir()):
        if item.is_file() and item.suffix == '.md':
            content_files.append({
                'name': item.stem.replace('-', ' ').title(),
                'path': str(item.relative_to(Path('.'))).replace('\\', '/'),
                'is_subdir': False
            })
        elif item.is_dir() and not item.name.startswith('.'):
            # Recursively get files from subdirectories
            subdir_files = []
            for subitem in sorted(item.iterdir()):
                if subitem.is_file() and subitem.suffix == '.md':
                    subdir_files.append({
                        'name': subitem.stem.replace('-', ' ').title(),
                        'path': str(subitem.relative_to(Path('.'))).replace('\\', '/')
                    })
            
            if subdir_files:
                content_files.append({
                    'name': item.name.replace('-', ' ').title(),
                    'is_subdir': True,
                    'files': subdir_files
                })
    
    return content_files

@app.route('/')
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

@app.route('/<path:filepath>')
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

@app.route('/static/<path:filename>')
def static_files(filename):
    """Serve static files."""
    return send_from_directory('static', filename)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)