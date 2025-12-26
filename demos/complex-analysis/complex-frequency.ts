// Complex Frequency Demo
// Visualizes complex exponentials A * e^(i*(ωt + φ)) with rotating phasor and wave projections

import { isDarkMode } from '@framework/demo-utils';
import { DemoInstance, DemoConfig, DemoMetadata } from '@framework/types';
import {
  createControlPanel,
  createCheckbox,
  createControlRow,
  createNumberInput,
  NumberInputResult
} from '@framework/ui-components';
import { CanvasPlotUtils } from './contour-shared';
import { AnimationTimer, setupResizeObserver } from './dft-shared';

class ComplexFrequencyDemo implements DemoInstance {
  private container: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private controlPanel!: HTMLElement;
  private plotUtils!: CanvasPlotUtils;

  // State
  private isDark: boolean;
  private amplitude = 1;
  private phase = 0;
  private frequency = 1;
  private time = 0;

  // Visibility toggles
  private showReal = true;
  private showImaginary = true;
  private showSum = true;

  // Animation
  private animationTimer = new AnimationTimer();
  private readonly FRAME_DELAY = 16;  // ~60fps

  // UI elements
  private amplitudeInput!: NumberInputResult;
  private phaseInput!: NumberInputResult;
  private frequencyInput!: NumberInputResult;

  // Resize handling
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement, config?: DemoConfig) {
    this.container = container;
    this.isDark = isDarkMode(config || {});
  }

  init(): DemoInstance {
    this.setupUI();
    this.setupCanvas();
    this.setupResizeObserverInternal();
    this.startAnimation();
    return this;
  }

  private setupUI(): void {
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.gap = 'var(--spacing-md, 1rem)';

    // Control panel
    this.controlPanel = createControlPanel(this.container);

    // Amplitude input
    this.amplitudeInput = createNumberInput(
      'Amplitude',
      this.amplitude,
      0,
      3,
      0.1,
      () => this.handleAmplitudeChange(),
      this.isDark
    );

    // Phase input (in units of π)
    this.phaseInput = createNumberInput(
      'Phase (×π)',
      0,
      -2,
      2,
      0.1,
      () => this.handlePhaseChange(),
      this.isDark
    );

    // Frequency input
    this.frequencyInput = createNumberInput(
      'Frequency',
      this.frequency,
      0.1,
      5,
      0.1,
      () => this.handleFrequencyChange(),
      this.isDark
    );

    // Visibility checkboxes
    const showRealCheckbox = createCheckbox(
      'Show Real (cos)',
      this.showReal,
      (checked) => { this.showReal = checked; }
    );

    const showImagCheckbox = createCheckbox(
      'Show Imaginary (sin)',
      this.showImaginary,
      (checked) => { this.showImaginary = checked; }
    );

    const showSumCheckbox = createCheckbox(
      'Show Sum (phasor)',
      this.showSum,
      (checked) => { this.showSum = checked; }
    );

    // Arrange controls
    const row1 = createControlRow([
      this.amplitudeInput.container,
      this.phaseInput.container,
      this.frequencyInput.container
    ]);
    const row2 = createControlRow([showRealCheckbox, showImagCheckbox, showSumCheckbox]);

    this.controlPanel.appendChild(row1);
    this.controlPanel.appendChild(row2);

    // Canvas container
    const canvasWrapper = document.createElement('div');
    canvasWrapper.style.width = '600px';
    canvasWrapper.style.maxWidth = '100%';
    canvasWrapper.style.aspectRatio = '1';
    canvasWrapper.style.position = 'relative';
    canvasWrapper.style.margin = '0 auto';

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.aspectRatio = '1';
    this.canvas.style.display = 'block';
    canvasWrapper.appendChild(this.canvas);

    this.container.appendChild(canvasWrapper);
  }

  private setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    const ctx = this.canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // Use a simple axis range for the phasor area
    this.plotUtils = new CanvasPlotUtils(
      this.canvas,
      ctx,
      { min: -3, max: 3 },
      this.isDark
    );
  }

  private handleAmplitudeChange(): void {
    const value = parseFloat(this.amplitudeInput.input.value);
    if (!isNaN(value) && value >= 0 && value <= 3) {
      this.amplitude = value;
    }
  }

  private handlePhaseChange(): void {
    const value = parseFloat(this.phaseInput.input.value);
    if (!isNaN(value) && value >= -2 && value <= 2) {
      this.phase = value * Math.PI;
    }
  }

  private handleFrequencyChange(): void {
    const value = parseFloat(this.frequencyInput.input.value);
    if (!isNaN(value) && value >= 0.1 && value <= 5) {
      this.frequency = value;
    }
  }

  private startAnimation(): void {
    this.animationTimer.start(() => this.animate(), this.FRAME_DELAY);
  }

  private animate(): void {
    // Advance time
    this.time += 0.03 * this.frequency;
    this.render();
  }

  private render(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const ctx = this.plotUtils.getContext();

    // Clear canvas
    ctx.fillStyle = this.isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(0, 0, width, height);

    // Everything centered and overlaid
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Current values (computed analytically)
    const currentRe = this.amplitude * Math.cos(this.time + this.phase);
    const currentIm = this.amplitude * Math.sin(this.time + this.phase);

    // Scale factor for plotting
    const scale = radius / Math.max(this.amplitude, 1);

    // Current phasor position
    const phasorX = centerX + currentRe * scale;
    const phasorY = centerY - currentIm * scale;  // Flip Y for canvas

    // Draw unit circle (scaled by amplitude)
    ctx.strokeStyle = this.isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.amplitude * scale, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw axes
    ctx.strokeStyle = this.isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    // Horizontal axis (Real)
    ctx.beginPath();
    ctx.moveTo(20, centerY);
    ctx.lineTo(width - 20, centerY);
    ctx.stroke();
    // Vertical axis (Imaginary)
    ctx.beginPath();
    ctx.moveTo(centerX, 20);
    ctx.lineTo(centerX, height - 20);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = this.isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Re', width - 25, centerY - 8);
    ctx.fillText('Im', centerX + 15, 25);

    // Traveling wave parameters
    // k = spatial wave number, chosen so ~1.5 wavelengths fit on screen
    const wavelength = radius * 1.5;
    const k = (2 * Math.PI) / wavelength;

    // Draw cosine wave - vertical traveling wave
    // At y=centerY (x-axis), value = A*cos(ωt+φ) = current real part
    // Wave equation: x = centerX + A*cos(ωt + φ - k*(y - centerY))
    if (this.showReal) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const steps = 200;
      for (let i = 0; i <= steps; i++) {
        const y = (i / steps) * height;
        const spatialPhase = k * (y - centerY);
        const waveValue = this.amplitude * Math.cos(this.time + this.phase - spatialPhase);
        const x = centerX + waveValue * scale;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Draw sine wave - horizontal traveling wave
    // At x=centerX (y-axis), value = A*sin(ωt+φ) = current imaginary part
    // Wave equation: y = centerY - A*sin(ωt + φ - k*(x - centerX))
    if (this.showImaginary) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const steps = 200;
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * width;
        const spatialPhase = k * (x - centerX);
        const waveValue = this.amplitude * Math.sin(this.time + this.phase - spatialPhase);
        const y = centerY - waveValue * scale;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Draw real component (horizontal vector) - cosine
    if (this.showReal) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(phasorX, centerY);
      ctx.stroke();

      // Arrowhead for blue vector
      const blueAngle = phasorX >= centerX ? 0 : Math.PI;
      const headLen = 10;
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(phasorX, centerY);
      ctx.lineTo(
        phasorX - headLen * Math.cos(blueAngle - Math.PI / 6),
        centerY + headLen * Math.sin(blueAngle - Math.PI / 6)
      );
      ctx.lineTo(
        phasorX - headLen * Math.cos(blueAngle + Math.PI / 6),
        centerY + headLen * Math.sin(blueAngle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      // Projection line from phasor point to x-axis
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(phasorX, phasorY);
      ctx.lineTo(phasorX, centerY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw imaginary component (vertical vector) - sine
    if (this.showImaginary) {
      // Dashed vector on y-axis (from origin)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, phasorY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Solid tail-to-tip vector (from tip of blue cos vector)
      ctx.beginPath();
      ctx.moveTo(phasorX, centerY);
      ctx.lineTo(phasorX, phasorY);
      ctx.stroke();

      // Arrowhead for red tail-to-tip vector
      const redAngle = phasorY <= centerY ? Math.PI / 2 : -Math.PI / 2;
      const headLen = 10;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(phasorX, phasorY);
      ctx.lineTo(
        phasorX - headLen * Math.cos(redAngle - Math.PI / 6),
        phasorY + headLen * Math.sin(redAngle - Math.PI / 6)
      );
      ctx.lineTo(
        phasorX - headLen * Math.cos(redAngle + Math.PI / 6),
        phasorY + headLen * Math.sin(redAngle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      // Projection line from phasor point to y-axis
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(phasorX, phasorY);
      ctx.lineTo(centerX, phasorY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw sum vector (phasor)
    if (this.showSum) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(phasorX, phasorY);
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(-(phasorY - centerY), phasorX - centerX);
      const headLen = 10;
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(phasorX, phasorY);
      ctx.lineTo(
        phasorX - headLen * Math.cos(angle - Math.PI / 6),
        phasorY + headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        phasorX - headLen * Math.cos(angle + Math.PI / 6),
        phasorY + headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    }

    // Draw current point on circle (the phasor tip)
    ctx.fillStyle = this.isDark ? '#fff' : '#000';
    ctx.beginPath();
    ctx.arc(phasorX, phasorY, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Draw highlights on axes for current values
    if (this.showReal) {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(phasorX, centerY, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
    if (this.showImaginary) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(centerX, phasorY, 5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Display current values in both rectangular and exponential form
    const theta = this.time + this.phase;
    // Normalize angle to [0, 2π)
    const thetaNorm = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const thetaPi = (thetaNorm / Math.PI).toFixed(2);

    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#22c55e';
    const sign = currentIm >= 0 ? '+' : '-';
    ctx.fillText(
      `z = ${currentRe.toFixed(2)} ${sign} ${Math.abs(currentIm).toFixed(2)}i = ${this.amplitude.toFixed(2)}e^(i·${thetaPi}π)`,
      20, 25
    );
  }

  private setupResizeObserverInternal(): void {
    this.resizeObserver = setupResizeObserver(
      this.canvas.parentElement!,
      () => this.resize()
    );
  }

  cleanup(): void {
    this.animationTimer.stop();
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
  title: 'Complex Frequency',
  category: 'Complex Analysis',
  description: 'Visualize complex exponentials with rotating phasor and wave projections.'
};

export default function initComplexFrequencyDemo(
  container: HTMLElement,
  config?: DemoConfig
): DemoInstance {
  const demo = new ComplexFrequencyDemo(container, config);
  return demo.init();
}
