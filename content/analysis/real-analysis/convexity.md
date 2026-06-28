---
layout: page
title: Convexity
---

# Convexity
:::definition "Convex Function"
Let $E \subseteq \mathbb{R}^k$ be a @convex-set. A function $\varphi : E \to \mathbb{R}$ is **convex** if

$$ \varphi\big(\lambda \vec{x} + (1 - \lambda) \vec{y}\big) \leq \lambda \varphi(\vec{x}) + (1 - \lambda)\varphi(\vec{y}) $$

whenever $\vec{x}, \vec{y} \in E$ and $0 < \lambda < 1.$

In geometric terms, this means a @chord joining any two points on the graph of $\varphi$ lies on or above the graph between them.   
:::

:::definition "Strictly Convex Function"
Starting with @convex-function, $\varphi$ is **strictly convex** if the inequality is strict whenever $\vec{x} \neq \vec{y}.$
:::

:::definition "Concave Function"
A function $\varphi$ is said to be **concave** if $-\varphi$ is a @convex-function.
:::
