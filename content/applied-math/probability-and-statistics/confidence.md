---
description: Statistical methods for estimating population parameters with specified
  confidence levels using normal and t-distributions.
layout: page
title: Confidence Intervals
---

# Confidence Intervals

A confidence interval tells us how likely it is that a population parameter falls within a specified range, based on a statistic calculated from a sample of data. This interval provides a range of values that, with a certain level of confidence (usually expressed as a percentage like $95\%$ or $99\%$), is believed to encompass the true parameter value. The width of the interval gives an idea of the precision of our estimate, with narrower intervals representing more precise estimates.

To say that the range of values has a certain level of confidence means that if we were to repeat the experiment or sampling process many times (theoretically an infinite number of times), the true population parameter would fall within that interval in the stated percentage of all trials. For example, a $95\%$ confidence level means that $95$ out of $100$ such confidence intervals would contain the true population parameter (which is unknown).

If you were to repeat the sampling process an infinite number of times, each time calculating a new $95\%$ confidence interval using the same method, about $95\%$ of these intervals would contain the true population parameter. Each interval is calculated from a different sample and might be different in range, but the method of calculation ensures that $95\%$ of these intervals will capture the true parameter value.

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