---
description: Sequences and Series in Euclidean and Metric Spaces
layout: page
title: Sequences and Series
---

# Sequences

Review the definition of a sequence

@embed{sequence}

:::definition "Converge"
A sequence $\{p_n\}$ in a @metric-space $X$ is said to **converge** if there is a point $p \in X$ with the following property: For every $\epsilon > 0,$ there is an integer $N$ such that $n \geq N$ implies that $d(p_n, p) < \epsilon.$ 
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

:::theorem
(a) If $\{p_n\}$ is a @sequence in a @compact @metric-space $X,$ then some @subsequence of $\{p_n\}$ @converges to a point in $X.$

(b) Every @bounded @sequence in $R^k$ contains a convergent @subsequence.
:::
