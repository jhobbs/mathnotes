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


## Solution by Means of a Laplace Transform

Given a linear equation:

$$ \tag{27.2} a_n y^{(n)} + \cdots + a_1 y' + a_0y $$

where $ a_n \neq 0$ and $a_0, a_1, \cdots, a_n$ are constants, we can use the **Laplace tranform method** to find a particular solution *satisfying given initial conditions*.


**Method 1**

If we take the Laplace transform of both sides of $(27.2)$ (see book for proof) we end up with:

$$ \tag{27.41} \begin{aligned} (a_n s^n + a_{n-1}s^{n-1} \cdots a_2 s^2 + a_1 s + a_0)L[y] \\ - (a_n s^{n-1} + a_{n-1}s^{n-2} + \cdots + a_2 s + a_1)y(0) \\ - (a_n s^{n-2} + a_{n-1}s^{n-3} + \cdots + a_3 s + a_2)y'(0) \\ \cdots \cdots \cdots \cdots \cdots \cdots \cdots \cdots \\ -(a_n s + a_{n-1})y^{(n-2)}(0) \\ - a_n y^{(n-1)}(0)  = L[f(x)]\end{aligned} $$

Evaluating this gives an equation of the form $L[y] = G(s)$. We can then use a table of Laplace Transforms to find a function who's Laplace transform is similar to $G(s)$, i.e., that can be obtained by some simple transformation to $G(s)$.

