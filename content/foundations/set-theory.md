---
layout: page
title: Set Theory
---

# Set Theory

:::definition "Set" {synonyms: collection, family}
A **set** is a collection of objects, considered as a whole.
:::

:::definition "Element" {synonyms: member}
The objects that make up a @set are called its **elements** or its **members.**
:::

:::definition "Membership criterion"
The **membership criterion** for a @set $X$ is a statement of the form $x \in X \iff P(x),$ where $P(x)$ is a proposition that is true for precisely for those objects $x$ that are @elements of $X,$ and no others.
:::

:::axiom "Axiom of Extensionality" {label: axiom-of-extensionality}
Two @sets are equal if and only if they have the same @elements. Formally, for any sets $A$ and $B$:

$$A = B \iff (\forall x)(x \in A \iff x \in B)$$
:::

:::definition "subset"
If $X$ and $Y$ are @sets such that every element of $X$ is also an element of $Y,$ then we say $X$ is a **subset** of $Y,$ denoted as $X \subset Y.$ Formally,


$$X \subset Y \iff (\forall x)(x \in X \implies x \in Y)$$
:::

:::definition "superset"
If $X$ and $Y$ are @sets such that every element of $Y$ is also an element of $X,$ then we say $X$ is a **superset** of $Y,$ denoted as $X \supset Y.$ This is the same as $Y \subset X.$
:::

:::theorem {label: set-equality-via-subset-inclusion}
Two sets $X$ and $Y$ are equal if and only if $X$ is a subset of $Y$ and $Y$ is a subset of $X.$

::::proof
Suppose $X$ and $Y$ are sets with $X \subset Y$ and $Y \subset X.$ Now, suppose $x \in X.$ Then, $x \in Y.$ Conversely, suppose $y \in Y.$ Then $y \in X.$ Thus, $(\forall x)(x \in X \iff x \in Y),$ and @{$X = Y$|axiom-of-extensionality}.
::::
:::

:::definition "Function" {synonyms: mapping}
Consider two @sets, $A$ and $B,$ whose @elements may be any objects whatsoever, and suppose that with each @element $x$ of $A$ there is associated, in some manner, any @element of $B,$ which we denote by $f(x).$ Then $f$ is said to be a **function** from $A$ to $B.$
:::

:::definition "Domain"
If $f$ is a @function from the @set $A$ to the @set $B,$ the @set $A$ is called the **domain** of $f.$
:::

:::definition "Value"
If $f$ is a @function from the @set $A$ to the @set $B,$ the @elements $f(x) \in B$ are called the **values** of $f.$
:::

:::definition "Range"
The @set of all @values of a @function $f$ is called the **range** of $f.$
:::

:::definition "Sequence"
A **sequence** is a @function $f$ defined on the @set $J$ of all positive integers.
:::
:::note {label: sequence-notation}
If $f(n) = x_n,$ for $n \in J,$ it is customary to denote the @sequence $f$ by the symbol $\{x_n\},$ or sometimes by $x_1, x_2, x_3, \dots.$
:::

:::definition "Term"
If $f$ is a @sequence denoted as $\{x_n\},$ the @values of $f,$ that is, the @elements $x_n,$ are called the **terms** of the @sequence.
:::

:::note {label: sequence-terms-not-distinct}
The @terms of a @sequence need not be distinct.
:::

## De Morgan's Laws

:::theorem {label: complement-of-union-is-intersection-of-complements}
The complement of a union is equal to the intersection of complements.

::::proof
Let $A$ and $B$ be sets. We want to show that

$$ (A \cup B)^c = A^c \cap B^c. $$

Suppose $x \in (A \cup B)^c.$ Then, if $x \in A$ or $x \in B,$ then $x \in A \cup B$ and $x \notin (A \cup B)^c,$ a contradiction. Therefore, $x \notin A$ and $x \notin B.$ That is, $x \in A^c$ and $x \in B^c,$ therefore $x \in A^c \cap B^c.$
::::
:::

:::theorem {label: complement-of-intersection-is-union-of-complements}
The complement of an intersection is equal to the union of complements.

::::proof
Let $A$ and $B$ be sets. We want to show that

$$ (A \cap B)^c = A^c \cup B^c. $$

Suppose $x \in (A \cap B)^c.$ Then, $x$ is not in $A \cap B,$ that is, $x$ is either not in $A$ or it is not in $B$ or it is in neither. If $x$ is not in $A,$ then it is in $A^c,$ and therefore it is in $A^c \cup B^c.$ The same approach works with $B,$ and therefore $x \in  A^c \cup B^c,$ and we have shown $(A \cap B)^c = A^c \cup B^c.$
::::
:::
