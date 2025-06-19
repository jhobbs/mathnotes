# Demo Integration Plan: Converting Iframes to Direct HTML Integration

## Current State Analysis

### How Demos Currently Work
1. **Markdown Processing**: The `{% include_relative demo.html %}` tags in markdown files are converted to iframes by `MarkdownProcessor`
2. **Iframe Generation**: Each demo gets wrapped in a container with:
   - An iframe loading the standalone HTML file
   - A fullscreen button (⛶) for expanded viewing
   - Fixed height of 800px, 100% width
3. **Demo Structure**: Each demo HTML file is self-contained with:
   - Complete HTML document structure
   - External library loading (P5.js, etc.)
   - CSS includes (`/static/demo-style.css`)
   - JavaScript includes (demo-specific JS files)
   - Dark mode support via `/static/demo-dark-mode.js`

### Challenges for Direct Integration

1. **Multiple HTML Document Structures**: Can't have nested `<html>`, `<head>`, `<body>` tags
2. **Script Loading Order**: Need to ensure libraries load before demo scripts
3. **CSS Isolation**: Demo styles might conflict with main page styles
4. **JavaScript Scope**: Global variables in demos might collide
5. **Dark Mode Integration**: Currently handled by separate script in each demo
6. **Fullscreen Functionality**: Would need rethinking without iframe isolation
7. **Security**: CSP nonces required for inline scripts

## Proposed Architecture

### Phase 1: Convert Demo HTML to Components

1. **Extract Demo Content**:
   - Remove `<html>`, `<head>`, `<body>` wrapper tags
   - Extract only the essential content and scripts
   - Create a manifest of required libraries per demo

2. **Create Demo Component Template**:
   ```html
   <div class="demo-component" data-demo-id="{{demo_id}}">
     <div class="demo-content">
       <!-- Demo-specific HTML content -->
     </div>
     <script nonce="{{ csp_nonce }}">
       (function() {
         // Wrapped demo JavaScript in IIFE for scope isolation
       })();
     </script>
   </div>
   ```

3. **Library Management**:
   - Move common libraries (P5.js, etc.) to base template
   - Load once per page instead of per demo
   - Use data attributes to track which demos need which libraries

### Phase 2: Update Markdown Processor

1. **Modify Include Processing**:
   - Instead of generating iframe HTML, read and process demo files
   - Strip HTML document structure, keep content
   - Inject CSP nonces into inline scripts
   - Wrap JavaScript in IIFEs for scope isolation

2. **Resource Tracking**:
   - Track which libraries each demo needs
   - Pass requirements to template context
   - Ensure libraries load before demo scripts

### Phase 3: Style and Script Isolation

1. **CSS Scoping**:
   - Prefix all demo CSS with `.demo-component[data-demo-id="X"]`
   - Use CSS custom properties for theming
   - Ensure dark mode variables cascade properly

2. **JavaScript Namespacing**:
   - Wrap each demo's JS in a closure
   - Use unique namespaces per demo
   - Expose necessary APIs via data attributes or events

### Phase 4: Enhanced Features

1. **New Fullscreen Mode**:
   - Use CSS/JS to expand demo container
   - Maintain context within page
   - Better mobile experience

2. **Progressive Enhancement**:
   - Demos work without JavaScript (where possible)
   - Loading states for heavy demos
   - Lazy loading for performance

## Implementation Steps

### Step 1: Prototype with Single Demo
- Choose `electric-field.html` as test case
- Create new processor method for direct inclusion
- Test scope isolation and functionality

### Step 2: Create Demo Converter Script
```python
# scripts/convert_demo.py
# - Parse HTML file
# - Extract content between body tags
# - Identify required libraries
# - Generate component version
# - Update references in markdown
```

### Step 3: Update Templates
- Modify `base.html` to include common libraries
- Add demo component styles to main CSS
- Update JavaScript for new interaction model

### Step 4: Batch Conversion
- Run converter on all demo files
- Test each demo individually
- Fix any scope or styling issues

### Step 5: Update Documentation
- Document new demo format
- Create guidelines for future demos
- Update CLAUDE.md with new patterns

## Progressive Rollout Strategy

### Phase 0: Feature Flag Setup
1. **Add Configuration Flag**:
   ```python
   # In app.py or config
   ENABLE_DIRECT_DEMOS = os.environ.get('ENABLE_DIRECT_DEMOS', 'false').lower() == 'true'
   DIRECT_DEMO_WHITELIST = os.environ.get('DIRECT_DEMO_WHITELIST', '').split(',')
   ```

2. **Dual-Mode Markdown Processor**:
   - Keep existing iframe logic as default
   - Add new direct integration logic behind feature flag
   - Allow per-demo opt-in via whitelist

### Phase 1: Single Demo Pilot (Week 1)
1. **Convert One Simple Demo**: Start with `electric-field.html`
2. **Test Locally**: Verify functionality matches iframe version
3. **A/B Testing**: Deploy with flag enabled for specific path only
4. **Monitor**: Check for console errors, performance metrics

### Phase 2: Gradual Expansion (Weeks 2-3)
1. **Success Criteria**: Define metrics before expanding
   - No JavaScript errors
   - Page load time within 10% of iframe version
   - All interactive features working
   
2. **Progressive Whitelist**:
   ```
   Week 2: electric-field.html,cellular.html
   Week 3: +turntable.html,projection.html
   Week 4: +neighborhood-demo.html (complex UI demo)
   ```

3. **Rollback Ready**: Keep both versions of demos
   - `demo.html` (original iframe version)
   - `demo-integrated.html` (new direct version)

### Phase 3: Category-Based Rollout (Weeks 4-5)
1. **Group by Complexity**:
   - **Simple P5.js demos**: Electric field, cellular automata
   - **Medium complexity**: Pursuit curves, projections
   - **Complex UI demos**: Calculators, multi-control interfaces

2. **Enable by Category**:
   ```python
   if demo_category == 'simple' and datetime.now() > SIMPLE_DEMO_DATE:
       use_direct = True
   ```

### Phase 4: Full Migration (Week 6+)
1. **Opt-Out Instead of Opt-In**: 
   - Default to direct integration
   - Maintain blacklist for problematic demos
   
2. **Legacy Support**:
   - Keep iframe fallback for 3 months
   - Mark deprecated in code
   - Plan removal date

### Monitoring and Rollback Plan

1. **Metrics to Track**:
   - Page load times per demo type
   - JavaScript error rates
   - User engagement with demos
   - Browser compatibility issues

2. **Instant Rollback Triggers**:
   - Error rate > 5% on any demo
   - Page load time increase > 25%
   - Any security warnings

3. **Rollback Mechanism**:
   ```python
   # Quick disable via environment variable
   ENABLE_DIRECT_DEMOS=false fly deploy
   ```

### Testing Strategy for Progressive Rollout

1. **Automated Tests**:
   ```python
   # tests/test_demo_integration.py
   def test_demo_parity():
       # Compare iframe vs direct output
       # Ensure identical functionality
   ```

2. **Manual Test Checklist** (per demo):
   - [ ] Demo loads without errors
   - [ ] All interactive features work
   - [ ] Dark mode switches properly
   - [ ] Fullscreen mode functions
   - [ ] No style bleeding
   - [ ] No JS conflicts with other demos

3. **Browser Matrix** (test each phase):
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Mobile Chrome/Safari

## Benefits of Direct Integration

1. **Performance**: No iframe overhead, single page load
2. **Consistency**: Unified dark mode, styling, fonts
3. **Accessibility**: Better screen reader support
4. **SEO**: Content is part of main document
5. **Mobile**: Better responsive behavior
6. **Interaction**: Demos can interact with main content

## Risks and Mitigations

1. **Risk**: JavaScript conflicts between demos
   - **Mitigation**: Strict namespacing, IIFE wrapping

2. **Risk**: CSS bleeding between demos/main content
   - **Mitigation**: Scoped selectors, CSS modules approach

3. **Risk**: Breaking existing demos during conversion
   - **Mitigation**: Automated testing, gradual rollout

4. **Risk**: Increased page weight
   - **Mitigation**: Lazy loading, code splitting

5. **Risk**: Security issues with inline scripts
   - **Mitigation**: CSP nonces, careful sanitization

## Timeline Estimate

- **Week 1**: Prototype and single demo conversion
- **Week 2**: Build conversion tools and update processor
- **Week 3**: Convert all demos and test
- **Week 4**: Performance optimization and documentation

## Fallback Plan

If direct integration proves too complex:
1. Keep iframe approach but optimize:
   - Lazy load iframes
   - Share resources via postMessage
   - Better iframe sizing
2. Hybrid approach:
   - Simple demos integrated directly
   - Complex demos remain in iframes