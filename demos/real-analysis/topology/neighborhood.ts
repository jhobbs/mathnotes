// Neighborhood demo - Interactive visualization for metric spaces
import p5 from 'p5';
import type { DemoInstance, DemoConfig, DemoMetadata } from '@framework/types';
import { P5DemoBase, createControlRow } from '@framework';

interface Neighborhood {
  center: p5.Vector;
  radius: number;
  innerPoints: { x: number; y: number }[];
}

class NeighborhoodDemo extends P5DemoBase {
  private neighborhoods: Neighborhood[] = [];
  private zoomLevel = 1;
  private zoomCenter: p5.Vector | null = null;
  private isZoomed = false;
  private dragStart: p5.Vector | null = null;
  private currentDrag: p5.Vector | null = null;
  private state: 'waiting' | 'dragging_outer' | 'waiting_inner' | 'complete' = 'waiting';
  private readonly minZoom = 0.5;
  private readonly maxZoom = 100;
  
  // Custom colors
  private outerColor!: p5.Color;
  private innerColor!: p5.Color;
  
  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config, metadata);
  }
  
  protected getStylePrefix(): string {
    return 'neighborhood';
  }
  
  protected getContainerId(): string {
    return 'neighborhood-container';
  }
  
  protected getAspectRatio(): number {
    return 1.0; // Square aspect ratio
  }

  protected createSketch(p: p5): void {
    p.setup = () => {
      console.log('[probe] Neighborhood demo setup running');
      
      // Create control panel using new system
      const controlPanel = this.createControlPanel();
      
      // Create buttons using new components
      const resetButton = this.createButton('Reset', () => this.resetDemo());
      const toggleZoomButton = this.createButton('Toggle Zoom', () => this.toggleZoom());
      
      // Create control row with both buttons
      const controlRow = createControlRow(
        [resetButton, toggleZoomButton],
        { gap: '10px' }
      );
      controlPanel.appendChild(controlRow);
      
      // Info section is now handled by base class
      
      p.smooth();
    };

    p.draw = () => {
      p.background(this.colors.background);
      
      p.push();
      p.translate(p.width/2, p.height/2);
      
      if (this.isZoomed && this.zoomCenter) {
        p.scale(this.zoomLevel);
        p.translate(-this.zoomCenter.x, -this.zoomCenter.y);
      }
      
      // Draw grid
      this.drawGrid(p);
      
      // Draw axes
      this.drawAxes(p);
      
      // Draw existing neighborhoods
      for (const n of this.neighborhoods) {
        this.drawNeighborhood(p, n);
      }
      
      // Draw current drag
      if (this.state === 'dragging_outer' && this.dragStart && this.currentDrag) {
        const radius = p.dist(this.dragStart.x, this.dragStart.y, this.currentDrag.x, this.currentDrag.y);
        p.fill(this.outerColor);
        p.noStroke();
        p.circle(this.dragStart.x, this.dragStart.y, radius * 2);
        
        // Draw center point
        p.fill(this.colors.axis || this.colors.stroke);
        p.circle(this.dragStart.x, this.dragStart.y, 8 / this.zoomLevel);
      }
      
      p.pop();
      
      // Update instruction text
      this.updateInstruction();
    };

    // Color scheme changes are now handled by base class
    
    // All the p5 methods that need access to instance variables
    p.mousePressed = () => this.handleMousePressed(p);
    p.mouseDragged = () => this.handleMouseDragged(p);
    p.mouseReleased = () => this.handleMouseReleased(p);
    p.mouseWheel = (event: any) => this.handleMouseWheel(p, event);
  }
  
  protected updateColors(p: p5): void {
    super.updateColors(p);
    // Use accent color with transparency for outer neighborhood
    const accentColor = this.colors.accent;
    // Extract RGB values using p5's color methods
    const r = p.red(accentColor);
    const g = p.green(accentColor);
    const b = p.blue(accentColor);
    this.outerColor = p.color(r, g, b, 80);
    // Use warning color with transparency for inner neighborhoods
    const warningColor = this.colors.warning;
    const wr = p.red(warningColor);
    const wg = p.green(warningColor);
    const wb = p.blue(warningColor);
    this.innerColor = p.color(wr, wg, wb, 100);
  }
  
  private drawGrid(p: p5): void {
    p.stroke(this.colors.grid || this.colors.stroke);
    p.strokeWeight(0.5 / this.zoomLevel);
    
    // Scale grid size based on canvas size to maintain consistent units
    // Original: 600px canvas, 50px grid = 12 units wide (-6 to 6)
    const gridSize = p.width / 12;
    
    // Calculate the visible world bounds
    const viewBounds = {
      left: -p.width / 2 / this.zoomLevel,
      right: p.width / 2 / this.zoomLevel,
      top: -p.height / 2 / this.zoomLevel,
      bottom: p.height / 2 / this.zoomLevel
    };
    
    if (this.isZoomed && this.zoomCenter) {
      viewBounds.left += this.zoomCenter.x;
      viewBounds.right += this.zoomCenter.x;
      viewBounds.top += this.zoomCenter.y;
      viewBounds.bottom += this.zoomCenter.y;
    }
    
    // Extend grid lines well beyond the visible area
    const gridExtent = p.max(p.width, p.height) * 2;
    
    // Draw vertical grid lines
    const startX = Math.floor(viewBounds.left / gridSize) * gridSize;
    const endX = Math.ceil(viewBounds.right / gridSize) * gridSize;
    for (let x = startX - gridExtent; x <= endX + gridExtent; x += gridSize) {
      p.line(x, viewBounds.top - gridExtent, x, viewBounds.bottom + gridExtent);
    }
    
    // Draw horizontal grid lines
    const startY = Math.floor(viewBounds.top / gridSize) * gridSize;
    const endY = Math.ceil(viewBounds.bottom / gridSize) * gridSize;
    for (let y = startY - gridExtent; y <= endY + gridExtent; y += gridSize) {
      p.line(viewBounds.left - gridExtent, y, viewBounds.right + gridExtent, y);
    }
  }
  
  private drawAxes(p: p5): void {
    p.stroke(this.colors.axis || this.colors.stroke);
    p.strokeWeight(2 / this.zoomLevel);
    
    // Calculate the visible world bounds
    const viewBounds = {
      left: -p.width / 2 / this.zoomLevel,
      right: p.width / 2 / this.zoomLevel,
      top: -p.height / 2 / this.zoomLevel,
      bottom: p.height / 2 / this.zoomLevel
    };
    
    if (this.isZoomed && this.zoomCenter) {
      viewBounds.left += this.zoomCenter.x;
      viewBounds.right += this.zoomCenter.x;
      viewBounds.top += this.zoomCenter.y;
      viewBounds.bottom += this.zoomCenter.y;
    }
    
    // Extend axes well beyond the visible area
    const axisExtent = p.max(p.width, p.height) * 2;
    
    // X-axis
    p.line(viewBounds.left - axisExtent, 0, viewBounds.right + axisExtent, 0);
    // Y-axis  
    p.line(0, viewBounds.top - axisExtent, 0, viewBounds.bottom + axisExtent);
    
    // Labels (only show when near default view)
    if (this.zoomLevel < 2) {
      p.fill(this.colors.text);
      p.noStroke();
      const gridSize = p.width / 12;
      p.textAlign(p.RIGHT, p.TOP);
      p.text('5', 5 * gridSize + 10, 10);
      p.text('-5', -5 * gridSize + 10, 10);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text('5', 10, -5 * gridSize + 10);
      p.text('-5', 10, 5 * gridSize - 10);
    }
  }

  private drawNeighborhood(p: p5, n: Neighborhood): void {
    // Draw outer neighborhood
    p.fill(this.outerColor);
    p.noStroke();
    p.circle(n.center.x, n.center.y, n.radius * 2);
    
    // Draw dashed border for outer neighborhood
    p.noFill();
    p.stroke(this.colors.axis || this.colors.stroke);
    p.strokeWeight(2 / this.zoomLevel);
    this.dashedCircle(p, n.center.x, n.center.y, n.radius * 2);
    
    // Draw center point
    p.fill(this.colors.axis || this.colors.stroke);
    p.noStroke();
    p.circle(n.center.x, n.center.y, 8 / this.zoomLevel);
    
    // Draw inner neighborhoods for each inner point
    for (const innerPoint of n.innerPoints) {
      p.fill(this.innerColor);
      p.noStroke();
      
      // Calculate radius to edge of outer neighborhood
      const distToCenter = p.dist(n.center.x, n.center.y, innerPoint.x, innerPoint.y);
      const innerRadius = n.radius - distToCenter;
      
      if (innerRadius > 0) {
        p.circle(innerPoint.x, innerPoint.y, innerRadius * 2);
        
        // Draw dashed border for inner neighborhood
        p.noFill();
        p.stroke(this.colors.axis || this.colors.stroke);
        p.strokeWeight(1.5 / this.zoomLevel);
        this.dashedCircle(p, innerPoint.x, innerPoint.y, innerRadius * 2);
        
        // Draw inner point
        p.fill(this.colors.axis || this.colors.stroke);
        p.noStroke();
        p.circle(innerPoint.x, innerPoint.y, 6 / this.zoomLevel);
      }
    }
  }

  private dashedCircle(p: p5, x: number, y: number, diameter: number): void {
    const radius = diameter / 2;
    
    // Calculate visual radius (how big it appears on screen)
    const visualRadius = radius * this.zoomLevel;
    const visualCircumference = p.TWO_PI * visualRadius;
    
    // Fixed visual dash and gap size in pixels
    const visualDashLength = 8;
    const visualGapLength = 6;
    const visualTotalLength = visualDashLength + visualGapLength;
    
    // Calculate how many dashes we need
    const numDashes = Math.floor(visualCircumference / visualTotalLength);
    
    // Calculate actual dash length in world coordinates
    const dashAngle = (visualDashLength / visualRadius);
    const gapAngle = (visualGapLength / visualRadius);
    const totalAngle = dashAngle + gapAngle;
    
    for (let i = 0; i < numDashes; i++) {
      const startAngle = i * totalAngle;
      const endAngle = startAngle + dashAngle;
      
      const x1 = x + radius * p.cos(startAngle);
      const y1 = y + radius * p.sin(startAngle);
      const x2 = x + radius * p.cos(endAngle);
      const y2 = y + radius * p.sin(endAngle);
      
      p.line(x1, y1, x2, y2);
    }
  }
  
  private handleMousePressed(p: p5): void {
    if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return;
    
    const worldPos = this.screenToWorld(p, p.mouseX, p.mouseY);
    
    if (this.state === 'waiting') {
      this.dragStart = worldPos;
      this.state = 'dragging_outer';
    } else if (this.state === 'waiting_inner' || this.state === 'complete') {
      // Check if click is inside the original neighborhood
      const outerN = this.neighborhoods[this.neighborhoods.length - 1];
      const d = p.dist(worldPos.x, worldPos.y, outerN.center.x, outerN.center.y);
      
      if (d < outerN.radius) {
        // Store a copy of the position to avoid reference issues
        outerN.innerPoints.push({x: worldPos.x, y: worldPos.y});
        this.state = 'complete';
      }
    }
  }

  private handleMouseDragged(p: p5): void {
    if (this.state === 'dragging_outer' && this.dragStart) {
      this.currentDrag = this.screenToWorld(p, p.mouseX, p.mouseY);
    }
  }

  private handleMouseReleased(p: p5): void {
    if (this.state === 'dragging_outer' && this.dragStart && this.currentDrag) {
      const radius = p.dist(this.dragStart.x, this.dragStart.y, this.currentDrag.x, this.currentDrag.y);
      
      if (radius > 10) { // Minimum radius
        this.neighborhoods.push({
          center: p.createVector(this.dragStart.x, this.dragStart.y),
          radius: radius,
          innerPoints: []
        });
        this.state = 'waiting_inner';
      } else {
        this.state = 'waiting';
      }
      
      this.dragStart = null;
      this.currentDrag = null;
    }
  }

  private screenToWorld(p: p5, x: number, y: number): p5.Vector {
    let wx = x - p.width/2;
    let wy = y - p.height/2;
    
    if (this.isZoomed && this.zoomCenter) {
      wx = wx / this.zoomLevel + this.zoomCenter.x;
      wy = wy / this.zoomLevel + this.zoomCenter.y;
    }
    
    return p.createVector(wx, wy);
  }

  private resetDemo(): void {
    this.neighborhoods = [];
    this.state = 'waiting';
    this.isZoomed = false;
    this.zoomLevel = 1;
    this.zoomCenter = null;
    this.dragStart = null;
    this.currentDrag = null;
  }

  private toggleZoom(): void {
    if (this.neighborhoods.length > 0 && this.neighborhoods[this.neighborhoods.length - 1].innerPoints.length > 0) {
      if (Math.abs(this.zoomLevel - 1) < 0.1) {
        // Only use button zoom if we're at default zoom
        const lastInnerPoint = this.neighborhoods[this.neighborhoods.length - 1].innerPoints[this.neighborhoods[this.neighborhoods.length - 1].innerPoints.length - 1];
        this.zoomCenter = this.p5Instance!.createVector(lastInnerPoint.x, lastInnerPoint.y);
        this.zoomLevel = 3;
        this.isZoomed = true;
      } else {
        // Reset zoom completely
        this.zoomLevel = 1;
        this.isZoomed = false;
        this.zoomCenter = null;
      }
    }
  }

  private updateInstruction(): void {
    let instructionText = '';
    
    switch(this.state) {
      case 'waiting':
        instructionText = 'Click and drag to create a neighborhood.';
        break;
      case 'dragging_outer':
        instructionText = 'Release to set the neighborhood radius.';
        break;
      case 'waiting_inner':
        instructionText = 'Click inside the neighborhood to show it contains interior points.';
        break;
      case 'complete':
        instructionText = 'Click more points inside the neighborhood to show they are all interior points. Every point in a neighborhood is interior, so neighborhoods are open!';
        break;
    }
    
    // Use the base class method to update instructions
    this.updateInstructions(`<p class="instruction">${instructionText}</p>`);
  }

  private handleMouseWheel(p: p5, event: any): boolean {
    // Only handle scroll if mouse is over the canvas
    if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
      return true; // Let the page scroll normally
    }
    
    // Prevent default scrolling
    event.preventDefault();
    
    // Get mouse position in world coordinates before zoom
    const mouseWorldBefore = this.screenToWorld(p, p.mouseX, p.mouseY);
    
    // Calculate zoom change (positive delta = zoom out, negative = zoom in)
    const zoomDelta = event.delta * 0.01;
    const newZoom = p.constrain(this.zoomLevel * (1 + zoomDelta), this.minZoom, this.maxZoom);
    
    if (newZoom !== this.zoomLevel) {
      const oldZoom = this.zoomLevel;
      this.zoomLevel = newZoom;
      
      // Adjust zoom center to keep mouse position fixed
      if (this.zoomLevel !== 1) {
        if (!this.isZoomed) {
          // First time zooming - use (0,0) as initial center
          this.zoomCenter = p.createVector(0, 0);
          this.isZoomed = true;
        }
        // Always adjust zoom center to keep point under mouse stationary
        const zoomRatio = this.zoomLevel / oldZoom;
        this.zoomCenter!.x = mouseWorldBefore.x - (mouseWorldBefore.x - this.zoomCenter!.x) / zoomRatio;
        this.zoomCenter!.y = mouseWorldBefore.y - (mouseWorldBefore.y - this.zoomCenter!.y) / zoomRatio;
      } else {
        // Reset zoom
        this.isZoomed = false;
        this.zoomCenter = null;
      }
    }
    
    return false; // Prevent page scroll
  }
}

export const metadata: DemoMetadata = {
  title: 'Neighborhood in Metric Spaces',
  category: 'Topology',
  description: 'Interactive visualization demonstrating that every neighborhood in a metric space is an open set',
  instructions: `<p class="instruction">Click and drag to create a neighborhood.</p>`
};

export default function initNeighborhoodDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new NeighborhoodDemo(container, config);
  return demo.init();
}
