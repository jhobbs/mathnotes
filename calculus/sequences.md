---
layout: page
title: Sequences
---

# Sequences

A **sequence** of numbers if a function $f$ from $\mathbb{N}$ to $\mathbb{R}$. Typically, we say $a_1 = f(1), a_2 = f(2), a_3 = f(3), \dots$ and write the sequence as a list $a_1, a_2, a_3, \dots.$ When it's possible to give a rule $f(n)$ for the $n$th term of a sequence, we can write $a_n = f(n)$ and refer to the sequence using just the rule. For example, $a_n = \frac{3n}{n+1} = 3/2, 6/3, 9/4, \dots$

We say that a sequence has a limit $L$ if we can make terms arbitrarily close to $L$ by taking $n$ to be sufficiently large. More precisely, the **limit** of a sequence $a_n$ as $n$ approaches infinity is $L$ ($\lim_{n \to \infty} a_n = L$) if for every $\epsilon > 0$ there exists an $N \in \mathbb{N}$ such that $\|a_n -L\| < \epsilon$ whenever $n \geq N$.

If a sequence's limit exists and is finite, we say the sequence converges to the limit and is a **convergent sequence.**

Example: The limit of the sequence $a_n = \frac{3n}{n+1}$ is $3$. *Proof:* We need to show that given $\epsilon > 0$, there is some $N \in \mathbb{N}$ where if $n > N$, $\|\frac{3n}{n+1} - 3\| < \epsilon$. First, note that

$$ |\frac{3n}{n+1} - 3| = |\frac{3n - 3(n+1)}{n+1}| = |\frac{-3}{n+1}| = \frac{3}{n+1}. $$

Now,

$$ \frac{3}{n+1} < \epsilon \iff 3 < \epsilon (n+1) \iff 3 < \epsilon n + \epsilon \iff -\epsilon n > \epsilon - 3 \iff n > \frac{3 - \epsilon}{\epsilon}. $$

Therefore, if we pick a natural number $N \geq \frac{3 - \epsilon}{\epsilon}$, then $\|a_n - 3\| < \epsilon$ whenever $n \geq N$, and $\lim_{n \to \infty} \frac{3n}{n+1} = 3.$

We can simplify this proof a bit by recognizing that because $\frac{3}{n+1} < \frac{3}{n}$, if $\frac{3}{n} < \epsilon$, then $\frac{3}{n+1}$ is also less than $\epsilon$. $\frac{3}{n} < \epsilon$ when $n < \frac{3}{\epsilon},$ so we can choose $N$ as a natural number greater than $\frac{3}{\epsilon}.$

## Uniqueness of the Limit of a Sequence

Note that the limit of a sequence is unique, that is, if $\lim_{n \to \infty} = L$ and $\lim_{n \to \infty} = M,$ then $L = M$. *Proof:*. Suppose $L > M$. Then $\frac{L - M}{2} > 0,$ and for some $N_1, N_2 \in \mathbb{N}$ we have

$$  n > N_1 \implies |a_n - L| < \frac{L - M}{2}, \quad n > N_2 \implies |a_n - M| < \frac{L - M}{2}. $$

Now, let $N = \max{(N_1, N_2)}.$ We have that whenever $n > N$,


$$  |a_n - L| < \frac{L - M}{2}, \quad |a_n - M| < \frac{L - M}{2}, $$

which can be [rewritten](./real-numbers.html) as

$$ - \frac{L - M}{2} < a_n - L < \frac{L - M}{2}, \text{ and }  - \frac{L - M}{2} < a_n - M < \frac{L - M}{2}.$$

Therefore, whenever $n \geq N$,

$$ - \frac{L - M}{2} + L < a_n, \text{ and } a_n < \frac{L - M}{2} + M. $$

Hence we have that $\frac{L+M}{2} < a_n < \frac{L+M}{2}$, but this is impossible, so our supposition that $L > M$ must be false.

We can make a similar argument assuming that $M > L$, and this leads to the conclusion that $L = M$, and therefore $L$ is the unique limit of the sequence.

## Limit Laws for Sequences

Constant Sequence: If $a_n = L$ for all $n \in N$, then $\lim_{n \to \infty} a_n = L.$

Limit of a Sum is the Sum of the Limits: If $a_n$ and $b_n$ are convergent sequences, then $\lim_{n \to \infty}{(a_n + b_n)} = \lim_{n \to \infty}{a_n} + \lim_{n \to \infty}{b_n}$.

Limit of a Difference is the Difference of the Limits: If $a_n$ and $b_n$ are convergent sequences, then $\lim_{n \to \infty}{(a_n - b_n)} = \lim_{n \to \infty}{a_n} - \lim_{n \to \infty}{b_n}$.

Factoring a Constant Through the Limit: If $a_n$ is a convergent sequence and $c$ is a real number, then $\lim_{n \to \infty} ca_n = c \lim_{n \to \infty} a_n.$

Limit of a Product is the Product of the Limits: If $a_n$ and $b_n$ are convergent sequences, then $\lim_{n \to \infty}{(a_n \cdot b_n)} = \lim_{n \to \infty}{a_n} \cdot \lim_{n \to \infty}{b_n}$.

Limit of a Quotient is the Quotient of the Limits: If $a_n$ and $b_n$ are convergent sequences, and $\lim_{n \to \infty}{(b_n)} \neq 0$, then $\lim_{n \to \infty}{(\frac{a_n}{b_n})} = \frac{\lim_{n \to \infty}{a_n}}{\lim_{n \to \infty}{b_n}}$.

Squeeze Theorem: If $a_n$ and $c_n$ are convergent sequences with the same liimt $L$, and $b_n$ is a sequence for which $a_n \leq b_n \leq c_n$ for all $n$, then $\lim_{n \to \infty}{b_n} = L$.

## Bounded Sequences
A sequence is said to be a **bounded sequence** if there exists a real number $M$ such that $\|a_n\| \leq M$ for all natural numbers $n$. In other words, $a_n$ is never further from $0$ than $\pm M$. If $a_n$ is less than or equal to some real number for all $n$, then $a_n$ is said to be **bounded above**, and if $a_n$ is greater than or equal to some real number for all $n$, it is said to be **bounded below.**

## Divergent Sequences
In general, any sequence that does not converge is said to **diverge** and is a **divergent sequence**.

The real sequence $a_n$ is said to **diverge to infinity** if for every real number $M$, there exists a natural number $N$ such that $a_n > M$ whenever $n \geq N.$ In this case, we write $\lim_{n->\infty}{a_n} = \infty$. This means that for any given real number, not matter how large, we can find an $n$ that makes $a_n > M$.  

The real sequence $a_n$ is said to **diverge to minus infinity** if for every real number $M$, there exists a natural number $N$ such that $a_n < M$ whenever $n \geq N.$ In this case, we write $\lim_{n->\infty}{a_n} = -\infty$. This means that for any given real number, not matter how small, we can find an $n$ that makes $a_n < M$. 

A sequence can also diverge but not to infinity or minus infinity. For example, $a_n = (-1)^n$ does not converge, so it is divergent, but it does not diverge to $\pm \infty$.

## Monotone Sequences

The real sequence $a_n$ is said to be **increasing** if $a_n \leq a_{n+1}$ for all natural $n$, and is said to be **decreasing** if $a_n \geq a_{n+1}$ for all natural $n$.

A real sequence is $a_n$ is said to be **monotone** if it is either increasing or decreasining.

The **monotone convergence theorem** says that if a sequence is monotone and bounded, then it converges. *Proof*: Suppose that the sequence $a_n$ is bounded and increasing. Then, by the Completeness axiom, the set $\\{a_n \| n \in \mathbb{N} \\}$ has a least upper bound; let's call it $L.$ Then, for any positive $\epsilon$, $L - \epsilon$ can't be an upper bound of the set, since $L - \epsilon < L$. Therefore, for some $N \in \mathbb{N}$, $L - \epsilon < a_N$, and since $a_n$ increases monotonically, for all $n \geq N$, we have $L - \epsilon < a_n < L + \epsilon$, which implies $\|a_n - L\| < \epsilon,$ that is, that $a_n$ converges to $L$. $\square$

## Subsequences

The sequence $a_{f(n)}$ is called a **subsequence** of the sequence $a_n$ if $f : \mathbb{N} \to \mathbb{N}$ is a strictly increasing function. Another way to put this is that if $a_n$ is a sequence, if we construct $a'_n$ by removing $0$ or more elements from $a_n$ and leaving the remaining elements in the same order, then $a'_n$ is a subsequence of $a_n.$

The **Limit of a Subsequence Theorem** says that if $a_n$ is a convergent sequence with limit $L$, then any subsequence $a_{f(n)}$ of $a_n$ will also converge to $L.$ *Proof*: Suppose $a_n$ converges to $L.$ Let $\epsilon > 0.$ Then for some $N \in \mathbb{N}$, for $n \geq N,$ $\|a_n - L\| < \epsilon$. Since $f(n)$ is strictly increasing, $f(n) \geq n$ for all $n,$ so if $n \geq N,$ then $f(n) \geq n \geq N,$ and $\|a_{f(n)} - L\| < \epsilon.$ $\square$

This theorem also implies that a sequence is not convergent if it has a subsequence that does not converge, or if two subsequences converge to different limits, for example, $a_n = (-1)^n,$ where $a_{2n}$ converges to $1$ but $a_{2n+1}$ converges to $-1$.

We can also use this to find some limits. For example,

$$ \lim_{n \to \infty} \left ( 1 + \frac{1}{n+3} \right )^n $$

can be factored into

$$ \lim_{n \to \infty} \left ( 1 + \frac{1}{n+3} \right )^{n+3} \cdot \left (1 + \frac{1}{n+3} \right )^{-3} $$

The left factor is a subsequence of $\left ( 1 + \frac{1}{n} \right )^n$ which goes to $e,$ and the right factor goes to $1,$ so the limit of the whole expression is $e.$

## Bolzano-Weirstrass Theorem

The **Bolzano-Weirstrass Theorem** states that if a sequence of real numbers is bounded, then it has a convergent subsequence.

## Cauchy Sequences

A sequence is said to be **Cauchy** if for every $\epsilon > 0$, there exists a natural $N$ for which $\|a_m - a_n\| < \epsilon$ whenever $m, n > N.$  In other words, as we go further in the sequence, the terms get arbitrarily closer together.

A sequence is Cauchy if and only if it is convergent.

## Lim Sup and Lim Inf

Suppose the real sequence $a_n$ is bounded. Then

$$ \limsup_{n \to \infty} a_n = \lim_{n \to \infty} \sup\{a_n, a_{n+1}, \dots \} $$

$$ \liminf_{n \to \infty} a_n = \lim_{n \to \infty} \inf\{a_n, a_{n+1}, \dots \} $$

We can think of $\limsup_{n \to \infty}{a_n}$ as giving the smallest upper bound that the terms of $a_n$ get arbitrarily close to, but do not exceed, as $n$ increases indefinitely, and $\liminf_{n \to \infty}{a_n}$ as giving the greatest lower bound that the terms of $a_n$ get close to, but do not exceed, as $n$ increases indefinitely.

If we define

$$ b_n = \sup{\{a_n, a_{n+1}, \dots\}}, $$

then we know $b_n$ is bounded because $a_n$ is bounded. Now, $b_1 = \sup{\\{a_1, a_2, \dots\\}}$ is the least upper bound of all the terms in $a_n$ and $b_2 = \sup{\\{a_2, a_3, \dots\\}}$ is the least upper bound of all the terms in $a_n$ except $a_1$ and $a_2$; therefore $b_2$ must be less than or equal to $b_1$ since removing terms can only lower the least upper bound. The patterns holds for all $b_n$, so $b_n$ is a decreasing sequence. Since it is decreasing and bounded, the Monotone Convergence Theorem tells us that $b_n$ converges. We can make a similar argument about

$$ c_n = \inf{\{a_n, a_{n+1}, \dots\}}, $$

which is bounded and increasing and also converges.

If a sequence $a_n$ is convergent, then $\limsup_{n \to \infty}{a_n} = \liminf_{n \to \infty}{a_n}.$

If a sequence $a_n$ is bounded, then $\liminf_{n \to \infty}{a_n} \leq \limsup_{n \to \infty}{a_n}.$

If a sequence $a_n$ is bounded above, then $\limsup_{n \to \infty}{a_n} = \lim_{n \to \infty}\sup{\\{a_n, a_{n+1}, \dots\\}}.$

If a sequence $a_n$ is not bounded above, then $\limsup_{n \to \infty}{a_n} = \infty.$

If a sequence $a_n$ is bounded below then $\liminf_{n \to \infty}{a_n} = \lim_{n \to \infty}\inf{\\{a_n, a_{n+1}, \dots\\}}.$

If a sequence $a_n$ is not bounded below, then $\liminf_{n \to \infty}{a_n} = -\infty.$
