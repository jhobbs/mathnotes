let cellSize = 5;
let cols; // updated to be calculated dynamically
let rows;
let grid;
let running = false;
let currentRow = 0; // new global to track the last generated row
let lastToggleTime = 0; // new: track time for mobile tap debounce
let toroidal = true; // new: global variable for toroidal behavior
let gridOffsetX = 120; // new: left margin to show rule visuals

// new constant for rule visuals
const RULES = [
    { pattern: "111", result: 0 },
    { pattern: "110", result: 0 },
    { pattern: "101", result: 0 },
    { pattern: "100", result: 1 },
    { pattern: "011", result: 1 },
    { pattern: "010", result: 1 },
    { pattern: "001", result: 1 },
    { pattern: "000", result: 0 }
];

function setup() {
    // new: create a checkbox for toroidal behavior, enabled by default, and position it above the canvas near the buttons
    let toroidCheckbox = createCheckbox('Toroidal', true);
    toroidCheckbox.position(10, 10);
    toroidCheckbox.changed(() => {
        toroidal = toroidCheckbox.checked();
    });

    cols = floor((windowWidth - gridOffsetX) / cellSize); // updated: use available width after left margin
    rows = floor((windowHeight - 50) / cellSize); // reserve 50px for controls
    // new: adjust canvas width to include left margin for rule visuals
    createCanvas(windowWidth, rows * cellSize); // updated: use 100% of window width
    background(51); // new: initialize background once
    frameRate(120); // new: set frame rate to 120 FPS for faster generation
    grid = create2DArray(cols, rows); // cells initialized to 0 (white by default)
    // new: initialize the top row with the middle cell active and draw it
    grid[floor(cols / 2)][0] = 1;
    drawRow(0);
    currentRow = 0; // reset current row index on setup
    noLoop();

    // new helper to reset simulation from the first row
    function initializeSimulation() {
        grid = create2DArray(cols, rows);
        grid[floor(cols / 2)][0] = 1;
        background(51);
        drawRow(0);
        currentRow = 0;
    }

    // new helper to reset all rows below the first while preserving the first row
    function resetBelowFirst() {
        for (let i = 0; i < cols; i++) {
            for (let j = 1; j < rows; j++) {
                grid[i][j] = 0;
            }
        }
        background(51);
        drawRow(0);
        currentRow = 0;
    }

    document.getElementById('startButton').addEventListener('click', () => {
        resetBelowFirst();
        running = true;
        loop();
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
    // new: always redraw rule visuals on the left
    drawRulesVisuals();
}

// new helper: update x coordinate with left margin
function drawRow(rowIndex) {
    for (let i = 0; i < cols; i++) {
        let x = gridOffsetX + i * cellSize; // updated: offset x coordinate 
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

// new function: draw rule visuals along the left side, with increased vertical padding and a rule number label
function drawRulesVisuals() {
    let ruleBoxSize = 15;
    let startX = 10;
    let startY = 40;
    let spacingY = ruleBoxSize * 2 + 10; // updated vertical spacing
    
    // new: compute the Wolfram rule number, using results for patterns "111"->"000"
    let binaryString = RULES.map(rule => rule.result).join('');
    let ruleNumber = parseInt(binaryString, 2);
    
    fill(255);
    noStroke();
    textSize(14);
    text("Rule " + ruleNumber, startX, startY - 10);
    stroke(255);
    
    for (let i = 0; i < RULES.length; i++) {
        let { pattern, result } = RULES[i];
        let posY = startY + i * spacingY;
        for (let j = 0; j < 3; j++) {
            let posX = startX + j * (ruleBoxSize + 2);
            (pattern[j] === "1") ? fill(0) : fill(255);
            stroke(255);
            rect(posX, posY, ruleBoxSize, ruleBoxSize);
        }
        let centerX = startX + ((ruleBoxSize + 2) * 1);
        let posY2 = posY + ruleBoxSize + 2;
        (result === 1) ? fill(0) : fill(255);
        stroke(255);
        rect(centerX, posY2, ruleBoxSize, ruleBoxSize);
    }
}

function mousePressed() {
    if (millis() - lastToggleTime < 300) return; // debounce rapid taps
    lastToggleTime = millis();
    // adjust mouseX by subtracting gridOffsetX to account for left margin
    let x = floor((mouseX - gridOffsetX) / cellSize);
    let y = floor(mouseY / cellSize);
    if (y === 0 && x >= 0 && x < cols) {
        grid[x][y] = grid[x][y] === 1 ? 0 : 1;
        drawRow(0); // only redraw the top row so the toggle is visible
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
        let left = toroidal ? grid[(i - 1 + cols) % cols][currentRow] : ((i - 1) < 0 ? 0 : grid[i - 1][currentRow]);
        let me = grid[i][currentRow];
        let right = toroidal ? grid[(i + 1) % cols][currentRow] : ((i + 1) >= cols ? 0 : grid[i + 1][currentRow]);
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
