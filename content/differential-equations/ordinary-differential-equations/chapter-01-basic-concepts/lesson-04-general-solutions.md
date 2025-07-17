---
description: N-parameter families of solutions, the relationship between solution
  multiplicity and equation order, and definitions of general and particular solutions.
layout: page
redirect_from:
- ode/chapter 01 - basic concepts/lesson 04 - general solutions
- ode/lesson 04 - general solutions
- ode/lesson 4 - general solutions
- diffeq/lesson 4 - general solutions
- /differential-equations/ordinary differential-equations/chapter 01 - basic concepts/lesson
  04 - general solutions
title: The General Solution of a Differential Equation
---

# The General Solution of a Differential Equation

## Multiplicity of Solutions of a Differential Equation

Recall that when integrating, we get a constant of integration, i.e. integrating

$$ y' = e^x $$

results in:

$$ y = e^x + c $$

and integrating twice:

$$ y'' = e^x $$

results in: 

$$ y = e^x + c_1x + c_2 $$

For a large class of differential equations, the solution a diffrential equation of order $n$ has $n$ arbitrary constants. However, this isn't always true.

Because all solutions to differential equations involve at least one arbitrary constant, any differential equation that has a solution has *infinitely many solutions*.

***Definition 4.3 - n-parameter family of solutions***

The functions defined by 

$$ y = f(x,c_1,c_2,\cdots,c_n) \tag{4.31} $$

of the $n + 1$ variables, $x, c_1, c_2, \cdots, c_n$ will be called an **n-parameter family of solutions** of the $n$th order differential equation

$$ F(x,y,y',\cdots,y^{(n)} = 0 \tag{4.32} $$ 

if for each choice of a set of values $c_1, c_2, \cdots, c_n$, the resultion *function* $f(x)$ defined by (4.31) (it will now define a function of $x$ alone) satisfies (4.32), i.e. if

$$ F(x,f',f'',\cdots,f^{(n)}) = 0 \tag{4.33} $$

For the classes of differential equations we shall consider, we can now assert: *a differential equation of the *n*th order has an *n*-parameter family of solutions*.

## Finding a Differential Equation from its n-Parameter family of solutions

While an $n$-parameter family of solutions contains $n$ arbitrary constants, the differential equation it is a solution of will contain no constants.

The approach to find the differential equation, then, is to differentiate the $n$-parameter family of solutions and then eliminate any constants remaining.

For example, if we have the 1-parameter family of solutions

$$ \tag{a} y = ccosx+x $$

we can differentiate it to get:

$$ \tag{b} y' = -csinx + 1 $$

We can now solve for $c$:

$$ \frac{1 + y'}{sinx} = c $$

Then substitute $c$ into (a) to get:

$$ y = \frac{1 + y'}{sinx}cosx+x$$

Simplifying we get:

$$ y' = (x - y)tanx + 1,~x \neq \pm \frac{\pi}{2},\pm\frac{3\pi}{2},\ldots, $$

Which is the required differential equations. There are other ways to solve for $c$ - it's just algebra at this point.

The same thing applies for $2$-parameter families of solutions - we'd just differentiate twice instead. This can, in some cases, such as $y =c_1e^x + c_2e^{-x}$ where we get two equations with two unknowns which can be simultaneously solved.

## General and Particular Solutions

An $n$-parameter family of solutions is called a "general" solution in some sources, but they don't always capture all solutions of a differential equation; there can also be particular solutions outside $n$-parameter family of solutions.

For example, the first order ODE:

$$ y = xy' + (y')^2 \tag{4.6} $$

has for a solution the 1-parameter family

$$ y = cx + c^2 \tag{4.61} $$

Some sources might call this a general solution, but it does not include all particular solutions, for example, the function

$$ y = - \frac{x^2}{4} \tag{4.62} $$

is also a solution of 4.6 but is not included in 4.61.

In this text (*Ordinary Differential Equations* by Tenenbaum and Pollard) we'll use these definitions:

***Definition 4.66 - Particular Solutoin***
A solution of a differential equation will be called a **particular solution** if it satisfies the equation and does not contain arbitrary constants.

***Definition 4.7 - General Solution***
A $n$-parameter family of solutions of a differential equation will be called a **general solution** if it contains *every* particular solution of the equation.

We won't call a $n$-parameter family of solutions general unless we can *prove* it contains all particular solutions of the equation.

***Definition 4.71 - Initial Conditions***
The $n$ conditions which enable us to determine the values of the arbitrary constants $c_1,c_2,\cdots,c_n$ in an $n$-parameter family, if given in terms of one value of the independent variable, are called **initital conditions**.

Normally the number of initial conditions must equal the order of the differential equation. There are exceptions, but for the ones considered in this book, this will be true.