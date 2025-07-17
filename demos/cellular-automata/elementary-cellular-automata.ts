// Elementary Cellular Automata - TypeScript module version
import p5 from 'p5';
import type { DemoInstance, DemoConfig } from '@framework/types';

interface Rule {
  pattern: string;
  result: number;
}

export default function(container: HTMLElement, config?: DemoConfig): DemoInstance {
  let p5Instance: p5;
  let cellSize = 5;
  let cols: number;
  let rows: number;
  let grid: number[][];
  let running = false;
  let currentRow = 0;
  let lastToggleTime = 0;
  let toroidal = false;
  let gridOffsetX = 120;
  let isDarkMode = config?.darkMode || false;

  // Rule configuration
  const RULES: Rule[] = [
    { pattern: "111", result: 0 },
    { pattern: "110", result: 0 },
    { pattern: "101", result: 0 },
    { pattern: "100", result: 1 },
    { pattern: "011", result: 1 },
    { pattern: "010", result: 1 },
    { pattern: "001", result: 1 },
    { pattern: "000", result: 0 }
  ];

  // Create controls container
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'elementary-demo-container';
  controlsContainer.innerHTML = `
    <div class="demo-info">Click first row to edit.</div>
    <div class="controls">
      <div class="control-row">
        <label for="fillRate">Initial fill rate:</label>
        <select id="fillRate">
          <option value="1">1 pixel</option>
          <option value="0.25">25%</option>
          <option value="0.5">50%</option>
          <option value="0.75">75%</option>
          <option value="1.0">100%</option>
        </select>
        <button id="startButton">Start</button>
        <button id="resetButton">Reset</button>
      </div>
      <div class="control-row" id="toroidal-container">
        <!-- Toroidal checkbox will be placed here -->
      </div>
      <div class="control-row" id="entropy-container">
        <!-- Entropy displays will be placed here -->
      </div>
      <div class="control-row" id="rule-container">
        <!-- Rule input will be placed here -->
      </div>
    </div>
    <div id="canvas-container"></div>
  `;
  container.appendChild(controlsContainer);

  // Get DOM elements
  const canvasContainer = controlsContainer.querySelector('#canvas-container') as HTMLElement;
  const fillRateSelect = controlsContainer.querySelector('#fillRate') as HTMLSelectElement;
  const startButton = controlsContainer.querySelector('#startButton') as HTMLButtonElement;
  const resetButton = controlsContainer.querySelector('#resetButton') as HTMLButtonElement;

  // P5 elements
  let toroidCheckbox: p5.Element;
  let entDiv: p5.Element;
  let colEntDiv: p5.Element;
  let ruleLabel: p5.Element;
  let ruleInput: p5.Element;

  // Helper functions
  function create2DArray(cols: number, rows: number): number[][] {
    const arr = new Array(cols);
    for (let i = 0; i < cols; i++) {
      arr[i] = new Array(rows).fill(0);
    }
    return arr;
  }

  function updateRulesFromNumber(num: string | number): void {
    const ruleNum = typeof num === 'string' ? parseInt(num) : num;
    if (isNaN(ruleNum) || ruleNum < 0 || ruleNum > 255) return;
    const bin = ruleNum.toString(2).padStart(8, '0');
    for (let i = 0; i < RULES.length; i++) {
      RULES[i].result = parseInt(bin[i]);
    }
  }

  function rules(left: number, me: number, right: number): number {
    const s = '' + left + me + right;
    for (let i = 0; i < RULES.length; i++) {
      if (RULES[i].pattern === s) return RULES[i].result;
    }
    return 0;
  }

  // Create P5.js sketch
  const sketch = (p: p5) => {
    function initializeFirstRow(): void {
      const fillValue = fillRateSelect.value;
      
      // Clear first row
      for (let i = 0; i < cols; i++) {
        grid[i][0] = 0;
      }
      
      if (fillValue === "1") {
        // Single pixel in the middle
        grid[p.floor(cols / 2)][0] = 1;
      } else {
        // Random fill with specified percentage
        const fillRate = parseFloat(fillValue);
        for (let i = 0; i < cols; i++) {
          grid[i][0] = p.random() < fillRate ? 1 : 0;
        }
      }
    }

    function resetBelowFirst(): void {
      for (let i = 0; i < cols; i++) {
        for (let j = 1; j < rows; j++) {
          grid[i][j] = 0;
        }
      }
      p.background(isDarkMode ? 30 : 240);
      drawRow(0);
      currentRow = 0;
    }

    function computeEntropy(): number {
      if (currentRow < 0) return 0;
      const counts: { [key: string]: number } = {};
      for (let r = 0; r <= currentRow; r++) {
        let rowString = "";
        for (let c = 0; c < cols; c++) {
          rowString += grid[c][r];
        }
        counts[rowString] = (counts[rowString] || 0) + 1;
      }
      const total = currentRow + 1;
      let entropy = 0;
      for (const key in counts) {
        const prob = counts[key] / total;
        entropy -= prob * Math.log(prob) / Math.log(2);
      }
      return entropy;
    }

    function computeColEntropy(): number {
      const counts: { [key: string]: number } = {};
      for (let c = 0; c < cols; c++) {
        let colString = "";
        for (let r = 0; r <= currentRow; r++) {
          colString += grid[c][r];
        }
        counts[colString] = (counts[colString] || 0) + 1;
      }
      const total = cols;
      let entropy = 0;
      for (const key in counts) {
        const prob = counts[key] / total;
        entropy -= prob * Math.log(prob) / Math.log(2);
      }
      return entropy;
    }

    function drawRow(rowIndex: number): void {
      for (let i = 0; i < cols; i++) {
        const x = gridOffsetX + i * cellSize;
        const y = rowIndex * cellSize;
        if (grid[i][rowIndex] === 1) {
          p.fill(isDarkMode ? 255 : 0); // Light for active cells in dark mode
        } else {
          p.fill(isDarkMode ? 30 : 255); // Dark background for inactive cells in dark mode
        }
        p.stroke(isDarkMode ? 100 : 200);
        p.rect(x, y, cellSize, cellSize);
      }
    }

    function drawRulesVisuals(): void {
      p.noStroke();
      p.fill(isDarkMode ? 30 : 240);
      p.rect(0, 0, gridOffsetX, p.height);
      
      const ruleBoxSize = 15;
      const startX = 10;
      const startY = 130;
      const spacingY = ruleBoxSize * 2 + 10;
      
      for (let i = 0; i < RULES.length; i++) {
        const { pattern, result } = RULES[i];
        const posY = startY + i * spacingY;
        for (let j = 0; j < 3; j++) {
          const posX = startX + j * (ruleBoxSize + 2);
          (pattern[j] === "1") ? p.fill(isDarkMode ? 255 : 0) : p.fill(isDarkMode ? 30 : 255);
          p.stroke(isDarkMode ? 100 : 200);
          p.rect(posX, posY, ruleBoxSize, ruleBoxSize);
        }
        const centerX = startX + ((ruleBoxSize + 2) * 1);
        const posY2 = posY + ruleBoxSize + 2;
        (result === 1) ? p.fill(isDarkMode ? 255 : 0) : p.fill(isDarkMode ? 30 : 255);
        p.stroke(isDarkMode ? 100 : 200);
        p.rect(centerX, posY2, ruleBoxSize, ruleBoxSize);
      }
    }

    function generate(): void {
      if (currentRow >= rows - 1) {
        running = false;
        p.noLoop();
        return;
      }
      const nextRow = currentRow + 1;
      for (let i = 0; i < cols; i++) {
        const left = toroidal ? grid[(i - 1 + cols) % cols][currentRow] : ((i - 1) < 0 ? 0 : grid[i - 1][currentRow]);
        const me = grid[i][currentRow];
        const right = toroidal ? grid[(i + 1) % cols][currentRow] : ((i + 1) >= cols ? 0 : grid[i + 1][currentRow]);
        grid[i][nextRow] = rules(left, me, right);
      }
      currentRow++;
    }

    p.setup = function() {
      // Create controls in their designated containers
      const toroidalContainer = controlsContainer.querySelector('#toroidal-container') as HTMLElement;
      const entropyContainer = controlsContainer.querySelector('#entropy-container') as HTMLElement;
      const ruleContainer = controlsContainer.querySelector('#rule-container') as HTMLElement;
      
      toroidCheckbox = p.createCheckbox('Toroidal', toroidal);
      toroidCheckbox.parent(toroidalContainer);
      toroidCheckbox.changed(() => {
        toroidal = toroidCheckbox.checked();
      });
      
      entDiv = p.createDiv("");
      entDiv.parent(entropyContainer);
      entDiv.style('color', 'var(--text-color)');
      entDiv.style('display', 'inline-block');
      entDiv.style('margin-right', '20px');
      
      colEntDiv = p.createDiv("");
      colEntDiv.parent(entropyContainer);
      colEntDiv.style('color', 'var(--text-color)');
      colEntDiv.style('display', 'inline-block');
      
      ruleLabel = p.createDiv("Rule:");
      ruleLabel.parent(ruleContainer);
      ruleLabel.style('display', 'inline-block');
      ruleLabel.style('margin-right', '10px');
      
      ruleInput = p.createInput("30");
      ruleInput.parent(ruleContainer);
      ruleInput.style('display', 'inline-block');
      ruleInput.size(80);
      ruleInput.input(() => {
        updateRulesFromNumber(ruleInput.value());
        drawRulesVisuals();
      });
      updateRulesFromNumber("30");

      cols = p.floor((canvasContainer.offsetWidth - gridOffsetX) / cellSize);
      rows = p.floor(400 / cellSize);
      const canvas = p.createCanvas(canvasContainer.offsetWidth, rows * cellSize);
      canvas.parent(canvasContainer);
      
      // Update dark mode and set background
      p.background(isDarkMode ? 30 : 240);
      p.frameRate(120);
      grid = create2DArray(cols, rows);
      initializeFirstRow();
      drawRow(0);
      currentRow = 0;
      p.noLoop();
      
      // Auto-start after 1 second
      setTimeout(() => {
        startButton.click();
      }, 1000);
    };

    p.draw = function() {
      if (running) {
        generate();
        drawRow(currentRow);
      }
      drawRulesVisuals();
      // Update entropy displays
      const ent = computeEntropy();
      entDiv.html("H<sub>r</sub>: " + p.nf(ent, 1, 2) + "b");
      const colEnt = computeColEntropy();
      colEntDiv.html("H<sub>c</sub>: " + p.nf(colEnt, 1, 2) + "b");
    };

    p.mousePressed = function() {
      if (p.millis() - lastToggleTime < 300) return;
      lastToggleTime = p.millis();
    
      // Check if click is within left margin for rule demo boxes
      if (p.mouseX < gridOffsetX) {
        const ruleBoxSize = 15;
        const startX = 10;
        const startY = 130;
        const spacingY = ruleBoxSize * 2 + 10;
        for (let i = 0; i < RULES.length; i++) {
          const boxX = startX + ((ruleBoxSize + 2) * 1);
          const boxY = startY + i * spacingY + ruleBoxSize + 2;
          if (p.mouseX >= boxX && p.mouseX <= boxX + ruleBoxSize &&
              p.mouseY >= boxY && p.mouseY <= boxY + ruleBoxSize) {
            RULES[i].result = RULES[i].result === 1 ? 0 : 1;
            const binaryString = RULES.map(rule => rule.result).join('');
            const newRuleNum = parseInt(binaryString, 2);
            ruleInput.value(newRuleNum.toString());
            drawRulesVisuals();
            return;
          }
        }
        return;
      }
    
      // Otherwise, check for clicks on first row of grid
      const x = p.floor((p.mouseX - gridOffsetX) / cellSize);
      const y = p.floor(p.mouseY / cellSize);
      if (y === 0 && x >= 0 && x < cols) {
        grid[x][y] = grid[x][y] === 1 ? 0 : 1;
        drawRow(0);
      }
    };

    p.windowResized = function() {
      cols = p.floor((canvasContainer.offsetWidth - gridOffsetX) / cellSize);
      p.resizeCanvas(canvasContainer.offsetWidth, rows * cellSize);
      // Reset simulation with new dimensions
      grid = create2DArray(cols, rows);
      initializeFirstRow();
      p.background(isDarkMode ? 30 : 240);
      drawRow(0);
      currentRow = 0;
      running = false;
      p.noLoop();
    };
  };

  // Button event handlers
  startButton.addEventListener('click', () => {
    const resetBelowFirst = () => {
      for (let i = 0; i < cols; i++) {
        for (let j = 1; j < rows; j++) {
          grid[i][j] = 0;
        }
      }
      p5Instance.background(isDarkMode ? 30 : 240);
      const drawRow = (rowIndex: number) => {
        for (let i = 0; i < cols; i++) {
          const x = gridOffsetX + i * cellSize;
          const y = rowIndex * cellSize;
          if (grid[i][rowIndex] === 1) {
            p5Instance.fill(isDarkMode ? 255 : 0);
          } else {
            p5Instance.fill(isDarkMode ? 30 : 255);
          }
          p5Instance.stroke(isDarkMode ? 100 : 200);
          p5Instance.rect(x, y, cellSize, cellSize);
        }
      };
      drawRow(0);
      currentRow = 0;
    };
    
    resetBelowFirst();
    running = true;
    p5Instance.loop();
  });
  
  startButton.innerText = "Redraw";

  resetButton.addEventListener('click', () => {
    grid = create2DArray(cols, rows);
    const fillValue = fillRateSelect.value;
    
    // Clear first row
    for (let i = 0; i < cols; i++) {
      grid[i][0] = 0;
    }
    
    if (fillValue === "1") {
      grid[Math.floor(cols / 2)][0] = 1;
    } else {
      const fillRate = parseFloat(fillValue);
      for (let i = 0; i < cols; i++) {
        grid[i][0] = p5Instance.random() < fillRate ? 1 : 0;
      }
    }
    
    p5Instance.background(isDarkMode ? 30 : 240);
    const drawRow = (rowIndex: number) => {
      for (let i = 0; i < cols; i++) {
        const x = gridOffsetX + i * cellSize;
        const y = rowIndex * cellSize;
        if (grid[i][rowIndex] === 1) {
          p5Instance.fill(isDarkMode ? 255 : 0);
        } else {
          p5Instance.fill(isDarkMode ? 30 : 255);
        }
        p5Instance.stroke(isDarkMode ? 100 : 200);
        p5Instance.rect(x, y, cellSize, cellSize);
      }
    };
    drawRow(0);
    currentRow = 0;
    running = false;
    
    // Auto-restart after reset
    setTimeout(() => {
      startButton.click();
    }, 1000);
    p5Instance.noLoop();
  });

  // Initialize P5.js instance
  p5Instance = new p5(sketch);

  // Listen for theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    isDarkMode = e.matches;
    if (p5Instance) {
      p5Instance.background(isDarkMode ? 30 : 240);
      p5Instance.redraw();
    }
  });

  return {
    cleanup: () => {
      p5Instance.remove();
    }
  };
}