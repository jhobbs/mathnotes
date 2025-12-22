---
description: More Series of Complex Numbers
layout: page
title: More Series
---


:::theorem "Finite Geometric Series" {label: finite-geometric-series}

Let $w \in mathbb{C}$ and $N$ be a positive integer. Then

$$ \sum_{k=0}^{N-1} w^k = \frac{1 - w^N}{1 - w}. $$

::::proof

First, define $S_N$ as

$$ S_N = \sum_{k=0}^{N-1} w^k = 1 + w + w^2 + \cdots + w^{N-1}. $$

Then

$$ \begin{aligned}
S_N & = 1 + w + w^2 + \cdots + w^{N-1} \\
wS_N & = w + w^2 + w^3 + \cdots + w^{N}
\end{aligned} $$

Subtracting the second equation from the first gives

$$ \begin{aligned}
S_N - wS_N & = (1 + w + w^2 + \cdots + w^{N-1}) - (w + w^2 + w^3 + \cdots + w^{N}) \\
           & = 1 - w^N,
\end{aligned} $$

because everything in the middle cancels out.

Now, we can factor out $1 - w$ from the left hand side to get

$$ \begin{aligned}
(1 - w)S_N & = 1 - w^N \\
S_N & = \frac{1 - w^N}{1 - w} \\
\sum_{k=0}^{N-1} w^k & = \frac{1 - w^N}{1 - w}.
\end{aligned} $$
$$
::::
:::
