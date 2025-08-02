# Style Guide

This document outlines the styling and CSS guidelines for the Mathnotes project.

## CSS Guidelines

### Use Theme Variables
* **NEVER hardcode colors** - Always use CSS custom properties from the theme
* All colors should reference theme variables: `var(--color-primary)`, `var(--color-secondary)`, etc.
* Use OKLCH color space for defining colors - provides better perceptual uniformity and more predictable color manipulation
* Use spacing variables: `var(--space-xs)`, `var(--space-sm)`, `var(--space-md)`, `var(--space-lg)`, etc.
* Use typography variables for consistent font sizes and line heights

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
* CSS entry point at `styles/main.css` processed by Vite
* Hot module replacement in development for instant style updates
* Theme variables defined in `styles/theme.css`, utilities in `styles/utilities.css`

### Development Tips
* CSS changes in development have hot module replacement - no need to restart the server
* Always verify styles work in both light and dark modes
* Test responsive layouts on mobile devices

### CSP Compliance
* All inline scripts need `nonce="{{ csp_nonce }}"`
* No inline event handlers (onclick, onload)
* Use `addEventListener` and data attributes
* Demos must be CSP-compliant