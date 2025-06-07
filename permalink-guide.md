# Permalink System Guide

The mathnotes site now has a permalink system that allows you to:
- Create stable URLs that won't break when files are moved
- Use meaningful slugs in URLs instead of file paths
- Set up redirects from old URLs

## How it works

### Basic Usage

By default, pages will use a URL based on their title. For example, a file at `algebra/groups.md` with title "Groups" will be accessible at:
- `/mathnotes/algebra/groups` (slug generated from title)

The old file-based URL will automatically redirect to the new canonical URL.

### Custom Slugs

To set a custom slug, add it to the frontmatter:

```yaml
---
title: Introduction to Group Theory
slug: group-theory-intro
---
```

This will make the page accessible at `/mathnotes/algebra/group-theory-intro`.

### Redirects

To preserve old URLs when renaming or moving files, use the `redirect_from` field:

```yaml
---
title: Group Theory
slug: group-theory
redirect_from:
  - algebra/old-groups-page
  - math/groups
  - algebra/group-theory-old
---
```

All listed URLs will redirect (301) to the canonical URL.

## Examples

### Example 1: Simple page with custom slug

```yaml
---
title: Partial Fractions
slug: partial-fractions-decomposition
description: Learn how to decompose rational functions into simpler fractions for easier integration and analysis.
---
```

### Example 2: Moved file with redirects

If you move `calculus/integration.md` to `calculus/integration-strategies.md`:

```yaml
---
title: Integration Strategies
slug: integration-techniques
description: Comprehensive guide to integration techniques including substitution, by parts, and trigonometric methods.
redirect_from:
  - calculus/integration
---
```

### Example 3: Renamed file preserving SEO

```yaml
---
title: Complex Analysis - Module 1
slug: complex-algebraic-properties
redirect_from:
  - complex analysis/module 01 - algebriac properties
  - complex-analysis/module-01
---
```

## Best Practices

1. **Choose descriptive slugs** that are:
   - URL-friendly (lowercase, hyphens instead of spaces)
   - Meaningful and descriptive
   - Relatively short

2. **Always add redirects** when:
   - Moving files to new locations
   - Renaming files
   - Changing slugs

3. **Keep slugs stable** - once published, avoid changing slugs to prevent breaking external links

## SEO Features

### Meta Descriptions
Each page can have a custom meta description for better search engine optimization:

```yaml
---
title: Your Page Title
description: A concise description of your page content that appears in search results.
---
```

If no description is provided, the system automatically generates one from the first sentence of your content.

## Technical Details

- Slugs are automatically generated from titles if not specified
- The system maintains backward compatibility with file-based URLs
- All old URLs automatically redirect to canonical URLs
- Canonical URL meta tags are added for SEO
- The sitemap uses canonical URLs
- Meta descriptions are automatically generated or can be customized in frontmatter