---
layout: page
title: Elementary Functions
---

# Elementary Functions

## Complex Exponential Function

The complex exponential function, $f(z) = e^z$, is defined as the unique solution of the differential equation $f'(z) = f(z)$ where $f(0) = 1$.

Solving this initial value problem gives the solution

$$ e^z = e^x \left ( \cos{(y)} + \sin{(y)} i\right ) \tag{a} $$

$e^z$ is an entire function.

Algebraic properties of $e$ hold such that the behavior matches that of the real exponential function, so

$$ e^{z_1} e^{z_2} = e^{z_1 + z_2}, $$

and

$$ e^{z_1} / e^{z_2} = e^{z_1 - z_2}. $$

When $x$ is $0$ in equation (a), we get

$$ e^{yi} = \cos{(y)} + \sin{(y)} i, $$

which is Euler's identity.

The complex exponential function is periodic with a period of $2 \pi i$, that is:

$$ e^{z+2\pi i} = e^z $$

and for every positive integer $n$, we have

$$ e^{2 n \pi i} = 1 $$

Given the infinite strip $-\pi < y \le \pi$ of the complex $z$-plane, points on the imaginary axis $x = 0$ are mapped by $w = e^z$ to points $w = e^z = e^{yi} = \cos{(y)} + \sin{(y)} i$, that is, to points on the unit circle $\|w\| = 1$. Points in the strip with negative real parts ($x < 0$) are mapped to points inside the unit circle and points with positive real parts ($x > 0$) are mapped to points outside the unit circle.

Every strip $y_0 < y \le y_0 + 2\pi$ is mapped one-to-one and onto the $w$-plane (less $w = 0$).

## Complex Trigonometric Functions

Complex trigonometric functions follow the same algebraic rules as real trigonometric functions and the same identities hold, but there is no geometry involved.

$$ \cos{z} = \frac{e^{zi} + e^{-zi}}{2} $$


$$ \sin{z} = \frac{e^{zi} - e^{-zi}}{2i} $$

These functions are also $2 \pi$ periodic like their real counterparts.

The real and imaginary parts of $\sin{z}$ and $\cos{z}$ can be expressed as

$$ \sin{z} = \sin{(x + yi)} = \sin{x} \cosh{x} + \cos{x}\sinh{yi} $$


$$ \cos{z} = \cos{(x + yi)} = \cos{x} \cosh{y} - \sin{x} \sinh{yi} $$

$\cos{z}$ and $\sin{z}$ are entire functions. They have the same zeros as the real versions and the expected derivatives.

the remaining complex trigonometric functions are defined as usual

$$ \tan{z} = \frac{\sin{z}}{\cos{z}}; \quad \cot{z} = \frac{\cos{z}}{\sin{z}}; \quad \sec{z} = \frac{1}{\cos{z}}; \quad \csc{z} = \frac{1}{\sin{z}} $$

## Complex Hyperbolic Functions

$$ \sinh{z} = \frac{e^z - e^{-z}}{2}, \quad \cosh{z} = \frac{e^z + e^{-z}}{2} $$

These are entire functions with the expected derivatives.

Furthermore, and unlike their real counterparts, the complex hyperbolic sine and cosine functions are related to the trigonometric sine and cosine functions according to

$$ \sin{(iz)} = i\sinh{z}, \quad \cos{iz} = \cosh{z}, $$

$$ \sinh{(iz)} = i\sin{z}, \quad \cosh{iz} = \cos{z}. $$

The real and imaginary parts of $\sinh{z}$ and $\cosh{z}$ are given as

$$ \sinh{z} = \cos{y} \sinh{x} + \sin{y} \cosh{xi}, $$

$$ \cosh{z} = \cos{y} \cosh{x} + \sin{y} \sinh{xi}. $$

The remaining complex hyperbolic functions are defined as usual

$$ \tanh{z} = \frac{\sinh{z}}{\cosh{z}}; \quad \coth{z} = \frac{\cosh{z}}{\sinh{z}}; \quad \text{sech}{~z} = \frac{1}{\cosh{z}}; \quad \text{csch}{~z} = \frac{1}{\sinh{z}} $$

The derivatives are as expected.

## Complex Logarithm

The real logarithm function $\ln{x}$ is defined as the inverse of the exponential function so that $y = \ln{x}$ is the unique solution of the equation $x = e^y$. Because $e^z$ is periodic, all complex numbers of the form $z + 2n\pi i$ are mapped by $w = e^z$ onto the same complex number as $z$. Thus, we call $w$ a logarithm of $z$ and write $w = \log{z}$ if $z = e^w$. Thus, we have

$$ \log{z} = \ln{|z|} + (\arg{z})i.$$

For complex numbers $\log$ is always using base $e$. $\log{z}$ is defined for all $z \neq 0$, and because $\arg{z}$ has an infinite number of values, each nonzero complex number has an infinite number of logarithms.

Some properties:

$$ \log{(z_1 z_2)} = \log{z_1} + \log{z_2} + 2 k \pi i $$

This means there is some $k \in \mathbb{Z}$ for which the equation holds.

$$ \log{\left ( \frac{z_1}{z_2} \right )} =  \log{z_1} - \log{z_2} + 2 k \pi i$$

The principal logarithm is defined using the principal argument, such that

$$ \text{Log}{z} = \ln{|z|} + (\text{Arg}{z})i $$

and is analytic in the domain $\|z\| > 0, -\pi < \text{Arg}{z} < \pi.$ It is also called the prinicpal branch of $\log{z}$.

Points on the negative real aixs and $z = 0$ are singularities of $\text{Log}{z}$, but they are not isolated singularities.

The deriviative of $\text{Log}{z}$ is

$$ \frac{d}{dz} \text{Log}{z} = \frac{1}{z} $$

We can choose other branches of $\arg{z}$ and get different branches. For example, if we choose $\arg_\phi{z}$, we get

$$ \log_\phi{z} = \ln{|z|} + (\arg_\phi{z})i. $$

These branches are analytic on any domain that does not contain $z = 0$ (the branch point) or points on the branch cut (the half-line through $z=0$ making an angle of $\phi$ radians ith the positive real axis.)

We can define branch cuts that aren't straight lines too. For example, branch points of the function $\text{Log}{\left \[ f(z)\right \]}$ are the zeroes of $f(z)$ and branch cuts are where $f(z)$ is real and negative.
