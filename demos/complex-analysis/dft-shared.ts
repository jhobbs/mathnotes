// Shared utilities for DFT-related demos
// Used by contour-drawing.ts and dft-computation.ts

import { Complex, multiply, exp, pi as PI, complex, min, number } from 'mathjs';
import { CanvasPlotUtils, indexToFrequency } from './contour-shared';

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

// ============================================================================
// Epicycle Animation Computation
// ============================================================================

/**
 * Configuration for epicycle frame computation.
 */
export interface EpicycleAnimationConfig {
  /** Fourier coefficients (ordered by indexToFrequency) */
  coefficients: Complex[];
  /** Number of coefficients to use (for low-pass filter effect) */
  kCoefficients: number;
  /** Total number of animation frames */
  frameCount: number;
}

/**
 * A single frame of the epicycle animation.
 */
export interface EpicycleFrame {
  /** The rotating vectors for this frame (one per coefficient used) */
  vectors: Complex[];
  /** X coordinate of the tip (sum of all vectors) */
  tipX: number;
  /** Y coordinate of the tip (sum of all vectors) */
  tipY: number;
}

/**
 * Precompute all animation frames for epicycle visualization.
 *
 * For M frames total, we split a full rotation into M parts.
 * For frame j: t_j = (2π * j) / M
 *
 * For each coefficient c_f (at frequency f), the vector at frame j is:
 *   v_f(t_j) = c_f * e^(i * f * t_j)
 *
 * Using symmetric frequencies (e.g., -5 to +5 for N=11):
 * - Positive frequencies rotate counterclockwise
 * - Negative frequencies rotate clockwise
 * - Frequency 0 (DC component) doesn't rotate
 *
 * @param config Animation configuration
 * @returns Array of frames, each containing vectors and tip position
 */
export function computeEpicycleFrames(config: EpicycleAnimationConfig): EpicycleFrame[] {
  const { coefficients, kCoefficients, frameCount } = config;
  const N = coefficients.length;
  const frames: EpicycleFrame[] = [];

  for (let j = 0; j < frameCount; j++) {
    const t_j = multiply(2, PI, j, 1/frameCount);
    const vectors: Complex[] = [];
    let tipX = 0;
    let tipY = 0;

    // Use only kCoefficients (low-pass filter effect)
    const coeffsToUse = number(min(kCoefficients, N));
    for (let n = 0; n < coeffsToUse; n++) {
      // v_f(t_j) = c_f * e^(i*f*t_j) where f is the actual frequency
      const freq = indexToFrequency(n);
      const angle = toReal(multiply(freq, t_j) as NumericResult);
      const expTerm = exp(complex(0, angle)) as Complex;
      const v = multiply(coefficients[n], expTerm) as Complex;
      vectors.push(v);
      tipX += v.re;
      tipY += v.im;
    }

    frames.push({ vectors, tipX, tipY });
  }

  return frames;
}
