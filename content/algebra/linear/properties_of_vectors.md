---
description: Fundamental vector operations in Rⁿ including magnitude, addition, scalar
  multiplication, and linear combinations with definitions of span and vector spaces.
layout: page
title: Properties of Vectors
---

# Properties of Vectors

We define a **vector** in $\mathbb{R}^n$ to be an ordered tuple of real numbers, $\vec{x} = (x_1, x_2, \cdots, x_n).$ This is the algebraic representation of vector $\vec{x}$.

The geometric representation of vector $\vec{x}$ is, in an $n$ dimensional space, an arrow from the origin to the point $(x_1, x_2, \cdots, x_n)$.

A vector has a length and a direction.

:::definition "Inner product"
If $\vec{x}$ and $\vec{y}$ are vectors in $\mathbb{R}^n,$ then their **inner product** is defined as


$$ \vec{X} \cdot \vec{y} = \sum_{i = 1}^n x_i y_i. $$
:::

:::definition "Magnitude" {synonyms: norm}
Let $\vec{x} = (x_1, x_2, \cdots, x_n) \in \mathbb{R}^n$.  The **magnitude**, or length, $\vec{x}$ is denoted as $|| \vec{x} ||$ and is defined as:

$$ ||\vec{x}|| = \sqrt{ {x_1}^2 + {x_2}^2 + \cdots + {x_n}^2 } = \sqrt{\vec{x} \cdot \vec{x}} = \sqrt{\sum_{i=1}^n x_i^2} $$
:::

:::note
This is essentially the Pythagorean theorem in $n$ dimensions; in $\mathbb{R}^2$ the magnitude of a vector corresponds to the length of the hypotenuse of a right triangle whose other sides are of length $x_1$ and $x_2.$

While we define **norm** to be equivalent to magnitude here, this is actually a special case of the more general concept of a norm - there are other norms we could define on $\mathbb{R}^n,$ but I don't have need to explore that yet.
:::

The direction of a vector can be specified by the angle between it and some fixed reference, such as the $x$-axis.

The zero vector $(0, 0, \cdots, 0)$ is denoted as $\vec{0}$ and has no direction. Two vectors are equal if they have the same coordinates (or equivalently, the same length and direction).

We can multiple vectors by a scalar. Given the scalar $c$:

$$ c \vec{x} = (c x_1, c x_2, \cdots, c x_n) $$

If a vector has a length of 1, i.e. if $||x|| = 1$, we say the vector is a **unit vector**.

We perform **vector addition** by adding two vectors $\vec{x} = (x_1, x_2, \cdots, x_n)$ and $\vec{y} = (y_1, y_2, \cdots, y_n)$ according to the following rule:


$$ \vec{x} + \vec{y} = (x_1 + y_1, x_2 + y_2, \cdots, x_n + y_n) $$

that is, by making a new vector where the coordinates are the sums of the respective coordinates in the vectors being summed.

Similarly, **vector subtraction** can be performed as:

$$ \vec{x} - \vec{y} = (x_1 - y_1, x_2 - y_2, \cdots, x_n - y_n) $$

Two vectors $\vec{x}$ and $\vec{y}$ are said to be **parallel** if $\vec{x}$ is a scalar multiple of $\vec{y}$, i.e., if there exists some scalar $c$ where $\vec{x} = c \vec{y}.$


Let $\vec{v_1}, \vec{v_2}, \cdots, \vec{v_n} \in \mathbb{R}^n$ and $c_1, c_2, \cdots, c_3 \in \mathbb{R}.$ Then, the vector

$$ \vec{v} = c_1 \vec{v_1} +  c_2 \vec{v_2} + \cdots + c_n \vec{v_n} $$

is called a **linear combination** of $\vec{v_1}, \vec{v_2}, \cdots, \vec{v_n}.$

Let $\vec{v_1}, \vec{v_2}, \cdots, \vec{v_n} \in \mathbb{R}^n.$ The set of all linear combinations of $\vec{v_1}, \vec{v_2}, \cdots, \vec{v_n}$ is called their **span**, denoted $\Span{\left(\vec{v_1}, \vec{v_2}, \cdots, \vec{v_n}\right)}.$ 

That is:

$$ \Span{\left(\vec{v_1}, \vec{v_2}, \cdots, \vec{v_n}\right)} = \left\{ \vec{v} \in \mathbb{R}^n : \vec{v} = c_1 \vec{v_1} + c_2 \vec{v_2} + \cdots + c_n \vec{v_n} ~ \text{for some scalars} ~ c_1, c_2, \cdots, c_n \right\} $$
