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

Another way to put this is that we can approximate a $k$-manifold as closely as we'd like with a $k$-plane.
:::

:::example
One dimensional manifolds include lines and circles, but not curves that cross themselves. Two dimensional manifolds are also called surfaces, and include planes, discs, torus and more. A solid ball is a 3d manifold.
:::

:::remark
We will be interested primarily in @manifolds with @boundaries.
:::

:::definition "Boundary" {synonym: boundaries}
The points on a @manifold whose @neighborhoods are @homeomorphic to a @neighborhood in a half $k$-ball form the **boundary** of the @manifold. Formally,

$$ \partial M = \{p \in M | \text{there exists a chart } (U, p) \text{ with } \phi(p) \in \mathbb{R}^{k-1} \times {0} \subset \mathbb{H}^k \}. $$

That is, $p$ is a boundary point, if, in local coordinates, it maps to the edge of the half-space model.
:::

:::remark
The @chart $\phi$ maps points on the manifold to local coordinates. For example, points on the sphere

$$ S^2  = {(x,y,z) : x^2 + y^2 + z^2 = 1} $$

can be assigned coordinates via a chart (with $N$ representing the north pole) $(U = S^2 \setminus {N}, \phi)$ with

$$ \phi(x,y,z) = \left ( \frac{x}{1 - z}, \frac{y}{1 - z} \right ). $$

These local coordinates can then be used to refer to any point on the sphere. So, the definition of a @boundary of a manifold above talks about the points that can be mapped to some $k$-vector that has a $0$ in its last dimension. Therefore, the boundary itself is of a dimension $k - 1.$

So, the @boundary of a ball $B$, a 3-manifold, is a sphere ($\partial B^3 = S^2$), a 2-manifold, and the boundary of a disc, a 2-manifold, is a circle, a 1-manifold ($\partial D^2 = C^1$).

A simple curve in space is a 1-manifold, and if it is not closed, then its boundary is its endpoints, and they form a 0-manifold.

An closed interval in $R^1$ is a 1-manifold and its boundary (its endpoints) form a 0-manifold.

Not all manifolds have boundaries. A sphere has no boundaries - it is a 2-manifold, and there is nowhere to go with its coordinates that is not part of the sphere. Contrast that with a 3-ball - if we keep moving outward from the center, we'll reach the edge and beyond. A closed curve in space is a 1-manifold without boundary. An open interval in $R^1$ is a manifold without boundary as well, because all points are interior points.

So, given a manifold $M$, $\partial(\partial(M)) = \emptyset.$ Taking the boundary of a $k$-manifold with boundary gives a new $(k-1)$-manifold without boundary. When we view it this way, it becomes apparent that the definition of @boundary-points we would use from topology - points that are @limit-points of both $M$ and $M^c$ - works for @manifolds as well, but we have to be careful to consider the ambient space the manifold exists in. For a manifold to have a boundary, it must exist in an ambient space that contains points not in the manifold, but when we take the manifold's boundary, we reduce the ambient space to only those points in the boundary, and so it is impossible for any boundary points of the boundary to exist.
:::
