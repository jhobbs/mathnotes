---
layout: page
redirect_from:
- ode/chapter 02 - special types of first order equations/lesson 10 - recognizable
  exact differential equations and integrating factors
- ode/lesson 10 - recognizable exact differential equations and integrating factors
title: Recognizable Exact Differential Equations
---

# Recognizable Exact Differential Equations

Sometimes we can recognize exact differential equations. For example

$$ \tag{10.1} 2xy^2dx+2x^2ydy = 0 $$

You can recognize that its solution is

$$ \tag{10.11} x^2y^2 = c $$

*jmh* To see this, recognize that the partial derivative wrt to $x$ of 10.1 is the coeffecient of $dx$ and that the partial derivative wrt y is the coefficient of $dy$.

The exact differential equations that are recognizable are called **integrable combinations**.

The book has a big list of these and I've added more in the book. It might be worth making a list of these for a set of quick reference notes. TBD.

# Integrating Factors
***Definition 10.5***
A multiplying factor which will convert an inexact differential equation into an exact one is called an integrating factor.

# Finding an Integrating Factor

We assume that:

$$ \tag{10.6} P(x,y)dx + Q(x,y)dy = 0 $$

is not an exact differential equation and that $h$ is an integrating factor of (10.6), where $h$ is an unknown function which we wish to determine. Hence, by definition 10.5

$$ \tag{10.61} hP(x,y)dx + hQ(x,y)dy = 0 $$

is exact. It therefore follows, by Theorem 9.3, that

$$ \tag{10.62} \frac{\partial}{\partial y}[hP(x,y)] = \frac{\partial}{\partial x}[hQ(x,y)] $$

We consider six possibilities. *jmh: For the first five, the book goes into deriving these $h$ functions but I'm not going to do that here.*

**1. h is a function only of $x$, i.e. $h = h(x)$**

$$ \tag{10.65} F(x) = \frac{\frac{\partial}{\partial y}P(x,y) - \frac{\partial}{\partial x}Q(x,y)}{Q(x,y)} $$

$$ \tag{10.66} h(x) = e^{\int F(x)dx} $$

**2. h is a function only of $y$, i.e. $h = h(y)$**

$$ \tag{10.65} G(y) = \frac{\frac{\partial}{\partial x}Q(x,y) - \frac{\partial}{\partial y}P(x,y)}{P(x,y)} $$

$$ \tag{10.66} h(y) = e^{\int G(y)dy} $$

**3. h is a function of $xy$, i.e. $h = h(u)$, where $u = xy$**

$$ \tag{10.65} F(u) = \frac{\frac{\partial}{\partial y}P(x,y) - \frac{\partial}{\partial x}Q(x,y)}{yQ(x,y) - xP(x,y)} $$

$$ \tag{10.66} h(u) = e^{\int F(u)du} $$

where $u = xy$.

**4. h is a function of $x/y$, i.e. $h = h(u)$, where $u = x/y$**

$$ \tag{10.65} G(u) = \frac{y^2[\frac{\partial}{\partial y}P(x,y) - \frac{\partial}{\partial x}Q(x,y)]}{xP(x,y) + yQ(x,y)} $$

$$ \tag{10.66} h(u) = e^{\int G(u)du} $$

where $u = x/y$.

**5. h is a function of $y/x$, i.e. $h = h(u)$, where $u = y/x$**

$$ \tag{10.65} K(u) = \frac{x^2[\frac{\partial}{\partial x}Q(x,y) - \frac{\partial}{\partial y}P(x,y)]}{xP(x,y) + yQ(x,y)} $$

$$ \tag{10.66} h(u) = e^{\int K(u)du} $$

where $u = y/x$.

**6. Special form with matching exponents**

*jmh: The book doesn't give this form a name and doesn't consider it as one of the "5 methods." It may be that it ends up working out via the above methods but is a different approach; I'm not sure.*

If a differential equation can be put in the special form

$$ \tag{10.82} y(Ax^py^q+Bx^ry^s)dx + x(Cx^py^q + Dx^ry^s)dy = 0 $$

where $A, B, C, D$ are constants, then it can be shown that an integrating factor of (10.82) has the form $x^ay^b$ where $a$ and $b$ are suitably chosen constants.

*jmh: Note that in (10.82), the exponents of* $x$ *and* $y$ *must be the same in both coefficients and that* $dx$*'s coefficient must have a factor of* $y$ *and* $dy$*'s coefficient must have a factor of* $x$*.*

We'll show this by example. Given the differential equation:

$$ \tag{a} y(2x^2y^3 +3)dx + x(x^2y^3 - 1)dy = 0$$

We have an equation of the form (10.82).

Multiplying (a) by $x^ay^b$ we get:

$$ \tag{d} (2x^{a+2}y^{b+4}+3x^ay^{b+1})dx + (x^{a+3}y^{b+3} - x^{a+1}y^b)dy = 0 $$

By Theorem 9.3, (d) will be exact if

$$ \tag{e} 2(b+4)x^{a+2}y^{b+3} + (b+1)3x^ay^b = (a+3)x^{a+2}y^{b+3} - (a+1)x^ay^b $$

*jmh: that, is if* $\frac{\partial}{\partial y}P(x,y) = \frac{\partial}{\partial x}Q(x,y)$.

Multiplying (e) by $1/x^ay^b$ we obtain

$$ \tag{f} (2b+8)x^2y^3 +3b + 3 = (a+3)x^2y^3 - (a+1) $$

Equation (f) will be an equality if we choose $a$ and $b$ so that

$$ \tag{g} 2b + 8 = a + 3,\quad 3b + 3 = -a - 1 $$

Solving (g) for $a$ and $b$, we find:

$$ \tag{h} a = \frac{7}{5},\quad b=-\frac{9}{5} $$

Hence, $x^{\frac{7}{5}}y^{-\frac{9}{5}}$ is an integrating factor of (a).

## Note on finding integrating factors in the exercises
*jmh* A few of the excercises have solutions that don't seem to fit in to any of the forms above. Googling, I've found that ways to find these types of integrating factors exist, but again don't match the methods in this lesson.

For example, the integrating factor of $(x^2 - y^2 - y)dx - (x^2 - y^2 -x)dy = 0$ is given as $1/(x^2 - y^2)$, but that integrating factor does not match the pattern of any of the types of integrating factors described in the chapter.

Other material, such as Paul's Notes, doesn't seem to cover finding integrating factors for non-linear first order ODE's, so I'm assuming this isn't very important for now, and that if I keep pursuing ODE's, I'll get back around to the methods I found when googling, if they are indeed important or of interest.
