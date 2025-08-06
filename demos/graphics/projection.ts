// Projection demo - Interactive visualization of projective transformations
import p5 from 'p5';
import * as math from 'mathjs';
import type { DemoInstance, DemoConfig, DemoMetadata } from '@framework/types';
import { P5DemoBase } from '@framework';

// Extend p5.Element to include slider DOM properties
interface P5SliderElement extends p5.Element {
  elt: HTMLInputElement & {
    min: string;
    max: string;
  };
}

class ProjectionDemo extends P5DemoBase {
  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
  }
  // Sliders
  private cameraAngleXSlider!: p5.Element;
  private cameraAngleYSlider!: p5.Element;
  private cameraAngleZSlider!: p5.Element;
  private focalSlider!: p5.Element;
  private translateXSlider!: p5.Element;
  private translateYSlider!: p5.Element;
  private translateZSlider!: p5.Element;
  
  // Scaling factors
  private dotScale: number = 1;
  private featureDotSize: number = 100;
  private gridDotSize: number = 5;
  private translationRange: number = 200;
  
  protected getStylePrefix(): string {
    return 'projection';
  }
  
  protected getAspectRatio(): number {
    return 0.5;
  }
  
  private updateScaling(p: p5): void {
    // Base scaling on the smaller dimension for consistent appearance
    const baseSize = Math.min(p.width, p.height);
    this.dotScale = baseSize / 400; // 400 is our reference size
    
    // Scale dot sizes - larger on mobile for better visibility
    const isMobile = p.width < 768;
    this.featureDotSize = isMobile ? 150 * this.dotScale : 100 * this.dotScale;
    this.gridDotSize = isMobile ? 12 * this.dotScale : 5 * this.dotScale;
    
    // Scale translation range based on canvas size
    this.translationRange = baseSize * 0.5;
  }
  
  protected onResize(p: p5): void {
    // Update scaling when canvas resizes
    this.updateScaling(p);
    
    // Update slider ranges if they exist
    if (this.translateXSlider) {
      const currentX = this.translateXSlider.value() as number;
      (this.translateXSlider as P5SliderElement).elt.min = String(-this.translationRange);
      (this.translateXSlider as P5SliderElement).elt.max = String(this.translationRange);
      this.translateXSlider.value(currentX);
      
      const currentY = this.translateYSlider.value() as number;
      (this.translateYSlider as P5SliderElement).elt.min = String(-this.translationRange);
      (this.translateYSlider as P5SliderElement).elt.max = String(this.translationRange);
      this.translateYSlider.value(currentY);
      
      const currentZ = this.translateZSlider.value() as number;
      (this.translateZSlider as P5SliderElement).elt.min = String(-this.translationRange);
      (this.translateZSlider as P5SliderElement).elt.max = String(this.translationRange);
      this.translateZSlider.value(currentZ);
    }
    
    p.redraw();
  }

  protected createSketch(p: p5): void {
    p.setup = () => {
      // Create control panel
      const controlPanel = this.createControlPanel();
      
      // Create a responsive grid for controls
      const controlGrid = document.createElement('div');
      controlGrid.className = 'demo-control-grid';
      controlGrid.style.gap = 'var(--space-lg)';
      controlGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
      controlPanel.appendChild(controlGrid);
      
      // Camera rotation group
      const cameraGroup = document.createElement('div');
      cameraGroup.className = 'demo-control-group';
      controlGrid.appendChild(cameraGroup);
      
      const cameraHeader = document.createElement('div');
      cameraHeader.className = 'demo-control-group-header';
      cameraHeader.textContent = 'Camera Rotation';
      cameraGroup.appendChild(cameraHeader);
      
      const cameraSliders = document.createElement('div');
      cameraSliders.className = 'demo-control-group-content demo-control-group-content--row';
      cameraSliders.style.gap = 'var(--space-sm)';
      cameraGroup.appendChild(cameraSliders);
      
      // Camera angle sliders
      this.cameraAngleXSlider = this.createSlider(p, 'X', -p.PI, p.PI, 0, 0.01, () => p.redraw());
      cameraSliders.appendChild(this.cameraAngleXSlider.parent() as unknown as Node);
      this.cameraAngleYSlider = this.createSlider(p, 'Y', -p.PI, p.PI, 0, 0.01, () => p.redraw());
      cameraSliders.appendChild(this.cameraAngleYSlider.parent() as unknown as Node);
      this.cameraAngleZSlider = this.createSlider(p, 'Z', -p.PI, p.PI, 0, 0.01, () => p.redraw());
      cameraSliders.appendChild(this.cameraAngleZSlider.parent() as unknown as Node);
      
      // Translation group
      const translateGroup = document.createElement('div');
      translateGroup.className = 'demo-control-group';
      controlGrid.appendChild(translateGroup);
      
      const translateHeader = document.createElement('div');
      translateHeader.className = 'demo-control-group-header';
      translateHeader.textContent = 'Translation';
      translateGroup.appendChild(translateHeader);
      
      const translateSliders = document.createElement('div');
      translateSliders.className = 'demo-control-group-content demo-control-group-content--row';
      translateSliders.style.gap = 'var(--space-sm)';
      translateGroup.appendChild(translateSliders);
      
      // Translation sliders - ranges will be updated after scaling
      this.translateXSlider = this.createSlider(p, 'X', -this.translationRange, this.translationRange, 0, 1, () => p.redraw());
      translateSliders.appendChild(this.translateXSlider.parent() as unknown as Node);
      this.translateYSlider = this.createSlider(p, 'Y', -this.translationRange, this.translationRange, 0, 1, () => p.redraw());
      translateSliders.appendChild(this.translateYSlider.parent() as unknown as Node);
      this.translateZSlider = this.createSlider(p, 'Z', -this.translationRange, this.translationRange, 100, 1, () => p.redraw());
      translateSliders.appendChild(this.translateZSlider.parent() as unknown as Node);
      
      // Focal length group
      const focalGroup = document.createElement('div');
      focalGroup.className = 'demo-control-group';
      controlGrid.appendChild(focalGroup);
      
      const focalHeader = document.createElement('div');
      focalHeader.className = 'demo-control-group-header';
      focalHeader.textContent = 'Focal Length';
      focalGroup.appendChild(focalHeader);
      
      const focalContent = document.createElement('div');
      focalContent.className = 'demo-control-group-content';
      focalGroup.appendChild(focalContent);
      
      this.focalSlider = this.createSlider(p, '', 1, 30, 15, 0.1, () => p.redraw());
      focalContent.appendChild(this.focalSlider.parent() as unknown as Node);
      
      // Initialize scaling
      this.updateScaling(p);
      
      p.noLoop();
    };

    p.draw = () => {
      // Use theme-aware background
      p.background(this.colors.background);
      
      // Get the camera angle values from the sliders
      const cameraAngleX = -(this.cameraAngleXSlider.value() as number);
      const cameraAngleY = -(this.cameraAngleYSlider.value() as number);
      const cameraAngleZ = -(this.cameraAngleZSlider.value() as number);

      // Define the 4x4 transformation matrices for camera rotation around X, Y, and Z axes
      const cX = p.cos(cameraAngleX);
      const sX = p.sin(cameraAngleX);
      const cameraRotationXMatrix = math.matrix([
        [1, 0, 0, 0],
        [0, cX, -sX, 0],
        [0, sX, cX, 0],
        [0, 0, 0, 1]
      ]);

      const cY = p.cos(cameraAngleY);
      const sY = p.sin(cameraAngleY);
      const cameraRotationYMatrix = math.matrix([
        [cY, 0, sY, 0],
        [0, 1, 0, 0],
        [-sY, 0, cY, 0],
        [0, 0, 0, 1]
      ]);

      const cZ = p.cos(cameraAngleZ);
      const sZ = p.sin(cameraAngleZ);
      const cameraRotationZMatrix = math.matrix([
        [cZ, -sZ, 0, 0],
        [sZ, cZ, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ]);

      // Define the 4x4 transformation matrix for translation
      const translateX = this.translateXSlider.value() as number;
      const translateY = this.translateYSlider.value() as number;
      const translateZ = this.translateZSlider.value() as number;
      const translationMatrix = math.matrix([
        [1, 0, 0, translateX],
        [0, 1, 0, translateY],
        [0, 0, 1, translateZ],
        [0, 0, 0, 1]
      ]);

      // Combine the camera rotation matrices and translation matrix
      const rotationMatrix = math.multiply(
        math.multiply(cameraRotationXMatrix, cameraRotationYMatrix),
        cameraRotationZMatrix
      ) as math.Matrix;

      // Focal length for perspective projection
      const focalLength = this.focalSlider.value() as number;

      // Define the 4x4 perspective projection matrix
      const perspectiveMatrix = math.matrix([
        [focalLength, 0, 0, 0],
        [0, focalLength, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 1 / focalLength, 0]
      ]);

      // Combine the transformation matrix with the perspective projection matrix
      const transformationMatrix = math.multiply(
        perspectiveMatrix,
        math.multiply(rotationMatrix, translationMatrix)
      ) as math.Matrix;
      
      // Define the points for a happy face in homogeneous coordinates
      const points = [
        math.matrix([-30, -30, 100, 1]), // Left eye
        math.matrix([30, -30, 100, 1]),  // Right eye
        math.matrix([0, 10, 100, 1]),    // Nose
        math.matrix([-30, 30, 100, 1]),  // Mouth left
        math.matrix([-15, 40, 100, 1]),  // Mouth mid-left
        math.matrix([0, 45, 100, 1]),    // Mouth middle
        math.matrix([15, 40, 100, 1]),   // Mouth mid-right
        math.matrix([30, 30, 100, 1])    // Mouth right
      ];

      // Use theme-aware colors
      p.fill(this.colors.foreground);
      p.noStroke();

      // Apply matrix multiplication to each point and draw the resulting points
      for (const point of points) {
        // Apply the transformation matrix
        const transformedPoint = math.multiply(transformationMatrix, point) as math.Matrix;
        const w = transformedPoint.get([3]);
        const projectedX = transformedPoint.get([0]) / w;
        const projectedY = transformedPoint.get([1]) / w;

        p.circle(projectedX + p.width / 2, projectedY + p.height / 2, this.featureDotSize / w);
      }

      // Draw a dense bounding box around the face
      p.stroke(this.colors.stroke);
      p.noFill();
      const boundingBoxPoints: math.Matrix[] = [];
      const halfSize = 120;
      const isMobile = p.width < 768;
      const gridSpacing = isMobile ? 20 : 10; // Less dense grid on mobile
      for (let x = -halfSize; x <= halfSize; x += gridSpacing) {
        for (let y = -halfSize; y <= halfSize; y += gridSpacing) {
          const z = 100;
          boundingBoxPoints.push(math.matrix([x, y, z, 1]));
        }
      }

      for (const point of boundingBoxPoints) {
        // Apply the transformation matrix
        const transformedPoint = math.multiply(transformationMatrix, point) as math.Matrix;
        const w = transformedPoint.get([3]);
        const projectedX = transformedPoint.get([0]) / w;
        const projectedY = transformedPoint.get([1]) / w;

        p.circle(projectedX + p.width / 2, projectedY + p.height / 2, this.gridDotSize / w);
      }
    };
  }
}

export const metadata: DemoMetadata = {
  title: '3D Projection',
  category: 'Graphics',
  description: 'Interactive demonstration of 3D perspective projection using transformation matrices'
};

export default function initProjectionDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new ProjectionDemo(container, config);
  return demo.init();
}
