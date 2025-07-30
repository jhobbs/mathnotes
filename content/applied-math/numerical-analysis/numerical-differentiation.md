---
layout: page
title: Numerical Differentiation
description: Forward, backward, and central difference formulas for approximating derivatives, including multi-point methods based on Lagrange polynomial differentiation.
redirect_from:
  - numerical-analysis/numerical-differentiation
---

# Numerical Differentiation

Recall that the derivative of a function $f$ at $x_0$ is

$$ f'(x_0) = \lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h}. $$

A simple approximation of $f'(x_0)$ can be given by simply picking a small value of $h$ and computing

$$ \frac{f(x_0 + h) - f(x_0)}{h}. $$

This can be derived by defining $x_1 = x_0 + h$, constructing the first Lagrange polynomial $P_{0,1}(x)$ for $f$ using $x_0$ and $x_1$ with its error term, and then differentiating that polynomial and error term.

This approach is called the **forward-difference formula** if $h > 0$ and the **backward-difference formula** if $h < 0.$ 

We can generalize this approach by using more points on an interval to construct higher degree Lagrange polynomials for the interval and then differentiating those. Using more points produces greater accuracy, although there are traeoffs around the number of functional evaluations and the growth of round-off errors.

The **$(n+1)$-point formula** to approximate $f'(x_j)$ is

$$ f'(x_j) = \sum_{k=0}^n f(x_k){L_{k}}'(x_j) + \frac{f^{(n+1)}(\xi(x_j))}{(n+1)!} \prod_{k=0; k \neq j}^n (x_j - x_k). $$

Note that this formula only works for the sample points at numbers $x_j$; otherwise, there an additional error term for which we have no information to compute.

In practice, the most commonly used $(n+1)$-point formulas use either three or five evaluation points.

We will assume equally spaced nodes (nodes that are $h$ apart with $h > 0.$). There are two forms of three point formulas - one for the endpoints of the interval and one for the midpoints. The midpoint formula has less error than the endpoint formula because it uses information from both sides of the sample point.

The endpoint formula is (with h being positive for $a$ and negative for $b$ on $[a, b]$)

$$ f'(x_0) = \frac{1}{2h}\left ( -3f(x_0) + 4f(x_0 + h) - f(x_0 + 2h) \right ) + \frac{h^2}{3}f^{(3)}(\xi_0), $$

where $\xi_0$ is in $(x_0, x_0 + 2h).$

The midpoint formula is

$$ f'(x_0) = \frac{1}{2h} \left( f(x_0 + h) - f(x_0 -h) \right ) - \frac{h^2}{6}f^{(3)}(\xi_1), $$

where $\xi_1$ is in $(x_0 - h, x_0 + h).$

Note that in addition to being more accurate, the midpoint formula uses one less evaluation of $f$ than the endpoint formula!

