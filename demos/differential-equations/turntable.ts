// Turntable Demo - Bug walking on a rotating turntable
import p5 from 'p5';
import type { DemoConfig, DemoInstance, CanvasSize, DemoMetadata } from '@framework/types';
import { P5DemoBase } from '@framework';

// Type for p5 radio element with proper methods
interface P5Radio extends p5.Element {
  option(value: string, label?: string): void;
  selected(value?: string): string;
  // value() is inherited from p5.Element but returns any
}

class TurntableDemo extends P5DemoBase {
  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
  }
  // Constants - now dynamically scaled
  private RECORD_RADIUS = 280;
  private BUG_SIZE = 8;
  private ARROW_SCALAR = 20;

  private readonly MODE_TO_CENTER = 'CENTER';
  private readonly MODE_PARALLEL = 'PARALLEL';
  private readonly MODE_TO_LIGHT = 'LIGHT';

  // UI Elements
  private locomotiveSlider!: p5.Element;
  private angularVelocitySlider!: p5.Element;
  private rhoSlider!: p5.Element;
  private modeRadio!: P5Radio;
  
  // State variables
  private bug_x!: number;
  private bug_y!: number;
  private bug_theta!: number;
  private bugHistory: Array<[number, number]> = [];
  private i = 0;

  // Additional colors for this demo
  private bugColor!: p5.Color;
  private historyColor!: p5.Color;
  private locomotiveArrowColor!: p5.Color;
  private rotationalArrowColor!: p5.Color;
  private combinedArrowColor!: p5.Color;
  private startPointColor!: p5.Color;
  private endPointColor!: p5.Color;

  protected getStylePrefix(): string {
    return 'turntable';
  }
  
  protected getAspectRatio(): number {
    return 1.0; // Square aspect ratio
  }

  private updateScaling(p: p5): void {
    // Base size for scaling calculations
    const baseSize = 600;
    const minDimension = Math.min(p.width, p.height);
    const scaleFactor = minDimension / baseSize;
    
    // Scale all size-related constants
    // Leave some padding around the record (90% of available space)
    this.RECORD_RADIUS = (minDimension * 0.9) / 2;
    this.BUG_SIZE = Math.max(6, 8 * scaleFactor); // Min size of 6 for visibility
    // Larger minimum arrow scalar on mobile for better visibility
    const minArrowScalar = p.width < 768 ? 25 : 15;
    this.ARROW_SCALAR = Math.max(minArrowScalar, 20 * scaleFactor);
  }

  protected onResize(p: p5, _size: CanvasSize): void {
    this.updateScaling(p);
  }

  protected createSketch(p: p5): void {
    p.setup = () => {
      // Update scaling based on canvas size
      this.updateScaling(p);
      
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

  }

  protected updateColors(p: p5): void {
    super.updateColors(p);
    // Use theme colors instead of hardcoded values
    this.bugColor = this.colors.accent;
    
    // Create a darker version of accent for history with better contrast
    p.colorMode(p.HSB);
    const h = p.hue(this.colors.accent);
    const s = p.saturation(this.colors.accent);
    const b = p.brightness(this.colors.accent);
    // Adjust opacity based on dark/light mode for better contrast
    const isDark = this.isDarkMode;
    this.historyColor = p.color(h, s * 0.8, isDark ? b * 0.5 : b * 0.6);
    
    // Arrow colors based on theme
    this.locomotiveArrowColor = this.colors.accent; // Primary accent
    this.rotationalArrowColor = p.color((h + 120) % 360, s, b); // Complementary
    this.combinedArrowColor = p.color((h + 60) % 360, s, b); // Triadic
    
    // Start/end points
    this.startPointColor = p.color((h + 240) % 360, s, b); // Another triadic
    this.endPointColor = this.rotationalArrowColor; // Reuse complementary
    
    p.colorMode(p.RGB);
    
    // Update the arrow styles to match new colors
    this.updateArrowStyles();
  }

  protected onColorSchemeChange(_isDark: boolean): void {
    // Update UI text colors when color scheme changes
    const labels = this.container.querySelectorAll('.demo-label, .demo-info');
    labels.forEach(label => {
      (label as HTMLElement).style.color = this.colors.text;
    });
    
    // Update arrow styles with new colors
    this.updateArrowStyles();
  }
  
  private updateArrowStyles(): void {
    // Create style element if it doesn't exist
    let style = this.container.querySelector('#turntable-arrow-styles') as HTMLStyleElement;
    if (!style) {
      style = document.createElement('style');
      style.id = 'turntable-arrow-styles';
      this.container.appendChild(style);
    }
    
    // Update the styles with current colors
    if (this.locomotiveArrowColor && this.rotationalArrowColor && this.combinedArrowColor) {
      style.textContent = `
        .locomotive-arrow { color: ${this.locomotiveArrowColor.toString()}; font-weight: bold; }
        .rotational-arrow { color: ${this.rotationalArrowColor.toString()}; font-weight: bold; }
        .combined-arrow { color: ${this.combinedArrowColor.toString()}; font-weight: bold; }
      `;
    }
  }

  private setupControls(p: p5): void {
    const controlPanel = this.createControlPanel();
    
    // Create a row for sliders
    const sliderRow = document.createElement('div');
    sliderRow.style.display = 'flex';
    sliderRow.style.justifyContent = 'center';
    sliderRow.style.gap = '20px';
    sliderRow.style.flexWrap = 'wrap';
    // Reduce gap on mobile
    if (window.innerWidth < 768) {
      sliderRow.style.gap = '10px';
    }
    controlPanel.appendChild(sliderRow);
    
    // Bug locomotive speed slider - default to 90% (2.7 out of 3)
    this.locomotiveSlider = this.createSlider(
      p,
      'Bug locomotive speed',
      0, 3, 2.7, 0
    );
    sliderRow.appendChild(this.locomotiveSlider.parent() as unknown as Node);
    
    // Record angular velocity slider - default to 15% (1.5 out of 10)
    this.angularVelocitySlider = this.createSlider(
      p,
      'Record angular velocity',
      0, 10, 1.5, 0
    );
    sliderRow.appendChild(this.angularVelocitySlider.parent() as unknown as Node);
    
    // Start position slider
    this.rhoSlider = this.createSlider(
      p,
      'Start position',
      0, 2 * p.PI, 0, p.PI / 32
    );
    sliderRow.appendChild(this.rhoSlider.parent() as unknown as Node);
    
    // Mode radio buttons in separate row
    const radioRow = document.createElement('div');
    radioRow.style.marginTop = window.innerWidth < 768 ? '10px' : '20px';
    radioRow.style.textAlign = 'center';
    controlPanel.appendChild(radioRow);
    
    this.modeRadio = p.createRadio() as unknown as P5Radio;
    this.modeRadio.option(this.MODE_TO_CENTER, 'To Center');
    this.modeRadio.option(this.MODE_PARALLEL, 'Parallel to Start');
    this.modeRadio.option(this.MODE_TO_LIGHT, 'To Light');
    this.modeRadio.selected(this.MODE_TO_LIGHT);
    this.modeRadio.parent(radioRow);
    
    // Apply shared radio button styles
    const radioContainer = this.modeRadio.elt as HTMLElement;
    radioContainer.className = `${this.getStylePrefix()}-radio demo-radio`;
    
    // Instructions are now handled by metadata.instructions
    // Dynamic styles for arrow colors will be added after colors are initialized
  }

  private redo(p: p5): void {
    this.bug_theta = this.rhoSlider.value() as number;
    this.bugHistory = [];
    this.i = 0;

    this.bug_x = this.RECORD_RADIUS * p.cos(this.bug_theta);
    this.bug_y = this.RECORD_RADIUS * p.sin(this.bug_theta);
  }

  private drawRecord(p: p5): void {
    // Fill the canvas background area (outside the record)
    const isDark = this.isDarkMode;
    if (isDark) {
      // Light grey background in dark mode
      p.fill(this.colors.surface);
      p.noStroke();
      p.rect(-p.width/2, -p.height/2, p.width, p.height);
    }
    
    // Draw the vinyl record - black in both modes
    p.fill(this.isDarkMode ? this.colors.foreground : p.color(0)); // Black vinyl in light mode, foreground in dark
    p.stroke(this.colors.stroke);
    p.strokeWeight(2);
    p.circle(0, 0, this.RECORD_RADIUS * 2);
    
    // Add concentric grooves for visual interest
    p.strokeWeight(1);
    const gridColor = this.colors.grid;
    p.stroke(p.red(gridColor), p.green(gridColor), p.blue(gridColor), 80); // Semi-transparent grooves
    p.noFill();
    for (let r = 0.3; r < 1; r += 0.15) {
      p.circle(0, 0, this.RECORD_RADIUS * 2 * r);
    }
    
    // Center label (hole)
    p.fill(this.colors.surfaceAlt);
    p.noStroke();
    p.circle(0, 0, this.RECORD_RADIUS * 0.2);
    
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
    p.stroke(this.locomotiveArrowColor);
    const strokeWeight = p.width < 768 ? 4 : 3; // Thicker on mobile
    p.strokeWeight(strokeWeight);
    p.line(this.bug_x, this.bug_y, this.bug_x + locomotiveMotionVector.x, this.bug_y + locomotiveMotionVector.y);
    // Add arrowhead
    p.push();
    p.translate(this.bug_x + locomotiveMotionVector.x, this.bug_y + locomotiveMotionVector.y);
    p.rotate(p.atan2(locomotiveMotionVector.y, locomotiveMotionVector.x));
    const arrowSize = p.width < 768 ? 8 : 5;
    p.line(0, 0, -arrowSize, -arrowSize * 0.6);
    p.line(0, 0, -arrowSize, arrowSize * 0.6);
    p.pop();
    p.strokeWeight(1);
  }

  private drawRotationArrow(p: p5): void {
    const rotationalMotionVector = this.getRotationalMotionVector(p).mult(this.ARROW_SCALAR);
    p.stroke(this.rotationalArrowColor);
    const strokeWeight = p.width < 768 ? 4 : 3; // Thicker on mobile
    p.strokeWeight(strokeWeight);
    p.line(this.bug_x, this.bug_y, this.bug_x + rotationalMotionVector.x, this.bug_y + rotationalMotionVector.y);
    // Add arrowhead
    p.push();
    p.translate(this.bug_x + rotationalMotionVector.x, this.bug_y + rotationalMotionVector.y);
    p.rotate(p.atan2(rotationalMotionVector.y, rotationalMotionVector.x));
    const arrowSize = p.width < 768 ? 8 : 5;
    p.line(0, 0, -arrowSize, -arrowSize * 0.6);
    p.line(0, 0, -arrowSize, arrowSize * 0.6);
    p.pop();
    p.strokeWeight(1);
  }

  private drawCombinedArrow(p: p5): void {
    const combinedMotionVector = this.getCombinedMotionVector(p).mult(this.ARROW_SCALAR);
    p.stroke(this.combinedArrowColor);
    const strokeWeight = p.width < 768 ? 4 : 3; // Thicker on mobile
    p.strokeWeight(strokeWeight);
    p.line(this.bug_x, this.bug_y, this.bug_x + combinedMotionVector.x, this.bug_y + combinedMotionVector.y);
    // Add arrowhead
    p.push();
    p.translate(this.bug_x + combinedMotionVector.x, this.bug_y + combinedMotionVector.y);
    p.rotate(p.atan2(combinedMotionVector.y, combinedMotionVector.x));
    const arrowSize = p.width < 768 ? 8 : 5;
    p.line(0, 0, -arrowSize, -arrowSize * 0.6);
    p.line(0, 0, -arrowSize, arrowSize * 0.6);
    p.pop();
    p.strokeWeight(1);
  }

  private drawEndpoints(p: p5): void {
    const startPoint = this.getStartPoint(p);
    const endPoint = this.getEndPoint(p);
    
    // Start point
    p.fill(this.startPointColor);
    p.stroke(this.startPointColor);
    p.circle(startPoint.x, startPoint.y, this.BUG_SIZE * 5);
    
    // End point / Light
    p.fill(this.endPointColor);
    p.stroke(this.endPointColor);
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
    const mode = this.modeRadio.value();
    
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
    const mode = this.modeRadio.value();
    
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

export const metadata: DemoMetadata = {
  title: 'Turntable',
  category: 'Differential Equations',
  description: 'Simulation of a turntable system demonstrating rotational dynamics and Coriolis effects',
  instructions: `<p><strong>Instructions:</strong> Press 'z' to reset the animation</p>
    <p><strong>Arrows:</strong> <span class="locomotive-arrow">Accent</span> = bug's locomotive velocity, 
    <span class="rotational-arrow">Complementary</span> = velocity from turntable rotation, 
    <span class="combined-arrow">Triadic</span> = combined velocity</p>`
};

export default function createTurntableDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new TurntableDemo(container, config);
  return demo.init();
}