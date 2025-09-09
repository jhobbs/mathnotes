---
title: "Block References Test"
description: "Test file for cross-referencing structured blocks feature"
---

# Block References Test

This file tests the new cross-reference feature for structured mathematical blocks.

## Basic Definitions

:::definition "Continuous Function" {label: continuity}
A function $f: \mathbb{R} \to \mathbb{R}$ is continuous at a point $x_0$ if for every $\epsilon > 0$, there exists a $\delta > 0$ such that for all $x$ with $|x - x_0| < \delta$, we have $|f(x) - f(x_0)| < \epsilon$.
:::

:::definition "Limit" {label: limit-def}
We say that $\lim_{x \to a} f(x) = L$ if for every $\epsilon > 0$, there exists a $\delta > 0$ such that whenever $0 < |x - a| < \delta$, we have $|f(x) - L| < \epsilon$.
:::

## Main Results

:::theorem "Fundamental Theorem of Calculus" {label: ftc}
Let $f$ be continuous on $[a,b]$. Then:

1. If $F(x) = \int_a^x f(t) dt$, then $F'(x) = f(x)$ for all $x \in (a,b)$.
2. $\int_a^b f(x) dx = F(b) - F(a)$ for any antiderivative $F$ of $f$.
:::

:::lemma "Intermediate Value Theorem" {label: ivt}
If $f$ is continuous on $[a,b]$ and $k$ is between $f(a)$ and $f(b)$, then there exists $c \in (a,b)$ such that $f(c) = k$.
:::

## Testing Cross-References

### Basic References

Now we can reference these results using the @ syntax:

- The concept of @continuity is fundamental to analysis.
- According to @ftc, differentiation and integration are inverse operations.
- We can use @ivt to prove the existence of roots.
- The formal definition of a limit is given in @limit-def.

### Type-Specific References

We can also use type-specific references:

- @definition:continuity provides the formal definition of continuity.
- @theorem:ftc is one of the most important results in calculus.
- @lemma:ivt helps us prove existence theorems.

### Custom Link Text

You can control the link text using the `@[text](label)` syntax:

- @[the definition of continuity](continuity) is fundamental to analysis.
- @[FTC](ftc) states that differentiation and integration are inverses.
- @[this useful lemma](lemma:ivt) helps prove existence of roots.
- The @[epsilon-delta definition](definition:limit-def) formalizes the notion of limits.
- @[The main theorem](theorem:ftc) has two parts.
- Sometimes we just need a @[quick reference](ivt) to a result.

### Testing Error Cases

These should show as broken references:

- @nonexistent should show as an error.
- @theorem:missing should also show as an error.
- This email@address.com should not be treated as a reference.
- @[broken custom link](nonexistent) should show an error.
- @[typed broken link](theorem:missing) should also error.

## Nested Blocks Example

:::theorem "Advanced Result" {label: advanced}
This theorem has a nested proof.

::::proof
The proof uses @continuity and relies on @ivt.

We first note that by @definition:limit-def, we need to establish the existence of appropriate bounds.

The result follows directly from @ftc.

We can also use custom link text: @[the continuity assumption](continuity) is crucial, and @[our main result](ftc) completes the proof.
::::
:::

## References to Nested Content

The proof in @advanced demonstrates how references work within nested blocks.

## Testing Blocks Without Titles

:::theorem {label: no-title-theorem}
This theorem has no title, just a label.
:::

:::definition {label: no-title-def}
This definition also has no title.
:::

:::theorem {label: math-theorem}
If $f$ is continuous on $[a,b]$ and $g$ is differentiable, then the composite function has interesting properties.
:::

:::definition "Open Set"
A set $U$ is open if every point in $U$ has a neighborhood contained in $U$.
:::

:::definition "Closed Set"
A set $F$ is closed if its complement is open.
:::

:::definition "Complex Number, Real Part"
A complex number has a real and imaginary part.
:::

References to blocks without titles:
- @no-title-theorem should show just the label
- @no-title-def should also show just the label
- @theorem:no-title-theorem with type specified
- @math-theorem shows theorem with math replaced

## Testing Auto-Generated Labels

References to definitions with auto-generated labels:
- @open-set should link to the "Open Set" definition
- @closed @set should link to the "Closed Set" definition  
- @complex-number-real-part should link to the complex number definition

## End of Test

This completes the basic test of the block reference system.