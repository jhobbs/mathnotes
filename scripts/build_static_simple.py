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

from mathnotes.sitegenerator.builder import SiteBuilder

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Build static site')
    parser.add_argument('--output', default='static-build', help='Output directory')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Build the site
    builder = SiteBuilder(output_dir=args.output)
    
    builder.build()
    return 0


if __name__ == '__main__':
    sys.exit(main())
