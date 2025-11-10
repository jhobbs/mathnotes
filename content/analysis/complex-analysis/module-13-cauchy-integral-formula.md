---
description: Fundamental formula expressing analytic function values as contour integrals,
  with applications to derivatives and evaluation of integrals.
layout: page
title: Cauchy Integral Formula
---

# Cauchy Integral Formula

First, we'll compute $\oint_C \frac{1}{z} dz$ where $C$ is the unit circle. We'll call this out as a theorem, because it's a super important result that gets used all the time in complex analysis.

:::theorem {label: integral-of-one-over-z-around-unit-circle}

If $C$ is the unit circle, then $ \int_C \frac{1}{z} dz = 2 \pi i.$

::::proof
First, note that we can parameterize $C,$ the unit circle, as

$$ z(\theta) = e^{i\theta},  0 \leq \theta < 2 \pi. $$

Now, making the substitution,

$$ f(z(\theta)) = \frac{1}{e^(i\theta)} = e^{-i\theta}. $$

Now, using the definition of the @contour-integral,

$$ \int_C f(z) dz = \int_\alpha^\beta f[z(t)]z'(t) dt $$

we have, noting that $z'(\theta) = i e^{i \theta},$

$$ \int_C \frac{1}{z} dz = \int_{0}^{2 \pi} e^{-i \theta} i e^{i \theta} d \theta = i \int_{0}^{2 \pi} d \theta = 2 \pi i. $$
::::
:::




When $f$ is analytic inside and on a simple, closed, piecewise smooth curve $C$, its value at any point $z$ interior to $C$ is given by the contour integral

$$ f(z) = \frac{1}{2 \pi i} \oint_c \frac{f(\zeta)}{\zeta - z} d\zeta. $$

where the contour integral is taken in the counter-clockwise direction.

A couple of other variations on this, just by rearranging with algebra, and using $z_0$ instead of $z$, and $z$ instead of $\zeta$.


$$ \oint_C \frac{f(z)}{z - z_0} dz = 2 \pi i f(z_0), \quad f(z_0) = \frac{1}{2 \pi i} \oint_C \frac{f(z)}{z - z_0} dz. $$

Another useful formula that results from the Cauchy Integral formula:

When $f$ is analytic inside and on a closed, piecewise smooth curve $C$, and $n$ is a nonnnegative integer, the value of the contour integral

$$ \oint_C \frac{f(z)}{(z - z_0)^{n+1}} dz = \begin{cases} 0, \quad \quad \quad \quad ~ ~  z_0 ~ \text{outside} ~ C \\ \frac {2 \pi i}{n!} f^{(n)}(z_0) \quad z_0 ~ \text{inside} ~ C. \end{cases} $$
