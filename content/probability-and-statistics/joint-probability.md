---
layout: page
title: Joint Probability
description: Bivariate random variables, marginalization, multinomial distributions, convolutions, and covariance-correlation analysis.
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

## Sums of Independent Random Variables

Sums of independent random variables are called convolutions.

If $X$ and $Y$ are continuous, the probability density function of $X + Y$ is given by

$$ f_{X+Y}(x) = \int_{-\infty}^{\infty} f_X(t) f_Y(x - t) dt. $$

If they are discrete, the probability mass function of $X + Y$ is given by

$$ f_{X+Y}(n) = \sum_k f_X(k)f_Y(n - k). $$


### Sums of Indepenent Poisson Random Variables

*Theorem:* If $X_1, X_2, \dots X_n$ are independent Poisson random variables with parameters $\lambda_1, \lambda_2, \dots, \lambda_n,$ then $X_1 + X_2 + \cdots + X_n$ is a Poisson random variable with parameter $\lambda_1 + \lambda_2 + \cdots  + \lambda_n.$

### Sums of Independent Normal Random Variables

*Theorem:* If $X_1, X_2, \dots X_n$ are independent normal random variables with means $\mu_1, \dots, \mu_n$ and variances $\sigma_1^2, \dots, \sigma_n^2,$ then the random variable $X_1 + X_2 + \cdots + X_n$ is normal with mean $\mu_1 + \mu_2 + \cdots + \mu_n$ and variance $\sigma_1^2 + \sigma_2^2 + \cdots + \sigma_n^2.$


## Covariance and Correlation Coefficient
Covariance is a measure of the joint variability of two random variables. 

$$ \text{Cov}(X,Y) = E[(X - E[X])(Y - E[Y])]. $$

If large $X$ values go with large $Y$ values and small $X$ goes with small $Y$, covariance will be positive. The covariance will be negative if large $X$ values go with small $Y$ values and vice-versa. An altenative, equivalent form of covariance is:

$$ \text{Cov}(X,Y) = E[XY] - E[X]E[Y]. $$

The correlation coefficient of $X$ and $Y$, $\rho_{x,y},$ is given by

$$ \rho_{x,y} = \frac{\text{Cov}{(X, Y)}}{\sigma_X \sigma_Y}. $$

The correlation coefficient is a standardized measure that quantifies the strength and direction of a linear relationship between two variables, ranging from –1 to 1. A positive value indicates that the variables tend to increase together, a negative value indicates that one tends to decrease when the other increases, and a value close to zero suggests little to no linear association.