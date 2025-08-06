#!/usr/bin/env python3
"""
Minimal static site build script.
"""

import sys
import os
import argparse
import logging

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from generator.builder import SiteBuilder

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Build static site')
    parser.add_argument('--output', default='static-build', help='Output directory')
    parser.add_argument('--base-url', default='', help='Base URL for the site')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Build the site
    builder = SiteBuilder(output_dir=args.output, base_url=args.base_url)
    
    try:
        builder.build()
        return 0
    except Exception as e:
        logging.error(f"Build failed: {e}", exc_info=True)
        return 1


if __name__ == '__main__':
    sys.exit(main())