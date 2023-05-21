## First Order Linear Electric Circuit

"The differential equation which results when an applied electromotive force $E$, an inductor $L$ and a resistor are connected in series is:"

$$ L\frac{di}{dt} + Ri = E \tag {17.63} $$

(*jmh*: my notes)

The above form is convenient for solving because it's in the form of a linear first order differential equation. It says that the electromotive force equals the inductance times the change in current with respect to time plus the current times the resistance.

We could rearrange it to say:

$$ \frac{di}{dt} = \frac{E}{L} - \frac{Ri}{L} $$

Which says that the change in current with respect to time is proportional to the current current (hiyo) plus the electromotive force divided by the inductance.

This [desmos link](https://www.desmos.com/calculator/tzigt2uc7x) has graphs of the solutions when the emf is direct or alternating.

Some interesting things to note:

* Increasing resistance reduces the peak current for both the DC and AC scenarios
* Increasing inductance decreases the rate of change of current for both DC and AC scenarios.
** For DC, this slows the ramp up/ramp down to the steady state current, which is $\frac{E}{R}$.
** For the AC scenario, the slower current change that comes from increasing inductance has the effect of reducing the peak current. This makes sense since the current is changing more slowly, it has less time to change before the voltage alternates and starts pushing the current back in the other direction.
** The lag in current change caused by the inductance brings the current out of phase with the emf. This is what results in the lower peak currents and is known as inductive reactance. Increasing inductance you can see that the current ends up being a quarter of a cycle ahead of the voltage. 
