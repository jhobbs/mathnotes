---
layout: page
title: Separation of Variables
---

# Separation of Variables

The method of separation of variables is effective in solving several types of partial differential equations.

the idea is roughly that we think of a solution, say $u(x,t),$ to a partial differential equation as beinga linear combinatio nof simple component functions $u_n(x,t), n = 0, 1, 2, \dots,$ which also satisfy the equation and certian boundary conditions. This assumption is reasonable provided the partial differential equation and the boundary conditions are linear. To determine a component solution, $u_n(x,t)$, we assume it can be written with its variables separated, that is, as:

$$ u_n(x,t) = X_n(X)T_n(t). $$

Substituting this form for a solution into the partial differential equation and using the boundary conditions leads, in many cases, to two ordinary differential equations for the unknown functions $X_n(x)$ and $T_n(t)$. 


## Solving the Heat Equation

First, see the notes on the [heat equation](./heat.html) We have the following mathematical model for the heat flow in a uniform wire without internal sources $(P = 0)$ whose ends are kept at the constant temperature $0^\circ c$:

$$ \frac{\partial u}{\partial t}(x,t) = \beta \frac{\partial^2 u}{\partial x^2}(x,t), \quad 0 < x < L, \quad t > 0, \tag{1} $$

$$ u(0, t) = u(L, t) = 0, \quad t>0, \tag{2} $$

$$ u(x,0) = f(x), \quad 0 < x < L. \tag{3} $$

We wish to find a function $u(x,t)$ that satisfies all three of these conditions.

We being by proposing that the solutions to equation (1) have the form:

$$ u(x,t) = X(x)T(t). $$

To determine $X$ and $T$, we first compute the partial derivatives of $u$ to obtain

$$ \frac{\partial u}{\partial t} = X(x)T'(t), \quad \frac{\partial^2 u}{\partial x^2} = X''(x)T(t). $$

Substituting these expressions into (1) gives

$$ X(x)T'(t) = \beta X''(x)T(t), $$

and separating variables gives

$$ \frac{T'(t)}{\beta T(t)} = \frac{X''(x)}{X(x)}. \tag{4} $$

Note that the functions on the left-hand side of (4) depend only on $t$ while those on the right-hand side depend only on $x$. If we fix $t$ and vary $x$, the ratio on the right cannot change; it must be constant. The same applies to fixing $x$ and varying $t$ on the left. Following the convention of this constant being negative, we get:

$$ \frac{X''(x)}{X(x)} = - \lambda, \quad \frac{T'(t)}{\beta T(t)} = - \lambda. $$

or

$$ X''(x) + \lambda X(x) = 0, \quad T'(t) + \lambda \beta T(t) = 0. \tag{5} $$

which are linear ordinary differential equations, easily solved through a number of means.

Now, turning to the initial conditions in (2), we have, letting $u(x,t) = X(x)T(t):

$$ X(0)T(t) = 0, \quad  X(L)T(t) = 0, \quad t > 0. $$

Therefore, either $T(t) = 0$ for all $t > 0$, which implies that $u(x,t) \equiv 0$, or

$$ X(0) = X(L) = 0. \tag{6} $$

We will ignore the trivial solution $u(x,t) \equiv 0$ and combine the boundary conditions in (6) with the differential equation in (5) to get the boundary value problem

$$ X''(x) + \lambda X(x) = 0, \quad X(0) = X(L) = 0, \tag{7} $$

where $\lambda$ can be any constant.

Notice that the function $X(x) \equiv 0$ is a soluton of (7) for every $\lambda$. Depending on the choice of $\lambda$, this may be the only solution to the boundary value problem. Thus, to find a non-trival solution $u(x,t) = X(x)T(t)$, we must first determine those values of $\lambda$ for which the boundary value problem has nontrivial solutions. These solutions are called the **eigenfunctions** of the problem; the **eigenvalues** are the special values of $\lambda$.

To solve the equation in (7), we note that it has constant coefficients and follow [the method outlined for linear differential equations with constant coefficients](chapter%2004%20-%20linear%20differential%20equations%20of%20order%20greater%20than%20one/lesson%2020%20-%20solution%20of%20the%20homogeneous%20linear%20differential%20equation%20of%20order%20n%20with%20constant%20coefficients.html), and then solve for the constants using the boundary conditions.

There are three cases:

**Case 1:** $\lambda < 0$. In this case, the roots of the characteristic equation are $\pm \sqrt{- \lambda}$, so a general solution to (7) is

$$ X(x) = c_1 e^{\sqrt{-\lambda}x} + c_2 e^{-\sqrt{-\lambda}x} $$

Applying the boundary conditions and solving for $c_1, c_2$, we find that $c_1 = c_2 = 0$, and hence there are no nontrivial solutions to (7) for $\lambda < 0$.


**Case 2:** $\lambda = 0$. In this case, $0$ is a repeated root to the characteristic equation, and the general solution to the differential equation is

$$ X(x) = C_1 + C_2x. $$

The boundary conditions in (7) again yield $C_1 = C_2 = 0$, so for $\lambda = 0$, there are no nontrivial solutions to (7).

**Case 3:** $\lambda > 0$. In this case, the roots of the characteristic equation are $\pm i\sqrt{\lambda}$, and the general solution to (7) is

$$ X(x) = c_1 \cos{\sqrt{\lambda}x} + c_2 \sin{\sqrt{\lambda}x}. \tag{8} $$

Now, the boundary conditions $X(0) = X(L) = 0$ give the system

$$ \begin{align} c_1 = 0 \\ c_1 \cos{\sqrt{\lambda}}L + c_2 \sin{\sqrt{\lambda}}L = 0. \end{align} $$

Because c_1 = 0, the system reduces to solving $c_2 \sin{\sqrt{\lambda}}L = 0.$ Hence, either $\sin{\sqrt{\lambda}L} = $ or $c_2 = 0$.

Now,  $\sin{\sqrt{\lambda}L} = 0$ only when $\sqrt{\lambda}L = n \pi$, where $n$ is an integer. Therefore, (7) has a nontrivial solution ($c_2 \neq 0$) when $\sqrt{\lambda}L = n \pi$ or $\lambda = (n \pi / L)^2$, $n = 1,2,3,...$. The nontrivial solutions (eigenfunctions) $X_n$ corresponding to the eigenvalue $\lambda = (n \pi/L)^2$ are given by

$$ X_n(x) = a_n \sin{\left ( \frac{n \pi x}{L} \right ) }, $$

where the $a_n$'s are arbitrary nonzero constants.

