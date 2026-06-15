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

The demo below makes these quantities concrete. It uses a discrete alphabet of $N$ symbols whose probabilities follow a *Zipfian* distribution,

$$ p(n) = \frac{n^{-\alpha}}{\sum_{k=1}^{N} k^{-\alpha}}, \qquad n = 1, 2, \dots, N, $$

where the skew $\alpha$ controls how unevenly probability mass is spread across symbols. At $\alpha = 0$ every symbol is equally likely (the uniform distribution), so @entropy is maximal at $\log N.$ As $\alpha$ grows the distribution concentrates on the first few symbols, the rare symbols carry ever more @self-information, and the @entropy falls toward $0.$ The bar chart shows the probability of each symbol alongside its @self-information; the second chart traces the @entropy as $\alpha$ sweeps from uniform to highly skewed.

{% include_demo "zipf-entropy" %}

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

## Example: Coin Flip

For a fair coin flip, $X = \{h, t\}.$ $p(h) = p(t) = 0.5.$ Then, $I(h) = I(t) = - \log_{2}{(0.5)} = 1 \text{ bit},$ and

$$ H(X) = p(h) \cdot I(h) + p(t) \cdot I(t) = 0.5 \cdot 1 + 0.5 \cdot 1 = 1 \text{ bit}. $$

Let's say we have an unfair coin and $p(h) = 0.9, p(t) = 0.1.$ Then

$$ I(h) = - \log_{2}{(0.9)} \approx 0.152 \text{ bits}, \quad I(t) = - \log_{2}{(0.1)} \approx 3.32 \text{ bits}, $$

and for entropy of $X$ we get

$$ H(X) = p(h) \cdot I(h) + p(t) \cdot I(t) \approx 0.9 \cdot 0.152 + 0.1 \cdot 3.32 \approx 0.469 \text{ bits}. $$

## Example: Six-Sided Die

For a fair six-sided die, $X = \{1,2,3,4,5,6\}.$ $p(x) = 1/6.$ Then, $I(x) - \log_{2}{(1/6)} = \log_{2}(6) \approx 2.58 \text{ bits},$ and

$$ H(X) = 6 \cdot \frac{1}{6} \cdot I(x) = I(x) \approx 2.58 \text{ bits}. $$

Let's say we have an unfair die and $p(1) = 0.5, p(x \in \{2,3,4,5,6\}) = 0.1.$ Then

$$ I(1) = - \log_{2}{(0.5)} = 1 \text{ bit}, \quad I(x \in \{2,3,4,5,6\}) = - \log_{2}{(0.1)} \approx 3.32 \text{ bits}, $$

and for entropy of $X$ we get

$$ H(X) = p(1) \cdot I(1) + 5 \cdot p(x \in \{2,3,4,5,6\}) \cdot I(x \in \{2,3,4,5,6\}) \approx 0.5 \cdot 1 + 5 \cdot 0.1 \cdot 3.32 \approx 2.16 \text{ bits}. $$

Some things to note from above:

:::theorem
When we have a uniform distribution, the @self-information of any given @element of a @random-variable with $N$ @elements equals the @entropy of the @random-variable and is $log{N}.$
:::

:::theorem
A @random-variable has the most @entropy when its @elements are all equally likely to occur.
:::
:::note
When we decrease the probability of an @element occurring, its @self-information increases only logarithmically, while its weight in the entropy sum decreases linearly. 
:::

TODO: Relative Entropy
