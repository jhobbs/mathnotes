---
layout: page
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

$$ \frac{d^2 i}{dt^2} + \frac{R}{L}\frac{di}{dt} + \frac{1}{CL}i = \frac{F\omega}{L} \cos{(\omega t + \beta)} $$



