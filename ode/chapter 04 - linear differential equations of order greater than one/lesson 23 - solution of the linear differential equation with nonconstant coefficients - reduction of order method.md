---
layout: page
title: Solution of the Linear Differential Equation with Nonconstant Coefficients. Reduction of Order Method.
---

# Solution of the Linear Differential Equation with Nonconstant Coefficients. Reduction of Order Method.

## Introductory Remarks

We now examine the general linear differential equation

$$ \tag{23.1} f_n(x)y^{(n)} + f_{(n-1)}(x)y^{(n-1)} + \cdots + f_1(x)y' + f_0(x)y = Q(x), $$

and its related homogeneous equation

$$ \tag{23.11} f_n(x)y^{(n)} + f_{(n-1)}(x)y^{(n-1)} + \cdots + f_1(x)y' + f_0(x)y = 0, $$

where $f_0(x),f_1(x),\cdots,f_n(x),Q(x)$ are each continuous functions of $x$ on a common interval $I$ and $f_n(x) \neq 0$ when $x$ is in $I$.

There are no standard methods of finding solutions of $(23.1)$ in the general case. For an unrestricted $(23.11)$ that has a solution expressible in terms of elementary functions, you can use a standard method to find one independent solution, if the other $n - 1$ independent solutions are known. For $(23.1)$, the best you can obtain from a standard method is to find one independent solution of $(23.11)$ and a particular solution of $(23.1)$, provided the other $n - 1$ independent solutions of $(23.11)$ are known. 

Therefore, even when following a standard method for finding a general solution of only the second order equation:

$$ \tag{23.12} f_2(x)y'' + f_1(x)y' + f_0(x)y = Q(x), $$

it is essential that $f_0(x), f_1(x), f_2(x)$ be of such a character that the needed first solution of its related homogenous equation can be discovered.


## Reduction of Order Method

Assuming we have been able to find a non-trivial solution $y_1$ (a solution other than $y \equiv 0$, which is always true) to the homogenous equation

$$ \tag{23.14} f_2(x)y'' + f_1(x)y' + f_0(x)y = 0, $$

There is a method, called the **reduction of order** method, to obtain a second independent solution of $(23.14)$ as well as a particular solution of the related nonhomogenous equation:

$$ \tag{23.15} f_2(x)y'' + f_1(x)y' + f_0(x)y = Q(x). $$

Let $y_2(x)$ be a second solution of (23.14) and assume that it will have the form:

$$ \tag{23.2} y_2(x) = y_1(x) \int{u(x)dx} $$

(*jmh* why do we/why can we make this assumption? the book does not explain).

We can then find ${y_2}'$ and ${y_2}''$ via differntiation and substitute them into $(23.14)$ and simplify, which will result in a first order differential equation of $u$. We can then solve for $u$ and substitute it back into $(23.2)$ to solve for $y_2$.

Now that we know $y_1$ and $y_2$, we can write the general solution of $(23.14)$ as $y = c_1 y_1 + c_2 y_2 $.

The same approach can be used for finding a general solution to $(23.15)$ using the substitution:

$$ \tag{23.3} y(x) = y_1(x) \int{u(x)dx} $$

See the book for details...
