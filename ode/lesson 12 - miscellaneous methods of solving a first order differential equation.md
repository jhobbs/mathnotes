
# Equations Permitting a Choice of Method

Some differential equations can be solved by more than one method. It's up to you to pick the easiest one.

**Example 12.1**

$$ \tag{a} xdy - ydx = y^2dx $$

Multiplication by $-y^2, ~ y \neq 0$ will make (a) exact, allowing it to be solved either by recognition or by means of Lesson 9b. Alternatively, we could divide (a) by $x, ~ x \neq 0$, and the equation becomes:

$$ \tag{b} y' - \frac{y}{x} = \frac{y^2}{x}, \quad x \neq 0 $$

which is a Bernoulli equation. The easiest approach here is to recognize the solution (through 10.30).

# Solution by Substitution and Other Means

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
