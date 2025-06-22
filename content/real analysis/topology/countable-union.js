// Use p5.js instance mode to avoid conflicts with other demos
new p5(function(p) {
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
    p.setup = function() {
        // Check for container element
        const sketchHolder = document.getElementById('union-sketch-holder');
        if (!sketchHolder) {
            console.error('union-sketch-holder element not found');
            return;
        }
        
        // Responsive sizing based on container
        let canvasWidth, canvasHeight;
        
        if (p.windowWidth < 768) {
            // Mobile: use full window width minus margin with square aspect
            canvasWidth = p.windowWidth - 40;
            canvasHeight = canvasWidth;
        } else {
            // Desktop: use container-based sizing
            const container = sketchHolder.parentElement || demoContainer;
            canvasWidth = container ? p.min(container.offsetWidth - 40, 600) : 600;
            canvasHeight = canvasWidth;
        }
        
        let canvas = p.createCanvas(canvasWidth, canvasHeight);
        canvas.parent('union-sketch-holder');
        
        cellSize = (canvasWidth - 2 * margin) / gridSize;
        
        // Generate diagonal traversal path
        generateTraversalPath();
        
        p.textAlign(p.CENTER, p.CENTER);
        p.strokeWeight(2);
    };

    p.draw = function() {
        p.background(getBackgroundColor());
        
        // Draw grid
        drawGrid();
        
        // Draw axis labels and indicators
        drawLabels();
        
        // Animate traversal line
        drawTraversalLine();
        
        // Update animation
        updateAnimation();
    };

    p.windowResized = function() {
        // Responsive sizing
        let canvasWidth, canvasHeight;
        
        if (p.windowWidth < 768) {
            canvasWidth = p.windowWidth - 40;
            canvasHeight = canvasWidth;
        } else {
            const sketchHolder = document.getElementById('union-sketch-holder');
            const container = sketchHolder ? sketchHolder.parentElement : demoContainer;
            canvasWidth = container ? p.min(container.offsetWidth - 40, 600) : 600;
            canvasHeight = canvasWidth;
        }
        
        p.resizeCanvas(canvasWidth, canvasHeight);
        cellSize = (canvasWidth - 2 * margin) / gridSize;
    };

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
                p.noFill();
                p.stroke(getStrokeColor());
                p.strokeWeight(1);
                p.rect(x - cellSize/2, y - cellSize/2, cellSize, cellSize);
                
                // Draw label with subscripts
                p.fill(getTextColor());
                p.noStroke();
                p.textSize(cellSize * 0.3);
                drawSubscriptText('E', n + 1, m + 1, x, y);
            }
        }
        
        // Draw ellipsis to indicate infinite continuation
        p.textSize(20);
        p.fill(getTextColor());
        p.noStroke();
        
        // Right edge ellipsis
        p.text('...', margin + gridSize * cellSize + cellSize/2, p.height / 2);
        
        // Bottom edge ellipsis
        p.text('...', p.width / 2, margin + gridSize * cellSize + cellSize/2);
        
        // Bottom-right corner ellipsis
        p.text('...', margin + gridSize * cellSize + cellSize/2, margin + gridSize * cellSize + cellSize/2);
    }

    function drawLabels() {
        p.textSize(16);
        p.fill(getTextColor());
        p.noStroke();
        
        // Set label (vertical)
        p.push();
        p.translate(margin / 2, p.height / 2);
        p.rotate(-p.PI / 2);
        p.text('Set number (n)', 0, 0);
        p.pop();
        
        // Element label (horizontal)
        p.text('Element index (m)', p.width / 2, p.height - margin / 2);
        
        // Add infinity symbols
        p.textSize(14);
        p.text('→ ∞', margin + gridSize * cellSize + cellSize, p.height - margin / 2);
        p.text('↓ ∞', margin / 2, margin + gridSize * cellSize + cellSize);
    }

    function drawSubscriptText(base, sub1, sub2, x, y) {
        let baseSize = cellSize * 0.5;
        let subSize = baseSize * 0.5;
        
        p.textSize(baseSize);
        
        // Draw base
        p.text(base, x - cellSize * 0.2, y - cellSize * 0.1);
        
        // Draw subscripts
        p.textSize(subSize);
        p.text(sub1 + ',' + sub2, x + cellSize * 0.12, y + cellSize * 0.12);
    }

    function drawTraversalLine() {
        p.noFill();
        
        // Use cyan color for the line
        if (isDarkMode()) {
            p.stroke(88, 166, 255); // #58a6ff
        } else {
            p.stroke(3, 102, 214); // #0366d6
        }
        p.strokeWeight(3);
        
        // Draw completed path segments
        for (let i = 1; i < linePoints.length; i++) {
            let prev = linePoints[i - 1];
            let curr = linePoints[i];
            
            // Check if this is a diagonal transition
            if (curr.isDiagonalStart && i > 0) {
                // Draw dashed line for diagonal transitions
                p.drawingContext.setLineDash([5, 5]);
            } else {
                // Solid line within diagonals
                p.drawingContext.setLineDash([]);
            }
            
            p.line(prev.x, prev.y, curr.x, curr.y);
        }
        
        // Reset to solid line
        p.drawingContext.setLineDash([]);
        
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
                p.drawingContext.setLineDash([5, 5]);
            } else {
                p.drawingContext.setLineDash([]);
            }
            
            let x = p.lerp(x1, x2, animationProgress);
            let y = p.lerp(y1, y2, animationProgress);
            
            if (linePoints.length > 0) {
                p.line(linePoints[linePoints.length - 1].x, linePoints[linePoints.length - 1].y, x, y);
            }
        }
        
        // Reset dash
        p.drawingContext.setLineDash([]);
        
        // Highlight current element
        if (currentIndex < traversalPath.length) {
            let curr = traversalPath[currentIndex];
            let x = margin + curr.m * cellSize + cellSize / 2;
            let y = margin + curr.n * cellSize + cellSize / 2;
            
            // Use cyan color for highlight
            if (isDarkMode()) {
                p.fill(88, 166, 255); // #58a6ff
            } else {
                p.fill(3, 102, 214); // #0366d6
            }
            p.noStroke();
            p.circle(x, y, cellSize * 0.3);
            
            // Show current element number
            p.fill(getBackgroundColor());
            p.textSize(cellSize * 0.3);
            p.text(currentIndex + 1, x, y);
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

    // ===== Helper Functions =====
    function getBackgroundColor() {
        if (isDarkMode()) {
            return p.color(15, 15, 15);
        }
        return p.color(255, 255, 255);
    }

    function getTextColor() {
        if (isDarkMode()) {
            return p.color(230, 230, 230);
        }
        return p.color(0, 0, 0);
    }

    function getStrokeColor() {
        if (isDarkMode()) {
            return p.color(100, 100, 100);
        }
        return p.color(0, 0, 0);
    }

    function isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark' || 
               window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
});