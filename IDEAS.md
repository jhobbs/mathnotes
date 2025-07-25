# IDEAS.md

This file tracks ideas for future features, enhancements, and demonstrations for the mathnotes project.

## Features

- **Tags System**: Setup a tags system to tag documents and browse by tag
  - Add tags field to document frontmatter
  - Create a tags index page
  - Allow filtering/browsing content by tags
  - Display tags on individual pages

- ✅ **Show/Hide Math Details Toggle** (Implemented 2025-07-12): Toggle between viewing only key mathematical statements (definitions, theorems, lemmas, corollaries) and full content including proofs
  - Sticky toggle button appears when page has both statements and details
  - Hides proofs, examples, remarks, notes, intuition sections when activated
  - Allows quick review of theorems and definitions without distraction
  - Button text changes to indicate current state

## Interactive Demonstrations

- **Reusable Cartesian Plane Library**: Extract the cartesian plane, grid, axes, and zoom functionality from the neighborhood demo into a reusable JavaScript library for other mathematical visualizations

## Content Ideas

(Add future content ideas here)

## Technical Improvements

### ✅ Implemented Features

- **Cross-Reference System for Structured Blocks** (Implemented 2024-12-26)
  - ✅ Basic syntax: `@label` for auto-generated link text
  - ✅ Type-specific: `@type:label` validates block type  
  - ✅ Custom text: `@[custom text](label)` for full control
  - ✅ Works in nested blocks (e.g., references within proofs)
  - ✅ Error handling for broken references
  - ✅ Cross-file references (builds global index on startup)
  - ✅ Automatic URL resolution for cross-file links
  - TODO: Tooltips on hover, integration with numbering system

### TODO Features

- **Structured Theorem System**: Design and implement a structured theorem system with explicit control over theorem/proof boundaries
  - Must have explicit start/stop boundaries for theorems, proofs, definitions, examples, intuition sections
  - Should be opt-in (won't break existing content)
  - Maintains full control over formatting and structure
  - Ideally preserves markdown compatibility
  - Allows gradual conversion of existing content
  - Potential approaches: custom HTML-like tags, markdown extensions with explicit delimiters, YAML frontmatter blocks, or custom shortcodes


- **Attribution/Citation Blocks**: Create structured blocks for referencing content from other authors
  - Explicit citation formatting with proper attribution
  - Support for different citation styles
  - Clear visual distinction from original content
  - Link to original sources when possible
  - Track and index all citations across the site

- **Automatic Numbering and Reference System**: Implement automatic numbering for theorems, definitions, equations, etc. with dynamic cross-references
  - Auto-number theorems, lemmas, propositions, definitions, examples sequentially (e.g., "Theorem 1.1", "Definition 2.3")
  - Support hierarchical numbering by section/chapter
  - Dynamic reference system where `\ref{label}` automatically shows correct number
  - References update automatically when content is reordered or new items are inserted
  - Support for equation numbering and referencing
  - Cross-page references that work across the entire site
  - LaTeX-style labeling system with `{label: my-theorem}` in block metadata
  - Generate "References" or "See Also" sections automatically
  - Note: We're basically reimplementing LaTeX's reference system for the web!

- **Deep Linking to Structured Content**: ✅ FULLY IMPLEMENTED - Cross-references work across files!
  - ✅ Generate unique anchor IDs for each theorem, definition, lemma, etc. (uses label metadata)
  - ✅ Support linking from one theorem's proof to another theorem as justification (@label syntax)
  - ✅ Allow hash-based URLs like `/page#theorem-2-3` or `/page#def-continuity` (works with labels)
  - ✅ Support same-page deep links
  - ✅ Support cross-page deep links with automatic URL resolution
  - ✅ Global block index built on startup for all labeled blocks
  - TODO: Highlight or scroll to the target item when accessed via deep link
  - TODO: Integrate with the automatic numbering system for consistent IDs (when numbering is implemented)
  - TODO: Enable tooltip previews when hovering over internal reference links
  - TODO: Roll out cross-references to all existing content (add labels to blocks)

- **Structured Definitions Index**: Build an indexable system for mathematical definitions
  - Separate from theorems but similar structured approach
  - Searchable definition index across all content
  - Cross-references between definitions and their usage
  - Consistent formatting and numbering
  - Ability to link to definitions from other pages

- **Google Structured Data Integration**: Implement Schema.org markup for mathematical content
  - Add JSON-LD structured data for theorems, definitions, and proofs
  - Use MathObject, Article, or EducationalResource schemas
  - Improve SEO and discoverability in search results
  - Enable rich snippets for mathematical content
  - Consider using CreativeWork for cited/attributed content

- **Mobile-Friendly Controls for Electric Field Demo**: Add touch-friendly UI controls
  - Add on-screen play/pause button (alternative to spacebar)
  - Add charge polarity toggle button (alternative to Ctrl+click)
  - Add charge strength slider/input control
  - Improve mobile usability and accessibility
  - Consider adding visual feedback for current settings

- **Visual Dilution Process Demo**: Create a p5.js-based animated visualization of the dilution calculator
  - Convert the existing form-based dilution calculator to include visual representation
  - Show animated tank/container with inflow and outflow
  - Visualize concentration changes with color gradients
  - Display real-time graphs of mass/concentration over time
  - Use P5DemoBase for consistent demo structure
  - Keep existing calculator functionality alongside the visualization
  - Could show particles or color intensity to represent concentration

- **Reorganize Top-Level Sections**: Consolidate sections to align with classical mathematical organization
  - Current structure has too many top-level sections
  - Reorganize into classical mathematical branches: Algebra, Analysis, Topology, Geometry, Logic, etc.
  - Move current sections to appropriate subsections:
    - "Real Analysis" → Analysis/Real Analysis
    - "Complex Analysis" → Analysis/Complex Analysis  
    - "Numerical Analysis" → Analysis/Numerical Analysis
    - "Linear Algebra" → Algebra/Linear Algebra
    - "Discrete Math" → Logic/Discrete Mathematics or Algebra/Discrete Mathematics
    - "Differential Equations" → Analysis/Differential Equations
    - "Probability and Statistics" → Analysis/Probability Theory (or its own section)
    - "Calculus" → Analysis/Calculus
    - "Trigonometry" → Geometry/Trigonometry (or Analysis/Trigonometry)
    - "Physics" → Applied Mathematics/Physics (or remove if focusing on pure math)
  - Create cleaner, more academic hierarchy that matches how mathematics is traditionally organized
  - Would need extensive URL redirects to preserve existing links

- **Definition Disambiguation System**: Handle cases where multiple files define the same concept
  - Detect when two or more files contain definitions with the same label or term
  - Provide disambiguation mechanism (e.g., namespace by section or file)
  - Show disambiguation page when referencing ambiguous terms
  - Allow explicit selection of which definition to link to
  - Could use file path or section hierarchy for automatic namespacing
  - Warn during build process about duplicate definition labels
