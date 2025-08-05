// Demo viewer functionality - manages navigation between demos
import type { DemoConfig, DemoInstance } from './types';

interface DemoMetadata {
  title: string;
  category: string;
  description?: string;
}

interface DemoListItem {
  name: string;
  metadata: DemoMetadata;
}

class DemoViewer {
  private currentDemoIndex = 0;
  private demoList: DemoListItem[] = [];
  private currentDemoInstance: DemoInstance | null = null;
  private prevButton: HTMLButtonElement | null = null;
  private nextButton: HTMLButtonElement | null = null;
  private demoCounter: HTMLElement | null = null;
  private demoContent: HTMLElement | null = null;
  private footerDemoTitle: HTMLElement | null = null;

  constructor() {
    // Check if we're on the demo viewer page
    if (!document.body.classList.contains('demo-viewer-page')) {
      return;
    }

    // Initialize elements
    this.prevButton = document.getElementById('prev-button') as HTMLButtonElement;
    this.nextButton = document.getElementById('next-button') as HTMLButtonElement;
    this.demoCounter = document.getElementById('demo-counter');
    this.demoContent = document.getElementById('demo-content');
    this.footerDemoTitle = document.getElementById('footer-demo-title');

    // Set up event listeners
    this.setupEventListeners();

    // Wait for demo registry to be available
    this.checkAndInitialize();
  }

  private setupEventListeners(): void {
    // Navigation buttons
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.navigateDemo(-1));
    }
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.navigateDemo(1));
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.navigateDemo(-1);
      } else if (e.key === 'ArrowRight') {
        this.navigateDemo(1);
      }
    });

    // Hash changes
    window.addEventListener('hashchange', () => this.handleHashChange());

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanupCurrentDemo();
    });
  }

  private checkAndInitialize(): void {
    if (window.demoRegistry && window.demoMetadata) {
      this.initializeDemoViewer();
    } else {
      setTimeout(() => this.checkAndInitialize(), 100);
    }
  }

  private async initializeDemoViewer(): Promise<void> {
    // Load all metadata first
    await this.loadAllMetadata();

    // Get all demos and sort them by category and name
    const demoNames = Object.keys(window.demoRegistry);
    this.demoList = demoNames.map(name => ({
      name: name,
      metadata: window.demoMetadata[name] || {
        title: name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        category: 'Other',
        description: ''
      }
    })).sort((a, b) => {
      // Sort by category first, then by title
      const catCompare = a.metadata.category.localeCompare(b.metadata.category);
      if (catCompare !== 0) return catCompare;
      return a.metadata.title.localeCompare(b.metadata.title);
    });

    // Check if there's a hash in the URL
    const hash = window.location.hash.slice(1); // Remove the #
    const startIndex = this.findDemoIndexByName(hash);

    // Start with the demo from the hash or the first demo
    this.loadDemo(startIndex >= 0 ? startIndex : 0);
  }

  private async loadAllMetadata(): Promise<void> {
    if (!window.demoMetadata) {
      window.demoMetadata = {};
    }

    const demoNames = Object.keys(window.demoRegistry);
    const loadPromises = demoNames.map(async (name) => {
      try {
        const module = await window.demoRegistry[name]();
        if (module.metadata) {
          window.demoMetadata[name] = module.metadata;
        }
      } catch (error) {
        console.error(`Failed to load metadata for ${name}:`, error);
      }
    });
    await Promise.all(loadPromises);
  }

  private cleanupCurrentDemo(): void {
    if (this.currentDemoInstance && this.currentDemoInstance.cleanup) {
      try {
        this.currentDemoInstance.cleanup();
      } catch (error) {
        console.error('Error cleaning up demo:', error);
      }
    }
    this.currentDemoInstance = null;
  }

  private async loadDemo(index: number): Promise<void> {
    // Don't allow going past the last demo
    if (index >= this.demoList.length) {
      return;
    }

    // Cleanup previous demo
    this.cleanupCurrentDemo();

    this.currentDemoIndex = index;
    this.updateNavigationButtons();
    this.updateCounter();

    const demo = this.demoList[index];
    
    if (!this.demoContent) {
      return;
    }

    // Update URL hash
    window.history.replaceState(null, '', '#' + demo.name);

    // Update footer info
    if (this.footerDemoTitle) {
      this.footerDemoTitle.textContent = demo.metadata.title;
    }

    // Create demo container (no info box needed)
    this.demoContent.innerHTML = `
      <div class="demo-component" data-demo="${demo.name}"></div>
    `;

    // Load and initialize the demo
    const container = this.demoContent.querySelector('.demo-component') as HTMLElement;
    if (!container) {
      return;
    }

    try {
      const module = await window.demoRegistry[demo.name]();
      const config: DemoConfig = {
        darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      };

      // Wait for the container to be properly laid out
      // This ensures offsetWidth is correct before initialization
      await new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      this.currentDemoInstance = module.default(container, config);
    } catch (error) {
      console.error(`Failed to load demo "${demo.name}":`, error);
      container.innerHTML = `<div class="demo-error">Failed to load demo: ${(error as Error).message}</div>`;
    }
  }

  private navigateDemo(direction: number): void {
    const newIndex = this.currentDemoIndex + direction;
    if (newIndex >= 0 && newIndex < this.demoList.length) {
      this.loadDemo(newIndex);
    }
  }

  private updateNavigationButtons(): void {
    if (this.prevButton) {
      this.prevButton.disabled = this.currentDemoIndex === 0;
    }
    if (this.nextButton) {
      this.nextButton.disabled = this.currentDemoIndex >= this.demoList.length - 1;
    }
  }

  private updateCounter(): void {
    if (this.demoCounter) {
      this.demoCounter.textContent = `Demo ${this.currentDemoIndex + 1} of ${this.demoList.length}`;
    }
  }

  private findDemoIndexByName(name: string): number {
    if (!name) return -1;
    return this.demoList.findIndex(demo => demo.name === name);
  }

  private handleHashChange(): void {
    const hash = window.location.hash.slice(1); // Remove the #
    const index = this.findDemoIndexByName(hash);

    // Only load if it's a different demo
    if (index >= 0 && index !== this.currentDemoIndex) {
      this.loadDemo(index);
    }
  }
}

// Initialize the demo viewer on DOMContentLoaded
export function initDemoViewer(): void {
  new DemoViewer();
}