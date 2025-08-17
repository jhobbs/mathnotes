---
description: Introduces perfect sets, separable spaces, and bases.
layout: page
title: Perfect Sets and More
---

## Perfect Sets

:::note
This section was developed by following Rudin, *Principles of Mathematical Analysis*, Chapter 2.
:::

Review the definition of a perfect set:

@embed{perfect-set}

:::theorem {label: non-empty-perfect-sets-in-rk-are-uncountable}
Let $P$ be a nonempty perfect set in $R^k.$ Then $P$ is uncountable.

::::proof
We know that $P$ is infinite, because by definition, @{all points in perfect sets are limit points|perfect-set}, and @{only infinite sets have limit points|only-infinite-sets-have-limit-points}.

Suppose, for the sake of contradiction, that $P$ is countable. Label the points of $P$ as $x_1, x_2, \dots.$ We will construct a sequence of ${V_n}$ of neighborhoods.

As a base step, let $V_1$ be any neighborhood of $x_1;$ let $V_1 = \{ y \in R^k | ~ |y - x_1| < r \}$ (note: subsequent $V_{n+1}$ aren't required to be neighborhoods of $x_{n+1}.$) Then the @closure $\overline{V_1}$ of $V_1$ is $\overline{V_1} =  \{ y \in R^k | ~ |y - x_1| \leq r \}.$

For the inductive step, suppose as an induction hypothesis that have some $V_n$ that's been constructed such that $V_n \cap P$ is not empty. Since every point of $P$ is a limit point of $P,$ we can make a neighborhood $V_{n+1}$ such that (i) $\overline{V_{n+1}},$ (ii) $x_n \notin \overline{V_{n+1}},$ (iii) $V_{n+1} \cap P$ is not empty. Now, $V_{n+1}$ satisfies our induction hypothesis, and since $V_1$ does too, we have ${V_n}$ defined for all $n = 1, 2, 3, \dots.$

For each $n$, let $K_n = \overline{V_n} \cap P.$ Since $\overline{V_n}$ is closed and bounded, $\overline{V_n}$ @{is compact|heine-borel}. Since $x_n \notin \overline{V_{n+1}},$ no point of $P$ lies in $\bigcap_{n=1}^\infty K_n.$ Since $K_n \subset P,$ this implies that $\bigcap_{n=1}^\infty K_n$ is empty. But, each $K_n$ is nonempty, by (iii), and $K_{n+1} \subset K$, by (i). But the @{intersection of nonempty compact nested sets is nonempty|intersection-of-nonempty-nested-compact-sets-is-nonempty}, so we have a contradiction, and our provision assumption that $P$ is countable must be incorrect. Therefore, $P$ is uncountable.
::::

::::corollary
Every interval $[a, b] (a < b)$ is uncountable, and thus the set of all real numbers is uncountable as it contains uncountable subsets.
::::
:::

## Separable Spaces

:::definition "Separable"
A metric space is called **separable** if it contains a countable dense subset.
:::

:::theorem {label: euclidean-space-is-separable}
$R^k$ is separable.

::::proof
The points of $R^k$ that have only rational coordinates are a subset of $R^k,$ we'll call it $Q^k,$ countable and dense.

We know that @{the rationals are countable|rationals-are-countable}, and because @{$n$-tuples of countable elements are countable|n-tuples-of-countable-elements-are-countable}, $Q^k$ is countable.

To show $Q^k$ is dense, consider an arbitrary point $p$ in $R^k.$ Now, let $\epsilon > 0.$ Since the @{the rationals are dense in the reals|rationals-are-dense-in-reals}, we can pick a $q \in Q^k$ with $d(p, q) < \epsilon,$ by picking rational approximations of the coordinates of $p$ and forming $q$ such that $q$ is within $\epsilon$ of $p,$ i.e.

$$ |p_i - q_i| < \frac{\epsilon}{\sqrt{k}} \implies |p - q| < \sqrt{\sum_{i=1}^k (p_i - q_i)^2 } < \sqrt{k} \cdot \frac{\epsilon}{\sqrt{k}} = \epsilon. $$ 
::::
:::

## Base

:::definition "Base"
A collection ${V_\alpha}$ of open subsets of $X$ is said to be a **base** for $X$ if the following is true: For every $x \in X$ and every open set $G \subset X$ such that $x \in G,$ we have $x \in V_\alpha \subset G$ for some $\alpha.$ In other words, every open set in $X$ is the union of a subcollection of ${V_\alpha}.$
:::

:::theorem
Every separable metric space has a countable base.

::::proof
Let $X$ be a @separable @{metric space|metric-space}, and let $x \in G \subset X,$ with $G$ @{open|open-set}. Now, because $X$ is separable, it by definition has a @countable @dense subset $E.$ If $x \in E,$ we can pick a rational $\delta > 0$ and let $N_{\delta}(x)$ be a @neighborhood such that $N_{\delta}(x) \subset G$ ($\delta$ must also be small enough such that this neighborhood is within $G,$ which is possible because $x$ is an @{interior point|interior-point} of $G$ and we can @{pick a rational as close to any real as we'd like|rationals-are-dense-in-reals}.) Now we have that $x \in N_{\delta}(x) \subset G,$ and since there are countably many $x \in E$ and countably many neighborhoods with rational radius around each $x \in E,$ there are countably many such neighborhoods in $G.$ On the other hand, if $x \notin E,$ then $x$ is a @{limit point|limit-point} of $E,$ and thus there is $p \in E$ as close as we'd like to $x.$ Pick $p \in E$ such that $d(p,x) < \delta$ for some rational $\delta$ such that $x \subset N_{\delta}(p) \subset G.$ Again, since there are countably many such $p \in E,$ with countably many neighborhoods of rational radius each, there are countably many such neighborhoods in $G.$

Now, if we let $G$ be the union of all open sets $G_\beta \subset X,$ then $G$ @{is open|union-and-intersection-of-open-and-closed-sets}, and let ${V_\alpha}$ be the union of all the $N_r(q), q \in G \cap E,$ with $r \in Q,$ then every $x \in G$ is in some ${V_\alpha},$ and there are countably many ${V_\alpha},$ so ${V_\alpha}$ is a countable @base for $X.$
::::
:::
