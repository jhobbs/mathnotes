---
layout: page
title: Topology
---

# Topology

Given two sets, $A$ and $B$, if there is a bijection (a one-to-one mapping of $A$ onto $B$) between $A$ and $B$, we say $A$ and $B$ have the same cardinal number, or that $A$ and $B$ are equivalent. We denote this as $A \sim B$.

A set $A$ is said to be **countable** if there exists a bijection between $A$ and the set of all positive integers $\mathbb{Z}_{>0}$, that is, if $A \sim \mathbb{Z}_{>0}.$

*Theorem*: Every infinite subset $E$ of a countably infinite set $A$ is countable.

*Proof*: Assume $A$ is countably infinite, $E \subset A,$ and $|E| = \infty.$ Arrange a sequence ${x_n}$ from the distinct elements of $A$. Let $n_1$ be the smallest positive integer such that $x_{n_1} \in E,$ and then pick $n_2, \dots, n_{k-1}$ by assigning the next $n$ in the sequence the index of the left-most entry in ${x_n}$ that has not yet been picked. Then, let $n_k$ be the smallest integer greater than $n_{k-1}$ such that $x_{n_k} \in E.$ Now, ${n_k}$ is a sequence of strictly increasing positive integers giving us the indices of the first $k$ elements of $E$ in ${x_n}.$

Now, define $f : \mathbb{Z}_{>0} \to E$ as $f(k) = {x_{k_n}}$, which is a bijection between the positive integers and $E$, showing that $E$ is countable. $\square$

*Intuition:* We can show this by putting $A$ into a sequence ${x_n}$ of distinct values, so it can be indexed with the positive integers, and then constructing a subsequence of ${x_n}$ that are only the indices of elements of $E.$

As an example, consider the even numbers ${0, 2, 4, \dots}$ as a subset of the non-negative integers ${0, 1, 2, \dots}.$ Then, the indices of the even numbers are ${1, 3, 5, \dots},$ and $f(1) = 0, f(1) = 2, \dots.$
