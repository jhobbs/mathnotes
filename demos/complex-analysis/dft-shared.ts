// Shared utilities for DFT-related demos
// Used by contour-drawing.ts and dft-computation.ts

import { Complex } from 'mathjs';
import { CanvasPlotUtils } from './contour-shared';

// ============================================================================
// Type Utilities
// ============================================================================

// Type for numeric mathjs results we know won't be BigNumber/Fraction/Matrix
export type NumericResult = number | bigint | Complex;

// Helper to extract real part from a mathjs result (number, bigint, or Complex)
export function toReal(val: NumericResult): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'bigint') return Number(val);
  return val.re;
}

// ============================================================================
// Animation Timer
// ============================================================================

/**
 * Manages animation interval timers with start/stop/restart functionality.
 * Encapsulates the common setInterval/clearInterval pattern used in demos.
 */
export class AnimationTimer {
  private timerId: number | null = null;

  /**
   * Start the animation timer.
   * @param callback Function to call on each frame
   * @param delayMs Delay between frames in milliseconds
   */
  start(callback: () => void, delayMs: number): void {
    this.stop();
    this.timerId = window.setInterval(callback, delayMs);
  }

  /**
   * Stop the animation timer.
   */
  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Restart the timer with a new delay.
   * @param callback Function to call on each frame
   * @param delayMs New delay between frames
   */
  restart(callback: () => void, delayMs: number): void {
    this.stop();
    this.start(callback, delayMs);
  }

  /**
   * Check if the timer is currently running.
   */
  isRunning(): boolean {
    return this.timerId !== null;
  }
}

// ============================================================================
// ResizeObserver Utility
// ============================================================================

/**
 * Set up a ResizeObserver on an element with automatic cleanup support.
 * @param element Element to observe
 * @param onResize Callback when element resizes
 * @returns The ResizeObserver instance (call .disconnect() for cleanup)
 */
export function setupResizeObserver(
  element: HTMLElement,
  onResize: () => void
): ResizeObserver {
  const observer = new ResizeObserver(onResize);
  observer.observe(element);
  return observer;
}

// ============================================================================
// Trail Rendering
// ============================================================================

/**
 * Render a trail of points as a connected line.
 * @param plotUtils Canvas utilities for coordinate transformation
 * @param trailX Array of x coordinates
 * @param trailY Array of y coordinates
 * @param endIndex Draw trail up to this index (exclusive)
 * @param color Stroke color for the trail
 * @param lineWidth Line width (default 2)
 */
export function renderTrail(
  plotUtils: CanvasPlotUtils,
  trailX: number[],
  trailY: number[],
  endIndex: number,
  color: string,
  lineWidth: number = 2
): void {
  const ctx = plotUtils.getContext();
  const count = Math.min(endIndex, trailX.length, trailY.length);

  if (count < 1) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  for (let i = 0; i < count; i++) {
    const pt = plotUtils.plotToCanvas({ x: trailX[i], y: trailY[i] });
    if (i === 0) {
      ctx.moveTo(pt.x, pt.y);
    } else {
      ctx.lineTo(pt.x, pt.y);
    }
  }

  ctx.stroke();
}
