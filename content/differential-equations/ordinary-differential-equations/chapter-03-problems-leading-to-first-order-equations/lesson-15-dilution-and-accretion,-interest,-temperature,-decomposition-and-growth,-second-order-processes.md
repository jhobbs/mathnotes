---
description: Mathematical modeling of mixing problems, population dynamics, and chemical
  processes using first-order differential equations. Includes systematic approaches
  to setup and solve rate-based problems with practical applications.
layout: page
redirect_from:
- ode/chapter 03 - problems leading to first order equations/lesson 15 - dilution
  and accretion, interest, temperature, decomposition and growth, second order processes
- /differential-equations/ordinary differential-equations/chapter 03 - problems leading
  to first order equations/lesson 15 - dilution and accretion, interest, temperature,
  decomposition and growth, second order processes
title: Dilution and Accretion
---

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
  
Putting it all together and using differentials, we get:

$$ \tag{15.1j} dx = dt (inflowVolumeRate * inflowConcentration - \frac{x}{startingSolutionVolume + t(inflowVolumeRate + outflowVolumeRate)}) $$

Writing this as a differential equation, we get:

$$ \tag{15.2j} \frac{dx}{dt} = inflowVolumeRate * inflowConcentration - \frac{x}{startingSolutionVolume + t(inflowVolumeRate + outflowVolumeRate)} $$

## Solving the Differential Equation
When setting up the differential equation above, we didn't use all the information given us. Specifically, we didn't use the starting solute mass or starting solute concentration. We'll need that information to find a particular solution for the differential equation.

One approach that always works is to solve the differntial equation to find a family of solutions with a constant $c$. Then, solve for $c$ by using the initial conditions: $x = startingSoluteMass$, $t = 0$. We now have a particular solution in the form:

$$ x = F(t, c) $$

We can use this to find an unknown mass $x$ at time $t$ or to find how much time $t$ must pass to reach a particular mass $x$.

Another approach that works if the differential equation is separable is to use initial and final conditions as limits of integration. I.e. if we can write the equation as:

$$ P(x)dx = Q(t)dt $$

Then, to find an unknown mass $x$ at time $t = endTime$ we can setup and equation of this form:

$$ \int_{x=startingSoluteMass}^x{P(x) dx} = \int_{t=0}^{t=endTime}{Q(t) dt} $$

And to find an unknown time $t$ at which we will reach $endMass$ we can setup an equation of this form:

$$ \int_{x=startingSoluteMass}^{x=endMass}{P(x) dx} = \int_{t=0}^{t}{Q(t) dt} $$

### Forms of the Solution

I've seen these differential equations be either separable or linear.

*Conjecture*:
Let

$$  a = inflowMassRate,~b = outflowVolumeRate,~c = netFlowRate, v= startingSolutionVolume, ~c\neq0, a\neq0 $$

When both $a \neq 0$ and $c \neq 0$, an unseparable linear first order differential equation results. Otherwise, a separable linear first order differential equation results, as long as either $v \neq 0$ or $a \neq 0$.

We can setup a differential equation by substituting these values into (15.1j) - we'll use this for the proof:

$$ \tag{15.3j} dx = dt(a + \frac{bx}{v+ct}) $$

Here is a proof that when $a \neq 0$ and $c \neq 0,$ we get a linear first order differential equation, and a resulting formula for easily solving problems of this form.

Rearranging this, we can get a linear first order differential equation:

$$ \frac{dx}{dt} - \frac{bx}{v+ct} = a $$

Whose solution is:

$$ x = \frac{a(v+ct)}{c-b} + k(v+ct)^{b/c} $$

where $k$ is the constant of integration. To find $k$, set $x = startingSoluteMass$, $t = 0$ and solve for $k$:

$$ k = v^{\frac{-b}{c}}(x - \frac{av}{c-b}) $$

*Note: unlike the other cases, it doesn't seem possible to solve for t here, meaning it's not possible to exactly determine when the solution will reach a certain mass of solute.*

We now have to address the cases we excluded above, namely, whenever $a = 0$ or $c = 0$.

Let's assume $netFlowRate = c = 0,~inflowMassRate = a \neq 0$.

Taking $c = 0$ (and $a$ can take any value) in (15.3j) we get:

$$ dx = dt(a+\frac{bx}{v}) $$

which can be rewritten as a separated first order differential equation:

$$ \frac{dx}{a+\frac{bx}{v}} = dt $$

Whose solution is:

$$ x = ke^{\frac{bt}{v}}-\frac{av}{b}, \quad b \neq 0, v \neq 0 $$

To find $k$, set $t = 0$ and $x = solutionStartingMass$ and solve for $k$:

$$ k = e^{\frac{-bt}{v}}(x + \frac{va}{b}) $$

To find the time it takes to reach a given solute mass, solve for $t$:

$$ t = \frac{v}{b}\ln({\frac{1}{k}(x+va)}) $$

Note that we had to exclude two cases here:
* where the initial solution volume ($v$) is zero, which makes sense. If there is no net flow and no starting solution volume, there is no volume, and so the concentration of solute is undefined)
* where the outflow rate ($b$) is 0. This also makes sense with a little thought - if the outflow rate is 0 and the net flow rate is zero, the the inflow rate must also be 0 and we get:

$$ dx = 0,~x+k =0,~x = k $$

which means the concentration is constant - whatever it started as.

Now let's consider the case where $inflowMassRate = a = 0,~netFlowRate = c \neq 0$.

We can setup a differential equation by taking $a = 0,~c \neq 0$ in (15.3j):

$$ dx = dt (\frac{bx}{v+ct}) $$

Which can be written as the separate first order differential equation:

$$ \frac{dx}{bx} = \frac{dt}{v+ct} $$

Whose solution is:

$$ x = k(ct+v)^{\frac{b}{c}} $$

To find $k$, set $t = 0$, $x = solutionStartingMass$ and solve for $k$:

$$ k = xv^{\frac{-b}{c}} $$

To find the time it takes to reach a solute mass $x$, solve for $t$:

$$ t = \frac{\frac{x}{k}^{\frac{c}{b}}-v}{c} $$

QED.

## Dilution Visualization
{% include_demo "dilution-visual" %}

## Dilution Calculator
{% include_demo "dilution-calculator" %}