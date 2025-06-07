---
layout: page
title: Metric Spaces
---

# Metric Spaces

**Note:** This section was developed by following Rudin, *Principles of Mathematical Analysis*, Chapter 2.

A set $X,$ whose elements we'll call points, together with a distance function $d: X \times X \to \mathbb{R}$ is called a **metric space** and the distance function $d$ is called a **metric,** if the following conditions, called the metric axioms, hold for $p, q, r \in X:$

* If $p \neq q, d(p,q) > 0.$ (distance is always positive between two distinct points.)

* $d(p,p) = 0.$ (distance is always zero between a point and itself.)

* $d(p,q) = d(q,p).$ (the distance from $p$ to $q$ is the same as the distance from $q$ to $p$.)

* $d(p,q) \leq d(p,r) + d(r,p)$ (triangle inequality.)

We can denote a metric space on set $X$ with metric $d$ as the tuple $(X, d).$

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
