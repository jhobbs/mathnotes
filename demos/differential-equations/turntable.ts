// Turntable Demo - Bug walking on a rotating turntable
import p5 from 'p5';
import type { DemoConfig, DemoInstance } from '@framework/types';

export default function createTurntableDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  let sketch: p5 | null = null;

  // Constants
  const TABLE_SIZE = 600;
  const RECORD_RADIUS = 200;
  const ANGULAR_VELOCITY = 0.03;
  const BUG_VELOCITY = 0.3;
  const BUG_SIZE = 5;
  const ARROW_SCALAR = 15;

  const MODE_TO_CENTER = 'CENTER';
  const MODE_PARALLEL = 'PARALLEL';
  const MODE_TO_LIGHT = 'LIGHT';

  // State variables
  let locomotiveSlider: p5.Element;
  let angularVelocitySlider: p5.Element;
  let rhoSlider: p5.Element;
  let modeRadio: p5.Element;
  
  let bug_x: number;
  let bug_y: number;
  let bug_theta: number;
  let bugHistory: Array<[number, number]> = [];
  let i = 0;

  // Dark mode detection helper
  const isDarkMode = () => config?.darkMode ?? false;

  // Color helpers
  const getBackgroundColor = (p: p5) => isDarkMode() ? p.color(20, 20, 20) : p.color(255, 255, 255);
  const getStrokeColor = (p: p5) => isDarkMode() ? p.color(200, 200, 200) : p.color(0, 0, 0);
  const getBugColor = (p: p5) => isDarkMode() ? p.color(255, 220, 0) : p.color(255, 204, 0);
  const getHistoryColor = (p: p5) => isDarkMode() ? p.color(255, 120, 0) : p.color(255, 100, 0);
  const getTextColor = () => isDarkMode() ? '#e0e0e0' : '#000000';

  const createSketch = (p: p5) => {
    const setupSliders = () => {
      const controlsDiv = document.getElementById('turntable-controls');
      if (!controlsDiv) return;
      
      // Create control wrapper divs
      const locomotiveDiv = p.createDiv('');
      locomotiveDiv.parent(controlsDiv);
      locomotiveDiv.style('margin-bottom', '10px');
      locomotiveDiv.style('display', 'flex');
      locomotiveDiv.style('align-items', 'center');
      locomotiveDiv.style('gap', '10px');
      
      locomotiveSlider = p.createSlider(0, 3, 0, 0);
      locomotiveSlider.parent(locomotiveDiv);
      locomotiveSlider.style('width', '200px');
      
      const locomotiveLabel = p.createSpan('bug locomotive speed');
      locomotiveLabel.parent(locomotiveDiv);
      locomotiveLabel.style('color', getTextColor());
      
      const angularDiv = p.createDiv('');
      angularDiv.parent(controlsDiv);
      angularDiv.style('margin-bottom', '10px');
      angularDiv.style('display', 'flex');
      angularDiv.style('align-items', 'center');
      angularDiv.style('gap', '10px');
      
      angularVelocitySlider = p.createSlider(0, 10, 0, 0);
      angularVelocitySlider.parent(angularDiv);
      angularVelocitySlider.style('width', '200px');
      
      const angularLabel = p.createSpan('record angular velocity');
      angularLabel.parent(angularDiv);
      angularLabel.style('color', getTextColor());
      
      const rhoDiv = p.createDiv('');
      rhoDiv.parent(controlsDiv);
      rhoDiv.style('margin-bottom', '10px');
      rhoDiv.style('display', 'flex');
      rhoDiv.style('align-items', 'center');
      rhoDiv.style('gap', '10px');
      
      rhoSlider = p.createSlider(0, 2 * p.PI, 0, p.PI / 32);
      rhoSlider.parent(rhoDiv);
      rhoSlider.style('width', '200px');
      
      const rhoLabel = p.createSpan('start position');
      rhoLabel.parent(rhoDiv);
      rhoLabel.style('color', getTextColor());
    };

    const setupRadio = () => {
      const controlsDiv = document.getElementById('turntable-controls');
      if (!controlsDiv) return;
      
      const radioDiv = p.createDiv('');
      radioDiv.parent(controlsDiv);
      radioDiv.style('margin-top', '20px');
      
      modeRadio = p.createRadio();
      modeRadio.option(MODE_TO_CENTER, 'To Center');
      modeRadio.option(MODE_PARALLEL, 'Parallel to Start');
      modeRadio.option(MODE_TO_LIGHT, 'To Light');
      modeRadio.selected(MODE_PARALLEL);
      modeRadio.parent(radioDiv);
      
      // Style the radio buttons for dark mode
      if (isDarkMode()) {
        radioDiv.style('color', '#e0e0e0');
      }
    };

    const drawBug = () => {
      p.fill(getBugColor(p));
      p.stroke(getBugColor(p));
      p.circle(bug_x, bug_y, BUG_SIZE);
      p.fill(getBackgroundColor(p));
      p.stroke(getStrokeColor(p));
    };

    const drawHistory = () => {
      p.fill(getHistoryColor(p));
      p.stroke(getBugColor(p));
      bugHistory.forEach(historicalBug => {
        const historical_x = historicalBug[0];
        const historical_y = historicalBug[1];
        p.circle(historical_x, historical_y, BUG_SIZE);
      });
      p.fill(getBackgroundColor(p));
      p.stroke(getStrokeColor(p));
    };

    const redo = () => {
      bug_theta = (rhoSlider.value() as number);
      bugHistory = [];
      i = 0;

      bug_x = RECORD_RADIUS * p.cos(bug_theta);
      bug_y = RECORD_RADIUS * p.sin(bug_theta);
    };

    const drawBugArrow = () => {
      const locomotiveMotionVector = getLocomotiveMotionVector().mult(ARROW_SCALAR);
      p.stroke(0, 100, 255); // Blue
      p.strokeWeight(2);
      p.line(bug_x, bug_y, bug_x + locomotiveMotionVector.x, bug_y + locomotiveMotionVector.y);
      p.strokeWeight(1);
    };

    const drawRotationArrow = () => {
      const rotationalMotionVector = getRotationalMotionVector().mult(ARROW_SCALAR);
      p.stroke(255, 0, 0); // Red
      p.strokeWeight(2);
      p.line(bug_x, bug_y, bug_x + rotationalMotionVector.x, bug_y + rotationalMotionVector.y);
      p.strokeWeight(1);
    };

    const getCombinedMotionVector = () => {
      return getLocomotiveMotionVector().add(getRotationalMotionVector());
    };

    const drawCombinedArrow = () => {
      const combinedMotionVector = getCombinedMotionVector().mult(ARROW_SCALAR);
      p.stroke(255, 204, 0); // Yellow
      p.strokeWeight(2);
      p.line(bug_x, bug_y, bug_x + combinedMotionVector.x, bug_y + combinedMotionVector.y);
      p.strokeWeight(1);
    };

    const getLocomotiveMotionVector = (): p5.Vector => {
      let locomotionDirection: number;
      const mode = modeRadio.value() as string;
      
      if (mode === MODE_PARALLEL) {
        locomotionDirection = rhoSlider.value() as number;
      } else if (mode === MODE_TO_CENTER) {
        locomotionDirection = getBugTheta();
      } else if (mode === MODE_TO_LIGHT) {
        const endPoint = getEndPoint();
        locomotionDirection = p.atan2(bug_y - endPoint.y, bug_x - endPoint.x);
      } else {
        locomotionDirection = 0;
      }

      const speed = locomotiveSlider.value() as number;
      return p.createVector(-speed * p.cos(locomotionDirection), -speed * p.sin(locomotionDirection));
    };

    const getRotationalMotionVector = (): p5.Vector => {
      if (getBugR() > RECORD_RADIUS + 0.1) {
        return p.createVector(0, 0);
      }

      const motionDirection = getBugTheta() + p.PI / 2;
      const angularVelocity = angularVelocitySlider.value() as number;
      const linearRadialSpeed = angularVelocity * (getBugR() / RECORD_RADIUS);
      return p.createVector(linearRadialSpeed * p.cos(motionDirection), linearRadialSpeed * p.sin(motionDirection));
    };

    const getBugR = () => {
      return p.sqrt(bug_x ** 2 + bug_y ** 2);
    };

    const getBug = () => {
      return p.createVector(bug_x, bug_y);
    };

    const getBugTheta = () => {
      return p.atan2(bug_y, bug_x);
    };

    const moveBug = () => {
      const mode = modeRadio.value() as string;
      
      if (i > 10000
          || (mode === MODE_PARALLEL && getBugR() > RECORD_RADIUS * 1.5)
          || (mode === MODE_TO_CENTER && getBugR() < BUG_SIZE / 2)
          || (mode === MODE_TO_LIGHT && getBug().dist(getEndPoint()) < BUG_SIZE / 2)) {
        redo();
      }

      i++;

      if (i % 2 == 0) {
        bugHistory.push([bug_x, bug_y]);
        if (bugHistory.length > 200) {
          bugHistory.shift();
        }
      }

      const iterations = 500;

      for (let j = 0; j < iterations; j++) {
        const combinedMotionVector = getCombinedMotionVector().div(iterations);
        bug_x += combinedMotionVector.x;
        bug_y += combinedMotionVector.y;
      }
    };

    const drawRecord = () => {
      p.stroke(getStrokeColor(p));
      p.strokeWeight(2);
      p.fill(getBackgroundColor(p));
      p.circle(0, 0, RECORD_RADIUS * 2);
      
      // Draw some grooves on the record
      p.strokeWeight(0.5);
      for (let r = 40; r < RECORD_RADIUS; r += 20) {
        p.circle(0, 0, r * 2);
      }
      p.strokeWeight(1);
    };

    const handleBug = () => {
      moveBug();
      drawBug();
      drawHistory();
      drawBugArrow();
      drawRotationArrow();
      drawCombinedArrow();
    };

    const getStartPoint = () => {
      const rho = rhoSlider.value() as number;
      return p.createVector(RECORD_RADIUS * p.cos(rho), RECORD_RADIUS * p.sin(rho));
    };

    const getEndPoint = () => {
      const rho = rhoSlider.value() as number;
      return p.createVector(RECORD_RADIUS * p.cos(rho + p.PI), RECORD_RADIUS * p.sin(rho + p.PI));
    };

    const drawEndpoints = () => {
      const startPoint = getStartPoint();
      const endPoint = getEndPoint();
      
      // Start point (green)
      p.fill(0, 255, 0);
      p.stroke(0, 255, 0);
      p.circle(startPoint.x, startPoint.y, BUG_SIZE * 5);
      
      // End point / Light (red)
      p.fill(255, 0, 0);
      p.stroke(255, 0, 0);
      p.circle(endPoint.x, endPoint.y, BUG_SIZE * 5);
    };

    p.setup = () => {
      // Responsive sizing
      let canvasSize: number;
      
      if (p.windowWidth < 768) {
        canvasSize = p.min(p.windowWidth - 40, TABLE_SIZE);
      } else {
        canvasSize = config?.width || p.min(container.offsetWidth - 40, TABLE_SIZE);
      }
      
      const canvas = p.createCanvas(canvasSize, canvasSize);
      canvas.parent(container);
      
      setupSliders();
      setupRadio();
      redo();
    };

    p.draw = () => {
      p.background(getBackgroundColor(p));
      p.push();
      // Use the center of the turntable as origin and orient the upward direction as positive y
      p.translate(p.width / 2, p.height / 2);
      p.scale(1, -1);
      drawRecord();
      drawEndpoints();
      handleBug();
      p.pop();
    };

    p.keyPressed = () => {
      if (p.keyCode === 90) { // z key
        redo();
      }
    };

    p.windowResized = () => {
      // Only respond to window resize if no fixed dimensions
      if (config?.width && config?.height) return;
      
      let canvasSize: number;
      
      if (p.windowWidth < 768) {
        canvasSize = p.min(p.windowWidth - 40, TABLE_SIZE);
      } else {
        canvasSize = p.min(container.offsetWidth - 40, TABLE_SIZE);
      }
      
      p.resizeCanvas(canvasSize, canvasSize);
    };
  };

  // Create container structure
  const sketchContainer = document.createElement('div');
  sketchContainer.id = `turntable-sketch-${Date.now()}`;
  sketchContainer.style.textAlign = 'center';
  container.appendChild(sketchContainer);

  const controlsDiv = document.createElement('div');
  controlsDiv.id = 'turntable-controls';
  controlsDiv.style.marginTop = '20px';
  container.appendChild(controlsDiv);

  // Add instructions
  const infoDiv = document.createElement('div');
  infoDiv.style.marginTop = '20px';
  infoDiv.style.textAlign = 'center';
  infoDiv.style.color = isDarkMode() ? '#e0e0e0' : '#000000';
  infoDiv.innerHTML = `
    <p><strong>Instructions:</strong> Press 'z' to reset the animation</p>
    <p><strong>Arrows:</strong> <span style="color: #0064ff;">Blue</span> = bug's locomotive velocity, 
    <span style="color: #ff0000;">Red</span> = velocity from turntable rotation, 
    <span style="color: #ffcc00;">Yellow</span> = combined velocity</p>
  `;
  container.appendChild(infoDiv);

  // Create and start sketch
  sketch = new p5(createSketch, sketchContainer);

  return {
    cleanup: () => {
      if (sketch) {
        sketch.remove();
        sketch = null;
      }
      container.innerHTML = '';
    },
    resize: () => {
      if (sketch && sketch.windowResized) {
        sketch.windowResized();
      }
    }
  };
}