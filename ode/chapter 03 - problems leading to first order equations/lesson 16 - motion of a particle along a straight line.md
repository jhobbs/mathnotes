# Preliminaries 

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

Hence we cna also write (16.1) as:

$$ \tag{16.111} F = mv\frac{dv}{ds} $$

That is, Force = Mass * Velocity * (rate of change of velocity with respect to displacement)

Newton also gave us the law of attraction between bodies. If $m_1$ and $m_2$ are the masses of two bodies whose centers of gravity are $r$ distance apart, the force of attraction between them is given by:

$$ \tag{16.12} F = k\frac{m_1 m_2}{r^2} $$

where $k > 0$ is a proportionality constant.

# Vertical Motion

Let:

$M$ = mass of the earth, assumed to be a sphere

$m$ = mass of a body in the earth's gravitational field

$R$ = the radius of the earth

$y$ = the distance of the body above the earth's surface

By (16.12) the force of attraction between earth and body is (assuming their masses are concentrated at their respective centers):

$$ \tag{16.14} F = -G \frac{Mm}{(R+y)^2} $$

The proportionality constant $G$ is called the **gravitational constant**. We use the negative sign because the resultant force is downward towards the earth's surface, and here we're considering our positive direction to be upward.

## Vertical Motion with no Air Resistance and Close to the Surface of the Earth

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

## With Air Resistance

Above, we didn't consider air resistance. It's complicated in reality - air resistance varies with, among other things, the air density and the object's speed. Air density itself varies with height and with time. Here we will make simplifying assumptions that we have a constant atmosphere and an air resistance that is dependent only on the speed of the object. We'll also futher assume that air resistance is proportional to an integer power of the object's speed. The most important thing is that simplified assumptions or not, *air resistance always acts in a direction to oppose motion*. 

Let's assume that the positive direction is downward, and that air resistance is proportional to the first power of the object's speed. The resultant differential equation is then:

$$ m \frac{dv}{dt} = gm - kv $$

If instead we assume that air resistance is proportional to second power of the object's speed, the resultant equation is:

$$ m \frac{dv}{dt} = gm - kv^2 $$

Integrating once gives us the velocity equation, and integrating twice gives us the positon equation. Given initial conditons of mass, time, and velocity we can then solve for velocity, position or time.

*Note* a body falling in water (for low velocities) obeys the same rules as a body falling in air; there will just be a different proportionality constant. Apparently, typically we consider resistance in air to be proportional to the square of the velocity and resistance in water to be proportional to the velocity.

### Terminal Velocity

Assume the air resistance of a falling object is proportional to its velocity, with the proportionality constant being $km$ - that is, some $k$ times the object's constant mass.

Then, the differential equation for the object's motion, taking the downward direction to be positive, is:

$$ m\frac{dv}{dt} = gm - kmv $$

which simplifies to: 

$$ \frac{dv}{dt} = g - kv $$

Solving this differential equation for $v$ gives:

$$ v = \frac{g}{k} + ce^{-kt} $$

Note that as $t$ increases towards infinity, $v$ approachs $g/k$. We call the value $g/k$ the **terminal velocity** of the object. Note that it does not depend on the initial velocity of the object nor its starting position.

## Far from the Surface of the Earth

Above, we assumed that the force of gravity is constant with respect to the distance from the surface of the earth. However, if an object is very far above the surface of the earth, we can't make that assumption, and must account for the force of gravity varying with position. In this case, (16.14) becomes:

$$ \tag{16.32} F = -G\frac{Mm}{r^2} $$

Replacing in (16.32) the value of $F$ as given in (16.1), we obtain:

$$ \tag{16.34} m\frac{dv}{dt} = -G\frac{Mm}{r^2},\quad \frac{dv}{dt} = -\frac{GM}{r^2} $$

Since $G$ and $M$ are constants, we can replace $GM$ by a new constant $k$, resulting in:

$$ \tag{16.35} \frac{dv}{dt} = -\frac{k}{r^2},\quad \frac{d^2r}{dt^2} = - \frac{k}{r^2} $$

where $v = dr/dt$.
