---
layout: page
title: Connected Sets
description: An introduction to conneceted sets
---

:::note
This section was developed by following Rudin, *Principles of Mathematical Analysis*, Chapter 2.
:::

# Connected Sets

:::definition "Separated"
Two subsets $A$ and $B$ of a metric space $X$ are said to be **separated** if both $A \cap \overline{B}$ and $\overline{A} \cap B$ are empty, i.e., if no point of $A$ lies in the closure of $B$ and no point of $B$ lies in the closure of $A.$
:::

:::definition "Connected"
If $X$ is a metric space, a set $E \subset X$ is said to be **connected** if $E$ is not a union of two nonempty separated sets.
:::

We have a different - less general, but compatible - definition of connected from complex analysis:

@embed{connected-complex}

This theorem helps connect the two definitions.

:::theorem
A subset $E$ of the real line $R^1$ is connected if and only if it has the following property: If $x \in E, y \in E,$ and $x < z < y,$ then $z \in E.$

::::proof
We will proceed both sides of the implication by proving the contrapositive, i.e., that if the interval property doesn't hold, then the set isn't connected, and conversely, that if the set isn't connected, the interval property doesn't hold.

Suppose $x, y \in E$ and $z \in (x, y), z \notin E.$ Then $E = A_z \cup B_z,$ where

$$ A_z = E \cap (- \infty, z), \quad B_z = E \cap (z, \infty). $$

Since $x \in A_z$ and $y \in B_z,$ they are nonempty, and since $A_z \subset (- \infty, z)$ and $B_z \subset (z, \infty),$ they are separated. Therefore, $E$ is not connected.

Conversely, suppose, for the sake of contradiction, that $E$ is not connected. Then there are nonempty separated sets $A$ an $B$ such that $A \cup B = E.$ Let $x \in A, y \in B$ and assume $x < y.$ Define

$$ z = \sup{(A \cap [x, y])}. $$

By @sup-is-in-closure-of-bounded-nonempty-set-of-reals, $z \in \overline{A},$ and because $A$ and $B$ are separated, $z \notin B.$ Therefore $x \leq z < y.$

If $z \notin A,$ it follows that $x < z < y,$ and $z \notin E.$

If $z \in A,$ then $z \notin \overline{B},$ hence there exists $z_1$ such that $z < z_1 < y$ and $z_1 \notin B$ (because $z \notin \overline{B}$ means there is a neighborhood of $z$ that contains no points of $B$.) Thus, $x < z_1 < y$ and $z_1 \notin E.$
::::
:::
