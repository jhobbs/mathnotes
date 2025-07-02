"""Centralized utilities for protecting and restoring math content in markdown.

This module provides unified functions for temporarily replacing math expressions
with placeholders during markdown processing to prevent them from being interpreted
as markdown syntax.
"""

import re
from typing import Dict, Tuple, Optional


class MathProtector:
    """Handles protection and restoration of math content using placeholders."""
    
    def __init__(self, prefix: str = "MATH"):
        """Initialize with a specific placeholder prefix.
        
        Args:
            prefix: The prefix to use for placeholders (e.g., "MATH", "CHILDMATH", "BLOCKMATH")
        """
        self.prefix = prefix
        self.display_counter = 0
        self.inline_counter = 0
        self.display_math: Dict[str, str] = {}
        self.inline_math: Dict[str, str] = {}
    
    def protect_math(self, content: str) -> str:
        """Protect both display and inline math in content.
        
        Args:
            content: The markdown content containing math expressions
            
        Returns:
            Content with math replaced by placeholders
        """
        # First protect display math ($$...$$)
        content = self._protect_display_math(content)
        # Then protect inline math ($...$)
        content = self._protect_inline_math(content)
        return content
    
    def restore_math(self, content: str) -> str:
        """Restore all protected math content.
        
        Args:
            content: The content with math placeholders
            
        Returns:
            Content with placeholders replaced by original math
        """
        # Restore display math
        for placeholder, math_content in self.display_math.items():
            content = content.replace(placeholder, math_content)
        
        # Restore inline math  
        for placeholder, math_content in self.inline_math.items():
            content = content.replace(placeholder, math_content)
            
        return content
    
    def _protect_display_math(self, content: str) -> str:
        """Replace display math ($$..$$) with placeholders."""
        def replace_display_math(match):
            math_content = match.group(0)
            placeholder = f"{self.prefix}D{self.display_counter}PLACEHOLDER"
            self.display_math[placeholder] = math_content
            self.display_counter += 1
            return placeholder
        
        # Match $$...$$ including newlines
        pattern = re.compile(r'\$\$.*?\$\$', re.DOTALL)
        return pattern.sub(replace_display_math, content)
    
    def _protect_inline_math(self, content: str) -> str:
        """Replace inline math ($...$) with placeholders."""
        def replace_inline_math(match):
            math_content = match.group(0)
            placeholder = f"{self.prefix}I{self.inline_counter}PLACEHOLDER"
            self.inline_math[placeholder] = math_content
            self.inline_counter += 1
            return placeholder
        
        # Match $...$ but not $$
        pattern = re.compile(r'(?<!\$)\$(?!\$).*?\$(?!\$)', re.DOTALL)
        return pattern.sub(replace_inline_math, content)
    
    def fix_math_backslashes(self, content: str) -> str:
        """Fix escaped backslashes in LaTeX content.
        
        Converts \\\\ back to \\ for proper LaTeX rendering.
        
        Args:
            content: Content that may have escaped backslashes
            
        Returns:
            Content with backslashes fixed
        """
        # Fix within display math
        content = re.sub(
            r'(\$\$.*?\$\$)',
            lambda m: m.group(1).replace('\\\\', '\\'),
            content,
            flags=re.DOTALL
        )
        
        # Fix within inline math
        content = re.sub(
            r'(?<!\$)(\$(?!\$).*?\$)(?!\$)',
            lambda m: m.group(1).replace('\\\\', '\\'),
            content,
            flags=re.DOTALL
        )
        
        return content
    
    def reset(self):
        """Reset counters and clear stored math content."""
        self.display_counter = 0
        self.inline_counter = 0
        self.display_math.clear()
        self.inline_math.clear()


# Convenience functions for backward compatibility
def protect_math(content: str, prefix: str = "MATH") -> Tuple[str, MathProtector]:
    """Protect math content and return both the protected content and the protector instance.
    
    Args:
        content: The markdown content containing math
        prefix: The placeholder prefix to use
        
    Returns:
        Tuple of (protected_content, protector_instance)
    """
    protector = MathProtector(prefix)
    protected = protector.protect_math(content)
    return protected, protector


def restore_math(content: str, protector: MathProtector) -> str:
    """Restore math content using a protector instance.
    
    Args:
        content: The content with placeholders
        protector: The MathProtector instance that did the protection
        
    Returns:
        Content with math restored
    """
    return protector.restore_math(content)