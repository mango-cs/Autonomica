class GasSimulation {
    constructor() {
        this.canvas = document.getElementById('simulationCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Simulation parameters
        this.particles = [];
        this.particleTrails = [];
        this.pressureGrid = [];
        this.gridSize = 12;
        this.gridWidth = Math.ceil(this.width / this.gridSize);
        this.gridHeight = Math.ceil(this.height / this.gridSize);
        
        // Controls
        this.pressureSensitivity = 1.0;
        this.expansionSpeed = 1.5;
        this.gasAmount = 30;
        this.gravity = 0.08;
        this.airResistance = 0.98;
        this.damping = 0.7;
        this.selectedGas = 'air';
        this.selectedTool = null;
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isPaused = false;
        
        // Visualization options
        this.showPressureGrid = true;
        this.showTrails = false;
        this.showVectors = false;
        
        // Performance tracking
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        
        // Gas properties with enhanced physics
        this.gasTypes = {
            air: { 
                color: [100, 150, 255], 
                weight: 1.0, 
                expansion: 1.0, 
                viscosity: 0.85,
                buoyancy: 0.0,
                dissipation: 0.999
            },
            smoke: { 
                color: [80, 80, 80], 
                weight: 0.7, 
                expansion: 1.3, 
                viscosity: 0.7,
                buoyancy: -0.05,
                dissipation: 0.995
            },
            steam: { 
                color: [220, 220, 255], 
                weight: 0.5, 
                expansion: 1.8, 
                viscosity: 0.6,
                buoyancy: -0.08,
                dissipation: 0.992
            },
            carbon: { 
                color: [180, 80, 80], 
                weight: 1.5, 
                expansion: 0.8, 
                viscosity: 0.9,
                buoyancy: 0.03,
                dissipation: 0.998
            }
        };
        
        // Initialize
        this.initPressureGrid();
        this.setupEventListeners();
        this.updateGasInfo();
        this.animate();
    }
    
    initPressureGrid() {
        this.pressureGrid = [];
        for (let x = 0; x < this.gridWidth; x++) {
            this.pressureGrid[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {
                this.pressureGrid[x][y] = {
                    pressure: 0,
                    gasType: null,
                    particles: [],
                    blocked: false,
                    leaky: false,
                    valve: false,
                    valveOpen: false,
                    compressor: false
                };
            }
        }
    }
    
    setupEventListeners() {
        // Slider controls
        this.setupSlider('pressureSensitivity', 'pressureValue', (value) => {
            this.pressureSensitivity = parseFloat(value);
        });
        
        this.setupSlider('expansionSpeed', 'expansionValue', (value) => {
            this.expansionSpeed = parseFloat(value);
        });
        
        this.setupSlider('gasAmount', 'gasAmountValue', (value) => {
            this.gasAmount = parseInt(value);
        });
        
        this.setupSlider('gravity', 'gravityValue', (value) => {
            this.gravity = parseFloat(value);
        });
        
        this.setupSlider('airResistance', 'airResistanceValue', (value) => {
            this.airResistance = parseFloat(value);
        });
        
        this.setupSlider('damping', 'dampingValue', (value) => {
            this.damping = parseFloat(value);
        });
        
        // Gas type buttons
        document.querySelectorAll('.gas-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.gas-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedGas = btn.dataset.gas;
                this.updateGasInfo();
            });
        });
        
        // Tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.selectedTool === btn.dataset.tool) {
                    // Deselect tool
                    btn.classList.remove('active');
                    this.selectedTool = null;
                } else {
                    // Select new tool
                    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.selectedTool = btn.dataset.tool;
                }
            });
        });
        
        // Visualization checkboxes
        document.getElementById('showPressureGrid').addEventListener('change', (e) => {
            this.showPressureGrid = e.target.checked;
        });
        
        document.getElementById('showTrails').addEventListener('change', (e) => {
            this.showTrails = e.target.checked;
            if (!this.showTrails) {
                this.particleTrails = [];
            }
        });
        
        document.getElementById('showVectors').addEventListener('change', (e) => {
            this.showVectors = e.target.checked;
        });
        
        // Action buttons
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            document.getElementById('pauseBtn').textContent = this.isPaused ? '▶️ Resume' : '⏸️ Pause';
        });
        
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearSimulation();
        });
        
        document.getElementById('presetBtn').addEventListener('click', () => {
            this.loadPreset();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSettings();
        });
        
        // Canvas mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.handleMouseInteraction(e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            
            if (this.isMouseDown) {
                this.handleMouseInteraction(e);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
        
        // Valve clicks
        this.canvas.addEventListener('click', (e) => {
            if (!this.selectedTool) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const gridX = Math.floor(x / this.gridSize);
                const gridY = Math.floor(y / this.gridSize);
                
                if (this.pressureGrid[gridX] && this.pressureGrid[gridX][gridY] && 
                    this.pressureGrid[gridX][gridY].valve) {
                    this.pressureGrid[gridX][gridY].valveOpen = !this.pressureGrid[gridX][gridY].valveOpen;
                }
            }
        });
    }
    
    setupSlider(id, valueId, callback) {
        const slider = document.getElementById(id);
        const valueSpan = document.getElementById(valueId);
        
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            valueSpan.textContent = value;
            callback(value);
        });
    }
    
    handleMouseInteraction(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.selectedTool) {
            this.placeTool(x, y);
        } else {
            this.injectGas(x, y);
        }
    }
    
    placeTool(x, y) {
        const gridX = Math.floor(x / this.gridSize);
        const gridY = Math.floor(y / this.gridSize);
        
        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            const cell = this.pressureGrid[gridX][gridY];
            
            // Reset cell properties
            cell.blocked = false;
            cell.leaky = false;
            cell.valve = false;
            cell.valveOpen = false;
            cell.compressor = false;
            
            switch (this.selectedTool) {
                case 'wall':
                    cell.blocked = true;
                    break;
                case 'leakyWall':
                    cell.blocked = true;
                    cell.leaky = true;
                    break;
                case 'valve':
                    cell.valve = true;
                    cell.valveOpen = false;
                    break;
                case 'compressor':
                    cell.compressor = true;
                    break;
            }
        }
    }
    
    injectGas(x, y) {
        const gas = this.gasTypes[this.selectedGas];
        
        for (let i = 0; i < this.gasAmount; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y + (Math.random() - 0.5) * 30,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                type: this.selectedGas,
                life: 100,
                pressure: 0,
                density: 1.0,
                age: 0
            });
        }
    }
    
    updateGasInfo() {
        const gas = this.gasTypes[this.selectedGas];
        document.getElementById('gasWeight').textContent = gas.weight.toFixed(1);
        document.getElementById('gasExpansion').textContent = gas.expansion.toFixed(1);
        document.getElementById('gasViscosity').textContent = gas.viscosity.toFixed(1);
    }
    
    resetSettings() {
        // Reset all sliders to default values
        document.getElementById('pressureSensitivity').value = 1.0;
        document.getElementById('expansionSpeed').value = 1.5;
        document.getElementById('gasAmount').value = 30;
        document.getElementById('gravity').value = 0.08;
        document.getElementById('airResistance').value = 0.98;
        document.getElementById('damping').value = 0.7;
        
        // Update display values
        document.getElementById('pressureValue').textContent = '1.0';
        document.getElementById('expansionValue').textContent = '1.5';
        document.getElementById('gasAmountValue').textContent = '30';
        document.getElementById('gravityValue').textContent = '0.08';
        document.getElementById('airResistanceValue').textContent = '0.98';
        document.getElementById('dampingValue').textContent = '0.7';
        
        // Update simulation values
        this.pressureSensitivity = 1.0;
        this.expansionSpeed = 1.5;
        this.gasAmount = 30;
        this.gravity = 0.08;
        this.airResistance = 0.98;
        this.damping = 0.7;
    }
    
    loadPreset() {
        // Create a chamber with some walls and a valve
        const centerX = Math.floor(this.gridWidth / 2);
        const centerY = Math.floor(this.gridHeight / 2);
        const size = 8;
        
        // Clear existing
        this.clearSimulation();
        
        // Create chamber walls
        for (let x = centerX - size; x <= centerX + size; x++) {
            for (let y = centerY - size; y <= centerY + size; y++) {
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    const cell = this.pressureGrid[x][y];
                    if (x === centerX - size || x === centerX + size || 
                        y === centerY - size || y === centerY + size) {
                        if (x === centerX + size && y === centerY) {
                            // Add valve on right side
                            cell.valve = true;
                            cell.valveOpen = false;
                        } else {
                            cell.blocked = true;
                        }
                    }
                }
            }
        }
        
        // Add some compressors
        this.pressureGrid[centerX - 3][centerY - 3].compressor = true;
        this.pressureGrid[centerX + 3][centerY + 3].compressor = true;
        
        // Inject some gas
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: (centerX - 2) * this.gridSize + Math.random() * this.gridSize * 4,
                y: (centerY - 2) * this.gridSize + Math.random() * this.gridSize * 4,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                type: 'air',
                life: 100,
                pressure: 0,
                density: 1.0,
                age: 0
            });
        }
    }
    
    updateParticles() {
        if (this.isPaused) return;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            const gas = this.gasTypes[particle.type];
            
            // Age particle
            particle.age++;
            
            // Apply gravity and buoyancy
            particle.vy += (this.gravity * gas.weight) + gas.buoyancy;
            
            // Get current grid position
            const gridX = Math.floor(particle.x / this.gridSize);
            const gridY = Math.floor(particle.y / this.gridSize);
            
            if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
                const cell = this.pressureGrid[gridX][gridY];
                
                // Pressure-based forces
                let forceX = 0, forceY = 0;
                
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        if (dx === 0 && dy === 0) continue;
                        
                        const nx = gridX + dx;
                        const ny = gridY + dy;
                        
                        if (nx >= 0 && nx < this.gridWidth && ny >= 0 && ny < this.gridHeight) {
                            const neighborCell = this.pressureGrid[nx][ny];
                            const pressureDiff = cell.pressure - neighborCell.pressure;
                            
                            if (pressureDiff > 0 && !neighborCell.blocked) {
                                const force = pressureDiff * this.pressureSensitivity * 0.02;
                                forceX += dx * force;
                                forceY += dy * force;
                            }
                        }
                    }
                }
                
                particle.vx += forceX;
                particle.vy += forceY;
                
                // Compressor effect
                if (cell.compressor) {
                    const centerX = (gridX + 0.5) * this.gridSize;
                    const centerY = (gridY + 0.5) * this.gridSize;
                    const dx = centerX - particle.x;
                    const dy = centerY - particle.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist > 1) {
                        const force = 0.8 / dist;
                        particle.vx += (dx / dist) * force;
                        particle.vy += (dy / dist) * force;
                        particle.density += 0.05;
                    }
                }
            }
            
            // Apply air resistance
            particle.vx *= this.airResistance * gas.viscosity;
            particle.vy *= this.airResistance * gas.viscosity;
            
            // Update position
            particle.x += particle.vx * this.expansionSpeed * gas.expansion;
            particle.y += particle.vy * this.expansionSpeed * gas.expansion;
            
            // Handle boundary collisions
            if (particle.x <= 0 || particle.x >= this.width) {
                particle.vx *= -this.damping;
                particle.x = Math.max(1, Math.min(this.width - 1, particle.x));
            }
            
            if (particle.y <= 0 || particle.y >= this.height) {
                particle.vy *= -this.damping;
                particle.y = Math.max(1, Math.min(this.height - 1, particle.y));
            }
            
            // Handle wall collisions with proper physics
            this.handleWallCollisions(particle);
            
            // Add particle trail if enabled
            if (this.showTrails && particle.age % 3 === 0) {
                this.particleTrails.push({
                    x: particle.x,
                    y: particle.y,
                    type: particle.type,
                    life: 30
                });
            }
            
            // Apply dissipation and remove old particles
            particle.life *= gas.dissipation;
            particle.density = Math.max(0.1, particle.density * 0.999);
            
            if (particle.life < 1 || particle.density < 0.1) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update particle trails
        if (this.showTrails) {
            for (let i = this.particleTrails.length - 1; i >= 0; i--) {
                this.particleTrails[i].life--;
                if (this.particleTrails[i].life <= 0) {
                    this.particleTrails.splice(i, 1);
                }
            }
        }
    }
    
    handleWallCollisions(particle) {
        const gridX = Math.floor(particle.x / this.gridSize);
        const gridY = Math.floor(particle.y / this.gridSize);
        
        // Check current cell and adjacent cells for walls
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const checkX = gridX + dx;
                const checkY = gridY + dy;
                
                if (checkX >= 0 && checkX < this.gridWidth && 
                    checkY >= 0 && checkY < this.gridHeight) {
                    const cell = this.pressureGrid[checkX][checkY];
                    
                    if (cell.blocked) {
                        const cellLeft = checkX * this.gridSize;
                        const cellRight = (checkX + 1) * this.gridSize;
                        const cellTop = checkY * this.gridSize;
                        const cellBottom = (checkY + 1) * this.gridSize;
                        
                        // Check if particle is inside or intersecting with wall
                        if (particle.x >= cellLeft && particle.x <= cellRight &&
                            particle.y >= cellTop && particle.y <= cellBottom) {
                            
                            if (cell.valve && !cell.valveOpen) {
                                // Closed valve - reflect particle
                                this.reflectParticleFromWall(particle, checkX, checkY);
                            } else if (cell.leaky && Math.random() < 0.01) {
                                // Leaky wall - very small chance to pass through
                                particle.density *= 0.5;
                                particle.life *= 0.8;
                            } else if (!cell.valve) {
                                // Solid wall - completely reflect
                                this.reflectParticleFromWall(particle, checkX, checkY);
                            }
                        }
                    }
                }
            }
        }
    }
    
    reflectParticleFromWall(particle, wallGridX, wallGridY) {
        const wallCenterX = (wallGridX + 0.5) * this.gridSize;
        const wallCenterY = (wallGridY + 0.5) * this.gridSize;
        
        const dx = particle.x - wallCenterX;
        const dy = particle.y - wallCenterY;
        
        // Determine which edge of the wall was hit
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        
        if (absX > absY) {
            // Hit left or right edge
            particle.vx = -particle.vx * this.damping;
            particle.x = wallCenterX + Math.sign(dx) * (this.gridSize * 0.6);
        } else {
            // Hit top or bottom edge
            particle.vy = -particle.vy * this.damping;
            particle.y = wallCenterY + Math.sign(dy) * (this.gridSize * 0.6);
        }
        
        // Add some random scatter to prevent particles getting stuck
        particle.vx += (Math.random() - 0.5) * 0.1;
        particle.vy += (Math.random() - 0.5) * 0.1;
    }
    
    updatePressureGrid() {
        // Clear grid
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                this.pressureGrid[x][y].particles = [];
                this.pressureGrid[x][y].pressure = 0;
            }
        }
        
        // Assign particles to grid cells
        this.particles.forEach(particle => {
            const gridX = Math.floor(particle.x / this.gridSize);
            const gridY = Math.floor(particle.y / this.gridSize);
            
            if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
                this.pressureGrid[gridX][gridY].particles.push(particle);
                this.pressureGrid[gridX][gridY].pressure += 1;
                
                if (!this.pressureGrid[gridX][gridY].gasType) {
                    this.pressureGrid[gridX][gridY].gasType = particle.type;
                }
            }
        });
        
        // Pressure bursts
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const cell = this.pressureGrid[x][y];
                
                if (cell.pressure > 50 && !cell.blocked) {
                    // Create burst effect
                    cell.particles.forEach(particle => {
                        particle.vx += (Math.random() - 0.5) * 10;
                        particle.vy += (Math.random() - 0.5) * 10;
                    });
                }
            }
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw pressure grid background
        if (this.showPressureGrid) {
            this.drawPressureBackground();
        }
        
        // Draw particle trails
        if (this.showTrails) {
            this.drawParticleTrails();
        }
        
        // Draw tools
        this.drawTools();
        
        // Draw particles
        this.drawParticles();
        
        // Draw velocity vectors
        if (this.showVectors) {
            this.drawVelocityVectors();
        }
        
        // Update statistics
        this.updateStatistics();
    }
    
    drawPressureBackground() {
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const cell = this.pressureGrid[x][y];
                
                if (cell.pressure > 0) {
                    const intensity = Math.min(cell.pressure / 15, 1);
                    const gasType = cell.gasType || 'air';
                    const gasColor = this.gasTypes[gasType].color;
                    
                    // Enhanced pressure visualization with glow effect
                    const cellX = x * this.gridSize;
                    const cellY = y * this.gridSize;
                    
                    // Create radial gradient for pressure visualization
                    const gradient = this.ctx.createRadialGradient(
                        cellX + this.gridSize/2, cellY + this.gridSize/2, 0,
                        cellX + this.gridSize/2, cellY + this.gridSize/2, this.gridSize
                    );
                    
                    gradient.addColorStop(0, `rgba(${gasColor[0]}, ${gasColor[1]}, ${gasColor[2]}, ${intensity * 0.6})`);
                    gradient.addColorStop(1, `rgba(${gasColor[0]}, ${gasColor[1]}, ${gasColor[2]}, ${intensity * 0.1})`);
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(cellX, cellY, this.gridSize, this.gridSize);
                    
                    // Add high-pressure warning effect
                    if (intensity > 0.8) {
                        this.ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.3})`;
                        this.ctx.lineWidth = 1;
                        this.ctx.strokeRect(cellX, cellY, this.gridSize, this.gridSize);
                    }
                }
            }
        }
    }
    
    drawTools() {
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const cell = this.pressureGrid[x][y];
                const cellX = x * this.gridSize;
                const cellY = y * this.gridSize;
                
                if (cell.blocked) {
                    if (cell.leaky) {
                        // Leaky wall with enhanced visibility
                        const gradient = this.ctx.createLinearGradient(cellX, cellY, cellX + this.gridSize, cellY + this.gridSize);
                        gradient.addColorStop(0, '#d97706');
                        gradient.addColorStop(0.5, '#ca8a04');
                        gradient.addColorStop(1, '#a16207');
                        this.ctx.fillStyle = gradient;
                        this.ctx.fillRect(cellX, cellY, this.gridSize, this.gridSize);
                        
                        // Add bright border for visibility
                        this.ctx.strokeStyle = '#f59e0b';
                        this.ctx.lineWidth = 1.5;
                        this.ctx.strokeRect(cellX + 0.5, cellY + 0.5, this.gridSize - 1, this.gridSize - 1);
                        
                        // Add inner shadow
                        this.ctx.strokeStyle = '#451a03';
                        this.ctx.lineWidth = 1;
                        this.ctx.strokeRect(cellX + 1, cellY + 1, this.gridSize - 2, this.gridSize - 2);
                        
                        // Add bright holes
                        this.ctx.fillStyle = '#0f172a';
                        for (let i = 0; i < 3; i++) {
                            const holeX = cellX + 2 + (i * (this.gridSize - 4) / 3);
                            const holeY = cellY + 2 + Math.random() * (this.gridSize - 4);
                            this.ctx.beginPath();
                            this.ctx.arc(holeX + 1, holeY + 1, 2, 0, Math.PI * 2);
                            this.ctx.fill();
                            
                            // Add hole outline
                            this.ctx.strokeStyle = '#fbbf24';
                            this.ctx.lineWidth = 0.5;
                            this.ctx.stroke();
                        }
                    } else {
                        // Solid wall with enhanced visibility
                        const gradient = this.ctx.createLinearGradient(cellX, cellY, cellX + this.gridSize, cellY + this.gridSize);
                        gradient.addColorStop(0, '#64748b');
                        gradient.addColorStop(0.5, '#475569');
                        gradient.addColorStop(1, '#334155');
                        this.ctx.fillStyle = gradient;
                        this.ctx.fillRect(cellX, cellY, this.gridSize, this.gridSize);
                        
                        // Add bright border for visibility
                        this.ctx.strokeStyle = '#94a3b8';
                        this.ctx.lineWidth = 1.5;
                        this.ctx.strokeRect(cellX + 0.5, cellY + 0.5, this.gridSize - 1, this.gridSize - 1);
                        
                        // Add inner shadow effect
                        this.ctx.strokeStyle = '#1e293b';
                        this.ctx.lineWidth = 1;
                        this.ctx.strokeRect(cellX + 1, cellY + 1, this.gridSize - 2, this.gridSize - 2);
                    }
                }
                
                if (cell.valve) {
                    // Valve with improved graphics
                    const gradient = this.ctx.createRadialGradient(
                        cellX + this.gridSize/2, cellY + this.gridSize/2, 0,
                        cellX + this.gridSize/2, cellY + this.gridSize/2, this.gridSize/2
                    );
                    
                    if (cell.valveOpen) {
                        gradient.addColorStop(0, '#10b981');
                        gradient.addColorStop(1, '#047857');
                    } else {
                        gradient.addColorStop(0, '#ef4444');
                        gradient.addColorStop(1, '#b91c1c');
                    }
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(cellX + 1, cellY + 1, this.gridSize - 2, this.gridSize - 2);
                    
                    // Valve border
                    this.ctx.strokeStyle = cell.valveOpen ? '#064e3b' : '#7f1d1d';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(cellX + 1, cellY + 1, this.gridSize - 2, this.gridSize - 2);
                    
                    // Valve symbol with glow
                    this.ctx.shadowColor = 'white';
                    this.ctx.shadowBlur = 3;
                    this.ctx.strokeStyle = 'white';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    
                    if (cell.valveOpen) {
                        // Horizontal line for open
                        this.ctx.moveTo(cellX + 3, cellY + this.gridSize / 2);
                        this.ctx.lineTo(cellX + this.gridSize - 3, cellY + this.gridSize / 2);
                    } else {
                        // Vertical line for closed
                        this.ctx.moveTo(cellX + this.gridSize / 2, cellY + 3);
                        this.ctx.lineTo(cellX + this.gridSize / 2, cellY + this.gridSize - 3);
                    }
                    this.ctx.stroke();
                    this.ctx.shadowBlur = 0;
                }
                
                if (cell.compressor) {
                    // Compressor with animated effect
                    const time = Date.now() * 0.003;
                    const intensity = 0.8 + Math.sin(time) * 0.2;
                    
                    const gradient = this.ctx.createRadialGradient(
                        cellX + this.gridSize/2, cellY + this.gridSize/2, 0,
                        cellX + this.gridSize/2, cellY + this.gridSize/2, this.gridSize/2
                    );
                    gradient.addColorStop(0, `rgba(251, 191, 36, ${intensity})`);
                    gradient.addColorStop(0.7, '#f59e0b');
                    gradient.addColorStop(1, '#d97706');
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(cellX, cellY, this.gridSize, this.gridSize);
                    
                    // Compressor border
                    this.ctx.strokeStyle = '#92400e';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(cellX, cellY, this.gridSize, this.gridSize);
                    
                    // Animated inward arrows with glow
                    this.ctx.shadowColor = '#fbbf24';
                    this.ctx.shadowBlur = 2;
                    this.ctx.strokeStyle = '#1f2937';
                    this.ctx.lineWidth = 2;
                    
                    const centerX = cellX + this.gridSize/2;
                    const centerY = cellY + this.gridSize/2;
                    const arrowSize = this.gridSize/4 * intensity;
                    
                    this.drawArrow(centerX, centerY, 0, -arrowSize);
                    this.drawArrow(centerX, centerY, arrowSize, 0);
                    this.drawArrow(centerX, centerY, 0, arrowSize);
                    this.drawArrow(centerX, centerY, -arrowSize, 0);
                    
                    this.ctx.shadowBlur = 0;
                }
            }
        }
    }
    
    drawArrow(x, y, dx, dy) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + dx, y + dy);
        this.ctx.moveTo(x + dx, y + dy);
        this.ctx.lineTo(x + dx - dx/3, y + dy - dy/3);
        this.ctx.moveTo(x + dx, y + dy);
        this.ctx.lineTo(x + dx - dy/3, y + dy + dx/3);
        this.ctx.stroke();
    }
    
    drawParticleTrails() {
        this.particleTrails.forEach(trail => {
            const gas = this.gasTypes[trail.type];
            const alpha = trail.life / 30;
            
            this.ctx.fillStyle = `rgba(${gas.color[0]}, ${gas.color[1]}, ${gas.color[2]}, ${alpha * 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(trail.x, trail.y, 1, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            const gas = this.gasTypes[particle.type];
            const alpha = Math.min(particle.life / 100, 1);
            const size = 1.5 + (particle.density * 0.5);
            
            this.ctx.fillStyle = `rgba(${gas.color[0]}, ${gas.color[1]}, ${gas.color[2]}, ${alpha * 0.9})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add glow effect for high-pressure particles
            if (particle.density > 1.5) {
                this.ctx.fillStyle = `rgba(${gas.color[0]}, ${gas.color[1]}, ${gas.color[2]}, ${alpha * 0.3})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, size + 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    drawVelocityVectors() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.lineWidth = 1;
        
        this.particles.forEach(particle => {
            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            if (speed > 0.5) {
                const scale = Math.min(speed * 5, 20);
                
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(
                    particle.x + particle.vx * scale,
                    particle.y + particle.vy * scale
                );
                this.ctx.stroke();
                
                // Arrow head
                const angle = Math.atan2(particle.vy, particle.vx);
                const headSize = 3;
                
                this.ctx.beginPath();
                this.ctx.moveTo(
                    particle.x + particle.vx * scale,
                    particle.y + particle.vy * scale
                );
                this.ctx.lineTo(
                    particle.x + particle.vx * scale - headSize * Math.cos(angle - Math.PI / 6),
                    particle.y + particle.vy * scale - headSize * Math.sin(angle - Math.PI / 6)
                );
                this.ctx.moveTo(
                    particle.x + particle.vx * scale,
                    particle.y + particle.vy * scale
                );
                this.ctx.lineTo(
                    particle.x + particle.vx * scale - headSize * Math.cos(angle + Math.PI / 6),
                    particle.y + particle.vy * scale - headSize * Math.sin(angle + Math.PI / 6)
                );
                this.ctx.stroke();
            }
        });
    }
    
    updateStatistics() {
        let totalPressure = 0;
        let maxPressure = 0;
        
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const pressure = this.pressureGrid[x][y].pressure;
                totalPressure += pressure;
                maxPressure = Math.max(maxPressure, pressure);
            }
        }
        
        document.getElementById('totalPressure').textContent = totalPressure.toFixed(1);
        document.getElementById('maxPressure').textContent = maxPressure.toFixed(1);
        document.getElementById('particleCount').textContent = this.particles.length;
    }
    
    clearSimulation() {
        this.particles = [];
        this.initPressureGrid();
    }
    
    animate(currentTime = 0) {
        // Calculate FPS
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            document.getElementById('fpsCounter').textContent = this.fps;
        }
        this.frameCount++;
        
        if (!this.isPaused) {
            this.updateParticles();
            this.updatePressureGrid();
        }
        
        this.render();
        requestAnimationFrame((time) => this.animate(time));
    }
}

// Initialize simulation when page loads
document.addEventListener('DOMContentLoaded', () => {
    new GasSimulation();
}); 