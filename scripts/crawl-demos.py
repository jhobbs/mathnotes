#!/usr/bin/env python3
"""
Demo screenshot crawler - Python version
Captures screenshots of demos in different viewports and optionally analyzes them with OpenAI.
"""

import argparse
import subprocess
import sys
import os
import re
from pathlib import Path
from typing import Optional, List, Tuple
import shlex

# Import the OpenAI analyzer
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib.util
spec = importlib.util.spec_from_file_location(
    "openai_image_analysis", 
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "openai-image-analysis.py")
)
openai_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(openai_module)
OpenAIImageAnalyzer = openai_module.OpenAIImageAnalyzer


class DemoCrawler:
    DEFAULT_URL = "http://web-dev:5000"
    
    def __init__(self):
        self.verbose = False
        self.viewport_for_analysis = "desktop"
        
    def parse_args(self) -> argparse.Namespace:
        """Parse command line arguments."""
        parser = argparse.ArgumentParser(
            description="Capture demo screenshots and optionally analyze with OpenAI vision models",
            formatter_class=argparse.RawDescriptionHelpFormatter,
            epilog="""
Examples:
  %(prog)s                              # Capture all demo screenshots (both viewports)
  %(prog)s -o ./screenshots             # Custom output directory
  %(prog)s --demo electric-field        # Capture single demo (both viewports)
  %(prog)s -d game-of-life --viewport mobile    # Mobile only
  %(prog)s --viewport desktop           # All demos, desktop only
  %(prog)s -d game-of-life --describe   # Get AI description with GPT-4.1-mini
  %(prog)s -d pendulum --ask 'what physics concepts are illustrated?'
  %(prog)s -d pendulum --check-standards
  %(prog)s -d electric-field --check-scaling  # Analyze mobile/desktop scaling
  %(prog)s -d pendulum --check-dark-mode  # Compare light vs dark mode visibility
  %(prog)s -d pendulum --describe --model gpt-4.1  # Use GPT-4.1 instead of default
  %(prog)s -d game-of-life --check-scaling --model gpt-4.1-mini  # Explicitly use GPT-4.1-mini
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
        parser.add_argument('--check-scaling', action='store_true',
                          help='Analyze how well demo handles scaling between mobile and desktop')
        parser.add_argument('--check-dark-mode', action='store_true',
                          help='Compare light mode vs dark mode to ensure visibility in both')
        parser.add_argument('--model', choices=['gpt-4.1-mini', 'gpt-4.1'],
                          default='gpt-4.1-mini',
                          help='OpenAI model to use for analysis (default: gpt-4.1-mini)')
        
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
            
        # Handle viewport selection
        viewport_to_use = args.viewport
        
        # Force both viewports for check-scaling mode
        if args.check_scaling:
            viewport_to_use = 'both'
            
        # For check-dark-mode, only pass --no-color-schemes if explicitly disabled
        # By default, we want to capture both light and dark modes
        if args.check_dark_mode:
            # Don't add --no-color-schemes, we want both color schemes
            pass
        elif not args.check_dark_mode and args.viewport:
            # Only if we're not checking dark mode and user specified viewport
            # we might want to add --no-color-schemes in the future if needed
            pass
            
        if viewport_to_use:
            cmd.extend(['--viewport', viewport_to_use])
            # Set viewport for analysis
            if viewport_to_use in ['desktop', 'mobile']:
                self.viewport_for_analysis = viewport_to_use
        
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
    
    def extract_screenshot_paths(self, output: str, check_scaling: bool = False, check_dark_mode: bool = False) -> dict:
        """Extract screenshot paths from crawler output."""
        paths = {}
        
        if check_dark_mode:
            # Extract both light and dark mode paths for the selected viewport
            viewport = self.viewport_for_analysis
            for mode in ['light', 'dark']:
                base_pattern = f"^{viewport}-{mode}-base: (.+)$"
                full_pattern = f"^{viewport}-{mode}-full: (.+)$"
                canvas_pattern = f"^{viewport}-{mode}-canvas: (.+)$"
                
                for line in output.splitlines():
                    base_match = re.match(base_pattern, line)
                    if base_match:
                        paths[f'{mode}_base'] = base_match.group(1)
                        
                    full_match = re.match(full_pattern, line)
                    if full_match:
                        paths[f'{mode}_full'] = full_match.group(1)
                        
                    canvas_match = re.match(canvas_pattern, line)
                    if canvas_match:
                        paths[f'{mode}_canvas'] = canvas_match.group(1)
        elif check_scaling:
            # Extract both mobile and desktop paths (handling light/dark variations)
            for viewport in ['mobile', 'desktop']:
                # Match patterns with optional color scheme (light/dark)
                base_pattern = f"^{viewport}-(light|dark)-base: (.+)$"
                full_pattern = f"^{viewport}-(light|dark)-full: (.+)$"
                canvas_pattern = f"^{viewport}-(light|dark)-canvas: (.+)$"
                
                for line in output.splitlines():
                    base_match = re.match(base_pattern, line)
                    if base_match:
                        # Use light variant by default for consistency
                        if base_match.group(1) == 'light':
                            paths[f'{viewport}_base'] = base_match.group(2)
                        
                    full_match = re.match(full_pattern, line)
                    if full_match:
                        if full_match.group(1) == 'light':
                            paths[f'{viewport}_full'] = full_match.group(2)
                        
                    canvas_match = re.match(canvas_pattern, line)
                    if canvas_match:
                        if canvas_match.group(1) == 'light':
                            paths[f'{viewport}_canvas'] = canvas_match.group(2)
        else:
            # Original behavior - single viewport (handling light/dark variations)
            base_pattern = f"^{self.viewport_for_analysis}-(light|dark)-base: (.+)$"
            full_pattern = f"^{self.viewport_for_analysis}-(light|dark)-full: (.+)$"
            canvas_pattern = f"^{self.viewport_for_analysis}-(light|dark)-canvas: (.+)$"
            
            for line in output.splitlines():
                base_match = re.match(base_pattern, line)
                if base_match:
                    # Use light variant by default for consistency
                    if base_match.group(1) == 'light':
                        paths['base'] = base_match.group(2)
                    
                full_match = re.match(full_pattern, line)
                if full_match:
                    if full_match.group(1) == 'light':
                        paths['full'] = full_match.group(2)
                    
                canvas_match = re.match(canvas_pattern, line)
                if canvas_match:
                    if canvas_match.group(1) == 'light':
                        paths['canvas'] = canvas_match.group(2)
        
        return paths
    
    def run_ai_analysis(self, paths: dict, args: argparse.Namespace) -> int:
        """Run AI analysis on the screenshots using OpenAI."""
        # Convert all paths to absolute paths
        abs_paths = {}
        for key, path in paths.items():
            if path and not os.path.isabs(path):
                abs_paths[key] = os.path.abspath(path)
            else:
                abs_paths[key] = path
        
        # Create analyzer with selected model
        try:
            analyzer = OpenAIImageAnalyzer(model=args.model, verbose=self.verbose)
        except Exception as e:
            print(f"Error initializing OpenAI analyzer: {e}", file=sys.stderr)
            return 1
        
        try:
            if args.describe:
                base_path = abs_paths.get('base', '')
                if not base_path or not os.path.exists(base_path):
                    print(f"Error: Base screenshot not found at {base_path}", file=sys.stderr)
                    return 1
                result = analyzer.describe_demo(base_path)
                
            elif args.check_standards:
                canvas_path = abs_paths.get('canvas', '')
                if not canvas_path or not os.path.exists(canvas_path):
                    print(f"Error: Canvas screenshot not found at {canvas_path}", file=sys.stderr)
                    return 1
                # Read standards file if it exists
                standards_file = "/home/jason/mathnotes/DEMO-STANDARD.md"
                standards_content = None
                if os.path.exists(standards_file):
                    with open(standards_file, 'r') as f:
                        standards_content = f.read()
                result = analyzer.check_demo_standards(canvas_path, standards_content)
                
            elif args.check_scaling:
                mobile_full = abs_paths.get('mobile_full', '')
                desktop_full = abs_paths.get('desktop_full', '')
                if not mobile_full or not os.path.exists(mobile_full):
                    print(f"Error: Mobile full page screenshot not found at {mobile_full}", file=sys.stderr)
                    return 1
                if not desktop_full or not os.path.exists(desktop_full):
                    print(f"Error: Desktop full page screenshot not found at {desktop_full}", file=sys.stderr)
                    return 1
                result = analyzer.check_demo_scaling(desktop_full, mobile_full)
                
            elif args.check_dark_mode:
                light_full = abs_paths.get('light_full', '')
                dark_full = abs_paths.get('dark_full', '')
                if not light_full or not os.path.exists(light_full):
                    print(f"Error: Light mode full page screenshot not found at {light_full}", file=sys.stderr)
                    return 1
                if not dark_full or not os.path.exists(dark_full):
                    print(f"Error: Dark mode full page screenshot not found at {dark_full}", file=sys.stderr)
                    return 1
                result = analyzer.check_dark_mode_compatibility(light_full, dark_full)
                
            elif args.ask:
                # Custom question - handle placeholders
                question = args.ask
                base_path = abs_paths.get('base', '')
                full_path = abs_paths.get('full', '')
                canvas_path = abs_paths.get('canvas', '')
                
                # Collect referenced images and update question text
                image_paths = []
                image_labels = []
                
                if '$BASE_PATH' in question:
                    if base_path and os.path.exists(base_path):
                        image_paths.append(base_path)
                        image_labels.append('base screenshot')
                        question = question.replace('$BASE_PATH', f'the {image_labels[-1]}')
                    else:
                        print(f"Warning: Base path referenced but not found: {base_path}", file=sys.stderr)
                        
                if '$FULL_PATH' in question:
                    if full_path and os.path.exists(full_path):
                        image_paths.append(full_path)
                        image_labels.append('full page screenshot')
                        question = question.replace('$FULL_PATH', f'the {image_labels[-1]}')
                    else:
                        print(f"Warning: Full path referenced but not found: {full_path}", file=sys.stderr)
                        
                if '$CANVAS_PATH' in question:
                    if canvas_path and os.path.exists(canvas_path):
                        image_paths.append(canvas_path)
                        image_labels.append('canvas screenshot')
                        question = question.replace('$CANVAS_PATH', f'the {image_labels[-1]}')
                    else:
                        print(f"Warning: Canvas path referenced but not found: {canvas_path}", file=sys.stderr)
                
                # If no specific images referenced, use base image
                if not image_paths:
                    if base_path and os.path.exists(base_path):
                        image_paths = [base_path]
                    else:
                        print("Error: No valid screenshot paths found", file=sys.stderr)
                        return 1
                
                # Analyze with appropriate method
                if self.verbose:
                    print(f"\n=== OpenAI Analysis Request ===", file=sys.stderr)
                    print(f"Model: {analyzer.model}", file=sys.stderr)
                    print(f"Images: {image_paths}", file=sys.stderr)
                    print(f"Prompt: {question}", file=sys.stderr)
                    print(f"==============================\n", file=sys.stderr)
                
                if len(image_paths) == 1:
                    result = analyzer.analyze_single_image(image_paths[0], question)
                else:
                    # Add context about which image is which
                    if image_labels:
                        question = f"{question}\n\nImages provided in order: {', '.join(image_labels)}"
                    result = analyzer.analyze_multiple_images(image_paths, question)
            else:
                # No analysis requested
                return 0
            
            print(result)
            return 0
            
        except Exception as e:
            print(f"Error during OpenAI analysis: {e}", file=sys.stderr)
            return 1
    
    def run(self) -> int:
        """Main entry point."""
        args = self.parse_args()
        
        # Build and run docker command
        docker_cmd = self.build_docker_command(args)
        
        # Determine if we need to capture output for analysis
        need_analysis = args.describe or args.ask or args.check_standards or args.check_scaling or args.check_dark_mode
        
        if need_analysis:
            # Capture output to parse screenshot paths
            returncode, output = self.run_crawler(docker_cmd)
            
            if returncode != 0:
                print(output, file=sys.stderr)
                return returncode
            
            # Extract screenshot paths
            paths = self.extract_screenshot_paths(output, args.check_scaling, args.check_dark_mode)
            
            # Validate we have the necessary paths
            if args.check_dark_mode:
                # For dark mode check, we need both light and dark full paths
                required_paths = ['light_full', 'dark_full']
                missing_paths = [p for p in required_paths if p not in paths or not os.path.exists(paths.get(p, ''))]
                
                if missing_paths:
                    print(f"Error: Missing required screenshots for dark mode check: {missing_paths}", file=sys.stderr)
                    print("Make sure the demo was captured with both light and dark color schemes.", file=sys.stderr)
                    print(output, file=sys.stderr)
                    return 1
            elif args.check_scaling:
                # For scaling check, we need both mobile and desktop full paths
                required_paths = ['mobile_full', 'desktop_full']
                missing_paths = [p for p in required_paths if p not in paths or not os.path.exists(paths.get(p, ''))]
                
                if missing_paths:
                    print(f"Error: Missing required screenshots for scaling check: {missing_paths}", file=sys.stderr)
                    print("Make sure the demo was captured with both mobile and desktop viewports.", file=sys.stderr)
                    print(output, file=sys.stderr)
                    return 1
            else:
                # For other modes, check if we have at least the base path
                base_key = 'base' if not args.check_scaling else f'{self.viewport_for_analysis}_base'
                if base_key not in paths or not os.path.exists(paths.get(base_key, '')):
                    print(output, file=sys.stderr)
                    return 1
            
            # Run AI analysis
            ai_returncode = self.run_ai_analysis(paths, args)
            
            if ai_returncode != 0:
                print(f"Error: AI command failed with exit code {ai_returncode}", file=sys.stderr)
                return ai_returncode
                
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

