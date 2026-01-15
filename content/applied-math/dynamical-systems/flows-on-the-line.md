---
layout: page
title: Flows on the Line
---

We use $\dot{x}$ to represent the time derivative of $x,$ that is, $\dot{x} = dx/dt.$

:::definition "First-order system" {synonyms: "one-dimensional system"}
A **first-order** system is a system of the form

$$ \dot{x} = f(x), $$

where $x = x(t)$ is a @real-valued @function of time $t,$ and $f(x)$ is a @smooth real-valued function of $x.$
:::

We can interpret a @differential-equation of this form as a as a @vector-field. $f(x)$ tells us in which direction and at what magnitude we move at any point on the real line (where $f(x)$ is defined.) We can do this by plotting $\dot{x}$ vs $x.$

Here is a demo of that below. Click on the real line to place a particle and see where it flows.

{% include_demo "flows-on-the-line" %}

You can see that when $x$ is to the right of $0,$ the flow is to the right, and when $x$ is to the left of 0 the flow is to the left.

At some points, there is no flow.

:::definition "fixed point" {synonyms: "equilibrium"}
A point at which the change in position of a system is $0$ is called a **fixed point.** We denote a fixed point at $x_p$ as $x^* = x_p.$
:::

:::definition "Stable"
A @fixed-point where nearby points flow towards it is said to be **stable.**
:::

:::definition "Unstable"
A @fixed-point where nearby points flow away from it is said to be **unstable.**
:::

:::remark
The convention, when drawing a dynamical system as a vector field is to draw filled in circles for @stable @fixed-points and empty circles for @unstable @fixed-points.
:::

:::definition "Phase point"
The starting point, $x_0,$ where we place a particle is called a **phase point.**
:::

:::definition "Trajectory"
The function describing the path taken by a particle starting at a @phase-point is called a **trajectory** and represents a solution to a @differential-equation with @initial-conditions $x = x_0.$
:::

:::definition "Phase Portrait"
A drawing that shows the different @trajectories taken from different @phase-points in a system is called a **phase portrait.**
:::

We can also visualize trajectories by plotting $x(t)$ vs $t.$ Click near the left edge to set an initial condition and watch the trajectory evolve over time.

{% include_demo "time-evolution" %}

:::definition "Globally stable"
A @fixed-point $x^*$ that is approached from any starting position on the real line (other than that at $x^*$ itself) is said to be **globally stable.**

## Application: Population Growth
