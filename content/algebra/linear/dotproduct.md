---
description: Definition and properties of the dot product in Rⁿ, including geometric
  interpretation as angle measurement and its relationship to vector projection.
layout: page
title: Dot Product
---

# Dot Product

## Definition of Dot Product

Given two vectors in $R^2$, define their dot product as:

$$ \vec{x} \cdot \vec{y} = (x_1, y_1) \cdot (x_2, y_2) = x_1 x_2 + y_1 y_2 $$

Given two vectors in $R^n$, define their dot product as:

$$ \vec{x} \cdot \vec{y} = (x_1, x_2, \cdots, x_n) \cdots (y_1, y_2, \cdots, y_n)  = x_1 y_1 + x_2 y_2 + \cdots + x_n y_n $$

One geometric interpretation of the dot product of $\vec{u}$ and $\vec{v}$ is that it's the [[component|projection]] of $\vec{u}$ in the direction of $\vec{v}$ times the magnitude of $\vec{v}$. Thus, one $\vec{u}$ and $\vec{v}$ are pointing in generally the same direction it's positive, in generally opposite directions it's negative, and when they're perpindicular (orthogonal) it is $0$.

Indeed, the cosine of the angle between two unit vectors is the the dot product between them, and in general, the cosine of the angle $\theta$ between two vectors $\vec{u}$ and $\vec{v}$ is the dot product of the unit vectors in their respective directions:

$$ \cos{\theta} =  \frac{\vec{u}}{||\vec{u}||} \cdot \frac{\vec{v}}{||\vec{v}||} = \frac{\vec{u} \cdot \vec{v}}{||\vec{u}|| ~ ||\vec{v}||} $$ 


$$ \vec{u} \cdot \vec{v} = ||\vec{u}|| ||\vec{v}|| \cos{\theta} $$

## Properties of Dot Product

For these properties, let $x, y, z \in \mathbb{R}^n$ and $c \in \mathbb{R}.$

$$ \vec{x} \cdot \vec{y} = \vec{y} \cdot \vec{x} ~ \forall x, y \in \mathbb{R}^n \quad \text{(Commutative Property)} $$

$$ \vec{x} \cdot \vec{x} = {|| \vec{x} ||}^2 \geq 0, \quad \vec{x} \cdot \vec{x} = 0 ~ \text{iff} ~ \vec{x} = 0 \quad \text{(Property of Magnitude)} $$ 

$$ c(\vec{x} \cdot \vec{y}) = (c\vec{x}) \cdot \vec{y} = (c\vec{y}) \cdot \vec{x}  \quad \text{(Associative Property)} $$

$$ \vec{x} \cdot (\vec{y} + \vec{z}) = \vec{x} \cdot \vec{y} + \vec{x} \cdot \vec{z} \quad \text{(Distributive Property over Addition)} $$