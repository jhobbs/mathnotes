import { isDarkMode, getCssColors } from '@framework/demo-utils';
import { DemoInstance, DemoConfig, DemoMetadata } from '@framework/types';
import {
  createControlPanel,
  createButton,
  createInfoDisplay,
  createControlRow,
  createCheckbox,
  createNumberInput,
  InfoDisplay
} from '@framework/ui-components';
import { complex, Complex } from 'mathjs';
import { encodeCoeffs, decodeCoeffs, COEFF_COUNT, SAMPLE_COUNT_FOR_ENCODING } from './fourier-encoding';
import {
  Point2D,
  DrawingState,
  CanvasPlotUtils,
  ContourDrawingManager,
  calculateFourierCoefficients,
  VECTOR_COLORS
} from './contour-shared';
import { AnimationTimer, setupResizeObserver, renderTrail, computeEpicycleFrames, EpicycleFrame } from './dft-shared';

class ContourDrawingDemo implements DemoInstance {
  private container: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private controlPanel!: HTMLElement;

  // Shared utilities
  private plotUtils!: CanvasPlotUtils;
  private contourManager!: ContourDrawingManager;

  // State
  private state: DrawingState = 'idle';
  private isDark: boolean;

  // Animation state
  private complexPoints: Complex[] = [];
  private fourierCoefficients: Complex[] = [];
  // Precomputed animation frames
  private animationFrames: EpicycleFrame[] = [];
  private currentFrameIndex: number = 0;
  private animationTimer = new AnimationTimer();

  // Configuration
  private axisRange = { min: -5, max: 5 };
  private samplePointCount = 256;
  private frameDelay = 10;
  private readonly ANIMATION_FRAME_COUNT = 400;
  private readonly INITIAL_STATUS = 'Draw a closed path! Make it fancy!';

  // UI displays
  private statusDisplay!: InfoDisplay;
  private pointsDisplay!: InfoDisplay;
  private nInput!: HTMLInputElement;
  private nInputContainer!: HTMLElement;
  private nError!: HTMLSpanElement;
  private kCoefficients = 64;
  private kInput!: HTMLInputElement;
  private kInputContainer!: HTMLElement;
  private kError!: HTMLSpanElement;
  private delayInput!: HTMLInputElement;
  private delayInputContainer!: HTMLElement;
  private delayError!: HTMLSpanElement;
  private showOriginal: boolean = true;
  private showOriginalContainer: HTMLElement | null = null;
  private progressive: boolean = false;
  private progressiveContainer: HTMLElement | null = null;
  private progressiveN: number = 2;
  private loadedFromUrl: boolean = false;
  private copyLinkButton: HTMLButtonElement | null = null;
  private resetButton: HTMLButtonElement | null = null;

  // Resize handling
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement, config?: DemoConfig) {
    this.container = container;
    this.isDark = isDarkMode(config || {});
  }

  init(): DemoInstance {
    this.setupUI();
    this.setupCanvas();
    this.setupContourManager();
    this.setupResizeObserverInternal();

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
    const nResult = createNumberInput('N =', this.samplePointCount, 2, 256, 1, () => this.handleNChange(), this.isDark);
    this.nInput = nResult.input;
    this.nInputContainer = nResult.container;

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
    const delayResult = createNumberInput('Delay (ms) =', this.frameDelay, 0, 500, 1, () => this.handleDelayChange(), this.isDark);
    this.delayInput = delayResult.input;
    this.delayInputContainer = delayResult.container;

    // Error display for delay
    this.delayError = document.createElement('span');
    this.delayError.style.color = '#e74c3c';
    this.delayError.style.fontSize = '0.85em';
    this.delayError.style.display = 'none';

    // K input for number of coefficients (low-pass filter)
    const kResult = createNumberInput('K =', this.kCoefficients, 1, 256, 1, () => this.handleKChange(), this.isDark);
    this.kInput = kResult.input;
    this.kInputContainer = kResult.container;

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

    // Show original checkbox (hidden until contour closes)
    this.showOriginalContainer = createCheckbox(
      'Show original',
      this.showOriginal,
      (checked: boolean) => { this.showOriginal = checked; }
    );
    this.showOriginalContainer.style.display = 'none';

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
    const row2 = createControlRow([this.nInputContainer, nNote, this.nError, this.kInputContainer, kNote, this.kError]);
    const row2a = createControlRow([this.delayInputContainer, this.delayError]);
    const row2b = createControlRow([this.showOriginalContainer, this.progressiveContainer, shareButtonContainer]);
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
    const ctx = this.canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    this.plotUtils = new CanvasPlotUtils(
      this.canvas,
      ctx,
      this.axisRange,
      this.isDark
    );
  }

  private setupContourManager(): void {
    this.contourManager = new ContourDrawingManager(
      this.canvas,
      this.plotUtils,
      {
        axisRange: this.axisRange,
        closeThresholdPixels: 8,
        isDark: this.isDark
      },
      {
        onStateChange: (state) => this.handleContourStateChange(state),
        onPointsChange: (count) => {
          this.pointsDisplay.update(String(count));
          this.render();
        },
        onContourClosed: () => this.handleContourClosed()
      }
    );
    this.contourManager.attachEventListeners();
  }

  private handleContourStateChange(state: DrawingState): void {
    this.state = state;
    if (state === 'drawing') {
      this.statusDisplay.update('Drawing...');
    } else if (state === 'paused') {
      this.statusDisplay.update('Paused - click to continue');
    }
    this.render();
  }

  private handleContourClosed(): void {
    this.state = 'closed';
    this.statusDisplay.update('Contour closed');

    // Show the show original, progressive checkboxes, and copy link button
    // Uncheck show original by default when contour completes
    this.showOriginal = false;
    if (this.showOriginalContainer) {
      this.showOriginalContainer.style.display = '';
      const checkbox = this.showOriginalContainer.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (checkbox) checkbox.checked = false;
    }
    if (this.progressiveContainer) {
      this.progressiveContainer.style.display = '';
    }
    if (this.copyLinkButton) {
      this.copyLinkButton.style.display = '';
    }

    this.render();

    // Convert sample points to complex numbers
    const samplePoints = this.contourManager.getSamplePoints(this.samplePointCount);
    this.complexPoints = samplePoints.map(p => complex(p.x, p.y));

    // Calculate Fourier coefficients
    this.fourierCoefficients = calculateFourierCoefficients(this.complexPoints);

    // Precompute animation frames and start animation
    this.computeAnimationVectors();
    this.startVectorAnimation();
  }

  private render(): void {
    const cssColors = getCssColors(this.isDark);

    // Clear and fill background
    this.plotUtils.clearAndFillBackground();

    // Only show grid/axes when showOriginal is enabled or contour is not closed yet
    const showOriginalAndGrid = this.showOriginal || this.state !== 'closed';

    if (showOriginalAndGrid) {
      this.plotUtils.renderGridAndAxes();
    }

    // Contour path (draw first so trail appears on top)
    const points = this.contourManager.getPoints();
    if (points.length > 0 && showOriginalAndGrid) {
      const lineColor = this.state === 'closed' ? cssColors.warning : cssColors.error;
      this.contourManager.renderContour(
        lineColor,
        true, // showStartMarker
        this.state === 'closed', // showSamplePoints
        this.samplePointCount
      );
    }

    // Trail trace (drawn after contour so it's visible on top)
    if (this.state === 'closed' && this.animationFrames.length > 0) {
      const trailX = this.animationFrames.map(f => f.tipX);
      const trailY = this.animationFrames.map(f => f.tipY);
      renderTrail(
        this.plotUtils,
        trailX,
        trailY,
        this.currentFrameIndex + 1,
        cssColors.success,
        2
      );
    }

    // Fourier vectors (when animating)
    if (this.state === 'closed' && this.animationFrames.length > 0) {
      const frame = this.animationFrames[this.currentFrameIndex];
      let currentX = 0;
      let currentY = 0;

      for (let i = 0; i < frame.vectors.length; i++) {
        const v = frame.vectors[i];
        const nextX = currentX + v.re;
        const nextY = currentY + v.im;
        const color = VECTOR_COLORS[i % VECTOR_COLORS.length];

        // Vector line
        this.plotUtils.drawVector(
          { x: currentX, y: currentY },
          { x: nextX, y: nextY },
          color,
          2
        );

        // Tip marker
        this.plotUtils.drawPoint({ x: nextX, y: nextY }, 3, color);

        currentX = nextX;
        currentY = nextY;
      }
    }
  }

  private copyLinkToClipboard(): void {
    // Sample 256 points, compute 64 coefficients for sharing
    const samplePoints = this.getSamplePointsForEncoding();
    const complexPoints = samplePoints.map(p => complex(p.x, p.y));
    const coeffs = calculateFourierCoefficients(complexPoints);
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
    return this.contourManager.getSamplePoints(SAMPLE_COUNT_FOR_ENCODING);
  }

  private loadFromCoefficients(coeffs: Complex[]): void {
    this.loadedFromUrl = true;
    this.fourierCoefficients = coeffs;
    this.state = 'closed';

    // Hide original (there's nothing to show anyway for URL-loaded)
    this.showOriginal = false;
    if (this.showOriginalContainer) {
      this.showOriginalContainer.style.display = '';
      const checkbox = this.showOriginalContainer.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (checkbox) checkbox.checked = false;
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

  /**
   * Precompute all animation frames using the shared epicycle computation.
   */
  private computeAnimationVectors(): void {
    this.animationFrames = computeEpicycleFrames({
      coefficients: this.fourierCoefficients,
      kCoefficients: this.kCoefficients,
      frameCount: this.ANIMATION_FRAME_COUNT
    });
  }

  private startVectorAnimation(): void {
    this.currentFrameIndex = 0;
    this.render();

    this.animationTimer.start(() => {
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

  private resetDrawing(): void {
    this.animationTimer.stop();
    this.contourManager.reset();
    this.complexPoints = [];
    this.fourierCoefficients = [];
    this.animationFrames = [];
    this.currentFrameIndex = 0;
    this.state = 'idle';
    this.statusDisplay.update(this.INITIAL_STATUS);
    this.pointsDisplay.update('0');

    // Hide and reset the show original checkbox
    this.showOriginal = true;
    if (this.showOriginalContainer) {
      this.showOriginalContainer.style.display = 'none';
      const checkbox = this.showOriginalContainer.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (checkbox) checkbox.checked = true;
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
    this.samplePointCount = 256;
    this.nInput.value = '256';
    this.nError.style.display = 'none';
    this.kCoefficients = 64;
    this.kInput.value = '64';
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

      // For URL-loaded: set K to full 64 coefficients
      if (this.loadedFromUrl) {
        this.kCoefficients = COEFF_COUNT;
        this.kInput.value = String(COEFF_COUNT);
        this.recalculateFromContour();
      }
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
    if (this.animationTimer.isRunning() && this.state === 'closed') {
      this.animationTimer.stop();
      this.startVectorAnimation();
    }
  }

  private recalculateFromContour(): void {
    if (this.state !== 'closed') return;

    this.animationTimer.stop();

    // For URL-loaded drawings: coefficients are fixed, just recompute animation
    if (this.loadedFromUrl) {
      this.computeAnimationVectors();
      this.startVectorAnimation();
      return;
    }

    // Recalculate with new N
    const samplePoints = this.contourManager.getSamplePoints(this.samplePointCount);
    this.complexPoints = samplePoints.map(p => complex(p.x, p.y));
    this.fourierCoefficients = calculateFourierCoefficients(this.complexPoints);

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
    const samplePoints = this.contourManager.getSamplePoints(this.samplePointCount);
    this.complexPoints = samplePoints.map(p => complex(p.x, p.y));
    this.fourierCoefficients = calculateFourierCoefficients(this.complexPoints);
    this.computeAnimationVectors();
    // currentFrameIndex stays at 0, animation continues
  }

  private setupResizeObserverInternal(): void {
    this.resizeObserver = setupResizeObserver(
      this.canvas.parentElement!,
      () => this.resize()
    );
  }

  // Public interface for external use
  public getPoints(): Point2D[] {
    return this.contourManager.getPoints();
  }

  public isClosed(): boolean {
    return this.state === 'closed';
  }

  // DemoInstance interface
  cleanup(): void {
    this.animationTimer.stop();
    this.contourManager.detachEventListeners();
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
