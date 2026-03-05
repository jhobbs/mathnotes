---
layout: page
title: Planar Bifurcations
---

## Zero-Eigenvalue Bifurcations

:::definition "Zero-Eigenvalue Bifurcation"
We say a **zero-eigenvalue** bifurcation occurs when one of the eigenvalues equals zero, or equivalently, when $\Delta = 0.$ They always occur when two or more @fixed-points collide as a parameter is varied.
:::

The three most common types of @zero-eigenvalue bifurcations are saddle node, transcritical and pitchfork. In planar systems they essentially behave the same way as in 1d systems.

### Saddle-Node
A pair of fixed points, one @saddle and one @node (can be stable or unstable) approach each other, collide, and then disappear as a parameter is varied. The prototypical example is

$$\begin{aligned}
\dot{x} & = \mu - x^2 \\
\dot{y} & = -y.
\end{aligned}$$

### Transcritical
A @fixed-point always exists, in the same place. As a parameter is varied, another @fixed-point approaches it, and when they collide, they exchange stability. In order for them to exchange stability, obviously they must have had different stability in the first place. The prototypical example is

$$\begin{aligned}
\dot{x} & = \mu x -x^2,
\dot{y} & = -y
\end{aligned}$$

### Supercritical Pitchfork
In a supercritical pitchfork, we have a single stable @fixed-point, and at the bifurcation, it loses its stability, and two new stable fixed points are born symmetrically  on either side of the now unstable fixed point. The typical form is

$$\begin{aligned}
\dot{x} & = \mu x -x^3, \\
\dot{y} & = -y
\end{aligned}$$

### Subcritical Pitchfork
Here, we have a stable origin flanked by two unstable fixed points. As the parameter decreases towards zero, the unstable fixed points move in and collide with the stable fixed point, and all we're left with the now unstable origin. The typical form is

$$\begin{aligned}
\dot{x} & = \mu x + x^3, \\
\dot{y} & = -y
\end{aligned}$$

This one is dangerous, because when the stability of the origin is lost, there are no nearby stable points for trajectories to jump to. Contrast that with supercritical, where when the stability of the origin is lost, there are two nearby stable fixed points to jump to.

## Hopf Bifurcation

There's another way for a fixed point to lose its stability. Instead of an eigenvalue passing through the origin, a conjugate pair of eigenvalues can cross the imaginary axis; the real part will be zero and the imaginary part will be all that's left, so $\lambda_{1,2} = \pm i \omega.$ When this happens, our fixed point changes from a stable spiral to an unstable spiral and a limit cycle is born. We can have both supercritical and subcritical Hopf bifurcations.

A supercritical Hopf bifurcation occurs when, as a control parameter is varied, a stable spiral changes into an unstable spiral surrounded by a small, nearly elliptical limit cycle. Another way to think about this is that the control parameter affects how quickly a system dies down to a constant value through oscillations after being perturbed. If, as we increase the value of our parameter towards a critical point, the dampening increases, so that the system dies down faster, and then when we cross the critical, point, we get sustained oscillations (a stable limit cycle), then we have a supercritical Hopf bifurcation. An example of a system with a supercritical bifurcation is

$$ \begin{aligned}
\dot{r} & = \mu r - r^3 \\
\dot{\theta} & = \omega + br^2.  \\
\end{aligned} $$

Here, varying $\mu$ is what causes the bifurcation. TODO: spell this out more.


Subcritical Hopf bifurcations happen when an unstable spiral changes to a stable spiral surrounded by an unstable limit cycle. This happens when a control parameter $\mu$ crosses zero from negative to positive, that is, when $\mu$ approaches zero from above, the unstable limit cycle shrinks down to envelope the stable fixed point, and when $\mu = 0,$ it envelopes it, changes it from stable to unstable, and causing nearby trajectories to have to jump to far away fixed points (if any). Thus, like with zero-eigenvalue pitchfork bifurcations, subcritical ones are the dangerous ones. An example of a system with a subcritical bifurcation is

$$ \begin{aligned}
\dot{r} & = \mu r + r^3 - r^5 \\
\dot{\theta} & = \omega + b r^2.
\end{aligned} $$
