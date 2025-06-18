---
layout: page
redirect_from:
- ode/chapter 05 - operators and laplace transforms/lesson 27b - summary of methods
  of solving higher order linear differential equations
title: Summary of Methods of Solving Higher Order Linear Differential Equations
---

# Summary of Methods of Solving Higher Order Linear Differential Equations

*jmh* These are my notes on how to use the methods of Chatpers 4 and 5 from the book.

## Homogenous Linear Differential Equations

### Constant Coefficients

For equations of the form:

$$ a_ny^{(n)} + a_{(n-1)}y^{(n-1)} + \cdots + a_1y' + a_0y = 0, $$

where $a_0,a_1,\cdots,a_n$ are constants and $a_n \neq 0$

Find the complementary function $y_c$ by [[solving the characteristic equation|differential equations/solution-of-the-homogeneous-linear-differential-equation-of-order-n-with-constant-coefficients]]

### Nonconstant Coefficients

For equations of the form:

$$ f_n(x)y^{(n)} + f_{(n-1)}(x)y^{(n-1)} + \cdots + f_1(x)y' + f_0(x)y = 0, $$

Follow the method of [[reduction of order|differential equations/solution-of-the-linear-differential-equation-with-nonconstant-coefficients-reduction-of-order-method]].

### Nonhomogenous Linear Differential Equations

For equations of the form:

$$ f_n(x)y^{(n)} + f_{(n-1)}(x)y^{(n-1)} + \cdots + f_1(x)y' + f_0(x)y = Q(x), $$

We have a few choices here.

#### Method of Undetermined Coefficients

The method of [[Undetermined Coefficients|differential equations/solution-of-the-nonhomogeneous-linear-differential-equation-of-order-n-with-constant-coefficients-method-of-undetermined-coefficients]] works provided we have an equation of the form:

$$ a_ny^{(n)} + a_{(n-1)}y^{(n-1)} + \cdots + a_1y' + a_0y = Q(x) $$

where $a_0, a_1, \cdots, a_n$ are constants and $Q(x)$ consists of functions that have finitely many linearly independent derivatives. That means $Q(x)$ can only contain terms like $a, x^k, e^{ax}, \sin{ax}, \cos{ax}$ and the sums and products of these functions.

One downside to this method is that you have to find the first $n$th derivatives of $Q(x)$, which can be a pain if there are products.

#### Method of Variation of Parameters

The method of [[Variation of Paramaters|differential equations/solution-of-the-nonhomogeneous-linear-differential-equation-by-the-method-of-variation-of-parameters]] can be used for equations of the form

$$ a_ny^{(n)} + a_{(n-1)}y^{(n-1)} + \cdots + a_1y' + a_0y = Q(x) $$

However, where the method of undetermined coefficients requires that $Q(x)$ has finitely many linearly independent derivatives, the method of variation of parameters does not. The book only covers this method for 2nd order linear differential equations, and points out that if $Q(x)$ does have finitely many linearly independent derivatives, that the method of undetermined coefficients is usually easier.

#### Method of Reduction of Order

For equations of the form

$$ f_n(x)y^{(n)} + f_{(n-1)}(x)y^{(n-1)} + \cdots + f_1(x)y' + f_0(x)y = Q(x), $$

where the coefficients and $Q(x)$ are continuous functions of $x$ on a common interval $I$ and $f_n(x) \neq 0$, we can use the method of [[reduction of order|differential equations/solution-of-the-linear-differential-equation-with-nonconstant-coefficients-reduction-of-order-method]].

However, we we must know $n - 1$ independent solutions of the equation already, and there is no garauntee the solutions found will be expressible via elementary functions.

#### Solution by Differential Operators

We can solve differential equations of the form

yy$$ a_ny^{(n)} + a_{(n-1)}y^{(n-1)} + \cdots + a_1y' + a_0y = Q(x) $$

via [[differential operators|differential equations/differential-and-polynomial-operators]]. We can use this method on its own to find the general solution or to find a particular solution after finding the complementary function by solving the characteristic equation.

It's not really clear to me when this method is advantageous to use. I'm also not sure what restrictions apply to coefficients and to $Q(x)$ - the book isn't clear.

#### Solution by Inverse Differential Operators

We can use [[Inverse Differential Operators|differential equations/inverse-operators]] to find a particular solution under the same conditions that apply for the method of undetermined coefficients (constant coefficients, finitely many linearly independent derivatives of $Q(x)$. This method can often be simpler than other methods for finding particular solutions.

See also [[Partial Fraction Decomposition of Inverse Operators|differential equations/solution-of-a-linear-differential-equation-by-means-of-the-partial-fraction-expansion-of-inverse-operators]].


#### Note on shifted sin or cos in Q(x) 

(*jmh*) I believe and have used this fact but haven't proven it. When $Q(x) = b\sin{(ax+\delta)}$, we can treat it like $b\sin{(ax)}$ and solve using methods like that and then add the $\delta$ term back into $\sin$ and $\cos$ functions in the solution. My reasoning is that $\delta$ is just a horizontal shift of the forcing function. The shift doesn't change the essential nature of its solutions, because each derivative of $Q(x)$ has the same shift, and the shift never comes out of the $\sin$ function to show up other places in the solution. The same thing applies for $b\cos{(ax+\delta)}$ in $Q(x)$.


#### Solution by Laplace Transforms

We can use [[Laplace Transforms|differential equations/the-laplace-transform-gamma-function]] to solve differential equations given initial conditions.

We can apply this method when solving differential equations of the form:

$$ a_ny^{(n)}(x) + a_{(n-1)}y^{(n-1)}(x) + \cdots + a_1y'(x) + a_0y(x) = f(x), $$

where $a_0, a_1, \cdots, a_n$ are constants and we have initial conditions $y(0), y'(0), y^{(2)}, \cdots, y^{(n)}$  (or conditions that can be translated to initial conditions via translation of axes).
