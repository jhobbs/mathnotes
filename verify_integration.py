#!/usr/bin/env python3
"""
Verify that the direct demo integration is working correctly.
"""

import requests
import sys

def check_integration():
    url = "http://localhost:5000/mathnotes/physics/electric-fields"
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        
        content = response.text
        
        # Check for signs of direct integration
        if 'demo-component' in content:
            print("✓ Found demo-component class - direct integration active!")
            
            # Check for the demo content
            if 'id="field"' in content:
                print("✓ Found field div - demo content integrated!")
            else:
                print("✗ Field div not found in integrated content")
                
            # Check for P5.js script
            if 'p5@1.6.0' in content:
                print("✓ P5.js library reference found!")
            else:
                print("✗ P5.js library reference not found")
                
            # Check for demo script
            if 'field.js' in content or 'field-integrated.js' in content:
                print("✓ Demo script reference found!")
            else:
                print("✗ Demo script reference not found")
                
        elif 'demo-container' in content and 'iframe' in content:
            print("✗ Found demo-container with iframe - using traditional approach")
            print("  Make sure ENABLE_DIRECT_DEMOS=true and electric-field.html is in whitelist")
        else:
            print("✗ No demo found in content")
            
        # Print a snippet to debug
        print("\nContent snippet around demo:")
        import re
        demo_match = re.search(r'(demo-component|demo-container).{0,500}', content, re.DOTALL)
        if demo_match:
            print(demo_match.group(0)[:500] + "...")
            
    except requests.exceptions.RequestException as e:
        print(f"✗ Error fetching page: {e}")
        print("  Make sure the app is running at http://localhost:5000")
        sys.exit(1)

if __name__ == "__main__":
    check_integration()