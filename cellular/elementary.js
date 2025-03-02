let cellSize = 5;
let cols; // updated to be calculated dynamically
let rows;
let grid;
let running = false;
let currentRow = 0; // new global to track the last generated row
let lastToggleTime = 0; // new: track time for mobile tap debounce
let toroidal = true; // new: global variable for toroidal behavior
let gridOffsetX = 120; // new: left margin to show rule visuals
let entDiv; // new: DOM element to display entropy
let colEntDiv; // new: DOM element to display column entropy

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
    
    // Updated: position the row entropy display closer to the toroid checkbox
    entDiv = createDiv("");
    entDiv.position(150, 10); 
    entDiv.style('color', '#fff');
    
    // new: create column entropy div positioned closer to row entropy for mobile-friendliness
    colEntDiv = createDiv("");
    // Set colEntDiv's x position to 250 (adjust as needed) so they're closer together
    colEntDiv.position(250, 10);
    colEntDiv.style('color', '#fff');
    
    // new: create a label for the rule textbox and reposition both
    ruleLabel = createDiv("Rule:");
    ruleLabel.position(10, 70);
    ruleInput = createInput("30");
    ruleInput.position(10, 90);
    ruleInput.size(80);
    ruleInput.input(() => {
        updateRulesFromNumber(ruleInput.value());
        drawRulesVisuals();
    });
    updateRulesFromNumber("30"); // initialize RULES to rule 30

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
    
    // simulate a click on the start (redraw) button after 1 second
    setTimeout(() => {
        document.getElementById('startButton').click();
    }, 1000);

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
        drawRulesVisuals();
        running = true;
        loop();
    });
    // change the start button text to "Redraw"
    document.getElementById('startButton').innerText = "Redraw";

    document.getElementById('resetButton').addEventListener('click', () => {
        grid = create2DArray(cols, rows); // resets grid to 0 (white)
        // new: reset top row with middle cell active
        grid[floor(cols / 2)][0] = 1;
        background(51); // new: clear canvas
        drawRow(0);     // new: draw initial row
        currentRow = 0; // reset generation row index
        running = false;
        drawRulesVisuals(); // redraw rule visuals after resetting
        // simulate a click on the "Redraw" button 1 second after resetting
        setTimeout(() => {
            document.getElementById('startButton').click();
        }, 1000);
        noLoop();
    });
    drawRulesVisuals();
}

// new function to update RULES array from a rule number input
function updateRulesFromNumber(num) {
    let ruleNum = parseInt(num);
    if (isNaN(ruleNum) || ruleNum < 0 || ruleNum > 255) return; // ignore invalid values
    // convert to 8-bit binary string (for patterns 111 to 000)
    let bin = ruleNum.toString(2).padStart(8, '0');
    // update each RULES result in order corresponding to patterns "111" ... "000"
    for (let i = 0; i < RULES.length; i++) {
        RULES[i].result = parseInt(bin[i]);
    }
}

// new: only generate and draw the next row, leaving previous rows unchanged
function draw() {
    if (running) {
        generate();
        drawRow(currentRow);
    }
    drawRulesVisuals();
    // Update row entropy display with label "H_r:" and units "bits"
    let ent = computeEntropy();
    entDiv.html("H_r: " + nf(ent, 1, 3) + " bits");
    // Update column entropy display with label "H_c:" and units "bits"
    let colEnt = computeColEntropy();
    colEntDiv.html("H_c: " + nf(colEnt, 1, 3) + " bits");
}

// new function: compute the Shannon entropy of the generated rows
function computeEntropy() {
    if (currentRow < 0) return 0;
    let counts = {};
    // sample all rows from 0 to currentRow inclusive
    for (let r = 0; r <= currentRow; r++) {
        let rowString = "";
        for (let c = 0; c < cols; c++) {
            rowString += grid[c][r];
        }
        counts[rowString] = (counts[rowString] || 0) + 1;
    }
    let total = currentRow + 1;
    let entropy = 0;
    for (let key in counts) {
        let p = counts[key] / total;
        entropy -= p * Math.log(p) / Math.log(2);
    }
    return entropy;
}

// new function: compute column entropy
function computeColEntropy() {
    let counts = {};
    // for each column, build a string from row 0 to currentRow
    for (let c = 0; c < cols; c++) {
        let colString = "";
        for (let r = 0; r <= currentRow; r++) {
            colString += grid[c][r];
        }
        counts[colString] = (counts[colString] || 0) + 1;
    }
    let total = cols; // total number of columns
    let entropy = 0;
    for (let key in counts) {
        let p = counts[key] / total;
        entropy -= p * Math.log(p) / Math.log(2);
    }
    return entropy;
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

// updated drawRulesVisuals: use a startY below the textbox and label (e.g. 130)
function drawRulesVisuals() {
    noStroke();
    fill(51);
    rect(0, 0, gridOffsetX, height);
    
    let ruleBoxSize = 15;
    let startX = 10;
    let startY = 130; // demo boxes start below the rule label and textbox
    let spacingY = ruleBoxSize * 2 + 10;
    
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

// Updated mousePressed function to use startY = 130 for rule demo boxes
function mousePressed() {
    if (millis() - lastToggleTime < 300) return; // debounce rapid taps
    lastToggleTime = millis();
  
    // if click is within left margin, check rule demo result boxes
    if (mouseX < gridOffsetX) {
        let ruleBoxSize = 15;
        let startX = 10;
        let startY = 130; // updated: match demo boxes startY in drawRulesVisuals()
        let spacingY = ruleBoxSize * 2 + 10;
        for (let i = 0; i < RULES.length; i++) {
            let boxX = startX + ((ruleBoxSize + 2) * 1);
            let boxY = startY + i * spacingY + ruleBoxSize + 2;
            if (mouseX >= boxX && mouseX <= boxX + ruleBoxSize &&
                mouseY >= boxY && mouseY <= boxY + ruleBoxSize) {
                RULES[i].result = RULES[i].result === 1 ? 0 : 1;
                let binaryString = RULES.map(rule => rule.result).join('');
                let newRuleNum = parseInt(binaryString, 2);
                ruleInput.value(newRuleNum);
                drawRulesVisuals();
                return;
            }
        }
        return;
    }
  
    // otherwise, adjust click for simulation grid (first row editing)
    let x = floor((mouseX - gridOffsetX) / cellSize);
    let y = floor(mouseY / cellSize);
    if (y === 0 && x >= 0 && x < cols) {
        grid[x][y] = grid[x][y] === 1 ? 0 : 1;
        drawRow(0); // redraw top row for toggle visibility
    }
}

// updated rules function to use dynamic RULES array:
function rules(left, me, right) {
    let s = '' + left + me + right;
    for (let i = 0; i < RULES.length; i++) {
        if (RULES[i].pattern === s) return RULES[i].result;
    }
    return 0;
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
