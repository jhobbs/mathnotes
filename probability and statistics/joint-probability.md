---
layout: page
title: Joint Probability
---

# Joint Probability

Two random variables $X$ and $Y$ can be paired as a single **random vector** or **bivariate random variable.** If it's discrete (i.e. both X and Y are discrete) it has a **joint probability mass function** and if it's continuous (X and Y are both continuous) it has a **joint probability density function.**

In the discrete case, $f(x,y) = P(X = x, Y = y).$

We can **marginalize** over $Y$ to find soley the distribution of $X,$ we denote this $f_X(x)$ and give it as

$$  f_X(x) = \sum_y f(x, y). $$

We can similarly find $f_Y(y)$ by marginalizing over $X$:

$$  f_Y(y) = \sum_x f(x, y). $$

## Multinomial Distribution

For a sequence of $n$ independent, identical experiments with each one of the experiments resulting in $r$ outcomes with probabilities $p_1, p_2, \dots, p_r,$ respectively, where $\sum_{i=1}^r p_i = 1,$  we let $X_i$ count the number of the $n$ experiments that result in the $i$th of the $r$ outcomes. Then

$$ P(X_1 = n_1, X_2 = n_2, \dots, X_n = n_r) = \binom{n}{n_1, n_2, \dots, n_r}p_1^{n_1}p_2^{n_2}\cdots p_r^{n_r}, $$

where $\sum_{i=1}^r n_i = n.$

This uses the multinomial coefficient, which is defined as

$$ \binom{n}{n_1,n_2,\dots,n_r} = \frac{n!}{n_1!n_2! \cdots n_r!}. $$