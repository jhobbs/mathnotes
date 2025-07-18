import p5 from 'p5';
import type { DemoInstance, DemoConfig } from './types';
import { isDarkMode, getDemoColors, getResponsiveCanvasSize } from './demo-utils';
import type { DemoColors, CanvasSize } from './demo-utils';

/**
 * Base class for p5.js demos with standard lifecycle management
 */
export abstract class P5DemoBase {
  protected p5Instance: p5 | null = null;
  protected container: HTMLElement;
  protected config?: DemoConfig;
  protected eventListeners: Array<{ target: EventTarget; type: string; listener: EventListener }> = [];
  
  // Dark mode support
  protected isDarkMode: boolean = false;
  protected colors!: DemoColors;
  private colorSchemeQuery?: MediaQueryList;
  
  // Canvas sizing (no defaults - let demos decide)
  protected canvasSize?: CanvasSize;
  protected aspectRatio?: number;
  
  constructor(container: HTMLElement, config?: DemoConfig) {
    this.container = container;
    this.config = config;
    this.isDarkMode = isDarkMode(config);
  }
  
  /**
   * Initialize the demo
   */
  init(): DemoInstance {
    // Set up dark mode listener before creating p5 instance
    this.setupColorSchemeListener();
    
    this.p5Instance = new p5(this.createSketch.bind(this));
    
    return {
      cleanup: this.cleanup.bind(this),
      resize: this.resize.bind(this),
      pause: this.pause.bind(this),
      resume: this.resume.bind(this)
    };
  }
  
  /**
   * Create the p5 sketch function
   */
  protected abstract createSketch(p: p5): void;
  
  /**
   * Update colors based on current dark mode state
   * Override this to customize colors for your demo
   */
  protected updateColors(p: p5): void {
    this.colors = getDemoColors(p, this.config);
  }
  
  /**
   * Set up automatic dark mode detection
   */
  private setupColorSchemeListener(): void {
    if (window.matchMedia) {
      this.colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        this.isDarkMode = e.matches;
        if (this.p5Instance) {
          this.updateColors(this.p5Instance);
          this.onColorSchemeChange?.(this.isDarkMode);
        }
      };
      this.addEventListener(this.colorSchemeQuery, 'change', listener as EventListener);
    }
  }
  
  /**
   * Optional callback when color scheme changes
   */
  protected onColorSchemeChange?(isDark: boolean): void;
  
  /**
   * Get responsive canvas size with optional aspect ratio and height constraint
   */
  protected getCanvasSize(aspectRatio?: number, maxHeightPercent?: number): CanvasSize {
    // Use provided aspect ratio, or stored one, or default to 0.67
    const ratio = aspectRatio ?? this.aspectRatio ?? 0.67;
    if (aspectRatio !== undefined) {
      this.aspectRatio = aspectRatio;
    }
    this.canvasSize = getResponsiveCanvasSize(this.container, this.config, ratio, maxHeightPercent);
    return this.canvasSize;
  }
  
  /**
   * Handle responsive resizing with optional callback
   */
  protected handleResize(p: p5, onResize?: (size: CanvasSize) => void): void {
    const newSize = this.getCanvasSize();
    p.resizeCanvas(newSize.width, newSize.height);
    onResize?.(newSize);
  }
  
  /**
   * Add an event listener that will be automatically cleaned up
   */
  protected addEventListener(target: EventTarget, type: string, listener: EventListener, options?: AddEventListenerOptions): void {
    target.addEventListener(type, listener, options);
    this.eventListeners.push({ target, type, listener });
  }
  
  /**
   * Clean up the demo
   */
  protected cleanup(): void {
    // Remove p5 instance
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }
    
    // Remove all event listeners
    for (const { target, type, listener } of this.eventListeners) {
      target.removeEventListener(type, listener);
    }
    this.eventListeners = [];
    
    // Clear container
    this.container.innerHTML = '';
  }
  
  /**
   * Handle window resize
   */
  protected resize(): void {
    if (this.p5Instance && typeof (this.p5Instance as any).windowResized === 'function') {
      (this.p5Instance as any).windowResized();
    }
  }
  
  /**
   * Pause the demo
   */
  protected pause(): void {
    if (this.p5Instance) {
      this.p5Instance.noLoop();
    }
  }
  
  /**
   * Resume the demo
   */
  protected resume(): void {
    if (this.p5Instance) {
      this.p5Instance.loop();
    }
  }
}