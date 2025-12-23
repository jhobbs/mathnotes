// Open Path DFT Demo
// Draw open paths and visualize DFT reconstruction with epicycles

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
import {
  DrawingState,
  CanvasPlotUtils,
  ContourDrawingManager,
  calculateFourierCoefficients,
  VECTOR_COLORS
} from './contour-shared';
import { AnimationTimer, setupResizeObserver, renderTrail, computeEpicycleFrames, EpicycleFrame } from './dft-shared';

class OpenPathDFTDemo implements DemoInstance {
  private container: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private controlPanel!: HTMLElement;

  // Shared utilities
  private plotUtils!: CanvasPlotUtils;
  private pathManager!: ContourDrawingManager;

  // State
  private isDark: boolean;
  private isSampled: boolean = false;

  // Animation state
  private complexPoints: Complex[] = [];
  private fourierCoefficients: Complex[] = [];
  private animationFrames: EpicycleFrame[] = [];
  private currentFrameIndex: number = 0;
  private animationTimer = new AnimationTimer();

  // Configuration
  private axisRange = { min: -5, max: 5 };
  private samplePointCount = 256;
  private kCoefficients = 128;
  private frameDelay = 10;
  private readonly ANIMATION_FRAME_COUNT = 400;
  private clearEveryCycle = true;

  // UI elements
  private statusDisplay!: InfoDisplay;
  private pointsDisplay!: InfoDisplay;
  private nInput!: HTMLInputElement;
  private nInputContainer!: HTMLElement;
  private nError!: HTMLSpanElement;
  private kInput!: HTMLInputElement;
  private kInputContainer!: HTMLElement;
  private kError!: HTMLSpanElement;
  private sliderRow!: HTMLElement;
  private clearCycleContainer!: HTMLElement;

  // Resize handling
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement, config?: DemoConfig) {
    this.container = container;
    this.isDark = isDarkMode(config || {});
  }

  init(): DemoInstance {
    this.setupUI();
    this.setupCanvas();
    this.setupPathManager();
    this.setupResizeObserverInternal();
    this.render();
    return this;
  }

  private setupUI(): void {
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.gap = 'var(--spacing-md, 1rem)';

    // Control panel
    this.controlPanel = createControlPanel(this.container);

    // Status display
    const statusElement = document.createElement('div');
    statusElement.className = 'info-display';
    statusElement.style.minHeight = '1.5em';
    const statusSpan = document.createElement('span');
    statusSpan.textContent = 'Draw a path';
    statusElement.appendChild(statusSpan);
    this.statusDisplay = {
      element: statusElement,
      update: (value: string) => { statusSpan.textContent = value; }
    };

    // Points display
    this.pointsDisplay = createInfoDisplay('Points', '0');

    // Clear button
    const buttonContainer = document.createElement('div');
    createButton('Clear', buttonContainer, () => this.handleClear());

    // N input (sample count)
    const nResult = createNumberInput('N =', this.samplePointCount, 8, 1024, 8, () => this.handleNChange(), this.isDark);
    this.nInput = nResult.input;
    this.nInputContainer = nResult.container;

    this.nError = document.createElement('span');
    this.nError.style.color = '#e74c3c';
    this.nError.style.fontSize = '0.85em';
    this.nError.style.display = 'none';

    // K input (coefficients to use)
    const kResult = createNumberInput('K =', this.kCoefficients, 1, 1024, 1, () => this.handleKChange(), this.isDark);
    this.kInput = kResult.input;
    this.kInputContainer = kResult.container;

    this.kError = document.createElement('span');
    this.kError.style.color = '#e74c3c';
    this.kError.style.fontSize = '0.85em';
    this.kError.style.display = 'none';

    // Clear every cycle checkbox
    this.clearCycleContainer = createCheckbox(
      'Clear Every Cycle',
      this.clearEveryCycle,
      (checked: boolean) => { this.clearEveryCycle = checked; }
    );

    // Instructions
    const instructions = document.createElement('div');
    instructions.textContent = 'Click and drag to draw. Release to see the DFT approximation.';
    instructions.style.fontSize = '0.85em';
    instructions.style.opacity = '0.7';

    // Arrange controls
    const row0 = createControlRow([this.statusDisplay.element]);
    const row1 = createControlRow([buttonContainer, this.pointsDisplay.element]);
    this.sliderRow = createControlRow([this.nInputContainer, this.nError, this.kInputContainer, this.kError, this.clearCycleContainer]);
    this.sliderRow.style.display = 'none'; // Hidden until sampled
    const row3 = createControlRow([instructions]);

    this.controlPanel.appendChild(row0);
    this.controlPanel.appendChild(row1);
    this.controlPanel.appendChild(this.sliderRow);
    this.controlPanel.appendChild(row3);

    // Canvas container
    const canvasWrapper = document.createElement('div');
    canvasWrapper.style.width = '500px';
    canvasWrapper.style.maxWidth = '100%';
    canvasWrapper.style.aspectRatio = '1';
    canvasWrapper.style.position = 'relative';
    canvasWrapper.style.margin = '0 auto';

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.aspectRatio = '1';
    this.canvas.style.display = 'block';
    this.canvas.style.touchAction = 'none';
    this.canvas.style.cursor = 'crosshair';
    canvasWrapper.appendChild(this.canvas);

    // Description
    const description = document.createElement('div');
    description.style.fontSize = '0.9em';
    description.style.opacity = '0.8';
    description.style.textAlign = 'center';
    description.style.marginTop = 'var(--spacing-sm, 0.5rem)';
    const line1 = document.createElement('div');
    line1.textContent = 'Open Path DFT Approximation';
    line1.style.fontWeight = 'bold';
    const line2 = document.createElement('div');
    line2.textContent = 'Each vector rotates at a different frequency; their sum traces an approximation of the path.';
    description.appendChild(line1);
    description.appendChild(line2);

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

  private setupPathManager(): void {
    this.pathManager = new ContourDrawingManager(
      this.canvas,
      this.plotUtils,
      {
        axisRange: this.axisRange,
        isDark: this.isDark,
        autoClose: false  // Open path mode
      },
      {
        onStateChange: (state) => this.handleStateChange(state),
        onPointsChange: (count) => {
          this.pointsDisplay.update(String(count));
          this.render();
        }
      }
    );
    this.pathManager.attachEventListeners();
  }

  private handleStateChange(state: DrawingState): void {
    if (state === 'drawing') {
      this.statusDisplay.update('Drawing...');
    } else if (state === 'done') {
      // Auto-sample when drawing is complete
      this.handleSample();
    }
    this.render();
  }

  private handleSample(): void {
    const points = this.pathManager.getPoints();
    if (points.length < 3) {
      this.statusDisplay.update('Need at least 3 points to sample');
      return;
    }

    this.isSampled = true;

    // Show sliders
    this.sliderRow.style.display = '';

    // Get sample points
    const samplePoints = this.pathManager.getSamplePoints(this.samplePointCount);
    this.complexPoints = samplePoints.map(p => complex(p.x, p.y));

    // Compute Fourier coefficients
    this.fourierCoefficients = calculateFourierCoefficients(this.complexPoints);

    // Update K max to match N
    this.kInput.max = String(this.samplePointCount);
    if (this.kCoefficients > this.samplePointCount) {
      this.kCoefficients = this.samplePointCount;
      this.kInput.value = String(this.kCoefficients);
    }

    // Compute animation and start
    this.computeAnimation();
    this.startAnimation();

    this.statusDisplay.update('Adjust N and K to see different approximations');
  }

  private handleClear(): void {
    this.animationTimer.stop();
    this.pathManager.reset();
    this.complexPoints = [];
    this.fourierCoefficients = [];
    this.animationFrames = [];
    this.currentFrameIndex = 0;
    this.isSampled = false;

    // Reset UI
    this.statusDisplay.update('Draw a path');
    this.pointsDisplay.update('0');
    this.sliderRow.style.display = 'none';

    // Reset N and K to defaults
    this.samplePointCount = 256;
    this.nInput.value = '256';
    this.nError.style.display = 'none';
    this.kCoefficients = 128;
    this.kInput.value = '128';
    this.kError.style.display = 'none';

    // Reset clear every cycle checkbox
    this.clearEveryCycle = true;
    const clearCycleCheckbox = this.clearCycleContainer.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (clearCycleCheckbox) clearCycleCheckbox.checked = true;

    this.render();
  }

  private handleNChange(): void {
    const value = parseInt(this.nInput.value, 10);
    if (isNaN(value)) {
      this.nError.textContent = 'Must be a number';
      this.nError.style.display = 'inline';
      return;
    }
    if (value < 8) {
      this.nError.textContent = 'Min is 8';
      this.nError.style.display = 'inline';
      return;
    }
    if (value > 1024) {
      this.nError.textContent = 'Max is 1024';
      this.nError.style.display = 'inline';
      return;
    }
    this.nError.style.display = 'none';
    this.samplePointCount = value;

    // Update K max
    this.kInput.max = String(value);
    if (this.kCoefficients > value) {
      this.kCoefficients = value;
      this.kInput.value = String(value);
    }

    this.recalculate();
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

    // Just recompute animation (no need to resample)
    this.computeAnimation();
  }

  private recalculate(): void {
    if (!this.isSampled) return;

    // Resample with new N
    const samplePoints = this.pathManager.getSamplePoints(this.samplePointCount);
    this.complexPoints = samplePoints.map(p => complex(p.x, p.y));
    this.fourierCoefficients = calculateFourierCoefficients(this.complexPoints);
    this.computeAnimation();
  }

  private computeAnimation(): void {
    this.animationFrames = computeEpicycleFrames({
      coefficients: this.fourierCoefficients,
      kCoefficients: this.kCoefficients,
      frameCount: this.ANIMATION_FRAME_COUNT
    });
  }

  private startAnimation(): void {
    this.currentFrameIndex = 0;
    this.render();

    this.animationTimer.start(() => {
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.ANIMATION_FRAME_COUNT;
      this.render();
    }, this.frameDelay);
  }

  private render(): void {
    const cssColors = getCssColors(this.isDark);

    // Clear and fill background
    this.plotUtils.clearAndFillBackground();
    this.plotUtils.renderGridAndAxes();

    // Draw the original path
    const points = this.pathManager.getPoints();
    if (points.length > 0) {
      const pathColor = this.isSampled ? 'rgba(128, 128, 128, 0.5)' : cssColors.error;
      this.pathManager.renderContour(pathColor, true, false, 0);
    }

    // Trail trace
    if (this.isSampled && this.animationFrames.length > 0) {
      const trailX = this.animationFrames.map(f => f.tipX);
      const trailY = this.animationFrames.map(f => f.tipY);
      // When clearEveryCycle is false, draw the full trail
      const trailEnd = this.clearEveryCycle ? this.currentFrameIndex + 1 : this.animationFrames.length;
      renderTrail(
        this.plotUtils,
        trailX,
        trailY,
        trailEnd,
        cssColors.success,
        2
      );
    }

    // Fourier vectors
    if (this.isSampled && this.animationFrames.length > 0) {
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

  private setupResizeObserverInternal(): void {
    this.resizeObserver = setupResizeObserver(
      this.canvas.parentElement!,
      () => this.resize()
    );
  }

  cleanup(): void {
    this.animationTimer.stop();
    this.pathManager.detachEventListeners();
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
  title: 'Open Path DFT',
  category: 'Complex Analysis',
  description: 'Draw open paths and visualize DFT reconstruction with epicycles.'
};

export default function initOpenPathDFTDemo(
  container: HTMLElement,
  config?: DemoConfig
): DemoInstance {
  const demo = new OpenPathDFTDemo(container, config);
  return demo.init();
}
