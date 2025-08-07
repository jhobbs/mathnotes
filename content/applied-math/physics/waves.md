---
description: Wave mechanics covering sinusoidal waves, interference, standing waves,
  and sound propagation using partial differential equations and trigonometric analysis.
layout: page
title: Waves
---

# Waves

Transverse - motion of particles is perpindicular to the direction of the wave's motion

Longitudinal - motion of the particles is in the direction of the wave's motion

A sinusoidal wave moving in the positive direction of an $x$ axis has the form

$$ y(x,t) = y_m \sin(kx - \omega t) $$

$y_m$ is the amplitude (magnitude of the maximum displacement) of the wave k. 

$k$ is the angular wave number; number of cycles per unit of distance. The unit is like rad/m.

$\omega$ is the angular frequency; rad/s

$kx - \omega t$ is the phase

$ \lambda = \frac{2\pi}{k}$ is the wavelength; the distance between crests

$v = \frac{\omega}{k} = \frac{\lambda}{T} = \lambda f$ is the wave speed - the speed of the wave along the medium

$\frac{\partial y}{\partial t}$ is the velocity in the transverse direction

The speed of a wave on a stretched spring is set by properties of the string, not properties of the wave such as frequency or amplitude.

The speed of a wave on a string with tension $\tau$ and linear density $\mu$ is $v = \sqrt{\frac{\tau}{\mu}}$

The average power of, or average rate at which energy is transmitted by, a sinsoidal wave on a stretched string is given by:

$$ P_{\text{avg}} = \frac{1}{2} \mu v \omega^2 {y^2_m} $$ 

Two sinusoidal waves on the same string exhibit interference, adding or canceling according to the principle of superposition. If the two are traveling in the same direction and have the same amplitude $y_m$ and frequency (hence the same wavelength), but differ in phase by a phase constant $\phi$, the result is a single wave with this same frequency:

$$ y\prime (x,t) = \left [ 2y_m \cos{\frac{1}{2}\phi} \right ] \sin{\left ( kx -\omega t + \frac{1}{2} \phi \right)} $$

A standing wave on a string can only occur at resonant frequencies. These are given by $f = \frac{v}{\lambda} = n\frac{v}{2L}$ for $n = 1,2,3,...$. Here, $L$ is the length of the string.

## Longitudinal Waves

If the medium of a wave is air and the wave is longitudinal, the inertial property, corresponding to $\mu$ in a transverse wave long a string, is the volume density $\rho$ of air. The elastic property is then called the **bulk modulus** $B$ and determines the extent to which an element of a medium changes in volume when the pressure on it changes:

$$ B = -V \frac{dP}{dV} $$

where $P$ is pressure, $V$ is the initial volume, and $dP/dV$ denotes the derivative of pressure with respect to volume. Since the volume is inversely proportional to the density, it follows that

$$ B = \rho \frac{dP}{d\rho} $$

where $\rho$ is the initial density and $dP/d\rho$ denotes the derivative of pressure with respect to density. The inverse of bulk modulus gives a substance's compressibility.

Sound is a longitudinal wave, and so the speed of sound in a medium is

$$ v = \sqrt{\frac{B}{\rho}} $$ 

Longitudinal waves have displacement along the direction of the wave. We use a similar equation to that for transverse waves to represent this:

$$ s(x,t) = s_m \cos{(kx - \omega t)} $$

The pressure variation in a longitudinal wave in air is given by

$$ \Delta P(x,t) = \Delta P_m \sin{(kx - \omega t)} $$

The phase difference of two waves traveling in the same direction from two distances, $L_1$ and $L_2$ (said to be $\Delta L = \left \| L_2 - L_1 \right \|$ units apart, is given as

$$ \phi = \frac{\Delta L}{\lambda} 2 \pi. $$

Fully constructive interference occurs when $\phi = 2 n \pi,~ n = 0, 1, 2, ...$, and fully destructive interference occurs when $\phi$ is an odd multiple of $\pi$, i.e. $\phi = (2n + 1)\pi, ~n = 0, 1, 2 ... $

Two sound waves at similar frequences produce, via interference a beat frequencey: $f_{\text{beat}} = f_1 - f_2.$ 

The intensity of a sound wave at a surface is the average rate per unit area at which energy is transferred by the wave through or onto the surface. This is

$$ I = \frac{P}{A} $$

where $P$ is the power of the sound wave and $A$ is the area of the surface intercepting the sound.

The intensity is also related to the displacement amplitude $s_m$ of the sound wave by

$$ I = \frac{1}{2} \rho v \omega^2 s^2_m $$

The intensity of sound from an isotropic point source decreases with the square of the distance from the source.

Decibels are a logarithmic scale for sound level, given by the relation

$$ \beta = (10 \text{dB}) \log_{10}{\left (\frac{I}{I_0} \right )} $$

where $\beta$ is the sound level in decibels and $I_0$ is a reference intensity near the lower limit of human hearing, $10^{-12} ~ W/m^2.$

The half-angle $\theta$ of the Mach cone is given by

$$ \sin{\theta} = \frac{v}{v_s} $$

where $v$ is the speed of sound and $v_s$ is the speed of the source. (I'm not sure why this is referred to as a half-angle.)