// Cross Product Demo (Plotly version) - Interactive 3D visualization using Plotly.js
// @ts-ignore - plotly.js-dist-min doesn't have types
import Plotly from 'plotly.js-dist-min';
import type { DemoInstance, DemoConfig, DemoMetadata } from '@framework/types';
import { isDarkMode } from '@framework/demo-utils';

class CrossProductPlotlyDemo implements DemoInstance {
  private container: HTMLElement;
  private plotDiv!: HTMLElement;
  private controlPanel!: HTMLElement;

  // Vector components
  private vectorA = { x: 2, y: 2, z: 0 };
  private vectorB = { x: 1, y: 3, z: 0 };

  // UI inputs
  private axInput!: HTMLInputElement;
  private ayInput!: HTMLInputElement;
  private azInput!: HTMLInputElement;
  private bxInput!: HTMLInputElement;
  private byInput!: HTMLInputElement;
  private bzInput!: HTMLInputElement;
  private resultsDiv!: HTMLElement;

  private isDark: boolean;
  private resizeObserver?: ResizeObserver;

  constructor(container: HTMLElement, config?: DemoConfig) {
    this.container = container;
    this.isDark = isDarkMode(config);
  }

  init(): DemoInstance {
    this.setupUI();
    this.updatePlot();
    this.setupResizeObserver();
    return this;
  }

  private setupUI(): void {
    // Main container
    this.container.style.width = '100%';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.gap = 'var(--space-md)';

    // Control panel
    this.controlPanel = document.createElement('div');
    this.controlPanel.style.display = 'flex';
    this.controlPanel.style.flexDirection = 'column';
    this.controlPanel.style.gap = 'var(--space-md)';
    this.controlPanel.style.padding = 'var(--space-md)';
    this.controlPanel.style.backgroundColor = 'var(--color-bg-secondary, #f5f5f5)';
    this.controlPanel.style.borderRadius = '8px';
    this.container.appendChild(this.controlPanel);

    // Input row
    const inputsRow = document.createElement('div');
    inputsRow.style.display = 'flex';
    inputsRow.style.gap = 'var(--space-lg)';
    inputsRow.style.alignItems = 'center';
    inputsRow.style.justifyContent = 'center';
    inputsRow.style.flexWrap = 'wrap';
    this.controlPanel.appendChild(inputsRow);

    // Vector A label
    const vecALabel = document.createElement('span');
    vecALabel.innerHTML = '<strong style="color: #e74c3c;">A:</strong>';
    inputsRow.appendChild(vecALabel);

    this.axInput = this.createNumberInput('x', this.vectorA.x, (val) => {
      this.vectorA.x = val;
      this.updatePlot();
    });
    inputsRow.appendChild(this.axInput.parentElement!);

    this.ayInput = this.createNumberInput('y', this.vectorA.y, (val) => {
      this.vectorA.y = val;
      this.updatePlot();
    });
    inputsRow.appendChild(this.ayInput.parentElement!);

    this.azInput = this.createNumberInput('z', this.vectorA.z, (val) => {
      this.vectorA.z = val;
      this.updatePlot();
    });
    inputsRow.appendChild(this.azInput.parentElement!);

    // Separator
    const separator = document.createElement('span');
    separator.textContent = '|';
    separator.style.color = 'var(--color-border, #ccc)';
    separator.style.fontSize = 'var(--text-lg)';
    inputsRow.appendChild(separator);

    // Vector B label
    const vecBLabel = document.createElement('span');
    vecBLabel.innerHTML = '<strong style="color: #3498db;">B:</strong>';
    inputsRow.appendChild(vecBLabel);

    this.bxInput = this.createNumberInput('x', this.vectorB.x, (val) => {
      this.vectorB.x = val;
      this.updatePlot();
    });
    inputsRow.appendChild(this.bxInput.parentElement!);

    this.byInput = this.createNumberInput('y', this.vectorB.y, (val) => {
      this.vectorB.y = val;
      this.updatePlot();
    });
    inputsRow.appendChild(this.byInput.parentElement!);

    this.bzInput = this.createNumberInput('z', this.vectorB.z, (val) => {
      this.vectorB.z = val;
      this.updatePlot();
    });
    inputsRow.appendChild(this.bzInput.parentElement!);

    // Results display
    this.resultsDiv = document.createElement('div');
    this.resultsDiv.style.textAlign = 'center';
    this.resultsDiv.style.fontSize = 'var(--text-base)';
    this.resultsDiv.style.padding = 'var(--space-sm)';
    this.controlPanel.appendChild(this.resultsDiv);

    // Plot container
    this.plotDiv = document.createElement('div');
    this.plotDiv.style.width = '100%';
    this.plotDiv.style.height = '600px';
    this.plotDiv.style.backgroundColor = this.isDark ? '#1e1e1e' : '#ffffff';
    this.plotDiv.style.borderRadius = '8px';
    this.container.appendChild(this.plotDiv);
  }

  private createNumberInput(label: string, value: number, onChange: (val: number) => void): HTMLInputElement {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = 'var(--space-sm)';

    const labelEl = document.createElement('label');
    labelEl.textContent = label + ':';
    labelEl.style.minWidth = '20px';
    labelEl.style.fontWeight = '500';
    container.appendChild(labelEl);

    const input = document.createElement('input');
    input.type = 'number';
    input.value = value.toString();
    input.step = '0.1';
    input.style.width = '80px';
    input.style.padding = '4px 8px';
    input.style.border = '1px solid var(--color-border, #ccc)';
    input.style.borderRadius = '4px';
    input.style.fontSize = 'var(--text-sm)';
    input.style.backgroundColor = 'var(--color-bg, white)';
    input.style.color = 'var(--color-text, black)';

    input.addEventListener('input', () => {
      const val = parseFloat(input.value);
      if (!isNaN(val)) {
        onChange(val);
      }
    });

    container.appendChild(input);
    return input;
  }

  private crossProduct(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  private magnitude(v: { x: number; y: number; z: number }): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  }

  private updatePlot(): void {
    const cross = this.crossProduct(this.vectorA, this.vectorB);
    const mag = this.magnitude(cross);

    // Update results text
    this.resultsDiv.innerHTML = `|v| = |A×B| = |(${this.vectorA.x.toFixed(1)}, ${this.vectorA.y.toFixed(1)}, ${this.vectorA.z.toFixed(1)}) × (${this.vectorB.x.toFixed(1)}, ${this.vectorB.y.toFixed(1)}, ${this.vectorB.z.toFixed(1)})| = ${mag.toFixed(2)}`;

    const data: any[] = [];

    // Grid/axes lines
    const gridRange = 6;
    const axisColor = this.isDark ? '#666' : '#ccc';

    // X axis (red)
    data.push({
      type: 'scatter3d',
      mode: 'lines',
      x: [-gridRange, gridRange],
      y: [0, 0],
      z: [0, 0],
      line: { color: 'rgb(200, 50, 50)', width: 3 },
      hoverinfo: 'skip',
      showlegend: false
    });

    // Y axis (green)
    data.push({
      type: 'scatter3d',
      mode: 'lines',
      x: [0, 0],
      y: [-gridRange, gridRange],
      z: [0, 0],
      line: { color: 'rgb(50, 200, 50)', width: 3 },
      hoverinfo: 'skip',
      showlegend: false
    });

    // Z axis (blue)
    data.push({
      type: 'scatter3d',
      mode: 'lines',
      x: [0, 0],
      y: [0, 0],
      z: [-gridRange, gridRange],
      line: { color: 'rgb(50, 50, 200)', width: 3 },
      hoverinfo: 'skip',
      showlegend: false
    });

    // Parallelogram (if vectors are not parallel)
    if (mag > 0.01) {
      data.push({
        type: 'mesh3d',
        x: [0, this.vectorA.x, this.vectorA.x + this.vectorB.x, this.vectorB.x],
        y: [0, this.vectorA.y, this.vectorA.y + this.vectorB.y, this.vectorB.y],
        z: [0, this.vectorA.z, this.vectorA.z + this.vectorB.z, this.vectorB.z],
        i: [0, 0],
        j: [1, 2],
        k: [2, 3],
        opacity: 0.3,
        color: 'rgb(150, 150, 200)',
        hoverinfo: 'skip',
        showlegend: false
      });
    }

    // Vector A (red arrow)
    data.push({
      type: 'scatter3d',
      mode: 'lines',
      x: [0, this.vectorA.x],
      y: [0, this.vectorA.y],
      z: [0, this.vectorA.z],
      line: { color: 'rgb(231, 76, 60)', width: 6 },
      name: 'Vector A',
      hovertemplate: `A: (${this.vectorA.x.toFixed(2)}, ${this.vectorA.y.toFixed(2)}, ${this.vectorA.z.toFixed(2)})<extra></extra>`
    });

    // Vector A cone (arrowhead)
    if (this.magnitude(this.vectorA) > 0.01) {
      data.push({
        type: 'cone',
        x: [this.vectorA.x],
        y: [this.vectorA.y],
        z: [this.vectorA.z],
        u: [this.vectorA.x * 0.15],
        v: [this.vectorA.y * 0.15],
        w: [this.vectorA.z * 0.15],
        colorscale: [[0, 'rgb(231, 76, 60)'], [1, 'rgb(231, 76, 60)']],
        showscale: false,
        hoverinfo: 'skip',
        showlegend: false,
        sizemode: 'absolute',
        sizeref: 0.5
      });
    }

    // Vector B (blue arrow)
    data.push({
      type: 'scatter3d',
      mode: 'lines',
      x: [0, this.vectorB.x],
      y: [0, this.vectorB.y],
      z: [0, this.vectorB.z],
      line: { color: 'rgb(52, 152, 219)', width: 6 },
      name: 'Vector B',
      hovertemplate: `B: (${this.vectorB.x.toFixed(2)}, ${this.vectorB.y.toFixed(2)}, ${this.vectorB.z.toFixed(2)})<extra></extra>`
    });

    // Vector B cone (arrowhead)
    if (this.magnitude(this.vectorB) > 0.01) {
      data.push({
        type: 'cone',
        x: [this.vectorB.x],
        y: [this.vectorB.y],
        z: [this.vectorB.z],
        u: [this.vectorB.x * 0.15],
        v: [this.vectorB.y * 0.15],
        w: [this.vectorB.z * 0.15],
        colorscale: [[0, 'rgb(52, 152, 219)'], [1, 'rgb(52, 152, 219)']],
        showscale: false,
        hoverinfo: 'skip',
        showlegend: false,
        sizemode: 'absolute',
        sizeref: 0.5
      });
    }

    // Cross product (green arrow)
    if (mag > 0.01) {
      data.push({
        type: 'scatter3d',
        mode: 'lines',
        x: [0, cross.x],
        y: [0, cross.y],
        z: [0, cross.z],
        line: { color: 'rgb(39, 174, 96)', width: 8 },
        name: 'A × B',
        hovertemplate: `A×B: (${cross.x.toFixed(2)}, ${cross.y.toFixed(2)}, ${cross.z.toFixed(2)})<extra></extra>`
      });

      // Cross product cone (arrowhead)
      data.push({
        type: 'cone',
        x: [cross.x],
        y: [cross.y],
        z: [cross.z],
        u: [cross.x * 0.15],
        v: [cross.y * 0.15],
        w: [cross.z * 0.15],
        colorscale: [[0, 'rgb(39, 174, 96)'], [1, 'rgb(39, 174, 96)']],
        showscale: false,
        hoverinfo: 'skip',
        showlegend: false,
        sizemode: 'absolute',
        sizeref: 0.5
      });
    }

    const layout = {
      scene: {
        xaxis: {
          title: 'X',
          range: [-gridRange, gridRange],
          gridcolor: axisColor,
          showbackground: false
        },
        yaxis: {
          title: 'Y',
          range: [-gridRange, gridRange],
          gridcolor: axisColor,
          showbackground: false
        },
        zaxis: {
          title: 'Z',
          range: [-gridRange, gridRange],
          gridcolor: axisColor,
          showbackground: false
        },
        aspectmode: 'cube',
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1.2 }
        },
        bgcolor: this.isDark ? '#1e1e1e' : '#ffffff'
      },
      paper_bgcolor: this.isDark ? '#1e1e1e' : '#ffffff',
      plot_bgcolor: this.isDark ? '#1e1e1e' : '#ffffff',
      font: {
        color: this.isDark ? '#ffffff' : '#000000'
      },
      margin: { l: 0, r: 0, t: 0, b: 0 },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: this.isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        bordercolor: this.isDark ? '#666' : '#ccc',
        borderwidth: 1
      }
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['toImage'],
      displaylogo: false
    };

    Plotly.newPlot(this.plotDiv, data, layout, config);
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.container);
  }

  resize(): void {
    if (this.plotDiv) {
      Plotly.Plots.resize(this.plotDiv);
    }
  }

  pause(): void {
    // No animation to pause
  }

  resume(): void {
    // No animation to resume
  }

  cleanup(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.plotDiv) {
      Plotly.purge(this.plotDiv);
    }
    this.container.innerHTML = '';
  }
}

export const metadata: DemoMetadata = {
  title: 'Cross Product Visualization (Plotly)',
  category: 'Linear Algebra',
  description: 'Interactive 3D visualization of the vector cross product using Plotly.js, showing the resulting vector perpendicular to both input vectors and the parallelogram area.'
};

export default function initCrossProductPlotlyDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new CrossProductPlotlyDemo(container, config);
  return demo.init();
}