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

## Large-Sample Confidence Intervals for $p$

If $\hat{p}$ is the proportion of successes in a random sample of size $n$ and $\hat{q} = 1 - \hat{p}$ an approximate $100(1-\alpha)\%$ confidence interval, for the binomial parameter $p$ is given by

$$ \hat{p} - z_{\alpha / 2 }\sqrt{\frac{\hat{p}\hat{q}}{n}} < p < \hat{p} + z_{\alpha/2} \sqrt{\frac{\hat{p}\hat{q}}{n}}. $$

When $n$ is small and the unknown proportion $p$ is believed to be close to $0$ or $1$, this approach doesn't work well and shouldn't be used. This approach should only be used when both $n\hat{p}$ and $n\hat{q}$ are greater than or equal to $5.$

*Theorem:* If $\hat{p}$ is used as an estimate of $p,$ we can be $100(1 - \alpha)\%$ confident that the error will be less than a specified amount $e$ when the sample size is approximately

$$ n = \frac{z_{\alpha/2}^2 \hat{p} \hat{q}}{e^2}. $$

*Theorem:* If $\hat{p}$ is used as an estimate of $p,$ we can be **at least** $100(1-\alpha)\%$ confident that the error will not exceed a specified amount $e$ when the sample size is

$$ n = \frac{z_{\alpha/2}^2}{4e^2}. $$