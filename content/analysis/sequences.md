---
description: Sequences in Euclidean and Metric Spaces
layout: page
title: Sequences in Euclidean and Metric Spaces
---

# Sequences

Review the definition of a sequence:

@embed{sequence}

:::definition "Converge"
A sequence $\{p_n\}$ in a @metric-space $X$ is said to **converge** if there is a point $p \in X$ with the following property: For every $\epsilon > 0,$ there is an integer $N$ such that $n \geq N$ implies that $d(p_n, p) < \epsilon.$
:::

:::definition "Convergent"
If a @sequence @converges, it is said to be a **convergent** @sequence.
:::

:::definition "Limit"
If a @sequence $\{p_n\}$ converges to $p,$ we say that $p$ is the **limit** of $\{p_n\},$ denoted as:

$$ \lim_{n \to \infty} p_n = p. $$
:::

:::definition "Diverge"
If a @sequence $\{p_n\}$ does not @converge, it is said to **diverge.**
:::

:::definition "Range (sequence)"
The set of all points $p_n$ of a sequence $\{p_n\} (n = 1, 2, 3, \dots)$ is the **@range** of $\{p_n\}.$
:::

:::note {label: sequence-range-cardinality}
The @range-sequence of a @sequence may be @finite or it may be @infinite.
:::

:::definition "Bounded (sequence)"
The @sequence $\{p_n\}$ is said to be **bounded** if its @range-sequence is @bounded.
:::

:::note {label: sequence-theorems-context}
In the following theorems, let $\{p_n\}$ be a @sequence in a @metric-space $X.$
:::

:::theorem {label: sequence-converges-iff-neighborhood-contains-all-but-finitely-many-points}
$\{p_n\}$ converges to $p \in X$ if and only if every neighborhood of $p$ contains $p_n$ for all but finitely many $n.$

::::proof
Suppose $\{p_n\}$ @converges to $p \in X.$ Let $\epsilon > 0.$ For some integer $N,$ $d(p, p_n) < \epsilon$ when $n > N.$ Therefore, $p_n \in B_\epsilon(p)$ for all but the finitely many $p_n$ where $n \leq N.$ 

Conversely, suppose every @neighborhood of $p$ contains all but finitely many $p_n,$ i.e., for all but $N$ elements of $\{p_n\}.$ Let $\epsilon > 0.$ Then, $p_n \in B_\epsilon(p)$ whenever $n \geq N,$ therefore, $d(p, p_n) < \epsilon.$
::::
:::

:::theorem {label: limits-of-sequences-are-unique}
If $p \in X, p' \in X$ and $\{p_n\}$ converges to $p$ and $p',$ then $p = p'.$

::::proof
Suppose, for contradiction, that $p \neq p'.$ Then, $\epsilon = d(p, p') > 0.$ Let $\delta = \epsilon/2$ and $B_\delta(p), B_\delta(p')$ be @balls around $p$ and $p',$ respectively. This means that @{only finitely many points from $\{p_n\}$ are not in $B_\delta(p)$|sequence-converges-iff-neighborhood-contains-all-but-finitely-many-points}. However, since $B_\delta(p)$ and $B_\delta(p')$ are disjoint by construction, this means only finitely many points of $\{p_n\}$ are in $B_\delta(p'),$ a contradiction. Therefore, our assumption that $p \neq p'$ is incorrect, so $p = p'.$
::::
:::

:::theorem {label: convergent-sequences-are-bounded}
If $\{p_n\}$ @converges, then $\{p_n\}$ is @bounded-sequence.

::::proof
Let $\epsilon > 0.$ @{Only finitely many points in $\{p_n\}$ lie outside of $B_\epsilon(p)$|sequence-converges-iff-neighborhood-contains-all-but-finitely-many-points}. That is, for some integer $N,$ only the points $p_n$ where $n \leq N$ lie outside of $B_\epsilon(p).$ Let $\delta = \max\{\epsilon, d(p, p_1), d(p, p_2), \dots, d(p, p_n)\}, n = 1, 2, \dots, N.$ Then, $d(p, p_n) < \delta$ for all $n = 1, 2, 3, \dots.$
::::
:::

:::theorem {label: limit-point-implies-convergent-sequence}
If $E \subset X$ and if $p$ is a @limit-point of $E,$ then there is a @sequence $\{p_n\}$ in $E$ such that $p = \lim_{n \to \infty} p_n.$

::::proof
For each $n = 1,2,3 \dots,$ @{there is a point $p_n \in E$ such that $d(p, p_n) < 1/n$|limit-point}. Let $\epsilon > 0,$ and pick $N$ so that $N \epsilon > 1.$ Then, if $n > N,$ $d(p, p_n) < \epsilon,$ so $\lim_{n \to \infty} p_n = p$.
::::
:::

:::theorem {label: sums-and-products-of-sequences}
Suppose $\{s_n\}$ and $\{t_n\}$ are complex @sequences, and $\lim_{n \to \infty} s_n = s, \lim_{n \to \infty} t_n = t.$ Then

(a) $\lim_{n \to \infty} (s_n + t_n) = s + t;$

(b) $\lim_{n \to \infty} c s_n = cs,$ for any number $c;$

(c) $\lim_{n \to \infty} (c + s_n) = c + s,$ for any number $c;$

(d) $\lim_{n \to \infty} s_n t_n = st;$

(e) $\lim_{n \to \infty} \frac{1}{s_n} = \frac{1}{s}, s_n \neq 0, s \neq 0.$

::::proof

For (a), let $\epsilon > 0,$ pick $N_s$ such that $|s_n - s| < \epsilon/2$ when $n \geq N_s,$ and pick $N_t$ such that $|t_n - s| < \epsilon/2$ when $n \geq N_t.$ Then, let $N = \max\{N_s, N_t\}.$ Then, when $n \geq N,$

$$ \begin{aligned}

 |(s_n + t_n) - (s + t) | & = | (s_n - s) + (t_n - t)| \\
                          & \leq |s_n - s| + |t_n - t| \\
                          & < \epsilon.
\end{aligned}
$$

For (b), If $c = 0,$ let $\epsilon > 0,$ and then $|c s_n - c s| = 0 < \epsilon.$ Otherwise,

Let $\epsilon / |c| > 0.$ For some $N,$ when $n \geq N,$ we have

$$ \begin{aligned}

|s_n - s| < \epsilon / |c| & \iff |c| |s_n - s| < \epsilon  \\
                     & \iff |cs_n - cs | < \epsilon.
\end{aligned}
$$

For (c), let $\epsilon > 0.$ For some $N,$ when $n \geq N,$ we have

$$ |(s_n + c) - (s + c)| = |s_n - s| < \epsilon. $$

For (d), first note the identity

$$ s_n t_n - st = (s_n - s)(t_n - t) + s(t_n - t) + t(s_n - s). \tag{1} $$

Now, let $\epsilon > 0.$ Pick $N_s$ such that $|s_n - s| < \sqrt{\epsilon}$ when $n \geq N_s,$ and pick $N_t$ such that $|t_n - s| < \sqrt{\epsilon}$ when $n \geq N_t.$ Then, let $N = \max\{N_s, N_t\}.$ Then, when $n \geq N,$

$$ |(s_n - s)(t_n - t)| < \epsilon, $$

which means

$$ \lim_{n \to \infty}(s_n - s)(t_n - t) = 0. $$

Applying this, along with the results of (a) and (b) to (1) gives:


$$ \begin{aligned}

\lim_{n \to \infty} (s_n t_n - st) & = \lim_{n \to \infty} ((s_n - s)(t_n - t) + s(t_n - t) + t(s_n - s)) \\
                                   & = \lim_{n \to \infty} (s(t_n - t) + t(s_n - s)) \\
                                   & = \lim_{n \to \infty} (s(t_n - t)) + \lim_{n \to \infty} (t(s_n - s)) \\
                                   & = s * 0 + t * 0 \\
                                   & = 0.
        

\end{aligned}
$$

For (e), pick $m$ such that when $n \geq m, |s_n - s| < \frac{1}{2}|s|,$ so we have that

$$ \begin{aligned}

|s_n - s| < \frac{1}{2}|s| & \iff |s_n| + |s| < \frac{1}{2}|s| \\
                           & \iff |s_n| < -\frac{1}{2}|s| \\
                           & \iff |s_n| > \frac{1}{2}|s| \\
                           & \iff \frac{1}{2 |s_n|}|s| < 1.

\end{aligned}
$$

Now, let $\epsilon > 0.$ For some integer $N > m,$ when $n \geq M,$ we have that

$$ |s_n - s | < \frac{1}{2}|s|^2 \epsilon. $$

Thus, when $n \geq N,$

$$ \begin{aligned}

\left | \frac{1}{s_n} - \frac{1}{s} \right | & = \left | \frac{s_n - s}{s_n s} \right | \\
                                             & = \frac{|s_n - s|}{|s_n s|} \\
                                             & < \frac{1}{2 |s_n||s|}|s|^2 \epsilon \\
                                             & = \frac{1}{2 |s_n|}|s| \epsilon \\
                                             & < \epsilon.
\end{aligned}
$$
::::
:::

:::theorem "A sequence in $R^k$ converges iff its components converge" {label: sequence-in-rk-converges-iff-its-components-converge}
(a) Suppose $\vec{x}_n \in R^k, (n = 1, 2, 3, \dots)$ and $\vec{x}_n = (\alpha_{1,n}, \dots, \alpha_{k,n}).$

Then, $\{\vec{x}_n\}$ @converges to $\vec{x} = (\alpha_1, \dots, \alpha_k)$ if and only if

$$ \lim_{n \to \infty} \alpha_{j,n} = \alpha_j, \quad (1 \leq j \leq k). $$

(b) Suppose $\{\vec{x}_n\}, \{\vec{y}_n\}$ are @sequences in $R^k,$ $\{\beta_n\}$ is a sequence of real numbers, and $\vec{x}_n \to \vec{x}, \vec{y}_n \to \vec{y}, \beta_n \to \beta.$ Then

$$ \lim_{n \to \infty} (\vec{x}_n + \vec{y}_n) = \vec{x} + \vec{y}, \quad \lim_{n \to \infty} \vec{x}_n \cdot \vec{y}_n = \vec{x} \cdot \vec{y}, \quad \lim_{n \to \infty} \beta_n \vec{x}_n = \beta \vec{x}. $$

::::proof
For (a), assume $\vec x_{n} \to \vec x.$ Then, from the definition of the @norm,

$$ |\alpha_{j,n} - \alpha_j | \leq |\vec{x}_n - \vec{x} |, $$

that is, the distance from $\alpha_{k,n}$ to $\alpha_{n}$ is always less than or equal to the distance from $\vec{x}_n$ to $\vec{x}.$ Therefore, for $\epsilon > 0,$ $|\vec{x}_n - \vec{x}| < \epsilon \implies |\alpha_{j,n} - \alpha_j| < \epsilon,$ and we can pick $n$ to make this true for as small of $\epsilon$ as we'd like. Therefore, $\lim_{n \to \infty} \alpha_{j, n} = \alpha_j.$

Conversely, assume $\lim_{n \to \infty} \alpha_{j, n} = \alpha_j.$ Let $\epsilon > 0.$ For some integer $N,$ when $n \geq N$ we have

$$ |\alpha_{j,n} - \alpha_{j}| \leq \frac{\epsilon}{\sqrt{k}}, \quad (1 \leq j \leq k). $$

Therefore, $n \geq N$ implies that

$$ |\vec{x_n} - \vec{x}| = \sqrt{\sum_{j=1}^k |\alpha_{j,n} - \alpha_j|^2} < \epsilon, $$

so $\vec{x}_n \to \vec{x}. $

Part (b) follows from part (a) and @sequence-in-rk-converges-iff-its-components-converge. 
::::
:::

# Subsequences

:::definition "Subsequence"
Given a @sequence $\{p_n\},$ consider a @sequence $\{n_k\}$ of positive integers, such that $n_1 < n_2 < n_3 < \cdots.$ Then the @sequence $\{p_{n_i}\}$ is called a **subsequence** of $\{p_n\}.$
:::

:::definition "Subsequential limit"
If a subsequence $\{p_{n_i}\}$ of $\{p_n\}$ @converges, its @limit is called a **subsequential limit** of $\{p_n\}.$
:::

:::theorem
A sequence $\{p_n\}$ converges to $p$ if and only if every subsequence of $\{p_n\}$ converges to $p.$

::::proof
Suppose that $\{p_n\}$ @converges to $p.$ Suppose some @subsequence $\{p_{n_i}\}$ converges to $q,$ and suppose, for contradiction, that $q \neq p.$ Now, following an argument similar to the @{proof that limits of sequences are unique|limits-of-sequences-are-unique}, we can see that if $p \neq q,$ arbitrary neighborhoods around both can't contain all but finitely many points, so we have a contradiction, and $p = q.$ 

Conversely, suppose every @subsequence of $\{p_n\}$ @converges to $p.$ Then, $\{p_n\}$ is a @subsequence of itself, so it @converges to $p.$
::::
:::

:::theorem {label: sequence-in-compact-metric-space-has-a-convergent-subsequence}
If $\{p_n\}$ is a @sequence in a @compact @metric-space $X,$ then some @subsequence of $\{p_n\}$ @converges to a point in $X.$
::::proof
Let $E$ be the range of $\{p_n\}.$ If $E$ is @finite, then at least one @point $p$ in $E$ must be repeated infinitely many times in $\{p_n\}.$ If we let $\{n_i\}$ be the indices of the occurrences of $p$ in $\{p_n\}:$

$$ p_{n_1} = p_{n_2} = \cdots = p, $$

then the @subsequence $\{p_{n_i}\}$ @converges to $p.$

On the other hand, if $E$ is @infinite, then @{$E$ has a limit point $p \in X$|infinite-subset-of-compact-set-has-limit-point}. Pick $n_1$ so that $d(p, p_{n_1} < 1.$ Now, after picking $n_1, \dots, n_{i -1},$ @{we can pick $n_i > n_{i-1}$ such that $d(p, p_{n_i}) < 1/i$|neighborhood-of-limit-point-contains-infinitely-many-points}, so $\{p_{n_i}\}$ @converges to $p.$
::::
:::

:::theorem "Bolzano-Weierstrass"
Every @bounded @sequence in $R^k$ contains a convergent @subsequence.

::::proof
Note that any @bounded @sequence $\{p_n\} \subset R^k$ is a @subset of some @closed @set, @bounded and @{thus compact|heine-borel} @k-cell in $R^k.$ Therefore, $\{p_n\}$ is a @sequence in a @compact @metric-space, and @{has a convergent subsequence|sequence-in-compact-metric-space-has-a-convergent-subsequence}.
::::
:::

:::theorem {label: subsequential-limits-of-a-metric-space-form-a-closed-set}
The @subsequential-limits of a @sequence $\{p_n\}$ in a @metric-space $X$ form a @closed @set @subset of $X.$

::::proof
Let $E^*$ be the @set of all @subsequential-limits of $\{p_n\}$ and let $q$ be a @limit-point of $E^*.$ We want to show that $q \in E^*.$

First, note that if the range of $\{p_n\}$ is just $\{q\},$ then $q$ is the only @subsequential-limit of $\{p_n\}.$ In this case, $E* = \{q\}$ is a singleton and is @closed @set, as it vacuously contains all of its @limit-points. So, assume this is not the case.

Choose $n_1$ so that $p_{n_1} \neq q,$ and let $\delta = d(q, p_{n_1}).$ Suppose $n_1, \dots, n_{i-1}$ are chosen. Since $q$ is a limit point of $E^*,$ there is an $x \in E^*$ with $d(q, x) < \frac{\delta}{2^i}.$ Since $x \in E^*$ and is thus the @limit of some @subsequence of $\{p_n\},$ there is an $n_i > n_{i-1}$ such that $d(x, p_{n_i}) < \frac{\delta}{2^i}.$ Now, via the triangle inequality,

$$ \begin{aligned} d(q, p_{n_i}) & \leq d(q, x) + d(x, p_{n_i}) \\
                                 & < \frac{\delta}{2^i} + \frac{\delta}{2^i} \\
                                 & = \frac{2\delta}{2^i} = \frac{\delta}{2^{i-1}}, \quad i = 1, 2, 3, \dots.
\end{aligned}
$$

This means that $\{p_{n_i}\}$ @converges to $q,$ because we can find a $p_{n_i}$ as close as desired to $q.$ Therefore $q$ is a @subsequential-limit of $\{p_n\}$ and so $q \in E^*,$ and $E^*$ is @closed.
::::
:::

:::note
The @{theorem above|subsequential-limits-of-a-metric-space-form-a-closed-set} tells us about the long term behavior of a @sequence, even if it doesn't @converge. The @set of all @subsequential-limits of $\{p_n\}$ gives us the set of all points that are approached arbitrarily closely infinitely often in $\{p_n\}.$ It's basically the set of points that $\{p_n\}$ likes to hang out around! $E^*$ being @closed means that if there is a point in $X$ that the points of $E^*$ get arbitrarily close to, then it is also a point $\{p_n\}$ likes to hang out around.
:::

# Cauchy Sequences

:::definition "Cauchy Sequence" {synonyms: Cauchy}
A @sequence $\{p_n\}$ in a @metric-space $X$ is said to be a **Cauchy sequence** if for every $\epsilon > 0$ there is an integer $N$ such that $d(p_n, p_m) < \epsilon$ is $n \geq N$ and $m \geq N.$
:::

:::definition "Diameter"
Let $E$ be a nonempty @subset of a @metric-space $X,$ and let $S$ be the @set of all @real-numbers of the form $d(p,q),$ with $p, q \in E.$ The @supremum of $S$ is called the **diameter** of $E.$
:::

:::theorem {label: limit-of-diameter-of-remaining-points-in-cauchy-sequence-is-zero}
if $\{p_n\}$ is a @sequence in $X$ and if $E_N$ consists of the @points $p_N, p_{N+1}, p_{N+2}, \dots,$ then $\{p_n\}$ is a @Cauchy-sequence if and only if

$$ \lim_{N \to \infty} \diam{E_N} = 0. $$

::::proof
Suppose $\{p_n\}$ is a @Cauchy-sequence. Then, let $\epsilon > 0.$ For some integer $N,$ $d(p_n, p_m) < \epsilon$ when $n, m \geq N.$ Therefore, $\diam{E_N} < \epsilon.$ Since $\epsilon$ was arbitrary, we can see that the sequence $\{\diam{E_N}\}$ converges to $0.$

Conversely, suppose $lim_{N \to \infty} \diam{E_N} = 0.$ Then, @{every neighborhood of $0$ contains $\{\diam{E_N}\}$ for all but finitely many N|sequence-converges-iff-neighborhood-contains-all-but-finitely-many-points}. Let $\epsilon > 0.$ Then, pick $N$ such that $\diam{E_n} < \epsilon.$ Letting $m, n \geq N,$ we have that $d(p_m, p_n) \leq \diam{E_n} < \epsilon.$
::::
:::

:::theorem {label: diameter-of-set-equals-diameter-of-closure}
If $\closure{E}$ is the @closure of a @set $E$ in a @metric-space $X,$ then

$$ \diam{\closure{E}} = \diam{E}. $$


::::proof
Because $E \subset \closure{E},$ $\diam{E} \leq \diam{\closure{E}}.$

Conversely, Let $p, q \in \closure{E},$ and $p', q' \in E,$ such that $d(p, p') < \epsilon, d(q, q') < \epsilon.$ Therefore, by the triangle inequality,

$$ \begin{aligned}

d(p,q) & \leq d(p, p') + d(p', q') + d(q', q) \\
       & < 2 \epsilon + d(p', q') \\
       & \leq 2 \epsilon + \diam{E}.

\end{aligned}
$$

Therefore, $\diam{\closure{E}} \leq 2 \epsilon + \diam{E},$ and since $\epsilon$ was arbitrary, $\diam{\closure{E}} = \diam{E}.$
::::
:::

:::theorem {label: nested-sequence-of-compact-sets-with-lim-diam-zero-has-singleton-intersection}
If $K_n$ is a @sequence of nonempty @compact @sets in $X$ such that $K_{n+1} \subset K_n, (n = 1, 2, 3, \dots)$ and if

$$ \lim_{n \to \infty} \diam K_n = 0, $$

then $\bigcap_{1}^\infty K_n$ consists of exactly one @point.

::::proof
Let $K = \bigcap_{1}^\infty K_n.$ Then $K$ @{is not empty|intersection-of-nonempty-nested-compact-sets-is-nonempty}. Assume for the sake of contradiction that $K$ contains more than one point. Then, $\diam{K} > 0.$ But, for each $n, K \subset K_n,$ so that $\diam{K_n} \geq \diam{K}.$ But, this contradicts our given that $\lim+{n \to \infty} \diam K_n = 0,$ so our assumption that $K$ contains more than one @point must be invalid, and thus $K$ contains exactly one point.
::::
:::

:::theorem {label: every-convergent-sequence-in-a-metric-space-is-a-cauchy-sequence}

Every convergent @sequence in a @metric-space $X$ is a @Cauchy-sequence.

::::proof
Suppose $\{p_n\}$ is a convergent @sequence in a @metric-space $X.$ Let $\epsilon > 0.$ Then for some $N, d(p, p_n) < \epsilon$ when $n \geq N.$ Thus,

$$ d(p_n, p_m) \leq d(p, p_n) + d(p, p_m) <  2 \epsilon $$

whenever $n, m \geq N,$ and so $\{p_n\}$ is @Cauchy.
::::
:::

:::definition "Complete"
A @metric-space in which every @cauchy-sequence @converges is said to be **complete**.
:::

:::theorem {label: compact-metric-spaces-are-complete}
@Compact @metric-spaces are @complete.

That is, if $X$ is a @compact @metric-space and if $\{p_n\}$ is a @cauchy-sequence in $X,$ then $\{p_n\}$ @converges to some point of $X.$
::::proof
Let $\{p_n\}$ be a @cauchy-sequence in the @compact @metric-space $X.$ For $N = 1, 2, 3, \dots,$ let $E_n$  bet the set consisting of $p_{N}, p_{N+1}, p_{N+2}, \dots.$ Then

$$ \lim_{N \to \infty}{\diam{\closure{E_N}}}= 0, $$

by @{two|limit-of-diameter-of-remaining-points-in-cauchy-sequence-is-zero} @{theorems|diameter-of-set-equals-diameter-of-closure} above. Each $\closure{E_n}$ is a @closed @subset of the @compact space $X,$ and @{is thus @compact|closed-subsets-of-compact-sets-are-compact}. Also, $E_{N+1} \subset E_{N},$ which @{implies that $\closure{E_{N+1}} \subset \closure{E_{N}}$|set-is-its-closure-iff-it-is-closed}. Now, we have that @{there is a unique $p \in X$ which lies in every $\closure{E_n}.$|nested-sequence-of-compact-sets-with-lim-diam-zero-has-singleton-intersection}

Let $\epsilon > 0.$ Since $\lim_{N \to \infty}{\diam{\closure{E_N}}}= 0,$ there is an integer $N_0$ such that $\diam{\closure{E_n}} < \epsilon$ if $N \geq N_0.$ Since $p \in \closure{E_n},$ we have that $d(p, q) < \epsilon$ for every $q \in \closure{E_N}$ and thus for every $q \in E_n.$ That is, $d(p, p_n) < \epsilon$ if $n \geq N_0,$ so $\{p_n\}$ converges to $p.$
::::
:::

:::theorem {label: euclidean-spaces-are-complete}
All Euclidean spaces are complete

That is, in $R^k,$ every @cauchy-sequence @converges.

::::proof
Let $\{\vec{x}_n\}$ be a @cauchy-sequence in $R^k.$ Define $E_N$ as in @{the proof above|proof-of-compact-metric-spaces-are-complete}, but with $\vec{x}_i$ in place of $p_i.$ For some $N, \diam{E_n} < 1.$ The @range-sequence of $\{\vec{x}_n\}$ is the union of $E_n$ and the @finite @set $\{\vec{x}_1, \dots, \vec{x}_{N-1}\}.$ Hence, $\{\vec{x}_n\}$ is @bounded-sequence (since the finite set of points can be contained in some bounding box, and the remaining points can be contained in some @ball with @diameter 1.) Since $\closure{\{\vec{x}_n\}}$ is @bounded, it is @compact, and thus $\{\vec{x}_n\}$ is a subset of a @compact @metric-space (its closure), and so @{converges|compact-metric-spaces-are-complete}.
::::
:::

:::theorem "Cauchy criterion for convergence" {label: cauchy-criterion-for-convergence}
A sequence @converges in $R^k$ if and only if it is a @cauchy-sequence.

::::proof
Suppose $\{p_n\} \subset R^k$ @converges. Then, because $R^k$ is a @metric-space, @{$\{p_n\}$ is @cauchy|every-convergent-sequence-in-a-metric-space-is-a-cauchy-sequence}.

Conversely, suppose $\{p_n\} \subset R^k$ is @cauchy. Then, @{$\{p_n\}$ converges|euclidean-spaces-are-complete}.
::::
:::

:::note
An important difference between the definition of a @convergent @sequence and a @cauchy-sequence is that the @limit is explicitly involved in the former, but not the latter. Thus, @{we may be able to decide|compact-metric-spaces-are-complete} whether or not a given @sequence @converges without knowledge of the @limit to which it may @converge.
:::

:::theorem
Every @closed @subset $E$ of a @complete @metric-space $X$ is @complete.

::::proof
Let $\{p_n\} \subset E$ be a @cauchy-sequence. Then, it converges to some point $p \in X,$ and actually $p \in E,$ because $E$ is @closed. Therefore, $E$ is @complete.
::::
:::

:::example
Not all @metric-spaces are @complete. For example, the space of all rationals with $d(x, y) = |x - y|$ is not @complete.
:::

For more content specifically on real sequences, see [[real-sequences]].
