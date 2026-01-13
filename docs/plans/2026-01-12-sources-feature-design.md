# Sources Feature Design

Add a way to mark referenced sources (books, websites, papers) for pages and directories, with a collapsible fold-out at the bottom of each page.

## Requirements

- Page-specific sources in frontmatter
- Directory-level sources in `sources.yaml` files
- Hierarchical inheritance: sources from root → parent directories → page all combine
- Collapsed by default, click to expand
- Flat list display (no grouping)
- No sources section shown if no sources exist

## Data Structure

### Source Entry Fields

```yaml
title: "Abstract Algebra"           # Required
author: "David S. Dummit"           # Optional
url: "https://..."                  # Optional
type: "book"                        # Optional: book, website, paper, video, etc.
section: "Chapter 3.2"              # Optional: chapter, section, page range
notes: "Excellent group theory intro"  # Optional
accessed: "2024-01-15"              # Optional: date accessed (for websites)
isbn: "978-0471433347"              # Optional
```

### Page Frontmatter

```yaml
---
title: Groups
layout: page
sources:
  - title: "Abstract Algebra"
    author: "Dummit & Foote"
    type: book
  - title: "Group Theory Notes"
    url: "https://example.com/groups"
    type: website
---
```

### Directory Sources File (`sources.yaml`)

```yaml
sources:
  - title: "Algebra: Chapter 0"
    author: "Paolo Aluffi"
    type: book
    notes: "Used throughout this section"
```

## Processing Pipeline

### New Module: `mathnotes/sources.py`

1. **Collection function** - Given a page path, walks up the directory tree collecting `sources.yaml` files from root to the page's directory
2. **Merge function** - Combines directory sources (in order from root → immediate parent) with page frontmatter sources appended last
3. **No deduplication** - If the same source appears at multiple levels, it shows multiple times (simple, predictable)

### Integration in `renderer.py`

When rendering a page:
1. Extract `sources` from frontmatter (if present)
2. Call sources module to collect and merge all applicable sources
3. Pass merged sources list to the template context

Template receives:
```python
{
    'sources': [
        {'title': '...', 'author': '...', ...},
        {'title': '...', 'url': '...', ...},
    ]
}
```

Empty list if no sources found anywhere in the hierarchy.

## Template & UI

### In `page.html` (after article content)

```html
{% if sources %}
<footer class="sources-section">
  <button class="sources-toggle" data-sources="toggle">
    <span class="sources-icon">&#9654;</span>
    Sources ({{ sources|length }})
  </button>
  <div class="sources-content">
    <ul class="sources-list">
      {% for source in sources %}
      <li class="source-item">
        <!-- Rendered source -->
      </li>
      {% endfor %}
    </ul>
  </div>
</footer>
{% endif %}
```

### Source Item Rendering

- Title as link if URL present, plain text otherwise
- Author shown after title if present
- Type shown as subtle tag/badge if present
- Section, ISBN, notes shown on secondary line if present
- Accessed date shown for websites

### Interaction

Click toggle to expand/collapse. Icon rotates 90 degrees when open.

## Styling

### New File: `styles/components/sources.css`

```css
.sources-section {
  margin-top: var(--space-xl);
  border-top: var(--border-width-thin) solid var(--color-border);
  padding-top: var(--space-md);
}

.sources-toggle {
  background: var(--color-code-bg);
  border: var(--border-width-thin) solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  transition: background-color var(--transition-fast);
}

.sources-toggle.active {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.sources-icon {
  transition: transform var(--transition-fast);
}

.sources-toggle.active .sources-icon {
  transform: rotate(90deg);
}

.sources-content {
  display: none;
  border: var(--border-width-thin) solid var(--color-border);
  border-top: none;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  padding: var(--space-md);
}

.sources-content.show {
  display: block;
}
```

Dark mode handled automatically via CSS custom properties.

## JavaScript

### New File: `demos-framework/src/sources-toggle.ts`

```typescript
export function initSourcesToggle(): void {
  document.addEventListener('click', (e: MouseEvent) => {
    const toggle = (e.target as HTMLElement).closest('[data-sources="toggle"]');
    if (!toggle) return;

    const section = toggle.closest('.sources-section');
    const content = section?.querySelector('.sources-content');

    if (content) {
      toggle.classList.toggle('active');
      content.classList.toggle('show');
    }
  });
}
```

Registered in `main.ts` alongside other initialization functions.

## Files to Create

- `mathnotes/sources.py` - Collection and merge logic
- `styles/components/sources.css` - Styling
- `demos-framework/src/sources-toggle.ts` - Toggle interaction

## Files to Modify

- `mathnotes/renderer.py` - Call sources collection, pass to template
- `templates/page.html` - Render sources section
- `styles/main.css` - Import sources.css
- `demos-framework/src/main.ts` - Initialize sources toggle
