---
layout: page
title: Bifurcations
---

:::definition "bifurcation"
In a @dynamical-system with a smoothly varying @parameter $r,$ a sudden change in qualitative or topological behavior of the system, especially the creation, annihilation, or change of stability in its @fixed-points, is called a **bifurcation.**
:::

:::definition "bifurcation point"
The parameter values at which @bifurcations occur are called **bifurcation points.**
:::

You can see some @bifurcations in action with the demo below.

{% include_demo "parametric-phase-portrait" %}

## Saddle-Node Bifurcation

:::definition "Saddle-Node"
The defining feature of a **saddle-node** @bifurcation is that as $r$ crosses the @bifurcation-point, two @fixed-points are created or destroyed (depending on the direction of approach.) If approaching from the direction in which the @fixed-points exist, they will grow closer to each other, until they reach other at the @bifurcation-point, forming a @half-stable point, and then they will be destroyed as $r$ continues on the other side of the @bifurcation-point.
:::

:::definition "Tangential Intersection"
Two @functions $f$ and $g$ are said to have a **tangential intersection** at a @point $p$ if both their @values and the @values of their first @derivatives are equal at $p.$ That is, if

$$ f(p) = g(p) \quad \text{AND} \quad f'(p) = g'(p). $$
:::

I don't have a full definition for **normal form** yet, but the prototypical forms for @saddle-node @bifurcations are

$$ \dot{x} = r - x^2, \quad \dot{x} = r + x^2. $$

For any $f(x, r),$ if we have the following conditions at the @bifurcation point $r^*,$ the @dynamical-system can be reduced to one of the @saddle-node normal forms above:

$$ f(x^*, r^*) = 0, \quad \partial_x f(x^*, r^*) = 0, $$

that is, $f(x^*, r^*)$ is a @tangential-intersection with the $x$-axis, and

$$ \partial_{xx} f(x^*, r^*) \neq 0, \partial_r f(x^*, r^*) \neq 0. $$

The first ensures this is only a double root, not a triple root or worse. The second ensures that as we vary $r$ near this point, the function value actually changes, which is required to create or destroy the @fixed-points.
