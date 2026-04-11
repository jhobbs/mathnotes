---
description: First round of notes from my second course on PDEs
layout: page
title: Introductory PDE Stuff
---

:::definition "System of Differential Equations"
A **system of differential equations** is a collection of one or more equations relating the derivatives of one or more functions. It is required that all the functions in the system depend on the same set of variables.
:::

Note that while solutions to systems of ODEs depend on arbitrary constants, solutions to systems of PDEs depend on arbitrary functions (why?)

Counting principle: we can expect the solution to an $n$th order PDE involving $m$ independent variables to depend on $n$ arbitrary functions of $m-1$ variables.

# Simplest PDE

The simplest PDE, for a function $u(t,x)$ of two variables is

$$ \frac{\partial u}{\partial t} = 0. $$

This is a first-order, homogeneous, linear equation. We can solve it by integrating both from $0$ to $t:$

$$ 0 \ \int_{0}^{t} \frac{\partial u}{\partial t} (s,x) ds = u(t,x) - u(0,x). $$

The solution, then, takes the form

$$ u(t,x) = f(x), \quad \text{where} \quad f(x) = u(0,x). $$

Note that this solution is a function of the space variable $x$ alone. We only require that $f(x)$ be continuously differentiable (why?). This solution represents a stationary wave - it does not change in time. The initial profile stays frozen in place and the system remains in equilibrium (in the same meaning as equilibrium in dynamical systems - a fixed point?)

# Transport Equations

## Basic Transport Equation

The basic transport equation is

$$ u_t + c u_x = 0, \quad u(0, x) = f(x). \tag{a} $$

We'll find its characteristic curves. First, let's parameterize $u(t,x)$ to get $v(t, x(t)) = u(t, x).$ Now,

$$ \frac{dv}{dt} = \frac{\partial u}{\partial t} \frac{dt}{dt} + \frac{\partial u}{\partial x} \frac{dx}{dt} = u_t + \frac{dx}{dt} u_x. \tag{b} $$

Comparing (b) to (a), we see that if if $u_t + c u_x = 0,$ then $\frac{dx}{dt} = c.$ Now, we solve that ODE:

$$ \begin{aligned}
\frac{dx}{dt} & = c \\
dx & = cdt \\
\int dx &  = \int cdt \\
x & = ct + k \\
x - ct & = k.
\end{aligned} $$

So, we see that $x - ct$ is constant, and if we let $t=0,$ we get $x_0 = k.$ So, our characteristic curve is $\xi{(t,x)} = x - ct.$

Now, we'll let perform a change of variables (to a moving coordinate system that will create stations waves) and let $\xi{(t,x)} = x - ct.$ So we have

$$ u(t,x) = v(t, \xi) = v(t, x - ct). $$

Finding $u_t$ and $c u_x$ (the terms in our original PDE in (a)) we get

$$ \begin{aligned}
u_t & = \frac{\partial}{\partial t} v(t, x - ct) + \frac{\partial}{\partial \xi} v(t, x - ct) (-c) \\
    & = v_t +  -c v_{\xi} \\
c u_x & = c \frac{\partial}{\partial t} v(t, x - ct) \frac{dt}{dx} + c \frac{\partial}{\partial \xi} v(t, x - ct) \frac{d \xi}{d \xi} \\
    & = 0 +  c v_{\xi} \\
\end{aligned}. \tag{c} $$

Substituting our terms from (c) into (a) gives us

$$ \begin{aligned}
v_t - c v_{\xi} + c v_{\xi} & = 0 \\
v_t = \frac{dv}{dt} = 0.
\end{aligned} \tag{d} $$

Note: we can go from $v_t to \frac{dv}{dt}$ because $v(t, x - ct)$ is only a function of $t,$ because $x - ct$ is constant.

Now we solve this ODE:

$$ \begin{aligned}
\int_0^t \frac{dv}{ds}(s, \xi) ds & = 0 \\
v(t, \xi) - v(0, x_0) & = 0 \\
v(t, \xi) & = v(0, x_0). \\
\end{aligned} $$

We were given that $u(0, x) = f(x),$ and found that $\frac{dv}{dt} = 0,$ i.e. $v$ doesn't change with time so $v(t, \xi) = v(t, x_0) = v(0, x_0) = f(x_0) = f(\xi) = f(x - ct).$

Since we defined $u(t,x) = v(t, \xi),$ our solution is $u(t,x) = f(x - ct) = f(\xi)$ for any $f \in C^1.$ This meany any reasonable function of $\xi$ will solve our PDE, i.e. $\xi^2 +1$ or $\cos{\xi}$ will produce a corresponding solution such as $(x-ct)^2 + 1$ or $\cos{(x - ct)}.$

## Transport with Decay

Let $a > 0$ be a positive constant, and $c$ an arbitrary constant. The homogeneous linear first-order partial differential equation

$$ \frac{\partial u}{\partial t} + c \frac{\partial u }{\partial x} + a u = 0 $$

models the transport of, for example, a radioactively decaying solute in a uniform fluid flow with wave speed $c,$ and the coefficient $a$ modeling the rate of decay.

We can reuse the same characteristic as we used in the basic transport equation (since, I believe, it is determined only by the differential terms of the equation.) Then, following what we did in (c) and (d) above we get

$$ \frac{dv}{dt} + av = 0. $$

This is a first order linear differential equation. We find the integrating factor to be $e^{at},$ and the solution to be

$$ e^{at} v(t, \xi) = C. \tag{e} $$

If we let $t = 0, $ we get $v(0, \xi) = f(\xi) = C.$ Then if we divide both sides by $e^{at}$ we get

$$ v(t, \xi) = f(\xi)e^{-at}, $$

and since $u(t,x) = v(t, \xi)$ we have $u(t,x) = f(x - ct)e^{-at}$ as our solution.


