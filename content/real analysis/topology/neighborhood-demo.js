// Use p5.js instance mode to avoid conflicts with other demos
new p5(function(p) {
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

    p.setup = function() {
        // Check for container element
        const sketchHolder = document.getElementById('neighborhood-sketch-holder');
        if (!sketchHolder) {
            console.error('neighborhood-sketch-holder element not found');
            return;
        }
        
        canvas = p.createCanvas(600, 600);
        canvas.parent('neighborhood-sketch-holder');
        
        // Set up colors
        updateColors();
        
        // Add event listeners for buttons
        document.getElementById('reset-btn').addEventListener('click', resetDemo);
        document.getElementById('zoom-toggle').addEventListener('click', toggleZoom);
        
        p.smooth();
    };

    function updateColors() {
        // Check if dark mode
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (isDark) {
            bgColor = p.color(30, 30, 30);
            axisColor = p.color(200);
            gridColor = p.color(60);
            outerColor = p.color(100, 150, 255, 100);
            innerColor = p.color(255, 150, 100, 120);
            textColor = p.color(220);
        } else {
            bgColor = p.color(255);
            axisColor = p.color(50);
            gridColor = p.color(200);
            outerColor = p.color(50, 100, 200, 80);
            innerColor = p.color(200, 100, 50, 100);
            textColor = p.color(50);
        }
    }

    p.draw = function() {
        p.background(bgColor);
        
        p.push();
        p.translate(p.width/2, p.height/2);
        
        if (isZoomed && zoomCenter) {
            p.scale(zoomLevel);
            p.translate(-zoomCenter.x, -zoomCenter.y);
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
            let radius = p.dist(dragStart.x, dragStart.y, currentDrag.x, currentDrag.y);
            p.fill(outerColor);
            p.noStroke();
            p.circle(dragStart.x, dragStart.y, radius * 2);
            
            // Draw center point
            p.fill(axisColor);
            p.circle(dragStart.x, dragStart.y, 8 / zoomLevel);
        }
        
        p.pop();
        
        // Update instruction text
        updateInstruction();
    };

    function drawGrid() {
        p.stroke(gridColor);
        p.strokeWeight(0.5 / zoomLevel);
        
        let gridSize = 50;
        
        // Calculate the visible world bounds
        let viewBounds = {
            left: -p.width / zoomLevel,
            right: p.width / zoomLevel,
            top: -p.height / zoomLevel,
            bottom: p.height / zoomLevel
        };
        
        if (isZoomed && zoomCenter) {
            viewBounds.left += zoomCenter.x;
            viewBounds.right += zoomCenter.x;
            viewBounds.top += zoomCenter.y;
            viewBounds.bottom += zoomCenter.y;
        }
        
        // Extend grid lines well beyond the visible area
        let gridExtent = p.max(p.width, p.height) * 2;
        
        // Draw vertical grid lines
        let startX = Math.floor(viewBounds.left / gridSize) * gridSize;
        let endX = Math.ceil(viewBounds.right / gridSize) * gridSize;
        for (let x = startX - gridExtent; x <= endX + gridExtent; x += gridSize) {
            p.line(x, viewBounds.top - gridExtent, x, viewBounds.bottom + gridExtent);
        }
        
        // Draw horizontal grid lines
        let startY = Math.floor(viewBounds.top / gridSize) * gridSize;
        let endY = Math.ceil(viewBounds.bottom / gridSize) * gridSize;
        for (let y = startY - gridExtent; y <= endY + gridExtent; y += gridSize) {
            p.line(viewBounds.left - gridExtent, y, viewBounds.right + gridExtent, y);
        }
    }

    function drawAxes() {
        p.stroke(axisColor);
        p.strokeWeight(2 / zoomLevel);
        
        // Calculate the visible world bounds
        let viewBounds = {
            left: -p.width / zoomLevel,
            right: p.width / zoomLevel,
            top: -p.height / zoomLevel,
            bottom: p.height / zoomLevel
        };
        
        if (isZoomed && zoomCenter) {
            viewBounds.left += zoomCenter.x;
            viewBounds.right += zoomCenter.x;
            viewBounds.top += zoomCenter.y;
            viewBounds.bottom += zoomCenter.y;
        }
        
        // Extend axes well beyond the visible area
        let axisExtent = p.max(p.width, p.height) * 2;
        
        // X-axis
        p.line(viewBounds.left - axisExtent, 0, viewBounds.right + axisExtent, 0);
        // Y-axis  
        p.line(0, viewBounds.top - axisExtent, 0, viewBounds.bottom + axisExtent);
        
        // Labels (only show when near default view)
        if (zoomLevel < 2) {
            p.fill(textColor);
            p.noStroke();
            p.textAlign(p.RIGHT, p.TOP);
            p.text('5', p.width/2 - 10, 10);
            p.text('-5', -p.width/2 + 30, 10);
            p.textAlign(p.LEFT, p.BOTTOM);
            p.text('5', 10, -p.height/2 + 20);
            p.text('-5', 10, p.height/2 - 10);
        }
    }

    function drawNeighborhood(n) {
        // Draw outer neighborhood
        p.fill(outerColor);
        p.noStroke();
        p.circle(n.center.x, n.center.y, n.radius * 2);
        
        // Draw dashed border for outer neighborhood
        p.noFill();
        p.stroke(axisColor);
        p.strokeWeight(2 / zoomLevel); // Scale stroke weight with zoom
        dashedCircle(n.center.x, n.center.y, n.radius * 2);
        
        // Draw center point
        p.fill(axisColor);
        p.noStroke();
        p.circle(n.center.x, n.center.y, 8 / zoomLevel);
        
        // Draw inner neighborhoods for each inner point
        for (let innerPoint of n.innerPoints) {
            p.fill(innerColor);
            p.noStroke();
            
            // Calculate radius to edge of outer neighborhood
            let distToCenter = p.dist(n.center.x, n.center.y, innerPoint.x, innerPoint.y);
            let innerRadius = n.radius - distToCenter; // Goes right to the edge
            
            if (innerRadius > 0) {
                p.circle(innerPoint.x, innerPoint.y, innerRadius * 2);
                
                // Draw dashed border for inner neighborhood
                p.noFill();
                p.stroke(axisColor);
                p.strokeWeight(1.5 / zoomLevel); // Scale stroke weight with zoom
                dashedCircle(innerPoint.x, innerPoint.y, innerRadius * 2);
                
                // Draw inner point
                p.fill(axisColor);
                p.noStroke();
                p.circle(innerPoint.x, innerPoint.y, 6 / zoomLevel);
            }
        }
    }

    function dashedLine(x1, y1, x2, y2) {
        let d = p.dist(x1, y1, x2, y2);
        let dashLength = 5;
        let steps = d / dashLength;
        
        for (let i = 0; i < steps; i += 2) {
            let t1 = i / steps;
            let t2 = p.min((i + 1) / steps, 1);
            p.line(p.lerp(x1, x2, t1), p.lerp(y1, y2, t1), p.lerp(x1, x2, t2), p.lerp(y1, y2, t2));
        }
    }

    function dashedCircle(x, y, diameter) {
        let radius = diameter / 2;
        
        // Calculate visual radius (how big it appears on screen)
        let visualRadius = radius * zoomLevel;
        let visualCircumference = p.TWO_PI * visualRadius;
        
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
            
            let x1 = x + radius * p.cos(startAngle);
            let y1 = y + radius * p.sin(startAngle);
            let x2 = x + radius * p.cos(endAngle);
            let y2 = y + radius * p.sin(endAngle);
            
            p.line(x1, y1, x2, y2);
        }
    }

    p.mousePressed = function() {
        if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return;
        
        let worldPos = screenToWorld(p.mouseX, p.mouseY);
        
        if (state === 'waiting') {
            dragStart = worldPos;
            state = 'dragging_outer';
        } else if (state === 'waiting_inner' || state === 'complete') {
            // Check if click is inside the original neighborhood
            let outerN = neighborhoods[neighborhoods.length - 1];
            let d = p.dist(worldPos.x, worldPos.y, outerN.center.x, outerN.center.y);
            
            if (d < outerN.radius) {
                // Store a copy of the position to avoid reference issues
                outerN.innerPoints.push({x: worldPos.x, y: worldPos.y});
                state = 'complete';
            }
        }
    };

    p.mouseDragged = function() {
        if (state === 'dragging_outer' && dragStart) {
            currentDrag = screenToWorld(p.mouseX, p.mouseY);
        }
    };

    p.mouseReleased = function() {
        if (state === 'dragging_outer' && dragStart && currentDrag) {
            let radius = p.dist(dragStart.x, dragStart.y, currentDrag.x, currentDrag.y);
            
            if (radius > 10) { // Minimum radius
                neighborhoods.push({
                    center: {x: dragStart.x, y: dragStart.y}, // Store a copy
                    radius: radius,
                    innerPoints: []
                });
                state = 'waiting_inner';
            } else {
                state = 'waiting';
            }
            
            dragStart = null;
            currentDrag = null;
        }
    };

    function screenToWorld(x, y) {
        let wx = x - p.width/2;
        let wy = y - p.height/2;
        
        if (isZoomed && zoomCenter) {
            wx = wx / zoomLevel + zoomCenter.x;
            wy = wy / zoomLevel + zoomCenter.y;
        }
        
        return p.createVector(wx, wy);
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
        if (neighborhoods.length > 0 && neighborhoods[neighborhoods.length - 1].innerPoints.length > 0) {
            if (Math.abs(zoomLevel - 1) < 0.1) {
                // Only use button zoom if we're at default zoom
                let lastInnerPoint = neighborhoods[neighborhoods.length - 1].innerPoints[neighborhoods[neighborhoods.length - 1].innerPoints.length - 1];
                zoomCenter = p.createVector(lastInnerPoint.x, lastInnerPoint.y); // Create a copy
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
                instruction.textContent = 'Click more points inside the neighborhood to show they are all interior points. Every point in a neighborhood is interior, so neighborhoods are open!';
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
    p.mouseWheel = function(event) {
        // Only handle scroll if mouse is over the canvas
        if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
            return; // Let the page scroll normally
        }
        
        // Prevent default scrolling
        event.preventDefault();
        
        // Get mouse position in world coordinates before zoom
        let mouseWorldBefore = screenToWorld(p.mouseX, p.mouseY);
        
        // Calculate zoom change (positive delta = zoom out, negative = zoom in)
        let zoomDelta = event.delta * 0.01; // Increased sensitivity
        let newZoom = p.constrain(zoomLevel * (1 + zoomDelta), minZoom, maxZoom);
        
        if (newZoom !== zoomLevel) {
            let oldZoom = zoomLevel;
            zoomLevel = newZoom;
            
            // Adjust zoom center to keep mouse position fixed
            if (zoomLevel !== 1) {
                if (!isZoomed) {
                    // First time zooming - use (0,0) as initial center
                    zoomCenter = p.createVector(0, 0);
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
    };
});