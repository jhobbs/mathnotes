import { isDarkMode } from '@framework/demo-utils';
import { DemoInstance, DemoConfig, DemoMetadata } from '@framework/types';
// @ts-ignore
import Plotly from 'plotly.js-dist-min';
import * as math from 'mathjs';

interface Point2D {
  x: number;
  y: number;
}

interface ComplexFunction {
  u: math.MathNode;
  v: math.MathNode;
  uCompiled: math.EvalFunction;
  vCompiled: math.EvalFunction;
}

interface PartialDerivatives {
  dudx: number;
  dudy: number;
  dvdx: number;
  dvdy: number;
}

class CauchyRiemannDemo implements DemoInstance {
  private container!: HTMLElement;
  private controlPanel!: HTMLElement;
  private plotContainer!: HTMLElement;
  private preimagePlot!: HTMLElement;
  private imagePlot!: HTMLElement;
  private validationDisplay!: HTMLElement;

  // Input elements
  private uInput!: HTMLInputElement;
  private vInput!: HTMLInputElement;
  private x0Input!: HTMLInputElement;
  private y0Input!: HTMLInputElement;

  // State
  private complexFunc: ComplexFunction | null = null;
  private x0: number = 1;
  private y0: number = 0;
  private deltaX: number = 0.2;
  private deltaY: number = 0.2;
  private isDark: boolean = false;
  private resizeObserver: ResizeObserver | null = null;
  private plotsInitialized: boolean = false;

  // Grid parameters
  private gridRange: number = 3;  // Grid extends from -3 to 3

  // Adaptive sampling parameters
  private minSamples: number = 64;  // Base samples along each line
  private maxRefineLevel: number = 6;  // Maximum refinement depth
  private angleThreshold: number = Math.PI / 180 * 2;  // Refine when turn angle > 2 degrees

  async init(container: HTMLElement, config: DemoConfig): Promise<void> {
    this.container = container;
    this.isDark = isDarkMode(config);

    this.setupUI();
    this.parseAndUpdateFunctions();
    this.updatePlots();

    // Setup resize observer
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.container);
  }

  private setupUI(): void {
    // Create main container with styling
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

    // Function inputs row
    const funcRow = document.createElement('div');
    funcRow.style.display = 'flex';
    funcRow.style.gap = 'var(--spacing-md, 1rem)';
    funcRow.style.alignItems = 'center';
    funcRow.style.flexWrap = 'wrap';

    this.uInput = this.createExpressionInput('u(x,y) =', 'x^2 - y^2', () => this.handleFunctionChange());
    this.vInput = this.createExpressionInput('v(x,y) =', '2*x*y', () => this.handleFunctionChange());

    funcRow.appendChild(this.uInput.parentElement!);
    funcRow.appendChild(this.vInput.parentElement!);

    // Point and delta controls row
    const controlRow = document.createElement('div');
    controlRow.style.display = 'flex';
    controlRow.style.gap = 'var(--spacing-md, 1rem)';
    controlRow.style.alignItems = 'center';
    controlRow.style.flexWrap = 'wrap';

    this.x0Input = this.createNumberInput('x₀ =', 1, -5, 5, 0.1, () => this.handlePointChange());
    this.y0Input = this.createNumberInput('y₀ =', 0, -5, 5, 0.1, () => this.handlePointChange());

    controlRow.appendChild(this.x0Input.parentElement!);
    controlRow.appendChild(this.y0Input.parentElement!);

    // Delta controls with number inputs
    const deltaContainer = document.createElement('div');
    deltaContainer.style.display = 'flex';
    deltaContainer.style.gap = 'var(--spacing-lg, 1.5rem)';
    deltaContainer.style.alignItems = 'center';

    const deltaXInput = this.createNumberInput('Δx =', 0.2, -0.5, 0.5, 0.01,
      () => { this.deltaX = parseFloat((deltaXInput as any).value); this.updatePlots(); });
    const deltaYInput = this.createNumberInput('Δy =', 0.2, -0.5, 0.5, 0.01,
      () => { this.deltaY = parseFloat((deltaYInput as any).value); this.updatePlots(); });

    deltaContainer.appendChild(deltaXInput.parentElement!);
    deltaContainer.appendChild(deltaYInput.parentElement!);

    // Add reset button for deltas
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset Δ to 0';
    resetBtn.style.padding = '0.25rem 0.5rem';
    resetBtn.style.borderRadius = '0.25rem';
    resetBtn.style.border = '1px solid var(--color-border, #ccc)';
    resetBtn.style.background = this.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    resetBtn.style.cursor = 'pointer';
    resetBtn.onclick = () => {
      (deltaXInput as any).value = '0';
      (deltaYInput as any).value = '0';
      this.deltaX = 0;
      this.deltaY = 0;
      this.updatePlots();
    };
    deltaContainer.appendChild(resetBtn);

    // Validation display
    this.validationDisplay = document.createElement('div');
    this.validationDisplay.style.padding = 'var(--spacing-sm, 0.5rem)';
    this.validationDisplay.style.borderRadius = 'var(--radius-sm, 0.25rem)';
    this.validationDisplay.style.fontSize = '0.9em';
    this.validationDisplay.style.fontFamily = 'var(--font-mono, monospace)';

    // Example buttons
    const exampleRow = document.createElement('div');
    exampleRow.style.display = 'flex';
    exampleRow.style.gap = 'var(--spacing-sm, 0.5rem)';
    exampleRow.style.marginTop = 'var(--spacing-sm, 0.5rem)';

    const examples = [
      { label: 'z²', u: 'x^2 - y^2', v: '2*x*y' },
      { label: 'e^z', u: 'exp(x)*cos(y)', v: 'exp(x)*sin(y)' },
      { label: '1/z', u: 'x/(x^2 + y^2)', v: '-y/(x^2 + y^2)' },
      { label: 'z̄ (non-analytic)', u: 'x', v: '-y' }
    ];

    examples.forEach(example => {
      const btn = document.createElement('button');
      btn.textContent = example.label;
      btn.style.padding = '0.25rem 0.5rem';
      btn.style.borderRadius = '0.25rem';
      btn.style.border = '1px solid var(--color-border, #ccc)';
      btn.style.background = this.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
      btn.style.cursor = 'pointer';
      btn.onclick = () => {
        this.uInput.value = example.u;
        this.vInput.value = example.v;
        this.handleFunctionChange();
      };
      exampleRow.appendChild(btn);
    });

    this.controlPanel.appendChild(funcRow);
    this.controlPanel.appendChild(controlRow);
    this.controlPanel.appendChild(deltaContainer);
    this.controlPanel.appendChild(this.validationDisplay);
    this.controlPanel.appendChild(exampleRow);

    // Plot container
    this.plotContainer = document.createElement('div');
    this.plotContainer.style.display = 'flex';
    this.plotContainer.style.gap = 'var(--spacing-md, 1rem)';
    this.plotContainer.style.height = '500px';

    this.preimagePlot = document.createElement('div');
    this.preimagePlot.style.flex = '1';
    this.preimagePlot.style.minHeight = '400px';

    this.imagePlot = document.createElement('div');
    this.imagePlot.style.flex = '1';
    this.imagePlot.style.minHeight = '400px';

    this.plotContainer.appendChild(this.preimagePlot);
    this.plotContainer.appendChild(this.imagePlot);

    this.container.appendChild(this.controlPanel);
    this.container.appendChild(this.plotContainer);
  }

  private createExpressionInput(label: string, defaultValue: string, onChange: () => void): HTMLInputElement {
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
    input.style.width = '200px';
    input.addEventListener('input', onChange);

    container.appendChild(labelEl);
    container.appendChild(input);
    document.body.appendChild(container); // Temporarily attach to get parentElement

    return input;
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
    labelEl.style.minWidth = label.includes('Δ') ? '3rem' : 'auto';

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
    input.style.width = label.includes('Δ') ? '100px' : '80px';
    input.style.fontFamily = 'var(--font-mono, monospace)';
    input.addEventListener('input', onChange);

    // Add keyboard shortcuts for fine control
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' && e.shiftKey) {
        e.preventDefault();
        input.value = (parseFloat(input.value) + 0.1).toFixed(2);
        onChange();
      } else if (e.key === 'ArrowDown' && e.shiftKey) {
        e.preventDefault();
        input.value = (parseFloat(input.value) - 0.1).toFixed(2);
        onChange();
      }
    });

    container.appendChild(labelEl);
    container.appendChild(input);
    document.body.appendChild(container); // Temporarily attach

    return input;
  }


  private parseAndUpdateFunctions(): void {
    try {
      const uExpr = this.uInput.value;
      const vExpr = this.vInput.value;

      // Parse expressions
      const uNode = math.parse(uExpr);
      const vNode = math.parse(vExpr);

      // Compile for evaluation
      const uCompiled = uNode.compile();
      const vCompiled = vNode.compile();

      this.complexFunc = {
        u: uNode,
        v: vNode,
        uCompiled,
        vCompiled
      };

      // Clear any error styling
      this.uInput.style.borderColor = '';
      this.vInput.style.borderColor = '';

    } catch (error) {
      console.error('Error parsing functions:', error);
      this.uInput.style.borderColor = 'red';
      this.vInput.style.borderColor = 'red';
      this.complexFunc = null;
    }
  }

  private evaluateFunction(x: number, y: number): Point2D | null {
    if (!this.complexFunc) return null;

    try {
      const scope = { x, y };
      const u = this.complexFunc.uCompiled.evaluate(scope);
      const v = this.complexFunc.vCompiled.evaluate(scope);
      return { x: u, y: v };
    } catch (error) {
      console.error('Error evaluating function:', error);
      return null;
    }
  }

  private computePartialDerivatives(x: number, y: number): PartialDerivatives | null {
    if (!this.complexFunc) return null;

    try {
      // Compute symbolic partial derivatives
      const dudx_expr = math.derivative(this.complexFunc.u, 'x');
      const dudy_expr = math.derivative(this.complexFunc.u, 'y');
      const dvdx_expr = math.derivative(this.complexFunc.v, 'x');
      const dvdy_expr = math.derivative(this.complexFunc.v, 'y');

      // Evaluate at the point
      const scope = { x, y };
      const dudx = dudx_expr.evaluate(scope);
      const dudy = dudy_expr.evaluate(scope);
      const dvdx = dvdx_expr.evaluate(scope);
      const dvdy = dvdy_expr.evaluate(scope);

      return { dudx, dudy, dvdx, dvdy };
    } catch (error) {
      console.error('Error computing derivatives:', error);
      return null;
    }
  }

  private checkCauchyRiemannEquations(partials: PartialDerivatives): boolean {
    const tolerance = 0.001;
    const eq1_satisfied = Math.abs(partials.dudx - partials.dvdy) < tolerance;
    const eq2_satisfied = Math.abs(partials.dvdx + partials.dudy) < tolerance;
    return eq1_satisfied && eq2_satisfied;
  }

  // Adaptive sampling for parametric curves
  private sampleAdaptive(
    paramFunc: (t: number) => Point2D | null,
    tMin: number,
    tMax: number,
    minN: number = this.minSamples,
    level: number = 0
  ): Point2D[] {
    // Start with uniform samples
    const tValues: number[] = [];
    for (let i = 0; i < minN; i++) {
      tValues.push(tMin + (i * (tMax - tMin)) / (minN - 1));
    }

    let points: (Point2D | null)[] = tValues.map(t => paramFunc(t));

    // Remove null points
    const validIndices: number[] = [];
    const validPoints: Point2D[] = [];
    const validTs: number[] = [];

    for (let i = 0; i < points.length; i++) {
      if (points[i] !== null) {
        validIndices.push(i);
        validPoints.push(points[i]!);
        validTs.push(tValues[i]);
      }
    }

    if (validPoints.length < 2) return validPoints;

    // Refine based on turning angle
    const refine = (ts: number[], pts: Point2D[], lvl: number): { ts: number[], pts: Point2D[] } => {
      if (lvl >= this.maxRefineLevel) return { ts, pts };

      let refined = false;
      const newTs: number[] = [ts[0]];
      const newPts: Point2D[] = [pts[0]];

      for (let i = 0; i < ts.length - 1; i++) {
        const t0 = ts[i];
        const t1 = ts[i + 1];
        const p0 = pts[i];
        const p1 = pts[i + 1];

        // Sample midpoint
        const tm = 0.5 * (t0 + t1);
        const pm = paramFunc(tm);

        if (pm === null) {
          newTs.push(t1);
          newPts.push(p1);
          continue;
        }

        // Calculate turning angle using the triangle p0, pm, p1
        const v0 = { x: pm.x - p0.x, y: pm.y - p0.y };
        const v1 = { x: p1.x - pm.x, y: p1.y - pm.y };
        const dot = v0.x * v1.x + v0.y * v1.y;
        const n0 = Math.hypot(v0.x, v0.y);
        const n1 = Math.hypot(v1.x, v1.y);

        let angle = 0;
        if (n0 > 0 && n1 > 0) {
          const cosAngle = Math.max(-1, Math.min(1, dot / (n0 * n1)));
          angle = Math.acos(cosAngle);
        }

        if (angle > this.angleThreshold) {
          // Refine this segment
          refined = true;
          newTs.push(tm);
          newPts.push(pm);
        }

        newTs.push(t1);
        newPts.push(p1);
      }

      if (refined) {
        return refine(newTs, newPts, lvl + 1);
      }
      return { ts: newTs, pts: newPts };
    };

    const result = refine(validTs, validPoints, level);
    return result.pts;
  }

  // Generate lines for the grid (not a 2D array but individual lines)
  private generateGridLines(): {
    verticalLines: Point2D[][], // Lines with constant x (vertical in preimage)
    horizontalLines: Point2D[][] // Lines with constant y (horizontal in preimage)
  } {
    const gridStep = 1.0;
    const min = -Math.ceil(this.gridRange);
    const max = Math.ceil(this.gridRange);
    const numLines = Math.floor((max - min) / gridStep) + 1;

    const verticalLines: Point2D[][] = [];
    const horizontalLines: Point2D[][] = [];

    // Generate vertical lines (constant x)
    for (let i = 0; i < numLines; i++) {
      const xConst = min + i * gridStep;
      const line: Point2D[] = [];
      for (let j = 0; j < numLines; j++) {
        const y = min + j * gridStep;
        line.push({ x: xConst, y: y });
      }
      verticalLines.push(line);
    }

    // Generate horizontal lines (constant y)
    for (let j = 0; j < numLines; j++) {
      const yConst = min + j * gridStep;
      const line: Point2D[] = [];
      for (let i = 0; i < numLines; i++) {
        const x = min + i * gridStep;
        line.push({ x: x, y: yConst });
      }
      horizontalLines.push(line);
    }

    return { verticalLines, horizontalLines };
  }

  // Transform a single line with adaptive sampling
  private transformLineAdaptive(line: Point2D[], isVertical: boolean): Point2D[] {
    if (line.length < 2) return [];

    // Create a parametric function for the line
    const paramFunc = (t: number): Point2D | null => {
      if (isVertical) {
        // Vertical line: constant x, varying y
        const x = line[0].x;
        const yMin = line[0].y;
        const yMax = line[line.length - 1].y;
        const y = yMin + t * (yMax - yMin);
        return this.evaluateFunction(x, y);
      } else {
        // Horizontal line: constant y, varying x
        const y = line[0].y;
        const xMin = line[0].x;
        const xMax = line[line.length - 1].x;
        const x = xMin + t * (xMax - xMin);
        return this.evaluateFunction(x, y);
      }
    };

    // Use adaptive sampling on the parametric curve
    return this.sampleAdaptive(paramFunc, 0, 1);
  }

  // Transform grid lines with adaptive sampling
  private transformGridLines(
    verticalLines: Point2D[][],
    horizontalLines: Point2D[][]
  ): {
    transformedVertical: Point2D[][],
    transformedHorizontal: Point2D[][]
  } {
    const transformedVertical: Point2D[][] = [];
    const transformedHorizontal: Point2D[][] = [];

    // Transform vertical lines (constant x in preimage)
    for (const line of verticalLines) {
      const transformed = this.transformLineAdaptive(line, true);
      if (transformed.length > 0) {
        transformedVertical.push(transformed);
      }
    }

    // Transform horizontal lines (constant y in preimage)
    for (const line of horizontalLines) {
      const transformed = this.transformLineAdaptive(line, false);
      if (transformed.length > 0) {
        transformedHorizontal.push(transformed);
      }
    }

    return { transformedVertical, transformedHorizontal };
  }

  private createArrowTrace(from: Point2D, to: Point2D, color: string, name: string): any {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    return {
      x: [from.x, to.x],
      y: [from.y, to.y],
      mode: 'lines+markers',
      name: name,
      line: {
        color: color,
        width: 3
      },
      marker: {
        size: [0, 8],
        symbol: ['circle', 'arrow'],
        angleref: 'previous',
        color: color
      },
      hovertemplate: `${name}<br>Δ = (${dx.toFixed(3)}, ${dy.toFixed(3)})<br>|Δ| = ${Math.sqrt(dx*dx + dy*dy).toFixed(3)}<extra></extra>`
    };
  }

  private handleFunctionChange(): void {
    this.parseAndUpdateFunctions();
    this.updatePlots();
  }

  private handlePointChange(): void {
    this.x0 = parseFloat(this.x0Input.value) || 0;
    this.y0 = parseFloat(this.y0Input.value) || 0;
    this.updatePlots();
  }

  private updatePlots(): void {
    if (!this.complexFunc) {
      this.validationDisplay.innerHTML = '<span style="color: red;">⚠ Invalid function expressions</span>';
      return;
    }

    // Evaluate function at z0
    const f_z0 = this.evaluateFunction(this.x0, this.y0);
    if (!f_z0) return;

    // Evaluate at z0 + Δx and z0 + iΔy
    const f_z0_dx = this.evaluateFunction(this.x0 + this.deltaX, this.y0);
    const f_z0_dy = this.evaluateFunction(this.x0, this.y0 + this.deltaY);
    if (!f_z0_dx || !f_z0_dy) return;

    // Evaluate at z0 + Δz (the full delta: Δx + iΔy)
    const z_plus_delta_x = this.x0 + this.deltaX;
    const z_plus_delta_y = this.y0 + this.deltaY;
    const f_z0_plus_delta = this.evaluateFunction(z_plus_delta_x, z_plus_delta_y);
    if (!f_z0_plus_delta) return;

    // Compute partial derivatives
    const partials = this.computePartialDerivatives(this.x0, this.y0);
    if (!partials) return;

    // Check CR equations
    const crSatisfied = this.checkCauchyRiemannEquations(partials);

    // Compute exact derivative vectors
    const fprime_dx = {
      x: partials.dudx * this.deltaX,
      y: partials.dvdx * this.deltaX
    };
    const fprime_idy = {
      x: -partials.dvdy * this.deltaY,  // Real part of i*f'(z)*Δy
      y: partials.dudx * this.deltaY    // Imaginary part of i*f'(z)*Δy
    };

    // Calculate angles and magnitudes
    const diff_dx = { x: f_z0_dx.x - f_z0.x, y: f_z0_dx.y - f_z0.y };
    const diff_dy = { x: f_z0_dy.x - f_z0.x, y: f_z0_dy.y - f_z0.y };

    const mag_dx = Math.sqrt(diff_dx.x * diff_dx.x + diff_dx.y * diff_dx.y);
    const mag_dy = Math.sqrt(diff_dy.x * diff_dy.x + diff_dy.y * diff_dy.y);
    const angle = Math.acos((diff_dx.x * diff_dy.x + diff_dx.y * diff_dy.y) /
                           (mag_dx * mag_dy || 1)) * 180 / Math.PI;

    // Update validation display
    const crIcon = crSatisfied ? '✓' : '✗';
    const crColor = crSatisfied ? 'green' : 'red';

    this.validationDisplay.innerHTML = `
      <div style="display: flex; gap: 2rem; align-items: center; flex-wrap: wrap;">
        <span style="color: ${crColor}; font-size: 1.2em;">CR: ${crIcon} ${crSatisfied ? 'Satisfied' : 'Not satisfied'}</span>
        <span>∂u/∂x = ${partials.dudx.toFixed(3)}, ∂v/∂y = ${partials.dvdy.toFixed(3)}</span>
        <span>∂v/∂x = ${partials.dvdx.toFixed(3)}, ∂u/∂y = ${(-partials.dudy).toFixed(3)}</span>
        <span>Angle: ${angle.toFixed(1)}°</span>
        <span>Mag ratio: ${(mag_dy / (mag_dx || 1)).toFixed(3)}</span>
      </div>
      <div style="margin-top: 0.5rem; font-size: 0.85em; opacity: 0.7;">
        Grid: <span style="color: ${this.isDark ? '#FFB4B4' : '#DC6464'}">■</span> constant x lines,
        <span style="color: ${this.isDark ? '#B4B4FF' : '#6464DC'}">■</span> constant y lines
      </div>
    `;

    // Generate grid lines
    const gridLines = this.generateGridLines();
    const transformedLines = this.transformGridLines(gridLines.verticalLines, gridLines.horizontalLines);

    // Create pre-image plot
    const preimageData: any[] = [];

    // Define grid colors
    const xGridColor = this.isDark ? 'rgba(255, 180, 180, 0.4)' : 'rgba(220, 100, 100, 0.4)'; // Red-ish for constant x lines (vertical in pre-image)
    const yGridColor = this.isDark ? 'rgba(180, 180, 255, 0.4)' : 'rgba(100, 100, 220, 0.4)'; // Blue-ish for constant y lines (horizontal in pre-image)

    // Add horizontal lines (constant y) to preimage
    for (const line of gridLines.horizontalLines) {
      const xCoords = line.map(p => p.x);
      const yCoords = line.map(p => p.y);
      preimageData.push({
        x: xCoords,
        y: yCoords,
        mode: 'lines',
        line: { color: yGridColor, width: 1 },
        showlegend: false,
        hoverinfo: 'skip'
      });
    }

    // Add vertical lines (constant x) to preimage
    for (const line of gridLines.verticalLines) {
      const xCoords = line.map(p => p.x);
      const yCoords = line.map(p => p.y);
      preimageData.push({
        x: xCoords,
        y: yCoords,
        mode: 'lines',
        line: { color: xGridColor, width: 1 },
        showlegend: false,
        hoverinfo: 'skip'
      });
    }

    // Original point
    preimageData.push({
      x: [this.x0],
      y: [this.y0],
      mode: 'markers',
      name: 'z₀',
      marker: { size: 10, color: '#FFD700' },
      hovertemplate: `z₀ = ${this.x0.toFixed(2)} + ${this.y0.toFixed(2)}i<extra></extra>`
    });

    // New position z₀ + Δz
    preimageData.push({
      x: [z_plus_delta_x],
      y: [z_plus_delta_y],
      mode: 'markers',
      name: 'z₀ + Δz',
      marker: { size: 10, color: '#00CED1' },
      hovertemplate: `z₀ + Δz = ${z_plus_delta_x.toFixed(2)} + ${z_plus_delta_y.toFixed(2)}i<extra></extra>`
    });

    // Delta vectors
    preimageData.push(this.createArrowTrace(
      { x: this.x0, y: this.y0 },
      { x: this.x0 + this.deltaX, y: this.y0 },
      '#FF6B6B',
      'Δx'
    ));

    preimageData.push(this.createArrowTrace(
      { x: this.x0, y: this.y0 },
      { x: this.x0, y: this.y0 + this.deltaY },
      '#4ECDC4',
      'iΔy'
    ));

    // Create image plot
    const imageData: any[] = [];

    // Add transformed horizontal lines (originally constant y)
    for (const line of transformedLines.transformedHorizontal) {
      const xCoords = line.map(p => p.x);
      const yCoords = line.map(p => p.y);
      imageData.push({
        x: xCoords,
        y: yCoords,
        mode: 'lines',
        line: { color: yGridColor, width: 1 },
        showlegend: false,
        hoverinfo: 'skip'
      });
    }

    // Add transformed vertical lines (originally constant x)
    for (const line of transformedLines.transformedVertical) {
      const xCoords = line.map(p => p.x);
      const yCoords = line.map(p => p.y);
      imageData.push({
        x: xCoords,
        y: yCoords,
        mode: 'lines',
        line: { color: xGridColor, width: 1 },
        showlegend: false,
        hoverinfo: 'skip'
      });
    }

    // Transformed point
    imageData.push({
      x: [f_z0.x],
      y: [f_z0.y],
      mode: 'markers',
      name: 'f(z₀)',
      marker: { size: 10, color: '#FFD700' },
      hovertemplate: `f(z₀) = ${f_z0.x.toFixed(2)} + ${f_z0.y.toFixed(2)}i<extra></extra>`
    });

    // Transformed point at z₀ + Δz
    imageData.push({
      x: [f_z0_plus_delta.x],
      y: [f_z0_plus_delta.y],
      mode: 'markers',
      name: 'f(z₀ + Δz)',
      marker: { size: 10, color: '#00CED1' },
      hovertemplate: `f(z₀ + Δz) = ${f_z0_plus_delta.x.toFixed(2)} + ${f_z0_plus_delta.y.toFixed(2)}i<extra></extra>`
    });

    // Finite difference vectors
    imageData.push(this.createArrowTrace(
      f_z0,
      f_z0_dx,
      '#95E77E',
      'f(z₀+Δx) - f(z₀)'
    ));

    imageData.push(this.createArrowTrace(
      f_z0,
      f_z0_dy,
      '#B19CD9',
      'f(z₀+iΔy) - f(z₀)'
    ));

    // Exact derivative vectors (dashed)
    const exactDxTrace = this.createArrowTrace(
      f_z0,
      { x: f_z0.x + fprime_dx.x, y: f_z0.y + fprime_dx.y },
      '#FFA500',
      "f'(z₀)·Δx"
    );
    exactDxTrace.line.dash = 'dash';
    imageData.push(exactDxTrace);

    const exactDyTrace = this.createArrowTrace(
      f_z0,
      { x: f_z0.x + fprime_idy.x, y: f_z0.y + fprime_idy.y },
      '#FF69B4',
      "f'(z₀)·iΔy"
    );
    exactDyTrace.line.dash = 'dash';
    imageData.push(exactDyTrace);

    // Layout for both plots
    const layoutBase = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: this.isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)',
      font: { color: this.isDark ? '#fff' : '#000' },
      margin: { l: 50, r: 20, t: 40, b: 50 },
      dragmode: 'pan',
      uirevision: 'preserve-zoom',
      xaxis: {
        gridcolor: this.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        zerolinecolor: this.isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
        scaleanchor: 'y',
        scaleratio: 1
      },
      yaxis: {
        gridcolor: this.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        zerolinecolor: this.isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
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

    const preimageLayout = {
      ...layoutBase,
      title: {
        text: 'Pre-image (x,y plane)',
        font: { size: 14 }
      },
      xaxis: { ...layoutBase.xaxis, title: 'x' },
      yaxis: { ...layoutBase.yaxis, title: 'y' }
    };

    const imageLayout = {
      ...layoutBase,
      title: {
        text: 'Image (u,v plane)',
        font: { size: 14 }
      },
      xaxis: { ...layoutBase.xaxis, title: 'u' },
      yaxis: { ...layoutBase.yaxis, title: 'v' }
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['toImage'],
      displaylogo: false,
      scrollZoom: true
    };

    if (!this.plotsInitialized) {
      Plotly.newPlot(this.preimagePlot, preimageData, preimageLayout, config);
      Plotly.newPlot(this.imagePlot, imageData, imageLayout, config);
      this.plotsInitialized = true;
    } else {
      Plotly.react(this.preimagePlot, preimageData, preimageLayout, config);
      Plotly.react(this.imagePlot, imageData, imageLayout, config);
    }
  }

  cleanup(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.preimagePlot) {
      Plotly.purge(this.preimagePlot);
    }

    if (this.imagePlot) {
      Plotly.purge(this.imagePlot);
    }
  }

  resize(): void {
    if (this.preimagePlot && this.imagePlot) {
      Plotly.Plots.resize(this.preimagePlot);
      Plotly.Plots.resize(this.imagePlot);
    }
  }
}

export const metadata: DemoMetadata = {
  title: 'Cauchy-Riemann Equations',
  category: 'Complex Analysis',
  description: 'Interactive visualization of the Cauchy-Riemann equations showing how complex differentiable functions preserve angles and scale uniformly.'
};

export default function initCauchyRiemannDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new CauchyRiemannDemo();
  demo.init(container, config || {});
  return demo;
}
 
