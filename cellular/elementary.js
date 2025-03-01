let cellSize = 5;
let cols; // updated to be calculated dynamically
let rows;
let grid;
let running = false;
let currentRow = 0; // new global to track the last generated row

function setup() {
    cols = floor((0.75 * windowWidth) / cellSize); // new: set cols based on 75% of window width
    rows = floor((windowHeight - 50) / cellSize); // reserve 50px for controls
    createCanvas(cols * cellSize, rows * cellSize);
    background(51); // new: initialize background once
    frameRate(120); // new: set frame rate to 120 FPS for faster generation
    grid = create2DArray(cols, rows); // cells initialized to 0 (white by default)
    // new: initialize the top row with the middle cell active and draw it
    grid[floor(cols / 2)][0] = 1;
    drawRow(0);
    currentRow = 0; // reset current row index on setup
    noLoop();

    document.getElementById('startButton').addEventListener('click', () => {
        running = !running;
        if (running) {
            loop(); // start simulation only when start is hit
        } else {
            noLoop();
        }
    });

    document.getElementById('resetButton').addEventListener('click', () => {
        grid = create2DArray(cols, rows); // resets grid to 0 (white)
        // new: reset top row with middle cell active
        grid[floor(cols / 2)][0] = 1;
        background(51); // new: clear canvas
        drawRow(0);     // new: draw initial row
        currentRow = 0; // reset generation row index
        running = false;
        noLoop();
    });
}

// new: only generate and draw the next row, leaving previous rows unchanged
function draw() {
    if (running) {
        // generate and draw two rows per frame to double the speed
        for (let i = 0; i < 2 && running; i++) {
            generate();
            drawRow(currentRow);
        }
    }
}

// new helper: draw only the specified row
function drawRow(rowIndex) {
    for (let i = 0; i < cols; i++) {
        let x = i * cellSize;
        let y = rowIndex * cellSize;
        if (grid[i][rowIndex] === 1) {
            fill(0); // Black for active (toggled) cells
        } else {
            fill(255); // White for inactive (default) cells
        }
        stroke(255); // White grid lines
        rect(x, y, cellSize, cellSize);
    }
}

function mousePressed() {
    let x = floor(mouseX / cellSize);
    let y = floor(mouseY / cellSize);
    if (y === 0 && x >= 0 && x < cols) {
        grid[x][y] = grid[x][y] === 1 ? 0 : 1;
        drawRow(0); // new: only redraw the top row so the toggle is visible
    }
}

function create2DArray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < cols; i++) {
        arr[i] = new Array(rows).fill(0);
    }
    return arr;
}

function generate() {
    if (currentRow >= rows - 1) { // we've reached bottom row
        running = false;
        noLoop();
        return;
    }
    let nextRow = currentRow + 1;
    for (let i = 0; i < cols; i++) {
        let left = grid[(i - 1 + cols) % cols][currentRow];
        let me = grid[i][currentRow];
        let right = grid[(i + 1) % cols][currentRow];
        grid[i][nextRow] = rules(left, me, right);
    }
    currentRow++;
}

function rules(left, me, right) {
    let s = '' + left + me + right;
    switch (s) {
        case '111': return 0;
        case '110': return 0;
        case '101': return 0;
        case '100': return 1;
        case '011': return 1;
        case '010': return 1;
        case '001': return 1;
        case '000': return 0;
    }
    return 0;
}
