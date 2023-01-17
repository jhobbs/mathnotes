## A Review of Some Plane Analytic Geometry

A linear equation has the form $ax + by + c = 0$ and represents a straight line in a plane. *Note: the presence of the constant $c$ in the linear equation prevents it from being homogenous*.

**Paralell Lines** If the coefficients of $x$ and $y$ in one linear equation are proportional to the $x$ and $y$ coefficients in anorther, the two lines they represent aree parallel.

If all three coefficients are proportional, then the two lines coincide (i.e. multiplying one by a constant results in the other - they are the same line).

**Translation of Axes**. Let $(x,y)$ be the coordinates of a point $P$ with respect to an origin $(0,0$). Let us translate the origin to a new position whose $x$ and $y$ distances from $(0,0)$ are $h$ and $k$ respectively. Let's call the new origin $(\bar{0},\bar{0})$ to distinguish them from the original origin. The point $P$, will then have two sets of coordinates, one with respect to the new origin $(\bar{0},\bar{0})$, which we designate by $(\bar{x},\bar{y})$, and the other with respect to $(0,0)$, which we have already designated as $(x,y)$.

The relationship between the two sets of coordinates $(x,y)$ and $(\bar{x},\bar{y})$ follows:

$$ x = \bar{x} + h,\quad y=\bar{y} + k \tag{8.11} $$

Hence, by (8.11)

$$ \bar{x} = x - h,\quad \bar{y} = y - k \tag{8.12} $$

These are the equations of translation. In analytic geometry, they're useful for changing complicated second degree equations into simpler ones by eliminating the first degree terms. They're also useful for solving differential equations with linear coefficients.

## Solution of a Differential Equation in Which the Coefficients of $dx$ and $dy$ are Linear, Nonhomogenous, and when Equated to Zero Represent Nonparallel Lines

Consider the differential equation

$$ (a_1x + b_1y + c_1)dx + (a_2x + b_2y + c_2)dy = 0 \tag{8.2} $$

in which the coefficients of $dx$ and $dy$ are linear and when equated to zero represent nonparallel lines. We assume also that both $c_1$ and $c_2$ are non-zero, for if they were, then (8.2) would be a homogenous equation solvable through the method described in lesson 7).

Since the coefficients in (8.2) are assumed to define nonparallel lines, the pair of equations

$$ a_1x + b_1y + c_1 = 0, \tag{8.21} $$

$$ a_2x + b_2y + c_2 = 0 $$

formed with them, havea unique point of intersection and therefore a unique solution for $x$ and $y$. Let us call this point $(h,k)$. If we now translate the origin to $(h,k)$, then by (8.11), (8.2) becomes, with respect to this new origin $(\bar{0},\bar{0})$,

$$ [a_1(\bar{x} + h) + b_1(\bar{y} + k) + c_1]d\bar{x} + [a_2(\bar{x} + h) + b_2(\bar{y} + k) + c_2]d\bar{y} = 0 \tag{8.23} $$

which simplifies to

$$ [a_1\bar{x} + b_1\bar{y} + (a_1h + b_1k + c_1)]d\bar{x} + [a_2\bar{x} + b_2\bar{y} + (a_2h + b_2k + c_2)]d\bar{y} = 0 \tag{8.23} $$

