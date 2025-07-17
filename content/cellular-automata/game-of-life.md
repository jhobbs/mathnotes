---
layout: page
redirect_from:
- cellular/game-of-life
title: Conway's Game of Life
description: Conway's famous cellular automaton demonstrating emergence and complexity from simple rules, featuring still lifes, oscillators, spaceships, and computational universality with interactive simulation.
---

# Conway's Game of Life

Conway's Game of Life is a cellular automaton devised by mathematician John Horton Conway in 1970. Despite its simple rules, it exhibits remarkably complex behavior and has become one of the most well-known examples of emergence in computational systems.

## Rules

The Game of Life is played on a two-dimensional grid where each cell can be either alive (1) or dead (0). The state of each cell evolves according to four simple rules:

1. **Underpopulation**: Any live cell with fewer than two live neighbors dies
2. **Survival**: Any live cell with two or three live neighbors survives
3. **Overpopulation**: Any live cell with more than three live neighbors dies
4. **Reproduction**: Any dead cell with exactly three live neighbors becomes alive

These rules are applied simultaneously to all cells in each generation.

## Interactive Simulation

Explore the Game of Life with this interactive demonstration. You can:
- Click cells to toggle them alive/dead
- Use the controls to start, stop, and step through generations
- Load pre-defined patterns
- Adjust the simulation speed

{% include_integrated_relative cellular-integrated.html %}

## Common Patterns

### Still Lifes
Patterns that don't change:
- **Block**: 2×2 square
- **Beehive**: 6 cells in a hexagonal shape
- **Loaf**: 7 cells in a distinctive shape
- **Boat**: 5 cells resembling a boat

### Oscillators
Patterns that cycle through a fixed sequence:
- **Blinker**: Period 2, alternates between 3 horizontal and 3 vertical cells
- **Toad**: Period 2, 6 cells that shift shape
- **Beacon**: Period 2, two blocks connected diagonally
- **Pulsar**: Period 3, a spectacular 48-cell pattern

### Spaceships
Patterns that translate across the grid:
- **Glider**: 5 cells that move diagonally
- **Lightweight Spaceship (LWSS)**: Moves horizontally
- **Middleweight Spaceship (MWSS)**: Larger horizontal mover
- **Heavyweight Spaceship (HWSS)**: Even larger horizontal mover

## Mathematical Properties

### Computational Universality
The Game of Life is Turing complete, meaning it can simulate any computation that can be described algorithmically. This was proven by constructing:
- Logic gates (AND, OR, NOT)
- Memory storage
- Signal transmission

### Growth Patterns
Starting from finite patterns, populations can:
1. Die out completely
2. Stabilize at a constant population
3. Oscillate between fixed states
4. Grow indefinitely (rare but possible)

### Density Classification
The critical density for random initial configurations is approximately 0.37. Above this, patterns tend to die out; below it, they tend to stabilize at lower densities.

## Notable Discoveries

### Gosper Glider Gun
Discovered by Bill Gosper in 1970, this was the first pattern found that grows indefinitely, emitting a stream of gliders.

### Garden of Eden
Patterns that cannot arise from any previous configuration through the rules of the game.

### Methuselahs
Small patterns that take a long time to stabilize:
- **R-pentomino**: 5 cells that evolve for 1103 generations
- **Acorn**: 7 cells that stabilize after 5206 generations
- **Diehard**: 7 cells that vanish after 130 generations

## Applications and Influence

The Game of Life has influenced many fields:

1. **Computer Science**: Demonstrating emergence and self-organization
2. **Biology**: Modeling population dynamics and pattern formation
3. **Physics**: Studying phase transitions and critical phenomena
4. **Philosophy**: Exploring questions about determinism and complexity
5. **Art**: Creating generative and algorithmic art

## Implementation Notes

Efficient implementations often use:
- Sparse data structures for large, mostly empty grids
- Bit manipulation for parallel cell updates
- HashLife algorithm for computing far-future states
- GPU acceleration for real-time visualization

## Further Exploration

- [LifeWiki](http://www.conwaylife.com/wiki/): Comprehensive database of Life patterns
- Gardner, M. (1970). "The fantastic combinations of John Conway's new solitaire game 'life'"
- Berlekamp, E., Conway, J., Guy, R. (2001). *Winning Ways for Your Mathematical Plays*