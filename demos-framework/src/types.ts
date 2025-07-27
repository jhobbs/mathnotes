// Shared types for all demo modules
import type p5 from 'p5';

export interface DemoConfig {
  darkMode?: boolean;
  width?: number;
  height?: number;
}

export interface DemoInstance {
  cleanup(): void;
  resize?(): void;
  pause?(): void;
  resume?(): void;
}

export type DemoInitFunction = (container: HTMLElement, config?: DemoConfig) => DemoInstance;

// P5.js specific types
export interface P5DemoInstance extends DemoInstance {
  p5Instance: p5;
}

// Common event types
export interface DemoEventHandlers {
  onResize?: (width: number, height: number) => void;
  onThemeChange?: (darkMode: boolean) => void;
  onVisibilityChange?: (visible: boolean) => void;
}

// Re-export types from other modules for convenience
export type { CanvasSize, DemoColors } from './demo-utils';
export type { DemoMetadata } from './p5-base';