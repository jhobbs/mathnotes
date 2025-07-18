// Elementary Cellular Automata - TypeScript module version
import p5 from 'p5';
import type { DemoInstance, DemoConfig } from '@framework/types';
import { P5DemoBase } from '@framework';

interface Rule {
  pattern: string;
  result: number;
}

class ElementaryCellularAutomataDemo extends P5DemoBase {
  // Constants
  private readonly cellSize = 5;
  private readonly gridOffsetX = 120;
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
  private canvasContainer!: HTMLElement;
  private fillRateSelect!: HTMLSelectElement;
  private startButton!: HTMLButtonElement;
  private resetButton!: HTMLButtonElement;
  private toroidCheckbox!: p5.Element;
  private entDiv!: p5.Element;
  private colEntDiv!: p5.Element;
  private ruleInput!: p5.Element;
  private ruleNumber: number = 30;
  
  protected getStylePrefix(): string {
    return 'elementary-ca';
  }
  
  protected shouldCenterCanvas(): boolean {
    return false;
  }

  protected createSketch(p: p5): void {
    p.setup = () => {
      // Create controls container first
      this.setupControls();
      
      // Calculate grid dimensions with fallback for hidden containers
      const containerWidth = this.canvasContainer.offsetWidth || 600; // Default width if container is hidden
      this.cols = p.floor((containerWidth - this.gridOffsetX) / this.cellSize);
      this.rows = p.floor(400 / this.cellSize);
      
      // Create canvas
      const canvas = p.createCanvas(containerWidth, this.rows * this.cellSize);
      canvas.parent(this.canvasContainer);
      
      // Initialize colors
      this.updateColors(p);
      
      // Set up P5 controls
      this.setupP5Controls(p);
      
      // Create rule input in the left margin
      this.setupRuleInput(p, canvas);
      
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
      this.entDiv.html("H<sub>r</sub>: " + p.nf(ent, 1, 2) + "b");
      const colEnt = this.computeColEntropy();
      this.colEntDiv.html("H<sub>c</sub>: " + p.nf(colEnt, 1, 2) + "b");
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

    p.windowResized = () => {
      const containerWidth = this.canvasContainer.offsetWidth || 600;
      this.cols = p.floor((containerWidth - this.gridOffsetX) / this.cellSize);
      p.resizeCanvas(containerWidth, this.rows * this.cellSize);
      
      // Reset simulation with new dimensions
      this.grid = this.create2DArray(this.cols, this.rows);
      this.initializeFirstRow(p);
      p.background(this.colors.background);
      this.drawRow(p, 0);
      this.currentRow = 0;
      this.running = false;
      p.noLoop();
    };
  }

  private setupControls(): void {
    // Create container for canvas
    this.canvasContainer = document.createElement('div');
    this.canvasContainer.style.position = 'relative';
    this.canvasContainer.style.marginBottom = '20px';
    this.containerEl!.appendChild(this.canvasContainer);

    // Create control panel below canvas
    const controlPanel = this.createControlPanel();
    
    // Add instructions
    const infoDiv = document.createElement('div');
    infoDiv.className = `${this.getStylePrefix()}-info`;
    infoDiv.style.textAlign = 'center';
    infoDiv.style.marginBottom = '20px';
    infoDiv.textContent = 'Click first row to edit. Click rule boxes on left to modify.';
    controlPanel.appendChild(infoDiv);
    
    // Main controls row
    const mainControls = document.createElement('div');
    mainControls.style.display = 'flex';
    mainControls.style.justifyContent = 'center';
    mainControls.style.alignItems = 'center';
    mainControls.style.gap = '10px';
    mainControls.style.marginBottom = '10px';
    controlPanel.appendChild(mainControls);
    
    // Fill rate label and select
    const fillLabel = document.createElement('label');
    fillLabel.htmlFor = 'fillRate';
    fillLabel.textContent = 'Initial fill rate:';
    mainControls.appendChild(fillLabel);
    
    this.fillRateSelect = document.createElement('select');
    this.fillRateSelect.id = 'fillRate';
    this.fillRateSelect.className = `${this.getStylePrefix()}-select`;
    this.fillRateSelect.innerHTML = `
      <option value="1">1 pixel</option>
      <option value="0.25">25%</option>
      <option value="0.5">50%</option>
      <option value="0.75">75%</option>
      <option value="1.0">100%</option>
    `;
    mainControls.appendChild(this.fillRateSelect);
    
    // Buttons
    this.startButton = this.createButton('Start', () => {});
    mainControls.appendChild(this.startButton);
    
    this.resetButton = this.createButton('Reset', () => {});
    mainControls.appendChild(this.resetButton);
    
    // Create containers for P5 elements
    const toroidalContainer = document.createElement('div');
    toroidalContainer.id = 'toroidal-container';
    toroidalContainer.style.textAlign = 'center';
    toroidalContainer.style.marginBottom = '10px';
    controlPanel.appendChild(toroidalContainer);
    
    const entropyContainer = document.createElement('div');
    entropyContainer.id = 'entropy-container';
    entropyContainer.style.textAlign = 'center';
    entropyContainer.style.marginBottom = '10px';
    controlPanel.appendChild(entropyContainer);

    // Set up button event handlers
    this.setupButtonHandlers();
  }

  private setupP5Controls(p: p5): void {
    const toroidalContainer = this.container.querySelector('#toroidal-container') as HTMLElement;
    const entropyContainer = this.container.querySelector('#entropy-container') as HTMLElement;
    
    this.toroidCheckbox = p.createCheckbox('Toroidal', this.toroidal);
    this.toroidCheckbox.parent(toroidalContainer);
    this.toroidCheckbox.changed(() => {
      this.toroidal = this.toroidCheckbox.checked();
    });
    
    this.entDiv = p.createDiv("");
    this.entDiv.parent(entropyContainer);
    this.entDiv.style('color', 'var(--text-color)');
    this.entDiv.style('display', 'inline-block');
    this.entDiv.style('margin-right', '20px');
    
    this.colEntDiv = p.createDiv("");
    this.colEntDiv.parent(entropyContainer);
    this.colEntDiv.style('color', 'var(--text-color)');
    this.colEntDiv.style('display', 'inline-block');
  }

  private setupRuleInput(p: p5, canvas: p5.Renderer): void {
    // Create a div for the rule input that will be positioned over the canvas
    const ruleDiv = p.createDiv('Rule: ');
    ruleDiv.parent(this.canvasContainer);
    ruleDiv.position(10, 5);
    ruleDiv.style('color', this.colors.text);
    ruleDiv.style('font-size', '14px');
    ruleDiv.style('position', 'absolute');
    ruleDiv.style('z-index', '10');
    
    this.ruleInput = p.createInput(this.ruleNumber.toString());
    this.ruleInput.parent(ruleDiv);
    this.ruleInput.size(40);
    this.ruleInput.style('margin-left', '5px');
    this.ruleInput.style('font-size', '14px');
    this.ruleInput.style('padding', '2px 5px');
    this.ruleInput.style('border', '1px solid ' + (this.isDarkMode ? '#666' : '#ccc'));
    this.ruleInput.style('background-color', this.isDarkMode ? '#444' : '#f0f0f0');
    this.ruleInput.style('color', this.colors.text);
    
    // Handle input changes
    this.ruleInput.input(() => {
      const value = this.ruleInput.value() as string;
      const num = parseInt(value);
      if (!isNaN(num) && num >= 0 && num <= 255) {
        this.updateRulesFromNumber(num);
        if (this.p5Instance) {
          this.drawRulesVisuals(this.p5Instance);
        }
      }
    });
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
    const arr = new Array(cols);
    for (let i = 0; i < cols; i++) {
      arr[i] = new Array(rows).fill(0);
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
    if (this.currentRow < 0) return 0;
    const counts: { [key: string]: number } = {};
    for (let r = 0; r <= this.currentRow; r++) {
      let rowString = "";
      for (let c = 0; c < this.cols; c++) {
        rowString += this.grid[c][r];
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
    const counts: { [key: string]: number } = {};
    for (let c = 0; c < this.cols; c++) {
      let colString = "";
      for (let r = 0; r <= this.currentRow; r++) {
        colString += this.grid[c][r];
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
      p.stroke(this.isDarkMode ? p.color(100) : p.color(200));
      p.rect(x, y, this.cellSize, this.cellSize);
    }
  }

  private drawRulesVisuals(p: p5): void {
    p.noStroke();
    p.fill(this.colors.background);
    p.rect(0, 0, this.gridOffsetX, p.height);
    
    const ruleBoxSize = 15;
    const startX = 10;
    const startY = 50;
    const spacingY = ruleBoxSize * 2 + 10;
    
    for (let i = 0; i < this.RULES.length; i++) {
      const { pattern, result } = this.RULES[i];
      const posY = startY + i * spacingY;
      for (let j = 0; j < 3; j++) {
        const posX = startX + j * (ruleBoxSize + 2);
        (pattern[j] === "1") ? p.fill(this.colors.foreground) : p.fill(this.colors.background);
        p.stroke(this.isDarkMode ? p.color(100) : p.color(200));
        p.rect(posX, posY, ruleBoxSize, ruleBoxSize);
      }
      const centerX = startX + ((ruleBoxSize + 2) * 1);
      const posY2 = posY + ruleBoxSize + 2;
      (result === 1) ? p.fill(this.colors.foreground) : p.fill(this.colors.background);
      p.stroke(this.isDarkMode ? p.color(100) : p.color(200));
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
          this.ruleInput.value(this.ruleNumber.toString());
        }
        this.drawRulesVisuals(p);
        return;
      }
    }
  }

  protected onColorSchemeChange(isDark: boolean): void {
    if (this.p5Instance) {
      this.p5Instance.background(this.colors.background);
      this.p5Instance.redraw();
    }
    // Update rule input styling
    if (this.ruleInput) {
      this.ruleInput.style('border', '1px solid ' + (isDark ? '#666' : '#ccc'));
      this.ruleInput.style('background-color', isDark ? '#444' : '#f0f0f0');
      this.ruleInput.style('color', this.colors.text);
    }
  }
}

export const metadata = {
  title: 'Elementary Cellular Automata',
  category: 'Cellular Automata',
  description: 'Exploration of Wolfram\'s elementary cellular automata rules and their emergent patterns'
};

export default function(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new ElementaryCellularAutomataDemo(container, config);
  return demo.init();
}