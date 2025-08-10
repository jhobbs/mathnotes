# Markdown and Math Parsing Pipeline

This document explains how Mathnotes processes markdown content with structured mathematical blocks, avoiding double processing while enabling cross-file references and tooltips.

## Overview

The parsing pipeline uses a two-phase approach:
1. **Build Phase**: Pre-render all mathematical blocks globally (`block_index.py`)
2. **Render Phase**: Process pages with block markers, replacing them with pre-rendered HTML (`markdown_processor.py`)

## Why Two Phases?

The two-phase design enables:
- **Cross-file references**: File A can reference theorems defined in file B
- **Tooltips**: Hovering over `@theorem:ftc` shows the theorem content
- **Consistent rendering**: All blocks rendered identically across the site
- **No double processing**: Each block's content is processed exactly once

## Phase 1: Global Block Index Building (`block_index.py`)

During site initialization, the block index:

1. **Scans all markdown files** to find structured blocks (`:::theorem`, `:::proof`, etc.)
2. **Extracts blocks** using `StructuredMathParser`
3. **Processes each block's content**:
   - Resolves `@references` within the block
   - Protects math expressions (`$...$`)
   - Converts markdown to HTML
   - Renders the block with proper HTML structure
4. **Stores rendered HTML** in `rendered_blocks[file_path][marker_id]`

```python
# block_index.py:165-207
def _process_block_content(self, block, block_markers, parser, full_url):
    # Process @references in block content
    content_with_refs = block_ref_processor.process_references(block.content)
    
    # Protect math, convert markdown, restore math
    protected_content = math_protector.protect_math(content_with_refs)
    html_content = self.md.convert(protected_content)
    html_content = math_protector.restore_math(html_content)
    
    # Store rendered HTML
    block.rendered_html = parser.render_block_html(block, html_content, ...)
```

## Phase 2: Page Rendering (`markdown_processor.py`)

When rendering individual pages:

1. **Parse structured blocks** (`StructuredMathParser.parse()`):
   - Extracts block definitions
   - **Replaces block content with markers** like `MATHBLOCK0MARKER`
   - Returns content with markers instead of blocks

2. **Retrieve pre-rendered HTML** from block index:
   ```python
   # markdown_processor.py:75
   block.rendered_html = self.block_index.get_rendered_html(filepath, marker_id)
   ```

3. **Process the marker-filled content**:
   - Process `@references` to blocks
   - Protect math expressions
   - **Convert markdown to HTML** (markers pass through unchanged)
   - Restore math expressions

4. **Replace markers with pre-rendered HTML**:
   ```python
   # structured_math.py:418-447
   def process_structured_math_content(html_content, block_markers, ...):
       for marker_id, block in block_markers.items():
           if block.parent is None:  # Top-level blocks only
               rendered_block = block.rendered_html  # Pre-rendered from block_index
               html_content = html_content.replace(f"<p>{marker_id}</p>", rendered_block)
       return html_content
   ```

## The Protection Mechanism

The key insight: **block content is protected by replacing it with markers before markdown processing**.

### Example Flow

Given this markdown:
```markdown
Some introduction text.

:::theorem "Fundamental Theorem"
If $f$ is continuous on $[a,b]$, then...
:::

More content here.
```

#### Step 1: `StructuredMathParser.parse()` extracts the block
```markdown
Some introduction text.

MATHBLOCK0MARKER

More content here.
```

The block content is stored separately:
```python
block_markers["MATHBLOCK0MARKER"] = MathBlock(
    content="If $f$ is continuous on $[a,b]$, then...",
    ...
)
```

#### Step 2: Main markdown processing
Only processes the content with markers - the block content is safe.

#### Step 3: Replace markers with pre-rendered HTML
The marker `MATHBLOCK0MARKER` is replaced with the full rendered block HTML from `block_index`.

## No Double Processing

The block content (`"If $f$ is continuous on $[a,b]$, then..."`) is only markdown-processed once:
- In `block_index.py` during the build phase
- NOT in `markdown_processor.py` (it only sees markers)

This ensures:
- Efficiency: Each block processed once
- Consistency: Same rendering everywhere
- Correctness: No risk of double-escaping or processing artifacts

## Related Files

- `/home/jason/mathnotes/mathnotes/block_index.py`: Global block index builder
- `/home/jason/mathnotes/mathnotes/markdown_processor.py`: Page-level markdown processor
- `/home/jason/mathnotes/mathnotes/structured_math.py`: Block parsing and rendering
- `/home/jason/mathnotes/mathnotes/math_utils.py`: Cross-reference processing