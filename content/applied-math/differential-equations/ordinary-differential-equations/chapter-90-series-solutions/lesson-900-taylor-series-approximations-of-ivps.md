---
layout: page
title: Taylor Polynomial Approximations of IVPs
---

# Taylor Polynomial Approximations of IVPs

The foruma for the Taylor polynomial of degree $n$ centered at $x_0$, approximating a function $f(x)$ possessing $n$ derivatives at $x_0$ is given by:


$$ p_n(x) = f(x_0) + f'(x_0)(x - x_0) + \frac{f''(x_0)}{2!} (x - x_0)^2 + \frac{f'''(x_0)}{3!}(x - x_0)^3 + \cdots + \frac{f^{(n)}(x_0)}{n!}(x - x_0)^n = \sum_{j=0}^n{\frac{f^{(j)}(x_0)}{j!}(x-x_0)^j }.  \tag{1} $$


Note that the terms in the series involve derivatives of $f$, and if $x_0 = 0$, they involve intial values of derivatives of $f$.


Now, given a differential equation and some initial values, we can exploit this to find a Taylor polynomial approximating the solution of the IVP.


Example:

Find the first few Taylor polynomials approximating the solution around $x_0 = 0$ of the initial value problem


$$ y'' = 3y' + x^2y; \quad y(0) = 10, \quad y'(0') = 5 $$

In order to construct

$$ p_n(x) = y(0) + y'(0)x + \frac{y''(0)}{2!}x^2 + \frac{y'''(0)}{3!}x^3 + \cdots + \frac{y^{(n)}(0)}{n!}x^n, \tag{2} $$

we need the values of $y(0)$, $y'(0)$, $y''(0)$, $y'''(0),$ etc. The first two are given in the initial conditions, and we can deduce more by using the diffrential equation and the provided initial conditions:


$$ y''(0) = 3y'(0) + 0^2y(0) = 3 \cdot 5 + 0 \cdot 10 = 15. $$

We know that y''= 3y' = x^2y for some interval around $x_0 = 0$ (why?), and can differentiate both sides to derive:

$$ y''' = 3y'' + 2xy + x^2y', $$

$$ y^{(4)} = 3y''' + 2y + 4xy' + x^2y'', $$

and so on as long as we wish to and as long as additional derivatives of $y$ exist.


Now, we can substitute in initial values of lower derivatives and $x=0$ to find additional initial values:

$$ y'''(0) = 3 \cdot 15 + 2 \cdot 0 \cdot 10 + 0^2 \cdot 5 = 45, $$

$$ y^{(4)}(0) = 3 \cdot 45 + 2 \cdot 10 + 4 \cdot 0 \cdot 5 + 0^2 + 15 = 155, $$

and so on.

Substituting these initial conditions into (2) and dropping higher order terms we get:


$$ p_4(x) = 10 + 5x + \frac{15}{2!}x^2 + \frac{45}{3!}x^3 + \frac{155}{4!}x^4, $$

which is the Taylor polynomial of degree 4 approximating the solution to our IVP at $x_0 = 0$.

Note that this can be applied around places other than $x_0 = 0$ by translating coordinates, but I don't cover that here.

In general this process is very tedious and can be difficult to do by hand without making errors. I have written a [sage script that finds the Taylor polynomial approximation for IVPs](https://github.com/jhobbs/mathnotes/blob/main/scripts/taylor_series_approx.sage), which makes this process quick and accurate.