# JavaScript Demo System Modernization Plan

## Overview

This document outlines a comprehensive plan to modernize the Mathnotes JavaScript demo system, moving away from legacy iframe-based embedding to a modern, modular approach that improves maintainability, reusability, and testability.

## Current Issues

### 1. Legacy Iframe Embedding (REMOVED)
- Previously used `{% include_relative %}` to embed via iframes
- This approach has been completely removed from the codebase
- All demos should now use the TypeScript module approach

### 2. Legacy HTML Integration (REMOVED)
- ~~Previous `{% include_integrated_relative %}` approach read full HTML files~~ (removed)
- Now using modern TypeScript module approach with `{% include_demo %}`
- Clean separation of demo logic and presentation
- Vite handles bundling and dependencies
- Type-safe demo implementations

### 3. Script Loading Order & Duplication
- Each demo HTML includes its own scripts and library references
- Leads to duplication (e.g., loading P5.js multiple times)
- Potential load order problems when multiple demos on one page
- Can break functionality if libraries load after demo scripts

### 4. Global Scope & CSS Conflicts
- Demos aren't truly isolated
- Rely on global variables (e.g., P5 attaches to `window`)
- CSS can affect main page or other demos
- Current IIFE wrapping reduces but doesn't eliminate collisions

### 5. Difficult Reuse of Components
- No straightforward way to reuse demo components
- Common functionality requires copy-paste
- No shared module or library for interactive components

### 6. Lack of Automated Testing
- Minimal support for testing interactive demos
- Need structure for automated browser testing (Playwright)
- Demos should be designed for testability

## Goals and Design Requirements

### 1. Unified Embedding Mechanism
- Single "include demo" mechanism without iframes or HTML stripping
- Simple referencing by ID or path
- Automatic proper sizing with fullscreen option

### 2. Modern Module-Based JavaScript
- ES6 modules or build system
- Centralized dependency management (npm/bundler)
- One copy of each library loaded in correct order

### 3. Reusable Components/Library
- Common functionality factored into reusable modules
- Demos import and use shared components
- Eliminate code duplication

### 4. Isolated Scope and Styles
- Each demo runs in isolated scope (IIFEs or ES6 modules)
- CSS scoped via container classes or custom elements
- No style clashes between demos or with main site

### 5. Improved HTML Structure
- Store demo content in clean format (no full HTML wrappers)
- Split into markup snippet and script module
- Clear separation of UI and logic

### 6. Ease of Inclusion and Rotation
- Place any demo on any page
- Reference demos by unique name
- Support random demo selection (e.g., homepage)
- Demos not tightly coupled to content paths

### 7. Testability
- Easy automation with headless browsers
- DOM hooks/data attributes for tests
- Playwright for end-to-end testing

### 8. LLM-Friendly Implementation
- Incremental, manageable tasks (<500-1000 lines per session)
- Consistent patterns
- TypeScript or JSDoc for self-documentation

## Technology Stack Decisions

### TypeScript
- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Autocomplete and refactoring
- **Self-Documenting**: Types serve as inline documentation
- **Easier Refactoring**: Confident changes with type checking
- **AI-Friendly**: Clear contracts help LLMs generate correct code

### Vite
- **Fast HMR**: Hot Module Replacement for instant updates
- **Zero Config**: Works out of the box with TypeScript
- **Optimized Builds**: Automatic code splitting and tree shaking
- **Native ES Modules**: Development server uses native ESM
- **Built-in Features**:
  - TypeScript compilation
  - CSS preprocessing
  - Asset handling
  - Dependency pre-bundling

## Implementation Phases

### Phase 1: Project Setup and Build System Integration

**Objective**: Set up modern JavaScript development workflow

#### 1.1 Initialize JS Build Environment
- Add Node.js project setup
- Create `package.json`
- Install Vite as the build tool and dev server

#### 1.2 Organize Source Directory
- Create proper separation of framework and content:
  - `demos-framework/` - TypeScript framework/library code
    - `src/main.ts` - Main entry point and demo registry
    - `src/types.ts` - Shared TypeScript interfaces
    - `src/utils/` - Common utilities
  - `demos/` - Actual demo implementations
    - `physics/electric-field/electric-field.ts`
    - `math/complex-plane/complex-plane.ts`
    - etc.
- Keep TypeScript code OUT of the Python package directory

#### 1.3 Modernize Dependency Management
- Use npm for libraries (p5.js, math.js, etc.)
- Configure Vite for optimal chunking and code splitting
- Leverage Vite's automatic dependency pre-bundling
- Single entry point with dynamic imports for demos

#### 1.4 TypeScript Configuration
- Use TypeScript for all demo code and components
- Set up `tsconfig.json` with strict mode
- Configure Vite's built-in TypeScript support
- Define interfaces for demo initialization and common components

#### 1.5 Integrate Build with Flask
- Update static file handling
- Configure Vite output to `mathnotes/static/dist/`
- Add `vite build` step to deployment/Makefile
- Update base template to load Vite bundles
- Set up Vite proxy for development (proxy to Flask backend)

### Phase 2: Demo Module Refactoring and Inclusion Mechanism

**Objective**: Refactor demos to new module format with new inclusion system

#### 2.1 Refactor Pilot Demo
- Start with Electric Field demo
- Remove HTML wrapper, create content snippet
- Convert script to TypeScript module
- Export typed init function: `initElectricFieldDemo(container: HTMLElement): DemoInstance`
- Define `DemoInstance` interface with cleanup method

#### 2.2 Implement New Include Tag
- Create Flask/Jinja macro: `{% include_demo "physics/electric-field" %}`
- Output standardized container and module loader:
```html
<div class="demo-component" data-demo="electric-field" id="demo-electric-field"></div>
<script type="module" nonce="{{ csp_nonce }}">
  import initDemo from "/static/dist/electric-field.js";
  const container = document.getElementById("demo-electric-field");
  initDemo(container);
</script>
```

#### 2.3 Load Common Libraries Globally
- Remove individual script includes from demos
- Include libraries once in base template
- Create `common.js` for shared dependencies

#### 2.4 Ensure CSP Compliance
- Handle Content Security Policy nonces
- Minimal inline scripts (just initialization)
- No eval or new Function

#### 2.5 Verify Pilot Demo
- Test display and functionality
- Verify no missing libraries or script errors
- Ensure fullscreen still works

#### 2.6 Gradually Convert All Demos
- Convert 2-3 demos at a time
- Test each in isolation
- Commit small batches

#### 2.7 Transitional Compatibility (Optional)
- Support both systems briefly if needed
- Feature flag for gradual rollout

### Phase 3: Common Component Library and Reusability

**Objective**: Create shared modules for common functionality

#### 3.1 Identify Common Functionality
- Review all demos for duplication
- List common features (grids, axes, UI controls)

#### 3.2 Create demoLib Module
- Create `demos/common/` directory with TypeScript modules
- Examples:
  - `canvasUtils.ts`
  - `cartesianPlane.ts`
- Export typed functions/classes
- Example interface:
```typescript
interface DemoInstance {
  cleanup(): void;
  resize?(): void;
  pause?(): void;
  resume?(): void;
}

interface DemoConfig {
  darkMode?: boolean;
  width?: number;
  height?: number;
}
```

#### 3.3 Use Shared Code in Demos
- Update demos to import from common modules
- Remove duplicated code

#### 3.4 Make Components Testable
- Provide methods/events for state inspection
- Structure for deterministic execution
- Expose internal state for debugging

#### 3.5 Document Common APIs
- Create documentation for shared components
- Include usage examples

### Phase 4: Testing Infrastructure with Playwright

**Objective**: Set up automated end-to-end testing

#### 4.1 Set Up Playwright
- Add Playwright to project
- Write basic test script
- Use Node version to match build system

#### 4.2 Write Smoke Tests
- Test each converted demo:
  - Navigate to demo page
  - Verify elements load
  - Interact with demo
  - Assert no JS errors

#### 4.3 Continuous Testing
- Integrate into CI
- Create `make test-demos` target
- Catch regressions from AI-generated code

#### 4.4 Performance Checks
- Test multiple demos on one page
- Ensure smooth interactions

#### 4.5 Fullscreen Mode Test
- Test new fullscreen implementation
- Verify proper enlargement and closing

### Phase 5: Clean-Up and Enhancement

**Objective**: Finalize transition and improve remaining issues

#### 5.1 Remove Legacy Code
- ~~Strip out old `{% include_relative %}` handling~~ (completed)
- Remove iframe-related code
- Remove feature flags

#### 5.2 Tidy Up Demo Files
- Delete old standalone HTML files
- Update any direct file references

#### 5.3 Documentation
- How to include demos in Markdown
- How to create new demos
- How to run tests

#### 5.4 Cross-Browser Verification
- Test across Chrome, Firefox, Safari
- Add polyfills if needed

#### 5.5 Dark Mode and Theming
- Ensure dark mode support continues
- Integrate theme handling globally

#### 5.6 Future Enhancement - Web Components (Optional)
- Consider custom elements for demos
- Example: `<electric-field-demo></electric-field-demo>`

#### 5.7 Final Review
- Code quality pass
- Ensure consistent architecture

## Incremental Implementation Sessions

1. **Session 1 - Build Setup** (~200 lines) ✅ COMPLETED
   - Create package.json with TypeScript and Vite
   - Configure vite.config.ts and tsconfig.json
   - Set up development server with Flask proxy
   - Verify TypeScript module compilation and serving

2. **Session 2 - Pilot Demo Refactor** (~300 lines) ✅ COMPLETED
   - Convert Electric Field demo to TypeScript
   - Define demo interfaces and types
   - Implement `{% include_demo %}` tag
   - Test Vite HMR during development

3. **Session 3 - Restructure Demo Organization** (~250 lines) ✅ COMPLETED
   - Move TypeScript code out of Python package directory
   - Create proper separation:
     - `demos-framework/` - Demo library/framework code (types, utilities, main.ts)
     - `demos/` - Actual demo implementations
   - Update Vite configuration for new structure
   - Update imports and build paths
   - Ensure Flask static file serving works with new structure

4. **Session 4 - Include System Refinements** (~150 lines)
   - Handle multiple demos
   - Ensure common libs loaded once

5. **Session 5 - Convert Remaining Demos**
   - 2-3 demos per session (~100 lines each)

6. **Session 6 - Common Library Refactoring** (~200 lines initial)
   - Create shared modules
   - Start with one utility

7. **Session 7 - Testing Setup** (~200 lines)
   - Add Playwright
   - Write basic test cases

8. **Session 8 - Complete Test Coverage**
   - Tests for all demos

9. **Session 9 - Cleanup Legacy Code** (~100 lines)
   - Remove iframe code
   - Simplify obsolete logic

10. **Session 10 - Documentation & Polish**
   - Write docs
   - Cross-browser fixes

## Expected Outcomes

- Modern, maintainable demo system
- Reusable components
- Automated testing
- AI-friendly codebase
- Better performance
- Easier demo creation

## References

- Current implementation in `markdown_processor.py`
- Existing demos in `content/` directories
- Base template and script handling
- DEMO_INTEGRATION_PLAN.md