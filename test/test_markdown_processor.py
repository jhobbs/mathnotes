"""Unit tests for the markdown processor."""

import sys
import os

# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from unittest.mock import Mock
from mathnotes.markdown_processor import MarkdownProcessor


class TestMarkdownProcessor:
    """Test cases for the MarkdownProcessor class."""

    def setup_method(self):
        """Set up test fixtures."""
        self.url_mapper = Mock()
        self.url_mapper.url_mappings = {}
        self.block_index = Mock()
        self.processor = MarkdownProcessor(self.url_mapper, self.block_index)

    def test_fix_relative_image_paths_external_urls(self):
        """Test that external URLs are not modified."""
        html_content = """
        <img src="https://example.com/image.png" alt="External">
        <img src="http://example.com/image.jpg" alt="External HTTP">
        <img src="data:image/png;base64,..." alt="Data URI">
        """

        result = self.processor._fix_relative_image_paths(html_content, "content/test.md")

        assert 'src="https://example.com/image.png"' in result
        assert 'src="http://example.com/image.jpg"' in result
        assert 'src="data:image/png;base64,..."' in result

    def test_fix_relative_image_paths_already_absolute(self):
        """Test that paths already under /mathnotes/ are not modified."""
        html_content = """
        <img src="/mathnotes/algebra/image.png" alt="Already absolute">
        <img src="/mathnotes/complex-analysis/diagram.jpg">
        """

        result = self.processor._fix_relative_image_paths(html_content, "content/test.md")

        assert 'src="/mathnotes/algebra/image.png"' in result
        assert 'src="/mathnotes/complex-analysis/diagram.jpg"' in result

    def test_fix_relative_image_paths_relative_same_dir(self):
        """Test relative paths in the same directory."""
        html_content = """
        <img src="diagram.png" alt="Same directory">
        <img src="figure.jpg">
        """

        result = self.processor._fix_relative_image_paths(html_content, "content/algebra/groups.md")

        assert 'src="/mathnotes/algebra/diagram.png"' in result
        assert 'src="/mathnotes/algebra/figure.jpg"' in result

    def test_fix_relative_image_paths_absolute_not_mathnotes(self):
        """Test that absolute paths without /mathnotes/ are left unchanged.
        
        Note: This pattern doesn't exist in the actual codebase - all absolute
        paths already have /mathnotes/ prefix. This test documents the behavior."""
        html_content = """
        <img src="/images/diagram.png" alt="Absolute">
        <img src="/static/figure.jpg">
        """

        result = self.processor._fix_relative_image_paths(html_content, "content/test.md")

        # Our simple implementation leaves these unchanged - they're absolute paths
        assert 'src="/images/diagram.png"' in result
        assert 'src="/static/figure.jpg"' in result

    def test_fix_relative_image_paths_nested_directories(self):
        """Test relative paths in nested directories."""
        html_content = '<img src="image.png" alt="Nested">'

        result = self.processor._fix_relative_image_paths(
            html_content, "content/differential-equations/pde/heat.md"
        )

        assert 'src="/mathnotes/differential-equations/pde/image.png"' in result

    def test_fix_relative_image_paths_with_attributes(self):
        """Test that other image attributes are preserved."""
        html_content = """
        <img class="diagram" src="test.png" width="300" height="200" alt="Test">
        <img id="fig1" class="border" src="figure.jpg">
        """

        result = self.processor._fix_relative_image_paths(html_content, "content/test.md")

        assert (
            '<img class="diagram" src="/mathnotes/test.png" width="300" height="200" alt="Test">'
            in result
        )
        assert (
            '<img id="fig1" class="border" src="/mathnotes/figure.jpg">' in result
        )

    def test_fix_relative_image_paths_root_directory(self):
        """Test relative paths when file is in content root."""
        html_content = '<img src="image.png">'

        result = self.processor._fix_relative_image_paths(html_content, "content/index.md")

        # urljoin normalizes the path correctly
        assert 'src="/mathnotes/image.png"' in result

    def test_fix_relative_image_paths_no_content_prefix(self):
        """Test handling files without content/ prefix in path."""
        html_content = '<img src="image.png">'

        result = self.processor._fix_relative_image_paths(html_content, "algebra/groups.md")

        assert 'src="/mathnotes/algebra/image.png"' in result
