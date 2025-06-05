let sequences = [];
let constructedSequence = [];
let currentStep = 0;
let animationState = 'building'; // 'building', 'paused', 'resetting'
let pauseCounter = 0;
let highlightTimer = 0;
const SEQUENCE_LENGTH = 8;
const NUM_SEQUENCES = 8;
const CELL_SIZE = 40;
const HIGHLIGHT_DURATION = 60; // frames
const PAUSE_DURATION = 120; // frames

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
    animationState = 'building';
    pauseCounter = 0;
    highlightTimer = 0;
    
    // Generate random binary sequences
    for (let i = 0; i < NUM_SEQUENCES; i++) {
        let sequence = [];
        for (let j = 0; j < SEQUENCE_LENGTH; j++) {
            sequence.push(Math.floor(Math.random() * 2));
        }
        sequences.push(sequence);
    }
    
    // Initialize empty constructed sequence
    for (let i = 0; i < SEQUENCE_LENGTH; i++) {
        constructedSequence.push(-1); // -1 means empty
    }
}

function drawSequenceTable() {
    let startX = (width - SEQUENCE_LENGTH * CELL_SIZE) / 2;
    let startY = 80;
    
    // Draw sequence rows
    for (let i = 0; i < NUM_SEQUENCES; i++) {
        for (let j = 0; j < SEQUENCE_LENGTH; j++) {
            let x = startX + j * CELL_SIZE;
            let y = startY + i * CELL_SIZE;
            
            // Highlight diagonal cell if currently being processed
            if (i === currentStep && j === currentStep && 
                animationState === 'building' && highlightTimer > 0) {
                fill(255, 255, 0); // Bright yellow highlight
            } else {
                fill(getCellBackgroundColor());
            }
            
            stroke(getTextColor());
            strokeWeight(1);
            rect(x, y, CELL_SIZE, CELL_SIZE);
            
            // Draw the digit
            fill(getTextColor());
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(20);
            text(sequences[i][j], x + CELL_SIZE/2, y + CELL_SIZE/2);
        }
        
        // Draw row label
        fill(getTextColor());
        textAlign(RIGHT, CENTER);
        textSize(14);
        text(`s${i+1}:`, startX - 10, startY + i * CELL_SIZE + CELL_SIZE/2);
        
        // Draw ellipsis to indicate infinite sequence
        textAlign(LEFT, CENTER);
        text("...", startX + SEQUENCE_LENGTH * CELL_SIZE + 5, startY + i * CELL_SIZE + CELL_SIZE/2);
    }
    
    // Draw "⋮" to indicate infinitely many sequences
    fill(getTextColor());
    textAlign(CENTER, CENTER);
    textSize(20);
    text("⋮", width/2, startY + NUM_SEQUENCES * CELL_SIZE + 20);
}

function drawConstructedSequence() {
    let startX = (width - SEQUENCE_LENGTH * CELL_SIZE) / 2;
    let startY = 80 + NUM_SEQUENCES * CELL_SIZE + 80;
    
    // Draw label
    fill(getTextColor());
    noStroke();
    textAlign(RIGHT, CENTER);
    textSize(14);
    text("p:", startX - 10, startY + CELL_SIZE/2);
    
    // Draw constructed sequence cells
    for (let j = 0; j < SEQUENCE_LENGTH; j++) {
        let x = startX + j * CELL_SIZE;
        let y = startY;
        
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
    
    // Draw ellipsis to indicate infinite sequence
    fill(getTextColor());
    textAlign(LEFT, CENTER);
    textSize(14);
    text("...", startX + SEQUENCE_LENGTH * CELL_SIZE + 5, startY + CELL_SIZE/2);
}

function drawLabels() {
    let startY = 80 + NUM_SEQUENCES * CELL_SIZE + 80 + CELL_SIZE + 30;
    
    fill(getTextColor());
    textAlign(CENTER, TOP);
    textSize(12);
    
    if (animationState === 'building' && currentStep < SEQUENCE_LENGTH) {
        text(`Step ${currentStep + 1}: p[${currentStep + 1}] = opposite of s${currentStep + 1}[${currentStep + 1}]`, 
             width/2, startY);
    } else if (animationState === 'paused') {
        text("Construction complete! p differs from every sequence in the list.", width/2, startY);
        text("New random sequences will be generated...", width/2, startY + 20);
    }
}

function handleAnimation() {
    if (animationState === 'building') {
        if (currentStep < SEQUENCE_LENGTH) {
            if (highlightTimer === 0) {
                // Start highlighting
                highlightTimer = HIGHLIGHT_DURATION;
                
                // Set the constructed digit to be opposite of diagonal element
                let diagonalDigit = sequences[currentStep][currentStep];
                constructedSequence[currentStep] = 1 - diagonalDigit;
            }
            
            highlightTimer--;
            
            if (highlightTimer === 0) {
                currentStep++;
                if (currentStep >= SEQUENCE_LENGTH) {
                    animationState = 'paused';
                    pauseCounter = PAUSE_DURATION;
                }
            }
        }
    } else if (animationState === 'paused') {
        pauseCounter--;
        if (pauseCounter <= 0) {
            animationState = 'resetting';
            generateNewSequences();
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