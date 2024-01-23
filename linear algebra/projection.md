---
layout: page
title: Projection
---

# Projection

## Definition of Projection

Take two vectors in $R^n$, $\vec{u}$ and $\vec{v}$.

The **projection** of $\vec{u}$ onto $\vec{v}$ is the vector paralell to $\vec{v}$ that's magnitude is component of $\vec{u}$ in the direction of $\vec{v}$.

One way to visualize this is to shine a flashlight from a direction perpendicular to $\vec{v}$, with $\vec{u}$ between the flashlight and $\vec{v}$ (pretend the vectors are opaque). The shadow the flashlight casts onto $\vec{v}$ will be the projection of $\vec{u}$ onto $\vec{v}$.

The notation and formula for projection of $\vec{u}$ onto $\vec{v}$ is:

$$ \text{proj}_{\vec{v}} \vec{u} = \frac{\vec{u} \cdot \vec{v}}{|| \vec{v} ||^2} \vec{v} $$

## Component

The length of the projection of $\vec{u}$ in the direction of $\vec{v}$ is called the **component** of $\vec{u}$ in the direction of $\vec{v}$ and is written as:


$$ \text{comp}_v u =  || \text{proj}_{\vec{v}} \vec{u} || = \frac{\vec{u} \cdot \vec{v}}{|| \vec{v} ||} $$


## Orthogonal

The orthogonal projection of $\vec{u}$ onto $\vec{v}$ is given as:

$$ \text{orth}_\vec{v} \vec{u} = \vec{u} -  \text{proj}_{\vec{v}} \vec{u} $$

This is the component of $\vec{u}$ that is orthogonal to $\vec{v}$.
