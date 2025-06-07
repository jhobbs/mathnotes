---
layout: page
title: Multivariable Differential Operators
description: Vector calculus operators including gradient, curl, divergence, and Laplacian with geometric interpretations, mathematical definitions, and applications to physics and engineering.
---

# Multivariable Differential Operators

These are some differential operators that apply to multivariable and/or vector valued functions.

## Gradient

Given a scalar function $f : \mathbb{R}^n \to \mathbb{R}$, the gradient of $f$, denoted as $\nabla f$, is defined as the vector of its partial derivatives. Specifically, for a function $f(x_1, x_2, \cdots, x_n)$, the gradient is given by

$$ \nabla f = \begin{bmatrix} \frac{\partial f}{\partial x_1} \\  \frac{\partial f}{\partial x_2} \\\ \vdots \\\ \frac{\partial f}{\partial x_n} \end{bmatrix} $$

The gradient points in the direction of steepest ascent of the function $f$ at any given point and its magnitude gives the rate of ascent.

## Curl

For a vector field $\vec{F} = (F_1, F_2, F_3)$ defined in three-dimensional space $\mathbb{R}^3$, with each copmonent function $F_i$ depending on the variables $x$, $y$, and $z$, the curl of $\vec{F}$ is defined as

$$ \text{curl} \vec{F} = \nabla \times \vec{F} = \left ( \frac{\partial F_3}{\partial y} - \frac{\partial F_2}{\partial z} \right ) \mathbf{\hat{i}} + \left ( \frac{\partial F_1}{\partial z} - \frac{\partial F_3}{\partial x} \right ) \mathbf{\hat{j}} + \left ( \frac{\partial F_2}{\partial x} - \frac{\partial F_1}{\partial y} \right ) \mathbf{\hat{k}} $$

The curl at a point in the field is represented by a vector whose length and direction denote the magnitude and axis of the maximum circulation. Circulation is the line integral of a vector field around a closed curve.

More intuitively, curl measures the rotation of the vector field at a given point.

Curl can also be expressed as the determinant of a 3x3 matrix invovling the unit vectors, partial derivatives, and the components of the vector field:

$$ \nabla \times \vec{F} = \begin{vmatrix} \mathbf{\hat{i}} & \mathbf{\hat{j}} & \mathbf{\hat{k}}  \\\ \frac{\partial}{\partial x} & \frac{\partial}{\partial y} & \frac{\partial}{\partial z} \\\ F_1 & F_2 & F_3  \end{vmatrix} $$

## Divergence

The divergence of a vector field quantifies the extent to which the vector field behaves as a source or a sink at a given point. For a vector field $\vec{F} = (F_1, F_2, F_3)$ defined in three-dimension space $\mathbb{R}^3$, the divergence is defined as

$$ \text{div} \vec{F} = \nabla \cdot \vec{F} = \frac{\partial F_1}{\partial x} + \frac{\partial F_2}{\partial y} + \frac{\partial F_3}{\partial z}. $$

Divergence gives a scalar value for each point, i.e., it is a scalar field. A positive value indicates a net flow away from the point, while a negative value indicates a net flow towards a point.

An important theorem related to divergence is the Divergence Theorem (also known as Gauss's theorem) which connects the flux of a vector field through a closed surface to the divergence of the field inside the volume bounded by the surface:

$$ \iiint_V (\nabla \cdot \vec{F}) dV = \oint_s \vec{F} \cdot d\vec{S} $$ 

## Laplacian
The Laplace operator is a second-order differential operator in the $n$-dimensional Euclidean space, defined as the divergence $(\nabla \cdot)$ of the gradient $(\nabla f$). Thus, if $f$ is a twice-differentiable real-valued function, then the Laplacian of $f$ is the real-valued function defined by

$$ \Delta f = \nabla^2 f = \nabla \cdot \nabla f. $$

The Laplacian of $f$ is the sum of all the unmixed second partial derivatives in the Cartesian coordinates $x_i$:

$$ \nabla^2 f = \sum_{i=1}^n \frac{\partial^2 f}{\partial x_i^2}. $$

In two dimensions, using Cartesian coordinates, the Laplace operator is given by

$$ \nabla^2 f = \frac{\partial^2 f}{\partial x^2} + \frac{\partial^2 f}{\partial y^2} $$

and in three dimensions by

$$ \nabla^2 f = \frac{\partial^2 f}{\partial x^2} + \frac{\partial^2 f}{\partial y^2} + \frac{\partial^2 f}{\partial z^2} $$

Solutions to Laplace's equation $\nabla^2 f = 0$ are called [harmonic functions](/mathnotes/complex%20analysis/harmonic-functions).


## Directional Derivative

## Total Derivative

## Exterior Derivative

## Jacobian


## Hessian
