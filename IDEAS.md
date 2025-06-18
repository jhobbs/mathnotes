# IDEAS.md

This file tracks ideas for future features, enhancements, and demonstrations for the mathnotes project.

## Features

- **Tags System**: Setup a tags system to tag documents and browse by tag
  - Add tags field to document frontmatter
  - Create a tags index page
  - Allow filtering/browsing content by tags
  - Display tags on individual pages

## Interactive Demonstrations

- **Reusable Cartesian Plane Library**: Extract the cartesian plane, grid, axes, and zoom functionality from the neighborhood demo into a reusable JavaScript library for other mathematical visualizations

## Content Ideas

(Add future content ideas here)

## Technical Improvements

- **Structured Theorem System**: Design and implement a structured theorem system with explicit control over theorem/proof boundaries
  - Must have explicit start/stop boundaries for theorems, proofs, definitions, examples, intuition sections
  - Should be opt-in (won't break existing content)
  - Maintains full control over formatting and structure
  - Ideally preserves markdown compatibility
  - Allows gradual conversion of existing content
  - Potential approaches: custom HTML-like tags, markdown extensions with explicit delimiters, YAML frontmatter blocks, or custom shortcodes

- **Nested Mathematical Blocks**: Allow proofs, lemmas, and corollaries to be embedded inside theorem blocks
  - State a theorem and include all related content (lemmas, proof, corollaries) within its block
  - Create hierarchical structure where theorem contains its associated elements
  - Improve logical organization and readability
  - Could use nested block syntax or special child block types
  - Maintains clear relationship between theorem and its supporting content

- **Attribution/Citation Blocks**: Create structured blocks for referencing content from other authors
  - Explicit citation formatting with proper attribution
  - Support for different citation styles
  - Clear visual distinction from original content
  - Link to original sources when possible
  - Track and index all citations across the site

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

- **Better Demo Embedding System**: Replace iframe-based demo embedding with direct HTML integration
  - Current iframe approach creates unnecessary scrollbars and isolation
  - Should directly embed demo HTML/CSS/JS content into the rendered page
  - Parse demo files and inject their content inline without any isolation/namespacing
  - Eliminate scrollbar issues and improve visual integration
  - Remove need for separate demo CSS/JS files since demos will share main page styles
  - Keep fullscreen popup functionality but use modal/overlay instead of iframe
  - Would provide seamless user experience without iframe boundaries

- **Better Desktop Layout**: Take more advantage of horizontal space on desktop displays
  - Mobile layout already works well for narrow screens
  - Desktop has too much unused horizontal space with current single-column layout
  - Consider sidebar navigation, table of contents, or multi-column content
  - Could add section navigation, definition index, or theorem overview in sidebar
  - Maintain mobile-first responsive design while maximizing desktop real estate

- **Proper Static File Serving**: Replace the current file reading hack with proper static file serving
  - Currently reading files directly and creating Response objects to handle paths with spaces
  - Should implement proper URL encoding/decoding for file paths
  - Consider using Flask's send_file() with proper path sanitization
  - Or implement a custom static file handler that properly handles spaces in paths
  - Ensure cache headers are properly applied through Flask's normal static file mechanisms
  - This would be cleaner, more maintainable, and follow Flask best practices