---
layout: page
redirect_from:
- ode/chapter 05 - operators and laplace transforms/lesson 25 - inverse operators
- chapter 05 - operators and laplace transforms/lesson 25 - inverse operators.html
- /differential-equations/ordinary differential-equations/chapter 05 - operators and
  laplace transforms/lesson 25 - inverse operators
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

***Definition 25.2*** Let $P(D)y = Q(x)$ where $P(D)$ is the polynomial operator $(25.11)$ and $Q(x)$ is the special function consisting only of such terms as $b, x^k, e^{ax}, \sin{ax}, \cos{ax}$, and a finite number of combinations of such terms, where $a, b$ are constants and $k$ is a positive integer. Then the **inverse operator** of $P(D)$, written as $P^{-1}(D)$ or $1/P(D)$, is defined as an operator which, when operating on $Q(x)$, will give the particular solution $y_p$ of $(25.1)$ that contains no constant multiples of a term in the complementary function $y_c$, i.e.,

$$ \tag{25.21} P^{-1}(D)Q(x) = y_p \quad \text{or} \quad \frac{1}{P(D)}Q(x) = y_p, $$

where $y_p$ is the particular solution of $P(D)y = Q(x)$ that containts no constant multiple of a term in $y_c$.

By Definition 25.2, we can conclude that:

$$ \tag{25.25} D^{-n}Q(x) \equiv \text{integrating}~Q(x)~n~\text{times, ignoring constants of integration} $$ 

## Solution by Means of Inverse Operators

As stated above, in general we can find $y_p$ by:

$$ y_p = \frac{1}{P(D)}Q_x $$

This is often a much easier method of finding $y_p$ than previous methods.

We can find some formulas/shortcuts/rules to handle the possible cases.

We shall consider each of the functions mentioned in Definition 25.2, case by case.

(*jmh* Note that the book proves each scenario but I'll just capture the recipe for each scenario here.)

**1. If** $Q(x) = bx^k$ **and** $P(D) = D - a_0$:

Given:

$$ \tag{a} (D - a_0)y = bx^k $$

By definition 25.2 we have:

$$ \tag{b} y_p = \frac{1}{D - a_0}(bx^k) = \frac{1}{-a_0(1-\frac{D}{a_0})}(bx^k) $$

Which, via geometric series expansion can be written as:

$$ \tag{c} -\frac{1}{a_0}(1 + \frac{D}{a_0} + \frac{D^2}{ {a_0}^2 } + \cdots + \frac{D^k}{ {a_0}^k })(bx^k), \quad a_0 \neq 0 $$

Note that we can stop the series expansion at $D^k$ because we're differentiating a $k$th degree polynomial, and higher derivatives will just be $0$.

Also note that for the special case $k = 0$, we have:

$$ \tag{d} y_p = \frac{b}{a_0} $$


**2. If** $Q(x) = bx^k$ **and** $P(D) = a_n D^n + \cdots + a_1 D$:

We have here that $D$ is a factor of $P(D)$d and can write $P(D) = D(a_n D^{n-1} + \cdots + a_2 D + a_1$, where $a_1 \neq 0$. We can also have higher powered factors of $D$ in $P(D)$. In general, let $D^r$ be a factor of $P(D)$. Then $P(D)y = bx^k$ can be written as:

$$ \tag{a} P(D)y = D^r (a_n D^{n-r} + \cdots + a_{r+1} D + a_r)y = bx^k, \quad a_r \neq 0 $$

Therefore, by Definition 25.2:

$$ \tag{25.34} y_p = \frac{1}{D^r}(\frac{1}{a_n D^{n-r} + \cdots + a_{r+1} D + a_r}(bx^k)), \quad a_r \neq 0 $$ 

From there, we first perform series expansion to get a non-inverse differential operator (see above from the first $bx^k$ recipe), apply differntiation, and then take $r$ successive integrals against the result, ignoring arbitrary constants of differentiation.

**3. If** $Q(x) = be^{ax}$:

Then a particular solution of this equation is:

$$ \tag{25.4} y_p = \frac{1}{P(D)} be^{ax} = \frac{be^{ax}}{P(a)}, \quad P(a) \neq 0 $$

**4. If** $Q(x) = b\sin{ax}$ or $b\cos{ax}$

Here we can take advantage of the exponential form of these functions apply the method given for the exponential form above. Even easier, we can use
the method given in $(25.4)$.

That is, for $P(D)y = b\sin{ax}$, we use the imaginary part of the particular solution of:

$$ \tag{a} P(D)y = be^{aix} $$

and for $P(D)y = b\cos{ax}$, we use the real part of the particular solution of $(a)$. In both cases, we use the method given above for $Q(x) = be^{ax}$.

**5. If** $Q(x) = ue^{ax}$ where $u$ is a polynomial in $x$ then:

$$ \tag{25.51} y_p = \frac{1}{P(D)}ue^{ax} = e^{ax} \frac{1}{P(D + a)}u $$

From there, we use the methods given above for $Q(x) = bx^k$ to convert the inverse polynomial operator into a polynomial operator.

**6. If** $Q(x) = be^{ax}$ and $P(a) = 0$:

Given $P(D)y = be^{ax}$, if $P(a) = 0$ then $(D - a)$ is a factor of $P(D)$. Assume $(D - a)^r$ is a factor of $P(D)$. Then we can write:

$$ \tag{a} P(D) = (D - a)^r F(D), \quad F(a) \neq 0. $$

Then a particular solution is:

$$ \tag{25.6} y_p = \frac{1}{P(D)} (be^{ax}) \equiv \frac{1}{(D - a)^r F(D)} (be^{ax}) = \frac{bx^re^{ax}}{r!F(a)}, \quad F(a) \neq 0 $$

**7. If** $Q(x) = Q_1(x) + Q_2(x) + \cdots + Q_n(x)$:

Then $P(D)y = Q(x) = Q_1(x) + Q_2(x) + \cdots + Q_n(x)$ and a particular solution $y_p$ of $P(D)y = Q(x)$ is the sum of the respective solutions of $P(D)y = Q_1$, $P(D)y = Q_2$, $\cdots$, $P(D)y = Q_n$.

Therefore,

$$ \tag{25.6} y_p = \frac{1}{P(D)}Q \equiv \frac{1}{P(D)} Q_1 + \frac{1}{P(D)} Q_2 + \cdots + \frac{1}{P(D)} Q_n $$

Here, we find particular solutions for each part using the methods developed in this lesson, then sum them to find a particular solution for the whole $P(D)y = Q(x)$.