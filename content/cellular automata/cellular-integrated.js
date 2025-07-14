(function() {
    const demoId = 'cellular-automata-' + Math.random().toString(36).substr(2, 9);
    const containerId = 'canvas-container';
    let grid;
    let cols;
    let rows;
    let resolution = 5;
    let running = false;
    let populationHistory = [];
    const maxHistory = 5;
    let generations = 0;
    let p5Instance;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // Find the demo container by looking for the cellular-integrated.html demo component
        const demoContainer = document.querySelector('[data-demo-file="cellular-integrated.html"]');
        
        if (!demoContainer) {
            console.error('Could not find demo container for cellular automata');
            return;
        }

        initializeDemo(demoContainer);
    }

    function initializeDemo(demoContainer) {
        // Get elements within this specific demo
        const canvasContainer = demoContainer.querySelector('#' + containerId);
        const toggleBtn = demoContainer.querySelector('#toggleBtn');
        const resetBtn = demoContainer.querySelector('#resetBtn');
        const initialPopulationSlider = demoContainer.querySelector('#initialPopulationSlider');
        const frameRateSlider = demoContainer.querySelector('#frameRateSlider');
        const initialPopValue = demoContainer.querySelector('#initialPopValue');
        const frameRateValue = demoContainer.querySelector('#frameRateValue');
        const runningStatus = demoContainer.querySelector('#runningStatus');
        const populationInfo = demoContainer.querySelector('#populationInfo');
        const rateChangeInfo = demoContainer.querySelector('#rateChangeInfo');
        const generationInfo = demoContainer.querySelector('#generationInfo');

        // Update slider value displays
        initialPopulationSlider.addEventListener('input', function() {
            initialPopValue.textContent = this.value;
        });

        frameRateSlider.addEventListener('input', function() {
            frameRateValue.textContent = this.value;
            if (p5Instance) {
                p5Instance.frameRate(parseInt(this.value));
            }
        });

        // Button event handlers
        toggleBtn.addEventListener('click', function() {
            running = !running;
            runningStatus.textContent = `Running: ${running ? "Yes" : "No"}`;
        });

        resetBtn.addEventListener('click', function() {
            if (p5Instance) {
                resetGrid();
            }
        });

        function make2DArray(cols, rows) {
        let arr = new Array(cols);
        for (let i = 0; i < arr.length; i++) {
            arr[i] = new Array(rows);
        }
        return arr;
    }

        function resetGrid() {
        let initialPopulation = parseFloat(initialPopulationSlider.value);
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (p5Instance.random(1) < initialPopulation) {
                    if (i < cols / 2) {
                        grid[i][j] = 1;
                    } else {
                        grid[i][j] = 2;
                    }
                } else {
                    grid[i][j] = 0;
                }
            }
        }
        populationHistory = [];
        updatePopulationHistory();
        generations = 0;
        generationInfo.textContent = `Generation: ${generations}`;
    }

        function updatePopulationHistory() {
        let currentPopulation = 0;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (grid[i][j] > 0) {
                    currentPopulation++;
                }
            }
        }
        populationHistory.push(currentPopulation);
        if (populationHistory.length > maxHistory) {
            populationHistory.shift();
        }
    }

        function calculatePopulationRateChange() {
        if (populationHistory.length < 2) {
            return 0;
        }
        let rateChange = 0;
        for (let i = 1; i < populationHistory.length; i++) {
            rateChange += (populationHistory[i] - populationHistory[i - 1]);
        }
        return rateChange / (populationHistory.length - 1);
    }

        function countNeighbors(grid, x, y) {
        let sum = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                let col = (x + i + cols) % cols;
                let row = (y + j + rows) % rows;
                sum += grid[col][row] > 0 ? 1 : 0;
            }
        }
        sum -= grid[x][y] > 0 ? 1 : 0;
        return sum;
    }

        function pickColorFromNeighbors(grid, x, y) {
        let neighborCounts = { 0: 0, 1: 0, 2: 0 };

        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i === 0 && j === 0) continue;
                let col = (x + i + cols) % cols;
                let row = (y + j + rows) % rows;
                neighborCounts[grid[col][row]]++;
            }
        }

        let maxCount = Math.max(neighborCounts[1], neighborCounts[2]);
        let mostCommonValues = [];

        if (neighborCounts[1] === maxCount) {
            mostCommonValues.push(1);
        }
        if (neighborCounts[2] === maxCount) {
            mostCommonValues.push(2);
        }

        if (mostCommonValues.length === 0) {
            return 0;
        }

        return p5Instance.random(mostCommonValues);
    }

        function deepCopyGrid(grid) {
        return grid.map(row => [...row]);
    }

        function updateEntries(grid) {
        if (!running) {
            return grid;
        }
        let next = deepCopyGrid(grid);
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let state = grid[i][j];
                let neighbors = countNeighbors(grid, i, j);
                if (state == 0 && neighbors == 3) {
                    next[i][j] = pickColorFromNeighbors(grid, i, j);
                } else if (state > 0 && (neighbors < 2 || neighbors > 3)) {
                    next[i][j] = 0;
                }
            }
        }
        updatePopulationHistory();
        generations++;
        generationInfo.textContent = `Generation: ${generations}`;
        return next;
    }

        // Create P5.js sketch
        const sketch = (p) => {
        p.setup = function() {
            const canvas = p.createCanvas(canvasContainer.offsetWidth, 400);
            canvas.parent(canvasContainer);
            
            cols = p.floor(p.width / resolution);
            rows = p.floor(p.height / resolution);
            
            grid = make2DArray(cols, rows);
            p.frameRate(15);
            
            resetGrid();
        };

        p.draw = function() {
            p.background(0);
            grid = updateEntries(grid);

            let populatedCount = 0;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    let x = i * resolution;
                    let y = j * resolution;
                    if (grid[i][j] > 0) {
                        populatedCount++;
                        if (grid[i][j] == 1) {
                            p.fill(0, 255, 0); // Green
                        } else {
                            p.fill(255, 0, 0); // Red
                        }
                        p.stroke(0);
                        p.rect(x, y, resolution - 1, resolution - 1);
                    }
                }
            }

            // Update info displays
            let totalCells = cols * rows;
            let populationPercent = (populatedCount / totalCells) * 100;
            populationInfo.textContent = `Population: ${populationPercent.toFixed(2)}%`;

            let rateChange = calculatePopulationRateChange();
            rateChangeInfo.textContent = `Rate Change: ${rateChange.toFixed(2)}`;
        };

        p.mousePressed = function() {
            if (p.mouseX >= 0 && p.mouseX < p.width && p.mouseY >= 0 && p.mouseY < p.height) {
                let x = Math.floor(p.mouseX / resolution);
                let y = Math.floor(p.mouseY / resolution);
                if (x >= 0 && x < cols && y >= 0 && y < rows) {
                    grid[x][y] = grid[x][y] ? 0 : 1;
                }
            }
        };

        p.windowResized = function() {
            p.resizeCanvas(canvasContainer.offsetWidth, 400);
            cols = p.floor(p.width / resolution);
            rows = p.floor(p.height / resolution);
            
            // Create new grid with new dimensions
            let newGrid = make2DArray(cols, rows);
            
            // Copy old grid values where possible
            for (let i = 0; i < Math.min(grid.length, cols); i++) {
                for (let j = 0; j < Math.min(grid[0].length, rows); j++) {
                    newGrid[i][j] = grid[i][j];
                }
            }
            
            grid = newGrid;
        };
    };

        // Initialize P5.js instance
        p5Instance = new p5(sketch);

        // Store reference for cleanup
        if (!window.cellularAutomataDemos) {
            window.cellularAutomataDemos = {};
        }
        window.cellularAutomataDemos[demoId] = p5Instance;
    }
})();