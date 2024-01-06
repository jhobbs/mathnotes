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

The exponential term $e^{-rt}$ is called the **damping factor**. This factor decreases with time, so the motion eventually dies down. Thwen $t = 1/r$, the damping factor is $1/e$. The time it takes the damping fator to reac this value $1/e$ is called the **time constant** and is donoted with $\tau$. Therefore, we have $\tau = 1/r$.

## Forced Motion with Damping

The motion of a particle that satisfies the differential equation:

$$ \tag{29.4} m\frac{d^2y}{dt^2} + 2mr \frac{dy}{dt} + m {\omega_0}^2 y = f(t), \quad \frac{d^2y}{dt^2} + 2r \frac{dy}{dt} + {\omega_0}^2 y = \frac{1}{m}f(t) $$

is called **forced damped motion**.

Assume the forcing function $f(t) = mF\sin{(\omega t + \beta)}$ where $F$ is a constant. Then $(29.4)$ becomes:

$$ \tag{29.41} \frac{d^2y}{dt^2} + 2r \frac{dy}{dt} + {\omega_0}^2 y = F\sin{(\omega t + \beta)} $$

The different possible complimentary functions $y_c$ for $(29.41)$ were covered already in the section above on Free Damped Motion and are the same here. The trial solution $y_p$ for all such solutions is:

$$ \tag{29.42} y_p = A\sin{(\omega t + \beta)} + B\cos{(\omega t + \beta)} $$

Hence the general solution of $(29.41)$ (see book for details) is:

$$ \tag{29.47} y = y_c + \frac{F}{\sqrt{( {\omega_0}^2 - \omega^2)^2 + (2r\omega)^2}} \sin{(\omega t + \beta - \alpha)} $$

As we saw above, for all cases, $y_c$ dies out with time. For this reason, this part of the motion is called the **transient motion**. The equation $(29.47)$ thus effectively simplifies entirely to the $y_p$ part of the motion after some time. This part of the motion is called the **steady state motion**.

We can see from $(29.41)$ and $(29.47)$ that the steady state motion has the same frequency as the forcing function, namely $\omega$ rad/sec, but it is out of phase with it and that the amplitude of the steady state motion is:

$$ \tag{29.5} A = \frac{F}{\sqrt{( {\omega_0}^2 - \omega^2)^2 + (2r\omega)^2}} $$

if $\omega = \omega_0$ (the condition for undamped resonance), the amplitude reduces to the form:

$$ \tag{29.51} A = \frac{F}{2r \omega_0} $$

If $\omega \neq \omega_0$, then we can find the maximum of $(29.5)$ as a function of $\omega$ [that is, $A(\omega)$] by finding the roots of $A'(\omega)$. That gives us:

$$ \tag{29.53} \omega = \sqrt{ {\omega_0}^2 - 2r^2}, \quad {\omega_0}^2 > 2r^2 $$

Therefore, if a resisting force is present and if $\omega$ (the frequency of the forcing function) is not equal to $\omega_0$ (the natural undamped frequency of a system), then the amplitude $A$ of the steady state motion will be a maximum if $\omega = \sqrt{ {\omega_0}^2 - 2r^2}$ and the forcing function $f(t)$ is said to be in **resonance** with the system. Substituting this value into $(29.5)$ gives the maximum amplitude as:

$$ \tag{29.531} A_\text{max} = \frac{F}{2r\sqrt{ {\omega_0}^2 - r^2}} $$

If we assume that $2r$, the coefficient of resistance of a system per unit of mass, is small, then we commit a samll error if we emot the $r^2$ term in $(29.531)$ and obtain:

$$ \tag{29.532} A_\text{max} \approx \frac{F}{2r\omega_0}, $$

the same amplitude obtained in $(29.51)$ when $\omega = \omega_0$. Further, we know that if $r$ is small, the natural (damped) frequency of a system ($\sqrt{ {\omega_0}^2 - r^2}$) is close to the resonant frequency $\sqrt{ {\omega_0}^2 - 2r^2}$, that is, it is close to the frequency which will produce the maximum amplitude.

We can therefore conclude that if a resisting force is present and the frequency of the forcing function ($\omega$) equals the natural (undamped) frequency of a system ($\omega_0$) or is close to the natural (damped) frequency of a system ($\sqrt{ {\omega_0}^2 - r^2}$), then the amplitude ($A$) of the system is inversely proportional to the damping or resisting factor $2r$. Hence, if $2r$ is small, $A$ will be large and tremendous vibrations may be produced. This can lead systems to fail, such as a bridge when the gait of pedestrians crosses it too closely matches the natural frequency of the bridge.


The ratio

$$ \tag{29.54} M = \frac{A}{F/{\omega_0}^2} $$

where $A$ is the amplitude of $y_p$ as given in $(29.5)$ is called the **magnification ratio of the system** or the **amplification ratio of the system**. This is:

$$ \tag{29.55} M = \frac{ {\omega_0}^2}{\sqrt{({\omega_0}^2 - \omega^2)^2 + (2r\omega)^2}} $$

$$ = \frac{1}{\sqrt{\left [ 1 - \left ( \frac{\omega}{ {\omega_0}^2 } \right )^2 \right ]^2  + 4 \left ( \frac{r}{\omega_0} \right )^2 \left ( \frac{\omega}{\omega_0} \right )^2 }} $$

Since $\omega_0$ is fixed, the amplification ratio of a syste mdepends on the frequency $\omega$ of the forcing function and the cofficient of resistance per unit of mass $2r$. In practical applications where $\omega$ is also fixed, the resistance $2r$ is made large if one wishes the magnifying response to be small, i.e. for shock absorbers to limit vibration in machinery, and $2r$ is made small if one wishes the response to be large, as, for example, in a radio receiver.
