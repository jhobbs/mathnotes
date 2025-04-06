---
layout: page
title: Numerical Integration
---

# Numerical Integration

## Elementary Numerical Integration

The basic method for approximating $\int_a^{b} f(x) dx$ is called **numerical quadrature** and uses the sum $\sum_{i=0}^n a_i f(x_i).$

We'll cover quadature methods based on interpolation polynomials. The idea is to select a set of distinct nodes $\\{x_0, \dots, x_n\\}$ from the interval $[a, b],$ use them to construct a Lagrange interpolating polynomial and its error term, and then integrate those over $[a,b].$

When we use equally spaced nodes, the approximations produced from first and second Lagrange polynomials are known as the **Trapezoidal rule** and **Simpson's rule.** These are commonly introduced in calculus courses.

The Trapezoidal rule is

$$ \int_a^b f(x) dx = \frac{h}{2}(f(x_0) + f(x_1)) - \frac{h^3}{12}f''(\xi), $$

where $x_0 = a, x_1 = b, h = b - a,$ and $\xi$ is some value in $(x_0, x_1).$

Simpson's rule uses three points and is

$$ \int_{x_0}^{x_1} f(x) dx = \frac{h}{3}(f(x_0) + 4 f(x_1) + f(x_2)) - \frac{h^5}{90}f^{(4)}(\xi), $$

where $x_0 = a, x_2 = b, x_1 = a + h, h = (b - a)/2,$ and $\xi$ is some value in $(x_0, x_2).$

In general, integrating Lagrange interpolating polynomials and there error terms give us **Newton-Cotes** formulas; the Trapezoidal rule and Simpson's rule are the first two examples of these.

## Composite Numerical Integration

Newton-Cotes formulas don't work well on large intervals, because it requires high-degree formulas, which are difficult to derive, and the required interpolating polynomials can oscillate wildly.

A piecewise approach using low-order Newton-Cotes formulas is more often applied. We can break an interval $[a, b]$ down into $n$ subintervals, and then apply a Newton-Cotes formula across subintervals. This leads to an approximation with a much lower error.

For example, the **Composite Simpson's rule** breaks an interval down into $n$ subintervals for some even $n,$ applies Simpson's rule on each consecutive pair of subintervals, and then sums the results.


*Theorem:* Let $f \in C^4[a,b], n$ be even, $h = (b - a)/n,$ and $x_j = a + jh,$ for each $j = 0, 1, \dots, n.$ There exists a $\mu \in (a, b)$ for which the Composite Simpson's rule for $n$ subintervals can be written with its error term as

$$ \int_a^{b} f(x) dx = \frac{h}{3} \left [ f(a) + 2 \sum_{j=1}^{(n/2) - 1} f(x_{2j}) + 4 \sum_{j=1}^{n/2} f(x_{2j -1}) + f(b) \right ]  - \frac{b - a}{180}h^4 f^{(4)}(\mu). $$

Here's psuedocode that uses the Composite Simpson's rule on $n$ subintervals. This is the most frequently used general-purpose quadrature algorithm.

```
float compositeSimpsons(float a, float b, int n, function f) {
    assert(b > a);
    assert(n > 0 && n % 2 == 0);

    float h = (b - a) / n;

    float XI0 = f(a) + f(b);
    float XI1 = 0;
    float XI2 = 0;

    for (int i = 1; i <= n - 1; i++) {
        float X = a + i * h;

        if (i % 2 == 0) {
            XI2 += f(X);
        } else {
            XI1 += f(x)
        }
    }

    return h * (XI0 + 2 * XI2 + 4 * XI1) / 3;
}
```

We can use this approach for other Newton-Cotes formulas. The Trapezoidal rule requires only one interval for each application, so we can use either odd or even $n.$

*Theorem:* Let $f \in C^2[a,b], h = (b - a)/n,$ and $x_j = a + jh$ for each $j = 0, 1, \dots n.$ There exists a $\mu \in (a,b)$ for which the **Composite Trapezoidal rule** for $n$ subintervals can be written with its error term as

$$ \int_a^{b} f(x) dx = \frac{h}{2} \left [ f(a) + 2 \sum_{j=1}^{n-1} f(x_j) + f(b) \right ] - \frac{b - a}{12} h^2 f''(\mu). $$

For the **Composite Midpoint Rule** we again require even $n$.

*Theorem:* Let $f \in C^2[a, b],$ $n$ be even, $h = (b - a)/(n + 2)$ and $x_j = a + (j + 1)h$ for each $j = -1, 0, \dots, n+1.$ There exists a $\mu \in (a, b)$ for which the Composite Midpoint rule for $n+2$ subintervals can be written with its error term as

$$ \int_a^{b} f(x) dx = 2h \sum_{j=0}^{n/2} f(x_{2j}) + \frac{b - a}{6}h^2 f''(\mu). $$