---
layout: page
title: Interpolation and Polynomial Approximation
---

# Interpolation and Polynomial Approximation

The set of **algebraic polynomials,** which are functions of the form

$$ P_n(x) = a_n x^n + a_{n-1}x^{n-1} + \cdots + a_1 x + a_0, $$

where $n$ is a nonnegative integer and $a_0,\dots,a_n$ are real constants, are extremely useful for approximating functions.

*Weierstrass Approximation Theorem:* Suppose $f$ is defined and continuous on $[a,b].$ For each $\epsilon > 0,$ there exists a polynomial $P(x),$ with the property that


$$ |f(x) - P(x)| < \epsilon, \forall x \in [a,b]. $$ 

In other words, for any continuous function, there is a polynomial that approximates the function as closely as desired.

Morever, it's trivial to differentiate and integrate polynomials, making them very amenable to calculus based analysis.

Taylor polynomials are one type of approximating polynomial, but because they concentrate all of their information near a point, they generally only approximate the function well near the point. Here, we'll investigate other types of polynomials that are more useful for approximating functions along an entire continuous interval by incorporating information from multiple points in the interval.

## Lagrange Interpolating Polynomials

If we have two points, $(x_0, y_0)$ and $(x_1, y_1),$ we can make a linear polynomial that passes through both points, and use it to approximate a function $f(x)$ for which $f(x_0) = y_0$ and $f(x_1) = y_1.$ We call this an **interpolating polynomial** because it agrees with the values of $f$ at the given points. We can use this polynomial for approximating $f$ within the interval $[x_0, x_1]$ and we call this process **polynomial interpolation.**

If we define the functions

$$ L_0(x) = \frac{x - x_1}{x_0 - x_1}, \quad L_1(x) = \frac{x - x_0}{x_1 - x_0}, $$

then **linear Lagrange interpolating polynomial** through $(x_0, y_0)$ and $(x_1, y_1)$ is

$$ P(x) = L_0(x)f(x_0) + L_1(x)f(x_1) = \frac{x - x_1}{x_0 - x_1}f(x_0) + \frac{x - x_0}{x_1 - x_0}f(x_1). $$

Note that

$$ L_0(x_0) = 1, \quad L_0(x_1) = 0, \quad L_1(x_0) = 0, \quad L_1(x_1) = 1, $$

which implies that

$$ P(x_0) = 1 \cdot f(x_0) + 0 \cdot f(x_1) = f(x_0) = y_0, $$

and

$$ P(x_0) = 0 \cdot f(x_0) + 1 \cdot f(x_1) = f(x_1) = y_1. $$

Thus, $P$ is the unique polynomial of degree at most one that passes through both $(x_0, y_0)$ and $(x_1, y_1).$

The functions $L_0(x)$ and $L_1(x)$ are called basis functions and serve to localize the influence of the values at the sample points. $L_0(x)$ is 1 when at $x_0$ and 0 when at $x_1$ (and the opposite is true for $L_1(x)$,) ensuring that only $f(x_0)$ contributes to the function's value at $x_0$ and only $f(x_1)$ contributes to the function's value at $x_1,$ so that the polynomial agrees with $f(x)$ at those points.

The numerator of $L_0(x)$ will be $x_0 - x_1$ when $x = x_0$, and since we want its value to be $1$ there, we must make its denominator $x_0 - x_1$.

We can generalize this concept to work for more than two points. To approximate a function given $n + 1$ sample points, we can construct a polynomial that passes through

$$ (x_0, f(x_0)), (x_1, f(x_1)), \dots, (x_n, f(x_n)). $$

To do so, for each $k = 0..n$ we construct a function $L_{n,k}(x)$ such that $L_{n,k}(x_i) = 0$ when $i \neq k$ and $L_{n,k}{x_k} = 1.$ To make $L_{n,k}(x_i) = 0$ for $i \neq k,$ we need the numerator to contain

$$ (x - x_0)(x - x_1)\cdots(x - x_{k-1})(x - x_{k+1})\cdots(x - x_n). $$

To normalize the function so that $L_{n, k}(x_k) = 1$, the denominator must contian the same term but evaluated at $x_k,$ so we have

$$ L_{n, k}(x) = \frac{(x - x_0)(x - x_1)\cdots(x - x_{k-1})(x - x_{k+1})\cdots(x - x_n)}{(x_k - x_0)(x_k - x_1)\cdots(x_k - x_{k-1})(x_k - x_{k+1})\cdots(x_k - x_n)}. $$

Now that we've described how to construct the basis functions, we can define the **nth Lagrange interpolating polynomial** with the following theorem.

*Theorem:* If $x_0, x_1, \dots, x_n$ are $n+1$ distinct numbers and $f$ is a function whose values are given at these numbers, then a unique polynomial $P(x)$ of degree at most $n$ exists with

$$ f(x_k) = P(x_k), \forall k = 0, 1,\dots,n. $$

This polynomial is given by

$$ P(x) = f(x_0)L_{n,0}(x) + \cdots + f(x_n)L_{n,n}(x) = \sum_{k=0}^{n} f(x_k)L_{n,k}(x), $$

where, for each $k = 0, 1, \dots, n,$

$$ \begin{aligned} L_{n, k}(x) & = \frac{(x - x_0)(x - x_1)\cdots(x - x_{k-1})(x - x_{k+1})\cdots(x - x_n)}{(x_k - x_0)(x_k - x_1)\cdots(x_k - x_{k-1})(x_k - x_{k+1})\cdots(x_k - x_n)} \\
& = \prod_{i = 0, i \neq k}^{n} \frac{x - x_i}{x_k - x_i}. \end{aligned}  $$

Sometimes we will write just $L_k(x)$ instead of $L_{n,k}(x)$ when the value of $n$ is clear.
