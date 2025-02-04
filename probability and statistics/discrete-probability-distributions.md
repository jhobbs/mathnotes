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

## Hypergeometric Distributions

The Hypergeometric distribution is similiar to the Binomial distrbution, but is performed without replacement. So, if success is drawing an ace from a deck of cards, in a Bionomial situation the card drawn each trial would be put back into the deck; in the Hypergeometric it would not be. Thus, the trials for a Hypergeometric distribution are not independent.

A **Hypergeometric experiment** has the following properties:

1. A random sample of size $n$ is selected without replacement from $N$ items.

2. Of the $N$ items, $k$ may be classified as successes and $N - k$ are classified as failures.

The number $X$ of successes of a Hypergeometric experiment is called a **Hypergeometric random vairable,** and its probability distrbution is called the **Hypergeometric distribution.**

The probability distribution of $X$ describes the probability of $x$ successes in $n$ draws, without replacement, from a finite population of size $N$ that contains exactly $k$ successful items and $N - k$ failure items is

$$ h(x, N, n, k) = \frac{\binom{k}{x}\binom{N-k}{n-x}}{\binom{N}{n}}, \quad \max{(0, n - (N -k))} \leq x \leq \min{(n, k)}. $$

The mean and variance of the Hypergeometric distrbution $h(x, N, n, k)$ are

$$ \mu = \frac{nk}{N} ~ \text{and} ~ \sigma^2 = \frac{N - n}{N - 1} \cdot n \cdot \frac{k}{N} \left ( 1 - \frac{k}{N} \right ). $$

It's worth noting that when $n$ is small compared to $N$, the lack of replacement in a hypergeoemetric process doesn't cause much impact to the distribution, and in these cases, the hypergeoemetric distrbution is similar to the binomial distribution. In fact, for large values of $N$ and small values of $n$, the binomial distribution approximates the hypergeoemetric distribution.

