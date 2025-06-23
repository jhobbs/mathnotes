// Use p5.js instance mode to avoid conflicts with other demos
new p5(function(p) {
    // Constants
    const TABLE_SIZE = 600;
    const RECORD_RADIUS = 200;
    const ANGULAR_VELOCITY = 0.03;
    const BUG_VELOCITY = 0.3;
    const BUG_SIZE = 5;
    const ARROW_SCALAR = 15;

    const MODE_TO_CENTER = 'CENTER';
    const MODE_PARALLEL = 'PARALLEL';
    const MODE_TO_LIGHT = 'LIGHT';

    // Global variables
    let locomotiveSlider, angularVelocitySlider, rhoSlider;
    let modeRadio;
    let bug_x, bug_y, bug_theta;
    let bugHistory = [];
    let i = 0;

    function setupSliders() {
        const controlsDiv = document.getElementById('controls');
        if (!controlsDiv) return;
        
        // Create control wrapper divs
        const locomotiveDiv = p.createDiv('');
        locomotiveDiv.parent('controls');
        locomotiveDiv.style('margin-bottom', '10px');
        
        locomotiveSlider = p.createSlider(0, 3, 0, 0);
        locomotiveSlider.parent(locomotiveDiv);
        locomotiveSlider.style('width', '200px');
        
        const locomotiveLabel = p.createSpan(' bug locomotive speed');
        locomotiveLabel.parent(locomotiveDiv);
        
        const angularDiv = p.createDiv('');
        angularDiv.parent('controls');
        angularDiv.style('margin-bottom', '10px');
        
        angularVelocitySlider = p.createSlider(0, 10, 0, 0);
        angularVelocitySlider.parent(angularDiv);
        angularVelocitySlider.style('width', '200px');
        
        const angularLabel = p.createSpan(' record angular velocity');
        angularLabel.parent(angularDiv);
        
        const rhoDiv = p.createDiv('');
        rhoDiv.parent('controls');
        rhoDiv.style('margin-bottom', '10px');
        
        rhoSlider = p.createSlider(0, 2 * p.PI, 0, p.PI / 32);
        rhoSlider.parent(rhoDiv);
        rhoSlider.style('width', '200px');
        
        const rhoLabel = p.createSpan(' start position');
        rhoLabel.parent(rhoDiv);
    }

    function setupRadio() {
        const radioDiv = p.createDiv('');
        radioDiv.parent('controls');
        radioDiv.style('margin-top', '20px');
        
        modeRadio = p.createRadio();
        modeRadio.option(MODE_TO_CENTER, "To Center");
        modeRadio.option(MODE_PARALLEL, "Parallel to Start");
        modeRadio.option(MODE_TO_LIGHT, "To Light");
        modeRadio.selected(MODE_PARALLEL);
        modeRadio.parent(radioDiv);
    }

    p.setup = function() {
        // Check for container element
        const sketchHolder = document.getElementById('turntable-sketch-holder');
        if (!sketchHolder) {
            console.error('turntable-sketch-holder element not found');
            return;
        }
        
        let canvas = p.createCanvas(TABLE_SIZE, TABLE_SIZE);
        canvas.parent('turntable-sketch-holder');
        
        setupSliders();
        setupRadio();
        redo();
    };

    function drawBug() {
        p.fill(255, 204, 0);
        p.stroke(255, 204, 0);
        p.circle(bug_x, bug_y, BUG_SIZE);
        p.fill(255);
        p.stroke(0);
    }

    function drawHistory() {
        p.fill(255, 100, 0);
        p.stroke(255, 204, 0);
        bugHistory.forEach(historicalBug => {
            let historical_x = historicalBug[0];
            let historical_y = historicalBug[1];
            p.circle(historical_x, historical_y, BUG_SIZE);
        });
        p.fill(255);
        p.stroke(0);
    }

    function redo() {
        p.clear();
        p.circle(0, 0, RECORD_RADIUS * 2);
        bug_theta = rhoSlider.value();
        bugHistory = [];
        i = 0;

        bug_x = RECORD_RADIUS * p.cos(bug_theta);
        bug_y = RECORD_RADIUS * p.sin(bug_theta);
    }

    function drawBugArrow() {
        let locomotiveMotionVector = getLocomotiveMotionVector().mult(ARROW_SCALAR);

        p.stroke(0, 0, 255);
        p.line(bug_x, bug_y, bug_x + locomotiveMotionVector.x, bug_y + locomotiveMotionVector.y);
    }

    function drawRotationArrow() {
        let rotationalMotionVector = getRotationalMotionVector().mult(ARROW_SCALAR);
        p.stroke(255, 0, 0);
        p.line(bug_x, bug_y, bug_x + rotationalMotionVector.x, bug_y + rotationalMotionVector.y);
    }

    function getCombinedMotionVector() {
        return getLocomotiveMotionVector().add(getRotationalMotionVector());
    }

    function drawCombinedArrow() {
        let combinedMotionVector = getCombinedMotionVector().mult(ARROW_SCALAR);
        p.stroke(255, 204, 0);
        p.line(bug_x, bug_y, bug_x + combinedMotionVector.x, bug_y + combinedMotionVector.y);
    }

    function getLocomotiveMotionVector() {
        let locomotionDirection;
        if (modeRadio.value() == MODE_PARALLEL) {
            locomotionDirection = rhoSlider.value();
        } else if (modeRadio.value() == MODE_TO_CENTER) {
            locomotionDirection = getBugTheta();
        } else if (modeRadio.value() == MODE_TO_LIGHT) {
            let endPoint = getEndPoint();
            locomotionDirection = p.atan2(bug_y - endPoint.y, bug_x - endPoint.x);
        }

        return p.createVector(-locomotiveSlider.value() * p.cos(locomotionDirection), -locomotiveSlider.value() * p.sin(locomotionDirection));
    }

    function getRotationalMotionVector() {
        if (getBugR() > RECORD_RADIUS + 0.1) {
            return p.createVector(0, 0);
        }

        let motionDirection = getBugTheta() + p.PI / 2;
        let linearRadialSpeed = angularVelocitySlider.value() * (getBugR() / RECORD_RADIUS);
        return p.createVector(linearRadialSpeed * p.cos(motionDirection), linearRadialSpeed * p.sin(motionDirection));
    }

    function getBugR() {
        return p.sqrt(bug_x ** 2 + bug_y ** 2);
    }

    function getBug() {
        return p.createVector(bug_x, bug_y);
    }

    function getBugTheta() {
        return p.atan2(bug_y, bug_x);
    }

    function moveBug() {
        if (i > 10000
            || (modeRadio.value() == MODE_PARALLEL && getBugR() > RECORD_RADIUS * 1.5)
            || (modeRadio.value() == MODE_TO_CENTER && getBugR() < BUG_SIZE / 2)
            || (modeRadio.value() == MODE_TO_LIGHT && getBug().dist(getEndPoint()) < BUG_SIZE / 2)) {
            redo();
        }

        i++;

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
        // Labels are now drawn as HTML elements in setupSliders
    }

    function drawRecord() {
        p.stroke(0);
        p.fill(255);
        p.circle(0, 0, RECORD_RADIUS * 2);
    }

    function handleBug() {
        moveBug();
        drawBug();
        drawHistory();
        drawBugArrow();
        drawRotationArrow();
        drawCombinedArrow();
    }

    function getStartPoint() {
        return p.createVector(RECORD_RADIUS * p.cos(rhoSlider.value()), RECORD_RADIUS * p.sin(rhoSlider.value()));
    }

    function getEndPoint() {
        return p.createVector(RECORD_RADIUS * p.cos(rhoSlider.value() + p.PI), RECORD_RADIUS * p.sin(rhoSlider.value() + p.PI));
    }

    function drawEndpoints() {
        let startPoint = getStartPoint();
        let endPoint = getEndPoint();
        p.fill(0, 255, 0);
        p.stroke(0, 255, 0);
        p.circle(startPoint.x, startPoint.y, BUG_SIZE * 5);
        p.fill(255, 0, 0);
        p.stroke(255, 0, 0);
        p.circle(endPoint.x, endPoint.y, BUG_SIZE * 5);
    }

    p.keyPressed = function() {
        if (p.keyCode == 90) { //z
            redo();
        }
    };

    p.draw = function() {
        p.clear();
        p.push();
        //use the center of the turntable as origin and orient the upward direction as positive y.
        p.translate(TABLE_SIZE / 2, TABLE_SIZE / 2);
        p.scale(1, -1);
        drawRecord();
        drawEndpoints();
        handleBug();
        p.pop();
    };
});