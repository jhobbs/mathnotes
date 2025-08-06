# Style Guide

This document outlines the styling and CSS guidelines for the Mathnotes project.

## CSS Guidelines

### Use Theme Variables and Design Tokens
* **NEVER hardcode values** - Always use CSS custom properties (design tokens) from the theme
* **Colors**: Use theme variables like `var(--color-primary)`, `var(--color-secondary)`, etc.
  - Use OKLCH color space for defining colors - provides better perceptual uniformity
* **Spacing**: Use spacing tokens: `var(--space-xs)` through `var(--space-3xl)`
  - Also use gap tokens: `var(--gap-xs)` through `var(--gap-2xl)`
* **Typography**: Use font size tokens: `var(--font-size-xs)` through `var(--font-size-3xl)`
  - Use line height tokens: `var(--line-height-tight)`, `var(--line-height-base)`, `var(--line-height-relaxed)`
* **Borders**: Use border tokens:
  - Widths: `var(--border-width-thin)` through `var(--border-width-heavy)`
  - Radius: `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-lg)`, `var(--radius-full)`
* **Component Sizes**: Use size tokens like `var(--size-input-base)`, `var(--size-button-icon)`, etc.
* **Layout**: Use content width tokens: `var(--width-content-base)`, `var(--width-content-wide)`
* **Heights**: Use height tokens: `var(--height-input-min)`, `var(--height-card-base)`, etc.
* **Shadows**: Use shadow tokens: `var(--shadow-sm)` through `var(--shadow-xl)`
* **Transitions**: Use transition tokens: `var(--transition-fast)`, `var(--transition-base)`, `var(--transition-slow)`
* **Z-index**: Use z-index scale: `var(--z-base)` through `var(--z-tooltip)`
* **Breakpoints**: Reference breakpoint tokens in PostCSS: `var(--breakpoint-phone)`, `var(--breakpoint-tablet)`, etc.
* **Transforms**: Use transform tokens: `var(--translate-subtle)`, `var(--translate-sm)`, etc.

### No Inline Styles
* **NEVER use inline styles** - Always use CSS classes instead
* The codebase uses a modern CSS system with:
  - CSS Modules for component-scoped styles (e.g., `import styles from './Component.module.css'`)
  - Global styles in `/styles/` directory
  - Theme variables defined in `/styles/theme.css`
  - All inline styles have been removed - maintain this standard

### Modern CSS System
* PostCSS for modern CSS features (nesting, custom media queries)
* CSS custom properties for theming (colors, spacing, typography)
* CSS entry point at `styles/main.css` processed by the build system
* Hot module replacement in development for instant style updates
* Theme variables defined in `styles/theme.css`, utilities in `styles/utilities.css`

### Development Tips
* CSS changes in development have hot module replacement - no need to restart the server
* Always verify styles work in both light and dark modes
* Test responsive layouts on mobile devices

### CSP Compliance
* No inline JavaScript - all scripts must be in external files
* No inline event handlers (onclick, onload)
* Use `addEventListener` and data attributes
* Demos must be CSP-compliant