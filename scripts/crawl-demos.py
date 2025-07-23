#!/usr/bin/env python3
"""
Demo screenshot crawler - Python version
Captures screenshots of demos in different viewports and optionally analyzes them with AI.
"""

import argparse
import subprocess
import sys
import os
import re
from pathlib import Path
from typing import Optional, List, Tuple
import shlex


class DemoCrawler:
    DEFAULT_URL = "http://web-dev:5000"
    GEMINI_CMD = "gemini"
    
    def __init__(self):
        self.verbose = False
        self.viewport_for_analysis = "desktop"
        
    def parse_args(self) -> argparse.Namespace:
        """Parse command line arguments."""
        parser = argparse.ArgumentParser(
            description="Capture demo screenshots and optionally analyze with AI",
            formatter_class=argparse.RawDescriptionHelpFormatter,
            epilog="""
Examples:
  %(prog)s                              # Capture all demo screenshots (both viewports)
  %(prog)s -o ./screenshots             # Custom output directory
  %(prog)s --demo electric-field        # Capture single demo (both viewports)
  %(prog)s -d game-of-life --viewport mobile    # Mobile only
  %(prog)s --viewport desktop           # All demos, desktop only
  %(prog)s -d game-of-life --describe   # Get AI description
  %(prog)s -d pendulum --ask 'what physics concepts are illustrated?'
  %(prog)s -d pendulum --check-standards
            """
        )
        
        parser.add_argument('-u', '--url', default=self.DEFAULT_URL,
                          help=f'Base URL to crawl (default: {self.DEFAULT_URL})')
        parser.add_argument('-o', '--output', default='./demo-screenshots',
                          help='Output directory for screenshots (default: ./demo-screenshots)')
        parser.add_argument('--show-browser', action='store_true',
                          help='Show the browser window')
        parser.add_argument('-v', '--verbose', action='store_true',
                          help='Verbose output')
        parser.add_argument('-c', '--concurrency', type=int, default=1,
                          help='Number of concurrent pages (default: 1)')
        parser.add_argument('-d', '--demo', 
                          help='Capture only a specific demo')
        parser.add_argument('-vp', '--viewport', choices=['desktop', 'mobile', 'both'],
                          help='Viewport to capture (default: both)')
        
        # AI analysis options
        parser.add_argument('--describe', action='store_true',
                          help='Get AI description of base screenshot after capture')
        parser.add_argument('--ask', 
                          help='Ask a custom question about the screenshots. '
                               'Use $BASE_PATH, $FULL_PATH, or $CANVAS_PATH in questions')
        parser.add_argument('--check-standards', action='store_true',
                          help='Check if demo meets standards in DEMO-STANDARD.md')
        
        return parser.parse_args()
    
    def build_docker_command(self, args: argparse.Namespace) -> List[str]:
        """Build the docker-compose command."""
        cmd = [
            'docker-compose', '-f', 'docker-compose.dev.yml', 'run', '--rm',
            '-v', f'{os.getcwd()}/demo-screenshots:/usr/src/app/crawler/demo-screenshots',
            'crawler', 'npx', 'tsx', 'crawl-demos.ts'
        ]
        
        # Add URL
        cmd.extend(['--url', args.url])
        
        # Add other options
        if args.output != './demo-screenshots':
            cmd.extend(['--output', args.output])
        
        if args.show_browser:
            cmd.append('--show-browser')
            
        if args.verbose:
            cmd.append('--verbose')
            self.verbose = True
            
        if args.concurrency != 1:
            cmd.extend(['--concurrency', str(args.concurrency)])
            
        if args.demo:
            cmd.extend(['--demo', args.demo])
            
        if args.viewport:
            cmd.extend(['--viewport', args.viewport])
            # Set viewport for analysis
            if args.viewport in ['desktop', 'mobile']:
                self.viewport_for_analysis = args.viewport
        
        return cmd
    
    def run_crawler(self, cmd: List[str]) -> Tuple[int, str]:
        """Run the crawler command and capture output."""
        if self.verbose:
            print("Running demo crawler in Docker...")
            print(f"Command: {' '.join(cmd)}")
            print()
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            output = result.stdout + result.stderr
            return result.returncode, output
        except subprocess.CalledProcessError as e:
            return e.returncode, str(e)
    
    def extract_screenshot_paths(self, output: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """Extract screenshot paths from crawler output."""
        # Look for viewport-specific paths
        base_pattern = f"^{self.viewport_for_analysis}-base: (.+)$"
        full_pattern = f"^{self.viewport_for_analysis}-full: (.+)$"
        canvas_pattern = f"^{self.viewport_for_analysis}-canvas: (.+)$"
        
        base_path = None
        full_path = None
        canvas_path = None
        
        for line in output.splitlines():
            base_match = re.match(base_pattern, line)
            if base_match:
                base_path = base_match.group(1)
                
            full_match = re.match(full_pattern, line)
            if full_match:
                full_path = full_match.group(1)
                
            canvas_match = re.match(canvas_pattern, line)
            if canvas_match:
                canvas_path = canvas_match.group(1)
        
        return base_path, full_path, canvas_path
    
    def run_ai_analysis(self, base_path: str, full_path: str, canvas_path: str, 
                       args: argparse.Namespace) -> int:
        """Run AI analysis on the screenshots."""
        if args.describe:
            # Simple description mode
            cmd = [self.GEMINI_CMD, '-p', f'describe what you see in @{base_path}']
            
        elif args.check_standards:
            # Check standards mode
            standards_file = "/home/jason/mathnotes/DEMO-STANDARD.md"
            prompt = (
                "You're a multimodal model. You can process images and answer questions about them. "
                f"The file @{standards_file} defines the dashed rectangle as the canvas. "
                "Analyze how the drawing elements interact with this specific border. "
                f"Does the demo in @{canvas_path} meet the standards? "
                "Be very thorough and precise in your measurements."
            )
            cmd = [self.GEMINI_CMD, '-p', prompt]
            
        elif args.ask:
            # Custom question mode - replace placeholders
            question = args.ask
            question = question.replace('$BASE_PATH', base_path)
            question = question.replace('$FULL_PATH', full_path)
            question = question.replace('$CANVAS_PATH', canvas_path)
            cmd = [self.GEMINI_CMD, '-p', question]
            
        else:
            return 0
        
        # Run the command
        if self.verbose:
            print(f"Running AI analysis: {' '.join(cmd)}")
            
        result = subprocess.run(cmd)
        return result.returncode
    
    def run(self) -> int:
        """Main entry point."""
        args = self.parse_args()
        
        # Build and run docker command
        docker_cmd = self.build_docker_command(args)
        
        # Determine if we need to capture output for analysis
        need_analysis = args.describe or args.ask or args.check_standards
        
        if need_analysis:
            # Capture output to parse screenshot paths
            returncode, output = self.run_crawler(docker_cmd)
            
            if returncode != 0:
                print(output, file=sys.stderr)
                return returncode
            
            # Extract screenshot paths
            base_path, full_path, canvas_path = self.extract_screenshot_paths(output)
            
            if base_path and os.path.exists(base_path):
                # Run AI analysis
                ai_returncode = self.run_ai_analysis(base_path, full_path, canvas_path, args)
                
                if ai_returncode != 0:
                    print(f"Error: AI command failed with exit code {ai_returncode}", file=sys.stderr)
                    return ai_returncode
            else:
                # If something went wrong, show the error
                print(output, file=sys.stderr)
                return 1
                
        else:
            # Just run the crawler normally
            returncode = subprocess.call(docker_cmd)
            return returncode
        
        return 0


def main():
    crawler = DemoCrawler()
    sys.exit(crawler.run())


if __name__ == '__main__':
    main()