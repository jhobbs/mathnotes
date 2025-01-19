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