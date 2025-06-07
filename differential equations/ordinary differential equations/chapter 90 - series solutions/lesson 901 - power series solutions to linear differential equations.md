---
layout: page
redirect_from:
- ode/chapter 90 - series solutions/lesson 901 - power series solutions to linear
  differential equations
- ode/chapter 90 - series solutions/lesson 901 - power series solutions to linear
  differential equatons
title: Power Series Solutions to Linear Differential Equations
---

# Power Series Solutions to Linear Differential Equations

It may be helpful to review [shifting the summation index](/mathnotes/real%20analysis/summation) before proceeding. 

We'll also use the following theorem about power series vanishing on an interval: If $\sum_{n=0}^{\infty}{a_0(x-x_0)^n} = 0$ for all $x$ in some open interval, then each coefficient $a_n$ equals zero.

I'll proceed with an example (from Nagle, Section 8.3).

Let's find a power series solution about x = 0 to

$$ y' + 2xy = 0. \tag{a} $$

The coefficient of $y$ here is $2x$, which is analytic everywhere, so $x = 0$ is an ordinary point of equation (a). So, we should expect to find a power series solution of the form:

$$ y(x) = a_0 + a_1 x + a_2 x^2 + \cdots = \sum_{n=0}^{\infty} a_n x^n. \tag{b} $$

We simply need to find the unknown coefficients $a_n$.

We can differentiate (4) to find the expansion of $y'(x)$:

$$ y'(x) = 0 + a_1 + 2a_2 x + 3a_3x^2 + \cdots = \sum_{n=0}^{\infty} n a_n x^{n-1}. \tag{c} $$

Substituting in these series for $y$ and $y'$ into (a) gives:

$$ \sum_{n=0}^{\infty} n a_n x^{n-1} + 2x \sum_{n=0}^{\infty} a_n x^n = 0 \tag{d} $$

which simplifies to

$$ \sum_{n=0}^{\infty} n a_n x^{n-1} + \sum_{n=0}^{\infty} 2 a_n x^{n+1} = 0 \tag{e} $$

We could expand these out for a few terms and solve for the coefficients from here to get the first few terms of the power series solution, but we'll proceed with finding a formula for the general term of the power series solution.

Using summation index shifting techniques, we can combine the series from (e) to get:


$$ a_1 + \sum_{k=1}^{\infty}{ \left [ (k+1)a_{k+1} + 2a_{k-1} \right ] x^k} = 0 \tag{f} $$

Matching coefficients on the left and right, it's clear that $a_1 = 0$, and that for all $k \geq 1$

$$ (k+1)a_{k+1} + 2a_{k-1} = 0. \tag{g} $$

Here, (g) is a recurrence relation that we can use to determine $a_{k+1} in terms of $a_{k-1}$, that is

$$ a_{k+1} = - \frac{2}{k+1}a_{k-1}. $$

Now, to find $a_2$ we set $k=1$ and get

$$ a_2 = - \frac{2}{2}a_0 = -a_0. $$

and for $k=2$

$$ a_3 = - \frac{2}{3}a_1 = 0 $$

and for $k=3$

$$ a_4 = -\frac{2}{4}a_2 = \frac{1}{2}a_0 $$

and for $k=4$:

$$ a_5 = -\frac{2}{5}a_3 = 0 $$

and so on.

If we continue this and inspect the pattern that arises we see that

$$ a_{2n} = \frac{(-1)^n}{n!} a_0, \quad n = 1,2,... $$

$$ a_{2n+1} = 0 , \quad n = 0,1,2,... $$

and when we substitute this back into (b) we get


$$ a_0 \sum_{n=0}^{\infty} \frac{(-1)^n}{n!}x^{2n}. $$

Since $a_0$ is left undetermined as an arbitrary constant, this is a general solution to equation (a).

Also note that the radius of convergence is infinite, and that it converges to

$$ y(x) = a_0 e^{-x^2}. $$

## Existince of Analytic Solutions

Given the equation

$$ y''(x) + p(x)y'(x) +q(x)y(x) = 0, \tag{1} $$

Suppose $x_0$ is an ordinary point for equation (1). Then (1) has two linearly independent analytic solutions of the form

$$ y(x) = \sum_{n=0}^{\infty} a_n (x-x_0)^n. \tag{2} $$

Moreover, the radius of convergance of any power series solution of the form given by (2) is at least as large as the distance from $x_0$ to the nearest singular point (real or complex-valued) of equation (1).

## Translation

It's generally a lot easier to compute with series that are centered at $x_0=0$ than at other points. We can make a substitution by saying $x_0 = a, t_0 = 0, x = t + a$. Then, we can follow the procedure outlined above, and in the final series, we can replace $t$ with $t = x - a$.
