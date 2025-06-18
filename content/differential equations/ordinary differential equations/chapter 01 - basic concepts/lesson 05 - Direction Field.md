---
layout: page
redirect_from:
- ode/chapter 01 - basic concepts/lesson 05 - Direction Field
- ode/lesson 05 - Direction Field
- ode/lesson 5 - Direction Field
- diffeq/lesson 5 - Direction Field
title: Direction Field
description: Geometric visualization of differential equations through integral curves, line elements, isoclines, and classification of ordinary and singular points.
---

# Direction Field

***Definition 5.12*** 

Given the differential equation:

$$ y' = F(x,y), a < x < b \tag{5.11} $$

If $y=f(x)$ or $f(x,y) =0$ defines $y$ as a function of $x$ which satisifies (5.11) on an interval $I$, then the graph of this function is called an integral curve, i.e. it is the graph of a function which is a soltuion of (5.11).

Even if we can't find a solution of (5.11) algebraicly, we can draw a small line element at any point $(x,y)$ for which $x$ is in $I$, to represent the slope of an integral curve at that point. For example, if the value of $y'$ in (5.11) is $2$ at the point $(4,3)$, that means the slop of an integral curve at $(4,3)$ is $2$. To represent that, we can draw a short line at $(4,3)$ with slope $2$. We can repeat that process everywhere we chose to as long as (5.11) is valid there.

These lines are called **line elements**. All of these lines taken together we will call a **direction field**, although the term **slope field** is also commonly used.

***Definition - Isocline***

If

$$ y' = F(x,y) \tag{5.23} $$

then each curve for which 

$$ F(x,y) = k \tag{5.24} $$

where k is any number, will be an **isocline** of the direction field determined by (5.23). 

In plain english, an isocline is a curve in a direction field where all integral curves crossing the isocline have the same slope ($k$) when passing through the isocline. This is similar to a topographic map, where the countor lines represent points on the map with equal elevations.

We can look at an integral curve as the path of a particle moving through the direction field. Beginning at some point, the particle moves a tiny amount in the direction of the slope given for that point, and then the process is repeated. The path of this particle is sometimes called a **streamline**.

## Ordinary and Singular Points of the First Order Equation 

Consider a direction field constructed for the differential equation:

$$ y' = \frac{2(y-1)}{x}, x \neq 0 \tag{a} $$

We can construct line elements everywhere except where $x = 0$. For example, following a streamline starting in the second quadrant would eventually reach the point $(0,1)$ where it would be stopped because (a) isn't defined there. We could give the function an arbitrary slope of 0 at this point, but even if we did so, it wouldn't be clear where to continue tracing our streamline because there are infinitely many integral curves that pass through $(0,1)$. 

***Definition 5.4*** An **ordinary point** of the first order differential equation (5.11) is a point in the plane which les on *one and only one* of its integral curves.

***Definition 5.41*** A **singular point** of a first order differential equation (5.11) is a point on the plane which meets the following two requirements:

1. It is not an ordinary point, i.e., it does not lie on any integral curve or it lies on more than one integral curve of (5.11)
2. If a circle of arbitrarily small radius is drawn about the point (i.e., the radius may be as small as one wishes), the interior contains at least one ordinary point. (The singular point is a limit of ordinary points).

Requirement 2 is needed to exlude **extraneous points**. I.e. if $y' = \sqrt{1 -x^2}$, which is only valid for $x$ values between -1 and 1, the point $(3,7)$ would be singular by requirement 1 alone, even though it's extraneous to the problem.

