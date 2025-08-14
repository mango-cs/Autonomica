class CellularAutomaton {
    constructor() {
        this.canvas = document.getElementById('automaton');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 80;
        this.cellSize = 0;
        this.numStates = 3;
        this.speed = 5;
        this.generation = 0;
        this.isRunning = true;
        this.grid = [];
        this.nextGrid = [];
        
        // Color palettes for different numbers of states
        this.defaultColorPalettes = {
            2: ['#000000', '#FF6B6B'],
            3: ['#000000', '#FF6B6B', '#4ECDC4'],
            4: ['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1'],
            5: ['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
            6: ['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
            7: ['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
            8: ['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
        };
        
        // Preset color themes
        this.presetPalettes = {
            default: this.defaultColorPalettes,
            ocean: {
                2: ['#000814', '#007BFF'],
                3: ['#000814', '#007BFF', '#0396FF'],
                4: ['#000814', '#007BFF', '#0396FF', '#87CEEB'],
                5: ['#000814', '#007BFF', '#0396FF', '#87CEEB', '#B0E0E6'],
                6: ['#000814', '#007BFF', '#0396FF', '#87CEEB', '#B0E0E6', '#E0F6FF'],
                7: ['#000814', '#007BFF', '#0396FF', '#87CEEB', '#B0E0E6', '#E0F6FF', '#F0F8FF'],
                8: ['#000814', '#007BFF', '#0396FF', '#87CEEB', '#B0E0E6', '#E0F6FF', '#F0F8FF', '#AFEEEE']
            },
            sunset: {
                2: ['#1A0A00', '#FF4500'],
                3: ['#1A0A00', '#FF4500', '#FF6347'],
                4: ['#1A0A00', '#FF4500', '#FF6347', '#FFA500'],
                5: ['#1A0A00', '#FF4500', '#FF6347', '#FFA500', '#FFD700'],
                6: ['#1A0A00', '#FF4500', '#FF6347', '#FFA500', '#FFD700', '#FFFF00'],
                7: ['#1A0A00', '#FF4500', '#FF6347', '#FFA500', '#FFD700', '#FFFF00', '#FFFACD'],
                8: ['#1A0A00', '#FF4500', '#FF6347', '#FFA500', '#FFD700', '#FFFF00', '#FFFACD', '#FFF8DC']
            },
            forest: {
                2: ['#0F1A0F', '#228B22'],
                3: ['#0F1A0F', '#228B22', '#32CD32'],
                4: ['#0F1A0F', '#228B22', '#32CD32', '#7CFC00'],
                5: ['#0F1A0F', '#228B22', '#32CD32', '#7CFC00', '#ADFF2F'],
                6: ['#0F1A0F', '#228B22', '#32CD32', '#7CFC00', '#ADFF2F', '#9ACD32'],
                7: ['#0F1A0F', '#228B22', '#32CD32', '#7CFC00', '#ADFF2F', '#9ACD32', '#F0FFF0'],
                8: ['#0F1A0F', '#228B22', '#32CD32', '#7CFC00', '#ADFF2F', '#9ACD32', '#F0FFF0', '#E0FFE0']
            },
            neon: {
                2: ['#000000', '#FF0080'],
                3: ['#000000', '#FF0080', '#00FF80'],
                4: ['#000000', '#FF0080', '#00FF80', '#8000FF'],
                5: ['#000000', '#FF0080', '#00FF80', '#8000FF', '#FF8000'],
                6: ['#000000', '#FF0080', '#00FF80', '#8000FF', '#FF8000', '#0080FF'],
                7: ['#000000', '#FF0080', '#00FF80', '#8000FF', '#FF8000', '#0080FF', '#FF0040'],
                8: ['#000000', '#FF0080', '#00FF80', '#8000FF', '#FF8000', '#0080FF', '#FF0040', '#40FF00']
            },
            pastel: {
                2: ['#2A2A2A', '#FFB3BA'],
                3: ['#2A2A2A', '#FFB3BA', '#BAFFC9'],
                4: ['#2A2A2A', '#FFB3BA', '#BAFFC9', '#BAE1FF'],
                5: ['#2A2A2A', '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA'],
                6: ['#2A2A2A', '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA'],
                7: ['#2A2A2A', '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4'],
                8: ['#2A2A2A', '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4', '#D4F4DD']
            }
        };
        
        this.colorPalettes = { ...this.defaultColorPalettes };
        this.currentPreset = 'default';
        
        this.init();
        this.setupEventListeners();
        this.setupColorControls();
        this.updateColorLegend();
        this.animate();
    }
    
    init() {
        this.updateCanvasSize();
        this.initializeGrid();
        this.seedGrid();
    }
    
    updateCanvasSize() {
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(800, container.clientWidth - 40);
        const maxHeight = Math.min(600, window.innerHeight * 0.6);
        
        // Make canvas square using the smaller dimension
        const size = Math.min(maxWidth, maxHeight);
        this.canvas.width = size;
        this.canvas.height = size;
        
        // Calculate cell size to fit exactly in the square
        this.cellSize = size / this.gridSize;
    }
    
    initializeGrid() {
        this.grid = [];
        this.nextGrid = [];
        
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            this.nextGrid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = 0; // Start with state 0 (black)
                this.nextGrid[i][j] = 0;
            }
        }
    }
    
    seedGrid() {
        // Create interesting initial patterns
        const centerX = Math.floor(this.gridSize / 2);
        const centerY = Math.floor(this.gridSize / 2);
        
        // Central seed pattern
        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                const x = centerX + i;
                const y = centerY + j;
                if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
                    this.grid[x][y] = Math.floor(Math.random() * this.numStates);
                }
            }
        }
        
        // Add some random seeds around the grid
        for (let i = 0; i < Math.floor(this.gridSize / 4); i++) {
            const x = Math.floor(Math.random() * this.gridSize);
            const y = Math.floor(Math.random() * this.gridSize);
            this.grid[x][y] = Math.floor(Math.random() * this.numStates);
        }
    }
    
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
                neighbors.push(this.grid[nx][ny]);
            }
        }
        
        return neighbors;
    }
    
    update() {
        if (!this.isRunning) return;
        
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const currentState = this.grid[x][y];
                const neighbors = this.getNeighbors(x, y);
                const nextState = (currentState + 1) % this.numStates;
                
                // Rule: A cell changes to the next state if at least one neighbor has that next state
                const hasNextStateNeighbor = neighbors.includes(nextState);
                
                if (hasNextStateNeighbor) {
                    this.nextGrid[x][y] = nextState;
                } else {
                    this.nextGrid[x][y] = currentState;
                }
            }
        }
        
        // Swap grids
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
        this.generation++;
        this.updateStats();
    }
    
    draw() {
        const colors = this.colorPalettes[this.numStates];
        
        // Fill background with the background color (state 0)
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all cells
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const state = this.grid[x][y];
                if (state > 0) { // Only draw non-background states
                    this.ctx.fillStyle = colors[state];
                    this.ctx.fillRect(
                        Math.floor(x * this.cellSize),
                        Math.floor(y * this.cellSize),
                        Math.ceil(this.cellSize),
                        Math.ceil(this.cellSize)
                    );
                }
            }
        }
    }
    
    animate() {
        let lastUpdate = 0;
        const updateInterval = 1000 / this.speed; // Convert speed to milliseconds
        
        const loop = (currentTime) => {
            if (currentTime - lastUpdate >= updateInterval) {
                this.update();
                this.draw();
                lastUpdate = currentTime;
            }
            requestAnimationFrame(loop);
        };
        
        requestAnimationFrame(loop);
    }
    
    reset() {
        this.generation = 0;
        this.initializeGrid();
        this.seedGrid();
        this.updateStats();
    }
    
    randomize() {
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                this.grid[x][y] = Math.floor(Math.random() * this.numStates);
            }
        }
        this.generation = 0;
        this.updateStats();
    }
    
    setNumStates(states) {
        this.numStates = parseInt(states);
        this.setupColorPickers();
        this.reset();
        this.updateColorLegend();
    }
    
    setSpeed(speed) {
        this.speed = parseInt(speed);
    }
    
    setGridSize(size) {
        this.gridSize = parseInt(size);
        this.updateCanvasSize();
        this.reset();
    }
    
    togglePlayPause() {
        this.isRunning = !this.isRunning;
        const btn = document.getElementById('playPauseBtn');
        btn.textContent = this.isRunning ? '⏸️ Pause' : '▶️ Play';
    }
    
    updateColorLegend() {
        const colorStatesContainer = document.getElementById('colorStates');
        colorStatesContainer.innerHTML = '';
        
        const colors = this.colorPalettes[this.numStates];
        const stateNames = ['Inactive', 'State 1', 'State 2', 'State 3', 'State 4', 'State 5', 'State 6', 'State 7'];
        
        for (let i = 0; i < this.numStates; i++) {
            const stateElement = document.createElement('div');
            stateElement.className = 'color-state';
            
            const colorSample = document.createElement('div');
            colorSample.className = 'color-sample';
            colorSample.style.backgroundColor = colors[i];
            
            const stateName = document.createElement('span');
            stateName.textContent = stateNames[i] || `State ${i}`;
            
            stateElement.appendChild(colorSample);
            stateElement.appendChild(stateName);
            colorStatesContainer.appendChild(stateElement);
        }
    }
    
    updateStats() {
        document.getElementById('generation').textContent = this.generation;
        
        // Count active (non-zero) cells
        let activeCells = 0;
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                if (this.grid[x][y] > 0) {
                    activeCells++;
                }
            }
        }
        document.getElementById('activeCells').textContent = activeCells;
    }
    
    setupColorControls() {
        this.setupColorPickers();
        this.setupPresetButtons();
        this.setupColorActions();
    }
    
    setupColorPickers() {
        const customColorsContainer = document.getElementById('customColors');
        customColorsContainer.innerHTML = '';
        
        for (let i = 0; i < this.numStates; i++) {
            const pickerGroup = document.createElement('div');
            pickerGroup.className = 'color-picker-group';
            
            const label = document.createElement('label');
            label.textContent = i === 0 ? 'Background' : `State ${i}`;
            
            const colorPicker = document.createElement('input');
            colorPicker.type = 'color';
            colorPicker.className = 'color-picker';
            colorPicker.value = this.colorPalettes[this.numStates][i];
            colorPicker.addEventListener('change', (e) => {
                this.updateColorState(i, e.target.value);
            });
            
            pickerGroup.appendChild(label);
            pickerGroup.appendChild(colorPicker);
            customColorsContainer.appendChild(pickerGroup);
        }
    }
    
    setupPresetButtons() {
        const presetButtons = document.querySelectorAll('.color-preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyColorPreset(e.target.dataset.preset);
                this.updatePresetButtonState(e.target.dataset.preset);
            });
        });
        this.updatePresetButtonState(this.currentPreset);
    }
    
    setupColorActions() {
        document.getElementById('randomColorsBtn').addEventListener('click', () => {
            this.generateRandomColors();
        });
        
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadImage();
        });
    }
    
    updateColorState(stateIndex, color) {
        this.colorPalettes[this.numStates][stateIndex] = color;
        this.updateColorLegend();
        this.currentPreset = 'custom';
        this.updatePresetButtonState('custom');
    }
    
    applyColorPreset(presetName) {
        if (this.presetPalettes[presetName]) {
            this.colorPalettes = JSON.parse(JSON.stringify(this.presetPalettes[presetName]));
            this.currentPreset = presetName;
            this.setupColorPickers();
            this.updateColorLegend();
        }
    }
    
    updatePresetButtonState(activePreset) {
        const presetButtons = document.querySelectorAll('.color-preset-btn');
        presetButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.preset === activePreset) {
                btn.classList.add('active');
            }
        });
    }
    
    generateRandomColors() {
        for (let i = 1; i < this.numStates; i++) { // Skip background color (index 0)
            const randomColor = this.getRandomColor();
            this.colorPalettes[this.numStates][i] = randomColor;
        }
        this.setupColorPickers();
        this.updateColorLegend();
        this.currentPreset = 'custom';
        this.updatePresetButtonState('custom');
    }
    
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    downloadImage() {
        // Pause the simulation to capture a clean image
        const wasRunning = this.isRunning;
        if (this.isRunning) {
            this.togglePlayPause();
        }
        
        // Create a higher resolution canvas for better quality
        const scale = 2; // 2x resolution for better quality
        const downloadCanvas = document.createElement('canvas');
        const downloadCtx = downloadCanvas.getContext('2d');
        
        downloadCanvas.width = this.canvas.width * scale;
        downloadCanvas.height = this.canvas.height * scale;
        
        // Scale the context for high resolution
        downloadCtx.scale(scale, scale);
        
        // Draw the current state
        const colors = this.colorPalettes[this.numStates];
        const cellSize = this.canvas.width / this.gridSize;
        
        // Fill background
        downloadCtx.fillStyle = colors[0];
        downloadCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all cells
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const state = this.grid[x][y];
                if (state > 0) {
                    downloadCtx.fillStyle = colors[state];
                    downloadCtx.fillRect(
                        Math.floor(x * cellSize),
                        Math.floor(y * cellSize),
                        Math.ceil(cellSize),
                        Math.ceil(cellSize)
                    );
                }
            }
        }
        
        // Download the image
        downloadCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `cellular-automaton-${this.numStates}states-gen${this.generation}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showNotification('Image downloaded!', 'success');
            
            // Resume simulation if it was running
            if (wasRunning && !this.isRunning) {
                this.togglePlayPause();
            }
        }, 'image/png');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            font-family: inherit;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: opacity 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }
    
    setupEventListeners() {
        // Sliders
        const statesSlider = document.getElementById('statesSlider');
        const speedSlider = document.getElementById('speedSlider');
        const gridSizeSlider = document.getElementById('gridSizeSlider');
        
        statesSlider.addEventListener('input', (e) => {
            document.getElementById('statesValue').textContent = e.target.value;
            this.setNumStates(e.target.value);
        });
        
        speedSlider.addEventListener('input', (e) => {
            document.getElementById('speedValue').textContent = e.target.value;
            this.setSpeed(e.target.value);
        });
        
        gridSizeSlider.addEventListener('input', (e) => {
            document.getElementById('gridSizeValue').textContent = e.target.value;
            this.setGridSize(e.target.value);
        });
        
        // Buttons
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
        
        document.getElementById('randomBtn').addEventListener('click', () => {
            this.randomize();
        });
        
        // Canvas click interaction
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / this.cellSize);
            const y = Math.floor((e.clientY - rect.top) / this.cellSize);
            
            if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
                this.grid[x][y] = (this.grid[x][y] + 1) % this.numStates;
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'r':
                    this.reset();
                    break;
                case 'Enter':
                    this.randomize();
                    break;
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.updateCanvasSize();
        });
    }
}

// Initialize the cellular automaton when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CellularAutomaton();
});

// Add some utility functions for enhanced interactivity
function addTooltips() {
    const tooltips = {
        'statesSlider': 'Adjust the number of color states in the cycle',
        'speedSlider': 'Control how fast the automaton updates',
        'gridSizeSlider': 'Change the size of the grid',
        'playPauseBtn': 'Pause/Resume the simulation (Spacebar)',
        'resetBtn': 'Reset to initial pattern (R key)',
        'randomBtn': 'Generate random pattern (Enter key)'
    };
    
    Object.entries(tooltips).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = text;
        }
    });
}

// Add tooltips when page loads
document.addEventListener('DOMContentLoaded', addTooltips); 