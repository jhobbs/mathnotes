// Projection demo - Interactive visualization of projective transformations
import p5 from 'p5';
import * as math from 'mathjs';
import type { DemoInstance, DemoConfig } from '@framework/types';

export default function initProjectionDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  let p5Instance: p5 | null = null;

  // Create the demo container structure
  const demoContainer = document.createElement('div');
  demoContainer.style.display = 'flex';
  demoContainer.style.flexDirection = 'column';
  demoContainer.style.alignItems = 'center';
  container.appendChild(demoContainer);

  const sketch = (p: p5) => {
    let cameraAngleXSlider: p5.Element;
    let cameraAngleYSlider: p5.Element;
    let cameraAngleZSlider: p5.Element;
    let focalSlider: p5.Element;
    let translateXSlider: p5.Element;
    let translateYSlider: p5.Element;
    let translateZSlider: p5.Element;

    p.setup = () => {
      const canvas = p.createCanvas(p.windowWidth * 0.9, 400);
      canvas.parent(demoContainer);
      (canvas as any).canvas.style.display = 'block';
      (canvas as any).canvas.style.position = 'relative';

      // Create a container for all controls
      const controlsContainer = p.createDiv();
      controlsContainer.parent(demoContainer);
      controlsContainer.style('margin-top: 20px');
      controlsContainer.style('width: 100%');
      controlsContainer.style('text-align: center');

      // Helper function to create slider row
      function createSliderRow(label: string, min: number, max: number, value: number, step: number): p5.Element {
        const rowDiv = p.createDiv();
        rowDiv.parent(controlsContainer);
        rowDiv.style('margin-bottom: 10px');
        rowDiv.style('display: flex');
        rowDiv.style('align-items: center');
        rowDiv.style('justify-content: center');
        rowDiv.style('gap: 10px');
        
        const slider = p.createSlider(min, max, value, step);
        slider.parent(rowDiv);
        slider.style('width: 200px');
        slider.input(() => p.redraw());
        
        const labelDiv = p.createDiv(label);
        labelDiv.parent(rowDiv);
        labelDiv.style('width: 150px');
        labelDiv.style('text-align: left');
        labelDiv.style(`color: ${config?.darkMode ? '#e0e0e0' : '#333'}`);
        
        return slider;
      }

      // Create all sliders
      cameraAngleXSlider = createSliderRow('Camera Angle (X-axis)', -p.PI, p.PI, 0, 0.01);
      cameraAngleYSlider = createSliderRow('Camera Angle (Y-axis)', -p.PI, p.PI, 0, 0.01);
      cameraAngleZSlider = createSliderRow('Camera Angle (Z-axis)', -p.PI, p.PI, 0, 0.01);
      focalSlider = createSliderRow('Focal Length', 1, 30, 15, 0.1);
      translateXSlider = createSliderRow('Translate X', -200, 200, 0, 1);
      translateYSlider = createSliderRow('Translate Y', -200, 200, 0, 1);
      translateZSlider = createSliderRow('Translate Z', -200, 200, 100, 1);

      // Add CSS for slider styling based on dark mode
      const style = document.createElement('style');
      style.textContent = `
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        input[type="range"]::-webkit-slider-track {
          background: ${config?.darkMode ? '#444' : '#ddd'};
          height: 6px;
          border-radius: 3px;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: ${config?.darkMode ? '#888' : '#666'};
          height: 16px;
          width: 16px;
          border-radius: 50%;
          margin-top: -5px;
        }
        
        input[type="range"]::-moz-range-track {
          background: ${config?.darkMode ? '#444' : '#ddd'};
          height: 6px;
          border-radius: 3px;
        }
        
        input[type="range"]::-moz-range-thumb {
          background: ${config?.darkMode ? '#888' : '#666'};
          height: 16px;
          width: 16px;
          border-radius: 50%;
          border: none;
        }
      `;
      container.appendChild(style);

      p.noLoop();
    };

    p.draw = () => {
      // Check dark mode
      const isDark = config?.darkMode ?? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        p.background(32); // Dark background
      } else {
        p.background(220); // Light background
      }
      
      // Get the camera angle values from the sliders
      const cameraAngleX = -(cameraAngleXSlider.value() as number);
      const cameraAngleY = -(cameraAngleYSlider.value() as number);
      const cameraAngleZ = -(cameraAngleZSlider.value() as number);

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
      const translateX = translateXSlider.value() as number;
      const translateY = translateYSlider.value() as number;
      const translateZ = translateZSlider.value() as number;
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
      const focalLength = focalSlider.value() as number;

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

      // Set colors based on dark mode
      if (isDark) {
        p.fill(200); // Light gray for dark mode
      } else {
        p.fill(0); // Black for light mode
      }
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
      if (isDark) {
        p.stroke(200); // Light gray for dark mode
      } else {
        p.stroke(0); // Black for light mode
      }
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
      p.resizeCanvas(p.windowWidth * 0.9, 400);
    };
  };

  // Initialize p5 instance
  p5Instance = new p5(sketch);

  return {
    cleanup: () => {
      if (p5Instance) {
        p5Instance.remove();
        p5Instance = null;
      }
      container.innerHTML = '';
    },
    
    resize: () => {
      if (p5Instance && p5Instance.windowResized) {
        p5Instance.windowResized();
      }
    }
  };
}