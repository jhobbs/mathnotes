---
layout: page
title: Differential and Polynomial Operators
---

# Differential and Polynomial Operators

## Definition of an Operator. Linear Property of Polynomial Operators

An operator is a mathematical device which converts one function into another. For example, differention and integration convert one function into another.

By convention, the letter $D$ is used to denote the operation of differentiation and is called a **differential operator**.


Hence, if $y$ is an $n$th order differentiable function, then

$$ \tag{24.11} D^0 y = y,\quad Dy=y',\quad D^2 y = y'', \cdots,D^n y = y^{(n)} $$ 

By forming a linear combination of differential operators of orders 0 to $n$, we obtain the expression:

$$ \tag{24.12} P(D) = a_0 + a_1 D + a_2 D^2 + \cdots + a_n D^n, a_n \neq 0, $$

where $a_0, a_1, \cdots, a_n$ are constants.

Because of the resemblance of $P(D)$ to a polynomial, we shall refer to it as a **polynomial operator of order n**.


**Definition 24.13** Let $P(D)$ be the polynomial operator (24.12) of order $n$ and let $y$ be an $n$th order differntiable function. Then we define **P(D)y** to mean:

$$ \tag{24.14} P(D)y = (a_n D^n + \cdots + a_1 D + a_0)y = a_n D^n y + \cdots + a_1 D y + a_0 y $$


By $(24.11)$ we can also write $(24.14)$ as:

$$ \tag{24.15} P(D)y = a_n y^{(n)} + \cdots + a_1 y' + a_0 y,\quad a_n \neq 0 $$

Hence by $(24.15)$ we can write the linear equation with constant coefficients:

$$ \tag{24.16} a_n y^{(n)} + \cdots + a_1 y' + a_0 y = Q(x),\quad a_n \neq 0 $$

as

$$ \tag{24.17} P(D)y = Q(x) $$

