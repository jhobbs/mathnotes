---
layout: page
title: Recurrence Relations
---

# Recurrence Relations

## Linear with Constant Coefficients

A linear recurrence with constant coefficients is an equation of the form

$$ y_t = a_1 y_{t - 1} + \cdots + a_n y_{t - n} + b. $$

If $b$ is 0, then the recurrence is said to be homogeneous, and non-homogeneous otherwise.

The positive integer $n$ is said to be the order of the recurrence.

### Solutions of Homogeneous Equations

The roots of the characteristic polynomial equation, along with initial conditions, are used to find solutions.

If there are $d$ distinct roots $r_1, r_2, \dots, r_d,$ then each solution to the recurrence takes the form

$$ a_n = k_1 r_1^n + k_2 r_2^n + \cdots + k_d r_d^n. $$

If there are repeated roots, terms the second and higher occurrences of the same root are multiplied by increasing powers of $n,$ so if the characteristic polynomial can be factored as $(x - r)^3,$ then the solution would have the form

$$ a_n = k_1 r^n + k_2 n r^n + k_3 n^2 r^n. $$

#### Order 1

The recurrence

$$ a_n = ra_{n-1} $$

has the solution $a_n = kr^n$ with $a_0 = k.$

#### Order 2

Consider a recurrence relation of the form

$$ a_n = A a_{n-1} + B a_{n-2}. $$

If we assume it as a solution of the form $a_n = r^n$, we can make the substitution to get

$$ r^n = Ar^{n-1} + Br^{n-2}, $$

which must be true for all $n > 1.$

If we divide everything by $r^{n-2}$ we get

$$ r^2 = Ar + b, \quad r^2 - Ar - B = 0. $$

We can solve for $r$ to get the two roots $\lambda_1$ and $\lambda_2,$ which are the characteristic roots or eigenvalues of the characteristic equation.

If the roots are distinct, our general solution has the form

$$ a_n = C \lambda_1^n + D \lambda_2^n, $$

and if they are identical we have

$$ a_n = C \lambda^n + D n \lambda^n. $$

We can use initial conditions to find the values of $C$ ad $D.$

Note that this process is almost exactly the same as finding the solution for linear homogenous differential equations.