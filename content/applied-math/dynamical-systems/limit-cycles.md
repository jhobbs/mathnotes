---
layout: page
title: Limit Cycles
---
## Polar Coordinate Methods

Given a system $\dot{x} = f(x,y), \dot{y} = g(x,y),$ it's sometimes useful, especially for the analysis of limit cycles, to convert to polar coordinates. This can be done the manual way from the start, which leads to needing to solve a system of equations for $\dot{r}$ and $\dot{\theta},$ or we can use these handy formulas, which are equivalent:

$$ \dot{r} = \frac{x \dot{x} + y \dot{y}}{r}, \quad \dot{\theta} = \frac{x \dot{y} - y \dot{x}}{r^2}. $$

## Conservative and Hamiltonian Systems

:::definition "Conserved Quantity"
Given a system $\dot{\vec{x}} = \vec{f(x)},$ a **conserved quantity** is a @real-valued @continuous @function $E(\vec{x})$ that is constant on trajectories, i.e. $dE/dt = 0.$ We also require that $E(\vec{x})$ is nonconstant on every @open set, to avoid trivial examples such as $E(\vec{x}) = 0.$ 
:::

As an example, consider a particle of mass $m$ moving along the $x$-axis, subject to a nonlinear force $F(x):$

$$ m\ddot{x} = F(x). $$

Note that $F(x)$ is not dependent on $\dot{x}$ or $t,$ so there is no damping or friction, and the driving force doesn't vary with time. Under these conditions, we can show that energy is conserved. Let $V(x)$ denote the potential energy, defined by $F(x) = -dV/dx.$ Then

$$ m\ddot{x} + \frac{dV}{dx}  = 0. $$

Now, if we multiply both sides times $\dot{x}$ we get

$$ m \dot{x} \ddot{x} + \frac{dV}{dx} \dot{x} = 0 \implies \frac{d}{dt} \left [ \frac{1}{2} m \dot{x}^2 + V(x) \right ] = 0, $$

which means that the LHS is an @exact time derivative. We get here by applying the chain rule in reverse, i.e.

$$ \frac{d}{dt} V(x(t)) = \frac{dV}{dx} \frac{dx}{dt}. $$

Therefore, for a given solution $x(t),$ the total energy

$$ E = \frac{1}{2} m \dot{x}^2 + V(x) $$

is a constant function of time. The energy is called a @conserved-quantity, a constant of motion, or a first integral.

:::definition "Conservative system"
Systems for which a conserved quantity exist are called **conservative systems.** 
:::

:::theorem {label: conservative-systems-have-no-attracting-fixed-points}
Conservative systems have no attracting @fixed-points.

::::proof
Suppose $\vec{x^*}$ were an attracting @fixed-point in a conservative system. Then, note that all trajectories in the basin of attraction approach $\vec{x^*}$ as $t \to \infty.$ Since $E(\vec{x})$ is continuous, the energy in the limit as trajectories approach $\vec{x^*}$ is equal to the energy at the fixed point, and so the energy along the entirety of each trajectory is equal to the energy at the fixed point. But, this implies that the energy in the entire basin of attraction is the same as the energy at the fixed point, which violates our definition of a conservative system (i.e. we require that $E(\vec{x})$ be nonconstant.) Therefore no such @fixed-point can exist.
::::
:::

Now, while conservative systems can't have attracting fixed points, they can have other types, and generally have @saddles and @centers.

<!-- TODO: Hamiltonian systems, energy conservation, potential functions, energy level sets, closed orbits -->

## Lyapunov Functions

<!-- TODO: Lyapunov function construction, proving global/asymptotic stability, Lyapunov's theorems -->

## Limit Cycles

<!-- TODO: definition, isolated closed orbits, stable/unstable/half-stable limit cycles, amplitude and frequency -->

## Ruling Out and Proving Closed Orbits

<!-- TODO: Bendixson's theorem (ruling out closed orbits via divergence), Poincaré-Bendixson theorem (proving existence via trapping regions) -->
