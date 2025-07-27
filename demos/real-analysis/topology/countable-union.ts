// Countable Union Demo - Shows diagonal traversal of countable union
import p5 from 'p5';
import type { DemoInstance, DemoConfig, CanvasSize, DemoMetadata } from '@framework/types';
import { P5DemoBase } from '@framework';

class CountableUnionDemo extends P5DemoBase {
  // Configuration
  private readonly gridSize = 10; // Grid dimensions (10x10)
  private cellSize!: number;
  private readonly margin = 60;
  private traversalPath: Array<{n: number, m: number, isDiagonalStart: boolean}> = [];
  private currentIndex = 0;
  private animationProgress = 0;
  private readonly animationSpeed = 0.03;
  private linePoints: Array<{x: number, y: number, isDiagonalStart: boolean}> = [];
  
  protected getStylePrefix(): string {
    return 'countable-union';
  }
  
  protected getAspectRatio(): number {
    return 1.0; // Square aspect ratio
  }
  
  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
    
    // Generate diagonal traversal path
    this.generateTraversalPath();
  }

  // Generate diagonal traversal path
  private generateTraversalPath(): void {
    this.traversalPath = [];
    
    // Generate diagonal traversal order
    // Stop after completing the diagonal that starts at E_10,1
    // This happens when sum = 11 (row 10 + col 1 = 11)
    for (let sum = 2; sum <= 11; sum++) {
      // Each diagonal has elements where row + col = sum
      // We traverse from bottom to top (increasing column, decreasing row)
      let diagonalStart = true;
      
      for (let col = 1; col < sum; col++) {
        const row = sum - col;
        
        if (row >= 1 && row <= this.gridSize && col >= 1 && col <= this.gridSize) {
          this.traversalPath.push({
            n: row - 1, // Convert to 0-indexed (row)
            m: col - 1, // Convert to 0-indexed (col)
            isDiagonalStart: diagonalStart
          });
          diagonalStart = false;
        }
      }
    }
  }

  protected createSketch(p: p5): void {
    p.setup = () => {
      
      this.cellSize = (p.width - 2 * this.margin) / this.gridSize;
      
      p.textAlign(p.CENTER, p.CENTER);
      p.strokeWeight(2);
    };

    p.draw = () => {
      p.background(this.colors.background);
      
      // Draw grid
      this.drawGrid(p);
      
      // Draw axis labels and indicators
      this.drawLabels(p);
      
      // Animate traversal line
      this.drawTraversalLine(p);
      
      // Update animation
      this.updateAnimation();
    };

  }
  
  // Override base class method to customize colors if needed
  protected updateColors(p: p5): void {
    super.updateColors(p);
  }

  private drawGrid(p: p5): void {
    for (let n = 0; n < this.gridSize; n++) {
      for (let m = 0; m < this.gridSize; m++) {
        const x = this.margin + m * this.cellSize + this.cellSize / 2;
        const y = this.margin + n * this.cellSize + this.cellSize / 2;
        
        // Draw cell
        p.noFill();
        p.stroke(this.colors.stroke);
        p.strokeWeight(1);
        p.rect(x - this.cellSize/2, y - this.cellSize/2, this.cellSize, this.cellSize);
        
        // Draw label with subscripts
        p.fill(this.colors.text);
        p.noStroke();
        p.textSize(this.cellSize * 0.3);
        this.drawSubscriptText(p, 'E', n + 1, m + 1, x, y);
      }
    }
    
    // Draw ellipsis to indicate infinite continuation
    p.textSize(20);
    p.fill(this.colors.text);
    p.noStroke();
    
    // Right edge ellipsis
    p.text('...', this.margin + this.gridSize * this.cellSize + this.cellSize/2, p.height / 2);
    
    // Bottom edge ellipsis
    p.text('...', p.width / 2, this.margin + this.gridSize * this.cellSize + this.cellSize/2);
    
    // Bottom-right corner ellipsis
    p.text('...', this.margin + this.gridSize * this.cellSize + this.cellSize/2, this.margin + this.gridSize * this.cellSize + this.cellSize/2);
  }

  private drawLabels(p: p5): void {
    p.textSize(16);
    p.fill(this.colors.text);
    p.noStroke();
    
    // Set label (vertical)
    p.push();
    p.translate(this.margin / 2, p.height / 2);
    p.rotate(-p.PI / 2);
    p.text('Set number (n)', 0, 0);
    p.pop();
    
    // Element label (horizontal)
    p.text('Element index (m)', p.width / 2, p.height - this.margin / 2);
    
    // Add infinity symbols
    p.textSize(14);
    p.text('→ ∞', this.margin + this.gridSize * this.cellSize + this.cellSize, p.height - this.margin / 2);
    p.text('↓ ∞', this.margin / 2, this.margin + this.gridSize * this.cellSize + this.cellSize);
  }

  private drawSubscriptText(p: p5, base: string, sub1: number, sub2: number, x: number, y: number): void {
    const baseSize = this.cellSize * 0.5;
    const subSize = baseSize * 0.5;
    
    p.textSize(baseSize);
    
    // Draw base
    p.text(base, x - this.cellSize * 0.2, y - this.cellSize * 0.1);
    
    // Draw subscripts
    p.textSize(subSize);
    p.text(sub1 + ',' + sub2, x + this.cellSize * 0.12, y + this.cellSize * 0.12);
  }

  private drawTraversalLine(p: p5): void {
    p.noFill();
    
    // Use theme-appropriate highlight color
    p.stroke(this.colors.accent);
    p.strokeWeight(3);
    
    // Draw completed path segments
    for (let i = 1; i < this.linePoints.length; i++) {
      const prev = this.linePoints[i - 1];
      const curr = this.linePoints[i];
      
      // Check if this is a diagonal transition
      if (curr.isDiagonalStart && i > 0) {
        // Draw dashed line for diagonal transitions
        p.drawingContext.setLineDash([5, 5]);
      } else {
        // Solid line within diagonals
        p.drawingContext.setLineDash([]);
      }
      
      p.line(prev.x, prev.y, curr.x, curr.y);
    }
    
    // Reset to solid line
    p.drawingContext.setLineDash([]);
    
    // Draw animated segment
    if (this.currentIndex > 0 && this.currentIndex < this.traversalPath.length) {
      const prev = this.traversalPath[this.currentIndex - 1];
      const curr = this.traversalPath[this.currentIndex];
      
      const x1 = this.margin + prev.m * this.cellSize + this.cellSize / 2;
      const y1 = this.margin + prev.n * this.cellSize + this.cellSize / 2;
      const x2 = this.margin + curr.m * this.cellSize + this.cellSize / 2;
      const y2 = this.margin + curr.n * this.cellSize + this.cellSize / 2;
      
      // Use dashed line if transitioning to new diagonal
      if (curr.isDiagonalStart) {
        p.drawingContext.setLineDash([5, 5]);
      } else {
        p.drawingContext.setLineDash([]);
      }
      
      const x = p.lerp(x1, x2, this.animationProgress);
      const y = p.lerp(y1, y2, this.animationProgress);
      
      if (this.linePoints.length > 0) {
        p.line(this.linePoints[this.linePoints.length - 1].x, this.linePoints[this.linePoints.length - 1].y, x, y);
      }
    }
    
    // Reset dash
    p.drawingContext.setLineDash([]);
    
    // Highlight current element
    if (this.currentIndex < this.traversalPath.length) {
      const curr = this.traversalPath[this.currentIndex];
      const x = this.margin + curr.m * this.cellSize + this.cellSize / 2;
      const y = this.margin + curr.n * this.cellSize + this.cellSize / 2;
      
      // Use theme-appropriate highlight color
      p.fill(this.colors.accent);
      p.noStroke();
      p.circle(x, y, this.cellSize * 0.3);
      
      // Show current element number
      p.fill(this.colors.background);
      p.textSize(this.cellSize * 0.3);
      p.text(this.currentIndex + 1, x, y);
    }
  }

  private updateAnimation(): void {
    this.animationProgress += this.animationSpeed;
    if (this.animationProgress >= 1) {
      this.animationProgress = 0;
      this.currentIndex = (this.currentIndex + 1) % this.traversalPath.length;
      
      // Add current point to line history
      if (this.currentIndex > 0) {
        const curr = this.traversalPath[this.currentIndex - 1];
        const x = this.margin + curr.m * this.cellSize + this.cellSize / 2;
        const y = this.margin + curr.n * this.cellSize + this.cellSize / 2;
        this.linePoints.push({
          x: x, 
          y: y,
          isDiagonalStart: curr.isDiagonalStart
        });
        
        // Keep only recent points for performance
        if (this.linePoints.length > this.traversalPath.length) {
          this.linePoints.shift();
        }
      }
      
      // Reset when complete
      if (this.currentIndex === 0) {
        this.linePoints = [];
      }
    }
  }

  protected onResize(p: p5, _size: CanvasSize): void {
    this.cellSize = (p.width - 2 * this.margin) / this.gridSize;
  }
}

export const metadata: DemoMetadata = {
  title: 'Countable Union',
  category: 'Real Analysis',
  description: 'Visualization of the diagonal argument proving that countable unions of countable sets are countable',
  instructions: `<p>This animation shows how elements from countably many countable sets (E<sub>n</sub>) 
    can be enumerated using diagonal traversal, proving that a countable union of countable sets is countable.</p>`
};

export default function initCountableUnionDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new CountableUnionDemo(container, config);
  return demo.init();
}
