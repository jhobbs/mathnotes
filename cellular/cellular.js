let grid;
let cols;
let rows;
let resolution = 5;
let running = false; // State of the automaton update
let populationHistory = []; // Array to store population counts
const maxHistory = 5; // Number of iterations to consider for rate change
let generations = 0;

let initialPopulationSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);
  cols = floor(width / resolution);
  rows = floor(height / resolution);

  grid = make2DArray(cols, rows);
  frameRate(1);

  // Button for toggling the automaton running state
  const toggleBtn = createButton('Toggle Run');
  toggleBtn.position(10, 10);
  toggleBtn.mousePressed(toggleRunning);
  
  const resetBtn = createButton('Reset');
  resetBtn.position(110, 10);
  resetBtn.mousePressed(resetGrid);

  // Slider for initial population percentage
  initialPopulationSlider = createSlider(0, 1, 0.09, 0.01);
  initialPopulationSlider.position(10, 40);

  // Slider for frame rate
  frameRateSlider = createSlider(0, 40, 1, 1);
  frameRateSlider.position(10, 70);
  frameRateSlider.input(setFramerate);
  
  resetGrid();
}

function setFramerate() {
  frameRate(frameRateSlider.value());
}

function resetGrid() {
  let initialPopulation = initialPopulationSlider.value();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (random(1) < initialPopulation) {
        grid[i][j] = 1;
      } else {
        grid[i][j] = 0;
      }
    }
  }
  updatePopulationHistory();
  generations = 0;
}

function updatePopulationHistory() {
  let currentPopulation = 0;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === 1) {
        currentPopulation++;
      }
    }
  }
  populationHistory.push(currentPopulation);
  if (populationHistory.length > maxHistory) {
    populationHistory.shift();
  }
}

function calculatePopulationRateChange() {
  if (populationHistory.length < 2) {
    return 0;
  }
  let rateChange = 0;
  for (let i = 1; i < populationHistory.length; i++) {
    rateChange += (populationHistory[i] - populationHistory[i - 1]);
  }
  return rateChange / (populationHistory.length - 1);
}

function toggleRunning() {
  running = !running; // Toggle the automaton's running state
}



function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

function mousePressed() {
  let x = Math.floor(mouseX / resolution);
  let y = Math.floor(mouseY / resolution);
  if (x >= 0 && x < cols && y >= 0 && y < rows) {
    grid[x][y] = grid[x][y] ? 0 : 1; // toggle between 0 and 1
  }
}

function countNeighbors(grid, x, y) {
  let sum = 0;
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      let col = (x + i + cols) % cols;
      let row = (y + j + rows) % rows;
      sum += grid[col][row];
    }
  }
  sum -= grid[x][y];
  return sum;
}

function deepCopyGrid(grid) {
    return grid.map(row => [...row]);
}

function updateEntries(grid) {
  if (!running) {
    return grid;
  }
  let next = deepCopyGrid(grid);  // Use deep copy for the next generation
  for (i = 0; i < cols; i++) {
    for (j = 0; j < rows; j++) {
      let state = grid[i][j];
      let neighbors = countNeighbors(grid, i, j);
      if (state == 0 && neighbors == 3) {
        next[i][j] = 1;
      } else if (state == 1 && (neighbors < 2 || neighbors > 3)) {
        next[i][j] = 0;
      }
    }
  }
  grid = next;
  updatePopulationHistory();
  generations++;
  return grid; 
}

function draw() {
  background(0);
  grid = updateEntries(grid);

  let populatedCount = 0;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * resolution;
      let y = j * resolution;
      if (grid[i][j] == 1) {
        populatedCount++;
        fill(255);
        stroke(0);
        rect(x, y, resolution - 1, resolution - 1);
      }
    }
  }

  // Display running status
  fill(255);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  let textX = width - 200; // Adjust the x position to be near the right side
  text(`Running: ${running ? "Yes" : "No"}`, textX, 50);

  // Display population percentage
  let totalCells = cols * rows;
  let populationPercent = (populatedCount / totalCells) * 100;
  text(`Population: ${populationPercent.toFixed(2)}%`, textX, 70);

  // Display population rate change
  let rateChange = calculatePopulationRateChange();
  text(`Rate Change: ${rateChange.toFixed(2)}`, textX, 90);

  text(`Initial Pop. Rate: ${initialPopulationSlider.value().toFixed(2)}`, textX, 110);

  text(`Frame Rate: ${frameRateSlider.value().toFixed(2)}`, textX, 130);
  
  text(`Generation: ${generations}`, textX, 150);
  
}

