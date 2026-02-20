---
layout: page
title: Planar Systems
---

Here we'll talk about both linear and nonlinear planar systems of the form

$$ \begin{aligned}
\dot{x} & = f(x,y) \\
\dot{y} & = g(x,y).
\end{aligned}
$$

:::definition "Separatrix"
A **separatrix** is the boundary that separating two modes of behavior in a dynamical system.
:::

:::definition "Homoclinic Orbit"
Trajectories that start and end at the same @fixed-point are called **homoclinic orbits.**
:::

:::definition "Heteroclinc Trajectory"
Trajectories that connect two @fixed-point are called **heteroclinic orbits.**
:::

:::definition "Hyperbolic Fixed Point"
A **hyperbolic fixed point** is a @fixed-point for which the real part of both eigenvalues is non-zero.
:::

## Nullclines

:::definition "Nullcline"
The nullclines of a planar system are the curves where either $\dot{x} = 0$ or $\dot{y} = 0$ and indicate where the flow is either purely horizontal or purely vertical. @fixed-points occur at intersections of nullclines.
:::

## Classification of Linear Systems

We can write a linear planar system as

$$ \dot{\vec{x}} = A \vec{x}, \quad \vec{x} \in \mathbb{R}^2 $$

where

$$ A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}. $$


:::definition "Characteristic equation"
The characteristic equation tells us how to find the @eigenvalues and is given by:

$$ \lambda^2 - \tau \lambda + \Delta = 0. $$
:::

Rewriting that using the quadratic equation gives:

$$ \lambda_{1,2} = \frac{1}{2} \left (\tau \pm \sqrt{\tau^2 - 4 \Delta} \right ) $$

where

$$ \tau = \tr{(A)} = a + d = \lambda_1 + \lambda_2, \quad \Delta = \det{(A)} = ad - bc = \lambda_1 \lambda_2. $$


| Type | Condition |
|------|-----------|
| Stable Node | $\lambda_1,\lambda_2 < 0,$ real |
| Unstable Node | $\lambda_1, \lambda_2 > 0,$ real |
| Saddle | $\Delta < 0$, equiv $\lambda_1 < 0 < \lambda_2$ |
| Stable Spiral | $\Re{\lambda} < 0,$ complex |
| Unstable Spiral | $\Re{\lambda} > 0,$ complex |
| Center | $\Re{\lambda} = 0,$ complex (purely imaginary) |

Linear systems only have one fixed point, the origin!

## Jacobian Linearization

Given general (can be nonlinear planar system:

$$ \dot{x} = f(x,y), \quad \dot{y} = g(x,y), $$

if we have a fixed point $(x^*, y^*),$

then

$$ f(x^*, y^*) = 0, \quad g(x^*, y^*) = 0. $$

We can do linear stability analysis on this system to understand the local behavior near fixed points. We use the @Jacobian matrix of the system, then plug in $(x^*, y^*).$ For the nonlinear case, we have the same geometric interpretations as the linear case. Topologically, if the real part of any eigenvalue of a fixed point is positive, then the fixed point is unstable. If the real part of all eigenvalues of a fixed point is negative, then the fixed point is asymptotically stable. We call these cases (both eigenvalues have nonzero real parts) hyperbolic @fixed points

However, if the real part of any eigenvalue is zero, this linearized approached does not tell us about the stability of the fixed point.


<!-- TODO: converting planar systems to polar form, radial and angular dynamics, using polar coordinates for limit cycle analysis -->

