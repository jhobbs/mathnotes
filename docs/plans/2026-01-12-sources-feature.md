# Sources Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add hierarchical sources/references display to content pages with a collapsible fold-out UI.

**Architecture:** Sources are collected from `sources.yaml` files up the directory tree and merged with page frontmatter sources. A new Python module handles collection/merging, templates render the UI, and TypeScript handles the toggle interaction.

**Tech Stack:** Python (frontmatter, YAML), Jinja2 templates, TypeScript, PostCSS

---

## Task 1: Create Sources Collection Module

**Files:**
- Create: `mathnotes/sources.py`

**Step 1: Write the sources module**

```python
"""Sources collection and merging for content pages."""

from pathlib import Path
from typing import Any
import yaml


def collect_directory_sources(content_path: str) -> list[dict[str, Any]]:
    """Collect sources from all sources.yaml files from root to page directory.

    Args:
        content_path: Path to the content file (e.g., 'content/algebra/groups.md')

    Returns:
        List of source entries, ordered from root to immediate parent directory.
    """
    path = Path(content_path)
    content_root = Path("content")

    # Get the directory containing the page
    page_dir = path.parent

    # Build list of directories from root to page directory
    directories = []
    current = page_dir
    while current != content_root.parent and current != Path("."):
        directories.append(current)
        current = current.parent

    # Reverse to go from root to page directory
    directories.reverse()

    # Collect sources from each directory
    all_sources = []
    for directory in directories:
        sources_file = directory / "sources.yaml"
        if sources_file.exists():
            try:
                with open(sources_file, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    if data and "sources" in data:
                        all_sources.extend(data["sources"])
            except (yaml.YAMLError, OSError):
                # Skip malformed or unreadable files
                pass

    return all_sources


def merge_sources(
    directory_sources: list[dict[str, Any]],
    page_sources: list[dict[str, Any]] | None
) -> list[dict[str, Any]]:
    """Merge directory sources with page-specific sources.

    Args:
        directory_sources: Sources collected from directory hierarchy
        page_sources: Sources from page frontmatter (may be None)

    Returns:
        Combined list with directory sources first, then page sources.
    """
    result = list(directory_sources)
    if page_sources:
        result.extend(page_sources)
    return result


def get_sources_for_page(
    content_path: str,
    frontmatter_sources: list[dict[str, Any]] | None = None
) -> list[dict[str, Any]]:
    """Get all sources applicable to a page.

    Args:
        content_path: Path to the content file
        frontmatter_sources: Sources from page frontmatter

    Returns:
        Merged list of all applicable sources.
    """
    directory_sources = collect_directory_sources(content_path)
    return merge_sources(directory_sources, frontmatter_sources)
```

**Step 2: Verify the module loads without errors**

Run: `python -c "from mathnotes.sources import get_sources_for_page; print('OK')"`
Expected: `OK`

---

## Task 2: Integrate Sources into Page Rendering

**Files:**
- Modify: `mathnotes/sitegenerator/pages.py:143-181`

**Step 1: Add import at top of pages.py**

Add after line 7 (after `from dataclasses import dataclass, field`):

```python
from mathnotes.sources import get_sources_for_page
```

**Step 2: Modify ContentPages.get_specs() to include sources**

In the `ContentPages.get_specs()` method, after line 160 where `navigation` is built, add sources collection. The modified section should look like:

```python
            # Build navigation data for sidebar and prev/next
            navigation = get_page_navigation(md_path, self.url_mapper.file_to_canonical)

            # Collect sources from directory hierarchy and frontmatter
            frontmatter = result.get("frontmatter", {})
            frontmatter_sources = frontmatter.get("sources")
            sources = get_sources_for_page(md_path, frontmatter_sources)

            # Build context
            context = {
                "content": result.get("content", ""),
                "path": md_path,
                "frontmatter": result.get("frontmatter", {}),
                "canonical_url": result.get("canonical_url", ""),
                "navigation": navigation,
                "sources": sources,
            }
```

**Step 3: Verify the build still works**

Run: `docker-compose up --build 2>&1 | head -50`
Expected: Build should complete without Python errors

---

## Task 3: Add Sources Section to Page Template

**Files:**
- Modify: `templates/page.html:68-72`

**Step 1: Add sources section after article content**

Replace lines 68-71 (the article section) with:

```html
    <article class="page-content">
        {{ content|safe }}
    </article>

    {% if sources %}
    <footer class="sources-section">
        <button class="sources-toggle" data-sources="toggle" type="button">
            <span class="sources-icon">&#9654;</span>
            <span class="sources-label">Sources ({{ sources|length }})</span>
        </button>
        <div class="sources-content">
            <ul class="sources-list">
                {% for source in sources %}
                <li class="source-item">
                    <div class="source-main">
                        {% if source.url %}
                        <a href="{{ source.url }}" class="source-title" target="_blank" rel="noopener">{{ source.title }}</a>
                        {% else %}
                        <span class="source-title">{{ source.title }}</span>
                        {% endif %}
                        {% if source.author %}
                        <span class="source-author">{{ source.author }}</span>
                        {% endif %}
                        {% if source.type %}
                        <span class="source-type">{{ source.type }}</span>
                        {% endif %}
                    </div>
                    {% if source.section or source.isbn or source.notes or source.accessed %}
                    <div class="source-meta">
                        {% if source.section %}<span class="source-section">{{ source.section }}</span>{% endif %}
                        {% if source.isbn %}<span class="source-isbn">ISBN: {{ source.isbn }}</span>{% endif %}
                        {% if source.accessed %}<span class="source-accessed">Accessed: {{ source.accessed }}</span>{% endif %}
                        {% if source.notes %}<span class="source-notes">{{ source.notes }}</span>{% endif %}
                    </div>
                    {% endif %}
                </li>
                {% endfor %}
            </ul>
        </div>
    </footer>
    {% endif %}
```

---

## Task 4: Create Sources CSS Styles

**Files:**
- Create: `styles/components/sources.css`

**Step 1: Create the sources stylesheet**

```css
/* Sources section - collapsible reference list at bottom of pages */

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
  font-family: inherit;
  width: auto;
}

.sources-toggle:hover {
  background-color: var(--color-bg-secondary);
}

.sources-toggle.active {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.sources-icon {
  display: inline-block;
  font-size: 0.7em;
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
  background-color: var(--color-bg);
}

.sources-content.show {
  display: block;
}

.sources-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.source-item {
  padding: var(--space-sm) 0;
  border-bottom: var(--border-width-thin) solid var(--color-border);
}

.source-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.source-item:first-child {
  padding-top: 0;
}

.source-main {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-sm);
}

.source-title {
  font-weight: 500;
  color: var(--color-text);
}

a.source-title {
  color: var(--color-link);
  text-decoration: none;
}

a.source-title:hover {
  text-decoration: underline;
}

.source-author {
  color: var(--color-text-secondary);
}

.source-author::before {
  content: "by ";
}

.source-type {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.8em;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
  text-transform: lowercase;
}

.source-meta {
  margin-top: var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.source-meta > span {
  display: inline-block;
}

.source-meta > span:not(:last-child)::after {
  content: " · ";
  margin-left: var(--space-sm);
  color: var(--color-border);
}

.source-notes {
  font-style: italic;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .source-main {
    flex-direction: column;
    gap: var(--space-xs);
  }

  .source-author::before {
    content: "";
  }

  .source-meta {
    flex-direction: column;
    gap: var(--space-xs);
  }

  .source-meta > span:not(:last-child)::after {
    content: "";
    margin-left: 0;
  }
}
```

---

## Task 5: Import Sources CSS in Main Stylesheet

**Files:**
- Modify: `styles/main.css:1-11`

**Step 1: Add import for sources.css**

Add after line 4 (`@import './demo-components.css';`):

```css
@import './components/sources.css';
```

**Step 2: Create components directory if needed**

Run: `mkdir -p /home/jason/mathnotes/styles/components`

---

## Task 6: Create Sources Toggle TypeScript

**Files:**
- Create: `demos-framework/src/sources-toggle.ts`

**Step 1: Create the toggle module**

```typescript
export function initSourcesToggle(): void {
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const toggle = target.closest('[data-sources="toggle"]') as HTMLElement | null;

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

---

## Task 7: Initialize Sources Toggle in Main

**Files:**
- Modify: `demos-framework/src/main.ts:15-16`

**Step 1: Add import for sources-toggle**

Add after line 15 (`import { initSidebarToggle } from './sidebar-toggle';`):

```typescript
// Import sources toggle functionality for page sources section
import { initSourcesToggle } from './sources-toggle';
```

**Step 2: Initialize sources toggle in DOMContentLoaded handler**

Add after line 90 (`initSidebarToggle();`) inside the `if (hasSidebar)` block:

```typescript
    // Initialize sources toggle for pages with sources
    initSourcesToggle();
```

---

## Task 8: Test with Sample Sources

**Files:**
- Create: `content/algebra/sources.yaml` (test file)

**Step 1: Create a test sources.yaml file**

```yaml
sources:
  - title: "Abstract Algebra"
    author: "David S. Dummit & Richard M. Foote"
    type: book
    isbn: "978-0471433347"
    notes: "Primary reference for group theory content"
```

**Step 2: Run the development server**

Run: `docker-compose -f docker-compose.dev.yml up -d`

**Step 3: Check an algebra page for sources section**

Open a browser to `http://localhost:5000/mathnotes/algebra/abstract/groups/` and verify:
- Sources section appears at bottom of page
- Collapsed by default
- Click expands to show the source
- Styling looks correct

**Step 4: Clean up test file (optional)**

The test file can remain as real content if the sources are accurate, or be removed.

---

## Task 9: Add Page-Specific Sources Test

**Step 1: Add sources to a page frontmatter**

Edit any content page (e.g., `content/algebra/abstract/groups.md`) and add to frontmatter:

```yaml
sources:
  - title: "Visual Group Theory"
    author: "Nathan Carter"
    type: book
    url: "https://www.maa.org/press/maa-reviews/visual-group-theory"
```

**Step 2: Verify both directory and page sources appear**

The page should now show both the directory-level source and the page-specific source.

---

## Summary

Files created:
- `mathnotes/sources.py` - Source collection module
- `styles/components/sources.css` - Styling
- `demos-framework/src/sources-toggle.ts` - Toggle interaction

Files modified:
- `mathnotes/sitegenerator/pages.py` - Integrate sources into page context
- `templates/page.html` - Render sources UI
- `styles/main.css` - Import sources CSS
- `demos-framework/src/main.ts` - Initialize toggle
