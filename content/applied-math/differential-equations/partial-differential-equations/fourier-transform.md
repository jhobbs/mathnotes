---
description: Fourier Transform 
layout: page
title: Fourier Transform
---


:::theorem
$$\hat{\hat{f}}(\omega) = f(-\omega).$$

::::proof
First we just write the definition:
$$ \hat{\hat{f}}(\omega) = \frac{1}{\sqrt{2 \pi}} \int_{-\infty}^{\infty}  \frac{1}{\sqrt{2 \pi}} \int_{-\infty}^{\infty} f(x) e^{- i k x} dx e^{-ik \omega} dk $$

Now we move the outer exponential into the inner integral, which is allowed since it's constant in $x.$:

$$ \hat{\hat{f}}(\omega) = \frac{1}{2 \pi} \int_{-\infty}^{\infty}  \int_{-\infty}^{\infty} f(x) e^{- i k (x + \omega )} dx dk $$

Now we swap the order if integration. We do this in calc 3... some justify it with Fubini's theorem, it's not clear exactly why this is allowed but this is how it goes (TODO: figure this out)

$$ \hat{\hat{f}}(\omega) = \frac{1}{2 \pi} \int_{-\infty}^{\infty}  \int_{-\infty}^{\infty} f(x) e^{- i k (x + \omega )} dk dx $$

Now pull out $f(x)$ from the inner integral since it's a constant in $k:$

$$ \hat{\hat{f}}(\omega) = \frac{1}{2 \pi} \int_{-\infty}^{\infty} f(x) \int_{-\infty}^{\infty} e^{- i k (x + \omega )} dk dx $$

The inner integral is just a delta function:

$$ \hat{\hat{f}}(\omega) = \frac{1}{2 \pi} \int_{-\infty}^{\infty} f(x) 2 \pi \delta(x + \omega). dx $$

Now by, the sifting property of the delta function, this just reduces to

$$ \hat{\hat{f}}(\omega) = f(-\omega). $$

::::
:::

