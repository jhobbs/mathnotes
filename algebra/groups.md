---
layout: page
title: Groups
---

# Groups

## Definition

A group, is a set $G$ together with a binary operation $\*$ such that:

**Closure**: The set is closed under the binary operation. For all $a, b \in G, a \* b \in G$.

**Associativity**: The binary operation is associative on the set. For all $a, b, c \in G, (a * b) * c = a * (b * c)$.

**Identity**: The set contains an identity element, denoted $e$. For all $a \in G, a * e = a$.

**Inverses**: All elements in the set have inverse elements in the set, denoted using $a^{-1}$. For all $a \in G$ there exists $a^{-1} \in G$ such that $a * a^{-1} = e$.

This set/operation combination $G$ is commonly denoted as the pair $(G, \*)$.

## Examples

Some examples of groups:

* The integers under addition: $(\mathbb{Z}, +)$. The identity element is $0$.

* The non-zero reals under multiplication: $(\mathbb{R}^*, *)$. The identity element is $1$.

* $n ~ x ~  n$ invertible matrices.

[Loads more listed here](https://en.wikipedia.org/wiki/Examples_of_groups).

A non-example is the naturals under addition - $(\mathbb{N}, +)$. The naturals are closed under addition, but there is no identity element since $0$ isn't included, and thus no inverses either.

## Abelian Groups

Abelian groups are groups whose operation is commutative. For $a,b \in G, a * b = b * g$.

The integers under addition are Abelian, because $a + b = b + a$, but invertible $n ~ x ~ n$ matrices are not, because it's not necessary that $AB = BA$.

## Finite Groups

The examples given so far are all infinite groups, but finite groups also exist.

For example, $(Z_4, +_4)$ i.e. $\\{0, 1, 2, 3\\}$ together with addition mod $4$ is a finite group.
