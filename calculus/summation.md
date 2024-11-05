---
layout: page
title: Summation
---

# Summation

## Shifting the Summation Index

Let's say we have

$$ \sum_{n=2}^{\infty}{n(n-1)a_nx^{n-2}} $$


and want to write it as a series where the generic term is $x^k$ instead of $x^{n-2}$.

We can let $k = n - 2, ~ n = k + 2$ and make the substitutions:

$$ \sum_{k + 2 = 2}^{\infty}{(k+2)(k + 2 - 1)a_{k+2}x^{k + 2 - 2}} = \sum_{k = 0}^{\infty}{(k+2)(k + 1)a_{k+2}x^{k}}. $$

This is useful when we want to combine series with different generic terms.

For example, consider:

$$ \sum_{n=0}^{\infty}{na_nx^{n-1}} + \sum_{n=0}^{\infty}{2a_nx^{n+1}}. \tag{a} $$

If we want to combine these into a single series, we need to rearrange them so their generic term is the same. We'll make it $x^k$ in both cases.

First, note that since the first term in the first series is $0$, nothing is lost be shifting its starting point to $n = 1$, and now we have:

$$ \sum_{n=1}^{\infty}{na_nx^{n-1}} + \sum_{n=0}^{\infty}{2a_nx^{n+1}}. \tag{b} $$

Now, in the first, let $k = n - 1, ~ n = k + 1$, and in the second, let $k = n + 1, ~ n = k -1$, and make the substitutions:

$$ \sum_{k + 1 = 1}^{\infty}{(k+1)a_{k+1}x^{k+1-1}} + \sum_{k - 1 = 0}^{\infty}{2a_{k-1}x^{k-1+1}}, \tag{c} $$

which simplifies to

$$ \sum_{k=0}^{\infty}{(k+1)a_{k+1}x^{k}} + \sum_{k = 1}^{\infty}{2a_{k-1}x^{k}}. \tag{d} $$

Since the first series starts at $k=0$ and the second at $k=1$, we have some work left to do. We can split the first series into a constant term plus a series starting at $k=1$ by noting that when $k=0$, the first term in the first series is $a_1$:

$$ a_1 + \sum_{k=1}^{\infty}{(k+1)a_{k+1}x^{k}} + \sum_{k = 1}^{\infty}{2a_{k-1}x^{k}}. \tag{e} $$

Now we can combine the two series to get:


$$ a_1 + \sum_{k=1}{\left [ (k+1)a_{k+1} + 2a_{k-1} \right ] x^k}. $$
