---
layout: page
redirect_from:
- complex/module 13 - cauchy integral formula
title: Cauchy Integral Formula
description: Fundamental formula expressing analytic function values as contour integrals, with applications to derivatives and evaluation of integrals.
---
# Cauchy Integral Formula

When $f$ is analytic inside and on a simple, closed, piecewise smooth curve $C$, its value at any point $z$ interior to $C$ is given by the contour integral

$$ f(z) = \frac{1}{2 \pi i} \oint_c \frac{f(\zeta)}{\zeta - z} d\zeta. $$

where the contour integral is taken in the counter-clockwise direction.

A couple of other variations on this, just by rearranging with algebra, and using $z_0$ instead of $z$, and $z$ instead of $\zeta$.


$$ \oint_C \frac{f(z)}{z - z_0} dz = 2 \pi i f(z_0), \quad f(z_0) = \frac{1}{2 \pi i} \oint_C \frac{f(z)}{z - z_0} dz. $$

Another useful formula that results from the Cauchy Integral formula:

When $f$ is analytic inside and on a closed, piecewise smooth curve $C$, and $n$ is a nonnnegative integer, the value of the contour integral

$$ \oint_C \frac{f(z)}{(z - z_0)^{n+1}} dz = \begin{cases} 0, \quad \quad \quad \quad ~ ~  z_0 ~ \text{outside} ~ C \\ \frac {2 \pi i}{n!} f^{(n)}(z_0) \quad z_0 ~ \text{inside} ~ C. \end{cases} $$ 
