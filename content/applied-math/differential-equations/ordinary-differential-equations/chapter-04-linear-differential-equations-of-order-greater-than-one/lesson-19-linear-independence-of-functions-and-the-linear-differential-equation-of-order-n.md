---
description: Fundamental theory of linear differential equations of higher order including
  linear independence of solutions, existence and uniqueness theorems, and the structure
  of general solutions for homogeneous and nonhomogeneous equations.
layout: page
redirect_from:
- ode/chapter 04 - linear differential equations of order greater than one/lesson 19 - linear independence of functions and the linear differential equation of order n
title: Linear Independence of Functions. The Linear Differential Equation of Order
  n.
---

# Linear Independence of Functions. The Linear Differential Equation of Order n.

## Linear Independence of a Function

A set of functions $f_1(x), f_2(x),\cdots,f_n(x),$ each defined on a common interval $I,$ is called **linearly dependent** on $I,$ if there exists a set of constants $c_1,c_2,\cdots,c_n,$ not *all* zero, such that:

$$ \tag{19.11} c_1f_1(x) + c_2f_2(x) + \cdots + c_nf_n(x) = 0 $$

for *every* $x$ in $I$. If no such set of constants $c_1,c_2,\cdots,c_n,$ exists, then the set of functions is called **linearly independent**.

The left side of $(19.11)$ is called a **linear combination** of the set of functions $f_1(x), f_2(x),\cdots,f_n(x).$

*jmh*: There are plenty of examples of sets of linearly dependent and independent functions elsewhere.

To show that a set of functions is linearly dependent we need only to find one combination of constants that makes the linear combination zero. We can pick any values for the constants as long as at least one of them is not zero.

To show that a set of functions is linearly independent, we need to show that no set of constants (with at least one constant non-zero) makes the linear combination zero. One way to accomplish this is to assume that a set of constants that makes the linear combination zero does exist and then show there is a contradiction.

The book suggests there are ways to test for linear independence but they aren't taught until the very end of the book. *end jmh*


### Background from  18.1:

**A linear differential equation of order n** is an equation which can be written in the form

$$ \tag{18.11} f_n(x)y^{(n)} + f_{(n-1)}(x)y^{(n-1)} + \cdots + f_1(x)y' + f_0(x)y = Q(x), $$

where $f_0(x),f_1(x),\cdots,f_n(x),$ and $Q(x)$ are each continuous functions of $x$ defined on a common interval $I$ and $f_n(x) \not\equiv 0$ on $I$.

Note that in a linear differential equation of order $n,$ $y$ and each of its derivatives have exponent one; $y^2$ etc is not allowed.

If $Q(x) \not\equiv 0$ on $I,$ $(18.11)$ is called a **nonhomogenous linear differential equation of order n**.

If in $(18.11)$ $Q(x) \equiv 0$ on $I$, the resulting equation:

$$ \tag{18.13} f_n(x)y^{(n)} + f_{(n-1)}(x)y^{(n-1)} + \cdots + f_1(x)y' + f_0(x)y = 0 $$

is called a **homogenous linear differential equation of order n.**

Note: this is a different use of the term homogenous than in Lesson 7.

### Linear Independence and Linear Differential Equations of Order n

***Theorem*** A homogenous linear differential equation has as many linearly independent solutions as the order of its equation. See Lesson 65.4 for proof.

## The Linear Differential Equation of Order $n$

***Theorem 19.2*** If $f_0(x),f_1(x),\cdots,f_n(x),$ and $Q(x)$ are each continuous functions of $x$ defined on a common interval $I$, and $f_n(x) \neq 0$ when $x$ is in $I$, then the linear diferential equation

$$ \tag{19.21} f_n(x)y^{(n)} + f_{(n-1)}(x)y^{(n-1)} + \cdots + f_1(x)y' + f_0(x)y = Q(x) $$

has one and only one solution,

$$ \tag{19.22} y = y(x), $$

satisfying the set of initial conditions

$$ \tag{19.23} y(x_0) = y_0,\quad y'(x_0) = y_1, \quad \cdots, y^{(n-1)}(x_0) = y_{n-1} $$

where $x_0$ is in $I$, and $y_0, y_1, \cdots, y_{n-1}$ are constants.

This is an *existence and uniqueness theorem*. This is a very important theorem, but its proof would be too much to get into now, and is delayed to Lesson 65.

***Theorem 19.3*** If $f_0(x),f_1(x),\cdots,f_n(x),$ and $Q(x)$ are each continuous functions of $x$ defined on a common interval $I$, and $f_n(x) \neq 0$ when $x$ is in $I$, then

1) The homogenous linear diferential equation

$$ \tag{19.31} f_n(x)y^{(n)} + f_{(n-1)}(x)y^{(n-1)} + \cdots + f_1(x)y' + f_0(x)y = 0 $$

has $n$ linearly independent solutions $y_1(x), y_2(x), \cdots, y_n(x)$.

2) The linear combination of these $n$ solutions

$$ \tag{19.32} y_c(x) = c_1y_1(x) + c_2y_2(x) + \cdots + c_ny_n(x), $$

where $c_1, c_2, \cdots, c_n$ is a set of $n$ arbitrary constants, is also a solution of (19.31). It is an $n$-parameter family of solutions of (19.31).

3) The function

$$ \tag{19.33} y(x) = y_c(x) + y_p(x) $$

where $y_c(x)$ is defined in (19.32) and $y_p(x)$ is a particular solution of the nonhomogenous linear differential equation corresponding to (19.31), namely:

$$ \tag{19.34} f_n(x)y^{(n)} + f_{(n-1)}(x)y^{(n-1)} + \cdots + f_1(x)y' + f_0(x)y = Q(x) $$

is an $n$-paremeter family of solutions of (19.34). 

See the book for proofs of this theorem.

## A Few Proofs from Exercises

***Theorem from Exercise 5***: If $y_p$ is a solution of:

$$ \tag{19.5} f_n(x)y^{(n)} + \cdots + f_1(x)y' + f_0(x)y = Q(x) $$

then $Ay_p$ is a solution of (19.5) with $Q(x)$ replaced by $AQ(x).$

***Proof***: By hypothesis, $y_p$ is a solution of (19.5), that is:

$$ \tag{19.5a} f_n(x){y_p}^{(n)} + \cdots + f_1(x){y_p}' + f_0(x){y_p} = Q(x) $$

Multiplying both sides of $(19.5a)$ by $A$ gives:

$$ \tag{19.5b} f_n(x)A{y_p}^{(n)} + \cdots + f_1(x)A{y_p}' + f_0(x)A{y_p} = AQ(x) $$

Using the fact that $A$ is a constant and that a constant can be moved inside of a derivative ($\frac{d}{dx}[cf(x)] = cf'(x)$), we can rewrite (19.5b) as:

$$ \tag{19.5c} f_n(x){(Ay_p)}^{(n)} + \cdots + f_1(x){(Ay_p)}' + f_0(x){(Ay_p)} = AQ(x) $$

which shows that $y_p$ satisfies (19.5c) and is therefore a solutioni of (19.5) with $Q(x)$ replaced by $AQ(x)$ $\blacksquare$.


***Theorem from Exercise 6: Principle of Superposition***: If $y_{p1}$ is a solution of (19.5) with $Q(x)$ replaced by $Q_1(x)$ and $y_{p2}$ is a solution of (19.5) with $Q(x)$ replaced by $Q_2(x)$, then $y_p = y_{p1} + y_{p2}$ is a solution of:

$$ \tag{19.5d} f_n(x)y^{(n)} + \cdots + f_1(x)y' + f_0(x)y = Q_1(x) + Q_2(x) $$

***Proof***: By hypothesis:


$$ \tag{19.5e} f_n(x){y_{p_1}}^{(n)} + \cdots + f_1(x){y_{p_1}}' + f_0(x)y_{p_1} = Q_1(x) $$

and

$$ \tag{19.5f} f_n(x){y_{p_2}}^{(n)} + \cdots + f_1(x){y_{p_2}}' + f_0(x)y_{p_2} = Q_2(x) $$

Adding (19.5e) and (19.5f) and rearranging gives:

$$ \tag{19.5g} f_n(x)({y_{p_1}}^{(n)} + {y_{p_2}}^{(n)}) + \cdots + f_1(x)({y_{p_1}}' + {y_{p_2}}') + f_0(x)({y_{p_1}} + {y_{p_2}})  = Q_1(x) + Q_2(x) $$

Using the fact that $f'(x) + g'(x) = \frac{d}{dx}[f(x) + g(x)]$, we can rewrite (19.5g) as

$$ \tag{19.5h} f_n(x)(y_{p_1} + y_{p_2})^{(n)} + \cdots + f_1(x)(y_{p_1} + y_{p_2})' + f_0(x)(y_{p_1} + y_{p_2}) = Q_1(x) + Q_2(x) $$

which shows that $y_p = y_{p_1} + y_{p_2}$ satisfies (19.5d) and is therefore a solution $\blacksquare$.

***Theorem from Exercise 7***: If $y_p(x) = u(x) + iv(x)$ is a solution of 

$$ \tag{19.5i} f_n(x)y^{(n)} + \cdots + f_1(x)y' + f_0(x)y = R(x) + iS(x) $$

where $f_0(x),\cdots,f_n(x)$ are real funtions of $x,$ then
   
(a) the real part of $y_p$, i.e., $u(x)$, is a solution of

$$ \tag{19.5j} f_n(x)y^{(n)} + \cdots + f_1(x)y' + f_0(x)y = R(x) $$

(b) the imaginary pary of $y_p$, i.e. $v(x)$, is a solution of:

$$ \tag{19.5k} f_n(x)y^{(n)} + \cdots + f_1(x)y' + f_0(x)y = S(x) $$

By hypothesis we have:

$$ \tag{19.5l} f_n(x)(u(x) + iv(x))^{(n)} + \cdots + f_1(x)(u(x) + iv(x))' + f_0(x)(u(x) + iv(x)) = R(x) + iS(x) $$

Using the fact that $f'(x) + g'(x) = \frac{d}{dx}[f(x) + g(x)]$, and also distributing, we can rewrite $(19.5l)$ as

$$ \tag{19.5m} f_n(x){u(x)}^{(n)} + f_n(x){iv(x)}^{(n)} + \cdots + f_1(x){u(x)}' + f_1(x){iv(x)}' + f_0(x){u(x)} + f_0(x){iv(x)} = R(x) + iS(x) $$

Rearranging terms in $(19.5m)$ and factoring out $i$ lets us rewrite the left-hand side in real and imaginary parts (see notes on [Complex Numbers](/mathnotes/analysis/complex-analysis/module-01-algebriac-properties/)):

$$ \tag{19.5n} [f_n(x){u(x)}^{(n)} + \cdots + f_1(x){u(x)}' + f_0(x){u(x)}] + i[f_n(x){v(x)}^{(n)} + \cdots + f_1(x){v(x)} + f_0(x){v(x)}] = R(x) + iS(x) $$

Since the real and imaginary parts of two complex numbers must each respectively be equal if the two complex numbers are equal, we have:

$$ \tag{19.5o} f_n(x){u(x)}^{(n)} + \cdots + f_1(x){u(x)}' + f_0(x)u(x) = R(x) $$

which shows $u(x)$ satisfies $(19.5j)$ and is therefore a solution, and 

$$ \tag{19.5p} f_n(x){v(x)}^{(n)} + \cdots + f_1(x){v(x)}' + f_0(x)v(x) = S(x) $$

which shows $v(x)$ satisfies $(19.5k)$ and is therefore a solution $\blacksquare$.