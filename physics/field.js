var particles = [];
var numParticles = 0;

var forces = [];
var numForces = 30;

var moveParticles = false;

function setup() {
    noStroke()
    createCanvas(windowWidth, windowHeight);
    background(51);
    frameRate(60);


    //particles.push(new Particle(width/2, height/2, 5))
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(random(width), random(height), random(20)));
    }

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

        //skipping first
        for (let i = 0; i < particles.length; i++) {


            let particlePos = particles[i].p;
            let particleCharge = particles[i].m;

            let electroStatic = getElectrostaticForce(particles, createVector(particlePos.x, particlePos.y))
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


function getElectrostaticForce(chargees, point) {

    resultingVector = createVector(0, 0)

    for (let i = 0; i < chargees.length; i++) {

        let mPos = chargees[i].p;
        //console.log(mPos);
        let mCharge = chargees[i].m;
        let distance = dist(mPos.x, mPos.y, point.x, point.y);

        let cosI = sin(abs(mPos.x - point.x) / distance);
        let sinJ = sin(abs(mPos.y - point.y) / distance);

        if (point.x < mPos.x)
            cosI = -cosI
        if (point.y < mPos.y)
            sinJ = -sinJ

        resultingVector.add(createVector(
            (mCharge / (distance)) * cosI,
            (mCharge / (distance)) * sinJ));

    }

    return resultingVector;

}


// Add particle on click
function mouseClicked() {
    let sgn = 1;
    if (keyCode === DOWN_ARROW) {
        sgn = -1;
    }
    particles.push(new Particle(mouseX, mouseY, sgn * 15))
}

function arrow(x1, y1, x2, y2, offset) {
    // this code is to make the arrow point
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

    update(chargees) {
        this.mag = getElectrostaticForce(chargees, this.pos)
        // ()
    }
    paint() {

        let distance = dist(this.pos.x, this.pos.y, this.pos.x + this.mag.x * 100, this.pos.y + this.mag.y * 100)
        stroke(map(distance, 0, 50, 150, 255), 255, 100)
        //strokeWeight(distance)
        //line(this.pos.x, this.pos.y, this.pos.x - this.mag.x * 50, this.pos.y - this.mag.y * 50)
        arrow(this.pos.x, this.pos.y, this.pos.x - this.mag.x * 100, this.pos.y - this.mag.y * 100, 5);
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
        if (charge < 0) {
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