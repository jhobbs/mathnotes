---
layout: page
title: Groups
---

# Groups

## Definition

A group, is a set $G$ together with a binary operation $\*$ such that:

**Closure**: The set is closed under the binary operation. For all $a, b \in G, a \* b \in G$.

**Associativity**: The binary operation is associative on the set. For all $a, b, c \in G, (a \* b) \* c = a \* (b \* c)$.

**Identity**: The set contains an identity element, denoted $e$. For all $a \in G, a \* e = a$.

**Inverses**: All elements in the set have inverse elements in the set, denoted using $a^{-1}$. For all $a \in G$ there exists $a^{-1} \in G$ such that $a \* a^{-1} = e$.

This set/operation combination $G$ is commonly denoted as the pair $(G, \*)$.

## Examples

Some examples of groups:

* The integers under addition: $(\mathbb{Z}, +)$. The identity element is $0$.

* The non-zero reals under multiplication: $(\mathbb{R}^{\*}, \*)$. The identity element is $1$.

* $n ~ x ~  n$ invertible matrices.

[Loads more listed here](https://en.wikipedia.org/wiki/Examples_of_groups).

A non-example is the naturals under addition - $(\mathbb{N}, +)$. The naturals are closed under addition, but there is no identity element since $0$ isn't included, and thus no inverses either.

## Abelian Groups

Abelian groups are groups whose operation is commutative. For $a,b \in G, a \* b = b \* g$.

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

We use angle brackets to denote an element as a generator. For example, $\langle 1 \rangle$ is a generator of $(\mathbb{N}, +)$, because every integer can be written as $n1$ for some $n \in \mathbb{Z}$.

The **order** of a finite group is the number of its elements. The order of group $G$ is denoted as $\\text{ord}{(G)}$ or $\|G\|$. The order of an element $a$ (also called period length or period) is the number of elements in the subgroup generated by $a$, and is denoted by $\text{ord}{(a)}$ or $\|a\|$.

### Cyclic Subgroups

Any subgroup of a cyclic group is also cyclic - a cyclic subgroup.

**Theorem**: Let $G = \langle a \rangle$ be a cyclic group with $n$ elements. Let $b \in G$ and $b = a^s$. Then $b$ generates a cyclic subgroup of $G$ containing $\frac{n}{d}$ elements, where $d = \gcd(s, n)$. Two cyclic subgroups $\langle a^s \rangle$ and $\langle a^t \rangle$ are equal if and only if $\gcd(s,n) = \gcd(t, n)$.

Suppose $g \in G$ with $\text{ord}(g) = n$ and let $m \in \mathbb{N}$. Then, $\langle g^m \rangle = \langle g^{\gcd{(m,n)}} \rangle$.

So, $ \langle g \rangle = \langle g^m \rangle \iff \gcd{(m,n)} = 1$.

Every element of a cyclic finite group will generate a cyclic subgroup. Some of these subgroups will be equivalent to others - we denote each subgroup $\langle g^s \rangle$, where $s$ is the smallest natural number that generates the subgroup.

To find the subgroups of a cyclic group, we follow this algorithm, keeping track of which elements we've found the generated subgroup for.

1. Some element $g$ will generator the entire group. If the group's order is $n$, then any element of the form $g^s$ where $s$ and $n$ are relatively prime will also generate the entire group, so note that we'v found the generated subgroup for all of those elements.

2. Starting with the next $g^s$ not covered already, find the subgroup generated by it - all elements of $G$ of the form $(g^s)^k$. Note the order of this subgroup and call it $t$. Any elements of $G$ of the form $r \dot g^s$ where $r$ is relatively prime with $t$ will generate the same subgroup. Note that we've found the generated subgroup for all of those elements.

3. Repeat step 2 until we've found the subgroup generated by all elements.

This sounds really abstract, so here's an example of finding all of the subgroups of $(Z_{20}, +_{20})$

![Cyclic Subgroups of $Z_20$](subgroupsofZ_20.png)

The diagram in this image is called a subgroup diagram or subgroup lattice. It represents containment - so a node being higher on the digram indicates than any nodes below it are subsets of it.