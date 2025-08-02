# CSS Migration Guide

## Overview

We've modernized the CSS system with:
- PostCSS for modern CSS features
- CSS Modules for component scoping
- CSS Custom Properties for theming
- Modern responsive design patterns
- Container queries for intrinsic layouts

## What's New

### 1. PostCSS Configuration
- **CSS Nesting**: Write nested CSS like Sass
- **Custom Media Queries**: Define reusable breakpoints
- **Modern Color Functions**: Use `oklch()`, `lab()`, `color-mix()`
- **Autoprefixer**: Automatic vendor prefixes

### 2. Theme System
- All colors now use CSS custom properties
- Modern color spaces for better perceptual uniformity
- Consistent spacing and typography scales
- Dark mode support built-in

### 3. CSS Modules
- Component-scoped styles
- TypeScript support for type-safe class names
- No more global class name conflicts

### 4. Modern Features
- Container queries for component-level responsive design
- Logical properties for better internationalization
- Fluid typography with `clamp()`
- Custom scrollbars and focus states

## Migration Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Update HTML Templates
Replace the old CSS link:
```html
<!-- Old -->
<link rel="stylesheet" href="/static/main.css">

<!-- New -->
<link rel="stylesheet" href="/static/dist/main.css">
```

### 3. Update Vite Build
The new CSS will be processed through Vite:
```javascript
// In your main.ts
import '@/styles/main.css';
```

### 4. Use Theme Variables
Replace hardcoded colors:
```css
/* Old */
color: #0366d6;

/* New */
color: var(--color-link);
```

### 5. Update Components
For new components, use CSS Modules:
```typescript
import styles from './Component.module.css';

element.classList.add(styles.container);
```

## Key Differences

### Colors
- All colors now use CSS custom properties
- Math block colors use modern `oklch()` for consistency
- Dark mode automatically adjusts all colors

### Spacing
- Consistent spacing scale: `--space-xs` through `--space-3xl`
- Use logical properties: `margin-block`, `padding-inline`

### Typography
- Fluid font sizes with `clamp()`
- Modern text wrapping: `text-wrap: balance/pretty`

### Responsive Design
- Custom media queries: `@media (--phone)`, `@media (--tablet)`
- Container queries for component-level responsiveness
- Intrinsic layouts with `min()`, `max()`, `clamp()`

## Benefits

1. **Better Performance**: PostCSS optimizations
2. **Type Safety**: CSS Modules with TypeScript
3. **Maintainability**: Centralized theme system
4. **Modern Features**: Latest CSS capabilities
5. **Better DX**: Nesting, custom properties, modern tooling

## Examples

### Using the new theme
```css
.my-component {
  /* Colors */
  background: var(--color-bg);
  color: var(--color-text);
  
  /* Spacing */
  padding: var(--space-md);
  margin-block: var(--space-lg);
  
  /* Typography */
  font-size: var(--font-size-lg);
  line-height: var(--line-height-base);
  
  /* Borders and shadows */
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
```

### Responsive with custom media
```css
.grid {
  display: grid;
  gap: var(--space-md);
  
  @media (--phone) {
    grid-template-columns: 1fr;
  }
  
  @media (--tablet) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (--desktop) {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Container queries
```css
.card {
  container-type: inline-size;
  
  & .title {
    font-size: var(--font-size-lg);
  }
  
  @container (max-width: 400px) {
    & .title {
      font-size: var(--font-size-base);
    }
  }
}
```

## Legacy CSS Inventory

### 1. Legacy CSS Files

#### `/static/main.css` - **REMOVED ✅**
- **Status**: Successfully migrated and removed
- **Migration Date**: 2025-08-02
- **Content Migrated**: 
  - All CSS custom properties merged into theme system
  - Typography, layout, navigation styles modernized
  - Interactive demo component styles with container queries
  - Structured mathematical content styling with modern color functions
  - Mobile optimizations with custom media queries
  - MathJax integration styles preserved
  - Tooltip system updated
  - Math content toggle buttons modernized
- **Result**: All styles successfully migrated to `/styles/main.css` and `/styles/theme.css`

### 2. Inline Styles in HTML Templates

#### `/templates/demos_showcase.html`
- Line 126: `style="text-align: center; padding: 50px;"`

#### `/templates/index.html`
- Line 114: `style="margin-left: {{ level * 1.5 }}rem;"`
- Line 137: `style="color: var(--blockquote-color); margin-bottom: 1.5rem;"`

### 3. Style Tags in HTML Templates - **MEDIUM PRIORITY**

#### `/templates/demos_showcase.html` (Lines 6-100+)
- Grid layouts, cards, responsive design for demos showcase

#### `/templates/homepage.html` (Lines 8-80+)
- Homepage-specific styling with CSS custom properties

#### `/templates/demo_viewer.html` (Lines 6-80+)
- Demo viewer layout customizations (header hiding, footer mods)

#### `/templates/index.html` (Lines 8-80+)
- Collapsible sections and directory navigation styles

### 4. CSS-in-TypeScript (Direct Style Assignments)

Demo files with element.style manipulation:
- `/demos/cellular-automata/elementary-cellular-automata.ts`
- `/demos/cellular-automata/game-of-life.ts`
- `/demos/differential-equations/pendulum.ts`
- `/demos/differential-equations/dilution-visual.ts`
- `/demos/differential-equations/turntable.ts`
- `/demos/graphics/projection.ts`

Framework files:
- `/demos-framework/src/p5-base.ts`
- `/demos-framework/src/demo-utils.ts`
- `/demos-framework/src/tooltip-system.ts`
- `/demos-framework/src/components/DemoControls.ts`

### 5. CSS-in-JavaScript (Template Literals) - **MEDIUM PRIORITY**

#### `/demos/differential-equations/dilution-calculator.ts` (Lines 150-256)
- Large CSS template literal with form styling, responsive design, dark mode

#### `/demos-framework/src/ui-components.ts` (Lines 47-277)
- Extensive CSS for UI components (buttons, sliders, inputs)

## Migration Checklist

- [x] Audit legacy `/static/main.css` against modern CSS system
- [x] Document which styles are duplicated vs missing
- [x] Migrate missing styles to modern system
- [ ] Extract template `<style>` tags to separate files
- [ ] Convert CSS-in-JS template literals to CSS modules
- [ ] Replace inline styles with CSS classes
- [x] Remove legacy main.css
- [ ] Update build process if needed
- [x] Test all pages for visual regressions