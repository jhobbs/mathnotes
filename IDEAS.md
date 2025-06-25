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

- **Convert Remaining Demos to Integrated Format**: The following demos are still using iframe embedding (include_relative) and need to be converted to the integrated format (include_integrated_relative):
  - **neighborhood-demo.html** - Real Analysis/Topology: Metric Spaces
  - **projection.html** - Graphics: Projection and Homogeneous Coordinates
  - **pendulum.html** - Differential Equations: Undamped Motion
  - **elementary.html** - Cellular Automata: Elementary Cellular Automata
  - **dilution.html** - Differential Equations: Dilution and Accretion
  - **cellular.html** - Cellular Automata: Game of Life

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

- **Standardize JS Demo Container/Canvas System**: Create a reusable framework for responsive demo sizing
  - Extract the container detection and canvas sizing logic worked out for the electric field demo
  - Create a standard template/library that handles desktop vs mobile sizing consistently
  - Ensure all interactive demos use the same responsive sizing approach
  - Eliminate need to manually solve container/canvas sizing for each demo
  - Should handle both iframe and direct integration methods

- **Mobile-Friendly Controls for Electric Field Demo**: Add touch-friendly UI controls
  - Add on-screen play/pause button (alternative to spacebar)
  - Add charge polarity toggle button (alternative to Ctrl+click)
  - Add charge strength slider/input control
  - Improve mobile usability and accessibility
  - Consider adding visual feedback for current settings