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

// Single source of truth for color values (RGB tuples)
type RGB = readonly [number, number, number];

const COLOR_VALUES = {
  dark: {
    background: [30, 30, 30] as RGB,
    foreground: [220, 220, 220] as RGB,
    stroke: [200, 200, 200] as RGB,
    fill: [180, 180, 180] as RGB,
    text: [224, 224, 224] as RGB,
    accent: [100, 150, 255] as RGB,
    grid: [60, 60, 60] as RGB,
    axis: [150, 150, 150] as RGB,
    error: [255, 87, 87] as RGB,
    success: [87, 255, 87] as RGB,
    warning: [255, 193, 7] as RGB,
    info: [33, 150, 243] as RGB,
    surface: [45, 45, 45] as RGB,
    surfaceAlt: [60, 60, 60] as RGB,
    liquid: [173, 216, 230] as RGB,
    liquidDark: [25, 118, 210] as RGB,
  },
  light: {
    background: [255, 255, 255] as RGB,
    foreground: [30, 30, 30] as RGB,
    stroke: [0, 0, 0] as RGB,
    fill: [50, 50, 50] as RGB,
    text: [51, 51, 51] as RGB,
    accent: [50, 100, 200] as RGB,
    grid: [200, 200, 200] as RGB,
    axis: [100, 100, 100] as RGB,
    error: [211, 47, 47] as RGB,
    success: [46, 125, 50] as RGB,
    warning: [245, 124, 0] as RGB,
    info: [25, 118, 210] as RGB,
    surface: [245, 245, 245] as RGB,
    surfaceAlt: [235, 235, 235] as RGB,
    liquid: [173, 216, 230] as RGB,
    liquidDark: [0, 0, 139] as RGB,
  },
} as const;

/**
 * Gets standard demo colors as p5.Color objects (for p5.js demos)
 */
export function getDemoColors(p: p5, config?: DemoConfig): DemoColors {
  const v = isDarkMode(config) ? COLOR_VALUES.dark : COLOR_VALUES.light;
  return {
    background: p.color(...v.background),
    foreground: p.color(...v.foreground),
    stroke: p.color(...v.stroke),
    fill: p.color(...v.fill),
    text: p.color(...v.text),
    accent: p.color(...v.accent),
    grid: p.color(...v.grid),
    axis: p.color(...v.axis),
    error: p.color(...v.error),
    success: p.color(...v.success),
    warning: p.color(...v.warning),
    info: p.color(...v.info),
    surface: p.color(...v.surface),
    surfaceAlt: p.color(...v.surfaceAlt),
    liquid: p.color(...v.liquid),
    liquidDark: p.color(...v.liquidDark),
  };
}

export type CssColors = { [K in keyof typeof COLOR_VALUES.dark]: string };

/**
 * Gets standard demo colors as CSS rgb() strings (for Plotly/non-p5 demos)
 */
export function getCssColors(isDark: boolean): CssColors {
  const v = isDark ? COLOR_VALUES.dark : COLOR_VALUES.light;
  const toRgb = (c: RGB) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  return {
    background: toRgb(v.background),
    foreground: toRgb(v.foreground),
    stroke: toRgb(v.stroke),
    fill: toRgb(v.fill),
    text: toRgb(v.text),
    accent: toRgb(v.accent),
    grid: toRgb(v.grid),
    axis: toRgb(v.axis),
    error: toRgb(v.error),
    success: toRgb(v.success),
    warning: toRgb(v.warning),
    info: toRgb(v.info),
    surface: toRgb(v.surface),
    surfaceAlt: toRgb(v.surfaceAlt),
    liquid: toRgb(v.liquid),
    liquidDark: toRgb(v.liquidDark),
  };
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