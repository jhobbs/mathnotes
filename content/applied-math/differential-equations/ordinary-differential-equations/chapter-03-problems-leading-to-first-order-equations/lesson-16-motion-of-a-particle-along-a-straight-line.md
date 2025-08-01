---
description: Applications of first-order differential equations to particle motion
  including vertical motion with gravity, air resistance effects, terminal velocity,
  and horizontal motion with friction. Covers Newton's laws and various resistance
  models.
layout: page
redirect_from:
- ode/chapter 03 - problems leading to first order equations/lesson 16 - motion of
  a particle along a straight line
  to first order equations/lesson 16 - motion of a particle along a straight line
title: Motion of a Particle Along a Straight Line
---

# Motion of a Particle Along a Straight Line

## Preliminaries 

Newton's second law says the rate of a change of the momentum of a body (momentum = mass x velocity) is proportional to the resultant external force $F$ acting upon it:

$$ \tag{a} F = km\frac{dv}{dt} $$

where $m$ is the mass of the body, $v$ its velocity, and $k > 0$ is a proportionality constant whose value depends on the units used.

If the units are foot for distance, pound for force, slug for mass (= 1/32 pound), second for time, then $k=1$ and (a) becomes:

$$ \tag{16.1} F = m\frac{dv}{dt} = ma = m\frac{d^2s}{dt^2} $$

Where a is the rate of change in velocity, aka the acceleration of the particle, and $s$ is the distance a particle has moved from a fixed point (displacement). A force of 1 lb therefore will give a mass of 1 slug an acceleration of $1 ft/sec^2$.

If we write

$$ \tag{b} \frac{dv}{dt} = \frac{dv}{ds} \frac{ds}{dt} $$

and recognize that $v = ds/dt$, then (b) becomes:

$$ \tag{16.11} \frac{dv}{dt} = v\frac{dv}{ds} $$

Hence we can also write (16.1) as:

$$ \tag{16.111} F = mv\frac{dv}{ds} $$

That is, Force = Mass * Velocity * (rate of change of velocity with respect to displacement)

Newton also gave us the law of attraction between bodies. If $m_1$ and $m_2$ are the masses of two bodies whose centers of gravity are $r$ distance apart, the force of attraction between them is given by:

$$ \tag{16.12} F = k\frac{m_1 m_2}{r^2} $$

where $k > 0$ is a proportionality constant.

## Vertical Motion

Let:

$M$ = mass of the earth, assumed to be a sphere

$m$ = mass of a body in the earth's gravitational field

$R$ = the radius of the earth

$y$ = the distance of the body above the earth's surface

By (16.12) the force of attraction between earth and body is (assuming their masses are concentrated at their respective centers):

$$ \tag{16.14} F = -G \frac{Mm}{(R+y)^2} $$

The proportionality constant $G$ is called the **gravitational constant**. We use the negative sign because the resultant force is downward towards the earth's surface, and here we're considering our positive direction to be upward.

### Vertical Motion with no Air Resistance and Close to the Surface of the Earth

If $y$ is relatively small compared to the radius of the earth, then we can accurately approximate (16.14) as:

$$ \tag{16.15} F = -\frac{GMm}{R^2} $$

By (16.1) with $y$ replacing $s$, we can write (16.15) as:

$$ \tag{16.16} m\frac{d^2y}{dt^2} = - \frac{GMm}{R^2} $$

Since $G$, $M$, and $R$ are constants, we may replace $GM/R^2$ by a new constant $g$. We thus finally obtain for the differential equation of motion of a falling body in the gravitational field of the earth:

$$ \tag{16.17} m\frac{d^2y}{dt^2} = -gm,\quad m\frac{dv}{dt} = -gm $$

where $v = dy/dt$

Simplifying (16.17) we have:

$$ \tag{16.18} m\frac{d^2y}{dt^2} = -gm $$

The constant $g$ is thus the acceleration of a body due to the earth's **force of gravity**. Its value varies slightly for different locations on earth and for different heights, but for convenience we'll use the value $32 ft/sec^2$.

Integration of (16.18) gives the velocity equation:

$$ \tag{16.19} v(=\frac{dy}{dt}) = -gt + c_1 $$

And integration of (16.19) gives the distance equation:

$$ \tag{16.2} y = - \frac{gt^2}{2} + c_1t + c_2 $$

### With Air Resistance

Above, we didn't consider air resistance. It's complicated in reality - air resistance varies with, among other things, the air density and the object's speed. Air density itself varies with height and with time. Here we will make simplifying assumptions that we have a constant atmosphere and an air resistance that is dependent only on the speed of the object. We'll also futher assume that air resistance is proportional to an integer power of the object's speed. The most important thing is that simplified assumptions or not, *air resistance always acts in a direction to oppose motion*. 

#### Air Resistance Proportional to the First Power of Velocity

Let's assume that the positive direction is downward, and that air resistance is proportional to the first power of the object's speed. The resultant differential equation is then:

$$ m \frac{dv}{dt} = gm - kv $$

If instead we assume that air resistance is proportional to second power of the object's speed, the resultant equation is:

$$ m \frac{dv}{dt} = gm - kv^2 $$

Integrating once gives us the velocity equation, and integrating twice gives us the positon equation. Given initial conditons of mass, time, and velocity we can then solve for velocity, position or time.

*Note* a body falling in water (for low velocities) obeys the same rules as a body falling in air; there will just be a different proportionality constant. Apparently, typically we consider resistance in air to be proportional to the square of the velocity and resistance in water to be proportional to the velocity.

##### Terminal Velocity

*jmh: my notes*

Assume the air resistance of a falling object is proportional to its velocity.

Then, the differential equation for the object's motion, taking the downward direction to be positive, is:

$$ m\frac{dv}{dt} = gm - kv $$

which simplifies to: 

$$ \frac{dv}{dt} = g - \frac{kv}{m} $$

Solving this differential equation for $v$ gives:

$$ v = \frac{gm}{k} + ce^{-\frac{k}{m}t} $$

Note that as $t$ increases towards infinity, $v$ approachs $gm/k$. We call the value $gm/k$ the **terminal velocity** of the object. Note that it does not depend on the initial velocity of the object nor its starting position, but does depend on the object's mass. This makes sense intuitively - given a balloon and a bowling ball of the same shape, we know the bowling ball will reach a much higher terminal velocity than the balloon. We also know the balloon will quickly reach its terminal velocity regardless of its initial height (top of a sky scraper vs top of a house makes no difference) and that the velocity added by throwing a balloon downwards is quickly lost.

#### Air Resistance Proportional to the Square of Velocity

Here are some good notes on finding the velocity and position as functions of time. https://philosophicalmath.wordpress.com/2017/10/21/terminal-velocity-derivation/

(*jmh: my notes*) One interesting thing from the book that isn't covered in the blog post above is finding velocity as a function of position.

To do this, we need to use the facts that $\frac{dv}{dt} = \frac{dv}{dy}\frac{dy}{dt}$ (the change in velocity with respect to time equals the change in velocity with respect to height times the change in height with respect to time) and $v = \frac{ds}{dt}$ (velocity equals the change in height with respect to the change in time) to get:

$$ \frac{dv}{dt} = v\frac{dv}{dy} $$

Now we can write the differential equation for the motion of a body falling with air resistance porportional the the square of velocity, taking the downard direction as positive, as:

$$ mv\frac{dv}{dy} = mg - kv^2 $$

Rearranging and adding initial conditions as bounds of integration (let $v_0$ be the starting velocity in the downward direction):

$$ \int_{v=v_0}^{v}\frac{vdv}{mg-kv^2} = \int_{y=0}^{y}\frac{dy}{m} $$

Finding the integrals and simplifying leads to:

$$ v^2 = \frac{mg}{k}(1-e^{\frac{-2ky}{m}})+{v_0}^2e^{\frac{-2ky}{m}} $$

Since the positive direction is downard we'd take the positive square roots above to find $v$.

You can use this approach to find velocity as a function of time too, but the result is messier than when you just integrate and then solve for the constant using initial conditions. However, if you want velocity a function of position (which is probably quite useful for finding the force something falling impacts the ground with), the blog post's method gets really messy because you have to find time as a function of position, then substitute that result for $t$ in the velocity function.

This is interesting because it's a different approach than what the blog post above takes - it uses the bounds of integration method that the book uses in the other applied chapters too. It's a very powerful technique, but it's not always the right technique.

### Far from the Surface of the Earth

Above, we assumed that the force of gravity is constant with respect to the distance from the surface of the earth. However, if an object is very far above the surface of the earth, we can't make that assumption, and must account for the force of gravity varying with position. In this case, (16.14) becomes:

$$ \tag{16.32} F = -G\frac{Mm}{r^2} $$

Replacing in (16.32) the value of $F$ as given in (16.1), we obtain:

$$ \tag{16.34} m\frac{dv}{dt} = -G\frac{Mm}{r^2},\quad \frac{dv}{dt} = -\frac{GM}{r^2} $$

Since $G$ and $M$ are constants, we can replace $GM$ by a new constant $k$, resulting in:

$$ \tag{16.35} \frac{dv}{dt} = -\frac{k}{r^2},\quad \frac{d^2r}{dt^2} = - \frac{k}{r^2} $$

where $v = dr/dt$.

#### Velocity as a Function of Distance

Velocity of a function of distance is interesting for at least two cases:

* For falling objects, finding the velocity when $r = 0$, i.e. maximum impact velocity, setting air resistance aside.
* For rising objects, setting velocity to $0$ finds the maximum distance an object will travel from the surface.

From above, we have:

$$ \tag{a} a = \frac{dv}{dt} = -\frac{k}{r^2} $$

Call $R$ the radius of the earth, substitute initial conditions $r=R$, $a=-g$ to find $k=gR^2$

Then (a) becomes:

$$ \tag{b} \frac{dv}{dt} = -\frac{gR^2}{r^2} $$

Since we're interested in velocity as a function of distance $r$, replace $dv/dt$ by its equivalent from (16.11):

$$ \tag{c} v\frac{dv}{dr} = \frac{-gR^2}{r^2}, \quad vdv = -\frac{gR^2}{r^2}dr $$

Integration of (c) and initial conditions of $v = v_0$, $r = R$ gives:

$$ \tag{d} \int_{v=v_0}^{v} vdv = -gR^2 \int_{r=R}^{r} \frac{dr}{r^2} $$

Whose solution is

$$ \tag{e} v^2 = {v_0}^2 + 2gR(\frac{R}{r} - 1) $$

Taking the positive square root for rising objects and the negative for falling we have:

$$ \tag{f} v = \pm \sqrt{ {v_0}^2 + 2gR(\frac{R}{r} - 1)} $$ 

## Horizontal Motion

In horizontal motion, we have friction between a moving object and the surface it's moving on. We call this **sliding friction** to distinguish it from the friction a stationary object has (*static friction*).

The amount of sliding friction for a given object moving on a given surface is determined by two factors:

1. The gravitational force pressing the object into the surface ($mg$).
2. The smoothness/roughness particular the object and surface and is given as the constant $\mu$ called the **coefficient of friction**.

Any force pushing the object must also be considered - let's call that $F$.

Recalling that mass $\times$ acceleration = net force acting on a body, we have the following equivalent equations of motion:

$$ m\frac{dv}{dt} = F - \mu mg, \quad v\frac{dv}{dx} = \frac{F}{m} - \mu g $$

In practice we usually have to deal with wind or water resistance too, which will just be another force in the negative direction on the right hand side of the equation.

*jmh*: Horizontal motion is pretty easy and boring compared to vertical motion.

## Inclined Motion

*jmh: my notes*

For an object with weight $\omega$ moving down an incline at angle $\alpha$ we have a couple of forces to consider:

1. The acceleration due to gravity. This is equal to $\omega\sin{\alpha}$ - that is, the vertical component of the slope multiplied times the weight of the object. This make sense - consider the case where $\alpha$ is $90\degree$; $\sin{90\degree} = 1$ so we get the full weight ($m\times g$) of the object.
2. The drag due to friction. Letting $\mu$ be the coefficient of friction, and the downward direction as positive, this is equal to $-\mu\omega\cos{\alpha}$; that is, the horizontal component of the slope multipled times the weight of the object and the coefficient of friction. For intuition, consider when $\alpha = 0\degree$. $\cos{0\degree} = 1$ so we get the full force of friction. As the angle increase, the friction decreases, which is why if you tip a table over, eventually the stuff sitting on it will slide off.

Thus, our equation of motion for an inclined object is:

$$ m\frac{dv}{dt} = \omega\sin{\alpha} - \mu\omega\cos{\alpha} $$

In practice, we usually have air resistance to deal with - another negative force on the right hand side of the equation.