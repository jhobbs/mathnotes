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

We consider five possibilities. *jmh* The book goes into deriving these $h$ functions but I'm not going to do that here.

**1. h is a function only of x, i.e. $h = h(x)$**

$$ \tag{10.65} F(x) = \frac{\frac{\partial}{\partial y}P(x,y) - \frac{\partial}{\partial x}Q(x,y)}{Q(x,y)} $$

$$ \tag{10.66} h(x) = e^{\int F(x)dx} $$

**2. h is a function only of y, i.e. $h = h(y)$**

$$ \tag{10.65} G(y) = \frac{\frac{\partial}{\partial x}Q(x,y) - \frac{\partial}{\partial y}P(x,y)}{P(x,y)} $$

$$ \tag{10.66} h(y) = e^{\int G(y)dy} $$


