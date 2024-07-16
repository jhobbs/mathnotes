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
