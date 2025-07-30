---
layout: page
redirect_from:
- calculus/real-numbers
title: Real Numbers
description: Axiomatically defines the real numbers as an ordered complete field, covering field axioms, order properties, completeness, supremum and infimum, and the absolute value function.
---

# Real Numbers

The real numbers $\mathbb{R}$ are a set of objects along with two binary operations $+ : \mathbb{R} \times \mathbb{R} \to \mathbb{R}$ and $\cdot : \mathbb{R} \times \mathbb{R} \to \mathbb{R}$ that satisfy the 9 field axioms along with the Order axiom and the Completeness axiom. That is, the reals are an ordered, complete field.

We know that a [[field is a commutative division ring|algebra/abstract/rings]].

The **Order axiom** states that there exists a subset of $\mathbb{R}^+$ of $\mathbb{R}$ such that for all $a, b \in \mathbb{R}^+,a + b \in \mathbb{R}^+, a \cdot b \in \mathbb{R}^+.$ and for all $a \in \mathbb{R}$ exactly one of the following is true: (i) $a \in \mathbb{R}^+$, (ii) $-a \in \mathbb{R}^+$, or (iii) $a = 0$.

A more familiar and equivalent way of stating this can be achieved by defining $a < b$ to mean $b + (-a) \in \mathbb{R}^+$, and $a > b$ to mean $a + (-b) \in \mathbb{R}^+$, for $a, b, c \in \mathbb{R}$,

* Exactly one of the following is true: $a < b, ~ a > b,$ or $a = b$.

* If $a < b$ and $c > 0$, we have $a \cdot c < b \cdot c.$

* If $a < b$ and $b < c$ then $a < c$ (transitivity).

Note that rational numbers also satisfy the field axioms and the Order axiom. Complex numbers satisfy the field axioms but not the Order axiom because there is no total ordering that can be defined on complex numbers.

To give the Completeness axiom, we must first define what a least upper bound is. The number $m$ is said to be an **upper bound** of a nonempty set $A$ if $x \leq m$ for all $x \in A$. The number $L$ is said to be the **least upper bound** of the set $A$ if it's an upper bound of $A$ and if $L \leq m$ for all upper bounds $m$ of $A$. Note that neither an upper bound nor a least upper bound need to be in $A$.

The least upper bound is also known as the **supremum.** There is also a concept of a **greatest lower bound**, which is a lower bound that is greater than or equal to every other lower bound. The greatest lower bound is also known as the **infimum.**

The **Completeness axiom** states that every nonempty subset $A$ of $\mathbb{R}$ that's bounded above has a least upper bound.

One consequence of the Completeness axiom is that the real numbers contain numbers that are not rational. For example, the subset of $\mathbb{R}$ that is the finite decimal approximations of $\sqrt{5}$ is,


$$ \{2, 2.2, 2.23, 2.236, \dots \}, $$

must have a supremum due to the Completeness axiom. That supremum is $\sqrt{5}$, but $\sqrt{5}$ is not rational, therefore, the reals contain non-rational numbers.

The **absolute value** of a real number is defined as follows:

$$ |x| = \begin{cases} x & \text{if } x \geq 0 \\ -x & \text{if } x < 0 \end{cases}. $$

One fact that follow from this definition is that for $a, b \in \mathbb{R}$, if $\|a\| < b$, then $-b < a < b$. *Proof*: We have two cases to consider:

* If $a >= 0$, then $\|a\| = a$, so $a < b$. Since $a$ is positive, $b$ must also be positive, and therefore $-b$ must be negative, and so $-b < a < b$.

* If $a < 0$, then $\|a\| = -a$, so $-a < b$. Since $a$ is negative, $-a$ must be positive, so $b$ must also be positive, and therefore $a < b$. Now, $-a < b \iff a > -b \iff -b < a$, and therefore $-b < a < b.$ $\square$

Another fact is that the absolute value function is a norm, and thus satisfies the triangle inequality. For real $a, b$:

$$ |a + b| \leq |a| + |b| $$
