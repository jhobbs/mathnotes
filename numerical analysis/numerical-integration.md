---
layout: page
title: Numerical Integration
---

# Numerical Integration

The basic method for approximating $\int_a^{b} f(x) dx$ is called **numerical quadrature** and uses the sum $\sum_{i=0}^n a_i f(x_i).$

We'll cover quadature methods based on interpolation polynomials. The idea is to select a set of distinct nodes $\\{x_0, \dots, x_n\\}$ from the interval $[a, b],$ use them to construct a Lagrange interpolating polynomial and its error term, and then integrate those over $[a,b].$

When we use equally spaced nodes, the approximations produced from first and second Lagrange polynomials are known as the **Trapezoidal rule** and **Simpson's rule.** These are commonly introduced in calculus courses.

The Trapezoidal rule is

$$ \int_a^b f(x) dx = \frac{h}{2}(f(x_0) + f(x_1)) - \frac{h^3}{12}f''(\xi), $$

where $x_0 = a, x_1 = b, h = b - a,$ and $\xi$ is some value in $(x_0, x_1).$

Simpson's rule uses three points and is

$$ \int_{x_0}^{x_1} f(x) dx = \frac{h}{3}(f(x_0) + 4 f(x_1) + f(x_2)) - \frac{h^5}{90}f^{(4)}(\xi), $$

where $x_0 = a, x_2 = b, x_1 = a + h, h = (b - a)/2,$ and $\xi$ is some value in $(x_0, x_2).$

