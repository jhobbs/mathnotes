---
layout: page
title: Hypothesis Testing
description: Statistical inference methods using z-tests and t-tests to evaluate null and alternative hypotheses with p-value calculations.
---

# Hypothesis Testing

Given a baseline population mean $\mu_0,$ a sample mean $\bar{x},$ a sample count $n,$ and either a sample standard deviation $s$ or a population standard deviation $\sigma,$ we might want to know if the sample data provides sufficient evidence to conclude that the true population mean $\mu$ differs significantly from $\mu_0.$

We could say that our null hypothesis is that the population mean is what we expect:

$$ H_0: \mu = \mu_0, $$

and that the alternative hypothesis is that it is different from what we expect:

$$ H_1: \mu \neq \mu_0. $$

We'd then compute a test statistic. Here, we will assume we know the population's standard deviation $\sigma$ 

$$ z = \frac{\bar{x} - \mu_0}{\sigma / \sqrt{n}}. $$

Then, since we want to know the p-value, that is, the probability of getting a test statistic ($z$) this extreme or more extreme if the actual mean is $\mu_0,$, we have a two-tailed test because the sample mean could either be lower than or higher than our actual mean. So, we do

$$ \text{p-value} = P(|Z| \geq |z|) = 2 \times P(Z \geq |z|) = 2 \left(1 - \int_{-\infty}^{|z|} \frac{1}{\sqrt{2\pi}} e^{-\frac{t^2}{2}} \, dt \right) $$

or in Mathematica notation:

$$ 2 * (1 - CDF[NormalDistribution[0, 1], Abs[z]]). $$

Low $p-values$ (typically, p < 0.05 or so) lead us to reject the null-hypothesis and adopt the alternative hypothesis. A very low $p$-value means that the probability of getting the sample we got if $\mu = \mu_0$ is very low.

Instead of hypothesising that that $\mu \neq mu_0,$ we could hypothesize that $\mu > \mu_0.$, or that $\mu < \mu_0.$ These would be single-tailed tests and we'd use, for example:

$$ H_0: \mu = \mu_0, $$

$$ H_1: \mu > \mu_0, $$

$$ 1 - CDF[NormalDistribution[0, 1], z] $$
 
instead.

Additionally, if we don't know $\sigma$ but only know $s,$ the standard deviation of the sample, we would use a Student T Distribution. We'd calculate a $t$ value instead of a $z$ value:

$$ t = \frac{\bar{x} - \mu_0}{s / \sqrt{n}}. $$

$$ 1 - CDF[StudentTDistribution[n-1], t]. $$

Note that if we wanted to test the alternative hypothesis $H_1: \mu < \mu_0$ we'd use

$$ CDF[StudentTDistribution[n-1], t], $$

and similarly for when $\sigma$ is known, except we'd use the standard normal distribution and a $z$ value.
