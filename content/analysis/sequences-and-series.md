---
description: Sequences and Series in Euclidean and Metric Spaces
layout: page
title: Sequences and Series
---

# Sequences

Review the definition of a sequence

@embed{sequence}

:::definition "Converge"
A sequence $\{p_n\}$ in a @metric-space $X$ is said to **converge** if there is a point $p \in X$ with the following property: For every $\epsilon > 0,$ there is an integer $N$ such that $n \geq N$ implies that $d(p_n, p) < \epsilon.$ 
:::

:::definition "Limit"
If a @sequence $\{p_n\}$ converges to $p,$ we say that $p$ is the **limit** of $\{p_n\},$ denoted as:

$$ \lim_{n \to \infty} p_n = p. $$
:::

:::definition "Diverge"
If a @sequence $\{p_n\}$ does not @converge, it is said to **diverge.**
:::

:::definition "Range (sequence)"
The set of all points $p_n$ of a sequence $\{p_n\} (n = 1, 2, 3, \dots)$ is the **@range** of $\{p_n\}.$
:::

:::note {label: sequence-range-cardinality}
The @{range|range-sequence} of a @sequence may be @finite or it may be @infinite.
:::

:::definition "Bounded (sequence)"
The @sequence $\{p_n\}$ is said to be **bounded** if its @{range|range-sequence} is @bounded.
:::

:::note {label: sequence-theorems-context}
In the following theorems, let $\{p_n\}$ be a @sequence in a @metric-space $X.$
:::

:::theorem {label: sequence-converges-iff-neighborhood-contains-all-but-finitely-many}
$\{p_n\}$ converges to $p \in X$ if and only if every neighborhood of $p$ contains $p_n$ for all but finitely many $n.$

::::proof
Suppose $\{p_n\}$ @{converges|converge} to $p \in X.$ Let $\epsilon > 0.$ For some integer $N,$ $d(p, p_n) < \epsilon$ when $n > N.$ Therefore, $p_n \in B_\epsilon(p)$ for all but the finitely many $p_n$ where $n \leq N.$ 

Conversely, suppose every @neighborhood of $p$ contains all but finitely many $p_n,$ i.e., for all but $N$ elements of $\{p_n\}.$ Let $\epsilon > 0.$ Then, $p_n \in B_\epsilon(p)$ whenever $n \geq N,$ therefore, $d(p, p_n) < \epsilon.$
::::
:::
