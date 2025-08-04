// Main entry point for Vite
// This file will handle dynamic imports of demo modules

console.log('[Demo Framework] main.ts loaded');

import type { DemoConfig, DemoInstance } from './types';

// Import dev auto-reload for development mode
import './dev-auto-reload';

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
  'elementary-cellular-automata': () => import('@demos/cellular-automata/elementary-cellular-automata')
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
