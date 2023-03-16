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

If $y$ is relatively small compared to the radius of the earth, then we can accurately approximate (16.14) as:

$$ \tag{16.15} F = -\frac{GMm}{R^2} $$

By (16.1) with $y$ replacing $s$, we can write (16.15) as:

$$ \tag{16.16} m\frac{d^2y}{dt^2} = - \frac{GMm}{R^2} $$

Since $G$, $M$, and $R$ are constants, we may replace $GM/R^2$ by a new constant $g$. We thus finally obtain for the differential equation of motion of a falling body in the gravitational field of the earth:

$$ \tag{16.17} m\frac{d^2y}{dt^2} = -gm,\quad m\frac{dv}{dt} = -gm $$

Simplifying (16.17) we have:

$$ \tag{16.18} m\frac{d^2y}{dt^2} = -gm $$

The constant $g$ is thus the acceleration of a body due to the earth's **force of gravity**. Its value varies slightly for different locations on earth and for different heights, but for convenience we'll use the value $32 ft/sec^2$.


where $v = dy/dt$
