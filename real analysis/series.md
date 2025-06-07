---
layout: page
redirect_from:
- calculus/series
title: Series
description: Studies infinite series convergence through partial sums, covering convergence tests including geometric series, p-series, ratio test, root test, and comparison tests.
---

# Series

An infinite sequence $a_n$ can be used to form an infinite series, or simply series, by summing its entries:

$$ \sum_{n=1}^{\infty} a_n = a_1 + a_2 + a_3 + \cdots $$

We can define a sequence $s_n$ of partial sums of the infinite series $\sum_{n=1}^{\infty}{a_n}$ by assigning

$$ s_n = \sum_{k=1}^{n} a_n = a_1 + a_2 + \cdots + a_n. $$

The series $\sum_{n=1}^{\infty}{a_n}$ is said to be convergent and to have a sum $m$ if the sequence of partial sums $s_n$ converges to $m.$ If the sequence $s_n$ diverges, then the series is said to diverge.

## Absolute Convergence
The series $\sum_{n=1}^{\infty}{a_n}$ is said to **converge absolutely** if $\sum_{n=1}^{\infty}{\|a_n\|}$ converges. The infinite series $\sum_{n=1}^{\infty}{a_n}$ is said to **converge conditionally** if it converges but $\sum_{n=1}^{\infty}{\|a_n\|}$ diverges.

## Linearity of Summation of Convergent Series

*Theorem*: If $c$ is a real number and the series $\sum_{n=1}^{\infty}{a_n}$ and $\sum_{n=1}^{\infty}{b_n}$ are convergent, then

$$ \sum_{n=1}^{\infty}{ \left ( a_n + c \cdot b_n \right )} =  \sum_{n=1}^{\infty}{a_n} + c \sum_{n=1}^{\infty}{b_n}. $$

## Convergence Tests

Before considering the sum of a series, we need to know if it converges or not. There are many tests for convergence; we will start with a test for divergence.

### Divergence Test

*Theorem*: The **divergence test** says that if an infinite series $\sum_{n=1}^{\infty}{a_n}$ converges, then $\lim_{n \to \infty}{a_n} = 0.$ Therefore, if $\lim_{n \to \infty}{a_n} \neq 0$ (if the limit diverges or converges to a value other than 0), the series diverges.

*Proof*: Suppose $\sum_{n=1}^{\infty}{a_n}$ converges with sum $m$ and let $s_n = \sum_{k=1}^{n} a_n.$ Then, it follows that

$$ \lim_{n \to \infty} a_n = \lim_{n \to \infty}{(s_n - s_{n-1})} = \lim_{n \to \infty}{s_n} - \lim_{n \to \infty}{s_{n-1}} = m - m = 0. \square $$

Note that $a_n$ converging to $0$ is a necessary condition for $\sum_{n=1}^{\infty}{a_n}$ to converge, but it is not sufficient.

### Geometric Series Test

*Theorem*: The **geometric series test** says that the geometric series $\sum_{n=1}^{\infty}{r^n}$ converges if $\|r\| < 1$ and diverges otherwise. If $\|r\| < 1,$ then $\sum_{n=1}^{\infty}{r^n} = \frac{r}{1 - r}.$

*Proof*: Suppose $\|r\| < 1.$ Note that

$$ s_n = (r + r^2 + \cdots + r^n) = r(1 + r + r^2 + \cdots + r^{n-1}) = r\frac{1-r^n}{1 - r}. $$

(That last step is a rabbit out of a hat but can be shown using long division.) Now, if we take the limit as n goes to infinity we have

$$ \lim_{n \to \infty}{s_n} = \lim_{n \to \infty}{r \frac{1 - r^n}{1 - r}} = r \frac{1}{1 - r} = \frac{r}{1 - r}. \square $$

Note that when $\|r\| \geq 1,$ the series diverges.

### Bounded Series with Nonnegative Terms

*Theorem:* Suppose $a_n \geq 0$ for all $n \in \mathbb{N}.$ Then the series $\sum_{n=1}^{\infty}{a_n}$ converges iff the sequence of partial sums $s_n = \sum_{k=1}^{n}{a_k}$ is bounded.

*Proof:* Assume the sequence of partial sums $s_n$ is bounded. Since all terms of $a_n$ are nonnegative, $s_n$ is increasing, and by the Monotone Convergence Theorem, must converge, meaning $\sum_{n=1}^{\infty}{a_n} = \lim_{n \to \infty} s_n$ converges. On the other hand, assume $\sum_{n=1}^{\infty}{a_n}$ converges. Then $s_n$ is a convergent sequence and is therefore bounded (see [sequences](/mathnotes/real%20analysis/sequences)).

### $2^n$ Test
*Theorem:* Suppose $a_n \geq a_{n+1} \geq {0}$ for all $n \in \mathbb{N}$ (i.e. $a_n$ is nonnegative and decreasing.) Then the series $\sum_{n=1}^{\infty}{a_n}$ converges iff the series $\sum_{n=1}^{\infty}{2^n a_{2n}}$ converges.

### $p$-Series Test
*Theorem:* The $p$-series $\sum_{n=1}^{\infty}{\frac{1}{n^p}}$ converges if $p > 1$ and diverges otherwise.

### Alternating Series Test
*Theorem:* Suppose $a_n \geq a_{n+1}$ for all natural numbers $n$ and that $\lim_{n \to \infty}{a_n} = 0.$ Then the alternating series $\sum_{n=1}^{\infty}{(-1)^{n+1}a_n}$ converges.

### Absolute Value Test
*Theorem:*  If the series $\sum_{n=1}^{\infty}{a_n}$ converges absolutely then it simply converges too.

### Comparison Test
*Theorem:* Suppose $\sum_{n=1}^{\infty}{a_n}$ and $\sum_{n=1}^{\infty}{b_n}$ are series for which $\|a_n\| \leq \|b_n\|$ for all natural $n.$ Then if $\sum_{n=1}^{\infty}{b_n}$ converges absolutely, so does $\sum_{n=1}^{\infty}{a_n}.$ If $\sum_{n=1}^{\infty}{\|a_n\|}$ diverges, so does $\sum_{n=1}^{\infty}{\|b_n\|}.$

### Limit Ratio Test
*Theorem:* For the series $\sum_{n=1}^{\infty}{a_n},$ let

$$ L = \lim_{n \to \infty}{\left | \frac{a_{n+1}}{a_n} \right |}. $$ 

Then, if $L < 1,$ $\sum_{n=1}^{\infty}{a_n}$ converges absolutely. If $L > 1,$ $\sum_{n=1}^{\infty}{a_n}$ diverges.

### Root Test
*Theorem:*  For the series $\sum_{n=1}^{\infty}{a_n},$ let $L = \limsup_{n \to \infty}{\|a_n\|^{1/n}}.$ Then if $L < 1,$ $\sum_{n=1}^{\infty}{a_n}$ converges absolutely. If $L > 1,$ $\sum_{n=1}^{\infty}{a_n}$ diverges.