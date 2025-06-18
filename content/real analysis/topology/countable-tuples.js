// ===== Configuration Constants =====
const CONFIG = {
    // Animation timing
    STEP_DURATION: 2000,      // Time between columns appearing (ms)
    END_PAUSE: 2000,          // Pause at end before restarting (ms)
    
    // Layout
    COLUMN_SPACING: 200,      // Horizontal spacing between columns
    START_X: 100,             // Starting x position for first column
    MAX_VISIBLE_COLUMNS: 4,   // Maximum columns visible at once
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

// ===== p5.js Setup and Draw =====
function setup() {
    canvasWidth = min(windowWidth - 40, 1200);
    canvasHeight = min(windowHeight - 200, 800);
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('sketch-holder');
    
    centerY = canvasHeight / 2;
    textAlign(CENTER, CENTER);
    strokeWeight(2);
    
    animationStartTime = millis();
}

function draw() {
    background(getBackgroundColor());
    
    // Calculate animation state
    const animationState = calculateAnimationState();
    const visibleColumns = getVisibleColumns(animationState.currentStep);
    
    // Draw all visible columns and connections
    drawColumns(visibleColumns);
    
    // Draw cardinality equation at bottom
    drawCardinalityEquation(visibleColumns);
}

function windowResized() {
    canvasWidth = min(windowWidth - 40, 1200);
    canvasHeight = min(windowHeight - 200, 800);
    resizeCanvas(canvasWidth, canvasHeight);
    centerY = canvasHeight / 2;
}

// ===== Animation Logic =====
function calculateAnimationState() {
    let elapsed = millis() - animationStartTime;
    const cycleTime = CONFIG.TOTAL_COLUMNS * CONFIG.STEP_DURATION + CONFIG.END_PAUSE;
    
    // Reset animation at end of cycle
    if (elapsed >= cycleTime) {
        animationStartTime = millis();
        elapsed = 0;
    }
    
    const currentStep = Math.min(
        Math.floor(elapsed / CONFIG.STEP_DURATION), 
        CONFIG.TOTAL_COLUMNS - 1
    );
    
    return { elapsed, currentStep, cycleTime };
}

function getVisibleColumns(currentStep) {
    const columns = [];
    
    if (currentStep < CONFIG.MAX_VISIBLE_COLUMNS) {
        // Initial phase: columns appear one by one
        for (let i = 0; i <= currentStep; i++) {
            columns.push({
                index: i,
                x: CONFIG.START_X + i * CONFIG.COLUMN_SPACING
            });
        }
    } else {
        // Shifting phase: show MAX_VISIBLE_COLUMNS, shifted appropriately
        const offset = currentStep - CONFIG.MAX_VISIBLE_COLUMNS + 1;
        for (let i = 0; i < CONFIG.MAX_VISIBLE_COLUMNS; i++) {
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
    
    stroke(getStrokeColor());
    strokeWeight(2);
    line(lineX, 100, lineX, canvasHeight - 100);
    
    // Draw |A|^n label
    drawCardinalityLabel(lineX, toCol.index);
}

function drawCardinalityLabel(x, n) {
    fill(getBackgroundColor());
    noStroke();
    const labelWidth = n === 1 ? 40 : 50;
    rect(x - labelWidth/2, centerY - 20, labelWidth, 40);
    
    fill(getTextColor());
    textSize(n === 1 ? 24 : 22);
    
    let label = '|A|';
    if (n > 1) {
        label += getSuperscriptUnicode(n);
    }
    text(label, x, centerY);
}

function drawCardinalityEquation(visibleColumns) {
    if (visibleColumns.length === 0) return;
    
    const lastCol = visibleColumns[visibleColumns.length - 1];
    const n = lastCol.index;
    
    fill(getTextColor());
    noStroke();
    textSize(CONFIG.EQUATION_SIZE);
    textAlign(CENTER, CENTER);
    
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
    
    text(equation, canvasWidth / 2, canvasHeight - 40);
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
    fill(getTextColor());
    noStroke();
    textSize(CONFIG.LABEL_SIZE);
    textStyle(BOLD);
    text(label, x, 60);
    textStyle(NORMAL);
}

function drawIntegerElements(x) {
    for (let i = CONFIG.MIN_VALUE; i <= CONFIG.MAX_VALUE; i++) {
        const y = centerY + i * CONFIG.VERTICAL_SPACING;
        
        // Draw circle
        stroke(getStrokeColor());
        strokeWeight(2);
        fill(getBackgroundColor());
        circle(x, y, CONFIG.CIRCLE_RADIUS * 2);
        
        // Draw number
        fill(getTextColor());
        noStroke();
        textSize(CONFIG.VALUE_SIZE);
        text(i, x, y);
    }
}

function drawTupleElements(x, n) {
    // Calculate display parameters based on n
    const nodeRadius = Math.max(4, 20 - (n - 1) * 4);
    const textSz = Math.max(4, 16 - (n - 1) * 2);
    const density = Math.min(n, 4);
    const jitter = Math.min(n - 1, 3);
    
    // Generate and display sample tuples
    const sampleElements = generateSampleTuples(n - 1, Math.min(11, 5 + n * 2));
    
    for (let i = 0; i < sampleElements.length; i++) {
        const baseY = getTupleY(i, sampleElements.length);
        const subElements = getSubElements(density);
        
        for (let j = 0; j < subElements.length; j++) {
            const spacing = Math.max(6, 20 - (n - 2) * 3);
            const y = baseY + (j - Math.floor(density/2)) * spacing + (i % jitter) * 2;
            const xOffset = (j % 2) * Math.min(15, 25 - n * 2) - Math.min(7.5, 12.5 - n);
            
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
    stroke(getStrokeColor());
    strokeWeight(Math.max(0.2, 1.5 - (n - 2) * 0.3));
    fill(getBackgroundColor());
    circle(x, y, radius * 2);
    
    // Draw tuple text
    fill(getTextColor());
    noStroke();
    textSize(textSz);
    const tupleStr = `(${[...baseElement, lastValue].join(',')})`;
    text(tupleStr, x, y);
}

function drawEllipsisAndArrows(x) {
    const topY = centerY + CONFIG.MIN_VALUE * CONFIG.VERTICAL_SPACING;
    const bottomY = centerY + CONFIG.MAX_VALUE * CONFIG.VERTICAL_SPACING;
    
    fill(getTextColor());
    noStroke();
    
    // Top ellipsis and arrow
    textSize(CONFIG.ELLIPSIS_SIZE);
    text('⋮', x, topY - CONFIG.ELLIPSIS_OFFSET);
    textSize(CONFIG.ARROW_SIZE);
    text('↑ ∞', x, topY - CONFIG.ARROW_OFFSET);
    
    // Bottom ellipsis and arrow
    textSize(CONFIG.ELLIPSIS_SIZE);
    text('⋮', x, bottomY + CONFIG.ELLIPSIS_OFFSET);
    textSize(CONFIG.ARROW_SIZE);
    text('↓ ∞', x, bottomY + CONFIG.ARROW_OFFSET);
}

function drawDensityIndicators(x, n) {
    fill(getTextColor());
    noStroke();
    textSize(Math.max(16, 32 - n * 2));
    
    const positions = [
        {x: -25, y: centerY - 50},
        {x: 25, y: centerY - 50},
        {x: -25, y: centerY + 50},
        {x: 25, y: centerY + 50},
        {x: 0, y: centerY}
    ];
    
    for (const pos of positions) {
        text('⋮', x + pos.x, pos.y);
    }
}

// ===== Arrow Drawing =====
function drawArrowsBetweenColumns(x1, x2, fromLevel, toLevel) {
    const strokeWt = Math.max(CONFIG.MIN_STROKE_WEIGHT, 
                                1.5 - (toLevel - 2) * 0.15);
    const dashSize = Math.max(CONFIG.MIN_DASH_SIZE, 
                            4 - toLevel * 0.3);
    
    stroke(getStrokeColor());
    strokeWeight(strokeWt);
    drawingContext.setLineDash([dashSize, dashSize * 1.5]);
    
    // Determine source elements
    const sourceElements = fromLevel === 0 
        ? generateIntegerArray() 
        : generateSampleTuples(fromLevel, Math.min(11, 5 + fromLevel * 2));
    
    // Calculate arrow density
    const density = fromLevel === 0 ? 1 : Math.min(3 + fromLevel, 6);
    const spreadFactor = Math.min(toLevel * 10, 60);
    
    // Draw arrows for each source element
    for (let i = 0; i < sourceElements.length; i++) {
        const y1 = fromLevel === 0 
            ? centerY + sourceElements[i][0] * CONFIG.VERTICAL_SPACING
            : getTupleY(i, sourceElements.length);
        
        if (!isInVerticalBounds(y1)) continue;
        
        drawArrowsFromElement(x1, x2, y1, i, density, toLevel, fromLevel);
        
        // Add spreading arrows for higher levels
        if (toLevel >= 2 && i % Math.max(1, 4 - toLevel) === 0) {
            drawSpreadingArrows(x1, x2, y1, spreadFactor, toLevel, fromLevel);
        }
    }
    
    drawingContext.setLineDash([]);
}

function drawArrowsFromElement(x1, x2, y1, elementIndex, density, toLevel, fromLevel) {
    const sourceRadius = fromLevel === 0 ? CONFIG.CIRCLE_RADIUS : 
                       Math.max(4, 20 - fromLevel * 4);
    const targetRadius = toLevel === 1 ? CONFIG.CIRCLE_RADIUS : 
                       Math.max(4, 20 - (toLevel - 1) * 4);
    
    for (let j = 0; j < density; j++) {
        const targetOffset = (j - Math.floor(density/2)) * 
                           Math.max(6, 20 - Math.max(0, toLevel - 2) * 3);
        const y2 = y1 + targetOffset + (elementIndex % 3) * 2;
        const xOffset = (j % 2) * Math.min(15, 25 - toLevel * 2) - 
                      Math.min(7.5, 12.5 - toLevel);
        
        if (isInVerticalBounds(y2)) {
            line(x1 + sourceRadius, y1, x2 + xOffset - targetRadius, y2);
        }
    }
}

function drawSpreadingArrows(x1, x2, y1, spreadFactor, toLevel, fromLevel) {
    const sourceRadius = fromLevel === 0 ? CONFIG.CIRCLE_RADIUS : 
                       Math.max(4, 20 - fromLevel * 4);
    const targetRadius = Math.max(4, 20 - (toLevel - 1) * 4);
    
    for (let spread = -spreadFactor; spread <= spreadFactor; spread += spreadFactor/3) {
        const targetY = y1 + spread;
        if (targetY > 50 && targetY < canvasHeight - 50) {
            line(x1 + sourceRadius, y1, x2 - targetRadius, targetY);
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
    for (let i = -Math.floor(density/2); i <= Math.floor(density/2); i++) {
        elements.push(i);
    }
    return elements.slice(0, density);
}

function isInDrawingBounds(y, xOffset) {
    return y > 90 && y < canvasHeight - 90 && Math.abs(xOffset) < 30;
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