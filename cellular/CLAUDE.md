# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a collection of interactive cellular automaton visualizations with both web-based and desktop implementations:

### JavaScript Implementations (Web-based)

#### Conway's Game of Life (cellular.html/js)
- 2D grid-based Conway's Game of Life implementation with color-coded species
- Features two competing species (red and green) that follow Conway's rules
- Interactive controls for population density, frame rate, and real-time statistics
- Uses wrap-around (toroidal) topology for neighbor calculations

#### Elementary Cellular Automaton (elementary.html/js)
- 1D cellular automaton with configurable Wolfram rules (0-255)
- Visual rule editor allowing direct manipulation of rule patterns
- Entropy calculation for both row and column patterns
- Optional toroidal boundary conditions

### Python Implementation (Desktop)

#### Optimized Game of Life (gol.py)
- High-performance Python implementation using NumPy and SciPy
- Standard Conway's Game of Life with single green cell population
- Vectorized neighbor counting and grid updates for optimal performance
- Tkinter GUI with real-time controls and statistics
- Features incremental rendering (only redraws changed cells)
- FPS monitoring and adjustable frame rates up to 60 FPS

## Key Components

### JavaScript (Web) Implementations
- Use p5.js for rendering and interaction
- Interactive controls positioned outside the main simulation area
- Real-time statistics display
- Grid-based cellular structures with configurable resolution

### Python Implementation
- **Performance optimizations**: Vectorized operations with NumPy/SciPy
- **Efficient rendering**: Canvas object caching and incremental updates
- **Responsive UI**: Separate timers for game logic vs. UI updates
- **Interactive features**: Click/drag to edit cells, real-time controls

### Grid Management
- JavaScript: 2D arrays with deep copying for state transitions
- Python: NumPy arrays with vectorized operations
- Both support wrap-around (toroidal) boundary conditions

## Development Notes

### JavaScript Files
- No build system - files are served directly as static HTML/JS
- p5.js loaded via CDN (cellular.html) or local file (elementary.html)
- All state management handled in global variables within each simulation

### Python File
- Requires: `numpy`, `scipy`, `tkinter` (built-in)
- Run with: `python3 gol.py`
- Optimized for performance with vectorized operations