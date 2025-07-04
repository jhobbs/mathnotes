const TABLE_SIZE = 600;

const PIVOT_X = 0;
const PIVOT_Y = TABLE_SIZE * 0.3;
const PIVOT_RADIUS = 2;
const BOB_RADIUS = 20;

const PIXELS_PER_FOOT = 20;

const G = 32;


function setupSliders(canvas) {
    lengthSlider = createSlider(0, 20, 5, 0);
    lengthSlider.parent("length-slider");
    lengthSlider.style('width', '120px');
    lengthSlider.input(redo);

    angularVelocitySlider = createSlider(0, 10, 0, 0);
    angularVelocitySlider.parent("angular-velocity-slider");
    angularVelocitySlider.style('width', '120px');
    angularVelocitySlider.input(redo);

    rhoSlider = createSlider(0, PI, PI / 4, PI / 32);
    rhoSlider.parent("angle-slider");
    rhoSlider.style('width', '120px');
    rhoSlider.input(redo);
}

function setup() {
    let canvas = createCanvas(TABLE_SIZE, TABLE_SIZE);
    canvas.parent("pendulum-canvas");
    setupSliders(canvas);
    redo();
}


function getTime() {
    return (start_time - Date.now())/1000;
}

function redo() {
    clear();
    initial_bob_theta = bob_theta = rhoSlider.value();
    wire_length = lengthSlider.value();
    omega_naught = angularVelocitySlider.value();	
    i = 0;
    start_time = Date.now();
}

function drawLabels() {
    // Update the HTML info displays instead of drawing on canvas
    document.getElementById('wire-length-display').textContent = 'Wire length: ' + wire_length.toFixed(2) + ' ft';
    document.getElementById('period-display').textContent = 'Period: ' + (2 * PI * sqrt(wire_length/G)).toFixed(2) + ' sec';
}

function getBobPosition() {
    let bob_theta = sqrt(pow(initial_bob_theta, 2) + (wire_length/G) * pow(omega_naught, 2)) * cos(sqrt(G/wire_length) * getTime() - atan2(omega_naught * sqrt(wire_length/G), initial_bob_theta));
    let bob_x = PIVOT_X + wire_length * PIXELS_PER_FOOT * sin(bob_theta);
    let bob_y = PIVOT_Y - wire_length * PIXELS_PER_FOOT * cos(bob_theta);
    return createVector(bob_x, bob_y);
}

function drawPivot() {
    circle(PIVOT_X, PIVOT_Y, PIVOT_RADIUS * 2);
}

function drawWire() {
    let bobPosition = getBobPosition();
    line(PIVOT_X, PIVOT_Y, bobPosition.x, bobPosition.y);
}

function drawBob() {
    let bobPosition = getBobPosition();
    circle(bobPosition.x, bobPosition.y, BOB_RADIUS * 2);
}

function handleBob() {
    drawPivot();
    drawWire();
    drawBob();
}

function keyPressed() {
    if (keyCode == 90) { //z
        redo();
    }
}

function draw() {
    clear();
    drawLabels();
    push();
    //use the center as origin and orient the upward direction as positive y.
    translate(TABLE_SIZE / 2, TABLE_SIZE / 2);
    scale(1, -1);
    handleBob();
    pop();
}
