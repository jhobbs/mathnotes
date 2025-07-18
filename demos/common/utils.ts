// Shared utilities for demos
import p5 from 'p5';
import type { DemoInstance, DemoConfig } from '@framework/types';

export interface DemoContainerOptions {
  center?: boolean;
  id?: string;
  className?: string;
}

export interface DemoColors {
  background: p5.Color;
  foreground: p5.Color;
  stroke: p5.Color;
  fill: p5.Color;
  text: string;
  accent: p5.Color;
  grid?: p5.Color;
  axis?: p5.Color;
}

export interface CanvasSize {
  width: number;
  height: number;
}

/**
 * Creates a standardized demo container with optional centering and ID
 */
export function createDemoContainer(
  container: HTMLElement, 
  options: DemoContainerOptions = {}
): { containerEl: HTMLElement; canvasParent: HTMLElement } {
  const { center = true, id, className } = options;
  
  // Create main container
  const containerEl = document.createElement('div');
  if (id) containerEl.id = id;
  if (className) containerEl.className = className;
  if (center) containerEl.style.textAlign = 'center';
  
  // Create canvas parent div
  const canvasParent = document.createElement('div');
  canvasParent.style.display = 'inline-block';
  canvasParent.style.position = 'relative';
  if (!id) canvasParent.id = `demo-${Date.now()}`;
  
  containerEl.appendChild(canvasParent);
  container.appendChild(containerEl);
  
  return { containerEl, canvasParent };
}

/**
 * Detects if dark mode is active
 */
export function isDarkMode(config?: DemoConfig): boolean {
  return config?.darkMode ?? 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

/**
 * Gets standard demo colors based on dark mode
 */
export function getDemoColors(p: p5, config?: DemoConfig): DemoColors {
  const isDark = isDarkMode(config);
  
  if (isDark) {
    return {
      background: p.color(30, 30, 30),
      foreground: p.color(220, 220, 220),
      stroke: p.color(200, 200, 200),
      fill: p.color(180, 180, 180),
      text: '#e0e0e0',
      accent: p.color(100, 150, 255),
      grid: p.color(60, 60, 60),
      axis: p.color(150, 150, 150)
    };
  } else {
    return {
      background: p.color(255, 255, 255),
      foreground: p.color(30, 30, 30),
      stroke: p.color(0, 0, 0),
      fill: p.color(50, 50, 50),
      text: '#333333',
      accent: p.color(50, 100, 200),
      grid: p.color(200, 200, 200),
      axis: p.color(100, 100, 100)
    };
  }
}

/**
 * Calculates responsive canvas size
 */
export function getResponsiveCanvasSize(
  container: HTMLElement,
  config?: DemoConfig,
  aspectRatio: number = 0.6,
  maxHeightPercent: number = 0.8
): CanvasSize {
  // If fixed size is specified in config, use it
  if (config?.width && config?.height) {
    return { width: config.width, height: config.height };
  }
  
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    // Mobile: use full window width minus small margin
    let width = window.innerWidth - 20;
    let height = width * aspectRatio;
    
    // Constrain by max height
    const maxHeight = window.innerHeight * maxHeightPercent;
    if (height > maxHeight) {
      height = maxHeight;
      width = height / aspectRatio;
    }
    
    return { width, height };
  } else {
    // Desktop: use container width or fallback
    let width = container.offsetWidth - 20 || window.innerWidth * 0.8;
    let height = width * aspectRatio;
    
    // Constrain by max height
    const maxHeight = window.innerHeight * maxHeightPercent;
    if (height > maxHeight) {
      height = maxHeight;
      width = height / aspectRatio;
    }
    
    return { width, height };
  }
}

/**
 * Adds dark mode CSS styles for demo controls
 */
export function addDemoStyles(container: HTMLElement, prefix: string = 'demo'): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = `
    .${prefix}-button {
      padding: 5px 10px;
      margin: 0 5px;
      cursor: pointer;
      background-color: #f0f0f0;
      color: #333;
      border: 1px solid #ccc;
      border-radius: 3px;
      transition: background-color 0.2s;
    }
    
    .${prefix}-button:hover {
      background-color: #e0e0e0;
    }
    
    .${prefix}-info {
      color: #333;
    }
    
    .${prefix}-label {
      color: #333;
      margin-bottom: 5px;
    }
    
    @media (prefers-color-scheme: dark) {
      .${prefix}-button {
        background-color: #444;
        color: #e0e0e0;
        border-color: #666;
      }
      
      .${prefix}-button:hover {
        background-color: #555;
      }
      
      .${prefix}-info {
        color: #e0e0e0;
      }
      
      .${prefix}-label {
        color: #e0e0e0;
      }
    }
    
    /* Slider styles */
    input[type="range"].${prefix}-slider {
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
      height: 8px !important;
      background: #d0d0d0 !important;
      border-radius: 4px !important;
      outline: none !important;
      cursor: pointer !important;
    }
    
    /* Webkit browsers (Chrome, Safari, Edge) */
    input[type="range"].${prefix}-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: #4a7ba7;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    
    /* Firefox */
    input[type="range"].${prefix}-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #4a7ba7;
      border-radius: 50%;
      cursor: pointer;
      border: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    
    input[type="range"].${prefix}-slider::-moz-range-track {
      background: #d0d0d0;
      height: 6px;
      border-radius: 3px;
    }
    
    @media (prefers-color-scheme: dark) {
      input[type="range"].${prefix}-slider {
        background: #5a5a5a !important;
      }
      
      input[type="range"].${prefix}-slider::-webkit-slider-thumb {
        background: #6496ff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.5);
      }
      
      input[type="range"].${prefix}-slider::-moz-range-thumb {
        background: #6496ff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.5);
      }
      
      input[type="range"].${prefix}-slider::-moz-range-track {
        background: #5a5a5a;
      }
    }
    
    /* Radio button styles */
    .${prefix}-radio {
      display: flex;
      gap: 20px;
      justify-content: center;
      align-items: center;
    }
    
    .${prefix}-radio label {
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      color: #333;
      font-size: 14px;
    }
    
    .${prefix}-radio input[type="radio"] {
      cursor: pointer;
      margin: 0;
    }
    
    @media (prefers-color-scheme: dark) {
      .${prefix}-radio label {
        color: #e0e0e0;
      }
    }
    
    /* Select dropdown styles */
    .${prefix}-select {
      padding: 5px 10px;
      margin: 0 5px;
      cursor: pointer;
      background-color: #f0f0f0;
      color: #333;
      border: 1px solid #ccc;
      border-radius: 3px;
      font-size: 14px;
    }
    
    @media (prefers-color-scheme: dark) {
      .${prefix}-select {
        background-color: #444;
        color: #e0e0e0;
        border-color: #666;
      }
      
      .${prefix}-select option {
        background-color: #444;
        color: #e0e0e0;
      }
    }
  `;
  container.appendChild(style);
  return style;
}

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

/**
 * Creates a standardized control panel
 */
export function createControlPanel(
  parent: HTMLElement,
  options: { id?: string; className?: string } = {}
): HTMLElement {
  const panel = document.createElement('div');
  if (options.id) panel.id = options.id;
  panel.className = options.className || 'demo-controls';
  panel.style.marginTop = '20px';
  panel.style.textAlign = 'center';
  parent.appendChild(panel);
  return panel;
}

/**
 * Creates a standardized button
 */
export function createButton(
  text: string,
  parent: HTMLElement,
  onClick: () => void,
  className: string = 'demo-button'
): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = className;
  button.addEventListener('click', onClick);
  parent.appendChild(button);
  return button;
}

/**
 * Creates a slider with label
 */
export function createSlider(
  p: p5,
  label: string,
  min: number,
  max: number,
  value: number,
  step: number,
  parent: HTMLElement,
  onChange?: () => void,
  className: string = 'demo'
): p5.Element {
  const rowDiv = document.createElement('div');
  rowDiv.style.marginBottom = '10px';
  rowDiv.style.display = 'flex';
  rowDiv.style.flexDirection = 'column';
  rowDiv.style.alignItems = 'center';
  rowDiv.style.gap = '5px';
  parent.appendChild(rowDiv);
  
  const labelDiv = document.createElement('div');
  labelDiv.textContent = label;
  labelDiv.className = `${className}-label`;
  labelDiv.style.textAlign = 'center';
  labelDiv.style.fontSize = '14px';
  rowDiv.appendChild(labelDiv);
  
  const slider = p.createSlider(min, max, value, step);
  slider.parent(rowDiv);
  slider.class(`${className}-slider`);
  slider.style('width: 120px');
  
  if (onChange) {
    (slider as any).input(onChange);
  }
  
  return slider;
}