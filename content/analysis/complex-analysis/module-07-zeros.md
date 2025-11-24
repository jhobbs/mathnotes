---
description: Classification of zeros by order, isolated singularities, and their characterization
  in terms of analytic functions.
layout: page
title: Zeros and Singularities
---

# Zeros and Singularities

A point $z_0$ is called a **zero** of an order $m$ of a complex function $f$ if $f$ is analytic at $z_0$ and

$$ 0 = f(z_0) = f'(z_0) = \cdots = f^{(m-1)}(z_0), f^{(m)}(z_0) \neq 0. $$

Zeroes of order 1 are often called **simple zeros**.

:::theorem
If a function $f(z)$ can be expressed in the form

$$ f(z) = (z - z_0)^m g(z) $$

valid in some circle $\|z - z_0\| < R$, where $g(z)$ is analytic at $z_0$ and $g(z_0) \neq 0$, then $f(z)$ has a zero of order $m$ at $z_0$.
::::intuition
We can see this from the definition of the @taylor-series. Assume we're at a zero, that is, that $f(z_0) = 0.$ Then

$$ f(z) = f(z_0) + f'(z_0)(z - z_0) + \frac{f''(z_0)}{2!}(z - z_0)^2 + \cdots, $$

and since $f(z_0)$ is $0,$ we're left with all terms that have $(z - z_0)$ in them, and so we can factor them out and get

$$ f(z) = (z - z_0)(f'(z_0) + \frac{f''(z_0)}{2!}(z - z_0) + \frac{f''(z_0)}{3!}(z - z_0)^2 + \cdots. $$

Now, if $f'(z_0)$ does not have a zero at $z_0$, then $f'(z_0)$ is not zero and $f(z)$ has a first order zero at $z_0.$ If $f'(z_0)$ has a zero at $z_0,$ we can repeat and move onto the next term until, going through $m$ terms, until we find a term that doesn't have a zero at $z_0,$ in which case we will have factored out $(z - z_0)^m$ and we'll be left with an analytic $g(z)$ with $g(z_0) \neq 0.$
::::
:::

A point $z_0$ is called a **singularity** of a complex function $f$ if $f$ is not analytic at $z_0$, but every neighborhood of $z_0$ contains at least one point at which $f$ is analytic.

A singularity $z_0$ of a complex function $f$ is said to be **isolated** if there exists a neighborhood of $z_0$ in which $z_0$ is the only singularity of $f$.
