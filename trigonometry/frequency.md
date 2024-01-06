---
layout: page
title: Frequency and Period
---
# Frequency and Period

## Definitions

Here we'll talk about frequency as it relates to periodic functions. Periodic functions repeat their behavior over time. Here, I will assume that all periodic functions behave like sinusoidal functions in that their repetition is circular in nature, although I don't know if that's strictly true.

**Period** (usually denoted as $T$) is the amount of time it takes a cycle to complete. If you imagine a function tracing a circle, this is the time it takes to complete one circle. For a sinusoidal function, this is the time it takes to return to the same $y$ value with the function changing in the same direction, i.e. the time it takes to form one complete peak and one complete valley.

**Frequency** (usually denoted as $f$ or $\nu$) is the number of cycles per unit of time a periodic function completes.

If we say that the unit of time for period is seconds, then the unit for frequency is cycles per second, aka Hertz.

Frequency and period are related in this way:

$$ \tag{a} f = \frac{1}{T}, \quad T = \frac{1}{f} $$

That is, frequency is the reciprocal of period, and period is the reciprocal of frequency. As peroid increases, frequency decreases. As period decreases, frequency increases.

**Angular frequency** (usually denoted as $\omega$) is the number of radians completed per unit of time. There are $2 \pi$ radians per cycle of a periodic function, so angular frequency is related to frequency by:

$$ \tag{b} \omega = 2 \pi f, \quad f = \frac{\omega}{2 \pi} $$

that is, everytime a function goes through one cycle, it goes through $2 \pi$ radians and to find the frequency from the angular frequency, we divide the angular frequency by ${2 \pi}$. We can say that angular frequency is proportional to frequency with a proportionality constant of $2 \pi$, and that frequency is proportional to angular frequency with a proportionality constant of $1/2 \pi$.

Taking the first equation in $(a)$ and the second in $(b)$, we see how to relate angular frequency and period:


$$ \tag{c} \frac{1}{T} = \frac{\omega}{2 \pi}, \quad T = \frac{2 \pi}{\omega}, \quad \omega = \frac{2 \pi}{T} $$

## Applied to sin

The period of $\sin{t}$ is $2 \pi$. If we assume the unit of time is seconds, that means when $t = 2 \pi$, i.e. after $2 \pi$ seconds have elapsed, $\sin{t}$ has completed one cycle and is beginning to repeat its behavior and we have:


$$ \tag{a} T = 2 \pi, \quad f = \frac{1}{2 \pi}, \quad \omega = 1 $$

Since $\omega = 1$, we can rewrite $\sin{(t)}$ as $\sin{(\omega t)}$ or $\sin{(2 \pi f t)}$ without changing behavior. We now see how to parameterize $\sin$: \$omega$ is the horizontal scale factor for $\sin$, determining how much the period will be stretched (for $\omega < 1$) or compressed (for $\omega > 1$).

[Here is a desmos graph of parameterized sin](https://www.desmos.com/calculator/jzxw6vcm9d)

To make a $\sin$ function with frequency $f$, use $\sin{(2 \pi f t)}$. Some examples:

- If we want a $\sin$ wave with a frequency of $1$ hz, we use $\sin{(2 \pi t)}$
- If we want a $\sin$ wave with a frequency of $50$ hz, we use $\sin{(100 \pi t)}$
- If we want a $\sin$ wave with an angular frequency of $50$ radians per second, we use $\sin{50t}$
- If we want a $\sin$ wave with a period of $50$, we use $\sin{\left ( 2 \pi \frac{1}{50} t \right )}$
