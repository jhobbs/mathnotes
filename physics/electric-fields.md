---
layout: page
title: Electric Fields
---

# Electric Fields

The electric field is a vector field that gives the force due to a charged particle in the surrounding space. The force on a test charge $q_0$ due to the particle with charge $q$ is

$$ \vec{F} = \frac{1}{4 \pi \epsilon_0} \frac{q q_0}{r^2} \hat{r} $$

Then, the electric field set up by the particle at the location of the test charge is

$$ \vec{E} = \frac{\vec{F}}{q_0}  = \frac{1}{4 \pi \epsilon_0} \frac{q}{r^2} \hat{r} $$

The magnitude of the electric field $\vec{E}$ set up by a particle with charge $q$ at distance $r$ from the particle is

$$ E  = \frac{1}{4 \pi \epsilon_0} \frac{|q|}{r^2} $$

Electric fields follow the principle of superposition - if we have multiple particles, we find the net electric field by adding the electric fields from each particle.


An electric dipole consists of two particles with charges of equal magnitude $q$ but opposite signs, separated by a small distance $d$.

The electric dipole moment $\vec{p}$ had magnitude $qd$ and points from the negative charge to the positive charge.

The magnitude of the electric field setup by an electric dipole at a distant point on the dipole axis (which runs through both bodies) can be written as

$$ E = \frac{1}{2 \pi \epsilon_0} \frac{qd}{z^3} = \frac{1}{2 \pi \epsilon_0} \frac{p}{z^3}. $$

The torque on a dipole in an electric field depends on the moment of the dipole and the electric field. Both of these are vector quantities. The magnitude of the moment of the dipole is given as the product $qd$, where $q$ is the magnitude of the charge of each pole of the dipole, and $d$ is the distance they are separated. The torque is given as

$$ \tau = \vec{p} \times \vec{E} $$

and when the angle between the moment and the electric field is $\theta$, this reduces to

$$ \tau = -pE\sin{\theta} $$

where $p$ and $E$ are the respective magnitudes of the dipole moment and electric field.

Here's a simulation of an electric field. Press the down arrow key to switch to making negatively charged particles, and spacebar sets them in motion.

{% include_relative electric-field.html %}

Because the force vectors near particles are so big, it can be hard to tell what's going on, especially in the case of negatively charged particles where they point from one side of the particle to the other and make it appear as though there are conflicting force vectors. However, this is an accurate depiction of the behavior of the forces, which approach infinity as they approach point charges.

Collision isn't handled properly so different weird things can happen.
