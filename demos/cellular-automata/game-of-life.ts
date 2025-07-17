// Conway's Game of Life - TypeScript module version
import p5 from 'p5';
import type { DemoInstance, DemoConfig } from '@framework/types';

interface GameOfLifeState {
  grid: number[][];
  running: boolean;
  generations: number;
  populationHistory: number[];
  maxHistory: number;
}

class GameOfLife {
  private p: p5;
  private state: GameOfLifeState;
  private cols: number;
  private rows: number;
  private resolution: number = 5;
  private controls: {
    toggleBtn: HTMLButtonElement;
    resetBtn: HTMLButtonElement;
    initialPopulationSlider: HTMLInputElement;
    frameRateSlider: HTMLInputElement;
    initialPopValue: HTMLElement;
    frameRateValue: HTMLElement;
    runningStatus: HTMLElement;
    populationInfo: HTMLElement;
    rateChangeInfo: HTMLElement;
    generationInfo: HTMLElement;
  };

  constructor(p: p5, container: HTMLElement) {
    this.p = p;
    this.cols = Math.floor(p.width / this.resolution);
    this.rows = Math.floor(p.height / this.resolution);
    
    this.state = {
      grid: this.make2DArray(this.cols, this.rows),
      running: false,
      generations: 0,
      populationHistory: [],
      maxHistory: 5
    };

    this.setupControls(container);
    this.resetGrid();
  }

  private setupControls(container: HTMLElement): void {
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'demo-controls';
    controlsContainer.innerHTML = `
      <div class="controls">
        <button id="toggleBtn">Start</button>
        <button id="resetBtn">Reset</button>
        <div class="slider-group">
          <label>Initial Population: <span id="initialPopValue">0.15</span></label>
          <input type="range" id="initialPopulationSlider" min="0" max="1" step="0.01" value="0.15">
        </div>
        <div class="slider-group">
          <label>Frame Rate: <span id="frameRateValue">10</span></label>
          <input type="range" id="frameRateSlider" min="1" max="30" step="1" value="10">
        </div>
      </div>
      <div class="info-panel">
        <div id="runningStatus">Running: No</div>
        <div id="populationInfo">Population: 0.00%</div>
        <div id="rateChangeInfo">Rate Change: 0.00</div>
        <div id="generationInfo">Generation: 0</div>
      </div>
    `;
    
    container.appendChild(controlsContainer);

    // Get control elements
    this.controls = {
      toggleBtn: controlsContainer.querySelector('#toggleBtn') as HTMLButtonElement,
      resetBtn: controlsContainer.querySelector('#resetBtn') as HTMLButtonElement,
      initialPopulationSlider: controlsContainer.querySelector('#initialPopulationSlider') as HTMLInputElement,
      frameRateSlider: controlsContainer.querySelector('#frameRateSlider') as HTMLInputElement,
      initialPopValue: controlsContainer.querySelector('#initialPopValue') as HTMLElement,
      frameRateValue: controlsContainer.querySelector('#frameRateValue') as HTMLElement,
      runningStatus: controlsContainer.querySelector('#runningStatus') as HTMLElement,
      populationInfo: controlsContainer.querySelector('#populationInfo') as HTMLElement,
      rateChangeInfo: controlsContainer.querySelector('#rateChangeInfo') as HTMLElement,
      generationInfo: controlsContainer.querySelector('#generationInfo') as HTMLElement
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.controls.toggleBtn.addEventListener('click', () => {
      this.state.running = !this.state.running;
      this.controls.toggleBtn.textContent = this.state.running ? 'Stop' : 'Start';
      this.controls.runningStatus.textContent = `Running: ${this.state.running ? "Yes" : "No"}`;
    });

    this.controls.resetBtn.addEventListener('click', () => {
      this.resetGrid();
    });

    this.controls.initialPopulationSlider.addEventListener('input', () => {
      this.controls.initialPopValue.textContent = this.controls.initialPopulationSlider.value;
    });

    this.controls.frameRateSlider.addEventListener('input', () => {
      const frameRate = parseInt(this.controls.frameRateSlider.value);
      this.controls.frameRateValue.textContent = frameRate.toString();
      this.p.frameRate(frameRate);
    });
  }

  private make2DArray(cols: number, rows: number): number[][] {
    const arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = new Array(rows).fill(0);
    }
    return arr;
  }

  private resetGrid(): void {
    const initialPopulation = parseFloat(this.controls.initialPopulationSlider.value);
    
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        this.state.grid[i][j] = this.p.random(1) < initialPopulation ? 1 : 0;
      }
    }
    
    this.state.populationHistory = [];
    this.state.generations = 0;
    this.updatePopulationHistory();
    this.controls.generationInfo.textContent = `Generation: ${this.state.generations}`;
  }

  private updatePopulationHistory(): void {
    let currentPopulation = 0;
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        if (this.state.grid[i][j] > 0) {
          currentPopulation++;
        }
      }
    }
    
    this.state.populationHistory.push(currentPopulation);
    if (this.state.populationHistory.length > this.state.maxHistory) {
      this.state.populationHistory.shift();
    }
  }

  private calculatePopulationRateChange(): number {
    if (this.state.populationHistory.length < 2) {
      return 0;
    }
    
    let rateChange = 0;
    for (let i = 1; i < this.state.populationHistory.length; i++) {
      rateChange += (this.state.populationHistory[i] - this.state.populationHistory[i - 1]);
    }
    return rateChange / (this.state.populationHistory.length - 1);
  }

  private countNeighbors(grid: number[][], x: number, y: number): number {
    let sum = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        const col = (x + i + this.cols) % this.cols;
        const row = (y + j + this.rows) % this.rows;
        sum += grid[col][row];
      }
    }
    sum -= grid[x][y];
    return sum;
  }

  private updateGrid(): void {
    if (!this.state.running) {
      return;
    }

    const next = this.make2DArray(this.cols, this.rows);
    
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        const state = this.state.grid[i][j];
        const neighbors = this.countNeighbors(this.state.grid, i, j);
        
        if (state === 0 && neighbors === 3) {
          next[i][j] = 1; // Birth
        } else if (state === 1 && (neighbors === 2 || neighbors === 3)) {
          next[i][j] = 1; // Survival
        } else {
          next[i][j] = 0; // Death
        }
      }
    }
    
    this.state.grid = next;
    this.updatePopulationHistory();
    this.state.generations++;
    this.controls.generationInfo.textContent = `Generation: ${this.state.generations}`;
  }

  public draw(): void {
    this.p.background(0);
    this.updateGrid();

    let populatedCount = 0;

    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        const x = i * this.resolution;
        const y = j * this.resolution;
        
        if (this.state.grid[i][j] === 1) {
          populatedCount++;
          this.p.fill(255);
          this.p.stroke(0);
          this.p.rect(x, y, this.resolution - 1, this.resolution - 1);
        }
      }
    }

    // Update info displays
    const totalCells = this.cols * this.rows;
    const populationPercent = (populatedCount / totalCells) * 100;
    this.controls.populationInfo.textContent = `Population: ${populationPercent.toFixed(2)}%`;

    const rateChange = this.calculatePopulationRateChange();
    this.controls.rateChangeInfo.textContent = `Rate Change: ${rateChange.toFixed(2)}`;
  }

  public mousePressed(): void {
    if (this.p.mouseX >= 0 && this.p.mouseX < this.p.width && 
        this.p.mouseY >= 0 && this.p.mouseY < this.p.height) {
      const x = Math.floor(this.p.mouseX / this.resolution);
      const y = Math.floor(this.p.mouseY / this.resolution);
      
      if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
        this.state.grid[x][y] = this.state.grid[x][y] ? 0 : 1;
      }
    }
  }

  public resize(width: number, height: number): void {
    this.cols = Math.floor(width / this.resolution);
    this.rows = Math.floor(height / this.resolution);
    
    // Create new grid with new dimensions
    const newGrid = this.make2DArray(this.cols, this.rows);
    
    // Copy old grid values where possible
    for (let i = 0; i < Math.min(this.state.grid.length, this.cols); i++) {
      for (let j = 0; j < Math.min(this.state.grid[0].length, this.rows); j++) {
        newGrid[i][j] = this.state.grid[i][j];
      }
    }
    
    this.state.grid = newGrid;
  }
}

export default function initGameOfLifeDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  let p5Instance: p5 | null = null;
  let gameOfLife: GameOfLife | null = null;
  
  // Create canvas container
  const canvasContainer = document.createElement('div');
  canvasContainer.style.textAlign = 'center';
  canvasContainer.className = 'demo-canvas-container';
  container.appendChild(canvasContainer);

  const sketch = (p: p5) => {
    p.setup = () => {
      // Responsive sizing
      let canvasWidth: number, canvasHeight: number;
      
      if (p.windowWidth < 768) {
        canvasWidth = p.windowWidth - 20;
        canvasHeight = Math.min(400, (p.windowWidth - 20) * 0.75);
      } else {
        canvasWidth = config?.width || container.offsetWidth - 20 || 600;
        canvasHeight = config?.height || 400;
      }
      
      const canvas = p.createCanvas(canvasWidth, canvasHeight);
      canvas.parent(canvasContainer);
      
      p.frameRate(10);
      
      gameOfLife = new GameOfLife(p, container);
    };

    p.draw = () => {
      if (gameOfLife) {
        gameOfLife.draw();
      }
    };

    p.mousePressed = () => {
      if (gameOfLife) {
        gameOfLife.mousePressed();
      }
    };

    p.windowResized = () => {
      if (config?.width && config?.height) {
        return;
      }
      
      let canvasWidth: number, canvasHeight: number;
      
      if (p.windowWidth < 768) {
        canvasWidth = p.windowWidth - 20;
        canvasHeight = Math.min(400, (p.windowWidth - 20) * 0.75);
      } else {
        canvasWidth = container.offsetWidth - 20 || 600;
        canvasHeight = 400;
      }
      
      p.resizeCanvas(canvasWidth, canvasHeight);
      
      if (gameOfLife) {
        gameOfLife.resize(canvasWidth, canvasHeight);
      }
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
      gameOfLife = null;
      container.innerHTML = '';
    },
    
    resize: () => {
      if (p5Instance && p5Instance.windowResized) {
        p5Instance.windowResized();
      }
    },
    
    pause: () => {
      if (p5Instance) {
        p5Instance.noLoop();
      }
    },
    
    resume: () => {
      if (p5Instance) {
        p5Instance.loop();
      }
    }
  };
}