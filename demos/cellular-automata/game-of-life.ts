// Conway's Game of Life - TypeScript module version
import p5 from 'p5';
import type { DemoInstance, DemoConfig, DemoMetadata, CanvasSize } from '@framework/types';
import { P5DemoBase, createSlider, createInfoDisplay, createControlRow } from '@framework';

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
  private runningStatus!: ReturnType<typeof createInfoDisplay>;
  private populationInfo!: ReturnType<typeof createInfoDisplay>;
  private rateChangeInfo!: ReturnType<typeof createInfoDisplay>;
  private generationInfo!: ReturnType<typeof createInfoDisplay>;

  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
    
    this.state = {
      grid: [],
      running: false,
      generations: 0,
      populationHistory: [],
      maxHistory: 5
    };
  }
  
  protected getStylePrefix(): string {
    return 'game-of-life';
  }
  
  protected getAspectRatio(): number {
    return 0.75;
  }
  
  protected getMaxHeightPercent(): number {
    return 0.5;
  }

  protected createSketch(p: p5): void {
    p.setup = () => {
      // Calculate grid dimensions
      this.cols = Math.floor(p.width / this.resolution);
      this.rows = Math.floor(p.height / this.resolution);
      
      // Initialize colors
      this.updateColors(p);
      
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
      this.populationInfo.update(`Population: ${populationPercent.toFixed(2)}%`);
      
      const rateChange = this.calculatePopulationRateChange();
      this.rateChangeInfo.update(`Rate Change: ${rateChange.toFixed(2)}`);
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

  }
  
  protected onResize(_p: p5, size: CanvasSize): void {
    // Update grid dimensions
    const newCols = Math.floor(size.width / this.resolution);
    const newRows = Math.floor(size.height / this.resolution);
    
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
  }

  private setupControls(p: p5): void {
    const controlPanel = this.createControlPanel();
    
    // Instructions are now handled by metadata.instructions
    
    // Buttons
    this.toggleBtn = this.createButton('Start', () => {
      this.state.running = !this.state.running;
      this.toggleBtn.textContent = this.state.running ? 'Stop' : 'Start';
      this.runningStatus.update(`Running: ${this.state.running ? "Yes" : "No"}`);
    });
    
    this.resetBtn = this.createButton('Reset', () => {
      this.resetGrid(p);
    });
    
    // Create button row
    const buttonRow = createControlRow(
      [this.toggleBtn, this.resetBtn],
      { gap: '20px' }
    );
    controlPanel.appendChild(buttonRow);
    
    // Create slider container
    const sliderContainer = document.createElement('div');
    
    // Initial population slider
    this.initialPopulationSlider = createSlider(
      p,
      'Initial Population',
      0, 1, 0.15, 0.01,
      sliderContainer,
      undefined,
      this.getStylePrefix()
    );
    
    // Frame rate slider
    this.frameRateSlider = createSlider(
      p,
      'Frame Rate',
      1, 30, 10, 1,
      sliderContainer,
      () => {
        const frameRate = this.frameRateSlider.value() as number;
        p.frameRate(frameRate);
      },
      this.getStylePrefix()
    );
    
    // Create slider row
    const sliderRow = createControlRow(
      [...sliderContainer.children] as HTMLElement[],
      { gap: '30px' }
    );
    sliderRow.style.marginTop = '20px';
    controlPanel.appendChild(sliderRow);
    
    // Create info displays
    this.runningStatus = createInfoDisplay('Running: No', this.getStylePrefix());
    this.populationInfo = createInfoDisplay('Population: 0.00%', this.getStylePrefix());
    this.rateChangeInfo = createInfoDisplay('Rate Change: 0.00', this.getStylePrefix());
    this.generationInfo = createInfoDisplay('Generation: 0', this.getStylePrefix());
    
    // Create info row
    const infoRow = createControlRow(
      [
        this.runningStatus.element,
        this.populationInfo.element,
        this.rateChangeInfo.element,
        this.generationInfo.element
      ],
      { gap: '20px' }
    );
    infoRow.style.marginTop = '20px';
    controlPanel.appendChild(infoRow);
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
    this.generationInfo.update(`Generation: ${this.state.generations}`);
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
    this.generationInfo.update(`Generation: ${this.state.generations}`);
  }

  protected onColorSchemeChange(_isDark: boolean): void {
    if (this.p5Instance) {
      this.p5Instance.redraw();
    }
  }
}

export const metadata: DemoMetadata = {
  title: "Conway's Game of Life",
  category: 'Cellular Automata',
  description: 'Interactive simulation of the classic cellular automaton demonstrating emergent behavior',
  instructions: 'Click on cells to toggle them. Click Start to run the simulation.'
};

export default function initGameOfLifeDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new GameOfLifeDemo(container, config);
  return demo.init();
}