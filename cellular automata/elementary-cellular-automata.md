---
layout: page
title: Elementary Cellular Automata
---

# Elementary Cellular Automata

Elementary cellular automata are one-dimensional cellular automata with two possible states (0 or 1) and rules that depend on the cell's current state and the states of its two immediate neighbors. These simple systems were extensively studied by Stephen Wolfram and can produce surprisingly complex behavior.

## How They Work

Each cell's next state is determined by:
- Its current state
- The state of its left neighbor
- The state of its right neighbor

Since each of these can be either 0 or 1, there are $2^3 = 8$ possible neighborhood configurations. A rule specifies the next state for each configuration, giving us $2^8 = 256$ possible rules.

## Rule Numbering

Rules are numbered from 0 to 255 based on their binary representation. For example, Rule 30:

| Pattern | 111 | 110 | 101 | 100 | 011 | 010 | 001 | 000 |
|---------|-----|-----|-----|-----|-----|-----|-----|-----|
| Result  |  0  |  0  |  0  |  1  |  1  |  1  |  1  |  0  |

The binary number 00011110 equals 30 in decimal, hence "Rule 30".

## Interactive Demonstration

The demonstration below allows you to explore different elementary cellular automata rules. You can:
- Select different rules using the dropdown or enter a custom rule number
- Adjust the simulation speed
- See how different initial conditions evolve

{% include_relative elementary.html %}

## Notable Rules

### Rule 30
Produces chaotic, seemingly random patterns despite its simple, deterministic nature. Used in Mathematica's random number generator.

### Rule 90
Creates the Sierpiński triangle fractal pattern. Equivalent to Pascal's triangle modulo 2.

### Rule 110
Proven to be Turing complete, meaning it can perform any computation given the right initial conditions.

### Rule 184
Models traffic flow and ballistic annihilation. Useful for studying particle systems.

## Mathematical Properties

Elementary cellular automata exhibit various interesting properties:

1. **Reversibility**: Some rules (like Rule 51) are reversible - you can uniquely determine previous states from current ones
2. **Conservation**: Some rules conserve the number of live cells
3. **Symmetry**: Many rules produce symmetric patterns when started from symmetric initial conditions
4. **Fractals**: Several rules generate self-similar fractal patterns

## Applications

Despite their simplicity, elementary cellular automata have applications in:
- Random number generation
- Cryptography
- Modeling physical phenomena
- Pattern generation in computer graphics
- Understanding emergence and complexity

## Further Reading

- Wolfram, S. (2002). *A New Kind of Science*
- Cook, M. (2004). "Universality in Elementary Cellular Automata"
- [Wolfram MathWorld: Elementary Cellular Automaton](https://mathworld.wolfram.com/ElementaryCellularAutomaton.html)