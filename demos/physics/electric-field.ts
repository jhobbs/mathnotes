// Electric field simulation - TypeScript module version
import p5 from 'p5';
import type { DemoInstance, DemoConfig } from '@framework/types';
import { P5DemoBase } from '@framework';

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
  paint(p: p5, colors: any): void;
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
    
    // Color will be set by the demo class using theme colors
    this.color = p.color(0); // Placeholder
  }
  
  paint(p: p5): void {
    p.noStroke();
    p.fill(this.color);
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
  
  paint(p: p5, colors: any): void {
    const distance = p.dist(this.pos.x, this.pos.y, this.pos.x + this.mag.x * 100, this.pos.y + this.mag.y * 100);
    // Use theme colors for the field lines
    const alpha = p.map(distance, 0, 50, 100, 255);
    const fieldColor = p.color(colors.grid);
    fieldColor.setAlpha(alpha);
    p.stroke(fieldColor);
    p.fill(fieldColor); // Set fill color for arrow heads
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
  private positiveColor!: p5.Color;
  private negativeColor!: p5.Color;
  
  protected getStylePrefix(): string {
    return 'electric-field';
  }
  
  protected getAspectRatio(): number {
    return 0.65;
  }
  
  constructor(container: HTMLElement, config?: DemoConfig) {
    super(container, config);
    
    // Add instructions
    const instructionsDiv = document.createElement('div');
    instructionsDiv.className = `${this.getStylePrefix()}-instructions demo-info`;
    instructionsDiv.style.marginTop = '20px';
    instructionsDiv.style.textAlign = 'center';
    instructionsDiv.innerHTML = `
      <p><strong>Instructions:</strong> Click to place negative charges. 
      Ctrl+Click to place positive charges. 
      Press spacebar to toggle particle movement.</p>
    `;
    this.container.appendChild(instructionsDiv);
  }
  
  protected createSketch(p: p5): void {
    p.setup = () => {
      p.noStroke();
      
      // Set up theme colors for charges
      this.positiveColor = this.colors.accent;
      // Create a complementary color for negative charges
      const h = p.hue(this.colors.accent);
      const s = p.saturation(this.colors.accent);
      const b = p.brightness(this.colors.accent);
      p.colorMode(p.HSB);
      this.negativeColor = p.color((h + 180) % 360, s, b);
      p.colorMode(p.RGB);
      
      p.background(this.colors.background);
      p.frameRate(60);
      
      // Initialize force field grid
      for (let i = p.width / this.numForces; i < p.width; i += p.width / this.numForces) {
        for (let j = p.height / this.numForces; j < p.height; j += p.height / this.numForces) {
          this.forces.push(new ForceImpl(p, i, j));
        }
      }
    };
    
    p.draw = () => {
      p.background(this.colors.background);
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
      p.strokeWeight(2);
      for (let i = 0; i < this.forces.length; i++) {
        this.forces[i].update(this.particles);
        this.forces[i].paint(p, this.colors);
      }
    };
    
    p.mouseClicked = () => {
      let sgn = -1; // Default to negative charge
      if (p.keyIsDown(p.CONTROL)) {
        sgn = 1; // Positive charge when Ctrl is held
      }
      const particle = new ParticleImpl(p, p.mouseX, p.mouseY, sgn * 15);
      // Set the color based on charge
      particle.color = sgn > 0 ? this.positiveColor : this.negativeColor;
      this.particles.push(particle);
    };
    
    p.keyPressed = () => {
      if (p.keyCode === 32) { // Spacebar
        this.moveParticles = !this.moveParticles;
        return false; // Prevent default behavior
      }
      return true; // Allow default behavior for other keys
    };
    
  }
  
  protected onResize(p: p5, size: CanvasSize): void {
    // Reinitialize force field grid with new dimensions
    this.forces = [];
    for (let i = p.width / this.numForces; i < p.width; i += p.width / this.numForces) {
      for (let j = p.height / this.numForces; j < p.height; j += p.height / this.numForces) {
        this.forces.push(new ForceImpl(p, i, j));
      }
    }
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

export const metadata = {
  title: 'Electric Field',
  category: 'Physics',
  description: 'Interactive simulation of electric field lines and charged particles'
};

export default function initElectricFieldDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new ElectricFieldDemo(container, config);
  return demo.init();
}