// DFT Coefficient Editor Demo
// Draw contours and interactively edit Fourier coefficients to see reconstruction

import { isDarkMode, getCssColors } from '@framework/demo-utils';
import { DemoInstance, DemoConfig, DemoMetadata } from '@framework/types';
import {
  createControlPanel,
  createButton,
  createControlRow,
  InfoDisplay
} from '@framework/ui-components';
import {
  complex, Complex, multiply, add,
  sqrt, number, floor
} from 'mathjs';
import { toReal, NumericResult } from './dft-shared';
import {
  Point2D,
  CanvasPlotUtils,
  ContourDrawingManager,
  indexToFrequency,
  pointsToComplex,
  calculateFourierCoefficients
} from './contour-shared';

// Color scheme for coefficient frequencies
const FREQ_COLORS: Record<number, string> = {
  0: '#FFFFFF',     // DC - white
  '-1': '#FF6B6B',  // -1 - red
  1: '#4ECDC4',     // +1 - cyan
  '-2': '#45B7D1',  // -2 - blue
  2: '#96CEB4',     // +2 - green
  '-3': '#FFEAA7',  // -3 - yellow
  3: '#DDA0DD',     // +3 - plum
  '-4': '#FF8C42',  // -4 - orange
  4: '#98D8C8',     // +4 - mint
  '-5': '#E056FD',  // -5 - magenta
  5: '#7BED9F',     // +5 - light green
  '-6': '#F8B500',  // -6 - gold
  6: '#70A1FF',     // +6 - light blue
  '-7': '#FF6348',  // -7 - coral
  7: '#2ED573',     // +7 - emerald
  '-8': '#FF9FF3',  // -8 - pink
  8: '#54A0FF',     // +8 - sky blue
  '-9': '#FFC312',  // -9 - sunflower
  9: '#A3CB38',     // +9 - lime
};

function getFreqColor(freq: number): string {
  return FREQ_COLORS[freq] ?? '#AAAAAA';
}

function getFreqLabel(freq: number): string {
  if (freq === 0) return 'c₀';
  if (freq < 0) return `c₋${Math.abs(freq)}`;
  return `c₊${freq}`;
}

type DemoMode = 'drawing' | 'editing';

class DFTEditorDemo implements DemoInstance {
  private container: HTMLElement;
  private contourCanvas!: HTMLCanvasElement;
  private contourCtx!: CanvasRenderingContext2D;
  private editorCanvas!: HTMLCanvasElement;
  private editorCtx!: CanvasRenderingContext2D;
  private controlPanel!: HTMLElement;
  private contourPlotUtils!: CanvasPlotUtils;
  private editorPlotUtils!: CanvasPlotUtils;
  private contourManager!: ContourDrawingManager;

  // State
  private isDark: boolean;
  private mode: DemoMode = 'drawing';
  private coefficients: Complex[] = [];
  private originalContourPoints: Point2D[] = [];
  private reconstructionPoints: Point2D[] = [];
  private selectedCoeffIndex: number | null = null;
  private isDragging = false;

  // UI elements
  private statusDisplay!: InfoDisplay;
  private shapeSelect!: HTMLSelectElement;
  private coeffSelect!: HTMLSelectElement;
  private magInput!: HTMLInputElement;
  private phaseInput!: HTMLInputElement;
  private coeffInputContainer!: HTMLElement;

  // Constants
  private readonly COEFF_COUNT = 19;  // c0, c-1, c+1, ... c-9, c+9
  private readonly SAMPLE_COUNT = 256;  // Dense sampling for accurate coefficients
  private readonly RECONSTRUCTION_SAMPLES = 256;
  private readonly CONTOUR_AXIS_RANGE = { min: -2.5, max: 2.5 };
  private readonly EDITOR_AXIS_RANGE = { min: -1.5, max: 1.5 };

  // Event handlers (for cleanup)
  private boundEditorMouseDown: (e: MouseEvent) => void;
  private boundEditorMouseMove: (e: MouseEvent) => void;
  private boundEditorMouseUp: (e: MouseEvent) => void;
  private boundEditorTouchStart: (e: TouchEvent) => void;
  private boundEditorTouchMove: (e: TouchEvent) => void;
  private boundEditorTouchEnd: (e: TouchEvent) => void;

  // Resize observer
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement, config?: DemoConfig) {
    this.container = container;
    this.isDark = isDarkMode(config || {});

    // Bind event handlers
    this.boundEditorMouseDown = this.handleEditorMouseDown.bind(this);
    this.boundEditorMouseMove = this.handleEditorMouseMove.bind(this);
    this.boundEditorMouseUp = this.handleEditorMouseUp.bind(this);
    this.boundEditorTouchStart = this.handleEditorTouchStart.bind(this);
    this.boundEditorTouchMove = this.handleEditorTouchMove.bind(this);
    this.boundEditorTouchEnd = this.handleEditorTouchEnd.bind(this);
  }

  init(): DemoInstance {
    this.setupUI();
    this.setupContourCanvas();
    this.setupEditorCanvas();
    this.setupContourManager();
    this.attachEditorEventListeners();
    this.setupResizeObserver();
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
    statusSpan.textContent = 'Draw a closed contour or select a shape';
    statusElement.appendChild(statusSpan);
    this.statusDisplay = {
      element: statusElement,
      update: (value: string) => { statusSpan.textContent = value; }
    };

    // Coefficient magnitude/phase inputs
    this.coeffInputContainer = document.createElement('div');
    this.coeffInputContainer.style.display = 'flex';
    this.coeffInputContainer.style.alignItems = 'center';
    this.coeffInputContainer.style.gap = '1rem';
    this.coeffInputContainer.style.opacity = '0.5';

    const magContainer = document.createElement('div');
    magContainer.style.display = 'flex';
    magContainer.style.alignItems = 'center';
    magContainer.style.gap = '0.25rem';
    const magLabel = document.createElement('label');
    magLabel.textContent = '|c| =';
    this.magInput = document.createElement('input');
    this.magInput.type = 'number';
    this.magInput.step = '0.01';
    this.magInput.min = '0';
    this.magInput.style.width = '70px';
    this.magInput.style.padding = '0.25rem';
    this.magInput.disabled = true;
    this.magInput.addEventListener('input', () => this.handleMagPhaseInput());
    magContainer.appendChild(magLabel);
    magContainer.appendChild(this.magInput);

    const phaseContainer = document.createElement('div');
    phaseContainer.style.display = 'flex';
    phaseContainer.style.alignItems = 'center';
    phaseContainer.style.gap = '0.25rem';
    const phaseLabel = document.createElement('label');
    phaseLabel.textContent = '∠ =';
    this.phaseInput = document.createElement('input');
    this.phaseInput.type = 'number';
    this.phaseInput.step = '1';
    this.phaseInput.style.width = '70px';
    this.phaseInput.style.padding = '0.25rem';
    this.phaseInput.disabled = true;
    this.phaseInput.addEventListener('input', () => this.handleMagPhaseInput());
    const degLabel = document.createElement('span');
    degLabel.textContent = '°';
    phaseContainer.appendChild(phaseLabel);
    phaseContainer.appendChild(this.phaseInput);
    phaseContainer.appendChild(degLabel);

    this.coeffInputContainer.appendChild(magContainer);
    this.coeffInputContainer.appendChild(phaseContainer);

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

    // Reset button
    const resetContainer = document.createElement('div');
    createButton('Reset', resetContainer, () => this.resetDemo());

    // Coefficient selector dropdown
    const coeffContainer = document.createElement('div');
    coeffContainer.style.display = 'flex';
    coeffContainer.style.alignItems = 'center';
    coeffContainer.style.gap = '0.5rem';
    const coeffLabel = document.createElement('label');
    coeffLabel.textContent = 'Edit:';
    this.coeffSelect = document.createElement('select');
    this.coeffSelect.style.padding = '0.25rem';
    this.coeffSelect.disabled = true; // Disabled until we have coefficients
    // Populate with coefficient options
    for (let i = 0; i < this.COEFF_COUNT; i++) {
      const freq = indexToFrequency(i);
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = getFreqLabel(freq);
      this.coeffSelect.appendChild(option);
    }
    this.coeffSelect.addEventListener('change', () => this.handleCoeffSelectChange());
    coeffContainer.appendChild(coeffLabel);
    coeffContainer.appendChild(this.coeffSelect);

    // Arrange controls
    const row0 = createControlRow([this.statusDisplay.element]);
    const row1 = createControlRow([shapeContainer, coeffContainer, resetContainer]);
    const row2 = createControlRow([this.coeffInputContainer]);

    this.controlPanel.appendChild(row0);
    this.controlPanel.appendChild(row1);
    this.controlPanel.appendChild(row2);

    // Canvas wrapper
    const canvasWrapper = document.createElement('div');
    canvasWrapper.style.display = 'flex';
    canvasWrapper.style.gap = '1rem';
    canvasWrapper.style.justifyContent = 'center';
    canvasWrapper.style.flexWrap = 'wrap';

    // Contour canvas container
    const contourContainer = document.createElement('div');
    contourContainer.style.width = '350px';
    contourContainer.style.maxWidth = '100%';
    contourContainer.style.aspectRatio = '1';
    contourContainer.style.position = 'relative';

    const contourLabel = document.createElement('div');
    contourLabel.textContent = 'Contour';
    contourLabel.style.textAlign = 'center';
    contourLabel.style.fontSize = '0.85em';
    contourLabel.style.marginBottom = '0.25rem';
    contourLabel.style.fontWeight = 'bold';
    contourContainer.appendChild(contourLabel);

    this.contourCanvas = document.createElement('canvas');
    this.contourCanvas.style.width = '100%';
    this.contourCanvas.style.aspectRatio = '1';
    this.contourCanvas.style.display = 'block';
    this.contourCanvas.style.touchAction = 'none';
    this.contourCanvas.style.cursor = 'crosshair';
    contourContainer.appendChild(this.contourCanvas);

    // Editor canvas container
    const editorContainer = document.createElement('div');
    editorContainer.style.width = '350px';
    editorContainer.style.maxWidth = '100%';
    editorContainer.style.aspectRatio = '1';
    editorContainer.style.position = 'relative';

    const editorLabel = document.createElement('div');
    editorLabel.textContent = 'Coefficients';
    editorLabel.style.textAlign = 'center';
    editorLabel.style.fontSize = '0.85em';
    editorLabel.style.marginBottom = '0.25rem';
    editorLabel.style.fontWeight = 'bold';
    editorContainer.appendChild(editorLabel);

    this.editorCanvas = document.createElement('canvas');
    this.editorCanvas.style.width = '100%';
    this.editorCanvas.style.aspectRatio = '1';
    this.editorCanvas.style.display = 'block';
    this.editorCanvas.style.touchAction = 'none';
    this.editorCanvas.style.cursor = 'grab';
    editorContainer.appendChild(this.editorCanvas);

    canvasWrapper.appendChild(contourContainer);
    canvasWrapper.appendChild(editorContainer);

    this.container.appendChild(canvasWrapper);
  }

  private setupContourCanvas(): void {
    const rect = this.contourCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.contourCanvas.width = rect.width * dpr;
    this.contourCanvas.height = rect.height * dpr;
    this.contourCtx = this.contourCanvas.getContext('2d')!;
    this.contourCtx.scale(dpr, dpr);

    this.contourPlotUtils = new CanvasPlotUtils(
      this.contourCanvas,
      this.contourCtx,
      this.CONTOUR_AXIS_RANGE,
      this.isDark
    );
  }

  private setupEditorCanvas(): void {
    const rect = this.editorCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.editorCanvas.width = rect.width * dpr;
    this.editorCanvas.height = rect.height * dpr;
    this.editorCtx = this.editorCanvas.getContext('2d')!;
    this.editorCtx.scale(dpr, dpr);

    this.editorPlotUtils = new CanvasPlotUtils(
      this.editorCanvas,
      this.editorCtx,
      this.EDITOR_AXIS_RANGE,
      this.isDark
    );
  }

  private setupContourManager(): void {
    this.contourManager = new ContourDrawingManager(
      this.contourCanvas,
      this.contourPlotUtils,
      {
        axisRange: this.CONTOUR_AXIS_RANGE,
        closeThresholdPixels: 8,
        isDark: this.isDark
      },
      {
        onStateChange: (state) => {
          if (state === 'drawing') {
            this.statusDisplay.update('Drawing...');
            this.shapeSelect.value = '';
          } else if (state === 'paused') {
            this.statusDisplay.update('Release near start to close, or continue drawing');
          }
          this.render();
        },
        onPointsChange: () => this.render(),
        onContourClosed: (points) => this.handleContourClosed(points)
      }
    );
    this.contourManager.attachEventListeners();
  }

  private attachEditorEventListeners(): void {
    this.editorCanvas.addEventListener('mousedown', this.boundEditorMouseDown);
    document.addEventListener('mousemove', this.boundEditorMouseMove);
    document.addEventListener('mouseup', this.boundEditorMouseUp);
    this.editorCanvas.addEventListener('touchstart', this.boundEditorTouchStart, { passive: false });
    this.editorCanvas.addEventListener('touchmove', this.boundEditorTouchMove, { passive: false });
    this.editorCanvas.addEventListener('touchend', this.boundEditorTouchEnd);
  }

  private detachEditorEventListeners(): void {
    this.editorCanvas.removeEventListener('mousedown', this.boundEditorMouseDown);
    document.removeEventListener('mousemove', this.boundEditorMouseMove);
    document.removeEventListener('mouseup', this.boundEditorMouseUp);
    this.editorCanvas.removeEventListener('touchstart', this.boundEditorTouchStart);
    this.editorCanvas.removeEventListener('touchmove', this.boundEditorTouchMove);
    this.editorCanvas.removeEventListener('touchend', this.boundEditorTouchEnd);
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.contourCanvas.parentElement!);
    this.resizeObserver.observe(this.editorCanvas.parentElement!);
  }

  private handleContourClosed(points: Point2D[]): void {
    this.originalContourPoints = points;
    this.mode = 'editing';
    this.contourCanvas.style.cursor = 'default';

    // Sample and compute coefficients
    const samplePoints = this.contourManager.getSamplePoints(this.SAMPLE_COUNT);
    const complexSamples = pointsToComplex(samplePoints);
    this.coefficients = calculateFourierCoefficients(complexSamples, this.COEFF_COUNT);

    // Enable coefficient selector and inputs, select first coefficient
    this.coeffSelect.disabled = false;
    this.coeffSelect.value = '0';
    this.selectedCoeffIndex = 0;
    this.magInput.disabled = false;
    this.phaseInput.disabled = false;
    this.coeffInputContainer.style.opacity = '1';

    // Compute reconstruction
    this.computeReconstruction();

    this.statusDisplay.update('Select a coefficient to edit, then drag it');
    this.updateCoeffDisplay();
    this.render();
  }

  private handleCoeffSelectChange(): void {
    const index = parseInt(this.coeffSelect.value, 10);
    this.selectedCoeffIndex = index;
    this.updateCoeffDisplay();
    this.render();
  }

  private computeReconstruction(): void {
    this.reconstructionPoints = [];
    for (let i = 0; i <= this.RECONSTRUCTION_SAMPLES; i++) {
      const t = (2 * Math.PI * i) / this.RECONSTRUCTION_SAMPLES;
      this.reconstructionPoints.push(this.reconstructAt(t));
    }
  }

  private reconstructAt(t: number): Point2D {
    // z(t) = sum of c_f * e^(i * f * t) for each coefficient
    let sumRe = 0;
    let sumIm = 0;

    for (let n = 0; n < this.coefficients.length; n++) {
      const freq = indexToFrequency(n);
      const c = this.coefficients[n];
      const angle = freq * t;
      const rotRe = Math.cos(angle);
      const rotIm = Math.sin(angle);

      // c * e^(i*f*t) = (c.re + i*c.im)(rotRe + i*rotIm)
      sumRe += c.re * rotRe - c.im * rotIm;
      sumIm += c.re * rotIm + c.im * rotRe;
    }

    return { x: sumRe, y: sumIm };
  }

  private getCanvasCoords(e: MouseEvent | Touch, canvas: HTMLCanvasElement): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  private handleEditorMouseDown(e: MouseEvent): void {
    if (this.mode !== 'editing' || this.selectedCoeffIndex === null) return;

    const coords = this.getCanvasCoords(e, this.editorCanvas);
    // Only test against the selected coefficient
    if (this.hitTestSelectedCoefficient(coords.x, coords.y)) {
      this.isDragging = true;
      this.editorCanvas.style.cursor = 'grabbing';
    }
  }

  private hitTestSelectedCoefficient(canvasX: number, canvasY: number): boolean {
    if (this.selectedCoeffIndex === null || this.coefficients.length === 0) return false;

    const coeff = this.coefficients[this.selectedCoeffIndex];
    const coeffCanvas = this.editorPlotUtils.plotToCanvas({ x: coeff.re, y: coeff.im });
    const dx = canvasX - coeffCanvas.x;
    const dy = canvasY - coeffCanvas.y;
    const distSq = dx * dx + dy * dy;

    // Use a larger hit radius for easier grabbing
    const hitRadius = 20;
    return distSq <= hitRadius * hitRadius;
  }

  private handleEditorMouseMove(e: MouseEvent): void {
    if (!this.isDragging || this.selectedCoeffIndex === null) return;

    const coords = this.getCanvasCoords(e, this.editorCanvas);
    const plotPoint = this.editorPlotUtils.canvasToPlot(coords.x, coords.y);

    // Clamp to axis range
    const range = this.EDITOR_AXIS_RANGE;
    const clampedX = Math.max(range.min, Math.min(range.max, plotPoint.x));
    const clampedY = Math.max(range.min, Math.min(range.max, plotPoint.y));

    this.coefficients[this.selectedCoeffIndex] = complex(clampedX, clampedY);
    this.computeReconstruction();
    this.updateCoeffDisplay();
    this.render();
  }

  private handleEditorMouseUp(_e: MouseEvent): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.editorCanvas.style.cursor = 'grab';
    }
  }

  private handleEditorTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (this.mode !== 'editing' || this.selectedCoeffIndex === null || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const coords = this.getCanvasCoords(touch, this.editorCanvas);
    // Only test against the selected coefficient
    if (this.hitTestSelectedCoefficient(coords.x, coords.y)) {
      this.isDragging = true;
    }
  }

  private handleEditorTouchMove(e: TouchEvent): void {
    e.preventDefault();
    if (!this.isDragging || this.selectedCoeffIndex === null || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const coords = this.getCanvasCoords(touch, this.editorCanvas);
    const plotPoint = this.editorPlotUtils.canvasToPlot(coords.x, coords.y);

    const range = this.EDITOR_AXIS_RANGE;
    const clampedX = Math.max(range.min, Math.min(range.max, plotPoint.x));
    const clampedY = Math.max(range.min, Math.min(range.max, plotPoint.y));

    this.coefficients[this.selectedCoeffIndex] = complex(clampedX, clampedY);
    this.computeReconstruction();
    this.updateCoeffDisplay();
    this.render();
  }

  private handleEditorTouchEnd(e: TouchEvent): void {
    e.preventDefault();
    if (this.isDragging) {
      this.isDragging = false;
    }
  }

  private updateCoeffDisplay(): void {
    if (this.selectedCoeffIndex === null || this.coefficients.length === 0) {
      this.magInput.value = '';
      this.phaseInput.value = '';
      return;
    }

    const c = this.coefficients[this.selectedCoeffIndex];
    const mag = toReal(sqrt(add(multiply(c.re, c.re), multiply(c.im, c.im))) as NumericResult);
    const phase = Math.atan2(c.im, c.re) * (180 / Math.PI);

    this.magInput.value = mag.toFixed(3);
    this.phaseInput.value = phase.toFixed(1);
  }

  private handleMagPhaseInput(): void {
    if (this.selectedCoeffIndex === null) return;

    const mag = parseFloat(this.magInput.value);
    const phaseDeg = parseFloat(this.phaseInput.value);

    if (isNaN(mag) || isNaN(phaseDeg)) return;

    // Convert polar to cartesian
    const phaseRad = phaseDeg * (Math.PI / 180);
    const re = mag * Math.cos(phaseRad);
    const im = mag * Math.sin(phaseRad);

    this.coefficients[this.selectedCoeffIndex] = complex(re, im);
    this.computeReconstruction();
    this.render();
  }

  private handleShapeChange(): void {
    const shape = this.shapeSelect.value;
    if (!shape) return;

    this.resetDemo();

    // Generate points and close contour
    const points = this.generateShapePoints(shape);
    if (points.length > 0) {
      this.contourManager.setPointsAndClose(points);
    }
  }

  private generateShapePoints(shape: string): Point2D[] {
    const radius = 1;
    const numPoints = 360;

    switch (shape) {
      case 'circle':
        return this.generateCirclePoints(radius, numPoints);
      case 'upper-semicircle':
        return this.generateSemicirclePoints(radius, numPoints, true);
      case 'lower-semicircle':
        return this.generateSemicirclePoints(radius, numPoints, false);
      default:
        return [];
    }
  }

  private generateCirclePoints(radius: number, numPoints: number): Point2D[] {
    const points: Point2D[] = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (2 * Math.PI * i) / numPoints;
      points.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      });
    }
    return points;
  }

  private generateSemicirclePoints(radius: number, numPoints: number, upper: boolean): Point2D[] {
    const points: Point2D[] = [];
    const arcPoints = number(floor(numPoints * 0.8));
    const linePoints = numPoints - arcPoints;

    if (upper) {
      // Arc from (radius, 0) to (-radius, 0) via top
      for (let i = 0; i <= arcPoints; i++) {
        const angle = (Math.PI * i) / arcPoints;
        points.push({
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle)
        });
      }
      // Line back
      for (let i = 1; i < linePoints; i++) {
        const t = i / linePoints;
        points.push({ x: -radius + 2 * radius * t, y: 0 });
      }
    } else {
      // Arc from (-radius, 0) to (radius, 0) via bottom
      for (let i = 0; i <= arcPoints; i++) {
        const angle = Math.PI + (Math.PI * i) / arcPoints;
        points.push({
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle)
        });
      }
      // Line back
      for (let i = 1; i < linePoints; i++) {
        const t = i / linePoints;
        points.push({ x: radius - 2 * radius * t, y: 0 });
      }
    }

    return points;
  }

  private resetDemo(): void {
    this.contourManager.reset();
    this.mode = 'drawing';
    this.coefficients = [];
    this.originalContourPoints = [];
    this.reconstructionPoints = [];
    this.selectedCoeffIndex = null;
    this.isDragging = false;
    this.contourCanvas.style.cursor = 'crosshair';
    this.editorCanvas.style.cursor = 'grab';
    this.statusDisplay.update('Draw a closed contour or select a shape');
    this.shapeSelect.value = '';
    this.coeffSelect.disabled = true;
    this.coeffSelect.value = '0';
    this.magInput.disabled = true;
    this.magInput.value = '';
    this.phaseInput.disabled = true;
    this.phaseInput.value = '';
    this.coeffInputContainer.style.opacity = '0.5';
    this.render();
  }

  private render(): void {
    this.renderContourCanvas();
    this.renderEditorCanvas();
  }

  private renderContourCanvas(): void {
    this.contourPlotUtils.clearAndFillBackground();
    this.contourPlotUtils.renderGridAndAxes();

    const cssColors = getCssColors(this.isDark);

    if (this.mode === 'drawing') {
      // Draw the contour being drawn
      const contourState = this.contourManager.getState();
      if (contourState !== 'idle') {
        this.contourManager.renderContour(cssColors.warning, true);
      }
    } else {
      // Show original contour (faded) and reconstruction (bright)
      if (this.originalContourPoints.length > 0) {
        const ctx = this.contourPlotUtils.getContext();
        ctx.strokeStyle = this.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < this.originalContourPoints.length; i++) {
          const pt = this.contourPlotUtils.plotToCanvas(this.originalContourPoints[i]);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      // Draw reconstruction
      if (this.reconstructionPoints.length > 0) {
        const ctx = this.contourPlotUtils.getContext();
        ctx.strokeStyle = cssColors.accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < this.reconstructionPoints.length; i++) {
          const pt = this.contourPlotUtils.plotToCanvas(this.reconstructionPoints[i]);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }
    }
  }

  private renderEditorCanvas(): void {
    this.editorPlotUtils.clearAndFillBackground();
    this.editorPlotUtils.renderGridAndAxes();

    // Draw unit circle for reference
    this.editorPlotUtils.drawUnitCircle(0, 0, this.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)');

    if (this.coefficients.length === 0) {
      // Placeholder text
      const ctx = this.editorPlotUtils.getContext();
      ctx.fillStyle = this.isDark ? '#888' : '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      const rect = this.editorCanvas.getBoundingClientRect();
      ctx.fillText('Draw a contour to see', rect.width / 2, rect.height / 2 - 10);
      ctx.fillText('Fourier coefficients', rect.width / 2, rect.height / 2 + 10);
      return;
    }

    // Draw coefficients as draggable points
    for (let i = 0; i < this.coefficients.length; i++) {
      this.renderCoefficient(i);
    }

    // Draw selected coefficient last (on top)
    if (this.selectedCoeffIndex !== null) {
      this.renderCoefficient(this.selectedCoeffIndex, true);
    }
  }

  private renderCoefficient(index: number, forceHighlight = false): void {
    if (index === this.selectedCoeffIndex && !forceHighlight) return; // Will be drawn last

    const coeff = this.coefficients[index];
    const freq = indexToFrequency(index);
    const color = getFreqColor(freq);
    const isSelected = index === this.selectedCoeffIndex;

    const pt: Point2D = { x: coeff.re, y: coeff.im };
    const canvasPt = this.editorPlotUtils.plotToCanvas(pt);

    const ctx = this.editorPlotUtils.getContext();

    // Non-selected coefficients are very faint
    if (!isSelected) {
      ctx.globalAlpha = 0.15;
    }

    // Draw selection ring if selected
    if (isSelected) {
      ctx.strokeStyle = this.isDark ? '#fff' : '#000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(canvasPt.x, canvasPt.y, 14, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw vector from origin to coefficient
    this.editorPlotUtils.drawVector({ x: 0, y: 0 }, pt, color, 2);

    // Draw the coefficient point
    const radius = isSelected ? 10 : 6;
    this.editorPlotUtils.drawPoint(pt, radius, color, this.isDark ? '#fff' : '#000', isSelected ? 2 : 1);

    // Draw label (only for selected)
    if (isSelected) {
      const label = getFreqLabel(freq);
      this.editorPlotUtils.drawText(label, pt, {
        offsetX: 15,
        offsetY: -10,
        fontSize: 11,
        color: color
      });
    }

    // Reset alpha
    ctx.globalAlpha = 1;
  }

  resize(): void {
    this.setupContourCanvas();
    this.setupEditorCanvas();
    this.render();
  }

  cleanup(): void {
    this.contourManager.detachEventListeners();
    this.detachEditorEventListeners();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}

export const metadata: DemoMetadata = {
  title: 'DFT Coefficient Editor',
  category: 'Complex Analysis',
  description: 'Draw contours and interactively edit Fourier coefficients to see how they affect the reconstructed shape.'
};

export default function initDFTEditorDemo(
  container: HTMLElement,
  config?: DemoConfig
): DemoInstance {
  const demo = new DFTEditorDemo(container, config);
  return demo.init();
}
