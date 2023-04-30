const TABLE_SIZE = 600;
const RECORD_RADIUS = 200;
const ANGULAR_VELOCITY = 0.03;
const BUG_VELOCITY = 0.3;
const BUG_SIZE = 5;
const ARROW_SCALAR = 15;

const MODE_TO_CENTER = 'CENTER';
const MODE_PARALLEL = 'PARALLEL';


function setupSliders(canvas) {
    locomotiveSlider = createSlider(0, 3, 0, 0);
    locomotiveSlider.position(canvas.position().x, canvas.position().y);
    locomotiveSlider.style('width', '80px');

    angularVelocitySlider = createSlider(0, 10, 0, 0);
    angularVelocitySlider.position(canvas.position().x, canvas.position().y + 20);
    angularVelocitySlider.style('width', '80px');

    rhoSlider = createSlider(0, 2 * PI, 0, PI / 32);
    rhoSlider.position(canvas.position().x, canvas.position().y + 40);
    rhoSlider.style('width', '80px');
}

function setupRadio(canvas) {
    modeRadio = createRadio()
    modeRadio.option(MODE_TO_CENTER, "To Center");
    modeRadio.option(MODE_PARALLEL, "Parallel to Start");
    modeRadio.selected(MODE_PARALLEL);
    modeRadio.position(250, 10);
}


function setup() {
    let canvas = createCanvas(TABLE_SIZE, TABLE_SIZE);
    setupSliders(canvas);
    setupRadio(canvas);
    redo();
}

function drawBug() {
    fill(255, 204, 0);
    stroke(255, 204, 0);
    circle(bug_x, bug_y, BUG_SIZE);
    fill(255);
    stroke(0);
}

function drawHistory() {
    fill(255, 100, 0);
    stroke(255, 204, 0);
    bugHistory.forEach(historicalBug => {
        let historical_x = historicalBug[0];
        let historical_y = historicalBug[1];
        circle(historical_x, historical_y, BUG_SIZE);
    });
    fill(255);
    stroke(0);
}

function redo() {
    clear();
    circle(0, 0, RECORD_RADIUS * 2);
    bug_theta = rhoSlider.value();
    bugHistory = [];
    i = 0;

    bug_x = RECORD_RADIUS * cos(bug_theta);
    bug_y = RECORD_RADIUS * sin(bug_theta);
}

function drawBugArrow() {
    let locomotiveMotionVector = getLocomotiveMotionVector().mult(ARROW_SCALAR);

    stroke(0, 0, 255);
    line(bug_x, bug_y, bug_x + locomotiveMotionVector.x, bug_y + locomotiveMotionVector.y);
}

function drawRotationArrow() {
    let rotationalMotionVector = getRotationalMotionVector().mult(ARROW_SCALAR);
    stroke(255, 0, 0);
    line(bug_x, bug_y, bug_x + rotationalMotionVector.x, bug_y + rotationalMotionVector.y);
}

function getCombinedMotionVector() {
    return getLocomotiveMotionVector().add(getRotationalMotionVector());
}

function drawCombinedArrow() {
    let combinedMotionVector = getCombinedMotionVector().mult(ARROW_SCALAR);
    stroke(255, 204, 0);
    line(bug_x, bug_y, bug_x + combinedMotionVector.x, bug_y + combinedMotionVector.y);
}

function getLocomotiveMotionVector() {
    let locomotionDirection;
    if (modeRadio.value() == MODE_PARALLEL) {
        locomotionDirection = rhoSlider.value();
    } else if (modeRadio.value() == MODE_TO_CENTER) {
        locomotionDirection = getBugTheta();
    }

    return createVector(-locomotiveSlider.value() * cos(locomotionDirection), -locomotiveSlider.value() * sin(locomotionDirection));
}

function getRotationalMotionVector() {
    if (getBugR() > RECORD_RADIUS + BUG_SIZE / 2) {
        return createVector(0, 0);
    }

    let motionDirection = getBugTheta() + PI / 2;
    let linearRadialSpeed = angularVelocitySlider.value() * (getBugR() / RECORD_RADIUS);
    return createVector(linearRadialSpeed * cos(motionDirection), linearRadialSpeed * sin(motionDirection));
}

function getBugR() {
    return sqrt(bug_x ** 2 + bug_y ** 2);
}

function getBugTheta() {
    return atan2(bug_y, bug_x);
}

function moveBug() {

    if (i > 1000
        || (modeRadio.value() == MODE_PARALLEL && getBugR() > RECORD_RADIUS * 1.5)
        || (modeRadio.value() == MODE_TO_CENTER && getBugR() < BUG_SIZE / 2)) {
        redo();
    }

    i++;

    console.log("i: " + i)

    if (i % 2 == 0) {
        bugHistory.push([bug_x, bug_y]);
        if (bugHistory.length > 200) {
            bugHistory.shift();
        }
    }

    const iterations = 500;

    for (let j = 0; j < iterations; j++) {
        let combinedMotionVector = getCombinedMotionVector().div(iterations);
        bug_x += combinedMotionVector.x;
        bug_y += combinedMotionVector.y;
    }
}

function drawLabels() {
    text('bug locomotive speed', locomotiveSlider.width + 5, 13);
    text('record angular velocity', angularVelocitySlider.width + 5, 33);
    text('start position', rhoSlider.width + 5, 53);
}

function drawRecord() {
    stroke(0);
    fill(255);
    circle(0, 0, RECORD_RADIUS * 2);
}

function handleBug() {
    moveBug();
    drawBug();
    drawHistory();
    drawBugArrow();
    drawRotationArrow();
    drawCombinedArrow();
}

function drawEndpoints() {
    fill(0, 255, 0);
    stroke(0, 255, 0);
    circle(RECORD_RADIUS * cos(rhoSlider.value()), RECORD_RADIUS * sin(rhoSlider.value()), BUG_SIZE * 5);
}

function draw() {
    clear();
    drawLabels();
    push();
    //use the center of the turntable as origin and orient the upward direction as positive y.
    translate(TABLE_SIZE / 2, TABLE_SIZE / 2);
    scale(1, -1);
    drawRecord();
    drawEndpoints();
    handleBug();
    pop();
}