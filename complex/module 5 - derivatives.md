---
layout: page
title: Derivatives of Complex Functions
---

# Derivatives of Complex Functions

The **derivative** of a complex function $f$ with respect to $z$ at $z_0$ is defined as

$$ f'(z_0) = \lim_{\Delta z -> 0} \frac{f(z_0 + \Delta z) - f(z_0)}{\Delta z} \tag{a} $$

provided the limit exists. If the limit exists, $f$ is said to be **differentiable** at the point $z_0$.

When a function is differentiable at a point $z_0$, then it is continuous at $z_0$, however, the converse is not necessarily true - $\Re{(z)}$ is continuous on all of $C$ but is nowhere differentiable.

Because the derivative is defined using a limit, and we need the limit to be the same when approaching a point from any direction, we generally only consider interior points. That is, if a function $f(z)$ is defined at points interior to and on a curve $C$, then $f'(z)$ is only considered at points interior to $C$. This is automatically the case when the domain of defintion of $f(z)$ is an open set.

We say that a complex function $f$ is **analytic** in an open set $S$ if it has a derivative at every point of $S$. In other words, when studying complex functions, we consider differentiability on open sets rather than on specific points.

We can still talk about points; a complex function $f$ is said to be **analytic at a point** $z$ if it is analytic in some neighborhood of $z$. However, even here, the point being analytic depends on the neighborhood around the point being differentiable.

A function which is analytic on the whole complex plane is called an **entire function**.

While the equation defined in (a) only applies to a specific point $z_0$, we can drop the subscript to get

$$ f'(z) = \lim_{\Delta z -> 0} \frac{f(z + \Delta z) - f(z)}{\Delta z}, \tag{b} $$

which defines the derivative of $f$ at the point $z$. This equation defines the function $f'$, known as the derivative function.

The usual rules for real derivatives work for complex derivatives too, that is, sum, product, quotient, power and chain rules all remain in effect.

However, the real derivatives rules don't help with functions like $\Re{(z)}, \Im{(z)}, \|z\|$ or $\text{Arg}{z}.$ We could use the limit definition of the derivative, but there is a better way.

Also, we might have a complex function defined in terms of its real and imginary parts rather than in terms of $z$, i.e. $f(z) = \frac{x}{x^2 + y^2} + \frac{-y}{x^2 + y^2}i$. We could try to rewrite $f(z)$ in terms of $z$, but this could be hard.

Morever, it's not yet clear how to tell when a complex combination $u(x,y) + v(x,y)i$ of real functions $u(x,y)$ and $v(x,y)$ define a function $f(z)$ of $z = x + yi$.


