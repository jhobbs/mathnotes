---
description: Algebraic structures with two operations - rings and fields including
  their axioms and fundamental properties.
layout: page
title: Rings and Fields
---

# Rings

:::definition "Ring"
A **ring** is a set together with two binary operations $+$ and $\cdot$, which we will call addition and multiplication, such that the following axioms are satisfied:

1. $\langle R, + \rangle$ is an @Abelian @group.

2. Multiplication is associative.

3. For all $a,b,c \in R$, the left distributive law and the right distribute law hold, i.e.

$$ a \cdot (b + c) = (a \cdot b) + (a \cdot c), \quad (a + b) \cdot c = (a \cdot c) + (b \cdot c). $$
:::

For example, the integers, rationals, reals and complex numbers are all rings with the usual addition and multiplication.

:::definition "Ring Homomorphism"
A **ring homomorphism** $\phi : R \to R'$ must satisfy the following two properties:

1. $\phi{(a+b)} = \phi{(a)} + \phi{(b)}.$ 

2. $\phi{(ab)} = \phi{(a)}\phi{(b)}.$
:::

A ring doesn't have to have a multiplicative identity element, but it can. If it has one, it's denoted $1$ and for all $a$ in $R$ satisfies $a1 = 1a = a$.

:::definition "unity"
The element $1$ is also called **unity**.
:::

:::definition "Commutative Ring"
A ring in which multiplication is commutative is called a **commutative ring**.
:::

:::definition "Ring with Unity"
A ring that has a multiplicative identity element is called a **ring with unity.**
:::

:::definition "Multiplicative Inverse"
For some element $a$ in a ring with unity $R$ where $1 \neq 0$, if $a^{-1} \in R$ such that $aa^{-1} = a^{-1}a = 1$, $a^{-1}$ is said to be the **multiplicative inverse** of $a.$
:::

:::definition "Unit"
If $a$ has a multiplicative inverse in $R,$ $a$ is said to be a **unit** in $R$.
:::

### Fields

:::definition "Division Ring"
Let $R$ be a ring with unity. If every nonzero element of $R$ is a unit (has a multiplicative inverse), then $R$ is called a **division ring.**
:::

:::definition "Field"
A commutative division ring is called a **field**.
:::

For example, the integers are not a field, but the rationals, the reals, and the complex numbers are all fields.