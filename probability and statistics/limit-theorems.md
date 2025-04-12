---
layout: page
title: Limit Theorems
---

# Preliminaries

## Markov's Inequality

*Theorem:* Let $X$ be a non-negative random variable ($X \geq 0,$) and $t > 0.$ Then,

$$ P(X \geq t) \leq \frac{E[X]}{t}. $$

That is, the probability that X is at least $t$ has an upper-bound of the expectation (mean) of $X$ divided by $t.$ In simpler terms, the probability that $X > t$ can't be too big.

Note that as $t$ grows larger, the probability of $X$ being greater than $t$ grows smaller.

*Proof:*
This follows from the the Law of Total Expectation, which is

$$ E[X] = E[X \mid X \ge t]\,P(X \ge t) + E[X \mid X < t]\,P(X < t). \tag{a} $$

Here, we're partitioning $X's$ sample space into a portion above $t$ and a portion below $t.$ 

Now, $E[X \mid X \ge t]$ is the expected value when $X \ge t,$ which is necessarily at least $t,$ since $X$ is restricted to taking on values of at least $t.$ So, we have that $E[X \mid X \ge t] > t.$

We can substitute this into (a) to get

$$ E[X] \geq t\,P(X \ge t) + E[X \mid X < t]\,P(X < t). \tag{b} $$

Note that our equation has turned into an inequality; we must do this because the original RHS was equal to the original LHS, and the original RHS is greater than or equal to our new RHS, which means the original LHS is greater than or equal to our new RHS.

Now, since we said that $X$ is non-negative, its expected value is also non-negative, including when $X < t.$ We we have by definition that $P(X < t)$ is non-negative (because all probabilities are non-negative). Therefore, $E[X \mid X < t]\,P(X < t)$ must also be non-negative as it's the product of two non-negative numbers. Since the LHS of (b) is greater than the RHS with this non-negative value added to the RHS, the LHS is also bigger without it added, and therefore we can drop it to get

$$ E[X] \geq t\,P(X \ge t) \tag{c} $$

Dividing both sides by $t$ and swapping sides gives us

$$ P(X \geq t) \leq \frac{E[X]}{t}. \square $$

### An Example

Suppose the size of a fish (measured in inches) is modeled as a nonnegative random variable $X$ with an expected value

$$ E[X] = 12 \text{ inches}. $$

We wish to bound the probability that the fish is at least $16$ inches long, i.e.,

$$ P(X \ge 16). $$

By Markov's inequality, for any nonnegative random variable $X$ and any $t > 0$,

$$ P(X \ge t) \le \frac{E[X]}{t}. $$

Setting $t = 16$ inches, we have

$$ P(X \ge 16) \le \frac{12}{16} = 0.75. $$

Thus, the probability of catching a fish of length at least $16$ inches is at most $75\%$.

**Interpretation:**  
While Markov's inequality provides an upper bound of $75\%$, the actual probability of catching such a large fish could be much lower. This bound is derived solely from the expected value without any extra assumptions about the distribution of $X$.

## Chebyshev's Inequality

Chebyshev's inequality gives an upper-bound on the probability of $X$ taking on values more than $t$ away from its mean ($E[X]$)

*Theorem:* Suppose $t > 0$ and $X$ is a random variable with the finite mean $E[X]$ and standard deviation $\sigma.$ Then

$$ P(| X - E[X] | \geq t) \leq \frac{\sigma^2}{t^2}. $$

Intuitively, this means that the probability that $X$ is far away from its mean can't be too big.

Note that the upper-bound on this probability is proportional to the variance of the random variable and inversely proportional to the distance $t$ of $X$ from its mean. So, as the variance increases, the probability of $X$ taking on values further from its mean also increases, and as the distance from the mean increases, the probability of $X$ taking on values at least that far from $E[X]$ decreases.

Also note that while Markov's inequality only requires knowledge of the mean $E[X]$ (the first moment), Chebyshev's inequality requires knowledge of the variance $E[X^2] - E[X]^2$ (second moment). Also, Chebyshev's inequality works for any random variable with a variance defined, rather than just on non-negative random variables.

*Proof:*

Let $X$ be a random variable with mean $E[X]$ and variance $\sigma^2$. Define the non-negative random variable

$$ Y = (X - E[X])^2. $$

By Markov's inequality, for any $a > 0$, we have

$$ P(Y \ge a) \le \frac{E[Y]}{a}. $$

Set $a = t^2$. Then,

$$ P\big((X - E[X])^2 \ge t^2\big) \le \frac{E[(X - E[X])^2]}{t^2}. $$

Since the variance of $X$ is $\sigma^2 = E[(X - E[X])^2]$, it follows that

$$ P\big((X - E[X])^2 \ge t^2\big) \le \frac{\sigma^2}{t^2}. $$

Note that

$$ (X - E[X])^2 \ge t^2 \iff |X - E[X]| \ge t. $$

Thus,

$$ P(|X - E[X]| \ge t) \le \frac{\sigma^2}{t^2}. \square $$