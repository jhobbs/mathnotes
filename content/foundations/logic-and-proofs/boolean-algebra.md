---
layout: page
title: Boolean Algebra
---

# Boolean Algebra

## Inference Rules

**Modus Ponens:** $ P \rightarrow Q, P \vdash Q. $

**Modus Tollens:** $ P \rightarrow Q, \neg Q \vdash \neg P. $

**Or Introduction:** $ P \vdash (P \lor Q). $

**And Introduction:** $ P, Q \vdash (P \land Q). $

**And Elimination:** $ (P \land Q) \vdash P, Q. $

**Material Implication:** $(P \rightarrow Q) \vdash (\neg P \lor Q). $

## De Morgan's Laws

:::theorem {label: negation-of-disjunction-is-conjunction-of-negations}
The negation of a disjunction is the conjunction of negations.

::::proof
Let $A$ and $B$ be boolean variables. We want to show that 

$$ \neg (A \lor B) \leftrightarrow \neg A \land \neg B. $$

First, assume $\neg (A \lor B)$ is true. Then, $A \lor B$ is false. If $A$ were true, then we'd have a contradiction, and similarly with $B,$ so both $A$ and $B$ must be false, that is, $\neg A$ and $\neg B$ most both be true, and $\neg (A \lor B) \rightarrow \neg A \land \neg B.$

Now, assume $\neg A \land \neg B.$ Here, both $\neg A$ and $\neg B$ must be true, so both $A$ and $B$ must be false. Therefore, $A \lor B$ is false, so $\neg A \land \neg B \rightarrow \neg (A \lor B)$ and we have shown $\neg (A \lor B) \leftrightarrow \neg A \land \neg B.$

::::

:::

:::theorem {label: negation-of-conjunction-is-disjunction-of-negations}

The negation of a conjunction is the disjunction of negations.
::::proof

Let $A$ and $B$ be boolean variables. We want to show that

$$ \neg (A \land B) \leftrightarrow \neg A \lor \neg B. $$

First, assume $\neg (A \land B)$ is true. Then, both $A \land B$ must be false, so either $A$ must be false or $B$ must be false, or both must be false. If $A$ is false, then $\neg A$ is true, and so is $\neg A \lor \neg B.$ The same is true if $B$ is false, so $\neg (A \land B) \rightarrow \neg A \lor \neg B.$

Now, assume $\neg A \lor \neg B$ is true. Then, either $\neg A$ or $\neg B$ must be true, so either $A$ or $B$ or both must be false. Now, if $A$ is false, then $A \land B$ is false. The same holds if $B$ is false, and thus $\neg (A \land B)$ is true. Therefore $\neg A \lor \neg B \rightarrow \neg (A \land B)$ and we have shown $ \neg (A \land B) \leftrightarrow \neg A \lor \neg B. $
::::


:::
