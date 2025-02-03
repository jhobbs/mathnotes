---
layout: page
title: Some Discrete Probability Distbutions
---

# Some Discrete Probability Distributions

## Binomial Distributions

A **Bernoulli Process** must possess the following properties:

1. The experiment consists of repeated trials.

2. Each trial results in a boolean outcome, which can be considered true or false, success or failure, etc.

3. The probability of success, $p$, remains constant across trials.

4. Repeated trials are independent.

A **binomial distribution** aggregates the outcomes of a Bernoulli process across multiple trials to tell you how likely it is to achieve a certain number of successes. The number $X$ of successes in $n$ Bernoulli trials is called a **binomial random variable,** and its probability distribution is what we call the binomial distribution.

If we let $n$ be the number of trials, $x$ be the number of successes, and $p$ be the probability of success on a given trial, and $q = 1 - p$ be the probability of failure on a given trial, then the probability distribution of the random variable $X$ is

$$ b(x, n, p) = {n \choose x}p^x q^{n-x}, \quad x = 0, 1, 2, \dots, n. $$

To break this down some, there are ${n \choose x}$ ways to have $x$ successes out of $n$ trials (different orderings). For each, there are $x$ independent events that occurr with a probability of $p$ and $n - x$ independent events that occur with a probability of $q = 1 - p.$ 

The mean and variance of the binomial distribution $b(x, n, p)$ are

$$ \mu = np, ~ \text{and} ~ \sigma^2 = npq. $$