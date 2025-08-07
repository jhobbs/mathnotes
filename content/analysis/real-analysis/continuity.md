---
description: Explores the epsilon-delta definition of continuity and fundamental continuity
  theorems including the Intermediate Value Theorem, Boundedness Theorem, and Extreme
  Value Theorem.
layout: page
test: change
title: Continuity
---

# Continuity

## Limit Definition of Continuity

Let $A$ be a set of real numbers and $f(x)$ a function $f : A \to \mathbb{R}.$ We say that $f(x)$ is **continuous** at $a$ if $\lim_{x \to a}{f(x)} = f(a).$

In other words, $f(a)$ exists, the limit of $f(x)$ as $x$ approaches $a$ exists, and these two values are equal.

## Epsilon-Delta Definition of Continuity

This is an equivalent definition of continuity.

*Theorem:* Let $A$ be a set of real numbers and $f(x)$ a function from $A$ into $\mathbb{R}.$ Assume also that $a$ is a real number and for every $\delta > 0,$ there exists numbers $x \in A$ satisfying $0 < \|x - a\| < \delta.$ Then $f(x)$ is continuous at $a$ if and only if for every $\epsilon > 0$ there exists $\delta > 0$ such that $\|f(x) - f(a)\| < \epsilon$ if $\|x - a\| < \delta$ and $x \in A.$

This is basically saying that we can choose as small of a change from $f(a)$ to $f(x)$ as we want ($\epsilon$) by picking a value of $x$ close enough to $a$ ($\delta.$)

## Continuity Rules

*Theorem:* Suppose $f(x)$ and $g(x)$ are continuous at $a,$ and $c$ is a real number. Then we have that:

1. $f(x) + cg(x)$ is continuous at $a.$

2. $f(x)g(x)$ is continuous at $a$.

3. $\frac{f(x)}{g(x)}$ is continuous at $a$ if $g(a) \neq 0.$

4. $f(g(x))$ is continuous at $a.$

A function is said to be continuous if it's continuous for all points in its domain. A function is said to be continuous on $[a, b]$ if it's continuous for all values in $(a, b),$ it's continuous from the right at $a$ and it's continuous from the left at $b.$

## More Theorems Related to Continuity

*Intermediate Value Theorem:* Suppose $f : [a, b] \to \mathbb{R}$ is continuous and that $r$ is a value between $f(a)$ and $f(b).$ Then there exists a number $c$ in $(a, b)$ for which $f(c) = r.$

*Boundedness Theorem:* If $f$ is continuous on $[a, b]$ then it's bounded on $[a, b].$

*Extereme Value Theorem:* If $f$ is continuous on $[a, b]$ then $f$ attains absolute minimum and absolume maximum values on $[a, b].$