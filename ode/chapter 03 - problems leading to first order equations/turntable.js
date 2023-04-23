const TABLE_SIZE = 600;
const RECORD_RADIUS = 200;
const ANGULAR_VELOCITY = 0.03;
const BUG_VELOCITY = 0.3;
const BUG_SIZE = 5;

let center;

function setup() {
  createCanvas(TABLE_SIZE, TABLE_SIZE);
  bugSlider = createSlider(0, 255,0);
  bugSlider.position(10, 10);
  bugSlider.style('width', '80px');

  recordSlider = createSlider(0, 255,0);
  recordSlider.position(10, 30);
  recordSlider.style('width', '80px');

  translate(TABLE_SIZE/2, TABLE_SIZE/2);
  bug_r = RECORD_RADIUS;
  bug_theta = 0;
  center = createVector(0, 0);
  circle(0,0,RECORD_RADIUS *2);
}

function drawBug() {
    fill(255, 204, 0);
    stroke(255, 204, 0);
    circle(bug_r * cos(bug_theta), bug_r * sin(bug_theta), BUG_SIZE);
    fill(255);
    stroke(0);
}

function redo() {
    clear();
    circle(0,0,RECORD_RADIUS *2);
    bug_r = RECORD_RADIUS;
    bug_theta = 0;
}

function moveBug() {

    if (bug_r < 10) {
        redo();
    }

    new_theta = bug_theta + recordSlider.value() / 255;
    new_r = bug_r - bugSlider.value() / 255;

    current_position = createVector(bug_r * cos(bug_theta), bug_r * sin(bug_theta));
    new_position = createVector(new_r * cos(new_theta), new_r * sin(new_theta));

    bug_change = current_position.dist(new_position);
    steps = (int)((bug_change / BUG_SIZE) * 2) + 1;

    for (i = 0; i < steps; i++) {
        bug_theta += (recordSlider.value() / 255) / steps;
        bug_r -= (bugSlider.value() / 255) / steps;
        drawBug();
    }

}

function draw() {
  //clear();
  translate(TABLE_SIZE/2, TABLE_SIZE/2);
  //drawBug();
  moveBug();
}
