// Electric field simulation - TypeScript module version
import p5 from 'p5';
import type { DemoInstance, DemoConfig } from '../types';

interface Particle {
  pos: p5.Vector;
  charge: number;
  inertia: p5.Vector;
  color: p5.Color;
  
  paint(p: p5): void;
  get m(): number;
  addM(charge: number): void;
  get p(): p5.Vector;
  addPos(force: p5.Vector): void;
}

interface Force {
  pos: p5.Vector;
  mag: p5.Vector;
  
  update(charges: Particle[]): void;
  paint(p: p5): void;
}

class ParticleImpl implements Particle {
  pos: p5.Vector;
  charge: number;
  inertia: p5.Vector;
  color: p5.Color;
  
  constructor(p: p5, xPos: number, yPos: number, charge: number) {
    this.pos = p.createVector(xPos, yPos);
    this.charge = charge;
    this.inertia = p.createVector(0, 0);
    
    if (charge > 0) {
      this.color = p.color(255, 0, 0); // Red for positive
    } else {
      this.color = p.color(0, 0, 255); // Blue for negative
    }
  }
  
  paint(p: p5): void {
    p.colorMode(p.RGB); // Ensure RGB mode for particle colors
    p.noStroke();
    if (this.charge > 0) {
      p.fill(255, 0, 0); // Red for positive
    } else {
      p.fill(0, 0, 255); // Blue for negative
    }
    p.circle(this.pos.x, this.pos.y, p.sqrt(p.abs(this.charge) * 100 / p.PI) - 5);
  }
  
  get m(): number {
    return this.charge;
  }
  
  addM(charge: number): void {
    this.charge += charge;
  }
  
  get p(): p5.Vector {
    return this.pos;
  }
  
  addPos(force: p5.Vector): void {
    this.inertia.add(force);
    this.pos.sub(this.inertia);
  }
}

class ForceImpl implements Force {
  pos: p5.Vector;
  mag: p5.Vector;
  private p: p5;
  
  constructor(p: p5, xPos: number, yPos: number) {
    this.p = p;
    this.pos = p.createVector(xPos, yPos);
    this.mag = p.createVector(0, 0);
  }
  
  update(charges: Particle[]): void {
    this.mag = getElectrostaticForce(this.p, charges, this.pos, -1);
  }
  
  paint(p: p5): void {
    const distance = p.dist(this.pos.x, this.pos.y, this.pos.x + this.mag.x * 100, this.pos.y + this.mag.y * 100);
    p.stroke(p.map(distance, 0, 50, 150, 255), 255, 100);
    arrow(p, this.pos.x, this.pos.y, this.pos.x - this.mag.x * 200, this.pos.y - this.mag.y * 200, 3);
  }
}

function getElectrostaticForce(p: p5, charges: Particle[], point: p5.Vector, charge: number): p5.Vector {
  const resultingVector = p.createVector(0, 0);
  
  for (let i = 0; i < charges.length; i++) {
    const mPos = charges[i].p;
    const mCharge = charges[i].m * 100;
    const distance = p.dist(mPos.x, mPos.y, point.x, point.y);
    
    let cosI = p.sin(p.abs(mPos.x - point.x) / distance);
    let sinJ = p.sin(p.abs(mPos.y - point.y) / distance);
    
    if (point.x < mPos.x) cosI = -cosI;
    if (point.y < mPos.y) sinJ = -sinJ;
    
    resultingVector.add(p.createVector(
      ((-charge * mCharge) / p.pow(distance, 2)) * cosI,
      ((-charge * mCharge) / p.pow(distance, 2)) * sinJ
    ));
  }
  
  return resultingVector;
}

function arrow(p: p5, x1: number, y1: number, x2: number, y2: number, offset: number): void {
  p.line(x1, y1, x2, y2);
  p.push(); // start new drawing state
  const angle = p.atan2(y1 - y2, x1 - x2); // gets the angle of the line
  p.translate(x2, y2); // translates to the destination vertex
  p.rotate(angle - p.HALF_PI); // rotates the arrow point
  p.triangle(-offset * 0.6, offset * 1.5, offset * 0.6, offset * 1.5, 0, 0); // draws the arrow point as a triangle
  p.pop();
}

export default function initElectricFieldDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  let p5Instance: p5 | null = null;
  let particles: Particle[] = [];
  let forces: Force[] = [];
  const numForces = 30;
  let moveParticles = false;
  
  // Create a div for the canvas
  const canvasContainer = document.createElement('div');
  canvasContainer.style.textAlign = 'center';
  canvasContainer.id = `field-${Date.now()}`;
  container.appendChild(canvasContainer);
  
  const sketch = (p: p5) => {
    p.setup = () => {
      p.noStroke();
      
      // Responsive sizing
      let canvasWidth: number, canvasHeight: number;
      
      if (p.windowWidth < 768) {
        // Mobile: use full window width minus small margin with reasonable height
        canvasWidth = p.windowWidth - 20;
        canvasHeight = (p.windowWidth - 20) * 0.65;
      } else {
        // Desktop: use config or container-based sizing
        canvasWidth = config?.width || container.offsetWidth - 20 || p.windowWidth * 0.8;
        canvasHeight = config?.height || canvasWidth * 0.6;
      }
      
      const canvas = p.createCanvas(canvasWidth, canvasHeight);
      canvas.parent(canvasContainer);
      
      p.background(51);
      p.frameRate(60);
      
      // Initialize force field grid
      for (let i = p.width / numForces; i < p.width; i += p.width / numForces) {
        for (let j = p.height / numForces; j < p.height; j += p.height / numForces) {
          forces.push(new ForceImpl(p, i, j));
        }
      }
    };
    
    p.draw = () => {
      p.colorMode(p.RGB);
      p.background(51);
      p.noStroke();
      
      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].paint(p);
      }
      
      // Move particles if enabled
      if (moveParticles) {
        for (let i = 0; i < particles.length; i++) {
          const particlePos = particles[i].p;
          const particleCharge = particles[i].m;
          const electroStatic = getElectrostaticForce(p, particles, p.createVector(particlePos.x, particlePos.y), particleCharge);
          particles[i].addPos(electroStatic);
        }
      }
      
      // Draw force field
      p.stroke(250);
      p.strokeWeight(2);
      p.colorMode(p.HSB);
      for (let i = 0; i < forces.length; i++) {
        forces[i].update(particles);
        forces[i].paint(p);
      }
    };
    
    p.mouseClicked = () => {
      let sgn = -1; // Default to negative charge
      if (p.keyIsDown(p.CONTROL)) {
        sgn = 1; // Positive charge when Ctrl is held
      }
      particles.push(new ParticleImpl(p, p.mouseX, p.mouseY, sgn * 15));
    };
    
    p.keyPressed = () => {
      if (p.keyCode === 32) { // Spacebar
        moveParticles = !moveParticles;
        return false; // Prevent default behavior
      }
    };
    
    p.windowResized = () => {
      if (config?.width && config?.height) {
        // If fixed size is specified, don't resize
        return;
      }
      
      let canvasWidth: number, canvasHeight: number;
      
      if (p.windowWidth < 768) {
        canvasWidth = p.windowWidth - 20;
        canvasHeight = (p.windowWidth - 20) * 0.65;
      } else {
        canvasWidth = container.offsetWidth - 20 || p.windowWidth * 0.8;
        canvasHeight = canvasWidth * 0.6;
      }
      
      p.resizeCanvas(canvasWidth, canvasHeight);
    };
  };
  
  // Initialize p5 instance
  p5Instance = new p5(sketch);
  
  // Prevent spacebar from scrolling the page
  const preventSpaceScroll = (event: KeyboardEvent) => {
    if (event.code === 'Space' || event.keyCode === 32) {
      event.preventDefault();
    }
  };
  
  document.addEventListener('keydown', preventSpaceScroll, true);
  
  return {
    cleanup: () => {
      if (p5Instance) {
        p5Instance.remove();
        p5Instance = null;
      }
      document.removeEventListener('keydown', preventSpaceScroll, true);
      container.innerHTML = '';
    },
    
    resize: () => {
      if (p5Instance && p5Instance.windowResized) {
        p5Instance.windowResized();
      }
    },
    
    pause: () => {
      if (p5Instance) {
        p5Instance.noLoop();
      }
    },
    
    resume: () => {
      if (p5Instance) {
        p5Instance.loop();
      }
    }
  };
}