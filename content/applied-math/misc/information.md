---
layout: page
title: Information Theory
---

# Capacity of a Discrete Channel

:::definition "Discrete Channel"
A system whereby a @sequence of choices from a @finite @set of elementary symbols $S_1 \cdots S_n$ and be transmitted from one point to another. Each of the symbols $S_i$ is assumed to have a certain duration in time $t_i$ seconds (not necessarily the same for different $S_i$).
:::

:::definition "Capacity" {synonyms: "channel-capacity"}
The **capacity** $C$ of a @discrete-channel is given by

$$ C = \lim_{t \to \infty} \frac{\log{N(t)}}{t}, $$

where $N(t)$ is the number of allowed @signals of duration $T.$ 
:::
:::note
Given an information source where all symbols are of the same time duration, and each symbol represents $s$ bits of information (because it is chosen freely among $2^s$ symbols), and the channel can transmit $n$ symbols per second ten the **capacity** $C$ of the channel is defined to be $ns$ bits per second.

In the more general case we have to deal with symbols of various lengths that take different amounts of time to transmit, and so capacity measures not the number of symbols transmitted per second but the amount of information transmitted per second, retaining bits per second as its unit.

If $N(t)$ represent the number of @sequences of duration $t,$ then

$$ N(t) = N(t - t_1) + N(t - t_2) + \cdots + N(t - t_n). $$

This number is equal to the sum of the numbers of sequences ending in $S_1, S_2, \dots, S_n.$ This is a recursive definition - if the last symbol is $S_i,$ and then we have $t - t_i$ time remaining for the previous symbols in the sequence, and we repeat the same question on that remainder.

A "well-known result" in finite differences tells us that

$$ \lim_{t \to \infty} N(t) = A X_0^t, $$

where $A$ is constant and $X_0$ is the largest real solution of the @characteristic-equation:

$$ X^{-t_1} + X^{-t_2} + \cdots + X^{-t_n} = 1, $$

and therefore 

$$ C = \lim_{t \to \infty} \frac{\log{A X_0^t}}{t} = \log{X_0}. $$
:::

:::example
Consider Morse code as used in telegraph. We have the following rules:

* A **dot** symbol consists of one time unit of line closure followed by one time unit of line open.

* A **dash** symbol consists of three time units of line closure followed by one time unit of line open.

* A **letter space** symbol consists of three time units of line open.

* A **word space** symbol consists of six time units of line open.

We're never allowed to send two space symbols in a row, because two sequential letter space symbols are indistinguishable from a word space symbol.

Now, our possible terminating states are

| Symbol | Composition | Duration (time units) |
|:--------|:-------------|:-----------------------|
| Dot | 1 unit closed + 1 unit open | 2 |
| Dash | 3 units closed + 1 unit open | 4 |
| Letter space preceded by dot | 1 unit closed + 4 units open | 5 |
| Letter space preceded by dash | 3 units closed + 4 units open | 7 |
| Word space preceded by dot | 1 unit closed + 7 units open | 8 |
| Word space preceded by dash | 3 units closed + 7 units open | 10 |

Note that we had to consider the last two symbols in the case of the last symbol being a space in order to deal with our "no sequential spaces" constraint.

Now we have

$$ N(t) = N(t - 2) + N(t - 4) + N(t - 5) + N(t - 7) + N(t - 8) + N(t - 10). $$

So, our characteristic equation is

$$ W^{-2} + W^{-4} + W^{-5} + W^{-7} + W^{-8} + W^{-10} = 1. \tag{a} $$

With a substitution of $w = 1/W$ we get

$$ w^{2} + w^{4} + w^{5} + w^{7} + w^{8} + w^{10} = 1, $$

and $w_0,$ the largest positive root of this equation, found numerically, is about $1.4529,$ and so

$$ C = -\log_{2}{(w_0)} \approx 0.539 \text{ bits per unit of time}. $$

Note that in this Morse telegraphy system, we have two states that the channel can be in, based on what the previous symbol transmitted was.

* If the previous symbol transmitted was a space, we're in state $1,$ and the next symbol can only be a dot or a dash, and the state will change.

* If the previous symbol transmitted was not a space, we're in state $2,$ and the next symbol can be anything, and the state may or may not change depending on what the next symbol is.

We can think of these states being the @nodes of a @directed-graph with the @edges being the @vertices. A generalization of this is given in the theorem below.
:::

:::theorem
Let $b_{ij}^{(s)}$ be the duration of the $s$-th symbol which is allowable in state $i$ and leads to state $j.$ Then the @channel-capacity of $C$ is equal to $log{W}$ where $W$ is the largest real root of the @determinantal-equation

$$ \left | \sum_{s} W^{-b_{ij}^{(s)}} - \delta_{ij}  \right | = 0, $$

where $\delta_{ij}$ is the @Kronecker-delta.
:::
:::example
For example, for our Morse telegraphy example, we have

$$ \begin{vmatrix} -1 & W^{-2} + W^{-4} \\ W^{-3} + W^{-6} & W^{-2} + W^{-4} - 1 \end{vmatrix} = 0. $$

Expanding the @determinant on the LHS gives the @characteristic-equation $(a)$ above.
:::


# Information and Entropy in a Discrete Channel

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
