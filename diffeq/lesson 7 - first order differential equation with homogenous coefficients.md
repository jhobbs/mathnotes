# Definition of a Homogenous Function

*Note (jhobbs): Homogenous functions are not specific to differential equations. They have an algebraic definition that can apply to any functions, but it is the first place I've encountered them.*

***Definition 7.1 homogenous of order n***
Let $z = f(x,y)$ define $z$ as a function of $x$ and $y$ in a region $R$. The function $f(x,y)$ is said to be **homogenous of order n** if it can be written as

$$f(x,y) = x^ng(u), \tag{7.11}$$

where $u = y/x$ and $g(u)$ is a function of $u$; or alternatively if it can be written as

$$ f(x,y) = y^nh(h) \tag{7.12}$$

where $u = x/y$ and $h(u)$ is a function of $u$.

***Comment 7.15 Alternate definition***
An alternate definition of a homogenous function is the following. A function $f(x,y)$ is said to be **homogenous of order n** if

$$ f(tx,ty) = t^n(x,y), \tag{7.16} $$

where $t > 0$ and $n$ is a constant.

*Note (jhobbs):* Homogenous equations are generally not separated/separable.

## Solution of a Differential Equation in Which the Coeffecients of $dx$ and $dy$ Are Each Homogenous Functions of the Same Order

***Definition 7.2***
The differential equation

$$ P(x,y)dx + Q(x,y)dy = 0, \tag{7.3} $$

where $P(x,y)$ and $Q(x,y)$ are each homogenous functions of order $n$ is called a **first order differential equation with homogenous coefficients.**

*jmh*: Do $P(x,y)$ and $Q(x,y)$ need to be of the order $n$ and have the same factor, either $x^n$ or $y^n$, or can they have different factors of the same order? In this book, I've only seen where they have the same factor.

The following substitution in (7.3) will always lead to a differential equation in $x$ and $u$ in which the variables are separable and hence solvable for $u$ by lesson 6.

$$ y = ux, dy = udx + xdu \tag{7.31} $$

***Theorem 7.32***
*If the coeffecients in (7.3) are each homogenous functions of order n, then the substition in it of (7.31) will lead to an equation in which the variables are separable.

Proof: see the book.

We could also use, instead of (7.31), the following substitution

$$ x = uy, dx = udy + ydu \tag{7.33} $$

The one to use depends on the situation - sometimes one leads to an easier to compute result than the other, though the result will always be the same.
