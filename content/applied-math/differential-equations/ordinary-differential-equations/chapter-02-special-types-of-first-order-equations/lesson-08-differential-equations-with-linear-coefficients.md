---
layout: page
redirect_from:
- ode/chapter 02 - special types of first order equations/lesson 08 - differential
  equations with linear coefficients
- ode/lesson 08 - differential equations with linear coefficients
- ode/lesson 8 - differential equations with linear coefficients
  of first order equations/lesson 08 - differential equations with linear coefficients
title: Differential Equations with Linear Coefficients
---

# Differential Equations with Linear Coefficients

## A Review of Some Plane Analytic Geometry

A linear equation has the form $ax + by + c = 0$ and represents a straight line in a plane. *Note: the presence of the constant* $c$ *in the linear equation prevents it from being homogenous*.

**Paralell Lines**. If the coefficients of $x$ and $y$ in one linear equation are proportional to the $x$ and $y$ coefficients in anorther, the two lines they represent aree parallel.

If all three coefficients are proportional, then the two lines coincide (i.e. multiplying one by a constant results in the other - they are the same line).

**Translation of Axes**. Let $(x,y)$ be the coordinates of a point $P$ with respect to an origin $(0,0$). Let us translate the origin to a new position whose $x$ and $y$ distances from $(0,0)$ are $h$ and $k$ respectively. Let's call the new origin $(\bar{0},\bar{0})$ to distinguish them from the original origin. The point $P$, will then have two sets of coordinates, one with respect to the new origin $(\bar{0},\bar{0})$, which we designate by $(\bar{x},\bar{y})$, and the other with respect to $(0,0)$, which we have already designated as $(x,y)$.

The relationship between the two sets of coordinates $(x,y)$ and $(\bar{x},\bar{y})$ follows:

$$ x = \bar{x} + h,\quad y=\bar{y} + k \tag{8.11} $$

Hence, by (8.11)

$$ \bar{x} = x - h,\quad \bar{y} = y - k \tag{8.12} $$

These are the equations of translation. In analytic geometry, they're useful for changing complicated second degree equations into simpler ones by eliminating the first degree terms. They're also useful for solving differential equations with linear coefficients.

## Solution of a Differential Equation in Which the Coefficients of $dx$ and $dy$ are Linear, Nonhomogenous, and when Equated to Zero Represent Nonparallel Lines (Lesson 8B)

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

Since $(h,k)$ is the point of intersection of the two lines in (8.21), it lies on both lines and therefore the term in the parentheses in each bracket of (8.23) is zero. This equation therefore reduces to 

$$ (a_1\bar{x} + b_1\bar{y})d\bar{x} + (a_2\bar{x} + b_2\bar{y})d\bar{y} = 0, \tag{8.24} $$

which is now a homogenous type solvable for $\bar{x}$ and $\bar{y}$ by the method of lesson 7. By (8.11) we can then find solutions in terms of $x$ and $y$.

We can use this to solve a equation of this type $((a_1x + b_1y + c_1)dx + (a_2x + b_2y + c_2)dy = 0)$ in these steps:

1. Set the coefficients of $dx$ and $dy$ equal to each other and solve for $x$ and $y$, setting the results to $h$ and $k$ respectively.
2. Let $\bar{x} = x - h,~\bar{y} = y - k$. Remember this for later.
3. Convert the equation to homogenous form by omitting the constants $c_1$ and $c_2$ and place bars over $x$ and $y$ to obtain $(a_1\bar{x} + b_1\bar{y})d\bar{x} + (a_2\bar{x} + b_2\bar{y})d\bar{y} = 0$, which is a homogenous first order ordinary differential equation.
4. Solve the equation from step 3 following the method given in Lesson 7 (let $\bar{y} = u\bar{x}$ or $\bar{x} = u\bar{y}$).
5. In the solution from step 4, replace $\bar{x}$ and $\bar{y}$ with their definitions from step 2 to get the final solution.

## A second method of solving a Differential Equation in Which the Coefficients of $dx$ and $dy$ are Linear, Nonhomogenous, and when Equated to Zero Represent Nonparallel Lines

In (8.2), let

$$ u = a_1x + b_1y + c_1 \tag{8.3} $$

$$ v = a_2x + b_2y + c_2 $$

Therefore

$$ du = a_1dx + b_1dy, \tag{8.31} $$

$$ dv = a_2dx + b_2dy. $$

Solve (8.31) for $dx$ and $dy$. The substitution in (8.2) of (8.3) and these values of $dx$ and $dy$ will also lead to a differential equation with homogenous coefficients solvable by the method of Lesson 7.

*jmh - I didn't really use this method when solving problems in the book, but here it is anyhow. It's interesting that both methods involve getting rid of the constants; one by translation of axes and the other by differentiation. They also both involve solving a system of 2 equations and 2 unknowns - no getting away from that.*

## Solution of a Differential Equation in Which the Coefficients of $dx$ and $dy$ Define Parallel or Coincident Lines
If the lines defined by the coefficients of $dx$ and $dy$ in (8.2) are not parallel, the method of Lesson 8B given above will not work, because it depends on the two lines having a point of intersection, which parallel lines do not have.

When these lines are parallel but not coincident, we can substitute a new variable for the coefficient of $dx$ or $dy$ to transform the equation into one which is separable.

***Example 8.4***
Find a 1-parameter family of solutions of

$$ (4x +3y -1)dx + (4x + 6y +2)dy = 0 \tag{a} $$

also any particular solution not obtainable from the family.

Let

$$ u = 2x + 3y - 1, \quad du = 2dx +3dy, \quad dx = \frac{du -3dy}{2} \tag{b} $$

Then by (b)

$$ \tag{c} 2u + 4 = 4x +6y + 2 $$

Substituting (b) and (c) in (a), we obtain

$$ \tag{d} u(\frac{du - 3dy}{2}) + (2u + 4)dy = 0, $$

which simplifies to

$$ \tag{e} udu + (u+8)dy = 0, $$

an equation whose variables are separable. If $u \neq -8$, (e) can be written as

$$ \tag{f} \frac{u}{u+8}du + dy = 0,~u \neq -8 $$

Integration of (f) gives

$$ \tag{g} u - 8\ln{|u+8|}+y=c,~u \neq 8 $$

Finally, replace in (g) the value of $u$ as given in (b), noting at the same time that the exclusion of $u=-8$ implies the exclusion of the line $2x+3y+7=0$. Hence (g) becomes

$$ \tag{h} 2x +3y -1 -8\ln{|2x+3y+7|}+y=c,~2x+3y+7\neq0, $$

which is a 1-parameter family of solutions of (a). The function defined by

$$ \tag{i} 2x + 3y + 7 = 0 $$

which had to be excluded in obtaining (h) also satisfies (a). It is a particular solution not obtainable from the family (h).

## Geometric Interpretations of Solutions of First Order Ordinary Differential Equations with Linear Coefficients
*jmh*
The solutons to this family of ODEs covers a lot of common shapes in the plane - lines, circles, ellipses, parabolas, hyperbolas, and spirals, at least. I've written more about that, and have code for generating visual representations of these solutions in my [processing-stuff repository](https://github.com/jhobbs/processing-stuff/blob/master/notes.md).