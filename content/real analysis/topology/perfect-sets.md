---
layout: page
title: Perfect Sets
description: Introduces perfect sets.
---

# Perfect Sets

:::note
This section was developed by following Rudin, *Principles of Mathematical Analysis*, Chapter 2.
:::

Review the definition of a @{perfect set|perfect-set}.

:::theorem
Let $P$ be a nonempty perfect set in $R^k.$ Then $P$ is uncountable.

::::proof
We know that $P$ is infinite, because by definition, @{all points in perfect sets are limit points|perfect-set}, and @{only infinite sets have limit points|only-infinite-sets-have-limit-points}.

Suppose, for the sake of contradiction, that $P$ is countable. Label the points of $P$ as $x_1, x_2, \dots.$ We will construct a sequence of ${V_n}$ of neighborhoods.

As a base step, let $V_1$ be any neighborhood of $x_1;$ let $V_1 = \{ y \in R^k | ~ |y - x_1| < r \}$ (note: subsequent $V_{n+1}$ aren't required to be neighborhoods of $x_{n+1}.$) Then the @{closure|closure} $\overline{V_1}$ of $V_1$ is $\overline{V_1} =  \{ y \in R^k | ~ |y - x_1| \leq r \}.$

For the inductive step, suppose as an induction hypothesis that have some $V_n$ that's been constructed such that $V_n \cap P$ is not empty. Since every point of $P$ is a limit point of $P,$ we can make a neighborhood $V_{n+1}$ such that (i) $\overline{V_{n+1}},$ (ii) $x_n \notin \overline{V_{n+1}},$ (iii) $V_{n+1} \cap P$ is not empty. Now, $V_{n+1}$ satisfies our induction hypothesis, and since $V_1$ does too, we have ${V_n}$ defined for all $n = 1, 2, 3, \dots.$

For each $n$, let $K_n = \overline{V_n} \cap P.$ Since $\overline{V_n}$ is closed and bounded, $\overline{V_n}$ @{is compact|heine-borel}. Since $x_n \notin \overline{V_{n+1}},$ no point of $P$ lies in $\bigcap_{n=1}^\infty K_n.$ Since $K_n \subset P,$ this implies that $\bigcap_{n=1}^\infty K_n$ is empty. But, each $K_n$ is nonempty, by (iii), and $K_{n+1} \subset K$, by (i). But the @{intersection of nonempty compact nested sets is nonempty|intersection-of-nonempty-nested-compact-sets-is-nonempty}, so we have a contradiction, and our provision assumption that $P$ is countable must be incorrect. Therefore, $P$ is uncountable.
::::

::::corollary
Every interval $[a, b] (a < b)$ is uncountable, and thus the set of all real numbers is uncountable as it contains uncountable subsets.
::::

:::
