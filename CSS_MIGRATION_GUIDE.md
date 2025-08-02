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