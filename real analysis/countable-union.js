// ===== Configuration and Global Variables =====
let gridSize = 10; // Grid dimensions (10x10)
let cellSize;
let margin = 60;
let traversalPath = [];
let currentIndex = 0;
let animationProgress = 0;
let animationSpeed = 0.02;
let linePoints = [];

// ===== p5.js Setup and Main Loop =====
function setup() {
    // Make canvas use most of available space, with max of 1400px for very large screens
    let canvasSize = min(windowWidth - 40, windowHeight - 200, 1400);
    let canvas = createCanvas(canvasSize, canvasSize);
    canvas.parent('sketch-holder');
    
    cellSize = (canvasSize - 2 * margin) / gridSize;
    
    // Generate diagonal traversal path
    generateTraversalPath();
    
    textAlign(CENTER, CENTER);
    strokeWeight(2);
}

function draw() {
    background(getBackgroundColor());
    
    // Draw grid
    drawGrid();
    
    // Draw axis labels and indicators
    drawLabels();
    
    // Animate traversal line
    drawTraversalLine();
    
    // Update animation
    updateAnimation();
}

function windowResized() {
    let canvasSize = min(windowWidth - 40, windowHeight - 200, 1400);
    resizeCanvas(canvasSize, canvasSize);
    cellSize = (canvasSize - 2 * margin) / gridSize;
}

// ===== Path Generation =====
function generateTraversalPath() {
    traversalPath = [];
    
    // Generate diagonal traversal order
    // Stop after completing the diagonal that starts at E_10,1
    // This happens when sum = 11 (row 10 + col 1 = 11)
    for (let sum = 2; sum <= 11; sum++) {
        // Each diagonal has elements where row + col = sum
        // We traverse from bottom to top (increasing column, decreasing row)
        let diagonalStart = true;
        
        for (let col = 1; col < sum; col++) {
            let row = sum - col;
            
            if (row >= 1 && row <= gridSize && col >= 1 && col <= gridSize) {
                traversalPath.push({
                    n: row - 1, // Convert to 0-indexed (row)
                    m: col - 1, // Convert to 0-indexed (col)
                    isDiagonalStart: diagonalStart
                });
                diagonalStart = false;
            }
        }
    }
}

// ===== Drawing Functions =====
function drawGrid() {
    for (let n = 0; n < gridSize; n++) {
        for (let m = 0; m < gridSize; m++) {
            let x = margin + m * cellSize + cellSize / 2;
            let y = margin + n * cellSize + cellSize / 2;
            
            // Draw cell
            noFill();
            stroke(getStrokeColor());
            strokeWeight(1);
            rect(x - cellSize/2, y - cellSize/2, cellSize, cellSize);
            
            // Draw label with subscripts
            fill(getTextColor());
            noStroke();
            textSize(cellSize * 0.3);
            drawSubscriptText('E', n + 1, m + 1, x, y);
        }
    }
    
    // Draw ellipsis to indicate infinite continuation
    textSize(20);
    fill(getTextColor());
    noStroke();
    
    // Right edge ellipsis
    text('...', margin + gridSize * cellSize + cellSize/2, height / 2);
    
    // Bottom edge ellipsis
    text('...', width / 2, margin + gridSize * cellSize + cellSize/2);
    
    // Bottom-right corner ellipsis
    text('...', margin + gridSize * cellSize + cellSize/2, margin + gridSize * cellSize + cellSize/2);
}

function drawLabels() {
    textSize(16);
    fill(getTextColor());
    noStroke();
    
    // Set label (vertical)
    push();
    translate(margin / 2, height / 2);
    rotate(-PI / 2);
    text('Set number (n)', 0, 0);
    pop();
    
    // Element label (horizontal)
    text('Element index (m)', width / 2, height - margin / 2);
    
    // Add infinity symbols
    textSize(14);
    text('→ ∞', margin + gridSize * cellSize + cellSize, height - margin / 2);
    text('↓ ∞', margin / 2, margin + gridSize * cellSize + cellSize);
}

function drawSubscriptText(base, sub1, sub2, x, y) {
    let baseSize = cellSize * 0.5;
    let subSize = baseSize * 0.5;
    
    textSize(baseSize);
    
    // Draw base
    text(base, x - cellSize * 0.2, y - cellSize * 0.1);
    
    // Draw subscripts
    textSize(subSize);
    text(sub1 + ',' + sub2, x + cellSize * 0.12, y + cellSize * 0.12);
}

function drawTraversalLine() {
    noFill();
    
    // Use cyan color for the line
    if (isDarkMode()) {
        stroke(88, 166, 255); // #58a6ff
    } else {
        stroke(3, 102, 214); // #0366d6
    }
    strokeWeight(3);
    
    // Draw completed path segments
    for (let i = 1; i < linePoints.length; i++) {
        let prev = linePoints[i - 1];
        let curr = linePoints[i];
        
        // Check if this is a diagonal transition
        if (curr.isDiagonalStart && i > 0) {
            // Draw dashed line for diagonal transitions
            drawingContext.setLineDash([5, 5]);
        } else {
            // Solid line within diagonals
            drawingContext.setLineDash([]);
        }
        
        line(prev.x, prev.y, curr.x, curr.y);
    }
    
    // Reset to solid line
    drawingContext.setLineDash([]);
    
    // Draw animated segment
    if (currentIndex > 0 && currentIndex < traversalPath.length) {
        let prev = traversalPath[currentIndex - 1];
        let curr = traversalPath[currentIndex];
        
        let x1 = margin + prev.m * cellSize + cellSize / 2;
        let y1 = margin + prev.n * cellSize + cellSize / 2;
        let x2 = margin + curr.m * cellSize + cellSize / 2;
        let y2 = margin + curr.n * cellSize + cellSize / 2;
        
        // Use dashed line if transitioning to new diagonal
        if (curr.isDiagonalStart) {
            drawingContext.setLineDash([5, 5]);
        } else {
            drawingContext.setLineDash([]);
        }
        
        let x = lerp(x1, x2, animationProgress);
        let y = lerp(y1, y2, animationProgress);
        
        if (linePoints.length > 0) {
            line(linePoints[linePoints.length - 1].x, linePoints[linePoints.length - 1].y, x, y);
        }
    }
    
    // Reset dash
    drawingContext.setLineDash([]);
    
    // Highlight current element
    if (currentIndex < traversalPath.length) {
        let curr = traversalPath[currentIndex];
        let x = margin + curr.m * cellSize + cellSize / 2;
        let y = margin + curr.n * cellSize + cellSize / 2;
        
        // Use cyan color for highlight
        if (isDarkMode()) {
            fill(88, 166, 255); // #58a6ff
        } else {
            fill(3, 102, 214); // #0366d6
        }
        noStroke();
        circle(x, y, cellSize * 0.3);
        
        // Show current element number
        fill(getBackgroundColor());
        textSize(cellSize * 0.3);
        text(currentIndex + 1, x, y);
    }
}

// ===== Animation Update =====
function updateAnimation() {
    animationProgress += animationSpeed;
    if (animationProgress >= 1) {
        animationProgress = 0;
        currentIndex = (currentIndex + 1) % traversalPath.length;
        
        // Add current point to line history
        if (currentIndex > 0) {
            let curr = traversalPath[currentIndex - 1];
            let x = margin + curr.m * cellSize + cellSize / 2;
            let y = margin + curr.n * cellSize + cellSize / 2;
            linePoints.push({
                x: x, 
                y: y,
                isDiagonalStart: curr.isDiagonalStart
            });
            
            // Keep only recent points for performance
            if (linePoints.length > traversalPath.length) {
                linePoints.shift();
            }
        }
        
        // Reset when complete
        if (currentIndex === 0) {
            linePoints = [];
        }
    }
}