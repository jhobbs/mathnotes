---
description: The integration side of vector calculus.
layout: page
title: Vector Integral Calculus
---

# Vector Integral Calculus

## A Brief Introduction to Manifolds and Boundaries

First, some preliminary definitions. I'll talk some about manifolds and boundaries, because, while we're not going to do a full generalized Stokes Theorem here (not yet, at least), I think it is useful to think about the connections between FTC, Fundamental Theorem of Line Integrals, Green's Theorem, Stoke's Theorem, and the Divergence Theorem.

:::definition "Homeomorphism" {synonyms: homeomorphic}
A **homeomorphism** is a @bijective and @continuous @function between @topological-spaces that has a @continuous @inverse-function.
:::

:::definition "Manifold"
A **manifold** is a @topological-space that resembles @euclidean-space near each point. That is, an $n$-dimensional manifold is a topological space with the property that each @point has a @neighborhood that is @homeomorphic to an @open @subset of $n$-dimensional Euclidean space.
:::

:::remark
Another way to put this is that we can approximate a $k$-manifold as closely as we'd like with a $k$-plane. We call this $k$-plane (a line in 1-dimenions, a plane in 2, a half-space in 3, etc) the @tangent-space.
:::

:::definition "Tangent Space"
If $M$ is locally given by a smooth parametrization

$$ \varphi : U \subset \mathbb{R}^k \to M \subset \mathbb{R}^n, $$


and $p = \varphi(u_0)$, then

$$
T_p M = \operatorname{span}\left\{
\frac{\partial \varphi}{\partial u_1}(u_0),
\frac{\partial \varphi}{\partial u_2}(u_0),
\dots,
\frac{\partial \varphi}{\partial u_k}(u_0)
\right\}.
$$

So it’s the collection of all possible velocity vectors of curves on the manifold passing through $p,$ and is a $k$-dimensional linear subspace of $\mathbb{R}^n.$
:::


:::example
One dimensional manifolds include lines and circles, but not curves that cross themselves. Two dimensional manifolds are also called surfaces, and include planes, discs, torus and more. A solid ball is a 3d manifold.
:::

:::remark
We will be interested primarily in @manifolds with @boundaries.
:::

:::definition "Boundary" {synonym: boundaries}
The points on a @manifold whose @neighborhoods are @homeomorphic to a @neighborhood in a half $k$-ball form the **boundary** of the @manifold. Formally,

$$ \partial M = \{p \in M | \text{there exists a chart } (U, p) \text{ with } \varphi(p) \in \mathbb{R}^{k-1} \times {0} \subset \mathbb{H}^k \}. $$

That is, $p$ is a boundary point, if, in local coordinates, it maps to the edge of the half-space model.
:::

:::remark
The @chart $\varphi$ maps points on the manifold to local coordinates. For example, points on the sphere

$$ S^2  = {(x,y,z) : x^2 + y^2 + z^2 = 1} $$

can be assigned coordinates via a chart (with $N$ representing the north pole) $(U = S^2 \setminus {N}, \varphi)$ with

$$ \varphi(x,y,z) = \left ( \frac{x}{1 - z}, \frac{y}{1 - z} \right ). $$

These local coordinates can then be used to refer to any point on the sphere. So, the definition of a @boundary of a manifold above talks about the points that can be mapped to some $k$-vector that has a $0$ in its last dimension. Therefore, the boundary itself is of a dimension $k - 1.$

So, the @boundary of a ball $B$, a 3-manifold, is a sphere ($\partial B^3 = S^2$), a 2-manifold, and the boundary of a disc, a 2-manifold, is a circle, a 1-manifold ($\partial D^2 = C^1$).

A simple curve in space is a 1-manifold, and if it is not closed, then its boundary is its endpoints, and they form a 0-manifold.

An closed interval in $R^1$ is a 1-manifold and its boundary (its endpoints) form a 0-manifold.

Not all manifolds have boundaries. A sphere has no boundaries - it is a 2-manifold, and there is nowhere to go with its coordinates that is not part of the sphere. Contrast that with a 3-ball - if we keep moving outward from the center, we'll reach the edge and beyond. A closed curve in space is a 1-manifold without boundary. An open interval in $R^1$ is a manifold without boundary as well, because all points are interior points.

So, given a manifold $M$, $\partial(\partial(M)) = \emptyset.$ Taking the boundary of a $k$-manifold with boundary gives a new $(k-1)$-manifold without boundary. When we view it this way, it becomes apparent that the definition of @boundary-points we would use from topology - points that are @limit-points of both $M$ and $M^c$ - works for @manifolds as well, but we have to be careful to consider the ambient space the manifold exists in. For a manifold to have a boundary, it must exist in an ambient space that contains points not in the manifold, but when we take the manifold's boundary, we reduce the ambient space to only those points in the boundary, and so it is impossible for any boundary points of the boundary to exist.
:::

## Line Integrals

:::remark
We can express @line-integrals over @vector-fields generally as follows.
:::

:::definition "Line Integral of Vector Function"
A **line integral** of a @vector-function $\vec{F}(\vec{r})$ over a curve $C: \vec{r}(t)$ is defined by

$$ \int_{C} \vec{F}(\vec{r}) \cdot d \vec{r} = \int_{a}^{b} \vec{F}(\vec{r}(t)) \cdot \vec{r}'(t) dt \tag{a} $$

where $\vec{r}(t)$ is the parametric representation of $C.$

Writing (a) in terms of components, with $d \vec{r} = [dx, dy, dz]$ and $' = d/dt,$ we get

$$ \int_{C} \int_{C} \vec{F}(\vec{r}) \cdot d \vec{r} = \int_{C} (F_1 dx + F_2 dy + F_3 dz) = \int_{a}^{b} (F_1 x' + F_2 y' + F_3 z') dt). $$
:::

## Surface Integrals

:::definition "Surface Integral over Vector Field" {synonyms: "surface integral", "flux integral"}
Given a piecewise smooth surface $S,$ we can parameterize it as

$$ \vec{r}(u,v) = \langle x(u,v), y(u,v), z(u,v) \rangle = x(u,v) \vec{i} + y(u,v) \vec{j} + z(u,v) \vec{k}, $$

with $u_0 \leq u < u_1$ and $v_0 \leq v \leq v_1$ (i.e. $u$ and $v$ vary over a region $R$ in the $uv$-plane).

Now, $S$ has a @normal-vector and @unit @normal-vector, respectively, as

$$ \vec{N} = \vec{r}_u \times \vec{r}_v, \quad \vec{n} = \frac{1}{|\vec{N}|} \vec{N} $$

at every point, except perhaps for some edges or cusps, such as for cubes and cones. For a given @vector-function $\vec{F}$ we can now define the **surface integral** over $S$ by

$$ \iint_S \vec{F} \cdot \vec{n} dA = \iint_R \vec{F}(\vec{r}(u,v)) \cdot \vec{N}(u,v) du dv. $$
:::
