---
description: Power series expansions of analytic functions, convergence properties,
  and fundamental series for elementary functions.
layout: page
title: Taylor and Maclaurin Series
---

# Taylor and Maclaurin Series

:::definition "Power Series"
A **power series** in powers of $z - z_0$ is a series of the form

$$ \sum_{n=0}^{\infty} a_n (z - z_0)^n = a_0 + a_1(z - z_0) + a_2(z - z_0)^2 + \cdots, $$


where $z$ is a complex variable, $a_0, a_1, \dots,$ are complex constants, called the **coefficients** of the series, and $z_0$ is a complex constant, called the **center** of the series. 
:::


:::theorem "Taylor Expansion Theorem" {label: taylor-expansion-theorem}
Let $f$ be @analytic in a @domain $D$ and $z_0$ be a @point in $D$. Then $f$ can be expanded in a @power-series

$$ f(z) = f(z_0) + f'(z_0)(z - z_0) + \frac{f''(z_0)}{2!}(z - z_0)^2 + \cdots, $$

valid in all circles $\|z - z_0\| < r$ containing only @points of $D$.
:::


:::definition "Taylor series"
The expansion

$$ f(z) = \sum_{n=0}^{\infty} \frac{f^{(n)}(z_0)}{n!} (z - z_0)^n $$

is called the **Taylor series** of $f$ about $z_0$.
:::

:::definition "Maclaurin series" 
The special case of the @Taylor-series in which $z_0$ = 0

$$ f(z) = \sum_{n=0}^{\infty} \frac{f^{(n)}(0)}{n!} z^n $$

is called the **Maclaurin series** of f.
:::

:::definition "Circle of Convergence"
The circle $\|z - z_0\| < $ in which the @Taylor-series @converges to the @function is called the **circle of convergence** for the @Taylor-series.
:::

:::definition "Radius of Convergence"
The radius of the @circle-of-convergence is called the **radius of convergence.**
:::

:::theorem
Every @power-series representation of (or, Taylor series for) an @entire-function has an infinite @radius-of-convergence.

:::


:::theorem "A theorem about the uniqueness of Taylor series as @power-series expansions"
If $f$ has a @power-series expansion about a point $z_0$ with nonzero @radius-of-convergence, it must be the @Taylor-series about $z_0$.
:::

:::theorem "A theorem about radius of convergence"
The @radius-of-convergence of the Taylor series for a function $f(z)$ about a point $z_0$ is the distance from $z_0$ to the nearest singularity of $f(z)$.
:::

Here are some important and useful Maclaurin series that we can often use to find those of other functions:


$$ e^z = 1 + z + \frac{z^2}{2!} + \frac{z^3}{3!} + \cdots = \sum_{n=0}^{\infty} \frac{1}{n!}z^n, |z| < \infty, $$

$$ \sin{z} = z - \frac{z^3}{3!} + \frac{z^5}{5!} - \frac{z^7}{7!} + \cdots = \sum_{n=0}^{\infty} \frac{(-1)^n}{(2n+1)!}z^{2n+1}, |z| < \infty, $$

$$ \cos{z} = z - \frac{z^2}{2!} + \frac{z^4}{4!} - \frac{z^6}{6!} + \cdots = \sum_{n=0}^{\infty} \frac{(-1)^n}{(2n)!}z^{2n}, |z| < \infty, $$

$$ \frac{1}{1 - z} = 1 + z + z^2 + z^3 + \cdots = \sum_{n = 0}^{\infty} z^n, |z| < 1. $$
