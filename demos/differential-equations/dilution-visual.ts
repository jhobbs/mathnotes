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
  
  // Graph data
  private graphWidth = 150;
  private graphHeight = 120;
  
  // UI elements
  private startVolumeSlider?: p5.Element;
  private startMassSlider?: p5.Element;
  private inflowRateSlider?: p5.Element;
  private outflowRateSlider?: p5.Element;
  private inflowConcSlider?: p5.Element;
  private targetMassSlider?: p5.Element;
  private pauseButton?: HTMLButtonElement;
  
  // Visual constants (will be scaled)
  private vesselWidth = 120;
  private vesselHeight = 150;
  private maxPipeWidth = 35;
  private scaleFactor = 1;
  private maxVesselCapacity = 300; // Maximum vessel capacity in gallons
  
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
      this.createControlPanel({ className: 'demo-control-panel' });
      
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
      
      // Draw graphs
      this.drawMassGraph(p, centerX - this.vesselWidth/2 - this.graphWidth - 40 * this.scaleFactor, centerY);
      this.drawVolumeGraph(p, centerX + this.vesselWidth/2 + 40 * this.scaleFactor, centerY);
      
      this.drawVessel(p, centerX, centerY);
      this.drawPipes(p, centerX, centerY);
      this.drawInfo(p);
    };
  }
  
  private updateScaling(p: p5): void {
    const isMobile = p.width < 768;
    if (isMobile) {
      this.scaleFactor = Math.min(p.width / 400, p.height / 400);
      // Hide graphs on mobile or make them very small
      this.graphWidth = 0;
      this.graphHeight = 0;
    } else {
      // Better scaling to fill the canvas
      this.scaleFactor = Math.min(p.width / 600, p.height / 250, 1.2);
      this.graphWidth = 150 * this.scaleFactor;
      this.graphHeight = 120 * this.scaleFactor;
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
  
  private calculateMaxGraphTime(): number {
    // Calculate various end conditions and return the maximum time needed
    let maxTime = 60; // Default minimum
    
    // Time to reach target mass
    if (this.targetMassSlider) {
      const targetMass = this.targetMassSlider.value() as number;
      const timeToTarget = this.calculateTimeToReachMass(targetMass);
      if (typeof timeToTarget === 'number' && timeToTarget > 0) {
        maxTime = Math.max(maxTime, timeToTarget * 1.2); // Add 20% padding
      }
    }
    
    // Time to reach volume limits
    const netFlow = this.inflowVolumeRate - this.outflowVolumeRate;
    if (Math.abs(netFlow) > 0.001) {
      if (netFlow > 0) {
        // Time to fill vessel
        const timeToFill = (this.maxVesselCapacity - this.solutionStartingVolume) / netFlow;
        if (timeToFill > 0) {
          maxTime = Math.max(maxTime, timeToFill * 1.2);
        }
      } else {
        // Time to empty vessel
        const timeToEmpty = (this.solutionStartingVolume - 0.1) / -netFlow;
        if (timeToEmpty > 0) {
          maxTime = Math.max(maxTime, timeToEmpty * 1.2);
        }
      }
    }
    
    // Cap at a reasonable maximum
    return Math.min(maxTime, 300); // Max 5 hours
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
    
    // Auto-reset conditions
    let shouldReset = false;
    
    // Reset when target mass is reached
    if (this.targetMassSlider) {
      const targetMass = this.targetMassSlider.value() as number;
      const tolerance = 0.5; // Within 0.5 lbs
      if (Math.abs(this.currentMass - targetMass) < tolerance) {
        shouldReset = true;
      }
    }
    
    // Reset when volume exceeds vessel capacity
    if (this.currentVolume > this.maxVesselCapacity) {
      shouldReset = true;
    }
    
    // Reset when volume reaches zero (or very close to zero)
    if (this.currentVolume <= 0.1) {
      shouldReset = true;
    }
    
    if (shouldReset) {
      this.reset();
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
    // Scale based on max capacity to show when vessel is getting full
    const liquidLevel = Math.min(0.95, this.currentVolume / this.maxVesselCapacity);
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
    
    // Show volume with warning color if approaching capacity
    if (this.currentVolume > this.maxVesselCapacity * 0.9) {
      p.fill(255, 0, 0);
    }
    p.text(`V = ${this.currentVolume.toFixed(1)} gal`, 0, 0);
    
    p.fill(0);
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
  
  private drawMassGraph(p: p5, x: number, y: number): void {
    if (this.graphWidth === 0) return; // Skip on mobile
    
    p.push();
    p.translate(x, y);
    
    const maxTime = this.calculateMaxGraphTime();
    
    // Draw axes
    p.stroke(0);
    p.strokeWeight(2);
    p.line(0, this.graphHeight/2, this.graphWidth, this.graphHeight/2); // x-axis
    p.line(0, -this.graphHeight/2, 0, this.graphHeight/2); // y-axis
    
    // Draw title
    p.fill(0);
    p.noStroke();
    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(12 * this.scaleFactor);
    p.text('Mass (lbs)', this.graphWidth/2, -this.graphHeight/2 - 10);
    
    // Calculate max mass for scaling
    let maxMass = this.solutionStartingMass;
    const inflowMassRate = this.inflowVolumeRate * this.inflowConcentration;
    if (inflowMassRate > 0) {
      // Estimate max based on equilibrium or growth
      maxMass = Math.max(maxMass, this.calculateMass(maxTime) * 1.1);
    }
    
    // Draw curve
    p.noFill();
    p.stroke(0, 0, 255);
    p.strokeWeight(2);
    p.beginShape();
    const step = Math.max(1, maxTime / 100); // Adaptive step size
    for (let t = 0; t <= maxTime; t += step) {
      const mass = this.calculateMass(t);
      const xPos = (t / maxTime) * this.graphWidth;
      const yPos = -((mass / maxMass) - 0.5) * this.graphHeight;
      p.vertex(xPos, yPos);
    }
    p.endShape();
    
    // Draw target line (dashed)
    if (this.targetMassSlider) {
      const targetMass = this.targetMassSlider.value() as number;
      const targetY = -((targetMass / maxMass) - 0.5) * this.graphHeight;
      
      p.stroke(255, 0, 0, 150);
      p.strokeWeight(2);
      p.drawingContext.setLineDash([5, 5]);
      p.line(0, targetY, this.graphWidth, targetY);
      p.drawingContext.setLineDash([]);
      
      // Label for target
      p.fill(255, 0, 0);
      p.noStroke();
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(10 * this.scaleFactor);
      p.text(`Target: ${targetMass.toFixed(0)}`, this.graphWidth + 5, targetY);
    }
    
    // Draw current position
    const currentX = (this.time / maxTime) * this.graphWidth;
    const currentY = -((this.currentMass / maxMass) - 0.5) * this.graphHeight;
    p.fill(255, 0, 0);
    p.noStroke();
    p.circle(currentX, currentY, 8 * this.scaleFactor);
    
    // Draw labels
    p.fill(0);
    p.noStroke();
    p.textAlign(p.RIGHT, p.CENTER);
    p.textSize(10 * this.scaleFactor);
    p.text(maxMass.toFixed(0), -5, -this.graphHeight/2);
    p.text('0', -5, this.graphHeight/2);
    
    p.textAlign(p.CENTER, p.TOP);
    p.text('0', 0, this.graphHeight/2 + 5);
    p.text(maxTime.toFixed(0), this.graphWidth, this.graphHeight/2 + 5);
    p.text('Time (min)', this.graphWidth/2, this.graphHeight/2 + 20);
    
    p.pop();
  }
  
  private drawVolumeGraph(p: p5, x: number, y: number): void {
    if (this.graphWidth === 0) return; // Skip on mobile
    
    p.push();
    p.translate(x, y);
    
    const maxTime = this.calculateMaxGraphTime();
    
    // Draw axes
    p.stroke(0);
    p.strokeWeight(2);
    p.line(0, this.graphHeight/2, this.graphWidth, this.graphHeight/2); // x-axis
    p.line(0, -this.graphHeight/2, 0, this.graphHeight/2); // y-axis
    
    // Draw title
    p.fill(0);
    p.noStroke();
    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(12 * this.scaleFactor);
    p.text('Volume (gal)', this.graphWidth/2, -this.graphHeight/2 - 10);
    
    // Calculate volume range for scaling
    const netFlow = this.inflowVolumeRate - this.outflowVolumeRate;
    const minVolume = Math.max(1, Math.min(this.solutionStartingVolume, this.solutionStartingVolume + netFlow * maxTime));
    const maxVolume = Math.max(this.solutionStartingVolume, this.solutionStartingVolume + netFlow * maxTime);
    const volumeRange = maxVolume - minVolume || 100;
    const paddedMin = minVolume - volumeRange * 0.1;
    const paddedMax = maxVolume + volumeRange * 0.1;
    
    // Draw curve
    p.noFill();
    p.stroke(0, 150, 0);
    p.strokeWeight(2);
    p.beginShape();
    const step = Math.max(1, maxTime / 100); // Adaptive step size
    for (let t = 0; t <= maxTime; t += step) {
      const volume = this.solutionStartingVolume + netFlow * t;
      const xPos = (t / maxTime) * this.graphWidth;
      const yPos = -((volume - paddedMin) / (paddedMax - paddedMin) - 0.5) * this.graphHeight;
      p.vertex(xPos, yPos);
    }
    p.endShape();
    
    // Draw current position
    const currentX = (this.time / maxTime) * this.graphWidth;
    const currentY = -((this.currentVolume - paddedMin) / (paddedMax - paddedMin) - 0.5) * this.graphHeight;
    p.fill(255, 0, 0);
    p.noStroke();
    p.circle(currentX, currentY, 8 * this.scaleFactor);
    
    // Draw labels
    p.fill(0);
    p.noStroke();
    p.textAlign(p.RIGHT, p.CENTER);
    p.textSize(10 * this.scaleFactor);
    p.text(paddedMax.toFixed(0), -5, -this.graphHeight/2);
    p.text(paddedMin.toFixed(0), -5, this.graphHeight/2);
    
    p.textAlign(p.CENTER, p.TOP);
    p.text('0', 0, this.graphHeight/2 + 5);
    p.text(maxTime.toFixed(0), this.graphWidth, this.graphHeight/2 + 5);
    p.text('Time (min)', this.graphWidth/2, this.graphHeight/2 + 20);
    
    p.pop();
  }
}

export default function createDilutionVisualDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new DilutionVisualDemo(container, config);
  return demo.init();
}