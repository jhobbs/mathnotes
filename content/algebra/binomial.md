---
layout: page
title: Binomial Theorem
description: Binomial Theorem and Coefficient
---

:::definition "Binomial Coefficient"
For $n, k \in mathbb{N}, n \geq k \geq 0,$ the **binomial coefficient** is the coefficient of the $x^k$ term in the polynomial expansion of the binomial power $(1+x)^n.$ It is denoted as $\binom{n}{k}$ and can be expressed through @factorial notation as

$$ \binom{n}{k} = \frac{n!}{k!(n - k)!}. $$
:::


:::definition "Generalized Binomial Coefficient"
For any complex number $n \in \mathbb{C}$ and any integer $k \geq 0,$ the **generalized binomial coefficient** is defined by

$$ \binom{n}{k} = \frac{n(n-1)(n-2) \cdots (n - k + 1)}{k!}. $$
:::

:::theorem "Binomial Theorem" {label: binomial-theorem}
The expansion of any nonnegative integer power $n$ of the @binomial $x+y$ is a sum of the form

$$ (x+y)^n = \sum_{k=0}^n \binom{n}{k} x^{n-k} y^k = \sum_{k=0}^n \binom{n}{k} x^k y^{n-k}. $$
:::

:::remark
A special case of the @binomial-theorem is the case where $y = 1:$

$$ (x+1)^n = \sum_{k=0}^n \binom{n}{k} x^k. $$
:::
