---
layout: page
title: Integration
---

# Integration

A **partition** $P$ of the interval $[a,b]$ is a set $\{x_0, x_1, \dots, x_n\}$ of real numbers such that

$$ x_0 <  x_1 < \cdots < x_n, \quad x_0 = a, x_n = b. $$

Let $f$ be a bounded function on $[a,b],$ and let $P = \{x_0, x_1, \dots, x_n\}$ be a partition of $[a,b].$ Then the **upper sum** (upper Darboux sum) of $f$ for the partition $P$, $U(f,P),$ is given by

$$ U(f, P) = \sum_{k=1}^n \sup{\{ f(x) | x \in [x_{k-1}, x_k]\}} (x_k - x_{k-1}), $$

and the **lower sum** (lower Darboux sum) of $f$ for the partition $P$ $L(f,P)$ is given by

$$ L(f, P) = \sum_{k=1}^n \inf{\{ f(x) | x \in [x_{k-1}, x_k]\}} (x_k - x_{k-1}). $$

These sums essentially represent the area of rectangles bounded either above or below $f$ on each interval given by the partition.

Let $f$ be a bounded function on $[a,b],$ let $\mathcal{U}$ denote the set of upper sums for $f,$ and let $\mathcal{L}$ represent the set of lower sums for $f.$ Then the **upper Darboux integral** (or equivalently, **upper Riemann integral**) of $f$ on $[a,b]$ is given by

$$ \overline{\int_a^{b}} f(x) dx = \inf \mathcal{U}, $$

and the **lower Darboux integral** (or **lower Riemann integral**) of $f$ on $[a,b]$ is given by

$$ \underline{\int_a^{b}} f(x) dx = \sup \mathcal{L}. $$

*Theorem:* For a given function an interval, the lower Riemann integral is always less than or equal to the upper Riemann integral: 

$$ \underline{\int_a^{b}} f(x) dx  \leq \overline{\int_a^{b}} f(x) dx. $$

We say that $f$ is **Riemann integrable** on $[a,b]$ if 

$$ \underline{\int_a^{b}} f(x) dx = \overline{\int_a^{b}} f(x) dx, $$

and we say the **Riemann integral** of $f$ on $[a,b],$ is

$$ \int_a^{b} f(x) dx = \underline{\int_a^{b}} f(x) dx = \overline{\int_a^{b}} f(x) dx. $$

*Riemann's Condition Theorem:* Let $f$ be a bounded function on $[a,b].$ Then $f$ is Riemann integrable on $[a,b]$ if and only if for every $\epsilon > 0,$ there exists a partition $P$ of $[a,b]$ such that

$$ U(f, P) - L(f, P) < \epsilon. $$

*Theorem:* If $f$ is continuous on $[a,b],$ then $f$ is Riemann integrable on $[a,b].$

## Riemann Integration Rules

*Theorem:* Assume $f$ and $g$ are Riemann integrable on $[a,b]$ and $c \in \mathbb{R}.$ Then the following conditions hold

Linearity: $\int_a^{b} f(x) dx + c \int_a^{b} g(x) dx = \int_a^{b}(f(x) + cg(x))dx. $

$f \cdot g$ is Riemann integrable.

If $f(x) \leq g(x)$ for all $x \in [a,b],$ then $\int_a^{b} f(x) dx \leq \int_a^{b} g(x) dx.$

$\|f\|$ is Riemann integrable and

$$ \left | \int_a^{b} f(x) dx \right | \leq \int_a^{b} | f(x) | dx. $$

*Integral Mean Value Theorem:* If $f$ is continuous on $[a,b],$ there exists a number $c \in [a,b]$ such that

$$ \int_a^{b} f(x) dx = f(c)(b - a). $$

## Riemann Sums

Let $f$ be a bounded function on $[a,b]$ and $P = \{x_0, x_1, \cdots, x_n\}$ be a partition of $[a,b].$ Let $T = \{t_1, t_2, \dots, t_n\}$ where $t_k \in [x_{k-1}, x_k]$ for $k = 1,2,\dots, n.$ The sum

$$ \sum_{k=1}^n f(t_k)(x_{k-1} - x_k) $$

is called the **Riemann Sum** for the partition $P$ and points $T,$ and is denoted by $S(f, P, T).$

Let $P = \{x_0, x_1, \cdots, x_n\}$ be a partition of $[a,b].$ The **norm** of $P$ is given by

$$ \text{norm}{P} = \max{\{ |x_k - x_{k-1} | | k \in \{1,2,\dots,n\} \}}. $$

The limit of the sum as the norm of the partition approaches zero is said to equal $I,$ written as

$$ \lim_{\text{norm}P \to 0} S(f, P, T) = I,$$

if for every $\epsilon < 0,$ there exists a $\delta > 0$ such that for any partition $P$ of $[a,b]$ with $\text{norm}P < \delta$ and for any points $T,$ is is the case that

$$ |S(f, P, T)| <  \epsilon. $$

*Riemann Integral Evaluation Theorem:* If $f$ is a Riemann integrable function on $[a,b],$ then

$$ \lim_{\text{norm}P \to 0} S(f, P, T) = \int_a^{b} f(x) dx. $$