// Pendulum Demo - Simple harmonic motion of a pendulum
import p5 from 'p5';
import type { DemoConfig, DemoInstance } from '@framework/types';
import { P5DemoBase, createDemoContainer, addDemoStyles, createSlider } from '@demos/common/utils';

class PendulumDemo extends P5DemoBase {

  // Constants
  private readonly PIVOT_X = 0;
  private readonly PIVOT_Y_RATIO = 0.4; // 40% down from center (closer to top)"
  private readonly PIVOT_RADIUS = 2;
  private readonly BOB_RADIUS = 20;
  private readonly PIXELS_PER_FOOT = 20;
  private readonly G = 32; // gravitational constant in ft/s^2

  // State variables
  private lengthSlider!: p5.Element;
  private angularVelocitySlider!: p5.Element;
  private angleSlider!: p5.Element;
  
  private initial_bob_theta!: number;
  private wire_length!: number;
  private omega_naught!: number;
  private start_time!: number;
  
  // UI elements
  private canvasParent: HTMLElement;
  private controlsDiv: HTMLElement;
  private infoDiv: HTMLElement;
  
  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config);
    
    // Add styles
    addDemoStyles(container, 'pendulum');
    
    // Create container structure
    const { containerEl, canvasParent } = createDemoContainer(container, {
      center: true,
      id: 'pendulum-container'
    });
    this.canvasParent = canvasParent;
    
    // Create controls container
    this.controlsDiv = document.createElement('div');
    this.controlsDiv.id = 'pendulum-controls';
    this.controlsDiv.style.marginTop = '20px';
    this.controlsDiv.style.textAlign = 'center';
    containerEl.appendChild(this.controlsDiv);
    
    // Create info display
    this.infoDiv = document.createElement('div');
    this.infoDiv.style.marginTop = '20px';
    this.infoDiv.style.textAlign = 'center';
    this.infoDiv.innerHTML = `
      <div id="wire-length-display" class="pendulum-info"></div>
      <div id="period-display" class="pendulum-info"></div>
    `;
    containerEl.appendChild(this.infoDiv);
  }

  protected createSketch(p: p5): void {
    const setupSliders = () => {
      // Create horizontal layout for sliders
      const sliderRow = document.createElement('div');
      sliderRow.style.display = 'flex';
      sliderRow.style.justifyContent = 'center';
      sliderRow.style.gap = '20px';
      this.controlsDiv.appendChild(sliderRow);
      
      // Wire length control
      this.lengthSlider = createSlider(p, 'Wire Length', 0, 20, 5, 0, sliderRow, () => this.redo(), 'pendulum');
      
      // Angular velocity control
      this.angularVelocitySlider = createSlider(p, 'Starting Angular Velocity', 0, 10, 0, 0, sliderRow, () => this.redo(), 'pendulum');
      
      // Starting angle control  
      this.angleSlider = createSlider(p, 'Starting Angle', 0, p.PI, p.PI / 4, p.PI / 32, sliderRow, () => this.redo(), 'pendulum');
    };

    const getTime = (): number => {
      return (Date.now() - this.start_time) / 1000;
    };

    this.redo = () => {
      this.initial_bob_theta = this.angleSlider.value() as number;
      this.wire_length = this.lengthSlider.value() as number;
      this.omega_naught = this.angularVelocitySlider.value() as number;
      this.start_time = Date.now();
    };

    const updateInfo = () => {
      const lengthDisplay = document.getElementById('wire-length-display');
      const periodDisplay = document.getElementById('period-display');
      
      if (lengthDisplay) {
        lengthDisplay.textContent = `Wire length: ${this.wire_length.toFixed(2)} ft`;
      }
      
      if (periodDisplay) {
        periodDisplay.textContent = `Period: ${(2 * p.PI * p.sqrt(this.wire_length / this.G)).toFixed(2)} sec`;
      }
    };

    const getBobPosition = (): p5.Vector => {
      const amplitude = p.sqrt(
        p.pow(this.initial_bob_theta, 2) + 
        (this.wire_length / this.G) * p.pow(this.omega_naught, 2)
      );
      
      const phase = p.atan2(
        this.omega_naught * p.sqrt(this.wire_length / this.G), 
        this.initial_bob_theta
      );
      
      const bob_theta = amplitude * p.cos(
        p.sqrt(this.G / this.wire_length) * getTime() - phase
      );
      
      const pivotY = p.height * this.PIVOT_Y_RATIO;
      const bob_x = this.PIVOT_X + this.wire_length * this.PIXELS_PER_FOOT * p.sin(bob_theta);
      const bob_y = pivotY - this.wire_length * this.PIXELS_PER_FOOT * p.cos(bob_theta);
      
      return p.createVector(bob_x, bob_y);
    };

    const drawPivot = () => {
      p.fill(this.colors.fill);
      const pivotY = p.height * this.PIVOT_Y_RATIO;
      p.circle(this.PIVOT_X, pivotY, this.PIVOT_RADIUS * 2);
    };

    const drawWire = () => {
      const bobPosition = getBobPosition();
      const pivotY = p.height * this.PIVOT_Y_RATIO;
      p.stroke(this.colors.stroke);
      p.strokeWeight(2);
      p.line(this.PIVOT_X, pivotY, bobPosition.x, bobPosition.y);
    };

    const drawBob = () => {
      const bobPosition = getBobPosition();
      p.fill(this.colors.fill);
      p.stroke(this.colors.stroke);
      p.strokeWeight(1);
      p.circle(bobPosition.x, bobPosition.y, this.BOB_RADIUS * 2);
    };

    p.setup = () => {
      // Use responsive sizing with square aspect ratio
      const size = this.getCanvasSize(1.0, 0.6);
      const canvas = p.createCanvas(size.width, size.height);
      canvas.parent(this.canvasParent);
      
      // Initialize colors
      this.updateColors(p);
      
      setupSliders();
      this.redo();
    };

    p.draw = () => {
      p.background(this.colors.background);
      updateInfo();
      
      p.push();
      // Use the center as origin and orient the upward direction as positive y
      p.translate(p.width / 2, p.height / 2);
      p.scale(1, -1);
      
      drawPivot();
      drawWire();
      drawBob();
      
      p.pop();
    };

    p.keyPressed = () => {
      if (p.keyCode === 90) { // 'z' key
        this.redo();
      }
    };
    
    p.windowResized = () => {
      this.handleResize(p);
    };
    
    // Color scheme changes are now handled by base class
  }
  
  private redo(): void {
    // Defined inside createSketch
  }
}

export default function createPendulumDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new PendulumDemo(container, config);
  return demo.init();
}