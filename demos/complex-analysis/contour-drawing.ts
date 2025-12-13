import { isDarkMode, getCssColors } from '@framework/demo-utils';
import { DemoInstance, DemoConfig, DemoMetadata } from '@framework/types';
import {
  createControlPanel,
  createButton,
  createInfoDisplay,
  createControlRow,
  createCheckbox,
  InfoDisplay
} from '@framework/ui-components';
import { complex, Complex, multiply, add, divide } from 'mathjs';
import { encodeCoeffs, decodeCoeffs, COEFF_COUNT, SAMPLE_COUNT_FOR_ENCODING } from './fourier-encoding';

interface Point2D {
  x: number;
  y: number;
}

type DrawingState = 'idle' | 'drawing' | 'paused' | 'closed';

class ContourDrawingDemo implements DemoInstance {
  private container: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private controlPanel!: HTMLElement;

  // State
  private state: DrawingState = 'idle';
  private points: Point2D[] = [];
  private isDark: boolean;

  // Animation state
  private complexPoints: Complex[] = [];
  private fourierCoefficients: Complex[] = [];
  // Precomputed vectors: animationVectors[frameIndex][coefficientIndex]
  private animationVectors: Complex[][] = [];
  private currentFrameIndex: number = 0;
  private animationTimer: number | null = null;
  // Precomputed trail: trailX[j], trailY[j] = tip position at frame j
  private trailX: number[] = [];
  private trailY: number[] = [];

  // Configuration
  private axisRange = { min: -5, max: 5 };
  private samplePointCount = 32;
  private frameDelay = 10;
  private closeThresholdPixels = 8; // Auto-close if within this many pixels of start (marker radius 7 + border 1)
  private readonly VECTOR_COLORS = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8',
    '#f58231', '#911eb4', '#42d4f4', '#f032e6',
    '#bfef45', '#fabed4', '#469990', '#dcbeff',
    '#9a6324', '#fffac8', '#800000', '#aaffc3'
  ];
  private readonly ANIMATION_FRAME_COUNT = 400;
  private readonly INITIAL_STATUS = 'Draw a closed path! Make it fancy!';

  // UI displays
  private statusDisplay!: InfoDisplay;
  private pointsDisplay!: InfoDisplay;
  private nInput!: HTMLInputElement;
  private nError!: HTMLSpanElement;
  private kCoefficients = 32;
  private kInput!: HTMLInputElement;
  private kError!: HTMLSpanElement;
  private delayInput!: HTMLInputElement;
  private delayError!: HTMLSpanElement;
  private hideOriginal: boolean = false;
  private hideOriginalContainer: HTMLElement | null = null;
  private progressive: boolean = false;
  private progressiveContainer: HTMLElement | null = null;
  private progressiveN: number = 2;
  private loadedFromUrl: boolean = false;
  private copyLinkButton: HTMLButtonElement | null = null;
  private resetButton: HTMLButtonElement | null = null;

  // Resize handling
  private resizeObserver: ResizeObserver | null = null;

  // Bound event handlers (for cleanup)
  private boundMouseDown: (e: MouseEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;
  private boundTouchStart: (e: TouchEvent) => void;
  private boundTouchMove: (e: TouchEvent) => void;
  private boundTouchEnd: (e: TouchEvent) => void;

  constructor(container: HTMLElement, config?: DemoConfig) {
    this.container = container;
    this.isDark = isDarkMode(config || {});

    // Bind event handlers
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
  }

  init(): DemoInstance {
    this.setupUI();
    this.setupCanvas();
    this.attachEventListeners();
    this.setupResizeObserver();

    // Check for coefficients in URL parameter
    const params = new URLSearchParams(window.location.search);
    const coeffParam = params.get('c');
    if (coeffParam) {
      const decoded = decodeCoeffs(coeffParam);
      const coeffs = decoded.map(c => complex(c.re, c.im));
      this.loadFromCoefficients(coeffs);
    } else {
      this.render();
    }

    return this;
  }

  private setupUI(): void {
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.gap = 'var(--spacing-md, 1rem)';

    // Control panel
    this.controlPanel = createControlPanel(this.container);

    // Reset button
    this.resetButton = createButton('Reset', document.createElement('div'), () => this.resetDrawing());

    // Status display (not using createInfoDisplay to avoid the colon)
    const statusElement = document.createElement('div');
    statusElement.className = 'info-display';
    statusElement.style.minHeight = '1.5em';
    const statusSpan = document.createElement('span');
    statusSpan.textContent = this.INITIAL_STATUS;
    statusElement.appendChild(statusSpan);
    this.statusDisplay = {
      element: statusElement,
      update: (value: string) => { statusSpan.textContent = value; }
    };
    this.pointsDisplay = createInfoDisplay('Points', '0');

    // N input for number of sample points (highest frequency is N/2)
    this.nInput = this.createNumberInput('N =', this.samplePointCount, 2, 256, 1, () => this.handleNChange());

    // Note about N
    const nNote = document.createElement('span');
    nNote.textContent = '(sample points; max freq = N/2)';
    nNote.style.fontSize = '0.85em';
    nNote.style.opacity = '0.7';

    // Error display for N
    this.nError = document.createElement('span');
    this.nError.style.color = '#e74c3c';
    this.nError.style.fontSize = '0.85em';
    this.nError.style.display = 'none';

    // Delay input
    this.delayInput = this.createNumberInput('Delay (ms) =', this.frameDelay, 0, 500, 1, () => this.handleDelayChange());

    // Error display for delay
    this.delayError = document.createElement('span');
    this.delayError.style.color = '#e74c3c';
    this.delayError.style.fontSize = '0.85em';
    this.delayError.style.display = 'none';

    // K input for number of coefficients (low-pass filter)
    this.kInput = this.createNumberInput('K =', this.kCoefficients, 1, 256, 1, () => this.handleKChange());

    // Error display for K
    this.kError = document.createElement('span');
    this.kError.style.color = '#e74c3c';
    this.kError.style.fontSize = '0.85em';
    this.kError.style.display = 'none';

    // Note about K
    const kNote = document.createElement('span');
    kNote.textContent = '(coefficients to use)';
    kNote.style.fontSize = '0.85em';
    kNote.style.opacity = '0.7';

    // Instructions
    const instructions1 = document.createElement('div');
    instructions1.textContent = 'Click and drag to draw a closed loop. On touch: drag finger in a closed loop.';
    instructions1.style.fontSize = '0.85em';
    instructions1.style.opacity = '0.7';

    const instructions2 = document.createElement('div');
    instructions2.textContent = 'Change N after drawing to see how different sample counts affect the approximation.';
    instructions2.style.fontSize = '0.85em';
    instructions2.style.opacity = '0.7';

    // Hide original checkbox (hidden until contour closes)
    this.hideOriginalContainer = createCheckbox(
      'Hide original',
      this.hideOriginal,
      (checked: boolean) => { this.hideOriginal = checked; }
    );
    this.hideOriginalContainer.style.display = 'none';

    // Progressive checkbox (hidden until contour closes)
    this.progressiveContainer = createCheckbox(
      'Progressive',
      this.progressive,
      (checked: boolean) => { this.handleProgressiveChange(checked); }
    );
    this.progressiveContainer.style.display = 'none';

    // Share button (hidden until contour closes)
    const shareButtonContainer = document.createElement('div');
    this.copyLinkButton = createButton('Share!', shareButtonContainer, () => this.copyLinkToClipboard());
    this.copyLinkButton.style.display = 'none';

    // Arrange controls
    const row0 = createControlRow([this.statusDisplay.element]);
    const row1 = createControlRow([this.resetButton, this.pointsDisplay.element]);
    const row2 = createControlRow([this.nInput.parentElement!, nNote, this.nError, this.kInput.parentElement!, kNote, this.kError]);
    const row2a = createControlRow([this.delayInput.parentElement!, this.delayError]);
    const row2b = createControlRow([this.hideOriginalContainer, this.progressiveContainer, shareButtonContainer]);
    const row3 = createControlRow([instructions1]);
    const row4 = createControlRow([instructions2]);

    this.controlPanel.appendChild(row0);
    this.controlPanel.appendChild(row1);
    this.controlPanel.appendChild(row2);
    this.controlPanel.appendChild(row2a);
    this.controlPanel.appendChild(row2b);
    this.controlPanel.appendChild(row3);
    this.controlPanel.appendChild(row4);

    // Canvas container - square aspect ratio, 500x500 target
    const canvasWrapper = document.createElement('div');
    canvasWrapper.style.width = '500px';
    canvasWrapper.style.maxWidth = '100%';
    canvasWrapper.style.aspectRatio = '1';
    canvasWrapper.style.position = 'relative';
    canvasWrapper.style.margin = '0 auto';

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.aspectRatio = '1'; // Maintain square even when height:auto is forced by mobile CSS
    this.canvas.style.display = 'block';
    this.canvas.style.touchAction = 'none'; // Prevent browser gestures
    this.canvas.style.cursor = 'crosshair';
    canvasWrapper.appendChild(this.canvas);

    // Description below the canvas
    const description = document.createElement('div');
    description.style.fontSize = '0.9em';
    description.style.opacity = '0.8';
    description.style.textAlign = 'center';
    description.style.marginTop = 'var(--spacing-sm, 0.5rem)';
    const line1 = document.createElement('div');
    line1.textContent = 'Discrete Fourier Transform for Contour Approximation.';
    line1.style.fontWeight = 'bold';
    const line2 = document.createElement('div');
    line2.textContent = 'Each vector rotates at a different frequency; their sum traces an approximation of the contour.';
    description.appendChild(line1);
    description.appendChild(line2);

    // Wrap canvas and description together
    const plotWrapper = document.createElement('div');
    plotWrapper.appendChild(canvasWrapper);
    plotWrapper.appendChild(description);
    this.container.appendChild(plotWrapper);
  }

  private setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.scale(dpr, dpr);
  }

  private plotToCanvas(p: Point2D): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const range = this.axisRange.max - this.axisRange.min;
    const x = ((p.x - this.axisRange.min) / range) * rect.width;
    const y = rect.height - ((p.y - this.axisRange.min) / range) * rect.height;
    return { x, y };
  }

  private canvasToPlot(cx: number, cy: number): Point2D {
    const rect = this.canvas.getBoundingClientRect();
    const range = this.axisRange.max - this.axisRange.min;
    const x = this.axisRange.min + (cx / rect.width) * range;
    const y = this.axisRange.max - (cy / rect.height) * range;
    return { x, y };
  }

  private render(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const ctx = this.ctx;
    const cssColors = getCssColors(this.isDark);

    // Clear and fill background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = this.isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    const gridColor = this.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = this.axisRange.min; i <= this.axisRange.max; i++) {
      if (i === 0) continue; // Skip zero lines, drawn separately
      const { x } = this.plotToCanvas({ x: i, y: 0 });
      const { y } = this.plotToCanvas({ x: 0, y: i });
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Zero lines (axes)
    const zerolineColor = this.isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
    ctx.strokeStyle = zerolineColor;
    ctx.lineWidth = 2;
    const origin = this.plotToCanvas({ x: 0, y: 0 });
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(width, origin.y);
    ctx.stroke();
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, height);
    ctx.stroke();

    // Contour path (draw first so trail appears on top)
    // Skip drawing original when hideOriginal is enabled and contour is closed
    const showOriginal = !this.hideOriginal || this.state !== 'closed';
    if (this.points.length > 0 && showOriginal) {
      const lineColor = this.state === 'closed' ? cssColors.warning : cssColors.error;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < this.points.length; i++) {
        const pt = this.plotToCanvas(this.points[i]);
        if (i === 0) {
          ctx.moveTo(pt.x, pt.y);
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      }
      ctx.stroke();

      // Sample points (when closed)
      if (this.state === 'closed') {
        const samplePoints = this.getSamplePoints();
        if (samplePoints.length > 1) {
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          for (const sp of samplePoints) {
            const pt = this.plotToCanvas(sp);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        }
      }

      // Start point marker
      const startPt = this.plotToCanvas(this.points[0]);
      ctx.fillStyle = '#f39c12';
      ctx.strokeStyle = this.isDark ? '#fff' : '#000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(startPt.x, startPt.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Trail trace (drawn after contour so it's visible on top)
    if (this.state === 'closed' && this.trailX.length > 0) {
      ctx.strokeStyle = cssColors.success;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const trailEnd = this.currentFrameIndex + 1;
      for (let i = 0; i < trailEnd && i < this.trailX.length; i++) {
        const pt = this.plotToCanvas({ x: this.trailX[i], y: this.trailY[i] });
        if (i === 0) {
          ctx.moveTo(pt.x, pt.y);
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      }
      ctx.stroke();
    }

    // Fourier vectors (when animating)
    if (this.state === 'closed' && this.animationVectors.length > 0) {
      const frameVectors = this.animationVectors[this.currentFrameIndex];
      let currentX = 0;
      let currentY = 0;

      for (let i = 0; i < frameVectors.length; i++) {
        const v = frameVectors[i];
        const nextX = currentX + v.re;
        const nextY = currentY + v.im;
        const color = this.VECTOR_COLORS[i % this.VECTOR_COLORS.length];

        const start = this.plotToCanvas({ x: currentX, y: currentY });
        const end = this.plotToCanvas({ x: nextX, y: nextY });

        // Vector line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Tip marker
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(end.x, end.y, 3, 0, Math.PI * 2);
        ctx.fill();

        currentX = nextX;
        currentY = nextY;
      }
    }
  }

  private attachEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.boundMouseDown);
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    this.canvas.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.boundTouchEnd);
  }

  private detachEventListeners(): void {
    this.canvas.removeEventListener('mousedown', this.boundMouseDown);
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    this.canvas.removeEventListener('touchstart', this.boundTouchStart);
    this.canvas.removeEventListener('touchmove', this.boundTouchMove);
    this.canvas.removeEventListener('touchend', this.boundTouchEnd);
  }

  private pixelToPlot(clientX: number, clientY: number): Point2D | null {
    const rect = this.canvas.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    // Check bounds
    if (relX < 0 || relX > rect.width || relY < 0 || relY > rect.height) {
      return null;
    }

    return this.canvasToPlot(relX, relY);
  }

  private pixelsToPlotUnits(pixels: number): number {
    const rect = this.canvas.getBoundingClientRect();
    const range = this.axisRange.max - this.axisRange.min;
    return (pixels / rect.width) * range;
  }

  private getSamplePoints(): Point2D[] {
    const N = this.samplePointCount;
    const totalPoints = this.points.length;

    if (totalPoints <= 1) return [];

    // Calculate cumulative arc length
    const cumLength: number[] = [0];
    for (let i = 1; i < totalPoints; i++) {
      const dx = this.points[i].x - this.points[i - 1].x;
      const dy = this.points[i].y - this.points[i - 1].y;
      cumLength.push(cumLength[i - 1] + Math.hypot(dx, dy));
    }
    const totalLength = cumLength[totalPoints - 1];

    if (totalLength === 0) return [];

    const sampleCount = Math.min(N, totalPoints);
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
        const t = segEnd > segStart ? (targetLength - segStart) / (segEnd - segStart) : 0;
        samples.push({
          x: this.points[segIdx].x + t * (this.points[segIdx + 1].x - this.points[segIdx].x),
          y: this.points[segIdx].y + t * (this.points[segIdx + 1].y - this.points[segIdx].y)
        });
      }
    }

    return samples;
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

    // Resume from paused doesn't require touching in plot area
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
    this.statusDisplay.update('Drawing...');
    this.pointsDisplay.update('1');
    this.render();
  }

  private continueDrawing(point: Point2D): void {
    const lastPoint = this.points[this.points.length - 1];
    const dx = point.x - lastPoint.x;
    const dy = point.y - lastPoint.y;
    const dist = Math.hypot(dx, dy);
    const pixelSize = this.pixelsToPlotUnits(1);
    const steps = Math.max(1, Math.round(dist / pixelSize));

    // Fill in all pixel-sized steps from last point to new point
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      this.points.push({
        x: lastPoint.x + dx * t,
        y: lastPoint.y + dy * t
      });
    }

    this.pointsDisplay.update(String(this.points.length));
    this.render();
  }

  private endDrawing(): void {
    if (this.points.length < 3) {
      // Not enough points, reset
      this.resetDrawing();
      return;
    }

    // Check if close enough to start point to auto-close
    const lastPoint = this.points[this.points.length - 1];
    const startPoint = this.points[0];
    const dist = Math.hypot(lastPoint.x - startPoint.x, lastPoint.y - startPoint.y);
    const threshold = this.pixelsToPlotUnits(this.closeThresholdPixels);

    if (dist <= threshold) {
      this.closeContour();
    } else {
      // Pause - can be resumed
      this.state = 'paused';
      this.statusDisplay.update('Paused - click to continue');
      this.render();
    }
  }

  private closeContour(): void {
    const startPoint = this.points[0];

    // Just add the start point to close the loop
    this.points.push({ ...startPoint });

    this.state = 'closed';
    this.statusDisplay.update('Contour closed');
    this.pointsDisplay.update(String(this.points.length));

    // Show the hide original, progressive checkboxes, and copy link button
    if (this.hideOriginalContainer) {
      this.hideOriginalContainer.style.display = '';
    }
    if (this.progressiveContainer) {
      this.progressiveContainer.style.display = '';
    }
    if (this.copyLinkButton) {
      this.copyLinkButton.style.display = '';
    }

    this.render();

    // Convert sample points to complex numbers and log
    const samplePoints = this.getSamplePoints();
    this.complexPoints = samplePoints.map(p => complex(p.x, p.y));
    console.log('Contour sample points as complex numbers:', this.complexPoints);

    // Calculate Fourier coefficients
    this.fourierCoefficients = this.calculateFourierCoefficients(this.complexPoints);
    console.log('Fourier coefficients:', this.fourierCoefficients);

    // Precompute animation frames and start animation
    this.computeAnimationVectors();
    this.startVectorAnimation();
  }

  private resumeDrawing(): void {
    this.state = 'drawing';
    this.statusDisplay.update('Drawing... move mouse');
  }

  private copyLinkToClipboard(): void {
    // Sample 256 points, compute 64 coefficients for sharing
    const samplePoints = this.getSamplePointsForEncoding();
    const complexPoints = samplePoints.map(p => complex(p.x, p.y));
    const coeffs = this.calculateFourierCoefficients(complexPoints);
    // Take first 64 coefficients for encoding
    const encoded = encodeCoeffs(coeffs.slice(0, COEFF_COUNT));

    const url = new URL(window.location.href);
    url.searchParams.set('c', encoded);

    navigator.clipboard.writeText(url.toString()).then(() => {
      this.copyLinkButton!.textContent = 'Copied!';
      setTimeout(() => {
        if (this.copyLinkButton) {
          this.copyLinkButton.textContent = 'Share!';
        }
      }, 1500);
    });
  }

  private getSamplePointsForEncoding(): Point2D[] {
    // Get 256 sample points for URL encoding, independent of current N
    const savedN = this.samplePointCount;
    this.samplePointCount = SAMPLE_COUNT_FOR_ENCODING;
    const samples = this.getSamplePoints();
    this.samplePointCount = savedN;
    return samples;
  }

  private loadFromCoefficients(coeffs: Complex[]): void {
    this.loadedFromUrl = true;
    this.fourierCoefficients = coeffs;
    this.state = 'closed';
    this.points = []; // No original path

    // Set up hide original mode (there's nothing to show anyway)
    this.hideOriginal = true;
    if (this.hideOriginalContainer) {
      this.hideOriginalContainer.style.display = '';
      const checkbox = this.hideOriginalContainer.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (checkbox) checkbox.checked = true;
    }

    // Set up progressive mode starting at K=2
    // N is fixed at 64 (the number of encoded coefficients)
    // Progressive mode controls K (how many coefficients to use)
    this.progressive = true;
    this.progressiveN = 2;
    this.samplePointCount = COEFF_COUNT; // We have 64 coefficients
    this.nInput.value = String(COEFF_COUNT);
    this.nInput.disabled = true;
    if (this.progressiveContainer) {
      this.progressiveContainer.style.display = '';
      const checkbox = this.progressiveContainer.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (checkbox) checkbox.checked = true;
    }

    // Show share button
    if (this.copyLinkButton) {
      this.copyLinkButton.style.display = '';
    }

    // Change reset button to invite users to draw their own
    if (this.resetButton) {
      this.resetButton.textContent = 'Make Your Own!';
    }

    // Start with K=2 coefficients (progressive mode will increase it)
    this.kCoefficients = 2;
    this.kInput.value = '2';

    this.statusDisplay.update('Loaded from link');
    this.pointsDisplay.update('–');

    this.computeAnimationVectors();
    this.startVectorAnimation();
  }

  // For N=11: index 0,1,2,3,4,5,6,7,8,9,10 → freq 0,-1,+1,-2,+2,-3,+3,-4,+4,-5,+5
  private indexToFrequency(index: number): number {
    if (index === 0) return 0;
    const magnitude = Math.ceil(index / 2);
    const sign = index % 2 === 1 ? -1 : 1;
    return sign * magnitude;
  }

  private calculateFourierCoefficients(z: Complex[]): Complex[] {
    const N = z.length;
    const coefficients: Complex[] = [];

    // c_f = (1/N) * sum_{k=0}^{N-1} z_k * e^{-2πifk/N}
    // where f = indexToFrequency(n, N) gives symmetric frequencies
    for (let n = 0; n < N; n++) {
      const freq = this.indexToFrequency(n);
      let sum: Complex = complex(0, 0);
      for (let k = 0; k < N; k++) {
        const angle = -2 * Math.PI * freq * k / N;
        const expTerm = complex(Math.cos(angle), Math.sin(angle));
        sum = add(sum, multiply(z[k], expTerm)) as Complex;
      }
      coefficients.push(divide(sum, N) as Complex);
    }

    return coefficients;
  }

  /**
   * Precompute all animation frames and trail positions.
   *
   * We have M frames total, splitting a full rotation into M parts.
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
   * We also precompute the trail (tip positions) so we can slice it
   * for progressive drawing without runtime array operations.
   */
  private computeAnimationVectors(): void {
    const M = this.ANIMATION_FRAME_COUNT;
    const N = this.fourierCoefficients.length;
    this.animationVectors = [];
    this.trailX = [];
    this.trailY = [];

    for (let j = 0; j < M; j++) {
      const t_j = (2 * Math.PI * j) / M;
      const frameVectors: Complex[] = [];
      let tipX = 0;
      let tipY = 0;

      // Use only kCoefficients (low-pass filter effect)
      const coeffsToUse = Math.min(this.kCoefficients, N);
      for (let n = 0; n < coeffsToUse; n++) {
        // v_f(t_j) = c_f * e^(i*f*t_j) where f is the actual frequency
        const freq = this.indexToFrequency(n);
        const angle = freq * t_j;
        const expTerm = complex(Math.cos(angle), Math.sin(angle));
        const v = multiply(this.fourierCoefficients[n], expTerm) as Complex;
        frameVectors.push(v);
        tipX += v.re;
        tipY += v.im;
      }

      this.animationVectors.push(frameVectors);
      this.trailX.push(tipX);
      this.trailY.push(tipY);
    }
  }

  private startVectorAnimation(): void {
    this.currentFrameIndex = 0;
    this.render();

    this.animationTimer = window.setInterval(() => {
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.ANIMATION_FRAME_COUNT;

      // Check if we completed a full loop in progressive mode
      if (this.progressive && this.currentFrameIndex === 0) {
        // Double progressiveN, or reset to 2 if we've reached the limit
        const maxN = this.loadedFromUrl ? COEFF_COUNT : 128;
        this.progressiveN = this.progressiveN >= maxN ? 2 : this.progressiveN * 2;

        if (this.loadedFromUrl) {
          // URL-loaded: progressiveN controls K (coefficients), N is fixed at 64
          this.kCoefficients = this.progressiveN;
          this.kInput.value = String(this.progressiveN);
        } else {
          // User-drawn: progressiveN controls N (samples), K follows N
          this.samplePointCount = this.progressiveN;
          this.nInput.value = String(this.progressiveN);
        }
        this.recalculateProgressiveFrame();
      }

      this.render();
    }, this.frameDelay);
  }

  private stopVectorAnimation(): void {
    if (this.animationTimer !== null) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
  }

  private resetDrawing(): void {
    this.stopVectorAnimation();
    this.complexPoints = [];
    this.fourierCoefficients = [];
    this.animationVectors = [];
    this.currentFrameIndex = 0;
    this.trailX = [];
    this.trailY = [];
    this.points = [];
    this.state = 'idle';
    this.statusDisplay.update(this.INITIAL_STATUS);
    this.pointsDisplay.update('0');

    // Hide and reset the hide original checkbox
    this.hideOriginal = false;
    if (this.hideOriginalContainer) {
      this.hideOriginalContainer.style.display = 'none';
      const checkbox = this.hideOriginalContainer.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (checkbox) checkbox.checked = false;
    }

    // Hide and reset the progressive checkbox
    this.progressive = false;
    this.progressiveN = 2;
    this.nInput.disabled = false;
    if (this.progressiveContainer) {
      this.progressiveContainer.style.display = 'none';
      const checkbox = this.progressiveContainer.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (checkbox) checkbox.checked = false;
    }

    // Hide share button and reset URL state
    this.loadedFromUrl = false;
    if (this.copyLinkButton) {
      this.copyLinkButton.style.display = 'none';
      this.copyLinkButton.textContent = 'Share!';
    }

    // Reset button text
    if (this.resetButton) {
      this.resetButton.textContent = 'Reset';
    }

    // Reset N and K to defaults
    this.samplePointCount = 32;
    this.nInput.value = '32';
    this.nError.style.display = 'none';
    this.kCoefficients = 32;
    this.kInput.value = '32';
    this.kError.style.display = 'none';

    this.render();
  }

  private handleNChange(): void {
    const value = parseInt(this.nInput.value, 10);
    if (isNaN(value)) {
      this.nError.textContent = 'Must be a number';
      this.nError.style.display = 'inline';
      return;
    }
    if (value < 2) {
      this.nError.textContent = 'Min is 2';
      this.nError.style.display = 'inline';
      return;
    }
    if (value > 256) {
      this.nError.textContent = 'Max is 256';
      this.nError.style.display = 'inline';
      return;
    }
    this.nError.style.display = 'none';
    this.samplePointCount = value;
    // Update K to match N (default behavior)
    this.kCoefficients = value;
    this.kInput.value = String(value);
    this.kError.style.display = 'none';
    this.recalculateFromContour();
  }

  private handleKChange(): void {
    const value = parseInt(this.kInput.value, 10);
    if (isNaN(value)) {
      this.kError.textContent = 'Must be a number';
      this.kError.style.display = 'inline';
      return;
    }
    if (value < 1) {
      this.kError.textContent = 'Min is 1';
      this.kError.style.display = 'inline';
      return;
    }
    if (value > this.samplePointCount) {
      this.kError.textContent = `Max is ${this.samplePointCount}`;
      this.kError.style.display = 'inline';
      return;
    }
    this.kError.style.display = 'none';
    this.kCoefficients = value;
    this.recalculateFromContour();
  }

  private handleProgressiveChange(checked: boolean): void {
    this.progressive = checked;
    if (checked) {
      // Start progressive mode: set N=2 and begin
      this.progressiveN = 2;
      this.samplePointCount = 2;
      this.nInput.value = '2';
      this.nInput.disabled = true;
      this.recalculateFromContour();
    } else {
      // Exit progressive mode: re-enable N input
      this.nInput.disabled = false;
    }
  }

  private handleDelayChange(): void {
    const value = parseInt(this.delayInput.value, 10);
    if (isNaN(value)) {
      this.delayError.textContent = 'Must be a number';
      this.delayError.style.display = 'inline';
      return;
    }
    if (value < 0) {
      this.delayError.textContent = 'Min is 0';
      this.delayError.style.display = 'inline';
      return;
    }
    if (value > 500) {
      this.delayError.textContent = 'Max is 500';
      this.delayError.style.display = 'inline';
      return;
    }
    this.delayError.style.display = 'none';
    this.frameDelay = value;
    // Restart animation with new delay if running
    if (this.animationTimer !== null && this.state === 'closed') {
      this.stopVectorAnimation();
      this.startVectorAnimation();
    }
  }

  private recalculateFromContour(): void {
    if (this.state !== 'closed') return;

    this.stopVectorAnimation();

    // Recalculate with new N
    const samplePoints = this.getSamplePoints();
    this.complexPoints = samplePoints.map(p => complex(p.x, p.y));
    this.fourierCoefficients = this.calculateFourierCoefficients(this.complexPoints);

    this.computeAnimationVectors();
    this.startVectorAnimation();
  }

  private recalculateProgressiveFrame(): void {
    // For URL-loaded drawings: we already have all 64 coefficients stored,
    // kCoefficients was already updated by the animation loop
    if (this.loadedFromUrl) {
      this.computeAnimationVectors();
      return;
    }

    // Recalculate Fourier with new N but don't restart animation timer
    const samplePoints = this.getSamplePoints();
    this.complexPoints = samplePoints.map(p => complex(p.x, p.y));
    this.fourierCoefficients = this.calculateFourierCoefficients(this.complexPoints);
    this.computeAnimationVectors();
    // currentFrameIndex stays at 0, animation continues
  }

  private createNumberInput(label: string, defaultValue: number, min: number, max: number,
                           step: number, onChange: () => void): HTMLInputElement {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '0.5rem';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.style.fontWeight = 'bold';

    const input = document.createElement('input');
    input.type = 'number';
    input.value = defaultValue.toString();
    input.min = min.toString();
    input.max = max.toString();
    input.step = step.toString();
    input.style.padding = '0.25rem 0.5rem';
    input.style.borderRadius = '0.25rem';
    input.style.border = '1px solid var(--color-border, #ccc)';
    input.style.background = this.isDark ? 'rgba(255,255,255,0.1)' : 'white';
    input.style.color = 'var(--color-text, inherit)';
    input.style.width = '60px';
    input.style.fontFamily = 'var(--font-mono, monospace)';
    input.addEventListener('input', onChange);

    container.appendChild(labelEl);
    container.appendChild(input);

    return input;
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.canvas.parentElement!);
  }

  // Public interface for external use
  public getPoints(): Point2D[] {
    return [...this.points];
  }

  public isClosed(): boolean {
    return this.state === 'closed';
  }

  // DemoInstance interface
  cleanup(): void {
    this.stopVectorAnimation();
    this.detachEventListeners();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  resize(): void {
    if (this.canvas) {
      this.setupCanvas();
      this.render();
    }
  }
}

export const metadata: DemoMetadata = {
  title: 'Contour Drawing',
  category: 'Complex Analysis',
  description: 'Draw closed contours on the complex plane for use in contour integration.'
};

export default function initContourDrawingDemo(
  container: HTMLElement,
  config?: DemoConfig
): DemoInstance {
  const demo = new ContourDrawingDemo(container, config);
  return demo.init();
}
