---
layout: page
title: Limit Theorems
description: Fundamental probability limit theorems including Markov and Chebyshev inequalities, Law of Large Numbers, and Central Limit Theorem with moment generating functions.
---

# Limit Theorems

I'm not sure which of these are proper limit theorems and which are preliminaries, but this is all a build up to the Central Limit Theorem.

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

### Example

Suppose the length $X$ of a fish is a random variable measured in inches with mean

$$ E[X] = \mu = 20 \text{ inches} $$

and variance

$$ \sigma^2 = 9 \text{ inches}^2 $$

Chebyshev's inequality states that for any $t > 0$:

$$ P(|X - \mu| \ge t) \le \frac{\sigma^2}{t^2} $$

For $t = 4$ inches, the inequality becomes:

$$ P(|X - 20| \ge 4) \le \frac{9}{16} $$

This tells us that the probability of a fish's length deviating from 20 inches by at least 4 inches is at most $\frac{9}{16}$.

## Law of Large Numbers

*Theorem:* Suppose $X_1, X_2, \dots$ are independent and identically distributed random variables with finite mean $\mu.$ Then for any $\epsilon > 0,$

$$ \lim_{n \to \infty} P \left ( \left |\frac{X_1 + \cdots + X_n}{n} - \mu  \right | \geq \epsilon \right ) = 0. $$

Intuitively, this means that the more identically distributed random variables we have, the closer their average value will get to the mean for the random variables. If we think of each random variable as an identical sample from the same population, another way to think of this is the more samples we get, the closer the average value across all samples will be to the true average value for the population, and we can get as close as we like to the true average value for the population by taking more samples.

*Proof:* We assume that the variance of the random variables is also finite. Then, note that

$$ E \left [ \frac{X_1 + \cdots X_n}{n} \right ] = \mu, $$

and 

$$ V \left [ \frac{X_1 + \cdots X_n}{n} \right ] = \frac{\sigma^2}{n}. $$

Then, by Chebyshev's Inequality, we have

$$ P \left ( \left |\frac{X_1 + \cdots + X_n}{n} - \mu  \right | \geq \epsilon \right ) \leq \frac{\sigma^2}{n \epsilon^2}. $$

Now, as $n$ increases, the term on the right approaches $0$, which by the Squeeze Theorem implies the term on the left also approaches $0,$ and is $0$ at the limit. $\square$

## Moment Generating Functions

If $X$ is a random variable, then its moment generating function is a real-valued function on the reals defined as

$$ M_x(t) = E[e^{tX}]. $$

If $X$ is discrete, this is then

$$ M_x(t) = \sum_{x} e^{tx}f(x) $$

and if X is continuous, then this is

$$ M_x(t) = \int_{-\infty}^{\infty} e^{tx}f(x). $$

Now, note that $M_x(0) = E[e^{0 \cdot X}] = E[1] = 1.$

In general, for the random variable $X$ with the moment generating function $M_X(t),$ we have that $M_X'(0) = E[X]$ and $M_X^{(n)}(0) = E[X^n]$ if the derivatives exist at $0$.

Moment generating functions are unique and completely specify random variables.

*Theorem:* The moment generating function for the sum of two random variables is the product of the moment generating functions of the two random variables. More generally, if $X_1, X_2, \dots X_n$ are independent random variables, then

$$ M_{X_1 + X_2 + \cdots + X_n}(t) = M_{X_1}(t) \cdot M_{X_2}(t) \cdots M_{X_n}(t). $$

*Proof:* We'll prove the case where $n = 2;$ the general proof is exactly the same but more tedious.

$$ \begin{aligned}

M_{X+Y}(t) & = E[e^{t(X+Y)}] \\
           & = E[e^{tX}e^{tY}] \\
           & = E[e^{tX}]E[e^{tY}] \\
           & = M_X(t)M_Y(t). \square

\end{aligned} $$

### Continuity Theorem For Moment Generating Functions

In essence, The Continuity Theorem For Moment Generating Functions says that if you have a sequence of random variables whose MGFs converge “nicely” (in a neighborhood of zero) to a limit function, then that limit function is the MGF of some random variable and the distributions of your sequence converge to the distribution of that random variable.

*Theorem:* Let ${X_n}$ be a sequence of random variables with moment generating functions defined by

$$ M_{X_n}(t) = E[e^{tX_n}] $$  

for all $\|t\| < \epsilon$ for some $\epsilon > 0$.

Suppose there exists a function $M(t)$, finite for $\|t\| < \epsilon$, such that  

$$ \lim_{n \to \infty} M_{X_n}(t) = M(t) $$  

for all $\|t\| < \epsilon$, and that $M(t)$ is the moment generating function of some random variable $X$.

Then the distributions of ${X_n}$ converge in distribution to $X$, i.e.,

$$ X_n \xrightarrow{d} X. $$

## Central Limit Theorem

The intuitive version of the Central Limit Theorem is that if $n$ values are sampled from a distribution with a mean $\mu$ and standard deviation $\sigma,$ then the sample mean of these values, $\bar{X},$ is approximately normal with mean $\mu$ and standard deviation $\frac{\sigma}{\sqrt{n}}$ for large $n.$

This means that no matter what the underlying distribution of a population is, any sufficiently large sample from the population will be approximately normal. How large is sufficiently large depends on the shape of the distribution - for symmetric distributions it is lower and for asymmetric it is higher, but a common value is $n \geq 30.$

A compact way to write this is

$$ \frac{\bar{X} - \mu}{\frac{\sigma}{\sqrt{n}}} \sim Z, \quad n \geq 30. $$

A more precise version of the theorem follows.

*Central Limit Theorem:* If $c$ is a real constant and $X_1, X_2, \dots$ are independent random variables with mean $\mu$ and standard deviation $\sigma,$ then

$$ \lim_{n \to \infty} P \left ( \frac{X_1 + \cdots + X_n - n \mu}{\sigma \sqrt{n}} \leq c \right ) = \int_{- \infty}^{c} \frac{1}{\sqrt{2 \pi}} e^{-\frac{x^2}{2}} dx. $$