---
layout: page
title: Rounding Errors
description: Analysis of floating-point arithmetic precision, error measurement techniques, and computational strategies like nesting to minimize numerical errors.
---

# Rounding Errors

Given a real number $p$ and an approximation for it $p*$, we can find how much error there is in the approximation.

The **actual error** is $p - p\*$, the **absolute error** is $\|p - p\*\|,$ and the **relative error** is:

$$ \frac{|p - p*|}{|p|}. $$

When using computers to do floating-point arithmetic, rounding errors will occur because floating-point numbers have finite precision.

## Nesting Technique

We can use a nesting technique to reduce rounding errors for some calculations.

For example, we can rewrite

$$ f(x) = x^3 - 6.1x^2 + 3.2x + 1.5 $$

as

$$ f(x) = (x - 6.1)x + 3.2)x + 1.5. $$ 

The second format will have less error, because it changes the computation from four multiplications and three additions to two multiplications and three additions.