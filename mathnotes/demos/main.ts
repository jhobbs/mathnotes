// Main entry point for Vite
// This file will handle dynamic imports of demo modules

interface DemoConfig {
  darkMode?: boolean;
  width?: number;
  height?: number;
}

interface DemoInstance {
  cleanup(): void;
  resize?(): void;
  pause?(): void;
  resume?(): void;
}

// Demo registry - will be populated as demos are converted
const demoRegistry: Record<string, () => Promise<{ default: (container: HTMLElement, config?: DemoConfig) => DemoInstance }>> = {
  // Example: 'electric-field': () => import('./physics/electric-field')
};

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
        darkMode: document.documentElement.classList.contains('dark-mode'),
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

// Export types for demo modules to use
export type { DemoConfig, DemoInstance };