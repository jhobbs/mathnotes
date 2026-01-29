import { isDarkMode } from '@framework/demo-utils';
import { DemoInstance, DemoConfig, DemoMetadata } from '@framework/types';
// @ts-ignore
import Plotly from 'plotly.js-dist-min';

interface Point2D {
  x: number;
  y: number;
}

interface Trajectory {
  points: Point2D[];
  color: string;
}

class LinearPhasePortraitDemo implements DemoInstance {
  private container!: HTMLElement;
  private controlPanel!: HTMLElement;
  private plotContainer!: HTMLElement;
  private plot!: HTMLElement;

  // Input elements
  private lambda1Input!: HTMLInputElement;
  private lambda2Input!: HTMLInputElement;
  private v1Input!: HTMLInputElement;
  private v2Input!: HTMLInputElement;

  // State
  private lambda1: number = -1;
  private lambda2: number = 2;
  private v1: Point2D = { x: 1, y: 0 };
  private v2: Point2D = { x: 0, y: 1 };
  private trajectories: Trajectory[] = [];
  private isDark: boolean = false;
  private resizeObserver: ResizeObserver | null = null;
  private plotInitialized: boolean = false;

  // View range
  private viewRange: number = 5;

  // Trajectory colors (cycle through these)
  private trajectoryColors: string[] = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
  ];
  private colorIndex: number = 0;

  async init(container: HTMLElement, config: DemoConfig): Promise<void> {
    this.container = container;
    this.isDark = isDarkMode(config);

    this.setupUI();
    this.updatePlot();

    // Setup resize observer
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.container);
  }

  private setupUI(): void {
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.gap = 'var(--spacing-md, 1rem)';
    this.container.style.padding = 'var(--spacing-md, 1rem)';

    // Control panel
    this.controlPanel = document.createElement('div');
    this.controlPanel.style.display = 'flex';
    this.controlPanel.style.flexDirection = 'column';
    this.controlPanel.style.gap = 'var(--spacing-sm, 0.5rem)';
    this.controlPanel.style.padding = 'var(--spacing-md, 1rem)';
    this.controlPanel.style.backgroundColor = this.isDark ?
      'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    this.controlPanel.style.borderRadius = 'var(--radius-md, 0.5rem)';

    // Eigenvalue inputs row
    const eigenvalueRow = document.createElement('div');
    eigenvalueRow.style.display = 'flex';
    eigenvalueRow.style.gap = 'var(--spacing-md, 1rem)';
    eigenvalueRow.style.alignItems = 'center';
    eigenvalueRow.style.flexWrap = 'wrap';

    this.lambda1Input = this.createTextInput('λ₁ =', '-1', () => this.handleInputChange());
    this.lambda2Input = this.createTextInput('λ₂ =', '2', () => this.handleInputChange());

    eigenvalueRow.appendChild(this.lambda1Input.parentElement!);
    eigenvalueRow.appendChild(this.lambda2Input.parentElement!);

    // Eigenvector inputs row
    const eigenvectorRow = document.createElement('div');
    eigenvectorRow.style.display = 'flex';
    eigenvectorRow.style.gap = 'var(--spacing-md, 1rem)';
    eigenvectorRow.style.alignItems = 'center';
    eigenvectorRow.style.flexWrap = 'wrap';

    this.v1Input = this.createTextInput('v₁ =', '1, 0', () => this.handleInputChange());
    this.v2Input = this.createTextInput('v₂ =', '0, 1', () => this.handleInputChange());

    eigenvectorRow.appendChild(this.v1Input.parentElement!);
    eigenvectorRow.appendChild(this.v2Input.parentElement!);

    // Buttons row
    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.gap = 'var(--spacing-sm, 0.5rem)';
    buttonRow.style.marginTop = 'var(--spacing-sm, 0.5rem)';

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear Trajectories';
    clearBtn.style.padding = '0.25rem 0.5rem';
    clearBtn.style.borderRadius = '0.25rem';
    clearBtn.style.border = '1px solid var(--color-border, #ccc)';
    clearBtn.style.background = this.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    clearBtn.style.cursor = 'pointer';
    clearBtn.onclick = () => {
      this.trajectories = [];
      this.colorIndex = 0;
      this.updatePlot();
    };
    buttonRow.appendChild(clearBtn);

    // Preset buttons
    const presets = [
      { label: 'Saddle', l1: '-1', l2: '2', v1: '1, 1', v2: '1, -1' },
      { label: 'Stable Node', l1: '-2', l2: '-1', v1: '1, 0', v2: '0, 1' },
      { label: 'Unstable Node', l1: '1', l2: '2', v1: '1, 1', v2: '-1, 1' },
    ];

    presets.forEach(preset => {
      const btn = document.createElement('button');
      btn.textContent = preset.label;
      btn.style.padding = '0.25rem 0.5rem';
      btn.style.borderRadius = '0.25rem';
      btn.style.border = '1px solid var(--color-border, #ccc)';
      btn.style.background = this.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
      btn.style.cursor = 'pointer';
      btn.onclick = () => {
        this.lambda1Input.value = preset.l1;
        this.lambda2Input.value = preset.l2;
        this.v1Input.value = preset.v1;
        this.v2Input.value = preset.v2;
        this.trajectories = [];
        this.colorIndex = 0;
        this.handleInputChange();
      };
      buttonRow.appendChild(btn);
    });

    // Instructions
    const instructions = document.createElement('div');
    instructions.style.fontSize = '0.85em';
    instructions.style.opacity = '0.7';
    instructions.textContent = 'Click on the plot to draw trajectories. Negative eigenvalues → flow toward origin, positive → flow away.';

    this.controlPanel.appendChild(eigenvalueRow);
    this.controlPanel.appendChild(eigenvectorRow);
    this.controlPanel.appendChild(buttonRow);
    this.controlPanel.appendChild(instructions);

    // Plot container - square and centered
    this.plotContainer = document.createElement('div');
    this.plotContainer.style.display = 'flex';
    this.plotContainer.style.justifyContent = 'center';

    this.plot = document.createElement('div');
    this.plot.style.width = '500px';
    this.plot.style.height = '500px';
    this.plot.style.maxWidth = '100%';
    this.plot.style.aspectRatio = '1';

    this.plotContainer.appendChild(this.plot);

    this.container.appendChild(this.controlPanel);
    this.container.appendChild(this.plotContainer);
  }

  private createTextInput(label: string, defaultValue: string, onChange: () => void): HTMLInputElement {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '0.5rem';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.style.fontWeight = 'bold';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = defaultValue;
    input.style.padding = '0.25rem 0.5rem';
    input.style.borderRadius = '0.25rem';
    input.style.border = '1px solid var(--color-border, #ccc)';
    input.style.background = this.isDark ? 'rgba(255,255,255,0.1)' : 'white';
    input.style.color = 'var(--color-text, inherit)';
    input.style.fontFamily = 'var(--font-mono, monospace)';
    input.style.width = '80px';
    input.addEventListener('input', onChange);
    input.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.stopPropagation();
      }
    });

    container.appendChild(labelEl);
    container.appendChild(input);

    return input;
  }

  private parseVector(s: string): Point2D | null {
    const parts = s.split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { x: parts[0], y: parts[1] };
    }
    return null;
  }

  private handleInputChange(): void {
    const l1 = parseFloat(this.lambda1Input.value);
    const l2 = parseFloat(this.lambda2Input.value);
    const v1 = this.parseVector(this.v1Input.value);
    const v2 = this.parseVector(this.v2Input.value);

    if (!isNaN(l1) && !isNaN(l2) && v1 && v2) {
      this.lambda1 = l1;
      this.lambda2 = l2;
      this.v1 = v1;
      this.v2 = v2;
      this.trajectories = [];
      this.colorIndex = 0;
      this.lambda1Input.style.borderColor = '';
      this.lambda2Input.style.borderColor = '';
      this.v1Input.style.borderColor = '';
      this.v2Input.style.borderColor = '';
      this.updatePlot();
    } else {
      if (isNaN(l1)) this.lambda1Input.style.borderColor = 'red';
      if (isNaN(l2)) this.lambda2Input.style.borderColor = 'red';
      if (!v1) this.v1Input.style.borderColor = 'red';
      if (!v2) this.v2Input.style.borderColor = 'red';
    }
  }

  // Compute trajectory through point (x0, y0)
  private computeTrajectory(x0: number, y0: number): Point2D[] {
    // Find coefficients c1, c2 such that (x0, y0) = c1*v1 + c2*v2
    // Solve: [v1.x v2.x] [c1]   [x0]
    //        [v1.y v2.y] [c2] = [y0]
    const det = this.v1.x * this.v2.y - this.v1.y * this.v2.x;
    if (Math.abs(det) < 1e-10) {
      // Degenerate case: eigenvectors are parallel
      return [];
    }

    const c1 = (this.v2.y * x0 - this.v2.x * y0) / det;
    const c2 = (-this.v1.y * x0 + this.v1.x * y0) / det;

    // Trajectory: x(t) = c1*e^(λ1*t)*v1 + c2*e^(λ2*t)*v2
    // Start at t=0 (clicked point) and go forward in time
    const points: Point2D[] = [];

    // Determine time range based on eigenvalues
    const maxLambda = Math.max(Math.abs(this.lambda1), Math.abs(this.lambda2));
    const tMax = maxLambda > 0 ? 10 / maxLambda : 10;
    const numPoints = 500;
    const dt = tMax / numPoints;

    for (let i = 0; i <= numPoints; i++) {
      const t = i * dt;
      const e1 = Math.exp(this.lambda1 * t);
      const e2 = Math.exp(this.lambda2 * t);

      const x = c1 * e1 * this.v1.x + c2 * e2 * this.v2.x;
      const y = c1 * e1 * this.v1.y + c2 * e2 * this.v2.y;

      // Only include points within view range (with some margin)
      if (Math.abs(x) < this.viewRange * 2 && Math.abs(y) < this.viewRange * 2) {
        points.push({ x, y });
      }
    }

    return points;
  }

  private updatePlot(): void {
    const data: any[] = [];

    // Draw eigenvector manifolds (lines through origin)
    const manifoldLength = this.viewRange * 1.5;

    // Normalize eigenvectors for display
    const norm1 = Math.sqrt(this.v1.x * this.v1.x + this.v1.y * this.v1.y);
    const norm2 = Math.sqrt(this.v2.x * this.v2.x + this.v2.y * this.v2.y);
    const u1 = { x: this.v1.x / norm1, y: this.v1.y / norm1 };
    const u2 = { x: this.v2.x / norm2, y: this.v2.y / norm2 };

    // Determine colors: fast (larger |λ|) = green, slow = red, equal = both green
    const abs1 = Math.abs(this.lambda1);
    const abs2 = Math.abs(this.lambda2);
    let manifold1Color: string;
    let manifold2Color: string;
    if (abs1 === abs2) {
      manifold1Color = '#4CAF50';
      manifold2Color = '#4CAF50';
    } else if (abs1 > abs2) {
      manifold1Color = '#4CAF50'; // fast = green
      manifold2Color = '#F44336'; // slow = red
    } else {
      manifold1Color = '#F44336'; // slow = red
      manifold2Color = '#4CAF50'; // fast = green
    }

    // Eigenvector 1 manifold (dashed if positive, solid if negative)
    data.push({
      x: [-u1.x * manifoldLength, u1.x * manifoldLength],
      y: [-u1.y * manifoldLength, u1.y * manifoldLength],
      mode: 'lines',
      name: `E₁ (λ₁=${this.lambda1})`,
      line: { color: manifold1Color, width: 2, dash: this.lambda1 > 0 ? 'dash' : 'solid' },
      hoverinfo: 'name'
    });

    // Eigenvector 2 manifold (dashed if positive, solid if negative)
    data.push({
      x: [-u2.x * manifoldLength, u2.x * manifoldLength],
      y: [-u2.y * manifoldLength, u2.y * manifoldLength],
      mode: 'lines',
      name: `E₂ (λ₂=${this.lambda2})`,
      line: { color: manifold2Color, width: 2, dash: this.lambda2 > 0 ? 'dash' : 'solid' },
      hoverinfo: 'name'
    });

    // Draw arrows on manifolds showing flow direction
    // Helper to create arrow annotations
    const createManifoldArrows = (u: Point2D, lambda: number, color: string): any[] => {
      const arrows: any[] = [];
      const arrowSize = 0.5;

      // Direction based on eigenvalue sign
      // Negative lambda: flow toward origin
      // Positive lambda: flow away from origin
      const flowDir = lambda > 0 ? 1 : -1;

      // Multiple arrows along each side of the manifold
      const positions = [1.5, 3, 4.5];

      for (const dist of positions) {
        // Arrow on positive side of manifold
        const pos1 = { x: u.x * dist, y: u.y * dist };
        const tip1 = { x: pos1.x + flowDir * u.x * arrowSize, y: pos1.y + flowDir * u.y * arrowSize };

        arrows.push({
          x: [pos1.x, tip1.x],
          y: [pos1.y, tip1.y],
          mode: 'lines+markers',
          showlegend: false,
          line: { color, width: 3 },
          marker: { size: [0, 16], symbol: ['circle', 'arrow'], angleref: 'previous', color },
          hoverinfo: 'skip'
        });

        // Arrow on negative side of manifold
        const pos2 = { x: -u.x * dist, y: -u.y * dist };
        const tip2 = { x: pos2.x - flowDir * u.x * arrowSize, y: pos2.y - flowDir * u.y * arrowSize };

        arrows.push({
          x: [pos2.x, tip2.x],
          y: [pos2.y, tip2.y],
          mode: 'lines+markers',
          showlegend: false,
          line: { color, width: 3 },
          marker: { size: [0, 16], symbol: ['circle', 'arrow'], angleref: 'previous', color },
          hoverinfo: 'skip'
        });
      }

      return arrows;
    };

    data.push(...createManifoldArrows(u1, this.lambda1, manifold1Color));
    data.push(...createManifoldArrows(u2, this.lambda2, manifold2Color));

    // Draw trajectories
    for (const traj of this.trajectories) {
      if (traj.points.length > 1) {
        data.push({
          x: traj.points.map(p => p.x),
          y: traj.points.map(p => p.y),
          mode: 'lines',
          showlegend: false,
          line: { color: traj.color, width: 2 },
          hoverinfo: 'skip'
        });
      }
    }

    // Origin marker (hollow if unstable, filled if stable)
    const isUnstable = this.lambda1 > 0 || this.lambda2 > 0;
    data.push({
      x: [0],
      y: [0],
      mode: 'markers',
      name: 'x*',
      marker: {
        size: 10,
        color: isUnstable ? 'transparent' : (this.isDark ? '#fff' : '#000'),
        line: {
          color: this.isDark ? '#fff' : '#000',
          width: 2
        },
        symbol: 'circle'
      },
      hovertemplate: 'Origin (fixed point)<extra></extra>'
    });

    const layout: any = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: this.isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)',
      font: { color: this.isDark ? '#fff' : '#000' },
      margin: { l: 50, r: 20, t: 20, b: 50 },
      dragmode: false,
      xaxis: {
        range: [-5, 5],
        gridcolor: this.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        zerolinecolor: this.isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
        scaleanchor: 'y',
        scaleratio: 1,
        constrain: 'domain'
      },
      yaxis: {
        range: [-5, 5],
        gridcolor: this.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        zerolinecolor: this.isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
        constrain: 'domain'
      },
      hovermode: 'closest',
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: this.isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)',
        bordercolor: this.isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
        borderwidth: 1
      }
    };

    const config: any = {
      responsive: true,
      displayModeBar: false,
      scrollZoom: true
    };

    if (!this.plotInitialized) {
      Plotly.newPlot(this.plot, data, layout, config);
      this.plotInitialized = true;

      // Add click handler directly on plot area
      this.plot.addEventListener('click', (e: MouseEvent) => {
        const plotArea = this.plot.querySelector('.plotly .nsewdrag') as HTMLElement;
        if (!plotArea) return;

        const rect = plotArea.getBoundingClientRect();
        const plotlyLayout = (this.plot as any)._fullLayout;
        if (!plotlyLayout) return;

        const xaxis = plotlyLayout.xaxis;
        const yaxis = plotlyLayout.yaxis;

        // Check if click is within plot area
        if (e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top || e.clientY > rect.bottom) {
          return;
        }

        // Convert pixel to data coordinates
        const xFrac = (e.clientX - rect.left) / rect.width;
        const yFrac = (rect.bottom - e.clientY) / rect.height;

        const x = xaxis.range[0] + xFrac * (xaxis.range[1] - xaxis.range[0]);
        const y = yaxis.range[0] + yFrac * (yaxis.range[1] - yaxis.range[0]);

        this.addTrajectory(x, y);
      });
    } else {
      Plotly.react(this.plot, data, layout, config);
    }
  }

  private addTrajectory(x: number, y: number): void {
    const points = this.computeTrajectory(x, y);
    if (points.length > 1) {
      const color = this.trajectoryColors[this.colorIndex % this.trajectoryColors.length];
      this.colorIndex++;
      this.trajectories.push({ points, color });
      this.updatePlot();
    }
  }

  cleanup(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.plot) {
      Plotly.purge(this.plot);
    }
  }

  resize(): void {
    if (this.plot) {
      Plotly.Plots.resize(this.plot);
    }
  }
}

export const metadata: DemoMetadata = {
  title: 'Linear Phase Portrait',
  category: 'Linear Algebra',
  description: 'Interactive phase portrait for 2D linear systems. Input eigenvalues and eigenvectors to visualize trajectories, stable/unstable manifolds, and flow direction.'
};

export default function initLinearPhasePortraitDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new LinearPhasePortraitDemo();
  demo.init(container, config || {});
  return demo;
}
