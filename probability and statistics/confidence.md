---
layout: page
title: Confidence Intervals
---

# Confidence Intervals

*Theorem:* If $\bar{x}$ is the mean of a random sample of size $n$ from a population with a known variance $\sigma^2$, a $100(1-\alpha)%$ confident interval for $\mu$ is given by

$$ \bar{x} - z_{\alpha/2} \frac{\sigma}{\sqrt{n}} < \mu < \bar{x} + z_{\alpha/2} \frac{\sigma}{\sqrt{n}}. $$


*Theorem:* If $\bar{x}$ is used as an estimate of $\mu,$ we can be $100(1 - \alpha)\%$ confident that the error will not exceed a specified amount $e$ when the sample size is

$$ n = \left ( \frac{z_{\alpha/2} \sigma}{e} \right )^2. $$

For example, if we wish to find the sample size required for $90\%$ confidence, we need to know the $z$-value where $0.05$ of the area under the curve is to the right, so $0.95$ of the area under the curve is to the left - that is $z_{a/2}.$ Then if we know $\sigma$ and $e$ we can compute $n.$


*Theorem:* If $\bar{x}$ is the mean of a random sample of size $n$ from a population with an unknown variance, and the standard deviation of the sample is s, a $100(1-\alpha)%$ confident interval for $\mu$ is given by

$$ \bar{x} - t_{\alpha/2} \frac{s}{\sqrt{n}} < \mu < \bar{x} + t_{\alpha/2} \frac{s}{\sqrt{n}}. $$

This uses the Student t-distribution.

For large sample confidence interval, when $n \geq 30,$ we can assume $s \approx \sigma$ and use

$$ \bar{x} \pm z_{a/2}\frac{2}{\sqrt{n}} $$

to compute the confidence interval. This is just an approximation and gets better as $n$ gets bigger.