---
layout: page
title: Limits
---

# Limits

## Tricks

### Factoring a root out of a numerator

Say we have:

$$ \lim_{n \to \infty} \frac{n + 1}{\sqrt{(n + 1)(2n+1)}} $$

Since $n$ is going to infinity it is positive and for positive $n$, $n + 1 = \sqrt{(n+1)^2)$ we can factor out a root to simplify:

$$ \lim_{n \to \infty}  \frac{\sqrt{(n + 1)^2}}{\sqrt{(n + 1)(2n+1)}} =  \lim_{n \to \infty} \sqrt{\frac{(n + 1)^2}{(n + 1)(2n+1)}} =  \lim_{n \to \infty} \sqrt{\frac{n+1}{2n+1}}  $$

From there we can move the limit inside the radical:

$$ \sqrt{\lim_{n \to \infty} \frac{n + 1}{2n + 1}} = \sqrt{\frac{1}{2}} = \frac{\sqrt{2}}{2}$$
