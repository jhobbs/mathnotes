"""
Typed document model for Mathnotes

This module provides a system for parsing and rendering structured mathematical
content (theorems, definitions, proofs, etc.) with explicit boundaries and metadata.
"""

import html as html_lib
import re
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any, Tuple, Union, Iterator
from enum import Enum

# \x02<i>\x02 in body_html marks where children[i] renders inline
CHILD_MARKER_RE = re.compile("\x02(\\d+)\x02")
_DREF_TEXT_RE = re.compile(r'<a data-dref="([^"]+)">(.*?)</a>', re.DOTALL)
_TAG_RE = re.compile(r"<[^>]+>")
_MATH_EL_RE = re.compile(r"<math\b[^>]*>.*?</math>", re.DOTALL)
_ALTTEXT_RE = re.compile(r'\balttext="([^"]*)"')
_INLINE_MATH_RE = re.compile(r"\$([^$]+)\$")


def math_to_dollar_text(html_str: str) -> str:
    """Replace <math> elements with their $-delimited alttext TeX (display
    math gets $$), so snippet and heading-id derivation see the same text
    the $-delimiter era produced. No-op on HTML without <math> elements."""
    def repl(m):
        el = m.group(0)
        open_tag = el[: el.index(">") + 1]
        alt = _ALTTEXT_RE.search(open_tag)
        tex = html_lib.unescape(alt.group(1)) if alt else ""
        return f"$${tex}$$" if 'display="block"' in open_tag else f"${tex}$"
    return _MATH_EL_RE.sub(repl, html_str)


def body_text(html_str: str) -> str:
    """Snippet-grade plain text from emitted body HTML.

    Auto drefs (empty link text) flatten to their label with hyphens as
    spaces, mirroring how the old dialect flattened @refs in link text.
    """
    def flatten(m):
        inner = m.group(2)
        if inner.strip():
            return inner
        label = m.group(1).split(":", 1)[-1]
        return label.replace("-", " ")

    text = _DREF_TEXT_RE.sub(flatten, html_str)
    text = math_to_dollar_text(text)
    text = CHILD_MARKER_RE.sub(" ", text)
    text = _TAG_RE.sub("", text)
    text = html_lib.unescape(text)
    return " ".join(text.split())


def text_with_math_to_html(text: str) -> str:
    """HTML for plain text that may contain $...$ math: prose is escaped,
    complete math spans render through the math seam. Used for reference
    link text, block header titles, and tooltip title/type strings."""
    from .latex_processor import render_math  # local: latex_processor imports this module

    out = []
    pos = 0
    for m in _INLINE_MATH_RE.finditer(text):
        out.append(html_lib.escape(text[pos:m.start()], quote=False))
        out.append(render_math(m.group(1).strip(), display=False))
        pos = m.end()
    out.append(html_lib.escape(text[pos:], quote=False))
    return "".join(out)


def lowercase_outside_math(text: str) -> str:
    """Lowercase prose while leaving $...$ math spans untouched. Definition
    link text is lowercased for mid-sentence use; lowercasing TeX would
    change math meaning ($O$ -> $o$) or break macros (\\Log -> \\log)."""
    out = []
    pos = 0
    for m in _INLINE_MATH_RE.finditer(text):
        out.append(text[pos:m.start()].lower())
        out.append(m.group(0))
        pos = m.end()
    out.append(text[pos:].lower())
    return "".join(out)


class MathBlockType(Enum):
    """Types of mathematical content blocks."""

    DEFINITION = "definition"
    THEOREM = "theorem"
    LEMMA = "lemma"
    PROPOSITION = "proposition"
    COROLLARY = "corollary"
    AXIOM = "axiom"
    PROOF = "proof"
    EXAMPLE = "example"
    REMARK = "remark"
    NOTE = "note"
    INTUITION = "intuition"
    EXERCISE = "exercise"
    SOLUTION = "solution"


@dataclass
class MathBlock:
    """Represents a structured mathematical content block."""

    block_type: MathBlockType
    content: str  # plain text, inline math preserved
    title: Optional[str] = None
    label: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    children: List["MathBlock"] = field(default_factory=list)
    parent: Optional["MathBlock"] = None
    body_html: str = ""  # unresolved-placeholder HTML (child markers not yet substituted)
    content_html: Optional[str] = None  # Stores the inner HTML content (without wrapper)
    rendered_html: Optional[str] = None  # Fully rendered block HTML, once available
    synonyms: List[Tuple[str, str]] = field(default_factory=list)  # List of (synonym_title, synonym_label)
    auto_generated_synonyms: List[Tuple[str, str]] = field(default_factory=list)  # Auto-generated synonyms (not shown in UI)
    tags: List[str] = field(default_factory=list)  # List of tags for categorization

    def walk(self) -> Iterator["MathBlock"]:
        yield self
        for child in self.children:
            yield from child.walk()

    @property
    def css_class(self) -> str:
        """Generate CSS class name for this block type."""
        return f"math-block math-{self.block_type.value}"

    @property
    def display_name(self) -> str:
        """Get the display name for this block type."""
        names = {
            MathBlockType.DEFINITION: "Definition",
            MathBlockType.THEOREM: "Theorem",
            MathBlockType.LEMMA: "Lemma",
            MathBlockType.PROPOSITION: "Proposition",
            MathBlockType.COROLLARY: "Corollary",
            MathBlockType.AXIOM: "Axiom",
            MathBlockType.PROOF: "Proof",
            MathBlockType.EXAMPLE: "Example",
            MathBlockType.REMARK: "Remark",
            MathBlockType.NOTE: "Note",
            MathBlockType.INTUITION: "Intuition",
            MathBlockType.EXERCISE: "Exercise",
            MathBlockType.SOLUTION: "Solution",
        }
        return names.get(self.block_type, self.block_type.value.title())

    @property
    def content_snippet(self) -> str:
        """First 7 words of content, display math removed, for reference link text."""
        text = re.sub(r"\$\$.*?\$\$", "", self.content, flags=re.DOTALL)
        words = text.split()
        if not words:
            return self.label or "untitled"
        snippet = " ".join(words[:7])
        if len(words) > 7:
            snippet += "..."
        return snippet

    @staticmethod
    def normalize_label_from_title(title: str) -> str:
        """Generate a normalized label from a title."""
        import re

        # Convert to lowercase
        label = title.lower()

        # Replace whitespace, commas, and other punctuation with hyphens
        label = re.sub(r"[\s,]+", "-", label)

        # Remove any remaining non-alphanumeric characters except hyphens
        label = re.sub(r"[^a-z0-9-]", "", label)

        # Remove leading/trailing hyphens and collapse multiple hyphens
        label = re.sub(r"-+", "-", label).strip("-")

        return label

    @staticmethod
    def generate_plural(word: str) -> Optional[str]:
        """Generate the plural form of a word.

        Returns None if the word is already plural or if pluralization doesn't make sense.
        """
        if not word:
            return None

        # Skip if already plural (basic heuristic)
        if word.endswith('s') and not word.endswith('ss'):
            return None

        # Common irregular plurals
        irregular_plurals = {
            'matrix': 'matrices',
            'vertex': 'vertices',
            'simplex': 'simplices',
            'vortex': 'vortices',
            'helix': 'helices',
            'index': 'indices',
            'axis': 'axes',
            'analysis': 'analyses',
            'basis': 'bases',
            'crisis': 'crises',
            'hypothesis': 'hypotheses',
            'parenthesis': 'parentheses',
            'thesis': 'theses',
            'formula': 'formulas',
            'datum': 'data',
            'criterion': 'criteria',
            'phenomenon': 'phenomena',
            'polyhedron': 'polyhedra',
            'automaton': 'automata',
            'radius': 'radii',
            'locus': 'loci',
            'focus': 'foci',
            'nucleus': 'nuclei',
            'syllabus': 'syllabi',
            'corpus': 'corpora',
            'genus': 'genera',
            # Mathematical terms
            'modulus': 'moduli',
            'torus': 'tori',
            'annulus': 'annuli',
            'calculus': 'calculi',
        }

        word_lower = word.lower()
        if word_lower in irregular_plurals:
            # Preserve the original case
            if word[0].isupper():
                return irregular_plurals[word_lower].capitalize()
            return irregular_plurals[word_lower]

        # Regular plural rules
        if word.endswith('y'):
            # If preceded by a consonant, change y to ies
            if len(word) > 1 and word[-2] not in 'aeiou':
                return word[:-1] + 'ies'
            else:
                return word + 's'
        elif word.endswith(('s', 'ss', 'sh', 'ch', 'x', 'z', 'o')):
            return word + 'es'
        else:
            return word + 's'


@dataclass
class PageDoc:
    """Parsed page: prose HTML segments and top-level MathBlocks, in order."""

    items: List[Union[str, MathBlock]] = field(default_factory=list)

    def top_blocks(self) -> List[MathBlock]:
        return [it for it in self.items if isinstance(it, MathBlock)]


_NESTED_AUTO_TYPES = {
    MathBlockType.NOTE, MathBlockType.EXAMPLE, MathBlockType.REMARK,
    MathBlockType.INTUITION, MathBlockType.EXERCISE, MathBlockType.SOLUTION,
}


def finalize_blocks(top_blocks: List[MathBlock]) -> None:
    """Assign auto labels, definition synonyms/plurals, and tags, in place."""
    counter = 0
    per_parent: Dict[Tuple[int, str], int] = {}

    def visit(block: MathBlock):
        nonlocal counter
        counter += 1
        if not block.label and block.block_type == MathBlockType.DEFINITION and block.title:
            block.label = MathBlock.normalize_label_from_title(block.title)
        if not block.label:
            parent = block.parent
            if block.block_type == MathBlockType.PROOF and parent and parent.label:
                key = (id(parent), "proof")
                per_parent[key] = per_parent.get(key, 0) + 1
                n = per_parent[key]
                block.label = f"proof-of-{parent.label}" + (f"-{n}" if n > 1 else "")
            elif parent and parent.label and block.block_type in _NESTED_AUTO_TYPES:
                key = (id(parent), block.block_type.value)
                per_parent[key] = per_parent.get(key, 0) + 1
                n = per_parent[key]
                block.label = f"{parent.label}-{block.block_type.value}" + (f"-{n}" if n > 1 else "")
            else:
                block.label = f"{block.block_type.value}-{counter}"
        # Unlabeled top-level theorem-likes auto-number via the counter
        # fallback above rather than erroring, to preserve legacy anchor IDs.
        if block.block_type == MathBlockType.DEFINITION:
            _build_definition_synonyms(block)
        if "tags" in block.metadata and not block.tags:
            block.tags = [
                t.strip().strip('"') for t in block.metadata["tags"].split(",") if t.strip()
            ]
        for child in block.children:
            visit(child)

    for b in top_blocks:
        visit(b)


def _build_definition_synonyms(block: MathBlock) -> None:
    manual_labels = set()
    if "synonyms" in block.metadata and not block.synonyms:
        for syn in block.metadata["synonyms"].split(","):
            syn = syn.strip().strip('"')
            if not syn:
                continue
            syn_label = MathBlock.normalize_label_from_title(syn)
            block.synonyms.append((syn, syn_label))
            manual_labels.add(syn_label)
            plural = MathBlock.generate_plural(syn)
            if plural:
                plural_label = MathBlock.normalize_label_from_title(plural)
                if plural_label not in manual_labels:
                    block.auto_generated_synonyms.append((plural, plural_label))
    if block.title:
        plural = MathBlock.generate_plural(block.title)
        if plural:
            plural_label = MathBlock.normalize_label_from_title(plural)
            if plural_label not in manual_labels:
                block.auto_generated_synonyms.append((plural, plural_label))


def render_block_html(block: MathBlock, content_html: str, url: str) -> str:
    """Wrap resolved block content in the math-block card HTML."""
    css_classes = [block.css_class]
    if block.parent:
        css_classes.append("math-block-nested")
    attrs = [f'class="{" ".join(css_classes)}"',
             f'id="{block.label}"', f'data-label="{block.label}"']
    for key, value in block.metadata.items():
        if key != "label":
            attrs.append(f'data-{key}="{html_lib.escape(str(value))}"')

    parts = [f'<div {" ".join(attrs)}>', '<div class="math-block-header">']
    if block.block_type != MathBlockType.PROOF:
        if block.title:
            parts.append(f'<span class="math-block-type">{block.display_name}:</span>')
            parts.append(
                f'<span class="math-block-title"><a href="{url}">'
                f"{text_with_math_to_html(block.title)}</a></span>"
            )
        else:
            parts.append(f'<span class="math-block-type">{block.display_name}</span>')
    else:
        parts.append('<span class="math-block-type">Proof</span>')
    if block.synonyms:
        names = ", ".join(html_lib.escape(s[0]) for s in block.synonyms)
        parts.append(f'<span class="block-synonyms">(also: {names})</span>')
    if block.tags:
        tags_html = "".join(
            f'<span class="block-tag">{html_lib.escape(t)}</span>' for t in block.tags
        )
        parts.append(f'<span class="block-tags">{tags_html}</span>')
    parts.append(f'<span class="block-label-ref">@{block.label}</span>')
    parts.append("</div>")

    marked = {int(i) for i in CHILD_MARKER_RE.findall(content_html)}

    def sub_child(m):
        child = block.children[int(m.group(1))]
        if child.rendered_html is None:
            raise ValueError(f"Child block '{child.label}' rendered out of order")
        return child.rendered_html

    processed = CHILD_MARKER_RE.sub(sub_child, content_html)
    for i, child in enumerate(block.children):
        if i not in marked:
            if child.rendered_html is None:
                raise ValueError(f"Child block '{child.label}' rendered out of order")
            processed += "\n" + child.rendered_html

    parts.append('<div class="math-block-content">')
    parts.append(processed)
    if block.block_type == MathBlockType.PROOF:
        from .latex_processor import render_math  # local: latex_processor imports this module

        qed = render_math("\\square", display=False)
        if not processed.rstrip().endswith(qed):
            parts.append(f" {qed}")
    parts.append("</div>")
    parts.append("</div>")
    return "\n".join(parts)
