# Flows on the Line Demo Design

## Overview

Interactive visualization for 1D dynamical systems of the form ẋ = f(x). Users input a function f(x), see the phase portrait on the real line, and spawn particles to watch the flow dynamics.

## Visual Layout

Single integrated canvas view:

- **Curve**: f(x) plotted as a continuous line
- **Number line**: The x-axis (y=0) serves as the phase line
- **Fixed points**: Circles on the x-axis where f(x) = 0
  - Filled circle = stable (f'(x) < 0)
  - Hollow circle = unstable (f'(x) > 0)
- **Particles**: User-spawned dots that flow according to ẋ = f(x)

Visual intuition: where curve is above axis (f(x) > 0), flow goes right; below axis (f(x) < 0), flow goes left.

## Controls

**Function input:**
- Text input field labeled "f(x) =" with monospace font
- Button row with presets: `sin(x)`, `x*(1-x)`, `x^2-1`, `x-x^3`, `cos(x)`
- Clicking preset populates text field (still editable)
- Red border on parse error

**Canvas interaction:**
- Click on/near x-axis to spawn particle at that x position
- Particles animate until hitting fixed point or leaving visible range
- "Clear" button to remove all particles

**View:**
- Adjustable x-range for different function scales

## Implementation

**Tech stack:**
- p5.js via `P5DemoBase` for canvas and animation
- mathjs for parsing f(x) and computing f'(x)

**Particle dynamics:**
```
x += f(x) * dt  // Euler integration
```
Remove particle when |x| > xMax or within ε of fixed point and slowing.

**Root finding with Newton-Raphson:**
```typescript
import { derivative, evaluate, parse } from 'mathjs';

function newtonRaphson(expr: string, x0: number, tol = 1e-10, maxIter = 100): number {
  const f = parse(expr);
  const df = derivative(f, 'x');

  let x = x0;
  for (let i = 0; i < maxIter; i++) {
    const fx = evaluate(expr, { x });
    const dfx = df.evaluate({ x });
    const xNew = x - fx / dfx;
    if (Math.abs(xNew - x) < tol) return xNew;
    x = xNew;
  }
  return x;
}
```

**Fixed point detection:**
1. Sample f(x) across visible range
2. Detect sign changes
3. Newton-Raphson from midpoint of each sign-change interval
4. Deduplicate roots within tolerance
5. Classify by sign of f'(x)

## Files

- `demos/dynamical-systems/flows-on-the-line.ts` - main demo
- Register in `demos-framework/src/main.ts`
