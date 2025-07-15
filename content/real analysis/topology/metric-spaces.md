---
layout: page
title: Metric Spaces
description: Introduces metric spaces through axioms and examples, covering the definition of distance functions and fundamental geometric concepts like segments, intervals, cells, and balls.
---

# Metric Spaces

:::note
This section was developed by following Rudin, *Principles of Mathematical Analysis*, Chapter 2.
:::

## Definition of a Metric Space

:::definition "Metric Space"
A set $X,$ whose elements we'll call points, together with a distance function $d: X \times X \to \mathbb{R}$ is called a **metric space** and the distance function $d$ is called a **metric,** if the following conditions, called the metric axioms, hold for $p, q, r \in X:$

* If $p \neq q, d(p,q) > 0.$ (distance is always positive between two distinct points.)

* $d(p,p) = 0.$ (distance is always zero between a point and itself.)

* $d(p,q) = d(q,p).$ (the distance from $p$ to $q$ is the same as the distance from $q$ to $p$.)

* $d(p,q) \leq d(p,r) + d(r,p)$ (triangle inequality.)

We can denote a metric space on set $X$ with metric $d$ as the tuple $(X, d).$
:::

## Examples of Metric Spaces

The most important metric spaces are the euclidean spaes $R^n$ together with a norm.


:::theorem
$(\mathbb{R}^n, d : \mathbb{R}^n \to \mathbb{R} = | \vec{x} - \vec{y} |)$ is a metric space for any $n \geq 0.$

::::proof
First, for $n = 0$, $\mathbb{R}^0$ is just the empty set, so the metric axioms are vacuously satisfied for all points in the set. Now, for $n \geq 1,$

* Let $p, q \in R^n, p \neq q.$ Then $|p - q| < 0,$ so $d(p,q) > 0.$

* Let $p \in R^n.$ Now, $p - p = 0,$ so $|p - p| = 0,$ so $d(p,p) = 0.$

* Let $p, q \in R^n.$ $|p - q| = |q - p|,$ so $d(p,q) = d(q, p).$

* Let $p, q, r$ \in $R^n.$ $|p - q| \leq |p - r| + |r - p|,$ so $d(p,q) \leq d(p,r) + d(r, p).$

Therefore, $d$ is a metric on $R^n$ and $(R^n, d)$ is a metric space.
::::
:::


:::remark
Note that $R^n$ by itself is just a vector space, but together with a norm forms a metric space. The proof above relies on the properties of norms without going into detail - norms are similar to distance metrics but they are even stricter because they require homogeneity - $a|x| = |ax|.$

We could define other, non-norm metrics on $R^n,$ such as the **discrete metric,** which works for any set $X.$

Also note that every subset of a $Y$ of a metric space $X$ is a metric space on its own, using the same distance function.
:::

:::definition "Discrete Metric"
The discrete metric is defined as:

$$
d(x, y) = \begin{cases}
0 & \text{if } x = y \\
1 & \text{if } x \neq y
\end{cases}
$$
:::

:::remark
It's easy to see that this satisfies the metric axioms above for any set.

Also note that every subset $Y$ of a metric space $X$ is also a metric space, since if the metric axioms hold for all points in $X,$ that necessarily includes the points in $Y.$
:::


## Segments, Intervals, Cells and Balls


:::definition "Segment"
A **segment** $(a, b)$ is the set of all real numbers $x$ such that $a < x < b.$
:::

:::definition "Interval"
A **interval** $[a, b]$ is the set of all real numbers $x$ such that $a \leq x \leq b.$
:::


:::definition "Half-open Interval"
A **half-open interval** $(a,b]$ or $[a, b)$ is the set of all real numbers such that $a < x \leq b$ or $a \leq x < b,$ respectively.
:::

:::definition "k-cell"
Given $\vec{a}, \vec{b} \in \mathbb{R}^k,$ if $\vec{a}_i < \vec{b}_i$ for all $i = 1, 2, \dots, k,$ then the set of all points $\vec{x}$ who satisfy $\vec{a}_i \leq \vec{x}_i \leq \vec{b}_i,$ $i = 1, 2, \dots, k,$ is called a **k-cell**. So, a 1-cell is an interval, a 2-cell is a rectangle, and so on.
:::

:::definition "Ball"
Given $\vec{x} \in \mathbb{R}^k, r > 0,$ the open or closed **ball** with center $\vec{x}$ and radius $r$ is defined as the set of points $\vec{y}$ such that $|\vec{x} - \vec{y}| < r$ or $|\vec{x} - \vec{y}| \leq r,$ respectively.
:::


## Convex Sets

:::definition "Convex Set"
A set $E \subset \mathbb{R}^k$ is said to be **convex** if

$$ \lambda \vec{x} + (1 - \lambda)\vec{y} \in E $$

whenever $\vec{x}, \vec{y} \in E,$ and $0 < \lambda < 1.$

In geometric terms, this means a set is convex if we can connect any two points in the set with a line segment whose points are all within the set.
:::

:::theorem
All balls are convex.

::::proof
Let $\vec{y}, \vec{z}$ be points in a ball with center $\vec{x}$ and radius $r$. Then, by definition, $|\vec{y} - \vec{x}| < r,$ and $|\vec{z} - \vec{x}| < r.$ Suppose $\vec{p} \in \{ \lambda \vec{y} + (1 - \lambda)\vec{z} | 0 < \lambda < 1 \}.$ We will show that $|\vec{x} - \vec{p}| < r.$

$$ \begin{aligned}
  
  |\vec{x}-\vec{p}| &= |\vec{x} - (\lambda\vec{y} + (1-\lambda)\vec{z})| \quad(\text{substitute definition of } \vec{p})\\
  &= |\vec{x} - \lambda\vec{y} - \vec{z} + \lambda\vec{z}| \quad(\text{expand})\\
  &= |\vec{x} - \lambda\vec{y} - \vec{z} + \lambda\vec{z} + \lambda\vec{x} - \lambda\vec{x}| \quad(\text{add and subtract } \lambda\vec{x})\\
  &= |\lambda(\vec{x}-\vec{y}) + (1-\lambda)(\vec{x}-\vec{z})| \quad(\text{factor } \lambda \text{ and } 1-\lambda)\\
  &\le \lambda\,|\vec{x}-\vec{y}| + (1-\lambda)\,|\vec{x}-\vec{z}| \quad(\text{triangle inequality})\\
  & < \lambda r + (1-\lambda)r \quad(\text{since } |\vec{x}-\vec{y}|,|\vec{x}-\vec{z}| < r)\\
  &= r \quad(\text{because } \lambda + (1-\lambda)=1).
\end{aligned} $$

So, $\vec{p}$ is within our ball and therefore all balls are convex.
::::

::::note
Similar proofs can be used to show that closed balls and $k$-cells are also convex.
::::
:::


## Elements and Subsets of a Metric Space

:::note
Assume we have a metric space $(X, d).$
:::

:::definition "Neighborhood"
A **neighborhood,** or **r-neighborhood** of $p$ is a set $N_r(p)$ consisting of all $q$ such that $d(p, q) < r$ for some $r > 0.$ This subset of $X$ is all the points within a circle of radius $r$ - the open ball of radius $r$ centered at $p.$
:::

:::definition "Limit Point"
A point $p$ is a **limit point** of the set $E$ if every neighborhood of $p$ contains a point $q \neq p$ such that $q \in E.$
:::

:::definition "Isolated Point"
If $p \in E$ and $p$ is not a limit point of $E,$ then $p is called an **isolated point** of E.
:::

:::definition "Closed Set"
$E$ is **closed** if every limit point of $E$ is a point of $E.$
:::

:::definition "Interior Point"
A point $p$ is an **interior point** of $E$ if there is a neighborhood $N$ of $p$ such that $N \subset E.$
:::

:::definition "Open Set"
$E$ is open if every point of $E$ is an interior point of $E.$
:::

:::definition "Complement (of a Set)"
The **complement** of $E$ (denoted by $E^c$) is the set of all points $p \in X$ such that $p \notin E.$
:::

:::definition "Perfect Set"
$E$ is **perfect** if $E$ is closed and if every point of $E$ is a limit point of $E.$
:::

:::definition "Bounded"
$E$ is **bounded** if there is a real number $M$ and a point $q \in X$ such that $d(p, q) < M$ for all $p \in E.$
:::

:::definition "Dense"
$E$ is **dense** in $X$ if every point of $X$ is a limit point of $E,$ or a point of $E$ (or both.)
:::

:::theorem {label: every-neighborhood-is-an-open-set}
Every neighborhood is an open set.

::::proof
Suppose $N_r(p)$ is a neighborhood in $X.$ Let $q \in N_r(p).$ We need to show that $q$ is an interior point of $N_r(p).$ Let $s = r - d(p, q);$ because $d(p, q) < r$, we have $s > 0.$ Now let $N_s(q)$ be the neighborhood of radius $s$ around $q.$ We need to show that $N_s(q) \subset N_r(p).$ Suppose $x \in N_s(q).$ First note that because $s = r - d(p, q),$ $d(p,q) = r - s.$ Now,

$$ \begin{aligned} d(p, x) & \leq d(p,q) + d(q, x) \\
                           & < r - s + s \\
                           & = r.
\end{aligned} $$

Therefore, $N_s(q) \subset N_r(p),$ so $q$ is an interior point of $N_r(p),$ and since $q$ was arbitrary, every point of $N_r(p)$ is interior. Hence, $N_r(p)$ is open.
::::
:::

{% include_integrated_relative neighborhood-demo.html %}


:::theorem {label: neighborhood-of-limit-point-contains-infinitely-many-points}
If $p$ is a limit point of a set $E,$ then every neighborhood of $p$ contains infinitely many points of $E.$

::::proof
Let $p$ be a limit point of $E$ and let $N_r(p)$ be a neighborhood of $p.$ Suppose that $N_r(p)$ contains only finitely many points of $E.$ Since we have finitely many points, we can inspect each and find the minimum distance from $p$ to any point in $N_r(p) \bigcup E\setminus\{p\}$ and call it $s.$ Now, we can make a new neighborhood $N_s(p),$ which contains none of the points in $N_r(p) \bigcup E\setminus\{p\}$ since they're all at least $s$ away from $p,$ by construction. But then, $p$ is not a limit point of $E,$ since it has a neighborhood that contains no points of $E\setminus\{p\}$ Therefore, we have a contradiction, and $N_r(p)$ must therefore contain infinitely many points.
::::

::::corollary {label: only-infinite-sets-have-limit-points}
From this, it's evident that a finite set of points has no limit points. That is, if a set has a limit point, then the set if infinite.
::::
:::

:::theorem
Let ${E_\alpha}$ be a collection of sets. Then

$$ \left ( \bigcup_{\alpha} E_\alpha \right )^c = \bigcap_{\alpha} \left ( E_{\alpha}^c \right ). $$

::::proof
Suppose $x \in \left ( \bigcup_{\alpha} E_\alpha \right )^c.$ Then, $x \notin \bigcup_{\alpha} E_\alpha,$ so $x$ is not in any $E_\alpha.$ Therefore, for every $E_\alpha,$ $x \in E_\alpha^c,$ and thus $x \in \bigcap_{\alpha} \left ( E_{\alpha}^c \right ).$ Conversely, suppose $x \in \bigcap_{\alpha} \left ( E_{\alpha}^c \right ).$ Then, $x$ is in every $E_\alpha^c,$ that is, $x$ is not in any $E_\alpha.$ Therefore, $x \in \left ( \bigcup_{\alpha} E_\alpha \right )^c.$
::::
:::

:::theorem {label: open-iff-complement-closed}

A set $E$ is open iff its complement is closed.

::::proof
First, consider the case that $E^c$ is empty, and therefore open. If $E^c$ has no limit points, it is vaccuously closed. Suppose $E^c$ has a limit point $x.$ Since $E$ is empty, $x$ must be in $E^c,$ therefore $x$ is closed. Now, consider the case that $E^c$ is empty, and therefore closed. If $E$ is empty, it is open, and the theorem is satisfied. If $E$ is not empty, a point $x$ in $E$ has only points in $E$ in any neighborhood, since all points are in $E,$ and therefore $E$ is open.

Now we deal with the cases where neither $E$ nor $E^c$ are empty.

Now, let $E^c$ be closed. Let $x \in E.$ Since $E^c$ is closed, $x$ is not a limit point of $E^c,$ that is $x$ has some neighborhood that doesn't contain a point in $E^c$ and must therefore be a subset of $E.$ Therefore, $x$ is an interior point of $E,$ and $E$ is open.

Conversely, assume $E$ is open. Let $x$ be a limit point of $E^c.$ Suppose, for the sake of contradiction, that $x \in E.$ Then, since $E$ is open, $x$ is an interior point of $E$ and has some neighborhood that is a subset of $E.$ This is a contradiction, since every neighborhood of $x$ must contain at least one point of $E^c$ to be a limit point of $E^c.$ Therefore, $x$ must be in $E^c,$ and it follows that $E^c$ is closed.
::::
:::

:::remark
For some intuition, consider $U = [0, 4], E = [0,3].$ Any point $x$ in $E$ has a neighborhood $N_r(x)$ that contains only points in $E$ with as $r < d(x, 3),$ so it is open. Since 3 must be in $E^c,$ we have $E^c = [3,4],$ which is obviously closed. Here, 3 is the boundary between the two sets - it is a limit point for both sets - and it has to be in one set or the other. So, $E$ is open, but not closed, since it doesn't contain one of its limit points, 3. $E^c$ is closed because if $x$ is a limit point of $E^c,$ it would be a contradiction for it to be in $E,$ which is open and only contains interior points of $E.$ $E^c$ is also not open, because 3 has no neighborhoods that contain only points of $E^c.$
:::

:::theorem {label: union-and-intersection-of-open-and-closed-sets}
(a) - For any collection $\{G_a\}$ of open sets, $\bigcup_{\alpha} G_\alpha$ is open.

(b) - For any collection $\{F_a\}$ of closed sets, $\bigcap_{\alpha} F_\alpha$ is closed.

(c) - For any finite collection $G_1,\dots,G_n$ of open sets, $\bigcap_{i=1}^n G_i$ is open.

(d) - For any finite collection $F_1,\dots,F_n$ of closed sets, $\bigcup_{i=1}^n F_i$ is closed.

::::proof
Let $G = \bigcup_{\alpha} G_\alpha, x \in G.$ Then $x$ is in some $G_\alpha$ for some $\alpha,$ and is an interior point of that $G_\alpha,$ since $G_\alpha$ is open. Therefore, $x$ has some neighborhood that is a subset of $G_\alpha$ and therefore of $G,$ so $x$ is an interior point of $G$ and $G$ is open - this shows (a).

Note that

$$ (\bigcap_{\alpha} F_\alpha)^c = \bigcup_{\alpha} F_\alpha^c, \tag{e} $$

and by (a) above, (e) is open. Then its complement, $\bigcap{\alpha} F_\alpha$ is closed, and we've shown (b).

Now, let $x$ be in $G = \bigcap_{i=1}^n G_i,$ so $x$ is in every $G_i,$ and has a neighborhood $N_i$ in every $G_i$ with radius $r_i > 0.$ Let $r$ be $\min\{r_1, \dots, r_n\}.$ Then, $x$ has a neighborhood $N$ of radius $r$ in every $G_i,$ and thus in $G,$ so $x$ is an interior point of $G,$ and we've shown (c).

 Now, $(\bigcup_{i=1}^n F_i)^c = \bigcap_{i=1}^n F_i^c$ is open by (c), so its complement, $\bigcup_{i=1}^n F_i$ is closed, and we've shown (d).
::::
::::note
In parts (c) and (d) of the above theorem, finiteness of the collections of sets is required - the property do not necessarily hold for infinite collections of sets.
::::
:::

:::theorem
Let $E'$ be the set of all limit points of a set $E$ in space $X.$ Then $E'$ is closed.

::::proof
Let $p \in X, p \notin E'.$ Then some neighborhood $N$ of $p$ contains no points in $E,$ other than possibly $p$ itself. If $N$ contains only $p,$ then $p$ is not a limit point of $E'.$ Suppose, for the sake of contradiction, some point $q \in N, q \neq p$ is a limit point of $E'.$ Then, every neighborhood of $q$ contains some point $m$ in $E'.$ Let $M \subset N, p \notin M,$ be such a neighborhood, and let $m \in M, m \neq q$ be a limit point of $E$. Now, $m$ has neighborhoods wholly in $N,$ and such neighborhoods can have no point in $E,$ so we have a contradiction, and therefore $q$ is not a limit point of $E'.$ Hence, $p$ is an interior point of $E'^c,$ and $E'^c$ is open, and therefore $E'$ is closed.
::::
:::

:::definition "Closure"
If $X$ is a metric space, $E \subset X,$ and $E'$ denotes the set of all limit points of $E$ in $X,$ then the **closure** of $E$ is the set $\overline{E} = E \cup E'.$
:::

:::theorem {label: set-is-its-closure-iff-it-is-closed}
If $X$ is a metric space and $E \subset X,$ then

(a) $\overline{E}$ is closed.

(b) $E = \overline{E}$ iff $E$ is closed.

(c) $\overline{E} \subset F$ for every closed set $F \subset X$ such that $E \subset F.$

By (a) and (c), $\overline{E}$ is the smallest closed subset of $X$ that contains $E.$

::::proof
(a) Suppose $p \in X$ and $p \notin \overline{E}.$ Then $p$ is not in $E$ and is not in $E',$ and is in fact in $\overline{E}^c.$ Now, since $p$ is not a limit point of $E,$ it has some neighborhood $N_r(p)$ that does not intersect $E.$ Any point $x$ in $N_r(p)$ is an interior point of $N_r(p)$, and therefore has its own neighborhood $N_\epsilon{(x)}$ that does not intersect $E,$ and therefore $x$ is not a limit point of $E.$ Thus, any point in $\overline{E}^c$ is an interior point of $\overline{E}^c,$ and $\overline{E}^c$ is therefore open and its complement, $\overline{E},$ is closed (since a set is open iff its complement is closed.)

(b) Suppose $E$ is closed. Then it contains its limit points, so $E = E \cup E' = \overline{E}.$ Conversely, suppose $E = \overline{E}.$ By (a), $E$ is closed.

(c) Suppose that $E \subset F \subset X,$ and that $F$ is closed. Suppose $p \in \overline{E}.$ If $p \in E,$ then $p \in F$ because $E \subset F.$ If $p \in E',$ then it must be in $F$ also, since $F$ contains all points of $E,$ and is closed, and thus must contain the limit points of $E.$  
::::
:::

:::theorem
If $E$ is a set in a metric space, then $E$ and $\overline{E}$ have the same limit points.

::::proof
If $E$ is closed, then we are done, because @{a set equals its closure if it is closed|set-is-its-closure-iff-it-is-closed}. 

Suppose $p$ is a limit point of $E.$ Then every neighborhood of $p$ contains some $q \in E, q \neq p.$ Since $q \in E, ~ q \in \overline{E}$, so $p$ is a limit point of $\overline{E}.$

Conversely, suppose $p$ is a limit point of $\overline{E}.$ Then, every neighborhood $N$ of $p$ contains a point of $q \in \overline{E}, q \neq p.$ If $q \in E,$ then $N$ clearly contains a point in $E.$ Otherwise, $q \in E', q \not in E.$ Now, since $q \in N$ and @{every neighborhood is an open set|every-neighborhood-is-an-open-set}, $q$ has some neighborhood $M \subset N.$ Since $q \in E',$ $M$ contains some point $s \in E.$ Since $M \subset N,$ $s \in N,$ and therefore $N$ contains a point in $E.$ Thus, all neighborhoods of $p$ contain some point in $E,$ and $p$ is a limit point of $E.$
::::
:::

:::theorem
A set $E$ and its limit points $E'$ do not necessarily have the same limit points. 
::::proof
Consider $P = \{\frac{1}{n} | n \in \mathbb{N}\}.$ Then $P$ has one limit point, $0,$ but $P' = \{0\}$ has no limit points, since the only number that contains $0$ in all its neighborhoods is $0$ itself (see @only-infinite-sets-have-limit-points.)
::::
:::


:::theorem
Closure distributes over finite unions.

If $B_n = \bigcup_{i=i}^n A_i,$ then $\overline{B_n} = \bigcup_{i=1}^n \overline{A_i}, n = 1, 2, 3, \dots.$ 

::::proof
Let $p \in \bigcup_{i=1}^n \overline{A_i}.$ Then, $p \in \overline{A_i}$ for some $i.$ If $p \in A_i,$ then $p \in \bigcup_{i=i}^n A_i = B_n,$ so $p \in \overline{B_n}.$ If $p$ is in some $A_{i}',$ then every neighborhood of $p$ contains some point $q \in A_i, q \neq p,$ and since $A_i \subset B_n,$ $q \in B_n,$ so $p \in \overline{B_n}.$

Conversely, let $p \in \overline{B_n}.$ If $p \in B_n,$ $p \in A_i$ for some $i,$ and thus $p \in \overline{A_i} \subset \bigcup_{i=1}^n \overline{A_i}.$ If $p$ is only in $B_{n}',$ suppose for contradiction that $p \notin \bigcup_{i=1}^n \overline{A_i}.$ For each $i,$ let $N_i$ be a neighborhood centered at $p$ with $N_i \cap A_i = \emptyset.$ Then, $N = \bigcap_{i=1}^n N_i$ is a neighborhood of $p$ (see @union-and-intersection-of-open-and-closed-sets,) but $N \cap N_i = \emptyset$ for all $i,$ so $N \cap B_n = \emptyset.$ But, this contradicts our hypothesis that $p \in \overline{B_n},$ so our contradictory assumption must be invalid, and $p \in \bigcup_{i=1}^n \overline{A_i}.$
::::
:::

:::theorem {label: sup-is-in-closure-of-bounded-nonempty-set-of-reals}
Let $E$ be a nonempty set of real numbers which is bounded above. Let $y = \sup{E}.$ Then $y \in \overline{E}.$ Hence $y \in E$ if $E$ is closed.

::::proof
Suppose $y \in E.$ Then $y \in \overline{E}.$ Suppose $y \notin E.$ Now, by hypothesis, for every $h > 0,$ there is some $x$ such that $y - h < x < y,$ because otherwise, $x$ would be an uppper bound on $E.$ Therefore, every neighborhood $N_h(y)$ contains some $x \in E,$ and thus $y$ is a limit point of $E$ and $y \in \overline{E}.$
::::
:::

:::definition "Open Relative"
Suppose $E \subset Y \subset X,$ and $X$ is a metric space. We say that $E$ is **open relative** to $Y$ if to each $p \in E$ there is associated an $r > 0$ such that $q \in E, q \in Y$ whenever $d(p, q) < r.$
:::

:::theorem {label: open-relative-iff-intersection-with-open-subset}
Suppose $Y \subset X.$ A subset $E$ of $Y$ is open relative to $Y$ iff $E = Y \cap G$ for some open subset $G$ of $X.$

::::proof
Suppose $E$ is open relative to $Y.$ Then, for every $p \in E,$ there is some $r_p > 0$ such that $d(p, q) < r_p,$ $q \in X$ implies that $q \in Y.$ Let $V_p$ be the set of all $q \in X$ where $d(p,q) < r_p$ (and thus $q \in Y$) and let

$$ G = \bigcup_{p \in E} V_p. $$

Then, since each $V_p$ is an open subset of $X,$ so is $G.$ Now, since $p \in V_p$ for each $p \in E,$ $E \subset G \cap Y.$ Also, since $V_p \cap Y \subset E$ for every $p \in E,$ $G \cap Y \subset E,$ and $E = G \cap Y.$

Conversely, suppose $E = Y \cap G$ for some open subset $G$ of $X.$ Now, suppose $p \in E.$ Then, $p \in G,$ and there is some neighborhood $V_p \subset G.$ Then, $V_p \cap Y \subset E,$ so $E$ is open relative to $Y.$

::::
:::


