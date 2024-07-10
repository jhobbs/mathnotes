---
layout: page
title: Harmonic Functions
---

# Harmonic Functions

A real-valued function $\phi(x, y)$ is said to be **harmonic** in a domain $D$ if its second partial derivatives are continuous in $D$ and if at each point of $D$, $\phi$ satisfies Laplace's equation

$$ \frac{\partial^2 \phi}{\partial x^2} + \frac{\partial^2 \phi}{\partial y^2} = 0 $$

For an analytic function $f(x,y) = u(x,y) + v(x,y)i$, the second partial derivatives of $u$ and $x$ satisfy Laplace's equation. Therefore, we have the following theorem:

The real and imaginary parts of a function analytic in a domain $D$ are harmonic in $D$.

When $u(x,y)$ is harmonic in a domain $D$, a function $v(x,y)$ such that $u + vi$ is analytic in $D$ is called a **harmonic conjugate** of $u(x,y)$. This means that given a harmonic function $u(x,y)$, we can always find a harmonic conjugate $v(x,y)$ (this is not true for all domains though.)

One interesting property of harmonic functions and their conjugates is that they define orthogonal families of curves - all of their intersections are at right agles to each other.
