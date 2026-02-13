---
layout: page
title: Weakly Nonlinear Oscillators
---

# Perturbation Theory

:::definition "Weakly Nonlinear Oscillator"
Equations of the form

$$ \dot{x} + x + \epsilon h(x, \dot{x}) = 0 \tag{a} $$

where $0 \leq \epsilon \ll 1$ and $h(x, \dot{x})$ is an arbitrary @smooth @function represent small @perturbations of the @linear @oscillator $\dot{x} + x = 0$ and are therefore called **weakly nonlinear oscillators.**
:::

We can try to find solutions of the weakly nonlinear oscillator defined above in the form of power series:

$$ x(t, \epsilon) = x_0(t) + \epsilon x_1(t) + \epsilon^2 x_2 (t) + \dots, \tag{b} $$

where we have to determine $x_k(t)$ from the original equation and initial conditions. Ideally, we could get a useful solution just truncating to the first few terms and the higher order terms would just be minor corrections. This approach is called **regular perturbation theory.**

However, it runs into problems - the truncation causes secular terms that blow up to infinity too quickly to show up.

We'll just go at this by example because I'm still figuring it out. We'll use the weakly damped linear oscillator as an example:

$$ \dot{x} + 2 \epsilon \dot{x} + x = 0, \quad x(0) = 0, \dot{x} 0 = 1. \tag{c} $$

Solved exactly, the solution is $x(t, \epsilon) = (1 - \epsilon^2)^{-1/2}e^{-st}\sin{[(1-\epsilon^2)^{1/2}t]}. \tag{s}$ Solving it using perturbation theory we have

$$ \frac{d^2}{dt^2} (x_0 + \epsilon x_1 + \dots) + 2 \epsilon \frac{d}{dt} (x_0 + \epsilon x_1 + \dots) + (x_0  + \epsilon x_1 + \dots) = 0. $$

Now, we can group terms according to powers of $\epsilon.$ We get

$$ [\ddot{x}_0 + x_0] + \epsilon[\ddot{x_1} + 2 \dot{x}_0 + x_1] + O(\epsilon^2) = 0. $$ 

We want this equation to hold for all sufficiently small $\epsilon,$ so the coefficients for each power of $\epsilon$ must vanish separately and we have

$$ O(1): \ddot{x}_0 + x_0 = 0. \tag{d} $$

$$ O(\epsilon): \ddot{x_1} + 2 \dot{x_0} + x_1 = 0. \tag{e} $$

We drop $O(\epsilon^2)$ and higher terms as we want an approximation that doesn't require them. Plugging the initial conditions from (c) into (b) we get

$$ x_0(0) = 0, \quad x_1(0) = 0, $$

and a similar approach (differentiate (a) and plug in initial conditions?) gives

$$ \dot{x}_0(0) = 1, \quad \dot{x}_1(0) = 0. $$

Now, we solve the IVP (d) with our initial conditions $x_0(0) = 0, \dot{x}_0(0) = 1,$ to get

$$ x_0(t) = \sin{t}. $$

If we plug this into (e) we get

$$ \ddot{x}_1 + x_1 = -2 \cos{t}. $$

Now this is the trouble, the $-2 \cos{t}$ term is a resonant forcing, and the solution subject to our initial conditions is

$$ \x_1(t) = -t \sin{t}, $$

and our overall solution is 

$$ x(t, \epsilon) = \sin{t} - \epsilon t \sin{t} + O(\epsilon^2). $$

Compare this to the actual solution we gave above. While the actual solution decays over time, the solution perturbation theory gives blows up to infinity over time! This leads us to.. two timing!

## Two Timing
