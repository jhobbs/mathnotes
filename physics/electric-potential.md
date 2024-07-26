---
layout: page
title: Electric Potential
---

# Electric Potential

The electric potential $V$ due to a particle of charge $q$ at any radial distance $r$ from the particle is


$$ V = \frac{1}{4 \pi \epsilon_0} \frac{q}{r} $$

This is very similar to the formula for magnitude of an electric field, except it's signed, and drops of proportional to the first power of the distance rather than the square of the distance. The $\frac{1}{r^2}$ in the magnitude of an electric field is related to the electric field being dispersed over an area. It's $\frac{1}{r}$ here because the electric potential is the work done per unit charge in bringing a charge from infinity to a point in the field, so it's integrating the field strength over a distance (via a line integral).

Electric fields point from higher potential to lower potential.

Electric fields are always perpendicular to equipotential lines.

The magnitude of the electric field is related to the rate of change of the electric potential with distance. This means that when equipotential lines are closely spaced, the potential changes rapidly over a small distance, indicating a strong electric field. We can say, mathematically, that the electric field $\vec{E}$ is the negative gradient of the electric potential $phi$:


$$ \vec{E} = -\nabla \phi $$

That is, given a function $V(x,y)$ that gives the potential at a point on the plane, the electric field is given as the vector

$$ \vec{E} = -<\frac{\partial V}{\partial x}, \frac{\partial V}{\partial y}> $$

and the angle the electric field makes with respect to the positive $x$-axis is given as

$$ \theta(x,y) = \text{atan2}\left ( \frac{\partial V}{\partial x}, \frac{\partial V}{\partial y} \right ) $$



If a particle with a charge $q$ is placed at a point where the electric potential of a charged object is $V$, the electric potential $U$ of the particle-object system is

$$ U = qV $$

The change in voltage between two plates separated by a distance of $\delta s$ is related to the magnitude of the electric field by

$$ E = -\frac{\Delta v}{\Delta s} $$
