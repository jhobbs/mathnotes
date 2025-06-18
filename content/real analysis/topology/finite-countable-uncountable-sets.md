---
layout: page
redirect_from:
- real analysis/topology
title: Finite, Countable, and Uncountable Sets
description: Explores set cardinality through bijections, proving countability of rationals and uncountability of reals using Cantor's diagonalization argument.
---

# Finite, Countable, and Uncountable Sets

**Note:** This section was developed by following Rudin, *Principles of Mathematical Analysis*, Chapter 2. The definitions and theorems are directly or nearly directly from there, but the proofs are at least attempts at expressing my own understanding.

## Cardinality and Countability

Given two sets, $A$ and $B$, if there is a bijection (a one-to-one mapping of $A$ onto $B$) between $A$ and $B$, we say $A$ and $B$ have the same cardinal number, or that $A$ and $B$ are equivalent. We denote this as $A \sim B$.

A set $A$ is said to be **finite** if $A \sim \mathbb{N}_n$ for some $n.$

A set $A$ is said to be **infinite** it is not finite.

A set $A$ is said to be **countable** if there exists a bijection between $A$ and the set of all positive integers $\mathbb{Z}_{>0}$, that is, if $A \sim \mathbb{Z}_{>0}.$

A set $A$ is said to be **uncountable** if it is neither finite nor countable.

A set $A$ is said to be **at most countable** if $A$ is finite or countable.

### Countably Infinite Sets

*Theorem*: Every infinite subset $E$ of a countably infinite set $A$ is countable.

*Proof*: Assume $A$ is countably infinite, $E \subset A,$ and $|E| = \infty.$ Arrange a sequence $\{x_n\}$ from the distinct elements of $A$. Let $n_1$ be the smallest positive integer such that $x_{n_1} \in E,$ and then pick $n_2, \dots, n_{k-1}$ by assigning the next $n$ in the sequence the index of the left-most entry in $\{x_n\}$ that has not yet been picked. Then, let $n_k$ be the smallest integer greater than $n_{k-1}$ such that $x_{n_k} \in E.$ Now, $\{n_k\}$ is a sequence of strictly increasing positive integers giving us the indices of the first $k$ elements of $E$ in $\{x_n\}.$

Now, define $f : \mathbb{Z}_{>0} \to E$ as $f(k) = {x_{k_n}}$, which is a bijection between the positive integers and $E$, showing that $E$ is countable. $\square$

*Intuition:* We can show this by putting $A$ into a sequence $\{x_n\}$ of distinct values, so it can be indexed with the positive integers, and then constructing a subsequence of $\{x_n\}$ that are only the indices of elements of $E.$

As an example, consider the even numbers $\{0, 2, 4, \dots\}$ as a subset of the non-negative integers $\{0, 1, 2, \dots\}.$ Then, the indices of the even numbers are $\{1, 3, 5, \dots\},$ and $f(1) = 0, f(1) = 2, \dots.$

Also, note that this means that countably infinite sets are the smallest infinite sets. Any infinite subset of one has the same cardinality as the parent set, and the same cardinality of as the set of natural numbers - $\aleph_0$ - "aleph null."

### Intersections and Unions of Sets

*Theorem*: Let $\{E_n\}, n = 1, 2, 3, \dots$ be a sequence of countable sets. Then let $S = \bigcup_{n=1}^\infty E_n.$ Then, $S$ is countable.

Proof: We can construct an infinite array where the rows are sequence constructed by the sets that make up the entries of $\{E_n\}.$ Then, we can create a single sequence from all the entries of the sets of $\{E_n\}$ by iterating over them in the following order:

```python
sequence = []
for i in range(1, k):
    for j in range(0, i):
        n = i - j
        m = j + 1
        sequence.append(f"E_{n},{m}")
```

Which, for $k = 5,$ yields

$$ E_{1,1}, E_{2,1}, E_{1,2}, E_{3,1}, E_{2,2}, E_{1,3}, E_{4,1}, E_{3,2}, E_{2,3}, E_{1,4}. $$

This sequence may contain duplicates, so some indices may need to be skipped in constructing a subset $T$ of the positive integers such that $T ~ S,$ but we've now shown that $S$ is at most countable. To show $S$ is infinite and therefore countable, note that the infinite set $E_1$ is a subset of $S,$, and therefore $S$ is infinite and countable. $\square$

{% include_relative countable-union.html %}

*Theorem*: Let $A$ be a countable set, and let $B_n$ be the set of all $n$-tuples $(a_1, \dots, a_n)$ where $a_k \in A (k = 1, \dots, n),$ and the elements $a_1, \dots, a_n$ need not be distinct. Then $B_n$ is countable.

*Proof*: We will proceed using proof by induction. First, for the base case, note that $B_1$ is the set of $1$-tuples formed by elements of $A$, so $B_1 = A$ and is thus countable. Now, for the inductive step, assume $B_{n-1}$ is countable $(n = 2, 3, 4, \dots).$ Then we have that

$$ B_n = \{(b,a) | b \in B_{n-1}, a \in A\} = \bigcup_{b \in B_{n-1}} ({b} \times A). $$

So, for any given $n-1$-tuple $b$, we form $n$-tuples by appending each element of $a$ to it, and so the set of pairs $(b,a)$ has the same cardinality as $A,$ and is thus countable. $B_n$ is thus the union of the countable set of countable sets (the set of sets formed by appending each element of $A$ to each element of $B_{n-1}$) and is therefore countable itself, by a theorem proved above. Therefore, by induction, every $B_n$ is countable. $\square$

{% include_relative countable-tuples.html %}

*Corollary:* The set of rational numbers is countable.

*Proof:* Rational numbers just formed from pairs of integers: $(a, b) \to a/b, b \neq 0,$ so we use the above theorem with $n = 2.$

### Uncountably Infinite Sets

*Theorem*: Let $A$ be the set of all sequences whose elements are the digits $0$ and $1$. This set $A$ is uncountable.

*Proof*: Let $E$ be a countable subset of $A,$ and call the elements of $E$ $s_1, s_2, s_3, \dots.$ We will construct a new sequence $p$ in the following way:

$$ p_n = \neg s_{n_n}, n = 1, 2, 3, \dots $$

That is, the $n$th digit of $p$ will be the opposite of whatever the $n$th digit of $s_n$ is. So, $p$ differs from $s_1$ in the first digit, from $s_2$ in the second digit, $s_3$ in the third digit, and so on, so that it differs from all elements of $E,$ and therefore is not contained in $E.$ But, $p$ is definitely in $A$ since it its elements are the digits $0$ and $1.$ Therefore, $E$ is a proper subset of $A,$ so any countable subset of $A$ must be a proper subset of $A.$ But, $A$ can't be a proper subset of itself, and therefore $A$ must be uncountable. $\square$ 

This approach to proving this theorem is due to Cantor and is called diagonalization, and the animation below illustrates why.

{% include_relative diagonalization.html %}

*Corollary:* There set of real numbers is uncountable.

I won't give a full proof here, but this can be accomplished by considering the binary representation of real numbers in the interval $[0, 1)$ consists of infinite sequences of $0$ and $1$.
