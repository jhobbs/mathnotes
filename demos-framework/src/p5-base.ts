import p5 from 'p5';
import type { DemoInstance, DemoConfig } from './types';
import { isDarkMode, getDemoColors, getResponsiveCanvasSize, createDemoContainer } from './demo-utils';
import type { DemoColors, CanvasSize } from './demo-utils';
import { addDemoStyles, createControlPanel, createButton, createSlider } from './ui-components';

/**
 * Base class for p5.js demos with standard lifecycle management
 */
// Demo metadata interface
export interface DemoMetadata {
  title: string;
  category: string;
  description: string;
  instructions?: string | (() => string);
}

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
  
  // Common UI elements
  protected containerEl?: HTMLElement;
  protected canvasParent?: HTMLElement;
  protected controlPanel?: HTMLElement;
  protected styleElement?: HTMLStyleElement;
  protected instructionsEl?: HTMLElement;
  
  // Demo metadata
  protected metadata?: DemoMetadata;
  
  constructor(container: HTMLElement, config?: DemoConfig, metadata?: DemoMetadata) {
    this.container = container;
    this.config = config;
    this.metadata = metadata;
    this.isDarkMode = isDarkMode(config);
  }
  
  /**
   * Initialize the demo
   */
  init(): DemoInstance {
    // Set up container structure if not already done
    this.setupContainer();
    
    // Add styles if enabled
    if (this.shouldAddStyles()) {
      this.styleElement = addDemoStyles(this.container, this.getStylePrefix());
    }
    
    // Add instructions if provided
    if (this.shouldShowInstructions()) {
      this.setupInstructions();
    }
    
    // Set up dark mode listener before creating p5 instance
    this.setupColorSchemeListener();
    
    // Create the p5 instance with our wrapped sketch
    this.p5Instance = new p5((p: p5) => {
      // Let the demo configure the sketch first
      this.createSketch(p);
      
      // Store the original setup if provided
      const userSetup = p.setup;
      
      // Override p5 setup to include our base functionality
      p.setup = () => {
        // Create responsive canvas with default or specified aspect ratio
        const aspectRatio = this.getAspectRatio();
        const maxHeight = this.getMaxHeightPercent();
        this.createResponsiveCanvas(p, aspectRatio, maxHeight);
        
        // Set up automatic resizing by default
        this.setupResponsiveResize(p, (size) => this.onResize(p, size));
        
        // Call the demo's setup if provided
        if (userSetup) {
          userSetup.call(p);
        }
      };
    });
    
    return {
      cleanup: this.cleanup.bind(this),
      resize: this.resize.bind(this),
      pause: this.pause.bind(this),
      resume: this.resume.bind(this)
    };
  }
  
  /**
   * Create the p5 sketch function
   * The base class will automatically handle canvas creation and resizing
   */
  protected abstract createSketch(p: p5): void;
  
  /**
   * Get the aspect ratio for the canvas
   * Override to use a different aspect ratio
   */
  protected getAspectRatio(): number {
    return 0.67;
  }
  
  /**
   * Get the maximum height as a percentage of viewport
   * Override to limit canvas height
   */
  protected getMaxHeightPercent(): number | undefined {
    return undefined;
  }
  
  
  /**
   * Called when the window is resized
   * Override this to handle resize events in your demo
   */
  protected onResize(_p: p5, _size: CanvasSize): void {
    // Default implementation does nothing
    // Override in subclasses to handle resize
  }
  
  /**
   * Set up the container structure
   * Override to customize container setup
   */
  protected setupContainer(): void {
    if (!this.canvasParent) {
      const result = createDemoContainer(this.container, {
        center: this.shouldCenterCanvas(),
        id: this.getContainerId()
      });
      this.containerEl = result.containerEl;
      this.canvasParent = result.canvasParent;
    }
  }
  
  /**
   * Whether to add default demo styles
   * Override to disable automatic style addition
   */
  protected shouldAddStyles(): boolean {
    return true;
  }
  
  /**
   * Get the style prefix for CSS classes
   * Override to use custom prefix
   */
  protected getStylePrefix(): string {
    return 'demo';
  }
  
  /**
   * Whether to center the canvas
   * Override to change centering behavior
   */
  protected shouldCenterCanvas(): boolean {
    return true;
  }
  
  /**
   * Get the container ID
   * Override to set custom container ID
   */
  protected getContainerId(): string | undefined {
    return undefined;
  }
  
  /**
   * Whether to show instructions
   * Override to disable automatic instruction display
   */
  protected shouldShowInstructions(): boolean {
    return true;
  }
  
  /**
   * Get instructions content
   * Override to provide custom instructions
   */
  protected getInstructions(): string | null {
    if (this.metadata?.instructions) {
      return typeof this.metadata.instructions === 'function' 
        ? this.metadata.instructions() 
        : this.metadata.instructions;
    }
    return null;
  }
  
  /**
   * Set up instructions display
   */
  protected setupInstructions(): void {
    const instructions = this.getInstructions();
    if (!instructions) return;
    
    this.instructionsEl = document.createElement('div');
    this.instructionsEl.className = `${this.getStylePrefix()}-instructions demo-info`;
    this.instructionsEl.style.marginTop = 'var(--space-lg)';
    this.instructionsEl.style.textAlign = 'center';
    this.instructionsEl.innerHTML = instructions;
    this.container.appendChild(this.instructionsEl);
  }
  
  /**
   * Update instructions dynamically
   */
  protected updateInstructions(content: string): void {
    if (this.instructionsEl) {
      this.instructionsEl.innerHTML = content;
    }
  }
  
  /**
   * Create a responsive canvas with automatic sizing
   * Call this in your p5 setup() function
   */
  protected createResponsiveCanvas(p: p5, aspectRatio?: number, maxHeightPercent?: number): p5.Renderer {
    const size = this.getCanvasSize(aspectRatio, maxHeightPercent);
    const canvas = p.createCanvas(size.width, size.height);
    if (this.canvasParent) {
      canvas.parent(this.canvasParent);
    }
    
    // Initialize colors after canvas creation
    this.updateColors(p);
    
    return canvas;
  }
  
  /**
   * Set up standard window resize handler
   * Call this in your createSketch method to enable automatic resizing
   */
  protected setupResponsiveResize(p: p5, onResize?: (size: CanvasSize) => void): void {
    p.windowResized = () => {
      this.handleResize(p, onResize);
    };
  }
  
  /**
   * Create a control panel for the demo
   * Returns the panel element for adding controls
   */
  protected createControlPanel(options?: { id?: string; className?: string }): HTMLElement {
    if (!this.containerEl) {
      throw new Error('Container not initialized. Call setupContainer() first.');
    }
    this.controlPanel = createControlPanel(this.containerEl, options);
    return this.controlPanel;
  }
  
  /**
   * Create a button in the control panel
   */
  protected createButton(text: string, onClick: () => void, className?: string): HTMLButtonElement {
    const panel = this.controlPanel || this.createControlPanel();
    return createButton(text, panel, onClick, className || `${this.getStylePrefix()}-button`);
  }
  
  /**
   * Create a slider in the control panel
   */
  protected createSlider(
    p: p5,
    label: string,
    min: number,
    max: number,
    value: number,
    step: number,
    onChange?: () => void
  ): p5.Element {
    const panel = this.controlPanel || this.createControlPanel();
    return createSlider(p, label, min, max, value, step, panel, onChange, this.getStylePrefix());
  }
  
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
    
    // Clear references
    this.containerEl = undefined;
    this.canvasParent = undefined;
    this.controlPanel = undefined;
    this.styleElement = undefined;
    this.instructionsEl = undefined;
  }
  
  /**
   * Handle window resize
   */
  protected resize(): void {
    // p5 instances have windowResized method but it's not in the type definitions
    if (this.p5Instance && 'windowResized' in this.p5Instance && typeof this.p5Instance.windowResized === 'function') {
      (this.p5Instance.windowResized as () => void)();
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