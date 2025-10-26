---
description: Complex derivatives, analyticity, Cauchy-Riemann equations, and their
  relationship to harmonic functions and Jacobian transformations.
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

However, the real derivatives rules don't help with functions like $\Re{(z)}, \Im{(z)}, \|z\|$ or $\Arg{z}.$ We could use the limit definition of the derivative, but there is a better way.

Also, we might have a complex function defined in terms of its real and imaginary parts rather than in terms of $z$, i.e. $f(z) = \frac{x}{x^2 + y^2} + \frac{-y}{x^2 + y^2}i$. We could try to rewrite $f(z)$ in terms of $z$, but this could be hard.

Moreover, it's not yet clear how to tell when a complex combination $u(x,y) + v(x,y)i$ of real functions $u(x,y)$ and $v(x,y)$ define a function $f(z)$ of $z = x + yi$.

The following theorem is super important and helps clear all of that up. It may be the most important theorem in complex analysis.

A function $f(z) = u(x,y) + v(x,y)i$ is analytic in an open set $S$ if and only if the first partial derivatives of $u(x,y)$ and $v(x,y)$ are continuous on $S$ and satisfy the Cauchy-Riemann equations therein

$$ \frac{\partial u}{\partial x} = \frac{\partial v}{\partial y}, \quad \frac{\partial v}{\partial x} = - \frac{\partial u}{\partial y}. \tag{c} $$

From the proof of this theorem, we also get two formulas for calculating $f'$ when $f$ is specified in terms of its real and imaginary parts. When $f(z) = u(x,y) + v(x,y)i$, and $f'(z)$ exists,

$$ f'(z) = \frac{\partial u}{\partial x} + \frac{\partial v}{\partial x}i = \frac{\partial v}{\partial y} - \frac{\partial u}{\partial y}i.$$

Now we know how to calculate a derivative of a function defined in terms of $z$ (use the derivative rules) or in terms of its real and imginary parts (use the formula above.)

Theorem (c) also makes it very clear that the real and imaginary parts of a complex function are not independent; they must satisfy the Cauchy-Riemann equations in order to be analytic. This property is one of the main things that distinguishes the behavior of complex valued functions from general functions on $\mathbb{R}^2$.

Some other potentially useful theorems:

If $f'(z) = 0$ at every point of a domain $D$, then $f(z)$ must be constant in $D$.

If $f(z) = u + vi$ is analytic in a domain $D$, and if either $u(x,y)$ or $v(x,y)$ is constant in $D$, then $f(z)$ is constant in $D$.

Also, here are the Cauchy-Reimann equations in terms of the modulus $r$ and argument $\theta$ of a functon of $z$, $f(z) = u(r,\theta) + v(r,\theta)i$:

$$ r \frac{\partial u}{\partial r} = \frac{\partial v}{\partial \theta}, \quad r\frac{\partial v}{\partial r} = -\frac{\partial u}{\partial \theta} $$

And here are formulas to express the derivative function in such cases:


$$ f'(z) = e^{-\theta i}\left ( \frac{\partial u}{\partial r} + \frac{\partial v}{\partial r}i \right ) $$

or

$$ f'(z) = e^{-\theta i}\left ( \frac{\partial v}{\partial \theta} - \frac{\partial u}{\partial \theta}i \right ) $$

Given a complex function $f(z) = u(x,y) + v(x,y)i$, we can use a Jacobian matrix to represent the transformation from $(x,y)$ to $(u,v)$. The Jacobian matrix of $f$ is:

$$ J_f = \begin{bmatrix} \frac{\partial u}{\partial x} & \frac{\partial u}{\partial y} \\\ \frac{\partial v}{\partial x} & \frac{\partial v}{\partial y} \end{bmatrix} $$

and provides a linear transformation that represents the function's behavior locally around a given point.

To satisfy the Cauchy-Riemann equations, this matrix must have the form:

$$ J_f = \begin{bmatrix} a & -b \\\ b & a \end{bmatrix} $$

where $a = \frac{\partial u}{\partial x} = \frac{\partial v}{\partial y}$ and $b = \frac{\partial v}{\partial x} = -\frac{\partial u}{\partial y}$.

The matrix form shows that the linear transformation corresponding to the derivative of $f$ (if $f$ is differentiable and satisfies the Cauchy-Riemann equations) is a rotation combined with a scaling. In fact, $\|J_f\| = \|f'(z)\|^2$ and gives the area magnification/scaling factor of $f$ at $z$ and $\text{atan2}(b,a)$ gives an argument of $f'(z)$, which is a measure of the rotational effect of $f$.
