---
layout: page
title: Numerical Integration
description: Quadrature methods including trapezoidal and Simpson's rules, composite integration techniques, and Gaussian quadrature using optimal node selection.
redirect_from:
  - numerical-analysis/numerical-integration
---

# Numerical Integration

## Elementary Numerical Integration

The basic method for approximating $\int_a^{b} f(x) dx$ is called **numerical quadrature** and uses the sum $\sum_{i=0}^n a_i f(x_i).$

We'll cover quadrature methods based on interpolation polynomials. The idea is to select a set of distinct nodes $\{x_0, \dots, x_n\}$ from the interval $[a, b],$ use them to construct a Lagrange interpolating polynomial and its error term, and then integrate those over $[a,b].$

When we use equally spaced nodes, the approximations produced from first and second Lagrange polynomials are known as the **Trapezoidal rule** and **Simpson's rule.** These are commonly introduced in calculus courses.

The Trapezoidal rule is

$$ \int_a^b f(x) dx = \frac{h}{2}(f(x_0) + f(x_1)) - \frac{h^3}{12}f''(\xi), $$

where $x_0 = a, x_1 = b, h = b - a,$ and $\xi$ is some value in $(x_0, x_1).$

Simpson's rule uses three points and is

$$ \int_{a}^{b} f(x) dx = \frac{h}{3}(f(x_0) + 4 f(x_1) + f(x_2)) - \frac{h^5}{90}f^{(4)}(\xi), $$

where $x_0 = a, x_2 = b, x_1 = a + h, h = (b - a)/2,$ and $\xi$ is some value in $(x_0, x_2).$

Perhaps simpler to read:

$$ \int_{a}^{b} f(x) dx \approx \frac{b - a}{6} \left [ f(a) + 4 f \left ( \frac{a + b}{2} \right ) + f(b) \right ] $$

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

## Gaussian Quadrature

Recall that Newton-Cotes formulas use values of the function $f$ at equally spaced points. While convenient, this can significantly reduce accuracy of the approximation.

In contrast, Gaussian quadrature picks the optimal nodes $x_1, x_2,\dots,x_n$ in $[a,b]$ and coefficients $c_1, c_2, \dots, c_n$ to minimize expected error in the approximation

$$ \int_a^{b} f(x) dx \approx \sum_{i=1}^{n} c_i f(x_i). $$

Picking these optimal nodes and coefficients allows Gaussian quadrature to be more accurate than Newton-Cotes formulas for the same number of nodes. While Newton-Cotes formulas can exactly approximate polynomials up of up to degree $n,$ Gaussian quadrature can exactly approximatie polynomials of up to degree $2n - 1.$ This is achievable because the coefficients $c_i$ are arbitrary and the nodes $x_i$ are restricted only in being within $[a,b],$ so we get $2n$ parameters to choose, and the class of polynomials of degree at most $2n-1$ also contains $2n$ parameters, so properly picking $2n$ parameters allows us to exactly approximate any of those polynomials.

For example, let's say we want to determine $c_1, c_2, x_1,$ and $x_2$ so that

$$ \int_{-1}^{1} f(x) dx = \approx c_1 f(x_1) + c_2 f(x_2) $$

gives the exact result whenver $f(x)$ is a polynomial of degree 3 or less, that is, when

$$ f(x) = a_0 + a_1x + a_2x^2 + a_3x^3 $$

for some constants $a_i.$

Now,

$$ \int (a_0 + a_1x + a_2x^2 + a_3x^3) dx  = a_0 \int 1 dx + a_1 \int x dx + a_2 \int x^2 dx + a_3 \int x^3 dx, $$

so we neeed a formula that gives exact results when $f(x)$ is $1, x, x^2,$ and $x^3.$ That us, we need $c_1, c_2, x_1, x_2$ such that

$$ c_1 \cdot 1 + c_2 \cdot 1 = \int_{-1}^1 1 dx = 2, \quad c_1 \cdot x_1 + c_2 \cdot x_2 = \int_{-1}^{1} x dx = 0, $$

$$ c_1 \cdot {x_1}^2 + c_2 \cdot {x_2}^2 = \int_{-1}^1 x^2 dx = \frac{2}{3}, \quad c_1 \cdot {x_1}^3 + c_2 \cdot {x_2}^3 = \int_{-1}^{1} x^3 dx = 0.$$

(Note that the RHS values $2, 0, 2/3,$ and $0$ in these equations are just the values of the preceding definite integrals.)

Now we have a system of $4$ unknowns an $4$ equations which we can solve to find

$$ c_1 = 1, c_2 = 1, x_1 = -\frac{\sqrt{3}}{3}, x_2 = \frac{\sqrt{3}}{3}. $$

This gives the approximation formula

$$ \int_{-1}^{1} f(x) dx \approx f(\frac{-\sqrt{3}}{3}) + f(\frac{\sqrt{3}}{3}), $$

which as degree of precision three, meaining it produces the exact result for every polynomial of degree three or less. This is pretty amazing.

### Legendre Polynomials

There is an easier way to determine the nodes and coefficients for the formulas that give exact results for higher-degree polynomials.

We will use a collection of orthogonal polynomials called the **Legendre Polynomials,** denoted here as $\{P_0(x), P_1(x), \dots, P_n(x)\}$ and having the properties

1. For each $n$, $P_n(x)$ is a monic polynomial of degree $n.$

2. $\int_{-1}^{1}P(x)P_n(x)dx = 0$ whenever $P(x)$ is a polynomial of degree less than $n.$

Note that these polynomials form an orthogonal basis for the monic polynomials over the interval $[-1, 1].$

The roots of these polynomials are distinct, lie in $(-1, 1),$ are symmetric with respect to the origin, and are the correct choice for determining the parameters that give us the nodes and coefficients for Gaussian quadrature.

The proof and reasoning are excluded here, but the procedure, using a the roots $r_{n,i}$ of the Legendre polynomials and associated coefficients $c_{n,i}$ (which are widely available in tables) is to approximate with precision $n$ as 

$$ \int_{-1}^{1} f(x) dx \approx \sum_{i=1}^n c_{n, i} f(r_{n, i}). $$

### Gaussian Quadrature on Arbitrary Intervals

This is all well and good if the interval in question is $[-1, 1],$ but what if it isn't?

We can take advantage of the fact that $\int_{a}^{b}f(x) dx$ over an arbitrary interval $[a,b]$ can be transformed into an integral over $[-1, 1]$ by using a change of variable:

$$ t = \frac{2x - a - b}{b - a} \iff x = \frac{1}{2}[(b - a)t + a + b]. $$

Thus,

