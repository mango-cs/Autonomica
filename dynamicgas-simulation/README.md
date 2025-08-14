# Dynamic Gas Simulation

A comprehensive web-based gas simulation featuring pressure dynamics, particle physics, and interactive elements. Experience realistic gas behavior with expansion, compression, leakage, and various environmental tools.

## Features

### Gas Physics
- **Pressure-based expansion**: Gases naturally expand from high to low pressure areas
- **Dynamic particle movement**: Realistic particle behavior with velocity, acceleration, and momentum
- **Gas density visualization**: Color gradients show gas concentration and pressure levels
- **Pressure burst effects**: High-pressure areas create explosive expansion when thresholds are exceeded

### Gas Types
Each gas type has unique properties affecting behavior:

1. **Air** (Blue) - Standard gas with balanced properties
2. **Smoke** (Gray) - Lighter than air, expands quickly, dissipates over time
3. **Steam** (Light Blue) - Very light, rapid expansion, short lifespan
4. **CO₂** (Red) - Heavier than air, slower expansion, more viscous

### Interactive Tools

#### Environmental Elements
- **Solid Walls** - Impermeable barriers that block gas flow
- **Leaky Walls** - Porous barriers that allow slow gas seepage
- **Valves** - Controllable barriers that can be opened/closed by clicking
- **Compressors** - Devices that pull gas particles toward the center, increasing pressure

#### Dynamic Controls
- **Pressure Sensitivity** (0.1-2.0) - Controls how strongly gases respond to pressure differences
- **Expansion Speed** (0.1-3.0) - Affects how quickly gases spread and move
- **Gas Injection Amount** (1-50) - Number of particles created per mouse click

## How to Use

### Getting Started
1. Open `index.html` in a web browser
2. The simulation starts automatically with an empty canvas
3. Click anywhere on the canvas to inject gas particles

### Basic Operations
1. **Inject Gas**: Click or drag on the canvas to add gas particles
2. **Change Gas Type**: Select different gas types using the colored buttons
3. **Place Tools**: Select a tool button, then click/drag on canvas to place
4. **Control Valves**: Click on red/green valve squares to open/close them
5. **Adjust Settings**: Use sliders to modify pressure sensitivity and expansion speed
6. **Clear Simulation**: Click "Clear All" to reset everything

### Advanced Techniques

#### Creating Pressure Chambers
1. Use solid walls to create enclosed spaces
2. Inject gas into the chamber
3. Watch pressure build up (shown in background color intensity)
4. Add a valve to control release

#### Leakage Systems
1. Build containers with leaky walls
2. Observe gradual gas seepage through porous barriers
3. Create pressure differentials for directional flow

#### Compression Experiments
1. Place compressors in strategic locations
2. Watch gas particles get pulled toward compressor centers
3. Observe pressure increases in compression zones

## Technical Details

### Simulation Engine
- **Grid-based pressure calculation**: 10x10 pixel grid cells track local pressure
- **Particle-based physics**: Individual particles with position, velocity, and properties
- **Real-time pressure visualization**: Color gradients represent gas density
- **Collision detection**: Particles interact with walls and boundaries

### Performance
- Optimized for smooth 60fps animation
- Efficient grid-based calculations
- Dynamic particle management
- Responsive canvas scaling

### Browser Compatibility
- Modern browsers with HTML5 Canvas support
- Chrome, Firefox, Safari, Edge
- Mobile-friendly responsive design

## Physics Concepts Demonstrated

1. **Gas Laws**: Pressure-volume relationships
2. **Fluid Dynamics**: Flow from high to low pressure
3. **Molecular Motion**: Particle-based gas behavior
4. **Thermodynamics**: Heat and expansion effects
5. **Engineering**: Valves, compressors, and containment

## Educational Applications

- Physics education and demonstrations
- Engineering concepts visualization
- Interactive learning about gas behavior
- STEM classroom activities
- Scientific modeling and simulation

## Tips for Best Results

- Start with small amounts of gas to observe behavior
- Experiment with different gas types in the same container
- Create complex systems with multiple tools
- Use valves to create controlled release systems
- Adjust sliders to see how parameters affect gas behavior
- Try building sealed chambers and watch pressure accumulate

Enjoy exploring the fascinating world of gas dynamics! 