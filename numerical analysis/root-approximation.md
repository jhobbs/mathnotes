---
layout: page
title: Root Approximation
description: Iterative algorithms including bisection method and Newton's method for finding approximate solutions to equations of the form f(x) = 0.
---

# Root Approximation

Sometimes we want to find approximate roots or an equation $f(x) = 0$ of a function $f$ that are difficult or impossible to solve analytically.

## Bisection Method

Let's say $f$ is a continuous function on the interval $[a, b]$ and that $f(a)$ and $f(b)$ have opposite sign. Then the Intermediate Value Theorem implies there is some $p \in (a,b)$ for which $f(p) = 0.$ We can approximate this $p$ by repeatedly halving subintervals of $(a,b)$ containing $p.$ More iterations will lead to an approximation with less error.

*Theorem:* Suppose that $f \in C[a, b]$ and $f(a) \cdot f(b) < 0.$ The Bisection Method generates a sequence $\{p_n\}_{n=1}^{\infty}$ approximating a zero $p$ of $f$ with

$$ |p_n - p| \leq \frac{b - a}{2^n}, n \geq 1. $$

Here's an algorithm for performing this.

```
// a and b are the initial interval bounds; TOL is the error tolerance, and N_0 is
// maximum iterations to perform.
// returns an x value within TOL of a root or raises an exception on failure
float approximateRootByBisection(float a, float b, float TOL, int N_0, function f) {
    float a1 = a;
    float b1 = b;
    int i = 1;

    float FA = f(a1);

    while(i <= N_0) {
        //p is the midpoint of the current subinterval
        float p = a1 + (b1 - a1) / 2;
        float FP = f(p);
        if (FP == 0 || (b1 - a1) / 2 < TOL)
            return p;
        i = i + 1;
        if (FA * FP > 0) {
            //FP has the same sign as FA; the zero is in the second half of the interval
            a1 = p;
            FA = FP;
        } else {
            //FP has the same sign as FB; the zero is in the first half of the interval
            b1 = p;
        }
    }

    raise("Exhausted iterations without being within {TOL} of root.")
}

```

The bisection method has some limitations:

* Slow convergence (linear rate - error approximately halves each iteration).
* Requires a valid initial interval (bracket)
* Limited to simple, single roots
* Ignores derivative and curvature information
* Can be computationally expensive for high accuracy
* Limited dimensional applicability (single-variable functions)

## Newton's Method

Newton's method can be derived using a Taylor polynomial. Consider $f \in C^2[a,b].$ Let $p_0 \in [a,b]$ be an approximation of $p$ such that $f'(p_0) \neq 0$ and $\|p - p_0\|$ is "small."

If we take the first Taylor Polynomial of $f(x)$ expanded about $p_0$ and evaluated at $x = p$ we get

$$ f(p) = 0 = f(p_0) + (p - p_0)f'(p_0) + \frac{(p - p_0)^2}{2}f''(\xi(p)) $$

where $\xi(p)$ lies between $p$ and $p_0.$ Since we assume $\|p - p_0\|$ is small, we can assume the $(p - p_0)^2$ term is much smaller and discard it to get

$$ 0 \approx f(p_0) + (p - p_0)f'(p_0), $$

which can be solved for $p$ to get

$$ p \approx p_0 - \frac{f(p_0)}{f'(p_0)} \equiv p_1. $$

Repeating this process is Newton's method, which generates the sequence $\{p_n\}_{n=0}^{\infty}$ by

$$ p_n = p_{n-1} - \frac{f(p_{n-1})}{f'(p_{n-1})},  n \geq 1. $$

*Theorem:* Let $f \in C^2[a, b].$ If $p \in (a, b)$ such that $f(p) = 0$ and $f'(p) \neq 0,$ then there exists a $\delta > 0$ such that Newton's method generates a sequence $\{p_n\}_{n=1}^{\infty}$ converging to $p$ for any initial approximation $p_0 \in [p - \delta, p + \delta].$

Here's psuedocode:

```
float approximateRootByNewtownsMethod(float p_0, float TOL, int N_0) {
    int i = 1;

    while (i <= N_0) {
        float p = p_0 - f(p_0)/f'(p_0)
        if (|p - p_0| < TOL) {
            return p;
        }

        i = i + 1;
        p_0 = p;
    }
    
    raise("Exhausted iterations without being within {TOL} of root.")
} 
```

Newton's method converges more rapidly than Bisection, but requires a good initial approximation. One approach is to use bisection to find an initial approximation, and then Newton's method to refine it.

Newton's method has some limitations:
* Requires a good initial guess.
* Requires derivative existence and ease of computation.
* Fails when derivative is zero.
* Slows down significantly for multiple roots.
* Can oscillate or diverge easily.
* Derivative computation may be costly.
* Primarily effective for smooth, well-behaved functions.