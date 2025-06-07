---
layout: page
title: Metric Spaces
description: Introduces metric spaces through axioms and examples, covering the definition of distance functions and fundamental geometric concepts like segments, intervals, cells, and balls.
---

# Metric Spaces

**Note:** This section was developed by following Rudin, *Principles of Mathematical Analysis*, Chapter 2.

## Definition of a Metric Space

A set $X,$ whose elements we'll call points, together with a distance function $d: X \times X \to \mathbb{R}$ is called a **metric space** and the distance function $d$ is called a **metric,** if the following conditions, called the metric axioms, hold for $p, q, r \in X:$

* If $p \neq q, d(p,q) > 0.$ (distance is always positive between two distinct points.)

* $d(p,p) = 0.$ (distance is always zero between a point and itself.)

* $d(p,q) = d(q,p).$ (the distance from $p$ to $q$ is the same as the distance from $q$ to $p$.)

* $d(p,q) \leq d(p,r) + d(r,p)$ (triangle inequality.)

We can denote a metric space on set $X$ with metric $d$ as the tuple $(X, d).$

## Examples of Metric Spaces

*Theorem:* $(\mathbb{R}^n, d : \mathbb{R}^n \to \mathbb{R} = | \vec{x} - \vec{y} |)$ is a metric space for any $n \geq 0.$

*Proof:* First, for $n = 0$, $\mathbb{R}^0$ is just the empty set, so the metric axioms are vaccuously satisfied for all points in the set. Now, for $n \geq 1,$

* Let $p, q \in R^n, p \neq q.$ Then $|p - q| < 0,$ so $d(p,q) > 0.$

* Let $p \in R^n.$ $p - p = 0,$ so $|p - p| = 0,$ so $d(p,p) = 0.$

* Let $p, q \in R^n.$ $|p - q| = |q - p|, so $d(p,q) = d(q, p).$

* Let $p, q, r$ \in $R^n.$ $|p - q| \leq |p - r| + |r - p|,$ so $d(p,q) \leq d(p,r) + d(r, p).$

Therefore, $d$ is a metric on $R^n$ and $(R^n, d)$ is a metric space. $\square.$

Note that $R^n$ by itself is just a vector space, but together with a norm forms becomes a metric space. The proof above relies on the properties of norms without going into detail - norms are similar to distance metrics but they are even stricter because they require homogeneity - $a|x| = |ax|.$

We could define other, non-norm metrics on $R^n,$ such as the **discrete metric,** which works for any set $X.$ The discrete metric is defined as:

$$
d(x, y) = \begin{cases}
0 & \text{if } x = y \\
1 & \text{if } x \neq y
\end{cases}
$$

It's easy to see that this satisfies the metric axioms above for any set.

Also note that every subset $Y$ of a metric space $X$ is also a metric space, since if the metric axioms hold for all points in $X,$ that necessarily includes the points in $Y.$

## Segments, Intervals, Cells and Balls

A **segment** $(a, b)$ is the set of all real numbers $x$ such that $a < x < b.$

A **interval** $[a, b]$ is the set of all real numbers $x$ such that $a \leq x \leq b.$

A **half-open interval** $(a,b]$ or $[a, b)$ is the set of all real numbers such that $a < x \leq b$ or $a \leq x < b,$ respectively.

Given $\vec{a}, \vec{b} \in \mathbb{R}^k,$ if $\vec{a}_i < \vec{b}_i$ for all $i = 1, 2, \dots, k,$ then the set of all points $\vec{x}$ who satisfy $\vec{a}_i \leq \vec{x}_i \leq \vec{b}_i,$ $i = 1, 2, \dots, k,$ is called a **k-cell**. So, a 1-cell is an interval, a 2-cell is a rectangle, and so on.

Given $\vec{x} \in \mathbb{R}^k, r > 0,$ the open or closed **ball** with center $\vec{x}$ and radius $r$ is defined as the set of points $\vec{y}$ such that $|\vec{x} - \vec{y}| < r$ or $|\vec{x} - \vec{y}| \leq r,$ respectively.

## Convex Sets

A set $E \subset \mathbb{R}^k$ is said to be **convex** if

$$ \lambda \vec{x} + (1 - \lambda)\vec{y} \in E $$

whenever $\vec{x}, \vec{y} \in E,$ and $0 < \lambda < 1.$

In geometric terms, this means a set is convex if we can connect any two points in the set with a line segment whose points are all within the set.

*Theorem*: Balls are convex.

*Proof*: Let $\vec{y}, \vec{z}$ be points in a ball with center $\vec{x}$ and radius $r$. Then, by definition, $|\vec{y} - \vec{x}| < r,$ and $|\vec{z} - \vec{x}| < r.$ Suppose $\vec{p} \in \{ \lambda \vec{y} + (1 - \lambda)\vec{z} | 0 < \lambda < 1 \}.$ We will show that $|\vec{x} - \vec{p}| < r.$

$$ \begin{aligned}
  
  |\vec{x}-\vec{p}| &= |\vec{x} - (\lambda\vec{y} + (1-\lambda)\vec{z})| \quad(\text{substitute definition of } \vec{p})\\
  &= |\vec{x} - \lambda\vec{y} - (1-\lambda)\vec{z}| \quad(\text{distribute the } - )\\
  &= |\vec{x} - \lambda\vec{y} - (\vec{z} - \lambda\vec{z})| \quad(\text{rewrite }(1-\lambda)\vec{z})\\
  &= |\vec{x} - \lambda\vec{y} - \vec{z} + \lambda\vec{z}| \quad(\text{expand parentheses})\\
  &= |\vec{x} - \lambda\vec{y} - \vec{z} + \lambda\vec{z} + \lambda\vec{x} - \lambda\vec{x}| \quad(\text{add and subtract } \lambda\vec{x})\\
  &= |\lambda(\vec{x}-\vec{y}) + (1-\lambda)(\vec{x}-\vec{z})| \quad(\text{factor } \lambda \text{ and } 1-\lambda)\\
  &\le \lambda\,|\vec{x}-\vec{y}| + (1-\lambda)\,|\vec{x}-\vec{z}| \quad(\text{triangle inequality})\\
  & < \lambda r + (1-\lambda)r \quad(\text{since } |\vec{x}-\vec{y}|,|\vec{x}-\vec{z}| < r)\\
  &= r \quad(\text{because } \lambda + (1-\lambda)=1).
\end{aligned} $$

So, $\vec{p}$ is within our ball and therefore all balls are convex. $\square$

Similar proofs can be used to show that closed balls and $k$-cells are also convex.
