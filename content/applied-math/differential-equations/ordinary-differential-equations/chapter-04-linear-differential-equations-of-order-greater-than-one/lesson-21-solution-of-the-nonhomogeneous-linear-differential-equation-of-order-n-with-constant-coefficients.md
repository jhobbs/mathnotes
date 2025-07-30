---
description: Comprehensive treatment of the method of undetermined coefficients for
  solving nonhomogeneous linear differential equations with constant coefficients.
  Covers multiple cases and the use of complex variables for particular solutions.
layout: page
redirect_from:
- ode/chapter 04 - linear differential equations of order greater than one/lesson 21 - solution of the nonhomogeneous linear differential equation of order n with constant coefficients
- chapter 04 - linear differential equations of order greater than one/lesson 21 - solution of the nonhomogeneous linear differential equation of order n with constant coefficients.html
title: Solution of the Nonhomogeneous Linear Differential Equation of Order n with
  Constant Coefficients (Method of Undetermined Coefficients)
---

# Solution of the Nonhomogeneous Linear Differential Equation of Order n with Constant Coefficients (Method of Undetermined Coefficients)


From 19.3 and 19.41 we have that the general solution of a nonhomogeneous linear differential equation of order n:

$$ \tag{21.1} a_ny^{(n)} + a_{(n-1)}y^{(n-1)} + \cdots + a_1y' + a_0y = Q(x), $$

will be the sum of the complementary function of its related homogeneous form and of a particular solution of $(21.1)$:

$$ \tag{21.11} y(x) = y_c(x) + y_p(x), $$

We know how to find $y_c(x)$ from the previous section, and here we will show how to use the **method of undetermined coefficients** to find $y_p(x)$. We can only use this method when $Q(x)$ consists of a sum of terms each of which has a finite number of linearly independent derivatives.

See the book for more details, but there are several cases to handle.


For all of these cases, start by finding $y_c$ of the related homogeneous form of the equation, following the method from Lessson 20.

**Case 1.**  *No term of Q(x) in (21.1) is the same as a term of* $y_c$. In this case, a particular solution $y_p$ of (21.1) will be a linear combination of the terms in $Q(x)$ and *all* its linearly independent derivatives.

Steps:

1. Find a trial solution. This will be a linear combination of the linearly independent derivatives of the terms of $Q(x)$. Discard any coefficients and replace them with unknown constants $A, B, C...$. Call this $y_p$.

2. Find the first *n-1* derivatives of $y_p$ where $n$ is the order of $(21.1)$.

3. Substitute $y_p$ and its derivatives into $(21.1)$.

4. Solve for the unknown constants and substitute them back into $y_p$.

5. Add $y_c$ to the result from the previous step: $y = y_c + y_p$

**Case 2.** $Q(x)$ *in (21.1) contains a term which, ignoring constant coefficients, is* $x^k$ *times a term* $u(x)$ *of* $y_c$ *, where* $k$ *is zero or a positive integer*.

1. Find a trial solution. This will be a linear combination of $x^{k+1}u(x)$ and all its linearly indepenent derivatives (ignoring constant coefficients). If $Q(x)$ contains terms which belong to case 1, then the proper terms called for by this case must be included in $y_p$. Note that if a term of derivatives of $x^{k+1}u(x)$ appears in $y_c$, we can leave it and its derivatives out of $y_p$.

2. Follow the rest of the steps from Case 1 - they are the same.

**Case 3.** $Q(x)$ *This case is applicable only if both of the following conditions are fulfilled*

A. The characteristic equation of the given differential equation $(21.1)$ has an $r$ multiple root.

B. $Q(x)$ contains a term, which, ignoring constant coefficients, is $x^k$ times a term $u(x)$ in $y_c$, where $u(x)$ was obtained from the $r$ multiple root.

1. Find a trial solution. This will be a linear combination of $x^{k+r}u(x)$ and all its linearly dependent derivatives, along with the proper terms called for by cases 1 and 2, if terms matching those cases are present in $Q(x)$.

2. Follow the rest of the steps from Case 1 - they are the same.

## Solution by the use of Complex Variables

If in:

$$ \tag{21.5} a_ny^{(n)} + a_{(n-1)}y^{(n-1)} + \cdots + a_1y' + a_0y = Q(x), $$

the $a$'s are real and $Q(x)$ is a complex-valued function and $y_p(x)$ is a solution of $(21.5)$, then,:

1. The real part of $y_p$ is a solution of $(21.5)$ with $Q(x)$ replaced by its real part
2. The imaginary part of $y_p$ is a solution of $(21.5)$ with $Q(x)$ replaced by its imaginary part

(*jmh*) This means if $Q(x)$ is a real-valued function that is the imaginary part of a complex-valued function (i.e., $\sin{x}$ is the imaginary part of $e^{ix}$), we can find $y_p$ for the complex-valued function and then use the imaginary part of $y_p$ as the solution for our real valued function. The same holds for a real-valued function that is the real part of a complex-valued function (i.e., $\cos{x}$ is the real part of $e^{ix}$), except we'd use the real part of the complex-valued function's $y_p$.

## Exercises

Exercise 1. Prove that any term which is in the complementary function $y_c$ need not be included in the trial solution $y_p$. (*Hint*: Show that the coefficients of this term will always add to zero.).

(*jmh*: my proof). Suppose that $y_c$ contains the term $c_1f(x)$ and the trial solution $y_p$ contains the term $Af(x)$, where $A$ is a constant. Then the general solution $y = y_c + y_p$ would contain the term $(c_1 + A)f(x)$, which can just be rewritten in terms of a new constant, $c_2f(x)$, i.e., the $Af(x)$ term is redundant because $c_1f(x)$ and $Af(x)$ are linearly dependent, and therefore we can leave $Af(x)$ out of $y_p$ without changing the general solution $\blacksquare$. (Note: this proof doesn't use the hint provided, so while it makes sense to me, it may not be the proof the book had in mind and may be missing something).

Exercise 2. Prove that if $F(x)$ is a function with a finite number of linearly independent derivatives, i.e. if $F^{(n)}(x),F^{(n-1)}(x),\cdots,F'(x),F(x)$ are linearly independent functions, where $n$ isa finite number, then $F(x)$ consist only of such terms as $a, x^k, e^{ax}, \sin{ax}, \cos{ax}$, and combinations of such terms, where $a$ is a constant and $k$ is a positive integer.

By hypothesis, these functions are linearly independent, i.e., we have that there exists a set of constants, not all zero, such that:

$$ \tag{a} C_nF^{(n)}(x) + C_{n-1}F^{(n-1})(x) + \cdots + C_1 F'(x) + C_0 F(x) = 0 $$

Now we have to show what forms the functions in $(a)$ can take. Following the method of lesson 20, that we have an $n$ degree characteristic equation for the ODE $(a)$, with $n$ roots. By the fundamental theorem of algebra, roots can follow only these three cases:

1. Distinct real roots
2. Repeated real roots
3. Conjugate pairs of imaginary roots

By lesson 20, distinct real roots result in solutions with terms in the form $ce^{ax}$, repeated real roots result in the form $cx^ke^{ax}$, which additionally includes terms of the forms $ac$ and $cx^k$. Conjugate pairs of imaginary roots result in terms of the form $c\sin{ax}$ and $c\cos{ax}$.

We can thus see that solutions of $(a)$, i.e. possible values of $F(x)$, will only contain terms formed by combinations of $a, x^k, e^{ax}, \sin{ax}, \cos{ax}$ $\blacksquare$.