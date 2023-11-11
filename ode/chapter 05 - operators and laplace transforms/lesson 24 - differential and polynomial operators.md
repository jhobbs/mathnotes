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

where $P(D)$ is the polynomial operator $(24.12)$.

**Theorem 24.2** *If* $P(D)$ *is the polynomial operator* $(24.12)$ *and* $y_1,~y_2$ *are two nth order differentiable functions, then*

$$ \tag{24.21} P(D)(c_1 y_1 + c_2 y_2) = c_1 P(D) y_1 + c_2 P(D) y_2, $$

*where* $c_1$ *and* $c_2$ *are constants.* 

(*jmh*: See the book for proof, but it's just distributive property and the sum rule for derivatives.)

An operator which has the property $(24.21)$ is called a **linear operator**. Hence the polynomial operator $(24.12)$ is **linear**.

## Principle of Superposition

In place of the linear differential equation:

$$ \tag{a} P(D)y = Q_1 + Q_2 + \cdots + Q_n, $$

let us write the $n$ equations:

$$ \tag{b} P(D)y = Q_1, P(D)y = Q_2, \cdots, P(D)y = Q_n. $$

Let $y_1 p, y_2 p, \cdots, y_{np}$ be respective particular solutions of the $n$ equations of $(b)$. Therefore:

$$ \tag{c} P(D)y_{1p} = Q_1, P(D)y_{2p} = Q_2,\cdots, P(D)y_{np} = Q_n. $$

Adding all the equations in $(c)$ and making use of the distributive property of polynomial operators, there results:

$$ \tag{d} P(D)(y_{1p} + y_{2p} + \cdots + y_{np}) = Q_1 + Q_2 + \cdots + Q_n, $$

which implies that

$$ \tag{e} y_p = y_{1p} + y_{2p} + \cdots + y_{np} $$

is a solution of $(a)$.

(*jmh*: This means when finding particular solutions, we can split $Q(x)$ into small parts that may be more convenient to manipulate, find the particular solution for each of those parts, and then sum them to get a particular solution for the whole. In practice it's not clear how much advantage there is to this, and this seems mostly to be establishing that this is a valid thing to do so we can use that fact later.)

## Solution of a Linear Differential Equation with Constant Coefficients by Means of Polynomial Operators




