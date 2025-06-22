// Use p5.js instance mode to avoid conflicts with other demos
new p5(function(p) {
    // ===== Configuration Constants =====
    const CONFIG = {
        // Animation timing
        STEP_DURATION: 2000,      // Time between columns appearing (ms)
        END_PAUSE: 2000,          // Pause at end before restarting (ms)
        
        // Layout  
        COLUMN_SPACING: 120,      // Horizontal spacing between columns (reduced from 200)
        START_X: 60,              // Starting x position for first column (reduced from 100)
        TOTAL_COLUMNS: 10,        // Total B_n sets to show (B_0 through B_9)
        
        // Column content
        MIN_VALUE: -3,            // Minimum integer value shown
        MAX_VALUE: 3,             // Maximum integer value shown
        VERTICAL_SPACING: 40,     // Spacing between elements vertically
        
        // Visual elements
        CIRCLE_RADIUS: 20,        // Radius for integer circles
        SMALL_CIRCLE_RADIUS: 12,  // Base radius for tuple circles
        
        // Ellipsis positioning
        ELLIPSIS_OFFSET: 70,      // Distance from column edge to ellipsis
        ARROW_OFFSET: 100,        // Distance from column edge to infinity arrow
        
        // Text sizes
        LABEL_SIZE: 28,           // Column label text size
        VALUE_SIZE: 18,           // Integer value text size
        ELLIPSIS_SIZE: 24,        // Ellipsis text size
        ARROW_SIZE: 20,           // Arrow text size
        EQUATION_SIZE: 26,        // Bottom equation text size
        
        // Arrow styling
        MIN_STROKE_WEIGHT: 0.5,   // Minimum arrow line thickness
        MIN_DASH_SIZE: 2,         // Minimum dash size for arrows
    };

    // ===== Global Variables =====
    let canvasWidth, canvasHeight, centerY;
    let animationStartTime;
    let maxVisibleColumns = 4; // Will be calculated based on available width

    // ===== p5.js Setup and Draw =====
    p.setup = function() {
        // Check for container element
        const sketchHolder = document.getElementById('tuples-sketch-holder');
        if (!sketchHolder) {
            console.error('tuples-sketch-holder element not found');
            return;
        }
        
        // Responsive sizing based on container
        if (p.windowWidth < 768) {
            // Mobile: use full window width minus margin
            canvasWidth = p.windowWidth - 40;
            canvasHeight = p.min(p.windowHeight - 200, 600);
        } else {
            // Desktop: use container-based sizing
            const container = sketchHolder.parentElement || demoContainer;
            canvasWidth = container ? p.min(container.offsetWidth - 40, 1200) : 800;
            canvasHeight = p.min(600, canvasWidth * 0.66);
        }
        
        let canvas = p.createCanvas(canvasWidth, canvasHeight);
        canvas.parent('tuples-sketch-holder');
        
        // Calculate how many columns can fit based on available width
        const availableWidth = canvasWidth - CONFIG.START_X * 2; // Account for margins
        maxVisibleColumns = Math.max(4, Math.floor(availableWidth / CONFIG.COLUMN_SPACING));
        
        centerY = canvasHeight / 2;
        p.textAlign(p.CENTER, p.CENTER);
        p.strokeWeight(2);
        
        animationStartTime = p.millis();
    };

    p.draw = function() {
        p.background(getBackgroundColor());
        
        // Calculate animation state
        const animationState = calculateAnimationState();
        const visibleColumns = getVisibleColumns(animationState.currentStep);
        
        // Draw all visible columns and connections
        drawColumns(visibleColumns);
        
        // Draw cardinality equation at bottom
        drawCardinalityEquation(visibleColumns);
    };

    p.windowResized = function() {
        // Responsive sizing
        const sketchHolder = document.getElementById('tuples-sketch-holder');
        
        if (p.windowWidth < 768) {
            canvasWidth = p.windowWidth - 40;
            canvasHeight = p.min(p.windowHeight - 200, 600);
        } else {
            const container = sketchHolder ? sketchHolder.parentElement : demoContainer;
            canvasWidth = container ? p.min(container.offsetWidth - 40, 1200) : 800;
            canvasHeight = p.min(600, canvasWidth * 0.66);
        }
        
        p.resizeCanvas(canvasWidth, canvasHeight);
        centerY = canvasHeight / 2;
        
        // Recalculate how many columns can fit based on new width
        const availableWidth = canvasWidth - CONFIG.START_X * 2; // Account for margins
        maxVisibleColumns = Math.max(4, Math.floor(availableWidth / CONFIG.COLUMN_SPACING));
    };

    // ===== Animation Logic =====
    function calculateAnimationState() {
        let elapsed = p.millis() - animationStartTime;
        const cycleTime = CONFIG.TOTAL_COLUMNS * CONFIG.STEP_DURATION + CONFIG.END_PAUSE;
        
        // Reset animation at end of cycle
        if (elapsed >= cycleTime) {
            animationStartTime = p.millis();
            elapsed = 0;
        }
        
        const currentStep = p.min(
            p.floor(elapsed / CONFIG.STEP_DURATION), 
            CONFIG.TOTAL_COLUMNS - 1
        );
        
        return { elapsed, currentStep, cycleTime };
    }

    function getVisibleColumns(currentStep) {
        const columns = [];
        
        if (currentStep < maxVisibleColumns) {
            // Initial phase: columns appear one by one
            for (let i = 0; i <= currentStep; i++) {
                columns.push({
                    index: i,
                    x: CONFIG.START_X + i * CONFIG.COLUMN_SPACING
                });
            }
        } else {
            // Shifting phase: show maxVisibleColumns, shifted appropriately
            const offset = currentStep - maxVisibleColumns + 1;
            for (let i = 0; i < maxVisibleColumns; i++) {
                const colIndex = i + offset;
                if (colIndex < CONFIG.TOTAL_COLUMNS) {
                    columns.push({
                        index: colIndex,
                        x: CONFIG.START_X + i * CONFIG.COLUMN_SPACING
                    });
                }
            }
        }
        
        return columns;
    }

    // ===== Main Drawing Functions =====
    function drawColumns(visibleColumns) {
        for (let i = 0; i < visibleColumns.length; i++) {
            const col = visibleColumns[i];
            
            // Draw the column
            if (col.index === 0) {
                drawSetA(col.x);
            } else {
                drawSetBn(col.x, col.index);
            }
            
            // Draw connections from previous column
            if (i > 0) {
                const prevCol = visibleColumns[i - 1];
                drawConnectionsAndLabel(prevCol, col);
            }
        }
    }

    function drawConnectionsAndLabel(fromCol, toCol) {
        // Draw arrows between columns
        drawArrowsBetweenColumns(fromCol.x, toCol.x, fromCol.index, toCol.index);
        
        // Draw dividing line and cardinality label
        const lineX = (fromCol.x + toCol.x) / 2;
        
        p.stroke(getStrokeColor());
        p.strokeWeight(2);
        p.line(lineX, 100, lineX, canvasHeight - 100);
        
        // Draw |A|^n label
        drawCardinalityLabel(lineX, toCol.index);
    }

    function drawCardinalityLabel(x, n) {
        p.fill(getBackgroundColor());
        p.noStroke();
        const labelWidth = n === 1 ? 40 : 50;
        p.rect(x - labelWidth/2, centerY - 20, labelWidth, 40);
        
        p.fill(getTextColor());
        p.textSize(n === 1 ? 24 : 22);
        
        let label = '|A|';
        if (n > 1) {
            label += getSuperscriptUnicode(n);
        }
        p.text(label, x, centerY);
    }

    function drawCardinalityEquation(visibleColumns) {
        if (visibleColumns.length === 0) return;
        
        const lastCol = visibleColumns[visibleColumns.length - 1];
        const n = lastCol.index;
        
        p.fill(getTextColor());
        p.noStroke();
        p.textSize(CONFIG.EQUATION_SIZE);
        p.textAlign(p.CENTER, p.CENTER);
        
        let equation = '';
        if (n === 0) {
            equation = '|A| = ℵ₀';
        } else {
            equation = '|A|';
            if (n > 1) {
                equation += getSuperscriptUnicode(n);
            }
            equation += ` = |B${getSubscriptUnicode(n)}| = ℵ₀`;
        }
        
        p.text(equation, canvasWidth / 2, canvasHeight - 40);
    }

    // ===== Column Drawing Functions =====
    function drawSetA(x) {
        drawColumnLabel(x, 'A');
        drawIntegerElements(x);
        drawEllipsisAndArrows(x);
    }

    function drawSetBn(x, n) {
        drawColumnLabel(x, `B${getSubscriptUnicode(n)}`);
        
        if (n === 1) {
            // B₁ is just like A - simple integers
            drawIntegerElements(x);
        } else {
            // B_n for n ≥ 2 - show n-tuples
            drawTupleElements(x, n);
        }
        
        drawEllipsisAndArrows(x);
    }

    function drawColumnLabel(x, label) {
        p.fill(getTextColor());
        p.noStroke();
        p.textSize(CONFIG.LABEL_SIZE);
        p.textStyle(p.BOLD);
        p.text(label, x, 60);
        p.textStyle(p.NORMAL);
    }

    function drawIntegerElements(x) {
        for (let i = CONFIG.MIN_VALUE; i <= CONFIG.MAX_VALUE; i++) {
            const y = centerY + i * CONFIG.VERTICAL_SPACING;
            
            // Draw circle
            p.stroke(getStrokeColor());
            p.strokeWeight(2);
            p.fill(getBackgroundColor());
            p.circle(x, y, CONFIG.CIRCLE_RADIUS * 2);
            
            // Draw number
            p.fill(getTextColor());
            p.noStroke();
            p.textSize(CONFIG.VALUE_SIZE);
            p.text(i, x, y);
        }
    }

    function drawTupleElements(x, n) {
        // Calculate display parameters based on n
        const nodeRadius = p.max(4, 20 - (n - 1) * 4);
        const textSz = p.max(4, 16 - (n - 1) * 2);
        const density = p.min(n, 4);
        const jitter = p.min(n - 1, 3);
        
        // Generate and display sample tuples
        const sampleElements = generateSampleTuples(n - 1, p.min(11, 5 + n * 2));
        
        for (let i = 0; i < sampleElements.length; i++) {
            const baseY = getTupleY(i, sampleElements.length);
            const subElements = getSubElements(density);
            
            for (let j = 0; j < subElements.length; j++) {
                const spacing = p.max(6, 20 - (n - 2) * 3);
                const y = baseY + (j - p.floor(density/2)) * spacing + (i % jitter) * 2;
                const xOffset = (j % 2) * p.min(15, 25 - n * 2) - p.min(7.5, 12.5 - n);
                
                if (isInDrawingBounds(y, xOffset)) {
                    drawTupleNode(x + xOffset, y, nodeRadius, textSz, 
                                sampleElements[i], subElements[j], n);
                }
            }
        }
        
        // Add density indicators for complex columns
        if (n >= 4) {
            drawDensityIndicators(x, n);
        }
    }

    function drawTupleNode(x, y, radius, textSz, baseElement, lastValue, n) {
        // Draw circle
        p.stroke(getStrokeColor());
        p.strokeWeight(p.max(0.2, 1.5 - (n - 2) * 0.3));
        p.fill(getBackgroundColor());
        p.circle(x, y, radius * 2);
        
        // Draw tuple text
        p.fill(getTextColor());
        p.noStroke();
        p.textSize(textSz);
        const tupleStr = `(${[...baseElement, lastValue].join(',')})`;
        p.text(tupleStr, x, y);
    }

    function drawEllipsisAndArrows(x) {
        const topY = centerY + CONFIG.MIN_VALUE * CONFIG.VERTICAL_SPACING;
        const bottomY = centerY + CONFIG.MAX_VALUE * CONFIG.VERTICAL_SPACING;
        
        p.fill(getTextColor());
        p.noStroke();
        
        // Top ellipsis and arrow
        p.textSize(CONFIG.ELLIPSIS_SIZE);
        p.text('⋮', x, topY - CONFIG.ELLIPSIS_OFFSET);
        p.textSize(CONFIG.ARROW_SIZE);
        p.text('↑ ∞', x, topY - CONFIG.ARROW_OFFSET);
        
        // Bottom ellipsis and arrow
        p.textSize(CONFIG.ELLIPSIS_SIZE);
        p.text('⋮', x, bottomY + CONFIG.ELLIPSIS_OFFSET);
        p.textSize(CONFIG.ARROW_SIZE);
        p.text('↓ ∞', x, bottomY + CONFIG.ARROW_OFFSET);
    }

    function drawDensityIndicators(x, n) {
        p.fill(getTextColor());
        p.noStroke();
        p.textSize(p.max(16, 32 - n * 2));
        
        const positions = [
            {x: -25, y: centerY - 50},
            {x: 25, y: centerY - 50},
            {x: -25, y: centerY + 50},
            {x: 25, y: centerY + 50},
            {x: 0, y: centerY}
        ];
        
        for (const pos of positions) {
            p.text('⋮', x + pos.x, pos.y);
        }
    }

    // ===== Arrow Drawing =====
    function drawArrowsBetweenColumns(x1, x2, fromLevel, toLevel) {
        const strokeWt = p.max(CONFIG.MIN_STROKE_WEIGHT, 
                                    1.5 - (toLevel - 2) * 0.15);
        const dashSize = p.max(CONFIG.MIN_DASH_SIZE, 
                                4 - toLevel * 0.3);
        
        p.stroke(getStrokeColor());
        p.strokeWeight(strokeWt);
        p.drawingContext.setLineDash([dashSize, dashSize * 1.5]);
        
        // Determine source elements
        const sourceElements = fromLevel === 0 
            ? generateIntegerArray() 
            : generateSampleTuples(fromLevel, p.min(11, 5 + fromLevel * 2));
        
        // Calculate arrow density
        const density = fromLevel === 0 ? 1 : p.min(3 + fromLevel, 6);
        const spreadFactor = p.min(toLevel * 10, 60);
        
        // Draw arrows for each source element
        for (let i = 0; i < sourceElements.length; i++) {
            const y1 = fromLevel === 0 
                ? centerY + sourceElements[i][0] * CONFIG.VERTICAL_SPACING
                : getTupleY(i, sourceElements.length);
            
            if (!isInVerticalBounds(y1)) continue;
            
            drawArrowsFromElement(x1, x2, y1, i, density, toLevel, fromLevel);
            
            // Add spreading arrows for higher levels
            if (toLevel >= 2 && i % p.max(1, 4 - toLevel) === 0) {
                drawSpreadingArrows(x1, x2, y1, spreadFactor, toLevel, fromLevel);
            }
        }
        
        p.drawingContext.setLineDash([]);
    }

    function drawArrowsFromElement(x1, x2, y1, elementIndex, density, toLevel, fromLevel) {
        const sourceRadius = fromLevel === 0 ? CONFIG.CIRCLE_RADIUS : 
                           p.max(4, 20 - fromLevel * 4);
        const targetRadius = toLevel === 1 ? CONFIG.CIRCLE_RADIUS : 
                           p.max(4, 20 - (toLevel - 1) * 4);
        
        for (let j = 0; j < density; j++) {
            const targetOffset = (j - p.floor(density/2)) * 
                               p.max(6, 20 - p.max(0, toLevel - 2) * 3);
            const y2 = y1 + targetOffset + (elementIndex % 3) * 2;
            const xOffset = (j % 2) * p.min(15, 25 - toLevel * 2) - 
                          p.min(7.5, 12.5 - toLevel);
            
            if (isInVerticalBounds(y2)) {
                p.line(x1 + sourceRadius, y1, x2 + xOffset - targetRadius, y2);
            }
        }
    }

    function drawSpreadingArrows(x1, x2, y1, spreadFactor, toLevel, fromLevel) {
        const sourceRadius = fromLevel === 0 ? CONFIG.CIRCLE_RADIUS : 
                           p.max(4, 20 - fromLevel * 4);
        const targetRadius = p.max(4, 20 - (toLevel - 1) * 4);
        
        for (let spread = -spreadFactor; spread <= spreadFactor; spread += spreadFactor/3) {
            const targetY = y1 + spread;
            if (targetY > 50 && targetY < canvasHeight - 50) {
                p.line(x1 + sourceRadius, y1, x2 - targetRadius, targetY);
            }
        }
    }

    // ===== Helper Functions =====
    function generateIntegerArray() {
        const result = [];
        for (let i = CONFIG.MIN_VALUE; i <= CONFIG.MAX_VALUE; i++) {
            result.push([i]);
        }
        return result;
    }

    function generateSampleTuples(level, count) {
        if (level === 1) {
            return generateIntegerArray();
        }
        
        const result = [];
        const baseValues = [-2, -1, 0, 1, 2];
        
        if (level === 2) {
            for (let i = 0; i < baseValues.length && result.length < count; i++) {
                for (let j = 0; j < baseValues.length && result.length < count; j++) {
                    result.push([baseValues[i], baseValues[j]]);
                }
            }
        } else if (level === 3) {
            for (let i = 0; i < baseValues.length && result.length < count; i++) {
                for (let j = 0; j < baseValues.length && result.length < count; j++) {
                    for (let k = 0; k < baseValues.length && result.length < count; k++) {
                        result.push([baseValues[i], baseValues[j], baseValues[k]]);
                    }
                }
            }
        } else {
            // For higher levels, use a simpler approach
            for (let i = 0; i < count; i++) {
                const tuple = [];
                for (let j = 0; j < level; j++) {
                    tuple.push(baseValues[i % baseValues.length]);
                }
                result.push(tuple);
            }
        }
        
        return result.slice(0, count);
    }

    function getTupleY(elementIndex, totalElements) {
        const availableHeight = (CONFIG.MAX_VALUE - CONFIG.MIN_VALUE) * CONFIG.VERTICAL_SPACING;
        const topY = centerY + CONFIG.MIN_VALUE * CONFIG.VERTICAL_SPACING;
        
        if (totalElements <= 1) {
            return centerY;
        }
        
        const spacing = availableHeight / (totalElements - 1);
        return topY + elementIndex * spacing;
    }

    function getSubElements(density) {
        const elements = [];
        for (let i = -p.floor(density/2); i <= p.floor(density/2); i++) {
            elements.push(i);
        }
        return elements.slice(0, density);
    }

    function isInDrawingBounds(y, xOffset) {
        return y > 90 && y < canvasHeight - 90 && p.abs(xOffset) < 30;
    }

    function isInVerticalBounds(y) {
        return y > 100 && y < canvasHeight - 100;
    }

    function getSuperscriptUnicode(n) {
        const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
        return n.toString().split('').map(d => superscripts[parseInt(d)]).join('');
    }

    function getSubscriptUnicode(n) {
        const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
        return n.toString().split('').map(d => subscripts[parseInt(d)]).join('');
    }

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