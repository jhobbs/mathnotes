---
layout: page
title: Set Theory
---

# Set Theory


## De Morgan's Laws

:::theorem {complement-of-union-is-intersection-of-complements}
The complement of a union is equal to the intersection of complements.

::::proof
Let $A$ and $B$ be sets. We want to show that

$$ (A \cup B)^c = A^c \cap B^c. $$

Suppose $x \in (A \cup B)^c.$ Then, if $x \in A$ or $x \in B,$ then $x \in A \cup B$ and $x \notin (A \cup B)^c,$ a contradiction. Therefore, $x \notin A$ and $x \notin B.$ That is, $x \in A^c$ and $x \in B^c,$ therefore $x \in A^c \cap B^c.$
::::
:::

:::theorem {complement-of-interesection-is-union-of-complements}
The complement of an intersection is equal to the union of complements.

::::proof
Let $A$ and $B$ be sets. We want to show that

$$ (A \cap B)^c = A^c \cup B^c. $$

Suppose $x \in (A \cap B)^c.$ Then, $x$ is not in $A \cap B,$ that is, $x$ is either not in $A$ or it is not in $B$ or it is in neither. If $x$ is not in $A,$ then it is in $A^c,$ and therefore it is in $A^c \cup B^c.$ The same approach works with $B,$ and therefore $x \in  A^c \cup B^c,$ and we have shown $(A \cap B)^c = A^c \cup B^c.$
::::

:::
