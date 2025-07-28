#!/usr/bin/env python3
import sys
import os
from typing import List, Dict, Optional, Union
from openai import OpenAI


class OpenAIImageAnalyzer:
    """Reusable OpenAI image analysis functionality."""
    
    def __init__(self, model: str = "gpt-4.1-mini", verbose: bool = False):
        try:
            self.client = OpenAI()
        except Exception as e:
            if "OPENAI_API_KEY" in str(e):
                raise ValueError("OPENAI_API_KEY environment variable not set. Please set it to use OpenAI models.")
            raise
        self.model = model
        self.verbose = verbose
    
    def create_file(self, file_path: str) -> str:
        """Upload a file to OpenAI and return the file ID."""
        with open(file_path, "rb") as file_content:
            result = self.client.files.create(
                file=file_content,
                purpose="vision",
            )
            return result.id
    
    def analyze_single_image(self, image_path: str, prompt: str) -> str:
        """Analyze a single image with a custom prompt."""
        file_id = self.create_file(image_path)
        
        response = self.client.responses.create(
            model=self.model,
            input=[{
                "role": "user",
                "content": [
                    {"type": "input_text", "text": prompt},
                    {
                        "type": "input_image",
                        "file_id": file_id,
                    },
                ],
            }],
        )
        
        return response.output_text
    
    def analyze_multiple_images(self, image_paths: List[str], prompt: str) -> str:
        """Analyze multiple images with a custom prompt."""
        # Upload all images
        file_ids = [self.create_file(path) for path in image_paths]
        
        # Build content array
        content = [{"type": "input_text", "text": prompt}]
        for file_id in file_ids:
            content.append({
                "type": "input_image",
                "file_id": file_id,
            })
        
        response = self.client.responses.create(
            model=self.model,
            input=[{
                "role": "user",
                "content": content,
            }],
        )
        
        return response.output_text
    
    def check_demo_scaling(self, desktop_path: str, mobile_path: str) -> str:
        """Check how well a demo scales between desktop and mobile."""
        prompt = (
            "Compare the desktop version (first image) and mobile version (second image) "
            "of this interactive demo page. These are full page screenshots showing the demo "
            "in context with surrounding content. Analyze:\n"
            "1. How well does the demo scale between viewports?\n"
            "2. Are all interactive elements properly visible and accessible in both versions?\n"
            "3. Does the demo maintain its functionality and visual clarity at both sizes?\n"
            "4. Are there any layout issues, overlapping elements, or cut-off content?\n"
            "5. Does the demo make good use of the available space in each viewport?\n"
            "6. Is the demo properly integrated with the page layout in both versions?\n"
            "Be specific about any scaling issues you observe."
        )
        
        return self.analyze_multiple_images([desktop_path, mobile_path], prompt)
    
    def describe_demo(self, image_path: str) -> str:
        """Get a description of what's in the demo screenshot."""
        prompt = "Describe what you see in this interactive demo screenshot. Focus on the visual elements, interactions, and what the demo appears to demonstrate."
        return self.analyze_single_image(image_path, prompt)
    
    def check_demo_standards(self, canvas_path: str, standards_content: Optional[str] = None) -> str:
        """Check if a demo meets standards."""
        prompt = (
            "You're analyzing a demo screenshot against standards. "
        )
        
        if standards_content:
            prompt += f"The standards are: {standards_content}\n"
        else:
            prompt += (
                "The standards define the dashed rectangle as the canvas. "
                "Analyze how the drawing elements interact with this specific border. "
            )
        
        prompt += (
            "Does the demo meet the standards? "
            "Be very thorough and precise in your measurements."
        )
        
        return self.analyze_single_image(canvas_path, prompt)
    
    def check_dark_mode_compatibility(self, light_path: str, dark_path: str) -> str:
        """Check if a demo looks good in both light and dark modes."""
        prompt = (
            "Compare the light mode (first image) and dark mode (second image) versions "
            "of this interactive demo page. These are full page screenshots showing the demo "
            "in context with surrounding content. Analyze:\n"
            "1. Are all visual elements clearly visible in both modes?\n"
            "2. Is there sufficient contrast for text, UI elements, and interactive components?\n"
            "3. Are colors appropriately adapted (not just inverted) for each mode?\n"
            "4. Do any elements become hard to see or disappear in either mode?\n"
            "5. Is the visual hierarchy maintained in both modes?\n"
            "6. Are there any specific issues with canvas elements, borders, or overlays?\n"
            "7. Does the demo maintain its visual appeal and usability in both modes?\n"
            "Be specific about any visibility or contrast issues you observe."
        )
        
        return self.analyze_multiple_images([light_path, dark_path], prompt)


def main():
    """Command line interface for the analyzer."""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Single image: python openai-image-analysis.py <image_path> [prompt]")
        print("  Compare scaling: python openai-image-analysis.py --scale <desktop_image> <mobile_image>")
        print("  Describe demo: python openai-image-analysis.py --describe <image_path>")
        sys.exit(1)
    
    analyzer = OpenAIImageAnalyzer()
    
    if sys.argv[1] == "--scale":
        if len(sys.argv) != 4:
            print("Usage: python openai-image-analysis.py --scale <desktop_image> <mobile_image>")
            sys.exit(1)
        result = analyzer.check_demo_scaling(sys.argv[2], sys.argv[3])
    
    elif sys.argv[1] == "--describe":
        if len(sys.argv) != 3:
            print("Usage: python openai-image-analysis.py --describe <image_path>")
            sys.exit(1)
        result = analyzer.describe_demo(sys.argv[2])
    
    else:
        # Single image with optional custom prompt
        image_path = sys.argv[1]
        prompt = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else "What's in this image?"
        result = analyzer.analyze_single_image(image_path, prompt)
    
    print(result)


if __name__ == "__main__":
    main()
