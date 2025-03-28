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

## Divided Differences

If $P_n(x)$ is the $nth$ interpolating polynomial that agrees with $f$ at $n+1$ points, it is unique, but it be written in multiple forms. An alternative form that uses divided differences of $f$ with respect to samples at $x_0, x_1, \dots, x_n$ are used to express $P_n(x)$ in the form

$$ P_n(x) = a_0 + a_1(x - x_0) + a_2(x - x_0)(x - x_1) + \cdots + a_n (x - x_0) \cdots (x - x_{n-1}), $$

for appropriate constants $a_0, a_1, \dots, a_n.$

To get a sense for how we find the constants, note that when $x = x_0,$ we want $P_n(x) = f(x_0),$ and that since all terms in $P_n(x)$, other than $a_0$, have $x-x_0$ in them and will thus be 0 at $x_0$, $a_0$ must be $f(x_0).$

Similarly, at $x = x_1$, all terms other than the first two will be 0, so we have

$$ P_n(x_1) = f(x_1) = a_0 + a_1(x_1 - x_0). $$

Substituting $a_0 = f(x_0)$ and then solving for $a_1$ gives $a_1 = \frac{f(x_1) - f(x_0)}{x_1 - x_0}.$

This process can be repeated to find more constants, but there is a simpler way.

Now for some new notation. We say that the **zeroth divided difference** of $f$ with respect to $x_i,$ denoted as $f[x_i],$ is just the value of $f$ at $x_i:$

$$ f[x_i] = f(x_i). $$

Remaining divided differences are defined recursively; the **first divided difference** of $f$ with respect to $x_i$ and $x_{i+1}$ is denoted $f[x_i, x_{i+1}]$ and defined as

$$ f[x_i, x_{i+1}] = \frac{f[x_{i+1}] - f[x_i]}{x_{i+1} - x_i}. $$

The **second divided difference** is then

$$ f[x_i, x_{i+1}, x_{i+2}] = \frac{f[x_{i+1}, x_{i+2}] - f[x_i, x_{i+1}]}{x_{i+2} - x_i}. $$

In general, the **kth divided difference** is

$$ f[x_i, x_{i+1}, x_{i+2}, \dots, x_{i+k}] = \frac{f[x_{i+1}, x_{i+2}, \dots, x_{i+k}] - f[x_i, x_{i+1}, \dots x_{i+k-1}]}{x_{i+k} - x_i}, $$

and finally we get the **nth divided difference**

$$ f[x_0, x_1, \dots, x_n] = \frac{f[x_1, x_2, \dots, x_n] - f[x_0, x_1, \dots, x_{n-1}]}{x_n - x_0}. $$

This means that $a_0 = f[x_0],$ $a_1 = f[x_0, x_1],$ and in general

$$ a_k = f[x_0, x_1, \cdots, x_k], $$

for each $k = 0, 1, \dots, n.$ Now, we can rewrite $P_n(x)$ as **Newton's Divided Difference:**

$$ P_n(x) = f[x_0] + \sum_{k=1}^{n} f[x_0, x_1, \dots, x_k](x - x_0)\cdots(x - x_{k-1}). $$

One important fact is that the value of $f[x_0, x_1, \dots, x_k]$ is independent of the order of the numbers $x_0, x_1, \dots, x_k.$ That means we can add a sample point in the middle of others and calculate the additional term in order to improve the accuracy of the interpolation.

Here's psuedocode:

```
float[] newtonsDividedDifference(float xs, float ys) {
    assert(len(xs) = len(ys));

    int n = len(xs) - 1;

    float F[n+1][n+1];
    float as[n+1];

    for (int i = 0; i <= n; i++) {
        F[i][0] = ys[i];
    }

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            //F[i][j] = f[x_{i - j}, ..., x_i]
            F[i][j] = (F[i][j-1] - F[i - 1][j - 1])/(xs[i] - xs[i - j]);
            if (i == j) {
                as[i][i] = F[i][i];
            }
        }
    }

    return as;
}
```