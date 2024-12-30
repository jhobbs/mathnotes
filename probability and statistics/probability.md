---
layout: page
title: Probability Basics
---

# Probability Basics

The probability of $A$ or $B$ is the probability of $A$ plus the probability of $B$ minus the probability of A and B occurring together:

$$ P(A ~ \text{or} ~ B) = P(A) + P(B) - P(A ~ \text{and} ~ B) $$

We have to subtract the overlap between $A$ and $B$ to avoid double counting.

The probability of $A$ and $B$ is the probability of $A$ times the probability of $B$ given $A$, or equivalently, the probability of $B$ times the probability of $A$ given $B$.

$$ P(A ~ \text{and} ~ B) = P(B ~ \text{and} ~ B) = P(A) \cdot P(B|A) = P(B) \cdot P(A|B)  $$

If $A$ and $B$ are independent, this reduces to $P(A) \cdot P(B)$.

From this, we can give the formula for conditional probability. The probability of $A$ given $B$ is

$$ P(A|B) = \frac{P(A ~\text{and} ~ B)}{P(B)}. $$

That is to say, the probability of $A$ occurring given $B$ has occurred is the portion of times $B$ occurs that $A$ also occurs.

If $P(A) = P(A\|B)$, then $A$ and $B$ are independent events, and $P(A) \cdot P(B) = P(A ~ \text{and} ~ B).$
