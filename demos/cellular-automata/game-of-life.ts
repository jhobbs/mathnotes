// Conway's Game of Life - TypeScript module version
import p5 from 'p5';
import type { DemoInstance, DemoConfig } from '@framework/types';
import { P5DemoBase, addDemoStyles, createControlPanel, createButton, createSlider } from '@demos/common/utils';

interface GameOfLifeState {
  grid: number[][];
  running: boolean;
  generations: number;
  populationHistory: number[];
  maxHistory: number;
}

class GameOfLifeDemo extends P5DemoBase {
  // Constants
  private readonly resolution = 5;
  
  // Grid properties
  private cols!: number;
  private rows!: number;
  
  // State
  private state: GameOfLifeState;
  
  // UI Elements
  private toggleBtn!: HTMLButtonElement;
  private resetBtn!: HTMLButtonElement;
  private initialPopulationSlider!: p5.Element;
  private frameRateSlider!: p5.Element;
  private runningStatus!: HTMLElement;
  private populationInfo!: HTMLElement;
  private rateChangeInfo!: HTMLElement;
  private generationInfo!: HTMLElement;

  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config);
    
    this.state = {
      grid: [],
      running: false,
      generations: 0,
      populationHistory: [],
      maxHistory: 5
    };
  }

  protected createSketch(p: p5): void {
    p.setup = () => {
      // Get responsive canvas size
      const size = this.getCanvasSize(0.75, 0.5);
      const canvas = p.createCanvas(size.width, size.height);
      canvas.parent(this.container);
      
      // Calculate grid dimensions
      this.cols = Math.floor(p.width / this.resolution);
      this.rows = Math.floor(p.height / this.resolution);
      
      // Initialize colors
      this.updateColors(p);
      
      // Add shared demo styles
      addDemoStyles(this.container);
      
      // Set up controls
      this.setupControls(p);
      
      // Initialize grid
      this.state.grid = this.make2DArray(this.cols, this.rows);
      this.resetGrid(p);
      
      // Set initial frame rate
      p.frameRate(10);
    };

    p.draw = () => {
      p.background(this.colors.background);
      this.updateGrid();
      
      let populatedCount = 0;
      
      for (let i = 0; i < this.cols; i++) {
        for (let j = 0; j < this.rows; j++) {
          const x = i * this.resolution;
          const y = j * this.resolution;
          
          if (this.state.grid[i][j] === 1) {
            populatedCount++;
            p.fill(this.colors.foreground);
            p.stroke(this.colors.background);
            p.rect(x, y, this.resolution - 1, this.resolution - 1);
          }
        }
      }
      
      // Update info displays
      const totalCells = this.cols * this.rows;
      const populationPercent = (populatedCount / totalCells) * 100;
      this.populationInfo.textContent = `Population: ${populationPercent.toFixed(2)}%`;
      
      const rateChange = this.calculatePopulationRateChange();
      this.rateChangeInfo.textContent = `Rate Change: ${rateChange.toFixed(2)}`;
    };

    p.mousePressed = () => {
      if (p.mouseX >= 0 && p.mouseX < p.width && 
          p.mouseY >= 0 && p.mouseY < p.height) {
        const x = Math.floor(p.mouseX / this.resolution);
        const y = Math.floor(p.mouseY / this.resolution);
        
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
          this.state.grid[x][y] = this.state.grid[x][y] ? 0 : 1;
        }
      }
    };

    p.windowResized = () => {
      if (this.config?.width && this.config?.height) return;
      
      const size = this.getCanvasSize(0.75, 0.5);
      p.resizeCanvas(size.width, size.height);
      
      // Update grid dimensions
      const newCols = Math.floor(p.width / this.resolution);
      const newRows = Math.floor(p.height / this.resolution);
      
      // Create new grid with new dimensions
      const newGrid = this.make2DArray(newCols, newRows);
      
      // Copy old grid values where possible
      for (let i = 0; i < Math.min(this.cols, newCols); i++) {
        for (let j = 0; j < Math.min(this.rows, newRows); j++) {
          newGrid[i][j] = this.state.grid[i][j];
        }
      }
      
      this.cols = newCols;
      this.rows = newRows;
      this.state.grid = newGrid;
    };
  }

  private setupControls(p: p5): void {
    const controlPanel = createControlPanel(this.container);
    
    // Instructions
    const infoDiv = document.createElement('div');
    infoDiv.className = 'demo-info';
    infoDiv.style.textAlign = 'center';
    infoDiv.style.marginBottom = '20px';
    infoDiv.textContent = 'Click on cells to toggle them. Click Start to run the simulation.';
    controlPanel.appendChild(infoDiv);
    
    // Main controls row
    const mainControls = document.createElement('div');
    mainControls.style.display = 'flex';
    mainControls.style.justifyContent = 'center';
    mainControls.style.gap = '20px';
    mainControls.style.marginBottom = '20px';
    controlPanel.appendChild(mainControls);
    
    // Buttons
    this.toggleBtn = createButton('Start', mainControls, () => {
      this.state.running = !this.state.running;
      this.toggleBtn.textContent = this.state.running ? 'Stop' : 'Start';
      this.runningStatus.textContent = `Running: ${this.state.running ? "Yes" : "No"}`;
    });
    
    this.resetBtn = createButton('Reset', mainControls, () => {
      this.resetGrid(p);
    });
    
    // Sliders row
    const slidersRow = document.createElement('div');
    slidersRow.style.display = 'flex';
    slidersRow.style.justifyContent = 'center';
    slidersRow.style.gap = '30px';
    slidersRow.style.marginBottom = '20px';
    controlPanel.appendChild(slidersRow);
    
    // Initial population slider
    this.initialPopulationSlider = createSlider(
      p,
      'Initial Population',
      0, 1, 0.15, 0.01,
      slidersRow,
      undefined,
      'demo'
    );
    
    // Frame rate slider
    this.frameRateSlider = createSlider(
      p,
      'Frame Rate',
      1, 30, 10, 1,
      slidersRow,
      () => {
        const frameRate = this.frameRateSlider.value() as number;
        p.frameRate(frameRate);
      },
      'demo'
    );
    
    // Info panel
    const infoPanel = document.createElement('div');
    infoPanel.className = 'info-panel';
    infoPanel.style.display = 'flex';
    infoPanel.style.justifyContent = 'center';
    infoPanel.style.gap = '20px';
    infoPanel.style.flexWrap = 'wrap';
    controlPanel.appendChild(infoPanel);
    
    // Create info displays
    this.runningStatus = this.createInfoDisplay('Running: No', infoPanel);
    this.populationInfo = this.createInfoDisplay('Population: 0.00%', infoPanel);
    this.rateChangeInfo = this.createInfoDisplay('Rate Change: 0.00', infoPanel);
    this.generationInfo = this.createInfoDisplay('Generation: 0', infoPanel);
  }

  private createInfoDisplay(text: string, parent: HTMLElement): HTMLElement {
    const display = document.createElement('div');
    display.className = 'demo-info';
    display.style.fontSize = '14px';
    display.textContent = text;
    parent.appendChild(display);
    return display;
  }

  private make2DArray(cols: number, rows: number): number[][] {
    const arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = new Array(rows).fill(0);
    }
    return arr;
  }

  private resetGrid(p: p5): void {
    const initialPopulation = this.initialPopulationSlider.value() as number;
    
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        this.state.grid[i][j] = p.random(1) < initialPopulation ? 1 : 0;
      }
    }
    
    this.state.populationHistory = [];
    this.state.generations = 0;
    this.updatePopulationHistory();
    this.generationInfo.textContent = `Generation: ${this.state.generations}`;
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
    this.generationInfo.textContent = `Generation: ${this.state.generations}`;
  }

  protected onColorSchemeChange(isDark: boolean): void {
    if (this.p5Instance) {
      this.p5Instance.redraw();
    }
  }
}

export default function initGameOfLifeDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new GameOfLifeDemo(container, config);
  return demo.init();
}