---
description: A definition of the Cantor set, along with some theorems about it.
layout: page
title: Cantor Set
---

:::note {label: cantor-set-reference-note}
This section was developed by following Rudin, *Principles of Mathematical Analysis*, Chapter 2, with some help from Pugh, *Real Mathematical Analysis* Section 2.8.
:::

# The Cantor Set

:::definition "Cantor set"
Let $E_0$ be the interval $[0, 1].$ Remove the segment $(\frac{1}{3}, \frac{2}{3}),$ and let

$$ E_1 = [0, \frac{1}{3}] \cup [\frac{2}{3}, 1]. $$

Similarly, remove the middle thirds of these intervals, and let

$$E_2 = [0, \frac{1}{9}] \cup [\frac{2}{9}, \frac{3}{9}] \cup [\frac{6}{9}, \frac{7}{9}] \cup [\frac{8}{9}, 1]. $$

We can continue this forever, and we get a nested sequence $\{E_n\}$ of compact sets $E_n$  where:

(a) $E_{n+1} \subset E_n.$

(b) $E_n$ is the union of $2^n$ intervals, each of length $1/3^n.$

Finally, the set

$$ P = \bigcap_{n=1}^\infty E_n $$

is called the **Cantor set.**
:::

:::theorem {label: cantor-set-is-compact}
The Cantor set is compact.

::::proof
Clearly, $P$ is bounded, for it lies within $[0, 1].$ Each $E_n$ is composed of the union of $2^n$ closed intervals, and @{the union of finitely many closed intervals is also closed|union-and-intersection-of-open-and-closed-sets}. $P$ is then the intersection of infinitely many closed intervals, @{which is again closed|union-and-intersection-of-open-and-closed-sets}. Therefore, $P$ is closed and bounded, and by @heine-borel, is compact.
::::
:::

:::theorem {label: cantor-set-is-not-empty}
The Cantor set is not empty.

::::proof
Suppose $E_n$ has $[\alpha, \beta]$ as an interval and thus $\alpha, \beta \in E_n.$ Then, by definition, $E_{n+1}$ will contain $[\alpha, \frac{\beta - \alpha}{3}]$ and $\frac{2(\beta - \alpha)}{3}, \beta]$ as intervals, so $\alpha, \beta \in E_{n+1}.$ Note that $E_0$ has $[0, 1]$ as an interval. By induction, all $E_n$ contain $0$ and $1$, and therefore so does their intersection $P,$ and $P$ is nonempty.
::::
:::

:::theorem {label: cantor-set-contains-no-segment}
The Cantor set contains no @segment.

::::proof
Suppose, for the sake of contradiction, that some segment $(\alpha, \beta)$ \subset $P$ and let $L = \beta - \alpha.$ Pick some $n \in \mathbb{N}$ such that $1/3^n < L.$ Now, $E_n$ is the union of $2^n$ intervals of length $1/3^n,$ and since $(\alpha, \beta) \subset P,$ it must be the case that $(\alpha, \beta)$ is a subset of some interval of length $1/3^n.$ However, this can't be the case, since $L > 1/3^n,$ by construction. Therefore, our provision assumption is incorrect, and $P$ contains no segment. 
::::
:::

:::theorem {label: cantor-set-is-perfect}
The Cantor set is perfect.

::::proof
Let $x \in P.$ Let $r > 0,$ and pick $n \in \mathbb{N}$ to be large enough that $1/3^n < r.$ Then, $x$ lies in one of the $2^n$ intervals of length $1/3^n$ in $E_n;$ call it $I_n.$ The endpoints of $I_n$ are also in $P$ (see @cantor-set-is-not-empty,) and at least one of them is not $x.$ Since the endpoints are contained in a neighborhood of $x$ with radius $r > 0,$ all neighborhoods of $x$ are limit points of $P,$ and therefore $P$ is perfect.
::::

::::corollary {label: cantor-set-is-uncountable}
Because @{nonempty perfect sets in $R^k$ are uncountable|non-empty-perfect-sets-in-rk-are-uncountable}, and the Cantor set is @{nonempty|cantor-set-is-not-empty} and @{perfect|cantor-set-is-perfect}, the Cantor set is uncountable. 
::::

:::