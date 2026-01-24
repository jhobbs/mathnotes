---
layout: page
title: Flows on the Circle
---

Instead of a line, we can have flows on a circle:

$$ \dot{\theta} = f(\theta). $$

Here, $ \dot{\theta} = \frac{d\theta}{t}$ is the @angular-velocity.


{% include_demo "firefly-synchronization" %}

Each firefly has a natural uncoupled frequency, randomly assigned between 0.9hz and 1.1hz, and a random starting phase.

Then each fly updates its dynamic frequency to try to better match the frequency of the other flies. Nearby fireflies influence each other more strongly, and the overall strength of the matching force is controlled by the parameter K.

When K is 0, the flies all act independently. When K is high, they synchronize phase and frequency quickly. When K is in the middle, phase may synchronize globally while frequency synchronizes locally.

This demo uses the <a href="https://en.wikipedia.org/wiki/Kuramoto_model">Kuramoto model</a> for coupled oscillators.
