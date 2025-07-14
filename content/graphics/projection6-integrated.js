(function() {
  const demoId = 'projective-transformations-' + Math.random().toString(36).substr(2, 9);
  let canvas;
  let cameraAngleXSlider, cameraAngleYSlider, cameraAngleZSlider;
  let cameraAngleXLabel, cameraAngleYLabel, cameraAngleZLabel;
  let focalSlider, focalLabel;
  let translateXSlider, translateYSlider, translateZSlider;
  let translateXLabel, translateYLabel, translateZLabel;

  window[demoId + '_setup'] = function() {
    canvas = createCanvas(windowWidth * 0.9, 400);
    canvas.parent('canvasContainer');
    canvas.style('display', 'block');
    canvas.style('position', 'relative');

    // Create a container for all controls
    let controlsContainer = createDiv();
    controlsContainer.parent('canvasContainer');
    controlsContainer.style('margin-top', '20px');
    controlsContainer.style('width', '100%');
    controlsContainer.style('text-align', 'center');

    // Helper function to create slider row
    function createSliderRow(label, min, max, value, step) {
      let rowDiv = createDiv();
      rowDiv.parent(controlsContainer);
      rowDiv.style('margin-bottom', '10px');
      rowDiv.style('display', 'flex');
      rowDiv.style('align-items', 'center');
      rowDiv.style('justify-content', 'center');
      rowDiv.style('gap', '10px');
      
      let slider = createSlider(min, max, value, step);
      slider.parent(rowDiv);
      slider.style('width', '200px');
      slider.input(() => redraw());
      
      let labelDiv = createDiv(label);
      labelDiv.parent(rowDiv);
      labelDiv.style('width', '150px');
      labelDiv.style('text-align', 'left');
      
      return slider;
    }

    // Create all sliders
    cameraAngleXSlider = createSliderRow('Camera Angle (X-axis)', -PI, PI, 0, 0.01);
    cameraAngleYSlider = createSliderRow('Camera Angle (Y-axis)', -PI, PI, 0, 0.01);
    cameraAngleZSlider = createSliderRow('Camera Angle (Z-axis)', -PI, PI, 0, 0.01);
    focalSlider = createSliderRow('Focal Length', 1, 30, 15, 0.1);
    translateXSlider = createSliderRow('Translate X', -200, 200, 0, 1);
    translateYSlider = createSliderRow('Translate Y', -200, 200, 0, 1);
    translateZSlider = createSliderRow('Translate Z', -200, 200, 100, 1);

    noLoop();
  };

  window[demoId + '_draw'] = function() {
    // Dark mode support - check both class and system preference
    const isDarkModeClass = document.documentElement.classList.contains('dark-mode');
    const isDarkModePref = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = isDarkModeClass || isDarkModePref;
    
    if (isDark) {
      background(32); // Dark background
    } else {
      background(220); // Light background
    }
    
    // Get the camera angle values from the sliders
    let cameraAngleX = -cameraAngleXSlider.value();
    let cameraAngleY = -cameraAngleYSlider.value();
    let cameraAngleZ = -cameraAngleZSlider.value();

    // Define the 4x4 transformation matrices for camera rotation around X, Y, and Z axes
    let cX = cos(cameraAngleX);
    let sX = sin(cameraAngleX);
    let cameraRotationXMatrix = math.matrix([
      [1, 0, 0, 0],
      [0, cX, -sX, 0],
      [0, sX, cX, 0],
      [0, 0, 0, 1]
    ]);

    let cY = cos(cameraAngleY);
    let sY = sin(cameraAngleY);
    let cameraRotationYMatrix = math.matrix([
      [cY, 0, sY, 0],
      [0, 1, 0, 0],
      [-sY, 0, cY, 0],
      [0, 0, 0, 1]
    ]);

    let cZ = cos(cameraAngleZ);
    let sZ = sin(cameraAngleZ);
    let cameraRotationZMatrix = math.matrix([
      [cZ, -sZ, 0, 0],
      [sZ, cZ, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]);

    // Define the 4x4 transformation matrix for translation
    let translateX = translateXSlider.value();
    let translateY = translateYSlider.value();
    let translateZ = translateZSlider.value();
    let translationMatrix = math.matrix([
      [1, 0, 0, translateX],
      [0, 1, 0, translateY],
      [0, 0, 1, translateZ],
      [0, 0, 0, 1]
    ]);

    // Combine the camera rotation matrices and translation matrix
    let rotationMatrix = math.multiply(
      math.multiply(cameraRotationXMatrix, cameraRotationYMatrix),
      cameraRotationZMatrix);

    // Focal length for perspective projection
    let focalLength = focalSlider.value();

    // Define the 4x4 perspective projection matrix
    let perspectiveMatrix = math.matrix([
      [focalLength, 0, 0, 0],
      [0, focalLength, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 1 / focalLength, 0]
    ]);

    // Combine the transformation matrix with the perspective projection matrix
    let transformationMatrix = math.multiply(
      perspectiveMatrix,
      math.multiply(rotationMatrix, translationMatrix)
    );
    
    // Define the points for a happy face in homogeneous coordinates
    let points = [
      math.matrix([-30, -30, 100, 1]), // Left eye
      math.matrix([30, -30, 100, 1]),  // Right eye
      math.matrix([0, 10, 100, 1]),    // Nose
      math.matrix([-30, 30, 100, 1]),  // Mouth left
      math.matrix([-15, 40, 100, 1]),  // Mouth mid-left
      math.matrix([0, 45, 100, 1]),    // Mouth middle
      math.matrix([15, 40, 100, 1]),   // Mouth mid-right
      math.matrix([30, 30, 100, 1])    // Mouth right
    ];

    // Set colors based on dark mode
    if (isDark) {
      fill(200); // Light gray for dark mode
    } else {
      fill(0); // Black for light mode
    }
    noStroke();

    // Apply matrix multiplication to each point and draw the resulting points
    for (let point of points) {
      // Apply the transformation matrix
      let transformedPoint = math.multiply(transformationMatrix, point);
      let w = transformedPoint.get([3]);
      let projectedX = transformedPoint.get([0]) / w;
      let projectedY = transformedPoint.get([1]) / w;

      circle(projectedX + width / 2, projectedY + height / 2, 100 / w);
    }

    // Draw a dense bounding box around the face
    if (isDark) {
      stroke(200); // Light gray for dark mode
    } else {
      stroke(0); // Black for light mode
    }
    noFill();
    let boundingBoxPoints = [];
    let halfSize = 120;
    for (let x = -halfSize; x <= halfSize; x += 10) {
      for (let y = -halfSize; y <= halfSize; y += 10) {
        let z = 100;
        boundingBoxPoints.push(math.matrix([x, y, z, 1]));
      }
    }

    for (let point of boundingBoxPoints) {
      // Apply the transformation matrix
      let transformedPoint = math.multiply(transformationMatrix, point);
      let w = transformedPoint.get([3]);
      let projectedX = transformedPoint.get([0]) / w;
      let projectedY = transformedPoint.get([1]) / w;

      circle(projectedX + width / 2, projectedY + height / 2, 5 / w);
    }
  };

  // Set the p5.js functions
  window.setup = window[demoId + '_setup'];
  window.draw = window[demoId + '_draw'];
})();