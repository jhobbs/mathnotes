# Queue 05: ODEs — Chapters 4–6, 90–91 (Higher Order, Operators & Laplace, Applications, Series)

None of these files use `:::` blocks yet. Suggested `@`-refs point at sibling content that would itself become a labeled block.

Base path: content/applied-math/differential-equations/ordinary-differential-equations/

## Formalization candidates

### chapter-04-linear-differential-equations-of-order-greater-than-one/lesson-19-linear-independence-of-functions-and-the-linear-differential-equation-of-order-n.md
- [ ] lines 14–20: **definition** `{label: linear-independence-of-functions}` "Linear Dependence and Independence" — excerpt: "A set of functions $f_1(x), f_2(x),\cdots,f_n(x),$ each defined on a common interval"
- [ ] lines 24–28: **remark** `{label: testing-linear-independence}` — excerpt: "To show that a set of functions is linearly dependent we need only"
- [ ] lines 33–49: **definition** `{label: linear-differential-equation-of-order-n}` "Linear Differential Equation of Order n" — excerpt: "A linear differential equation of order n is an equation which"
- [ ] line 53: **theorem** `{label: number-of-independent-solutions}` — excerpt: "A homogenous linear differential equation has as many linearly independent solutions" (refs: @linear-differential-equation-of-order-n)
- [ ] lines 57–71: **theorem** `{label: existence-uniqueness-linear-de}` "Existence and Uniqueness" (Theorem 19.2) — excerpt: "If $f_0(x),f_1(x),\cdots,f_n(x),$ and $Q(x)$ are each continuous" (refs: @linear-differential-equation-of-order-n)
- [ ] lines 73–97: **theorem** `{label: structure-of-general-solution}` (Theorem 19.3) — excerpt: "If $f_0(x),f_1(x),\cdots,f_n(x),$ and $Q(x)$ are each continuous" (refs: @linear-independence-of-functions, @existence-uniqueness-linear-de)
- [ ] lines 101–119: **theorem** + nested **proof** `{label: scaling-a-solution}` (Exercise 5) — excerpt: "If $y_p$ is a solution of: ... then $Ay_p$ is a solution"
- [ ] lines 122–143: **theorem** + nested **proof** `{label: principle-of-superposition}` "Principle of Superposition" (Exercise 6) — excerpt: "If $y_{p1}$ is a solution of (19.5) with $Q(x)$ replaced"
- [ ] lines 145–179: **theorem** + nested **proof** `{label: real-and-imaginary-parts-of-solution}` (Exercise 7) — excerpt: "If $y_p(x) = u(x) + iv(x)$ is a solution of"

### chapter-04.../lesson-20-solution-of-the-homogeneous-linear-differential-equation-of-order-n-with-constant-coefficients.md
- [ ] lines 22–26: **definition** `{label: characteristic-equation}` "Characteristic Equation" — excerpt: "The characteristic equation of (20.1) can be obtained by replacing $y$"
- [ ] lines 34–63: **proposition** (or **note**) `{label: homogeneous-solution-by-root-type}` "Solution forms by root type" — excerpt: "We need to consider some possibilities relating to the roots" (refs: @characteristic-equation; see math-errors queue re: line 50)
- [ ] lines 57–63: **example** `{label: fifth-order-general-solution-form}` — excerpt: "the general solution to a 5th degree homogeneous linear differential equation"

### chapter-04.../lesson-21-solution-of-the-nonhomogeneous-linear-differential-equation-of-order-n-with-constant-coefficients.md
- [ ] lines 21–56: **note**/**proposition** `{label: undetermined-coefficients-cases}` "Method of Undetermined Coefficients (three cases)" — excerpt: "We know how to find $y_c(x)$ from the previous section" (refs: @structure-of-general-solution)
- [ ] lines 58–69: **theorem** `{label: complex-variable-particular-solutions}` "Solution by Complex Variables" — excerpt: "If in ... the $a$'s are real and $Q(x)$ is a complex-valued" (refs: @real-and-imaginary-parts-of-solution)
- [ ] lines 73–75: **proof** (or **example**) `{label: redundant-yc-terms}` (Exercise 1) — excerpt: "Prove that any term which is in the complementary function"
- [ ] lines 77–91: **theorem** + **proof** `{label: finite-independent-derivatives-forms}` (Exercise 2) — excerpt: "Prove that if $F(x)$ is a function with a finite"

### chapter-04.../lesson-22-solution-of-the-nonhomogeneous-linear-differential-equation-by-the-method-of-variation-of-parameters.md
- [ ] lines 20–40: **proposition**/**theorem** `{label: variation-of-parameters}` "Variation of Parameters (second order)" — excerpt: "For purposes of demonstration, we will work with the second order"
- [ ] lines 42–44: **remark** `{label: variation-of-parameters-determinant-form}` — excerpt: "Note that we can also use determinants to find"

### chapter-04.../lesson-23-solution-of-the-linear-differential-equation-with-nonconstant-coefficients-reduction-of-order-method.md
- [ ] lines 9–27: **remark** `{label: nonconstant-coefficients-difficulty}` "Introductory Remarks" — excerpt: "There are no standard methods of finding solutions of $(23.1)$"
- [ ] lines 30–56: **proposition**/**note** `{label: reduction-of-order}` "Reduction of Order Method" — excerpt: "Assuming we have been able to find a non-trivial solution"

### chapter-05-operators-and-laplace-transforms/lesson-24-differential-and-polynomial-operators.md
- [ ] lines 11–16: **definition** `{label: differential-operator}` "Operator; Differential Operator" — excerpt: "An operator is a mathematical device which converts one function"
- [ ] lines 22–28: **definition** `{label: polynomial-operator}` "Polynomial Operator" — excerpt: "By forming a linear combination of differential operators of orders"
- [ ] lines 31–33: **definition** `{label: polynomial-operator-application}` (Definition 24.13) — excerpt: "Let $P(D)$ be the polynomial operator (24.12) of order" (refs: @polynomial-operator)
- [ ] lines 50–58: **theorem** `{label: polynomial-operator-is-linear}` (Theorem 24.2) — excerpt: "If $P(D)$ is the polynomial operator (24.12) and $y_1,~y_2$"
- [ ] lines 60–84: **theorem** + **proof** `{label: superposition-operators}` "Principle of Superposition" — excerpt: "In place of the linear differential equation:" (refs: @principle-of-superposition)
- [ ] lines 86–134: **example** `{label: operator-successive-reduction-example}` — excerpt: "We will find the general solution of the nonhomogenous linear"

### chapter-05.../lesson-25-inverse-operators.md
- [ ] lines 8–33: **example** (or **remark**) `{label: particular-solution-normalization}` "Foreword" — excerpt: "Recall that a general solution is the sum of the"
- [ ] lines 37–53: **definition** `{label: inverse-operator}` (Definition 25.2) — excerpt: "Let $P(D)y = Q(x)$ where $P(D)$ is the polynomial operator" (refs: @polynomial-operator)
- [ ] lines 69–143: **proposition**/**note** `{label: inverse-operator-rules}` "Inverse operator rules by case" — excerpt: "We shall consider each of the functions mentioned in Definition"

### chapter-05.../lesson-26-solution-of-a-linear-differential-equation-by-means-of-the-partial-fraction-expansion-of-inverse-operators.md
- [ ] lines 25–27: **proposition**/**lemma** `{label: partial-fraction-inverse-operator}` — excerpt: "A generalization is given in the case that $P(D)$ has distinct" (refs: @inverse-operator)
- [ ] lines 13–29: **example** `{label: pfe-inverse-operator-first-method}` — excerpt: "consider that we're trying to solve a differential equation by means"
- [ ] lines 31–53: **example** `{label: pfe-inverse-operator-second-method}` — excerpt: "The zeros of $D^2 - 3D + 2$ are $r_1 = 2, r_2 = 1$" (refs: @principle-of-superposition)

### chapter-05.../lesson-27-the-laplace-transform-and-gamma-function.md
- [ ] lines 13–17: **definition** `{label: laplace-transform}` (Definition 27.13) — excerpt: "Let $f(x)$ be defined on the interval $I: 0 \leq x"
- [ ] lines 19–23: **theorem** `{label: laplace-transform-is-linear}` — excerpt: "The Laplace transform is a linear operator. That is, if"
- [ ] lines 25–33: **definition** `{label: inverse-laplace-transform}` (Definition 27.18) — excerpt: "If $F$ is the Laplace transform of a continuous function" (refs: @laplace-transform)
- [ ] lines 35–50: **theorem** `{label: laplace-transform-of-x-f}` (Theorem 27.6) — excerpt: "If $F(s) = L[f(x)] = \int_0^{\infty} e^{-sx}f(x)dx$" (see math-errors queue re: line 47)
- [ ] lines 69–111: **example** `{label: laplace-spring-ivp-example}` "Laplace method, spring IVP" — excerpt: "Find the motion of equation of a weight attached to"
- [ ] lines 113–131: **theorem** (fact, line 117) + **example** `{label: laplace-of-nth-derivative}` — excerpt: "Here's a useful fact (see $(27.3)$ in book for"
- [ ] lines 133–154: **definition** `{label: gamma-function}` "Gamma Function" — excerpt: "The Gamma function, written as $\Gamma (k)$ is useful here"

### chapter-05.../lesson-27b-summary-of-methods-of-solving-higher-order-linear-differential-equations.md
- [ ] whole file: mostly a **note**/summary of methods (links to other lessons); low formalization priority
- [ ] lines 83–85: **remark** (conjecture) `{label: shifted-sinusoid-forcing}` "Shifted sin/cos in Q(x)" — excerpt: "I believe and have used this fact but haven't proven"

### chapter-06-problems-leading-to-linear-equations-of-order-two/lesson-28-undamped-motion.md
- [ ] lines 15–34: **definition** `{label: simple-harmonic-motion}` (Definition 28.1) — excerpt: "A particle will be said to execute simple harmonic motion if" (note: physics/simple-harmonic-motion.md also defines SHM — coordinate labels)
- [ ] lines 36–63: **example** `{label: force-proportional-to-distance}` — excerpt: "A particle moving on a straight line is attracted to" (refs: @simple-harmonic-motion)
- [ ] lines 65–81: **note**/**definition** `{label: shm-parameters}` "Amplitude, period, frequency, phase" — excerpt: "We can reuse $(d)$ and $(e)$ above to find the"
- [ ] lines 85–117: **example** `{label: helical-spring-hookes-law}` "Elastic Helical Spring; Hooke's Law" — excerpt: "Consider a helical spring, with natural unstretched length" (refs: @simple-harmonic-motion)
- [ ] lines 119–181: **example** `{label: simple-pendulum}` "The Simple Pendulum (small-angle)" — excerpt: "If we consider a simplified model of a pendulum, with"
- [ ] lines 183–225: **example** `{label: pendulum-without-small-angle}` — excerpt: "Without the small angle approximation, we have a non-linear second"
- [ ] lines 227–279: **definition** + **theorem** (cases) `{label: forced-undamped-motion}` "Forced Undamped Motion; Resonance" — excerpt: "In forced undamped motion, the motion of a particle of"
- [ ] lines 281–285: **remark** `{label: beats-amplitude-modulation}` — excerpt: "Another interesting case is when $\omega$ differs from $\omega_0$"

### chapter-06.../lesson-29-damped-motion.md
- [ ] lines 12–16: **definition** `{label: damped-harmonic-motion}` (Definition 29.1) — excerpt: "A particle will be said to execute damped harmonic motion" (refs: @simple-harmonic-motion, @characteristic-equation)
- [ ] lines 18–44: **proposition**/**note** `{label: damped-motion-cases}` "Overdamped / critically damped / underdamped" — excerpt: "The roots of the characteristic equation of $(29.11)$ are" (see math-errors queue re: lines 26, 42)
- [ ] lines 46–102: **theorem** + **note** `{label: forced-damped-motion}` "Forced Damped Motion; steady state, resonance, magnification ratio" — excerpt: "The motion of a particle that satisfies the differential equation" (refs: @forced-undamped-motion; see math-errors queue re: line 101)

### chapter-06.../lesson-30-electric-circuits.md
- [ ] line 19: **axiom**/**note** `{label: kirchhoffs-second-law}` "Kirchhoff's Second Law" — excerpt: "Kirchhoff's second law states that the sum of the voltage"
- [ ] lines 8–53: **example**/**definition** `{label: rlc-series-circuit}` "RLC Series Circuit equation" — excerpt: "Given a circuit with: An energy source providing emf" (refs: @forced-damped-motion)
- [ ] lines 59–63: **definition** `{label: impedance-and-electrical-resonance}` "Impedance; Resonance" — excerpt: "The denominator is called the impedance of the system" (see math-errors queue re: line 47)

### chapter-90-series-solutions/lesson-900-taylor-series-approximations-of-ivps.md
- [ ] lines 8–14: **definition** `{label: taylor-polynomial}` "Taylor Polynomial" — excerpt: "The foruma for the Taylor polynomial of degree $n$ centered"
- [ ] lines 20–58: **example** `{label: taylor-approx-ivp-example}` — excerpt: "Find the first few Taylor polynomials approximating the solution around"

### chapter-90-series-solutions/lesson-901-power-series-solutions-to-linear-differential-equations.md
- [ ] line 10: **theorem**/**lemma** `{label: power-series-identity-theorem}` "Vanishing power series" — excerpt: "If $\sum_{n=0}^{\infty}{a_0(x-x_0)^n} = 0$ for all $x$ in"
- [ ] lines 12–84: **example** `{label: power-series-solution-example}` — excerpt: "Let's find a power series solution about x = 0"
- [ ] lines 86–96: **theorem** `{label: existence-of-analytic-solutions}` "Existence of Analytic Solutions" — excerpt: "Suppose $x_0$ is an ordinary point for equation (1)"

### chapter-91-initial-and-boundary-values-problems/lesson-910-initial-and-boundary-values-problems.md
- [ ] lines 6–12: **note**/**definition** `{label: initial-value-problem}` "Initial Value Problems" — excerpt: "Initial value problems give a differential equation and some initial" (refs: @laplace-transform)
- [ ] lines 14–20: **note**/**definition** `{label: boundary-value-problem}` "Boundary Value Problems" — excerpt: "Boundary value problems give a differential equation and some boundary" (refs: @undetermined-coefficients-cases)

## Typos
- [ ] lesson-19:57 — "linear diferential equation" → "differential"
- [ ] lesson-19:75 — "homogenous linear diferential equation" → "differential"
- [ ] lesson-19:95 — "$n$-paremeter family" → "$n$-parameter family"
- [ ] lesson-19:119 — "is therefore a solutioni of" → "solution"
- [ ] lesson-19:149 — "are real funtions of $x$" → "functions"
- [ ] lesson-19:155 — "the imaginary pary of $y_p$" → "imaginary part"
- [ ] lesson-19 (recurring, e.g. 41,43,47,49,73,91) — "homogenous"/"nonhomogenous" → "homogeneous"/"nonhomogeneous" (recurs across almost every file in this set)
- [ ] lesson-20:12 — "if we constraint the coefficients" → "constrain"
- [ ] lesson-20:48 — "real and and occurs $k$ times" → "real and occurs"
- [ ] lesson-20:52 — "conjucate pairs" → "conjugate pairs"
- [ ] lesson-21:26 — "the method from Lessson 20" → "Lesson 20"
- [ ] lesson-21:44 — "linearly indepenent derivatives" → "independent"
- [ ] lesson-21:48 — "**Case 3.** $Q(x)$ *This case is applicable" — stray leading "$Q(x)$" should be removed
- [ ] lesson-21:77 — "where $n$ isa finite number" → "is a finite"
- [ ] lesson-21:81 — "$C_{n-1}F^{(n-1})(x)$" malformed exponent → "$C_{n-1}F^{(n-1)}(x)$"
- [ ] lesson-22:18 — "to solve $(21.1)$ when $Q(x)$" — likely should reference "$(22.1)$"
- [ ] lesson-22:32 — "$$ \tag{22.22} = y_p(x) = ...$$" — stray leading "=" before $y_p(x)$
- [ ] lesson-22:36 — "we arive at" → "arrive"
- [ ] lesson-23:48 — "via differntiation" → "differentiation"
- [ ] lesson-24:13 — "differention and integration" → "differentiation"
- [ ] lesson-24:31 — "$n$th order differntiable function" → "differentiable"
- [ ] lesson-24:88 — "for finding a partiuclar solution" → "particular"
- [ ] lesson-24:96 — "by finding the complentary function" → "complementary"
- [ ] lesson-25:11 — "sum of the complentary function" → "complementary"
- [ ] lesson-25:13 — "The complentary function of the differntial equation" → "complementary ... differential"
- [ ] lesson-25:31 — "whenver we refer to" → "whenever"
- [ ] lesson-25:49 — "that containts no constant multiple" → "contains"
- [ ] lesson-25:92 — "$D$ is a factor of $P(D)$d and can write" — stray "d"; also "$P(D) = D(a_n D^{n-1} + \cdots + a_2 D + a_1$" missing closing ")"
- [ ] lesson-25:100 — "apply differntiation" → "differentiation"; also "ignoring arbitrary constants of differentiation" → "of integration" (the step performs $r$ integrations)
- [ ] lesson-25:133,141 — both display equations tagged `(25.6)` (duplicate tag)
- [ ] lesson-26:53 — "rather than in sucession" → "succession"; "Lesson 24C" is a dubious cross-reference (no lesson 24C; likely the successive-reduction example in Lesson 24)
- [ ] lesson-27:21 — "the larger of $s1$ and $s_2$" → "$s_1$" (missing subscript)
- [ ] lesson-27:66 — "makes the Laplace transform method useful in compared to" → "useful compared to"
- [ ] lesson-27:75 — "a function who's Laplace transform" → "whose"; "spliting and rearranging" → "splitting"
- [ ] lesson-27:81 — "Find the motion of equation of a weight" → "Find the equation of motion"
- [ ] lesson-27:97,99,105,107 — "$L_{-1}[...]$" uses subscript; inverse Laplace should be superscript "$L^{-1}[...]$" (line 29 uses the correct form)
- [ ] lesson-27:154 — trailing stray text "$- differential-equations/the-laplace-transform-gamma-function$" at end of line (broken artifact)
- [ ] lesson-27b:8 — "methods of Chatpers 4 and 5" → "Chapters"
- [ ] lesson-27b:50 — "Variation of Paramaters" → "Parameters" (link text)
- [ ] lesson-27b:64 — "we we must know" → "we must know"; "there is no garauntee" → "guarantee"
- [ ] lesson-27b:70 — "yy$$ a_ny^{(n)} ..." — stray "yy" before the display-math block
- [ ] lesson-27b:78 — "(constant coefficients, finitely many linearly independent derivatives of $Q(x)$." — unbalanced parenthesis (never closed)
- [ ] lesson-27b:30 — "### Nonhomogenous Linear Differential Equations" is an H3 nested under the "## Homogenous..." H2 (should likely be its own H2)
- [ ] lesson-28:13 — "in a medium in wich the resistance" → "in which"; "damping factor is negligble" → "negligible"
- [ ] lesson-28:37 — "will execute smiple harmonic motion" → "simple"
- [ ] lesson-28:89 — display eq tagged `(26.81)` but should be `(28.61)` (surrounding tags are 28.62, 28.621, 28.63)
- [ ] lesson-28:99 — "due to the tension o the spring" → "tension of the spring"
- [ ] lesson-28:102 — "Newtown's second law" → "Newton's"; "net force acting on a sytem" → "system"; "taken as downard" → "downward"
- [ ] lesson-28:128 — "series definiton of $\sin{\theta}$" → "definition"; "positive when to the right of veritcal" → "vertical"
- [ ] lesson-28:189 — "We can seperate/rearrange terms" → "separate"
- [ ] lesson-28:259 — "as $omega_0$ approaches $omega$" → "$\omega_0$ ... $\omega$" (missing backslashes); "the maximum displacement if still finite" → "is still finite"
- [ ] lesson-28:281 — "Some Intresting Examples" → "Interesting"
- [ ] lesson-28:285 — "These variation in amplitude as known as beats" → "These variations in amplitude are known as beats"
- [ ] lesson-29:16 — "the natural (undamped) frequnecy" → "frequency"
- [ ] lesson-29:28 — "will cross the $t$ access" → "the $t$ axis"
- [ ] lesson-29:40 — "The since term in the solution" → "The sine term"
- [ ] lesson-29:44 — "Thwen $t = 1/r$" → "When"; "the damping fator" → "factor"; "to reac this value" → "reach"; "is donoted with $\tau$" → "denoted"
- [ ] lesson-29:58 — "The different possible complimentary functions" → "complementary"
- [ ] lesson-29:84 — "we commit a samll error" → "small"; "if we emot the $r^2$ term" → "omit"
- [ ] lesson-29:90 — "such as a bridge when the gait of pedestrians crosses it too closely matches the natural frequency" — garbled clause (e.g., "when the gait of pedestrians crossing it too closely matches")
- [ ] lesson-29:103 — "the cofficient of resistance per unit of mass" → "coefficient"
- [ ] lesson-30:17 — "a charge **q** masured in columbs" → "measured in coulombs"
- [ ] lesson-30:23 — "$\frac{1}{c}q$" uses lowercase $c$; should be capital $C$ (as in eq 30.14)
- [ ] lesson-30:51 — "replace position $y$ in the mechanical with charge $q$" — missing word ("mechanical system")
- [ ] lesson-30:55 — "The amplitude of the the steady-state" → "the steady-state" (doubled "the")
- [ ] lesson-900:8 — "The foruma for the Taylor polynomial" → "formula"
- [ ] lesson-900:14 — "they involve intial values" → "initial"
- [ ] lesson-900:25 — "$y'(0') = 5$" — stray prime; should be "$y'(0) = 5$"
- [ ] lesson-900:31 — "using the diffrential equation" → "differential"
- [ ] lesson-900:36 — "We know that y''= 3y' = x^2y for some interval" — not in math delimiters, and the middle "=" should be "+": should read "$y'' = 3y' + x^2 y$"
- [ ] lesson-900:49 — "$3 \cdot 45 + 2 \cdot 10 + 4 \cdot 0 \cdot 5 + 0^2 + 15 = 155$" — the "$0^2 + 15$" should be "$0^2 \cdot 15$" (the $x^2y''$ term, $=0$); as written inconsistent with the correct total 155
- [ ] lesson-901:10 — "$\sum_{n=0}^{\infty}{a_0(x-x_0)^n}$" should use $a_n$, not $a_0$ (the theorem concludes each $a_n=0$)
- [ ] lesson-901:24 — "We can differentiate (4) to find" — there is no equation (4); should be "(b)"
- [ ] lesson-901:86 — "## Existince of Analytic Solutions" → "Existence"
- [ ] lesson-901:96 — "the radius of convergance" → "convergence"
- [ ] lesson-910:8 — "an unknown funciton $y(x)$" → "function"
- [ ] lesson-910:18 — "find a general solution (perhaps using the [[method of undetermined coefficients|...]], and then" — parenthesis opened but never closed
- [ ] lesson-910:20 — "outside of, a the unknown funciton's domain" — "a the" doubled article; "funciton" → "function"
