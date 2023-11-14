---
layout: page
title: Inverse Operators
---

# Inverse Operators

## Foreword


Recall that a general solution is the sum of the complentary function and a  particular solution i.e. $y = y_c + y_p$.

The complentary function of the differntial equation:

$$ \tag{a} (D^2 -1)y = x^2 $$

is

$$ \tag{b} y_c = c_1 e^x + c_2 e^{-x} $$

and a particular solution of $(a)$ is:

$$ \tag{c} y_p = -x^2 - 2 $$

Therefore the general solution is:

$$ \tag{d} y = -x^2 - 2 + c_1 e^x + c_2 e^{-x} $$

Note that $(b)$ can be obtained by assigning the value of 0 to both arbitrary constants in $(d)$, and so can infinitely other particular solutions.

In this lesson and the next, whenver we refer to a particular solution $y_p$ of a differential equation, we shall mean that particular solution from which all constant multiples of terms in $y_c$ have been eliminated.

(*jmh* The implication here is that there is only one such particular solution in which all arbitrary constants have been set to zero - the infinite multitude of particular solutions arises from those arbitrary constants being values other than zero).

## Meaning of an Inverse Operator

Given the $n$th order linear differential equation:

$$ \tag{25.1} P(D)y = Q(x),$$

Recall that when we say $P(D)$ we mean the polynomial operator:

$$ \tag{25.11} P(D) = a_n D^n + \cdots + a_1 D + a_0, \quad a_n \neq 0 $$

***Definition 25.2*** Let $P(D)y = Q(x)$ where $P(D)$ is the polynomial operator $(25.11)$ and $Q(x)$ is the special function consisting only of such terms as $b, x^k, e^{ax}, \sin{ax}, \cos{ax}$, and a finite number of combinations of such terms, where $a, b$ are constants and $k$ is a positive integer. Then the **inverse operator** of $P(D)$, written as P^{-1}(D) or $1/P(D)$, is defined as an operator which, when operating on $Q(x)$, will give the particular solution $y_p$ of $(25.1)$ that contains no constant multiples of a term in the complementary function $y_c$, i.e.,

$$ \tag{25.21} P^{-1})(D)Q(x) = y_p \quad \text{or} \quad \frac{1}{P(D)}Q(x) = y_p, $$

where $y_p$ is the particular solution of $P(D)y = Q(x)$ that containts no constant multiple of a term in $y_c$.

By Definition 25.2, we can conclude that:

$$ \tag{25.25} D^{-n}Q(x) \equiv \text{integrating}~Q(x)~n~\text{times, ignoring constants of integration} $$ 


