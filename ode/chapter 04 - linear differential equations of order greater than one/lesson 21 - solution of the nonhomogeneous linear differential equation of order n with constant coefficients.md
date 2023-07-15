---
layout: page
title: Solution of the Nonhomogeneous Linear Differential Equation of Order n with Constant Coefficients
---

# Solution of the Nonhomogeneous Linear Differential Equation of Order n with Constant Coefficients


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
