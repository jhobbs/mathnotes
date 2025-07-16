// Countable Union Demo - Shows diagonal traversal of countable union
import p5 from 'p5';
import type { DemoConfig, DemoInstance } from '@framework/types';

export default function createCountableUnionDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  let sketch: p5 | null = null;

  // Configuration
  const gridSize = 10; // Grid dimensions (10x10)
  let cellSize: number;
  const margin = 60;
  let traversalPath: Array<{n: number, m: number, isDiagonalStart: boolean}> = [];
  let currentIndex = 0;
  let animationProgress = 0;
  const animationSpeed = 0.03;
  let linePoints: Array<{x: number, y: number, isDiagonalStart: boolean}> = [];

  // Dark mode detection helper
  const isDarkMode = () => config?.darkMode ?? false;

  // Color helpers
  const getBackgroundColor = (p: p5) => isDarkMode() ? p.color(15, 15, 15) : p.color(255, 255, 255);
  const getTextColor = (p: p5) => isDarkMode() ? p.color(230, 230, 230) : p.color(0, 0, 0);
  const getStrokeColor = (p: p5) => isDarkMode() ? p.color(100, 100, 100) : p.color(0, 0, 0);
  const getHighlightColor = (p: p5) => isDarkMode() ? p.color(88, 166, 255) : p.color(3, 102, 214);

  // Generate diagonal traversal path
  const generateTraversalPath = () => {
    traversalPath = [];
    
    // Generate diagonal traversal order
    // Stop after completing the diagonal that starts at E_10,1
    // This happens when sum = 11 (row 10 + col 1 = 11)
    for (let sum = 2; sum <= 11; sum++) {
      // Each diagonal has elements where row + col = sum
      // We traverse from bottom to top (increasing column, decreasing row)
      let diagonalStart = true;
      
      for (let col = 1; col < sum; col++) {
        const row = sum - col;
        
        if (row >= 1 && row <= gridSize && col >= 1 && col <= gridSize) {
          traversalPath.push({
            n: row - 1, // Convert to 0-indexed (row)
            m: col - 1, // Convert to 0-indexed (col)
            isDiagonalStart: diagonalStart
          });
          diagonalStart = false;
        }
      }
    }
  };

  const createSketch = (p: p5) => {
    p.setup = () => {
      // Responsive sizing
      let canvasWidth: number, canvasHeight: number;
      
      if (p.windowWidth < 768) {
        // Mobile: use full window width minus margin with square aspect
        canvasWidth = p.windowWidth - 40;
        canvasHeight = canvasWidth;
      } else {
        // Desktop: use config or container-based sizing
        canvasWidth = config?.width || container.offsetWidth - 40 || 600;
        canvasHeight = config?.height || canvasWidth;
      }
      
      const canvas = p.createCanvas(canvasWidth, canvasHeight);
      canvas.parent(container);
      
      cellSize = (canvasWidth - 2 * margin) / gridSize;
      
      // Generate diagonal traversal path
      generateTraversalPath();
      
      p.textAlign(p.CENTER, p.CENTER);
      p.strokeWeight(2);
    };

    p.draw = () => {
      p.background(getBackgroundColor(p));
      
      // Draw grid
      drawGrid(p);
      
      // Draw axis labels and indicators
      drawLabels(p);
      
      // Animate traversal line
      drawTraversalLine(p);
      
      // Update animation
      updateAnimation();
    };

    p.windowResized = () => {
      // Only respond to window resize if no fixed dimensions
      if (config?.width && config?.height) return;
      
      // Responsive sizing
      let canvasWidth: number, canvasHeight: number;
      
      if (p.windowWidth < 768) {
        canvasWidth = p.windowWidth - 40;
        canvasHeight = canvasWidth;
      } else {
        canvasWidth = container.offsetWidth - 40 || 600;
        canvasHeight = canvasWidth;
      }
      
      p.resizeCanvas(canvasWidth, canvasHeight);
      cellSize = (canvasWidth - 2 * margin) / gridSize;
    };

    const drawGrid = (p: p5) => {
      for (let n = 0; n < gridSize; n++) {
        for (let m = 0; m < gridSize; m++) {
          const x = margin + m * cellSize + cellSize / 2;
          const y = margin + n * cellSize + cellSize / 2;
          
          // Draw cell
          p.noFill();
          p.stroke(getStrokeColor(p));
          p.strokeWeight(1);
          p.rect(x - cellSize/2, y - cellSize/2, cellSize, cellSize);
          
          // Draw label with subscripts
          p.fill(getTextColor(p));
          p.noStroke();
          p.textSize(cellSize * 0.3);
          drawSubscriptText(p, 'E', n + 1, m + 1, x, y);
        }
      }
      
      // Draw ellipsis to indicate infinite continuation
      p.textSize(20);
      p.fill(getTextColor(p));
      p.noStroke();
      
      // Right edge ellipsis
      p.text('...', margin + gridSize * cellSize + cellSize/2, p.height / 2);
      
      // Bottom edge ellipsis
      p.text('...', p.width / 2, margin + gridSize * cellSize + cellSize/2);
      
      // Bottom-right corner ellipsis
      p.text('...', margin + gridSize * cellSize + cellSize/2, margin + gridSize * cellSize + cellSize/2);
    };

    const drawLabels = (p: p5) => {
      p.textSize(16);
      p.fill(getTextColor(p));
      p.noStroke();
      
      // Set label (vertical)
      p.push();
      p.translate(margin / 2, p.height / 2);
      p.rotate(-p.PI / 2);
      p.text('Set number (n)', 0, 0);
      p.pop();
      
      // Element label (horizontal)
      p.text('Element index (m)', p.width / 2, p.height - margin / 2);
      
      // Add infinity symbols
      p.textSize(14);
      p.text('→ ∞', margin + gridSize * cellSize + cellSize, p.height - margin / 2);
      p.text('↓ ∞', margin / 2, margin + gridSize * cellSize + cellSize);
    };

    const drawSubscriptText = (p: p5, base: string, sub1: number, sub2: number, x: number, y: number) => {
      const baseSize = cellSize * 0.5;
      const subSize = baseSize * 0.5;
      
      p.textSize(baseSize);
      
      // Draw base
      p.text(base, x - cellSize * 0.2, y - cellSize * 0.1);
      
      // Draw subscripts
      p.textSize(subSize);
      p.text(sub1 + ',' + sub2, x + cellSize * 0.12, y + cellSize * 0.12);
    };

    const drawTraversalLine = (p: p5) => {
      p.noFill();
      
      // Use theme-appropriate highlight color
      p.stroke(getHighlightColor(p));
      p.strokeWeight(3);
      
      // Draw completed path segments
      for (let i = 1; i < linePoints.length; i++) {
        const prev = linePoints[i - 1];
        const curr = linePoints[i];
        
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
      if (currentIndex > 0 && currentIndex < traversalPath.length) {
        const prev = traversalPath[currentIndex - 1];
        const curr = traversalPath[currentIndex];
        
        const x1 = margin + prev.m * cellSize + cellSize / 2;
        const y1 = margin + prev.n * cellSize + cellSize / 2;
        const x2 = margin + curr.m * cellSize + cellSize / 2;
        const y2 = margin + curr.n * cellSize + cellSize / 2;
        
        // Use dashed line if transitioning to new diagonal
        if (curr.isDiagonalStart) {
          p.drawingContext.setLineDash([5, 5]);
        } else {
          p.drawingContext.setLineDash([]);
        }
        
        const x = p.lerp(x1, x2, animationProgress);
        const y = p.lerp(y1, y2, animationProgress);
        
        if (linePoints.length > 0) {
          p.line(linePoints[linePoints.length - 1].x, linePoints[linePoints.length - 1].y, x, y);
        }
      }
      
      // Reset dash
      p.drawingContext.setLineDash([]);
      
      // Highlight current element
      if (currentIndex < traversalPath.length) {
        const curr = traversalPath[currentIndex];
        const x = margin + curr.m * cellSize + cellSize / 2;
        const y = margin + curr.n * cellSize + cellSize / 2;
        
        // Use theme-appropriate highlight color
        p.fill(getHighlightColor(p));
        p.noStroke();
        p.circle(x, y, cellSize * 0.3);
        
        // Show current element number
        p.fill(getBackgroundColor(p));
        p.textSize(cellSize * 0.3);
        p.text(currentIndex + 1, x, y);
      }
    };

    const updateAnimation = () => {
      animationProgress += animationSpeed;
      if (animationProgress >= 1) {
        animationProgress = 0;
        currentIndex = (currentIndex + 1) % traversalPath.length;
        
        // Add current point to line history
        if (currentIndex > 0) {
          const curr = traversalPath[currentIndex - 1];
          const x = margin + curr.m * cellSize + cellSize / 2;
          const y = margin + curr.n * cellSize + cellSize / 2;
          linePoints.push({
            x: x, 
            y: y,
            isDiagonalStart: curr.isDiagonalStart
          });
          
          // Keep only recent points for performance
          if (linePoints.length > traversalPath.length) {
            linePoints.shift();
          }
        }
        
        // Reset when complete
        if (currentIndex === 0) {
          linePoints = [];
        }
      }
    };
  };

  // Create info panel
  const infoDiv = document.createElement('div');
  infoDiv.style.marginTop = '20px';
  infoDiv.style.textAlign = 'center';
  infoDiv.innerHTML = `
    <h3>Diagonal Traversal of Countable Union</h3>
    <p>This animation shows how elements from countably many countable sets (E<sub>n</sub>) 
    can be enumerated using diagonal traversal, proving that a countable union of countable sets is countable.</p>
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