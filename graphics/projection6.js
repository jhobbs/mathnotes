function setup() {
  canvas = createCanvas(800, 800);
  canvas.parent('canvasContainer');

  const sliderBaseHeight = canvas.position().y + height
  // Create sliders to control the camera angles around the X, Y, and Z axes
  cameraAngleXSlider = createSlider(0, TWO_PI, 0, 0.01);
  cameraAngleXSlider.position(canvas.position().x, sliderBaseHeight + 20);
  cameraAngleXSlider.style('width', '200px');
  cameraAngleXSlider.input(redraw);
  cameraAngleXLabel = createDiv('Camera Angle (X-axis)');
  cameraAngleXLabel.position(canvas.position().x + cameraAngleXSlider.width + 20, sliderBaseHeight + 20);

  cameraAngleYSlider = createSlider(0, TWO_PI, 0, 0.01);
  cameraAngleYSlider.position(canvas.position().x, sliderBaseHeight + 60);
  cameraAngleYSlider.style('width', '200px');
  cameraAngleYSlider.input(redraw);
  cameraAngleYLabel = createDiv('Camera Angle (Y-axis)');
  cameraAngleYLabel.position(canvas.position().x + cameraAngleYSlider.width + 20, sliderBaseHeight + 60);

  cameraAngleZSlider = createSlider(0, TWO_PI, 0, 0.01);
  cameraAngleZSlider.position(canvas.position().x, sliderBaseHeight + 100);
  cameraAngleZSlider.style('width', '200px');
  cameraAngleZSlider.input(redraw);
  cameraAngleZLabel = createDiv('Camera Angle (Z-axis)');
  cameraAngleZLabel.position(canvas.position().x + cameraAngleZSlider.width + 20, sliderBaseHeight + 100);

  // Create a slider to control the focal length
  focalSlider = createSlider(1, 30, 15, 0.1);
  focalSlider.position(canvas.position().x, sliderBaseHeight + 140);
  focalSlider.style('width', '200px');
  focalSlider.input(redraw);
  focalLabel = createDiv('Focal Length');
  focalLabel.position(canvas.position().x + focalSlider.width + 20, sliderBaseHeight + 140);

  // Create sliders to control translation in X, Y, Z directions
  translateXSlider = createSlider(-200, 200, 0, 1);
  translateXSlider.position(canvas.position().x, sliderBaseHeight + 180);
  translateXSlider.style('width', '200px');
  translateXSlider.input(redraw);
  translateXLabel = createDiv('Translate X');
  translateXLabel.position(canvas.position().x + translateXSlider.width + 20, sliderBaseHeight + 180);

  translateYSlider = createSlider(-200, 200, 0, 1);
  translateYSlider.position(canvas.position().x, sliderBaseHeight + 220);
  translateYSlider.style('width', '200px');
  translateYSlider.input(redraw);
  translateYLabel = createDiv('Translate Y');
  translateYLabel.position(canvas.position().x + translateYSlider.width + 20, sliderBaseHeight + 220);

  translateZSlider = createSlider(-200, 200, 100, 1);
  translateZSlider.position(canvas.position().x, sliderBaseHeight + 260);
  translateZSlider.style('width', '200px');
  translateZSlider.input(redraw);
  translateZLabel = createDiv('Translate Z');
  translateZLabel.position(canvas.position().x + translateZSlider.width + 20, sliderBaseHeight + 260);

  noLoop();
}

function draw() {
  background(220);
  
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

  fill(0);
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
  stroke(0);
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
}
