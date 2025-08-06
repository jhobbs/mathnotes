#!/usr/bin/env python3
"""
Static site generator for Mathnotes.
Crawls all content and generates static HTML files.
"""

import os
import sys
import json
import shutil
from pathlib import Path
from urllib.parse import urljoin
import argparse

# Add parent directory to path to import mathnotes
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mathnotes import create_app
from mathnotes.config import CONTENT_DIRS
from mathnotes.url_mapper import URLMapper
from mathnotes.markdown_processor import MarkdownProcessor
from mathnotes.block_index import BlockIndex
from mathnotes.file_utils import get_directory_contents, get_all_content_for_section
from mathnotes.relative_urls import relative_url_for, relative_asset_url, make_relative_url
from flask import g, url_for
import re


class StaticSiteGenerator:
    def __init__(self, output_dir="static-build", use_relative_urls=True):
        self.output_dir = Path(output_dir)
        self.use_relative_urls = use_relative_urls
        # Set environment variable for static build
        os.environ['STATIC_BUILD'] = '1'
        # Force production mode for static build
        config = {
            'DEBUG': False,
            'TESTING': False
        }
        self.app = create_app(config=config)
        # Also set debug to False explicitly
        self.app.debug = False
        self.processed_urls = set()
        
        # Initialize components directly
        self.url_mapper = URLMapper()
        self.url_mapper.build_url_mappings()
        
        self.block_index = BlockIndex(self.url_mapper)
        self.block_index.build_index()
        
        self.markdown_processor = MarkdownProcessor(self.url_mapper, self.block_index)
        
    def ensure_output_dir(self):
        """Create output directory if it doesn't exist."""
        if self.output_dir.exists():
            print(f"Cleaning existing output directory: {self.output_dir}")
            shutil.rmtree(self.output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def make_urls_relative(self, html_content, current_path):
        """
        Convert absolute URLs in HTML to relative URLs.
        
        Args:
            html_content: The HTML content to process
            current_path: The current page's path (e.g., '/mathnotes/algebra/groups')
        
        Returns:
            HTML with relative URLs
        """
        # Normalize current path
        current_path = current_path.strip('/')
        
        # Pattern to match various URL attributes
        # This handles href, src, action attributes
        url_pattern = re.compile(
            r'((?:href|src|action)\s*=\s*["\'])((?:https?://[^/]+)?/[^"\']*?)(["\'])',
            re.IGNORECASE
        )
        
        def replace_url(match):
            prefix = match.group(1)  # e.g., 'href="'
            url = match.group(2)      # the URL (may include scheme://host)
            suffix = match.group(3)   # closing quote
            
            # Check if this is a canonical link - if so, skip it
            start_pos = max(0, match.start() - 50)
            end_pos = min(len(html_content), match.end() + 50)
            context = html_content[start_pos:end_pos]
            if 'rel="canonical"' in context:
                return match.group(0)  # Return unchanged
            
            # Handle URLs with scheme://host
            if url.startswith(('http://', 'https://')):
                # Skip external URLs
                if 'lacunary.org' not in url and 'localhost' not in url:
                    return match.group(0)
                # Extract the path part for internal URLs
                from urllib.parse import urlparse
                parsed = urlparse(url)
                if parsed.path:
                    # Convert the path part to relative
                    relative = make_relative_url(current_path, parsed.path)
                    return prefix + relative + suffix
                return match.group(0)
            
            # Skip protocol-relative and anchors
            if url.startswith(('//', '#')):
                return match.group(0)
            
            # Convert to relative URL
            relative = make_relative_url(current_path, url)
            
            # Handle special case of same directory
            if relative == '.':
                # For href to current directory, use './'
                if 'href' in prefix.lower():
                    relative = './'
            
            return prefix + relative + suffix
        
        # Replace all URLs
        html_content = url_pattern.sub(replace_url, html_content)
        
        # Also handle URLs in inline styles (background-image, etc.)
        style_pattern = re.compile(
            r'(url\s*\(\s*["\']?)(/[^"\'\)]*?)(["\']?\s*\))',
            re.IGNORECASE
        )
        
        def replace_style_url(match):
            prefix = match.group(1)
            url = match.group(2)
            suffix = match.group(3)
            
            if url.startswith(('http://', 'https://', '//')):
                return match.group(0)
            
            relative = make_relative_url(current_path, url)
            return prefix + relative + suffix
        
        html_content = style_pattern.sub(replace_style_url, html_content)
        
        return html_content
        
    def copy_static_assets(self):
        """Copy static assets to output directory."""
        static_src = Path("static")
        static_dst = self.output_dir / "static"
        
        if static_src.exists():
            print("Copying static assets...")
            shutil.copytree(static_src, static_dst, dirs_exist_ok=True)
    
    def copy_content_assets(self):
        """Copy image and other asset files from content directory."""
        content_src = Path("content")
        
        if not content_src.exists():
            return
            
        print("Copying content assets...")
        asset_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.webp'}
        
        for file_path in content_src.rglob("*"):
            if file_path.is_file() and file_path.suffix.lower() in asset_extensions:
                # Calculate relative path from content directory
                relative_path = file_path.relative_to(content_src)
                
                # Create destination path under mathnotes/
                dest_path = self.output_dir / "mathnotes" / relative_path
                
                # Create parent directories
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Copy the file
                shutil.copy2(file_path, dest_path)
                print(f"  Copied: {relative_path}")
            
    def save_page(self, url_path, html_content, make_relative=True):
        """Save HTML content to appropriate file path."""
        # Remove leading slash if present
        url_path = url_path.lstrip("/")
        
        # Determine output path
        if url_path == "":
            output_path = self.output_dir / "index.html"
            page_url_path = ""
        elif url_path == "mathnotes":
            output_path = self.output_dir / "mathnotes" / "index.html"
            page_url_path = "mathnotes"
        else:
            # For paths like "mathnotes/algebra/groups", create "mathnotes/algebra/groups/index.html"
            output_path = self.output_dir / url_path / "index.html"
            page_url_path = url_path
            
        # Convert URLs to relative if requested
        if make_relative and self.use_relative_urls:
            html_content = self.make_urls_relative(html_content, page_url_path)
            
        # Create directory structure
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write HTML file
        output_path.write_text(html_content, encoding="utf-8")
        print(f"  Generated: {output_path}")
        
    def render_page(self, endpoint, **kwargs):
        """Render a page using Flask's test client."""
        with self.app.app_context():
            with self.app.test_client() as client:
                # Build URL from endpoint and kwargs
                if endpoint == "homepage":
                    response = client.get("/")
                elif endpoint == "index":
                    response = client.get("/mathnotes/")
                elif endpoint == "serve_content":
                    filepath = kwargs.get("filepath", "")
                    response = client.get(f"/mathnotes/{filepath}")
                elif endpoint == "definition_index":
                    response = client.get("/definition-index")
                elif endpoint == "demo_viewer":
                    response = client.get("/demo-viewer")
                elif endpoint == "sitemap":
                    response = client.get("/sitemap.xml")
                else:
                    return None
                    
                if response.status_code == 200:
                    return response.get_data(as_text=True)
                elif response.status_code in [301, 302]:
                    # Handle redirects
                    location = response.headers.get("Location", "")
                    print(f"  Redirect from {endpoint} to {location}")
                    return None
                else:
                    print(f"  Error {response.status_code} for {endpoint}")
                    return None
                    
    def generate_homepage(self):
        """Generate the main homepage."""
        print("Generating homepage...")
        html = self.render_page("homepage")
        if html:
            self.save_page("", html)
            
    def generate_mathnotes_index(self):
        """Generate the mathnotes section index."""
        print("Generating mathnotes index...")
        html = self.render_page("index")
        if html:
            self.save_page("mathnotes", html)
            
    def generate_content_pages(self):
        """Generate all content pages from markdown files."""
        print("Generating content pages...")
        
        # Get all canonical URLs from the mapper
        for canonical_url in self.url_mapper.url_mappings:
            if canonical_url not in self.processed_urls:
                print(f"  Processing: {canonical_url}")
                html = self.render_page("serve_content", filepath=canonical_url)
                if html:
                    self.save_page(f"mathnotes/{canonical_url}", html)
                    self.processed_urls.add(canonical_url)
                    
    def generate_special_pages(self):
        """Generate special pages like definition index and demo viewer."""
        print("Generating special pages...")
        
        # Definition index
        html = self.render_page("definition_index")
        if html:
            self.save_page("definition-index", html)
            
        # Demo viewer
        html = self.render_page("demo_viewer")
        if html:
            self.save_page("demo-viewer", html)
            
    def generate_sitemap(self):
        """Generate sitemap.xml."""
        print("Generating sitemap...")
        xml = self.render_page("sitemap")
        if xml:
            output_path = self.output_dir / "sitemap.xml"
            # Sitemap should keep absolute URLs, don't process
            output_path.write_text(xml, encoding="utf-8")
            print(f"  Generated: {output_path}")
            
    def copy_root_files(self):
        """Copy root files like favicon and robots.txt."""
        root_files = ["favicon.ico", "robots.txt"]
        for filename in root_files:
            src = Path(filename)
            if src.exists():
                dst = self.output_dir / filename
                shutil.copy2(src, dst)
                print(f"  Copied: {filename}")
                
    def generate_404_page(self):
        """Generate 404 error page."""
        print("Generating 404 page...")
        with self.app.test_client() as client:
            with self.app.app_context():
                # Trigger 404 handler
                response = client.get("/nonexistent-page-for-404")
                if response.status_code == 404:
                    html = response.get_data(as_text=True)
                    self.save_page("404", html)
                    
    def build(self):
        """Run the complete static site generation process."""
        print(f"Starting static site generation to {self.output_dir}")
        print("=" * 60)
        
        # Prepare output directory
        self.ensure_output_dir()
        
        # Copy static assets
        self.copy_static_assets()
        
        # Copy content assets (images, etc.)
        self.copy_content_assets()
        
        # Generate all pages
        self.generate_homepage()
        self.generate_mathnotes_index()
        self.generate_content_pages()
        self.generate_special_pages()
        self.generate_404_page()
        
        # Generate sitemap
        self.generate_sitemap()
        
        # Copy root files
        self.copy_root_files()
        
        print("=" * 60)
        print(f"Static site generation complete!")
        print(f"Output directory: {self.output_dir}")
        print(f"Total pages generated: {len(self.processed_urls) + 5}")  # +5 for special pages


def main():
    parser = argparse.ArgumentParser(description="Generate static site from Flask app")
    parser.add_argument(
        "-o", "--output",
        default="static-build",
        help="Output directory for static site (default: static-build)"
    )
    parser.add_argument(
        "--absolute-urls",
        action="store_true",
        help="Use absolute URLs instead of relative (default: use relative URLs)"
    )
    
    args = parser.parse_args()
    
    # Use relative URLs by default, absolute only if flag is set
    use_relative = not args.absolute_urls
    
    generator = StaticSiteGenerator(output_dir=args.output, use_relative_urls=use_relative)
    generator.build()


if __name__ == "__main__":
    main()