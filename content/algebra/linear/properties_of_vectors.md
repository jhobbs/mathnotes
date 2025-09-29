---
description: Fundamental vector operations in Rⁿ including magnitude, addition, scalar
  multiplication, and linear combinations with definitions of span and vector spaces.
layout: page
title: Properties of Vectors
---

# Vector Space

:::definition "Vector Space"
A **vector space** over a @field $F$ is a @set $V$ together with two operations:
- Vector addition: $V \times V \to V$
- Scalar multiplication: $F \times V \to V$

satisfying the following axioms:

1. $(V, +)$ is an @abelian @group

2. Scalar multiplication is associative: $a(bv) = (ab)v$

3. Distributive laws hold

4. Identity: $1v = v$ for all $v \in V$
:::

# Scalars
:::definition "Scalar"
A **scalar** is an @element of a @field used to define a @vector-space.
:::

:::note
Typically, especially in physics, a @scalar is simply a number, especially a @{real number|real-numbers}.
:::


# Vectors
:::definition "Vector"
A **vector** is an @element in a @vector-space.
:::
:::note
Typically, in physics and many other applications, when we say @vector we mean a @vector in $\mathbb{R}^n,$ which is an ordered tuple of real numbers, $\vec{x} = (x_1, x_2, \cdots, x_n).$ This is the algebraic representation of vector $\vec{x}$.

The geometric representation of vector $\vec{x}$ is, in an $n$ dimensional space, an arrow or directed line segment. When starting from the origin, it would be a line segment from $\vec{0}$ to the point $(x_1, x_2, \cdots, x_n)$.

Physically, a vector has a magnitude and a direction.
:::

:::definition "Free vector"
A @vector whose endpoints are not fixed at particular @points is called a **free vector.**
:::

:::definition "Bound vector"
A @vector with a fixed endpoint is called a **bound vector.**
:::

# Properties of Vectors


:::definition "Magnitude" {synonyms: norm, length}
Let $\vec{x} = (x_1, x_2, \cdots, x_n) \in \mathbb{R}^n$.  The **magnitude**, or length, $\vec{x}$ is denoted as $|| \vec{x} ||$ and is defined as:

$$ ||\vec{x}|| = \sqrt{ {x_1}^2 + {x_2}^2 + \cdots + {x_n}^2 } = \sqrt{\vec{x} \cdot \vec{x}} = \sqrt{\sum_{i=1}^n x_i^2} $$
:::

:::note
This is essentially the Pythagorean theorem in $n$ dimensions; in $\mathbb{R}^2$ the magnitude of a vector corresponds to the length of the hypotenuse of a right triangle whose other sides are of length $x_1$ and $x_2.$

While we define **norm** to be equivalent to magnitude here, this is actually a special case of the more general concept of a norm - there are other norms we could define on $\mathbb{R}^n,$ but I don't have need to explore that yet.
:::

:::definition "Direction"
The **direction** of a @vector can be specified by the angle between it and some fixed reference, such as the $x$-axis.
:::


:::definition "Zero Vector"
The **zero vector** $(0, 0, \cdots, 0)$ is denoted as $\vec{0}$ and has no @direction.
:::

:::definition "Vector Equality"
Two vectors are equal if they have the same coordinates (or equivalently, the same @length and @direction).
:::

:::definition "Unit Vector"
If a @vector has a @length of 1, i.e. if $||x|| = 1$, we say the @vector is a **unit vector**.
:::

:::definition "Vector Addition"
We perform **vector addition** by adding two @vectors $\vec{x} = (x_1, x_2, \cdots, x_n)$ and $\vec{y} = (y_1, y_2, \cdots, y_n)$ according to the following rule:

$$ \vec{x} + \vec{y} = (x_1 + y_1, x_2 + y_2, \cdots, x_n + y_n) $$

that is, by making a new vector where the coordinates are the sums of the respective coordinates in the vectors being summed.
:::
:::note
Geometrically, @vector-addition connects @vectors head to tail.
:::

:::definition "Vector Subtraction"
Similarly, **vector subtraction** can be performed as:

$$ \vec{x} - \vec{y} = (x_1 - y_1, x_2 - y_2, \cdots, x_n - y_n) $$
:::

## Multiplication
:::definition "Vector Multiplication by a Scalar"
We can multiply @vectors by a @scalar. Given the @scalar $c$:

$$ c \vec{x} = (c x_1, c x_2, \cdots, c x_n) $$
:::

:::definition "Inner product" {synonyms: "Dot Product", "Scalar product of two vectors"}
If $\vec{x}$ and $\vec{y}$ are vectors in $\mathbb{R}^n,$ then their **inner product** is defined as


$$ \vec{X} \cdot \vec{y} = \sum_{i = 1}^n x_i y_i. $$
:::

:::theorem {label: cos-characterization-of-dot-product}
The @dot-product of $\vec{u}$ and $\vec{v}$ is

$$ \vec{u} \cdot \vec{v} = |\vec{u}||\vec{v}|\cos{\theta} $$

where $\theta$ is the angle between $\vec{u}$ and $\vec{v}.$
:::

:::definition "Perpendicular" {synonyms: orthogonal}
Two vectors $\vec{u}$ and $\vec{v}$ are said to be **perpendicular** or **orthogonal** if the angle between them is $\pi/2$ radians, or, equivalently, if the inner product $\vec{u} \cdot \vec{v} = 0.$
:::

:::definition "Parallel"
Two vectors $\vec{x}$ and $\vec{y}$ are said to be **parallel** if $\vec{x}$ is a scalar multiple of $\vec{y}$, i.e., if there exists some scalar $c$ where $\vec{x} = c \vec{y}.$
:::

:::definition "Cross Product" {synonyms: "Vector Product", "Outer Product"}
The **cross product** $\vec{a} \times \vec{b}$ (read "a cross b") of two @vectors $\vec{a}$ and $\vec{b}$ is the @vector $\vec{v}$ denoted by

$$ \vec{v} = \vec{a} \times \vec{b}. $$

I. If $\vec{a} = \vec{0}$ or $\vec{b} = \vec{0},$ then we define $\vec{v} = \vec{a} \times \vec{b} = \vec{0}.$

II. If both @vectors are nonzero @vectors, then @vector $\vec{v}$ has the @length

$$ \tag{1} |\vec{v}| = |\vec{a} \times \vec{b}| = |\vec{a}||\vec{b}|\sin{\theta}, $$

where $\theta$ is the angle between $\vec{a}$ and $\vec{b}.$ Furthermore, $\vec{a}$ and $\vec{b}$ form the sides of a parallelogram on a plane in space. The area of this parallelogram is precisely given by (1), such that the length $|\vec{v}|$ of the @vector $\vec{v}$ is equal to the area of the parallelogram.

III. If $\vec{a}$ and $\vec{b}$ lie in the same straight line, i.e. $\vec{a}$ and $\vec{b}$ have the same or opposite @directions, then $\theta$ is $0 \degree$ or $180 \degree$ so that $\sin \theta = 0.$ In that case $|\vec{v}| = 0,$  so that $\vec{v} = \vec{a} \times \vec{b} = \vec{0}. $$

IV. If cases I and III do not occur, then $\vec{v}$ is a nonzero vector. The @direction of $\vec{v} = \vec{a} \times \vec{b}$ is @perpendicular to both $\vec{a}$ and $\vec{b}$ such that $\vec{a}, \vec{b}, \vec{v},$ precisely in this order, form a right-handed triple 
:::
:::remark
If $\vec{a} = (a_1, a_2, a_3)$ and $\vec{b} = (b_1, b_2, b_3),$ then we use the symbolic determinant to find the @cross-product, in this fashion:

$$ \vec{v} = \vec{a} \times \vec{b} =  \begin{vmatrix}\vec{i} & \vec{j} & \vec{k}\\a_1 & a_2 & a_3\\b_1 & b_2 & b_3\end{vmatrix} = \begin{vmatrix} a_2 & a_3 \\ b_2 & b_3 \end{vmatrix} \vec{i} - \begin{vmatrix} a_1 & a_3 \\ b_1 & b_3 \end{vmatrix} \vec{j} + \begin{vmatrix} a_1 & a_2 \\ b_1 & b_2 \end{vmatrix} \vec{k}. $$
:::

{% include_demo "cross-product" %}

:::definition "Linear Combination"
Let $\vec{v_1}, \vec{v_2}, \cdots, \vec{v_n} \in \mathbb{R}^n$ and $c_1, c_2, \cdots, c_3 \in \mathbb{R}.$ Then, the vector

$$ \vec{v} = c_1 \vec{v_1} +  c_2 \vec{v_2} + \cdots + c_n \vec{v_n} $$

is called a **linear combination** of $\vec{v_1}, \vec{v_2}, \cdots, \vec{v_n}.$

Let $\vec{v_1}, \vec{v_2}, \cdots, \vec{v_n} \in \mathbb{R}^n.$ The set of all linear combinations of $\vec{v_1}, \vec{v_2}, \cdots, \vec{v_n}$ is called their **span**, denoted $\Span{\left(\vec{v_1}, \vec{v_2}, \cdots, \vec{v_n}\right)}.$ 

That is:

$$ \Span{\left(\vec{v_1}, \vec{v_2}, \cdots, \vec{v_n}\right)} = \left\{ \vec{v} \in \mathbb{R}^n : \vec{v} = c_1 \vec{v_1} + c_2 \vec{v_2} + \cdots + c_n \vec{v_n} ~ \text{for some scalars} ~ c_1, c_2, \cdots, c_n \right\} $$
:::
