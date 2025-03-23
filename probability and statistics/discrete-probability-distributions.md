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

We can use a summation over the formula above to find the probability of there being between $a$ and $b$ successes:

$$ \sum_{x=a}^b{\binom{n}{x} p^x q^{n-x}}. $$


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

To do this approximation, just use the binomial PMF with $p = k/N.$

## Poisson Distbution

Experiments that give numerical values of a random variable $X,$ the number of outcomes during a given time interval or in a specified region, are called **Poisson experiments.** For example, the number of phone calls per hour an office recieves or the number of field mice per acre in a pasture. Note that while binomial and hypergeometric experiments dealt with discrete sequence of events (and give probabilities for discrete outcomes), Poisson experiments deal with continuous domains (and also give probabilities for discrete outcomes).

A **Poisson process** possesses the following properties

1. The number of outcomes occurring in one time/space region is independent of the number of outcomes occurring in any other disjoint time/space region, i.e., the Poisson process has no memory.

2. The probability that a single outcome will occurr within a small region is proportional to the size of the region and does not depend on the number of outcomes occurring outside the region, or the relative position of the region.

3. In a very small region, the probability of more than one event occurring is negligible.

The probability distrbution of the Poisson random variable $X,$ representing the number of outcomes occurring in a given time interval or specified region denoted by $t,$ is

$$ p(x, \lambda t) = \frac{e^{-\lambda t}(\lambda t)^x}{x!}. $$

Both the mean and variance of the Poisson distribution $p(x, \lambda t)$ are $\lambda t.$

Given a binomial distribution, if $n$ is large and $p$ is close to 0, the Poisson distribution approximates binomial probabilities.

*Theorem:* Let $X$ be a binomial random variable with probability distribution $b(x, n, p).$ When $n \to \infty,$ $p \to 0,$ and $\lim_{n \to \infty}{np} = \mu$ remains constant,

$$ \lim_{n \to \infty}{b(x, n, p)} = p(x, \mu). $$

So, to do this approximation, let $\lambda = \mu = np.$
