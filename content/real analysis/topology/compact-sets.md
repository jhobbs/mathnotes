---
layout: page
title: Compact Sets
description: Introduces compact sets.
---

# Compact Sets

:::note
This section was developed by following Rudin, *Principles of Mathematical Analysis*, Chapter 2.
:::

:::definition "Open Cover"
An **open cover** of a set $E$ in a @{metric space|metric-space} $X$ is a collection $\{G_\alpha\}$ of open subsets of $X$ such that $E \subset \bigcup_\alpha G_\alpha.$
:::

:::definition "Compact" {label: compact}
A subset $K$ of a metric space $X$ is said to be **compact** if every open cover of $K$ contains a finite subcover. More explicitly, the requirement is that if $\{G_\alpha\}$ is an open cover of $K,$ then there are finitely many indicies $\alpha_1, \dots, \alpha_n$ such that

$$ K \subset G_{\alpha_1} \cup \cdots \cup G_{\alpha_n}. $$
:::

:::theorem
Every finite set is compact.

::::proof
Suppose $K$ is a finite set in metric space $X$ and that $\{G_\alpha\}, \alpha \in A$ is an open cover of $K.$ Since $K$ is finite, we can enumerate its points as $\{k_1, \dots, k_n\},$ for some $n \geq 0.$ Then, for each $i = 1, \dots, n$ (there are none when $n = 0$,) pick an $\alpha(i) \in A$ with $x_i \in G_\alpha(i).$ Define the index set

$$ A_0 = \{\alpha(1), \dots, \alpha(n)\} \subset A. $$

Because $n$ is finite, $A_0$ is finite as well, and

$$ K = \{k_1, \dots, k_n\} \subset \bigcup_{\alpha \in A_0} G_\alpha, $$

so $\{G_\alpha\}, \alpha \in A_0$ is a finite sub-cover of the original open cover. Therefore, every open cover of $K$ has a finite sub-cover, and $K$ is compact.
::::
:::

:::theorem
Suppose $K \subset Y \subset X.$ Then $K$ is compact relative to $X$ iff $K$ is compact relative to $Y.$

::::proof
Suppose $K$ is compact relative to $X$ and that $\{V_\alpha\}$ is an open cover of $K$ relative to $Y,$ such that $K \subset \bigcup_\alpha V_\alpha.$ We need to show that a finite subset of $\{V_\alpha\}$ covers $K.$  Because $\{V_\alpha\}$ is open relative to $Y$ and $Y \subset X$ (see @open-relative-iff-intersection-with-open-subset) there are sets $G_\alpha,$ open relative to $X,$ such that $V_a = Y \cap G_\alpha,$ for each $\alpha.$ Now, since $K$ is compact relative to $X,$ we have

$$ K \subset G_{\alpha_1} \cup \cdots \cup G_{\alpha_n}, \tag{a} $$

for some finite set of indices $a_1, \dots, a_n.$ Now, since $K \subset Y,$

$$ K \subset V_{\alpha_1} \cup \cdots \cup V_{\alpha_n}, \tag{b} $$

which shows $K$ is compact relative to $Y.$

Conversely, suppose $K$ is compact relative to $Y$ and let $\{G_\alpha\}$ be a cover of $K$ open relative to $X.$ We need to show there is a finite subset of $\{G_\alpha\}$ that covers $K.$ Let $V_\alpha = Y \cap G_\alpha,$ for each $\alpha.$ Then (b) will hold for some set of indicies, $\alpha_1, \dots, \alpha_n,$ and since each $V_\alpha \subset G_\alpha,$ (a) is implied by (b) and we've shown $K$ is compact relative to $X.$
::::
:::

:::theorem {label: compact-implies-closed}

Any compact subset $K$ of a metric space $X$ is closed.

::::proof
Suppose $K$ is compact relative to metric space $X.$ Let $p \in K^c.$ For each $q \in K,$ we can define $r_q = \frac{1}{2} d(p,q),$ and let $P_q$ and $Q_q$ be neighborhoods of radius $r_q$ around $p$ and $q,$ respectively. Note that $P_q$ and $Q_q$ are disjoint, because we defined their radii to be half the distance between them, and they are open.) Now, since $K$ is compact, we can pick a finite number of points in $K,$ $q_1, \dots, q_n,$ such that $K \subset Q_{q_1} \cup \cdots \cup Q_{q_n} = Q$ ($Q$ is a finite subcover of $K.$) Using the same set of points as reference, let $P_{q_1} \cap \cdots \cap P_{q_n} = P.$ Note that $P \cap Q = \{\},$ since each $P_q$ is disjoint with its paired $Q_q$ (to be in $P$, a point must be in all $P_q,$ but any point in $Q$ is not in at least one $P_q.$) $P$ is open, since it is the intersection of finitely many open sets (see @union-and-intersection-of-open-and-closed-sets) and obviously contains $p,$ since each $P_q$ contains $p$. Therefore, $p$ has a neigborhood $P$ that is disjoint with $K$ (since $P \cap K \subset P \cap Q = \{\}$), and is therefore an interior point of $K^c.$ It follows that $K^c$ is open, and that $K$ is closed.
::::
:::

:::theorem {label: closed-subsets-of-compact-sets-are-compact}
Closed subsets of compact sets are compact.

::::proof
Suppose $F \subset K \subset X,$ with $F$ closed relative to $X,$ and $K$ compact. Let $\{V_\alpha\}$ be an open cover of $F.$ Since $F^c$ is open relative to $X$ (see @open-iff-complement-closed), if we add it to $\{V_\alpha\},$ we obtain an open cover of $K;$ let's call it $\Omega.$ Since $K$ is compact, we can obtain a finite subcover of $K$ by discarding all but a finite number of sets from $\Omega;$ let's call it $\Phi.$ Since $F \subset K,$ $\Phi$ is also a finite subcover of $F,$ and therefore $F$ is compact.
::::

::::note
If $F^c \in \Phi,$ we may, but aren't required, to exclude it, and still have a finite open cover of $F.$
::::

::::corollary
If $F$ is closed and $K$ is compact, then $F \cap K$ is compact.

:::::proof
Because @{compact sets are closed|compact-implies-closed} and @{the intersection of two closed sets is again closed|union-and-intersection-of-open-and-closed-sets}, $F \cap K$ is closed. Since $F \cap K \subset K$ and @{closed subsets of compact sets are compact|closed-subsets-of-compact-sets-are-compact}, $F \cap K$ is compact.
:::::
::::
:::

:::theorem {label: nonempty-intersection-of-finitely-many-compact-sets}
If $\{K_\alpha\}$ is a collection of compact subsets of a metric space $X$ such that the intersection of every finite subcollection of $\{K_\alpha\}$ is nonempty, then $\bigcap K_\alpha$ is nonempty.

::::proof
Let $G_\alpha = K_\alpha^c$ for each $\alpha,$ and note that since $K_\alpha$ is @{compact and therefore closed|compact-implies-closed}, $G_\alpha$ is open. Then, fix a member $K_1$ of $\{K_\alpha\}.$ Assume, for contradiction's sake, that no point of $K_1$ is in all $K_\alpha,$ that is, that $\bigcap K_\alpha = \emptyset.$ Then, any point $x \in K_1$ is in some $K_\alpha^c = G_\alpha,$ so $\{G_\alpha\}$ forms an open cover of $K_1.$ Since $K_1$ is compact, some finite subset $G_{\alpha_1}, \dots, G_{\alpha_n}$ of $\{G_\alpha\}$ forms a finite subcover of $K_1$ such that $K_1 \subset G_{\alpha_1} \cup \cdots \cup G_{\alpha_n} = \left ( K_{\alpha_1} \cap \cdots \cap K_{\alpha_n} \right )^c$ (by De Morgan's.) Therefore $K_1 \cap K_{\alpha_1} \cap \cdots \cap K_{\alpha_n} = \emptyset.$ This is an empty intersection of a finite subcollection of $\{K_\alpha\},$ which contradicts our hypothesis that all finite intersections are nonempty. Therefore, our assumption that no point in $K_1$ is in all $K_\alpha$ is incorrect, and some point in $K_1$ is in all $K_\alpha,$ and therefore $\bigcap K_\alpha$ is not empty.
::::

::::corollary
If $\{K_\alpha\}$ is a sequence of nonempty compact sets such that $K_{n+1} \subset K_n, n = 1, 2, 3, \dots,$ then $\bigcap_{i=1}^\infty K_n$ is not empty.

:::::proof
Suppose $x \in K_n, n \geq 2.$ Then, by definition, $x \in K_{n-1},$ and by induction, $x \in K_1.$ Then, every $K_\alpha$ is a nonempty subset of $K_1,$ and so the intersection of any finite number of these $K_\alpha$ will be nonempty, and by @nonempty-intersection-of-finitely-many-compact-sets, $\bigcap_{i=1}^\infty K_n$ is not empty.
:::::
::::
:::

:::theorem {label: infinite-subset-of-compact-set-has-limit-point}
If $E$ is an infinite subset of a compact set $K,$ then $E$ has a limit point in $K.$

::::proof
Assume, for the sake of contradiction, that no point in $K$ is a limit point of $E.$ Then any point $q$ in $K$ has a neighborhood with at most one point in $E;$ $q,$ if $q \in E.$ Since $E$ is infinite, an infinite number of these singleton neighborhoods would be required to cover it, and therefore to cover $K,$ since $E \subset K.$ But, this contradicts our hypothesis that $K$ is compact. Therefore, our provisional assumption must be false, and $K$ must contain a limit point of $E.$
::::
:::

:::theorem {label: intersection-of-sequence-of-nested-intervals-is-nonempty}
If ${I_n}$ is a sequence of intervals in $R^1,$ such that $I_{n+1} \subset I_n, n = 1,2,3,...,$ then $\bigcap_{i=1}^n I_n$ is not empty.

::::proof
Let $I_n = [a_n, b_n],$ and let $E$ be the set of all $a_n.$ Then, $E$ is nonempty, because even if $a_n = b_n$ for all $n,$ it at least contains a single point. It is also bounded above by $b_1,$ since any $b_n$ is in $[a_1, b_1].$ Let $x = \sup E.$ Let $m$ and $n$ be positive integers and we have that


$$ a_n \leq a_{m+n} \leq b_{m+n} \leq b_m, $$

so that $x \leq b_m$ for each $m.$ Since $a_m \leq x,$ we have that $a_m \leq x \leq b_m,$ that is, $x \in I_m$ for all $m = 1, 2, 3, \dots,$ so $x \in \bigcap_{i=1}^n I_n$ and thus $\bigcap_{i=1}^n I_n$ is not empty.
::::
:::

:::theorem {label: every-k-cell-is-compact}
Every $k$-cell is compact.

::::proof
Let $I$ be a $k$-cell, consisting of all points $\vec{x} = (x_1, \dots, x_k)$ such that $a_j \leq x_j \leq b_j, 1 \leq j \leq k.$ Let

$$ \delta = { \sqrt{\sum_{j=1}^k (b_j - a_j)^2}  }, $$

i.e., the maximum distance between any two points in $I$ (the diagonal). Then for any points $\vec{x}, \vec{y} \in I, |\vec{x} - \vec{y}| \leq \delta.$

Suppose, for the sake of contradiction, that there is an open cover $\{G_\alpha\}$ of $I$ that contains no finite subcover of $I.$ Now, let $c_j = (a_j + b_j)/2,$ i.e. $c_j$ is the midpoint of $[a_j, b_j].$ We can subdivide $I$ into $2^k$ $k$-cells $Q_i,$ determined by the intervals $[a_j, c_j]$ and $[c_j, b_j].$ At least one $Q_i,$ call it $I_1,$ cannot be covered by any finite subcollection of $\{G_\alpha\},$ or else $I$ would have a finite subcover in $\{G_\alpha\}.$ We then can subdivide $I_1$ and so on, obtaining a sequence $\{I_n\}$ with the following properties:

(a) $I_{n+1} \subset I_{n}$ (each $k$-cell in the sequence is nested in the previous.)

(b) $I_n$ is not covered by any finite subset of $\{G_\alpha\}.$

(c) If $\vec{x}, \vec{y} \in I_n,$ then $|\vec{x} - \vec{y}| \leq 2^{-n} \delta.$

From (a) and @intersection-of-sequence-of-nested-intervals-is-nonempty, there is some point $\vec{x}^*$ that is in every $I_n.$ For some $\alpha, x^* \in G_\alpha,$ since $\{G_\alpha\}$ is a cover of all of $I.$ $G_\alpha$ is open, so for some $r > 0, |\vec{y} - \vec{x^*}| < r$ implies that $y \in G_\alpha,$ that is, $\vec{x}$ has a neighborhood that lies entirely within $G_\alpha.$ If we make $n$ big enough, we have that $2^{-n} \delta < r,$ so by (c), $I_n \subset G_\alpha,$ that is, $I_n$ is entirely covered by $G_\alpha.$ But, this contradicts (b), so our provisional assumption is incorrect, and $\{G_\alpha\}$ must have a finite subcover that covers $I,$ and therefore $I$ is compact.
::::

::::intuition
If a $k$-cell has an open cover $\{G_\alpha\}$, then any point in it will be in some $G_\alpha,$ and can therefore be surrounded by an open ball with some positive radius, lying entirely in $G_\alpha$. That open ball takes up some space, and we can then subdivide the $k$-cell into small enough parts that some part is entirely within that open ball. We still have finitely many subdivisions, and each of those could be covered with a similary constructed open ball, which means we can cover the entire $k$-cell with finitely many open balls covered by finitely many elements of $\{G_\alpha\}.$
::::
:::

:::theorem "Heine-Borel" {label: heine-borel}
If a set $E$ in $R^k$ has one of the following three properties, then it has the other two:

(a) $E$ is closed and bounded.

(b) $E$ is compact.

(c) Every infinite subset of $E$ has a limit point in $E.$


::::proof
If (a) holds, then $E \subset I$ for some $k$-cell $I,$ and (b) follows from the facts that @{every $k$-cell is compact|every-k-cell-is-compact} and @{closed subsets of compact sets are compact|closed-subsets-of-compact-sets-are-compact}. Then, (c) follows from the fact that @{any infinite subset $K$ of a compact set $E$ has a limit point in $E$|infinite-subset-of-compact-set-has-limit-point}. To complete, the cycle of implication, we must now show that (c) implies (a).

Assume, for the sake of contradiction, that $E$ is not bounded. Then, $E$ must contain an indexed set of points $\{x_n\}, n = 1, 2, 3, \dots$ where each $x_n$ must satisfy $|x_n| > n.$ $\{x_n\}$ is obviously infinite, but we will show it has no limit points in $E.$ Let $p \in E.$ Then for some positive integer $N,$ $|p| < N.$ Since $N$ is finite, there can only be finitely many points $\{q_\alpha\}$ in $\{x_n\}$ with $|x_n| < N.$ If $\{q_\alpha\}$ is empty, then $p$ is obviously not a limit point of $\{x_n\}.$ Otherwise, let $r = \min\{d(p, q_\alpha)\}.$ Then $r > 0$ and let $N_r\{p\}$ be a neighborhood of $p.$ Since no point in $\{x_n\},$ other than perhaps $p,$ lies in $\{x_n\},$ $p$ is clearly not a limit point of $\{x_n\}.$ Thus, our provisional assumption is invalid and (c) implies $E$ is bounded.

To show that (c) implies $E$ is closed, assume for the sake of contradiction that $E$ is not closed. Then, there is a point $x_0 \in R^k$ which is a limit point of $E$ but is not in $E.$ We will construct an infinite subset of $E$ and show that it has no limit point in $E.$ For $n = 1, 2, 3, \dots,$ let the point $x_n$ be some point in $E$ such that $|x_n - x_0| < 1/n;$ let $\{x_n\}$ be the set of such points. $\{x_n\}$ is certainly infinite (because $|x_n - x_0|$ will eventually be bigger than $1/n$ for some $n$ if we keep reusing the same $x_n$ infinitely many times.) Now, $\{x_n\}$ has $x_0$ as a limit point, and we will show it is its only limit point in $R^k.$ Assume $y \in R^k, y \neq x_0.$ Then, via the triangle inequality,


$$ \begin{aligned}

|x_n - y| & \geq |x_0 - y| - |x_n - x_0| \\
          & \geq |x_0 - y| - \frac{1}{n} \\
          & \geq \frac{1}{2} |x_0 - y|
\end{aligned} $$

for all but finitely many $n,$ and thus $y$ is not a limit point of $\{x_n\}$ because its @{its neighborhoods do not contain infinitely many points of $\{x_n\}$|neighborhood-of-limit-point-contains-infinitely-many-points}. Thus, $\{x_n\}$ has no limit point in $E,$ which contradicts (c), and therefore our provisional assumption that $E$ is not closed is incorrect, and (c) implies that $E$ is closed.
::::

::::note
Without proof here, (b) and (c) are equivalent in any metric space, but (a) does not imply (b) and (c) in every metric space (we assumed $R^k$ above.)
::::
:::
