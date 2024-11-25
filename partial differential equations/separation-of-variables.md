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

$$ X_n(x) = a_n \sin{\left ( \frac{n \pi x}{L} \right ) }, \tag{9} $$

where the $a_n$'s are arbitrary nonzero constants.

Now that we've determined that $\lambda = (n \pi/L)^2$, for any positive integer $n$, we return our condition to the second equation in (5):

$$ T'(t) + \beta \left ( \frac{n \pi}{L} \right )^2 T(t) = 0. $$

For each $n = 1, 2, 3 \dots$, the general solution to this linear first-order equation is

$$ T_n(t) = b_n e^{-\beta(n \pi/L)^2}. $$

Combining this with equation (9), we obtain, for each $n = 1,2,3,\dots$, the functions

$$ \begin{align} u_n(x_t) = X_n(x)T_n(t) = a_n\sin{(n \pi x / L)} b_n e^{-\beta (n \pi / L)^2 t} \\ = c_n  e^{-\beta (n \pi / L)^2 t} \sin{(n \pi x / L)}, \end{align} $$

where $c_n$ is also an arbitrary constant.

### Example

Find the soluton to the heat flow problem

$$ \frac{\partial u}{\partial t} = 7 \frac{\partial^2 u}{\partial x^2}, \quad 0 < x < \pi, \quad t > 0, \tag{11} $$

$$ u(0, t) = u(\pi, t) = 0, \quad t>0, \tag{12} $$

$$ u(x,0) = 3\sin{2x} - 6\sin{5x}, \quad 0 < x < \pi. \tag{13} $$

Comparing (11) with (1), we have that $\beta = 7$ and $L = \pi$. Hence, we need only find a combination of terms like (10) that satisfies the initial condition (13):

$$ u(x,0) = \sum c_n e^0 \sin{nx} =  3\sin{2x} - 6\sin{5x}, \quad 0 < x < \pi. $$

The constants we require are $c_2 = 3$ and $c_5 = -6$. The solution to the heat flow problem (11)-(13) is:

$$ \begin{align} u(x,t) = c_2e^{- \beta(2 \pi / L)^2t}\sin(2 \pi x/L) + c_5e^{- \beta(5 \pi / L)^2t}\sin(5 \pi x/L) \\ = 3e^{-28t}\sin{2x} - 6e^{-175t} \sin{5x}. \end{align} $$


### Complete Solution to Generic Problem

It turns out that almost any function $f(x)$ likely to arise in applications can be expressed as a convergent series of eigenfunctions. For the sines we've been using, the **Fourier sine series** looks like:

$$ f(x) = \sum_{n=1}^{\infty} c_n \sin{\left ( \frac{n \pi x}{L} \right )}, \quad 0 < x < L. $$

and the complete solution to the generic problem given by (1)-(3) is

$$ u(x,t) = \sum_{n=1}^{\infty} c_n e^{- \beta (n \pi/L)^2 t}\sin{\left ( \frac{n \pi x}{L}  \right )}, \tag{2a} $$

as long as this expansion and its first two derivatives converge.

#### Other initial conditions

##### Ends zero, but with arbitrary f(x)

If our initial condition isn't just a simple, finite set of $c_n\sin(nx)$ functions, finding our $c_n$'s is just a matter of finding the coefficients for the fourier sine series

$$ c_n = \frac{2}{L} \int_0^{L} f(x) \sin{\frac{n \pi x}{L}} dx, \quad n = 1,2, \dots , $$

and substituting them into (2a) above. We use the sine series because the initial conditions having the ends set to 0 lines up with the behavior of sine.


##### Ends perfectly insulated, with arbitrary f(x)

If the ends of the wire are perfectly insulated, then no heat flows through them and thus the derivative of them, at each end, with respect to time, is 0:

$$ \frac{\partial u}{\partial x}(0,t) = \frac{\partial u }{\partial x}(L, t) = 0, \quad t > 0. $$

Now, we use the fourier cosine series because the derivative of cosine at $x=0$ is 0, which matches our initial conditions. So, our solution is

$$ \frac{a_0}{2} + \sum_{n=1}^{\infty} a_n e^{-\beta\frac{n\pi}{L}^2t} \cos{\frac{n \pi x}{L}}    $$

where

$$ a_n = \frac{2}{L} \int_0^{L} f(x) \cos{\frac{n \pi x}{L}} dx, \quad n = 0, 1, \dots . $$


## Vibrating String Problem

The equation of motion for a vibrating string of length $L$ with fixed ends, and a bunch of other simplifying factors, is governed by the following initial-boundary value problem:

$$ \frac{\partial^2 u}{\partial t^2} = \alpha^2 \frac{\partial^2 u}{\partial x^2}, \quad 0 < x < L, \quad t > 0 \tag{16} $$

$$ u(0,t) = u(L,t) = 0, \quad t \geq 0, \tag{17} $$

$$ u(x,0) = f(x), \quad 0 \leq x \leq L, \tag{18}  $$

$$ \frac{\partial u}{\partial t}(x, 0) = g(x), \quad 0 \leq x \leq L. \tag{19} $$

Applying the method of separation of variables, we end up with


$$ u(x,t) = \sum_{n=1}^{\infty} \left [ a_n \cos{\frac{n \pi \alpha}{L}t} + b_n \sin {\frac{n \pi \alpha}{L}t} \right ] \sin{\frac{n \pi x}{L}}. $$

To find $a_n$ and $b_n$, we have

$$ f(x) = \sum_{n=1}^{\infty} a_n \sin{\frac{n \pi x}{L}}, \quad g(x) = \sum_{n=1}^{\infty} \frac{n \pi \alpha}{L} b_n \sin{\frac{n \pi x}{L}}. $$

### Example

Solve the vibrating string problem with $\alpha = 5$, $L = \pi$, initial functions $f(x) = 2\sin{4x}+7\sin{5x}$ and $g(x) = 11\sin{6x} - 14\sin{13x}$.

Our $a_n$'s are $a_4 = 2,$ $a_5 = 7$, and to find the $b_n$'s:

$$ 11 = 5 \cdot 6 b_6, ~ b_6 = \frac{11}{30}; \quad -14 = 5 \cdot 13 b_13, ~ b_{13} = \frac{-14}{65}. $$

Then

$$ u(x,t) = 2\cos{20t}\sin{4x} + 7\cos{25t}\sin{5x} + \frac{11}{30}\sin{30t}\sin{6x} - \frac{14}{15}\sin{65t}\sin{13x}. $$
