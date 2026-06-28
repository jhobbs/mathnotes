---
description: Mathematical definitions and computational methods for expected value
  and variance of discrete and continuous random variables.
layout: page
title: Expectation
---

# Expectation

## Expected Value

:::definition "Expected Value" {synonyms: "expectation"}
Let $X$ be a @random-variable with a probability distribution $f(x).$ The **mean** or **expected value** of $X$ is

$$ \mu = E(X) = \sum_{x}{x f(x)} $$

if $X$ is @discrete, and

$$ \mu = E(X) = \int_{-\infty}^{\infty}{x f(x) dx} $$

if $X$ is @continuous.

The expected value is the "average value" we expect the random variable to take in the long run.

Note that in the discrete case, the expected value is the dot product of the vector of $x$ values and corresponding vector of $f(x)$ values.
:::

## Variance

:::definition "Variance"
Let $X$ be a @random-variable with probability distribution $f(x)$ and mean $\mu.$ The **variance** of $X$ is

$$ \sigma^2 = E[(X - \mu)^2] \sum_{x}{(x - \mu)^2 f(x)} $$

if $X$ is @discrete, and

$$ \sigma^2 = E[(X - \mu)^2] \int_{-\infty}^{\infty}{(x - \mu)^2 f(x) dx} $$

if $X$ is @continuous.
:::

:::definition "Standard Deviation"
The positive square root of the @variance, $\sigma,$ is called the **standard deviation** of $X.$
:::

Variance and standard deviation tell us about how spread out the values of $X$ are around its mean.

:::theorem "Jensen's Inequality"
Let $X$ be a random variable with finite @expectation $E[X]$, and let $\varphi : \mathbb{R} \to \mathbb{R}$ be
a @convex-function. Then

$$ \varphi\big(E[X]\big) \leq E\big[\varphi(X)\big]. $$

If $\varphi$ is concave, the inequality reverses:

$$ \varphi\big(E[X]\big) \geq E\big[\varphi(X)\big]. $$

In either case, equality holds if and only if $\varphi$ is @affine on the support of $X$, or $X$ is almost surely constant.
:::
