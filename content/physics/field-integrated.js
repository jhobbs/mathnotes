// Electric field simulation - version for direct integration
// This version is scoped to work within a demo container

var particles = [];
var forces = [];
var numForces = 30;
var moveParticles = false;

function setup() {
    noStroke()
    
    // Find the container within the current demo component
    const currentScript = document.currentScript || document.querySelector('script[src*="field-integrated.js"]');
    const demoContainer = currentScript ? currentScript.closest('.demo-component') : document.querySelector('.demo-component');
    const fieldElement = demoContainer ? demoContainer.querySelector('#field') : document.getElementById('field');
    
    // Use container width instead of half window width for better mobile experience
    let containerWidth = windowWidth;
    if (demoContainer) {
        containerWidth = demoContainer.offsetWidth;
    }
    
    // Use full container width, but cap height for reasonable viewing
    let canvasHeight = Math.min(windowHeight * 0.6, containerWidth * 0.6);
    let canvas = createCanvas(containerWidth, canvasHeight);
    
    if (fieldElement) {
        canvas.parent(fieldElement);
    } else {
        canvas.parent("field");
    }
    
    background(51);
    frameRate(60);

    for (let i = width / numForces; i < width; i += width / numForces) {
        for (let j = height / numForces; j < height; j += height / numForces) {
            forces.push(new Force(i, j))
        }
    }
}

function draw() {
    colorMode(RGB)
    background(51);
    noStroke();
    for (let i = 0; i < particles.length; i++) {
        particles[i].paint();
    }

    if (moveParticles) {
        for (let i = 0; i < particles.length; i++) {
            let particlePos = particles[i].p;
            let particleCharge = particles[i].m;

            let electroStatic = getElectrostaticForce(particles, createVector(particlePos.x, particlePos.y), particleCharge)
            particles[i].addPos(electroStatic)
        }
    }

    stroke(250);
    strokeWeight(2);
    colorMode(HSB);
    for (let i = 0; i < forces.length; i++) {
        forces[i].update(particles);
        forces[i].paint();
    }
}

function getElectrostaticForce(charges, point, charge) {
    resultingVector = createVector(0, 0)

    for (let i = 0; i < charges.length; i++) {
        let mPos = charges[i].p;
        let mCharge = charges[i].m * 100;
        let distance = dist(mPos.x, mPos.y, point.x, point.y);

        let cosI = sin(abs(mPos.x - point.x) / distance);
        let sinJ = sin(abs(mPos.y - point.y) / distance);

        if (point.x < mPos.x)
            cosI = -cosI
        if (point.y < mPos.y)
            sinJ = -sinJ

        resultingVector.add(createVector(
            ((-charge * mCharge) / pow(distance, 2)) * cosI,
            ((-charge * mCharge) / pow(distance, 2)) * sinJ));
    }

    return resultingVector;
}

// Add particle on click
function mouseClicked() {
    let sgn = -1;
    if (keyCode === DOWN_ARROW) {
        sgn = 1;
    }
    particles.push(new Particle(mouseX, mouseY, sgn * 15))
}

function arrow(x1, y1, x2, y2, offset) {
    line(x1,y1,x2,y2)
    push() //start new drawing state
    var angle = atan2(y1 - y2, x1 - x2); //gets the angle of the line
    translate(x2, y2); //translates to the destination vertex
    rotate(angle - HALF_PI); //rotates the arrow point
    triangle(-offset * 0.6, offset*1.5, offset * 0.6, offset*1.5, 0, 0); //draws the arrow point as a triangle
    pop();
}

class Force {
    constructor(xPos, yPos) {
        this.pos = createVector(xPos, yPos);
        this.mag = createVector(0, 0)
    }

    update(charges) {
        this.mag = getElectrostaticForce(charges, this.pos, -1)
    }
    paint() {
        let distance = dist(this.pos.x, this.pos.y, this.pos.x + this.mag.x * 100, this.pos.y + this.mag.y * 100)
        stroke(map(distance, 0, 50, 150, 255), 255, 100)
        arrow(this.pos.x, this.pos.y, this.pos.x - this.mag.x * 500, this.pos.y - this.mag.y * 500, 3);
    }
}

function keyPressed() {
    if (keyCode === 32) {
        moveParticles = !moveParticles;
    }
}

class Particle {
    constructor(xPos, yPos, charge) {
        this.pos = createVector(xPos, yPos);
        this.charge = charge;

        this.inertia = createVector(0, 0);
        if (charge > 0) {
            this.color = color(255, 0, 0);
        } else {
            this.color = color(0, 0, 255);
        }
    }

    paint() {
        fill(this.color)
        circle(this.pos.x, this.pos.y, sqrt(abs(this.charge) * 100 / PI) - 5);
    }

    get m() {
        return this.charge;
    }

    addM(charge) {
        this.charge += charge;
    }

    get p() {
        return this.pos;
    }

    addPos(force) {
        this.inertia.add(force)
        this.pos.sub(this.inertia)
    }
}