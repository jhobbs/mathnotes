---
layout: page
title: Differentiation
---

# Differentiation

For $f: (a,b) \to \mathbb{R}, a,b \in \mathbb{R}$, we say the **derivative** of $f$ at $x,$ denoted $f'(x)$ is given by

$$ f'(x) = \lim_{y \to x} \frac{f(y) - f(x)}{y - x}. $$

If this limit exists, the function is said to be differentiable at $x.$ If the limit exists for all $x \in (a,b),$ the function is said to be differentiable on $(a,b).$

Note that this is just the rise-over-run formula for the slope between two points taken to the limit of the two points being infinitesimally near each other.

*Theorem:* If $f$ is differentiable at $x,$ then it is continuous at $x.$

## Derivative rules

Let $c$ be a real number, and f and g be functions defined on an open interval and differentiable at a point $x$ in that interval.

Linearity: $(f+cg)' = f'(x) + cg'(x).$

Product: $(fg)'(x) = f'(x)g(x) +f(x)g'(x).$

Quotient: $(f/g)'(x) = \frac{f'(x)g(x) -f(x)g'(x)}{\[g(x)\]^2}.$

Let $h(x) = f(g(x)).$

Chain: $h'(x) = f'(g(x)) \cdot g'(x).$

## Other Theorems

*Rolle's Theorem:* Suppose $f$ is continuous on $[a,b]$ and differentiable on $(a,b)$ and that $f(a) = f(b).$ Then there exists a point $c$ in $(a,b)$ such that $f'(c) = 0.$

Simply put, if a differentiable function over an open interval $(a,b)$ has the same value at its boundary points, then at some point in the interval, the function is flat (has a zero derivative).

*Mean Value Theorem:* Suppose $f$ is continuous on $[a,b]$ and differentiable on $(a,b).$ Then there exists a point $c$ in $(a,b)$ such that:

$$ f'(c) = \frac{f(b) - f(a)}{b-a}.$$

This means that for a function continuous on an interval, and differentiable on that interval except maybe at its endpoints, there is a point on the interval where the derivative of the function at that point equals the slope of the function between its endpoints.

*L'Hospital Rule (Theorem)*: Suppose there is a $\delta > 0$ such that $f$ and $g$ are differentiable on $(c  - \delta, c + \delta)$ with $g'(x) \neq 0$ on this interval. Suppose also that

$$ \lim_{x \to c} \frac{f'(x)}{g'(x)} = L. $$

Then if $\lim_{x \to c}f(x) = \lim_{x \to c}g(x) = 0,$ $\lim_{x \to c}f(x) = \lim_{x \to c}g(x) = \infty,$ or $\lim_{x \to c}f(x) = \lim_{x \to c}g(x) = -\infty,$ we have that

$$ \lim_{x \to c} \frac{f(x)}{g(x)} = L. $$

The endpoint $c$ can also be $\pm \infty.$