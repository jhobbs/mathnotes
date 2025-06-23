---
layout: page
redirect_from:
- ode/chapter 03 - problems leading to first order equations/lesson 17a - pursuit
  curves
- ode/chapter 03 - problems leading to first order equations/lesson 17 - pursuit curves
title: Pursuit Curves
---

# Pursuit Curves

(*jmh* my notes)

Flight path of a plane taking off from $(100,0)$ and always pointing towards $(0,0)$ with $k$ being the ratio of wind speed to plane speed, and wind speed in the positive y direction:

https://www.desmos.com/calculator/yuwl4zdtwc

The equation for the above curve is:

$$ y = xsinh{(k \ln{\frac{100}{x}})} $$

Note that if we want to find where the plane will cross the $y$-axis, we can't just set $x = 0$ because this equation isn't defined there. To get the correct value, we apparently need to take the limit from the right as $x$ approaches $0$.

So, for example, to find where the plane crosses the $y$ axis when the wind to plane speed ratio is $\frac{2}{3}$ we find:

$$ \lim_{x\to0}  xsinh{(k \ln{\frac{100}{x}})} = 50 $$

i.e., 50 units to the north of the target.

This is interesting to me and the book doesn't explain this - you just have to figure it out on your own. I think it makes sense to some degree if you consider that for some wind speeds the plane will never reach the $y$-axis, and that if it were to land at the origin it wouldn't be moving anymore, so the function really isn't intended to be defined at origin, just as we approach the $y$-axis.

You can also solve the problem above with polar coordinates, which gives this equation and graph:

https://www.desmos.com/calculator/rwnpkeivcf

I find the math to be a bit easier with polar coordinates here.

Path taken by a bug crawling across record with radius 100 spinning on a turn table. $k$ is the ratio of the bug's velocity towards the center to the angular velocity of the record:

https://www.desmos.com/calculator/y50fx79ykn

## Bug on a Turntable Problems

The book has a series of problems where the goal is the find the path of a bug that is walking on a turntable. I haven't found solutions to these elsewhere on the internet, and it took me weeks to solve them, so I'm going to detail them here. The quoted questions are from the book and the rest is my own work.

### 4. Bug Walking Towards The Center ###

"An insect steps on the edge of a turntable of radius $a$ that is rotating at a constant angular velocity $\alpha$. It moves straight toward the center of the table at a constant velocity $v_0$. Find the equation of its path in polar coordinates, relative to axes fixed in space."

In the turntable graphic at the bottom of this page, this is the "To Center" mode.

We'll assume that the bug steps on to the table at $\theta = 0$ and that the turntable is rotating counter-clockwise.

We have two sources of motion for the bug to consider - its locomotive motion (walking) and the rotation caused by the turntable.

The bug's locomotive motion takes it always towards the center of the turntable at speed $v_0$, reducing the radius, and doesn't change the angle to the bug relative to the $x$-axis. The following differential equations capture that motion:

$$ \frac{dr}{dt} = -v_0,~\frac{d\theta}{dt} = 0 \tag{a} $$

The motion of the turntable rotating always changes only the angle to the bug relative to the $x$-axis at speed $\alpha$ and never the distance of the bug from the center. The following differential equations capture that motion:

$$ \frac{dr}{dt} = 0,~\frac{d\theta}{dt} = \alpha \tag{b}$$

Adding together the equations $\frac{dr}{dt}$ and $\frac{d\theta}{dt}$ respectively from (a) and (b) gives:

$$ \frac{dr}{dt} = -v_0,~\frac{d\theta}{dt} = \alpha \tag{c} $$

We can then divide to get $\frac{dr}{d\theta}$:

$$ \frac{dr}{d\theta} = \frac{dr}{dt}\frac{dt}{d\theta} = \frac{-v_0}{\alpha}, \alpha \neq 0 \tag{d} $$

To find the path of the equation we can rearrange and integrate with initial conditions $r = a$ and $\theta = 0$

$$ \int_{r=a}^{r} dr = \int_{\theta=0}^{\theta}-\frac{v_0}{\alpha}d\theta \tag{e} $$

Which gives:

$$ r = a - \frac{v_0}{\alpha}\theta \tag{f} $$

The book then asks:

"Draw a graph of the equation if $a = 10$ ft, $\alpha = \frac{\pi}{4}$ radians/sec, $v_0 = 1$ ft/sec. How many revolutions will the table have made by the time the insect reaches the center?"

That graph is given here: https://www.desmos.com/calculator/jascajj5wo

The number of revolutions required is $1\frac{1}{4}$ which can be found by substituting the given values and solving for $\theta$.

### 5. Bug Walking Parallel to the $x$-axis

The book asks:

"Assume in problem 4 that the insect always moves in a direction parallel to the diameter drawn through the point where he steps on the table.

(a) Find the equation of its path relative to axes fixed in space.

(b) What kind of curve is it?"

This is the "parallel to start" mode in the turntable widget at the bottom of the page.

We'll make the same assumptions we made in 4, that the bug steps on to the table at $\theta = 0$ and that the turntable is rotating counter-clockwise.

Here we have that the bug is not always walking towards the center but is walking across the turntable in a path parallel to the $x$-axis. If the turntable wasn't spinning, the bug would just walk right across the $x$-axis, but since it spins, it follows a different path. We need to figure out how much the radius and angle to the bug change as it walks from different positions.

Picking a few of positions, it's evident that the amount the radius changes from the bug walking depends on the angle to the bug. For example, if the bug is at $(a, 0)$ the bug's motion takes it purely in a direction towards the center, thus reducing the radius, but if the bug is at $(-a, 0)$ its motion takes it away from the center, growing the radius. Furthermore if the bug is at $(0, a)$, its motion won't change the radius at all (consider it moving from just to the right of the $y$-axis to an equal distance to the left of the $y$-axis - the radius will be unchanged.

Similar arguments apply to the change in angle from the bug walking - the amount of change depends on the bugs' position.

We can find functions for change in radius and change in angle by starting with rectangular coordinates, differentiating, and then converting to polar coordinates.

Parameterizing to get $x = x(t)$ and $y = y(t)$ we have:

$$ x = -v_0t + c_1, ~y = c_2 \tag{5.a} $$

where $c_1$ and $c_2$ are arbitrary constant's allowing the bug's position to move around the turntable.

Differentiating (a) with respect to $t$ gives:

$$ x' = \frac{dx}{dt} = -v_0, ~ y' = \frac{dy}{dt} = 0 \tag{5.b} $$

Using formulas from my [polar coordinates notes](https://jhobbs.github.io/mathnotes/calculus/polar-coordinates.html) (see the 'Derivatives' section here ) we can find $r'$ and $\theta'$:

$$ \frac{dr}{dt} = -v_0\cos\theta, ~ \frac{d\theta}{dt} = v_0\frac{sin\theta}{r} \tag{5.c} $$

Combining with the motion of the turntable rotating at speed $\alpha$ we get:

$$ \frac{dr}{dt} = -v_0\cos\theta, \frac{d\theta}{dt} = \frac{v_0\sin\theta + r\alpha}{r} \tag{5.d} $$

Dividing gives us $\frac{dr}{d\theta}$:

$$ \frac{dr}{d\theta} = \frac{dr}{dt}\frac{dt}{d\theta} = \frac{-rv_0\cos\theta}{v_0sin\theta + r\alpha} \tag{5.e} $$

We can rewrite this as:

$$ (v_0\sin\theta + r\alpha)dr + (rv_0\cos\theta)d\theta = 0 \tag{5.f} $$

Which is an exact differential equation with the solution:

$$ 2v_0r\sin\theta + \alpha r^2 = c \tag{5.g} $$

Setting initial conditions $r = a$, $\theta = 0$ gives $c = \alpha r^2$. Substituting into (g) and rearranging we get:

$$ 2v_0r\sin\theta = \alpha (a^2 - r^2) \tag{5.h} $$

which is the answer to 5.a. The path makes a circle. Converting to rectangular coordinates we have:

$$ x^2 + y^2 = a^2 - \frac{2v_0y}{\alpha} \tag{5.i} $$

Which, by rearranging terms and completing the square, gives:

$$ x^2 + (y + \frac{v_0}{\alpha})^2 = a^2 + \frac{ {v_0}^2 }{\alpha^2} \tag{5.j} $$

This is a circle with center $(0, -\frac{v_0}{\alpha})$ and radius $\sqrt{a^2 + \frac{ {v_0}^2 }{\alpha^2}}$.

### 12. Bug Walking Towards a Light

The book asks:

"Assume in problem 4 that the insect moves straight toward a light which is fixed in space directly above the end of the diameter drawn through the point where it steps on the table. Find the differential equation of its path in polar coordinates."

Here, we have that wherever the bug is on the turntable, it will be walking towards a light at a fixed point. Let's call that fixed point $L$. Then, at any given time, the bug is walking along a line between its position, $B$, and the position of the light, $L$. The angle of this line, relative to the $x$-axis, is given by $\text{atan2}(B_y - L_y, B_x - L_x)$. We'll call this angle $\rho$.

Now, the motion of the bug at any point is its locomotive motion at a rate of $v_0$ along a line with the angle $\rho$, and the turntable's rotation given as $r\alpha$ in the direction of rotation.
  
Using formulas from my [polar coordinates notes](https://jhobbs.github.io/mathnotes/calculus/polar-coordinates.html) (see the 'Radial and Transverse Components of Motion' section here), we can find that the differential equations capturing the locomotive motion of the bug are:

$$ \frac{dr}{dt} = -v_0 \cos{(\theta - \rho)},\quad \frac{rd\theta}{dt} = v_0\sin{(\theta - \rho)} \tag{12.a} $$

Combined with the differential equation for the rotation of the turntable, $\frac{rd\theta}{dt} = r\alpha$, and dividing, we get the following differential equation describing the motion of the bug on the turntable:

$$ \frac{dr}{d\theta} = \frac{-v_0 r \cos{(\theta - \rho)}}{r \alpha + v_0 \sin{(\theta - \rho)}} \tag{12.b} $$ 

We can't solve this in this form though, because $\rho = \text{atan2}(B_y - L_y, B_x - L_x)$. I think we could find $\rho$ in polar terms, but its value would depend on both $r$ and $\theta$ and would thus lead to an inseperable differential equation.

It's also worth pointing out that the approach used to solve this question could be used on question 5. above. There, $\rho$ is just fixed at 0 because the bug is moving parallel to the $x$-axis. Setting $\rho = 0$ in (12.b) leads directly to (5.e).


### Animation

The animation below models paths given by the 3 problems above, with some limitations and modifications.

* This uses Euler's method to estimate the paths rather than using exact solutions.
* Instead of assuming the bug always enters the turntable at the $x$-axis, we allow the bug to start anywhere.
* We're a little hazy with the units of speed and distance. Animation is hard. I'd like to improve this.

We show a limited history of the bug's position to make the path more obvious. There are also 3 vectors drawn:

* blue - the bug's locomotive velocity
* red - the bug's linear velocity from the turntable's rotation
* yellow - the bug's combined velocity from its locomotive motion and the turntable's rotation

{% include_integrated_relative turntable.html %}

It's interesting to me that the "always walk towards the light" approach can wind up with the bug never reaching the light, but instead getting stuck at some kind of equillibrium point where the bug's locomotive velocity and the linear velocity from the rotation of the turntable are equal in value and opposite in direction. I wonder how we find which initial conditions lead to the bug reaching the light and which don't? For those that don't, I wonder how we find the equillibrium point the bug will stop at.
