// Countable Tuples Demo - Shows B_n sets are countable for any n
import p5 from 'p5';
import type { DemoConfig, DemoInstance, CanvasSize, DemoMetadata } from '@framework/types';
import { P5DemoBase } from '@framework';

class CountableTuplesDemo extends P5DemoBase {

  // Configuration Constants
  private readonly CONFIG = {
    // Animation timing
    STEP_DURATION: 2000,      // Time between columns appearing (ms)
    END_PAUSE: 2000,          // Pause at end before restarting (ms)
    
    // Layout  
    COLUMN_SPACING: 120,      // Horizontal spacing between columns
    START_X: 60,              // Starting x position for first column
    TOTAL_COLUMNS: 6,         // Total B_n sets to show (B_0 through B_5)
    
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

  // Instance variables
  private canvasWidth!: number;
  private canvasHeight!: number; 
  private centerY!: number;
  private animationStartTime!: number;
  private maxVisibleColumns = 4;
  // Animation state
  
  // Performance optimization: cache generated tuples
  private cachedTuples = new Map<string, number[][]>();
  
  protected getStylePrefix(): string {
    return 'countable-tuples';
  }
  
  protected getAspectRatio(): number {
    return 0.66; // Default aspect ratio
  }
  
  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
  }

  // Unicode helpers
  private getSuperscriptUnicode(n: number): string {
    const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
    return n.toString().split('').map(d => superscripts[parseInt(d)]).join('');
  }

  private getSubscriptUnicode(n: number): string {
    const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    return n.toString().split('').map(d => subscripts[parseInt(d)]).join('');
  }

  protected createSketch(p: p5): void {
    p.setup = () => {
      this.canvasWidth = p.width;
      this.canvasHeight = p.height;
      
      // Calculate how many columns can fit based on available width
      const availableWidth = this.canvasWidth - this.CONFIG.START_X * 2;
      this.maxVisibleColumns = Math.max(4, Math.floor(availableWidth / this.CONFIG.COLUMN_SPACING));
      
      this.centerY = this.canvasHeight / 2;
      p.textAlign(p.CENTER, p.CENTER);
      p.strokeWeight(2);
      
      this.animationStartTime = p.millis();
      p.frameRate(45);
    };

    p.draw = () => {
      p.background(this.colors.background);
      
      // Calculate animation state
      const animationState = this.calculateAnimationState(p);
      const visibleColumns = this.getVisibleColumns(animationState.currentStep);
      
      // Draw all visible columns and connections
      this.drawColumns(p, visibleColumns);
      
      // Draw cardinality equation at bottom
      this.drawCardinalityEquation(p, visibleColumns);
    };

  }

  // Animation Logic
  private calculateAnimationState(p: p5) {
    let elapsed = p.millis() - this.animationStartTime;
    const cycleTime = this.CONFIG.TOTAL_COLUMNS * this.CONFIG.STEP_DURATION + this.CONFIG.END_PAUSE;
    
    // Reset animation at end of cycle
    if (elapsed >= cycleTime) {
      this.animationStartTime = p.millis();
      elapsed = 0;
    }
    
    const currentStep = p.min(
      p.floor(elapsed / this.CONFIG.STEP_DURATION), 
      this.CONFIG.TOTAL_COLUMNS - 1
    );
    
    return { elapsed, currentStep, cycleTime };
  }

  private getVisibleColumns(currentStep: number) {
      const columns: Array<{index: number, x: number}> = [];
      
    if (currentStep < this.maxVisibleColumns) {
      // Initial phase: columns appear one by one
      for (let i = 0; i <= currentStep; i++) {
        columns.push({
          index: i,
          x: this.CONFIG.START_X + i * this.CONFIG.COLUMN_SPACING
        });
      }
    } else {
      // Shifting phase: show maxVisibleColumns, shifted appropriately
      const offset = currentStep - this.maxVisibleColumns + 1;
      for (let i = 0; i < this.maxVisibleColumns; i++) {
        const colIndex = i + offset;
        if (colIndex < this.CONFIG.TOTAL_COLUMNS) {
          columns.push({
            index: colIndex,
            x: this.CONFIG.START_X + i * this.CONFIG.COLUMN_SPACING
          });
        }
      }
    }
    
    return columns;
  }

  // Main Drawing Functions
  private drawColumns(p: p5, visibleColumns: Array<{index: number, x: number}>): void {
      for (let i = 0; i < visibleColumns.length; i++) {
        const col = visibleColumns[i];
        
      // Draw the column
      if (col.index === 0) {
        this.drawSetA(p, col.x);
      } else {
        this.drawSetBn(p, col.x, col.index);
      }
      
      // Draw connections from previous column
      if (i > 0) {
        const prevCol = visibleColumns[i - 1];
        this.drawConnectionsAndLabel(p, prevCol, col);
      }
    }
  }

  private drawConnectionsAndLabel(p: p5, fromCol: {index: number, x: number}, toCol: {index: number, x: number}): void {
    // Draw arrows between columns
    this.drawArrowsBetweenColumns(p, fromCol.x, toCol.x, fromCol.index, toCol.index);
    
    // Draw dividing line and cardinality label
    const lineX = (fromCol.x + toCol.x) / 2;
    
    p.stroke(this.colors.stroke);
    p.strokeWeight(2);
    p.line(lineX, 100, lineX, this.canvasHeight - 100);
    
    // Draw |A|^n label
    this.drawCardinalityLabel(p, lineX, toCol.index);
  }

  private drawCardinalityLabel(p: p5, x: number, n: number): void {
    p.fill(this.colors.background);
    p.noStroke();
    const labelWidth = n === 1 ? 40 : 50;
    p.rect(x - labelWidth/2, this.centerY - 20, labelWidth, 40);
    
    p.fill(this.colors.foreground);
    p.textSize(n === 1 ? 24 : 22);
    
    let label = '|A|';
    if (n > 1) {
      label += this.getSuperscriptUnicode(n);
    }
    p.text(label, x, this.centerY);
  }

  private drawCardinalityEquation(p: p5, visibleColumns: Array<{index: number, x: number}>): void {
    if (visibleColumns.length === 0) return;
    
    const lastCol = visibleColumns[visibleColumns.length - 1];
    const n = lastCol.index;
    
    p.fill(this.colors.foreground);
    p.noStroke();
    p.textSize(this.CONFIG.EQUATION_SIZE);
    p.textAlign(p.CENTER, p.CENTER);
    
    let equation = '';
    if (n === 0) {
      equation = '|A| = ℵ₀';
    } else {
      equation = '|A|';
      if (n > 1) {
        equation += this.getSuperscriptUnicode(n);
      }
      equation += ` = |B${this.getSubscriptUnicode(n)}| = ℵ₀`;
    }
    
    p.text(equation, this.canvasWidth / 2, this.canvasHeight - 40);
  }

  // Column Drawing Functions
  private drawSetA(p: p5, x: number): void {
    this.drawColumnLabel(p, x, 'A');
    this.drawIntegerElements(p, x);
    this.drawEllipsisAndArrows(p, x);
  }

  private drawSetBn(p: p5, x: number, n: number): void {
    this.drawColumnLabel(p, x, `B${this.getSubscriptUnicode(n)}`);
    
    if (n === 1) {
      // B₁ is just like A - simple integers
      this.drawIntegerElements(p, x);
    } else {
      // B_n for n ≥ 2 - show n-tuples
      this.drawTupleElements(p, x, n);
    }
    
    this.drawEllipsisAndArrows(p, x);
  }

  private drawColumnLabel(p: p5, x: number, label: string): void {
    p.fill(this.colors.foreground);
    p.noStroke();
    p.textSize(this.CONFIG.LABEL_SIZE);
    p.textStyle(p.BOLD);
    p.text(label, x, 60);
    p.textStyle(p.NORMAL);
  }

  private drawIntegerElements(p: p5, x: number): void {
    for (let i = this.CONFIG.MIN_VALUE; i <= this.CONFIG.MAX_VALUE; i++) {
      const y = this.centerY + i * this.CONFIG.VERTICAL_SPACING;
      
      // Draw circle
      p.stroke(this.colors.stroke);
      p.strokeWeight(2);
      p.fill(this.colors.background);
      p.circle(x, y, this.CONFIG.CIRCLE_RADIUS * 2);
      
      // Draw number
      p.fill(this.colors.foreground);
      p.noStroke();
      p.textSize(this.CONFIG.VALUE_SIZE);
      p.text(i, x, y);
    }
  }

  private drawTupleElements(p: p5, x: number, n: number): void {
      // Calculate display parameters based on n
      const nodeRadius = p.max(4, 20 - (n - 1) * 4);
      const textSz = p.max(4, 16 - (n - 1) * 2);
      const density = p.min(n, 4);
      const jitter = p.min(n - 1, 3);
      
    // Generate and display sample tuples
    const sampleElements = this.generateSampleTuples(n - 1, p.min(11, 5 + n * 2));
    
    for (let i = 0; i < sampleElements.length; i++) {
      const baseY = this.getTupleY(i, sampleElements.length);
      const subElements = this.getSubElements(p, density);
      
      for (let j = 0; j < subElements.length; j++) {
        const spacing = p.max(6, 20 - (n - 2) * 3);
        const y = baseY + (j - p.floor(density/2)) * spacing + (i % jitter) * 2;
        const xOffset = (j % 2) * p.min(15, 25 - n * 2) - p.min(7.5, 12.5 - n);
        
        if (this.isInDrawingBounds(y, xOffset)) {
          this.drawTupleNode(p, x + xOffset, y, nodeRadius, textSz, 
                      sampleElements[i], subElements[j], n);
        }
      }
    }
    
    // Add density indicators for complex columns
    if (n >= 4) {
      this.drawDensityIndicators(p, x, n);
    }
  }

  private drawTupleNode(p: p5, x: number, y: number, radius: number, textSz: number, 
                        baseElement: number[], lastValue: number, n: number): void {
    // Draw circle
    p.stroke(this.colors.stroke);
    p.strokeWeight(p.max(0.2, 1.5 - (n - 2) * 0.3));
    p.fill(this.colors.background);
    p.circle(x, y, radius * 2);
    
    // Draw tuple text
    p.fill(this.colors.foreground);
    p.noStroke();
    p.textSize(textSz);
    const tupleStr = `(${[...baseElement, lastValue].join(',')})`;
    p.text(tupleStr, x, y);
  }

  private drawEllipsisAndArrows(p: p5, x: number): void {
    const topY = this.centerY + this.CONFIG.MIN_VALUE * this.CONFIG.VERTICAL_SPACING;
    const bottomY = this.centerY + this.CONFIG.MAX_VALUE * this.CONFIG.VERTICAL_SPACING;
    
    p.fill(this.colors.foreground);
    p.noStroke();
    
    // Top ellipsis and arrow
    p.textSize(this.CONFIG.ELLIPSIS_SIZE);
    p.text('⋮', x, topY - this.CONFIG.ELLIPSIS_OFFSET);
    p.textSize(this.CONFIG.ARROW_SIZE);
    p.text('↑ ∞', x, topY - this.CONFIG.ARROW_OFFSET);
    
    // Bottom ellipsis and arrow
    p.textSize(this.CONFIG.ELLIPSIS_SIZE);
    p.text('⋮', x, bottomY + this.CONFIG.ELLIPSIS_OFFSET);
    p.textSize(this.CONFIG.ARROW_SIZE);
    p.text('↓ ∞', x, bottomY + this.CONFIG.ARROW_OFFSET);
  }

  private drawDensityIndicators(p: p5, x: number, n: number): void {
    p.fill(this.colors.foreground);
    p.noStroke();
    p.textSize(p.max(16, 32 - n * 2));
    
    const positions = [
      {x: -25, y: this.centerY - 50},
      {x: 25, y: this.centerY - 50},
      {x: -25, y: this.centerY + 50},
      {x: 25, y: this.centerY + 50},
      {x: 0, y: this.centerY}
    ];
    
    for (const pos of positions) {
      p.text('⋮', x + pos.x, pos.y);
    }
  }

  // Arrow Drawing
  private drawArrowsBetweenColumns(p: p5, x1: number, x2: number, fromLevel: number, toLevel: number): void {
    const strokeWt = p.max(this.CONFIG.MIN_STROKE_WEIGHT, 1.5 - (toLevel - 2) * 0.15);
    const dashSize = p.max(this.CONFIG.MIN_DASH_SIZE, 4 - toLevel * 0.3);
    
    p.stroke(this.colors.stroke);
    p.strokeWeight(strokeWt);
    p.drawingContext.setLineDash([dashSize, dashSize * 1.5]);
    
    // Determine source elements
    const sourceElements = fromLevel === 0 
      ? this.generateIntegerArray() 
      : this.generateSampleTuples(fromLevel, p.min(11, 5 + fromLevel * 2));
    
    // Calculate arrow density
    const density = fromLevel === 0 ? 1 : p.min(2 + fromLevel, 4);
    const spreadFactor = p.min(toLevel * 8, 40);
    
    // Draw arrows with optimization
    const step = toLevel > 3 ? 2 : 1;
    for (let i = 0; i < sourceElements.length; i += step) {
      const y1 = fromLevel === 0 
        ? this.centerY + sourceElements[i][0] * this.CONFIG.VERTICAL_SPACING
        : this.getTupleY(i, sourceElements.length);
      
      if (!this.isInVerticalBounds(y1)) continue;
      
      this.drawArrowsFromElement(p, x1, x2, y1, i, density, toLevel, fromLevel);
      
      // Add spreading arrows for higher levels
      if (toLevel >= 2 && i % p.max(1, 4 - toLevel) === 0) {
        this.drawSpreadingArrows(p, x1, x2, y1, spreadFactor, toLevel, fromLevel);
      }
    }
    
    p.drawingContext.setLineDash([]);
  }

  private drawArrowsFromElement(p: p5, x1: number, x2: number, y1: number, elementIndex: number, 
                                density: number, toLevel: number, fromLevel: number): void {
    const sourceRadius = fromLevel === 0 ? this.CONFIG.CIRCLE_RADIUS : p.max(4, 20 - fromLevel * 4);
    const targetRadius = toLevel === 1 ? this.CONFIG.CIRCLE_RADIUS : p.max(4, 20 - (toLevel - 1) * 4);
    
    for (let j = 0; j < density; j++) {
      const targetOffset = (j - p.floor(density/2)) * p.max(6, 20 - p.max(0, toLevel - 2) * 3);
      const y2 = y1 + targetOffset + (elementIndex % 3) * 2;
      const xOffset = (j % 2) * p.min(15, 25 - toLevel * 2) - p.min(7.5, 12.5 - toLevel);
      
      if (this.isInVerticalBounds(y2)) {
        p.line(x1 + sourceRadius, y1, x2 + xOffset - targetRadius, y2);
      }
    }
  }

  private drawSpreadingArrows(p: p5, x1: number, x2: number, y1: number, spreadFactor: number, 
                              toLevel: number, fromLevel: number): void {
    const sourceRadius = fromLevel === 0 ? this.CONFIG.CIRCLE_RADIUS : p.max(4, 20 - fromLevel * 4);
    const targetRadius = p.max(4, 20 - (toLevel - 1) * 4);
    
    for (let spread = -spreadFactor; spread <= spreadFactor; spread += spreadFactor/3) {
      const targetY = y1 + spread;
      if (targetY > 50 && targetY < this.canvasHeight - 50) {
        p.line(x1 + sourceRadius, y1, x2 - targetRadius, targetY);
      }
    }
  }

  // Helper Functions
  private generateIntegerArray(): number[][] {
    const result: number[][] = [];
    for (let i = this.CONFIG.MIN_VALUE; i <= this.CONFIG.MAX_VALUE; i++) {
      result.push([i]);
    }
    return result;
  }

  private generateSampleTuples(level: number, count: number): number[][] {
    // Use cache to avoid regenerating the same tuples
    const cacheKey = `${level}-${count}`;
    if (this.cachedTuples.has(cacheKey)) {
      return this.cachedTuples.get(cacheKey)!;
    }
    
    if (level === 1) {
      const result = this.generateIntegerArray();
      this.cachedTuples.set(cacheKey, result);
      return result;
    }
    
    const result: number[][] = [];
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
        const tuple: number[] = [];
        for (let j = 0; j < level; j++) {
          tuple.push(baseValues[i % baseValues.length]);
        }
        result.push(tuple);
      }
    }
    
    const finalResult = result.slice(0, count);
    this.cachedTuples.set(cacheKey, finalResult);
    return finalResult;
  }

  private getTupleY(elementIndex: number, totalElements: number): number {
    const availableHeight = (this.CONFIG.MAX_VALUE - this.CONFIG.MIN_VALUE) * this.CONFIG.VERTICAL_SPACING;
    const topY = this.centerY + this.CONFIG.MIN_VALUE * this.CONFIG.VERTICAL_SPACING;
    
    if (totalElements <= 1) {
      return this.centerY;
    }
    
    const spacing = availableHeight / (totalElements - 1);
    return topY + elementIndex * spacing;
  }

  private getSubElements(p: p5, density: number): number[] {
    const elements: number[] = [];
    for (let i = -p.floor(density/2); i <= p.floor(density/2); i++) {
      elements.push(i);
    }
    return elements.slice(0, density);
  }

  private isInDrawingBounds(y: number, xOffset: number): boolean {
    return y > 90 && y < this.canvasHeight - 90 && Math.abs(xOffset) < 30;
  }

  private isInVerticalBounds(y: number): boolean {
    return y > 100 && y < this.canvasHeight - 100;
  }

  protected onResize(p: p5, size: CanvasSize): void {
    this.canvasWidth = p.width;
    this.canvasHeight = p.height;
    this.centerY = this.canvasHeight / 2;
    
    // Recalculate columns that fit
    const availableWidth = this.canvasWidth - this.CONFIG.START_X * 2;
    this.maxVisibleColumns = Math.max(4, Math.floor(availableWidth / this.CONFIG.COLUMN_SPACING));
  }
}

export const metadata: DemoMetadata = {
  title: 'Countable Tuples',
  category: 'Real Analysis',
  description: 'Visualization showing that the set of all finite tuples of natural numbers is countable',
  instructions: `<p>This animation illustrates the proof that B_n (the set of all n-tuples from a countable set A) is countable for any n.</p>`
};

export default function createCountableTuplesDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new CountableTuplesDemo(container, config);
  return demo.init();
}
