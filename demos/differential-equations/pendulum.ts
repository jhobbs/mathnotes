// Pendulum Demo - Simple harmonic motion of a pendulum
import p5 from 'p5';
import type { DemoConfig, DemoInstance } from '@framework/types';

export default function createPendulumDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  let sketch: p5 | null = null;

  // Constants
  const TABLE_SIZE = 600;
  const PIVOT_X = 0;
  const PIVOT_Y = TABLE_SIZE * 0.3;
  const PIVOT_RADIUS = 2;
  const BOB_RADIUS = 20;
  const PIXELS_PER_FOOT = 20;
  const G = 32; // gravitational constant in ft/s^2

  // State variables
  let lengthSlider: p5.Element;
  let angularVelocitySlider: p5.Element;
  let angleSlider: p5.Element;
  
  let initial_bob_theta: number;
  let wire_length: number;
  let omega_naught: number;
  let start_time: number;

  // Dark mode detection helper
  const isDarkMode = () => config?.darkMode ?? false;

  // Color helpers
  const getBackgroundColor = (p: p5) => isDarkMode() ? p.color(30, 30, 30) : p.color(255, 255, 255);
  const getStrokeColor = (p: p5) => isDarkMode() ? p.color(200, 200, 200) : p.color(0, 0, 0);
  const getFillColor = (p: p5) => isDarkMode() ? p.color(180, 180, 180) : p.color(50, 50, 50);
  const getTextColor = () => isDarkMode() ? '#e0e0e0' : '#000000';

  const createSketch = (p: p5) => {
    const setupSliders = () => {
      const controlsDiv = document.getElementById('pendulum-controls');
      if (!controlsDiv) return;
      
      // Wire length control
      const lengthDiv = p.createDiv('');
      lengthDiv.parent(controlsDiv);
      lengthDiv.style('display', 'inline-block');
      lengthDiv.style('margin-right', '20px');
      
      const lengthLabel = p.createDiv('Wire Length:');
      lengthLabel.parent(lengthDiv);
      lengthLabel.style('color', getTextColor());
      lengthLabel.style('margin-bottom', '5px');
      
      lengthSlider = p.createSlider(0, 20, 5, 0);
      lengthSlider.parent(lengthDiv);
      lengthSlider.style('width', '120px');
      lengthSlider.input(() => redo());

      // Angular velocity control
      const velocityDiv = p.createDiv('');
      velocityDiv.parent(controlsDiv);
      velocityDiv.style('display', 'inline-block');
      velocityDiv.style('margin-right', '20px');
      
      const velocityLabel = p.createDiv('Starting Angular Velocity:');
      velocityLabel.parent(velocityDiv);
      velocityLabel.style('color', getTextColor());
      velocityLabel.style('margin-bottom', '5px');
      
      angularVelocitySlider = p.createSlider(0, 10, 0, 0);
      angularVelocitySlider.parent(velocityDiv);
      angularVelocitySlider.style('width', '120px');
      angularVelocitySlider.input(() => redo());

      // Starting angle control
      const angleDiv = p.createDiv('');
      angleDiv.parent(controlsDiv);
      angleDiv.style('display', 'inline-block');
      
      const angleLabel = p.createDiv('Starting Angle:');
      angleLabel.parent(angleDiv);
      angleLabel.style('color', getTextColor());
      angleLabel.style('margin-bottom', '5px');
      
      angleSlider = p.createSlider(0, p.PI, p.PI / 4, p.PI / 32);
      angleSlider.parent(angleDiv);
      angleSlider.style('width', '120px');
      angleSlider.input(() => redo());
    };

    const getTime = (): number => {
      return (Date.now() - start_time) / 1000;
    };

    const redo = () => {
      initial_bob_theta = angleSlider.value();
      wire_length = lengthSlider.value();
      omega_naught = angularVelocitySlider.value();
      start_time = Date.now();
    };

    const updateInfo = () => {
      const lengthDisplay = document.getElementById('wire-length-display');
      const periodDisplay = document.getElementById('period-display');
      
      if (lengthDisplay) {
        lengthDisplay.textContent = `Wire length: ${wire_length.toFixed(2)} ft`;
        lengthDisplay.style.color = getTextColor();
      }
      
      if (periodDisplay) {
        periodDisplay.textContent = `Period: ${(2 * p.PI * p.sqrt(wire_length / G)).toFixed(2)} sec`;
        periodDisplay.style.color = getTextColor();
      }
    };

    const getBobPosition = (): p5.Vector => {
      const amplitude = p.sqrt(
        p.pow(initial_bob_theta, 2) + 
        (wire_length / G) * p.pow(omega_naught, 2)
      );
      
      const phase = p.atan2(
        omega_naught * p.sqrt(wire_length / G), 
        initial_bob_theta
      );
      
      const bob_theta = amplitude * p.cos(
        p.sqrt(G / wire_length) * getTime() - phase
      );
      
      const bob_x = PIVOT_X + wire_length * PIXELS_PER_FOOT * p.sin(bob_theta);
      const bob_y = PIVOT_Y - wire_length * PIXELS_PER_FOOT * p.cos(bob_theta);
      
      return p.createVector(bob_x, bob_y);
    };

    const drawPivot = () => {
      p.fill(getFillColor(p));
      p.circle(PIVOT_X, PIVOT_Y, PIVOT_RADIUS * 2);
    };

    const drawWire = () => {
      const bobPosition = getBobPosition();
      p.stroke(getStrokeColor(p));
      p.strokeWeight(2);
      p.line(PIVOT_X, PIVOT_Y, bobPosition.x, bobPosition.y);
    };

    const drawBob = () => {
      const bobPosition = getBobPosition();
      p.fill(getFillColor(p));
      p.circle(bobPosition.x, bobPosition.y, BOB_RADIUS * 2);
    };

    p.setup = () => {
      const canvas = p.createCanvas(TABLE_SIZE, TABLE_SIZE);
      canvas.parent(container.querySelector('#pendulum-canvas') || container);
      setupSliders();
      redo();
    };

    p.draw = () => {
      p.background(getBackgroundColor(p));
      updateInfo();
      
      p.push();
      // Use the center as origin and orient the upward direction as positive y
      p.translate(TABLE_SIZE / 2, TABLE_SIZE / 2);
      p.scale(1, -1);
      
      drawPivot();
      drawWire();
      drawBob();
      
      p.pop();
    };

    p.keyPressed = () => {
      if (p.keyCode === 90) { // 'z' key
        redo();
      }
    };

    // Update colors when color scheme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        config = { ...config, darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches };
      });
    }
  };

  // Create and start the sketch
  sketch = new p5(createSketch);

  return {
    cleanup: () => {
      if (sketch) {
        sketch.remove();
        sketch = null;
      }
    }
  };
}