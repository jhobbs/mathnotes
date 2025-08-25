---
layout: page
title: Induction
---

# Induction

For proof by induction that a statement is true for all $n \geq 1$  we show two things:



* That the statement is true for $n = 1$.
* That if some statement is true for $n = k$, it must also be true for $n = k + 1$

Then, since it's true for $n = 1$, it must also be true for $n = 1 + 1 = 2$, and since it's true for $n = 2$, it must also be true for $n = 2 + 1 = 3$, and so on, ad infinitum.

## Example

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

## Another Example

Prove that for all $n \geq 0$:

$$ \tag{a} \sum_{k=0}^n 3^k = \frac{3^{(n+1)} - 1}{2} $$

### Proof

We will proceed using proof by induction.

#### Base Case

First, we must show that the base case where $n = 0$ is true.

Substituting $0$ for $n$ into (a) gives

$$ \tag{b} \sum_{k=0}^0 3^k = \frac{3^{0+1} - 1}{2}, $$

and we can simplify both sides to get

$$ \tag{c} 3^0 = \frac{3^1 - 1}{2}, $$

which reduces to

$$ \tag{d} 1 = 1, $$

which is obviously true and shows that (a) is true for the base case where $n = 0$.

#### Induction Case

Now we must show that if we assume (a) is true for some $n \geq 0$, that (a) is also true for $n + 1$.

That is, we must show that if we assume

$$ \tag{e} \sum_{k=0}^n 3^k = \frac{3^{(n+1)} - 1}{2} $$

is true, that

$$ \tag{f} \sum_{k=0}^{(n+1)} 3^k = \frac{3^{(n+1)+1} - 1}{2} $$

is necessarily true.

Now, assume (e) is true.

Using the fact that the summation on the left hand side of (f) is short hand for the series

$$ \tag{g} 3^0 + 3^1 + 3^2 + \cdots + 3^n + 3^{(n+1)}, $$

we can rewrite (f) as

$$ \tag{h} 3^0 + 3^1 + 3^2 + \cdots + 3^n + 3^{(n+1)} = \frac{3^{(n+1)+1} - 1}{2} $$

Now, the terms on the left-hand side of (h) are just

$$ \tag{i} \sum_{k=0}^n 3^k + 3^{(n+1)} $$

so we have 

$$ \tag{j} \sum_{k=0}^n 3^k + 3^{(n+1)} = \frac{3^{(n+1)+1} - 1}{2} $$

Since we assumed that (e) is true, we can replace the summation on the left-hand side of (j) with its equivalent on the right-hand side of (e) to get

$$ \tag{k} \frac{3^{(n+1)} - 1}{2} + 3^{(n+1)} = \frac{3^{(n+1)+1} - 1}{2}. $$
 
Combining terms on the left-hand side gives

$$ \tag{l} \frac{3(3^{(n+1)}) - 1}{2} = \frac{3^{(n+1)+1} - 1}{2}, $$

and since $3(3^{(n+1)}) = 3^{(n+1)+1}$ we get that

$$ \tag{m} \frac{3^{(n+1)+1} - 1}{2} = \frac{3^{(n+1)+1} - 1}{2}, $$

is necessarily a true statement, which is what we needed to show. $\blacksquare$