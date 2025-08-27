import p5 from 'p5';
import type { DemoConfig } from './types';

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
  text: p5.Color;
  accent: p5.Color;
  grid: p5.Color;
  axis: p5.Color;
  error: p5.Color;
  success: p5.Color;
  warning: p5.Color;
  info: p5.Color;
  surface: p5.Color;
  surfaceAlt: p5.Color;
  liquid: p5.Color;
  liquidDark: p5.Color;
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
  if (center) containerEl.classList.add('text-center');
  
  // Create canvas parent div
  const canvasParent = document.createElement('div');
  canvasParent.className = 'demo-canvas-container';
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
      text: p.color(224, 224, 224),  // Light gray text for dark mode
      accent: p.color(100, 150, 255),
      grid: p.color(60, 60, 60),
      axis: p.color(150, 150, 150),
      error: p.color(255, 87, 87),
      success: p.color(87, 255, 87),
      warning: p.color(255, 193, 7),
      info: p.color(33, 150, 243),
      surface: p.color(45, 45, 45),
      surfaceAlt: p.color(60, 60, 60),
      liquid: p.color(173, 216, 230),
      liquidDark: p.color(25, 118, 210)
    };
  } else {
    return {
      background: p.color(255, 255, 255),
      foreground: p.color(30, 30, 30),
      stroke: p.color(0, 0, 0),
      fill: p.color(50, 50, 50),
      text: p.color(51, 51, 51),  // Dark gray text for light mode
      accent: p.color(50, 100, 200),
      grid: p.color(200, 200, 200),
      axis: p.color(100, 100, 100),
      error: p.color(211, 47, 47),
      success: p.color(46, 125, 50),
      warning: p.color(245, 124, 0),
      info: p.color(25, 118, 210),
      surface: p.color(245, 245, 245),
      surfaceAlt: p.color(235, 235, 235),
      liquid: p.color(173, 216, 230),
      liquidDark: p.color(0, 0, 139)
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
  
  // Special case: aspectRatio of 0 means use full width with height constraint
  if (aspectRatio === 0) {
    const width = isMobile 
      ? window.innerWidth - 20
      : container.offsetWidth - 20 || window.innerWidth * 0.8;
    const height = window.innerHeight * maxHeightPercent;
    return { width, height };
  }
  
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