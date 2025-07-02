"""Unit tests for the centralized math utilities."""

import sys
import os
# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from mathnotes.math_utils import MathProtector, protect_math, restore_math


class TestMathProtector:
    """Test cases for the MathProtector class."""
    
    def test_protect_display_math(self):
        """Test protection of display math expressions."""
        protector = MathProtector()
        content = "Here is some text $$x = y^2$$ and more text."
        
        protected = protector.protect_math(content)
        
        assert "$$x = y^2$$" not in protected
        assert "MATHD0PLACEHOLDER" in protected
        assert "Here is some text" in protected
        assert "and more text." in protected
    
    def test_protect_inline_math(self):
        """Test protection of inline math expressions."""
        protector = MathProtector()
        content = "The equation $x = y^2$ is simple."
        
        protected = protector.protect_math(content)
        
        assert "$x = y^2$" not in protected
        assert "MATHI0PLACEHOLDER" in protected
        assert "The equation" in protected
        assert "is simple." in protected
    
    def test_protect_mixed_math(self):
        """Test protection of both display and inline math."""
        protector = MathProtector()
        content = r"""
        Here is inline math $a + b = c$ and display math:
        $$
        \int_0^1 x^2 dx = \frac{1}{3}
        $$
        And more inline $f(x) = x^2$.
        """
        
        protected = protector.protect_math(content)
        
        assert "$a + b = c$" not in protected
        assert "$f(x) = x^2$" not in protected
        assert "$$" not in protected
        assert "MATHD0PLACEHOLDER" in protected
        assert "MATHI0PLACEHOLDER" in protected
        assert "MATHI1PLACEHOLDER" in protected
    
    def test_restore_math(self):
        """Test restoration of protected math."""
        protector = MathProtector()
        content = "Text with $x = y$ and $$a = b + c$$ math."
        
        protected = protector.protect_math(content)
        restored = protector.restore_math(protected)
        
        assert restored == content
    
    def test_custom_prefix(self):
        """Test using custom placeholder prefixes."""
        protector = MathProtector(prefix="CUSTOM")
        content = "Math: $x = y$ and $$z = w$$"
        
        protected = protector.protect_math(content)
        
        assert "CUSTOMD0PLACEHOLDER" in protected
        assert "CUSTOMI0PLACEHOLDER" in protected
        assert "MATHD0PLACEHOLDER" not in protected
    
    def test_nested_dollars_handling(self):
        """Test that $$ is not matched by inline math pattern."""
        protector = MathProtector()
        content = "Display: $$x = y$$ and inline: $a = b$"
        
        protected = protector.protect_math(content)
        restored = protector.restore_math(protected)
        
        assert restored == content
        # Ensure display math was protected first
        assert protector.display_counter == 1
        assert protector.inline_counter == 1
    
    def test_fix_math_backslashes(self):
        """Test fixing escaped backslashes in LaTeX."""
        protector = MathProtector()
        
        # Test display math with matrix/cases environments
        # Input has double backslashes that should be converted to single
        content = r"""$$
\begin{cases}
x + y = 5\\\\
x - y = 1
\end{cases}
$$"""
        
        fixed = protector.fix_math_backslashes(content)
        assert r"x + y = 5\\" in fixed
        assert r"x - y = 1" in fixed
        
        # Test inline math
        inline_content = r"The equation $a \\\\ b$ shows a line break."
        fixed_inline = protector.fix_math_backslashes(inline_content)
        assert r"$a \\ b$" in fixed_inline
    
    def test_reset(self):
        """Test resetting the protector state."""
        protector = MathProtector()
        content = "Math: $x = y$"
        
        protector.protect_math(content)
        assert protector.inline_counter == 1
        assert len(protector.inline_math) == 1
        
        protector.reset()
        assert protector.inline_counter == 0
        assert protector.display_counter == 0
        assert len(protector.inline_math) == 0
        assert len(protector.display_math) == 0
    
    def test_multiline_display_math(self):
        """Test handling of multiline display math."""
        protector = MathProtector()
        content = r"""
        $$
        \begin{align}
        x &= y + z \\
        a &= b + c
        \end{align}
        $$
        """
        
        protected = protector.protect_math(content)
        restored = protector.restore_math(protected)
        
        # Should preserve the multiline structure
        assert "\\begin{align}" in restored
        assert "\\end{align}" in restored
        assert content.strip() == restored.strip()
    
    def test_empty_content(self):
        """Test handling of empty content."""
        protector = MathProtector()
        
        assert protector.protect_math("") == ""
        assert protector.restore_math("") == ""
    
    def test_no_math_content(self):
        """Test content with no math expressions."""
        protector = MathProtector()
        content = "This is just plain text with no math."
        
        protected = protector.protect_math(content)
        assert protected == content
        
        restored = protector.restore_math(protected)
        assert restored == content


class TestConvenienceFunctions:
    """Test the convenience functions for backward compatibility."""
    
    def test_protect_math_function(self):
        """Test the protect_math convenience function."""
        content = "Math: $x = y$ and $$z = w$$"
        protected, protector = protect_math(content)
        
        assert "MATHD0PLACEHOLDER" in protected
        assert "MATHI0PLACEHOLDER" in protected
        assert isinstance(protector, MathProtector)
    
    def test_restore_math_function(self):
        """Test the restore_math convenience function."""
        content = "Math: $x = y$ and $$z = w$$"
        protected, protector = protect_math(content)
        restored = restore_math(protected, protector)
        
        assert restored == content
    
    def test_with_custom_prefix(self):
        """Test convenience functions with custom prefix."""
        content = "Math: $x = y$"
        protected, protector = protect_math(content, prefix="TEST")
        
        assert "TESTI0PLACEHOLDER" in protected
        assert protector.prefix == "TEST"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])