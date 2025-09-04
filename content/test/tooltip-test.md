---
title: Tooltip Test Page
description: Test page for math block reference tooltips
slug: tooltip-test
---

# Tooltip Test Page

This page tests the tooltip functionality for math block references.

## Basic Definitions

:::definition {label: vector-space}
A **vector space** over a field $F$ is a set $V$ together with two operations:
- Vector addition: $V \times V \to V$
- Scalar multiplication: $F \times V \to V$

satisfying the following axioms:
1. $(V, +)$ is an abelian group
2. Scalar multiplication is associative: $a(bv) = (ab)v$
3. Distributive laws hold
4. Identity: $1v = v$ for all $v \in V$
:::

:::theorem "Dimension Theorem" {label: dim-theorem}
Let $V$ be a finite-dimensional vector space and $W$ be a subspace of $V$. Then:
$$\dim(W) \leq \dim(V)$$
with equality if and only if $W = V$.

:::proof {label: dim-theorem-proof}
Let $\{w_1, \ldots, w_k\}$ be a basis for $W$. Since $W \subseteq V$, these vectors are linearly independent in $V$. By the basis extension theorem, we can extend this to a basis of $V$.
:::
:::

## Test References

Here are various types of references to test tooltips:

1. Simple reference: @vector-space
2. Typed reference: @definition:vector-space
3. Custom text reference: @{the definition of vector spaces|vector-space}
4. Theorem reference: @dim-theorem
5. Another simple reference: @theorem:dim-theorem

## Cross-References from Other Pages

Let's also test some cross-file references if they exist:

- Reference to a definition that might exist elsewhere: @continuity
- Reference to a theorem that might exist elsewhere: @ftc

## Nested Block Example

:::proposition {label: subspace-criterion}
A subset $W$ of a vector space $V$ is a subspace if and only if:
1. $0 \in W$
2. $W$ is closed under addition
3. $W$ is closed under scalar multiplication

:::example {label: symmetric-matrices-subspace}
The set of all $n \times n$ symmetric matrices forms a subspace of $M_n(\mathbb{R})$.
:::
:::

Reference to the proposition: @subspace-criterion

## Invalid References

These should show error styling:
- @nonexistent-label
- @type:wrong-label

## Math in Tooltips

:::definition {label: derivative}
The **derivative** of a function $f$ at a point $a$ is defined as:
$$f'(a) = \lim_{h \to 0} \frac{f(a + h) - f(a)}{h}$$
provided this limit exists.
:::

Reference with math: @derivative