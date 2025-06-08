---
title: Wiki-Style Internal Links Guide
slug: wiki-links-guide
---

# Wiki-Style Internal Links Guide

This guide explains how to use the wiki-style internal linking system in mathnotes.

## Basic Syntax

### Simple Links
```markdown
[[slug-name]]
```
This creates a link to the page with the specified slug. The link text will be the slug converted to title case.

Example: `[[groups]]` → [Groups](/mathnotes/algebra/groups)

### Links with Custom Text
```markdown
[[Link Text|slug-name]]
```
This creates a link with custom display text.

Example: `[[Group Theory Introduction|groups]]` → [Group Theory Introduction](/mathnotes/algebra/groups)

### Section-Specific Links
```markdown
[[section/slug-name]]
```
When you need to link to a specific section's page (useful when multiple sections have pages with the same slug).

Example: `[[complex analysis/limits]]` → links to limits in complex analysis, not real analysis

## Benefits

1. **Resilient to file moves**: Links use slugs, not file paths
2. **No URL encoding needed**: No more `%20` for spaces
3. **No file extensions**: No `.html` or `.md` extensions to worry about
4. **Cleaner syntax**: More readable in the markdown source

## How It Works

The system:
1. First checks if the slug contains a section (e.g., `algebra/groups`)
2. If no section is specified, it searches the current section first
3. Then searches all sections for a matching slug
4. If no match is found, creates a broken link indicator

## Examples

### Before (Old Style)
```markdown
[Real Numbers](/mathnotes/real%20analysis/real-numbers)
[Groups](../algebra/groups.html)
[Sequences](../real%20analysis/sequences.md)
```

### After (Wiki Style)
```markdown
[[real-numbers]]
[[groups]]
[[sequences]]
```

## Finding Slugs

To find a page's slug:
1. Check the `slug:` field in the file's frontmatter
2. If no slug field exists, the slug is generated from the title using these rules:
   - Convert to lowercase
   - Replace spaces with hyphens
   - Remove special characters
   - Collapse multiple hyphens

## Best Practices

1. Use wiki links for all internal references
2. Include the section prefix only when linking across sections with ambiguous slugs
3. Use descriptive link text with the pipe syntax when the slug isn't self-explanatory
4. Update old-style links to wiki links when editing pages