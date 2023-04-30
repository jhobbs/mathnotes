const TABLE_SIZE = 600;
const RECORD_RADIUS = 200;
const ANGULAR_VELOCITY = 0.03;
const BUG_VELOCITY = 0.3;
const BUG_SIZE = 5;

let center;

function setup() {
  let canvas = createCanvas(TABLE_SIZE, TABLE_SIZE);
  bugSlider = createSlider(0, 1,0,0);
  bugSlider.position(canvas.position().x, canvas.position().y);
  bugSlider.style('width', '80px');

  recordSlider = createSlider(0, 10,0,0);
  recordSlider.position(canvas.position().x, canvas.position().y + 20);
  recordSlider.style('width', '80px');

  rhoSlider = createSlider(0, 2*PI,0, PI/32);
  rhoSlider.position(canvas.position().x, canvas.position().y + 40);
  rhoSlider.style('width', '80px');

  translate(TABLE_SIZE/2, -(TABLE_SIZE/2));
  center = createVector(0, 0);
  circle(0,0,RECORD_RADIUS *2);
  imageMode(CENTER);
  img = loadImage('record2.jpg');
  record_theta = 0;
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
    circle(0,0,RECORD_RADIUS *2);
    bug_r = RECORD_RADIUS;
    bug_theta = rhoSlider.value();
    bugHistory = [];
    i = 0;

    bug_x = bug_r * cos(bug_theta);
    bug_y = bug_r * sin(bug_theta);
}

function drawBugArrow(arrow_x, arrow_y, arrowDirection) {
    const arrowLength = 25;

    let delta_x = -arrowLength * cos(arrowDirection)
    let delta_y = -arrowLength * sin(arrowDirection)
    stroke(0,0,255);
    line(arrow_x, arrow_y, arrow_x + delta_x, arrow_y + delta_y);
}

function drawRecordArrow(arrow_x, arrow_y, bugAngle) {
    const arrowLength = 25;
    let arrowDirection = atan2(arrow_y, arrow_x) + PI/2;

    let delta_x = arrowLength * cos(arrowDirection)
    let delta_y = arrowLength * sin(arrowDirection)
    stroke(255,0,0);
    line(arrow_x, arrow_y, arrow_x + delta_x, arrow_y + delta_y);
}

function moveBug() {

    if (i > 1000) {
        redo();
    }

    /*
    new_theta = bug_theta; //; + recordSlider.value() / 255;
    new_r = bug_r - bugSlider.value() / 255;

    current_position = createVector(bug_r * cos(bug_theta), bug_r * sin(bug_theta));
    new_position = createVector(new_r * cos(new_theta), new_r * sin(new_theta));

    bug_change = current_position.dist(new_position);
    steps = (int)((bug_change / BUG_SIZE) * 2) + 1;

    for (i = 0; i < steps; i++) {
        bug_r -= (bugSlider.value() / 255) / steps;
        drawBug();
    }*/

    i++;

    console.log("i: " + i)

    if (i % 2 == 0) {
        bugHistory.push([bug_x, bug_y]);
        if (bugHistory.length > 200) {
            bugHistory.shift();
        }
    }

    /*
     * We want to move in a direction parallel to rho but away from it. That is, if our current position is given by
     vector p, we want to add a vector with a negative magnitude but in the direction of rho.

     Lets start by drawing that vector.
     */

    /*
    delta_r = -cos(rhoSlider.value()) * bugSlider.value();
    console.log("delta_r: " + delta_r);
    bug_r = bug_r + delta_r;
    //bug_theta = bug_theta + sin(rhoSlider.value())*bugSlider.value(); */


    const iterations = 500;

    for (let j = 0; j < iterations; j++) {
        let bugDirection = atan2(bug_y, bug_x) + PI/2;
        let approxR = sqrt(bug_x**2 + bug_y**2);
        let linearRadialSpeed = recordSlider.value() * (approxR/RECORD_RADIUS);
        bug_x += -bugSlider.value()/iterations * cos(rhoSlider.value());
        bug_y += -bugSlider.value()/iterations * sin(rhoSlider.value());
        bug_x += linearRadialSpeed/iterations * cos(bugDirection);
        bug_y += linearRadialSpeed/iterations * sin(bugDirection);
    }

    drawBug();
    drawHistory();
}

/*function draw() {
    clear();
    translate(TABLE_SIZE/2, TABLE_SIZE/2);
    scale(1, -1);
    fill(255,0,0);
    circle(0, 0, 25);
    fill(0,255,0);
    circle(0, 50, 25);
}*/

function draw() {
  //clear();
  translate(TABLE_SIZE/2, TABLE_SIZE/2);
  scale(1, -1);
  //rotate(record_theta);
  //record_theta += recordSlider.value();
  image(img, 0, 0);
  moveBug();
  fill(0,255,0);
  stroke(0,255,0);
  circle(RECORD_RADIUS * cos(rhoSlider.value()), RECORD_RADIUS * sin(rhoSlider.value()), BUG_SIZE*5);
  fill(0,0,0);
  stroke(0,0,0);
  drawBugArrow(bug_x, bug_y, rhoSlider.value());
  drawRecordArrow(bug_x, bug_y);
  stroke(255,0,0);
  fill(255,0,0);
  circle(0, bugSlider.value()/recordSlider.value, sqrt(RECORD_RADIUS**2 + (bugSlider.value()**2)/(recordSlider.value()**2)));
}
