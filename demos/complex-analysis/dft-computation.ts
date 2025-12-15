// DFT Computation Visualization Demo
// Shows step-by-step how each Fourier coefficient is computed

import { isDarkMode, getCssColors } from '@framework/demo-utils';
import { DemoInstance, DemoConfig, DemoMetadata } from '@framework/types';
import {
  createControlPanel,
  createButton,
  createInfoDisplay,
  createControlRow,
  InfoDisplay
} from '@framework/ui-components';
import {
  complex, Complex, multiply, add, divide, exp,
  pi as PI, cos, sin, sqrt, atan2, number,
  floor, abs, max
} from 'mathjs';

// Type for numeric mathjs results we know won't be BigNumber/Fraction/Matrix
type NumericResult = number | bigint | Complex;

// Helper to extract real part from a mathjs result (number, bigint, or Complex)
function toReal(val: NumericResult): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'bigint') return Number(val);
  return val.re;
}
import {
  Point2D,
  DrawingState,
  CanvasPlotUtils,
  ContourDrawingManager,
  indexToFrequency,
  pointsToComplex,
  DFT_COLORS
} from './contour-shared';

// Animation phase for each k step
type AnimationPhase = 'show_sample' | 'show_rotation' | 'show_product' | 'add_to_sum' | 'coeff_complete';

type DemoState = 'drawing' | 'animating' | 'paused' | 'complete';

interface AnimationState {
  coeffN: number;           // 0-7: which coefficient we're computing
  k: number;                // 0-7: which term in the summation
  phase: AnimationPhase;
  accumulatedSum: Complex;  // Running sum for current coefficient
  products: Complex[];      // Products computed so far for current coefficient
  finalCoefficients: Complex[];  // Completed coefficients
  // Rotation animation state
  rotationFrame: number;           // 0-30 for animation progress
  isAnimatingRotation: boolean;    // true during rotation animation
  rotationTrail: Point2D[];        // Trail of tip positions during rotation
}

class DFTComputationDemo implements DemoInstance {
  private container: HTMLElement;
  private mainCanvas!: HTMLCanvasElement;
  private mainCtx!: CanvasRenderingContext2D;
  private sideCanvas!: HTMLCanvasElement;
  private sideCtx!: CanvasRenderingContext2D;
  private controlPanel!: HTMLElement;
  private plotUtils!: CanvasPlotUtils;
  private contourManager!: ContourDrawingManager;

  // State
  private isDark: boolean;
  private demoState: DemoState = 'drawing';
  private animState: AnimationState | null = null;
  private samplePoints: Point2D[] = [];
  private complexSamples: Complex[] = [];

  // Animation
  private animationTimer: number | null = null;
  private rotationTimer: number | null = null;
  private frameDelay = 500;
  private stateHistory: AnimationState[] = [];

  // Rotation animation constants
  private readonly ROTATION_FRAMES = 31;   // 0 to 30 inclusive
  private readonly ROTATION_FRAME_MS = 33; // ~30fps → ~1 second total

  // UI elements
  private statusDisplay!: InfoDisplay;
  private coeffDisplay!: InfoDisplay;
  private playPauseBtn!: HTMLButtonElement;
  private stepBtn!: HTMLButtonElement;
  private stepBackBtn!: HTMLButtonElement;
  private delayInput!: HTMLInputElement;
  private shapeSelect!: HTMLSelectElement;

  // Keyboard handler
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  // Constants
  private readonly N = 9;  // Fixed sample count
  private readonly axisRange = { min: -2.5, max: 2.5 };

  // Resize observer
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement, config?: DemoConfig) {
    this.container = container;
    this.isDark = isDarkMode(config || {});
  }

  init(): DemoInstance {
    this.setupUI();
    this.setupMainCanvas();
    this.setupSideCanvas();
    this.setupContourManager();
    this.setupResizeObserver();
    this.setupKeyboardHandler();
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
    statusSpan.textContent = 'Draw a closed path to see DFT computation';
    statusElement.appendChild(statusSpan);
    this.statusDisplay = {
      element: statusElement,
      update: (value: string) => { statusSpan.textContent = value; }
    };

    // Coefficient info display
    this.coeffDisplay = createInfoDisplay('Info', '');

    // Reset button
    const resetContainer = document.createElement('div');
    createButton('Reset', resetContainer, () => this.resetDemo());

    // Play/Pause button
    const playPauseContainer = document.createElement('div');
    this.playPauseBtn = createButton('Play', playPauseContainer, () => this.togglePlayPause());
    this.playPauseBtn.disabled = true;

    // Step back button
    const stepBackContainer = document.createElement('div');
    this.stepBackBtn = createButton('◀', stepBackContainer, () => this.stepBackward());
    this.stepBackBtn.disabled = true;

    // Step forward button
    const stepContainer = document.createElement('div');
    this.stepBtn = createButton('▶', stepContainer, () => this.stepAnimation());
    this.stepBtn.disabled = true;

    // Delay input
    const delayContainer = document.createElement('div');
    delayContainer.style.display = 'flex';
    delayContainer.style.alignItems = 'center';
    delayContainer.style.gap = '0.5rem';
    const delayLabel = document.createElement('label');
    delayLabel.textContent = 'Delay (ms):';
    this.delayInput = document.createElement('input');
    this.delayInput.type = 'number';
    this.delayInput.value = String(this.frameDelay);
    this.delayInput.min = '100';
    this.delayInput.max = '2000';
    this.delayInput.step = '100';
    this.delayInput.style.width = '70px';
    this.delayInput.style.padding = '0.25rem';
    this.delayInput.addEventListener('input', () => this.handleDelayChange());
    delayContainer.appendChild(delayLabel);
    delayContainer.appendChild(this.delayInput);

    // Shape preset dropdown
    const shapeContainer = document.createElement('div');
    shapeContainer.style.display = 'flex';
    shapeContainer.style.alignItems = 'center';
    shapeContainer.style.gap = '0.5rem';
    const shapeLabel = document.createElement('label');
    shapeLabel.textContent = 'Shape:';
    this.shapeSelect = document.createElement('select');
    this.shapeSelect.style.padding = '0.25rem';
    const shapeOptions = [
      { value: '', label: 'Draw custom' },
      { value: 'circle', label: 'Unit Circle' },
      { value: 'upper-semicircle', label: 'Upper Semicircle' },
      { value: 'lower-semicircle', label: 'Lower Semicircle' }
    ];
    for (const opt of shapeOptions) {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      this.shapeSelect.appendChild(option);
    }
    this.shapeSelect.addEventListener('change', () => this.handleShapeChange());
    shapeContainer.appendChild(shapeLabel);
    shapeContainer.appendChild(this.shapeSelect);

    // Instructions
    const instructions = document.createElement('div');
    instructions.textContent = 'Draw a closed loop or select a preset shape.';
    instructions.style.fontSize = '0.85em';
    instructions.style.opacity = '0.7';

    // Arrange controls
    const row0 = createControlRow([this.statusDisplay.element]);
    const row1 = createControlRow([resetContainer, playPauseContainer, stepBackContainer, stepContainer, delayContainer]);
    const row1b = createControlRow([shapeContainer]);
    const row2 = createControlRow([this.coeffDisplay.element]);
    const row3 = createControlRow([instructions]);

    this.controlPanel.appendChild(row0);
    this.controlPanel.appendChild(row1);
    this.controlPanel.appendChild(row1b);
    this.controlPanel.appendChild(row2);
    this.controlPanel.appendChild(row3);

    // Canvas wrapper - contains main canvas and side panel
    const canvasWrapper = document.createElement('div');
    canvasWrapper.style.display = 'flex';
    canvasWrapper.style.gap = '1rem';
    canvasWrapper.style.justifyContent = 'center';
    canvasWrapper.style.flexWrap = 'wrap';

    // Main canvas container
    const mainCanvasContainer = document.createElement('div');
    mainCanvasContainer.style.width = '400px';
    mainCanvasContainer.style.maxWidth = '100%';
    mainCanvasContainer.style.aspectRatio = '1';
    mainCanvasContainer.style.position = 'relative';

    this.mainCanvas = document.createElement('canvas');
    this.mainCanvas.style.width = '100%';
    this.mainCanvas.style.aspectRatio = '1';
    this.mainCanvas.style.display = 'block';
    this.mainCanvas.style.touchAction = 'none';
    this.mainCanvas.style.cursor = 'crosshair';
    mainCanvasContainer.appendChild(this.mainCanvas);

    // Side panel container
    const sidePanelContainer = document.createElement('div');
    sidePanelContainer.style.width = '200px';
    sidePanelContainer.style.maxWidth = '100%';

    this.sideCanvas = document.createElement('canvas');
    this.sideCanvas.style.width = '100%';
    this.sideCanvas.style.display = 'block';
    this.sideCanvas.style.border = '1px solid var(--color-border, #ccc)';
    this.sideCanvas.style.borderRadius = '4px';

    sidePanelContainer.appendChild(this.sideCanvas);

    canvasWrapper.appendChild(mainCanvasContainer);
    canvasWrapper.appendChild(sidePanelContainer);

    // Description
    const description = document.createElement('div');
    description.style.fontSize = '0.9em';
    description.style.opacity = '0.8';
    description.style.textAlign = 'center';
    description.style.marginTop = 'var(--spacing-sm, 0.5rem)';
    description.innerHTML = '<strong>DFT Coefficient Computation</strong><br>c<sub>n</sub> = (1/N) &sum; z<sub>k</sub> &middot; e<sup>-2&pi;ink/N</sup>';

    this.container.appendChild(canvasWrapper);
    this.container.appendChild(description);
  }

  private setupMainCanvas(): void {
    const rect = this.mainCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.mainCanvas.width = rect.width * dpr;
    this.mainCanvas.height = rect.height * dpr;
    this.mainCtx = this.mainCanvas.getContext('2d')!;
    this.mainCtx.scale(dpr, dpr);

    this.plotUtils = new CanvasPlotUtils(
      this.mainCanvas,
      this.mainCtx,
      this.axisRange,
      this.isDark
    );
  }

  private setupSideCanvas(): void {
    const rect = this.sideCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // Match main canvas height (400px)
    const height = 400;
    this.sideCanvas.style.height = `${height}px`;
    this.sideCanvas.width = rect.width * dpr;
    this.sideCanvas.height = height * dpr;
    this.sideCtx = this.sideCanvas.getContext('2d')!;
    this.sideCtx.scale(dpr, dpr);
  }

  private setupContourManager(): void {
    this.contourManager = new ContourDrawingManager(
      this.mainCanvas,
      this.plotUtils,
      {
        axisRange: this.axisRange,
        closeThresholdPixels: 8,
        isDark: this.isDark
      },
      {
        onStateChange: (state) => this.handleContourStateChange(state),
        onPointsChange: () => this.render(),
        onContourClosed: () => this.handleContourClosed()
      }
    );
    this.contourManager.attachEventListeners();
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.mainCanvas.parentElement!);
  }

  private setupKeyboardHandler(): void {
    this.keyHandler = (e: KeyboardEvent) => {
      // Only respond when we have animation state
      if (!this.animState) return;
      // Only respond when paused or complete
      if (this.demoState !== 'paused' && this.demoState !== 'complete') return;

      if (e.key === '[') {
        e.preventDefault();
        this.stepBackward();
      } else if (e.key === ']') {
        e.preventDefault();
        this.stepAnimation();
      }
    };
    document.addEventListener('keydown', this.keyHandler);
  }

  private handleContourStateChange(state: DrawingState): void {
    if (state === 'drawing') {
      this.statusDisplay.update('Drawing...');
      // Reset dropdown when user starts drawing manually
      this.shapeSelect.value = '';
    } else if (state === 'paused') {
      this.statusDisplay.update('Paused - click to continue');
    }
    this.render();
  }

  private handleContourClosed(): void {
    this.demoState = 'paused';
    this.samplePoints = this.contourManager.getSamplePoints(this.N);
    this.complexSamples = pointsToComplex(this.samplePoints);

    // Initialize animation state
    this.animState = {
      coeffN: 0,
      k: 0,
      phase: 'show_sample',
      accumulatedSum: complex(0, 0),
      products: [],
      finalCoefficients: [],
      rotationFrame: 0,
      isAnimatingRotation: false,
      rotationTrail: []
    };

    this.statusDisplay.update('Contour closed! Press Play to start.');
    this.playPauseBtn.disabled = false;
    this.stepBtn.disabled = false;
    this.stepBackBtn.disabled = false;
    this.updateCoeffDisplay();
    this.render();
  }

  private togglePlayPause(): void {
    if (this.demoState === 'animating') {
      this.pauseAnimation();
    } else if (this.demoState === 'paused' || this.demoState === 'complete') {
      this.startAnimation();
    }
  }

  private startAnimation(): void {
    if (!this.animState) return;

    // If complete, restart
    if (this.demoState === 'complete') {
      this.animState = {
        coeffN: 0,
        k: 0,
        phase: 'show_sample',
        accumulatedSum: complex(0, 0),
        products: [],
        finalCoefficients: [],
        rotationFrame: 0,
        isAnimatingRotation: false,
        rotationTrail: []
      };
      this.stateHistory = [];
    }

    this.demoState = 'animating';
    this.playPauseBtn.textContent = 'Pause';
    this.stepBtn.disabled = true;
    this.stepBackBtn.disabled = true;

    // If we paused during rotation animation, resume it
    if (this.animState.isAnimatingRotation) {
      this.startRotationAnimation();
    }

    this.animationTimer = window.setInterval(() => {
      this.advanceAnimationState();
      this.render();
    }, this.frameDelay);
  }

  private pauseAnimation(): void {
    this.demoState = 'paused';
    this.playPauseBtn.textContent = 'Play';
    this.stepBtn.disabled = false;
    this.stepBackBtn.disabled = false;

    if (this.animationTimer !== null) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }

    // Also pause rotation animation
    this.stopRotationAnimation();
  }

  private stepAnimation(): void {
    if (!this.animState) return;
    if (this.demoState !== 'paused' && this.demoState !== 'complete') return;

    // If currently animating rotation, complete it instantly
    if (this.animState.isAnimatingRotation) {
      this.completeRotationInstantly();
    }

    // If complete, don't allow stepping forward
    if (this.demoState === 'complete') return;

    this.advanceAnimationState();
    this.render();
  }

  private stepBackward(): void {
    if (!this.animState) return;
    if (this.demoState !== 'paused' && this.demoState !== 'complete') return;

    // If currently animating rotation, stop it
    if (this.animState.isAnimatingRotation) {
      this.stopRotationAnimation();
    }

    // Pop previous state from history
    if (this.stateHistory.length === 0) return;

    this.animState = this.stateHistory.pop()!;

    // If we were complete, go back to paused
    if (this.demoState === 'complete') {
      this.demoState = 'paused';
      this.playPauseBtn.textContent = 'Play';
      this.stepBtn.disabled = false;
    }

    this.updateCoeffDisplay();
    this.render();
  }

  private cloneAnimationState(state: AnimationState): AnimationState {
    return {
      coeffN: state.coeffN,
      k: state.k,
      phase: state.phase,
      accumulatedSum: complex(state.accumulatedSum.re, state.accumulatedSum.im),
      products: state.products.map(p => complex(p.re, p.im)),
      finalCoefficients: state.finalCoefficients.map(c => complex(c.re, c.im)),
      rotationFrame: state.rotationFrame,
      isAnimatingRotation: state.isAnimatingRotation,
      rotationTrail: state.rotationTrail.map(pt => ({ x: pt.x, y: pt.y }))
    };
  }

  private completeRotationInstantly(): void {
    if (!this.animState) return;

    this.stopRotationAnimation();

    // Fill in the rest of the trail
    const { coeffN, k, rotationFrame } = this.animState;
    const freq = indexToFrequency(coeffN);
    const zK = this.complexSamples[k];
    const fullAngle = divide(multiply(-2, PI, freq, k), this.N);

    for (let frame = rotationFrame; frame < this.ROTATION_FRAMES; frame++) {
      const t = frame / (this.ROTATION_FRAMES - 1);
      const currentAngle = toReal(multiply(fullAngle, t) as NumericResult);
      const rotated = multiply(zK, exp(complex(0, currentAngle))) as Complex;
      this.animState.rotationTrail.push({ x: rotated.re, y: rotated.im });
    }

    this.animState.rotationFrame = this.ROTATION_FRAMES;
    this.animState.isAnimatingRotation = false;
  }

  private advanceAnimationState(): void {
    if (!this.animState) return;

    // Don't advance phases while rotation animation is running
    if (this.animState.isAnimatingRotation) return;

    // Save current state to history before making changes
    this.stateHistory.push(this.cloneAnimationState(this.animState));

    const { coeffN, k, phase } = this.animState;
    const freq = indexToFrequency(coeffN);

    switch (phase) {
      case 'show_sample':
        // Start rotation animation
        this.animState.phase = 'show_rotation';
        this.animState.rotationFrame = 0;
        this.animState.isAnimatingRotation = true;
        this.animState.rotationTrail = [];
        this.startRotationAnimation();
        break;

      case 'show_rotation':
        // This is called when rotation animation completes
        this.animState.isAnimatingRotation = false;
        this.animState.phase = 'show_product';
        break;

      case 'show_product': {
        // Calculate and store the product
        const angle = toReal(divide(multiply(-2, PI, freq, k), this.N) as NumericResult);
        const rotationFactor = exp(complex(0, angle)) as Complex;
        const product = multiply(this.complexSamples[k], rotationFactor) as Complex;
        this.animState.products.push(product);
        this.animState.phase = 'add_to_sum';
        break;
      }

      case 'add_to_sum': {
        // Add latest product to accumulated sum
        const latestProduct = this.animState.products[this.animState.products.length - 1];
        this.animState.accumulatedSum = add(this.animState.accumulatedSum, latestProduct) as Complex;

        // Move to next k or next coefficient
        if (k < this.N - 1) {
          this.animState.k = k + 1;
          this.animState.phase = 'show_sample';
        } else {
          this.animState.phase = 'coeff_complete';
        }
        break;
      }

      case 'coeff_complete': {
        // Store final coefficient (divided by N)
        const finalCoeff = divide(this.animState.accumulatedSum, this.N) as Complex;
        this.animState.finalCoefficients.push(finalCoeff);

        // Move to next coefficient or complete
        if (coeffN < this.N - 1) {
          this.animState.coeffN = coeffN + 1;
          this.animState.k = 0;
          this.animState.phase = 'show_sample';
          this.animState.accumulatedSum = complex(0, 0);
          this.animState.products = [];
        } else {
          // All coefficients computed
          this.demoState = 'complete';
          this.statusDisplay.update('Complete! All coefficients computed.');
          this.playPauseBtn.textContent = 'Replay';
          this.stepBtn.disabled = true;
          this.stepBackBtn.disabled = false; // Allow stepping back from completion
          if (this.animationTimer !== null) {
            clearInterval(this.animationTimer);
            this.animationTimer = null;
          }
        }
        break;
      }
    }

    this.updateCoeffDisplay();
  }

  private startRotationAnimation(): void {
    if (!this.animState) return;

    // Stop any existing rotation timer
    if (this.rotationTimer !== null) {
      clearInterval(this.rotationTimer);
    }

    this.rotationTimer = window.setInterval(() => {
      this.advanceRotationFrame();
    }, this.ROTATION_FRAME_MS);
  }

  private stopRotationAnimation(): void {
    if (this.rotationTimer !== null) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }
  }

  private advanceRotationFrame(): void {
    if (!this.animState || !this.animState.isAnimatingRotation) {
      this.stopRotationAnimation();
      return;
    }

    const { coeffN, k, rotationFrame } = this.animState;
    const freq = indexToFrequency(coeffN);
    const zK = this.complexSamples[k];

    // Calculate the interpolated angle based on current frame
    const t = rotationFrame / (this.ROTATION_FRAMES - 1); // 0 to 1
    const fullAngle = divide(multiply(-2, PI, freq, k), this.N);
    const currentAngle = toReal(multiply(fullAngle, t) as NumericResult);

    // Calculate interpolated position and add to trail
    const rotated = multiply(zK, exp(complex(0, currentAngle))) as Complex;
    this.animState.rotationTrail.push({ x: rotated.re, y: rotated.im });

    // Advance frame
    this.animState.rotationFrame++;

    // Check if animation complete
    if (this.animState.rotationFrame >= this.ROTATION_FRAMES) {
      this.stopRotationAnimation();
      this.animState.isAnimatingRotation = false;
      // Advance to next phase (show_product)
      this.advanceAnimationState();
    }

    this.render();
  }

  private formatPolar(z: Complex): string {
    const r = toReal(sqrt(add(multiply(z.re, z.re), multiply(z.im, z.im))) as NumericResult);
    const theta = atan2(z.im, z.re);
    const thetaDeg = toReal(divide(multiply(theta, 180), PI) as NumericResult);
    if (r < 0.01) return 'r ≈ 0';
    return `r = ${r.toFixed(3)}, θ = ${thetaDeg.toFixed(1)}°`;
  }

  private updateCoeffDisplay(): void {
    if (!this.animState) {
      this.coeffDisplay.update('');
      return;
    }

    const { coeffN, k, phase } = this.animState;
    const freq = indexToFrequency(coeffN);
    const freqStr = freq >= 0 ? `+${freq}` : `${freq}`;

    let info = `Computing c${coeffN} (freq=${freqStr}): `;

    if (phase === 'coeff_complete') {
      const sum = this.animState.accumulatedSum;
      info += `Sum = ${this.formatPolar(sum)} — will be ÷${this.N} to normalize`;
    } else {
      info += `k=${k}/${this.N-1}, phase: ${phase.replace('_', ' ')}`;
    }

    this.coeffDisplay.update(info);
    this.statusDisplay.update(info);
  }

  private handleDelayChange(): void {
    const value = parseInt(this.delayInput.value, 10);
    if (!isNaN(value) && value >= 100 && value <= 2000) {
      this.frameDelay = value;
      // Restart animation with new delay if running
      if (this.animationTimer !== null) {
        clearInterval(this.animationTimer);
        this.animationTimer = window.setInterval(() => {
          this.advanceAnimationState();
          this.render();
        }, this.frameDelay);
      }
    }
  }

  private resetDemo(): void {
    this.pauseAnimation();
    this.contourManager.reset();
    this.demoState = 'drawing';
    this.animState = null;
    this.samplePoints = [];
    this.complexSamples = [];
    this.statusDisplay.update('Draw a closed path to see DFT computation');
    this.coeffDisplay.update('');
    this.playPauseBtn.disabled = true;
    this.playPauseBtn.textContent = 'Play';
    this.stepBtn.disabled = true;
    this.stepBackBtn.disabled = true;
    this.stateHistory = [];
    this.shapeSelect.value = '';
    this.render();
  }

  private handleShapeChange(): void {
    const shape = this.shapeSelect.value;
    if (!shape) return; // "Draw custom" selected, do nothing

    // Reset first
    this.pauseAnimation();
    this.contourManager.reset();
    this.demoState = 'drawing';
    this.animState = null;
    this.samplePoints = [];
    this.complexSamples = [];
    this.stateHistory = [];

    // Generate dense points for visual display
    const densePoints = this.generateShapePoints(shape);
    if (densePoints.length > 0) {
      this.contourManager.setPointsAndClose(densePoints);
      // handleContourClosed was called via callback, but it used arc-length sampling

      // Override with mathematically exact samples for preset shapes
      // Generate Complex[] directly - no conversion through Point2D
      const exactComplex = this.generateExactComplexSamples(shape);
      if (exactComplex.length > 0) {
        this.complexSamples = exactComplex;
        // Derive samplePoints for rendering only
        this.samplePoints = exactComplex.map(z => ({ x: z.re, y: z.im }));
      }
    }
  }

  private generateShapePoints(shape: string): Point2D[] {
    const radius = 1; // Unit circle
    const numPoints = 360; // Dense sampling for smooth appearance

    switch (shape) {
      case 'circle':
        return this.generateCirclePoints(radius, numPoints);
      case 'upper-semicircle':
        return this.generateUpperSemicirclePoints(radius, numPoints);
      case 'lower-semicircle':
        return this.generateLowerSemicirclePoints(radius, numPoints);
      default:
        return [];
    }
  }

  // Generate mathematically exact samples as Complex[] directly
  // Uses exp(i*angle) to avoid trig function precision issues
  private generateExactComplexSamples(shape: string): Complex[] {
    switch (shape) {
      case 'circle':
        return this.generateExactCircleComplex();
      case 'upper-semicircle':
        return this.generateExactUpperSemicircleComplex();
      case 'lower-semicircle':
        return this.generateExactLowerSemicircleComplex();
      default:
        return [];
    }
  }

  // Exact N samples on unit circle using e^(i * 2πk/N)
  // This is mathematically exact - same basis as DFT
  private generateExactCircleComplex(): Complex[] {
    const samples: Complex[] = [];
    for (let k = 0; k < this.N; k++) {
      // e^(i * 2πk/N) - keeps everything in mathjs until final render
      const angle = divide(multiply(2, PI, k), this.N);
      const iAngle = multiply(complex(0, 1), angle) as Complex;
      samples.push(exp(iAngle) as Complex);
    }
    return samples;
  }

  // Exact N samples on upper semicircle (arc from 0 to π, then line back)
  private generateExactUpperSemicircleComplex(): Complex[] {
    const samples: Complex[] = [];
    // Arc length = π, line length = 2, total = π+2
    const arcFraction = number(divide(PI, add(PI, 2)));
    const arcSamples = Math.round(this.N * arcFraction);
    const lineSamples = this.N - arcSamples;

    // Arc samples using e^(i * πk/(arcSamples-1)) for k=0..arcSamples-1
    for (let k = 0; k < arcSamples; k++) {
      const angle = divide(multiply(PI, k), arcSamples > 1 ? arcSamples - 1 : 1);
      const iAngle = multiply(complex(0, 1), angle) as Complex;
      samples.push(exp(iAngle) as Complex);
    }

    // Line samples from (-1, 0) to (1, 0), excluding endpoints
    for (let k = 1; k <= lineSamples; k++) {
      const t = k / (lineSamples + 1);
      samples.push(complex(-1 + 2 * t, 0));
    }

    return samples;
  }

  // Exact N samples on lower semicircle (arc from π to 2π, then line back)
  private generateExactLowerSemicircleComplex(): Complex[] {
    const samples: Complex[] = [];
    const arcFraction = number(divide(PI, add(PI, 2)));
    const arcSamples = Math.round(this.N * arcFraction);
    const lineSamples = this.N - arcSamples;

    // Arc samples using e^(i * (π + πk/(arcSamples-1))) for k=0..arcSamples-1
    for (let k = 0; k < arcSamples; k++) {
      const angle = add(PI, divide(multiply(PI, k), arcSamples > 1 ? arcSamples - 1 : 1));
      const iAngle = multiply(complex(0, 1), angle) as Complex;
      samples.push(exp(iAngle) as Complex);
    }

    // Line samples from (1, 0) to (-1, 0), excluding endpoints
    for (let k = 1; k <= lineSamples; k++) {
      const t = k / (lineSamples + 1);
      samples.push(complex(1 - 2 * t, 0));
    }

    return samples;
  }

  private generateCirclePoints(radius: number, numPoints: number): Point2D[] {
    const points: Point2D[] = [];
    for (let i = 0; i < numPoints; i++) {
      const angleNum = toReal(divide(multiply(2, PI, i), numPoints) as NumericResult);
      points.push({
        x: toReal(multiply(radius, cos(angleNum)) as NumericResult),
        y: toReal(multiply(radius, sin(angleNum)) as NumericResult)
      });
    }
    return points;
  }

  private generateUpperSemicirclePoints(radius: number, numPoints: number): Point2D[] {
    const points: Point2D[] = [];
    const arcPoints = number(floor(numPoints * 0.8)); // Most points on the arc
    const linePoints = numPoints - arcPoints; // Rest on the closing line

    // Arc from (radius, 0) counterclockwise to (-radius, 0)
    for (let i = 0; i <= arcPoints; i++) {
      const angleNum = toReal(divide(multiply(PI, i), arcPoints) as NumericResult); // 0 to PI
      points.push({
        x: toReal(multiply(radius, cos(angleNum)) as NumericResult),
        y: toReal(multiply(radius, sin(angleNum)) as NumericResult)
      });
    }

    // Line from (-radius, 0) back to (radius, 0)
    for (let i = 1; i < linePoints; i++) {
      const t = i / linePoints;
      points.push({
        x: -radius + 2 * radius * t,
        y: 0
      });
    }

    return points;
  }

  private generateLowerSemicirclePoints(radius: number, numPoints: number): Point2D[] {
    const points: Point2D[] = [];
    const arcPoints = number(floor(numPoints * 0.8));
    const linePoints = numPoints - arcPoints;

    // Arc from (-radius, 0) clockwise to (radius, 0)
    for (let i = 0; i <= arcPoints; i++) {
      const angle = add(PI, divide(multiply(PI, i), arcPoints)); // PI to 2*PI
      points.push({
        x: toReal(multiply(radius, cos(angle)) as NumericResult),
        y: toReal(multiply(radius, sin(angle)) as NumericResult)
      });
    }

    // Line from (radius, 0) back to (-radius, 0)
    for (let i = 1; i < linePoints; i++) {
      const t = i / linePoints;
      points.push({
        x: radius - 2 * radius * t,
        y: 0
      });
    }

    return points;
  }

  private render(): void {
    this.renderMainCanvas();
    this.renderSidePanel();
  }

  private renderMainCanvas(): void {
    const cssColors = getCssColors(this.isDark);

    // Clear and fill background
    this.plotUtils.clearAndFillBackground();

    // Grid and axes (muted during animation)
    this.plotUtils.renderGridAndAxes();

    // Draw contour
    const contourState = this.contourManager.getState();
    if (contourState !== 'idle') {
      const contourColor = this.demoState === 'drawing' ? cssColors.warning : DFT_COLORS.contourMuted;
      this.contourManager.renderContour(contourColor, this.demoState === 'drawing');
    }

    // Draw sample points when contour is closed
    if (this.samplePoints.length > 0) {
      this.renderSamplePoints();
    }

    // Draw current animation visualization
    if (this.animState && this.demoState !== 'drawing') {
      this.renderCurrentVisualization();
    }
  }

  private renderSamplePoints(): void {
    for (let i = 0; i < this.samplePoints.length; i++) {
      const pt = this.samplePoints[i];
      const isCurrentK = this.animState && i === this.animState.k;
      const isProcessed = this.animState && i < this.animState.k;

      // Determine color
      let fillColor = DFT_COLORS.samplePoints;
      if (isCurrentK) {
        fillColor = DFT_COLORS.currentSample;
      } else if (isProcessed) {
        fillColor = '#666666'; // Dimmed
      }

      // Draw point
      this.plotUtils.drawPoint(pt, isCurrentK ? 8 : 5, fillColor, this.isDark ? '#fff' : '#000', 2);

      // Draw label
      this.plotUtils.drawText(`${i}`, pt, {
        offsetX: 12,
        offsetY: -12,
        fontSize: 11,
        color: this.isDark ? '#ccc' : '#333'
      });
    }
  }

  private renderCurrentVisualization(): void {
    if (!this.animState) return;

    const { coeffN, k, phase, accumulatedSum, products, isAnimatingRotation, rotationTrail } = this.animState;
    const freq = indexToFrequency(coeffN);

    const origin: Point2D = { x: 0, y: 0 };
    const zK = this.complexSamples[k];
    const zKPoint: Point2D = { x: zK.re, y: zK.im };

    // Calculate full rotation factor
    const fullAngle = toReal(divide(multiply(-2, PI, freq, k), this.N) as NumericResult);
    const rotationFactor = exp(complex(0, fullAngle)) as Complex;
    const rotationPoint: Point2D = { x: rotationFactor.re, y: rotationFactor.im };

    // Calculate full product
    const product = multiply(zK, rotationFactor) as Complex;
    const productPoint: Point2D = { x: product.re, y: product.im };

    // Draw unit circle for reference
    this.plotUtils.drawUnitCircle(0, 0, this.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)');

    // Draw based on phase
    if (phase === 'show_sample' || phase === 'show_rotation' || phase === 'show_product' || phase === 'add_to_sum') {
      // Always show original z_k vector (as ghost during rotation)
      const zKColor = (phase === 'show_rotation' && isAnimatingRotation)
        ? (this.isDark ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)')
        : DFT_COLORS.samplePoints;
      this.plotUtils.drawVectorWithArrowhead(origin, zKPoint, zKColor, 3);
      if (!(phase === 'show_rotation' && isAnimatingRotation)) {
        this.plotUtils.drawText(`z${k}`, zKPoint, { offsetX: 15, offsetY: 0, color: DFT_COLORS.samplePoints });
      }
    }

    // During rotation animation, show the rotating vector and trail
    if (phase === 'show_rotation' && isAnimatingRotation) {
      // Draw tip trail with fading opacity
      const trailLen = rotationTrail.length;
      for (let i = 0; i < trailLen; i++) {
        const pt = rotationTrail[i];
        // Opacity fades from oldest (dimmest) to newest (brightest)
        const alpha = 0.2 + 0.6 * (i / number(max(1, trailLen - 1)));
        const trailColor = `rgba(255, 165, 0, ${alpha})`; // Orange trail
        this.plotUtils.drawPoint(pt, 3, trailColor, 'transparent', 0);
      }

      // Draw current rotating vector
      if (trailLen > 0) {
        const currentPt = rotationTrail[trailLen - 1];
        this.plotUtils.drawVectorWithArrowhead(origin, currentPt, DFT_COLORS.product, 3);
        this.plotUtils.drawText(`z${k}·r`, currentPt, { offsetX: 15, offsetY: 0, color: DFT_COLORS.product });
      }

      // Show rotation factor (unit vector) indicating target rotation
      this.plotUtils.drawVectorWithArrowhead(origin, rotationPoint, DFT_COLORS.rotationFactor, 2);
    }

    if (phase === 'show_sample' || (phase === 'show_rotation' && !isAnimatingRotation) || phase === 'show_product' || phase === 'add_to_sum') {
      // Show rotation factor (unit vector) - no label, see legend
      this.plotUtils.drawVectorWithArrowhead(origin, rotationPoint, DFT_COLORS.rotationFactor, 2);
    }

    if (phase === 'show_product' || phase === 'add_to_sum') {
      // Show product vector
      this.plotUtils.drawVectorWithArrowhead(origin, productPoint, DFT_COLORS.product, 3);
      this.plotUtils.drawText(`z${k}·r`, productPoint, { offsetX: 15, offsetY: 0, color: DFT_COLORS.product });
    }

    // Show running average (sum divided by terms actually in the sum)
    // During 'add_to_sum' phase, the latest product is in products[] but not yet in accumulatedSum
    const termsInSum = (phase === 'add_to_sum') ? products.length - 1 : products.length;
    if (termsInSum > 0) {
      const avgComplex = divide(accumulatedSum, termsInSum) as Complex;
      const sumPoint: Point2D = { x: avgComplex.re, y: avgComplex.im };
      if (number(abs(sumPoint.x)) > 0.005 || number(abs(sumPoint.y)) > 0.005) {
        this.plotUtils.drawVectorWithArrowhead(origin, sumPoint, DFT_COLORS.accumulatedSum, 4);
        this.plotUtils.drawText(`Σ/${termsInSum}`, sumPoint, { offsetX: -15, offsetY: -15, color: DFT_COLORS.accumulatedSum, fontSize: 14 });
      }
    }

  }

  private renderSidePanel(): void {
    const width = this.sideCanvas.width / (window.devicePixelRatio || 1);
    const height = this.sideCanvas.height / (window.devicePixelRatio || 1);
    const ctx = this.sideCtx;

    // Clear
    ctx.fillStyle = this.isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(0, 0, width, height);

    if (!this.animState) {
      // Show placeholder
      ctx.fillStyle = this.isDark ? '#888' : '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Draw a contour to', width / 2, height / 2 - 10);
      ctx.fillText('see product vectors', width / 2, height / 2 + 10);
      return;
    }

    const { coeffN, products, phase } = this.animState;
    const freq = indexToFrequency(coeffN);

    // Legend
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    const legendY = 10;
    const legendItems = [
      { color: DFT_COLORS.samplePoints, label: 'zₖ' },
      { color: DFT_COLORS.rotationFactor, label: 'rot' },
      { color: DFT_COLORS.product, label: 'prod' },
      { color: DFT_COLORS.accumulatedSum, label: 'sum' }
    ];
    const legendSpacing = width / legendItems.length;
    legendItems.forEach((item, i) => {
      const x = 5 + i * legendSpacing;
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, legendY);
      ctx.lineTo(x + 12, legendY);
      ctx.stroke();
      ctx.fillStyle = this.isDark ? '#ccc' : '#333';
      ctx.fillText(item.label, x + 14, legendY + 3);
    });

    // Title
    ctx.fillStyle = this.isDark ? '#fff' : '#000';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`c${coeffN} (freq=${freq >= 0 ? '+' + freq : freq})`, width / 2, 28);

    // Product vectors section - 2 columns, 5 rows for N=9
    const colWidth = width / 2;
    const rowHeight = 20;
    const startY = 42;
    const vectorScale = 9;

    // Find max magnitude for product scaling
    let maxProductMag = 1;
    for (const p of products) {
      const mag = toReal(sqrt(p.re * p.re + p.im * p.im));
      if (mag > maxProductMag) maxProductMag = mag;
    }

    for (let i = 0; i < this.N; i++) {
      const col = i < 5 ? 0 : 1;
      const row = i < 5 ? i : i - 5;
      const x = col * colWidth + colWidth / 2;
      const y = startY + row * rowHeight;

      // Label
      ctx.fillStyle = this.isDark ? '#aaa' : '#555';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`k=${i}:`, x - colWidth / 2 + 5, y + 3);

      // Draw vector if computed
      if (i < products.length) {
        const p = products[i];
        const scale = vectorScale / maxProductMag;
        const vx = p.re * scale;
        const vy = -p.im * scale;
        const cx = x + 10;
        const cy = y;

        ctx.strokeStyle = DFT_COLORS.product;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + vx, cy + vy);
        ctx.stroke();

        // Arrowhead
        const angle = number(atan2(vy, vx));
        const headLen = 4;
        const piOver6 = number(divide(PI, 6));
        ctx.fillStyle = DFT_COLORS.product;
        ctx.beginPath();
        ctx.moveTo(cx + vx, cy + vy);
        ctx.lineTo(cx + vx - headLen * number(cos(angle - piOver6)), cy + vy - headLen * number(sin(angle - piOver6)));
        ctx.lineTo(cx + vx - headLen * number(cos(angle + piOver6)), cy + vy - headLen * number(sin(angle + piOver6)));
        ctx.closePath();
        ctx.fill();
      } else if (i === this.animState.k && phase !== 'coeff_complete') {
        ctx.fillStyle = DFT_COLORS.currentSample;
        ctx.font = '10px sans-serif';
        ctx.fillText('...', x + 10, y + 3);
      } else {
        ctx.fillStyle = this.isDark ? '#444' : '#ccc';
        ctx.font = '10px sans-serif';
        ctx.fillText('—', x + 10, y + 3);
      }
    }

    // Sum display - show running average (sum / terms in sum)
    const sumY = startY + 5 * rowHeight + 5;
    ctx.fillStyle = this.isDark ? '#fff' : '#000';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';

    // Calculate terms actually in sum (during add_to_sum, latest product not yet added)
    const termsInSum = (phase === 'add_to_sum') ? products.length - 1 : products.length;

    if (phase === 'coeff_complete' || products.length === this.N) {
      const avg = divide(this.animState.accumulatedSum, this.N) as Complex;
      ctx.fillText(`Σ/${this.N} = ${this.formatPolar(avg)}`, width / 2, sumY);
    } else if (termsInSum > 0) {
      const avg = divide(this.animState.accumulatedSum, termsInSum) as Complex;
      ctx.fillText(`Σ/${termsInSum} = ${this.formatPolar(avg)}`, width / 2, sumY);
    }

    // Coefficients section - DC on top, then negative/positive columns
    const coeffSectionY = sumY + 24;
    ctx.fillStyle = this.isDark ? '#fff' : '#000';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Coefficients', width / 2, coeffSectionY);

    // Find max magnitude for coefficient scaling
    let maxCoeffMag = 0.01;
    for (const c of this.animState.finalCoefficients) {
      const mag = toReal(sqrt(c.re * c.re + c.im * c.im));
      if (mag > maxCoeffMag) maxCoeffMag = mag;
    }

    const coeffStartY = coeffSectionY + 14;
    const coeffRowHeight = 20;
    const coeffVectorScale = 16;

    // Helper to draw a coefficient vector
    const animState = this.animState; // Capture for closure
    const drawCoeffVector = (idx: number, x: number, y: number, label: string) => {
      ctx.fillStyle = this.isDark ? '#aaa' : '#555';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, x, y + 3);

      const labelWidth = label === 'DC:' ? 22 : 20;
      if (idx < animState.finalCoefficients.length) {
        const c = animState.finalCoefficients[idx];
        const scale = coeffVectorScale / maxCoeffMag;
        const vx = c.re * scale;
        const vy = -c.im * scale;
        const cx = x + labelWidth;
        const cy = y;

        ctx.strokeStyle = DFT_COLORS.finalCoeff;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + vx, cy + vy);
        ctx.stroke();

        const mag = toReal(sqrt(vx * vx + vy * vy));
        if (mag > 3) {
          const angle = number(atan2(vy, vx));
          const headLen = 4;
          const piOver6 = number(divide(PI, 6));
          ctx.fillStyle = DFT_COLORS.finalCoeff;
          ctx.beginPath();
          ctx.moveTo(cx + vx, cy + vy);
          ctx.lineTo(cx + vx - headLen * number(cos(angle - piOver6)), cy + vy - headLen * number(sin(angle - piOver6)));
          ctx.lineTo(cx + vx - headLen * number(cos(angle + piOver6)), cy + vy - headLen * number(sin(angle + piOver6)));
          ctx.closePath();
          ctx.fill();
        }
      } else if (idx === coeffN && phase === 'coeff_complete') {
        ctx.fillStyle = DFT_COLORS.accumulatedSum;
        ctx.font = '8px sans-serif';
        ctx.fillText('pending', x + labelWidth, y + 3);
      } else {
        ctx.fillStyle = this.isDark ? '#444' : '#ccc';
        ctx.font = '10px sans-serif';
        ctx.fillText('—', x + labelWidth, y + 3);
      }
    };

    // DC (index 0) on its own row, centered
    drawCoeffVector(0, width / 2 - 25, coeffStartY, 'DC:');

    // Negative frequencies (left column): -1, -2, -3, -4 (indices 1, 3, 5, 7)
    // Positive frequencies (right column): +1, +2, +3, +4 (indices 2, 4, 6, 8)
    for (let row = 0; row < 4; row++) {
      const y = coeffStartY + (row + 1) * coeffRowHeight;
      const negIdx = 1 + row * 2;  // 1, 3, 5, 7
      const posIdx = 2 + row * 2;  // 2, 4, 6, 8
      const negFreq = indexToFrequency(negIdx);
      const posFreq = indexToFrequency(posIdx);

      // Left column (negative)
      drawCoeffVector(negIdx, 5, y, `${negFreq}:`);
      // Right column (positive)
      drawCoeffVector(posIdx, width / 2 + 5, y, `+${posFreq}:`);
    }
  }

  resize(): void {
    this.setupMainCanvas();
    this.setupSideCanvas();
    this.render();
  }

  cleanup(): void {
    if (this.animationTimer !== null) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
    this.stopRotationAnimation();
    this.contourManager.detachEventListeners();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }
}

export const metadata: DemoMetadata = {
  title: 'DFT Computation',
  category: 'Complex Analysis',
  description: 'Visualize step-by-step how each Discrete Fourier Transform coefficient is computed.'
};

export default function initDFTComputationDemo(
  container: HTMLElement,
  config?: DemoConfig
): DemoInstance {
  const demo = new DFTComputationDemo(container, config);
  return demo.init();
}
