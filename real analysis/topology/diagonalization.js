let sequences = [];
let constructedSequence = [];
let currentStep = 0;
let animationState = 'building'; // 'building', 'shifting'
let pauseCounter = 0;
let highlightTimer = 0;
let shiftProgress = 0; // For smooth shifting animation
let totalSteps = 0; // Total steps taken across all iterations
let startingSequenceNumber = 1; // Track which sequence we're starting from
let startingPositionNumber = 1; // Track which position we're starting from
const SEQUENCE_LENGTH = 8;
const NUM_SEQUENCES = 8;
const CELL_SIZE = 40;
const HIGHLIGHT_DURATION = 60; // frames
const SHIFT_DURATION = 30; // frames for shifting animation
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
    text("Binary Sequences (showing first 8 digits of infinite sequences)", width/2, 30);
    
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
    pauseCounter = 0;
    highlightTimer = 0;
    shiftProgress = 0;
    
    // Generate random binary sequences
    for (let i = 0; i < NUM_SEQUENCES; i++) {
        let sequence = [];
        // Generate enough digits to handle future shifts
        for (let j = 0; j < SEQUENCE_LENGTH * 10; j++) {
            sequence.push(Math.floor(Math.random() * 2));
        }
        sequences.push(sequence);
    }
    
    // Initialize empty constructed sequence
    for (let i = 0; i < SEQUENCE_LENGTH; i++) {
        constructedSequence.push(-1); // -1 means empty
    }
}

function shiftDiagonally() {
    // Update starting numbers for the diagonal shift
    startingSequenceNumber += SHIFT_AMOUNT;
    startingPositionNumber += SHIFT_AMOUNT;
    
    // Remove the first SHIFT_AMOUNT sequences
    sequences.splice(0, SHIFT_AMOUNT);
    
    // Add SHIFT_AMOUNT new sequences at the end
    for (let i = 0; i < SHIFT_AMOUNT; i++) {
        let newSequence = [];
        for (let j = 0; j < SEQUENCE_LENGTH * 10; j++) {
            newSequence.push(Math.floor(Math.random() * 2));
        }
        sequences.push(newSequence);
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
        let t = shiftProgress / SHIFT_DURATION;
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
            if (i === currentStep && j === currentStep && 
                animationState === 'building' && highlightTimer > 0 &&
                actualPosition === actualSequence) {
                fill(255, 255, 0); // Bright yellow highlight
            } else {
                fill(getCellBackgroundColor());
            }
            
            stroke(getTextColor());
            strokeWeight(1);
            rect(x, y, CELL_SIZE, CELL_SIZE);
            
            // Draw the digit from the correct position in the sequence
            fill(getTextColor());
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(20);
            let digitIndex = startingPositionNumber - 1 + j;
            text(sequences[i][digitIndex], x + CELL_SIZE/2, y + CELL_SIZE/2);
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
        let t = shiftProgress / SHIFT_DURATION;
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
        if (j === currentStep && animationState === 'building' && highlightTimer > 0) {
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
            fill(getTextColor());
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
    }
    
    // Show total steps processed
    textSize(10);
    text(`Total positions processed: ${totalSteps}`, width/2, startY + 25);
}

function handleAnimation() {
    if (animationState === 'building') {
        if (currentStep < SEQUENCE_LENGTH) {
            if (highlightTimer === 0) {
                // Start highlighting
                highlightTimer = HIGHLIGHT_DURATION;
                
                // Set the constructed digit to be opposite of diagonal element
                let digitIndex = startingPositionNumber - 1 + currentStep;
                let diagonalDigit = sequences[currentStep][digitIndex];
                constructedSequence[currentStep] = 1 - diagonalDigit;
                totalSteps++;
            }
            
            highlightTimer--;
            
            if (highlightTimer === 0) {
                currentStep++;
                if (currentStep >= SEQUENCE_LENGTH) {
                    animationState = 'shifting';
                    shiftProgress = 0;
                }
            }
        }
    } else if (animationState === 'shifting') {
        shiftProgress++;
        
        if (shiftProgress >= SHIFT_DURATION) {
            // Perform the actual diagonal shift at the end of animation
            shiftDiagonally();
            animationState = 'building';
            shiftProgress = 0;
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