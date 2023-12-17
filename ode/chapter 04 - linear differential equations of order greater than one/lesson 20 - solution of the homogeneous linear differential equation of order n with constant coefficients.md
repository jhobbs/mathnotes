---
layout: page
title: Solution of the Homogeneous Linear Differential Equation of Order n with Constant Coefficients
---

# Solution of the Homogeneous Linear Differential Equation of Order n with Constant Coefficients

While in general, linear differential equations of order greater than one, with no constraints placed on the coefficient functions, typically have no solutions in terms of elementary functions or are at least very difficult to solve, if we constraint the coefficients to constants, we can readily find solutions in terms of elementary functions.

Taking the form:

$$ \tag{20.1} a_ny^{(n)} + a_{(n-1)}y^{(n-1)} + \cdots + a_1y' + a_0y = 0, $$

where $a_0,a_1,\cdots,a_n$ are constants and $a_n \neq 0$, we will show how to find solutions.

Possible solutions $(20.1)$ have the form $y = e^{mx}$. The book comes up with this without justification. We need to find the value of $m$.

The **characteristic equation** of (20.1) can be obtained by replacing $y$ by $m$ and the order of the derivative by a numerically equal exponent:

$$ \tag{20.14} a_nm^{n} + a_{(n-1)}m^{n-1} + \cdots + a_1m + a_0 = 0, $$

Each value that makes $(20.14)$ true will make $y = e^{mx}$ a solution of $(20.1)$ - see the book for justification.

Since $(20.14)$ is an algebraic equation in $m$ of degree $n$, it has at least one and not more than $n$ distinct roots. Calling each of these $n$ roots $m_1,m_2,\cdots,m_n$, where the $m$'s not need to be distinct, then each function:

$$ \tag{20.15} y_1 = e^{m_1 x}, \quad y_2 = e^{m_2 x}, \quad \cdots, \quad y_n = e^{m_n x} $$

is a solution of $(20.1)$.

We need to consider some possibilities relating to the roots of the characteristic equation. Roots can be:

1. Real and distinct
2. Real but repeated
3. Imaginary

(*jmh* my notes)

The book goes into a lot of detail here but to be brief and only capture the outcome, we get the general solution by adding the particular solutions for each root together.

When the root is real and distinct we use this form:

$$ y = c_1 e^{m_1 x} $$

When the root is real and repeated $k$ times we use this form:

$$ y = e^{m_1 x} (c_1 + c_2 x + c_3x^2 + \cdots + c_4x^n) $$

When the root is imaginary we can write it exactly the same as if it were real, but keep in mind that imaginary roots always come in conjucate pairs. Using that fact and some manipulation, we can write the solution from the root with the complex number $\alpha - i\beta$ as:

$$ y = e^{\alpha x}(c_1\cos\beta x + c_2\sin\beta x) $$


For example, the general solution to a 5th degree homogeneous linear differential equation with 1 distinct real root, a repeated real root, and a conjugate pair of imaginary roots would look like:

$$ y_c = c_1 e^{m_1 x} + e^{m_2 x}(c_2 + c_3x) + e^{\alpha x}(c_4\cos\beta x + c_5\sin\beta x) $$


Finding that general solution involves taking the original differential equation, finding its characteristic equation, and then finding the roots of that characteristic equation. Keep in mind that algebraic equations of degrees greater than 2 can be very hard (or impossible?) to solve.
