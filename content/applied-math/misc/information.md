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

:::remark
In a related vein we can develop a function that asks how much choice is involved in the selection of an event, or equivalently, how much uncertainty there is in the outcome. If $p_1, p_2, \dots, p_n$ are the probabilities of events occurring, we want a measure $H(p_1, p_2, \dots, p_3)$ that has the following properties:

1. $H$ should be @continuous in the $p_i.$ That is, a small change in a $p_i$ should result in a small change in $H.$

2. If all the $p_i$ are equal, $p_i = \frac{1}{n},$ then $H$ should be a @monotonic @increasing @function of $n.$ With equally likely events there is more choice, or uncertainty, when there are more possible events.

3. If a choice is broken down into two successive choices, the original $H$ should be the weighted sum of the individual values of $H.$ For example, we should have that

$$ H(\frac{1}{2}, \frac{1}{3}, \frac{1}{6}) = H(\frac{1}{2}, \frac{1}{2}) + \frac{1}{2}H(\frac{2}{3}, \frac{1}{3}). $$
:::

:::definition "Entropy"
Given a discrete @random-variable $X,$ which may be any @element $x$ within the set $\mathcal{X},$ and is distributed according to $p: \mathcal{X} \to [0,1],$ the **entropy** is

$$ H(X) := - \sum_{x \in \mathcal{X}} p(x) \log{p(x)}. $$

We can choose different bases for the logarithm; base 2 gives the unit of @bits and is a common choice.

An alternative, equivalent definition is that **entropy** is the @expected-value of the @self-information of a @random-variable.

The unit for entropy is information per symbol.
:::

:::definition "Commensurable" {synonyms: "commeasurable"}
Real numbers $a_1, \dots, a_n$ are **commensurable** if there exists a common measure $m \in \mathbb{R}_{>0}$ such that each $a_i$ is an integer multiple of it:
$$
    a_i = k_i\, m, \qquad k_i \in \mathbb{Z}, \quad i = 1, \dots, n.
$$
Equivalently, all pairwise ratios are rational: $a_i / a_j \in \mathbb{Q}$ for all $i, j$ (with $a_j \neq 0$).
:::

:::theorem
The only $H$ satisfying the three required properties above is the @entropy function defined above, up to multiplication by a constant.

::::proof
Assume we have a function $A(n)$ that satisfies the three properties listed above, such that

$$ A(n) = H(\frac{1}{n}, \frac{1}{n}, \dots, \frac{1}{n}). $$

Then, by property (3) above, we can decompose a choice from $s^m$ equally likely possibilities into a sequence of $m$ choices each from $s$ equally likely possibilities. For example, if we have $2^4$ equally likely possibilities, the probability of any given event is $1/16$. If we instead we have a series of $4$ choices each with $1/2$ probability, we end up with $1/16$ as the probability of any specific sequence of events. So, we have that $A(s^m) = m A(s).$

Now, with arbitrarily large $n,$ we can also have $t^n$ such that $A(t^n) = nA(t),$ by the same logic, and we can pick $m$ such that

$$ s^m \leq t^n < s^{m+1}. $$

Now, we can take the logarithm of each term to get

$$ m \log{s} \leq n \log{t} < (m+1)\log{s}, $$

and dividing by $n \log{s}$ gives

$$ \frac{m}{n} \leq \frac{\log{t}}{\log{s}} < \frac{m}{n} + \frac{1}{n}, $$

and because $n$ is arbitrarily large, 

$$ \left | \frac{m}{n} - \frac{\log{t}}{\log{s}} \right | < \epsilon, $$

where $\epsilon$ is arbitrarily small.

By property (2) of $A(n)$ (it is a @monotonically-increasing function of $n$,)  

$$ \begin{aligned}
A(s^m) & \leq A(t^n) \leq A(s^{m+1}) \\
mA(s) & \leq nA(t) \leq (m+1)A(s).
\end{aligned}
$$

Then, dividing by $nA(s)$ gives

$$ \frac{m}{n} \leq \frac{A(t)}{A(s)} \leq \frac{m}{n} + \frac{1}{n} \text{ or } \left | \frac{m}{n} - \frac{A(t)}{A(s)} \right | < \epsilon, $$

Now, by the @triangle-inequality, we have that

$$ \begin{aligned}
\left | \frac{A(t)}{A(s)} - \frac{\log{t}}{\log{s}} \right | & \leq 2 \epsilon \\
\left | A(t) - \frac{A(s)}{\log{s}} \log{t} \right | & \leq 2 \epsilon.
\end{aligned}
$$

Since $\epsilon$ can be arbitrarily small, we have that $A(t) = K \log(t),$ with $K > 0$ so that property (2) holds. Now we know what $A(n)$ is, and thus what $H$ is when we have equal probabilities for all events.

Now let's say that we have a choice from $n$ possible events with @commensurable probabilities $p_i = \frac{n_i}{\sum n_i}.$ We can break down a choice from $\sum n_i$ possibilities into a choice from $n$ possibilities with probabilities $p_1, \dots, p_n$ and then, if the $i$th possibility was chosen, $n_i$ choices of equal probability $p_i.$ We do this because above, we found how to find $H$ when all events are equally likely, and property (3) of our desired function lets us break down our overall choice from $\sum n_i$ possibilities. This gives us

$$ \begin{aligned}
K \log{\sum n_i} & = H(p_1, \dots, p_n) + \sum p_i H(n_i) \\
                 & = H(p_1, \dots, p_n) + \sum p_i K \log{n_i} \\
                 & = H(p_1, \dots, p_n) + K \sum p_i \log{n_i}. \\
\end{aligned}
$$

Then,
$$ \begin{aligned}
H(p_1, \dots, p_n) & = K \log{\sum n_i} - K \sum p_i \log{n_i}  \\
                   & = K \left [ \log{\sum n_i} - \sum p_i \log{n_i}  \right ] \\
                   & = K \left [ \sum p_i \left ( \log{\sum n_i} \right ) - \sum p_i \left ( \log{n_i} \right )  \right ] \quad \text{ because } \sum p_i = 1  \\
                   & = K \left [ \sum p_i \left ( \log{\sum n_i} -  \log{n_i} \right )  \right ]  \\
                   & = K \left [ \sum p_i \left ( - \log{\frac{n_i}{\sum n_i}} \right )  \right ]  \\
                   & = - K  \sum p_i \log{p_i }.  \\
\end{aligned}
$$

If the $p_i$ are incommensurable, we can approximate them as closely as we'd like with @rationals, since @rationals-are-dense-in-reals. By the first property we assumed for $H,$ it is @continuous in the $p_i,$ and so its value at the incommensurable $p_i$ equals its @limit as we approach via the @rationals, and so our expression holds in general. $K$ is left to us to pick, picking it is equivalent to picking a base for the logarithm.
::::
:::


:::remark
The @entropy of a @random-variable quantifies the average level of uncertainty or information associated with the variable's potential states of possible outcomes. It measures the expected amount of information needed to describe the state of the variable, considering the distribution of probabilities across all potential states.
:::

The demo below makes these quantities concrete. It uses a discrete alphabet of $N$ symbols whose probabilities follow a *Zipfian* distribution,

$$ p(n) = \frac{n^{-\alpha}}{\sum_{k=1}^{N} k^{-\alpha}}, \qquad n = 1, 2, \dots, N, $$

where the skew $\alpha$ controls how unevenly probability mass is spread across symbols. At $\alpha = 0$ every symbol is equally likely (the uniform distribution), so @entropy is maximal at $\log N.$ As $\alpha$ grows the distribution concentrates on the first few symbols, the rare symbols carry ever more @self-information, and the @entropy falls toward $0.$ The bar chart shows the probability of each symbol alongside its @self-information; the second chart traces the @entropy as $\alpha$ sweeps from uniform to highly skewed.

{% include_demo "zipf-entropy" %}


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

## Some Theorems on Entropy

:::theorem
When we have a uniform distribution, the @self-information of any given @element of a @random-variable with $N$ @elements equals the @entropy of the @random-variable and is $log{N}.$
:::

:::theorem
$H = 0$ iff all the $p_i$ but one are zero, this one having the value of one.
::::proof
Suppose $H(p_1, \dots, p_n) = 0.$ Then, $0 = - \sum_{i=1}^n p_i \log{p_i}.$ Note that because $0 \leq p_i \leq 1,$ we have $\log{p_i} \leq 0,$ and $-p_i \log{p_i} \geq 0.$  Assume for contradiction that more than one $p_i$ is non-zero. Then, because $\sum p_i = 1,$ each non-zero $p_i$ is in $(0, 1)$ and therefore its $- p_i \log{p_i} > 0,$ and the sum of these terms is therefore non-zero, a contradiction. Now, since all probabilities are required to sum to 1, it can't be the case that all probabilities are zero, which means that exactly one probability must be non-zero and that probability must be $1.$
::::
:::

:::theorem
A @random-variable has the most @entropy when its @elements are all equally likely to occur.

::::proof
We will use a @Lagrangian function of @entropy to show this. Let

$$ \mathcal{L}(\vec{p}, \lambda) = - \sum_i \left [ p_i \ln{p_i} \right ] - \lambda \left [ \sum_i \left ( p_i - 1 \right ) \right ]. $$

Then, for any $p_i$ we want

$$ \begin{aligned} 
\frac{\partial \mathcal{L}}{\partial p_i} & = -\ln{p_i} - 1 - \lambda = 0 \\
                                          & \implies p_i = e^{-1 - \lambda}.
\end{aligned} $$

But, this means $p_i$ doesn't depend on $i,$ and so is the same for each $i$ and therefore $p_i = \frac{1}{n}.$

It remains to show that this extreme of $H$ is a maximum. This follows from the facts that the domain is a @convex, @compact set and that the entropy function is strictly @concave. TODO: more details on these.
::::
:::

:::theorem
Suppose there are two events, $x$ and $y,$ with $m$ possibilities for $x$ and $n$ for $y.$ Let $p(i,j)$ be the probability of the joint occurrence of $i$ for the first and $j$ for the second.

The @entropy of a joint event, $H(x,y),$ is less than or equal to the sum of the individual entropies, i.e.

$$ H(x,y) \leq H(x) + H(y), $$

with equality iff the events are independent, that is, iff $p(i,j) = p(i)p(j).$

::::proof
Suppose there are two events, $x$ and $y,$ with $m$ possibilities for $x$ and $n$ for $y.$ Let $p(i,j)$ be the probability of the joint occurrence of $i$ for the first and $j$ for the second. The @entropy of the joint event is then

$$ H(x,y) = - \sum_{i,j} p(i,j) \log{p(i,j)}. $$

This is just treating each possible pair of individual possibilities for each event as their own event, i.e. we have $m \times n$ possible events. Now,

$$ H(x) = - \sum_{i,j} p(i,j) \log{\sum_{j}{p(i,j)}}, \quad H(y) = - \sum_{i,j} p(i,j) \log{\sum_{i}{p(i,j)}}. $$

So,

$$ \begin{aligned}
H(x) + H(y) - H(x,y) & = - \sum_{i,j} p(i,j) \log{\sum_{j}{p(i,j)}} - \sum_{i,j} p(i,j) \log{\sum_{i}{p(i,j)}} + \sum_{i,j} p(i,j) \log{p(i,j)} \\
                    & = \sum_{i,j} p(i, j) \left ( \log{p(i,j)} - \log{\sum_{j}{p(i,j)}} - \log{\sum_{i}{p(i,j)}}  \right ) \\
                    & = \sum_{i,j} p(i, j) \left ( \log{p(i,j)} - \log{p(i)} - \log{p(j)}  \right ) \\
                    & = \sum_{i,j} p(i, j) \left ( \log{\frac{p(i,j)}{p(i)p(j)}}  \right ) \\
                    & = - \sum_{i,j} p(i, j) \left ( \log{\frac{p(i)p(j)}{p(i,j)}}  \right ) 
\end{aligned} $$

Now, let's define a new random variable for convenience, $Z(i,j) = \frac{p(i)p(j)}{p(i,j)}.$ We now have that

$$ \begin{aligned}
H(x) + H(y) - H(x,y) & = - \sum_{i,j} p(i, j) \left ( \log{\frac{p(i)p(j)}{p(i,j)}}  \right ) \\
                     & = - \sum_{i,j} p(i, j) \left ( \log{Z}  \right ) \\
                     & = -E[\log{Z}]. \\
\end{aligned}$$

Now, by @jensens-inequality, because @log-is-concave, we have that $E[\log{Z}] \leq \log{E[Z]}.$ Now,

$$ \begin{aligned}
E[Z] & = \sum_{i,j} p(i,j) \cdot \frac{p(i)p(j)}{p(i,j)} \\
     & = \sum_{i,j}p(i)p(j) \\
     & = \big ( \sum_{i}p(i) \big ) \big ( \sum_{j}p(j) \big )  \\
     & = 1 \cdot 1 \\
     & = 1. \\
\end{aligned} $$
Therefore $\log{E[Z]} = \log{1} = 0,$ and we have that $E[\log{Z}] \leq 0 \implies -E[\log{Z}] \geq 0,$ and

$$ \begin{aligned}
H(x) + H(y) - H(x,y) & \geq 0 \\
- H(x,y) & \geq -H(x) -H(y) \\
H(x,y) & \leq H(x) + H(y). \\
\end{aligned} $$

Now, for the equality part. Suppose $H(x) + H(y) = H(x,y).$ Then, $E[\log{Z}] = 0,$ and recalling that $E[Z] = 1,$ $E[\log{Z}] = \log{E[Z]} = 0.$ In @jensens-inequality, equality holds only if our function is @affine or if $Z$ is constant; since $\log$ is @affine on no interval, $Z$ must be constant, and since $E[Z] = 1,$ $Z = \frac{p(i)p(j)}{p(i,j)} = 1 \implies p(i)p(j) = p(i,j).$ 

Now, suppose $p(i)p(j) = p(i,j).$ Then $Z = 1$ and

$$ H(x) + H(y) - H(x,y) = - \sum_{i,j} p(i, j) \left ( \log{1}  \right ) = 0, $$

so $H(x) + H(y) = H(x,y).$

note that @jensens-inequality gives us equality iff $Z$ is (almost surely) constant. Since $Z = \frac{p(i)p(j)}{p(i,j)},$ it's constant iff $p(i,j) = p(i)p(j).$

::::
:::

:::note
When we decrease the probability of an @element occurring, its @self-information increases only logarithmically, while its weight in the entropy sum decreases linearly. 
:::

:::theorem
For any @doubly-stochastic @matrix $A$ and @probability-vector $\vec{p},$ $H(A \vec{p}) \geq H(\vec{p}),$ with equality iff $A\vec{p}$ is a @rearrangement of $\vec{p}$.

:::

TODO: Relative Entropy

:::theorem "Noiseless channel transmitting discrete symbols"
Given a communication channel which has a @capacity of $C$ bits per second, accepting signals from a source of @entropy (or information) of $H$ bits per symbols, it is possible, given a properly devised coding procedure, for the transmitter to transmit symbols over the channel at an average rate which is nearly $C/H$ but which, no matter how clever the coding, can never exceed $C/H.$
:::
:::note
The unit of $C$ is bits (information) per second, and the unit of $H$ is bits (information) per symbol, so we have

$$ \frac{bits}{second} \times \frac{symbols}{bit} = \frac{symbols}{second}, $$

so the unit of $C/H$ is symbols per second.

The best transmitter is one which codes the message in such a way that maximizes the signal entropy and makes it equal to the capacity of the channel, which allows reaching the maximum rate $C/H$ for the transmission of symbols.
:::

