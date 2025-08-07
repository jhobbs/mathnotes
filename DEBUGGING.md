# Debugging Guide

This guide contains debugging techniques and troubleshooting tips for working with the mathnotes codebase.

## Troubleshooting

### Common Issues
- **CSP Errors**: Ensure no inline JavaScript is used (all JS must be in external files)
- **404 Errors**: Use `/sitemap.xml` to find correct URLs
- **Dark Mode**: Uses CSS `@media (prefers-color-scheme)`, not classes
- **Test Failures**: Run in Docker for consistency
- **Permission Errors**: Clean with `rm -rf htmlcov .pytest_cache`

### Debug Commands
```bash
# Verify demo registration
grep -r "registerDemo" mathnotes/demos-framework/src/main.ts

# Check for CSP violations
# Open browser console and look for CSP errors
```

## Debug Techniques

### Console Probe Debugging
- You can use console.log("[probe] ...") to debug JavaScript/CSS/DOM issues in conjunction with the page crawler
- Example: `console.log('[probe] Copyright display:', getComputedStyle(element).display)`
- Run with: `./scripts/crawl-dev.sh --single-page "http://web-dev:5000/demos/#demo-name" 2>&1 | grep "\[probe\]"`

### Demo Screenshot Analysis
The demo crawler (`./scripts/crawl-demos.py`) supports AI-powered visual analysis:

```bash
# Check demo scaling between desktop and mobile
./scripts/crawl-demos.py -d demo-name --check-scaling

# Ask specific questions about screenshots using placeholders
./scripts/crawl-demos.py -d demo-name --viewport mobile --ask "Look at $FULL_PATH. Is the footer readable?"

# Available placeholders:
# - $BASE_PATH: The base demo screenshot
# - $FULL_PATH: Full page screenshot including surrounding content
# - $CANVAS_PATH: Just the canvas area

# Enable verbose mode to see OpenAI prompts
./scripts/crawl-demos.py -v -d demo-name --ask "question"
```

### Mobile-Specific Testing
```bash
# Test mobile viewport only
./scripts/crawl-demos.py -d demo-name --viewport mobile

# Common mobile issues to check:
# - Text breaking awkwardly (use $FULL_PATH to see footer/header)
# - Canvas elements being cropped
# - Interactive controls stacking properly
# - Arrow/visual element visibility at smaller sizes
```

### CSS Development
With the modern CSS system:
1. **Main CSS entry**: `styles/main.css` imports theme and utilities
2. **Theme variables**: Edit `styles/theme.css` for colors, spacing, typography
3. **PostCSS features**: Use CSS nesting, custom media queries, modern color functions
4. **Hot module replacement**: CSS changes appear instantly in development
5. **CSS Modules**: Available for component-scoped styles (e.g., `DemoControls.module.css`)

### Responsive Scaling Best Practices
When implementing responsive demos:
1. Scale constants based on canvas size:
   ```typescript
   private updateScaling(p: p5): void {
     const scaleFactor = Math.min(p.width, p.height) / baseSize;
     this.RADIUS = baseRadius * scaleFactor;
     this.ARROW_SIZE = Math.max(minSize, baseArrowSize * scaleFactor);
   }
   ```

2. Use different values for mobile:
   ```typescript
   const strokeWeight = p.width < 768 ? 4 : 3; // Thicker on mobile
   const minArrowScalar = p.width < 768 ? 25 : 15; // Larger minimum on mobile
   ```

3. Handle resize events:
   ```typescript
   protected onResize(p: p5, size: CanvasSize): void {
     this.updateScaling(p);
   }
   ```

## Demo Testing Workflow

### Standard Demo Testing
```bash
# Test a specific demo
./scripts/crawl-demos.py -d demo-name

# Check if demo meets standards
./scripts/crawl-demos.py -d demo-name --check-standards

# Check dark mode handling
./scripts/crawl-demos.py -d demo-name --check-dark-mode

# Get AI description of demo functionality
./scripts/crawl-demos.py -d demo-name --describe
```

### Advanced Demo Analysis
```bash
# Compare demo container to full page (check for layout issues)
./scripts/crawl-demos.py -d neighborhood --ask "compare @$BASE_PATH to @$FULL_PATH. is the demo area visible in the full page?"

# Check specific visual issues
./scripts/crawl-demos.py -d diagonalization --ask "is the widget flombulating properly in @$BASE_PATH?"
```

## JavaScript Error Detection

### Using the Page Crawler
```bash
# Test a specific page for JavaScript errors
./scripts/crawl-dev.sh --single-page "http://web-dev:5000/mathnotes/page-slug"

# Test framework changes by crawling entire site
./scripts/crawl-dev.sh "http://web-dev:5000"

# Filter for specific error types
./scripts/crawl-dev.sh --single-page "http://web-dev:5000/demos" 2>&1 | grep -E "ERROR|error|Error|failed|Failed"
```

## TypeScript Debugging

### Type Checking
```bash
# Check TypeScript type errors
npm run type-check
```

## Docker Debugging

### Container Logs
```bash
# View logs for all containers
docker-compose -f docker-compose.dev.yml logs

# Follow logs for specific container
docker-compose -f docker-compose.dev.yml logs -f web-dev

```

### Container Shell Access
```bash
# Access web container shell
docker-compose -f docker-compose.dev.yml exec web-dev bash
```

## Performance Debugging

### Bundle Analysis
```bash
# Build with bundle analyzer (if configured)
npm run build -- --analyze
```

### Network Debugging
Use browser developer tools:
1. Network tab to check asset loading
2. Performance tab for runtime analysis
3. Coverage tab to find unused CSS/JS

## Security Debugging

### CSP Violations
1. Open browser console
2. Look for Content Security Policy errors
3. Check for inline scripts (not allowed - all JS must be external)
4. Verify all demos use event listeners instead of inline handlers

### Common CSP Fixes
- Move all inline scripts to external JavaScript files
- Replace `onclick` with `addEventListener`
- Use data attributes instead of inline event handlers
