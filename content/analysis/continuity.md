---
description: Continuity in Euclidean and Metric Spaces
layout: page
title: Continuity in Euclidean and Metric Spaces
---

# Limits of Functions

:::definition
Let $X$ and $Y$ be @metric-spaces; suppose $E \subset X,$ $f : E \to Y,$ and $p$ is a @limit-point of $E.$ We write $f(x) \to q$ as $x \to p,$ or

$$ \lim_{x \to p} f(x) = q $$

if there is a point $q \in Y$ with the following property: For every $\epsilon > 0,$ there exists a $\delta > 0$ such that

$$ d_Y(f(x), q) < \epsilon $$

for all points $x \in E$ for which

$$ 0 < d_X(x,p) < \delta. $$
:::
:::note
In the above definition, the symbols $d_X$ and $d_Y$ refer to distances in $X$ and $Y,$ respectively.

Furthermore, while $p \in X,$ $p$ need not be a point of $E.$ In fact, even if $p \in E,$ it's possible that $f(p) \neq \lim_{x \to p} f(x).$
:::

:::theorem {label: limit-of-a-function-is-a-limit-of-a-sequence}
Let $X$ and $Y$ be @metric-spaces; suppose $E \subset X,$ $f : E \to Y,$ and $p$ is a @limit-point of $E.$ Then

$$ \lim_{x \to p} f(x) = q \tag{a} $$

if and only if

$$ \lim_{n \to \infty} f(p_n) = q \tag{b} $$

for every @sequence $\{p_n\}$ in $E$ such that

$$ p_n \neq p, \quad \lim_{n \to \infty} p_n = p. \tag{c} $$

::::proof {tags: contrapositive}
Suppose that (a) is true and let $\{p_n\} \subset E$ be a @sequence such that (c) holds. Let $\epsilon > 0.$ Then, for some $\delta > 0,$ if $d_X(x,p) < \delta,$ then $d_Y(f(x), q) < \epsilon.$ Now, there is also some $N$ such that $d_X(p_n, p) < \delta$ whenever $n \geq N,$ and thus, $d_Y(f(p_n), q) < \epsilon$ whenever $n \geq N,$ so (b) holds.

Conversely, suppose that (a) is false. Then, for some $\epsilon > 0,$ that for every $\delta > 0$ there exists a point $x \in E$ such that $d_Y(f(x), q) \geq \epsilon$ but $0 < d_X(x, p) < \delta.$ If we let $\delta_n = 1/n, n = 1, 2, 3, \dots,$ and each $x_n$ a point such that $0 < d_X(x_n, p) < \delta_n,$ then $\{x_n\}$ is a @sequence satisfying (c). However, since $d_Y(f(x_n), q) \geq \epsilon$ for all $n,$ (b) does not hold.
::::

::::corollary {label: limits-of-a-function-at-a-point-is-unique}
If $f$ has a @limit at $p,$ this @limit is unique.
::::
:::
