// Parametric Phase Portrait - Study how parameter r affects the dynamics
import p5 from 'p5';
import type { DemoConfig, DemoInstance, DemoMetadata } from '@framework/types';
import { isDarkMode, getDemoColors, getResponsiveCanvasSize } from '@framework/demo-utils';
import type { DemoColors } from '@framework/demo-utils';
import { addDemoStyles } from '@framework/ui-components';
import { FlowDynamics, PARAMETRIC_PRESETS, TRAJECTORY_COLORS } from './shared/flow-dynamics';
import type { ParametricPreset } from './shared/flow-dynamics';
import { PhasePortraitRenderer, Particle } from './shared/phase-portrait-renderer';

class ParametricPhasePortraitDemo {
  private container: HTMLElement;
  private config?: DemoConfig;
  private _isDarkMode: boolean;
  private colors!: DemoColors;

  private p5Instance: p5 | null = null;
  private dynamics: FlowDynamics;
  private renderer: PhasePortraitRenderer;
  private exprString: string = 'r - x^2';

  // Parameter state
  private rMin: number = -5;
  private rMax: number = 5;
  private rStep: number = 0.1;

  // Zoom state (1.0 = auto, >1 = zoomed out)
  private zoomLevel: number = 1.0;
  private zoomSliderEl!: HTMLInputElement;

  // Particles
  private particles: Particle[] = [];
  private colorIndex: number = 0;

  // UI elements
  private inputEl!: HTMLInputElement;
  private sliderEl!: HTMLInputElement;
  private rInputEl!: HTMLInputElement;
  private rMinInputEl!: HTMLInputElement;
  private rMaxInputEl!: HTMLInputElement;
  private xMinInputEl!: HTMLInputElement;
  private xMaxInputEl!: HTMLInputElement;
  private containerEl!: HTMLElement;
  private canvasContainer!: HTMLElement;

  // Event cleanup
  private eventListeners: Array<{ target: EventTarget; type: string; listener: EventListener }> = [];

  constructor(container: HTMLElement, config?: DemoConfig) {
    this.container = container;
    this.config = config;
    this._isDarkMode = isDarkMode(config);
    this.dynamics = new FlowDynamics();
    this.renderer = new PhasePortraitRenderer({
      axisLabelX: 'x',
      axisLabelY: 'ẋ'
    });
  }

  init(): DemoInstance {
    this.setupContainer();
    addDemoStyles(this.container, 'parametric-phase');
    this.setupUI();
    this.applyPreset(PARAMETRIC_PRESETS[0]);
    this.createSketch();
    this.setupResizeHandler();

    return {
      cleanup: this.cleanup.bind(this),
      resize: this.resize.bind(this),
      pause: this.pause.bind(this),
      resume: this.resume.bind(this)
    };
  }

  private setupContainer(): void {
    this.containerEl = document.createElement('div');
    this.containerEl.id = 'parametric-phase-container';
    this.containerEl.style.textAlign = 'center';

    this.canvasContainer = document.createElement('div');
    this.canvasContainer.className = 'demo-canvas-container';
    this.canvasContainer.style.marginTop = 'var(--spacing-sm, 0.5rem)';
    this.canvasContainer.style.display = 'inline-block';

    this.containerEl.appendChild(this.canvasContainer);

    // Add instructions
    if (metadata.instructions) {
      const instructionsEl = document.createElement('div');
      instructionsEl.className = 'demo-info';
      instructionsEl.style.marginTop = 'var(--spacing-md, 1rem)';
      instructionsEl.style.textAlign = 'center';
      instructionsEl.textContent = typeof metadata.instructions === 'function'
        ? metadata.instructions()
        : metadata.instructions;
      this.containerEl.appendChild(instructionsEl);
    }

    this.container.appendChild(this.containerEl);
  }

  private getCanvasSize(): { width: number; height: number } {
    return getResponsiveCanvasSize(this.container, this.config, 0.9, 0.6);
  }

  private setupUI(): void {
    const panel = document.createElement('div');
    panel.className = 'demo-controls';
    panel.style.marginBottom = 'var(--spacing-sm, 0.5rem)';

    // Function input row
    const inputRow = document.createElement('div');
    inputRow.style.display = 'flex';
    inputRow.style.alignItems = 'center';
    inputRow.style.gap = 'var(--spacing-sm, 0.5rem)';
    inputRow.style.marginBottom = 'var(--spacing-sm, 0.5rem)';
    inputRow.style.justifyContent = 'center';

    const label = document.createElement('label');
    label.textContent = 'f(x; r) =';
    label.style.fontWeight = 'bold';
    label.style.fontFamily = 'var(--font-mono, monospace)';

    this.inputEl = document.createElement('input');
    this.inputEl.type = 'text';
    this.inputEl.value = this.exprString;
    this.inputEl.style.padding = '0.25rem 0.5rem';
    this.inputEl.style.borderRadius = '0.25rem';
    this.inputEl.style.border = '1px solid var(--color-border, #ccc)';
    this.inputEl.style.background = this._isDarkMode ? 'rgba(255,255,255,0.1)' : 'white';
    this.inputEl.style.color = 'var(--color-text, inherit)';
    this.inputEl.style.fontFamily = 'var(--font-mono, monospace)';
    this.inputEl.style.width = '200px';

    const inputHandler = () => {
      this.exprString = this.inputEl.value;
      this.updateFunction();
    };
    this.inputEl.addEventListener('input', inputHandler);
    this.eventListeners.push({ target: this.inputEl, type: 'input', listener: inputHandler });

    const keyHandler = (e: Event) => (e as KeyboardEvent).stopPropagation();
    this.inputEl.addEventListener('keydown', keyHandler);
    this.eventListeners.push({ target: this.inputEl, type: 'keydown', listener: keyHandler });

    inputRow.appendChild(label);
    inputRow.appendChild(this.inputEl);

    // Domain inputs
    const domainLabel = document.createElement('span');
    domainLabel.textContent = 'x ∈';
    domainLabel.style.fontFamily = 'var(--font-mono, monospace)';
    domainLabel.style.marginLeft = 'var(--spacing-sm, 0.5rem)';

    this.xMinInputEl = document.createElement('input');
    this.xMinInputEl.type = 'number';
    this.xMinInputEl.value = '-10';
    this.xMinInputEl.style.padding = '0.25rem 0.5rem';
    this.xMinInputEl.style.borderRadius = '0.25rem';
    this.xMinInputEl.style.border = '1px solid var(--color-border, #ccc)';
    this.xMinInputEl.style.background = this._isDarkMode ? 'rgba(255,255,255,0.1)' : 'white';
    this.xMinInputEl.style.color = 'var(--color-text, inherit)';
    this.xMinInputEl.style.fontFamily = 'var(--font-mono, monospace)';
    this.xMinInputEl.style.width = '70px';

    const toLabel = document.createElement('span');
    toLabel.textContent = 'to';
    toLabel.style.fontFamily = 'var(--font-mono, monospace)';

    this.xMaxInputEl = document.createElement('input');
    this.xMaxInputEl.type = 'number';
    this.xMaxInputEl.value = '10';
    this.xMaxInputEl.style.padding = '0.25rem 0.5rem';
    this.xMaxInputEl.style.borderRadius = '0.25rem';
    this.xMaxInputEl.style.border = '1px solid var(--color-border, #ccc)';
    this.xMaxInputEl.style.background = this._isDarkMode ? 'rgba(255,255,255,0.1)' : 'white';
    this.xMaxInputEl.style.color = 'var(--color-text, inherit)';
    this.xMaxInputEl.style.fontFamily = 'var(--font-mono, monospace)';
    this.xMaxInputEl.style.width = '70px';

    const domainHandler = () => {
      const xMin = parseFloat(this.xMinInputEl.value);
      const xMax = parseFloat(this.xMaxInputEl.value);
      if (!isNaN(xMin) && !isNaN(xMax) && xMin < xMax) {
        this.dynamics.setDomain(xMin, xMax);
        this.updateFunction();
      }
    };
    this.xMinInputEl.addEventListener('change', domainHandler);
    this.xMaxInputEl.addEventListener('change', domainHandler);
    this.eventListeners.push({ target: this.xMinInputEl, type: 'change', listener: domainHandler });
    this.eventListeners.push({ target: this.xMaxInputEl, type: 'change', listener: domainHandler });

    const domainKeyHandler = (e: Event) => (e as KeyboardEvent).stopPropagation();
    this.xMinInputEl.addEventListener('keydown', domainKeyHandler);
    this.xMaxInputEl.addEventListener('keydown', domainKeyHandler);
    this.eventListeners.push({ target: this.xMinInputEl, type: 'keydown', listener: domainKeyHandler });
    this.eventListeners.push({ target: this.xMaxInputEl, type: 'keydown', listener: domainKeyHandler });

    inputRow.appendChild(domainLabel);
    inputRow.appendChild(this.xMinInputEl);
    inputRow.appendChild(toLabel);
    inputRow.appendChild(this.xMaxInputEl);

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.padding = '0.25rem 0.5rem';
    clearBtn.style.borderRadius = '0.25rem';
    clearBtn.style.border = '1px solid var(--color-border, #ccc)';
    clearBtn.style.background = this._isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    clearBtn.style.cursor = 'pointer';
    const clearHandler = () => {
      this.particles = [];
      this.colorIndex = 0;
    };
    clearBtn.addEventListener('click', clearHandler);
    this.eventListeners.push({ target: clearBtn, type: 'click', listener: clearHandler });
    inputRow.appendChild(clearBtn);

    panel.appendChild(inputRow);

    // Parameter r row
    const rRow = document.createElement('div');
    rRow.style.display = 'flex';
    rRow.style.alignItems = 'center';
    rRow.style.gap = 'var(--spacing-sm, 0.5rem)';
    rRow.style.marginBottom = 'var(--spacing-sm, 0.5rem)';
    rRow.style.justifyContent = 'center';

    const rLabel = document.createElement('label');
    rLabel.textContent = 'r =';
    rLabel.style.fontWeight = 'bold';
    rLabel.style.fontFamily = 'var(--font-mono, monospace)';

    this.sliderEl = document.createElement('input');
    this.sliderEl.type = 'range';
    this.sliderEl.min = this.rMin.toString();
    this.sliderEl.max = this.rMax.toString();
    this.sliderEl.step = this.rStep.toString();
    this.sliderEl.value = '0';
    this.sliderEl.style.width = '200px';

    this.rInputEl = document.createElement('input');
    this.rInputEl.type = 'number';
    this.rInputEl.min = this.rMin.toString();
    this.rInputEl.max = this.rMax.toString();
    this.rInputEl.step = this.rStep.toString();
    this.rInputEl.value = '0';
    this.rInputEl.style.padding = '0.25rem 0.5rem';
    this.rInputEl.style.borderRadius = '0.25rem';
    this.rInputEl.style.border = '1px solid var(--color-border, #ccc)';
    this.rInputEl.style.background = this._isDarkMode ? 'rgba(255,255,255,0.1)' : 'white';
    this.rInputEl.style.color = 'var(--color-text, inherit)';
    this.rInputEl.style.fontFamily = 'var(--font-mono, monospace)';
    this.rInputEl.style.width = '80px';

    // Sync slider and input
    const sliderHandler = () => {
      this.rInputEl.value = this.sliderEl.value;
      this.updateParameter();
    };
    this.sliderEl.addEventListener('input', sliderHandler);
    this.eventListeners.push({ target: this.sliderEl, type: 'input', listener: sliderHandler });

    const rInputHandler = () => {
      const val = parseFloat(this.rInputEl.value);
      if (!isNaN(val)) {
        this.sliderEl.value = Math.max(this.rMin, Math.min(this.rMax, val)).toString();
        this.updateParameter();
      }
    };
    this.rInputEl.addEventListener('input', rInputHandler);
    this.eventListeners.push({ target: this.rInputEl, type: 'input', listener: rInputHandler });

    const rKeyHandler = (e: Event) => (e as KeyboardEvent).stopPropagation();
    this.rInputEl.addEventListener('keydown', rKeyHandler);
    this.eventListeners.push({ target: this.rInputEl, type: 'keydown', listener: rKeyHandler });

    // r range inputs
    const rRangeLabel = document.createElement('span');
    rRangeLabel.textContent = 'r ∈';
    rRangeLabel.style.fontFamily = 'var(--font-mono, monospace)';
    rRangeLabel.style.marginLeft = 'var(--spacing-sm, 0.5rem)';

    this.rMinInputEl = document.createElement('input');
    this.rMinInputEl.type = 'number';
    this.rMinInputEl.value = this.rMin.toString();
    this.rMinInputEl.style.padding = '0.25rem 0.5rem';
    this.rMinInputEl.style.borderRadius = '0.25rem';
    this.rMinInputEl.style.border = '1px solid var(--color-border, #ccc)';
    this.rMinInputEl.style.background = this._isDarkMode ? 'rgba(255,255,255,0.1)' : 'white';
    this.rMinInputEl.style.color = 'var(--color-text, inherit)';
    this.rMinInputEl.style.fontFamily = 'var(--font-mono, monospace)';
    this.rMinInputEl.style.width = '60px';

    const rToLabel = document.createElement('span');
    rToLabel.textContent = 'to';
    rToLabel.style.fontFamily = 'var(--font-mono, monospace)';

    this.rMaxInputEl = document.createElement('input');
    this.rMaxInputEl.type = 'number';
    this.rMaxInputEl.value = this.rMax.toString();
    this.rMaxInputEl.style.padding = '0.25rem 0.5rem';
    this.rMaxInputEl.style.borderRadius = '0.25rem';
    this.rMaxInputEl.style.border = '1px solid var(--color-border, #ccc)';
    this.rMaxInputEl.style.background = this._isDarkMode ? 'rgba(255,255,255,0.1)' : 'white';
    this.rMaxInputEl.style.color = 'var(--color-text, inherit)';
    this.rMaxInputEl.style.fontFamily = 'var(--font-mono, monospace)';
    this.rMaxInputEl.style.width = '60px';

    const rRangeHandler = () => {
      const newMin = parseFloat(this.rMinInputEl.value);
      const newMax = parseFloat(this.rMaxInputEl.value);
      if (!isNaN(newMin) && !isNaN(newMax) && newMin < newMax) {
        this.rMin = newMin;
        this.rMax = newMax;
        this.sliderEl.min = newMin.toString();
        this.sliderEl.max = newMax.toString();
        this.rInputEl.min = newMin.toString();
        this.rInputEl.max = newMax.toString();
        // Clamp current r value to new range
        const currentR = parseFloat(this.sliderEl.value);
        const clampedR = Math.max(newMin, Math.min(newMax, currentR));
        this.sliderEl.value = clampedR.toString();
        this.rInputEl.value = clampedR.toString();
        this.updateParameter();
      }
    };
    this.rMinInputEl.addEventListener('change', rRangeHandler);
    this.rMaxInputEl.addEventListener('change', rRangeHandler);
    this.eventListeners.push({ target: this.rMinInputEl, type: 'change', listener: rRangeHandler });
    this.eventListeners.push({ target: this.rMaxInputEl, type: 'change', listener: rRangeHandler });

    const rRangeKeyHandler = (e: Event) => (e as KeyboardEvent).stopPropagation();
    this.rMinInputEl.addEventListener('keydown', rRangeKeyHandler);
    this.rMaxInputEl.addEventListener('keydown', rRangeKeyHandler);
    this.eventListeners.push({ target: this.rMinInputEl, type: 'keydown', listener: rRangeKeyHandler });
    this.eventListeners.push({ target: this.rMaxInputEl, type: 'keydown', listener: rRangeKeyHandler });

    rRow.appendChild(rLabel);
    rRow.appendChild(this.sliderEl);
    rRow.appendChild(this.rInputEl);
    rRow.appendChild(rRangeLabel);
    rRow.appendChild(this.rMinInputEl);
    rRow.appendChild(rToLabel);
    rRow.appendChild(this.rMaxInputEl);

    panel.appendChild(rRow);

    // Zoom row
    const zoomRow = document.createElement('div');
    zoomRow.style.display = 'flex';
    zoomRow.style.alignItems = 'center';
    zoomRow.style.gap = 'var(--spacing-sm, 0.5rem)';
    zoomRow.style.marginBottom = 'var(--spacing-sm, 0.5rem)';
    zoomRow.style.justifyContent = 'center';

    const zoomLabel = document.createElement('label');
    zoomLabel.textContent = 'Zoom:';
    zoomLabel.style.fontWeight = 'bold';

    this.zoomSliderEl = document.createElement('input');
    this.zoomSliderEl.type = 'range';
    this.zoomSliderEl.min = '0.05';
    this.zoomSliderEl.max = '4';
    this.zoomSliderEl.step = '0.05';
    this.zoomSliderEl.value = '1';
    this.zoomSliderEl.style.width = '150px';

    const zoomValueEl = document.createElement('span');
    zoomValueEl.textContent = '1.0x';
    zoomValueEl.style.fontFamily = 'var(--font-mono, monospace)';
    zoomValueEl.style.minWidth = '40px';

    const zoomHandler = () => {
      this.zoomLevel = parseFloat(this.zoomSliderEl.value);
      zoomValueEl.textContent = this.zoomLevel.toFixed(1) + 'x';
      this.applyZoom();
    };
    this.zoomSliderEl.addEventListener('input', zoomHandler);
    this.eventListeners.push({ target: this.zoomSliderEl, type: 'input', listener: zoomHandler });

    const fitBtn = document.createElement('button');
    fitBtn.textContent = 'Fit';
    fitBtn.style.padding = '0.25rem 0.5rem';
    fitBtn.style.borderRadius = '0.25rem';
    fitBtn.style.border = '1px solid var(--color-border, #ccc)';
    fitBtn.style.background = this._isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    fitBtn.style.cursor = 'pointer';
    const fitHandler = () => {
      this.zoomLevel = 1.0;
      this.zoomSliderEl.value = '1';
      zoomValueEl.textContent = '1.0x';
      this.dynamics.setViewRangeOverride(null);
    };
    fitBtn.addEventListener('click', fitHandler);
    this.eventListeners.push({ target: fitBtn, type: 'click', listener: fitHandler });

    zoomRow.appendChild(zoomLabel);
    zoomRow.appendChild(this.zoomSliderEl);
    zoomRow.appendChild(zoomValueEl);
    zoomRow.appendChild(fitBtn);

    panel.appendChild(zoomRow);

    // Preset buttons row
    const presetRow = document.createElement('div');
    presetRow.style.display = 'flex';
    presetRow.style.gap = 'var(--spacing-sm, 0.5rem)';
    presetRow.style.flexWrap = 'wrap';
    presetRow.style.justifyContent = 'center';

    for (const preset of PARAMETRIC_PRESETS) {
      const btn = document.createElement('button');
      btn.textContent = preset.label;
      btn.style.padding = '0.25rem 0.5rem';
      btn.style.borderRadius = '0.25rem';
      btn.style.border = '1px solid var(--color-border, #ccc)';
      btn.style.background = this._isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
      btn.style.cursor = 'pointer';
      const presetHandler = () => this.applyPreset(preset);
      btn.addEventListener('click', presetHandler);
      this.eventListeners.push({ target: btn, type: 'click', listener: presetHandler });
      presetRow.appendChild(btn);
    }

    panel.appendChild(presetRow);

    // Insert panel before canvas
    this.containerEl.insertBefore(panel, this.canvasContainer);
  }

  private applyPreset(preset: ParametricPreset): void {
    this.exprString = preset.expr;
    this.inputEl.value = preset.expr;
    this.rMin = preset.rMin;
    this.rMax = preset.rMax;
    this.rStep = preset.rStep;

    // Update slider bounds
    this.sliderEl.min = preset.rMin.toString();
    this.sliderEl.max = preset.rMax.toString();
    this.sliderEl.step = preset.rStep.toString();
    this.sliderEl.value = preset.rDefault.toString();

    // Update number input bounds
    this.rInputEl.min = preset.rMin.toString();
    this.rInputEl.max = preset.rMax.toString();
    this.rInputEl.step = preset.rStep.toString();
    this.rInputEl.value = preset.rDefault.toString();

    // Update r range inputs
    this.rMinInputEl.value = preset.rMin.toString();
    this.rMaxInputEl.value = preset.rMax.toString();

    // Set domain constraint from preset (or defaults)
    const xMin = preset.xMin ?? -10;
    const xMax = preset.xMax ?? 10;
    this.dynamics.setDomain(xMin, xMax);
    this.xMinInputEl.value = xMin.toString();
    this.xMaxInputEl.value = xMax.toString();

    // Reset zoom to auto
    this.zoomLevel = 1.0;
    this.zoomSliderEl.value = '1';
    this.dynamics.setViewRangeOverride(null);

    this.dynamics.r = preset.rDefault;
    this.updateFunction();
  }

  private updateFunction(): void {
    const success = this.dynamics.update(this.exprString);
    this.inputEl.style.borderColor = success ? '' : 'red';
    this.applyZoom();
    this.particles = [];
    this.colorIndex = 0;
  }

  private updateParameter(): void {
    this.dynamics.r = parseFloat(this.sliderEl.value);
    this.dynamics.updateForParameter();
    this.applyZoom();
    this.particles = [];
    this.colorIndex = 0;
  }

  private applyZoom(): void {
    if (this.zoomLevel === 1.0) {
      this.dynamics.setViewRangeOverride(null);
    } else {
      const auto = this.dynamics.autoViewRange;
      const center = (auto.xMin + auto.xMax) / 2;
      const halfSpan = ((auto.xMax - auto.xMin) / 2) * this.zoomLevel;
      this.dynamics.setViewRangeOverride({
        xMin: center - halfSpan,
        xMax: center + halfSpan
      });
    }
  }

  private spawnParticle(x0: number): void {
    const color = TRAJECTORY_COLORS[this.colorIndex % TRAJECTORY_COLORS.length];
    this.colorIndex++;

    this.particles.push({
      x: x0,
      startX: x0,
      t: 0,
      color,
      active: true,
      trail: [{ t: 0, x: x0 }]
    });
  }

  private updateParticles(): void {
    const tMax = this.dynamics.tMax;
    const dtFrame = tMax / 300;
    const fixedPointTolerance = 0.05;
    const speedThreshold = 0.01;

    for (const particle of this.particles) {
      if (!particle.active) continue;

      // Adaptive integration
      let tRemaining = dtFrame;
      const maxDx = 0.1;
      const minDt = 1e-6;

      while (tRemaining > minDt) {
        const velocity = this.dynamics.f(particle.x);
        const absVel = Math.abs(velocity);

        let dt = absVel > 0.01 ? Math.min(tRemaining, maxDx / absVel) : tRemaining;
        dt = Math.max(dt, minDt);
        dt = Math.min(dt, tRemaining);

        particle.x += velocity * dt;
        particle.t += dt;
        tRemaining -= dt;
      }

      particle.trail.push({ t: particle.t, x: particle.x });

      // Deactivate if out of bounds or reached end of time
      const { xMin, xMax } = this.dynamics.viewRange;
      if (particle.t > tMax || particle.x < xMin - 1 || particle.x > xMax + 1) {
        particle.active = false;
        continue;
      }

      // Check if near fixed point and slowing down
      for (const fp of this.dynamics.fixedPoints) {
        const velocity = this.dynamics.f(particle.x);
        if (Math.abs(particle.x - fp.x) < fixedPointTolerance && Math.abs(velocity) < speedThreshold) {
          particle.active = false;
          break;
        }
      }
    }
  }

  private createSketch(): void {
    this.p5Instance = new p5((p: p5) => {
      p.setup = () => {
        const size = this.getCanvasSize();
        const canvas = p.createCanvas(size.width, size.height);
        canvas.parent(this.canvasContainer);
        this.colors = getDemoColors(p, this.config);
      };

      p.draw = () => {
        p.background(this.colors.background);
        this.updateParticles();
        this.renderer.draw(p, this.dynamics, this.colors, this._isDarkMode, this.particles);
      };

      p.mousePressed = () => {
        if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
          return;
        }
        const world = this.renderer.screenToWorld(p, this.dynamics, p.mouseX, p.mouseY);
        const axisY = this.renderer.worldToScreen(p, this.dynamics, 0, 0).y;
        if (Math.abs(p.mouseY - axisY) < 30) {
          this.spawnParticle(world.x);
        }
      };
    });
  }

  private setupResizeHandler(): void {
    const listener = () => this.resize();
    window.addEventListener('resize', listener);
    this.eventListeners.push({ target: window, type: 'resize', listener });
  }

  private resize(): void {
    const size = this.getCanvasSize();
    if (this.p5Instance) {
      this.p5Instance.resizeCanvas(size.width, size.height);
    }
  }

  private cleanup(): void {
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }
    for (const { target, type, listener } of this.eventListeners) {
      target.removeEventListener(type, listener);
    }
    this.eventListeners = [];
    this.container.innerHTML = '';
  }

  private pause(): void {
    if (this.p5Instance) this.p5Instance.noLoop();
  }

  private resume(): void {
    if (this.p5Instance) this.p5Instance.loop();
  }
}

export const metadata: DemoMetadata = {
  title: 'Parametric Phase Portrait',
  category: 'Dynamical Systems',
  description: 'Explore how the parameter r affects the phase portrait of ẋ = f(x; r). Classic bifurcation examples included.',
  instructions: 'Use the slider or input to vary r and watch the phase portrait change. Click on the x-axis to spawn particles.'
};

export default function createParametricPhasePortraitDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new ParametricPhasePortraitDemo(container, config);
  return demo.init();
}
