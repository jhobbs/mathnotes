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

Also, note that if $p$ is an @isolated-point of $E,$ then the definition of @continuous implies that every @function $f$ which has $E$ as its @domain of definition is @continuous at $p.$ This is because for any $\epsilon > 0$ we choose, we can pick $\delta > 0$ so that the only point $x \in E$ for which $d_X(x, p) < \delta$ is $x = p,$ and so

$$ d_Y(f(x), f(p)) = 0 < \epsilon. $$

Also note that, unlike the definition of @limit, the definition of @continuous requires $f$ to be defined at $p$ in order to be @continuous at $p.$
:::

:::theorem {label: function-is-continuous-at-point-iff-limit-at-point-equals-function-at-point}
Suppose $X$ and $Y$ are @metric-spaces, $E \subset X, p \in E,$ with $p$ a @limit-point of $E,$ and $f : E \to Y.$ Then, $f$ is @continuous if and only if $\lim_{x \to p} f(x) = f(p).$

::::proof
Note that the definition of a @function having a @limit at @point in a @metric-space is different from the definition of a @function being @continuous at a @point in a @metric-space only in that the @continuous definition requires the @function to be defined at the @point (and equal to the @limit at the @point.)
::::
:::

:::definition "Composition" {synonym: composite}
Suppose $X, Y, Z$ are @metric-spaces, $E \subset X,$ $f: E \to Y,$ $g: f(E) \to Z,$ $h: E \to Z$ with

$$ h(x) = g(f(x)) \quad (x \in E). $$

The @function $h$ is called the **composition** or the **composite** of $f$ and $g.$ The notation

$$ h = g \circ f $$

is frequently used.
:::

:::theorem {label: composition-of-continuous-functions-is-continuous}
Suppose $X, Y, Z$ are @metric-spaces, $E \subset X,$ $f: E \to Y,$ $g: f(E) \to Z,$ $h: E \to Z$ with

$$ h(x) = g(f(x)) \quad (x \in E). $$

If $f$ is @continuous at a point $p \in E$ and if $g$ is @continuous at the point $f(p),$ then $h$ is @continuous at $p.$

::::proof
Let $\epsilon > 0.$ Since $g$ is @continuous at $f(p),$ there exists $\eta > 0$ such that

$$ d_Z(g(y), g(f(p))) < \epsilon \text{ if } d_Y(y, f(p)) < \eta \text{ and } y \in f(E). $$

Since $f$ is @continuous at $p,$ there exists $\delta > 0$ such that

$$ d_Y(f(x), f(p)) < \eta \text{ if } d_X(x, p) < \delta \text{ and } x \in E. $$

It follows that

$$ d_Z(h(x), h(p)) = d_z(g(f(x)), g(f(p))) < \epsilon $$

if $d_X(x, p) < \delta$ and $x \in E.$ Thus, $h$ is @continuous at $p.$
::::

::::intuition
Basically, since $g$ is continuous, we can control how close its output is to $g(f(p))$ by controlling how close its input is to $f(p),$ which we can certainly do, since $f$ is also continuous, and we can control how close its output is to $f(p)$ by controlling how close its input is to $p.$
::::
:::

:::theorem {label: mapping-continuous-iff-inverse-images-of-open-sets-are-open}
A @mapping $f$ of a @metric-space $X$ into a @metric-space $Y$ is @continuous on X if and only if $f^{-1}(V)$ is @open in $X$ for every @open set $V$ in $Y$ (see @inverse-image.)

::::proof
Assume $f$ is continuous on $X$ and $V$ is an @open set in $Y.$ Suppose, for the sake of contradiction, that $f^{-1}(V)$ is not open. Then, some point $p \in f^{-1}(V)$ is not an @interior-point of $f^{-1}(V),$ which means there is no @neighborhood of $p$ that contains only points in $f^{-1}(V),$ that is, every neighborhood of $p$ contains some point $q$ that is not in $f^{-1}(V),$ i.e., $f(q) \notin V.$ Now, since $V$ is open and $f(p) \in V,$ there is some $\epsilon > 0$ for which $B_\epsilon(f(p)) \subset V,$ but, since all neighborhoods of $p$ contain some $q \notin f^{-1}(V),$ there is no $\delta > 0$ for which all points within $\delta$ of $p$ are mapped to $B_\epsilon(f(p))$ by $f,$ a contradiction, since $f$ is continuous on $X$ by hypothesis. Therefore, our assumption is incorrect and $f^{-1}(V)$ is open.

Conversely, suppose $f^{-1}(V)$ is @open in $X$ for every @open set $V$ in $Y.$ Let $V$ be an @open set in $Y.$ Assume, for the sake of contradiction that there is some $p \in f^{-1}(V)$ at which $f$ is not continuous. Let $\epsilon > 0.$ Then, there is no $\delta > 0$ for which $B_\delta(p)$ contains only points that are mapped by $f$ to $V,$ i.e. every @neighborhood of $p$ contains some point that is not in $f^{-1}(V),$ and therefore $p$ is not an @interior-point of $f^{-1}(V),$ and $f^{-1}(V)$ is not open, a contradiction. Thus, our assumption must be incorrect, and there is no such $p,$ and since entire space $Y$ is an @open @subset of itself, $f$ must be continuous on all of $X.$
::::

:::
