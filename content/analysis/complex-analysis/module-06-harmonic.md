---
description: Harmonic functions satisfying Laplace's equation, harmonic conjugates,
  and their relationship to analytic complex functions.
layout: page
redirect_from:
- complex/module 06 - harmonic
- complex/module 6 - harmonic
- /complex analysis/module 06 - harmonic
title: Harmonic Functions
---

# Harmonic Functions

A real-valued function $\phi(x, y)$ is said to be **harmonic** in a domain $D$ if its second partial derivatives are continuous in $D$ and if at each point of $D$, $\phi$ satisfies Laplace's equation

$$ \frac{\partial^2 \phi}{\partial x^2} + \frac{\partial^2 \phi}{\partial y^2} = 0 $$

For an analytic function $f(x,y) = u(x,y) + v(x,y)i$, the second partial derivatives of $u$ and $x$ satisfy Laplace's equation. Therefore, we have the following theorem:

The real and imaginary parts of a function analytic in a domain $D$ are harmonic in $D$.

When $u(x,y)$ is harmonic in a domain $D$, a function $v(x,y)$ such that $u + vi$ is analytic in $D$ is called a **harmonic conjugate** of $u(x,y)$. This means that given a harmonic function $u(x,y)$, we can always find a harmonic conjugate $v(x,y)$ (this is not true for all domains though.)

Given a harmonic function $u(x,y)$ on a suitable domain, we can use the Cauchy-Riemann equations to find a harmonic conjugate $v(x,y)$, as follows.

From the Cauchy-Riemann equations we have $u_x = v_y$ (using the subscript notation for partial derivatives). Then,

$$ v(x,y) = \int{u_x}dy = \int{v_y}dy \tag{a} $$

is the function we're looking for, except the constant of integration will be some unknown $h(x)$.

We'll say then that

$$ v(x,y) = g(x,y) + h(x), \tag{b} $$

where $g(x,y)$ will explicitly be the antiderivative of $v_y$ with respect to $y$, but $h(x)$ will be an unknown function of $x$.

Now, we can take

$$ \frac{\partial}{\partial x}(g(x,y) + h(x)) = v_x = g'(x,y) + h'(x,y). \tag{c} $$

From the Cauchy-Riemann equations, $v_x = -u_y$. Comparing $g'(x,y) + h'(x)$ to $-u_y$, we find $h'(x)$ as the missing terms from $g'(x,y)$ in $-u_y$, if any. Integrating these gives the value of $h(x)$, which we can plug into (b) to get $v(x,y)$.

Note that this is the same mechnical procedure we use to [[solve first order exact differential equations|differential-equations/exact-differential-equations]].

We can use this to find analytic functions from a harmonic function by using the harmonic conjugates and the harmonic function as the real and imaginary parts of a complex function.

One interesting property of harmonic functions and their conjugates is that they define orthogonal families of curves - all of their intersections are at right angles to each other.