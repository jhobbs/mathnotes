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

# Transport Equation

The basic transport equation is

$$ u_t + c u_x = 0. \tag{a} $$

We'll find its characteristic curves. First, let's parameterize $u(x,t)$ to get $v(t) = u(x(t), t).$ Now,

$$ \frac{dv}{dt} = \frac{\partial u}{\partial x} \frac{dx}{dt} + \frac{\partial u}{\partial t} \frac{dt}{dt} = u_t + \frac{dx}{dt} u_x. \tag{b} $$

Comparing (b) to (a), we see that if if $u_t + c u_x = 0,$ then $\frac{dx}{dt} = c.$ Now, we solve that ODE:

$$ \begin{aligned}
\frac{dx}{dt} & = c \\
dx & = cdt \\
\int dx &  = \int cdt \\
x & = ct + k \\
x - ct & = k.
\end{aligned} $$

So, we see that $x - ct$ is constant, and if we let $t=0,$ we get $x_0 = k.$ So, our characteristic curve is $\xi{(x,t)} = x - ct.$

Now, we'll let perform a change of variables and let $\xi = x - ct.$ So we have

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
\end{aligned} $$

Note: we can go from $v_t to \frac{dv}{dt}$ because $v(t, x - ct)$ is only a function of $t,$ because $x - ct$ is constant.

Now we solve this ODE:

$$ \begin{aligned}
\int_0^t \frac{dv}{ds}(s, \xi) ds & = 0 \\
v(t, \xi) - v(0, x_0) & = 0 \\
v(t, \xi) & = v(0, x_0). \\
\end{aligned} $$

We were given that $u(0, x) = f(x),$ and $\frac{dv}{dt} = 0,$ i.e. $v$ doesn't change with time so $v(t, \xi) = v(t, x_0) = v(0, x_0) = f(x_0) = f(\xi) = f(x - ct).$

Since we defined $u(t,x) = v(t, \xi),$ so our solution is $u(t,x) = f(x - ct).$
