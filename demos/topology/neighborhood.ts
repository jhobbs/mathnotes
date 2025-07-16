// Neighborhood demo - Interactive visualization for metric spaces
import p5 from 'p5';
import type { DemoInstance, DemoConfig } from '@framework/types';

interface Neighborhood {
  center: p5.Vector;
  radius: number;
  innerPoints: { x: number; y: number }[];
}

export default function initNeighborhoodDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  let p5Instance: p5 | null = null;
  let neighborhoods: Neighborhood[] = [];
  let zoomLevel = 1;
  let zoomCenter: p5.Vector | null = null;
  let isZoomed = false;
  let dragStart: p5.Vector | null = null;
  let currentDrag: p5.Vector | null = null;
  let state: 'waiting' | 'dragging_outer' | 'waiting_inner' | 'complete' = 'waiting';
  const minZoom = 0.5;
  const maxZoom = 100;

  // Colors
  let bgColor: p5.Color;
  let axisColor: p5.Color;
  let gridColor: p5.Color;
  let outerColor: p5.Color;
  let innerColor: p5.Color;
  let textColor: p5.Color;

  // Create style element for dark mode support
  const style = document.createElement('style');
  style.textContent = `
    #neighborhood-container .demo-button {
      padding: 5px 10px;
      margin: 0 5px;
      cursor: pointer;
      background-color: #f0f0f0;
      color: #333;
      border: 1px solid #ccc;
      border-radius: 3px;
    }
    
    #neighborhood-container .demo-info {
      color: #333;
    }
    
    @media (prefers-color-scheme: dark) {
      #neighborhood-container .demo-button {
        background-color: #444;
        color: #e0e0e0;
        border-color: #666;
      }
      
      #neighborhood-container .demo-button:hover {
        background-color: #555;
      }
      
      #neighborhood-container .demo-info {
        color: #e0e0e0;
      }
    }
  `;
  container.appendChild(style);
  
  // Create the HTML structure
  const neighborhoodContainer = document.createElement('div');
  neighborhoodContainer.id = 'neighborhood-container';
  neighborhoodContainer.style.textAlign = 'center';
  
  const sketchHolder = document.createElement('div');
  sketchHolder.id = `neighborhood-sketch-holder-${Date.now()}`;
  
  const controls = document.createElement('div');
  controls.id = 'controls';
  controls.style.marginTop = '20px';
  
  const resetBtn = document.createElement('button');
  resetBtn.id = `reset-btn-${Date.now()}`;
  resetBtn.textContent = 'Reset';
  resetBtn.className = 'demo-button';
  
  const zoomToggle = document.createElement('button');
  zoomToggle.id = `zoom-toggle-${Date.now()}`;
  zoomToggle.textContent = 'Toggle Zoom';
  zoomToggle.className = 'demo-button';
  
  controls.appendChild(resetBtn);
  controls.appendChild(zoomToggle);
  
  const info = document.createElement('div');
  info.id = 'info';
  info.className = 'demo-info';
  info.style.marginTop = '20px';
  info.innerHTML = `
    <h3>Every Neighborhood is Open</h3>
    <p>This demonstration shows that every neighborhood in a metric space is an open set.</p>
    <p class="instruction" id="instruction-${Date.now()}">Click and drag to create a neighborhood.</p>
    <p>A set is <strong>open</strong> if every point in the set is an interior point. A point is an <strong>interior point</strong> if there exists a neighborhood around it that is entirely contained within the set.</p>
    <p style="font-size: 0.9em; opacity: 0.8;">Use trackpad/mouse wheel to zoom in and out</p>
  `;
  
  neighborhoodContainer.appendChild(sketchHolder);
  neighborhoodContainer.appendChild(controls);
  neighborhoodContainer.appendChild(info);
  container.appendChild(neighborhoodContainer);

  const sketch = (p: p5) => {
    let canvas: p5.Renderer;

    p.setup = () => {
      canvas = p.createCanvas(600, 600);
      canvas.parent(sketchHolder);
      
      // Set up colors
      updateColors();
      
      // Add event listeners for buttons
      resetBtn.addEventListener('click', resetDemo);
      zoomToggle.addEventListener('click', toggleZoom);
      
      p.smooth();
    };

    function updateColors() {
      // Check if dark mode
      const isDark = config?.darkMode ?? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        bgColor = p.color(30, 30, 30);
        axisColor = p.color(200);
        gridColor = p.color(60);
        outerColor = p.color(100, 150, 255, 100);
        innerColor = p.color(255, 150, 100, 120);
        textColor = p.color(220);
      } else {
        bgColor = p.color(255);
        axisColor = p.color(50);
        gridColor = p.color(200);
        outerColor = p.color(50, 100, 200, 80);
        innerColor = p.color(200, 100, 50, 100);
        textColor = p.color(50);
      }
    }

    p.draw = () => {
      p.background(bgColor);
      
      p.push();
      p.translate(p.width/2, p.height/2);
      
      if (isZoomed && zoomCenter) {
        p.scale(zoomLevel);
        p.translate(-zoomCenter.x, -zoomCenter.y);
      }
      
      // Draw grid
      drawGrid();
      
      // Draw axes
      drawAxes();
      
      // Draw existing neighborhoods
      for (const n of neighborhoods) {
        drawNeighborhood(n);
      }
      
      // Draw current drag
      if (state === 'dragging_outer' && dragStart && currentDrag) {
        const radius = p.dist(dragStart.x, dragStart.y, currentDrag.x, currentDrag.y);
        p.fill(outerColor);
        p.noStroke();
        p.circle(dragStart.x, dragStart.y, radius * 2);
        
        // Draw center point
        p.fill(axisColor);
        p.circle(dragStart.x, dragStart.y, 8 / zoomLevel);
      }
      
      p.pop();
      
      // Update instruction text
      updateInstruction();
    };

    function drawGrid() {
      p.stroke(gridColor);
      p.strokeWeight(0.5 / zoomLevel);
      
      const gridSize = 50;
      
      // Calculate the visible world bounds
      const viewBounds = {
        left: -p.width / zoomLevel,
        right: p.width / zoomLevel,
        top: -p.height / zoomLevel,
        bottom: p.height / zoomLevel
      };
      
      if (isZoomed && zoomCenter) {
        viewBounds.left += zoomCenter.x;
        viewBounds.right += zoomCenter.x;
        viewBounds.top += zoomCenter.y;
        viewBounds.bottom += zoomCenter.y;
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

    function drawAxes() {
      p.stroke(axisColor);
      p.strokeWeight(2 / zoomLevel);
      
      // Calculate the visible world bounds
      const viewBounds = {
        left: -p.width / zoomLevel,
        right: p.width / zoomLevel,
        top: -p.height / zoomLevel,
        bottom: p.height / zoomLevel
      };
      
      if (isZoomed && zoomCenter) {
        viewBounds.left += zoomCenter.x;
        viewBounds.right += zoomCenter.x;
        viewBounds.top += zoomCenter.y;
        viewBounds.bottom += zoomCenter.y;
      }
      
      // Extend axes well beyond the visible area
      const axisExtent = p.max(p.width, p.height) * 2;
      
      // X-axis
      p.line(viewBounds.left - axisExtent, 0, viewBounds.right + axisExtent, 0);
      // Y-axis  
      p.line(0, viewBounds.top - axisExtent, 0, viewBounds.bottom + axisExtent);
      
      // Labels (only show when near default view)
      if (zoomLevel < 2) {
        p.fill(textColor);
        p.noStroke();
        p.textAlign(p.RIGHT, p.TOP);
        p.text('5', p.width/2 - 10, 10);
        p.text('-5', -p.width/2 + 30, 10);
        p.textAlign(p.LEFT, p.BOTTOM);
        p.text('5', 10, -p.height/2 + 20);
        p.text('-5', 10, p.height/2 - 10);
      }
    }

    function drawNeighborhood(n: Neighborhood) {
      // Draw outer neighborhood
      p.fill(outerColor);
      p.noStroke();
      p.circle(n.center.x, n.center.y, n.radius * 2);
      
      // Draw dashed border for outer neighborhood
      p.noFill();
      p.stroke(axisColor);
      p.strokeWeight(2 / zoomLevel);
      dashedCircle(n.center.x, n.center.y, n.radius * 2);
      
      // Draw center point
      p.fill(axisColor);
      p.noStroke();
      p.circle(n.center.x, n.center.y, 8 / zoomLevel);
      
      // Draw inner neighborhoods for each inner point
      for (const innerPoint of n.innerPoints) {
        p.fill(innerColor);
        p.noStroke();
        
        // Calculate radius to edge of outer neighborhood
        const distToCenter = p.dist(n.center.x, n.center.y, innerPoint.x, innerPoint.y);
        const innerRadius = n.radius - distToCenter;
        
        if (innerRadius > 0) {
          p.circle(innerPoint.x, innerPoint.y, innerRadius * 2);
          
          // Draw dashed border for inner neighborhood
          p.noFill();
          p.stroke(axisColor);
          p.strokeWeight(1.5 / zoomLevel);
          dashedCircle(innerPoint.x, innerPoint.y, innerRadius * 2);
          
          // Draw inner point
          p.fill(axisColor);
          p.noStroke();
          p.circle(innerPoint.x, innerPoint.y, 6 / zoomLevel);
        }
      }
    }

    function dashedCircle(x: number, y: number, diameter: number) {
      const radius = diameter / 2;
      
      // Calculate visual radius (how big it appears on screen)
      const visualRadius = radius * zoomLevel;
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

    p.mousePressed = () => {
      if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return;
      
      const worldPos = screenToWorld(p.mouseX, p.mouseY);
      
      if (state === 'waiting') {
        dragStart = worldPos;
        state = 'dragging_outer';
      } else if (state === 'waiting_inner' || state === 'complete') {
        // Check if click is inside the original neighborhood
        const outerN = neighborhoods[neighborhoods.length - 1];
        const d = p.dist(worldPos.x, worldPos.y, outerN.center.x, outerN.center.y);
        
        if (d < outerN.radius) {
          // Store a copy of the position to avoid reference issues
          outerN.innerPoints.push({x: worldPos.x, y: worldPos.y});
          state = 'complete';
        }
      }
    };

    p.mouseDragged = () => {
      if (state === 'dragging_outer' && dragStart) {
        currentDrag = screenToWorld(p.mouseX, p.mouseY);
      }
    };

    p.mouseReleased = () => {
      if (state === 'dragging_outer' && dragStart && currentDrag) {
        const radius = p.dist(dragStart.x, dragStart.y, currentDrag.x, currentDrag.y);
        
        if (radius > 10) { // Minimum radius
          neighborhoods.push({
            center: p.createVector(dragStart.x, dragStart.y),
            radius: radius,
            innerPoints: []
          });
          state = 'waiting_inner';
        } else {
          state = 'waiting';
        }
        
        dragStart = null;
        currentDrag = null;
      }
    };

    function screenToWorld(x: number, y: number): p5.Vector {
      let wx = x - p.width/2;
      let wy = y - p.height/2;
      
      if (isZoomed && zoomCenter) {
        wx = wx / zoomLevel + zoomCenter.x;
        wy = wy / zoomLevel + zoomCenter.y;
      }
      
      return p.createVector(wx, wy);
    }

    function resetDemo() {
      neighborhoods = [];
      state = 'waiting';
      isZoomed = false;
      zoomLevel = 1;
      zoomCenter = null;
      dragStart = null;
      currentDrag = null;
    }

    function toggleZoom() {
      if (neighborhoods.length > 0 && neighborhoods[neighborhoods.length - 1].innerPoints.length > 0) {
        if (Math.abs(zoomLevel - 1) < 0.1) {
          // Only use button zoom if we're at default zoom
          const lastInnerPoint = neighborhoods[neighborhoods.length - 1].innerPoints[neighborhoods[neighborhoods.length - 1].innerPoints.length - 1];
          zoomCenter = p.createVector(lastInnerPoint.x, lastInnerPoint.y);
          zoomLevel = 3;
          isZoomed = true;
        } else {
          // Reset zoom completely
          zoomLevel = 1;
          isZoomed = false;
          zoomCenter = null;
        }
      }
    }

    function updateInstruction() {
      const instruction = info.querySelector('.instruction');
      if (!instruction) return;
      
      switch(state) {
        case 'waiting':
          instruction.textContent = 'Click and drag to create a neighborhood.';
          break;
        case 'dragging_outer':
          instruction.textContent = 'Release to set the neighborhood radius.';
          break;
        case 'waiting_inner':
          instruction.textContent = 'Click inside the neighborhood to show it contains interior points.';
          break;
        case 'complete':
          instruction.textContent = 'Click more points inside the neighborhood to show they are all interior points. Every point in a neighborhood is interior, so neighborhoods are open!';
          break;
      }
    }

    // Listen for color scheme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        config = { ...config, darkMode: e.matches };
        updateColors();
      });
    }

    // Handle wheel events for zooming
    p.mouseWheel = (event: any) => {
      // Only handle scroll if mouse is over the canvas
      if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
        return; // Let the page scroll normally
      }
      
      // Prevent default scrolling
      event.preventDefault();
      
      // Get mouse position in world coordinates before zoom
      const mouseWorldBefore = screenToWorld(p.mouseX, p.mouseY);
      
      // Calculate zoom change (positive delta = zoom out, negative = zoom in)
      const zoomDelta = event.delta * 0.01;
      const newZoom = p.constrain(zoomLevel * (1 + zoomDelta), minZoom, maxZoom);
      
      if (newZoom !== zoomLevel) {
        const oldZoom = zoomLevel;
        zoomLevel = newZoom;
        
        // Adjust zoom center to keep mouse position fixed
        if (zoomLevel !== 1) {
          if (!isZoomed) {
            // First time zooming - use (0,0) as initial center
            zoomCenter = p.createVector(0, 0);
            isZoomed = true;
          }
          // Always adjust zoom center to keep point under mouse stationary
          const zoomRatio = zoomLevel / oldZoom;
          zoomCenter!.x = mouseWorldBefore.x - (mouseWorldBefore.x - zoomCenter!.x) / zoomRatio;
          zoomCenter!.y = mouseWorldBefore.y - (mouseWorldBefore.y - zoomCenter!.y) / zoomRatio;
        } else {
          // Reset zoom
          isZoomed = false;
          zoomCenter = null;
        }
      }
      
      return false; // Prevent page scroll
    };
  };

  // Initialize p5 instance
  p5Instance = new p5(sketch);

  return {
    cleanup: () => {
      if (p5Instance) {
        p5Instance.remove();
        p5Instance = null;
      }
      container.innerHTML = '';
    },
    
    resize: () => {
      // Canvas is fixed size in this demo
    }
  };
}