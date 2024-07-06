---
layout: page
title: Simple Harmonic Motion
---

# Simple Harmonic Motion

Note: I explore this topic in more mathematical detail in my Ordinary Differential Equations notes on [Undamped Motion](../ode/chapter 06 - problems leading to linear equations of order two/lesson 28 - undamped motion.html).

Simple Harmonic Motion is sinusoidal periodic motion that repeats perfectly over and over. It is a simplified model of motion of objects like a box bouncing on a spring, ignoring dampening forces such as friction.

Some basic formulas of a particle exhibiting simple harmonic motion follow.

Here, $x_m$ is the amplitude of the displacement the particle, $\omega$ is the [angular frequency](../trigonometry/frequency.html) of the particle's motion (i.e. $2 \pi f$ where $f$ is the frequency), and $\phi$ is the phase angle of the particle, i.e. the position in the cycle of the particle at $t = 0$. 

Displacement: $x = x_m \cos{(\omega t + \phi)}$

Velocity: $v = \frac{dx}{dt} = - x_m \omega \sin{(\omega t + \phi)}$

Acceleration: $a = \frac{dv}{dt} = - x_m \omega^2 \sin{(\omega t + \phi)}$

In the case the particle has mass $m$ and is moving under the influence of a Hooke's law restoring force given by $F = -kx$, it has an angular frequency of $\omega = \sqrt{\frac{k}{m}}$ and a period of $T = 2 \pi \sqrt{\frac{m}{k}}.$ Here, $k$ is the spring constant and is given in the unit $N/m$ (newtons per meter.)

## Torsion Pendulum

A torsion pendulum is an angular simple harmonic oscilator. It consists of a mass suspended from a fixed wire; the mass can be rotated, causing torsion in the wire, which resists and stores potential energy much like a spring. If the mass is rotated to some angular displacement $\theta$ and released, it will oscilate about that position in **angular simple harmonic motion.** Rotating the mass through an angle $\theta$ in either direction introduces a restoring torque given by

$$ \tau = - \kappa \theta. $$

Here $\kappa$ is called the **torsion constant**, and depends on the length, diameter, and material of the wire. The formula above is basically the angular version of Hooke's law. Replacing the spring constant $k$ with $\kappa$ and the mass $m$ with $I$, the rotational inertia of the oscillating mass, we get

$$ T = 2 \pi \sqrt{\frac{I}{\kappa}} $$
