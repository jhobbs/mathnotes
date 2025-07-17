---
layout: page
title: Probability Basics
description: Foundational concepts including sample spaces, events, probability rules, conditional probability, and independence using set theory operations.
---

# Probability Basics

## Sample Space

The set of all possible outcomes of a statistical experiment is called the **sample space** and is represented by the symbol $S$. Each outcome in a sample space is called an **element** or **member** of the sample space or simply a **sample point.**

For example, the sample space representing the outcomes of the roles of a standard six-sided die is

$$ S = \{1, 2, 3, 4, 5, 6\}. $$

An **event** is a subset of a sample space. For example, we can say the event $A$ that the roll of a die is odd is $A = \{1,3,5\}.$, the event $B$ that the roll of a die is even is $B = \{2,4,6\}$, and that the event that the roll of a die is less than or equal to 4 is $C = \{1,2,3,4\}.$

A lot of the rest of basic probability is just set theory from there:

* The event the the roll of a die is not less than or equal to 4 is the complement of $C$, written as $C' = \{5,6\}$.

* The event that the roll is both even and less than or equal to 4 is the intersection of $A$ and $C$, written as $A \cap C = \{2,4\}.$

* The event that the roll is either even or less than or equal to 4 is the union of $A$ and $C$, written as $A \cup C = \{1,2,3,4,6\}.$

We can also have continuous sample spaces. For example, if we were to randomly choose a number between 0 and 1 inclusive, the sample space would be $S = [0, 1]$, and the event that the outcome is a number whose decimal digits are only 2s would be $\{0.2, 0.22, 0.222, \dots \}.$

## Probability
*Note: This applies to sample spaces of discrete events and is a bit hand wavy.*

We can assign a probability or weight to each sample point in a sample space by giving it a value ranging from 0 to 1. Events that are more likely to occur have a probability closer to 1, and events that are less likely to occur have a probability closer to 0. We give a probability to all events in a sample space such that the sum of the probabilities of all events in a sample space is 1.

Then, the **probability** of an event A is the sum of the probabilities of all sample points in $A.$ Therefore,

$$ 0 \leq P(A) \leq 1, \quad P(\emptyset) = 0, \quad P(S) = 1. $$


## Probability Rules

The probability of $A$ or $B$ is the probability of $A$ plus the probability of $B$ minus the probability of A and B occurring together:

$$ P(A \cup B) = P(A ~ \text{or} ~ B) = P(A) + P(B) - P(A ~ \text{and} ~ B) $$

If $A$ and $B$ are mutually exclusive events, $P(A \cup B)= P(A) + P(B).$ 

We have to subtract the overlap between $A$ and $B$ to avoid double counting.

Similarly

$$ P(A \cap B) = P(A) + P(B) - P(A \cup B). $$

The probability of $A$ and $B$ is the probability of $A$ times the probability of $B$ given $A$, or equivalently, the probability of $B$ times the probability of $A$ given $B$.

$$ P(A \cap B) = P(A ~ \text{and} ~ B) = P(B ~ \text{and} ~ A) = P(A) \cdot P(B|A) = P(B) \cdot P(A|B)  $$

If $A$ and $B$ are independent, this reduces to $P(A) \cdot P(B)$.

From this, we can give the formula for conditional probability. The probability of $A$ given $B$ is

$$ P(A|B) = \frac{P(A ~\text{and} ~ B)}{P(B)}. $$

That is to say, the probability of $A$ occurring given $B$ has occurred is the portion of times $B$ occurs that $A$ also occurs.

If $P(A) = P(A|B)$, then $A$ and $B$ are independent events, and $P(A) \cdot P(B) = P(A ~ \text{and} ~ B).$
