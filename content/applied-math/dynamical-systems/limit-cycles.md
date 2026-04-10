---
layout: page
title: Limit Cycles
---
## Polar Coordinate Methods

Given a system $\dot{x} = f(x,y), \dot{y} = g(x,y),$ it's sometimes useful, especially for the analysis of limit cycles, to convert to polar coordinates. This can be done the manual way from the start, which leads to needing to solve a system of equations for $\dot{r}$ and $\dot{\theta},$ or we can use these handy formulas, which are equivalent:

$$ \dot{r} = \frac{x \dot{x} + y \dot{y}}{r}, \quad \dot{\theta} = \frac{x \dot{y} - y \dot{x}}{r^2}. $$

## Conservative Systems

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

:::definition "Homoclinic orbit"
A @trajectory that starts and ends at the same @fixed-point is called a **homoclinic orbit.**
:::

These @homoclinic-orbits are common in conservative systems but are rare otherwise. Note that @homoclinic-orbits are not periodic because they take forever trying to reach the fixed point.

Note that nonlinear @centers are robust in conservative systems, because any trajectories sufficiently close to them are closed.

### Hamiltonian Systems

:::definition "Hamiltonian System"
A **Hamiltonian system** is one where $H(p,q)$ is a smooth, real-valued function and we have that

$$ \dot{q} = \frac{\partial H}{\partial p}, \quad \dot{p} = -\frac{\partial H}{\partial q}. $$

The function $H$ is called the **Hamiltonian.**
:::

:::theorem
For any @Hamiltonian-system, $H$ is a conserved quantity.
:::

## Reversible Systems

:::definition "Reversible System"
A **reversible system** is any second-order system that is invariant under $t \to -t$ and $y \to -y.$
:::

Centers are also robust in reversible systems.

:::definition "Heteroclinic trajectories"
Pairs of orbits connecting twin @saddle-points are called **heteroclinic trajectories.**
:::

These @heteroclinic-orbits are much more common in reversible or conservative systems than in other types of systems.

<!-- TODO: Hamiltonian systems, energy conservation, potential functions, energy level sets, closed orbits -->

## Limit Cycles


:::definition "Limit cycle"
A **limit cycle** is an isolated @closed @trajectory. Isolated means that @neighboring @trajectories are not @closed; they spiral toward or away from the limit cycle.
:::

:::definition "Stable limit cycle" {synonyms: "attracting limit cycle"}
If all neighboring @trajectories approach the @limit-cycle, we say the @limit-cycle is **stable** or **attracting.**
:::

:::definition "Unstable limit cycle"
If a @limit-cycle is not stable, we say it is an **unstable limit cycle**, or in exceptional cases, half-stable.
:::


### Non-Existence Criteria

Sometimes we want to show that a @system does not have a @limit-cycle.

#### Gradient Systems

:::definition "Gradient System"
If a @system can be written in the form $\dot{\vec{x}} = - \nabla V,$ for some @continuously-differentiable, single-valued scalar function $V(\vec{x}),$ then it is said to be a **gradient system** with **potential function** $V.$
:::

We can check if a $2$d system is a gradient system by doing a comparison of the partial derivatives, just like we do for checking if an ODE an exact differential equation. If $\dot{x} = f(x,y), \dot{y} = g(x,y),$ then there is a potential function if $\frac{\partial f}{\partial y} = \frac{\partial g}{\partial x}.$ This means it's a gradient system. We can then find the potential function by doing the same process as we do for solving exact differential equations.

:::theorem {label: closed-orbits-impossible-in-gradient-systems}
Closed orbits are impossible in gradient systems.
::::intuition
If we're always moving "downhill" in some direction in a space, it's impossible to come back to where we started. This is another reason why oscillations aren't possible in one dimensional systems.
::::
:::

#### Lyapunov Functions

:::definition "Liapunov Function" {synonyms: "Lyapunov function"}
Consider a system $\dot{\vec{x}} = \vec{f(x)}$ with a fixed point at $\vec{x^*}.$ If it has a function with the following properties:

1. $V(\vec{x}) > 0$ for all $\vec{x} \neq \vec{x^*},$ and $V(\vec{x^*}) = 0.$ (i.e. $V$ is @positive-definite.)

2. $\dot{V} < 0$ for all $\vec{x} \neq \vec{x^*}.$ (All trajectories flow "downhill" toward $\vec{x^*}.$

Then such a function is called a **Liapunov function.**
:::

:::theorem
If a system has a @liapunov-function, then its fixed point $\vec{x^*}$ is globally asymptotically stable: for all initial conditions, $\vec{x}(t) \to \vec{x^*}$ as $t \to \infty.$ Therefore, the system has no closed orbits.
::::intuition
Like gradient systems, we can't get in a loop if we're always moving downhill.
::::
:::

There is no systematic way to construct @Lianpunov-functions. Strogatz says Divine Inspiration is required.

#### Dulac's Criterion

Dulac's Criterion is based on @greens-theorem.

:::theorem
Let $\dot{\vec{x}} = \vec{f(x)}$ be a @continuously-differentiable @vector-field defined on a @simply-connected @subset $R$ of the @plane. If there exists a @continuously-differentiable, @real-valued @function $g(\vec{x})$ such that $\nabla \cdot (g\dot{\vec{x}})$ has one sign throughout $R,$ then there are no @closed @orbits lying entirely in $R.$
:::

The special case where $g(\vec{x}) = 1$ is called **Bendixson's theorem.**

As with @Liapunov-functions, there is no algorithm for finding $g(\vec{x}).$

<!-- TODO: definition, isolated closed orbits, stable/unstable/half-stable limit cycles, amplitude and frequency -->

### Existence Criteria

The Poincaré-Bendixson theorem can be used to show that a @limit-cycle must exist in a particular system.

:::theorem {label: poincare-bendixson}
Suppose that

(1) $R$ is a closed, bounded subset of the plane;

(2) $\dot{\vec{x}} = \vec{f(x)}$ is a @continuously-differentiable @vector-field on an @open-set containing $R;$

(3) $R$ does not contain any @fixed-points;

(4) There exists a @trajectory $C$ that is "confined" in $R,$ in the sense that it starts in $R$ and stays in $R$ for all future time.

Then, either $C$ is a closed orbit, or it spirals toward a closed orbit as $t \to \infty.$ In either case, $R$ contains a closed orbit.
:::

To show that a confined @trajectory exists when applying @poincare-bendixson, we usually construct a trapping region using polar coordinates. We usually do this for a @stable-limit-cycle, but we can do it for an @unstable-limit-cycle too, by looking at the system using reversed time. We want to keep it as tight as possible, so we find the maximum $r$ for which $\dot{r} > 0$ for all all $\theta.$ Anything inside of that $r$ will therefore be pushed outward into the region beyond it. Call this inner boundary $r_1.$ Similarly, we find the minimum $r$ for which all $\dot{r} < 0;$ call it $r_2.$ Thus, any trajectories that start beyond $r_2$ will be pushed into the region inside of $r_2.$ Now, any trajectories anywhere (other than those that start on a fixed point) will be pushed into our trapping region and will never leave it.
