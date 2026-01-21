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

## Transcritical Bifurcation

:::definition "Transcritical"
A **transcritical** bifurcation occurs when a given $x^*$ is always a @fixed-point, but its stability changes when crossing the @bifurcation-point $r^*$. At all values of $r$ other than $r^*,$ there are two @fixed-points (and at $r^*$ one degenerate @fixed-point), but their stability is exchanged at the crossing.
:::

The normal form for a @transcritical-bifurcation is $\dot{x} = r x - x^2.$


## Pitchfork


## Summary of Conditions

At a candidate bifurcation point where $f(x,r) = 0$ and $f_x(x,r) = 0,$ evaluate these derivatives to tell what kind of bifurcation occurs there.

### Saddle-Node

$$ f_r \neq 0. $$

$$ f_{xx} \neq 0. $$

:::intuition
The @fixed-point doesn't persist as $r$ varies $(f_r \neq 0)$ and the nullcline has quadratic tangency $(f_{xx} \neq 0)$, so two @fixed-points collide and annihilate.
:::

Normal form: $\dot{x} = r \pm x^2. $

### Transcritical

$$ f_r = 0. $$

$$ f_{xx} \neq 0. $$

$$ f_{xr} \neq 0. $$

:::intuition
The @fixed-point exists for all $r  ~ (f_r = 0),$ but two branches cross and exchange stability. The $f_{xr} \neq 0$ ensures the stability actually changes (the @eigenvalue $f_x$ crosses zero with nonzero speed as $r$ varies).
:::

Normal form: $\dot{x} = r x - x^2.$

### Pitchfork

$$ f_r = 0. $$

$$ f_{xx} = 0. $$

$$ f_{xxx} \neq 0. $$

$$ f_{xr} \neq 0. $$

To distinguish between supercritical and subcritical:

For supercritical:

We have the condition $f_{xxx}  < 0,$ and the normal form is $\dot{x} = r x - x^3.$

For subcritical:

We have the condition $f_{xxx} > 0,$ and the normal form is $\dot{x} = r x + x^3.$

The @fixed-point exists for all $r ~ (f_r = 0),$ and there's odd symmetry in $x ~ (f_{xx} = 0),$ so instead of two branches crossing, one branch splits into three. The cubic term dominates.

Normal form: $\dot{x} = r * x \pm x^3.$

## Normal Form Analysis

We can find the normal form by shifting to $u = x - x^*, \mu = r - r^*,$ and finding the taylor expansion of $f$ at $(u, \mu.)$ We may need the derivatives above, but sometimes it is just obvious which normal form fits.

# Nondimensionalization

I don't have my head fully wrapped around this yet, but we can sometimes eliminate parameters through dimensional analysis, or, put another way, through change of variables.

Say we start with

$$ \dot{u} = \frac{du}{dt} = au + bu^3 - cu^5. $$

This equations has three parameters, $a, b, and c$ which is mighty inconvenient and difficult to analyze because it means we have a three dimensional parameter space. It'd be nice if we could reduce it to a single parameter. It'd be extra nice if this parameter was on the linear term, because the linear term determines the stability of fixed points. So, we want to end up with something equivalent that has the form

$$ \frac{dx}{d \tau} = r x + x^3 - x^5. $$

We can get there by making a change of variables, starting with the substitution

$$ u = Ux, t = T \tau, $$

Then,

$$ \dot{u} = \frac{du}{dt} = \frac{d(Ux)}{d(\tau T)} = \frac{U}{T} \frac{dx}{d \tau} = a(Ux) + b(U^3 x^3) - c(U^5 x^5), $$

and

$$ \frac{dx}{d \tau} = a T x + b T U^2 + x^3 - c T U^4 x^5. $$

Now, we can let $r = a T x$ and we want the other two terms to have coefficients of 1, so we want to pick values of $T$ and $U$ to make that happen, that is, we want

$$ b T U^2 = 1, c T U^4 = 1. $$

We have two equations and two unknowns ($T$ and $U$), so we solve for them and we get

$$ T = \frac{c}{b^2}, U = \sqrt{\frac{b}{c}}, r = \frac{ac}{b^2}. $$

Now we see that with our new coordinates $x$ and $\tau,$ our parameters collapse into a single one, $r$, and we can much more easily analyze the behavior of this system.

This is called nondimensionalization because we can view $U$ and $T$ as units, $x$ and $\tau$ as dimensionless coordinates, and $u$ and $t$ as coordinates using the units $U$ and $T$.

This process lets us take apparently complex dynamical systems and simplify them into normal forms we can recognize and deal with.
