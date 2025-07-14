#!/usr/bin/env python3
"""Test Vite integration with Playwright"""

import subprocess
import time
from playwright.sync_api import sync_playwright

def test_vite_integration():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        # Enable console logging
        page.on("console", lambda msg: print(f"Console {msg.type}: {msg.text}"))
        
        # Navigate to the home page
        page.goto("http://localhost:5000")
        
        # Wait for page to load
        page.wait_for_load_state("networkidle")
        
        # Check for Vite client script
        vite_client = page.locator('script[src*="localhost:5173"]')
        assert vite_client.count() > 0, "Vite client script not found"
        
        # Check console for Vite connection
        # Wait a bit for Vite to connect
        time.sleep(2)
        
        # Check that there are no CSP errors in console
        console_errors = []
        page.on("pageerror", lambda err: console_errors.append(str(err)))
        
        # Reload to catch any errors
        page.reload()
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        
        # Check for specific Vite scripts
        vite_scripts = page.locator('script[src*="5173"]').all()
        print(f"Found {len(vite_scripts)} Vite scripts")
        for script in vite_scripts:
            src = script.get_attribute("src")
            print(f"  Script: {src}")
        
        # Check for CSP violations
        csp_errors = [err for err in console_errors if "Content Security Policy" in err]
        if csp_errors:
            print("CSP Errors found:")
            for err in csp_errors:
                print(f"  {err}")
        
        # Get page content for debugging
        title = page.title()
        print(f"Page title: {title}")
        
        # Close browser
        browser.close()
        
        # Assert no CSP errors
        assert len(csp_errors) == 0, f"CSP errors found: {csp_errors}"
        print("✓ Vite integration test passed!")

if __name__ == "__main__":
    test_vite_integration()