let canvas;
let neighborhoods = [];
let zoomLevel = 1;
let zoomCenter = null;
let isZoomed = false;
let dragStart = null;
let currentDrag = null;
let state = 'waiting'; // 'waiting', 'dragging_outer', 'waiting_inner', 'complete'
let minZoom = 0.5;
let maxZoom = 100;

// Colors
let bgColor, axisColor, gridColor, outerColor, innerColor, textColor;

function setup() {
    canvas = createCanvas(600, 600);
    canvas.parent('sketch-holder');
    
    // Set up colors
    updateColors();
    
    // Add event listeners for buttons
    document.getElementById('reset-btn').addEventListener('click', resetDemo);
    document.getElementById('zoom-toggle').addEventListener('click', toggleZoom);
    
    smooth();
}

function updateColors() {
    // Check if dark mode
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (isDark) {
        bgColor = color(30, 30, 30);
        axisColor = color(200);
        gridColor = color(60);
        outerColor = color(100, 150, 255, 100);
        innerColor = color(255, 150, 100, 120);
        textColor = color(220);
    } else {
        bgColor = color(255);
        axisColor = color(50);
        gridColor = color(200);
        outerColor = color(50, 100, 200, 80);
        innerColor = color(200, 100, 50, 100);
        textColor = color(50);
    }
}

function draw() {
    background(bgColor);
    
    push();
    translate(width/2, height/2);
    
    if (isZoomed && zoomCenter) {
        scale(zoomLevel);
        translate(-zoomCenter.x, -zoomCenter.y);
    }
    
    // Draw grid
    drawGrid();
    
    // Draw axes
    drawAxes();
    
    // Draw existing neighborhoods
    for (let n of neighborhoods) {
        drawNeighborhood(n);
    }
    
    // Draw current drag
    if (state === 'dragging_outer' && dragStart && currentDrag) {
        let radius = dist(dragStart.x, dragStart.y, currentDrag.x, currentDrag.y);
        fill(outerColor);
        noStroke();
        circle(dragStart.x, dragStart.y, radius * 2);
        
        // Draw center point
        fill(axisColor);
        circle(dragStart.x, dragStart.y, 8 / zoomLevel);
    }
    
    pop();
    
    // Update instruction text
    updateInstruction();
    
    // Apply text style for p5.js text
    applyTextStyle();
}

function drawGrid() {
    stroke(gridColor);
    strokeWeight(0.5 / zoomLevel);
    
    let gridSize = 50;
    
    // Calculate the visible world bounds
    let viewBounds = {
        left: -width / zoomLevel,
        right: width / zoomLevel,
        top: -height / zoomLevel,
        bottom: height / zoomLevel
    };
    
    if (isZoomed && zoomCenter) {
        viewBounds.left += zoomCenter.x;
        viewBounds.right += zoomCenter.x;
        viewBounds.top += zoomCenter.y;
        viewBounds.bottom += zoomCenter.y;
    }
    
    // Extend grid lines well beyond the visible area
    let gridExtent = max(width, height) * 2;
    
    // Draw vertical grid lines
    let startX = Math.floor(viewBounds.left / gridSize) * gridSize;
    let endX = Math.ceil(viewBounds.right / gridSize) * gridSize;
    for (let x = startX - gridExtent; x <= endX + gridExtent; x += gridSize) {
        line(x, viewBounds.top - gridExtent, x, viewBounds.bottom + gridExtent);
    }
    
    // Draw horizontal grid lines
    let startY = Math.floor(viewBounds.top / gridSize) * gridSize;
    let endY = Math.ceil(viewBounds.bottom / gridSize) * gridSize;
    for (let y = startY - gridExtent; y <= endY + gridExtent; y += gridSize) {
        line(viewBounds.left - gridExtent, y, viewBounds.right + gridExtent, y);
    }
}

function drawAxes() {
    stroke(axisColor);
    strokeWeight(2 / zoomLevel);
    
    // Calculate the visible world bounds
    let viewBounds = {
        left: -width / zoomLevel,
        right: width / zoomLevel,
        top: -height / zoomLevel,
        bottom: height / zoomLevel
    };
    
    if (isZoomed && zoomCenter) {
        viewBounds.left += zoomCenter.x;
        viewBounds.right += zoomCenter.x;
        viewBounds.top += zoomCenter.y;
        viewBounds.bottom += zoomCenter.y;
    }
    
    // Extend axes well beyond the visible area
    let axisExtent = max(width, height) * 2;
    
    // X-axis
    line(viewBounds.left - axisExtent, 0, viewBounds.right + axisExtent, 0);
    // Y-axis  
    line(0, viewBounds.top - axisExtent, 0, viewBounds.bottom + axisExtent);
    
    // Labels (only show when near default view)
    if (zoomLevel < 2) {
        fill(textColor);
        noStroke();
        textAlign(RIGHT, TOP);
        text('5', width/2 - 10, 10);
        text('-5', -width/2 + 30, 10);
        textAlign(LEFT, BOTTOM);
        text('5', 10, -height/2 + 20);
        text('-5', 10, height/2 - 10);
    }
}

function drawNeighborhood(n) {
    // Draw outer neighborhood
    fill(outerColor);
    noStroke();
    circle(n.center.x, n.center.y, n.radius * 2);
    
    // Draw dashed border for outer neighborhood
    noFill();
    stroke(axisColor);
    strokeWeight(2 / zoomLevel); // Scale stroke weight with zoom
    dashedCircle(n.center.x, n.center.y, n.radius * 2);
    
    // Draw center point
    fill(axisColor);
    noStroke();
    circle(n.center.x, n.center.y, 8 / zoomLevel);
    
    // Draw inner neighborhood if it exists
    if (n.innerPoint) {
        fill(innerColor);
        noStroke();
        
        // Calculate radius to edge of outer neighborhood
        let distToCenter = dist(n.center.x, n.center.y, n.innerPoint.x, n.innerPoint.y);
        let innerRadius = n.radius - distToCenter; // Goes right to the edge
        
        if (innerRadius > 0) {
            circle(n.innerPoint.x, n.innerPoint.y, innerRadius * 2);
            
            // Draw dashed border for inner neighborhood
            noFill();
            stroke(axisColor);
            strokeWeight(1.5 / zoomLevel); // Scale stroke weight with zoom
            dashedCircle(n.innerPoint.x, n.innerPoint.y, innerRadius * 2);
            
            // Draw inner point
            fill(axisColor);
            noStroke();
            circle(n.innerPoint.x, n.innerPoint.y, 6 / zoomLevel);
        }
    }
}

function dashedLine(x1, y1, x2, y2) {
    let d = dist(x1, y1, x2, y2);
    let dashLength = 5;
    let steps = d / dashLength;
    
    for (let i = 0; i < steps; i += 2) {
        let t1 = i / steps;
        let t2 = min((i + 1) / steps, 1);
        line(lerp(x1, x2, t1), lerp(y1, y2, t1), lerp(x1, x2, t2), lerp(y1, y2, t2));
    }
}

function dashedCircle(x, y, diameter) {
    let radius = diameter / 2;
    
    // Calculate visual radius (how big it appears on screen)
    let visualRadius = radius * zoomLevel;
    let visualCircumference = TWO_PI * visualRadius;
    
    // Fixed visual dash and gap size in pixels
    let visualDashLength = 8;
    let visualGapLength = 6;
    let visualTotalLength = visualDashLength + visualGapLength;
    
    // Calculate how many dashes we need
    let numDashes = Math.floor(visualCircumference / visualTotalLength);
    
    // Calculate actual dash length in world coordinates
    let dashAngle = (visualDashLength / visualRadius);
    let gapAngle = (visualGapLength / visualRadius);
    let totalAngle = dashAngle + gapAngle;
    
    for (let i = 0; i < numDashes; i++) {
        let startAngle = i * totalAngle;
        let endAngle = startAngle + dashAngle;
        
        let x1 = x + radius * cos(startAngle);
        let y1 = y + radius * sin(startAngle);
        let x2 = x + radius * cos(endAngle);
        let y2 = y + radius * sin(endAngle);
        
        line(x1, y1, x2, y2);
    }
}

function mousePressed() {
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
    
    let worldPos = screenToWorld(mouseX, mouseY);
    
    if (state === 'waiting') {
        dragStart = worldPos;
        state = 'dragging_outer';
    } else if (state === 'waiting_inner') {
        // Check if click is inside the last neighborhood
        let lastN = neighborhoods[neighborhoods.length - 1];
        let d = dist(worldPos.x, worldPos.y, lastN.center.x, lastN.center.y);
        
        if (d < lastN.radius) {
            lastN.innerPoint = worldPos;
            state = 'complete';
        }
    }
}

function mouseDragged() {
    if (state === 'dragging_outer' && dragStart) {
        currentDrag = screenToWorld(mouseX, mouseY);
    }
}

function mouseReleased() {
    if (state === 'dragging_outer' && dragStart && currentDrag) {
        let radius = dist(dragStart.x, dragStart.y, currentDrag.x, currentDrag.y);
        
        if (radius > 10) { // Minimum radius
            neighborhoods.push({
                center: dragStart,
                radius: radius,
                innerPoint: null
            });
            state = 'waiting_inner';
        } else {
            state = 'waiting';
        }
        
        dragStart = null;
        currentDrag = null;
    }
}

function screenToWorld(x, y) {
    let wx = x - width/2;
    let wy = y - height/2;
    
    if (isZoomed && zoomCenter) {
        wx = wx / zoomLevel + zoomCenter.x;
        wy = wy / zoomLevel + zoomCenter.y;
    }
    
    return createVector(wx, wy);
}

function resetDemo() {
    neighborhoods = [];
    state = 'waiting';
    isZoomed = false;
    zoomLevel = 1;
    zoomCenter = null;
    dragStart = null;
    currentDrag = null;
}

function toggleZoom() {
    if (neighborhoods.length > 0 && neighborhoods[neighborhoods.length - 1].innerPoint) {
        if (Math.abs(zoomLevel - 1) < 0.1) {
            // Only use button zoom if we're at default zoom
            zoomCenter = neighborhoods[neighborhoods.length - 1].innerPoint;
            zoomLevel = 3;
            isZoomed = true;
        } else {
            // Reset zoom completely
            zoomLevel = 1;
            isZoomed = false;
            zoomCenter = null;
        }
    }
}

function updateInstruction() {
    let instruction = document.getElementById('instruction');
    
    switch(state) {
        case 'waiting':
            instruction.textContent = 'Click and drag to create a neighborhood.';
            break;
        case 'dragging_outer':
            instruction.textContent = 'Release to set the neighborhood radius.';
            break;
        case 'waiting_inner':
            instruction.textContent = 'Click inside the neighborhood to show it contains interior points.';
            break;
        case 'complete':
            instruction.textContent = 'The inner neighborhood shows this point is interior. Every point in a neighborhood is interior, so neighborhoods are open!';
            break;
    }
}

// Listen for color scheme changes
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        updateColors();
    });
}

// Handle wheel events for zooming
function mouseWheel(event) {
    // Prevent default scrolling
    event.preventDefault();
    
    // Get mouse position in world coordinates before zoom
    let mouseWorldBefore = screenToWorld(mouseX, mouseY);
    
    // Calculate zoom change (positive delta = zoom out, negative = zoom in)
    let zoomDelta = event.delta * 0.01; // Increased sensitivity
    let newZoom = constrain(zoomLevel * (1 + zoomDelta), minZoom, maxZoom);
    
    if (newZoom !== zoomLevel) {
        let oldZoom = zoomLevel;
        zoomLevel = newZoom;
        
        // Adjust zoom center to keep mouse position fixed
        if (zoomLevel !== 1) {
            if (!isZoomed) {
                // First time zooming - use (0,0) as initial center
                zoomCenter = createVector(0, 0);
                isZoomed = true;
            }
            // Always adjust zoom center to keep point under mouse stationary
            let zoomRatio = zoomLevel / oldZoom;
            zoomCenter.x = mouseWorldBefore.x - (mouseWorldBefore.x - zoomCenter.x) / zoomRatio;
            zoomCenter.y = mouseWorldBefore.y - (mouseWorldBefore.y - zoomCenter.y) / zoomRatio;
        } else {
            // Reset zoom
            isZoomed = false;
            zoomCenter = null;
        }
    }
    
    return false; // Prevent page scroll
}