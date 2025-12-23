console.log('[Demo Framework] main.ts loaded');

import type { DemoConfig, DemoInstance } from './types';

// Import dev auto-reload (it will check if it should activate)
import('./dev-auto-reload');

// Import mathblock toggle functionality
import { initMathBlockToggle } from './mathblock-toggle';

// Import section toggle functionality for index page
import { initSectionToggle } from './section-toggle';

// Import sidebar toggle functionality for content pages
import { initSidebarToggle } from './sidebar-toggle';

// Import demo viewer functionality
import { initDemoViewer } from './demo-viewer';

// Demo metadata type
interface DemoMetadata {
  title: string;
  category: string;
  description?: string;
}

// Demo module type
interface DemoModule {
  default: (container: HTMLElement, config?: DemoConfig) => DemoInstance;
  metadata?: DemoMetadata;
}

// Demo registry - will be populated as demos are converted
const demoRegistry: Record<string, () => Promise<DemoModule>> = {
  'electric-field': () => import('@demos/physics/electric-field'),
  'neighborhood': () => import('@demos/real-analysis/topology/neighborhood'),
  'projection': () => import('@demos/graphics/projection'),
  'countable-union': () => import('@demos/real-analysis/topology/countable-union'),
  'countable-tuples': () => import('@demos/real-analysis/topology/countable-tuples'),
  'diagonalization': () => import('@demos/real-analysis/topology/diagonalization'),
  'turntable': () => import('@demos/differential-equations/turntable'),
  'pendulum': () => import('@demos/differential-equations/pendulum'),
  'dilution-calculator': () => import('@demos/differential-equations/dilution-calculator'),
  'dilution-visual': () => import('@demos/differential-equations/dilution-visual'),
  'game-of-life': () => import('@demos/cellular-automata/game-of-life'),
  'elementary-cellular-automata': () => import('@demos/cellular-automata/elementary-cellular-automata'),
  'cross-product': () => import('@demos/linear-algebra/cross-product'),
  'binary-network': () => import('@demos/network/binary-network'),
  'cauchy-riemann': () => import('@demos/complex-analysis/cauchy-riemann'),
  'contour-drawing': () => import('@demos/complex-analysis/contour-drawing'),
  'dft-computation': () => import('@demos/complex-analysis/dft-computation'),
  'dft-editor': () => import('@demos/complex-analysis/dft-editor'),
  'open-path-dft': () => import('@demos/complex-analysis/open-path-dft')
};

// Store for loaded metadata
const demoMetadata: Record<string, DemoMetadata> = {};

// Extend Window interface for demo globals
declare global {
  interface Window {
    demoRegistry: typeof demoRegistry;
    demoMetadata: typeof demoMetadata;
  }
}

// Expose registry and metadata globally for inline scripts
console.log('[Demo Framework] Exposing registry to window');
window.demoRegistry = demoRegistry;
window.demoMetadata = demoMetadata;

// Initialize demos on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Demo Framework] DOMContentLoaded fired');
  
  // Initialize mathblock toggle functionality
  initMathBlockToggle();
  
  // Initialize section toggle for index page
  const isIndexPage = document.querySelector('.sections-container');
  if (isIndexPage) {
    initSectionToggle();
  }

  // Initialize sidebar toggle for content pages with sidebar
  const hasSidebar = document.body.classList.contains('has-sidebar');
  if (hasSidebar) {
    initSidebarToggle();
  }

  // Initialize demo viewer if on demo viewer page
  const isDemoViewerPage = document.body.classList.contains('demo-viewer-page');
  if (isDemoViewerPage) {
    initDemoViewer();
  }
  
  const demoContainers = document.querySelectorAll<HTMLElement>('.demo-component[data-demo]');
  console.log('[Demo Framework] Found demo containers:', demoContainers.length);
  
  demoContainers.forEach(async (container) => {
    const demoName = container.dataset.demo;
    if (!demoName || !demoRegistry[demoName]) {
      console.error(`Demo "${demoName}" not found in registry`);
      return;
    }
    
    console.log(`[Demo Framework] Loading demo: ${demoName}`);
    try {
      const module = await demoRegistry[demoName]();
      
      // Store metadata if available
      if (module.metadata) {
        demoMetadata[demoName] = module.metadata;
      }
      
      const config: DemoConfig = {
        darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
        width: container.dataset.width ? parseInt(container.dataset.width) : undefined,
        height: container.dataset.height ? parseInt(container.dataset.height) : undefined,
      };
      
      const instance = module.default(container, config);
      
      // Store instance for cleanup
      interface DemoContainer extends HTMLElement {
        __demoInstance?: DemoInstance;
      }
      (container as DemoContainer).__demoInstance = instance;
      
      // Handle cleanup on page unload
      window.addEventListener('beforeunload', () => {
        instance.cleanup();
      });
    } catch (error) {
      console.error(`Failed to load demo "${demoName}":`, error);
    }
  });
});

// Re-export types for demo modules to use
export type { DemoConfig, DemoInstance } from './types';
