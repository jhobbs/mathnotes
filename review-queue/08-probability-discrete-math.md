# Queue 08: Probability & Statistics, Discrete Math

## Formalization candidates

### content/applied-math/probability-and-statistics/confidence.md
- [ ] lines 10–14: **definition** `{label: confidence-interval}` "Confidence Interval" — excerpt: "A confidence interval tells us how likely it is that a population parameter falls within..."
- [ ] lines 16–18: **theorem** `{label: ci-mean-known-variance}` — excerpt: "If $\bar{x}$ is the mean of a random sample of size $n$ from a population with a known variance..."
- [ ] lines 21–25: **theorem** `{label: sample-size-mean}` — excerpt: "If $\bar{x}$ is used as an estimate of $\mu,$ we can be $100(1-\alpha)\%$ confident..."
- [ ] lines 28–32: **theorem** `{label: ci-mean-unknown-variance}` — excerpt: "If $\bar{x}$ is the mean of a random sample of size $n$ from a population with an unknown variance..." (refs: student t-distribution)
- [ ] lines 36–40: **theorem** `{label: ci-proportion}` "Large-Sample CI for p" — excerpt: "If $\hat{p}$ is the proportion of successes in a random sample of size $n$..."
- [ ] lines 42–44: **theorem** `{label: sample-size-proportion}` — excerpt: "If $\hat{p}$ is used as an estimate of $p,$ we can be $100(1-\alpha)\%$ confident that the error..."
- [ ] line 46: **theorem** `{label: sample-size-proportion-conservative}` — excerpt: "If $\hat{p}$ is used as an estimate of $p,$ we can be **at least** $100(1-\alpha)\%$ confident..." (statement is truncated; file ends mid-sentence)

### content/applied-math/probability-and-statistics/continuous-probability-distributions.md
- [ ] lines 10–31: **definition** `{label: uniform-distribution}` "Uniform Distribution" — excerpt: "The **uniform distribution** has a \"flat\" density function and thus a uniform probability..."
- [ ] lines 35–58: **definition** `{label: normal-distribution}` "Normal Distribution" — excerpt: "The **normal distribution** or **Gaussian distribution** is the classic bell-shaped distribution." (refs: @random-variable)
- [ ] lines 47–49: **definition** `{label: standard-normal-distribution}` "Standard Normal Distribution" — excerpt: "The **standard normal distribution** is the distribution of a normal random variable with mean $0$..."
- [ ] lines 60–77: **theorem** `{label: normal-approximation-binomial}` "Normal Approximation to the Binomial" — excerpt: "If $X$ is a binomial random variable with mean $\mu = np$ and variance $\sigma^2 = npq$..." (refs: @binomial-distribution)
- [ ] lines 79–81: **note** `{label: continuity-correction}` "Continuity Correction" — excerpt: "The $0.5$ is called a **continuity correction** and comes from the fact that..."

### content/applied-math/probability-and-statistics/cuped.md
- [ ] lines 9–15: **definition** `{label: ab-test}` "A/B Test" — excerpt: "An A/B test is a two-sample statistical inference problem. Given two @random-variables..." (file is a stub; content is incomplete)

### content/applied-math/probability-and-statistics/discrete-probability-distributions.md
- [ ] lines 12–20: **definition** `{label: bernoulli-process}` "Bernoulli Process" — excerpt: "A **Bernoulli Process** must possess the following properties: 1. The experiment consists of repeated trials..."
- [ ] lines 22–36: **definition** `{label: binomial-distribution}` "Binomial Distribution" — excerpt: "A **binomial distribution** aggregates the outcomes of a Bernoulli process across multiple trials..." (refs: @bernoulli-process)
- [ ] lines 43–61: **definition** `{label: hypergeometric-distribution}` "Hypergeometric Distribution" — excerpt: "A **Hypergeometric experiment** has the following properties: 1. A random sample of size $n$..." (refs: @binomial-distribution)
- [ ] lines 63–89: **definition** `{label: poisson-distribution}` "Poisson Distribution" — excerpt: "Experiments that give numerical values of a random variable $X,$ the number of outcomes..."
- [ ] lines 83–87: **theorem** `{label: poisson-approximation-binomial}` — excerpt: "Let $X$ be a binomial random variable with probability distribution $b(x, n, p).$ When $n \to \infty$..." (refs: @binomial-distribution)
- [ ] lines 91–99: **definition** `{label: geometric-distribution}` "Geometric Distribution" — excerpt: "A **geometric random variable** is a discrete random variable that models the number of independent Bernoulli trials..."
- [ ] lines 101–105: **definition** `{label: negative-binomial-distribution}` "Negative Binomial Distribution" — excerpt: "The **negative binomial random variable** generalizes the geometric random variable..." (refs: @geometric-distribution; see math-errors queue re: line 105)

### content/applied-math/probability-and-statistics/expectation.md
(Mostly already formalized.)
- [ ] line 46: **intuition/remark** `{label: variance-interpretation}` — excerpt: "Variance and standard deviation tell us about how spread out the values of $X$ are around its mean." (outside any block; short)

### content/applied-math/probability-and-statistics/hypothesis.md
- [ ] lines 12–18: **definition** `{label: null-alternative-hypothesis}` — excerpt: "We could say that our null hypothesis is that the population mean is what we expect..."
- [ ] lines 24–30: **definition/note** `{label: p-value}` "p-value" — excerpt: "the probability of getting a test statistic ($z$) this extreme or more extreme if the actual mean is $\mu_0$..."
- [ ] lines 10–54: whole page is an unformalized procedure; could become an **example** of a two-tailed z-test / t-test — excerpt: "Given a baseline population mean $\mu_0,$ a sample mean $\bar{x}$..."

### content/applied-math/probability-and-statistics/joint-probability.md
- [ ] lines 10–20: **definition** `{label: joint-distribution}` "Joint Probability Distribution / Marginalization" — excerpt: "Two random variables $X$ and $Y$ can be paired as a single **random vector**..." (refs: @random-variable)
- [ ] lines 22–32: **definition** `{label: multinomial-distribution}` "Multinomial Distribution" — excerpt: "For a sequence of $n$ independent, identical experiments with each one of the experiments resulting in $r$ outcomes..." (see math-errors queue re: line 26)
- [ ] lines 34–44: **definition** `{label: convolution}` "Sums of Independent Random Variables (Convolution)" — excerpt: "Sums of independent random variables are called convolutions."
- [ ] lines 47–49: **theorem** `{label: sum-independent-poisson}` — excerpt: "If $X_1, X_2, \dots X_n$ are independent Poisson random variables with parameters $\lambda_1$..." (refs: @poisson-distribution)
- [ ] lines 51–53: **theorem** `{label: sum-independent-normal}` — excerpt: "If $X_1, X_2, \dots X_n$ are independent normal random variables with means $\mu_1$..." (refs: @normal-distribution)
- [ ] lines 56–67: **definition** `{label: covariance}` / `{label: correlation-coefficient}` — excerpt: "Covariance is a measure of the joint variability of two random variables."

### content/applied-math/probability-and-statistics/limit-theorems.md
- [ ] lines 15–44: **theorem** `{label: markovs-inequality}` "Markov's Inequality" with nested **proof** — excerpt: "Let $X$ be a non-negative random variable ($X \geq 0,$) and $t > 0.$ Then..."
- [ ] lines 46–67: **example** `{label: markov-inequality-fish}` with a trailing **remark** (lines 66–67 "Interpretation") — excerpt: "Suppose the size of a fish (measured in inches) is modeled as a nonnegative random variable..." (refs: @markovs-inequality)
- [ ] lines 73–107: **theorem** `{label: chebyshevs-inequality}` "Chebyshev's Inequality" with nested **proof** — excerpt: "Suppose $t > 0$ and $X$ is a random variable with the finite mean $E[X]$ and standard deviation..." (refs: @markovs-inequality)
- [ ] lines 111–127: **example** `{label: chebyshev-fish}` — excerpt: "Suppose the length $X$ of a fish is a random variable measured in inches with mean..."
- [ ] lines 131–149: **theorem** `{label: law-of-large-numbers}` "Law of Large Numbers" with nested **proof** — excerpt: "Suppose $X_1, X_2, \dots$ are independent and identically distributed random variables with finite mean..." (refs: @chebyshevs-inequality)
- [ ] lines 153–169: **definition** `{label: moment-generating-function}` "Moment Generating Function" — excerpt: "If $X$ is a random variable, then its moment generating function is a real-valued function..."
- [ ] lines 171–184: **theorem** `{label: mgf-of-sum}` with nested **proof** — excerpt: "The moment generating function for the sum of two random variables is the product..." (refs: @moment-generating-function)
- [ ] lines 186–204: **theorem** `{label: mgf-continuity-theorem}` "Continuity Theorem for MGFs" — excerpt: "Let ${X_n}$ be a sequence of random variables with moment generating functions..."
- [ ] lines 206–218: **theorem** `{label: central-limit-theorem}` "Central Limit Theorem" — excerpt: "If $n$ values are sampled from a distribution with a mean $\mu$..." (statement at line 218 is truncated — file ends at "then")

### content/applied-math/probability-and-statistics/markov-chains.md
(Mostly already formalized.)
- [ ] lines 58–68: **theorem** `{label: stationary-distribution}` "Stationary Distribution of an Ergodic Chain" — excerpt: "When the @markov-chain is @ergodic, the limit ... exists and ..." (refs: @markov-chain, @ergodic)
- [ ] line 84: **note** — excerpt: "A @stochastic-matrix can be used to describe the transitions of a @markov-chain." (short)

### content/applied-math/probability-and-statistics/probability.md
- [ ] lines 12–28: **definition** `{label: sample-space}` "Sample Space" (and "Event") — excerpt: "The set of all possible outcomes of a statistical experiment is called the **sample space**..." (this term is referenced as @sample-space elsewhere but is not in a block here)
- [ ] lines 30–37: **axiom/definition** `{label: probability-axioms}` "Probability" — excerpt: "We can assign a probability or weight to each sample point in a sample space..." (see math-errors queue re: line 33)
- [ ] lines 40–58: **proposition** `{label: probability-rules}` "Addition and Multiplication Rules" — excerpt: "The probability of $A$ or $B$ is the probability of $A$ plus the probability of $B$ minus..."
- [ ] lines 60–66: **definition** `{label: conditional-probability}` "Conditional Probability" — excerpt: "From this, we can give the formula for conditional probability."

### content/applied-math/probability-and-statistics/random-variables-and-probability-distributions.md
- [ ] lines 19–23: **definition** `{label: discrete-continuous-random-variable}` — excerpt: "if a sample space contains a finite number of possibilities... it is called a **discrete sample space**." (these define @discrete / @continuous, which are referenced in expectation.md)
- [ ] lines 27–37: **definition** `{label: probability-mass-function}` / `{label: cumulative-distribution-function}` — excerpt: "A discrete random variable takes each of its values with a certain probability..."
- [ ] lines 39–55: **definition** `{label: probability-density-function}` "Continuous Probability Distributions" — excerpt: "A continuous random variable has a probabilty of $0$ of exactly assuming any particular value."

### content/applied-math/probability-and-statistics/slots.md
- [ ] lines 8–89: entire page is an unformalized worked problem; could be one **example**/**solution** (or the two sub-derivations at lines 18–62 and 64–72 as nested example/solution blocks) — excerpt: "My dad told a story at dinner once about playing slots in Las Vegas." (low priority; primarily narrative)

### content/discrete-math/recurrence-relations.md
- [ ] lines 11–17: **definition** `{label: linear-recurrence-constant-coefficients}` — excerpt: "A linear recurrence with constant coefficients is an equation of the form..." (also defines homogeneous/non-homogeneous and order)
- [ ] lines 19–29: **theorem/proposition** `{label: homogeneous-recurrence-solution}` — excerpt: "The roots of the characteristic polynomial equation, along with initial conditions, are used to find solutions."
- [ ] lines 31–37: **example** `{label: order-1-recurrence}` — excerpt: "The recurrence $a_n = ra_{n-1}$ has the solution..."
- [ ] lines 39–65: **example/derivation** `{label: order-2-recurrence}` — excerpt: "Consider a recurrence relation of the form $a_n = A a_{n-1} + B a_{n-2}$."

### content/discrete-math/cellular-automata/elementary-cellular-automata.md
- [ ] lines 55–62: **remark/note** — the "Mathematical Properties" list (reversibility, conservation, symmetry, fractals) is note-like — excerpt: "Elementary cellular automata exhibit various interesting properties..." (low priority; expository)

### content/discrete-math/cellular-automata/game-of-life.md
- [ ] lines 13–22: **definition** `{label: game-of-life-rules}` "Rules" — excerpt: "The Game of Life is played on a two-dimensional grid where each cell can be either alive (1) or dead (0)..." (low priority; expository; see math-errors queue re: line 73)

## Typos
- [ ] confidence.md:16 — "$100(1-\alpha)%$ confident interval" → "$100(1-\alpha)\%$ confidence interval" (missing `\` before `%`; "confident" → "confidence")
- [ ] confidence.md:25 — "$z_{a/2}.$" → "$z_{\alpha/2}.$" (uses `a` instead of `\alpha`)
- [ ] confidence.md:28 — "$100(1-\alpha)%$ confident interval" → "$100(1-\alpha)\%$ confidence interval" (same two issues)
- [ ] continuous-probability-distributions.md:41 — "$n(x; \mu \sigma)$" → "$n(x; \mu, \sigma)$" (missing comma)
- [ ] cuped.md:9 — "@random-variables" → "@random-variable" (label is singular; reference likely won't resolve); sentence/list is unfinished ("Given two @random-variables" then a lone "* X")
- [ ] discrete-probability-distributions.md:5 — frontmatter title "Distbutions" → "Distributions"
- [ ] discrete-probability-distributions.md:28 — "occurr" → "occur"
- [ ] discrete-probability-distributions.md:41 — "similiar" → "similar"; "distrbution" (2×) → "distribution"; "Bionomial" → "Binomial"
- [ ] discrete-probability-distributions.md:49 — "vairable" → "variable"; "distrbution" → "distribution"
- [ ] discrete-probability-distributions.md:51 — dangling sentence: "...that contains exactly $k$ successful items and $N-k$ failure items is" (the "is" has no complement; reword)
- [ ] discrete-probability-distributions.md:55 — "distrbution" → "distribution"
- [ ] discrete-probability-distributions.md:59 — "hypergeoemetric" (4×) → "hypergeometric"
- [ ] discrete-probability-distributions.md:63 — "Poisson Distbution" → "Poisson Distribution"
- [ ] discrete-probability-distributions.md:65 — "recieves" → "receives"
- [ ] discrete-probability-distributions.md:71 — "occurr" → "occur"
- [ ] discrete-probability-distributions.md:75 — "distrbution" → "distribution"
- [ ] discrete-probability-distributions.md:101 — "Negative Binomial Distirbution" → "Distribution"
- [ ] expectation.md:33 — "$\sigma^2 = E[(X - \mu)^2] \sum_{x}{(x - \mu)^2 f(x)}$" → insert `=`: "$\sigma^2 = E[(X-\mu)^2] = \sum_x (x-\mu)^2 f(x)$" (missing equals sign; also listed as math error)
- [ ] expectation.md:37 — same missing `=` before the integral form
- [ ] expectation.md:102 — "TOOD:" → "TODO:"
- [ ] hypothesis.md:24 — "if the actual mean is $\mu_0,$," → single comma (double comma)
- [ ] hypothesis.md:32 — "$p-values$" → "$p$-values" (text inside math renders as product of letters)
- [ ] hypothesis.md:34 — "hypothesising that that $\mu \neq mu_0,$" → "hypothesizing that $\mu \neq \mu_0$" ("that that"; `mu_0` missing `\`); also "$\mu > \mu_0.$," has period+comma
- [ ] joint-probability.md:14 — "to find soley the distribution" → "solely"
- [ ] joint-probability.md:47 — heading "Sums of Indepenent Poisson" → "Independent"
- [ ] joint-probability.md:61 — "An altenative, equivalent form" → "alternative"
- [ ] joint-probability.md:59,63,65 — "\Cov" appears to be an undefined macro (no `\newcommand`/`\DeclareMathOperator` found in repo); likely renders as an error. Use `\operatorname{Cov}` or define the macro (moderate confidence)
- [ ] limit-theorems.md:24 — "This follows from the the Law of Total Expectation" → remove duplicate "the"
- [ ] limit-theorems.md:38 — "We we have by definition" → remove duplicate "We"
- [ ] markov-chains.md:11 — "$NxN$ matrix" → "$N \times N$ matrix" (literal `x` used as multiplication)
- [ ] probability.md:14 — "the roles of a standard six-sided die" → "rolls"
- [ ] probability.md:18 — "$A = \{1,3,5\}.$," → period+comma; drop one
- [ ] probability.md:22 — "The event the the roll of a die is not less than" → "the event that the roll"
- [ ] random-variables-and-probability-distributions.md:13 — `:::define "Random Variable"` → `:::definition` ("define" is not a valid block type)
- [ ] random-variables-and-probability-distributions.md:35,53,55 — "$F(X) = P(X \leq x)$" → "$F(x) = P(X \leq x)$" (function argument should be lowercase `x`)
- [ ] random-variables-and-probability-distributions.md:39 — heading "Continuous Probabilty Distributions" → "Probability"
- [ ] random-variables-and-probability-distributions.md:41 — "has a probabilty of $0$" → "probability"
- [ ] recurrence-relations.md:7 — "# recurrence Relations" → "# Recurrence Relations" (capitalization)
- [ ] recurrence-relations.md:27 — "repeated roots, terms the second and higher occurrences of the same root are multiplied" → grammar broken; reword (e.g., "for the second and higher occurrences of a repeated root, terms are multiplied...")
- [ ] recurrence-relations.md:45 — "If we assume it as a solution of the form" → "If we assume a solution of the form"
- [ ] recurrence-relations.md:65 — "the values of $C$ ad $D.$" → "and"
- [ ] recurrence-relations.md:67 — "linear homogenous differential equations" → "homogeneous"

Note: two files end mid-statement (incomplete content, not errors): confidence.md:46 (sample-size theorem cut off) and limit-theorems.md:218 (Central Limit Theorem statement ends at "then").
