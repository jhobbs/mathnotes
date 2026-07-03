---
layout: page
title: Entropy of a Discrete Information Source
slug: entropy-of-a-discrete-information-source
---

:::theorem "Noiseless channel transmitting discrete symbols"
Given a communication channel which has a @capacity of $C$ bits per second, accepting signals from a source of @entropy (or information) of $H$ bits per symbols, it is possible, given a properly devised coding procedure, for the transmitter to transmit symbols over the channel at an average rate which is nearly $C/H$ but which, no matter how clever the coding, can never exceed $C/H.$
:::
:::note
The unit of $C$ is bits (information) per second, and the unit of $H$ is bits (information) per symbol, so we have

$$ \frac{bits}{second} \times \frac{symbols}{bit} = \frac{symbols}{second}, $$

so the unit of $C/H$ is symbols per second.

The best transmitter is one which codes the message in such a way that maximizes the signal entropy and makes it equal to the capacity of the channel, which allows reaching the maximum rate $C/H$ for the transmission of symbols.
:::
