---
layout: page
redirect_from:
- ode/chapter 91 - initial and boundary values problems/lesson 910 - initial and boundary values problems
title: Initial and Boundary Value Problems
---

# Initial Value Problems

Initial value problems give a differential equation and some initial conditions. For a second order differential equation of an unknown funciton $y(x)$, the initial conditions are typically given as $y(0)$ and $y'(0)$.

The [[Laplace Transform|applied-math/differential-equations/ordinary-differential-equations/chapter-05-operators-and-laplace-transforms/lesson-27-the-laplace-transform-and-gamma-function]] method of solving differential equation is especially well suited to solving initial value problems, since the transforms for $y''$ and $y'$ include initial conditions.

Initial conditions don't always have to have $x=0$ - they can have some other starting condition. It may still be possible to perform translation of axes to make the initial conditions start at $t=0$ for some new parameter, which can make problems easier to solve.

# Boundary Value Problems

Boundary value problems give a differential equation and some boundary values. For a second order differential equation of an unknown function $y(x)$, the boundary conditions might be given as $y(a)$ and $y(b)$.

The approach here is to find a general solution (perhaps using the [[method of undetermined coefficients|applied-math/differential-equations/ordinary-differential-equations/chapter-04-linear-differential-equations-of-order-greater-than-one/lesson-21-solution-of-the-nonhomogeneous-linear-differential-equation-of-order-n-with-constant-coefficients]], and then to setup a system of equations to solve for the unknown constants.

It's possible that one of the constants will be left undetermined, especially if one of the boundary conditions lies at the edge, but outside of, a the unknown funciton's domain.