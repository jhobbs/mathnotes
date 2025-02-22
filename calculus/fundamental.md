---
layout: page
title: Fundamental Theorem of Calculus
---

# Fundamental Theorem of Calculus

*Fundamental Theorem of Calculus:* If $f$ is Riemann integrable on $[a,b]$ and $F$ is a function on $[a,b]$ for which $F'(x) = f(x)$ for all $x \in [a,b],$ then

$$ \int_{a}^{b} f(x) dx = F(b) - F(a). $$

*Derivative Part of the Fundamental Theorem:* Let $f$ be continuous on $[a,b]$ and define the function $F$ on $[a,b]$ by

$$ F(x) = \int_{a}^{b} f(y) dy. $$

Then, $F$ is continuous on $[a,b],$ and for all $x \in (a,b),$ $F$ is differentiable and $F'(x) = f(x).$

*Integration by Parts Theorem:*  Let $f$ and $g$ be continuously differentiable functions on $[a,b].$ Then

$$ \int_{a}^{b} f(x)g'(x)dx = f(b)g(b) - f(a)g(a) - \int_{a}^{b} f'(x)g(x)dx. $$

*Substitution Theorem for Integration:* Let $g$ be a function with a continuous derivative on $[a,b].$ If $f$ is continuous on the range of $g,$ then

$$ \int_{a}^{b}f(g(x))g'(x)dx = \int_{g(a)}^{g(b)} f(u)du. $$
