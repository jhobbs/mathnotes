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
An **open cover** of a set $E$ in a [[metric space|metric-spaces]] $X$ is a collection $\{G_\alpha\}$ of open subsets of $X$ such that $E \subset \bigcup_\alpha G_\alpha.$
:::

:::definition "Compact"
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
Suppose $K$ is compact relative to $X$ and that $\{V_\alpha\}$ is an open cover of $K$ relative to $Y,$ such that $K \subset \bigcup_\alpha V_\alpha.$ We need to show that a finite subset of $\{V_\alpha\}$ covers $K.$  Because $\{V_\alpha\}$ is open relative to $Y$ and $Y \subset X$ (see theorem in [[metric-spaces]]) there are sets $G_\alpha,$ open relative to $X,$ such that $V_a = Y \cap G_\alpha,$ for each $\alpha.$ Now, since $K$ is compact relative to $X,$ we have

$$ K \subset G_{\alpha_1} \cup \cdots \cup G_{\alpha_n}, \tag{a} $$

for some finite set of indices $a_1, \dots, a_n.$ Now, since $K \subset Y,$

$$ K \subset V_{\alpha_1} \cup \cdots \cup V_{\alpha_n}, \tag{b} $$

which shows $K$ is compact relative to $Y.$

Conversely, suppose $K$ is compact relative to $Y$ and let $\{G_\alpha\}$ be a cover of $K$ open relative to $X.$ We need to show there is a finite subset of $\{G_\alpha\}$ that covers $K.$ Let $V_\alpha = Y \cap G_\alpha,$ for each $\alpha.$ Then (b) will hold for some set of indicies, $\alpha_1, \dots, \alpha_n,$ and since each $V_\alpha \subset G_\alpha,$ (a) is implied by (b) and we've shown $K$ is compact relative to $X.$
::::
:::
