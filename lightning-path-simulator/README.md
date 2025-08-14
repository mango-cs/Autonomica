# ⚡ Lightning Path Simulator

An advanced 2D grid-based electrical simulation where lightning seeks grounded paths through various conductive and semi-conductive materials. Experience realistic electrical behavior with branching arcs, burn trails, and chain reactions!

## 🌟 Features

### Core Simulation
- **Realistic Pathfinding**: Lightning uses advanced algorithms to find optimal paths from clouds to ground
- **Material Properties**: Each material has unique conductivity, resistance, and electrical characteristics
- **Branching Logic**: Creates chaotic bolts with natural forking structures and secondary arcs
- **Gravity Effect**: Lightning naturally favors downward paths, simulating real electrical behavior

### Interactive Controls
- **Discharge Strength**: Control the power and reach of lightning strikes (1-20)
- **Conductivity Threshold**: Set minimum conductivity required for arc propagation (0.1-1.0)
- **Arc Randomness**: Adjust chaos and unpredictability in lightning paths (0-100%)
- **Burn Trail Duration**: Control how long burn marks remain visible (0-100 frames)

### Materials System
- **Air** (Dark Blue): Low conductivity, high resistance - lightning struggles through
- **Wire/Conductor** (Gold): High conductivity, minimal resistance - lightning loves these paths
- **Insulator** (Brown): Blocks electrical flow unless breakdown voltage is exceeded
- **Ground** (Dark Brown): Ultimate target - zero resistance, perfect conductor
- **Cloud** (Blue): Source of electrical charge - where lightning originates
- **Semi-Conductor** (Red): Moderate conductivity - creates interesting branching patterns

### Visual Effects
- **Dynamic Lightning Arcs**: Realistic bolt visualization with intensity-based brightness
- **Branching Effects**: Secondary arcs and spontaneous branches
- **Burn Trails**: Glowing orange trails showing lightning's path
- **Time-Delayed Reactions**: Chain reactions through conductive networks
- **Multi-Strike Capability**: Simulate storm conditions with rapid successive strikes

## 🎮 Controls & Usage

### Mouse Controls
- **Click & Drag**: Place selected materials on the grid
- **Material Selection**: Click material buttons to choose what to draw

### Keyboard Shortcuts
- **Spacebar**: Trigger single lightning strike
- **R**: Reset entire simulation
- **C**: Clear user-drawn materials (keep clouds/ground)
- **M**: Multi-strike mode (3-8 rapid strikes)

### Buttons
- **⚡ Trigger Lightning**: Single controlled strike
- **🌩️ Multi-Strike**: Storm simulation with multiple rapid strikes
- **🧹 Clear Grid**: Remove user materials, keep default setup
- **🎯 Load Demo**: Create an interesting pre-built scenario
- **🔄 Reset All**: Complete simulation reset

## 🔬 Physics & Algorithms

### Pathfinding Algorithm
The simulation uses a weighted breadth-first search with dynamic resistance calculation:

1. **Resistance Calculation**: Each cell's resistance depends on:
   - Base material resistance
   - Arc randomness factor
   - Gravitational bias (favors downward movement)
   - Diagonal movement penalty
   - Conductivity threshold checks

2. **Branching Logic**: 
   - Primary paths spawn secondary branches at random points
   - Branches avoid main paths and seek alternative routes
   - Branch probability increases with path length and discharge strength

3. **Chain Reactions**:
   - Time-delayed secondary arcs near conductive materials
   - Cascading effects through connected conductor networks

### Material Physics
- **Breakdown Voltage**: Insulators can be overcome with sufficient discharge strength
- **Conductivity Weighting**: Higher conductivity materials attract lightning paths
- **Resistance Networks**: Complex interactions between different material combinations

## 🎯 Simulation Tips

### Creating Interesting Scenarios
1. **Lightning Rods**: Place conductors vertically to guide lightning safely to ground
2. **Maze Challenges**: Use insulators to create complex routing puzzles
3. **Network Effects**: Connect conductors to create branching opportunities
4. **Mixed Materials**: Combine semi-conductors with insulators for realistic behavior

### Optimal Settings
- **High Chaos**: Max randomness (100%) for wild, unpredictable bolts
- **Precision Strikes**: Low randomness (10-20%) for more predictable paths  
- **Storm Mode**: High discharge strength (15-20) with multi-strike enabled
- **Subtle Effects**: Low burn trail duration for clean visualization

### Performance Notes
- Grid size: 200x150 cells for optimal performance
- Cell size: 4 pixels for detailed visualization
- Animation: 60 FPS with efficient rendering pipeline

## 🛠️ Technical Implementation

### Architecture
- **Object-Oriented Design**: Modular `LightningSimulator` class
- **Canvas Rendering**: Hardware-accelerated 2D graphics
- **Event-Driven**: Responsive mouse/keyboard interaction
- **State Management**: Efficient grid updates and arc tracking

### Key Components
- **Grid System**: 2D array storing material and electrical properties
- **Arc Management**: Dynamic lightning bolt lifecycle tracking  
- **Visual Effects**: Real-time rendering with transparency and shadows
- **Statistics Tracking**: Performance metrics and strike analytics

## 🎨 Visual Features

### Lightning Rendering
- **Intensity-Based Transparency**: Arcs fade naturally over time
- **Jitter Effects**: Realistic electrical arc movement
- **Glow Effects**: Cyan shadow glow for authentic lightning appearance
- **Branch Differentiation**: Different colors/styles for main arcs vs branches

### Material Visualization
- **Color-Coded Grid**: Each material has distinct visual identity
- **Burn Trail Animation**: Orange glowing trails with fade-out
- **Interactive Feedback**: Clear material selection and placement

## 🚀 Getting Started

1. Open `index.html` in a modern web browser
2. Use the material buttons to select what to draw
3. Click and drag on the grid to place materials
4. Adjust sliders to customize electrical behavior
5. Press Spacebar or click "Trigger Lightning" to see the magic!
6. Experiment with different material combinations and settings

## 🎯 Example Scenarios

### Lightning Rod Demo
1. Click "Load Demo" for a pre-built scenario
2. Observe how lightning prefers the conductor path
3. Try adjusting discharge strength to see breakdown effects

### Storm Simulation
1. Set discharge strength to maximum (20)
2. Set arc randomness to 60-80%
3. Use Multi-Strike mode for realistic storm effects
4. Watch chain reactions through conductor networks

### Precision Engineering
1. Lower randomness to 10-20%
2. Create specific conductor paths
3. Use insulators as precise barriers
4. Study how lightning follows engineered routes

---

**Enjoy exploring the fascinating world of electrical simulation!** ⚡🌩️

*Built with HTML5 Canvas, modern JavaScript, and realistic physics algorithms.* 