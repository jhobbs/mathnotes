---
layout: page
redirect_from:
- ode/chapter 04 - linear differential equations of order greater than one/lesson
  22 - solution of the nonhomogeneous linear differential equation by the method of
  variation of parameters
- chapter 04 - linear differential equations of order greater than one/lesson 22 - solution of the nonhomogeneous linear differential equation by the method of variation of parameters.html
title: Solution of the Nonhomogeneous Linear Differential Equation by the Method of
  Variation of Parameters
---

# Solution of the Nonhomogeneous Linear Differential Equation by the Method of Variation of Parameters

Given the linear differential equation:

$$ \tag{22.1} a_ny^{(n)} + a_{(n-1)}y^{(n-1)} + \cdots + a_1y' + a_0y = Q(x), $$

We can not use the method of undetermined coefficients unless:

1. The coefficients are constant
2. $Q(x)$ is a function which has a finite number of linearly independent derivatives

We can use the method of variation of parameters to solve $(21.1)$ when $Q(x)$ has an infinite number of linearly independent derivatives.

For purposes of demonstration, we will work with the second order linear equation with constant coefficients:

$$ \tag{22.2} a_2y'' + a_1y' + a_0y = Q(x), \quad a_2 \neq 0 $$

where $Q(x)$ is a continuous function of $x$ on an interval $I$ and is $\not\equiv 0$ on $I$.

If two independent solutions, $y_1$ and $y_2$, of the related homogenous equation:

$$ \tag{22.21} a_2y'' + a_1y' + a_0y = 0 $$

are known then we can form the equation of a particular solution:

$$ \tag{22.22} = y_p(x) = u_1(x)y_1(x) + u_2(x)y_2(x), $$

where $u_1$ and $u_2$ are unknown functions of $x$ which are to be determined.

By taking the derivatives of $y_p$ and substituting them into $(22.2)$ and simplifying (see book for details) we arive at:

$$ \tag{22.27} {u_1}'y_1 + {u_2}'y_2 = 0, \quad {u_1}'{y_1}' + {u_2}'{y_2}' = \frac{Q(x)}{a_2} $$

We can then solve for ${u_1}'$ and ${u_2}'$ using algebra, and then use integration to find $u_1$ and $u_2$. The general solution to $(22.2)$ will then be $y_c + y_p = y_c + u_1 y_1 + u_2 y_2$.

Note that we can also use determinants to find ${u_1}'$ and ${u_2}'$:

$$ {u_1}' = \frac{\begin{vmatrix} 0 & y_2 \\\ \frac{Q(x)}{a_2} & {y_2}' \end{vmatrix}}{\begin{vmatrix} y_1 & y_2 \\\ {y_1}' & {y_2}' \end{vmatrix}}, \quad {u_2}' = \frac{\begin{vmatrix} y_1 & 0 \\\ {y_1}' & \frac{Q(x)}{a_2} \end{vmatrix}}{\begin{vmatrix} y_1 & y_2 \\\ {y_1}' & {y_2}' \end{vmatrix}}  $$

We can generalize this method to higher order equations - see the book for details. We can also use this method for equations where $Q(x)$ has finite linearly independent derivatives, although the method of undetermined coefficients is usually less effort to use in those cases (however, with the method of variation of parameters, we don't have to worry about the 3 different cases we have to handle in the method of undetermined coefficients, so it can still be easier). We can also use this method to find a particular solution when the coefficients in $(22.2)$ are continuous functions of $x$, provided we know two independent solutions of the related homogenous equation.
