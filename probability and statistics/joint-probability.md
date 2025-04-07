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