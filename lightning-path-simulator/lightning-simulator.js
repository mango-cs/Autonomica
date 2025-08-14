// Lightning Path Simulator - Advanced 2D Grid-based Electrical Simulation
class LightningSimulator {
    constructor() {
        this.canvas = document.getElementById('simulationCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.cellSize = 4;
        this.gridWidth = Math.floor(this.width / this.cellSize);
        this.gridHeight = Math.floor(this.height / this.cellSize);
        
        // Material properties with realistic electrical characteristics
        this.materials = {
            air: { 
                conductivity: 0.001, 
                resistance: 1000, 
                color: '#001133',
                name: 'Air'
            },
            conductor: { 
                conductivity: 0.95, 
                resistance: 0.1, 
                color: '#FFD700',
                name: 'Wire/Conductor'
            },
            insulator: { 
                conductivity: 0.0, 
                resistance: 10000, 
                color: '#8B4513',
                name: 'Insulator'
            },
            ground: { 
                conductivity: 1.0, 
                resistance: 0, 
                color: '#5D4037',
                name: 'Ground'
            },
            cloud: { 
                conductivity: 0.8, 
                resistance: 0.5, 
                color: '#4169E1',
                name: 'Cloud'
            },
            semicond: { 
                conductivity: 0.3, 
                resistance: 10, 
                color: '#FF6B35',
                name: 'Semi-Conductor'
            }
        };
        
        // Simulation state
        this.grid = [];
        this.activeArcs = [];
        this.stats = {
            totalStrikes: 0,
            lastStrikeLength: 0,
            lastBranches: 0
        };
        
        // Control parameters
        this.params = {
            dischargeStrength: 10,
            conductivityThreshold: 0.5,
            arcRandomness: 30,
            burnTrailDuration: 50
        };
        
        this.selectedMaterial = 'air';
        this.isDrawing = false;
        this.animationId = null;
        this.isPaused = false;
        this.autoStrikeMode = false;
        this.autoStrikeInterval = null;
        
        this.initializeGrid();
        this.setupEventListeners();
        this.setupControls();
        this.startAnimation();
    }
    
    initializeGrid() {
        this.grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            const row = [];
            for (let x = 0; x < this.gridWidth; x++) {
                row.push({
                    material: 'air',
                    charge: 0,
                    burnTime: 0,
                    lastArcTime: 0
                });
            }
            this.grid.push(row);
        }
        
        // Add default clouds and ground
        this.addDefaultClouds();
        this.addDefaultGround();
    }
    
    addDefaultClouds() {
        const cloudRows = 3;
        const cloudSpacing = Math.floor(this.gridWidth / 4);
        
        for (let i = 1; i < 4; i++) {
            const centerX = i * cloudSpacing;
            for (let y = 0; y < cloudRows; y++) {
                for (let x = centerX - 8; x < centerX + 8; x++) {
                    if (x >= 0 && x < this.gridWidth && y < this.gridHeight) {
                        this.grid[y][x].material = 'cloud';
                        this.grid[y][x].charge = 100;
                    }
                }
            }
        }
    }
    
    addDefaultGround() {
        const groundRows = 2;
        for (let y = this.gridHeight - groundRows; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (y >= 0) {
                    this.grid[y][x].material = 'ground';
                }
            }
        }
    }
    
    setupEventListeners() {
        // Mouse events for drawing
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            this.drawMaterial(e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing) {
                this.drawMaterial(e);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDrawing = false;
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.triggerLightning();
                    break;
                case 'KeyR':
                    e.preventDefault();
                    this.resetSimulation();
                    break;
                case 'KeyC':
                    e.preventDefault();
                    this.clearGrid();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    this.multiStrike();
                    break;
            }
        });
    }
    
    setupControls() {
        // Slider controls
        const controls = {
            dischargeStrength: { param: 'dischargeStrength', display: 'dischargeValue' },
            conductivityThreshold: { param: 'conductivityThreshold', display: 'conductivityValue' },
            arcRandomness: { param: 'arcRandomness', display: 'randomnessValue', suffix: '%' },
            burnTrails: { param: 'burnTrailDuration', display: 'burnValue', suffix: ' frames' }
        };
        
        Object.entries(controls).forEach(([id, config]) => {
            const slider = document.getElementById(id);
            const display = document.getElementById(config.display);
            
            if (slider && display) {
                slider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    this.params[config.param] = value;
                    display.textContent = value + (config.suffix || '');
                });
            }
        });
        
        // Material selection
        document.querySelectorAll('.material-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedMaterial = btn.dataset.material;
            });
        });
    }
    
    drawMaterial(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const canvasX = (e.clientX - rect.left) * scaleX;
        const canvasY = (e.clientY - rect.top) * scaleY;
        
        const centerX = Math.floor(canvasX / this.cellSize);
        const centerY = Math.floor(canvasY / this.cellSize);
        
        // Material thickness based on type
        const materialThickness = {
            air: 1,
            conductor: 2,
            insulator: 3,
            ground: 4,
            cloud: 5,
            semicond: 2
        };
        
        const thickness = materialThickness[this.selectedMaterial] || 1;
        const radius = Math.floor(thickness / 2);
        
        // Draw with appropriate thickness
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const x = centerX + dx;
                const y = centerY + dy;
                
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    // Use circle shape for natural drawing
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= radius) {
                        const cell = this.grid[y][x];
                        cell.material = this.selectedMaterial;
                        cell.charge = this.selectedMaterial === 'cloud' ? 100 : 0;
                    }
                }
            }
        }
    }
    
    findCloudCells() {
        const clouds = [];
        const cloudGroups = [];
        
        // Find all cloud cells
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x].material === 'cloud' && this.grid[y][x].charge > 50) {
                    clouds.push({ x, y });
                }
            }
        }
        
        // Group clouds by proximity to ensure we get representatives from each cloud area
        if (clouds.length > 0) {
            const groups = [];
            const used = new Set();
            
            clouds.forEach(cloud => {
                const key = `${cloud.x},${cloud.y}`;
                if (used.has(key)) return;
                
                // Find all clouds in this group (within reasonable distance)
                const group = [];
                const toCheck = [cloud];
                
                while (toCheck.length > 0) {
                    const current = toCheck.pop();
                    const currentKey = `${current.x},${current.y}`;
                    
                    if (used.has(currentKey)) continue;
                    used.add(currentKey);
                    group.push(current);
                    
                    // Find nearby clouds (within 15 cells)
                    clouds.forEach(nearbyCloud => {
                        const nearbyKey = `${nearbyCloud.x},${nearbyCloud.y}`;
                        if (!used.has(nearbyKey)) {
                            const distance = Math.abs(current.x - nearbyCloud.x) + Math.abs(current.y - nearbyCloud.y);
                            if (distance < 15) {
                                toCheck.push(nearbyCloud);
                            }
                        }
                    });
                }
                
                if (group.length > 0) {
                    groups.push(group);
                }
            });
            
            // Return one representative from each group (preferably from the bottom of each cloud)
            return groups.map(group => {
                // Find the bottommost cloud in this group
                let bottomCloud = group[0];
                group.forEach(cloud => {
                    if (cloud.y > bottomCloud.y) {
                        bottomCloud = cloud;
                    }
                });
                return bottomCloud;
            });
        }
        
        return clouds;
    }
    
    findLightningPath(start) {
        const visited = new Set();
        const path = [];
        const queue = [{ x: start.x, y: start.y, path: [start] }];
        
        while (queue.length > 0) {
            const current = queue.shift();
            const key = `${current.x},${current.y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            const cell = this.grid[current.y][current.x];
            
            // Found ground - return path
            if (cell.material === 'ground') {
                return current.path;
            }
            
            // Get neighbors with weighted selection
            const neighbors = this.getWeightedNeighbors(current.x, current.y);
            
            neighbors.forEach(neighbor => {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(neighborKey)) {
                    const newPath = [...current.path, neighbor];
                    queue.push({ x: neighbor.x, y: neighbor.y, path: newPath });
                }
            });
            
            // Sort queue by resistance for pathfinding
            queue.sort((a, b) => {
                const cellA = this.grid[a.y][a.x];
                const cellB = this.grid[b.y][b.x];
                const resistanceA = this.materials[cellA.material].resistance;
                const resistanceB = this.materials[cellB.material].resistance;
                return resistanceA - resistanceB;
            });
        }
        
        return null;
    }
    
    getWeightedNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        directions.forEach(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < this.gridWidth && ny >= 0 && ny < this.gridHeight) {
                const cell = this.grid[ny][nx];
                const material = this.materials[cell.material];
                
                // Skip insulators unless breakdown voltage exceeded
                if (material.conductivity === 0 && this.params.dischargeStrength < 15) {
                    return;
                }
                
                // Weight based on conductivity and randomness
                const weight = material.conductivity + (Math.random() * this.params.arcRandomness / 100);
                
                // Favor downward movement (gravity)
                const gravityBonus = dy > 0 ? 0.2 : 0;
                
                neighbors.push({ 
                    x: nx, 
                    y: ny, 
                    weight: weight + gravityBonus 
                });
            }
        });
        
        // Sort by weight (higher = better conductivity)
        return neighbors.sort((a, b) => b.weight - a.weight);
    }
    
    triggerLightning() {
        if (this.isPaused) return;
        
        const cloudGroups = this.findCloudCells();
        if (cloudGroups.length === 0) return;
        
        // Ensure we try to strike from each cloud group based on discharge strength
        const strikeProbability = Math.min(1, this.params.dischargeStrength / 15);
        const selectedStarts = [];
        
        cloudGroups.forEach(cloudStart => {
            // Each cloud group has a chance to strike based on discharge strength
            if (Math.random() < strikeProbability || selectedStarts.length === 0) {
                selectedStarts.push(cloudStart);
            }
        });
        
        // Add some randomization for multiple strikes from same cloud
        if (this.params.dischargeStrength > 12 && selectedStarts.length > 0) {
            const extraStrikes = Math.floor((this.params.dischargeStrength - 12) / 4);
            for (let i = 0; i < extraStrikes; i++) {
                const randomCloud = cloudGroups[Math.floor(Math.random() * cloudGroups.length)];
                selectedStarts.push(randomCloud);
            }
        }
        
        const paths = [];
        selectedStarts.forEach((start, index) => {
            // Add slight delay for multiple strikes for more realism
            setTimeout(() => {
                const path = this.findLightningPath(start);
                if (path && path.length > 0) {
                    paths.push(path);
                    this.createLightningArc(path);
                    this.createBurnTrail(path);
                    
                    // Update stats for each strike
                    if (index === 0) {
                        this.stats.totalStrikes++;
                        this.stats.lastStrikeLength = path.length;
                        this.stats.lastBranches = 1;
                        this.updateStats();
                    }
                }
            }, index * 50); // Stagger strikes by 50ms
        });
        
        // Create branching effects after all strikes
        setTimeout(() => {
            if (paths.length > 0) {
                this.createBranchingEffects(paths);
            }
        }, selectedStarts.length * 50 + 100);
    }
    
    createLightningArc(path) {
        const arc = {
            path: [...path],
            intensity: this.params.dischargeStrength,
            lifetime: 15 + Math.random() * 10,
            age: 0,
            branches: []
        };
        
        // Create random branches
        if (path.length > 10 && Math.random() < 0.7) {
            const branchPoint = Math.floor(path.length * (0.3 + Math.random() * 0.4));
            const branchPath = this.createBranch(path[branchPoint], path);
            if (branchPath.length > 5) {
                arc.branches.push(branchPath);
            }
        }
        
        this.activeArcs.push(arc);
    }
    
    createBranch(startPoint, mainPath) {
        const branch = [];
        let current = { ...startPoint };
        const maxLength = 15 + Math.random() * 25;
        
        for (let i = 0; i < maxLength; i++) {
            const neighbors = this.getWeightedNeighbors(current.x, current.y);
            const validNeighbors = neighbors.filter(n => {
                const cell = this.grid[n.y][n.x];
                return cell.material !== 'insulator' && 
                       !mainPath.some(p => p.x === n.x && p.y === n.y);
            });
            
            if (validNeighbors.length === 0) break;
            
            const next = validNeighbors[Math.floor(Math.random() * Math.min(3, validNeighbors.length))];
            branch.push(next);
            current = next;
            
            const cell = this.grid[current.y][current.x];
            if (cell.material === 'ground' || cell.material === 'conductor') {
                break;
            }
        }
        
        return branch;
    }
    
    createBurnTrail(path) {
        path.forEach(point => {
            const cell = this.grid[point.y][point.x];
            cell.burnTime = this.params.burnTrailDuration;
            cell.lastArcTime = Date.now();
        });
    }
    
    createBranchingEffects(paths) {
        setTimeout(() => {
            paths.forEach(path => {
                if (Math.random() < 0.3) {
                    const randomPoint = path[Math.floor(Math.random() * path.length)];
                    this.createSecondaryArc(randomPoint);
                }
            });
        }, 100 + Math.random() * 200);
    }
    
    createSecondaryArc(startPoint) {
        const neighbors = this.getWeightedNeighbors(startPoint.x, startPoint.y);
        const conductiveNeighbors = neighbors.filter(n => {
            const cell = this.grid[n.y][n.x];
            return this.materials[cell.material].conductivity > 0.5;
        });
        
        if (conductiveNeighbors.length > 0) {
            const target = conductiveNeighbors[0];
            const arc = {
                path: [startPoint, target],
                intensity: this.params.dischargeStrength * 0.3,
                lifetime: 8,
                age: 0,
                branches: []
            };
            this.activeArcs.push(arc);
        }
    }
    
    multiStrike() {
        if (this.isPaused) return;
        
        const strikes = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < strikes; i++) {
            setTimeout(() => {
                if (!this.isPaused) {
                    this.triggerLightning();
                }
            }, i * (100 + Math.random() * 200));
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? '▶️ Resume' : '⏸️ Pause';
            pauseBtn.className = this.isPaused ? 'button primary' : 'button warning';
        }
        
        if (this.isPaused && this.autoStrikeMode) {
            this.toggleAutoStrike();
        }
    }
    
    toggleAutoStrike() {
        this.autoStrikeMode = !this.autoStrikeMode;
        const autoBtn = document.getElementById('autoBtn');
        
        if (this.autoStrikeMode && !this.isPaused) {
            this.autoStrikeInterval = setInterval(() => {
                if (!this.isPaused) {
                    this.triggerLightning();
                }
            }, 800 + Math.random() * 1200);
            
            if (autoBtn) {
                autoBtn.textContent = '🔄 Stop Auto';
                autoBtn.className = 'button warning';
            }
        } else {
            if (this.autoStrikeInterval) {
                clearInterval(this.autoStrikeInterval);
                this.autoStrikeInterval = null;
            }
            
            if (autoBtn) {
                autoBtn.textContent = '🤖 Auto Strike';
                autoBtn.className = 'button';
            }
        }
    }
    
    updateStats() {
        const elements = {
            'lastStrike': `Last Strike: ${new Date().toLocaleTimeString()}`,
            'pathLength': `Path Length: ${this.stats.lastStrikeLength}`,
            'branches': `Branches: ${this.stats.lastBranches}`,
            'strikeCount': `Total Strikes: ${this.stats.totalStrikes}`
        };
        
        Object.entries(elements).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = text;
        });
    }
    
    startAnimation() {
        const animate = () => {
            this.update();
            this.render();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }
    
    update() {
        // Update active arcs
        this.activeArcs = this.activeArcs.filter(arc => {
            arc.age++;
            return arc.age < arc.lifetime;
        });
        
        // Update burn trails
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const cell = this.grid[y][x];
                if (cell.burnTime > 0) {
                    cell.burnTime--;
                }
            }
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Render grid materials with enhanced effects
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const cell = this.grid[y][x];
                const material = this.materials[cell.material];
                
                // Enhanced material rendering
                if (cell.material === 'cloud') {
                    // Animated cloud effect
                    const time = Date.now() * 0.001;
                    const cloudAlpha = 0.8 + 0.2 * Math.sin(time + x * 0.1 + y * 0.1);
                    const centerX = x * this.cellSize + this.cellSize / 2;
                    const centerY = y * this.cellSize + this.cellSize / 2;
                    
                    const gradient = this.ctx.createRadialGradient(
                        centerX, centerY, 0,
                        centerX, centerY, this.cellSize * 1.5
                    );
                    gradient.addColorStop(0, `rgba(65, 105, 225, ${cloudAlpha})`);
                    gradient.addColorStop(0.7, `rgba(30, 60, 180, ${cloudAlpha * 0.8})`);
                    gradient.addColorStop(1, `rgba(10, 30, 120, ${cloudAlpha * 0.4})`);
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                    
                    // Add charge indicator for high-charge clouds
                    if (cell.charge > 80 && Math.random() < 0.1) {
                        this.ctx.fillStyle = `rgba(255, 255, 0, 0.6)`;
                        const sparkSize = 1;
                        this.ctx.fillRect(
                            centerX - sparkSize/2, 
                            centerY - sparkSize/2, 
                            sparkSize, 
                            sparkSize
                        );
                    }
                } else if (cell.material === 'conductor') {
                    // Metallic conductor effect
                    const centerX = x * this.cellSize + this.cellSize / 2;
                    const centerY = y * this.cellSize + this.cellSize / 2;
                    
                    const gradient = this.ctx.createLinearGradient(
                        x * this.cellSize, y * this.cellSize,
                        (x + 1) * this.cellSize, (y + 1) * this.cellSize
                    );
                    gradient.addColorStop(0, '#FFD700');
                    gradient.addColorStop(0.5, '#FFA500');
                    gradient.addColorStop(1, '#FF8C00');
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                } else {
                    // Base material color
                    this.ctx.fillStyle = material.color;
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                }
                
                // Enhanced burn trail effect
                if (cell.burnTime > 0) {
                    const intensity = cell.burnTime / this.params.burnTrailDuration;
                    const centerX = x * this.cellSize + this.cellSize / 2;
                    const centerY = y * this.cellSize + this.cellSize / 2;
                    
                    // Create gradient burn effect
                    const gradient = this.ctx.createRadialGradient(
                        centerX, centerY, 0,
                        centerX, centerY, this.cellSize
                    );
                    
                    gradient.addColorStop(0, `rgba(255, 255, 100, ${intensity * 0.9})`);
                    gradient.addColorStop(0.3, `rgba(255, 150, 0, ${intensity * 0.7})`);
                    gradient.addColorStop(0.7, `rgba(255, 50, 0, ${intensity * 0.5})`);
                    gradient.addColorStop(1, `rgba(100, 0, 0, ${intensity * 0.2})`);
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                    
                    // Add sparkle effect for fresh burns
                    if (intensity > 0.7 && Math.random() < 0.3) {
                        this.ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
                        const sparkleSize = Math.random() * 2;
                        this.ctx.fillRect(
                            centerX - sparkleSize/2, 
                            centerY - sparkleSize/2, 
                            sparkleSize, 
                            sparkleSize
                        );
                    }
                }
            }
        }
        
        // Render active lightning arcs
        this.activeArcs.forEach(arc => {
            this.renderLightningArc(arc);
        });
    }
    
    renderLightningArc(arc) {
        const intensity = 1 - (arc.age / arc.lifetime);
        const alpha = intensity * 0.95;
        
        if (arc.path.length === 0) return;
        
        // Enhanced multi-layer lightning rendering
        const layers = [
            { color: 'rgba(255, 255, 255, ' + alpha + ')', width: 1 + intensity * 4, blur: 15 },
            { color: 'rgba(0, 255, 255, ' + (alpha * 0.8) + ')', width: 2 + intensity * 6, blur: 25 },
            { color: 'rgba(100, 200, 255, ' + (alpha * 0.4) + ')', width: 4 + intensity * 8, blur: 35 }
        ];
        
        layers.forEach((layer, layerIndex) => {
            this.ctx.strokeStyle = layer.color;
            this.ctx.lineWidth = layer.width;
            this.ctx.lineCap = 'round';
            this.ctx.shadowColor = '#00FFFF';
            this.ctx.shadowBlur = layer.blur * intensity;
            
            this.ctx.beginPath();
            this.ctx.moveTo(
                arc.path[0].x * this.cellSize + this.cellSize / 2,
                arc.path[0].y * this.cellSize + this.cellSize / 2
            );
            
            for (let i = 1; i < arc.path.length; i++) {
                const point = arc.path[i];
                const jitterScale = (3 - layerIndex) * intensity;
                const jitterX = (Math.random() - 0.5) * jitterScale;
                const jitterY = (Math.random() - 0.5) * jitterScale;
                
                this.ctx.lineTo(
                    point.x * this.cellSize + this.cellSize / 2 + jitterX,
                    point.y * this.cellSize + this.cellSize / 2 + jitterY
                );
            }
            this.ctx.stroke();
        });
        
        // Enhanced branch rendering
        arc.branches.forEach(branch => {
            if (branch.length === 0) return;
            
            const branchLayers = [
                { color: 'rgba(200, 230, 255, ' + (alpha * 0.7) + ')', width: 1 + intensity * 2, blur: 10 },
                { color: 'rgba(150, 200, 255, ' + (alpha * 0.4) + ')', width: 2 + intensity * 3, blur: 20 }
            ];
            
            branchLayers.forEach(layer => {
                this.ctx.strokeStyle = layer.color;
                this.ctx.lineWidth = layer.width;
                this.ctx.shadowBlur = layer.blur * intensity;
                
                this.ctx.beginPath();
                this.ctx.moveTo(
                    branch[0].x * this.cellSize + this.cellSize / 2,
                    branch[0].y * this.cellSize + this.cellSize / 2
                );
                
                for (let i = 1; i < branch.length; i++) {
                    const point = branch[i];
                    const jitterX = (Math.random() - 0.5) * intensity;
                    const jitterY = (Math.random() - 0.5) * intensity;
                    
                    this.ctx.lineTo(
                        point.x * this.cellSize + this.cellSize / 2 + jitterX,
                        point.y * this.cellSize + this.cellSize / 2 + jitterY
                    );
                }
                this.ctx.stroke();
            });
        });
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    clearGrid() {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const cell = this.grid[y][x];
                if (cell.material !== 'cloud' && cell.material !== 'ground') {
                    cell.material = 'air';
                    cell.charge = 0;
                    cell.burnTime = 0;
                }
            }
        }
        this.activeArcs = [];
    }
    
    resetSimulation() {
        this.initializeGrid();
        this.activeArcs = [];
        this.stats = {
            totalStrikes: 0,
            lastStrikeLength: 0,
            lastBranches: 0
        };
        this.updateStats();
    }
    
    setupDemo() {
        this.clearGrid();
        
        const midX = Math.floor(this.gridWidth / 2);
        const midY = Math.floor(this.gridHeight / 2);
        
        // Create lightning rod system
        const rodPositions = [midX - 40, midX, midX + 40];
        
        rodPositions.forEach(rodX => {
            if (rodX >= 0 && rodX < this.gridWidth) {
                // Vertical lightning rod
                for (let y = midY - 10; y < this.gridHeight - 10; y++) {
                    if (y >= 0 && y < this.gridHeight) {
                        this.grid[y][rodX].material = 'conductor';
                    }
                }
                
                // Rod tip enhancement
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const x = rodX + dx;
                        const y = midY - 10 + dy;
                        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                            this.grid[y][x].material = 'conductor';
                        }
                    }
                }
            }
        });
        
        // Create insulator barriers to force interesting paths
        const barriers = [
            { x: midX - 20, y: midY + 15, width: 15, height: 3 },
            { x: midX + 5, y: midY + 25, width: 15, height: 3 },
            { x: midX - 30, y: midY + 35, width: 20, height: 2 }
        ];
        
        barriers.forEach(barrier => {
            for (let x = barrier.x; x < barrier.x + barrier.width; x++) {
                for (let y = barrier.y; y < barrier.y + barrier.height; y++) {
                    if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                        this.grid[y][x].material = 'insulator';
                    }
                }
            }
        });
        
        // Add network of semi-conductors for branching
        for (let i = 0; i < 50; i++) {
            const x = Math.floor(Math.random() * this.gridWidth);
            const y = Math.floor(midY + 20 + Math.random() * (this.gridHeight - midY - 30));
            if (y < this.gridHeight - 5 && this.grid[y][x].material === 'air') {
                this.grid[y][x].material = 'semicond';
            }
        }
        
        // Create underground conductor network
        const groundY = this.gridHeight - 8;
        for (let x = 10; x < this.gridWidth - 10; x++) {
            if (Math.random() < 0.7) {
                this.grid[groundY][x].material = 'conductor';
            }
        }
    }
}

// Global functions for UI interaction
let simulator;

function triggerLightning() {
    if (simulator) simulator.triggerLightning();
}

function multiStrike() {
    if (simulator) simulator.multiStrike();
}

function clearGrid() {
    if (simulator) simulator.clearGrid();
}

function setupDemo() {
    if (simulator) simulator.setupDemo();
}

function resetSimulation() {
    if (simulator) simulator.resetSimulation();
}

function togglePause() {
    if (simulator) simulator.togglePause();
}

function toggleAutoStrike() {
    if (simulator) simulator.toggleAutoStrike();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    simulator = new LightningSimulator();
}); 