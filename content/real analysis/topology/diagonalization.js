// Use p5.js instance mode to avoid conflicts with other demos
new p5(function(p) {
    // Namespace variables to avoid conflicts with other demos
    let diag_sequences = [];
    let diag_constructedSequence = [];
    let diag_currentStep = 0;
    let diag_animationState = 'building'; // 'building', 'shifting', 'post-shift-pause'
    let diag_animationStartTime = 0; // Track when current animation started
    let diag_highlightStartTime = 0; // Track when highlight started
    let diag_totalSteps = 0; // Total steps taken across all iterations
    let diag_startingSequenceNumber = 1; // Track which sequence we're starting from
    let diag_startingPositionNumber = 1; // Track which position we're starting from
    const DIAG_SEQUENCE_LENGTH = 8;
    const DIAG_NUM_SEQUENCES = 8;
    const DIAG_CELL_SIZE = 40;
    const DIAG_HIGHLIGHT_DURATION = 1000; // milliseconds
    const DIAG_SHIFT_DURATION = 1500; // milliseconds for shifting animation (1.5 seconds)
    const DIAG_POST_SHIFT_PAUSE = 500; // milliseconds to pause after shift (0.5 seconds)
    const DIAG_SHIFT_AMOUNT = 7; // How many positions to shift diagonally

    p.setup = function() {
        // Check for container element
        const sketchContainer = document.getElementById('sketch-container');
        if (!sketchContainer) {
            console.error('sketch-container element not found');
            return;
        }
        
        // Responsive sizing based on container
        let canvasWidth, canvasHeight;
        
        if (p.windowWidth < 768) {
            // Mobile: use full window width minus margin
            canvasWidth = p.windowWidth - 40;
            canvasHeight = p.min(550, p.windowHeight - 200);
        } else {
            // Desktop: use container-based sizing
            const container = sketchContainer.parentElement || demoContainer;
            canvasWidth = container ? p.min(container.offsetWidth - 40, 600) : 600;
            canvasHeight = 550;
        }
        
        let canvas = p.createCanvas(canvasWidth, canvasHeight);
        canvas.parent('sketch-container');
        
        // Apply text styling for dark mode compatibility
        if (typeof applyTextStyle === 'function') {
            applyTextStyle();
        }
        
        generateNewSequences();
    };

    p.draw = function() {
        p.background(getBackgroundColor());
        
        // Title
        p.fill(getTextColor());
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        let endPosition = diag_startingPositionNumber + DIAG_SEQUENCE_LENGTH - 1;
        p.text(`Binary Sequences (showing positions ${diag_startingPositionNumber}-${endPosition} of infinite sequences)`, p.width/2, 30);
        
        // Draw the table of sequences
        drawSequenceTable();
        
        // Draw constructed sequence
        drawConstructedSequence();
        
        // Draw labels and indicators
        drawLabels();
        
        // Handle animation
        handleAnimation();
    };

    p.windowResized = function() {
        // Responsive sizing
        const sketchContainer = document.getElementById('sketch-container');
        let canvasWidth, canvasHeight;
        
        if (p.windowWidth < 768) {
            canvasWidth = p.windowWidth - 40;
            canvasHeight = p.min(550, p.windowHeight - 200);
        } else {
            const container = sketchContainer ? sketchContainer.parentElement : demoContainer;
            canvasWidth = container ? p.min(container.offsetWidth - 40, 600) : 600;
            canvasHeight = 550;
        }
        
        p.resizeCanvas(canvasWidth, canvasHeight);
    };

    p.mousePressed = function() {
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
            generateNewSequences();
        }
    };

    function generateNewSequences() {
        diag_sequences = [];
        diag_constructedSequence = [];
        diag_currentStep = 0;
        diag_totalSteps = 0;
        diag_startingSequenceNumber = 1;
        diag_startingPositionNumber = 1;
        diag_animationState = 'building';
        diag_animationStartTime = 0;
        diag_highlightStartTime = 0;
        
        // Generate random binary sequences
        for (let i = 0; i < DIAG_NUM_SEQUENCES; i++) {
            diag_sequences.push([]);
        }
        
        // Initialize empty constructed sequence
        for (let i = 0; i < DIAG_SEQUENCE_LENGTH; i++) {
            diag_constructedSequence.push(-1); // -1 means empty
        }
    }

    // Get or generate a digit for a specific sequence and position
    function getSequenceDigit(sequenceIndex, absolutePosition) {
        // Ensure the sequence exists
        if (sequenceIndex >= diag_sequences.length) {
            return 0; // Fallback
        }
        
        // Convert absolute position to relative position within the cleaned sequence
        // The first digit in our sequence array corresponds to diag_startingPositionNumber
        let relativePosition = absolutePosition - (diag_startingPositionNumber - 1);
        
        // Generate digits up to the requested relative position if needed
        while (diag_sequences[sequenceIndex].length <= relativePosition) {
            diag_sequences[sequenceIndex].push(p.floor(p.random(2)));
        }
        
        return diag_sequences[sequenceIndex][relativePosition];
    }

    function shiftDiagonally() {
        // Update starting numbers for the diagonal shift
        diag_startingSequenceNumber += DIAG_SHIFT_AMOUNT;
        diag_startingPositionNumber += DIAG_SHIFT_AMOUNT;
        
        // Clean up digits that are no longer needed from remaining sequences
        // Remove digits to the left of our new starting position
        let digitsToRemove = DIAG_SHIFT_AMOUNT;
        for (let i = DIAG_SHIFT_AMOUNT; i < diag_sequences.length; i++) {
            if (diag_sequences[i].length > digitsToRemove) {
                diag_sequences[i].splice(0, digitsToRemove);
            }
        }
        
        // Remove the first DIAG_SHIFT_AMOUNT sequences
        diag_sequences.splice(0, DIAG_SHIFT_AMOUNT);
        
        // Add DIAG_SHIFT_AMOUNT new empty sequences at the end
        for (let i = 0; i < DIAG_SHIFT_AMOUNT; i++) {
            diag_sequences.push([]);
        }
        
        // Shift constructed sequence left
        diag_constructedSequence.splice(0, DIAG_SHIFT_AMOUNT);
        // Add empty slots for new positions
        for (let j = 0; j < DIAG_SHIFT_AMOUNT; j++) {
            diag_constructedSequence.push(-1);
        }
        
        // Reset diag_currentStep to 1 (since position 0 already has a value)
        diag_currentStep = 1;
    }

    function drawSequenceTable() {
        let startX = (p.width - DIAG_SEQUENCE_LENGTH * DIAG_CELL_SIZE) / 2;
        let startY = 80;
        
        // Calculate shift offset for smooth animation
        let shiftOffsetX = 0;
        let shiftOffsetY = 0;
        if (diag_animationState === 'shifting') {
            // Smooth easing for the shift
            let elapsed = p.millis() - diag_animationStartTime;
            let t = p.min(elapsed / DIAG_SHIFT_DURATION, 1.0);
            shiftOffsetX = DIAG_SHIFT_AMOUNT * DIAG_CELL_SIZE * easeInOutCubic(t);
            shiftOffsetY = DIAG_SHIFT_AMOUNT * DIAG_CELL_SIZE * easeInOutCubic(t);
        }
        
        // Draw row labels first (outside clipping region)
        for (let i = 0; i < DIAG_NUM_SEQUENCES; i++) {
            let labelY = startY + i * DIAG_CELL_SIZE + DIAG_CELL_SIZE/2 - shiftOffsetY;
            if (labelY >= startY - DIAG_CELL_SIZE && labelY <= startY + DIAG_NUM_SEQUENCES * DIAG_CELL_SIZE + DIAG_CELL_SIZE) {
                p.fill(getTextColor());
                p.textAlign(p.RIGHT, p.CENTER);
                p.textSize(14);
                p.text(`s${getSubscript(diag_startingSequenceNumber + i)}:`, startX - 10, labelY);
                
                // Draw ellipsis to indicate infinite sequence
                p.textAlign(p.LEFT, p.CENTER);
                p.text("...", startX + DIAG_SEQUENCE_LENGTH * DIAG_CELL_SIZE + 5, labelY);
            }
        }
        
        // Set clipping region to prevent drawing outside the table area
        p.push();
        p.drawingContext.save();
        p.drawingContext.beginPath();
        p.drawingContext.rect(startX, startY, DIAG_SEQUENCE_LENGTH * DIAG_CELL_SIZE, DIAG_NUM_SEQUENCES * DIAG_CELL_SIZE);
        p.drawingContext.clip();
        
        // Draw sequence rows
        for (let i = 0; i < DIAG_NUM_SEQUENCES; i++) {
            for (let j = 0; j < DIAG_SEQUENCE_LENGTH; j++) {
                let x = startX + j * DIAG_CELL_SIZE - shiftOffsetX;
                let y = startY + i * DIAG_CELL_SIZE - shiftOffsetY;
                
                // Skip cells that are off-screen to the left
                if (x + DIAG_CELL_SIZE < startX) continue;
                // Skip cells that are off-screen to the right
                if (x > startX + DIAG_SEQUENCE_LENGTH * DIAG_CELL_SIZE) continue;
                // Skip cells that are off-screen to the top
                if (y + DIAG_CELL_SIZE < startY) continue;
                // Skip cells that are off-screen to the bottom
                if (y > startY + DIAG_NUM_SEQUENCES * DIAG_CELL_SIZE) continue;
                
                // Highlight diagonal cell if currently being processed
                let actualPosition = diag_startingPositionNumber + j;
                let actualSequence = diag_startingSequenceNumber + i;
                let isHighlighting = diag_animationState === 'building' && 
                                    diag_highlightStartTime > 0 && 
                                    (p.millis() - diag_highlightStartTime) < DIAG_HIGHLIGHT_DURATION;
                
                // During shift, highlight the cell at (7,7) as it moves to (0,0)
                let isShiftHighlight = false;
                if (diag_animationState === 'shifting') {
                    // The cell that was at (7,7) is moving up and left
                    isShiftHighlight = i === DIAG_SHIFT_AMOUNT && j === DIAG_SHIFT_AMOUNT;
                } else if (diag_animationState === 'post-shift-pause') {
                    // After shift, highlight the new top-left cell
                    isShiftHighlight = i === 0 && j === 0;
                }
                
                if ((i === diag_currentStep && j === diag_currentStep && 
                    isHighlighting && actualPosition === actualSequence) ||
                    isShiftHighlight) {
                    p.fill(255, 255, 0); // Bright yellow highlight
                } else {
                    p.fill(getCellBackgroundColor());
                }
                
                p.stroke(getTextColor());
                p.strokeWeight(1);
                p.rect(x, y, DIAG_CELL_SIZE, DIAG_CELL_SIZE);
                
                // Draw the digit from the correct position in the sequence
                // Use dark text on highlighted cells for better contrast
                if ((i === diag_currentStep && j === diag_currentStep && 
                    isHighlighting && actualPosition === actualSequence) ||
                    isShiftHighlight) {
                    p.fill(0); // Always use black text on yellow highlight
                } else {
                    p.fill(getTextColor());
                }
                p.noStroke();
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(20);
                let digitIndex = diag_startingPositionNumber - 1 + j;
                let digit = getSequenceDigit(i, digitIndex);
                p.text(digit, x + DIAG_CELL_SIZE/2, y + DIAG_CELL_SIZE/2);
            }
        }
        
        // Restore clipping
        p.drawingContext.restore();
        p.pop();
        
        // Draw "⋮" to indicate infinitely many sequences
        p.fill(getTextColor());
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(20);
        p.text("⋮", p.width/2, startY + DIAG_NUM_SEQUENCES * DIAG_CELL_SIZE + 20);
    }

    function drawConstructedSequence() {
        let startX = (p.width - DIAG_SEQUENCE_LENGTH * DIAG_CELL_SIZE) / 2;
        let startY = 80 + DIAG_NUM_SEQUENCES * DIAG_CELL_SIZE + 80;
        
        // Calculate shift offset for smooth animation
        let shiftOffsetX = 0;
        if (diag_animationState === 'shifting') {
            let elapsed = p.millis() - diag_animationStartTime;
            let t = p.min(elapsed / DIAG_SHIFT_DURATION, 1.0);
            shiftOffsetX = DIAG_SHIFT_AMOUNT * DIAG_CELL_SIZE * easeInOutCubic(t);
        }
        
        // Draw label
        p.fill(getTextColor());
        p.noStroke();
        p.textAlign(p.RIGHT, p.CENTER);
        p.textSize(14);
        p.text("p:", startX - 10, startY + DIAG_CELL_SIZE/2);
        
        // Set clipping for constructed sequence
        p.push();
        p.drawingContext.save();
        p.drawingContext.beginPath();
        p.drawingContext.rect(startX, startY, DIAG_SEQUENCE_LENGTH * DIAG_CELL_SIZE, DIAG_CELL_SIZE);
        p.drawingContext.clip();
        
        // Draw constructed sequence cells
        for (let j = 0; j < DIAG_SEQUENCE_LENGTH; j++) {
            let x = startX + j * DIAG_CELL_SIZE - shiftOffsetX;
            let y = startY;
            
            // Skip cells that are off-screen to the left
            if (x + DIAG_CELL_SIZE < startX) continue;
            // Skip cells that are off-screen to the right
            if (x > startX + DIAG_SEQUENCE_LENGTH * DIAG_CELL_SIZE) continue;
            
            // Highlight current cell being filled
            let isHighlighting = diag_animationState === 'building' && 
                                diag_highlightStartTime > 0 && 
                                (p.millis() - diag_highlightStartTime) < DIAG_HIGHLIGHT_DURATION;
            
            // During shift and post-shift pause, highlight the appropriate cell
            let isShiftHighlight = false;
            if (diag_animationState === 'shifting') {
                // During shift, highlight the cell at position 7 as it moves to position 0
                isShiftHighlight = j === DIAG_SHIFT_AMOUNT;
            } else if (diag_animationState === 'post-shift-pause') {
                // After shift, highlight the first cell
                isShiftHighlight = j === 0;
            }
                                
            if ((j === diag_currentStep && isHighlighting) || isShiftHighlight) {
                p.fill(255, 255, 0); // Bright yellow highlight
            } else if (diag_constructedSequence[j] !== -1) {
                p.fill(getFilledCellColor()); // Light green for filled cells
            } else {
                p.fill(getCellBackgroundColor());
            }
            
            p.stroke(getTextColor());
            p.strokeWeight(1);
            p.rect(x, y, DIAG_CELL_SIZE, DIAG_CELL_SIZE);
            
            // Draw the digit if it exists
            if (diag_constructedSequence[j] !== -1) {
                // Use dark text on highlighted cells for better contrast
                if ((j === diag_currentStep && isHighlighting) || isShiftHighlight) {
                    p.fill(0); // Always use black text on yellow highlight
                } else {
                    p.fill(getTextColor());
                }
                p.noStroke();
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(20);
                p.text(diag_constructedSequence[j], x + DIAG_CELL_SIZE/2, y + DIAG_CELL_SIZE/2);
            }
        }
        
        // Restore clipping
        p.drawingContext.restore();
        p.pop();
        
        // Draw ellipsis to indicate infinite sequence
        p.fill(getTextColor());
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(14);
        p.text("...", startX + DIAG_SEQUENCE_LENGTH * DIAG_CELL_SIZE + 5, startY + DIAG_CELL_SIZE/2);
        
        // Draw position labels under the constructed sequence
        for (let j = 0; j < DIAG_SEQUENCE_LENGTH; j++) {
            let x = startX + j * DIAG_CELL_SIZE - shiftOffsetX;
            
            // Skip labels that are off-screen
            if (x + DIAG_CELL_SIZE < startX) continue;
            if (x > startX + DIAG_SEQUENCE_LENGTH * DIAG_CELL_SIZE) continue;
            
            p.fill(getTextColor());
            p.noStroke();
            p.textAlign(p.CENTER, p.TOP);
            p.textSize(11);
            p.text(diag_startingPositionNumber + j, x + DIAG_CELL_SIZE/2, startY + DIAG_CELL_SIZE + 5);
        }
    }

    function drawLabels() {
        let startY = 80 + DIAG_NUM_SEQUENCES * DIAG_CELL_SIZE + 80 + DIAG_CELL_SIZE + 30;
        
        p.fill(getTextColor());
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(12);
        
        if (diag_animationState === 'building' && diag_currentStep < DIAG_SEQUENCE_LENGTH) {
            let actualPosition = diag_startingPositionNumber + diag_currentStep;
            let actualSequence = diag_startingSequenceNumber + diag_currentStep;
            p.text(`Step ${diag_totalSteps + 1}: p${getSubscript(actualPosition)} = opposite of s${getSubscript(actualSequence)}[${actualPosition}]`, 
                 p.width/2, startY);
        } else if (diag_animationState === 'shifting') {
            p.text("Shifting diagonally to continue the infinite construction...", p.width/2, startY);
        } else if (diag_animationState === 'post-shift-pause') {
            p.text("Continuing along the diagonal with new sequences...", p.width/2, startY);
        }
        
        // Show total steps processed
        p.textSize(10);
        p.text(`Total positions processed: ${diag_totalSteps}`, p.width/2, startY + 25);
    }

    function handleAnimation() {
        let currentTime = p.millis();
        
        if (diag_animationState === 'building') {
            if (diag_currentStep < DIAG_SEQUENCE_LENGTH) {
                if (diag_highlightStartTime === 0) {
                    // Start highlighting
                    diag_highlightStartTime = currentTime;
                    
                    // Set the constructed digit to be opposite of diagonal element
                    let digitIndex = diag_startingPositionNumber - 1 + diag_currentStep;
                    let diagonalDigit = getSequenceDigit(diag_currentStep, digitIndex);
                    diag_constructedSequence[diag_currentStep] = 1 - diagonalDigit;
                    diag_totalSteps++;
                }
                
                // Check if highlight duration has passed
                if (currentTime - diag_highlightStartTime >= DIAG_HIGHLIGHT_DURATION) {
                    diag_currentStep++;
                    diag_highlightStartTime = 0;
                    
                    if (diag_currentStep >= DIAG_SEQUENCE_LENGTH) {
                        diag_animationState = 'shifting';
                        diag_animationStartTime = currentTime;
                    }
                }
            }
        } else if (diag_animationState === 'shifting') {
            // Check if shift duration has passed
            if (currentTime - diag_animationStartTime >= DIAG_SHIFT_DURATION) {
                // Perform the actual diagonal shift at the end of animation
                shiftDiagonally();
                diag_animationState = 'post-shift-pause';
                diag_animationStartTime = currentTime;
            }
        } else if (diag_animationState === 'post-shift-pause') {
            // Check if pause duration has passed
            if (currentTime - diag_animationStartTime >= DIAG_POST_SHIFT_PAUSE) {
                diag_animationState = 'building';
                diag_highlightStartTime = 0;
            }
        }
    }

    function getBackgroundColor() {
        // Check if we're in dark mode
        if (document.documentElement.getAttribute('data-theme') === 'dark' || 
            window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return p.color(15, 15, 15);
        }
        return p.color(255, 255, 255);
    }

    function getTextColor() {
        // Check if we're in dark mode
        if (document.documentElement.getAttribute('data-theme') === 'dark' || 
            window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return p.color(230, 230, 230);
        }
        return p.color(0, 0, 0);
    }

    function getCellBackgroundColor() {
        // Check if we're in dark mode
        if (document.documentElement.getAttribute('data-theme') === 'dark' || 
            window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return p.color(45, 45, 45); // Dark gray for cells
        }
        return p.color(250, 250, 250); // Light gray for cells
    }

    function getFilledCellColor() {
        // Check if we're in dark mode
        if (document.documentElement.getAttribute('data-theme') === 'dark' || 
            window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return p.color(0, 100, 0); // Dark green for filled cells
        }
        return p.color(200, 255, 200); // Light green for filled cells
    }

    function getSubscript(num) {
        const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
        return num.toString().split('').map(digit => subscripts[parseInt(digit)]).join('');
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
});