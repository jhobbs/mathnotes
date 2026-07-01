---
description: Stochastic processes with transition matrices, ergodic properties, and
  steady-state probability calculations using linear algebra methods.
layout: page
title: Markov Chains
---

# Markov Chains

:::definition "Markov Chain"
If we have a system with N states and for each state, a set of N probabilities from transitioning from that state to another state (including itself) we end up with an $NxN$ matrix $P$ where the entry $P_{jk}, j,k \in {1, \dots, N}$ represents the probability of transitioning from state $j$ to state $k$.

Starting with some state, we can transition to another state, then another, with the probability of picking the next state dependent only on the existing state and the matrix $P.$ We call this sequence of random events a **Markov Chain**.

More formally, the sequence $X_1, X_2, \dots$ is called a Markov Chain if

$$ P(X_{n+1} = k|X_n = j, X_{n-1} = j_{n-1}, \dots, X_0 = j_0) = P(X_{n+1} = k | X_n = j). $$

We write

$$ p_{jk} = P(X_{n+1} = k | X_n = j), $$

and note that

$$ p_{jk} \geq 0 $$

and

$$ \sum_{k=0}^{N} p_{jk} =  1 $$

for $j = 1,2, \dots, N.$ We call the $p_{jk}$ values the transition probabilities of the Markov chain.
:::
:::note
Note that $p_{jk}$ is the probability of going from state $j$ to state $k$ in one step. We use the notation

$$ p_{jk}^{(m)} $$

to represent the probability of going from state $j$ to state $k$ in $m$ steps.
:::

:::theorem
$p_{jk}^{(m)} = P_{jk}^m.$  
::::proof

Due to the magic of linear algebra, if we have a row vector $\vec{x}$ representing the probability of starting in each state, we can compute the probability of ending up in any given state after $m$ steps as

$$ \vec{x} \cdot P^m. $$
::::
:::

## Ergodic Markov Chains

:::definition "Ergodic"
If for some positive integer $m$ we have that $p_{jk}^{(m)} > 0$ for all $j,k = 1,2,\dots,N,$ then the Markov chain is said to be **ergodic.**
:::


When the @markov-chain is @ergodic, the limit

$$ \pi_k = \lim_{n \to \infty} p_{jk}^{(n)} $$

exists and

$$ \sum_{k=1}^N \pi_k = 1. $$

Here, $\vec{\pi} = \langle \pi_1, \pi_2, \dots, \pi_N \rangle$ and the entries in it represent the long term probabilities of being in any given state, or equivalently, the portion of time spent in any given state.

Note that $\vec{\pi} \cdot P = \vec{\pi},$ which when combined with the fact that the entries of $\vec{\pi}$ sum to 1 lets us solve a linear system of equations to find the entries of $\vec{\pi}.$

:::definition "Stochastic Matrix" {synonyms: "probability matrix", "transition matrix", "Markov matrix", "right stochastic matrix", "row stochastic matrix"}
A **stochastic matrix** (actually, a right stochastic matrix) is a @square-matrix $A = (a_{ij}) \in \mathbb{R}^{n \times n}$ with nonnegative @entries whose rows each sum to one:

$$a_{ij} \geq 0 \quad \text{for all } i,j, \qquad \sum_{j} a_{ij} = 1 \quad \text{for all } i.$$

Equivalently, $A\mathbf{1} = \mathbf{1}$ with $A \geq 0$ entrywise, where $\mathbf{1}$ is the all-ones vector.
:::

:::definition "Left Stochastic Matrix" {synonyms: "column stochastic matrix"}
A **left stochastic matrix** is a @square-matrix $A = (a_{ij}) \in \mathbb{R}^{n \times n}$ with nonnegative @entries whose columns each sum to one:
$$a_{ij} \geq 0 \quad \text{for all } i,j, \qquad \sum_{i} a_{ij} = 1 \quad \text{for all } j.$$
Equivalently, $\mathbf{1}^\top A = \mathbf{1}^\top$ with $A \geq 0$ entrywise, where $\mathbf{1}$ is the all-ones vector.
:::

A @stochastic-matrix can be used to describe the transitions of a @markov-chain.

:::definition "Doubly Stochastic Matrix" {synonyms: "bistochastic matrix"}
If a @matrix is both a @row-stochastic-matrix and a @column-stochastic-matrix, it is said to be a **doubly stochastic matrix.** That is, both its rows and its columns sum to 1.
:::

:::note
A @doubly-stochastic-matrix is a @convex-combination of @permutation-matrices.
:::

A @stochastic-matrix maps a probability vector to another probability vector — but only for the matching multiplication convention. A @row-stochastic-matrix preserves the sum acting on the right, $\vec{x}^\top A$; a @column-stochastic-matrix preserves it acting on the left, $A\vec{x}$; and a @doubly-stochastic-matrix preserves it either way. The demo below lets you apply each type to a probability vector, build doubly-stochastic matrices as convex combinations of permutation matrices, and iterate the map toward its stationary distribution.

{% include_demo "stochastic-matrix" %}
