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
from flask import g


class StaticSiteGenerator:
    def __init__(self, output_dir="static-build"):
        self.output_dir = Path(output_dir)
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
        
    def copy_static_assets(self):
        """Copy static assets to output directory."""
        static_src = Path("static")
        static_dst = self.output_dir / "static"
        
        if static_src.exists():
            print("Copying static assets...")
            shutil.copytree(static_src, static_dst, dirs_exist_ok=True)
            
    def save_page(self, url_path, html_content):
        """Save HTML content to appropriate file path."""
        # Remove leading slash if present
        url_path = url_path.lstrip("/")
        
        # Determine output path
        if url_path == "" or url_path == "mathnotes":
            output_path = self.output_dir / "index.html"
        elif url_path == "mathnotes/":
            output_path = self.output_dir / "mathnotes" / "index.html"
        else:
            # For paths like "mathnotes/algebra/groups", create "mathnotes/algebra/groups/index.html"
            output_path = self.output_dir / url_path / "index.html"
            
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
                
    def build_vite_assets(self):
        """Build Vite assets for production."""
        print("Building Vite assets...")
        import subprocess
        
        # Check if we're in Docker or have npm available
        try:
            # Try to build Vite assets
            result = subprocess.run(
                ["npm", "run", "build"],
                cwd="demos-framework",
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                print("  Vite build successful")
                # Copy built assets to static/dist
                vite_dist = Path("demos-framework/dist")
                static_dist = Path("static/dist")
                if vite_dist.exists():
                    if static_dist.exists():
                        shutil.rmtree(static_dist)
                    shutil.copytree(vite_dist, static_dist)
                    print("  Copied Vite dist to static/dist")
            else:
                print(f"  Vite build failed: {result.stderr}")
                print("  Continuing without Vite assets (will use existing static/dist if available)")
        except FileNotFoundError:
            print("  npm not found, skipping Vite build")
            print("  Using existing static/dist if available")
            
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
        
        # Build Vite assets first (if possible)
        self.build_vite_assets()
        
        # Copy static assets
        self.copy_static_assets()
        
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
        "--no-vite",
        action="store_true",
        help="Skip Vite build step"
    )
    
    args = parser.parse_args()
    
    generator = StaticSiteGenerator(output_dir=args.output)
    
    if args.no_vite:
        # Monkey patch to skip Vite build
        generator.build_vite_assets = lambda: print("Skipping Vite build (--no-vite flag)")
    
    generator.build()


if __name__ == "__main__":
    main()