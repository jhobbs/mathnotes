---
title: Structured Mathematical Content Test
description: Test page demonstrating the new structured mathematical content system
slug: structured-math-test
---

# Structured Mathematical Content Test

This page demonstrates the new structured mathematical content system with explicit boundaries for theorems, definitions, proofs, and other mathematical elements.

## Basic Definition

Here's a simple definition using the new syntax:

:::definition "Continuous Function"
A function $f: \mathbb{R} \to \mathbb{R}$ is **continuous** at a point $x_0$ if for every $\epsilon > 0$, there exists a $\delta > 0$ such that whenever $|x - x_0| < \delta$, we have $|f(x) - f(x_0)| < \epsilon$.
:::

## Theorem with Proof

Now let's see a theorem followed by its proof:

:::theorem "Intermediate Value Theorem" {label: ivt}
Let $f: [a,b] \to \mathbb{R}$ be a continuous function. If $y$ is any value between $f(a)$ and $f(b)$, then there exists at least one $c \in [a,b]$ such that $f(c) = y$.
:::

:::proof
Without loss of generality, assume $f(a) < y < f(b)$. Define the set:
$$S = \{x \in [a,b] : f(x) < y\}$$

Since $a \in S$, the set $S$ is non-empty. Since $S$ is bounded above by $b$, it has a supremum. Let $c = \sup S$.

We claim that $f(c) = y$. By continuity and the definition of supremum, we can show:

- If $f(c) < y$, then $c$ is not the supremum (contradiction)
- If $f(c) > y$, then there's a smaller upper bound (contradiction)

Therefore, $f(c) = y$.
:::

## Lemma and Corollary

:::lemma "Cauchy's Lemma"
If $f$ is differentiable on $(a,b)$ and continuous on $[a,b]$, then for any $k$ between $f'(a^+)$ and $f'(b^-)$, there exists $c \in (a,b)$ such that $f'(c) = k$.
:::

:::corollary
Every continuous function on a closed interval attains its maximum and minimum values.
:::

## Examples and Remarks

:::example
Consider the function $f(x) = x^2$ on the interval $[-1, 2]$.

By the Intermediate Value Theorem, since $f(-1) = 1$ and $f(2) = 4$, for any value $y \in [1, 4]$, there exists $c \in [-1, 2]$ such that $f(c) = y$.

For instance, if $y = 2$, then $c = \sqrt{2} \approx 1.414$.
:::

:::remark
The continuity requirement in the Intermediate Value Theorem is essential. Consider the function:

$$f(x) = \begin{cases}
x & \text{if } x < 0 \\
x + 1 & \text{if } x \geq 0
\end{cases}$$

This function has a jump discontinuity at $x = 0$ and fails to satisfy the IVT.

:::

## Advanced Features

### Intuition Section

:::intuition
Think of the Intermediate Value Theorem geometrically: if you draw a continuous curve from one point to another without lifting your pencil, you must cross every horizontal line between the starting and ending heights.
:::

### Exercise with Solution

:::exercise
Prove that the equation $x^3 + x - 1 = 0$ has exactly one real solution.
:::

:::solution
Let $f(x) = x^3 + x - 1$. Note that:
- $f(0) = -1 < 0$
- $f(1) = 1 > 0$

By the IVT, there exists at least one $c \in (0,1)$ such that $f(c) = 0$.

For uniqueness, observe that $f'(x) = 3x^2 + 1 > 0$ for all $x$, so $f$ is strictly increasing. A strictly increasing function can have at most one zero.

Therefore, the equation has exactly one real solution.
:::

## Nested Structures

Here's a proposition with a more complex structure:

:::proposition "Bolzano-Weierstrass Theorem"
Every bounded sequence in $\mathbb{R}^n$ has a convergent subsequence.
:::

:::note
This theorem is fundamental in analysis and has many important applications, including:
- Proving the existence of limits
- Establishing compactness criteria
- Deriving the Heine-Borel theorem
:::

## Edge Cases

### Definition without title
:::definition
A set $S$ is **compact** if every open cover has a finite subcover.
:::

### Inline math in titles
:::theorem "$\epsilon$-$\delta$ Characterization"
The limit $\lim_{x \to a} f(x) = L$ if and only if for every $\epsilon > 0$, there exists $\delta > 0$ such that $0 < |x - a| < \delta$ implies $|f(x) - L| < \epsilon$.
:::

### Multiple paragraphs in proof
:::proof
First, we establish the forward direction. Assume $\lim_{x \to a} f(x) = L$.

By definition of limit, for any $\epsilon > 0$, we can find $\delta > 0$ such that whenever $x$ is within $\delta$ of $a$ (but not equal to $a$), $f(x)$ is within $\epsilon$ of $L$.

For the reverse direction, suppose the $\epsilon$-$\delta$ condition holds.

Then by the definition of limit, we have $\lim_{x \to a} f(x) = L$.
:::

## Regular Content

This is regular markdown content that should not be affected by the structured math system. We can still use inline math like $e^{i\pi} + 1 = 0$ and display math:

$$\int_0^1 x^2 dx = \frac{1}{3}$$

The structured blocks should integrate seamlessly with the existing content.

## Complex Markdown in Blocks

Let's test more complex markdown features inside structured blocks:

:::theorem "Markdown Features Test"
This theorem demonstrates various markdown features:

1. **Numbered lists** with *emphasis*
2. Code blocks:
   ```python
   def factorial(n):
       if n == 0:
           return 1
       return n * factorial(n-1)
   ```
3. [Links to other content]([[groups]])
4. Tables:
   
   | Function | Domain | Range |
   |----------|---------|--------|
   | $\sin(x)$ | $\mathbb{R}$ | $[-1, 1]$ |
   | $\cos(x)$ | $\mathbb{R}$ | $[-1, 1]$ |
   | $\tan(x)$ | $\mathbb{R} \setminus \{\frac{\pi}{2} + n\pi\}$ | $\mathbb{R}$ |

5. Block quotes:
   > Mathematics is the language with which God has written the universe.
   > — Galileo Galilei

6. Nested lists:
   - Main point
     - Sub-point 1
     - Sub-point 2
       - Even deeper
   - Another main point
:::

:::proof
We can prove this theorem using multiple techniques:

**Method 1**: Direct proof
- Start with the hypothesis
- Apply logical deductions
- Reach the conclusion

**Method 2**: Proof by contradiction
1. Assume the negation
2. Derive a contradiction
3. Therefore, the original statement must be true

The proof uses the following *key insight*: all markdown features work correctly within structured blocks, including `inline code`, **bold text**, and *italic text*.

Consider the equation: $E = mc^2$

This completes our demonstration.
:::
