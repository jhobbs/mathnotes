// Shared utilities for contour-based demos
// Used by contour-drawing.ts and dft-computation.ts

import {
  complex, Complex, multiply, add, divide, exp,
  pi as PI, cos, sin, atan2, hypot, number,
  min, max, ceil, floor, round
} from 'mathjs';

// Type for numeric mathjs results we know won't be BigNumber/Fraction/Matrix
type NumericResult = number | bigint | Complex;

// Helper to extract real part from a mathjs result (number, bigint, or Complex)
function toReal(val: NumericResult): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'bigint') return Number(val);
  return val.re;
}

// ============================================================================
// Types
// ============================================================================

export interface Point2D {
  x: number;
  y: number;
}

export type DrawingState = 'idle' | 'drawing' | 'paused' | 'closed';

export interface AxisRange {
  min: number;
  max: number;
}

export interface ContourConfig {
  axisRange?: AxisRange;
  closeThresholdPixels?: number;
  isDark: boolean;
}

export interface ContourCallbacks {
  onStateChange?: (state: DrawingState) => void;
  onPointsChange?: (pointCount: number) => void;
  onContourClosed?: (points: Point2D[]) => void;
}

// ============================================================================
// Canvas Plot Utilities
// ============================================================================

export class CanvasPlotUtils {
  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D,
    private axisRange: AxisRange,
    private isDark: boolean
  ) {}

  setAxisRange(range: AxisRange): void {
    this.axisRange = range;
  }

  getAxisRange(): AxisRange {
    return this.axisRange;
  }

  setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  plotToCanvas(p: Point2D): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const range = this.axisRange.max - this.axisRange.min;
    const x = ((p.x - this.axisRange.min) / range) * rect.width;
    const y = rect.height - ((p.y - this.axisRange.min) / range) * rect.height;
    return { x, y };
  }

  canvasToPlot(cx: number, cy: number): Point2D {
    const rect = this.canvas.getBoundingClientRect();
    const range = this.axisRange.max - this.axisRange.min;
    const x = this.axisRange.min + (cx / rect.width) * range;
    const y = this.axisRange.max - (cy / rect.height) * range;
    return { x, y };
  }

  pixelsToPlotUnits(pixels: number): number {
    const rect = this.canvas.getBoundingClientRect();
    const range = this.axisRange.max - this.axisRange.min;
    return (pixels / rect.width) * range;
  }

  clearAndFillBackground(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
    this.ctx.fillStyle = this.isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)';
    this.ctx.fillRect(0, 0, rect.width, rect.height);
  }

  renderGridAndAxes(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Grid lines at integer values within the range
    const gridColor = this.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;
    const gridStart = number(ceil(this.axisRange.min));
    const gridEnd = number(floor(this.axisRange.max));
    for (let i = gridStart; i <= gridEnd; i++) {
      if (i === 0) continue; // Skip zero lines, drawn separately
      const { x } = this.plotToCanvas({ x: i, y: 0 });
      const { y } = this.plotToCanvas({ x: 0, y: i });
      // Vertical line
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
      // Horizontal line
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // Zero lines (axes)
    const zerolineColor = this.isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
    this.ctx.strokeStyle = zerolineColor;
    this.ctx.lineWidth = 2;
    const origin = this.plotToCanvas({ x: 0, y: 0 });
    // X-axis
    this.ctx.beginPath();
    this.ctx.moveTo(0, origin.y);
    this.ctx.lineTo(width, origin.y);
    this.ctx.stroke();
    // Y-axis
    this.ctx.beginPath();
    this.ctx.moveTo(origin.x, 0);
    this.ctx.lineTo(origin.x, height);
    this.ctx.stroke();
  }

  drawVector(from: Point2D, to: Point2D, color: string, lineWidth: number = 2): void {
    const start = this.plotToCanvas(from);
    const end = this.plotToCanvas(to);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
  }

  drawVectorWithArrowhead(from: Point2D, to: Point2D, color: string, lineWidth: number = 2): void {
    const start = this.plotToCanvas(from);
    const end = this.plotToCanvas(to);

    // Draw line
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();

    // Draw arrowhead
    const angle = number(atan2(end.y - start.y, end.x - start.x));
    const headLength = 10;
    const piOver6 = number(divide(PI, 6));
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(end.x, end.y);
    this.ctx.lineTo(
      end.x - headLength * number(cos(angle - piOver6)),
      end.y - headLength * number(sin(angle - piOver6))
    );
    this.ctx.lineTo(
      end.x - headLength * number(cos(angle + piOver6)),
      end.y - headLength * number(sin(angle + piOver6))
    );
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawPoint(p: Point2D, radius: number, fillColor: string, strokeColor?: string, strokeWidth: number = 1): void {
    const pt = this.plotToCanvas(p);
    this.ctx.fillStyle = fillColor;
    this.ctx.beginPath();
    this.ctx.arc(pt.x, pt.y, radius, 0, number(multiply(PI, 2)));
    this.ctx.fill();
    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.stroke();
    }
  }

  drawText(text: string, position: Point2D, options: {
    color?: string;
    fontSize?: number;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
    offsetX?: number;
    offsetY?: number;
  } = {}): void {
    const pt = this.plotToCanvas(position);
    const {
      color = this.isDark ? '#fff' : '#000',
      fontSize = 12,
      align = 'center',
      baseline = 'middle',
      offsetX = 0,
      offsetY = 0
    } = options;

    this.ctx.fillStyle = color;
    this.ctx.font = `${fontSize}px sans-serif`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
    this.ctx.fillText(text, pt.x + offsetX, pt.y + offsetY);
  }

  drawUnitCircle(centerX: number = 0, centerY: number = 0, color: string = 'rgba(255,255,255,0.2)'): void {
    const center = this.plotToCanvas({ x: centerX, y: centerY });
    const edge = this.plotToCanvas({ x: centerX + 1, y: centerY });
    const radius = edge.x - center.x;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius, 0, number(multiply(PI, 2)));
    this.ctx.stroke();
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  setDarkMode(isDark: boolean): void {
    this.isDark = isDark;
  }
}

// ============================================================================
// Contour Drawing Manager
// ============================================================================

export class ContourDrawingManager {
  private state: DrawingState = 'idle';
  private points: Point2D[] = [];
  private closeThresholdPixels: number;

  // Bound event handlers (for cleanup)
  private boundMouseDown: (e: MouseEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;
  private boundTouchStart: (e: TouchEvent) => void;
  private boundTouchMove: (e: TouchEvent) => void;
  private boundTouchEnd: (e: TouchEvent) => void;

  constructor(
    private canvas: HTMLCanvasElement,
    private plotUtils: CanvasPlotUtils,
    private config: ContourConfig,
    private callbacks: ContourCallbacks = {}
  ) {
    this.closeThresholdPixels = config.closeThresholdPixels ?? 8;

    // Bind event handlers
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
  }

  getState(): DrawingState {
    return this.state;
  }

  getPoints(): Point2D[] {
    return [...this.points];
  }

  isClosed(): boolean {
    return this.state === 'closed';
  }

  reset(): void {
    this.points = [];
    this.state = 'idle';
    this.callbacks.onStateChange?.(this.state);
    this.callbacks.onPointsChange?.(0);
  }

  setPointsAndClose(points: Point2D[]): void {
    this.points = [...points];
    this.state = 'closed';
    this.callbacks.onStateChange?.(this.state);
    this.callbacks.onContourClosed?.(this.points);
  }

  attachEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.boundMouseDown);
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    this.canvas.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.boundTouchEnd);
  }

  detachEventListeners(): void {
    this.canvas.removeEventListener('mousedown', this.boundMouseDown);
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    this.canvas.removeEventListener('touchstart', this.boundTouchStart);
    this.canvas.removeEventListener('touchmove', this.boundTouchMove);
    this.canvas.removeEventListener('touchend', this.boundTouchEnd);
  }

  // Arc-length parameterized sampling
  getSamplePoints(count: number): Point2D[] {
    const totalPoints = this.points.length;

    if (totalPoints <= 1) return [];

    // Calculate cumulative arc length
    const cumLength: number[] = [0];
    for (let i = 1; i < totalPoints; i++) {
      const dx = this.points[i].x - this.points[i - 1].x;
      const dy = this.points[i].y - this.points[i - 1].y;
      cumLength.push(cumLength[i - 1] + number(hypot(dx, dy)));
    }
    const totalLength = cumLength[totalPoints - 1];

    if (totalLength === 0) return [];

    const sampleCount = number(min(count, totalPoints));
    const samples: Point2D[] = [];

    // Sample at even arc length intervals
    for (let i = 0; i < sampleCount; i++) {
      const targetLength = (i / sampleCount) * totalLength;

      // Find segment containing targetLength
      let segIdx = 0;
      while (segIdx < totalPoints - 1 && cumLength[segIdx + 1] < targetLength) {
        segIdx++;
      }

      // Interpolate within segment
      if (segIdx >= totalPoints - 1) {
        samples.push({ ...this.points[totalPoints - 1] });
      } else {
        const segStart = cumLength[segIdx];
        const segEnd = cumLength[segIdx + 1];
        let t = segEnd > segStart ? (targetLength - segStart) / (segEnd - segStart) : 0;
        // Snap to exact points when very close (fixes floating-point accumulation errors)
        if (t < 1e-9) t = 0;
        if (t > 1 - 1e-9) t = 1;
        samples.push({
          x: this.points[segIdx].x + t * (this.points[segIdx + 1].x - this.points[segIdx].x),
          y: this.points[segIdx].y + t * (this.points[segIdx + 1].y - this.points[segIdx].y)
        });
      }
    }

    return samples;
  }

  renderContour(color: string, showStartMarker: boolean = true, showSamplePoints: boolean = false, sampleCount: number = 0): void {
    const ctx = this.plotUtils.getContext();

    if (this.points.length === 0) return;

    // Draw contour path
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < this.points.length; i++) {
      const pt = this.plotUtils.plotToCanvas(this.points[i]);
      if (i === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    }
    ctx.stroke();

    // Sample points
    if (showSamplePoints && sampleCount > 0 && this.state === 'closed') {
      const samplePoints = this.getSamplePoints(sampleCount);
      if (samplePoints.length > 1) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        for (const sp of samplePoints) {
          const pt = this.plotUtils.plotToCanvas(sp);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, number(multiply(PI, 2)));
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    // Start point marker
    if (showStartMarker && this.points.length > 0) {
      const startPt = this.plotUtils.plotToCanvas(this.points[0]);
      ctx.fillStyle = '#f39c12';
      ctx.strokeStyle = this.config.isDark ? '#fff' : '#000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(startPt.x, startPt.y, 7, 0, number(multiply(PI, 2)));
      ctx.fill();
      ctx.stroke();
    }
  }

  // Private event handlers
  private pixelToPlot(clientX: number, clientY: number): Point2D | null {
    const rect = this.canvas.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    if (relX < 0 || relX > rect.width || relY < 0 || relY > rect.height) {
      return null;
    }

    return this.plotUtils.canvasToPlot(relX, relY);
  }

  private handleMouseDown(e: MouseEvent): void {
    if (this.state === 'closed') return;

    const point = this.pixelToPlot(e.clientX, e.clientY);
    if (!point) return;

    if (this.state === 'idle' || this.state === 'paused') {
      this.startDrawing(point);
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.state !== 'drawing') return;

    const point = this.pixelToPlot(e.clientX, e.clientY);
    if (!point) return;

    this.continueDrawing(point);
  }

  private handleMouseUp(_e: MouseEvent): void {
    if (this.state === 'drawing') {
      this.endDrawing();
    }
  }

  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (this.state === 'closed' || e.touches.length !== 1) return;

    if (this.state === 'paused') {
      this.resumeDrawing();
      return;
    }

    const touch = e.touches[0];
    const point = this.pixelToPlot(touch.clientX, touch.clientY);
    if (!point) return;

    if (this.state === 'idle') {
      this.startDrawing(point);
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();
    if (this.state !== 'drawing' || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const point = this.pixelToPlot(touch.clientX, touch.clientY);
    if (!point) return;

    this.continueDrawing(point);
  }

  private handleTouchEnd(e: TouchEvent): void {
    e.preventDefault();
    if (this.state === 'drawing') {
      this.endDrawing();
    }
  }

  private startDrawing(point: Point2D): void {
    this.points = [point];
    this.state = 'drawing';
    this.callbacks.onStateChange?.(this.state);
    this.callbacks.onPointsChange?.(1);
  }

  private continueDrawing(point: Point2D): void {
    const lastPoint = this.points[this.points.length - 1];
    const dx = point.x - lastPoint.x;
    const dy = point.y - lastPoint.y;
    const dist = number(hypot(dx, dy));
    const pixelSize = this.plotUtils.pixelsToPlotUnits(1);
    const steps = number(max(1, round(dist / pixelSize)));

    // Fill in all pixel-sized steps from last point to new point
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      this.points.push({
        x: lastPoint.x + dx * t,
        y: lastPoint.y + dy * t
      });
    }

    this.callbacks.onPointsChange?.(this.points.length);
  }

  private endDrawing(): void {
    if (this.points.length < 3) {
      this.reset();
      return;
    }

    const lastPoint = this.points[this.points.length - 1];
    const startPoint = this.points[0];
    const dist = number(hypot(lastPoint.x - startPoint.x, lastPoint.y - startPoint.y));
    const threshold = this.plotUtils.pixelsToPlotUnits(this.closeThresholdPixels);

    if (dist <= threshold) {
      this.closeContour();
    } else {
      this.state = 'paused';
      this.callbacks.onStateChange?.(this.state);
    }
  }

  private closeContour(): void {
    const startPoint = this.points[0];
    this.points.push({ ...startPoint });
    this.state = 'closed';
    this.callbacks.onStateChange?.(this.state);
    this.callbacks.onPointsChange?.(this.points.length);
    this.callbacks.onContourClosed?.(this.points);
  }

  private resumeDrawing(): void {
    this.state = 'drawing';
    this.callbacks.onStateChange?.(this.state);
  }
}

// ============================================================================
// Fourier Math Utilities
// ============================================================================

// For N=11: index 0,1,2,3,4,5,6,7,8,9,10 -> freq 0,-1,+1,-2,+2,-3,+3,-4,+4,-5,+5
export function indexToFrequency(index: number): number {
  if (index === 0) return 0;
  const magnitude = number(ceil(index / 2));
  const sign = index % 2 === 1 ? -1 : 1;
  return sign * magnitude;
}

export function pointsToComplex(points: Point2D[]): Complex[] {
  return points.map(p => complex(p.x, p.y));
}

export function calculateFourierCoefficients(z: Complex[], coeffCount?: number): Complex[] {
  const N = z.length;
  const numCoeffs = coeffCount ?? N;
  const coefficients: Complex[] = [];

  // c_f = (1/N) * sum_{k=0}^{N-1} z_k * e^{-2*pi*i*f*k/N}
  for (let n = 0; n < numCoeffs; n++) {
    const freq = indexToFrequency(n);
    let sum: Complex = complex(0, 0);
    for (let k = 0; k < N; k++) {
      const angle = toReal(multiply(-2, PI, freq, k, 1/N) as NumericResult);
      const expTerm = exp(complex(0, angle)) as Complex;
      sum = add(sum, multiply(z[k], expTerm)) as Complex;
    }
    coefficients.push(divide(sum, N) as Complex);
  }

  return coefficients;
}

// Color scheme for vectors
export const VECTOR_COLORS = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8',
  '#f58231', '#911eb4', '#42d4f4', '#f032e6',
  '#bfef45', '#fabed4', '#469990', '#dcbeff',
  '#9a6324', '#fffac8', '#800000', '#aaffc3'
];

// DFT computation colors
export const DFT_COLORS = {
  samplePoints: '#FFD700',      // Gold for sample points
  currentSample: '#FF6B6B',     // Bright red for currently highlighted sample
  rotationFactor: '#4ECDC4',    // Cyan for e^{-i*theta}
  product: '#FFA500',           // Orange for the product
  accumulatedSum: '#95E77E',    // Green for running sum
  finalCoeff: '#B19CD9',        // Purple for final coefficient
  contourMuted: '#888888',      // Gray for the contour during animation
  unitCircle: 'rgba(255,255,255,0.2)', // Subtle unit circle reference
};
