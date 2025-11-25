---
description: Residue Theorem and Integration using Residues
layout: page
title: Residue Integration
---

# Residue Integration

Suppose $f(z)$ has a @singularity at $z = z_0$ inside a simple closed curve $C$ but is otherwise analytic on $C$ and inside $C.$

Then, $f(z)$ has a @laurent-series 

$$ f(z) = \sum_{n=0}^{\infty} a_n (z - z_0)^n + \frac{b_1}{z - z_0} + \frac{b_2}{(z - z_0)^2} + \cdots $$

that @converges for all @points near $z = z_0$ (except at $z = z_0$ itself,) in some domain of the form $0 < |z - z_0| < R.$ 

The coefficient $b_1$ of the first negative power $1/(z - z_0)$ of this @laurent-series is given by the @Cauchy-integral-formula as

$$ b_1 = \frac{1}{2 * pi * i} \oint_C f(z) dz. $$

Now, we can use this to find the value of the integral without using any of the integral formulas:

$$ \oint_C f(z) dz = 2 \pi i b_1. $$

This is a CCW integral around a simple closed path $C$ that contains $z = z_0$ in its interior (but no other singularities of $f(z)$ on or inside C.)

:::definition "Residue"
Given a convergent @laurent-series

$$ f(z) = \sum_{n=0}^{\infty} a_n (z - z_0)^n + \frac{b_1}{z - z_0} + \frac{b_2}{(z - z_0)^2} + \cdots, $$

the coefficient $b_1$ of the first negative power of $1/(z - z_0)$ is called the **residue** of $f(z)$ at $z = z_0.$ It is denoted by

$$ b_1 = \Res_{z = z_0} f(z). $$
:::

## Residue Formulas

Instead of finding the @laurent-series, we can use these handy formulas.

### Simple pole at $z_0$

First formula:

$$ \Res_{z=z_0} f(z) = b_1 = \lim_{z \to z_0} (z - z_0) f(z). $$

Second formula:

$$ \Res_{z=z_0} f(z) = \Res_{z=z_0} \frac{p(z)}{q(z)} = \frac{p(z_0)}{q'(z_0)}. $$
