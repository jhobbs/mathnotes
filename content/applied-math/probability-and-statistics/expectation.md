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

$$ \varphi\big(E[X]\big) \leq E\big[\varphi(X)\big]. \tag{a} $$

If $\varphi$ is concave, the inequality reverses:

$$ \varphi\big(E[X]\big) \geq E\big[\varphi(X)\big]. $$

In either case, equality holds if and only if $\varphi$ is @affine on the support of $X$, or $X$ is almost surely constant.


::::proof
We will proceed by induction. Assume $X$ is discrete and takes on $n$ values $x_1, \dots, x_n$ with probabilities $p_1, \dots, p_n.$

Base step, for $n=2$: Assume $X$ takes on two distinct values, $x_1$ and $x_2,$ with probabilities $p_1 = \lambda, p_2 = 1 - \lambda.$ Then we want to show that

$$ \begin{aligned}
\varphi\big(E[X]\big) & \leq E\big[\varphi(X)\big] \\
\varphi\big(\lambda x_1 + (1 - \lambda) x_2 \big) & \leq \lambda \varphi(x_1) + (1 - \lambda) \varphi(x_2). \\
\end{aligned} $$

The last line is just the definition of a @convex-function, so it's obviously true.

Inductive step: Assume that (a) holds for any $n - 1$ points. Take $n$ points with weights $p_i$ summing to $1.$ Let

$$ w = \sum_{i=1}^{n-1} p_i = 1 - p_n. $$

Assuming $w > 0,$ let $q_i = p_i / w.$ Then, $q_i > 0, \sum q_i = 1,$ so the $q_i$ form an $(n-1)$-point distribution. Now, we'll rewrite $E[X]$ to bundle the first $n-1$ terms separately from the last term:

$$
E[X] = \sum_{i=1}^{n} p_i x_i = w \sum_{i=1}^{n-1} q_i x_i + p_n x_n = w \overline{x} + p_n x_n, \tag{b}
 $$

where $\overline{x} =  \sum_{i=1}^{n-1} q_i x_i.$ Now, because $w + p_n = 1,$ (b) is a two-point convex combination of $\overline{x}$ and $x_n.$ From our base case,

$$\varphi \big ( \sum_{i=1}^{n} p_i x_i \big ) = \varphi(w \overline{x} + p_n x_n) \leq w\varphi(\overline{x}) + p_n\varphi(x_n). $$

Now, from our inductive hypothesis we have that

$$ \varphi(\overline{x}) = \varphi \big ( \sum_{i=1}^{n-1} q_i x_i \big) \leq \sum_{i=1}^{n-1} q_i \varphi(x_i). $$

Tying it all together we have

$$ \begin{aligned}

\varphi \big ( E[X] \big ) & = \varphi \big ( \sum_{i=1}^{n} p_i x_i \big ) \\
                           & \leq w \sum_{i=1}^{n-1} q_i \varphi(x_i) + p_n \varphi(x_n) \\
                           & = \sum_{i=1}^{n-1} p_i \varphi(x_i) + p_n \varphi(x_n) \\
                           & = \sum_{i=1}^{n} p_i \varphi(x_i) \\
                           & = E[\varphi(X)].
\end{aligned} $$

TOOD: show the equality case only holds when the support is affine.

::::

:::
