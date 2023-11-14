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

## Solution by Means of Inverse Operators

We shall consider each of the functions mentioned in Definition 25.2, case by case.

(*jmh* Note that the book proves each scenario but I'll just capture the recipe for each scenario here.)

**If** $Q(x) = bx^k$ **and** $P(D) = D - a_0$:

Given:

$$ \tag{a} (D - a_0)y = bx^k $$

By definition 25.2 we have:

$$ \tag{b} y_p = \frac{1}{D - a_0}(bx^k) = \frac{1}{-a_0(1-\frac{D}{a_0})}(bx^k) $$

Which, via geometric series expansion can be written as:

$$ \tag{c} -\frac{1}{a_0}(1 + \frac{D}{a_0} + \frac{D^2}{{a_0}^2} + \cdots + \frac{D^k}{{a_0}^k})(bx^k), \quad a_0 \neq 0 $$

Note that we can stop the series expansion at $D^k$ because we're differentiating a $k$th degree polynomial, and higher derivatives will just be $0$.

Also note that for the special case $k = 0$, we have:

$$ \tag{d} y_p = \frac{b}{a_0} $$


**If** $Q(x) = bx^k$ **and** $P(D) = a_n D^n + \cdots + a_1 D$:

We have here that $D$ is a factor of $P(D)$d and can write $P(D) = D(a_n D^{n-1} + \cdots + a_2 D + a_1$, where $a_1 \neq 0$. We can also have higher powered factors of $D$ in $P(D)$. In general, let $D^r$ be a factor of $P(D)$. Then $P(D)y = bx^k$ can be written as:

$$ \tag{a} P(D)y = D^r (a_n D^{n-r} + \cdots + a_{r+1} D + a_r)y = bx^k, \quad a_r \neq 0 $$

Therefore, by Definition 25.2:

$$ y_p = \frac{1}{D^r}(\frac{1}{a_n D^{n-r} + \cdots + a_{r+1} D + a_r}(bx^k)), \quad a_r \neq_0 $$ 

From there, we first perform series expansion to get a non-inverse differential operator (see above from the first $bx^k$ recipe), apply differntiation, and then take $r$ successive integrals against the result, ignoring arbitrary constants of differentiation.
