---
layout: page
title: Information Theory
---

:::definition "Self-Information" {synonyms: "surprisal", "Shannon information", "Information content"}
Given a real number $b > 1$ and an event $x$ with probability $P,$ the **self-information** is defined as the negative @log-probability

$$ I(x) := - \log_{b}(P). $$
:::
:::remark
We can view @self-information as an alternative casting of @probability, like how @odds are, with some desirable properties:

* An event with probability $1$ provides no information - we knew it was going to happen so it happening tells us nothing new.

* The less probable an event is, the more @surprisal it yields.

* @self-information is @additive - if two individual events are measured separately, the total amount of information is the sum of the @self-informations of the individual events.

The function given above is the unique function of probability (up to a multiplicative scaling factor) that satisfies these three properties.
:::


:::definition "Entropy"
Given a discrete @random-variable $X,$ which may be any @element $x$ within the set $\mathcal{X},$ and is distributed according to $p: \mathcal{X} \to [0,1],$ the **entropy** is

$$ H(X) := - \sum_{x \in \mathcal{X}} p(x) \log{p(x)}. $$

We can choose different bases for the logarithm; base 2 gives the unit of @bits and is a common choice.

An alternative, equivalent definition is that **entropy** is the @expected-value of the @self-information of a @random-variable.

The unit for entropy is information per symbol.
:::
:::remark
The @entropy of a @random-variable quantifies the average level of uncertainty or information associated with the variable's potential states of possible outcomes. It measures the expected amount of information needed to describe the state of the variable, considering the distribution of probabilities across all potential states.
:::

:::definition "Capacity"
Given an information source where all symbols are of the same time duration, and each symbol represents $s$ bits of information (because it is chosen freely among $2^s$ symbols), and the channel can transmit $n$ symbols per second ten the **capacity** $C$ of the channel is defined to be $ns$ bits per second.
:::
:::note
In the more general case we have to deal with symbols of various lengths that take different amounts of time to transmit, and so capacity measures not the number of symbols transmitted per second but the amount of information transmitted per second, retaining bits per second as its unit.
:::

:::theorem "Noiseless channel transmitting discrete symbols"
Given a communication channel which has a @capacity of $C$ bits per second, accepting signals from a source of @entropy (or information) of $H$ bits per symbols, it is possible, given a properly devised coding procedure, for the transmitter to transmit symbols over the channel at an average rate which is nearly $C/H$ but which, no matter how clever the coding, can never exceed $C/H.$
:::
:::note
The unit of $C$ is bits (information) per second, and the unit of $H$ is bits (information) per symbol, so we have

$$ \frac{bits}{second} \times \frac{symbols}{bit} = \frac{symbols}{second}, $$

so the unit of $C/H$ is symbols per second.

The best transmitter is one which codes the message in such a way that maximizes the signal entropy and makes it equal to the capacity of the channel, which allows reaching the maximum rate $C/H$ for the transmission of symbols.
:::

Examples to cover: [https://claude.ai/chat/0702d3b2-a181-4b5b-a572-e5464d9d24d5]

TODO: Relative Entropy
