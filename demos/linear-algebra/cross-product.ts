// Cross Product Demo - Interactive 3D visualization of vector cross product
import p5 from 'p5';
import type { DemoInstance, DemoConfig, DemoMetadata } from '@framework/types';
import { P5DemoBase } from '@framework';

class CrossProductDemo extends P5DemoBase {
  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
  }

  // Vector components (initialized as plain objects)
  private vectorA = { x: 3, y: 1, z: 0 };
  private vectorB = { x: 1, y: 3, z: 0 };

  // UI inputs
  private axInput!: HTMLInputElement;
  private ayInput!: HTMLInputElement;
  private azInput!: HTMLInputElement;
  private bxInput!: HTMLInputElement;
  private byInput!: HTMLInputElement;
  private bzInput!: HTMLInputElement;

  // Camera control
  private rotationX: number = 0.76;
  private rotationY: number = 6.47;
  private rotationZ: number = -0.30;
  private isDragging: boolean = false;
  private prevMouseX: number = 0;
  private prevMouseY: number = 0;

  // Scaling
  private scale: number = 1;

  protected getStylePrefix(): string {
    return 'cross-product';
  }

  protected getAspectRatio(): number {
    return 0.45; // Very wide aspect ratio to fit everything on one page
  }

  protected getMaxHeightPercent(): number {
    return 35; // Limit height to 35% of viewport for compact display
  }

  private updateScaling(p: p5): void {
    // Base scaling on the smaller dimension
    const baseSize = Math.min(p.width, p.height);
    this.scale = baseSize / 400; // 400 is our reference size
  }

  protected onResize(p: p5, _size?: any): void {
    this.updateScaling(p);
    p.redraw();
  }

  protected onColorSchemeChange(_isDark: boolean): void {
    if (this.p5Instance) {
      this.p5Instance.redraw();
    }
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

    // Store container as a property of input so we can get it back
    (input as any).containerElement = container;

    return input;
  }

  // Override to create WEBGL canvas
  protected createResponsiveCanvas(p: p5, aspectRatio?: number, maxHeightPercent?: number): p5.Renderer {
    const size = this.getCanvasSize(aspectRatio, maxHeightPercent);
    const canvas = p.createCanvas(size.width, size.height, p.WEBGL);
    if (this.canvasParent) {
      canvas.parent(this.canvasParent);
    }

    // Initialize colors after canvas creation
    this.updateColors(p);

    return canvas;
  }

  private drawArrow(p: p5, base: p5.Vector, vec: p5.Vector, arrowColor: p5.Color, lineWidth: number = 2): void {
    const vecLength = vec.mag();
    if (vecLength === 0) return;

    p.push();
    p.translate(base.x, base.y, base.z);
    p.rotate(Math.atan2(vec.y, vec.x), [0, 0, 1]);
    p.rotate(-Math.asin(vec.z / vecLength), [0, 1, 0]);

    // Draw line
    p.strokeWeight(lineWidth);
    p.stroke(arrowColor);
    p.line(0, 0, 0, vecLength, 0, 0);

    // Draw arrowhead as a 2D triangle
    p.push();
    p.translate(vecLength, 0, 0);
    p.fill(arrowColor);
    p.noStroke();
    const arrowSize = Math.min(15 * this.scale, vecLength * 0.2);
    p.triangle(
      0, 0,
      -arrowSize, -arrowSize * 0.5,
      -arrowSize, arrowSize * 0.5
    );
    p.pop();

    p.pop();
  }

  private drawGrid(p: p5, gridSize: number): void {
    const gridLines = 10;
    const spacing = gridSize / gridLines;

    p.strokeWeight(0.5);

    // XY plane grid
    p.stroke(100, 100, 100, 50);
    for (let i = -gridLines; i <= gridLines; i++) {
      p.line(-gridSize, i * spacing, 0, gridSize, i * spacing, 0);
      p.line(i * spacing, -gridSize, 0, i * spacing, gridSize, 0);
    }

    // Draw axes
    p.strokeWeight(1.5);
    // X axis - red
    p.stroke(200, 50, 50);
    p.line(-gridSize, 0, 0, gridSize, 0, 0);
    // Y axis - green
    p.stroke(50, 200, 50);
    p.line(0, -gridSize, 0, 0, gridSize, 0);
    // Z axis - blue
    p.stroke(50, 50, 200);
    p.line(0, 0, -gridSize, 0, 0, gridSize);

  }

  private drawParallelogram(p: p5, vecA: p5.Vector, vecB: p5.Vector): void {
    const crossProd = p5.Vector.cross(vecA, vecB) as unknown as p5.Vector;
    const area = crossProd.mag();

    if (area > 0.01) {
      p.push();
      p.fill(150, 150, 200, 100);
      p.noStroke();

      p.beginShape();
      p.vertex(0, 0, 0);
      p.vertex(vecA.x, vecA.y, vecA.z);
      p.vertex(vecA.x + vecB.x, vecA.y + vecB.y, vecA.z + vecB.z);
      p.vertex(vecB.x, vecB.y, vecB.z);
      p.endShape(p.CLOSE);
      p.pop();
    }
  }

  protected createSketch(p: p5): void {
    p.setup = () => {
      // Initialize scaling
      this.updateScaling(p);

      // Create control panel
      const controlPanel = this.createControlPanel();

      // Single row of inputs
      const inputsRow = document.createElement('div');
      inputsRow.style.display = 'flex';
      inputsRow.style.gap = 'var(--space-lg)';
      inputsRow.style.alignItems = 'center';
      inputsRow.style.justifyContent = 'center';
      inputsRow.style.flexWrap = 'wrap';
      controlPanel.appendChild(inputsRow);

      // Vector A label
      const vecALabel = document.createElement('span');
      vecALabel.innerHTML = '<strong style="color: #e74c3c;">A:</strong>';
      inputsRow.appendChild(vecALabel);

      this.axInput = this.createNumberInput('x', this.vectorA.x, (val) => {
        this.vectorA.x = val;
        p.redraw();
      });
      inputsRow.appendChild((this.axInput as any).containerElement);

      this.ayInput = this.createNumberInput('y', this.vectorA.y, (val) => {
        this.vectorA.y = val;
        p.redraw();
      });
      inputsRow.appendChild((this.ayInput as any).containerElement);

      this.azInput = this.createNumberInput('z', this.vectorA.z, (val) => {
        this.vectorA.z = val;
        p.redraw();
      });
      inputsRow.appendChild((this.azInput as any).containerElement);

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
        p.redraw();
      });
      inputsRow.appendChild((this.bxInput as any).containerElement);

      this.byInput = this.createNumberInput('y', this.vectorB.y, (val) => {
        this.vectorB.y = val;
        p.redraw();
      });
      inputsRow.appendChild((this.byInput as any).containerElement);

      this.bzInput = this.createNumberInput('z', this.vectorB.z, (val) => {
        this.vectorB.z = val;
        p.redraw();
      });
      inputsRow.appendChild((this.bzInput as any).containerElement);

      // Results display
      const resultsContent = document.createElement('div');
      resultsContent.id = 'cross-product-results';
      resultsContent.style.textAlign = 'center';
      resultsContent.style.marginTop = 'var(--space-md)';
      resultsContent.style.fontSize = 'var(--text-base)';
      controlPanel.appendChild(resultsContent);

      p.noLoop();
    };

    p.draw = () => {
      // Background
      p.background(this.colors.background);

      // Camera and lighting
      p.lights();
      p.ambientLight(100);

      // Apply transformations
      const baseScale = 30 * this.scale;
      p.scale(baseScale);
      p.rotateX(this.rotationX);
      p.rotateY(this.rotationY);
      p.rotateZ(this.rotationZ);

      // Draw grid
      this.drawGrid(p, 6);

      // Get vectors
      const vecA = p.createVector(this.vectorA.x, this.vectorA.y, this.vectorA.z);
      const vecB = p.createVector(this.vectorB.x, this.vectorB.y, this.vectorB.z);
      const crossProduct = p5.Vector.cross(vecA, vecB) as unknown as p5.Vector;

      // Draw parallelogram
      this.drawParallelogram(p, vecA, vecB);

      // Draw vectors
      const origin = p.createVector(0, 0, 0);

      // Vector A - red
      if (vecA.mag() > 0.01) {
        this.drawArrow(p, origin, vecA, p.color(231, 76, 60), 3);
      }

      // Vector B - blue
      if (vecB.mag() > 0.01) {
        this.drawArrow(p, origin, vecB, p.color(52, 152, 219), 3);
      }

      // Cross product - green
      if (crossProduct.mag() > 0.01) {
        this.drawArrow(p, origin, crossProduct, p.color(39, 174, 96), 4);
      }

      // Update results display
      const resultsEl = document.getElementById('cross-product-results');
      if (resultsEl) {
        const magnitude = crossProduct.mag();
        resultsEl.innerHTML = `|v| = |A×B| = |(${vecA.x.toFixed(1)}, ${vecA.y.toFixed(1)}, ${vecA.z.toFixed(1)}) × (${vecB.x.toFixed(1)}, ${vecB.y.toFixed(1)}, ${vecB.z.toFixed(1)})| = ${magnitude.toFixed(2)}`;
      }
    };

    // Mouse controls for rotation
    p.mousePressed = () => {
      if (p.mouseX >= 0 && p.mouseX <= p.width &&
          p.mouseY >= 0 && p.mouseY <= p.height) {
        this.isDragging = true;
        this.prevMouseX = p.mouseX;
        this.prevMouseY = p.mouseY;
      }
    };

    p.mouseDragged = () => {
      if (this.isDragging) {
        const deltaX = p.mouseX - this.prevMouseX;
        const deltaY = p.mouseY - this.prevMouseY;

        this.rotationY += deltaX * 0.01;  // Horizontal drag rotates around Y axis
        this.rotationX += deltaY * 0.01;  // Vertical drag rotates around X axis

        this.prevMouseX = p.mouseX;
        this.prevMouseY = p.mouseY;

        console.log(`rotationX: ${this.rotationX.toFixed(2)}, rotationY: ${this.rotationY.toFixed(2)}, rotationZ: ${this.rotationZ.toFixed(2)}`);

        p.redraw();
      }
    };

    p.mouseReleased = () => {
      this.isDragging = false;
    };

    // Mouse wheel for zoom
    p.mouseWheel = (event: any) => {
      if (p.mouseX >= 0 && p.mouseX <= p.width &&
          p.mouseY >= 0 && p.mouseY <= p.height) {
        const delta = event.delta;
        this.scale *= (1 - delta * 0.001);
        this.scale = p.constrain(this.scale, 0.5, 3);
        p.redraw();
        return false; // Prevent page scroll
      }
      return true;
    };
  }
}

export const metadata: DemoMetadata = {
  title: 'Cross Product Visualization',
  category: 'Linear Algebra',
  description: 'Interactive 3D visualization of the vector cross product, showing the resulting vector perpendicular to both input vectors and the parallelogram area.'
};

export default function initCrossProductDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new CrossProductDemo(container, config);
  return demo.init();
}