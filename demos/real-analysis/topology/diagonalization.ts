import p5 from 'p5';
import type { DemoConfig, DemoInstance } from '@framework/types';
import { P5DemoBase } from '@framework';

interface ConstructedSequence {
  digits: number[];
}

class DiagonalizationDemo extends P5DemoBase {
  // Configuration
  private readonly SEQUENCE_LENGTH = 8;
  private readonly NUM_SEQUENCES = 8;
  private readonly CELL_SIZE = 40;
  private readonly HIGHLIGHT_DURATION = 1000; // milliseconds
  private readonly SHIFT_DURATION = 1500; // milliseconds for shifting animation
  private readonly POST_SHIFT_PAUSE = 500; // milliseconds to pause after shift
  private readonly SHIFT_AMOUNT = 7; // How many positions to shift diagonally

  // State variables
  private sequences: number[][] = [];
  private constructedSequence: number[] = [];
  private currentStep = 0;
  private animationState: 'building' | 'shifting' | 'post-shift-pause' = 'building';
  private animationStartTime = 0;
  private highlightStartTime = 0;
  private totalSteps = 0;
  private startingSequenceNumber = 1;
  private startingPositionNumber = 1;

  // UI elements
  private infoDiv: HTMLElement;
  private bottomInfo: HTMLElement;
  private generateNewSequences!: () => void;

  protected getStylePrefix(): string {
    return 'diagonalization';
  }

  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config);
  }

  protected createSketch(p: p5): void {
    // Helper function for subscripts
    const getSubscript = (num: number): string => {
      const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
      return num.toString().split('').map(digit => subscripts[parseInt(digit)]).join('');
    };

    // Easing function for smooth animation
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    this.generateNewSequences = () => {
      this.sequences = [];
      this.constructedSequence = [];
      this.currentStep = 0;
      this.totalSteps = 0;
      this.startingSequenceNumber = 1;
      this.startingPositionNumber = 1;
      this.animationState = 'building';
      this.animationStartTime = 0;
      this.highlightStartTime = 0;
      
      // Generate empty sequences
      for (let i = 0; i < this.NUM_SEQUENCES; i++) {
        this.sequences.push([]);
      }
      
      // Initialize empty constructed sequence
      for (let i = 0; i < this.SEQUENCE_LENGTH; i++) {
        this.constructedSequence.push(-1); // -1 means empty
      }
    };

    // Get or generate a digit for a specific sequence and position
    const getSequenceDigit = (sequenceIndex: number, absolutePosition: number): number => {
      if (sequenceIndex >= this.sequences.length) {
        return 0; // Fallback
      }
      
      // Convert absolute position to relative position
      const relativePosition = absolutePosition - (this.startingPositionNumber - 1);
      
      // Generate digits up to the requested position if needed
      while (this.sequences[sequenceIndex].length <= relativePosition) {
        this.sequences[sequenceIndex].push(p.floor(p.random(2)));
      }
      
      return this.sequences[sequenceIndex][relativePosition];
    };

    const shiftDiagonally = () => {
      // Update starting numbers for the diagonal shift
      this.startingSequenceNumber += this.SHIFT_AMOUNT;
      this.startingPositionNumber += this.SHIFT_AMOUNT;
      
      // Clean up digits that are no longer needed
      const digitsToRemove = this.SHIFT_AMOUNT;
      for (let i = this.SHIFT_AMOUNT; i < this.sequences.length; i++) {
        if (this.sequences[i].length > digitsToRemove) {
          this.sequences[i].splice(0, digitsToRemove);
        }
      }
      
      // Remove the first SHIFT_AMOUNT sequences
      this.sequences.splice(0, this.SHIFT_AMOUNT);
      
      // Add SHIFT_AMOUNT new empty sequences at the end
      for (let i = 0; i < this.SHIFT_AMOUNT; i++) {
        this.sequences.push([]);
      }
      
      // Shift constructed sequence left
      this.constructedSequence.splice(0, this.SHIFT_AMOUNT);
      // Add empty slots for new positions
      for (let j = 0; j < this.SHIFT_AMOUNT; j++) {
        this.constructedSequence.push(-1);
      }
      
      // Reset currentStep to 1 (since position 0 already has a value)
      this.currentStep = 1;
    };

    p.setup = () => {
      // Create info section
      this.infoDiv = document.createElement('div');
      this.infoDiv.style.textAlign = 'center';
      this.infoDiv.innerHTML = `
        <h3>Cantor's Diagonalization Proof</h3>
        <p>This animation demonstrates how we construct a new binary sequence that differs from every sequence in our countable list, proving that the set of all binary sequences is uncountable.</p>
      `;
      this.containerEl!.insertBefore(this.infoDiv, this.containerEl!.firstChild);

      // Calculate height based on content
      // NUM_SEQUENCES = 8, CELL_SIZE = 40
      const contentHeight = 80 + // Top margin
                          this.NUM_SEQUENCES * this.CELL_SIZE + // 8 * 40 = 320 for sequence table
                          20 + // Ellipsis
                          80 + // Space between tables
                          this.CELL_SIZE + // 40 for constructed sequence
                          30 + // Position labels
                          50; // Bottom labels
      // Total: 80 + 320 + 20 + 80 + 40 + 30 + 50 = 620 pixels
      
      // Calculate proper aspect ratio (height/width)
      // For a typical width of 800px, aspect ratio would be 620/800 = 0.775
      const aspectRatio = 0.775;
      
      // Use responsive sizing with proper aspect ratio
      this.createResponsiveCanvas(p, aspectRatio);
      
      // Create controls
      this.createButton('Reset', () => this.generateNewSequences());

      this.bottomInfo = document.createElement('p');
      this.bottomInfo.innerHTML = '<strong>Key insight:</strong> The constructed sequence (bottom row) differs from sequence <em>n</em> in position <em>n</em>, ensuring it\'s not in our original list, even though our original list is countably infinite.';
      this.bottomInfo.style.textAlign = 'center';
      this.containerEl!.appendChild(this.bottomInfo);
      
      this.generateNewSequences();
    };

    p.draw = () => {
      p.background(this.colors.background);
      
      // Title
      p.fill(this.colors.text);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(16);
      const endPosition = this.startingPositionNumber + this.SEQUENCE_LENGTH - 1;
      p.text(`Binary Sequences (showing positions ${this.startingPositionNumber}-${endPosition} of infinite sequences)`, p.width/2, 30);
      
      // Draw the table of sequences
      drawSequenceTable(p);
      
      // Draw constructed sequence
      drawConstructedSequence(p);
      
      // Draw labels and indicators
      drawLabels(p);
      
      // Handle animation
      handleAnimation(p);
    };

    // Set up responsive resize
    const contentHeight = 30 + 80 + this.NUM_SEQUENCES * this.CELL_SIZE + 20 + 80 + this.CELL_SIZE + 30 + 50;
    const aspectRatio = contentHeight / 600;
    this.setupResponsiveResize(p, () => {
      p.resizeCanvas(p.width, contentHeight);
    });

    const drawSequenceTable = (p: p5) => {
      const startX = (p.width - this.SEQUENCE_LENGTH * this.CELL_SIZE) / 2;
      const startY = 80;
      
      // Calculate shift offset for smooth animation
      let shiftOffsetX = 0;
      let shiftOffsetY = 0;
      if (this.animationState === 'shifting') {
        const elapsed = p.millis() - this.animationStartTime;
        const t = p.min(elapsed / this.SHIFT_DURATION, 1.0);
        shiftOffsetX = this.SHIFT_AMOUNT * this.CELL_SIZE * easeInOutCubic(t);
        shiftOffsetY = this.SHIFT_AMOUNT * this.CELL_SIZE * easeInOutCubic(t);
      }
      
      // Draw row labels first
      for (let i = 0; i < this.NUM_SEQUENCES; i++) {
        const labelY = startY + i * this.CELL_SIZE + this.CELL_SIZE/2 - shiftOffsetY;
        if (labelY >= startY - this.CELL_SIZE && labelY <= startY + this.NUM_SEQUENCES * this.CELL_SIZE + this.CELL_SIZE) {
          p.fill(this.colors.text);
          p.textAlign(p.RIGHT, p.CENTER);
          p.textSize(14);
          p.text(`s${getSubscript(this.startingSequenceNumber + i)}:`, startX - 10, labelY);
          
          // Draw ellipsis to indicate infinite sequence
          p.textAlign(p.LEFT, p.CENTER);
          p.text("...", startX + this.SEQUENCE_LENGTH * this.CELL_SIZE + 5, labelY);
        }
      }
      
      // Set clipping region
      p.push();
      p.drawingContext.save();
      p.drawingContext.beginPath();
      p.drawingContext.rect(startX, startY, this.SEQUENCE_LENGTH * this.CELL_SIZE, this.NUM_SEQUENCES * this.CELL_SIZE);
      p.drawingContext.clip();
      
      // Draw sequence rows
      for (let i = 0; i < this.NUM_SEQUENCES; i++) {
        for (let j = 0; j < this.SEQUENCE_LENGTH; j++) {
          const x = startX + j * this.CELL_SIZE - shiftOffsetX;
          const y = startY + i * this.CELL_SIZE - shiftOffsetY;
          
          // Skip cells that are off-screen
          if (x + this.CELL_SIZE < startX || x > startX + this.SEQUENCE_LENGTH * this.CELL_SIZE) continue;
          if (y + this.CELL_SIZE < startY || y > startY + this.NUM_SEQUENCES * this.CELL_SIZE) continue;
          
          // Highlight logic
          const actualPosition = this.startingPositionNumber + j;
          const actualSequence = this.startingSequenceNumber + i;
          const isHighlighting = this.animationState === 'building' && 
                                this.highlightStartTime > 0 && 
                                (p.millis() - this.highlightStartTime) < this.HIGHLIGHT_DURATION;
          
          let isShiftHighlight = false;
          if (this.animationState === 'shifting') {
            isShiftHighlight = i === this.SHIFT_AMOUNT && j === this.SHIFT_AMOUNT;
          } else if (this.animationState === 'post-shift-pause') {
            isShiftHighlight = i === 0 && j === 0;
          }
          
          if ((i === this.currentStep && j === this.currentStep && 
              isHighlighting && actualPosition === actualSequence) ||
              isShiftHighlight) {
            // Use a bright version of accent color for highlighting
            const highlightColor = p.color(this.colors.accent.toString());
            p.colorMode(p.HSB);
            const h = p.hue(highlightColor);
            const s = p.saturation(highlightColor);
            p.fill(h, s * 0.8, 100); // Bright version of accent
            p.colorMode(p.RGB);
          } else {
            p.fill(this.colors.grid);
          }
          
          p.stroke(this.colors.stroke);
          p.strokeWeight(1);
          p.rect(x, y, this.CELL_SIZE, this.CELL_SIZE);
          
          // Draw the digit
          if ((i === this.currentStep && j === this.currentStep && 
              isHighlighting && actualPosition === actualSequence) ||
              isShiftHighlight) {
            p.fill(this.colors.background); // Use background color for text on highlight
          } else {
            p.fill(this.colors.text);
          }
          p.noStroke();
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(20);
          const digitIndex = this.startingPositionNumber - 1 + j;
          const digit = getSequenceDigit(i, digitIndex);
          p.text(digit, x + this.CELL_SIZE/2, y + this.CELL_SIZE/2);
        }
      }
      
      // Restore clipping
      p.drawingContext.restore();
      p.pop();
      
      // Draw "⋮" to indicate infinitely many sequences
      p.fill(this.colors.text);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(20);
      p.text("⋮", p.width/2, startY + this.NUM_SEQUENCES * this.CELL_SIZE + 20);
    };

    const drawConstructedSequence = (p: p5) => {
      const startX = (p.width - this.SEQUENCE_LENGTH * this.CELL_SIZE) / 2;
      const startY = 80 + this.NUM_SEQUENCES * this.CELL_SIZE + 80;
      
      // Calculate shift offset
      let shiftOffsetX = 0;
      if (this.animationState === 'shifting') {
        const elapsed = p.millis() - this.animationStartTime;
        const t = p.min(elapsed / this.SHIFT_DURATION, 1.0);
        shiftOffsetX = this.SHIFT_AMOUNT * this.CELL_SIZE * easeInOutCubic(t);
      }
      
      // Draw label
      p.fill(this.colors.text);
      p.noStroke();
      p.textAlign(p.RIGHT, p.CENTER);
      p.textSize(14);
      p.text("p:", startX - 10, startY + this.CELL_SIZE/2);
      
      // Set clipping
      p.push();
      p.drawingContext.save();
      p.drawingContext.beginPath();
      p.drawingContext.rect(startX, startY, this.SEQUENCE_LENGTH * this.CELL_SIZE, this.CELL_SIZE);
      p.drawingContext.clip();
      
      // Draw constructed sequence cells
      for (let j = 0; j < this.SEQUENCE_LENGTH; j++) {
        const x = startX + j * this.CELL_SIZE - shiftOffsetX;
        const y = startY;
        
        // Skip cells that are off-screen
        if (x + this.CELL_SIZE < startX || x > startX + this.SEQUENCE_LENGTH * this.CELL_SIZE) continue;
        
        // Highlight logic
        const isHighlighting = this.animationState === 'building' && 
                              this.highlightStartTime > 0 && 
                              (p.millis() - this.highlightStartTime) < this.HIGHLIGHT_DURATION;
        
        let isShiftHighlight = false;
        if (this.animationState === 'shifting') {
          isShiftHighlight = j === this.SHIFT_AMOUNT;
        } else if (this.animationState === 'post-shift-pause') {
          isShiftHighlight = j === 0;
        }
        
        if ((j === this.currentStep && isHighlighting) || isShiftHighlight) {
          // Use a bright version of accent color for highlighting
          const highlightColor = p.color(this.colors.accent.toString());
          p.colorMode(p.HSB);
          const h = p.hue(highlightColor);
          const s = p.saturation(highlightColor);
          p.fill(h, s * 0.8, 100); // Bright version of accent
          p.colorMode(p.RGB);
        } else if (this.constructedSequence[j] !== -1) {
          // Use a complementary color for filled cells
          const accentColor = p.color(this.colors.accent.toString());
          p.colorMode(p.HSB);
          const h = p.hue(accentColor);
          const s = p.saturation(accentColor) * 0.7;
          const b = p.brightness(accentColor) * 0.8;
          p.fill((h + 120) % 360, s, b); // Complementary color
          p.colorMode(p.RGB);
        } else {
          p.fill(this.colors.grid);
        }
        
        p.stroke(this.colors.stroke);
        p.strokeWeight(1);
        p.rect(x, y, this.CELL_SIZE, this.CELL_SIZE);
        
        // Draw the digit if it exists
        if (this.constructedSequence[j] !== -1) {
          if ((j === this.currentStep && isHighlighting) || isShiftHighlight) {
            p.fill(this.colors.background); // Use background color for text on highlight
          } else {
            p.fill(this.colors.text);
          }
          p.noStroke();
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(20);
          p.text(this.constructedSequence[j], x + this.CELL_SIZE/2, y + this.CELL_SIZE/2);
        }
      }
      
      // Restore clipping
      p.drawingContext.restore();
      p.pop();
      
      // Draw ellipsis
      p.fill(this.colors.text);
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(14);
      p.text("...", startX + this.SEQUENCE_LENGTH * this.CELL_SIZE + 5, startY + this.CELL_SIZE/2);
      
      // Draw position labels
      for (let j = 0; j < this.SEQUENCE_LENGTH; j++) {
        const x = startX + j * this.CELL_SIZE - shiftOffsetX;
        
        // Skip labels that are off-screen
        if (x + this.CELL_SIZE < startX || x > startX + this.SEQUENCE_LENGTH * this.CELL_SIZE) continue;
        
        p.fill(this.colors.text);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(11);
        p.text(this.startingPositionNumber + j, x + this.CELL_SIZE/2, startY + this.CELL_SIZE + 5);
      }
    };

    const drawLabels = (p: p5) => {
      const startY = 80 + this.NUM_SEQUENCES * this.CELL_SIZE + 80 + this.CELL_SIZE + 30;
      
      p.fill(this.colors.text);
      p.textAlign(p.CENTER, p.TOP);
      p.textSize(12);
      
      if (this.animationState === 'building' && this.currentStep < this.SEQUENCE_LENGTH) {
        const actualPosition = this.startingPositionNumber + this.currentStep;
        const actualSequence = this.startingSequenceNumber + this.currentStep;
        p.text(`Step ${this.totalSteps + 1}: p${getSubscript(actualPosition)} = opposite of s${getSubscript(actualSequence)}[${actualPosition}]`, 
             p.width/2, startY);
      } else if (this.animationState === 'shifting') {
        p.text("Shifting diagonally to continue the infinite construction...", p.width/2, startY);
      } else if (this.animationState === 'post-shift-pause') {
        p.text("Continuing along the diagonal with new sequences...", p.width/2, startY);
      }
      
      // Show total steps processed
      p.textSize(10);
      p.text(`Total positions processed: ${this.totalSteps}`, p.width/2, startY + 25);
    };

    const handleAnimation = (p: p5) => {
      const currentTime = p.millis();
      
      if (this.animationState === 'building') {
        if (this.currentStep < this.SEQUENCE_LENGTH) {
          if (this.highlightStartTime === 0) {
            // Start highlighting
            this.highlightStartTime = currentTime;
            
            // Set the constructed digit to be opposite of diagonal element
            const digitIndex = this.startingPositionNumber - 1 + this.currentStep;
            const diagonalDigit = getSequenceDigit(this.currentStep, digitIndex);
            this.constructedSequence[this.currentStep] = 1 - diagonalDigit;
            this.totalSteps++;
          }
          
          // Check if highlight duration has passed
          if (currentTime - this.highlightStartTime >= this.HIGHLIGHT_DURATION) {
            this.currentStep++;
            this.highlightStartTime = 0;
            
            if (this.currentStep >= this.SEQUENCE_LENGTH) {
              this.animationState = 'shifting';
              this.animationStartTime = currentTime;
            }
          }
        }
      } else if (this.animationState === 'shifting') {
        // Check if shift duration has passed
        if (currentTime - this.animationStartTime >= this.SHIFT_DURATION) {
          // Perform the actual diagonal shift
          shiftDiagonally();
          this.animationState = 'post-shift-pause';
          this.animationStartTime = currentTime;
        }
      } else if (this.animationState === 'post-shift-pause') {
        // Check if pause duration has passed
        if (currentTime - this.animationStartTime >= this.POST_SHIFT_PAUSE) {
          this.animationState = 'building';
          this.highlightStartTime = 0;
        }
      }
    };

    // Color scheme changes are now handled by base class
  }
}

export const metadata = {
  title: "Cantor's Diagonalization",
  category: 'Real Analysis',
  description: "Interactive demonstration of Cantor's diagonal argument proving the uncountability of real numbers"
};

export default function createDiagonalizationDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new DiagonalizationDemo(container, config);
  return demo.init();
}