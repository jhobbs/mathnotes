# Dilution and Accretion
(*jmh* my notes)

## Setting up the Differential Equation

We can use the idea of a tank of water with some amount of brine in it, some amount flowing out and some amount flowing in. The amount flowing out and flowing in are held constant in these problems, though I suspect with more advanced differential equations that doesn't have to be true.

Here's what we have to start with then, for initial conditions:

**Solution Starting Concentration**: mass/volume, i.e. lbs/gal

**Solution Starting Volume**: volume, i.e. gal

From this we can find the starting mass of the solute:

**Solute Starting Mass**: mass, i.e. lbs

Sometimes we're given the starting mass and starting volume and we can find the concentration from there if we need to, but we don't usually need to because it's not explicitly required in the formula we'll use to solve these.

We'll also be given some information about inflows and outflows.

**Inflow Volume Rate**: volume/time, i.e. gals/min

**Inflow Concentration**: mass/volume, i.e. lbs/gal.

**Outflow Volume Rate**: volume/time, i.e. gals/min - this quantity will be negative.

We can also find the **Inflow Mass Rate**, which is in mass/time and is the inflow volume rate multiplied by the inflow concentration.

Given the above information, we can setup a differential equation to model the mass of solute present in the solution - $x$ after a given amount of time - $t$ has passed. We can then say $x$ is the **Instantaneous Solute Mass**.

We need to account for two things - how much solute has been added by time $t$ through inflows and how much solute has been removed by time $t$ by outflows.

$$ \Delta x = (inflowMassRate - outflowMassRate)\Delta t $$
  
Here, $\Delta x$ is an abitrarily small change in the mass of the solute, and $\Delta t$ is an arbitrary small change in time.

We have the inflow mass rate but we don't know the outflow mass rate yet. We know the outflow volume rate and we need to know the solution conentration at any given point of time. The solution concentration will be the mass of the solute at time $t$ divided by the solution volume at time $t$.

The instantaneous solution volume will the starting solution volume plus the net flow rate times the amount of time that's passed. The net flow rate is the sum of the inflow volume rate and the outflow volume rate.

$$instantaneousSolutionVolume = startingSolutionVolume + (inflowVolumeRate + outflowVolumeRate)t $$

Keep in mind that $outflowVolumeRate$ will be a negative quantity.

Now, the instantaneous solution concentration will be the instantaneous solution mass divided by the instantaneous solution volume:

$$ instantaneousSolutionConcentration = \frac{x}{instantaneousSolutionVolume} $$
  
The outflow mass rate will be the instantaneous solution concentration times the outflow volume rate:
  
$$ outflowMassRate = instantaneousSolutionConcentration * outflowVolumeRate $$
  
Putting it all together, we get:

$$ \Delta x = \Delta T (inflowVolumeRate * inflowConcentration - \frac{x}{startingSolutionVolume + t(inflowVolumeRate + outflowVolumeRate)}) $$

Writing this as a differential equation, we get:

$$ \frac{dx}{dt} = inflowVolumeRate * inflowConcentration - \frac{x}{startingSolutionVolume + t(inflowVolumeRate + outflowVolumeRate)} $$

## Solving the Differential Equation
When setting up the differential equation above, we didn't use all the information given us. Specifically, we didn't use the starting solute mass or starting solute concentration. We'll need that information to find a particular solution for the differential equation.

One approach that always works is to solve the differntial equation to find a family of solutions with a constant $c$. Then, solve for $c$ by using the initial conditions: $x = startingSoluteMass$, $t = 0$. We now have a particular solution in the form:

$$ x = F(t, c) $$

We can use this to find an unknown mass $x$ at time $t$ or to find how much time $t$ must pass to reach a particular mass $x$.

*Note: I've seen these differential equations be either separable or linear. I believe, but haven't proven, that they are linear whenever both* $inflowConcentration \neq 0$ *and* $netFlowRate \neq 0,$ *and are separable otherwise*.  

Another approach that works if the differential equation is separable is to use initial and final conditions as limits of integration. I.e. if we can write the equation as:

$$ P(x)dx = Q(t)dt $$

Then, to find an unknown mass $x$ at time $t = endTime$ we can setup and equation of this form:

$$ \int_{x=startingSoluteMass}^x{P(x) dx} = \int_{t=0}^{t=endTime}{Q(t) dt} $$

And to find an unknown time $t$ at which we will reach $endMass$ we can setup an equation of this form:

$$ \int_{x=startingSoluteMass}^{x=endMass}{P(x) dx} = \int_{t=0}^{t}{Q(t) dt} $$
