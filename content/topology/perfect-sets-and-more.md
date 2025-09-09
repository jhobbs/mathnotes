---
description: Introduces perfect sets, separable spaces, and bases.
layout: page
title: Perfect Sets and More
---

## Perfect Sets

:::note {label: perfect-sets-reference-note}
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

For the inductive step, suppose as an induction hypothesis that we have some $V_n$ that's been constructed such that $V_n \cap P$ is not empty. Since every point of $P$ is a limit point of $P,$ we can make a neighborhood $V_{n+1}$ such that (i) $\overline{V_{n+1}} \subset V_n,$ (ii) $x_n \notin \overline{V_{n+1}},$ (iii) $V_{n+1} \cap P$ is not empty. Now, $V_{n+1}$ satisfies our induction hypothesis, and since $V_1$ does too, we have ${V_n}$ defined for all $n = 1, 2, 3, \dots.$

For each $n$, let $K_n = \overline{V_n} \cap P.$ Since $\overline{V_n}$ is closed and bounded, $\overline{V_n}$ @{is compact|heine-borel}. Since $x_n \notin \overline{V_{n+1}},$ no point of $P$ lies in $\bigcap_{n=1}^\infty K_n.$ Since $K_n \subset P,$ this implies that $\bigcap_{n=1}^\infty K_n$ is empty. But, each $K_n$ is nonempty, by (iii), and $K_{n+1} \subset K$, by (i). But the @{intersection of nonempty compact nested sets is nonempty|intersection-of-nonempty-nested-compact-sets-is-nonempty}, so we have a contradiction, so our provisional assumption that $P$ is countable must be incorrect. Therefore, $P$ is uncountable.
::::

::::corollary {label: every-interval-is-uncountable}
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

:::theorem {label: every-separable-metric-space-has-a-countable-base}
Every separable metric space has a countable base.

::::proof
Let $X$ be a @separable @metric-space, and let $x \in G \subset X,$ with $G$ @open-set. Now, because $X$ is separable, it by definition has a @countable @dense subset $E.$ If $x \in E,$ we can pick a rational $\delta > 0$ and let $N_{\delta}(x)$ be a @neighborhood such that $N_{\delta}(x) \subset G$ ($\delta$ must also be small enough such that this neighborhood is within $G,$ which is possible because $x$ is an @interior-point of $G$ and we can @{pick a rational as close to any real as we'd like|rationals-are-dense-in-reals}.) Now we have that $x \in N_{\delta}(x) \subset G,$ and since there are countably many $x \in E$ and countably many neighborhoods with rational radius around each $x \in E,$ there are countably many such neighborhoods in $G.$ On the other hand, if $x \notin E,$ then $x$ is a @limit-point of $E,$ and thus there is $p \in E$ as close as we'd like to $x.$ Pick $p \in E$ such that $d(p,x) < \delta$ for some rational $\delta$ such that $x \subset N_{\delta}(p) \subset G.$ Again, since there are countably many such $p \in E,$ with countably many neighborhoods of rational radius each, there are countably many such neighborhoods in $G.$

Now, if we let $G$ be the union of all open sets $G_\beta \subset X,$ then $G$ @{is open|union-and-intersection-of-open-and-closed-sets}, and let ${V_\alpha}$ be the union of all the $N_r(q), q \in G \cap E,$ with $r \in Q,$ then every $x \in G$ is in some ${V_\alpha},$ and there are countably many ${V_\alpha},$ so ${V_\alpha}$ is a countable @base for $X.$
::::
:::

:::theorem {label: every-metric-space-where-every-infinite-subset-has-a-limit-point-is-separable}
Let $X$ be a metric space in which every infinite subset has a limit point. Then $X$ is @separable.

::::proof
Let $\delta > 0,$ and pick $x_1 \in X.$ Now, continue picking $x_{j+1}$ such that $d(x_i, x_{j+1}) \geq \delta$ i.e. so that each new point is at least $\delta$ away from each existing point. Suppose this process continues infinitely; then the points $\{x_i\}$ are an infinite subset of $X,$ and thus must have a limit point $p.$ Now, because @{every neighborhood of $p$ must contain infinitely many points in ${x_i}$|neighborhood-of-limit-point-contains-infinitely-many-points}, we can let $r = \delta / 2,$ $N_r{p}$ be a neighborhood of $p,$ and pick $x, y \in \{x_i\}, N_r{p}.$ But, by the triangle inequality

$$ \begin{aligned}

d(x, y) & \leq d(x, p) + d(p, y) \\
        & < \delta / 2 + \delta / 2 \\
        & = \delta

\end{aligned} $$

so $d(x,y) < \epsilon,$ which contradicts our assumption that $\{x_i\}$ could be an infinite set where all points were at least $\delta$ apart. Therefore, $\{x_i\}$ has only finitely many points, and $X$ can be covered with finitely many open balls of radius $\delta$ (for if it couldn't be, we could always fit another point into $\{x_i\}.$)

Now, if we let $\delta = 1/n, n=1,2,3,\dots,$ we can consider the set of points $\{x_i\}_n$ as the finite set of points at least $1/n$ apart in $X.$ The collection of all such points can be called $\{x_{i_n}\}$ and is dense in $X:$ let $p$ be a point in $X.$ and $N_r{p}, r>0$ a neighborhood of $p.$ If we pick $n$ such that $1/n < r,$ then some $\{x_i\}_n$ will be in $N_r{p},$ because if not, we would have a contradiction with the fact that shown above that no point in $X$ is more than $1/n$ away from a point in $\{x_i\}_n.$

Since each $\{x_i\}_n$ is finite, and there are countably many $\{x_i\}_n,$ the $\{x_{i_n}\}$ is a countably dense subset of $X$ and therefore $X$ is separable.
::::
:::

:::theorem {label: compact-metric-space-has-countable-base}
Every compact metric space has a countable base and is therefore separable.

::::proof
Let $K$ be a compact metric space. Fix $n \in \mathbb{N}$ (any natural number will do,) then, consider the open cover $\{G_\alpha\}_n$ of balls of radius $1/n$ centered at $x \in K.$ Now, because $K$ is compact, some finite $\{V_\alpha\}_n \subset \{G_\alpha\}_n$ covers $K.$

Now, consider the set of all balls for all $n,$

$$ C = \bigcup_{n=1}^{\infty} \{V_\alpha\}_n $$

Because @{the union of a sequence of countable sets is countable|union-of-a-sequence-of-countable-sets-is-countable}, $C$ is countable. To show $C$ is a base for $K,$ let $G$ be an open subset of $K,$ and let $x \in G.$ Let $\epsilon > 0$ such that $B_{\epsilon}(x) \subset G.$ Pick natural $n$ such that $1/n < \epsilon/2.$ Then, $x \in \{V_\alpha\}_n$ for some $\alpha,$ (because no point in $K$ is more than $1/n$ away from the center of some $\{V_\alpha\}_n$ and therefore $C$ is a countable base of $K.$ Since we can make $\epsilon$ as close to $0$ as we like, the centers of $\{V_\alpha\}_n$ are dense as well as countable, and are therefore a countable dense subset of $K,$ so $K$ is separable.
::::
:::

:::theorem {label: infinite-subset-has-limit-point-implies-compact}
Let $X$ be a metric space in which every infinite subset has a limit point. Then $X$ is compact.

::::proof
By @every-metric-space-where-every-infinite-subset-has-a-limit-point-is-separable, we know that $X$ is separable and by @every-separable-metric-space-has-a-countable-base, we know that $X$ has a countable base. By the definition of @base, we have that every open cover of $X$ has a countable subcover $\{G_n\}, n = 1, 2, 3, \dots.$

Suppose, for the sake of contradiction, that $\{G_n\}$ has no finite subcollection that covers $X.$ Let

$$ F_n = (G_1 \cup \cdots \cup G_n)^c. $$

Then, each $F_n$ must be nonempty (otherwise a finite subcollection of $\{G_n\}$ would cover $X.$ However, since every point in $X$ is in some $G_n,$

$$\bigcap_{n=1}^{\infty} F_n = \emptyset. $$

Now, let $E$ be a set with a point from each $F_n.$ Since there are infinitely many $F_n,$ $E$ is an infinite subset of $X,$ and therefore $E$ has a limit point, $p.$ Now, $p$ must be in some open $G_m,$ and so for some $\epsilon > 0,$ $N_{\epsilon}(p) \subset G_m.$

Now, note that each $F_{n+1} \subset F_n,$ because $F_{n+1}$ is formed by excluding all the points in $F_n$ that are also in $G_{n+1}.$ Because $p$ is a limit point of $E,$ $N_\epsilon{p}$ must contain infinitely many points of $E.$ However, only finitely many points of $E$ can be in $N_{\epsilon}(p) \subset G_m,$ because for $n >= m,$ $F_n$ contains no points in $G_m.$ Therefore, $p$ is not a limit point of $E,$ and no such limit point can exist, contradicting our hypothesis that every infinite subset of $X$ has a limit point. Therefore, $E$ must be finite, and $\{G_n\}$ must have a finite subcollection that covers $X,$ meaning $X$ is compact.
::::
:::

:::definition "Condensation Point"
A point $p$ in a metric space $X$ is said to be a **condensation point** of a set $E \subset X$ if every neighborhood of $p$ contains uncountably many points of $E.$ 
:::
:::example {label: condensation-point-example}
Let $p \in \mathbb{R}, \epsilon > 0$ and let $E = (p, p+\epsilon).$ Then, for any $0 < \delta < \epsilon$ let $N_{\delta}(p)$ be an open ball around $p.$ Then, $N_{\delta}(p) \cap E = (p, p + \delta)$ is an open interval in $E,$ and @{is therefore uncountable|every-interval-is-uncountable}.
:::

:::theorem {label: condensation-points-of-an-uncountable-subset-of-rk-are-perfect}
Suppose $E \subset R^k,$ with $E$ uncountable, and let $P$ be the set of all condensation points of $E.$ Prove that $P$ is perfect and that at most countably many points of $E$ are not in $P,$ that is, that $P^c \cap E$ is at most countable.

::::proof
Let $\{V_n\}$ be a countable base of $R^k$ (see @euclidean-space-is-separable and @every-separable-metric-space-has-a-countable-base,) and let $W$ be the union of those $V_n$ for which $E \cap V_n$ is at most countable. We will show that $P = W^c.$

Suppose $p \in W^c.$ Then $p$ is in no $V_n$ for which $V_n \cap E$ is at most countable, that is, every neighborhood of $p$ has uncountably many points in $E,$ and thus $p \in P.$

Conversely, suppose $p \in P.$ Suppose, for the sake of contradiction, that $p \in W.$ Then $p \in V_n$ for some $V_n$ where $V_n \cap E$ is at most countable. But, since $p$ is an interior point of this $V_n,$ there is a neighborhood $N(p) \subset V_n,$ and since every neighborhood of $p$ has uncountably many points in $E,$ we have a contradiction, and thus our assumption that $p \in W$ must be incorrect, and therefore $p \in W^c,$ and $P = W^c.$ Furthermore, since $W$ is a @{union of open sets|union-and-intersection-of-open-and-closed-sets}, $W$ is open, and $W^c = P$ @{is closed|open-iff-complement-closed}.

Since $W$ is open, only countably many $V_n$ are required to cover it. Each of these $V_n$ has at most countably many points in $E,$ so $W = P^c$ has at most countably many points in $E,$ that is, there are at most countably many points of $E$ that are not in $P.$

Now, to show all points in $P$ are limit points of $P,$ suppose $p \in P.$ Let $N_{r}(p), r > 0$ be a neighborhood of $p.$ Then, $N_{r}(p) \cap E$ is uncountable. Now, since there are at must countably many points in $E$ that are not in $P,$ there are at most countably many points in $(N_{r}(p) \cap E) \setminus P,$ and therefore there must be uncountably many points in $N_{r}(p) \cap E \cap P.$ Therefore, every neighborhood of $p$ contains infinitely many points in $P$ other than $p,$ $p$ is a limit point of $P,$ and $P$ is perfect.
::::
:::

:::theorem {label: cantor-bendixson-theorem}
Every closed set in a separable metric space is the union of a (possibly empty) perfect set and a set which is at most countable.

::::proof
Let $X$ be a separable metric space and $E \subset X$ be closed. If $E$ is at most countable, then we are done.

Suppose that $E$ is uncountable. Note that the proof of @condensation-points-of-an-uncountable-subset-of-rk-are-perfect only uses the property that $R^k$ is a separable metric space, and it therefore generalizes to any separable metric space. Thus $E$ is the union of a perfect set - its condensation points, $P$, and a set that is at most countable, $E \setminus P.$
::::

::::corollary {label: countable-closed-set-has-isolated-points}
Every @countable @closed @set set in $R^k$ has @isolated-points.

:::::proof
Let $E$ be a countable closed set in $R^k.$ Suppose for contradiction that $E$ has no isolated points. Then every point of $E$ is a limit point of $E,$ and thus $E$ is @perfect-set. But, @{every nonempty perfect set in $R^k$ is uncountable|non-empty-perfect-sets-in-rk-are-uncountable}, a contradiction. Thus, our assumption that $E$ has no isolated points is incorrect, and $E$ must contain isolated points.
:::::
::::
:::

:::theorem {label: open-set-in-r1-is-countable-union-of-disjoint-segments}
Every open set in $R^1$ is the union of an at most @countable union of disjoint segments.

::::proof
Let $E$ be an open set in $R^1.$ Let $x \in E.$ Let $a = \inf \{ y : (y, x] \subset E \}$ and $b = \sup \{ y : [x, y) \subset E \}.$ Then, $a < x < b,$ because $E$ is open and thus $x$ is an @interior-point of $E$ and there is some @neighborhood around $x$ that is entirely within $E.$ Let $I(x) = (a, b).$ By construction, $I(x)$ is @connected. For all $u \in I(x),$ $I(u)$ must have the same end points as $I(x),$ since if it extended beyond, our construction of $I(x)$ would be contradicted. Also note that for all $v \in E \setminus I(x),$ $I(v) \cap I(x) = \emptyset,$ for if they intersected, they would form an @{open interval|union-and-intersection-of-open-and-closed-sets}. Thus, each $I(x), x \in E$ is either disjoint from all others or identical to some other $I(y), y \in E,$ and $E$ is the union of all such unique $I.$

Now, in each $I,$ we can @{pick a rational number|rationals-are-dense-in-reals}. Because @{the rationals are countable|rationals-are-countable}, we have at most countably many unique $I,$ and $E$ is their union.
:::: 
:::

:::theorem "Special case of Blaire's theorem" {label: baire-category-theorem-special-case}
If $R^k = \bigcup_{n=1}^{\infty}F_n,$ where each $F_n$ is a closed subset of $R^k,$ then at least one $F_n$ has a non-empty interior. Equivalently, If $G_n$ is a dense open subset of $R^k,$ for $n = 1, 2, 3, \dots,$ then $\bigcap_{n=1}^\infty G_n$ is not empty (in fact, it is dense in $R^k$.)

::::proof
First, note that since $R^k = \bigcup_{n=1}^{\infty}F_n,$ every point in $R^k$ is in some $F_n,$ and so $\bigcap_{n=1}^\infty F_n^c$ @{must be empty|complement-of-union-is-intersection-of-complements}.

Suppose, for the sake of contradiction, that no $F_n$ has a non-empty interior, that is, every $F_n$ is closed with an empty interior. Then, each $F_n^c$ is open. Moreover, since $F_n$ has an empty interior, it has no points for which there exists a neighborhood that contains only points in $F_n,$ that is, every neighborhood of each point of $F_n$ contains a point in $F_n^c,$ so every point in $F_n$ is a limit point of $F_n^c,$ and every point in $R^k$ is either in $F_n^c$ or is a limit point of $F_n^c,$ so each $F_n^c$ is non-empty and dense in $R^k.$

As a base step, let $x_1$ be some point in $R^k,$ and let $B_1$ be an open ball around $x_1.$ Since the interior of $F_1$ is empty, $B_1 \cap F_1^c$ is not empty, and @{is open|union-and-intersection-of-open-and-closed-sets}.

For the inductive step, suppose we have some $B_n$ that's constructed such that $B_n \cap F_n^c$ is non-empty and open. Then, we can pick a point $x_{n+1} \in B_n \cap F_n^c, x_{n+1} \neq x_n,$ and make a ball $B_{n+1}$ around it such that $B_{n+1} \subset B_n \cap F_{n}^c,$ $x_n \notin B_{n+1},$ and $B_{n+1} \cap F_{n+1}^c$ is open and not empty. Now, since $B_{n+1}$ satisfies our induction hypothesis, and since $B_1$ does as well, we have $B_n$ defined for all $n = 1, 2, 3, \dots.$

Since the set of points $\{x_n\}$ is infinite (by induction) and bounded (all points are within $B_1$,) @{it has a limit point $p$ in $R^k.$|weierstrass}. Now, suppose, for contradiction, that $p$ is not in every $F_n^c.$ Then, for some $N,$ $p$ is not in $F_N^c.$ Since $p \notin F_N^c$ and $B_{N+1} \subseteq F_N^c$, we have $p \notin B_{N+1}$. Since $B_{N+1}$ is open and $p$ is outside it, $p$ is at some positive distance $\varepsilon$ from any point $q \in B_{N+1}$. But $x_n \in B_n \subseteq B_{N+1}$ for all $n > N$, so all these infinitely many points are at distance at least $\varepsilon$ from $p$. Thus any neighborhood of $p$ with radius less than $\varepsilon$ contains at most finitely many points of $\{x_n\}$, contradicting that $p$ is a limit point.

Now, this means that $p \in \bigcap_{n=1}^\infty F_n^c,$ meaning $\bigcap_{n=1}^\infty F_n^c \neq \emptyset,$ a contradiction! Therefore, our supposition that every $F_n$ has an empty interior must be incorrect, and some $F_n$ must have a non-empty interior.
::::

:::
