// Turntable Demo - Bug walking on a rotating turntable
import p5 from 'p5';
import type { DemoConfig, DemoInstance } from '@framework/types';
import { P5DemoBase, createControlPanel, createSlider, addDemoStyles } from '@demos/common/utils';

class TurntableDemo extends P5DemoBase {
  // Constants
  private readonly TABLE_SIZE = 600;
  private readonly RECORD_RADIUS = 200;
  private readonly ANGULAR_VELOCITY = 0.03;
  private readonly BUG_VELOCITY = 0.3;
  private readonly BUG_SIZE = 5;
  private readonly ARROW_SCALAR = 15;

  private readonly MODE_TO_CENTER = 'CENTER';
  private readonly MODE_PARALLEL = 'PARALLEL';
  private readonly MODE_TO_LIGHT = 'LIGHT';

  // UI Elements
  private locomotiveSlider!: p5.Element;
  private angularVelocitySlider!: p5.Element;
  private rhoSlider!: p5.Element;
  private modeRadio!: p5.Element;
  
  // State variables
  private bug_x!: number;
  private bug_y!: number;
  private bug_theta!: number;
  private bugHistory: Array<[number, number]> = [];
  private i = 0;

  // Additional colors for this demo
  private bugColor!: p5.Color;
  private historyColor!: p5.Color;

  protected createSketch(p: p5): void {
    p.setup = () => {
      // Get responsive canvas size with square aspect ratio
      const size = this.getCanvasSize(1.0, 0.8);
      const canvasSize = Math.min(size.width, size.height, this.TABLE_SIZE);
      
      const canvas = p.createCanvas(canvasSize, canvasSize);
      canvas.parent(this.container);
      
      // Initialize colors
      this.updateColors(p);
      
      // Add shared demo styles
      addDemoStyles(this.container);
      
      // Set up controls
      this.setupControls(p);
      
      // Initialize bug position
      this.redo(p);
    };

    p.draw = () => {
      p.background(this.colors.background);
      p.push();
      // Use the center of the turntable as origin and orient the upward direction as positive y
      p.translate(p.width / 2, p.height / 2);
      p.scale(1, -1);
      this.drawRecord(p);
      this.drawEndpoints(p);
      this.handleBug(p);
      p.pop();
    };

    p.keyPressed = () => {
      if (p.keyCode === 90) { // z key
        this.redo(p);
      }
    };

    p.windowResized = () => {
      // Only respond to window resize if no fixed dimensions
      if (this.config?.width && this.config?.height) return;
      
      const size = this.getCanvasSize(1.0, 0.8);
      const canvasSize = Math.min(size.width, size.height, this.TABLE_SIZE);
      p.resizeCanvas(canvasSize, canvasSize);
    };
  }

  protected updateColors(p: p5): void {
    super.updateColors(p);
    // Additional colors specific to this demo
    this.bugColor = this.isDarkMode ? p.color(255, 220, 0) : p.color(255, 204, 0);
    this.historyColor = this.isDarkMode ? p.color(255, 120, 0) : p.color(255, 100, 0);
  }

  protected onColorSchemeChange(isDark: boolean): void {
    // Update UI text colors when color scheme changes
    const textColor = isDark ? '#e0e0e0' : '#000000';
    const labels = this.container.querySelectorAll('.demo-label, .demo-info');
    labels.forEach(label => {
      (label as HTMLElement).style.color = textColor;
    });
  }

  private setupControls(p: p5): void {
    const controlPanel = createControlPanel(this.container, { className: 'turntable-controls' });
    
    // Create a row for sliders
    const sliderRow = document.createElement('div');
    sliderRow.style.display = 'flex';
    sliderRow.style.justifyContent = 'center';
    sliderRow.style.gap = '20px';
    sliderRow.style.flexWrap = 'wrap';
    controlPanel.appendChild(sliderRow);
    
    // Bug locomotive speed slider
    this.locomotiveSlider = createSlider(
      p,
      'Bug locomotive speed',
      0, 3, 0, 0,
      sliderRow,
      undefined,
      'demo'
    );
    
    // Record angular velocity slider
    this.angularVelocitySlider = createSlider(
      p,
      'Record angular velocity',
      0, 10, 0, 0,
      sliderRow,
      undefined,
      'demo'
    );
    
    // Start position slider
    this.rhoSlider = createSlider(
      p,
      'Start position',
      0, 2 * p.PI, 0, p.PI / 32,
      sliderRow,
      undefined,
      'demo'
    );
    
    // Mode radio buttons in separate row
    const radioRow = document.createElement('div');
    radioRow.style.marginTop = '20px';
    radioRow.style.textAlign = 'center';
    controlPanel.appendChild(radioRow);
    
    this.modeRadio = p.createRadio();
    this.modeRadio.option(this.MODE_TO_CENTER, 'To Center');
    this.modeRadio.option(this.MODE_PARALLEL, 'Parallel to Start');
    this.modeRadio.option(this.MODE_TO_LIGHT, 'To Light');
    this.modeRadio.selected(this.MODE_PARALLEL);
    this.modeRadio.parent(radioRow);
    
    // Apply shared radio button styles
    const radioContainer = this.modeRadio.elt as HTMLElement;
    radioContainer.className = 'demo-radio';
    
    // Add instructions
    const infoDiv = document.createElement('div');
    infoDiv.className = 'demo-info';
    infoDiv.style.marginTop = '20px';
    infoDiv.style.textAlign = 'center';
    infoDiv.style.color = this.colors.text;
    infoDiv.innerHTML = `
      <p><strong>Instructions:</strong> Press 'z' to reset the animation</p>
      <p><strong>Arrows:</strong> <span style="color: #0064ff;">Blue</span> = bug's locomotive velocity, 
      <span style="color: #ff0000;">Red</span> = velocity from turntable rotation, 
      <span style="color: #ffcc00;">Yellow</span> = combined velocity</p>
    `;
    this.container.appendChild(infoDiv);
  }

  private redo(p: p5): void {
    this.bug_theta = this.rhoSlider.value() as number;
    this.bugHistory = [];
    this.i = 0;

    this.bug_x = this.RECORD_RADIUS * p.cos(this.bug_theta);
    this.bug_y = this.RECORD_RADIUS * p.sin(this.bug_theta);
  }

  private drawRecord(p: p5): void {
    p.stroke(this.colors.stroke);
    p.strokeWeight(2);
    p.fill(this.colors.background);
    p.circle(0, 0, this.RECORD_RADIUS * 2);
    p.strokeWeight(1);
  }

  private drawBug(p: p5): void {
    p.fill(this.bugColor);
    p.stroke(this.bugColor);
    p.circle(this.bug_x, this.bug_y, this.BUG_SIZE);
    p.fill(this.colors.background);
    p.stroke(this.colors.stroke);
  }

  private drawHistory(p: p5): void {
    p.fill(this.historyColor);
    p.stroke(this.bugColor);
    this.bugHistory.forEach(historicalBug => {
      const historical_x = historicalBug[0];
      const historical_y = historicalBug[1];
      p.circle(historical_x, historical_y, this.BUG_SIZE);
    });
    p.fill(this.colors.background);
    p.stroke(this.colors.stroke);
  }

  private drawBugArrow(p: p5): void {
    const locomotiveMotionVector = this.getLocomotiveMotionVector(p).mult(this.ARROW_SCALAR);
    p.stroke(0, 100, 255); // Blue
    p.strokeWeight(2);
    p.line(this.bug_x, this.bug_y, this.bug_x + locomotiveMotionVector.x, this.bug_y + locomotiveMotionVector.y);
    p.strokeWeight(1);
  }

  private drawRotationArrow(p: p5): void {
    const rotationalMotionVector = this.getRotationalMotionVector(p).mult(this.ARROW_SCALAR);
    p.stroke(255, 0, 0); // Red
    p.strokeWeight(2);
    p.line(this.bug_x, this.bug_y, this.bug_x + rotationalMotionVector.x, this.bug_y + rotationalMotionVector.y);
    p.strokeWeight(1);
  }

  private drawCombinedArrow(p: p5): void {
    const combinedMotionVector = this.getCombinedMotionVector(p).mult(this.ARROW_SCALAR);
    p.stroke(255, 204, 0); // Yellow
    p.strokeWeight(2);
    p.line(this.bug_x, this.bug_y, this.bug_x + combinedMotionVector.x, this.bug_y + combinedMotionVector.y);
    p.strokeWeight(1);
  }

  private drawEndpoints(p: p5): void {
    const startPoint = this.getStartPoint(p);
    const endPoint = this.getEndPoint(p);
    
    // Start point (green)
    p.fill(0, 255, 0);
    p.stroke(0, 255, 0);
    p.circle(startPoint.x, startPoint.y, this.BUG_SIZE * 5);
    
    // End point / Light (red)
    p.fill(255, 0, 0);
    p.stroke(255, 0, 0);
    p.circle(endPoint.x, endPoint.y, this.BUG_SIZE * 5);
  }

  private handleBug(p: p5): void {
    this.moveBug(p);
    this.drawBug(p);
    this.drawHistory(p);
    this.drawBugArrow(p);
    this.drawRotationArrow(p);
    this.drawCombinedArrow(p);
  }

  private moveBug(p: p5): void {
    const mode = this.modeRadio.value() as string;
    
    if (this.i > 10000
        || (mode === this.MODE_PARALLEL && this.getBugR(p) > this.RECORD_RADIUS * 1.5)
        || (mode === this.MODE_TO_CENTER && this.getBugR(p) < this.BUG_SIZE / 2)
        || (mode === this.MODE_TO_LIGHT && this.getBug(p).dist(this.getEndPoint(p)) < this.BUG_SIZE / 2)) {
      this.redo(p);
    }

    this.i++;

    if (this.i % 2 == 0) {
      this.bugHistory.push([this.bug_x, this.bug_y]);
      if (this.bugHistory.length > 200) {
        this.bugHistory.shift();
      }
    }

    const iterations = 500;

    for (let j = 0; j < iterations; j++) {
      const combinedMotionVector = this.getCombinedMotionVector(p).div(iterations);
      this.bug_x += combinedMotionVector.x;
      this.bug_y += combinedMotionVector.y;
    }
  }

  private getLocomotiveMotionVector(p: p5): p5.Vector {
    let locomotionDirection: number;
    const mode = this.modeRadio.value() as string;
    
    if (mode === this.MODE_PARALLEL) {
      locomotionDirection = this.rhoSlider.value() as number;
    } else if (mode === this.MODE_TO_CENTER) {
      locomotionDirection = this.getBugTheta(p);
    } else if (mode === this.MODE_TO_LIGHT) {
      const endPoint = this.getEndPoint(p);
      locomotionDirection = p.atan2(this.bug_y - endPoint.y, this.bug_x - endPoint.x);
    } else {
      locomotionDirection = 0;
    }

    const speed = this.locomotiveSlider.value() as number;
    return p.createVector(-speed * p.cos(locomotionDirection), -speed * p.sin(locomotionDirection));
  }

  private getRotationalMotionVector(p: p5): p5.Vector {
    if (this.getBugR(p) > this.RECORD_RADIUS + 0.1) {
      return p.createVector(0, 0);
    }

    const motionDirection = this.getBugTheta(p) + p.PI / 2;
    const angularVelocity = this.angularVelocitySlider.value() as number;
    const linearRadialSpeed = angularVelocity * (this.getBugR(p) / this.RECORD_RADIUS);
    return p.createVector(linearRadialSpeed * p.cos(motionDirection), linearRadialSpeed * p.sin(motionDirection));
  }

  private getCombinedMotionVector(p: p5): p5.Vector {
    return this.getLocomotiveMotionVector(p).add(this.getRotationalMotionVector(p));
  }

  private getBugR(p: p5): number {
    return p.sqrt(this.bug_x ** 2 + this.bug_y ** 2);
  }

  private getBug(p: p5): p5.Vector {
    return p.createVector(this.bug_x, this.bug_y);
  }

  private getBugTheta(p: p5): number {
    return p.atan2(this.bug_y, this.bug_x);
  }

  private getStartPoint(p: p5): p5.Vector {
    const rho = this.rhoSlider.value() as number;
    return p.createVector(this.RECORD_RADIUS * p.cos(rho), this.RECORD_RADIUS * p.sin(rho));
  }

  private getEndPoint(p: p5): p5.Vector {
    const rho = this.rhoSlider.value() as number;
    return p.createVector(this.RECORD_RADIUS * p.cos(rho + p.PI), this.RECORD_RADIUS * p.sin(rho + p.PI));
  }
}

export default function createTurntableDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new TurntableDemo(container, config);
  return demo.init();
}