import p5 from 'p5';
import type { DemoConfig, DemoInstance } from '@framework/types';
import type { DemoMetadata } from '@framework/p5-base';
import { P5DemoBase } from '@framework';
import { createResetButton, createControlRow } from '@framework/ui-components';

interface Firefly {
  x: number;
  y: number;
  vx: number;    // velocity
  vy: number;
  phase: number;  // [0, 2π] - phase in the blink cycle
  omega: number;  // natural frequency (rad/s), roughly 2π for 1Hz
}

class FireflySynchronizationDemo extends P5DemoBase {
  private fireflies: Firefly[] = [];
  private numFireflies = 50;

  // Coupling parameters
  private K = 1.3;         // Coupling strength
  private lambda = 0.3;    // Length scale for exponential decay
  private r0 = 0.05;       // Softening parameter to avoid singularity

  // UI elements
  private kSlider!: p5.Element;

  // Colors
  private fireflyGreen!: p5.Color;
  private fireflyGreenDim!: p5.Color;

  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
  }

  protected getStylePrefix(): string {
    return 'firefly-sync';
  }

  protected getAspectRatio(): number {
    return 0.6;  // Wider canvas for the field
  }

  private initializeFireflies(p: p5): void {
    this.fireflies = [];
    for (let i = 0; i < this.numFireflies; i++) {
      this.fireflies.push({
        x: p.random(0.05, 0.95),  // Normalized [0,1] coordinates
        y: p.random(0.05, 0.95),
        vx: 0,
        vy: 0,
        phase: p.random(0, p.TWO_PI),
        omega: p.TWO_PI * p.random(0.9, 1.1)  // ~1Hz with some variation
      });
    }
  }

  protected updateColors(p: p5): void {
    super.updateColors(p);
    // Firefly bioluminescence green
    this.fireflyGreen = p.color(140, 255, 100);
    this.fireflyGreenDim = p.color(40, 80, 30);
  }

  private setupControls(p: p5): void {
    const panel = this.createControlPanel();

    // K slider: 0 = no coupling, high values = strong sync
    this.kSlider = this.createSlider(p, `Coupling (K=${this.K.toFixed(1)})`, 0, 5, this.K, 0.1, () => {
      this.K = this.kSlider.value() as number;
      const sliderParent = this.kSlider.elt.parentElement;
      const label = sliderParent?.querySelector('.label');
      if (label) label.textContent = `Coupling (K=${this.K.toFixed(1)})`;
    });

    // Reset button
    const resetButton = createResetButton(() => {
      this.initializeFireflies(p);
    }, this.getStylePrefix());

    const controlRow = createControlRow([resetButton], { gap: '10px' });
    panel.appendChild(controlRow);
  }

  protected createSketch(p: p5): void {
    p.setup = () => {
      this.initializeFireflies(p);
      this.setupControls(p);
    };

    p.draw = () => {
      // Dark background for night scene
      if (this.isDarkMode) {
        p.background(10, 15, 20);
      } else {
        p.background(20, 30, 40);
      }

      const dt = p.deltaTime / 1000;  // Convert to seconds

      // Update positions (slow drifting movement)
      this.updatePositions(p, dt);

      // Update phases using coupled dynamics
      this.updatePhases(p, dt);

      // Draw each firefly
      p.noStroke();
      for (const firefly of this.fireflies) {

        // Calculate brightness using a smooth function
        // We want a nice "flash" - bright for a short time, dim otherwise
        // Using a raised cosine that's mostly dim with a bright peak
        const brightness = this.calculateBrightness(p, firefly.phase);

        // Convert normalized coords to screen coords
        const x = firefly.x * p.width;
        const y = firefly.y * p.height;

        // Draw glow effect when bright
        if (brightness > 0.3) {
          const glowSize = 30 * brightness;
          const glowColor = p.color(
            p.red(this.fireflyGreen),
            p.green(this.fireflyGreen),
            p.blue(this.fireflyGreen),
            brightness * 50
          );
          p.fill(glowColor);
          p.circle(x, y, glowSize);
        }

        // Draw the firefly body
        const bodyColor = p.lerpColor(this.fireflyGreenDim, this.fireflyGreen, brightness);
        p.fill(bodyColor);
        p.circle(x, y, 8 + brightness * 4);
      }
    };
  }

  private updatePositions(p: p5, dt: number): void {
    const drag = 0.98;            // Velocity damping per frame
    const drift = 0.0007;         // Random acceleration strength
    const margin = 0.05;          // Soft boundary margin
    const boundaryForce = 0.003;  // Force pushing back from edges

    for (const f of this.fireflies) {
      // Add small random acceleration
      f.vx += p.random(-drift, drift);
      f.vy += p.random(-drift, drift);

      // Soft boundary - push back from edges
      if (f.x < margin) f.vx += boundaryForce;
      if (f.x > 1 - margin) f.vx -= boundaryForce;
      if (f.y < margin) f.vy += boundaryForce;
      if (f.y > 1 - margin) f.vy -= boundaryForce;

      // Apply drag
      f.vx *= drag;
      f.vy *= drag;

      // Update position
      f.x += f.vx * dt * 10;
      f.y += f.vy * dt * 10;

      // Hard clamp to stay in bounds
      f.x = p.constrain(f.x, 0.02, 0.98);
      f.y = p.constrain(f.y, 0.02, 0.98);
    }
  }

  private updatePhases(p: p5, dt: number): void {
    // Compute θ̇_i for each firefly using the coupled dynamics:
    // θ̇_i = ω_i + K * (Σ w_ij * sin(θ_j - θ_i)) / (Σ w_ij)
    // where w_ij = e^{-r_ij/λ} / (r_ij² + r_0²)

    const n = this.fireflies.length;
    const thetaDot = new Array(n);

    for (let i = 0; i < n; i++) {
      const fi = this.fireflies[i];
      let weightedSinSum = 0;
      let weightSum = 0;

      for (let j = 0; j < n; j++) {
        if (i === j) continue;

        const fj = this.fireflies[j];

        // Distance in normalized coordinates
        const dx = fj.x - fi.x;
        const dy = fj.y - fi.y;
        const rij = Math.sqrt(dx * dx + dy * dy);

        // Weight: w_ij = e^{-r_ij/λ} / (r_ij² + r_0²)
        const weight = Math.exp(-rij / this.lambda) / (rij * rij + this.r0 * this.r0);

        weightedSinSum += weight * Math.sin(fj.phase - fi.phase);
        weightSum += weight;
      }

      // θ̇_i = ω_i + K * (weighted sin sum) / (weight sum)
      const coupling = weightSum > 0 ? this.K * weightedSinSum / weightSum : 0;
      thetaDot[i] = fi.omega + coupling;
    }

    // Apply updates
    for (let i = 0; i < n; i++) {
      this.fireflies[i].phase += thetaDot[i] * dt;
      // Keep phase in [0, 2π]
      while (this.fireflies[i].phase > p.TWO_PI) {
        this.fireflies[i].phase -= p.TWO_PI;
      }
      while (this.fireflies[i].phase < 0) {
        this.fireflies[i].phase += p.TWO_PI;
      }
    }
  }

  private calculateBrightness(p: p5, phase: number): number {
    // Create a flash-like pattern: mostly dim, with a smooth bright peak
    // Using a modified cosine that creates a sharper "flash"
    const raw = (p.cos(phase) + 1) / 2;  // [0, 1]
    // Raise to a power to make it more "flashy" (dim most of the time)
    return p.pow(raw, 3);
  }

  protected onResize(p: p5, _size: { width: number; height: number }): void {
    // Fireflies use normalized coords, so no adjustment needed
    this.updateColors(p);
  }
}

export const metadata: DemoMetadata = {
  title: 'Firefly Synchronization',
  category: 'Dynamical Systems',
  description: 'Simulation of fireflies that blink and synchronize via distance-weighted coupling',
  instructions: 'Watch the fireflies synchronize. Each firefly has a natural uncoupled frequency, randomly assigned between 0.9hz and 1.1hz, and a random starting phase. Then each fly updates its dynamic frequency to try to better match the frequency of the other flies. Nearby fireflies influence each other more strongly, and the overall strength of the matching force is controlled by the parameter K. When K is 0, the flies all act indepenently. When K is high, they synchronize phase and frequency quickly. When K is in the middle, phase may synchronize globally while frequency synchronizes locally. This demo uses the <a href="https://en.wikipedia.org/wiki/Kuramoto_model">Kuramoto model</a> for coupled oscillators. '
};

export default function initFireflySynchronization(
  container: HTMLElement,
  config?: DemoConfig
): DemoInstance {
  const demo = new FireflySynchronizationDemo(container, config);
  return demo.init();
}
