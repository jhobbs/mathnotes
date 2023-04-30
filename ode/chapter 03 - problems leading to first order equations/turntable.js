const TABLE_SIZE = 600;
const RECORD_RADIUS = 200;
const ANGULAR_VELOCITY = 0.03;
const BUG_VELOCITY = 0.3;
const BUG_SIZE = 5;

function setup() {
  let canvas = createCanvas(TABLE_SIZE, TABLE_SIZE);
  bugSlider = createSlider(0, 1,0,0);
  bugSlider.position(canvas.position().x, canvas.position().y);
  bugSlider.style('width', '80px');

  rotationSlider = createSlider(0, 10,0,0);
  rotationSlider.position(canvas.position().x, canvas.position().y + 20);
  rotationSlider.style('width', '80px');

  rhoSlider = createSlider(0, 2*PI,0, PI/32);
  rhoSlider.position(canvas.position().x, canvas.position().y + 40);
  rhoSlider.style('width', '80px');

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

function drawRotationArrow(arrow_x, arrow_y, bugAngle) {
    const arrowLength = 25;
    let arrowDirection = atan2(arrow_y, arrow_x) + PI/2;

    let delta_x = arrowLength * cos(arrowDirection)
    let delta_y = arrowLength * sin(arrowDirection)
    stroke(255,0,0);
    line(arrow_x, arrow_y, arrow_x + delta_x, arrow_y + delta_y);
}

function moveBug() {

    let approxR = sqrt(bug_x**2 + bug_y**2);
    if (i > 1000 || approxR > RECORD_RADIUS*1.5) {
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
        let bugDirection = atan2(bug_y, bug_x) + PI/2;
        approxR = sqrt(bug_x**2 + bug_y**2);
        let linearRadialSpeed = rotationSlider.value() * (approxR/RECORD_RADIUS);
        bug_x += -bugSlider.value()/iterations * cos(rhoSlider.value());
        bug_y += -bugSlider.value()/iterations * sin(rhoSlider.value());

        if (approxR  <= RECORD_RADIUS + BUG_SIZE/2) {
            bug_x += linearRadialSpeed/iterations * cos(bugDirection);
            bug_y += linearRadialSpeed/iterations * sin(bugDirection);
        }
    }

    drawBug();
    drawHistory();
}

function draw() {
  clear();
  /*
  text('bug speed', bugSlider.x * 2 + bugSlider.width, bugSlider.y + 5);
  text('rotation speed', rotationSlider.x * 2 + rotationSlider.width, rotationSlider.y + 5);
  text('start position', rhoSlider.x * 2 + rhoSlider.width, rhoSlider.y + 5);
  */
  text('bug speed', bugSlider.width + 5, 13);
  text('rotation speed', rotationSlider.width + 5, 33);
  text('start position', rhoSlider.width + 5, 53);
  push();
  translate(TABLE_SIZE/2, TABLE_SIZE/2);
  scale(1, -1);
  stroke(0);
  fill(255);
  circle(0,0,RECORD_RADIUS *2);
  moveBug();
  fill(0,255,0);
  stroke(0,255,0);
  circle(RECORD_RADIUS * cos(rhoSlider.value()), RECORD_RADIUS * sin(rhoSlider.value()), BUG_SIZE*5);
  fill(0,0,0);
  stroke(0,0,0);
  drawBugArrow(bug_x, bug_y, rhoSlider.value());
  drawRotationArrow(bug_x, bug_y);
  pop();
}
