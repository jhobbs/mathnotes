---
layout: page
title: Induction
---
# Induction

For proof by induction that a statement is true for all $n \geq 1$  we show two things:



* That the statement is true for $n = 1$.
* That if some statement is true for $n = k$, it must also be true for $n = k + 1$

Then, since it's true for $n = 1$, it must also be true for $n = 1 + 1 = 2$, and since it's true for $n = 2$, it must also be true for $n = 2 + 1 = 3$, and so on, ad infinitum.

Example.

We will prove by induction that

$$ \tag{a} 1^2 + 2^2 + 3^2 + \cdots + n^2 = \frac{n(n+1)(2n+1)}{6} $$


First, let's show that for $n = 1$ the equation is true:

$$ \tag{b} 1^2 = \frac{1(1 + 1)(2 \cdot 1 + 1)}{6}  = 1$$

Now we must show that if we assume the equation is true for $n = k$:

$$ \tag{c} 1^2 + 2^2 + 3^2 + \cdots + k^2 = \frac{k(k+1)(2k + 1)}{6} $$

then it is also true for $n = k + 1$, that is that:

$$ \tag{d} 1^2 + 2^2 + 3^2 + \cdots + (k+1)^2 = \frac{(k+1)((k+1)+1)(2(k+1) + 1)}{6} $$

is true.

Since we assume that $(c)$ is true, then adding $(k + 1)^2$ to both sides in $(c)$ must also result in a true equation:

$$ \tag{e} 1^2 + 2^2 + 3^2 + \cdots + k^2 + (k+1)^2 = \frac{k(k+1)(2k + 1)}{6} + (k + 1)^2 $$

By combining terms on the right side and factoring, we get that:

$$ \tag{e} 1^2 + 2^2 + 3^2 + \cdots + k^2 + (k+1)^2 = \frac{(k+1)((k+1)+1)(2(k+1) + 1)}{6} $$

must be true, which is what we set out to show.

Thus, since we have shown that $(a)$ is true for $n = 1$,
and that if it is true for $n = 1$ it must also be true for $n = 1 + 1 = 2$, then it must also be true for
$n = 2$, and therefore also true for $n = 2 + 1 = 3$, and so on, ad infinitum $\blacksquare$.
