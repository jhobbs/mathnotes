---
layout: page
title: Damped Motion
---

# Damped Motion

## Free Damped Motion (Damped Harmonic Motion)

Damped harmonic motion is harmonic motion where the particle in motion is subject to a resistance or damping force. We shall assume in this lesson that the damping force is proportional to the first power of the velocity. Frequently this will not be the case, and methods beyond the scope of this text will be required to solve the resulting differential equation.

***Definition 29.1*** A particle will be said to execute **damped harmonic motion** if its equation of motion satisfies a differential equation of the form:

$$ \tag{29.11} m\frac{d^2y}{dt^2} + 2mr \frac{dy}{dt} + m {\omega_0}^2 y = 0, \quad \frac{d^2y}{dt^2} + 2r \frac{dy}{dt} + {\omega_0}^2 y = 0 $$

Where the coefficient $2mr > 0$ is called the **coefficient of resistance** of the system. As before, $\omega_0$ is the natural (undamped) frequnecy of the system and $m$ is the mass of the particle.

The roots of the characteristic equation of $(29.11)$ are:

$$ \tag{29.12} m = -r \pm \sqrt{r^2 - {\omega_0}^2} $$

The solution of $(29.11)$ therefore depends on the character of the roots of $(29.12)$, i.e., whether they are real, imaginary, or multiple. I will give the solutions for each case here; see the book for details, but this just comes from solving $(29.11)$ through methods covered in previous notes.

**Case 1.** $r^2 > {\omega_0}^2$. Here, the roots of $(29.12)$ are real and unequal, hence the solution of $(29.11)$ is:

$$ \tag{29.13} y =  c_1 e^{-r + \sqrt{r^2 - {\omega_0}^2}} + c_2 e^{-r - \sqrt{r^2 - {\omega_0}^2}} $$

In this case, depending on the values of $c_1$ and $c_2$, the particle will cross the $t$ access either $0$ or $1$ times. A system with this behavior is called **overdamped** and is non-oscillatory.

**Case 2.** $r^2 = {\omega_0}^2$. Here, the roots of $(29.12)$ are $-r$ twice, hence the solution of $(29.11)$ is:

$$ \tag{29.2} y = c_1 e^{-rt} + c_2 t e^{-rt} $$

Here also, the motion is nonoscillatory. A system with this behavior is said to be **critically damped**.

**Case 3.** $r^2 < {\omega_0}^2$. Here, the roots of $(29.12)$ are imaginary and the solution of $(29.11)$ is:

$$ \tag{29.31} y = ce^{-rt} \sin{\left ( \sqrt{ {\omega_0}^2 - r^2}t + \delta \right )} $$

The since term in the solution makes the motion oscillatory; this system is said to be **underdamped**.  The $ce^{-rt}$ term is called the **damped amplitude** and since $r > 0$, this factor approaches 0 with time, causing the amplitude of the oscillation to decrease over time.

Note that the **damped period** $T = \frac{2 \pi}{\sqrt{ {\omega_0}^2 - r^2}}$ and **damped frequency** $\nu =  \sqrt{ {\omega_0}^2 - r^2}$ are constant.
