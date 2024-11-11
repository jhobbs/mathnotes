---
layout: page
title: Separation of Variables
---

# Separation of Variables

The method of separation of variables is effective in solving several types of partial differential equations.

the idea is roughly that we think of a solution, say $u(x,t),$ to a partial differential equation as beinga linear combinatio nof simple component functions $u_n(x,t), n = 0, 1, 2, \dots,$ which also satisfy the equation and certian boundary conditions. This assumption is reasonable provided the partial differential equation and the boundary conditions are linear. To determine a component solution, $u_n(x,t)$, we assume it can be written with its variables separated, that is, as:

$$ u_n(x,t) = X_n(X)T_n(t). $$

Substituting this form for a solution into the partial differential equation and using the boundary conditions leads, in many cases, to two ordinary differential equations for the unknown functions $X_n(x)$ and $T_n(t)$. 


## Solving the Heat Equation

First, see the notes on the [heat equation](./heat.html) We have the following mathematical model for the heat flow in a uniform wire without internal sources $(P = 0)$ whose ends are kept at the constant temperature $0^\circ c$:

$$ \frac{\partial u}{\partial t}(x,t) = \alpha \frac{\partial^2 u}{\partial x^2}(x,t), \quad 0 < x < L, \quad t > 0, \tag{7} $$

$$ u(0, t) = u(L, t) = 0, \quad t>0, \tag{8} $$

$$ u(x,0) = f(x), \quad 0 < x < L. \tag{9} $$

We wish to find a function $u(x,t)$ that satisfies all three of these conditions.
