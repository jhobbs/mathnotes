// Main entry point for Vite
// This file will handle dynamic imports of demo modules

import type { DemoConfig, DemoInstance } from './types';

// Demo registry - will be populated as demos are converted
const demoRegistry: Record<string, () => Promise<{ default: (container: HTMLElement, config?: DemoConfig) => DemoInstance }>> = {
  'electric-field': () => import('@demos/physics/electric-field'),
  'neighborhood': () => import('@demos/topology/neighborhood'),
  'projection': () => import('@demos/graphics/projection'),
  'countable-union': () => import('@demos/real-analysis/topology/countable-union'),
  'countable-tuples': () => import('@demos/real-analysis/topology/countable-tuples'),
  'diagonalization': () => import('@demos/real-analysis/topology/diagonalization'),
  'turntable': () => import('@demos/differential-equations/turntable')
};

// Expose registry globally for inline scripts
(window as any).demoRegistry = demoRegistry;

// Initialize demos on page load
document.addEventListener('DOMContentLoaded', () => {
  const demoContainers = document.querySelectorAll<HTMLElement>('.demo-component[data-demo]');
  
  demoContainers.forEach(async (container) => {
    const demoName = container.dataset.demo;
    if (!demoName || !demoRegistry[demoName]) {
      console.error(`Demo "${demoName}" not found in registry`);
      return;
    }
    
    try {
      const module = await demoRegistry[demoName]();
      const config: DemoConfig = {
        darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
        width: container.dataset.width ? parseInt(container.dataset.width) : undefined,
        height: container.dataset.height ? parseInt(container.dataset.height) : undefined,
      };
      
      const instance = module.default(container, config);
      
      // Store instance for cleanup
      (container as any).__demoInstance = instance;
      
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