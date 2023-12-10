---
layout: page
title: The Laplace Transform. Gamma Function.
---

# The Laplace Transform. Gamma Function.

## Definition of the Laplace Transform

**Definition 27.13** Let $f(x)$ be defined on the interval $I: 0 \leq x \lt \infty$. Then the **Laplace Transform of** $f(x)$, written as $L[f(x)]$, is defined as

$$ \tag{27.14} L[f(x)] = F(s) = \int_0^{\infty} e^{-sx}f(x)dx $$

where it is assumed that $f(x)$ is a function for which the integral on the right exists for some value of $s$.

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

$$ \tag{27.2} a_n y^{(n)} + \cdots + a_1 y' + a_0y = f(x)$$

where $ a_n \neq 0$ and $a_0, a_1, \cdots, a_n$ are constants, we can use the **Laplace transform method** to find a particular solution *satisfying given initial conditions*. This is what makes the Laplace transform method useful in compared to the other methods we've studied for solving linear differential equations.


**Method 1**

If we take the Laplace transform of both sides of $(27.2)$ (see book for proof) we end up with:

$$ \tag{27.41} \begin{aligned} (a_n s^n + a_{n-1}s^{n-1} \cdots a_2 s^2 + a_1 s + a_0)L[y] \\ - (a_n s^{n-1} + a_{n-1}s^{n-2} + \cdots + a_2 s + a_1)y(0) \\ - (a_n s^{n-2} + a_{n-1}s^{n-3} + \cdots + a_3 s + a_2)y'(0) \\ \cdots \cdots \cdots \cdots \cdots \cdots \cdots \cdots \\ -(a_n s + a_{n-1})y^{(n-2)}(0) \\ - a_n y^{(n-1)}(0)  = L[f(x)]\end{aligned} $$

Evaluating this gives an equation of the form $L[y] = G(s)$. We can then use a table of Laplace Transforms to find a function who's Laplace transform is similar to $G(s)$, i.e., that can be obtained by some transformation to $G(s)$. Often these transformations involve spliting and rearranging fractions.

**Method 2**

Here's a useful fact (see $(27.3)$ in book for proof sketch):

$$ \tag{a} L[y^{(n)}] = s^n L[y] - (y^{(n-1)}(0) + sy^{(n-2)}(0) + \cdots + s^{n-2}y'(0) + s^{n-1} y(0)) $$

We'll use this fact to show this second method this by example.

Given $y' + 2y = 0, ~y(0) = 2$, we can take the Laplace transform of both sides and use its linearity to get:

$$ \tag{b} L[y' + 2y] = L[y'] + 2L[y] = L[0] $$

Using $(a)$ we can rewrite this as:

$$ \tag{c} sL[y] - y(0) + 2L[y] = (s+2)L[y] - 2, \quad L[y] = \frac{2}{s+2} $$

we can see from a table of Laplace transforms that $L[y] = \frac{2}{s+2} = 2e^{-2x}$

## Gamma Function

The Gamma function, written as $\Gamma (k)$ is useful here because it lets us expand some Laplace transforms involving factorials of integers into transforms that involve factorials of non-integers.

Its definition is:

$$ \Gamma (k) = \int_0^{\infty} x^{k-1} e^{-x} dx,~k > 0 $$

A few properties that are useful:

$$ \Gamma (k) = \frac{1}{k}\Gamma(k + 1), k > 0 $$


$$ \Gamma(k + 1) = k \Gamma(k) $$

We can use these properties along with a [table of Gamma function values](https://en.wikipedia.org/wiki/Particular_values_of_the_gamma_function) to find other values of Gamma quickly.

Gamma is related to factorial this way, for positive $n$:

$$ \Gamma(n + 1) = n! $$

i.e. $\Gamma(\frac{7}{2}) = (\frac{5}{2})! $
