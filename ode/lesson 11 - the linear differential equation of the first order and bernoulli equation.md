# Definition of a Linear Differential Equation of the First Order

This is a special type of first order differential equation in wich both the *dependent variable and its derivative are of the first degree*.

***Definition 11.1***
A linear differential equation of the first order is one which can be written as

$$ \tag{11.11} \frac{dy}{dx} + P(x)y = Q(x) $$

where $P(x)$ and $Q(x)$ are continuous functions of $x$ over the intervals for which solutions are sought. (Note that $y$ and its derivative both have the exponent one).

# Solving a Linear Differential Equation (11B)

The integrating factor of a linear differential equation in the form of (11.11) is:

$$ \tag{11.12} e^{\int P(x)dx} $$

Once we have the integrating factor - let's call it $\Psi(x,y)$, we can rewrite the differential equation as:

$$ \tag{11.21} y\Psi(x,y) = \int\Psi(x,y)Q(x)dx + c $$

# Bernoulli Equation
A special type of first order differential equation, named for hte swiss mathematician James Bernoulli, is the following:

$$ \tag{11.5} \frac{dy}{dx} + P(x)y = Q(x)y^n $$

If $n = 1$, (11.5) can be written as: $\frac{dy}{dx} = [Q(x) - P(x)]y$, an equation in which the variables are separable and therefore easy to solve. We assume, hence, that $n \neq 1$. Note also that the presence of $y^n$ prevents the equation from being linear.

If we multiply (11.5) by

$$ \tag{11.51} (1-n)y^{-n},$$

we obtain

$$ \tag{11.52} (1-n)y^{-n}\frac{dy}{dx} + (1-n)P(x)(y^{1-n})=(1-n)Q(x) $$

The first term in (11.52) is $\frac{d}{dx}(y^{1-n})$. Hence (11.52) can be written as

$$ \tag{11.53} \frac{d}{dx}(y^{1-n}) + (1-n)P(x)(y^{1-n}) = (1-n)Q(x) $$

If we now think of $y^{1-n}$ as the dependent variable instead of the usual $y$, and replace $y^{1-n}$ with $u$, (11.53) becomes

$$ \frac{du}{dx} + (1 - n)P(x)u = (1-n)Q(x) $$

which is linear in $u$ and can be solved by the method of Lesson 11B.
