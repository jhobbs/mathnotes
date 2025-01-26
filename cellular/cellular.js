let grid;
let cols;
let rows;
let resolution = 10;
let running = false; // State of the automaton update


function setup() {
  createCanvas(600, 400); // Increased width to accommodate side display
  cols = 400 / resolution; // Only part of the canvas for the grid
  rows = height / resolution;


  grid = make2DArray(cols, rows);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (random(1) < 0.09) {
        grid[i][j] = 1;
      } else {
        grid[i][j] = 0;
      }
    }
  }
  
  frameRate(1);

  // Button for toggling the automaton running state
  const toggleBtn = createButton('Toggle Run');
  toggleBtn.position(410, 30);
  toggleBtn.mousePressed(toggleRunning);
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
  text(`Running: ${running ? "Yes" : "No"}`, 410, 50);

  // Display population percentage
  let totalCells = cols * rows;
  let populationPercent = (populatedCount / totalCells) * 100;
  text(`Population: ${populationPercent.toFixed(2)}%`, 410, 70);

}

