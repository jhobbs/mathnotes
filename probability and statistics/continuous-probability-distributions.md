---
layout: page
title: Some Continuous Probability Distributions
description: Study of uniform and normal distributions including their density functions, parameters, and the normal approximation to binomial distributions.
---

# Some Continuous Probability Distributions

## Uniform Distribution

The **uniform distribution** has a "flat" density function and thus a uniform probability in a closed interval $[A, B]$.

The density function of the continuous uniform random variable $X$ on the interval $[A,B]$ is

$$ f(x; A, B) = \begin{cases} 
\frac{1}{B - A} & \text{for } A \leq x \leq B \\
0 & \text{otherwise}
\end{cases} $$

The mean and variance of the uniform distributions are

$$ \mu = \frac{A + B}{2}, \quad \sigma^2 = \frac{(B-A)^2}{12}. $$

The cumulative distribution function for a uniform distribution is

$$ F(x) = \frac{x - a}{b - a}, \quad a \leq x \leq b $$

and the probability that a value falls between $a$ and $b$ is

$$ \int_{a}^{b} \frac{1}{B-A} dx = \frac{b - a}{B - A}, \quad A \leq a,b \leq B $$

## Normal Distribution

The **normal distribution** or **Gaussian distribution** is the classic bell-shaped distribution.

The density of the normal random variable $X,$ with mean $\mu$ and variance $\sigma^2,$ is

$$ n(x; \mu, \sigma) = \frac{1}{\sqrt{2 \pi} \sigma}e^{-\frac{1}{2 \sigma^2}{(x - \mu)^2}}, \quad -\infty < x < \infty. $$

The mean and variance of $n(x; \mu \sigma)$ are $\mu$ and $\sigma^2,$ respectively.

The curve of a continuous probability distribution is constructed so that the area under the curve bounded by two coordinates $x = x_1$ and $x = x_2$ equals the probability that the random variable $X$ assumes a value between $x = x_1$ and $x = x_2.$ Thus

$$ P(x_1 < X < x_2) = \int_{x_1}^{x_2} n(x; \mu, \sigma) dx = \frac{1}{\sqrt{2 \pi} \sigma} \int_{x_1}^{x_2} e^{-\frac{1}{2 \sigma^2}(x-\mu)^2} dx. $$

The **standard normal distribution** is the distribution of a normal random variable with mean $0$ and variance $1.$ We can transform a normal random variable $X$ into a random variable with a standard normal random variable by

$$ Z = \frac{X - \mu}{\sigma}. $$

Thus, with $z_1 = (x_1 - \mu)/\sigma$ and $z_2 = (x_2 - \mu)/\sigma,$ we have 


$$ P(x_1 < X < x_2) = \int_{x_1}^{x_2} n(x; \mu, \sigma) dx = \frac{1}{\sqrt{2 \pi} \sigma} \int_{x_1}^{x_2} e^{-\frac{1}{2 \sigma^2}(x-\mu)^2} dx = \frac{1}{\sqrt{2 \pi} \sigma} \int_{z_1}^{z_2} e^{-\frac{1}{2}z^2} dz  $$

$$ = \int_{z_1}^{z_2} n(z; 0, 1) dz = P(z_1 < Z < z_2). $$

This can make it easier to find probabilities using $Z$ tables, which are used because the integration in a normal distribution is hard to do analytically.

### Normal Approximation to the Binomial

If $X$ is a binomial random variable with mean $\mu = np$ and variance $\sigma^2 = npq,$ then

$$ Z = \lim_{n \to \infty} \frac{X - np}{\sqrt{npq}} = n(z; 0, 1). $$

This works well when $n$ is large and $p$ is not extremely close to $0$ or $1$, and also works well when $n$ is small and $p$ is near $0.5.$

Let $X$ be a binomial random variable with parameters $n$ and $p.$ For large $n$, $X$ has approximately a normal distribution with $\mu = np$ and $\sigma^2 = npq = np(1-p)$ and

$$ \begin{aligned}
P(X \leq x) & = \sum_{k=0}^x b(k; n, p) \\
            & \approx \text{area under normal curve to the left of } x + 0.5 \\
            & = P \left ( Z \leq \frac{x + 0.5 -np}{\sqrt{npq}} \right )
\end{aligned}
$$

and the approximation is good if $np$ and $n(1-p)$ are greater than or equal to 5.

The $0.5$ is called a **continuity correction** and comes from the fact that

$$ P(X = k) \approx P(k - 0.5 \leq X \leq k + 0.5). $$

For example, if we wanted to approximate $P(X = 10),$ our binomial assigns probability only to $10.$ The normal spread probability continiuously though, so we must take the probability of some interval, say $P(9.5 \leq X \leq 10.5).$