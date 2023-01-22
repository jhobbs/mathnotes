# Definition of a Linear Differential Equation of the First Order

This is a special type of first order differential equation in wich both the *dependent variable and its derivative are of the first degree*.

***Definition 11.1***
A linear differential equation of the first order is one which can be written as

$$ \tag{11.11} \frac{dy}{dx} + P(x)y = Q(x) $$

where $P(x)$ and $Q(x)$ are continuous functions of $x$ over the intervals for which solutions are sought. (Note that $y$ and its derivative both have the exponent one).

# Solving a Linear Differential Equation

The integrating factor of a linear differential equation in the form of (11.11) is:

$$ \tag{11.12} e^{\int P(x)dx} $$

Once we have the integrating factor - let's call it $\Psi(x,y)$, we can rewrite the differential equation as:

$$ \tag{11.21} y\Psi(x,y) = \int\Psi(x,y)Q(x)dx + c $$

