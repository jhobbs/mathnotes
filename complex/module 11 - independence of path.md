---
layout: page
title: Indepenence of Path of Contour Integrals
---

# Independence of Path of Contour Integrals

Many contour integrals are independent of path, i.e. any two contour integrals between the same points gives the same value.

Some theorems:

The contour integral of a continuous function $f$ is independent of path in a domain $D$ if and only if $f$ has an antiderivative in $D$.

If $f$ is continuous in a domain $D$ and has an antiderivative $F$ in $D$, then for any piecewise smooth curve $C$ in $D$ joining point $z_0$ to point $z_1$,

$$ \int_C f(z) dz = F(z_1) - F(z_0). $$

The contour integral of a continuous function $f$ is independent of path in a domain $D$ if and only if the contour integral of $f$ around every closed, piecewise smooth curve $C$ in $D$ vanishes,

$$ \oint_c f(z) dz = 0. $$

We have to be careful about branch cuts. Different antiderivatives of $1/z$ have different branch cuts, and we must pick one where the branch cut does not lie in $D$ in order for it to be a proper antiderivative. When $D$ contains all possible branch cuts of $\log_\phi$, $1/z$ has no antiderivative in $D$.

We also have to be careful when a path encircles a singularity - in this case, the antiderivative may not be single-valued or consistent along the entire path.
