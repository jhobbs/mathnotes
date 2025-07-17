---
layout: page
title: Least Squares
description: Polynomial approximation techniques for both discrete data sets and continuous functions using least squares error minimization.
---

# Discrete Least Squares Approximation

## Polynomial Least Squares

Given $m$ data points we can find a polynomial

$$ P_n(x) = a_n x^n + a_{n-1}x^{n-1} + \cdots + a_1 x + a_0 $$

of up to degree $n < m - 1$ using the least squares procedure to minimize error.

To do so, we setup a linear system of $n+1$ normal equations to solve for the $n+1$ unknown constants. These are

$$ \sum_{k=0}^n a_k \sum_{i=1}^m x_i^{j+k} = \sum_{i=1}^m y_i x_i^j, \quad \text{for each } j = 0, 1, \dots, n. $$

This is derived from the fact that the error is

$$ E = \sum_{i=1}^m (y_i - P_n(x_i))^2. $$

The system of equations is produced to minimize $E$ by setting $0 = \frac{\partial E}{\partial a_j}$  for each $j = 0, 1,\dots,n.$

# Continuous Least Squares Approximation

If we have a function $f \in C[a,b],$ we can use a similar method to approximate it with a polynomial of degree $n.$ This time, our $(n+1)$ normal equations are, for each $j = 0, 1, \dots, n,$

$$ \sum_{k=0}^{n} a_k \int_{a}^{b} x^{j+k} dx = \int_{a}^{b} x^j f(x) dx. $$