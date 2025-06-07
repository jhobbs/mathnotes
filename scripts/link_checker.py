#!/usr/bin/env python3
"""
Link checker for mathnotes site.
Crawls all pages and checks for broken links and 404s.
"""

import requests
import re
import sys
import time
from urllib.parse import urljoin, urlparse
from collections import deque
from bs4 import BeautifulSoup

class LinkChecker:
    def __init__(self, base_url):
        self.base_url = base_url.rstrip('/')
        self.visited = set()
        self.broken_links = []
        self.all_links = set()
        self.session = requests.Session()
        self.session.timeout = 10
        
    def is_internal_link(self, url):
        """Check if URL is internal to the site."""
        parsed = urlparse(url)
        return not parsed.netloc or parsed.netloc == urlparse(self.base_url).netloc
    
    def normalize_url(self, url):
        """Normalize URL for comparison."""
        # Remove fragment
        if '#' in url:
            url = url[:url.index('#')]
        # Remove trailing slash for comparison
        return url.rstrip('/')
    
    def get_links_from_page(self, url):
        """Extract all links from a page."""
        try:
            print(f"Checking page: {url}")
            response = self.session.get(url)
            
            if response.status_code != 200:
                self.broken_links.append({
                    'url': url,
                    'status': response.status_code,
                    'error': f"HTTP {response.status_code}"
                })
                return []
            
            soup = BeautifulSoup(response.text, 'html.parser')
            links = []
            
            # Find all anchor tags with href
            for link in soup.find_all('a', href=True):
                href = link['href']
                full_url = urljoin(url, href)
                
                if self.is_internal_link(full_url):
                    links.append(self.normalize_url(full_url))
            
            # Find all iframe sources (for demos)
            for iframe in soup.find_all('iframe', src=True):
                src = iframe['src']
                full_url = urljoin(url, src)
                
                if self.is_internal_link(full_url):
                    links.append(self.normalize_url(full_url))
            
            return list(set(links))  # Remove duplicates
            
        except Exception as e:
            self.broken_links.append({
                'url': url,
                'status': 'ERROR',
                'error': str(e)
            })
            return []
    
    def check_link(self, url):
        """Check if a single link is working."""
        try:
            response = self.session.head(url, allow_redirects=True)
            if response.status_code >= 400:
                # Try GET request if HEAD fails
                response = self.session.get(url)
            
            if response.status_code >= 400:
                self.broken_links.append({
                    'url': url,
                    'status': response.status_code,
                    'error': f"HTTP {response.status_code}"
                })
                return False
            return True
            
        except Exception as e:
            self.broken_links.append({
                'url': url,
                'status': 'ERROR', 
                'error': str(e)
            })
            return False
    
    def crawl_site(self):
        """Crawl the entire site starting from base URL."""
        to_visit = deque([self.base_url])
        
        while to_visit:
            current_url = to_visit.popleft()
            current_url = self.normalize_url(current_url)
            
            if current_url in self.visited:
                continue
                
            self.visited.add(current_url)
            
            # Get links from this page
            page_links = self.get_links_from_page(current_url)
            
            for link in page_links:
                self.all_links.add(link)
                
                # Add to visit queue if we haven't visited yet
                if link not in self.visited and link not in to_visit:
                    to_visit.append(link)
            
            # Small delay to be nice to the server
            time.sleep(0.1)
    
    def check_all_links(self):
        """Check all discovered links."""
        print(f"\nChecking {len(self.all_links)} unique links...")
        
        for link in sorted(self.all_links):
            if link not in self.visited:
                print(f"Checking link: {link}")
                self.check_link(link)
                time.sleep(0.05)  # Small delay
    
    def report_results(self):
        """Print the results of the link check."""
        print(f"\n{'='*60}")
        print("LINK CHECK RESULTS")
        print(f"{'='*60}")
        print(f"Total pages crawled: {len(self.visited)}")
        print(f"Total links found: {len(self.all_links)}")
        print(f"Broken links: {len(self.broken_links)}")
        
        if self.broken_links:
            print(f"\n{'BROKEN LINKS:'}")
            print("-" * 40)
            for broken in self.broken_links:
                print(f"❌ {broken['url']}")
                print(f"   Status: {broken['status']}")
                print(f"   Error: {broken['error']}")
                print()
        else:
            print("\n✅ All links are working!")
        
        return len(self.broken_links) == 0

def main():
    base_url = "http://localhost:5000"
    
    print("Starting link check...")
    print(f"Base URL: {base_url}")
    
    checker = LinkChecker(base_url)
    
    # First crawl the site to discover all pages
    print("\nCrawling site to discover pages...")
    checker.crawl_site()
    
    # Then check all discovered links
    checker.check_all_links()
    
    # Report results
    success = checker.report_results()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()