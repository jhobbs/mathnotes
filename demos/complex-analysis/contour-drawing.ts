import { isDarkMode, getCssColors } from '@framework/demo-utils';
import { DemoInstance, DemoConfig, DemoMetadata } from '@framework/types';
import {
  createControlPanel,
  createButton,
  createInfoDisplay,
  createControlRow,
  InfoDisplay
} from '@framework/ui-components';
// @ts-ignore
import Plotly from 'plotly.js-dist-min';
import { complex, Complex, multiply, add, divide } from 'mathjs';

interface Point2D {
  x: number;
  y: number;
}


type DrawingState = 'idle' | 'drawing' | 'paused' | 'closed';

class ContourDrawingDemo implements DemoInstance {
  private container: HTMLElement;
  private plotDiv!: HTMLElement;
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
  private samplePointCount = 11;
  private closeThresholdPixels = 8; // Auto-close if within this many pixels of start (marker radius 7 + border 1)
  private readonly VECTOR_COLORS = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8',
    '#f58231', '#911eb4', '#42d4f4', '#f032e6',
    '#bfef45', '#fabed4', '#469990', '#dcbeff',
    '#9a6324', '#fffac8', '#800000', '#aaffc3'
  ];
  private readonly ANIMATION_FRAME_COUNT = 150;

  // Cached layout for Plotly.react
  private currentLayout: any;
  private plotConfig: any;

  // UI displays
  private statusDisplay!: InfoDisplay;
  private pointsDisplay!: InfoDisplay;
  private nInput!: HTMLInputElement;
  private nError!: HTMLSpanElement;

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
    this.setupPlot();
    this.attachEventListeners();
    this.setupResizeObserver();
    return this;
  }

  private setupUI(): void {
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.gap = 'var(--spacing-md, 1rem)';

    // Control panel
    this.controlPanel = createControlPanel(this.container);

    // Reset button
    const resetButton = createButton('Reset', document.createElement('div'), () => this.resetDrawing());

    // Status and points displays
    this.statusDisplay = createInfoDisplay('Status', 'Draw a closed loop (end at start)');
    this.pointsDisplay = createInfoDisplay('Points', '0');

    // N input for number of sample points (highest frequency is N/2)
    this.nInput = this.createNumberInput('N =', this.samplePointCount, 2, 64, 1, () => this.handleNChange());

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

    // Arrange controls
    const row1 = createControlRow([resetButton, this.statusDisplay.element, this.pointsDisplay.element]);
    const row2 = createControlRow([this.nInput.parentElement!, nNote, this.nError]);

    this.controlPanel.appendChild(row1);
    this.controlPanel.appendChild(row2);

    // Plot container
    this.plotDiv = document.createElement('div');
    this.plotDiv.style.width = '100%';
    this.plotDiv.style.height = '500px';
    this.plotDiv.style.touchAction = 'none'; // Prevent browser gestures
    this.plotDiv.style.cursor = 'crosshair';
    this.container.appendChild(this.plotDiv);
  }

  private setupPlot(): void {
    const zerolineColor = this.isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
    const gridColor = this.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';

    this.currentLayout = {
      xaxis: {
        range: [this.axisRange.min, this.axisRange.max],
        zeroline: true,
        zerolinewidth: 2,
        zerolinecolor: zerolineColor,
        gridcolor: gridColor,
        fixedrange: true,
        constrain: 'domain',
        scaleanchor: 'y',
        scaleratio: 1,
        title: 'Re(z)'
      },
      yaxis: {
        range: [this.axisRange.min, this.axisRange.max],
        zeroline: true,
        zerolinewidth: 2,
        zerolinecolor: zerolineColor,
        gridcolor: gridColor,
        fixedrange: true,
        constrain: 'domain',
        title: 'Im(z)'
      },
      dragmode: false,
      paper_bgcolor: 'transparent',
      plot_bgcolor: this.isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)',
      font: { color: this.isDark ? '#fff' : '#000' },
      margin: { l: 50, r: 50, t: 20, b: 50 },
      showlegend: false,
      uirevision: 'constant'
    };

    this.plotConfig = {
      responsive: true,
      displayModeBar: false,
      staticPlot: false
    };

    Plotly.newPlot(this.plotDiv, this.getPlotData(), this.currentLayout, this.plotConfig);
  }

  private getPlotData(): any[] {
    const traces: any[] = [];

    if (this.points.length > 0) {
      const cssColors = getCssColors(this.isDark);
      // Main contour line
      const lineColor = this.state === 'closed' ? cssColors.warning : cssColors.error;
      traces.push({
        x: this.points.map(p => p.x),
        y: this.points.map(p => p.y),
        mode: 'lines',
        type: 'scatter',
        line: {
          color: lineColor,
          width: 3,
          simplify: false
        },
        hoverinfo: 'skip'
      });

      // Start point marker
      traces.push({
        x: [this.points[0].x],
        y: [this.points[0].y],
        mode: 'markers',
        type: 'scatter',
        marker: {
          size: 14,
          color: '#f39c12',
          symbol: 'circle',
          line: { color: this.isDark ? '#fff' : '#000', width: 1 }
        },
        hoverinfo: 'skip'
      });

      // Sample points - only when closed
      if (this.state === 'closed') {
        const samplePoints = this.getSamplePoints();
        if (samplePoints.length > 1) {
          traces.push({
            x: samplePoints.map(p => p.x),
            y: samplePoints.map(p => p.y),
            mode: 'markers',
            type: 'scatter',
            marker: {
              size: 8,
              color: '#ffffff',
              line: { color: '#000000', width: 2 }
            },
            hoverinfo: 'skip'
          });
        }

        // Draw Fourier coefficient vectors tip-to-tail for current animation frame
        // Trace order: trail (trace 3), then 8 vector traces (traces 4-11)
        if (this.animationVectors.length > 0) {
          // Trail trace - initially empty, will be updated via restyle
          traces.push({
            x: this.trailX.slice(0, this.currentFrameIndex + 1),
            y: this.trailY.slice(0, this.currentFrameIndex + 1),
            mode: 'lines',
            type: 'scatter',
            line: { color: cssColors.success, width: 2 },
            hoverinfo: 'skip'
          });

          // Vector traces for current frame
          const frameVectors = this.animationVectors[this.currentFrameIndex];
          let currentX = 0;
          let currentY = 0;

          for (let i = 0; i < frameVectors.length; i++) {
            const v = frameVectors[i];
            const nextX = currentX + v.re;
            const nextY = currentY + v.im;
            const color = this.VECTOR_COLORS[i % this.VECTOR_COLORS.length];

            traces.push({
              x: [currentX, nextX],
              y: [currentY, nextY],
              mode: 'lines+markers',
              type: 'scatter',
              line: { color, width: 2 },
              marker: { size: [0, 6], color },
              hoverinfo: 'skip'
            });

            currentX = nextX;
            currentY = nextY;
          }
        }
      }
    }

    return traces;
  }

  private updatePlot(): void {
    Plotly.react(this.plotDiv, this.getPlotData(), this.currentLayout, this.plotConfig);
  }

  private attachEventListeners(): void {
    this.plotDiv.addEventListener('mousedown', this.boundMouseDown);
    this.plotDiv.addEventListener('mousemove', this.boundMouseMove);
    this.plotDiv.addEventListener('mouseup', this.boundMouseUp);
    this.plotDiv.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    this.plotDiv.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    this.plotDiv.addEventListener('touchend', this.boundTouchEnd);
  }

  private detachEventListeners(): void {
    this.plotDiv.removeEventListener('mousedown', this.boundMouseDown);
    this.plotDiv.removeEventListener('mousemove', this.boundMouseMove);
    this.plotDiv.removeEventListener('mouseup', this.boundMouseUp);
    this.plotDiv.removeEventListener('touchstart', this.boundTouchStart);
    this.plotDiv.removeEventListener('touchmove', this.boundTouchMove);
    this.plotDiv.removeEventListener('touchend', this.boundTouchEnd);
  }

  private pixelToPlot(clientX: number, clientY: number): Point2D | null {
    const fullLayout = (this.plotDiv as any)._fullLayout;
    if (!fullLayout || !fullLayout.xaxis || !fullLayout.yaxis) return null;

    const rect = this.plotDiv.getBoundingClientRect();
    const xaxis = fullLayout.xaxis;
    const yaxis = fullLayout.yaxis;

    // Use Plotly's internal offset and length which account for constrain: 'domain'
    const plotLeft = xaxis._offset;
    const plotTop = yaxis._offset;
    const plotWidth = xaxis._length;
    const plotHeight = yaxis._length;

    // Convert to plot-relative coordinates
    const relX = clientX - rect.left - plotLeft;
    const relY = clientY - rect.top - plotTop;

    // Check bounds
    if (relX < 0 || relX > plotWidth || relY < 0 || relY > plotHeight) {
      return null;
    }

    // Map to axis ranges (y is inverted)
    const xRange = xaxis.range;
    const yRange = yaxis.range;
    const plotX = xRange[0] + (relX / plotWidth) * (xRange[1] - xRange[0]);
    const plotY = yRange[1] - (relY / plotHeight) * (yRange[1] - yRange[0]);

    return { x: plotX, y: plotY };
  }

  private pixelsToPlotUnits(pixels: number): number {
    const fullLayout = (this.plotDiv as any)._fullLayout;
    if (!fullLayout || !fullLayout.xaxis) return 0.1; // fallback

    const plotWidth = fullLayout.xaxis._length;
    const xRange = fullLayout.xaxis.range;
    const unitsPerPixel = (xRange[1] - xRange[0]) / plotWidth;
    return pixels * unitsPerPixel;
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

    // Resume from paused doesn't require clicking in plot area
    if (this.state === 'paused') {
      this.resumeDrawing();
      return;
    }

    const point = this.pixelToPlot(e.clientX, e.clientY);
    if (!point) return;

    if (this.state === 'idle') {
      this.startDrawing(point);
    } else if (this.state === 'drawing') {
      this.endDrawing();
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.state !== 'drawing') return;

    const point = this.pixelToPlot(e.clientX, e.clientY);
    if (!point) return;

    this.continueDrawing(point);
  }

  private handleMouseUp(_e: MouseEvent): void {
    // No-op for click-drag-click mode
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
    this.statusDisplay.update('Drawing... move mouse');
    this.pointsDisplay.update('1');
    this.updatePlot();
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
    this.updatePlot();
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
      this.updatePlot();
    }
  }

  private closeContour(): void {
    const startPoint = this.points[0];

    // Just add the start point to close the loop
    this.points.push({ ...startPoint });

    this.state = 'closed';
    this.statusDisplay.update('Contour closed');
    this.pointsDisplay.update(String(this.points.length));
    this.updatePlot();

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

      for (let n = 0; n < N; n++) {
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
    this.updatePlot(); // Initial setup with all traces

    this.animationTimer = window.setInterval(() => {
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.ANIMATION_FRAME_COUNT;
      this.updateAnimatedTraces();
    }, 16);
  }

  private updateAnimatedTraces(): void {
    const frameIdx = this.currentFrameIndex;

    // Trail: slice precomputed arrays up to current frame (inclusive)
    const trailXSlice = this.trailX.slice(0, frameIdx + 1);
    const trailYSlice = this.trailY.slice(0, frameIdx + 1);

    // Vectors for current frame
    const frameVectors = this.animationVectors[frameIdx];
    const vectorXs: number[][] = [];
    const vectorYs: number[][] = [];

    let currentX = 0;
    let currentY = 0;
    for (const v of frameVectors) {
      const nextX = currentX + v.re;
      const nextY = currentY + v.im;
      vectorXs.push([currentX, nextX]);
      vectorYs.push([currentY, nextY]);
      currentX = nextX;
      currentY = nextY;
    }

    // Update trail (trace 3) and vectors (traces 4 to 3+N)
    const N = frameVectors.length;
    const traceIndices = [3, ...Array.from({ length: N }, (_, i) => 4 + i)];
    Plotly.restyle(this.plotDiv, {
      x: [trailXSlice, ...vectorXs],
      y: [trailYSlice, ...vectorYs]
    }, traceIndices);
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
    this.statusDisplay.update('Draw a closed loop (end at start)');
    this.pointsDisplay.update('0');
    this.updatePlot();
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
    if (value > 64) {
      this.nError.textContent = 'Max is 64';
      this.nError.style.display = 'inline';
      return;
    }
    this.nError.style.display = 'none';
    this.samplePointCount = value;
    this.recalculateFromContour();
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
    this.resizeObserver.observe(this.container);
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
    Plotly.purge(this.plotDiv);
  }

  resize(): void {
    if (this.plotDiv) {
      Plotly.Plots.resize(this.plotDiv);
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
