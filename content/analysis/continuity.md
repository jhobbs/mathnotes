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
