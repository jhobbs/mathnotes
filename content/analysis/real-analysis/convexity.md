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

:::theorem "Second Derivative Test for Convexity"
Let $\varphi$ be twice @differentiable on an @open @interval $(a,b).$ Then
$\varphi$ is @convex on $(a,b)$ if and only if $\varphi''(x) \geq 0$ for all
$x \in (a,b),$ and @concave if and only if $\varphi''(x) \leq 0$ for all
$x \in (a,b).$
:::

:::definition "Convex Combination"
A **convex combination** is a @linear-combination of @points where all @coefficients are non-negative and sum to 1.
:::
:::note
Every @convex-combination of two @points lies on the @line-segment between the @points.
:::

:::theorem "Log is Concave" {label: log-is-concave}
The $\log$ @function is @concave, i.e. $-\log$ is @convex.

::::proof
The second derivative of natural $\log$ is $\frac{-1}{x^2},$ which is always non-positive. By @second-derivative-test-for-convexity, $\log$ is therefore @concave.
::::

:::
