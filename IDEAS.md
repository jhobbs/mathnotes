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

- **Proper Static File Serving**: Replace the current file reading hack with proper static file serving
  - Currently reading files directly and creating Response objects to handle paths with spaces
  - Should implement proper URL encoding/decoding for file paths
  - Consider using Flask's send_file() with proper path sanitization
  - Or implement a custom static file handler that properly handles spaces in paths
  - Ensure cache headers are properly applied through Flask's normal static file mechanisms
  - This would be cleaner, more maintainable, and follow Flask best practices