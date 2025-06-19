// Electric field simulation - version for direct integration
// This version is scoped to work within a demo container

var particles = [];
var forces = [];
var numForces = 30;
var moveParticles = false;

function setup() {
    noStroke()
    
    // Get container elements first
    const fieldElement = document.getElementById('field');
    const demoContainer = document.querySelector('.demo-component');
    
    // Simple responsive sizing - use full width on mobile
    let canvasWidth, canvasHeight;
    
    if (windowWidth < 768) {
        // Mobile: use full window width minus small margin with reasonable height
        canvasWidth = windowWidth - 20;
        canvasHeight = (windowWidth - 20) * 0.65;
    } else {
        // Desktop: use container-based sizing
        const container = fieldElement || demoContainer;
        canvasWidth = container ? container.offsetWidth - 20 : windowWidth * 0.8;
        canvasHeight = canvasWidth * 0.6;
    }
    
    let canvas = createCanvas(canvasWidth, canvasHeight);
    
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
    let sgn = -1; // Default to negative charge
    if (keyIsDown(CONTROL)) {
        sgn = 1; // Positive charge when Ctrl is held
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
        arrow(this.pos.x, this.pos.y, this.pos.x - this.mag.x * 200, this.pos.y - this.mag.y * 200, 3);
    }
}

function keyPressed() {
    if (keyCode === 32) {
        moveParticles = !moveParticles;
        return false; // Prevent default behavior
    }
}

// Prevent spacebar from scrolling the page when anywhere on the page
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' || event.keyCode === 32) {
        event.preventDefault();
    }
}, true);

class Particle {
    constructor(xPos, yPos, charge) {
        this.pos = createVector(xPos, yPos);
        this.charge = charge;

        this.inertia = createVector(0, 0);
        if (charge > 0) {
            this.color = color(255, 0, 0); // Red for positive
        } else {
            this.color = color(0, 0, 255); // Blue for negative
        }
    }

    paint() {
        colorMode(RGB); // Ensure RGB mode for particle colors
        noStroke();
        if (this.charge > 0) {
            fill(255, 0, 0); // Red for positive
        } else {
            fill(0, 0, 255); // Blue for negative
        }
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