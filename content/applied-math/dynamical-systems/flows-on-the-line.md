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

We can also visualize trajectories by plotting $x(t)$ vs $t.$

{% include_demo "time-evolution" %}

Here's both views together.

{% include_demo "phase-and-time" %}

:::definition "Globally stable"
A @fixed-point $x^*$ that is approached from any starting position on the real line (other than that at $x^*$ itself) is said to be **globally stable.**
:::

## Application: Population Growth

A very simple model of population growth is just exponential growth. You can model this as

$$ \dot{N} = r{N}, $$

where $r > 0.$ You can see by modeling this on the demo's above that population just goes to infinity with this. This is not realistic. A better model assumes there is a certain carrying capacity $K$, where if the population $N$ exceeds $K$, growth actually becomes negative. This is modeled using the logistic equation

$$ \dot{N} = rN(1 - \frac{N}{K}). $$

## Linear Stability Analysis

While it's nice to have a visual intuition for whether a @fixed-point is stable or not, sometimes it's also nice to know analytically.

:::theorem {label: linear-stability-analysis}
Let $x^*$ be a fixed point of $\dot{x} = f(x).$ Then, if $f'(x) \neq 0,$ if $f'(x^*)$ is negative, then $x^*$ is a @stable @fixed-point
. If $f'(x^*)$ is positive, then $x^*$ is an @unstable @fixed-point.

::::remark
This comes from letting $u(t) = x(t) - x^*$ be a small perturbation away from $x^*,$ differentiating it, writing its @taylor-series, then noticing that $f(x^*) = 0$ and terms greater than the linear term matter less than the linear term and writing

$$ \dot{u} = f'(x^*)u. $$

This is called  the **linearization** about $x^*.$

It also only works if $f'(x) \neq 0.$ If that's not the case, the best bet is to fall back to graphical analysis or to solve explicitly if possible.
::::
:::
