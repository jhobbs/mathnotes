---
layout: page
redirect_from:
- ode/chapter 02 - special types of first order equations/lesson 06 - meaning of the
  differential of a function and separable differential equations
- ode/lesson 06 - meaning of the differential of a function and separable differential
  equations
- ode/lesson 6 - meaning of the differential of a function and separable differential
  equations
- diffeq/lesson 6 - meaning of the differential of a function and separable differential
  equations
title: Meaning of the Differential
---

# Meaning of the Differential

## Differential of a Function of One Independent Variable

*Note: Assume all functions in the lesson are differentiable on an interval.*

Let $y = f(x)$ define $y$ as a function of $x$. Then its derivative $f'(x)$ will give the slope of the curve at any point $P(x,y)$ on it, i.e., it is the slope of the tangent line drawn to the curve at $P$.

From figure 6.12, it's evident that:

$$ f'(x) = tan\alpha = \frac{dy}{\Delta x} \tag{6.1} $$

Hence,

$$ dy = f'(x)\Delta x \tag{6.11} $$

We call $dy$ the **differential** of $y$, i.e. it is the differential of the function defined by $y = f(x)$.

Note that the differential of $y$ ($dy$) is dependent on the abscissa $x$ and on the size of $\Delta x$. That means while $y = f(x)$ defines $y$ as a function of one independent variable $x$, the differential $dy$ is a function of two independent variables - $x$ and $\Delta x$.

***Definition 6.13 The differential of y***
Let $y=f(x)$ define y as a function of x on an interval $I$. The **differential of y**, writen as $dy$ (or $df$) is defined by

$$ (dy)(x,\Delta x) = f'(x)\Delta x \tag{6.14}$$

## Differential of a function of Two Independent Variables

***Definition 6.4 Differential of z***
Let $z = f(x,y)$ define $z$ as a function of $x$ and $y$. The **differential of z**, written as $dz$ or $df$, is defined by:

$$ (dz)(x,y,\Delta x,\Delta y) = \frac{\partial f(x,y)}{\partial x}\Delta x + \frac{\partial f(x,y)}{\partial y}\Delta y \tag{6.41} $$

## Differential Equations with Separable Variables

The first order differential equations in this chapter can be written in the form:

$$ Q(x,y)\frac{dy}{dx} + P(x,y) = 0 \tag{6.6} $$

Written in this form it is assumed that $y$ is the dependent variable and $x$ is the independent variable. If we multiply 6.6 by $dx$, it becomes

$$ P(x,y)dx + Q(x,y)dy = 0. \tag{6.61} $$

Written in this form, either $x$ or $y$ may be considered as being the dependent variable. However, in both cases, $dy$ and $dx$ are *differentials* and not incremements.

These two forms don't cover all equations of the first order, but they are inclusive enough to cover most of the applications we will meet.

***Separable Variables***

If it is possible to rewrite (6.6) or (6.61) in the form

$$ f(x)dx + g(y)dy = 0 \tag{6.62} $$

so that the coefficient of $dx$ is a function of $x$ alone and the coefficient of $dy$ is a function of $y$ alone, the variables are called **separable**. And after they have been put in the form (6.62), they are said to be **separated**. A 1-parameter family of solutions of (6.62) is then

$$ \int f(x)dx + \int g(y)dy = C, \tag{6.63} $$

where $C$ is an arbitrary constant.
