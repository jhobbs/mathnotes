---
layout: page
redirect_from:
- ode/chapter 06 - problems leading to linear equations of order two/lesson 28 - undamped
  motion
- ode/chapter 06 - problems leading to linear equations of order two/lesson 28 - undamped motion.html
title: Undamped Motion
description: Analysis of simple harmonic motion and forced oscillations using second-order linear differential equations. Covers spring-mass systems, pendulum motion, resonance phenomena, and both free and forced undamped vibrations.
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

First, review my notes on [Frequency and Period](/mathnotes/trigonometry/frequency-and-period).

We can reuse $(d)$ and $(e)$ above to find the description of motion for any simple harmonic motion. Here are some important parameters from it (we'll use a particle as an example although not all problems will involve particles):


- $\|c\|$ - the amplitude of motion, i.e., the maximum distance of the particle from the origin.
- $\| c \omega_0 \|$ - the maximum velocity of the particle.
- $x = 0$ - the equilibrium point, i.e. the center point of motion.
- $T = \frac{2 \pi}{\omega_0}$ - the period of the motion, i.e. the amount of time it takes the particle to make one complete oscillation about its equilibrium point
- $\nu = \frac{1}{T} = \frac{\omega_0}{2 \pi}$ - the natural (undamped) frequency of the motion. The number of complete revolutions or cycles made by the particle in a unit of time.
- $\delta$ - the phase angle of $x$. From $(d)$ above, when $t = 0$, $x = c \cos{\delta}$, i.e. $c \cos{\delta}$ gives the starting position of the particle.
- $\omega$ - the impressed angular frequency of the system (angular frequency of forcing function)
- $\omega_0$ - the natural (undamped) angular frequency of the system

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
- Period: Note that ${\omega_0}^2 = \frac{k}{m}$. The period is then $\frac{2 \pi}{\frac{k}{m}} = 2 \pi \sqrt{\frac{m}{k}}$.
- Natural Frequency: $\nu = \frac{\sqrt{k}}{2 \pi \sqrt{m}} \text{cps}$
- Phase Angle: Will be zero in the case the spring is simply released from the maximum distance, but in any case, can be found by solving $y = c \cos{\delta}$ at time $t = 0$.

#### The Motion of a Simple Pendulum

If we consider a simplified model of a pendulum, with a stiff arm of length $l$, we get this as its differential equation of motion:


$$ \tag{28.74} l \frac{d^2 \theta}{dt^2} + g \sin{\theta} = 0 $$

##### With Small Angle Approximation

Where $\theta$ is the current angle with respect to vertical, positive when to the right of veritcal, negative when to the left, and $g$ is the gravitational constant. This is not in the form of simple harmonic motion, but it's close. If we take the series definiton of $\sin{\theta} = \theta - \theta^3 / 3! + \theta^5 / 5! \cdots$, and assuming we're working with a small angle, ignore the terms in $\theta^3$ and higher, we can rewrite $(28.74)$ as:


$$ \tag{28.76} l \frac{d^2 \theta}{dt^2} + g\theta = 0, \quad \frac{d^2 \theta}{dt^2} + \frac{g}{l}\theta = 0$$

which is in the form of simple harmonic motion.

(*jmh* my notes)

If a simple pendulum of length $l$ ft is given an angular velocity of $\omega_0$ rad/sec from the position $\theta = \theta_0$, we have:

- Position of the bob as a function of time:

$$ \theta{(t)} = \sqrt{ {\theta_0}^2 + \frac{l}{g}{ \omega_0}^2} \cos{\left (\sqrt{ \frac{g}{l}}t - \arctan2{\left (\omega_0 \sqrt{\frac{l}{g}}, { \theta_0}\right )}\right)} ~ \text{rad} $$

- Angular velocity of the bob as a function of time:

$$ \frac{d\theta}{dt} = \omega{(t)} = - \sqrt{ \frac{g}{l} {\theta_0}^2 + { \omega_0}^2} \sin{\left (\sqrt{ \frac{g}{l}}t - \arctan2{\left ( \omega_0 \sqrt{\frac{l}{g}}, { \theta_0}\right )} \right)} ~ \text{rad/sec} $$

- Linear velocity of the bob as a function of time:

$$ l \frac{d\theta}{dt} = v{(t)} = - \sqrt{ g l {\theta_0}^2 + l^2 { \omega_0}^2} \sin{\left (\sqrt{ \frac{g}{l}}t - \arctan2{\left ( \omega_0 \sqrt{\frac{l}{g}}, { \theta_0}\right )} \right)} ~ \text{ft/sec} $$

- Amplitude: $A = \sqrt{ {\theta_0}^2 + \frac{l}{g}{ \omega_0}^2} $ ft
- Period: $T = 2 \pi \sqrt{\frac{l}{g}}$ sec
- Natural Frequency: $\nu = \frac{1}{2 \pi} \sqrt{gl} $ cps
- Phase Angle: $\delta =  - \arctan2{( \omega_0 \sqrt{\frac{l}{g}}, \theta_0)} $ rad

Compare this to the motion of a pendulum of length $l$ ft released from the position $\theta = \theta_0$:

- Position of the bob as a function of time:

$$ \theta{(t)} = \theta_0 \cos{\left (\sqrt{\frac{g}{l}}t \right )} ~ \text{rad}  $$

- Angular velocity of the bob as a function of time:

$$ \frac{d\theta}{dt} = \omega{(t)} = - \sqrt{\frac{g}{l}} {\theta_0} \sin{\left (\sqrt{ \frac{g}{l}}t \right )} ~ \text{rad/sec}  $$

- Linear velocity of the bob as a function of time:

$$ l\frac{d\theta}{dt} = v{(t)} = - \sqrt{ g l } {\theta_0} \sin{\left (\sqrt{ \frac{g}{l}}t \right )} ~ \text{ft/sec}  $$

- Amplitude: $A = \omega_0 $ rad
- Period: $T = 2 \pi \sqrt{\frac{l}{g}}$ sec
- Natural Frequency: $\nu = \frac{1}{2 \pi} \sqrt{gl} $ cps
- Phase Angle: $\delta =  0$ rad


Note that for both the case where the pendulum is accelerated and where it is simply released, the period and natural frequency are the same. Note also that the period and natural frequency are independent of the initial angle. This means the pendulum will have the same period regardless of the initial angle and angular velocity! The period is dependent only on the length of the pendulum and the gravitational constant.

{% include_relative pendulum.html %}

This animation uses the small angle approximation for pendulum motion, so it may be off significantly at larger angles. However, it does a fine job showing that the period does not change with the starting angle or starting angular velocity (for small angles).


##### Without Small Angle Approximation

(*jmh* my notes)

Without the small angle approximation, we have a non-linear second order differential equation that can't be solved for a closed formula with elementary functions. We can, however, find a formula for angular velocity ($\omega = \frac{d\theta}{dt}$) when at $t = 0$ we have $\theta = \theta_0$ and $\omega = 0$.

We can seperate/rearrange terms and then multiply both sides of $(28.74)$ by $\frac{2d\theta}{dt}$ to get:

$$ \tag{a} 2 \left (\frac{d^2 \theta}{dt^2} \right ) \frac{d \theta}{dt} = -2\frac{g}{l}\sin{\theta} \frac{d\theta}{dt} $$

Using the identity $2 \left (\frac{d^2 \theta}{dt^2} \right ) \frac{d \theta}{dt} = \frac{d}{dt} \left (\frac{d\theta}{dt} \right)^2$, we can rewrite $(a)$ to get:

$$ \tag{b} \frac{d}{dt} \left (\frac{d\theta}{dt} \right )^2  = -2\frac{g}{l}\sin{\theta} \frac{d\theta}{dt} $$

By integrating both sides of $(b)$ with respect to $dt$ we get:

$$\tag{c} \left (\frac{d\theta}{dt} \right )^2 = \frac{2g}{l} \cos{\theta} + c $$

Taking the square root of both sides we get:

$$ \tag{d} \frac{d\theta}{dt} = \pm \sqrt{\frac{2g}{l}\cos{\theta}  + c } $$

Plugging in initial conditions we get:

$$ \tag{e} 0 = \pm \sqrt{\frac{2g}{l}\cos{\theta_0}  + c }, \quad c = \frac{-2g}{l}\cos{\theta_0} $$

And so our equation for $\frac{d\theta}{dt}$ with the initial conditions becomes:

$$ \tag{f} \frac{d\theta}{dt} = \pm \sqrt{\frac{2g}{l}\left ( \cos{\theta} - \cos{\theta_0} \right )} $$

To find $t(\theta)$, we can rewrite $(f)$ to show $\theta$ as the independent variable (we'll also separate the constant term out of the radical):

$$ \tag{g} \frac{dt}{d\theta} = \pm \frac{\sqrt{\frac{l}{2g}}}{\sqrt{\cos{\theta} - \cos{\theta_0}}} $$

This is a separable differential equation that can be written as:

$$ \tag{h} dt =  \pm \frac{\sqrt{\frac{l}{2g}} d\theta}{\sqrt{\cos{\theta} - \cos{\theta_0}}} $$

Integrating both sides, with initial conditions to find the time it takes to reach position $\theta$, we get:

$$ \tag{i} t(\theta) = \pm \sqrt{\frac{l}{2g}} \int_{\theta_0}^{\theta}{ \frac{du}{\sqrt{\cos u - \cos \theta_0}} }$$

note that both sides are now a function of $\theta$. We use $u, ~du$ here because we're integrating from $\theta_0$ to $\theta$ and want to distinguish the variable we're integrating over from the bounds of integration.

## Forced Undamped Motion

In forced undamped motion, the motion of a particle of mass $m$ satisfies a differential equation of the form:

$$ \tag{28.8} m \frac{d^2y}{dt^2} + m {\omega_0}^2 y = f(t), \quad \frac{d^2y}{dt^2} + {\omega_0}^2 y = \frac{1}{m} f(t) $$

Here, $f(t)$ is called the **forcing function**.

If we assume the forcing function $f(t) = mF\sin{(\omega t + \beta)}$ where $F$ is a constant, then $(28.8)$ becomes:

$$ \tag{28.81}  \frac{d^2y}{dt^2} + {\omega_0}^2 y = F \sin{(\omega t + \beta)} $$

The complementary function of $(28.81)$ is:

$$ \tag{28.82}  y_c = c \sin{(\omega_0 t + \delta}) $$

A particular solution $y_p$ of $(28.81)$ then depends on the relative values of the natraul (undamped) frequency $\omega_0$ of the system and the **impressed frequency** $\omega$ of the forcing function $mF\sin{(\omega t + \beta)}$.

**Case 1:** $\omega \neq \omega_0$

If $\omega \neq \omega_0$, then a particular solution of $(28.81)$ is

$$ \tag{28.83} y_p = \frac{F}{ {\omega_0}^2 - \omega^2} \sin{(\omega t + \beta)} $$

Hence, by $(28.82)$ and $(28.83)$ the general solution of $(28.81)$ is:

$$ \tag{28.84}  y(t) = c \sin{(\omega_0 t + \delta}) + \frac{F}{ {\omega_0}^2 - \omega^2} \sin{(\omega t + \beta)} $$

Here, the maximum displacement of this particle cannot exceed $\|c\| + \|F/({\omega_0}^2 - \omega^2)\|$.

I've made a [Desmos graph of this general solution](https://www.desmos.com/calculator/caqdrbowgi).

Note that as $omega_0$ approaches $omega$, the maximum displacement approaches infinity. In a real mechanical system, this can lead to breakdown. However, as long as the two values are different, the maximum displacement if still finite. When the maximum displacement from equilibrium remains finite with time, the motion is called **stable motion**.

**Case 2:** $\omega = \omega_0$

If $\omega = \omega_0$, the differential equation of motion $(28.81)$ becomes:

$$ \tag{28.9} \frac{d^2y}{dt^2} + {\omega_0}^2 y = F \sin{(\omega_0 t + \beta)} $$

Now we have that the term $c \sin{(\omega_0 t + \delta)}$ in the complentary function of $(28.9)$ agrees with the term $F \sin{(\omega_0 t + \beta)}$ on the right hand side of $(28.9)$, except for phase and constant coefficient. Hence, a particular solution (following the method of undetermined coefficients) is:

$$ \tag{28.92} y_p = - \frac{F}{2 \omega_0} t \cos{(\omega_0 t + \beta)} $$

And the general solution is:

$$ \tag{28.93} y(t) = c \sin{(\omega_0 t + \delta}) - \frac{F}{2 \omega_0} t \cos{(\omega_0 t + \beta)} $$

Now we have that the maximum displacement of the particle is $\|c\| + \left \| \frac{F}{2 \omega_0} t \right \| $. The presence of the variable $t$ in the second term implies that the displacement due to this part of the motion increases with time. A motion in which the displacement increases beyond all bounds as time passes is called an **unstable motion**. In such cases, a mechanical breakdown of the system is bound to occur. This condition is known as **undamped resonance** and $\omega_0$ is called the **undamped resonant frequency**.

Here is a [Desmos graph of this general solution](https://www.desmos.com/calculator/6a4rofhsfe).

Note that in engineering circles, $f(t)$ in $(28.8)$ is called the **input** of the system and the solution $y(t)$ is called the **output** of the system.

### Some Intresting Examples of Forced Undamped Motion

The book talks some about intermittent force, where the force function $f(t)$ is a piecewise function with a different formula at different points in time. Related to this is unit impulse, impulse response, and the Dirac Delta function. I won't get into those here but it covers cases where you might strike an object once and then it oscillates afterwards.

Another interesting case is when $\omega$ differs from $\omega_0$ by a very small quantity $\epsilon$, i.e. $\omega = \omega_0 + \epsilon$. In this case, we end up with **amplitude modulation** and **beats**. [Here is a Desmos graph of this](https://www.desmos.com/calculator/ihbq1d4aef). Note that as $\epsilon$ gets smaller, the period of the beat grows larger, as does the amplitude. One physical case where this happens is when an instrument is slightly out of tune compared to a tuning fork. The resulting sound will be of a consistent frequency but with varying amplitude, which shows up really clearly in the Desmos graph. These variation in amplitude as known as beats.
