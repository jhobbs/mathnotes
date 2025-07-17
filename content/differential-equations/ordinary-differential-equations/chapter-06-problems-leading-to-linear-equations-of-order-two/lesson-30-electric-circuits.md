---
layout: page
redirect_from:
- ode/chapter 06 - problems leading to linear equations of order two/lesson 30 - electric
  circuits
- /differential-equations/ordinary differential-equations/chapter 06 - problems leading
  to linear equations of order two/lesson 30 - electric circuits
title: Electric Circuits
---

# Electric Circuits

## Simple Electric Circuits

Given a circuit with:

* An energy source providing emf (electromotive force) measured in volts
* A resistor with resistance **R** measured in ohms, with a voltage drop of $Ri$
* An inductor with coefficient of inductance **L** measured in henrys, with a voltage drop of $L\frac{di}{dt}$
* A capacitor with capacitance **C** measured in farads, with a voltage drop of $\frac{1}{C}q$

connected in series, we have a charge **q** masured in columbs, and a current $i = dq/dt$ measured in amperes.

Kirchhoff's second law states that the sum of the voltage drops in a closed circuit is equal to the electromotive force of the source of energy $E(t)$.

Thus we have:

$$ \tag{30.13} Ri + L\frac{di}{dt} + \frac{1}{c}q = E(t) $$

Because $i = \frac{dq}{dt}$ we can rewrite $(30.13)$ as:

$$ \tag{30.14} L\frac{d^2q}{dt^2} + R\frac{dq}{dt} + \frac{1}{C}q = E(t) $$

This is the differential equation of the charge $q$ in the circuit as a function of the time $t$.

To find the current $i$ in the circuit as a function of time $t$ we either solve $(30.14)$ for $q$ and take its derivative, or we can differentiate $(30.13)$ to obtain:

$$ \tag{30.15} L\frac{d^2 i}{dt^2} + R\frac{di}{dt} + \frac{1}{C}i = \frac{d}{dt} E(t) $$


If we assume $E(t) = F \sin{(\omega t + \beta)}$ then $(30.15)$ becomes:

$$ \tag{30.17} L\frac{d^2 i}{dt^2} + R\frac{di}{dt} + \frac{1}{C}i = F \omega \cos{(\omega t + \beta)} $$

$$ \tag{30.17b} \frac{d^2 i}{dt^2} + \frac{R}{L}\frac{di}{dt} + \frac{1}{CL}i = \frac{F\omega}{L} \cos{(\omega t + \beta)} $$


Its solution is:

$$ \tag{30.21} i(t) = Ae^{-(R/2L)t} \sin{\left (\frac{\sqrt{4CL - R^2 C^2}}{2CL}t + \delta \right)} + \frac{F \omega C}{\sqrt{(R \omega C)^2 + (1 - CL \omega^2)^2}}\sin{(\omega t + \beta + \alpha)} $$

where $\alpha = \sin^{-1}{\left ( \frac{1 - CL\omega^2}{R \omega C} \right )}$

The first term on the right hand side is the transient current, and the second term is the steady-state current. You can see that the transient current will decay to $0$, and that the steady-state current has the same frequency as the input current but not necessarily the same amplitude and phase.

Now we can use all our standard techniques for analyzing and solving linear differential equations. This system is analogous to the motion of a pendulum or helical spring that obeys Hooke's law if we replace position $y$ in the mechanical with charge $q$ in the electrical system.

from $(30.17b)$ we see that the natural frequency of the system is $\frac{1}{\sqrt{CL}}$

Note that solving the homogenous version of $(30.15)$ gives the transient current of the system and finding a particular solution gives the steady-state current of the system (see book for solution). The amplitude of the the steady-state will be:

$$ \tag{30.22} A = \frac{F}{\sqrt{R^2 + \left ( \frac{1}{\omega C} - L \omega \right )^2}} $$

The denominator is called the **impedance** of the system and is denoted as $Z$:

$$ \tag{30.23} Z = \sqrt{R^2 + \left ( \frac{1}{\omega C} - L \omega \right )^2} $$

Taking the derivative of $Z$ with respect to $\omega$ and finding its positive zero gives the value that minimizes impedance, $\omega = \sqrt{1/CL}$. When impedance is minimized, the driving $E(t)$ electromotive force is said to be in **resonance** with the system and the amplitude of the steady-state current will reach its maximum $A = \frac{F}{R}$.