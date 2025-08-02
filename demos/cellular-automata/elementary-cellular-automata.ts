// Elementary Cellular Automata - TypeScript module version
import p5 from 'p5';
import type { DemoInstance, DemoConfig, CanvasSize, DemoMetadata } from '@framework/types';
import { P5DemoBase, createSelect, createCheckbox, createTextInput, createInfoDisplay, createControlRow } from '@framework';

interface Rule {
  pattern: string;
  result: number;
}

class ElementaryCellularAutomataDemo extends P5DemoBase {
  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
  }
  // Constants
  private readonly cellSize: number = 5;
  private gridOffsetX: number = 120; // Made non-readonly for responsive adjustment
  private readonly RULES: Rule[] = [
    { pattern: "111", result: 0 },
    { pattern: "110", result: 0 },
    { pattern: "101", result: 0 },
    { pattern: "100", result: 1 },
    { pattern: "011", result: 1 },
    { pattern: "010", result: 1 },
    { pattern: "001", result: 1 },
    { pattern: "000", result: 0 }
  ];

  // Grid properties
  private cols!: number;
  private rows!: number;
  private grid!: number[][];
  
  // State
  private running = false;
  private currentRow = 0;
  private lastToggleTime = 0;
  private toroidal = false;

  // UI Elements
  private fillRateSelect!: HTMLSelectElement;
  private startButton!: HTMLButtonElement;
  private resetButton!: HTMLButtonElement;
  private entDisplay!: ReturnType<typeof createInfoDisplay>;
  private colEntDisplay!: ReturnType<typeof createInfoDisplay>;
  private ruleInput!: HTMLInputElement;
  private ruleNumber: number = 30;
  
  protected getStylePrefix(): string {
    return 'elementary-ca';
  }
  
  protected shouldCenterCanvas(): boolean {
    return true;
  }
  
  protected getAspectRatio(): number {
    return 0; // Full width
  }
  
  protected getMaxHeightPercent(): number {
    return 0.7; // 70% max height
  }
  
  protected getMinHeight(): number {
    return 400; // Ensure minimum height for visibility
  }

  protected createSketch(p: p5): void {
    p.setup = () => {
      
      // Create controls container first
      this.setupControls();
      
      // Adjust gridOffsetX for mobile
      const isMobile = p.width < 768;
      this.gridOffsetX = isMobile ? 80 : 120; // Smaller offset on mobile
      
      // Calculate grid dimensions based on canvas size
      const availableWidth = Math.max(this.cellSize, p.width - this.gridOffsetX);
      const availableHeight = Math.max(this.cellSize, p.height);
      this.cols = Math.floor(availableWidth / this.cellSize);
      this.rows = Math.floor(availableHeight / this.cellSize);
      
      
      // Create rule input in the left margin
      this.setupRuleInput(p);
      
      // Initialize
      p.background(this.colors.background);
      p.frameRate(120);
      
      this.grid = this.create2DArray(this.cols, this.rows);
      
      this.updateRulesFromNumber(this.ruleNumber);
      this.initializeFirstRow(p);
      this.drawRow(p, 0);
      this.currentRow = 0;
      p.noLoop();
      
      // Auto-start after 1 second
      setTimeout(() => {
        this.startButton.click();
      }, 1000);
    };

    p.draw = () => {
      if (this.running) {
        this.generate(p);
        this.drawRow(p, this.currentRow);
      }
      this.drawRulesVisuals(p);
      
      // Update entropy displays
      const ent = this.computeEntropy();
      this.entDisplay.element.innerHTML = "H<sub>r</sub>: " + p.nf(ent, 1, 2) + "b";
      const colEnt = this.computeColEntropy();
      this.colEntDisplay.element.innerHTML = "H<sub>c</sub>: " + p.nf(colEnt, 1, 2) + "b";
    };

    p.mousePressed = () => {
      if (p.millis() - this.lastToggleTime < 300) return;
      this.lastToggleTime = p.millis();
    
      // Check if click is within left margin for rule demo boxes
      if (p.mouseX < this.gridOffsetX) {
        this.handleRuleClick(p);
        return;
      }
    
      // Otherwise, check for clicks on first row of grid
      const x = p.floor((p.mouseX - this.gridOffsetX) / this.cellSize);
      const y = p.floor(p.mouseY / this.cellSize);
      if (y === 0 && x >= 0 && x < this.cols) {
        this.grid[x][y] = this.grid[x][y] === 1 ? 0 : 1;
        this.drawRow(p, 0);
      }
    };

  }

  private setupControls(): void {
    // Create control panel below canvas
    const controlPanel = this.createControlPanel();
    
    // Instructions are now handled by metadata.instructions
    
    // Create fill rate select
    const fillRateElement = createSelect(
      'Initial fill rate',
      [
        { value: '1', label: '1 pixel' },
        { value: '0.25', label: '25%' },
        { value: '0.5', label: '50%' },
        { value: '0.75', label: '75%' },
        { value: '1.0', label: '100%' }
      ],
      '1',
      () => {}, // No immediate action needed
      this.getStylePrefix()
    );
    this.fillRateSelect = fillRateElement.querySelector('select') as HTMLSelectElement;
    
    // Buttons
    this.startButton = this.createButton('Start', () => {});
    this.resetButton = this.createButton('Reset', () => {});
    
    // Create main controls row
    const mainControlsRow = createControlRow(
      [fillRateElement, this.startButton, this.resetButton],
      { gap: '20px' }
    );
    controlPanel.appendChild(mainControlsRow);
    
    // Create toroidal checkbox
    const toroidalElement = createCheckbox(
      'Toroidal',
      this.toroidal,
      (checked) => { this.toroidal = checked; },
      this.getStylePrefix()
    );
    
    // Create entropy displays
    this.entDisplay = createInfoDisplay('H<sub>r</sub>: 0.00b', this.getStylePrefix());
    this.colEntDisplay = createInfoDisplay('H<sub>c</sub>: 0.00b', this.getStylePrefix());
    
    // Create second row with checkbox and entropy displays
    const secondRow = createControlRow(
      [toroidalElement, this.entDisplay.element, this.colEntDisplay.element],
      { gap: '20px' }
    );
    secondRow.classList.add('mt-sm');
    controlPanel.appendChild(secondRow);

    // Set up button event handlers
    this.setupButtonHandlers();
  }


  private setupRuleInput(_p: p5): void {
    // Create a container for the rule input that will be positioned over the canvas
    const ruleContainer = document.createElement('div');
    if (this.canvasParent) {
      this.canvasParent.appendChild(ruleContainer);
    } else if (this.container) {
      this.container.appendChild(ruleContainer);
    }
    ruleContainer.className = 'demo-overlay';
    
    // Create text input using new component
    const ruleElement = createTextInput(
      'Rule',
      this.ruleNumber.toString(),
      (value) => {
        const num = parseInt(value);
        if (!isNaN(num) && num >= 0 && num <= 255) {
          this.ruleNumber = num;
          this.updateRulesFromNumber(num);
          if (this.p5Instance) {
            this.drawRulesVisuals(this.p5Instance);
          }
        }
      },
      {
        type: 'number',
        pattern: '[0-9]*'
      }
    );
    
    // Style the input to be compact
    const input = ruleElement.querySelector('input') as HTMLInputElement;
    if (input) {
      input.classList.add('demo-text-input');
      this.ruleInput = input;
    }
    
    ruleContainer.appendChild(ruleElement);
  }

  private setupButtonHandlers(): void {
    this.addEventListener(this.startButton, 'click', () => {
      if (!this.p5Instance) return;
      
      this.resetBelowFirst(this.p5Instance);
      this.running = true;
      this.p5Instance.loop();
    });
    
    this.startButton.innerText = "Redraw";

    this.addEventListener(this.resetButton, 'click', () => {
      if (!this.p5Instance) return;
      
      this.grid = this.create2DArray(this.cols, this.rows);
      this.initializeFirstRow(this.p5Instance);
      this.p5Instance.background(this.colors.background);
      this.drawRow(this.p5Instance, 0);
      this.currentRow = 0;
      this.running = false;
      
      // Auto-restart after reset
      setTimeout(() => {
        this.startButton.click();
      }, 1000);
      this.p5Instance.noLoop();
    });
  }

  private create2DArray(cols: number, rows: number): number[][] {
    // Ensure valid dimensions
    if (!Number.isFinite(cols) || !Number.isFinite(rows)) {
      throw new Error(`Invalid array dimensions: cols=${cols}, rows=${rows}`);
    }
    
    const safeCols = Math.max(1, Math.floor(cols));
    const safeRows = Math.max(1, Math.floor(rows));
    
    const arr = new Array(safeCols);
    for (let i = 0; i < safeCols; i++) {
      arr[i] = new Array(safeRows).fill(0);
    }
    return arr;
  }

  private updateRulesFromNumber(num: string | number): void {
    const ruleNum = typeof num === 'string' ? parseInt(num) : num;
    if (isNaN(ruleNum) || ruleNum < 0 || ruleNum > 255) return;
    this.ruleNumber = ruleNum;
    const bin = ruleNum.toString(2).padStart(8, '0');
    for (let i = 0; i < this.RULES.length; i++) {
      this.RULES[i].result = parseInt(bin[i]);
    }
  }

  private rules(left: number, me: number, right: number): number {
    const s = '' + left + me + right;
    for (let i = 0; i < this.RULES.length; i++) {
      if (this.RULES[i].pattern === s) return this.RULES[i].result;
    }
    return 0;
  }

  private initializeFirstRow(p: p5): void {
    const fillValue = this.fillRateSelect.value;
    
    // Clear first row
    for (let i = 0; i < this.cols; i++) {
      this.grid[i][0] = 0;
    }
    
    if (fillValue === "1") {
      // Single pixel in the middle
      this.grid[p.floor(this.cols / 2)][0] = 1;
    } else {
      // Random fill with specified percentage
      const fillRate = parseFloat(fillValue);
      for (let i = 0; i < this.cols; i++) {
        this.grid[i][0] = p.random() < fillRate ? 1 : 0;
      }
    }
  }

  private resetBelowFirst(p: p5): void {
    for (let i = 0; i < this.cols; i++) {
      for (let j = 1; j < this.rows; j++) {
        this.grid[i][j] = 0;
      }
    }
    p.background(this.colors.background);
    this.drawRow(p, 0);
    this.currentRow = 0;
  }

  private computeEntropy(): number {
    if (this.currentRow < 0 || !this.grid) return 0;
    const counts: { [key: string]: number } = {};
    for (let r = 0; r <= this.currentRow; r++) {
      let rowString = "";
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[c] && this.grid[c][r] !== undefined) {
          rowString += this.grid[c][r];
        }
      }
      counts[rowString] = (counts[rowString] || 0) + 1;
    }
    const total = this.currentRow + 1;
    let entropy = 0;
    for (const key in counts) {
      const prob = counts[key] / total;
      entropy -= prob * Math.log(prob) / Math.log(2);
    }
    return entropy;
  }

  private computeColEntropy(): number {
    if (!this.grid) return 0;
    const counts: { [key: string]: number } = {};
    for (let c = 0; c < this.cols; c++) {
      let colString = "";
      for (let r = 0; r <= this.currentRow; r++) {
        if (this.grid[c] && this.grid[c][r] !== undefined) {
          colString += this.grid[c][r];
        }
      }
      counts[colString] = (counts[colString] || 0) + 1;
    }
    const total = this.cols;
    let entropy = 0;
    for (const key in counts) {
      const prob = counts[key] / total;
      entropy -= prob * Math.log(prob) / Math.log(2);
    }
    return entropy;
  }

  private drawRow(p: p5, rowIndex: number): void {
    for (let i = 0; i < this.cols; i++) {
      const x = this.gridOffsetX + i * this.cellSize;
      const y = rowIndex * this.cellSize;
      if (this.grid[i][rowIndex] === 1) {
        p.fill(this.colors.foreground);
      } else {
        p.fill(this.colors.background);
      }
      if (this.colors.grid) p.stroke(this.colors.grid);
      p.rect(x, y, this.cellSize, this.cellSize);
    }
  }

  private drawRulesVisuals(p: p5): void {
    p.noStroke();
    p.fill(this.colors.background);
    p.rect(0, 0, this.gridOffsetX, p.height);
    
    const isMobile = p.width < 768;
    const ruleBoxSize = isMobile ? 10 : 15;
    const startX = isMobile ? 5 : 10;
    const startY = 50;
    const spacingY = ruleBoxSize * 2 + (isMobile ? 5 : 10);
    
    for (let i = 0; i < this.RULES.length; i++) {
      const { pattern, result } = this.RULES[i];
      const posY = startY + i * spacingY;
      for (let j = 0; j < 3; j++) {
        const posX = startX + j * (ruleBoxSize + 2);
        (pattern[j] === "1") ? p.fill(this.colors.foreground) : p.fill(this.colors.background);
        if (this.colors.grid) p.stroke(this.colors.grid);
        p.rect(posX, posY, ruleBoxSize, ruleBoxSize);
      }
      const centerX = startX + ((ruleBoxSize + 2) * 1);
      const posY2 = posY + ruleBoxSize + 2;
      (result === 1) ? p.fill(this.colors.foreground) : p.fill(this.colors.background);
      if (this.colors.grid) p.stroke(this.colors.grid);
      p.rect(centerX, posY2, ruleBoxSize, ruleBoxSize);
    }
  }

  private generate(p: p5): void {
    if (this.currentRow >= this.rows - 1) {
      this.running = false;
      p.noLoop();
      return;
    }
    const nextRow = this.currentRow + 1;
    for (let i = 0; i < this.cols; i++) {
      const left = this.toroidal ? 
        this.grid[(i - 1 + this.cols) % this.cols][this.currentRow] : 
        ((i - 1) < 0 ? 0 : this.grid[i - 1][this.currentRow]);
      const me = this.grid[i][this.currentRow];
      const right = this.toroidal ? 
        this.grid[(i + 1) % this.cols][this.currentRow] : 
        ((i + 1) >= this.cols ? 0 : this.grid[i + 1][this.currentRow]);
      this.grid[i][nextRow] = this.rules(left, me, right);
    }
    this.currentRow++;
  }

  private handleRuleClick(p: p5): void {
    const ruleBoxSize = 15;
    const startX = 10;
    const startY = 50;
    const spacingY = ruleBoxSize * 2 + 10;
    
    for (let i = 0; i < this.RULES.length; i++) {
      const boxX = startX + ((ruleBoxSize + 2) * 1);
      const boxY = startY + i * spacingY + ruleBoxSize + 2;
      if (p.mouseX >= boxX && p.mouseX <= boxX + ruleBoxSize &&
          p.mouseY >= boxY && p.mouseY <= boxY + ruleBoxSize) {
        this.RULES[i].result = this.RULES[i].result === 1 ? 0 : 1;
        const binaryString = this.RULES.map(rule => rule.result).join('');
        this.ruleNumber = parseInt(binaryString, 2);
        // Update the input field
        if (this.ruleInput) {
          this.ruleInput.value = this.ruleNumber.toString();
        }
        this.drawRulesVisuals(p);
        return;
      }
    }
  }

  protected onColorSchemeChange(_isDark: boolean): void {
    if (this.p5Instance) {
      this.p5Instance.background(this.colors.background);
      this.p5Instance.redraw();
    }
    // Update rule input styling
    if (this.ruleInput) {
      // Theme colors are handled by CSS classes
    }
  }

  protected onResize(p: p5, size: CanvasSize): void {
    // Adjust gridOffsetX for mobile
    const isMobile = size.width < 768;
    this.gridOffsetX = isMobile ? 80 : 120; // Smaller offset on mobile
    
    // Recalculate grid dimensions
    const availableWidth = Math.max(this.cellSize, size.width - this.gridOffsetX);
    const availableHeight = Math.max(this.cellSize, size.height);
    this.cols = Math.floor(availableWidth / this.cellSize);
    this.rows = Math.floor(availableHeight / this.cellSize);
    
    // Reset simulation with new dimensions
    this.grid = this.create2DArray(this.cols, this.rows);
    this.initializeFirstRow(p);
    p.background(this.colors.background);
    this.drawRow(p, 0);
    this.currentRow = 0;
    this.running = false;
    p.noLoop();
  }
}

export const metadata: DemoMetadata = {
  title: 'Elementary Cellular Automata',
  category: 'Cellular Automata',
  description: 'Exploration of Wolfram\'s elementary cellular automata rules and their emergent patterns',
  instructions: 'Click first row to edit. Click rule boxes on left to modify.'
};

export default function(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new ElementaryCellularAutomataDemo(container, config);
  return demo.init();
}