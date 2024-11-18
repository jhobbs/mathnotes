---
layout: page
title: Fourier Series
---

# Review

**Periodic Functions**: A function is **periodic of period** $T$ if $f(x + T) = f(x)$ for all $x$ in the domain of $f$.

**Even Functions**: A function that satisfies $f(-x) = f(x)$ for all $x$ in the domain of $f$ has a graph that is symmetric with respect to the $y$-axis. We say such a function is **even**. The functions $1, x^2, x^4,\dots$ are examples of even functions, as is $\cos{x}$.

**Odd Functions**: A function $f$ that satisfies $f(-x) = -f(x)$ for all $x$ in the domain of $f$ has a graph that is symmetric with respect to the origin. It is said to be an **odd** function. The functions $x, x^3, x^5, \dots$ are examples of odd functions, as are $\sin{x}$ and $\tan{x}$.

Knowing these properties can be useful when evaluating indefinite integrals.


If $f$ is an even piecewise continuous function on $[-a, a]$, then

$$ \int_{-a}^{a} f(x) dx = 2 \int_0^{a} f(x) dx. $$

if $f$ is an odd piecewise continuous function on $[-a, a]$, then

$$ \int_{-a}^{a} f(x) dx = 0. $$

# Some Important Integrals

The following three integrals are crucial in Fourier series. In each, $m$ and $n$ are nonnegative integers.

The first integral:

$$ \int_{-L}^{L} \sin{\frac{m \pi x}{L}} \cos{\frac{n \pi x}{L}} dx. \tag{a} $$

We can simplify this using the trig identity for products of sines and cosines, $\sin{(a)}\cos{(b)} = \frac{1}{2}(\sin{(a - b)} + \sin{(a+b)}):$

$$ \frac{1}{2}  \int_{-L}^{L} \sin{\frac{(m-n) \pi x}{L}} + \sin{\frac{(m+n)\pi x}{L}} dx. $$

Since this is an integral from $-L$ to $L$ over an odd function, it, and thus $(a),$ always equals 0.

The second integral:

$$ \int_{-L}^{L} \sin{\frac{m \pi x}{L}} \sin{\frac{n \pi x}{L}} dx. \tag{b} $$

This time we use the trig identity $\sin{(a)}\sin{(b)} = \frac{1}{2}(\cos{(a - b)} - \cos{(a+b)}):$

$$ \frac{1}{2}  \int_{-L}^{L} \cos{\frac{(m-n) \pi x}{L}} - \cos{\frac{(m+n)\pi x}{L}} dx. \tag{b.1} $$

Here, we have to consider two cases, $m = n$ and $m \neq n$. If $m = n$, $(m-n) = 0, (m+n) = 2m$; also note that this integral is over an even function from $-L$ to $L$, so (b.1)

$$ \frac{1}{2}  \int_{-L}^{L} 1 - \cos{\frac{2m \pi x}{L}} dx = L - \left ( \frac{L\sin{\frac{2m \pi x}{L}}}{2 \pi m} \right)_0^L = L - \left ( \left (\frac{L\sin{2m \pi}}{2 \pi m} \right) - 0 \right ) = L. \tag{b.2} $$

The final $\sin$ in (b.2) is always $0$ because $\sin{2 m \pi}$ for integer $m$ is always $0$. So, when $m = n$, (b) evaluates to $L$.

When $m \neq n$, we can't simplify either $\cos$ in the integrand and end up with two $\sin$'s that are always 0, so when $m \neq n$, (b) evaluates to $0$.

The third integral:

$$ \int_{-L}^{L} \cos{\frac{m \pi x}{L}} \cos{\frac{n \pi x}{L}} dx. \tag{c} $$

This time we use the trig identity $\cos{(a)}\cos{(b)} = \frac{1}{2}(\cos{(a - b)} + \cos{(a+b)}):$

$$ \frac{1}{2}  \int_{-L}^{L} \cos{\frac{(m-n) \pi x}{L}} + \cos{\frac{(m+n)\pi x}{L}} dx. \tag{c.1} $$

Here, we need to consider 3 cases:  $m \neq n$; $m = n, m,n \neq 0$; $m = n = 0$. The first two cases work out just like (b), and when $m \neq n$ we get 0, when $m = n$ but $m$ and $n$ are non-zero we get $L$.

However, when $m = n = 0$, both $\cos$ in the integrand end up as $\cos0 = 1$, and so the integral simplifies to:

$$ \int_{-L}^{L} dx = 2L. \tag{c.2} $$

Thus, when $m = n = 0$, (c) evaluates to 2L.

The following table (from "Differential Equations and Boundary Value Problems", Nagle, et al, 2017, p574) summarizes these integrals nicely:

![Summary of important integrals](fsints.png)

