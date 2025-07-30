---
layout: page
redirect_from:
- ode/chapter 02 - special types of first order equations/lesson 12 - miscellaneous
  methods of solving a first order differential equation
- ode/lesson 12 - miscellaneous methods of solving a first order differential equation
  of first order equations/lesson 12 - miscellaneous methods of solving a first order
  differential equation
title: Equations Permitting a Choice of Method
---

# Equations Permitting a Choice of Method

Some differential equations can be solved by more than one method. It's up to you to pick the easiest one.

**Example 12.1**

$$ \tag{a} xdy - ydx = y^2dx $$

Multiplication by $-y^2, ~ y \neq 0$ will make (a) exact, allowing it to be solved either by recognition or by means of Lesson 9b. Alternatively, we could divide (a) by $x, ~ x \neq 0$, and the equation becomes:

$$ \tag{b} y' - \frac{y}{x} = \frac{y^2}{x}, \quad x \neq 0 $$

which is a Bernoulli equation. The easiest approach here is to recognize the solution (through 10.30).

## Solution by Substitution and Other Means

There are plenty of first order differential equations that aren't solvable by any of the means discussed so far. It is possible in some cases to solve a differential equation by means of a *shrewd substitution*, or by discovering an integrating factor, or by some other ingenious method. Beware though, that you can spend days trying these approaches and not find any solutions in terms of elementary functions, because most differential equations don't have such solutions.

**Example 12.21**

Solve

$$ \tag{a} (2\cos{y})y' + \sin{y} = x^2 \csc{y},~y \neq 0 $$

If we multiply it by $\sin{y}$, we obtain:

$$ \tag{b} (2\sin{y}\cos{y})y' + \sin^2{y} = x^2,~y \neq 0 $$

The first term is equal to $\frac{d}{dx}(\sin^2{y})$. We can therefore write (b) as:

$$ \tag{c} \frac{d}{dx} (\sin^2{y}) + (\sin^2{y}) = x^2, ~ y \neq 0$$

An equation which is now linear in the variable $\sin^2{y}$ and can be solved by means of Lesson 11.

*jmh* the trick here was to multiply by a trig function that turned the first term (with $y'$) into the derivative of the second term, making a linear first order ode.

**Example 12.22**

Solve

$$ \tag{a} y' + 2x = 2(x^2 + y - 1)^{\frac{2}{3}} $$

Similar to making a $u$-substitution to simplify an integrand, we can make a substiution here:

$$ \tag{b} u = x^2 + y - 1 $$

Differentiating (b) we obtain:

$$ \tag{c} \frac{du}{dx} = 2x + \frac{dy}{dx}; ~ \frac{dy}{dx} = \frac{du}{dx} - 2x $$

We can now substitute (b) and (c) in (a):

$$ \tag{d} \frac{du}{dx} = 2u^{\frac{2}{3}}, ~ u^{-\frac{2}{3}}du = 2dx, ~ u \neq 0 $$

which is a first order ODE with separated variables. Integrating, we obtain:

$$ \tag{e} 3u^{\frac{1}{3}} = 2x + c, ~ u \neq 0 $$

Replacing $u$ by its value in (b) and cubing, we have

$$ \tag{f} x^2 + y - 1 = \frac{1}{27}(2x+c)^3, ~ x^2 + y - 1 \neq 0 $$

Therefore a solution of (a) is:

$$ \tag{g} y = 1 - x^2 + \frac{(2x+c)^3}{27}, ~ x^2 + y - 1 \neq 0 $$