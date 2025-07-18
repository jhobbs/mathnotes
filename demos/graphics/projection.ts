// Projection demo - Interactive visualization of projective transformations
import p5 from 'p5';
import * as math from 'mathjs';
import type { DemoInstance, DemoConfig } from '@framework/types';
import { createDemoContainer, P5DemoBase, createSlider } from '@demos/common/utils';

class ProjectionDemo extends P5DemoBase {
  private canvasParent: HTMLElement;
  private controlsContainer: HTMLElement;
  
  // Sliders
  private cameraAngleXSlider!: p5.Element;
  private cameraAngleYSlider!: p5.Element;
  private cameraAngleZSlider!: p5.Element;
  private focalSlider!: p5.Element;
  private translateXSlider!: p5.Element;
  private translateYSlider!: p5.Element;
  private translateZSlider!: p5.Element;
  
  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config);
    
    const { containerEl, canvasParent } = createDemoContainer(container, {
      center: true
    });
    this.canvasParent = canvasParent;
    
    // Create controls container
    this.controlsContainer = document.createElement('div');
    this.controlsContainer.style.marginTop = '20px';
    this.controlsContainer.style.width = '100%';
    this.controlsContainer.style.textAlign = 'center';
    containerEl.appendChild(this.controlsContainer);
  }

  protected createSketch(p: p5): void {
    p.setup = () => {
      // Use responsive sizing
      const size = this.getCanvasSize(0.5); // Wider aspect ratio for projection demo
      const canvas = p.createCanvas(size.width, size.height);
      canvas.parent(this.canvasParent);
      
      // Initialize colors
      this.updateColors(p);
      
      // Create all sliders
      this.cameraAngleXSlider = createSlider(p, 'Camera Angle (X-axis)', -p.PI, p.PI, 0, 0.01, this.controlsContainer, () => p.redraw(), 'projection');
      this.cameraAngleYSlider = createSlider(p, 'Camera Angle (Y-axis)', -p.PI, p.PI, 0, 0.01, this.controlsContainer, () => p.redraw(), 'projection');
      this.cameraAngleZSlider = createSlider(p, 'Camera Angle (Z-axis)', -p.PI, p.PI, 0, 0.01, this.controlsContainer, () => p.redraw(), 'projection');
      this.focalSlider = createSlider(p, 'Focal Length', 1, 30, 15, 0.1, this.controlsContainer, () => p.redraw(), 'projection');
      this.translateXSlider = createSlider(p, 'Translate X', -200, 200, 0, 1, this.controlsContainer, () => p.redraw(), 'projection');
      this.translateYSlider = createSlider(p, 'Translate Y', -200, 200, 0, 1, this.controlsContainer, () => p.redraw(), 'projection');
      this.translateZSlider = createSlider(p, 'Translate Z', -200, 200, 100, 1, this.controlsContainer, () => p.redraw(), 'projection');
      
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

        p.circle(projectedX + p.width / 2, projectedY + p.height / 2, 100 / w);
      }

      // Draw a dense bounding box around the face
      p.stroke(this.colors.stroke);
      p.noFill();
      const boundingBoxPoints: math.Matrix[] = [];
      const halfSize = 120;
      for (let x = -halfSize; x <= halfSize; x += 10) {
        for (let y = -halfSize; y <= halfSize; y += 10) {
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

        p.circle(projectedX + p.width / 2, projectedY + p.height / 2, 5 / w);
      }
    };

    p.windowResized = () => {
      this.handleResize(p);
    };
  }
  
  init(): DemoInstance {
    // Add CSS styles for this demo with dark mode support
    const style = document.createElement('style');
    style.textContent = `
      .projection-label {
        color: #333;
      }
      
      @media (prefers-color-scheme: dark) {
        .projection-label {
          color: #e0e0e0;
        }
      }
    `;
    this.container.appendChild(style);
    
    return super.init();
  }
}

export default function initProjectionDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new ProjectionDemo(container, config);
  return demo.init();
}