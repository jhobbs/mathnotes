// Countable Tuples Demo - Shows B_n sets are countable for any n
import p5 from 'p5';
import type { DemoConfig, DemoInstance } from '@framework/types';

export default function createCountableTuplesDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  let sketch: p5 | null = null;

  // Configuration Constants
  const CONFIG = {
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

  // Global Variables
  let canvasWidth: number, canvasHeight: number, centerY: number;
  let animationStartTime: number;
  let maxVisibleColumns = 4;
  
  // Performance optimization: cache generated tuples
  const cachedTuples = new Map<string, number[][]>();

  // Dark mode detection helper
  const isDarkMode = () => config?.darkMode ?? false;

  // Color helpers
  const getBackgroundColor = (p: p5) => isDarkMode() ? p.color(15, 15, 15) : p.color(255, 255, 255);
  const getTextColor = (p: p5) => isDarkMode() ? p.color(230, 230, 230) : p.color(0, 0, 0);
  const getStrokeColor = (p: p5) => isDarkMode() ? p.color(100, 100, 100) : p.color(0, 0, 0);

  // Unicode helpers
  const getSuperscriptUnicode = (n: number): string => {
    const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
    return n.toString().split('').map(d => superscripts[parseInt(d)]).join('');
  };

  const getSubscriptUnicode = (n: number): string => {
    const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    return n.toString().split('').map(d => subscripts[parseInt(d)]).join('');
  };

  const createSketch = (p: p5) => {
    p.setup = () => {
      // Responsive sizing
      if (p.windowWidth < 768) {
        canvasWidth = p.windowWidth - 40;
        canvasHeight = p.min(p.windowHeight - 200, 600);
      } else {
        canvasWidth = config?.width || container.offsetWidth - 40 || 800;
        canvasHeight = config?.height || p.min(600, canvasWidth * 0.66);
      }
      
      const canvas = p.createCanvas(canvasWidth, canvasHeight);
      canvas.parent(container);
      
      // Calculate how many columns can fit based on available width
      const availableWidth = canvasWidth - CONFIG.START_X * 2;
      maxVisibleColumns = Math.max(4, Math.floor(availableWidth / CONFIG.COLUMN_SPACING));
      
      centerY = canvasHeight / 2;
      p.textAlign(p.CENTER, p.CENTER);
      p.strokeWeight(2);
      
      animationStartTime = p.millis();
      p.frameRate(45);
    };

    p.draw = () => {
      p.background(getBackgroundColor(p));
      
      // Calculate animation state
      const animationState = calculateAnimationState(p);
      const visibleColumns = getVisibleColumns(animationState.currentStep);
      
      // Draw all visible columns and connections
      drawColumns(p, visibleColumns);
      
      // Draw cardinality equation at bottom
      drawCardinalityEquation(p, visibleColumns);
    };

    p.windowResized = () => {
      // Only respond to window resize if no fixed dimensions
      if (config?.width && config?.height) return;
      
      // Responsive sizing
      if (p.windowWidth < 768) {
        canvasWidth = p.windowWidth - 40;
        canvasHeight = p.min(p.windowHeight - 200, 600);
      } else {
        canvasWidth = container.offsetWidth - 40 || 800;
        canvasHeight = p.min(600, canvasWidth * 0.66);
      }
      
      p.resizeCanvas(canvasWidth, canvasHeight);
      centerY = canvasHeight / 2;
      
      // Recalculate columns that fit
      const availableWidth = canvasWidth - CONFIG.START_X * 2;
      maxVisibleColumns = Math.max(4, Math.floor(availableWidth / CONFIG.COLUMN_SPACING));
    };

    // Animation Logic
    const calculateAnimationState = (p: p5) => {
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
    };

    const getVisibleColumns = (currentStep: number) => {
      const columns: Array<{index: number, x: number}> = [];
      
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
    };

    // Main Drawing Functions
    const drawColumns = (p: p5, visibleColumns: Array<{index: number, x: number}>) => {
      for (let i = 0; i < visibleColumns.length; i++) {
        const col = visibleColumns[i];
        
        // Draw the column
        if (col.index === 0) {
          drawSetA(p, col.x);
        } else {
          drawSetBn(p, col.x, col.index);
        }
        
        // Draw connections from previous column
        if (i > 0) {
          const prevCol = visibleColumns[i - 1];
          drawConnectionsAndLabel(p, prevCol, col);
        }
      }
    };

    const drawConnectionsAndLabel = (p: p5, fromCol: {index: number, x: number}, toCol: {index: number, x: number}) => {
      // Draw arrows between columns
      drawArrowsBetweenColumns(p, fromCol.x, toCol.x, fromCol.index, toCol.index);
      
      // Draw dividing line and cardinality label
      const lineX = (fromCol.x + toCol.x) / 2;
      
      p.stroke(getStrokeColor(p));
      p.strokeWeight(2);
      p.line(lineX, 100, lineX, canvasHeight - 100);
      
      // Draw |A|^n label
      drawCardinalityLabel(p, lineX, toCol.index);
    };

    const drawCardinalityLabel = (p: p5, x: number, n: number) => {
      p.fill(getBackgroundColor(p));
      p.noStroke();
      const labelWidth = n === 1 ? 40 : 50;
      p.rect(x - labelWidth/2, centerY - 20, labelWidth, 40);
      
      p.fill(getTextColor(p));
      p.textSize(n === 1 ? 24 : 22);
      
      let label = '|A|';
      if (n > 1) {
        label += getSuperscriptUnicode(n);
      }
      p.text(label, x, centerY);
    };

    const drawCardinalityEquation = (p: p5, visibleColumns: Array<{index: number, x: number}>) => {
      if (visibleColumns.length === 0) return;
      
      const lastCol = visibleColumns[visibleColumns.length - 1];
      const n = lastCol.index;
      
      p.fill(getTextColor(p));
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
    };

    // Column Drawing Functions
    const drawSetA = (p: p5, x: number) => {
      drawColumnLabel(p, x, 'A');
      drawIntegerElements(p, x);
      drawEllipsisAndArrows(p, x);
    };

    const drawSetBn = (p: p5, x: number, n: number) => {
      drawColumnLabel(p, x, `B${getSubscriptUnicode(n)}`);
      
      if (n === 1) {
        // B₁ is just like A - simple integers
        drawIntegerElements(p, x);
      } else {
        // B_n for n ≥ 2 - show n-tuples
        drawTupleElements(p, x, n);
      }
      
      drawEllipsisAndArrows(p, x);
    };

    const drawColumnLabel = (p: p5, x: number, label: string) => {
      p.fill(getTextColor(p));
      p.noStroke();
      p.textSize(CONFIG.LABEL_SIZE);
      p.textStyle(p.BOLD);
      p.text(label, x, 60);
      p.textStyle(p.NORMAL);
    };

    const drawIntegerElements = (p: p5, x: number) => {
      for (let i = CONFIG.MIN_VALUE; i <= CONFIG.MAX_VALUE; i++) {
        const y = centerY + i * CONFIG.VERTICAL_SPACING;
        
        // Draw circle
        p.stroke(getStrokeColor(p));
        p.strokeWeight(2);
        p.fill(getBackgroundColor(p));
        p.circle(x, y, CONFIG.CIRCLE_RADIUS * 2);
        
        // Draw number
        p.fill(getTextColor(p));
        p.noStroke();
        p.textSize(CONFIG.VALUE_SIZE);
        p.text(i, x, y);
      }
    };

    const drawTupleElements = (p: p5, x: number, n: number) => {
      // Calculate display parameters based on n
      const nodeRadius = p.max(4, 20 - (n - 1) * 4);
      const textSz = p.max(4, 16 - (n - 1) * 2);
      const density = p.min(n, 4);
      const jitter = p.min(n - 1, 3);
      
      // Generate and display sample tuples
      const sampleElements = generateSampleTuples(n - 1, p.min(11, 5 + n * 2));
      
      for (let i = 0; i < sampleElements.length; i++) {
        const baseY = getTupleY(i, sampleElements.length);
        const subElements = getSubElements(p, density);
        
        for (let j = 0; j < subElements.length; j++) {
          const spacing = p.max(6, 20 - (n - 2) * 3);
          const y = baseY + (j - p.floor(density/2)) * spacing + (i % jitter) * 2;
          const xOffset = (j % 2) * p.min(15, 25 - n * 2) - p.min(7.5, 12.5 - n);
          
          if (isInDrawingBounds(y, xOffset)) {
            drawTupleNode(p, x + xOffset, y, nodeRadius, textSz, 
                        sampleElements[i], subElements[j], n);
          }
        }
      }
      
      // Add density indicators for complex columns
      if (n >= 4) {
        drawDensityIndicators(p, x, n);
      }
    };

    const drawTupleNode = (p: p5, x: number, y: number, radius: number, textSz: number, 
                          baseElement: number[], lastValue: number, n: number) => {
      // Draw circle
      p.stroke(getStrokeColor(p));
      p.strokeWeight(p.max(0.2, 1.5 - (n - 2) * 0.3));
      p.fill(getBackgroundColor(p));
      p.circle(x, y, radius * 2);
      
      // Draw tuple text
      p.fill(getTextColor(p));
      p.noStroke();
      p.textSize(textSz);
      const tupleStr = `(${[...baseElement, lastValue].join(',')})`;
      p.text(tupleStr, x, y);
    };

    const drawEllipsisAndArrows = (p: p5, x: number) => {
      const topY = centerY + CONFIG.MIN_VALUE * CONFIG.VERTICAL_SPACING;
      const bottomY = centerY + CONFIG.MAX_VALUE * CONFIG.VERTICAL_SPACING;
      
      p.fill(getTextColor(p));
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
    };

    const drawDensityIndicators = (p: p5, x: number, n: number) => {
      p.fill(getTextColor(p));
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
    };

    // Arrow Drawing
    const drawArrowsBetweenColumns = (p: p5, x1: number, x2: number, fromLevel: number, toLevel: number) => {
      const strokeWt = p.max(CONFIG.MIN_STROKE_WEIGHT, 1.5 - (toLevel - 2) * 0.15);
      const dashSize = p.max(CONFIG.MIN_DASH_SIZE, 4 - toLevel * 0.3);
      
      p.stroke(getStrokeColor(p));
      p.strokeWeight(strokeWt);
      p.drawingContext.setLineDash([dashSize, dashSize * 1.5]);
      
      // Determine source elements
      const sourceElements = fromLevel === 0 
        ? generateIntegerArray() 
        : generateSampleTuples(fromLevel, p.min(11, 5 + fromLevel * 2));
      
      // Calculate arrow density
      const density = fromLevel === 0 ? 1 : p.min(2 + fromLevel, 4);
      const spreadFactor = p.min(toLevel * 8, 40);
      
      // Draw arrows with optimization
      const step = toLevel > 3 ? 2 : 1;
      for (let i = 0; i < sourceElements.length; i += step) {
        const y1 = fromLevel === 0 
          ? centerY + sourceElements[i][0] * CONFIG.VERTICAL_SPACING
          : getTupleY(i, sourceElements.length);
        
        if (!isInVerticalBounds(y1)) continue;
        
        drawArrowsFromElement(p, x1, x2, y1, i, density, toLevel, fromLevel);
        
        // Add spreading arrows for higher levels
        if (toLevel >= 2 && i % p.max(1, 4 - toLevel) === 0) {
          drawSpreadingArrows(p, x1, x2, y1, spreadFactor, toLevel, fromLevel);
        }
      }
      
      p.drawingContext.setLineDash([]);
    };

    const drawArrowsFromElement = (p: p5, x1: number, x2: number, y1: number, elementIndex: number, 
                                  density: number, toLevel: number, fromLevel: number) => {
      const sourceRadius = fromLevel === 0 ? CONFIG.CIRCLE_RADIUS : p.max(4, 20 - fromLevel * 4);
      const targetRadius = toLevel === 1 ? CONFIG.CIRCLE_RADIUS : p.max(4, 20 - (toLevel - 1) * 4);
      
      for (let j = 0; j < density; j++) {
        const targetOffset = (j - p.floor(density/2)) * p.max(6, 20 - p.max(0, toLevel - 2) * 3);
        const y2 = y1 + targetOffset + (elementIndex % 3) * 2;
        const xOffset = (j % 2) * p.min(15, 25 - toLevel * 2) - p.min(7.5, 12.5 - toLevel);
        
        if (isInVerticalBounds(y2)) {
          p.line(x1 + sourceRadius, y1, x2 + xOffset - targetRadius, y2);
        }
      }
    };

    const drawSpreadingArrows = (p: p5, x1: number, x2: number, y1: number, spreadFactor: number, 
                                toLevel: number, fromLevel: number) => {
      const sourceRadius = fromLevel === 0 ? CONFIG.CIRCLE_RADIUS : p.max(4, 20 - fromLevel * 4);
      const targetRadius = p.max(4, 20 - (toLevel - 1) * 4);
      
      for (let spread = -spreadFactor; spread <= spreadFactor; spread += spreadFactor/3) {
        const targetY = y1 + spread;
        if (targetY > 50 && targetY < canvasHeight - 50) {
          p.line(x1 + sourceRadius, y1, x2 - targetRadius, targetY);
        }
      }
    };

    // Helper Functions
    const generateIntegerArray = (): number[][] => {
      const result: number[][] = [];
      for (let i = CONFIG.MIN_VALUE; i <= CONFIG.MAX_VALUE; i++) {
        result.push([i]);
      }
      return result;
    };

    const generateSampleTuples = (level: number, count: number): number[][] => {
      // Use cache to avoid regenerating the same tuples
      const cacheKey = `${level}-${count}`;
      if (cachedTuples.has(cacheKey)) {
        return cachedTuples.get(cacheKey)!;
      }
      
      if (level === 1) {
        const result = generateIntegerArray();
        cachedTuples.set(cacheKey, result);
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
      cachedTuples.set(cacheKey, finalResult);
      return finalResult;
    };

    const getTupleY = (elementIndex: number, totalElements: number): number => {
      const availableHeight = (CONFIG.MAX_VALUE - CONFIG.MIN_VALUE) * CONFIG.VERTICAL_SPACING;
      const topY = centerY + CONFIG.MIN_VALUE * CONFIG.VERTICAL_SPACING;
      
      if (totalElements <= 1) {
        return centerY;
      }
      
      const spacing = availableHeight / (totalElements - 1);
      return topY + elementIndex * spacing;
    };

    const getSubElements = (p: p5, density: number): number[] => {
      const elements: number[] = [];
      for (let i = -p.floor(density/2); i <= p.floor(density/2); i++) {
        elements.push(i);
      }
      return elements.slice(0, density);
    };

    const isInDrawingBounds = (y: number, xOffset: number): boolean => {
      return y > 90 && y < canvasHeight - 90 && Math.abs(xOffset) < 30;
    };

    const isInVerticalBounds = (y: number): boolean => {
      return y > 100 && y < canvasHeight - 100;
    };
  };

  // Create info panel
  const infoDiv = document.createElement('div');
  infoDiv.style.marginTop = '20px';
  infoDiv.style.textAlign = 'center';
  infoDiv.innerHTML = `
    <h3>Countable n-tuples from Countable Set</h3>
    <p>This animation illustrates the proof that B_n (the set of all n-tuples from a countable set A) is countable for any n.</p>
  `;
  container.appendChild(infoDiv);

  // Create and start sketch
  sketch = new p5(createSketch);

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