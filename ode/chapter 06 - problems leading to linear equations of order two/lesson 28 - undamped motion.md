---
layout: page
title: Undamped Motion
---

# Undamped Motion

## Free Undamped Motion (Simple Harmonic Motion)

Free undamped motion, also called simple harmonic motion, happens whenever a particle oscillates back and forth about a fixed point of oscillation in a medium in wich the resistance or damping factor is negligble. This doesn't happen often in reality, because there is usually friction or some other form of resistance to consider.

***Definition 28.1*** A particle will be said to execute **simple harmonic motion** if its equation of motion satisfies a differential equation of the form:


$$ \tag{28.11} \frac{d^2 x}{dt^2} + {\omega_0}^2 x = 0 $$

Where $\omega_0$ is a positive constant and $x$ gives the position of the particle as a function of time $t$.

The solution of $(28.11)$ is (see [Solution of the Homogeneous Linear Differential Equation of Order n with Constant Coefficients](../chapter%2004%20-%20linear%20differential%20equations%20of%20order%20greater%20than%20one/lesson%2020%20-%20solution%20of%20the%20homogeneous%20linear%20differential%20equation%20of%20order%20n%20with%20constant%20coefficients.html)):

$$ \tag{28.12} x = c_1 \cos{\omega_0 t} + c_2 \sin{\omega_0 t} $$

Equivalent and more useful ways to write the solution $(28.11)$ are:

$$ \tag{28.13} x = c \sin{(\omega_0 t + \delta)} $$

and

$$ \tag{28.14} x = c \cos{(\omega_0 t + \delta)} $$

**Simple harmonic motion** is the motion of a particle whose position $x$ as a function of time $t$ is given by any of the three equations above (or any other equivalent equations).

**Example**
A particle moving on a straight line is attracted to the origin by a force $F$. If the force of attraction is proportional to the distance $x$ of the particle from the origin, show that the particle will execute smiple harmonic motion. Describe the motion.

By hypothesis,

$$ \tag{a} F = -kx $$

Where $k > 0$ is a proportionality constant. The negative sign is necessary because when the particle is at a positive position, $F$ acts in the negative direction, and when the particle is at a negative position $F$ acts in a positive direction ($F$ and $x$ always have opposite signs).

Since $F = ma$ (force = mass x acceleration), we can rewrite $(a)$ as:

$$ \tag{b} F = m \frac{d^2 x}{dt^2} = -kx, \quad \frac{d^2 x}{dt^2} = - \frac{k}{m} x $$

Since $k$ and $m$ are positive constants, we may in $(b)$ replace $k/m$ by a new constant ${\omega_0}^2$. The differential equation of motion $(b)$ is then:

$$ \tag{c} \frac{d^2 x}{dt^2} + {\omega_0}^2x = 0 $$

which is the same as $(28.11)$. By Definition $28.1$, therefore, the particle executes simple harmonic motion.

*Description of motion*

By $(28.14)$ the solution of $(c)$ is:

$$ \tag{d} x = c \cos{(\omega_0 t + \delta)} $$

Differentiation of $(d)$ gives:

$$ \tag{e} \frac{dx}{dt} = v = -c \omega_0 \sin{(\omega_0 t + \delta)} $$

**Some Important Parameters**

(*jmh* my notes)

We can reuse $(d)$ and $(e)$ above to find the description of motion for any simple harmonic motion. Here are some important parameters from it (we'll use a particle as an example although not all problems will involve particles):


- $\|c\|$ - the amplitude of motion, i.e., the maximum distance of the particle from the origin.
- $\| c \omega_0 \|$ - the maximum velocity of the particle.
- $x = 0$ - the equilibrium point, i.e. the center point of motion.
- $T = \frac{2 \pi}{\omega_0}$ - the period of the motion, i.e. the amount of time it takes the particle to make one complete oscillation about its equilibrium point
- $\frac{1}{T} = \frac{\omega_0}{2 \pi}$ - the natural (undamped) frequency of the motion. The number of complete revolutions or cycles made by the particle in a unit of time.
- $\delta$ - the phase angle of $x$. From $(d)$ above, when $t = 0$, $x = c \cos{\delta}$, i.e. $c \cos{\delta}$ gives the starting position of the particle.

### Examples of Simple Harmonic Motion

#### The Motion of a Particle Attached to an Elastic Helical Spring. Hooke's Law

Consider a helical spring, with natural unstretched length $l_0$ feet, attached to the ceiling on one and and with a weight of $w$ pounds attached to the other end. The weight will cause the spring to stretch an additional $l$ feet. This stretching will cause the spring to try to recoil to its natural length. Hooke's law says the force of this retraction is proportional to the length the spring has been stretched, hence:

$$ \tag{26.81} \text{The upward force of the spring} = kl, $$

where k is a proportionality constant called the *spring constant* or *stiffness coefficient* of the spring.

If the spring is on the surface of the earth, then $w = mg$, where $m$ is the mass in slugs of the attached weight and $g$ is the acceleration due to gravity in feet per second per second. Since the weight is not moving, the spring is in equilibrium, and the upward force must equal the downward force. Hence,

$$ \tag{28.62} kl = mg $$

If we let $y = 0$ be the equilibrium point, and stretch the spring an additional $y$ feet, we now have the following forces acting on the spring:

1. An upward force due to the tension o the spring, which by Hooke's law is $k(l + y)$.
2. A downward force due to the weight, which is $mg$.

By Newtown's second law of motion, the net force acting on a sytem is equal to the mass of the system times its acceleration. Hence, with the positive direction taken as downard,

$$ \tag{28.621} F = m \frac{d^2 y}{dt^2} = mg - k(l +y) = mg - kl - ky $$

Since $mg = kl$, we have:

$$ \tag{28.63} m \frac{d^2 y}{dt^2} = -ky, \quad y'' + \frac{k}{m}y = 0 $$

Which is the form of a differential equation of a particle exhibiting simple harmonic motion. In place of ${\omega_0}^2$ we have $\frac{k}{m}$, and we can let $c$ be the distance we stretch the spring past its equilibrium point.

- Amplitude: $\|c\|$, because we stretch the spring $c$ beyond its equilibrium point.
- Maximum velocity: $\|c \sqrt{\frac{k}{m}}\|$
- Equilibrium point: $y = 0$
- Period: Note that ${\omega_0}^2 = \frac{k}{m}$. The period is then $\frac{2 \pi}{\frac{k}{m}} = \frac{2 \sqrt{m}}{\pi \sqrt{k}}$.
- Natural Frequency: $\frac{\pi \sqrt{k}}{2 \sqrt{m}}$
- Phase Angle: Will be zero in the case the spring is simply released from the maximum distance, but in any case, can be found by solving $y = c \cos{\delta}$ at time $t = 0$.

#### The Motion of a Simple Pendulum

If we consider a simplified model of a pendulum, with a stiff arm of length $l$, we get this as its differential equation of motion:


$$ \tag{28.74} l \frac{d^2 \theta}{dt^2} + g \sin{\theta} = 0 $$

Where $\theta$ is the current angle with respect to vertical, positive when to the right of veritcal, negative when to the left, and $g$ is the gravitational constant. This is not in the form of simple harmonic motion, but it's close. If we take the series definiton of $\sin{\theta} = \theta - \theta^3 / 3! + \theta^5 / 5! \cdots$, and assuming we're working with a small angle, ignore the terms in $\theta^3$ and higher, we can rewrite $(28.74)$ as:


$$ \tag{28.74} l \frac{d^2 \theta}{dt^2} + g\theta = 0, \quad \frac{d^2 \theta}{dt^2} + \frac{g}{l}\theta = 0$$

which is in the form of simple harmonic motion.
