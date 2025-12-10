import { isDarkMode } from '@framework/demo-utils';
import { DemoInstance, DemoConfig, DemoMetadata } from '@framework/types';
import {
  createControlPanel,
  createRadioGroup,
  createButton,
  createInfoDisplay,
  createControlRow,
  InfoDisplay
} from '@framework/ui-components';
// @ts-ignore
import Plotly from 'plotly.js-dist-min';

interface Point2D {
  x: number;
  y: number;
}

type DrawingMode = 'click-drag-click' | 'freehand';
type DrawingState = 'idle' | 'drawing' | 'paused' | 'closed';

class ContourDrawingDemo implements DemoInstance {
  private container: HTMLElement;
  private plotDiv!: HTMLElement;
  private controlPanel!: HTMLElement;

  // State
  private mode: DrawingMode = 'click-drag-click';
  private state: DrawingState = 'idle';
  private points: Point2D[] = [];
  private isDark: boolean;

  // Configuration
  private axisRange = { min: -5, max: 5 };
  private closeThresholdPixels = 7; // Auto-close if within this many pixels of start (matches start marker radius)

  // Cached layout for Plotly.react
  private currentLayout: any;
  private plotConfig: any;

  // UI displays
  private statusDisplay!: InfoDisplay;
  private pointsDisplay!: InfoDisplay;

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

    // Mode selection
    const modeRadio = createRadioGroup<DrawingMode>(
      'contour-drawing-mode',
      [
        { value: 'click-drag-click', label: 'Click-Drag-Click' },
        { value: 'freehand', label: 'Freehand (Touch)' }
      ],
      this.mode,
      (mode) => this.setMode(mode)
    );

    // Reset button
    const resetButton = createButton('Reset', document.createElement('div'), () => this.resetDrawing());

    // Status and points displays
    this.statusDisplay = createInfoDisplay('Status', 'Click to start drawing');
    this.pointsDisplay = createInfoDisplay('Points', '0');

    // Arrange controls
    const row1 = createControlRow([modeRadio, resetButton]);
    const row2 = createControlRow([this.statusDisplay.element, this.pointsDisplay.element]);

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
      // Main contour line
      const lineColor = this.state === 'closed' ? '#27ae60' : '#e74c3c';
      traces.push({
        x: this.points.map(p => p.x),
        y: this.points.map(p => p.y),
        mode: 'lines',
        type: 'scatter',
        line: {
          color: lineColor,
          width: 2
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

  private handleMouseDown(e: MouseEvent): void {
    if (this.state === 'closed') return;

    // Resume from paused doesn't require clicking in plot area
    if (this.state === 'paused') {
      this.resumeDrawing();
      return;
    }

    const point = this.pixelToPlot(e.clientX, e.clientY);
    if (!point) return;

    if (this.mode === 'click-drag-click') {
      if (this.state === 'idle') {
        this.startDrawing(point);
      } else if (this.state === 'drawing') {
        this.endDrawing();
      }
    } else {
      // Freehand mode - start on mousedown
      if (this.state === 'idle') {
        this.startDrawing(point);
      }
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.state !== 'drawing') return;

    const point = this.pixelToPlot(e.clientX, e.clientY);
    if (!point) return;

    this.continueDrawing(point);
  }

  private handleMouseUp(_e: MouseEvent): void {
    if (this.mode === 'freehand' && this.state === 'drawing') {
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
    this.statusDisplay.update('Drawing... move mouse');
    this.pointsDisplay.update('1');
    this.updatePlot();
  }

  private continueDrawing(point: Point2D): void {
    this.points.push(point);
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
      // Close the contour
      this.points.push({ ...startPoint });
      this.state = 'closed';
      this.statusDisplay.update('Contour closed');
      this.pointsDisplay.update(String(this.points.length));
    } else {
      // Pause - can be resumed
      this.state = 'paused';
      this.statusDisplay.update('Paused - click to continue');
    }
    this.updatePlot();
  }

  private resumeDrawing(): void {
    this.state = 'drawing';
    this.statusDisplay.update('Drawing... move mouse');
  }

  private resetDrawing(): void {
    this.points = [];
    this.state = 'idle';
    this.statusDisplay.update('Click to start drawing');
    this.pointsDisplay.update('0');
    this.updatePlot();
  }

  private setMode(mode: DrawingMode): void {
    this.mode = mode;
    if (this.state === 'drawing') {
      // Reset if switching modes mid-draw
      this.resetDrawing();
    }
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
