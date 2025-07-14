(function() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // Find the demo container by looking for the elementary-integrated.html demo component
        const demoContainer = document.querySelector('[data-demo-file="elementary-integrated.html"]');
        
        if (!demoContainer) {
            console.error('Could not find demo container for elementary cellular automata');
            return;
        }

        initializeDemo(demoContainer);
    }

    function initializeDemo(demoContainer) {
        // Demo-specific variables
        let cellSize = 5;
        let cols;
        let rows;
        let grid;
        let running = false;
        let currentRow = 0;
        let lastToggleTime = 0;
        let toroidal = false;
        let gridOffsetX = 120;
        let p5Instance;
        
        // DOM elements
        let toroidCheckbox;
        let entDiv;
        let colEntDiv;
        let ruleLabel;
        let ruleInput;
        
        // Dark mode detection
        let isDarkMode = false;
        const updateDarkMode = () => {
            isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' ||
                         window.matchMedia('(prefers-color-scheme: dark)').matches;
        };
        updateDarkMode();

        // Rule configuration
        const RULES = [
            { pattern: "111", result: 0 },
            { pattern: "110", result: 0 },
            { pattern: "101", result: 0 },
            { pattern: "100", result: 1 },
            { pattern: "011", result: 1 },
            { pattern: "010", result: 1 },
            { pattern: "001", result: 1 },
            { pattern: "000", result: 0 }
        ];

        // Get DOM elements
        const canvasContainer = demoContainer.querySelector('#canvas-container');
        const fillRateSelect = demoContainer.querySelector('#fillRate');
        const startButton = demoContainer.querySelector('#startButton');
        const resetButton = demoContainer.querySelector('#resetButton');

        // Create P5.js sketch
        const sketch = (p) => {
            p.setup = function() {
                // Create controls in their designated containers
                const toroidalContainer = demoContainer.querySelector('#toroidal-container');
                const entropyContainer = demoContainer.querySelector('#entropy-container');
                const ruleContainer = demoContainer.querySelector('#rule-container');
                
                toroidCheckbox = p.createCheckbox('Toroidal', toroidal);
                toroidCheckbox.parent(toroidalContainer);
                toroidCheckbox.changed(() => {
                    toroidal = toroidCheckbox.checked();
                });
                
                entDiv = p.createDiv("");
                entDiv.parent(entropyContainer);
                entDiv.style('color', 'var(--text-color)');
                entDiv.style('display', 'inline-block');
                entDiv.style('margin-right', '20px');
                
                colEntDiv = p.createDiv("");
                colEntDiv.parent(entropyContainer);
                colEntDiv.style('color', 'var(--text-color)');
                colEntDiv.style('display', 'inline-block');
                
                ruleLabel = p.createDiv("Rule:");
                ruleLabel.parent(ruleContainer);
                ruleLabel.style('display', 'inline-block');
                ruleLabel.style('margin-right', '10px');
                
                ruleInput = p.createInput("30");
                ruleInput.parent(ruleContainer);
                ruleInput.style('display', 'inline-block');
                ruleInput.size(80);
                ruleInput.input(() => {
                    updateRulesFromNumber(ruleInput.value());
                    drawRulesVisuals();
                });
                updateRulesFromNumber("30");

                cols = p.floor((canvasContainer.offsetWidth - gridOffsetX) / cellSize);
                rows = p.floor(400 / cellSize);
                const canvas = p.createCanvas(canvasContainer.offsetWidth, rows * cellSize);
                canvas.parent(canvasContainer);
                
                // Update dark mode and set background
                updateDarkMode();
                p.background(isDarkMode ? 30 : 240);
                p.frameRate(120);
                grid = create2DArray(cols, rows);
                initializeFirstRow();
                drawRow(0);
                currentRow = 0;
                p.noLoop();
                
                // Auto-start after 1 second
                setTimeout(() => {
                    startButton.click();
                }, 1000);
            };

            p.draw = function() {
                if (running) {
                    generate();
                    drawRow(currentRow);
                }
                drawRulesVisuals();
                // Update entropy displays
                let ent = computeEntropy();
                entDiv.html("H<sub>r</sub>: " + p.nf(ent, 1, 2) + "b");
                let colEnt = computeColEntropy();
                colEntDiv.html("H<sub>c</sub>: " + p.nf(colEnt, 1, 2) + "b");
            };

            p.mousePressed = function() {
                if (p.millis() - lastToggleTime < 300) return;
                lastToggleTime = p.millis();
              
                // Check if click is within left margin for rule demo boxes
                if (p.mouseX < gridOffsetX) {
                    let ruleBoxSize = 15;
                    let startX = 10;
                    let startY = 130;
                    let spacingY = ruleBoxSize * 2 + 10;
                    for (let i = 0; i < RULES.length; i++) {
                        let boxX = startX + ((ruleBoxSize + 2) * 1);
                        let boxY = startY + i * spacingY + ruleBoxSize + 2;
                        if (p.mouseX >= boxX && p.mouseX <= boxX + ruleBoxSize &&
                            p.mouseY >= boxY && p.mouseY <= boxY + ruleBoxSize) {
                            RULES[i].result = RULES[i].result === 1 ? 0 : 1;
                            let binaryString = RULES.map(rule => rule.result).join('');
                            let newRuleNum = parseInt(binaryString, 2);
                            ruleInput.value(newRuleNum);
                            drawRulesVisuals();
                            return;
                        }
                    }
                    return;
                }
              
                // Otherwise, check for clicks on first row of grid
                let x = p.floor((p.mouseX - gridOffsetX) / cellSize);
                let y = p.floor(p.mouseY / cellSize);
                if (y === 0 && x >= 0 && x < cols) {
                    grid[x][y] = grid[x][y] === 1 ? 0 : 1;
                    drawRow(0);
                }
            };

            p.windowResized = function() {
                cols = p.floor((canvasContainer.offsetWidth - gridOffsetX) / cellSize);
                p.resizeCanvas(canvasContainer.offsetWidth, rows * cellSize);
                // Reset simulation with new dimensions
                grid = create2DArray(cols, rows);
                initializeFirstRow();
                updateDarkMode();
                p.background(isDarkMode ? 30 : 240);
                drawRow(0);
                currentRow = 0;
                running = false;
                p.noLoop();
            };

            // Helper functions
            function initializeFirstRow() {
                const fillValue = fillRateSelect.value;
                
                // Clear first row
                for (let i = 0; i < cols; i++) {
                    grid[i][0] = 0;
                }
                
                if (fillValue === "1") {
                    // Single pixel in the middle
                    grid[p.floor(cols / 2)][0] = 1;
                } else {
                    // Random fill with specified percentage
                    const fillRate = parseFloat(fillValue);
                    for (let i = 0; i < cols; i++) {
                        grid[i][0] = p.random() < fillRate ? 1 : 0;
                    }
                }
            }

            function resetBelowFirst() {
                for (let i = 0; i < cols; i++) {
                    for (let j = 1; j < rows; j++) {
                        grid[i][j] = 0;
                    }
                }
                updateDarkMode();
                p.background(isDarkMode ? 30 : 240);
                drawRow(0);
                currentRow = 0;
            }

            function updateRulesFromNumber(num) {
                let ruleNum = parseInt(num);
                if (isNaN(ruleNum) || ruleNum < 0 || ruleNum > 255) return;
                let bin = ruleNum.toString(2).padStart(8, '0');
                for (let i = 0; i < RULES.length; i++) {
                    RULES[i].result = parseInt(bin[i]);
                }
            }

            function computeEntropy() {
                if (currentRow < 0) return 0;
                let counts = {};
                for (let r = 0; r <= currentRow; r++) {
                    let rowString = "";
                    for (let c = 0; c < cols; c++) {
                        rowString += grid[c][r];
                    }
                    counts[rowString] = (counts[rowString] || 0) + 1;
                }
                let total = currentRow + 1;
                let entropy = 0;
                for (let key in counts) {
                    let prob = counts[key] / total;
                    entropy -= prob * Math.log(prob) / Math.log(2);
                }
                return entropy;
            }

            function computeColEntropy() {
                let counts = {};
                for (let c = 0; c < cols; c++) {
                    let colString = "";
                    for (let r = 0; r <= currentRow; r++) {
                        colString += grid[c][r];
                    }
                    counts[colString] = (counts[colString] || 0) + 1;
                }
                let total = cols;
                let entropy = 0;
                for (let key in counts) {
                    let prob = counts[key] / total;
                    entropy -= prob * Math.log(prob) / Math.log(2);
                }
                return entropy;
            }

            function drawRow(rowIndex) {
                updateDarkMode();
                for (let i = 0; i < cols; i++) {
                    let x = gridOffsetX + i * cellSize;
                    let y = rowIndex * cellSize;
                    if (grid[i][rowIndex] === 1) {
                        p.fill(isDarkMode ? 255 : 0); // Light for active cells in dark mode
                    } else {
                        p.fill(isDarkMode ? 30 : 255); // Dark background for inactive cells in dark mode
                    }
                    p.stroke(isDarkMode ? 100 : 200);
                    p.rect(x, y, cellSize, cellSize);
                }
            }

            function drawRulesVisuals() {
                updateDarkMode();
                p.noStroke();
                p.fill(isDarkMode ? 30 : 240);
                p.rect(0, 0, gridOffsetX, p.height);
                
                let ruleBoxSize = 15;
                let startX = 10;
                let startY = 130;
                let spacingY = ruleBoxSize * 2 + 10;
                
                for (let i = 0; i < RULES.length; i++) {
                    let { pattern, result } = RULES[i];
                    let posY = startY + i * spacingY;
                    for (let j = 0; j < 3; j++) {
                        let posX = startX + j * (ruleBoxSize + 2);
                        (pattern[j] === "1") ? p.fill(isDarkMode ? 255 : 0) : p.fill(isDarkMode ? 30 : 255);
                        p.stroke(isDarkMode ? 100 : 200);
                        p.rect(posX, posY, ruleBoxSize, ruleBoxSize);
                    }
                    let centerX = startX + ((ruleBoxSize + 2) * 1);
                    let posY2 = posY + ruleBoxSize + 2;
                    (result === 1) ? p.fill(isDarkMode ? 255 : 0) : p.fill(isDarkMode ? 30 : 255);
                    p.stroke(isDarkMode ? 100 : 200);
                    p.rect(centerX, posY2, ruleBoxSize, ruleBoxSize);
                }
            }

            function rules(left, me, right) {
                let s = '' + left + me + right;
                for (let i = 0; i < RULES.length; i++) {
                    if (RULES[i].pattern === s) return RULES[i].result;
                }
                return 0;
            }

            function create2DArray(cols, rows) {
                let arr = new Array(cols);
                for (let i = 0; i < cols; i++) {
                    arr[i] = new Array(rows).fill(0);
                }
                return arr;
            }

            function generate() {
                if (currentRow >= rows - 1) {
                    running = false;
                    p.noLoop();
                    return;
                }
                let nextRow = currentRow + 1;
                for (let i = 0; i < cols; i++) {
                    let left = toroidal ? grid[(i - 1 + cols) % cols][currentRow] : ((i - 1) < 0 ? 0 : grid[i - 1][currentRow]);
                    let me = grid[i][currentRow];
                    let right = toroidal ? grid[(i + 1) % cols][currentRow] : ((i + 1) >= cols ? 0 : grid[i + 1][currentRow]);
                    grid[i][nextRow] = rules(left, me, right);
                }
                currentRow++;
            }
        };

        // Button event handlers
        startButton.addEventListener('click', () => {
            const resetBelowFirst = () => {
                for (let i = 0; i < cols; i++) {
                    for (let j = 1; j < rows; j++) {
                        grid[i][j] = 0;
                    }
                }
                updateDarkMode();
                p5Instance.background(isDarkMode ? 30 : 240);
                const drawRow = (rowIndex) => {
                    for (let i = 0; i < cols; i++) {
                        let x = gridOffsetX + i * cellSize;
                        let y = rowIndex * cellSize;
                        if (grid[i][rowIndex] === 1) {
                            p5Instance.fill(isDarkMode ? 255 : 0);
                        } else {
                            p5Instance.fill(isDarkMode ? 30 : 255);
                        }
                        p5Instance.stroke(isDarkMode ? 100 : 200);
                        p5Instance.rect(x, y, cellSize, cellSize);
                    }
                };
                drawRow(0);
                currentRow = 0;
            };
            
            resetBelowFirst();
            running = true;
            p5Instance.loop();
        });
        
        startButton.innerText = "Redraw";

        resetButton.addEventListener('click', () => {
            grid = create2DArray(cols, rows);
            const fillValue = fillRateSelect.value;
            
            // Clear first row
            for (let i = 0; i < cols; i++) {
                grid[i][0] = 0;
            }
            
            if (fillValue === "1") {
                grid[Math.floor(cols / 2)][0] = 1;
            } else {
                const fillRate = parseFloat(fillValue);
                for (let i = 0; i < cols; i++) {
                    grid[i][0] = p5Instance.random() < fillRate ? 1 : 0;
                }
            }
            
            updateDarkMode();
            p5Instance.background(isDarkMode ? 30 : 240);
            const drawRow = (rowIndex) => {
                for (let i = 0; i < cols; i++) {
                    let x = gridOffsetX + i * cellSize;
                    let y = rowIndex * cellSize;
                    if (grid[i][rowIndex] === 1) {
                        p5Instance.fill(isDarkMode ? 255 : 0);
                    } else {
                        p5Instance.fill(isDarkMode ? 30 : 255);
                    }
                    p5Instance.stroke(isDarkMode ? 100 : 200);
                    p5Instance.rect(x, y, cellSize, cellSize);
                }
            };
            drawRow(0);
            currentRow = 0;
            running = false;
            
            // Auto-restart after reset
            setTimeout(() => {
                startButton.click();
            }, 1000);
            p5Instance.noLoop();
        });

        function create2DArray(cols, rows) {
            let arr = new Array(cols);
            for (let i = 0; i < cols; i++) {
                arr[i] = new Array(rows).fill(0);
            }
            return arr;
        }

        // Initialize P5.js instance
        p5Instance = new p5(sketch);

        // Store reference for cleanup
        if (!window.elementaryAutomataDemos) {
            window.elementaryAutomataDemos = {};
        }
        const demoId = 'elementary-' + Math.random().toString(36).substr(2, 9);
        window.elementaryAutomataDemos[demoId] = p5Instance;
        
        // Listen for theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            updateDarkMode();
            if (p5Instance) {
                p5Instance.background(isDarkMode ? 30 : 240);
                p5Instance.redraw();
            }
        });
    }
})();