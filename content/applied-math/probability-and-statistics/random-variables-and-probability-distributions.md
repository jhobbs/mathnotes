---
description: Mathematical framework for discrete and continuous random variables with
  their probability mass functions and cumulative distribution functions.
layout: page
title: Random Variables and Probability Distributions
---

# Random Variables and Probability Distributions

## Random Variables


:::define "Random Variable"
A **random variable** is a @function that associates a @real number with each @element in the @sample-space. For @sample-space $S$, we have $X: S \to \mathbb{R}$ and for $s \in S$, we have $x = X(s),$ where $x$ is a @value of the random variable.
:::

Random variables don't have to map to all reals; for example, **Bernoulli random variables** map to either 0 or 1.

Returning to sample spaces briefly, if a sample space contains a finite number of possibilities, or an unending sequence with as many elements as there are whole numbers (countably infinite), it is called a **discrete sample space**.

If a sample space contains an infinite number of possibilities equal to the number of points on a line segment, it is called a **continuous sample space**.

Similarly, a random variable is called a **discrete random variable** if its set of possible outcomes is countable, or a **continuous random variable** if it takes values on a continuous scale. Discrete random variables tend to represent counted data, while continuous random variables tend to represent measured data.

## Probability Distributions

### Discrete Probability Distributions

A discrete random variable takes each of its values with a certain probability. The function $f(x)$ that gives the probability of each value $x$ of a random variable $X$ occurring is called the **probability function,** **probability mass function,** or **probability distribution.** More formally, the set of ordered pairs $(x, f(x))$ is a probability distribution of the discrete random variable $X$ if, for each possible outcome $x$

1. $f(x) \geq 0$
2. $\sum_{x}{f(x)} = 1$
3. $P(X = x) = f(x)$

Sometimes we want to know the probability that a random variable will be less than or equal to some real number $x.$ If we let $F(X) = P(X \leq x)$ for all real $x$, we define $F(X)$ to be the **cumulative distribution function** of the random variable $X.$ More formally, the **cumulative distribution function** $F(X)$ of a discrete random variable $X$ with a probability distribution $f(x)$ is:

$$ F(x) = P(X \leq x) = \sum_{t \leq x}{f(t)}, \quad -\infty < x < \infty. $$

### Continuous Probabilty Distributions

A continuous random variable has a probabilty of $0$ of exactly assuming any particular value. That's because, in any interval of real numbers, there are infinitely many points, and so the denominator for the proportion is infinite. For example, there are infinitely many points between $1.1$ and $1.2$, and again, infinitely many points between $1.2$ and $1.21$ and so on, regardless of the level of precision.

So, instead of focusing on probabilities of particular values, we focus on probabilities of values falling in various intervals. For example, instead of asking what the probability that someone weighs $150$ pounds is, we can ask what is the probability that they weigh between $149$ and $151$ pounds.

The function $f(x)$ is a **probability distribution function** (pdf) for the continuous random variable $X$, defined on the reals, if

1. $f(x) \geq 0$ for all $x \in \mathbb{R}$
2. $\int_{-\infty}^{\infty} f(x) dx = 1 $
3. $P(a < X < b) = \int_{a}^{b} f(x) dx$

In other words, if we integrate $f(x)$ from $a$ to $b$ we will get the probability of $X$ taking on a value between $a$ and $b$.

From here, the **cumulative distribution function** F(X) of a continuous random variable $X$ with density function $f(x)$ is attained by simply integrating $f(x)$ from $-\infty$ to $x$:

$$ F(X) = P(X \leq x) = \int_{-\infty}^{x} f(t)dt, \quad -\infty < x < \infty. $$
