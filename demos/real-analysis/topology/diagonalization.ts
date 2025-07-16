// Cantor's Diagonalization Demo
import p5 from 'p5';
import type { DemoConfig, DemoInstance } from '@framework/types';

export default function createDiagonalizationDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  let sketch: p5 | null = null;

  // Configuration
  const SEQUENCE_LENGTH = 8;
  const NUM_SEQUENCES = 8;
  const CELL_SIZE = 40;
  const HIGHLIGHT_DURATION = 1000; // milliseconds
  const SHIFT_DURATION = 1500; // milliseconds for shifting animation
  const POST_SHIFT_PAUSE = 500; // milliseconds to pause after shift
  const SHIFT_AMOUNT = 7; // How many positions to shift diagonally

  // State variables
  let sequences: number[][] = [];
  let constructedSequence: number[] = [];
  let currentStep = 0;
  let animationState: 'building' | 'shifting' | 'post-shift-pause' = 'building';
  let animationStartTime = 0;
  let highlightStartTime = 0;
  let totalSteps = 0;
  let startingSequenceNumber = 1;
  let startingPositionNumber = 1;

  // Dark mode detection helper
  const isDarkMode = () => config?.darkMode ?? false;

  // Color helpers
  const getBackgroundColor = (p: p5) => isDarkMode() ? p.color(15, 15, 15) : p.color(255, 255, 255);
  const getTextColor = (p: p5) => isDarkMode() ? p.color(230, 230, 230) : p.color(0, 0, 0);
  const getCellBackgroundColor = (p: p5) => isDarkMode() ? p.color(45, 45, 45) : p.color(250, 250, 250);
  const getFilledCellColor = (p: p5) => isDarkMode() ? p.color(0, 100, 0) : p.color(200, 255, 200);

  // Helper function for subscripts
  const getSubscript = (num: number): string => {
    const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    return num.toString().split('').map(digit => subscripts[parseInt(digit)]).join('');
  };

  // Easing function for smooth animation
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const createSketch = (p: p5) => {
    const generateNewSequences = () => {
      sequences = [];
      constructedSequence = [];
      currentStep = 0;
      totalSteps = 0;
      startingSequenceNumber = 1;
      startingPositionNumber = 1;
      animationState = 'building';
      animationStartTime = 0;
      highlightStartTime = 0;
      
      // Generate empty sequences
      for (let i = 0; i < NUM_SEQUENCES; i++) {
        sequences.push([]);
      }
      
      // Initialize empty constructed sequence
      for (let i = 0; i < SEQUENCE_LENGTH; i++) {
        constructedSequence.push(-1); // -1 means empty
      }
    };

    // Get or generate a digit for a specific sequence and position
    const getSequenceDigit = (sequenceIndex: number, absolutePosition: number): number => {
      if (sequenceIndex >= sequences.length) {
        return 0; // Fallback
      }
      
      // Convert absolute position to relative position
      const relativePosition = absolutePosition - (startingPositionNumber - 1);
      
      // Generate digits up to the requested position if needed
      while (sequences[sequenceIndex].length <= relativePosition) {
        sequences[sequenceIndex].push(p.floor(p.random(2)));
      }
      
      return sequences[sequenceIndex][relativePosition];
    };

    const shiftDiagonally = () => {
      // Update starting numbers for the diagonal shift
      startingSequenceNumber += SHIFT_AMOUNT;
      startingPositionNumber += SHIFT_AMOUNT;
      
      // Clean up digits that are no longer needed
      const digitsToRemove = SHIFT_AMOUNT;
      for (let i = SHIFT_AMOUNT; i < sequences.length; i++) {
        if (sequences[i].length > digitsToRemove) {
          sequences[i].splice(0, digitsToRemove);
        }
      }
      
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
    };

    p.setup = () => {
      // Responsive sizing
      let canvasWidth: number, canvasHeight: number;
      
      if (p.windowWidth < 768) {
        canvasWidth = p.windowWidth - 40;
        canvasHeight = p.min(550, p.windowHeight - 200);
      } else {
        canvasWidth = config?.width || container.offsetWidth - 40 || 600;
        canvasHeight = config?.height || 550;
      }
      
      const canvas = p.createCanvas(canvasWidth, canvasHeight);
      canvas.parent(container);
      
      generateNewSequences();
    };

    p.draw = () => {
      p.background(getBackgroundColor(p));
      
      // Title
      p.fill(getTextColor(p));
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(16);
      const endPosition = startingPositionNumber + SEQUENCE_LENGTH - 1;
      p.text(`Binary Sequences (showing positions ${startingPositionNumber}-${endPosition} of infinite sequences)`, p.width/2, 30);
      
      // Draw the table of sequences
      drawSequenceTable(p);
      
      // Draw constructed sequence
      drawConstructedSequence(p);
      
      // Draw labels and indicators
      drawLabels(p);
      
      // Handle animation
      handleAnimation(p);
    };

    p.windowResized = () => {
      // Only respond to window resize if no fixed dimensions
      if (config?.width && config?.height) return;
      
      // Responsive sizing
      let canvasWidth: number, canvasHeight: number;
      
      if (p.windowWidth < 768) {
        canvasWidth = p.windowWidth - 40;
        canvasHeight = p.min(550, p.windowHeight - 200);
      } else {
        canvasWidth = container.offsetWidth - 40 || 600;
        canvasHeight = 550;
      }
      
      p.resizeCanvas(canvasWidth, canvasHeight);
    };

    p.mousePressed = () => {
      if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
        generateNewSequences();
      }
    };

    const drawSequenceTable = (p: p5) => {
      const startX = (p.width - SEQUENCE_LENGTH * CELL_SIZE) / 2;
      const startY = 80;
      
      // Calculate shift offset for smooth animation
      let shiftOffsetX = 0;
      let shiftOffsetY = 0;
      if (animationState === 'shifting') {
        const elapsed = p.millis() - animationStartTime;
        const t = p.min(elapsed / SHIFT_DURATION, 1.0);
        shiftOffsetX = SHIFT_AMOUNT * CELL_SIZE * easeInOutCubic(t);
        shiftOffsetY = SHIFT_AMOUNT * CELL_SIZE * easeInOutCubic(t);
      }
      
      // Draw row labels first
      for (let i = 0; i < NUM_SEQUENCES; i++) {
        const labelY = startY + i * CELL_SIZE + CELL_SIZE/2 - shiftOffsetY;
        if (labelY >= startY - CELL_SIZE && labelY <= startY + NUM_SEQUENCES * CELL_SIZE + CELL_SIZE) {
          p.fill(getTextColor(p));
          p.textAlign(p.RIGHT, p.CENTER);
          p.textSize(14);
          p.text(`s${getSubscript(startingSequenceNumber + i)}:`, startX - 10, labelY);
          
          // Draw ellipsis to indicate infinite sequence
          p.textAlign(p.LEFT, p.CENTER);
          p.text("...", startX + SEQUENCE_LENGTH * CELL_SIZE + 5, labelY);
        }
      }
      
      // Set clipping region
      p.push();
      p.drawingContext.save();
      p.drawingContext.beginPath();
      p.drawingContext.rect(startX, startY, SEQUENCE_LENGTH * CELL_SIZE, NUM_SEQUENCES * CELL_SIZE);
      p.drawingContext.clip();
      
      // Draw sequence rows
      for (let i = 0; i < NUM_SEQUENCES; i++) {
        for (let j = 0; j < SEQUENCE_LENGTH; j++) {
          const x = startX + j * CELL_SIZE - shiftOffsetX;
          const y = startY + i * CELL_SIZE - shiftOffsetY;
          
          // Skip cells that are off-screen
          if (x + CELL_SIZE < startX || x > startX + SEQUENCE_LENGTH * CELL_SIZE) continue;
          if (y + CELL_SIZE < startY || y > startY + NUM_SEQUENCES * CELL_SIZE) continue;
          
          // Highlight logic
          const actualPosition = startingPositionNumber + j;
          const actualSequence = startingSequenceNumber + i;
          const isHighlighting = animationState === 'building' && 
                                highlightStartTime > 0 && 
                                (p.millis() - highlightStartTime) < HIGHLIGHT_DURATION;
          
          let isShiftHighlight = false;
          if (animationState === 'shifting') {
            isShiftHighlight = i === SHIFT_AMOUNT && j === SHIFT_AMOUNT;
          } else if (animationState === 'post-shift-pause') {
            isShiftHighlight = i === 0 && j === 0;
          }
          
          if ((i === currentStep && j === currentStep && 
              isHighlighting && actualPosition === actualSequence) ||
              isShiftHighlight) {
            p.fill(255, 255, 0); // Bright yellow highlight
          } else {
            p.fill(getCellBackgroundColor(p));
          }
          
          p.stroke(getTextColor(p));
          p.strokeWeight(1);
          p.rect(x, y, CELL_SIZE, CELL_SIZE);
          
          // Draw the digit
          if ((i === currentStep && j === currentStep && 
              isHighlighting && actualPosition === actualSequence) ||
              isShiftHighlight) {
            p.fill(0); // Black text on yellow
          } else {
            p.fill(getTextColor(p));
          }
          p.noStroke();
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(20);
          const digitIndex = startingPositionNumber - 1 + j;
          const digit = getSequenceDigit(i, digitIndex);
          p.text(digit, x + CELL_SIZE/2, y + CELL_SIZE/2);
        }
      }
      
      // Restore clipping
      p.drawingContext.restore();
      p.pop();
      
      // Draw "⋮" to indicate infinitely many sequences
      p.fill(getTextColor(p));
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(20);
      p.text("⋮", p.width/2, startY + NUM_SEQUENCES * CELL_SIZE + 20);
    };

    const drawConstructedSequence = (p: p5) => {
      const startX = (p.width - SEQUENCE_LENGTH * CELL_SIZE) / 2;
      const startY = 80 + NUM_SEQUENCES * CELL_SIZE + 80;
      
      // Calculate shift offset
      let shiftOffsetX = 0;
      if (animationState === 'shifting') {
        const elapsed = p.millis() - animationStartTime;
        const t = p.min(elapsed / SHIFT_DURATION, 1.0);
        shiftOffsetX = SHIFT_AMOUNT * CELL_SIZE * easeInOutCubic(t);
      }
      
      // Draw label
      p.fill(getTextColor(p));
      p.noStroke();
      p.textAlign(p.RIGHT, p.CENTER);
      p.textSize(14);
      p.text("p:", startX - 10, startY + CELL_SIZE/2);
      
      // Set clipping
      p.push();
      p.drawingContext.save();
      p.drawingContext.beginPath();
      p.drawingContext.rect(startX, startY, SEQUENCE_LENGTH * CELL_SIZE, CELL_SIZE);
      p.drawingContext.clip();
      
      // Draw constructed sequence cells
      for (let j = 0; j < SEQUENCE_LENGTH; j++) {
        const x = startX + j * CELL_SIZE - shiftOffsetX;
        const y = startY;
        
        // Skip cells that are off-screen
        if (x + CELL_SIZE < startX || x > startX + SEQUENCE_LENGTH * CELL_SIZE) continue;
        
        // Highlight logic
        const isHighlighting = animationState === 'building' && 
                              highlightStartTime > 0 && 
                              (p.millis() - highlightStartTime) < HIGHLIGHT_DURATION;
        
        let isShiftHighlight = false;
        if (animationState === 'shifting') {
          isShiftHighlight = j === SHIFT_AMOUNT;
        } else if (animationState === 'post-shift-pause') {
          isShiftHighlight = j === 0;
        }
        
        if ((j === currentStep && isHighlighting) || isShiftHighlight) {
          p.fill(255, 255, 0); // Bright yellow highlight
        } else if (constructedSequence[j] !== -1) {
          p.fill(getFilledCellColor(p)); // Light green for filled cells
        } else {
          p.fill(getCellBackgroundColor(p));
        }
        
        p.stroke(getTextColor(p));
        p.strokeWeight(1);
        p.rect(x, y, CELL_SIZE, CELL_SIZE);
        
        // Draw the digit if it exists
        if (constructedSequence[j] !== -1) {
          if ((j === currentStep && isHighlighting) || isShiftHighlight) {
            p.fill(0); // Black text on yellow
          } else {
            p.fill(getTextColor(p));
          }
          p.noStroke();
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(20);
          p.text(constructedSequence[j], x + CELL_SIZE/2, y + CELL_SIZE/2);
        }
      }
      
      // Restore clipping
      p.drawingContext.restore();
      p.pop();
      
      // Draw ellipsis
      p.fill(getTextColor(p));
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(14);
      p.text("...", startX + SEQUENCE_LENGTH * CELL_SIZE + 5, startY + CELL_SIZE/2);
      
      // Draw position labels
      for (let j = 0; j < SEQUENCE_LENGTH; j++) {
        const x = startX + j * CELL_SIZE - shiftOffsetX;
        
        // Skip labels that are off-screen
        if (x + CELL_SIZE < startX || x > startX + SEQUENCE_LENGTH * CELL_SIZE) continue;
        
        p.fill(getTextColor(p));
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(11);
        p.text(startingPositionNumber + j, x + CELL_SIZE/2, startY + CELL_SIZE + 5);
      }
    };

    const drawLabels = (p: p5) => {
      const startY = 80 + NUM_SEQUENCES * CELL_SIZE + 80 + CELL_SIZE + 30;
      
      p.fill(getTextColor(p));
      p.textAlign(p.CENTER, p.TOP);
      p.textSize(12);
      
      if (animationState === 'building' && currentStep < SEQUENCE_LENGTH) {
        const actualPosition = startingPositionNumber + currentStep;
        const actualSequence = startingSequenceNumber + currentStep;
        p.text(`Step ${totalSteps + 1}: p${getSubscript(actualPosition)} = opposite of s${getSubscript(actualSequence)}[${actualPosition}]`, 
             p.width/2, startY);
      } else if (animationState === 'shifting') {
        p.text("Shifting diagonally to continue the infinite construction...", p.width/2, startY);
      } else if (animationState === 'post-shift-pause') {
        p.text("Continuing along the diagonal with new sequences...", p.width/2, startY);
      }
      
      // Show total steps processed
      p.textSize(10);
      p.text(`Total positions processed: ${totalSteps}`, p.width/2, startY + 25);
    };

    const handleAnimation = (p: p5) => {
      const currentTime = p.millis();
      
      if (animationState === 'building') {
        if (currentStep < SEQUENCE_LENGTH) {
          if (highlightStartTime === 0) {
            // Start highlighting
            highlightStartTime = currentTime;
            
            // Set the constructed digit to be opposite of diagonal element
            const digitIndex = startingPositionNumber - 1 + currentStep;
            const diagonalDigit = getSequenceDigit(currentStep, digitIndex);
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
          // Perform the actual diagonal shift
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
    };
  };

  // Create container structure
  const infoDiv = document.createElement('div');
  infoDiv.style.textAlign = 'center';
  infoDiv.innerHTML = `
    <h3>Cantor's Diagonalization Proof</h3>
    <p>This animation demonstrates how we construct a new binary sequence that differs from every sequence in our countable list, proving that the set of all binary sequences is uncountable.</p>
  `;
  container.appendChild(infoDiv);

  const sketchContainer = document.createElement('div');
  sketchContainer.id = `diagonalization-sketch-${Date.now()}`;
  container.appendChild(sketchContainer);

  const bottomInfo = document.createElement('p');
  bottomInfo.innerHTML = '<strong>Key insight:</strong> The constructed sequence (bottom row) differs from sequence <em>n</em> in position <em>n</em>, ensuring it\'s not in our original list, even though our original list is countably infinite.';
  bottomInfo.style.textAlign = 'center';
  container.appendChild(bottomInfo);

  // Create and start sketch
  sketch = new p5(createSketch, sketchContainer);

  return {
    cleanup: () => {
      if (sketch) {
        sketch.remove();
        sketch = null;
      }
      container.innerHTML = '';
    },
    resize: () => {
      if (sketch && sketch.windowResized) {
        sketch.windowResized();
      }
    }
  };
}