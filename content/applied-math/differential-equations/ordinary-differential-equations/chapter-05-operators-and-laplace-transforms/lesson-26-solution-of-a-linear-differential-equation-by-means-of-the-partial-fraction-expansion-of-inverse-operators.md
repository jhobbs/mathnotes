---
layout: page
redirect_from:
- ode/chapter 05 - operators and laplace transforms/lesson 26 - solution of a linear differential equation by means of the partial fraction expansion of inverse operators
- chapter 05 - operators and laplace transforms/lesson 26 - solution of a linear differential equation by means of the partial fraction expansion of inverse operators.html
title: Solution of a Linear Differential Equation by Means of the Partial Fraction
  Expansion of Inverse Operators
---

# Solution of a Linear Differential Equation by Means of the Partial Fraction Expansion of Inverse Operators

## Partial Fraction Expansion Theorem

This chapter uses partial fraction expansion (aka partial fraction decomposition) from algebra. This is the same PFD used to pull integrals apart into simpler ones. It is covered in [[my notes on Partial Fraction Decomposition|algebra/partial-fractions]] and I won't go into it again here.

## First Method of Solving a Linear Equation by Means of the Partial Fraction Expansion of Inverse Operators

To demonstrate by example, consider that we're trying to solve a differential equation by means of inverse operators and have:

$$ \tag{c} y_p = \frac{1}{(D-2)^2 (D-1)} 2e^{4x} $$

We can use partial fraction expansion to rewrite this as:

$$ \tag{d} y_p = \frac{1}{D - 1} 2e^{4x} - \frac{1}{D-2} 2e^{4x} + \frac{1}{(D-2)^2} 2e^{4x} $$

We can then solve this by applying the method from $(25.4)$ (see the previous lesson) to each term.

A generalization is given in the case that $P(D)$ has distinct roots and is of the second order. Let $r_1, r_2$ be the distinct roots. Then:

$$ \tag{26.21} \frac{1}{(D-r_1)(D - r_2)} = \frac{1}{r_1 - r_2}(\frac{1}{D - r_1} - \frac{1}{D - r_2}) $$

(*jmh*: After using this method some, it's not clear when this is advantageous to use. It seems to be more work than some of the other methods)

## A Second Method of Solving a Linear Equation by Means of the Partial Fraction Expansion of Inverse Operators

To demonstrate by example, consider that we're trying to solve a differential equation by means of inverse operators and have:

$$ \tag{a} y_p = \frac{1}{D^2 - 3D + 2}\sin{x} $$

The zeros of $D^2 - 3D + 2$ are $r_1 = 2, r_2 = 1$, hence $r_1 - r_2 = 2 - 1 = 1$ and we can use $(26.21)$ to get:

$$ \tag{b} y_p = \frac{1}{D - 2}\sin{x} - \frac{1}{D - 1}\sin{x} $$

Via the superposition principle, we can split this into two independent problems:

$$ \tag{c} y_{1p} = \frac{1}{D - 2}\sin{x}, \quad y_{2p} =  \frac{-1}{D - 1}\sin{x} $$

Therefore $y_p = y_{1p} + y_{2p} $

We can rewrite these as:

$$ \tag{d} (D - 2)y = y' -2y = \sin{x}, \quad (D - 1)y = y' - y = -\sin{x}  $$

These are two independent linear equations that can now be solved. Summing their solutions gives $y_p$.

When compared to the method used in Lesson 24C, this has the distinction of being able to find and solve linear equations independently rather than in sucession (*jmh* this seems useful for parallelizing finding solutions if we're using computers).