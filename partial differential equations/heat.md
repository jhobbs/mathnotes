---
layout: page
title: Heat Equation
---

# Heat Equation

## Heat Equation

The Heat Equation in one spatial variable is a partial differential equation that describes the distribution of heat (or variations in temperature) in a given region over time. It is expressed as

$$ u_t = \alpha u_{xx} $$

Here:

* $u = u(x,t)$ represents the temperature at position $x$ and time $t$.

* $u_t$ is the partial derivative of $u$ with respect to time $t$, representing the rate of change of temperature over time

* $u_{xx}$ is the second partial derivative of $u$ with respect to position $x$, representing the curvature of the temperature profile in space.

* $\alpha$ is a positive constant known as the thermal diffusivity of the material, which characterizes how fast heat diffuses through the material.

Using alternative notation, this can be written

$$ \frac{\partial u}{\partial t}(x,t) = \alpha \frac{\partial^2 u}{\partial x^2}(x,t). $$

Notice that $\frac{\partial^2 u}{\partial x^2}$ is the [Laplacian](../calculus/multivariable-differential-operators.html) in one dimension. In higher dimensions, the heat equation can be adjusted to account for the additional heat flow contribution along the other axes by the simple modification

$$ \frac{\partial u}{\partial t} = \alpha \nabla^2 u, $$

where $\nabla^2 u$ is the Laplacian.
