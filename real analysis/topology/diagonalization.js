let sequences = [];
let constructedSequence = [];
let currentStep = 0;
let animationState = 'building'; // 'building', 'shifting', 'post-shift-pause'
let animationStartTime = 0; // Track when current animation started
let highlightStartTime = 0; // Track when highlight started
let totalSteps = 0; // Total steps taken across all iterations
let startingSequenceNumber = 1; // Track which sequence we're starting from
let startingPositionNumber = 1; // Track which position we're starting from
const SEQUENCE_LENGTH = 8;
const NUM_SEQUENCES = 8;
const CELL_SIZE = 40;
const HIGHLIGHT_DURATION = 1000; // milliseconds
const SHIFT_DURATION = 1500; // milliseconds for shifting animation (1.5 seconds)
const POST_SHIFT_PAUSE = 500; // milliseconds to pause after shift (0.5 seconds)
const SHIFT_AMOUNT = 7; // How many positions to shift diagonally

function setup() {
    let canvas = createCanvas(600, 550);
    canvas.parent('sketch-container');
    
    // Apply text styling for dark mode compatibility
    if (typeof applyTextStyle === 'function') {
        applyTextStyle();
    }
    
    generateNewSequences();
}

function draw() {
    background(getBackgroundColor());
    
    // Title
    fill(getTextColor());
    textAlign(CENTER, CENTER);
    textSize(16);
    let endPosition = startingPositionNumber + SEQUENCE_LENGTH - 1;
    text(`Binary Sequences (showing positions ${startingPositionNumber}-${endPosition} of infinite sequences)`, width/2, 30);
    
    // Draw the table of sequences
    drawSequenceTable();
    
    // Draw constructed sequence
    drawConstructedSequence();
    
    // Draw labels and indicators
    drawLabels();
    
    // Handle animation
    handleAnimation();
}

function generateNewSequences() {
    sequences = [];
    constructedSequence = [];
    currentStep = 0;
    totalSteps = 0;
    startingSequenceNumber = 1;
    startingPositionNumber = 1;
    animationState = 'building';
    animationStartTime = 0;
    highlightStartTime = 0;
    
    // Generate random binary sequences
    for (let i = 0; i < NUM_SEQUENCES; i++) {
        sequences.push([]);
    }
    
    // Initialize empty constructed sequence
    for (let i = 0; i < SEQUENCE_LENGTH; i++) {
        constructedSequence.push(-1); // -1 means empty
    }
}

// Get or generate a digit for a specific sequence and position
function getSequenceDigit(sequenceIndex, position) {
    // Ensure the sequence exists
    if (sequenceIndex >= sequences.length) {
        return 0; // Fallback
    }
    
    // Generate digits up to the requested position if needed
    while (sequences[sequenceIndex].length <= position) {
        sequences[sequenceIndex].push(Math.floor(Math.random() * 2));
    }
    
    return sequences[sequenceIndex][position];
}

function shiftDiagonally() {
    // Update starting numbers for the diagonal shift
    startingSequenceNumber += SHIFT_AMOUNT;
    startingPositionNumber += SHIFT_AMOUNT;
    
    // Remove the first SHIFT_AMOUNT sequences
    sequences.splice(0, SHIFT_AMOUNT);
    
    // Add SHIFT_AMOUNT new empty sequences at the end
    for (let i = 0; i < SHIFT_AMOUNT; i++) {
        sequences.push([]);
    }
    
    // Shift constructed sequence left
    constructedSequence.splice(0, SHIFT_AMOUNT);
    // Add empty slots for new positions
    for (let j = 0; j < SHIFT_AMOUNT; j++) {
        constructedSequence.push(-1);
    }
    
    // Reset currentStep to 1 (since position 0 already has a value)
    currentStep = 1;
}

function drawSequenceTable() {
    let startX = (width - SEQUENCE_LENGTH * CELL_SIZE) / 2;
    let startY = 80;
    
    // Calculate shift offset for smooth animation
    let shiftOffsetX = 0;
    let shiftOffsetY = 0;
    if (animationState === 'shifting') {
        // Smooth easing for the shift
        let elapsed = millis() - animationStartTime;
        let t = min(elapsed / SHIFT_DURATION, 1.0);
        shiftOffsetX = SHIFT_AMOUNT * CELL_SIZE * easeInOutCubic(t);
        shiftOffsetY = SHIFT_AMOUNT * CELL_SIZE * easeInOutCubic(t);
    }
    
    // Draw row labels first (outside clipping region)
    for (let i = 0; i < NUM_SEQUENCES; i++) {
        let labelY = startY + i * CELL_SIZE + CELL_SIZE/2 - shiftOffsetY;
        if (labelY >= startY - CELL_SIZE && labelY <= startY + NUM_SEQUENCES * CELL_SIZE + CELL_SIZE) {
            fill(getTextColor());
            textAlign(RIGHT, CENTER);
            textSize(14);
            text(`s${getSubscript(startingSequenceNumber + i)}:`, startX - 10, labelY);
            
            // Draw ellipsis to indicate infinite sequence
            textAlign(LEFT, CENTER);
            text("...", startX + SEQUENCE_LENGTH * CELL_SIZE + 5, labelY);
        }
    }
    
    // Set clipping region to prevent drawing outside the table area
    push();
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(startX, startY, SEQUENCE_LENGTH * CELL_SIZE, NUM_SEQUENCES * CELL_SIZE);
    drawingContext.clip();
    
    // Draw sequence rows
    for (let i = 0; i < NUM_SEQUENCES; i++) {
        for (let j = 0; j < SEQUENCE_LENGTH; j++) {
            let x = startX + j * CELL_SIZE - shiftOffsetX;
            let y = startY + i * CELL_SIZE - shiftOffsetY;
            
            // Skip cells that are off-screen to the left
            if (x + CELL_SIZE < startX) continue;
            // Skip cells that are off-screen to the right
            if (x > startX + SEQUENCE_LENGTH * CELL_SIZE) continue;
            // Skip cells that are off-screen to the top
            if (y + CELL_SIZE < startY) continue;
            // Skip cells that are off-screen to the bottom
            if (y > startY + NUM_SEQUENCES * CELL_SIZE) continue;
            
            // Highlight diagonal cell if currently being processed
            let actualPosition = startingPositionNumber + j;
            let actualSequence = startingSequenceNumber + i;
            let isHighlighting = animationState === 'building' && 
                                highlightStartTime > 0 && 
                                (millis() - highlightStartTime) < HIGHLIGHT_DURATION;
            
            // During shift, highlight the cell at (7,7) as it moves to (0,0)
            let isShiftHighlight = false;
            if (animationState === 'shifting') {
                // The cell that was at (7,7) is moving up and left
                isShiftHighlight = i === SHIFT_AMOUNT && j === SHIFT_AMOUNT;
            } else if (animationState === 'post-shift-pause') {
                // After shift, highlight the new top-left cell
                isShiftHighlight = i === 0 && j === 0;
            }
            
            if ((i === currentStep && j === currentStep && 
                isHighlighting && actualPosition === actualSequence) ||
                isShiftHighlight) {
                fill(255, 255, 0); // Bright yellow highlight
            } else {
                fill(getCellBackgroundColor());
            }
            
            stroke(getTextColor());
            strokeWeight(1);
            rect(x, y, CELL_SIZE, CELL_SIZE);
            
            // Draw the digit from the correct position in the sequence
            // Use dark text on highlighted cells for better contrast
            if ((i === currentStep && j === currentStep && 
                isHighlighting && actualPosition === actualSequence) ||
                isShiftHighlight) {
                fill(0); // Always use black text on yellow highlight
            } else {
                fill(getTextColor());
            }
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(20);
            let digitIndex = startingPositionNumber - 1 + j;
            let digit = getSequenceDigit(i, digitIndex);
            text(digit, x + CELL_SIZE/2, y + CELL_SIZE/2);
        }
    }
    
    // Restore clipping
    drawingContext.restore();
    pop();
    
    // Draw "⋮" to indicate infinitely many sequences
    fill(getTextColor());
    textAlign(CENTER, CENTER);
    textSize(20);
    text("⋮", width/2, startY + NUM_SEQUENCES * CELL_SIZE + 20);
}

function drawConstructedSequence() {
    let startX = (width - SEQUENCE_LENGTH * CELL_SIZE) / 2;
    let startY = 80 + NUM_SEQUENCES * CELL_SIZE + 80;
    
    // Calculate shift offset for smooth animation
    let shiftOffsetX = 0;
    if (animationState === 'shifting') {
        let elapsed = millis() - animationStartTime;
        let t = min(elapsed / SHIFT_DURATION, 1.0);
        shiftOffsetX = SHIFT_AMOUNT * CELL_SIZE * easeInOutCubic(t);
    }
    
    // Draw label
    fill(getTextColor());
    noStroke();
    textAlign(RIGHT, CENTER);
    textSize(14);
    text("p:", startX - 10, startY + CELL_SIZE/2);
    
    // Set clipping for constructed sequence
    push();
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(startX, startY, SEQUENCE_LENGTH * CELL_SIZE, CELL_SIZE);
    drawingContext.clip();
    
    // Draw constructed sequence cells
    for (let j = 0; j < SEQUENCE_LENGTH; j++) {
        let x = startX + j * CELL_SIZE - shiftOffsetX;
        let y = startY;
        
        // Skip cells that are off-screen to the left
        if (x + CELL_SIZE < startX) continue;
        // Skip cells that are off-screen to the right
        if (x > startX + SEQUENCE_LENGTH * CELL_SIZE) continue;
        
        // Highlight current cell being filled
        let isHighlighting = animationState === 'building' && 
                            highlightStartTime > 0 && 
                            (millis() - highlightStartTime) < HIGHLIGHT_DURATION;
        
        // During shift and post-shift pause, highlight the appropriate cell
        let isShiftHighlight = false;
        if (animationState === 'shifting') {
            // During shift, highlight the cell at position 7 as it moves to position 0
            isShiftHighlight = j === SHIFT_AMOUNT;
        } else if (animationState === 'post-shift-pause') {
            // After shift, highlight the first cell
            isShiftHighlight = j === 0;
        }
                            
        if ((j === currentStep && isHighlighting) || isShiftHighlight) {
            fill(255, 255, 0); // Bright yellow highlight
        } else if (constructedSequence[j] !== -1) {
            fill(getFilledCellColor()); // Light green for filled cells
        } else {
            fill(getCellBackgroundColor());
        }
        
        stroke(getTextColor());
        strokeWeight(1);
        rect(x, y, CELL_SIZE, CELL_SIZE);
        
        // Draw the digit if it exists
        if (constructedSequence[j] !== -1) {
            // Use dark text on highlighted cells for better contrast
            if ((j === currentStep && isHighlighting) || isShiftHighlight) {
                fill(0); // Always use black text on yellow highlight
            } else {
                fill(getTextColor());
            }
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(20);
            text(constructedSequence[j], x + CELL_SIZE/2, y + CELL_SIZE/2);
        }
    }
    
    // Restore clipping
    drawingContext.restore();
    pop();
    
    // Draw ellipsis to indicate infinite sequence
    fill(getTextColor());
    textAlign(LEFT, CENTER);
    textSize(14);
    text("...", startX + SEQUENCE_LENGTH * CELL_SIZE + 5, startY + CELL_SIZE/2);
    
    // Draw position labels under the constructed sequence
    for (let j = 0; j < SEQUENCE_LENGTH; j++) {
        let x = startX + j * CELL_SIZE - shiftOffsetX;
        
        // Skip labels that are off-screen
        if (x + CELL_SIZE < startX) continue;
        if (x > startX + SEQUENCE_LENGTH * CELL_SIZE) continue;
        
        fill(getTextColor());
        noStroke();
        textAlign(CENTER, TOP);
        textSize(11);
        text(startingPositionNumber + j, x + CELL_SIZE/2, startY + CELL_SIZE + 5);
    }
}

function drawLabels() {
    let startY = 80 + NUM_SEQUENCES * CELL_SIZE + 80 + CELL_SIZE + 30;
    
    fill(getTextColor());
    textAlign(CENTER, TOP);
    textSize(12);
    
    if (animationState === 'building' && currentStep < SEQUENCE_LENGTH) {
        let actualPosition = startingPositionNumber + currentStep;
        let actualSequence = startingSequenceNumber + currentStep;
        text(`Step ${totalSteps + 1}: p${getSubscript(actualPosition)} = opposite of s${getSubscript(actualSequence)}[${actualPosition}]`, 
             width/2, startY);
    } else if (animationState === 'shifting') {
        text("Shifting diagonally to continue the infinite construction...", width/2, startY);
    } else if (animationState === 'post-shift-pause') {
        text("Continuing along the diagonal with new sequences...", width/2, startY);
    }
    
    // Show total steps processed
    textSize(10);
    text(`Total positions processed: ${totalSteps}`, width/2, startY + 25);
}

function handleAnimation() {
    let currentTime = millis();
    
    if (animationState === 'building') {
        if (currentStep < SEQUENCE_LENGTH) {
            if (highlightStartTime === 0) {
                // Start highlighting
                highlightStartTime = currentTime;
                
                // Set the constructed digit to be opposite of diagonal element
                let digitIndex = startingPositionNumber - 1 + currentStep;
                let diagonalDigit = getSequenceDigit(currentStep, digitIndex);
                constructedSequence[currentStep] = 1 - diagonalDigit;
                totalSteps++;
            }
            
            // Check if highlight duration has passed
            if (currentTime - highlightStartTime >= HIGHLIGHT_DURATION) {
                currentStep++;
                highlightStartTime = 0;
                
                if (currentStep >= SEQUENCE_LENGTH) {
                    animationState = 'shifting';
                    animationStartTime = currentTime;
                }
            }
        }
    } else if (animationState === 'shifting') {
        // Check if shift duration has passed
        if (currentTime - animationStartTime >= SHIFT_DURATION) {
            // Perform the actual diagonal shift at the end of animation
            shiftDiagonally();
            animationState = 'post-shift-pause';
            animationStartTime = currentTime;
        }
    } else if (animationState === 'post-shift-pause') {
        // Check if pause duration has passed
        if (currentTime - animationStartTime >= POST_SHIFT_PAUSE) {
            animationState = 'building';
            highlightStartTime = 0;
        }
    }
}

function getBackgroundColor() {
    // Check if we're in dark mode
    if (document.documentElement.getAttribute('data-theme') === 'dark' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return color(15, 15, 15);
    }
    return color(255, 255, 255);
}

function getTextColor() {
    // Check if we're in dark mode
    if (document.documentElement.getAttribute('data-theme') === 'dark' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return color(230, 230, 230);
    }
    return color(0, 0, 0);
}

function getCellBackgroundColor() {
    // Check if we're in dark mode
    if (document.documentElement.getAttribute('data-theme') === 'dark' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return color(45, 45, 45); // Dark gray for cells
    }
    return color(250, 250, 250); // Light gray for cells
}

function getFilledCellColor() {
    // Check if we're in dark mode
    if (document.documentElement.getAttribute('data-theme') === 'dark' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return color(0, 100, 0); // Dark green for filled cells
    }
    return color(200, 255, 200); // Light green for filled cells
}

function getSubscript(num) {
    const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    return num.toString().split('').map(digit => subscripts[parseInt(digit)]).join('');
}

// Optional: Add click to restart
function mousePressed() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        generateNewSequences();
    }
}

// Apply text style function for dark mode compatibility
function applyTextStyle() {
    // This function is called from demo-dark-mode.js if available
    // It ensures proper text styling in both light and dark modes
}

// Easing function for smooth animation
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}