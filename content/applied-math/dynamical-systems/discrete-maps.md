---
layout: page
title: Discrete Time Dynamical Systems
---

# Discrete Time Dynamical Systems

We'll go over systems in which time is discrete rather than continuous. These systems are called @difference-equations, @recursion-relations, iterated maps, or simply maps. These can be interesting; even in one dimension they can exhibit oscillations and chaos.

:::definition "Difference equation"
A difference equation has the general form

$$\vec{x_{n+1}} = \vec{f(x_n, n)}, $$

where $n$ is a time-like variable, $\vec{f}$ and $\vec{x_n}$ may be vectors, $n = 0, 1, 2, \dots = \mathbb{N}_0.$
:::

Solutions to @difference-equations are @sequences $(x_0, x_1, ..., x_n).$ If $x_0$ is the initial condition, then

$$\begin{aligned}
x_1 & = f(x_0, 0) \\
x_2 & = f(x_1, 0) \\
& \vdots \\
x_n & = f(x_{n-1}, 0) \\
\end{aligned} $$

So the solution is $(x_1, x_2, \dots, x_n).$ Long term dynamics are given by moving along this @sequence as $n \to \infty.$

We will consider ourselves, for now, with @autonomous-systems where there is no explicit dependence on $n,$ i.e.

$$ x_{n+1} = f(x_n). $$

So $x_n \in \mathbb{R}^N$ and $f : \mathbb{R}^N \to \mathbb{R}^N. $

Example: $x_{n+1} =  - x_n.$ If we start with $x_0,$ then $x_1 = -x_0, x_2 = -x_1 = -(-x_0) = x_0, dots$ so the solution is the sequence

$$ x = (x_0, -x_0, x_0, -x_0, \dots). $$

## Orbits and Fixed Points

:::definition "orbit" {synonyms: solution}
A @sequence $(x_0, x_1, x_2, \dots)$ is called the **orbit** (or solution) starting from $x_0.$ This is analogous to a @trajectory in a continuous time dynamical system.
:::

A fixed point in a DTDS is a point whose further iteration does not change, i.e. $x_{n+1} = x_n.$ Fixed points satisfy

$$ x^* = f(x^*).$$

## Stability of Linear Maps

Consider

$$ x_{n+1} = \lambda x_n, \quad \lambda \in \mathbb{R}. $$

Starting with $x_0,$ $x_1 = \lambda x_0, x_2 = \lambda x_1 = \lambda ( \lambda x_0) = \lambda^2 x_0, \dots,$ so our general solution is

$$ x_n = \lambda^n x_0. $$

Fixed points satisfy $x^* = f(x^*) \implies x^* = \lambda x^* \implies x^*(\lambda - 1) = 0.$ Therefore, $x^* = 0$ is always a fixed point, and if $lambda = 1,$ then every $x^* \in \mathbb{R}$ is a fixed point, i.e. the map is just $x_{n+1} = x_n.$ 

Given that $x^* = 0$ is always a fixed point of a linear map, we'll consider different cases of the value of $\lambda$ and how it impacts the stability of $x^*.$

If $\lambda > 1,$ then $\lambda^n \to \infty$ as $n \to \infty.$ Thus, $x_n$ grows without bound and $x^* = 0$ is unstable.

If $0 < \lambda < 1,$ then $\lambda^n \to 0$ as $n \to \infty.$ Thus, $x_n \to 0$ and keeps the same sign. Hence, $x^* = 0$ is stable.

If $\lambda = 0,$ then $x_n = 0$ for all $n \geq 1.$ Hence $x^* = 0$ is stable.

If $-1 < \lambda < 0,$ then $|\lambda|^n \to 0$ as $n \to \infty,$ but $x_n$ alternates sign (oscillates.) Hence, $x^* = 0$ is stable.

If $\lambda < -1,$ then $|\lambda|^n \to \infty$ as $n \to \infty,$ and $x_n$ oscillates with increasing magnitude. Hence $x^* = 0$ is unstable.

If $\lambda = -1,$ then $x_n = (-1)^n x_0,$ so the solution alternates between $x_0$ and $-x_0.$ The fixed point $x^* = 0$ is unstable.

If $\lambda = 1,$ then $x_n = x_0$ for all $n,$ so every point is a stable fixed point.

In summary, if $|\lambda| < 1,$ then $x^* = 0$ is stable. if $|\lambda| > 1,$ then $x^* = 0$ is unstable.

<!-- TODO: Linear stability analysis for nonlinear maps: linearize about x*, criterion |f'(x*)| < 1 stable, > 1 unstable -->

<!-- TODO: Higher-dimensional discrete systems x_{n+1} = A x_n, Jacobian criterion: all eigenvalues inside the unit circle -->

<!-- TODO: Cobweb diagrams — graphical iteration (vertical to curve y = f(x), horizontal to diagonal y = x) -->
