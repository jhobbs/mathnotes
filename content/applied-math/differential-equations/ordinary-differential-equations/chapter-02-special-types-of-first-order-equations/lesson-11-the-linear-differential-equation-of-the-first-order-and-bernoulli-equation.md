---
description: Solution methods for first-order linear differential equations using
  integrating factors, and techniques for solving Bernoulli and Ricatti equations.
  Covers the standard form and systematic solution approaches.
layout: page
redirect_from:
- ode/chapter 02 - special types of first order equations/lesson 11 - the linear differential
  equation of the first order and bernoulli equation
- ode/lesson 11 - the linear differential equation of the first order and bernoulli
  equation
  of first order equations/lesson 11 - the linear differential equation of the first
  order and bernoulli equation
title: The Linear Differential Equation
---

# The Linear Differential Equation

## Definition of a Linear Differential Equation of the First Order

This is a special type of first order differential equation in wich both the *dependent variable and its derivative are of the first degree*.

***Definition 11.1***
A linear differential equation of the first order is one which can be written as

$$ \tag{11.11} \frac{dy}{dx} + P(x)y = Q(x) $$

where $P(x)$ and $Q(x)$ are continuous functions of $x$ over the intervals for which solutions are sought. (Note that $y$ and its derivative both have the exponent one).

## Solving a Linear Differential Equation (11B)

The integrating factor of a linear differential equation in the form of (11.11) is:

$$ \tag{11.12} e^{\int P(x)dx} $$

Once we have the integrating factor - let's call it $\Psi(x)$, we can rewrite the differential equation as:

$$ \tag{11.21} y\Psi(x) = \int\Psi(x)Q(x)dx + c $$

## Bernoulli Equation
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

***Example 11.54***
Solve

$$ \tag{a} y' + xy = \frac{x}{y^3}, y \neq 0 $$

This is a Bernoulli equation with $n = -3$. Hence, by (11.51) we must multiply by $4y^3$, resulting in:

$$ \tag{b} 4y^3y' + 4xy4 = 4x $$

Because of the sentence after (11.52), we now that hte first term of (b) should be (and is)

$$ \tag{c} \frac{d}{dx}y^4 $$

Hence we can write (b) as:

$$ \tag{d} \frac{d}{dx}[y^4] + 4x[y^4] = 4x $$

an equation which is now linear in the variable $y^4$. An integrating factor for (d), is therefore, by (11.12):

$$ \tag{e} e^{\int 4xdx} = e^{2x^2} $$

We can take advantage of (11.19) to write immediately

$$ \tag{f} e^{2x^2}y^4 = 4 \int xe^{2x^2}dx = e^{2x^2} + c $$

Therefore

$$ \tag{g} y^4 = 1 + ce^{-2x^2} $$

is the required solution.

## Ricatti Equation

$$ \tag{11.6} y' = f_0(x) + f_1(x)y + f_2(x)y^2, f_2(x) \neq 0 $$

is calleda **Ricatti equation**. If $y_1(x)$ is a particular solution of this equation, the substitution

$$ \tag{11.61} y = y_1 + \frac{1}{u}, \quad y' = {y_1}' - \frac{1}{u^2}u', $$

will transform the equation into the first order linear equation

$$ \tag{11.62} u' + [f_1(x) + 2f_2(x)y_1]u = -f_2(x). $$

### Proof that this substitution works

*jmh: my proof, which is the answer to exercise 7.25*.

First, substitute (11.61) into (11.6):

$$ {y_1}' - \frac{1}{u^2}u' = f_0(x) + f_1(x)(y_1 + \frac{1}{u}) + f_2(x)(y_1 + \frac{1}{u})^2 $$

Recognize that since $y_1$ is a particular solution of (11.6), ${y_1}' = f_0(x) + f_1(x)y_1 + f_2(x){y_1}^2$.

Make this substitution, and distribute on the right side of the equation:

$$ f_0(x) + f_1(x)y_1 + f_2(x){y_1}^2 - \frac{1}{u^2}u' = f_0(x) + f_1(x)y_1 + \frac{f_1(x)}{u} + f_2(x){y_1}^2 + \frac{2f_2(x)y_1}{u} + \frac{f_2(x)}{u^2} $$

Cancel like terms from both sides:

$$ - \frac{1}{u^2}u' = \frac{f_1(x)}{u} + \frac{2f_2(x)y_1}{u} + \frac{f_2(x)}{u^2} $$

Multiply by $-u^2$:

$$ u' = -uf_1(x)-2uf_2(x)y_1 - f_2(x) $$

Rearrange terms and factor out the common $u$:

$$ u' + [f_1(x) + 2f2(x)y_1]u = -f_2(x) $$

Which is a linear first order differential equation. Remember that $y_1$ is a $y_1(x)$ - a function of x.

### Solving

When solving, remember that $u = \frac{1}{y-y_1}$.

First, determine ${y_1}'$, which is $\frac{d}{dx}y_1$.

Then perform the substitution from (11.61).

#### Example

*jmh: this is my solution to excercise 11.27*

Solve

$$ y' = 2\tan{x}\sec{x}-y^2\sin{x}, \quad {y_1}(x) = \sec{x} $$

First, find ${y_1}'$:

$$ {y_1}' = \frac{d}{dx}{y_1}(x) = \frac{d}{dx}\sec{x} = \sec{x}\tan{x} $$

Now make the substitution from (11.61):

$$ \sec{x}\tan{x} - \frac{1}{u^2}u' = 2\tan{x}\sec{x}-(\sec{x} + \frac{1}{u})^2\sin{x}, \quad {y_1}(x) = \sec{x} $$

Combine like terms and distribute:

$$ -\frac{1}{u^2}u' = \sec{x}\tan{x} -(\sec^2{x} + \frac{2\sec{x}}{u} + \frac{1}{u^2})sinx $$

Distribute again and simplify:

$$ -\frac{1}{u^2}u' = -\frac{2\tan{x}}{u} - \frac{\sin{x}}{u^2} $$

Multiply by $-\frac{1}{u^2}$:

$$ u' = 2u\tan{x} + \sin{x} $$

Rearrange the terms to make a first order linear differential equation:

$$ u' - 2u\tan{x} = \sin{x} $$

Now we have $P(x) = -2\tan{x}$, $Q(x) = \sin{x}$ and $\Psi(x) = e^{\int{-2\{tan}x}dx} = \cos^2{x} $, so we can write:

$$ u\cos^2{x} = \int{\cos^{x}\sin{x}dx} + c $$

Integration (use a $u$-sub) gives:

$$ u\cos^2{x} = -\frac{\cos^3{x}}{3}+c $$

Solving for $u$ gives:

$$ u = -\frac{cos^3(x) + c}{3cos^2{x}} $$

Substituting $u = \frac{1}{y-y_1}$ gives:

$$ \frac{1}{y-\sec{x}} = -\frac{\cos^3{x} + c}{3cos^2{x}} $$

Solving for $y$ we get:

$$ y = \frac{3\cos^2{x}}{c - \cos^3{x}} + \frac{1}{\cos{x}} $$