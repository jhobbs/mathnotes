"""Unit tests for the centralized math utilities."""

import sys
import os
# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from mathnotes.math_utils import MathProtector, protect_math, restore_math, BlockReferenceProcessor
from mathnotes.structured_math import MathBlock, MathBlockType
from mathnotes.block_index import BlockIndex, BlockReference


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


class TestBlockReferenceProcessor:
    """Test cases for the BlockReferenceProcessor class."""
    
    def setup_method(self):
        """Set up test fixtures before each test method."""
        # Create some test blocks
        self.def_block = MathBlock(
            block_type=MathBlockType.DEFINITION,
            content="A metric space is...",
            title="Metric Space",
            label="metric-space"
        )
        
        self.theorem_block = MathBlock(
            block_type=MathBlockType.THEOREM,
            content="Every compact set is closed.",
            title="Compact sets are closed",
            label="compact-closed"
        )
        
        self.lemma_block = MathBlock(
            block_type=MathBlockType.LEMMA,
            content="If X is a metric space and...",
            title=None,  # No title, should use content snippet
            label="helper-lemma"
        )
        
        # Create block markers dictionary
        self.block_markers = {
            "MATHBLOCK0MARKER": self.def_block,
            "MATHBLOCK1MARKER": self.theorem_block,
            "MATHBLOCK2MARKER": self.lemma_block
        }
    
    def test_simple_reference_with_title(self):
        """Test @label reference to a block with a title."""
        processor = BlockReferenceProcessor(self.block_markers)
        content = "See @metric-space for the definition."
        
        result = processor.process_references(content)
        
        assert '<a href="#metric-space"' in result
        assert 'class="block-reference"' in result
        assert 'data-ref-type="definition"' in result
        assert 'data-ref-label="metric-space"' in result
        assert '>Metric Space</a>' in result
    
    def test_simple_reference_without_title(self):
        """Test @label reference to a block without a title (uses content snippet)."""
        processor = BlockReferenceProcessor(self.block_markers)
        content = "By @helper-lemma, we can conclude..."
        
        result = processor.process_references(content)
        
        assert '<a href="#helper-lemma"' in result
        assert '>If X is a metric space and...</a>' in result
    
    def test_typed_reference(self):
        """Test @type:label reference format."""
        processor = BlockReferenceProcessor(self.block_markers)
        content = "See @theorem:compact-closed for the proof."
        
        result = processor.process_references(content)
        
        assert '<a href="#compact-closed"' in result
        assert 'data-ref-type="theorem"' in result
        assert '>Compact sets are closed</a>' in result
    
    def test_typed_reference_wrong_type(self):
        """Test @type:label with wrong type shows error."""
        processor = BlockReferenceProcessor(self.block_markers)
        content = "See @lemma:metric-space for details."  # metric-space is a definition, not lemma
        
        result = processor.process_references(content)
        
        assert '<span class="block-reference-error"' in result
        assert 'data-ref="lemma:metric-space"' in result
        assert '>@lemma:metric-space</span>' in result
    
    def test_custom_text_reference(self):
        """Test @{custom text|label} format."""
        processor = BlockReferenceProcessor(self.block_markers)
        content = "In a @{topological space|metric-space}, distances are well-defined."
        
        result = processor.process_references(content)
        
        assert '<a href="#metric-space"' in result
        assert '>topological space</a>' in result  # Uses custom text
        assert 'data-ref-label="metric-space"' in result
    
    def test_custom_text_typed_reference(self):
        """Test @{custom text|type:label} format."""
        processor = BlockReferenceProcessor(self.block_markers)
        content = "This follows from @{the compactness theorem|theorem:compact-closed}."
        
        result = processor.process_references(content)
        
        assert '<a href="#compact-closed"' in result
        assert '>the compactness theorem</a>' in result
        assert 'data-ref-type="theorem"' in result
    
    def test_nonexistent_reference(self):
        """Test reference to non-existent label shows error."""
        processor = BlockReferenceProcessor(self.block_markers)
        content = "See @nonexistent for details."
        
        result = processor.process_references(content)
        
        assert '<span class="block-reference-error"' in result
        assert 'data-ref="nonexistent"' in result
        assert '>@nonexistent</span>' in result
    
    def test_custom_text_nonexistent_reference(self):
        """Test custom text reference to non-existent label shows error."""
        processor = BlockReferenceProcessor(self.block_markers)
        content = "See @{the missing theorem|nonexistent} for details."
        
        result = processor.process_references(content)
        
        assert '<span class="block-reference-error"' in result
        assert 'data-ref="nonexistent"' in result
        assert '>@{the missing theorem|nonexistent}</span>' in result
    
    def test_multiple_references(self):
        """Test multiple references in the same content."""
        processor = BlockReferenceProcessor(self.block_markers)
        content = "By @metric-space and @theorem:compact-closed, using @{our lemma|helper-lemma}."
        
        result = processor.process_references(content)
        
        # Check all three references are processed
        assert result.count('<a href=') == 3
        assert '>Metric Space</a>' in result
        assert '>Compact sets are closed</a>' in result
        assert '>our lemma</a>' in result
    
    def test_email_not_processed(self):
        """Test that email addresses are not processed as references."""
        processor = BlockReferenceProcessor(self.block_markers)
        content = "Contact user@example.com for details."
        
        result = processor.process_references(content)
        
        assert result == content  # Should remain unchanged
        assert 'block-reference' not in result
    
    def test_cross_file_reference_with_block_index(self):
        """Test reference to a block in another file using block index."""
        # Create a mock block index
        from unittest.mock import Mock
        mock_url_mapper = Mock()
        block_index = BlockIndex(mock_url_mapper)
        
        # Create a block that's in another file
        external_block = MathBlock(
            block_type=MathBlockType.DEFINITION,
            content="An open set is...",
            title="Open Set",
            label="open-set"
        )
        
        # Add it to the index as if it's from another file
        block_ref = BlockReference(
            block=external_block,
            file_path="/content/topology/basics.md",
            canonical_url="/mathnotes/topology/basics"
        )
        block_index.index["open-set"] = block_ref
        
        # Create processor with block index
        processor = BlockReferenceProcessor(
            self.block_markers,
            current_file="/content/analysis/compact.md",
            block_index=block_index
        )
        
        content = "An @open-set in a metric space..."
        result = processor.process_references(content)
        
        assert '<a href="/mathnotes/topology/basics#open-set"' in result
        assert '>Open Set</a>' in result
    
    def test_same_file_reference_with_block_index(self):
        """Test that references within the same file use local anchors."""
        # Create a mock block index
        from unittest.mock import Mock
        mock_url_mapper = Mock()
        block_index = BlockIndex(mock_url_mapper)
        
        # Create a block that's in the same file
        local_block = MathBlock(
            block_type=MathBlockType.THEOREM,
            content="Local theorem content",
            title="Local Theorem",
            label="local-thm"
        )
        
        # Add it to the index as if it's from the same file
        block_ref = BlockReference(
            block=local_block,
            file_path="/content/analysis/compact.md",
            canonical_url="/mathnotes/analysis/compact"
        )
        block_index.index["local-thm"] = block_ref
        
        # Create processor with block index
        processor = BlockReferenceProcessor(
            self.block_markers,
            current_file="/content/analysis/compact.md",
            block_index=block_index
        )
        
        content = "By @local-thm we see that..."
        result = processor.process_references(content)
        
        # Should use local anchor, not full URL
        assert '<a href="#local-thm"' in result
        assert '/mathnotes/' not in result
        assert '>Local Theorem</a>' in result
    
    def test_special_characters_in_label(self):
        """Test labels with hyphens and underscores."""
        special_block = MathBlock(
            block_type=MathBlockType.DEFINITION,
            content="Special definition",
            title="Special Def",
            label="special_def-123"
        )
        
        block_markers = {"MARKER": special_block}
        processor = BlockReferenceProcessor(block_markers)
        
        content = "See @special_def-123 for details."
        result = processor.process_references(content)
        
        assert '<a href="#special_def-123"' in result
        assert '>Special Def</a>' in result
    
    def test_reference_at_start_of_line(self):
        """Test reference at the beginning of a line."""
        processor = BlockReferenceProcessor(self.block_markers)
        content = "@metric-space defines the basic structure."
        
        result = processor.process_references(content)
        
        assert result.startswith('<a href="#metric-space"')
    
    def test_reference_with_punctuation(self):
        """Test reference followed by punctuation."""
        processor = BlockReferenceProcessor(self.block_markers)
        content = "By @metric-space, @compact-closed."
        
        result = processor.process_references(content)
        
        assert '<a href="#metric-space"' in result
        assert '</a>,' in result  # Comma should be outside the link
        assert '<a href="#compact-closed"' in result
        assert '</a>.' in result  # Period should be outside the link


if __name__ == "__main__":
    pytest.main([__file__, "-v"])