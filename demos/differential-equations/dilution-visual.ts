import p5 from 'p5';
import type { DemoInstance, DemoConfig } from '@framework/types';
import { P5DemoBase, type DemoMetadata } from '@framework';
import type { CanvasSize } from '@framework/demo-utils';

export const metadata: DemoMetadata = {
  title: 'Dilution Process Visualization',
  category: 'Differential Equations',
  description: 'Interactive visualization of a dilution process showing vessel concentration changes over time',
  instructions: 'Adjust the sliders to change flow rates and concentrations. Watch how the vessel concentration approaches equilibrium.'
};

class DilutionVisualDemo extends P5DemoBase {
  // Parameters (matching original calculator)
  private solutionStartingVolume = 100;
  private solutionStartingMass = 20;
  private inflowVolumeRate = 1.5;
  private inflowConcentration = 0.5;
  private outflowVolumeRate = 1.5; // Positive value
  
  // Simulation state
  private time = 0;
  private currentMass: number;
  private currentVolume: number;
  private currentConcentration: number;
  private isRunning = true;
  private timeScale = 0.033; // Slower speed (~3x slower)
  
  // Method tracking
  private method = '';
  private k = 0;
  
  // UI elements
  private startVolumeSlider?: p5.Element;
  private startMassSlider?: p5.Element;
  private inflowRateSlider?: p5.Element;
  private outflowRateSlider?: p5.Element;
  private inflowConcSlider?: p5.Element;
  private targetMassSlider?: p5.Element;
  private pauseButton?: HTMLButtonElement;
  private controlPanel?: HTMLElement;
  
  // Visual constants (will be scaled)
  private vesselWidth = 120;
  private vesselHeight = 150;
  private maxPipeWidth = 35;
  private scaleFactor = 1;
  
  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
    this.currentMass = this.solutionStartingMass;
    this.currentVolume = this.solutionStartingVolume;
    this.currentConcentration = this.currentMass / this.currentVolume;
  }
  
  protected createSketch(p: p5): void {
    p.setup = () => {
      // Balanced aspect ratio - not too wide, not too tall
      const aspectRatio = p.windowWidth >= 768 ? 0.4 : 0.5;
      this.createResponsiveCanvas(p, aspectRatio, 25);
      p.colorMode(p.RGB);
      
      // Create controls with proper class name
      this.controlPanel = this.createControlPanel({ className: 'demo-control-panel' });
      
      // Add CSS for horizontal slider layout on desktop
      const style = document.createElement('style');
      style.textContent = `
        @media (min-width: 768px) {
          .demo-control-panel {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px 15px;
            max-width: 500px;
            margin: 10px auto;
            padding: 10px;
          }
          
          .demo-control-panel .demo-slider-group {
            margin: 0 !important;
            display: flex;
            flex-direction: column;
          }
          
          .demo-control-panel .demo-slider-label {
            font-size: 12px;
            margin-bottom: 4px;
          }
          
          .demo-control-panel .demo-button {
            align-self: center;
            padding: 6px 20px;
            margin-top: 5px;
          }
        }
        
        /* Make sliders more compact */
        .demo-control-panel input[type="range"] {
          margin: 0;
        }
      `;
      document.head.appendChild(style);
      
      // Sliders
      this.startVolumeSlider = this.createSlider(
        p, 'Starting Volume (gal)', 10, 200, this.solutionStartingVolume, 5,
        () => this.updateStartingConditions()
      );
      
      this.startMassSlider = this.createSlider(
        p, 'Starting Mass (lbs)', 0, 100, this.solutionStartingMass, 1,
        () => this.updateStartingConditions()
      );
      
      this.inflowRateSlider = this.createSlider(
        p, 'Inflow Rate (gal/min)', 0, 5, this.inflowVolumeRate, 0.1,
        () => this.updateParameters()
      );
      
      this.outflowRateSlider = this.createSlider(
        p, 'Outflow Rate (gal/min)', 0, 5, 1.5, 0.1,
        () => this.updateParameters()
      );
      
      this.inflowConcSlider = this.createSlider(
        p, 'Inflow Concentration', 0, 2, this.inflowConcentration, 0.05,
        () => this.updateParameters()
      );
      
      this.targetMassSlider = this.createSlider(
        p, 'Target Mass (lbs)', 0, 100, 45, 1,
        () => {} // Just for display
      );
      
      // Buttons
      this.pauseButton = this.createButton(
        'Pause',
        () => this.togglePause(),
        'demo-button'
      );
      
      this.createButton(
        'Reset',
        () => this.reset(),
        'demo-button'
      );
      
      this.reset();
    };
    
    p.draw = () => {
      p.background(255);
      
      // Update simulation
      if (this.isRunning) {
        this.updateSimulation();
      }
      
      // Update scaling
      this.updateScaling(p);
      
      // Draw components - position vessel to use canvas space efficiently
      const centerX = p.width / 2;
      const centerY = p.height * 0.55; // Slightly lower to account for top info
      
      this.drawVessel(p, centerX, centerY);
      this.drawPipes(p, centerX, centerY);
      this.drawInfo(p);
    };
  }
  
  private updateScaling(p: p5): void {
    const isMobile = p.width < 768;
    if (isMobile) {
      this.scaleFactor = Math.min(p.width / 400, p.height / 400);
    } else {
      // Better scaling to fill the canvas
      this.scaleFactor = Math.min(p.width / 280, p.height / 200, 1.5);
    }
    
    this.vesselWidth = 120 * this.scaleFactor;
    this.vesselHeight = 150 * this.scaleFactor;
    this.maxPipeWidth = 35 * this.scaleFactor;
  }
  
  private calculateMass(time: number): number {
    const a = this.inflowVolumeRate * this.inflowConcentration; // inflowMassRate
    const b = this.outflowVolumeRate; // outflowVolumeRate (positive)
    const c = this.inflowVolumeRate - this.outflowVolumeRate; // netFlowRate
    const v = this.solutionStartingVolume;
    const x0 = this.solutionStartingMass;
    
    // Case 1: netFlowRate = 0, outflowVolumeRate != 0
    if (Math.abs(c) < 0.0001 && Math.abs(b) > 0.0001) {
      this.method = "separable (c=0)";
      this.k = x0 + (v * a) / -b;
      return this.k * Math.exp((-b * time) / v) - (v * a) / -b;
    }
    
    // Case 2: inflowMassRate = 0, netFlowRate != 0
    if (Math.abs(a) < 0.0001 && Math.abs(c) > 0.0001) {
      this.method = "separable (a=0)";
      this.k = x0 * Math.pow(v, b / c);
      return this.k * Math.pow(c * time + v, -b / c);
    }
    
    // Case 3: inflowMassRate != 0, netFlowRate != 0
    if (Math.abs(a) > 0.0001 && Math.abs(c) > 0.0001) {
      this.method = "linear";
      this.k = Math.pow(v, b / c) * (x0 - (a * v) / (c - b));
      return (a * (v + c * time)) / (c - b) + this.k * Math.pow(v + c * time, -b / c);
    }
    
    // Case 4: No flow (both rates are 0)
    if (Math.abs(b) < 0.0001 && Math.abs(a) < 0.0001) {
      this.method = "constant";
      this.k = 0;
      return x0;
    }
    
    // Unsolvable case
    this.method = "unsolvable";
    this.k = 0;
    return x0; // Just return starting mass, simulation should be paused
  }
  
  private calculateTimeToReachMass(targetMass: number): number | string {
    const a = this.inflowVolumeRate * this.inflowConcentration; // inflowMassRate
    const b = this.outflowVolumeRate; // outflowVolumeRate (positive)
    const c = this.inflowVolumeRate - this.outflowVolumeRate; // netFlowRate
    const v = this.solutionStartingVolume;
    const x0 = this.solutionStartingMass;
    
    // Case 1: netFlowRate = 0, outflowVolumeRate != 0
    if (Math.abs(c) < 0.0001 && Math.abs(b) > 0.0001) {
      const k = x0 + (v * a) / -b;
      const arg = (1 / k) * (targetMass + (v * a) / -b);
      if (arg <= 0) return 'infinity';
      return (v / -b) * Math.log(arg);
    }
    
    // Case 2: inflowMassRate = 0, netFlowRate != 0
    if (Math.abs(a) < 0.0001 && Math.abs(c) > 0.0001) {
      const k = x0 * Math.pow(v, b / c);
      if (k === 0) return targetMass === 0 ? 0 : 'infinity';
      const arg = targetMass / k;
      if (arg <= 0) return 'infinity';
      return (Math.pow(arg, c / -b) - v) / c;
    }
    
    // Case 3: inflowMassRate != 0, netFlowRate != 0
    if (Math.abs(a) > 0.0001 && Math.abs(c) > 0.0001) {
      // Cannot solve analytically for time in the linear case
      return 'unsolvable';
    }
    
    // Case 4: No change
    return targetMass === x0 ? 0 : 'infinity';
  }
  
  private updateSimulation(): void {
    // Check if we can solve this case
    if (this.method === "unsolvable") {
      this.isRunning = false;
      return;
    }
    
    // Update time
    this.time += this.timeScale;
    
    // Calculate new mass using the exact formulas
    this.currentMass = this.calculateMass(this.time);
    this.currentMass = Math.max(0, this.currentMass);
    
    // Update volume
    const netFlowRate = this.inflowVolumeRate - this.outflowVolumeRate;
    this.currentVolume = this.solutionStartingVolume + netFlowRate * this.time;
    this.currentVolume = Math.max(1, this.currentVolume); // Prevent division by zero
    
    // Update concentration
    this.currentConcentration = this.currentMass / this.currentVolume;
    
    // Auto-reset when target mass is reached
    if (this.targetMassSlider) {
      const targetMass = this.targetMassSlider.value() as number;
      const tolerance = 0.5; // Within 0.5 lbs
      if (Math.abs(this.currentMass - targetMass) < tolerance) {
        this.reset();
      }
    }
  }
  
  private drawVessel(p: p5, x: number, y: number): void {
    p.push();
    p.translate(x, y);
    
    // Vessel container
    p.stroke(0);
    p.strokeWeight(3 * this.scaleFactor);
    p.noFill();
    p.rect(-this.vesselWidth/2, -this.vesselHeight/2, this.vesselWidth, this.vesselHeight);
    
    // Draw liquid level based on volume
    // Use a fixed reference volume for consistent scaling
    const referenceVolume = 200; // Fixed reference for visual scaling
    const liquidLevel = Math.min(0.95, this.currentVolume / referenceVolume);
    const liquidHeight = this.vesselHeight * liquidLevel;
    
    // Liquid color based on concentration (matching pipes)
    const liquidColor = this.getConcentrationColor(p, this.currentConcentration);
    
    p.noStroke();
    p.fill(liquidColor);
    p.rect(
      -this.vesselWidth/2 + 3,
      this.vesselHeight/2 - liquidHeight - 3,
      this.vesselWidth - 6,
      liquidHeight
    );
    
    // Draw concentration and volume values
    p.fill(0);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(14 * this.scaleFactor);
    p.text(`C = ${this.currentConcentration.toFixed(3)}`, 0, -15 * this.scaleFactor);
    p.text(`V = ${this.currentVolume.toFixed(1)} gal`, 0, 0);
    p.text(`M = ${this.currentMass.toFixed(2)} lbs`, 0, 15 * this.scaleFactor);
    
    p.pop();
  }
  
  private drawPipes(p: p5, vesselX: number, vesselY: number): void {
    const vesselTop = vesselY - this.vesselHeight/2;
    const vesselBottom = vesselY + this.vesselHeight/2;
    const vesselRight = vesselX + this.vesselWidth/2;
    
    // Inflow pipe (top)
    if (this.inflowVolumeRate > 0) {
      p.push();
      
      // Pipe width based on flow rate
      const pipeWidth = this.mapFlowRateToPipeWidth(this.inflowVolumeRate);
      
      // Pipe color based on concentration
      const pipeColor = this.getConcentrationColor(p, this.inflowConcentration);
      p.stroke(pipeColor);
      p.strokeWeight(pipeWidth);
      
      // Draw pipe
      const pipeStartY = vesselTop - 30 * this.scaleFactor;
      p.line(vesselX, pipeStartY, vesselX, vesselTop);
      
      // Draw flow arrows
      p.fill(pipeColor);
      p.noStroke();
      const numArrows = 2;
      for (let i = 0; i < numArrows; i++) {
        const arrowY = pipeStartY + (i + 1) * (30 * this.scaleFactor / (numArrows + 1));
        const arrowSize = pipeWidth * 0.4;
        p.triangle(
          vesselX - arrowSize, arrowY - arrowSize,
          vesselX + arrowSize, arrowY - arrowSize,
          vesselX, arrowY + arrowSize
        );
      }
      
      // Label
      p.fill(0);
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(14 * this.scaleFactor);
      p.text(`In: ${this.inflowVolumeRate.toFixed(1)} gal/min`, vesselX + pipeWidth/2 + 10 * this.scaleFactor, pipeStartY);
      p.text(`C: ${this.inflowConcentration.toFixed(2)}`, vesselX + pipeWidth/2 + 10 * this.scaleFactor, pipeStartY + 20 * this.scaleFactor);
      
      p.pop();
    }
    
    // Outflow pipe (bottom)
    if (this.outflowVolumeRate > 0) {
      p.push();
      
      // Pipe width based on flow rate
      const pipeWidth = this.mapFlowRateToPipeWidth(Math.abs(this.outflowVolumeRate));
      
      // Pipe color based on current vessel concentration
      const pipeColor = this.getConcentrationColor(p, this.currentConcentration);
      p.stroke(pipeColor);
      p.strokeWeight(pipeWidth);
      
      // Draw L-shaped pipe
      const pipeEndX = vesselRight + 30 * this.scaleFactor;
      const pipeBendY = vesselBottom - 15 * this.scaleFactor;
      
      // Horizontal section
      p.line(vesselRight, pipeBendY, pipeEndX, pipeBendY);
      // Vertical section - shorter to fit in canvas
      p.line(pipeEndX, pipeBendY, pipeEndX, vesselBottom + 10 * this.scaleFactor);
      
      // Draw flow arrows
      p.fill(pipeColor);
      p.noStroke();
      
      // Horizontal arrow
      const arrowX = vesselRight + 15 * this.scaleFactor;
      const arrowSizeH = pipeWidth * 0.4;
      p.triangle(
        arrowX - arrowSizeH, pipeBendY - arrowSizeH,
        arrowX - arrowSizeH, pipeBendY + arrowSizeH,
        arrowX + arrowSizeH, pipeBendY
      );
      
      // Vertical arrow
      const arrowY = pipeBendY + 10 * this.scaleFactor;
      const arrowSizeV = pipeWidth * 0.4;
      p.triangle(
        pipeEndX - arrowSizeV, arrowY - arrowSizeV,
        pipeEndX + arrowSizeV, arrowY - arrowSizeV,
        pipeEndX, arrowY + arrowSizeV
      );
      
      // Label
      p.fill(0);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(14 * this.scaleFactor);
      const isMobile = p.width < 768;
      const labelX = isMobile ? vesselRight + 10 * this.scaleFactor : pipeEndX + 10 * this.scaleFactor;
      p.text(`Out: ${Math.abs(this.outflowVolumeRate).toFixed(1)} gal/min`, labelX, pipeBendY);
      
      p.pop();
    }
  }
  
  private mapFlowRateToPipeWidth(flowRate: number): number {
    // Map flow rate (0-5) to pipe width
    return p5.prototype.map(flowRate, 0, 5, 10 * this.scaleFactor, this.maxPipeWidth);
  }
  
  private getConcentrationColor(p: p5, concentration: number): p5.Color {
    // Map concentration to color (light blue to dark blue)
    const normalizedConc = Math.min(1, concentration / 2);
    return p.lerpColor(
      p.color(173, 216, 230, 200), // Light blue
      p.color(0, 0, 139, 220),      // Dark blue
      normalizedConc
    );
  }
  
  private drawInfo(p: p5): void {
    p.fill(0);
    const isMobile = p.width < 768;
    p.textSize(11 * this.scaleFactor);
    
    // Show error message for unsolvable cases
    if (this.method === "unsolvable") {
      p.fill(255, 0, 0);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(14 * this.scaleFactor);
      p.text("Cannot solve this case analytically", p.width / 2, p.height / 2 - 60 * this.scaleFactor);
      p.textSize(11 * this.scaleFactor);
      p.text("Please adjust parameters", p.width / 2, p.height / 2 - 40 * this.scaleFactor);
      return;
    }
    
    if (isMobile) {
      // Mobile: vertical layout
      p.textAlign(p.LEFT, p.TOP);
      const infoX = 10 * this.scaleFactor;
      const infoY = 10 * this.scaleFactor;
      const lineHeight = 16 * this.scaleFactor;
      
      p.text(`Time: ${this.time.toFixed(1)} min`, infoX, infoY);
      p.text(`Net Flow: ${(this.inflowVolumeRate - this.outflowVolumeRate).toFixed(2)} gal/min`, infoX, infoY + lineHeight);
      p.text(`Method: ${this.method}`, infoX, infoY + lineHeight * 2);
      
      // Target mass info
      if (this.targetMassSlider) {
        const targetMass = this.targetMassSlider.value() as number;
        const timeToTarget = this.calculateTimeToReachMass(targetMass);
        
        if (typeof timeToTarget === 'number' && timeToTarget > 0) {
          p.text(`Time to ${targetMass.toFixed(0)} lbs: ${timeToTarget.toFixed(1)} min`, infoX, infoY + lineHeight * 3);
        } else if (timeToTarget === 'infinity') {
          p.text(`Target ${targetMass.toFixed(0)} lbs: Never reached`, infoX, infoY + lineHeight * 3);
        } else if (timeToTarget === 'unsolvable') {
          p.text(`Target ${targetMass.toFixed(0)} lbs:`, infoX, infoY + lineHeight * 3);
          p.text(`Cannot solve analytically`, infoX, infoY + lineHeight * 4);
        }
      }
    } else {
      // Desktop: horizontal layout to save vertical space
      p.textAlign(p.LEFT, p.TOP);
      const leftX = 10 * this.scaleFactor;
      const rightX = p.width * 0.7;
      const topY = 10 * this.scaleFactor;
      const lineHeight = 14 * this.scaleFactor;
      
      // Left column
      p.text(`Time: ${this.time.toFixed(1)} min`, leftX, topY);
      p.text(`Net Flow: ${(this.inflowVolumeRate - this.outflowVolumeRate).toFixed(2)} gal/min`, leftX, topY + lineHeight);
      
      // Right column
      p.text(`Method: ${this.method}`, rightX, topY);
      const startingConc = this.solutionStartingMass / this.solutionStartingVolume;
      p.text(`Starting C: ${startingConc.toFixed(3)}`, rightX, topY + lineHeight);
      
      // Target info below
      if (this.targetMassSlider) {
        const targetMass = this.targetMassSlider.value() as number;
        const timeToTarget = this.calculateTimeToReachMass(targetMass);
        
        if (typeof timeToTarget === 'number' && timeToTarget > 0) {
          p.text(`Time to ${targetMass.toFixed(0)} lbs: ${timeToTarget.toFixed(1)} min`, leftX, topY + lineHeight * 2);
        } else if (timeToTarget === 'infinity') {
          p.text(`Target ${targetMass.toFixed(0)} lbs: Never reached`, leftX, topY + lineHeight * 2);
        } else if (timeToTarget === 'unsolvable') {
          p.text(`Target ${targetMass.toFixed(0)} lbs: Cannot solve analytically`, leftX, topY + lineHeight * 2);
        }
      }
    }
  }
  
  private updateParameters(): void {
    if (this.inflowRateSlider && this.outflowRateSlider && this.inflowConcSlider) {
      this.inflowVolumeRate = this.inflowRateSlider.value() as number;
      this.outflowVolumeRate = this.outflowRateSlider.value() as number;
      this.inflowConcentration = this.inflowConcSlider.value() as number;
      // Reset when parameters change
      this.reset();
    }
  }
  
  private updateStartingConditions(): void {
    if (this.startVolumeSlider && this.startMassSlider) {
      this.solutionStartingVolume = this.startVolumeSlider.value() as number;
      this.solutionStartingMass = this.startMassSlider.value() as number;
      // Reset when starting conditions change
      this.reset();
    }
  }
  
  private togglePause(): void {
    this.isRunning = !this.isRunning;
    if (this.pauseButton) {
      this.pauseButton.textContent = this.isRunning ? 'Pause' : 'Resume';
    }
  }
  
  private reset(): void {
    this.time = 0;
    this.currentMass = this.solutionStartingMass;
    this.currentVolume = this.solutionStartingVolume;
    this.currentConcentration = this.currentMass / this.currentVolume;
    this.method = '';
    this.k = 0;
    
    // Calculate initial method to check if case is solvable
    this.calculateMass(0);
    if (this.method === "unsolvable") {
      this.isRunning = false;
      if (this.pauseButton) {
        this.pauseButton.disabled = true;
        this.pauseButton.textContent = 'Unsolvable';
      }
    } else {
      this.isRunning = true;
      if (this.pauseButton) {
        this.pauseButton.disabled = false;
        this.pauseButton.textContent = 'Pause';
      }
    }
  }
  
  protected onResize(p: p5, _size: CanvasSize): void {
    this.updateScaling(p);
  }
}

export default function createDilutionVisualDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new DilutionVisualDemo(container, config);
  return demo.init();
}