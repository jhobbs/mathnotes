---
layout: page
title: Arc Length and Line Integrals
---

# Arc Length and Line Integrals

## Lengths of Parametric Curves

A function with a continuous first derivative is said to be **smooth**.

For a parametrically defined function where $x = f(t), y = g(t)$, both $f'$ and $g'$ must be continuous.

If we think of a curve in a plane, we can think of the arc length differential $ds$ as the "hypotenuse" of small triangles whose sides are $dx$ and $dy$.

![Arc Length Differential](ds.png "arc length differential")

This makes

$$ ds = \sqrt{dx^2 + dy^2} $$

and the differential formula for arc length is then:

$$ L = \int ds $$

If a smooth curve $x = f(t), y = g(t), a \le t \le b$, is traversed exactly once as $t$ increases from $a$ to $b$, the curve's length is

$$ L = \int_a^b ds = \int_a^b \sqrt{ \left ( \frac{dx}{dt} \right )^2 + \left ( \frac{dy}{dt} \right )^2} dt $$

The arc length of curve in $\mathbb{R}^3$ can be defined the same way, assuming $z = h(t)$:

$$ L = \int_a^b ds = \int_a^b \sqrt{ \left ( \frac{dx}{dt} \right )^2 + \left ( \frac{dy}{dt} \right )^2 + \left ( \frac{dz}{dt} \right )^2 } dt $$

Note that the arc length formula for both 2 and 3 dimensions can be written using vector notation in the more compact form:

$$ L = \int_a^b \left |\vec{r'}(t) \right | dt $$

## Line Integrals

A line integral is similar to integrating over an interval $[a,b]$, except it allows us to integrate over a curve $C$ (curve integral would be a better name.)

If $f$ is defined on a smooth curve C given by $x = x(t), y = y(t), a \le t \le b$, and $f$ if defined on $C$, then the line integral of $f$ along $C$ is defined as:

$$ \int_C f(x,y) ds = lim_{n \to \inf} \sum_{i=1}^n f(x_i, y_i) \Delta s_i $$

If $f$ is a continuous function of two variables $x = x(t), y = y(t)$ whose domain includes the smooth curve $C$, then the line integral can be evaluated as:

$$ \int_C f(x,y) ds = \int_a^b f(x(t), y(t)) \sqrt{ \left ( \frac{dx}{dt} \right )^2 + \left ( \frac{dy}{dt} \right )^2} dt $$

