---
description: Classical mechanics covering forces, energy, momentum, and rotational
  dynamics using calculus-based analysis and vector methods.
layout: page
title: Newtonian Motion
---

# Newtonian Motion

## Forces

Newton's second law:

$$ F = ma $$

force = mass * acceleration.


A force is **conservative** if the work done by the force on an object moving it from one point to another depends only on the initial and final positions of the object, and is not dependent on the path taken by the object.

Gravity is an example of a conservative force, frictional force is an example of a nonconservative force.

A force is conservative if the net work done by the force on an object moving around any closed path is zero.

For any conservative force $\vec{F_c}$:


$$ \Delta U = - W_c. $$

That is, the change in potential energy is equal to the negative work done by the conservative force.

## Energy, Work, Momentum


Kinetic Energy - scalar quantity, unit is joules. $v$ here is the magnitude of the velocity.

$$ KE = \frac{1}{2} m v^2 $$

kinetic energy is not conserved in inelastic collisions, but it is preserved in elastic collisions.

Work in a straight line, unit is joules, $f(x)$ is a potentially displacement varying force in the direction of displacement.

$$ W = \int_{x_1}^{x_2} f(x) dx $$


Work over some displacement for constant force in the direction of displacement:

$$ W = Fs $$

Hooke's law for springs. $F_s$ is the spring force (in newtons), $k$ is the spring constant (typically in newton-meters) and $x$ is the displacement (in meters).

$$ F_s = -kx $$

Work to reach a given displacement from the unstretched position comes from integrating this:

$$ W = -\frac{k}{2} x^2 $$

Work Energy Principle:

$$ W_n = \Delta K + \Delta U = \Delta E $$


Momentum - vector quantity, unit is $\frac{kg \cdot m}{s}$:

$$ \vec{P} = m\vec{v} $$

Momentum is conserved in collisions; For two objects, $a$ and $b$ colliding:

$$ m_{a} \vec{v}_{a_1} + m_{b} \vec{v}_{b_1} = m_{a} \vec{v}_{a_2} + m_{b} \vec{v}_{b_2} $$

## Friction

There are two types of friction to consider, depending on if an object is moving or not. Static friction applies to an object at rest, and kinetic friction applies to an object in motion

The force from static friction is in a direction parallel to the surface an object is resting on, and opposite in direction but equal in magnitude to a force applied in parallel to the surface.

$$ F_s = \mu_s F_x $$

Here, $\mu_s$ is the coefficient of static friction (which is a property of the combination of the object and the surface) and $F_x$ is a force parallel to the surface.

The object will remain stationary until the static friction exceeds $F_{s_{max}}$, which is:

$$ F_{s_{max}} = \mu_s F_n $$

where $F_n$ is the normal force. Once the force exceeds that value, the object will begin moving.

An object in motion across a surface experiences kinetic friction, given by

$$ F_k = \mu_k F_n $$

where $\mu_k$ is the cofficient of kinetic friction. Generally, kinetic friction is less than static friction. The force from kinetic friction applies in the direction parallel to the surface but opposite in direction of the motion of the object.

## Rotational Motion

Radial acceleration, also known as centripetal acceleration), is acceleration directed towards the center of the circle along which an object is moving.

Its formula is:

$$ a_r = \frac{v^2}{r} $$

where $v$ is the speed of the object and $r$ is the radius of the circle along which it is moving.

It can also be expressed in terms of angular speed ($\omega$) as:

$$ a_r = r \omega^2 $$


Tangential acceleration is acceleration along the path of the circle. If the speed of an object increases or decreases while moving along the circle, there is tangential acceleration.

Its formula is:

$$ a_t = r \alpha $$

where $r$ is the radius of the circle and $\alpha$ is the angular acceleration (rate of change of angular speed). Alternatively, this is:


$$ a_t = \frac{d|v|}{dt} $$

where $\|v\|$ is the magnitude of the velocity of the object.

Moment of inertia, or rotational inertia, is a measure of an object's resistance to change in its rotational motion.

It is defined by the integral


$$ I = \int r^2 dm $$

where $r$ is the distance from the mass element $dm$ to the axis of rotation. This equation shows that the farther a mass element is from the axis, the more it contributes to the moment of inertia.

The kinetic energy of rotation is given by the formula:

$$ K = \frac{1}{2} I \omega^2 $$

Torque is a turning or twisting action on a body about a rotation axis due to a force $\vec{F}$.

First, in two dimensions.

If $\vec{F}$ is a force exerted at point $\vec{r}$ relative to the axis of rotation, and $\phi$ is the angle between $\vec{r}$ and $\vec{F}$, then the magnitude of the toruqe is

$$ \tau = r F_t = r_\bot F =  r F \sin{\phi} $$

Here, $r_\bot$ is the perpindicular distance between the axis and an extended line running through $\vec{F}$, and $F_t$ is the component of $\vec{F}$ perpendicular to $\vec{r}$.

Torque describes the ability of $\vec{F}$ to rotate the body. If torque would cause counterclockwise motion, its sign is positive; negative for clockwise.

In three dimensions, torque is a vector quantity defined relative to a fixed point (usually the origin):

$$ \vec{\tau} = \vec{r} \times \vec{F} $$

(where $\times$ is the cross product).

The direction of $\vec{\tau}$ is given by the right-hand rule for cross products.

The angular momentum $\vec{\ell}$ of a particle with linear momentum $\vec{p}$, mass $m$, and linear velocity $\vec{v}$ is a vector quantity defined relative to a fixed point (usually the origin) as:


$$ \vec{\ell} = \vec{r} \times \vec{p} = m (\vec{r} \times \vec{v}) $$

The magnitude of $\vec{\ell}$ is given by

$$ \ell = rmv \sin{\phi} $$

where $\phi$ is the angle between $\vec{r}$ and $\vec{p}$.

The direction of $\vec{\ell}$ is given by the right-hand rule.

Net torque is related to angular momentum in the following way:

$$ \tau_{net} = \frac{d\vec{\ell}}{dt} $$

that is, net torque is the same thing as the change in angular momentum.


Angular momentum of a fixed body about a ridig axis is the product of angular speed and the rotational inertia.

$$ \ell = I\omega $$