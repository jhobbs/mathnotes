---
description: Continuity in Euclidean and Metric Spaces
layout: page
title: Continuity in Euclidean and Metric Spaces
---

# Limits of Functions

:::definition "Limit"
Let $X$ and $Y$ be @metric-spaces; suppose $E \subset X,$ $f : E \to Y,$ and $p$ is a @limit-point of $E.$ We write $f(x) \to q$ as $x \to p,$ or

$$ \lim_{x \to p} f(x) = q $$

if there is a point $q \in Y$ with the following property: For every $\epsilon > 0,$ there exists a $\delta > 0$ such that

$$ d_Y(f(x), q) < \epsilon $$

for all points $x \in E$ for which

$$ 0 < d_X(x,p) < \delta. $$
:::
:::note
In the above definition, the symbols $d_X$ and $d_Y$ refer to distances in $X$ and $Y,$ respectively.

Furthermore, while $p \in X,$ $p$ need not be a point of $E.$ In fact, even if $p \in E,$ it's possible that $f(p) \neq \lim_{x \to p} f(x).$
:::

:::theorem {label: limit-of-a-function-characterized-by-limits-of-sequences}
Let $X$ and $Y$ be @metric-spaces; suppose $E \subset X,$ $f : E \to Y,$ and $p$ is a @limit-point of $E.$ Then

$$ \lim_{x \to p} f(x) = q \tag{a} $$

if and only if

$$ \lim_{n \to \infty} f(p_n) = q \tag{b} $$

for every @sequence $\{p_n\}$ in $E$ such that

$$ p_n \neq p, \quad \lim_{n \to \infty} p_n = p. \tag{c} $$

::::proof {tags: contrapositive}
Suppose that (a) is true and let $\{p_n\} \subset E$ be a @sequence such that (c) holds. Let $\epsilon > 0.$ Then, for some $\delta > 0,$ if $d_X(x,p) < \delta,$ then $d_Y(f(x), q) < \epsilon.$ Now, there is also some $N$ such that $d_X(p_n, p) < \delta$ whenever $n \geq N,$ and thus, $d_Y(f(p_n), q) < \epsilon$ whenever $n \geq N,$ so (b) holds.

Conversely, suppose that (a) is false. Then, for some $\epsilon > 0,$ that for every $\delta > 0$ there exists a point $x \in E$ such that $d_Y(f(x), q) \geq \epsilon$ but $0 < d_X(x, p) < \delta.$ If we let $\delta_n = 1/n, n = 1, 2, 3, \dots,$ and each $x_n$ a point such that $0 < d_X(x_n, p) < \delta_n,$ then $\{x_n\}$ is a @sequence satisfying (c). However, since $d_Y(f(x_n), q) \geq \epsilon$ for all $n,$ (b) does not hold.
::::

::::corollary {label: limit-of-a-function-at-a-point-is-unique-if-it-exists}
If $f$ has a @limit at $p,$ this @limit is unique.

:::::proof
This follows directly from the facts that @{limits of sequences are unique|limits-of-sequences-are-unique} and that @{limits of functions are characterized by limits of sequences|limit-of-a-function-characterized-by-limits-of-sequences}.
:::::
::::
:::

:::theorem
Suppose $E \subset X,$ a @metric-space, $p$ is a @limit-point of $E,$ $f$ and $g$ are complex functions on $E,$ and

$$ \lim_{x \to p} f(x) = A, \quad \lim_{x \to p} g(x) = B. $$

Then:

$$ \lim_{x \to p} (f + g)(x) = A + B. $$

$$ \lim_{x \to p} (fg)(x) = AB. $$

$$ \lim_{x \to p} (\frac{f}{g})(x) = \frac{A}{B}, B \neq 0. $$


::::proof
This follows directly from the that @{limits of functions are characterized by limits of sequences|limit-of-a-function-characterized-by-limits-of-sequences}, and the @{algebraic properties of sequences of limits|sums-and-products-of-sequences}.
::::

::::remark
If $\vec{f}$ and $\vec{g}$ map $E$ into $R^k,$ then (a) remains true, and (b) becomes

$$ \lim_{x \to p} (f \cdot g)(x) = A \cdot B. $$

That is, the @limit of an @inner-product of vector valued functions is the @inner-product of their @limits.

(See @sequence-in-rk-converges-iff-its-components-converge).
::::
:::

# Continuous Functions

:::definition "Continuous"
Suppose $X$ and $Y$ are @metric-spaces, $E \subset X, p \in E,$ and $f : E \to Y.$ Then $f$ is said to be **continuous at $p$** if for every $\epsilon > 0$ there exists a $\delta > 0$ such that

$$ d_Y(f(x), f(p)) < \epsilon $$

for all points $x \in E$ for which $d_X(x, p) < \delta.$

If $f$ is **continuous** at every @point of $E,$ then $f$ is said to be **continuous on $E$.**
:::

:::note
A more geometric way to view continuity is that for any @ball $B(f(p))$ centered at $f(p),$ there is some @ball $B(p)$ centered at $p$ for which every point in $B(p)$ (including $p$) is mapped by $f$ to some point in $B(f(p)).$
:::
