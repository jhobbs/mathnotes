---
layout: page
title: Root Approximation
---

# Root Approximation

Sometimes we want to find approximate roots or an equation $f(x) = 0$ of a function $f$ that are difficult or impossible to solve analytically.

## Bisection Method

Let's say $f$ is a continuous function on the interval $[a, b]$ and that $f(a)$ and $f(b)$ have opposite sign. Then the Intermediate Value Theorem implies there is some $p \in (a,b)$ for which $f(p) = 0.$ We can approximate this $p$ by repeatedly halving subintervals of $(a,b)$ containing $p.$ More iterations will lead to an approximation with less error.

Here's an algorithm for performing this.

```
// a and b are the initial interval bounds; TOL is the error tolerance, and N_0 is
// maximum iterations to perform.
// returns an x value within TOL of a root or raises an exception on failure
float findRoot(float a, float b, float TOL, int N_0, function f) {
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








