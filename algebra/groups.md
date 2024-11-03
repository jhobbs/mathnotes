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

## Subgroups

A subgroup $H$ of a group $G$ is a subset of $G$ group together with the same operation as $G$ that still forms a group. The identity element of $G$ must also be the identity element of $H$.

For example, the even integers under addition, $(2\mathbb{Z}, +)$, are a subgroup of the integers under addition.

## Cyclic Groups

A **cyclic group** is a group where there exists some $g \in G$ such that every element in $G$ can be generated from the group operation applied to $g$.

That is, $G = \\{g^N \| n \in \mathbb{Z}\\}$ when we think of the operation as multiplication, or $G = \\{ng \| n \in \mathbb{Z}\\}$ when we think of the operation as addition.

We use angle brackets to denote an element as a generator. For example, $<1>$ is a generator of $(\mathbb{N}, +)$, because every integer can be written as $n1$ for some $n \in \mathbb{Z}$.

Suppose $g \in G$ with $\text{ord}(g) = n$ and let $m \in \mathbb{N}$. Then, $<g^m> = <g^{\gcd{(m,n)}}>$.

So, $ \<g\> = \<g^m\> \iff \gcd{(m,n)} = 1$.
