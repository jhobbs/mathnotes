// Electric field simulation - TypeScript module version
import p5 from 'p5';
import type { DemoInstance, DemoConfig } from '@framework/types';
import { createDemoContainer, P5DemoBase, getResponsiveCanvasSize } from '@framework';

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

class ElectricFieldDemo extends P5DemoBase {
  private particles: Particle[] = [];
  private forces: Force[] = [];
  private numForces = 30;
  private moveParticles = false;
  private canvasParent: HTMLElement;
  
  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config);
    const { canvasParent } = createDemoContainer(container, { center: true });
    this.canvasParent = canvasParent;
  }
  
  protected createSketch(p: p5): void {
    p.setup = () => {
      p.noStroke();
      
      // Responsive sizing
      const { width, height } = getResponsiveCanvasSize(this.container, this.config, 0.65);
      const canvas = p.createCanvas(width, height);
      canvas.parent(this.canvasParent);
      
      p.background(51);
      p.frameRate(60);
      
      // Initialize force field grid
      for (let i = p.width / this.numForces; i < p.width; i += p.width / this.numForces) {
        for (let j = p.height / this.numForces; j < p.height; j += p.height / this.numForces) {
          this.forces.push(new ForceImpl(p, i, j));
        }
      }
    };
    
    p.draw = () => {
      p.colorMode(p.RGB);
      p.background(51);
      p.noStroke();
      
      // Draw particles
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].paint(p);
      }
      
      // Move particles if enabled
      if (this.moveParticles) {
        for (let i = 0; i < this.particles.length; i++) {
          const particlePos = this.particles[i].p;
          const particleCharge = this.particles[i].m;
          const electroStatic = getElectrostaticForce(p, this.particles, p.createVector(particlePos.x, particlePos.y), particleCharge);
          this.particles[i].addPos(electroStatic);
        }
      }
      
      // Draw force field
      p.stroke(250);
      p.strokeWeight(2);
      p.colorMode(p.HSB);
      for (let i = 0; i < this.forces.length; i++) {
        this.forces[i].update(this.particles);
        this.forces[i].paint(p);
      }
    };
    
    p.mouseClicked = () => {
      let sgn = -1; // Default to negative charge
      if (p.keyIsDown(p.CONTROL)) {
        sgn = 1; // Positive charge when Ctrl is held
      }
      this.particles.push(new ParticleImpl(p, p.mouseX, p.mouseY, sgn * 15));
    };
    
    p.keyPressed = () => {
      if (p.keyCode === 32) { // Spacebar
        this.moveParticles = !this.moveParticles;
        return false; // Prevent default behavior
      }
      return true; // Allow default behavior for other keys
    };
    
    p.windowResized = () => {
      const { width, height } = getResponsiveCanvasSize(this.container, this.config, 0.65);
      p.resizeCanvas(width, height);
    };
  }
  
  init(): DemoInstance {
    // Prevent spacebar from scrolling the page
    const preventSpaceScroll = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.keyCode === 32) {
        event.preventDefault();
      }
    };
    
    this.addEventListener(document, 'keydown', preventSpaceScroll as EventListener, { capture: true });
    
    return super.init();
  }
}

export default function initElectricFieldDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new ElectricFieldDemo(container, config);
  return demo.init();
}