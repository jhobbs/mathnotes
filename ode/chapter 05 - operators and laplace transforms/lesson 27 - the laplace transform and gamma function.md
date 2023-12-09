---
layout: page
title: The Laplace Transform. Gamma Function.
---

# The Laplace Transform. Gamma Function.

## Definition of the Laplace Transform

**Definition 27.13** Let $f(x)$ be defined on the interval $I: 0 \leq x \lt \infty$. Then the **Laplace Transform of** $f(x)$ is defined by

$$ \tag{27.14} L[f(x)] = F(s) = \int_0^{\infty} e^{-sx}f(x)dx $$

where it is assumed that $f(x)$ is a functon for which the integral on the right exists for some value of $s$.

## Properties of the Laplace Transform

The Laplace transform is a linear operator. That is, if $L[f_1 (x)]$ converges for $s > s_1$ and $L[f_2 (x)]$ converges for $s > s_2$, then for $s$ greater than the larger of $s1$ and $s_2$:

$$ \tag{27.17} L[c_1 f_1 + c_2 f_2] = c_1 L[f_1] + c_2 L[f_2] $$

**Definition 27.18** If $F$ is the Laplace transform of a *continuous* function $f$, i.e. if:

$$ L[f] = F $$

then the **inverse Laplace transform** of $F$, written as $L^{-1}[F]$ is $f$, i.e.:

$$ L^{-1}[F] = f $$

The inverse Laplace transform is also a linear operator.

**Theorem 27.6**

If

$$ \tag{27.61} F(s) = L[f(x)] = \int_0^{\infty} e^{-sx}f(x)dx, s > s_0 $$

then

$$ \tag{27.62} F'(s) = -L[xf(x)] = - \int_0^{\infty} e^{-sx}xf(x)dx, s > s_0 $$

$$  F''(s) = L[x^2 f(x)] = \int_0^{\infty} e^{-sx}x^2 f(x)dx, s > s_0 $$

$$ F^{(n)}(s) = L[x^n f(x)] = (-1)^n \int_0^{\infty} e^{-sx}x^n f(x)dx, s > s_0 $$


That is, if $F(s) = L[f(x)]$, then one can find the Laplace transform of $xf(x)$ by differentiating $-F(s);$ of $x^2 f(x)$ by differentiating $F(s)$ twice, etc.


## Table of Laplace Transforms

See Paul's notes for an excellent [Table of Laplace Transforms](https://tutorial.math.lamar.edu/classes/de/laplace_table.aspx)
