---
description: Sinusoidal oscillatory motion analyzed through differential equations,
  covering springs, pendulums, and damped systems with trigonometric solutions.
layout: page
title: Simple Harmonic Motion
---

# Simple Harmonic Motion

Note: I explore this topic in more mathematical detail in my Ordinary Differential Equations notes on [[Undamped Motion|applied-math/differential-equations/ordinary-differential-equations/chapter-06-problems-leading-to-linear-equations-of-order-two/lesson-28-undamped-motion]].

Simple Harmonic Motion is sinusoidal periodic motion that repeats perfectly over and over. It is a simplified model of motion of objects like a box bouncing on a spring or a simple pendulum, ignoring dampening forces such as friction and making some other simplifying assumptions.

Some basic formulas of a particle exhibiting simple harmonic motion follow.

Here, $x_m$ is the amplitude of the displacement the particle, $\omega$ is the [[angular frequency|geometry/trigonometry/frequency]] of the particle's motion (i.e. $2 \pi f$ where $f$ is the frequency), and $\phi$ is the phase angle of the particle, i.e. the position in the cycle of the particle at $t = 0$. 

Displacement: $x = x_m \cos{(\omega t + \phi)}$

Velocity: $v = \frac{dx}{dt} = - x_m \omega \sin{(\omega t + \phi)}$

Acceleration: $a = \frac{dv}{dt} = - x_m \omega^2 \sin{(\omega t + \phi)}$

In the case the particle has mass $m$ and is moving under the influence of a Hooke's law restoring force given by $F = -kx$, it has an angular frequency of $\omega = \sqrt{\frac{k}{m}}$ and a period of $T = 2 \pi \sqrt{\frac{m}{k}}.$ Here, $k$ is the spring constant and is given in the unit $N/m$ (newtons per meter.)

## Torsion Pendulum

A torsion pendulum is an angular simple harmonic oscilator. It consists of a mass suspended from a fixed wire; the mass can be rotated, causing torsion in the wire, which resists and stores potential energy much like a spring. If the mass is rotated to some angular displacement $\theta$ and released, it will oscilate about that position in **angular simple harmonic motion.** Rotating the mass through an angle $\theta$ in either direction introduces a restoring torque given by

$$ \tau = - \kappa \theta. $$

Here $\kappa$ is called the **torsion constant**, and depends on the length, diameter, and material of the wire. The formula above is basically the angular version of Hooke's law. Replacing the spring constant $k$ with $\kappa$ and the mass $m$ with $I$, the rotational inertia of the oscillating mass, we get

$$ T = 2 \pi \sqrt{\frac{I}{\kappa}} $$

## Simple Pendulum

A simple pendulum is a pendulum with the following simplifying assumptions made:

* The pendulum bob is assumed to be a point mass.

* The string/rod is massless

* There is no air resistance

* There is no friction

* The angle of the pendulum relative to vertical is small

* There are only two dimensions of motion

* The pendulum has perfectly rigid suspension

The total mechanical energy in a simple pendulum can easily be found by considering that $PE = mgh$, and that when the pendulum bob is at its maximum height, it is stationary and therefore $KE = 0$.

Then, the total mechanical energy of a simple pendulum is $E = PE + KE = mgL(1-\cos{\theta_0})$, where $\theta_0$ is the maximum angular displacement of the pendulum.

## Damped Simple Harmonic Motion

If we have damping force that is proportional to the velocity of an object exhibiting simple harmonic motion ($F = -bv$), we now have damped simple harmonic motion. Here, $b$ is the damping constant.

The equation of the displacement of the oscillating particle now becomes:

$$ x(t) = x_m e^{-bt/2m} \cos{(\omega't + \phi)} $$

where $\omega' = \sqrt{\frac{k}{m} - \frac{b^2}{4m^2}}$