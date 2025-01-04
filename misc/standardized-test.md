---
layout: page
title: Standardized Test Math
---

# Standardized Test Math

These are some notes from my preperation for a standardized math test.

## Geometry


### Interior Angles of Regular Polygons

The sum of the degrees of the interior angles of a regular $n$-gon is $180(n - 2)$. This can be shown by dividing the interior into triangles by picking one vertex and drawing diagonals to non opposing vertices. There will be $n-3$ non-adjacent vertices, resulting in $n-2$ triangles, each with $180$ degrees of interior angles.

### Diagonals in a Regular Octagon

How many diagonals does a regular octagon have? How many of them are parallel to at least one side of the octagon?

There are $n$ vertices in a regular $n$-gon; each vertex is an endpoint for $n-3$ diagonals. However, each diagonal connects to two vertices, so we end up with $\frac{n(n-3)}{2}$ diagonals in a regular $n$-gon. Therefore, a regular octagon has $20$ diagonals.

We can exploit the symmetry of an octagon to get our answer from here. The image below shows that any given vertex is connected to two diagonals that are parellel to at least one side.

![Octagon Diagonals](octagon-diagonals.png)

There are 8 vertices, and each diagonal connects to two diagonals that are parallel to at least one side, so we have $\frac{8 \cdot 2}{2} = 8$ diagonals that are parallel to at least one side of the octagon.

*Note:* I'm not sure how to generalize this to $n$-gons. In particular, I'm not sure how to find the number of diagonals parallel to at least one side.
