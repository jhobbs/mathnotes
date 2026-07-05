# Queue 07: Numerical Analysis & Physics

## Formalization candidates

### content/applied-math/numerical-analysis/gaussian-elimination.md
- [ ] lines 10–18: **definition** `{label: row-echelon-form}` "Row Echelon Form / Gaussian Elimination" — excerpt: "Gaussian elimination transforms a matrix into row echelon form, which is an upper triangular form where..."
- [ ] lines 20–26: **definition** `{label: elementary-row-operations}` "Elementary Row Operations" — excerpt: "This is accomplished by performing three types of operations on rows..."
- [ ] line 30: **definition** `{label: pivot}` "Pivot" — excerpt: "The first non-zero entry in any row is called a **pivot.**"
- [ ] line 32: **definition** `{label: partial-pivoting}` "Partial Pivoting" — excerpt: "We use **partial pivoting** to help reduce this. Before each round..." (refs: @pivot)
- [ ] line 34: **definition** `{label: scaled-partial-pivoting}` "Scaled Partial Pivoting" — excerpt: "A slight variation is **scaled partial pivoting.** Here, we account..." (refs: @partial-pivoting)
- [ ] lines 36–52: **definition** `{label: lu-factorization}` "LU Factorization" — excerpt: "Solving linear systems of the form $A \vec{x} = \vec{b}$ can be computationally expensive..." (refs: @row-echelon-form)
- [ ] lines 54–152: **example** `{label: lu-factorization-example}` "3×3 LU Factorization" — excerpt: "Suppose $A = \begin{pmatrix} 2 & 1 & 1...$" (refs: @lu-factorization)
- [ ] lines 154–235: **example** `{label: lu-solve-example}` "Solving LUx=b" — excerpt: "Now we'll go over how to solve for an unknown $\vec{x}$ given $\vec{b}$..." (refs: @lu-factorization)

### content/applied-math/numerical-analysis/interpolation-and-polynomial-approximation.md
- [ ] lines 10–14: **definition** `{label: algebraic-polynomial}` "Algebraic Polynomials" — excerpt: "The set of **algebraic polynomials,** which are functions of the form..."
- [ ] lines 16–21: **theorem** `{label: weierstrass-approximation-theorem}` "Weierstrass Approximation Theorem" — excerpt: "Suppose $f$ is defined and continuous on $[a,b].$ For each $\epsilon > 0$..."
- [ ] line 29: **definition** `{label: interpolating-polynomial}` "Interpolating Polynomial / Polynomial Interpolation" — excerpt: "If we have two points, $(x_0, y_0)$ and $(x_1, y_1)$, we can make a linear polynomial..."
- [ ] lines 31–53: **definition** `{label: linear-lagrange-interpolating-polynomial}` "Linear Lagrange Interpolating Polynomial" — excerpt: "If we define the functions $L_0(x) = \frac{x - x_1}{x_0 - x_1}$..." (refs: @interpolating-polynomial)
- [ ] lines 69–84: **theorem** `{label: nth-lagrange-interpolating-polynomial}` "nth Lagrange Interpolating Polynomial" — excerpt: "If $x_0, x_1, \dots, x_n$ are $n+1$ distinct numbers and $f$ is a function..." (refs: @linear-lagrange-interpolating-polynomial)
- [ ] lines 104–106: **definition** `{label: zeroth-divided-difference}` "Zeroth Divided Difference" — excerpt: "the **zeroth divided difference** of $f$ with respect to $x_i$..."
- [ ] lines 108–110: **definition** `{label: first-divided-difference}` — excerpt: "the **first divided difference** of $f$ with respect to $x_i$ and $x_{i+1}$..." (refs: @zeroth-divided-difference)
- [ ] lines 112–118: **definition** `{label: kth-divided-difference}` "Second / kth Divided Difference" — excerpt: "The **second divided difference** is then..."
- [ ] lines 128–130: **definition** `{label: newtons-divided-difference}` "Newton's Divided Difference" — excerpt: "we can rewrite $P_n(x)$ as **Newton's Divided Difference:**" (refs: @kth-divided-difference, @nth-lagrange-interpolating-polynomial)
- [ ] line 132: **remark** `{label: divided-difference-order-independence}` — excerpt: "One important fact is that the value of $f[x_0, x_1, \dots, x_k]$ is independent of the order..."
- [ ] lines 163–173: **definition** `{label: chebyshev-nodes}` "Chebyshev Polynomials / Optimal Nodes" — excerpt: "We can use the orthogonal family of Chebyshev Polynomials to pick optimal nodes..." (refs: @nth-lagrange-interpolating-polynomial)
- [ ] lines 179–181: **definition** `{label: piecewise-polynomial-approximation}` "Piecewise / Piecewise-Linear Approximation" — excerpt: "Another approach is to use a lower degree polynomial to approximate the subinterval..."
- [ ] lines 185–207: **definition** `{label: cubic-spline-interpolant}` "Cubic Spline Interpolant" — excerpt: "Given a function $f$ defined on $[a, b]$ and a set of nodes... a **cubic spline interpolant** $S$..." (refs: @piecewise-polynomial-approximation)

### content/applied-math/numerical-analysis/least-squares.md
- [ ] lines 12–26: **definition** `{label: polynomial-least-squares}` "Polynomial Least Squares / Normal Equations" — excerpt: "Given $m$ data points we can find a polynomial... using the least squares procedure to minimize error"
- [ ] lines 28–30: **definition** `{label: continuous-least-squares}` "Continuous Least Squares Approximation" — excerpt: "If we have a function $f \in C[a,b]$, we can use a similar method..." (note: section is truncated/incomplete)

### content/applied-math/numerical-analysis/numerical-differentiation.md
- [ ] lines 10–12: **note** `{label: derivative-definition}` "Derivative (recall)" — excerpt: "Recall that the derivative of a function $f$ at $x_0$ is..."
- [ ] lines 14–20: **definition** `{label: forward-backward-difference}` "Forward/Backward Difference Formula" — excerpt: "A simple approximation of $f'(x_0)$ can be given by simply picking a small value of $h$..." (refs: @linear-lagrange-interpolating-polynomial)
- [ ] lines 24–28: **theorem** `{label: n-plus-1-point-formula}` "(n+1)-Point Formula" — excerpt: "The **$(n+1)$-point formula** to approximate $f'(x_j)$ is..." (refs: @nth-lagrange-interpolating-polynomial)
- [ ] lines 34–38: **definition** `{label: three-point-endpoint-formula}` "Three-Point Endpoint Formula" — excerpt: "The endpoint formula is (with h being positive for $a$..."
- [ ] lines 40–44: **definition** `{label: three-point-midpoint-formula}` "Three-Point Midpoint Formula" — excerpt: "The midpoint formula is $f'(x_0) = \frac{1}{2h}\left( f(x_0 + h) - f(x_0 -h)\right)$..."
- [ ] line 46: **remark** — excerpt: "Note that in addition to being more accurate, the midpoint formula uses one less evaluation..."

### content/applied-math/numerical-analysis/numerical-integration.md
- [ ] line 12: **definition** `{label: numerical-quadrature}` "Numerical Quadrature" — excerpt: "The basic method for approximating $\int_a^{b} f(x) dx$ is called **numerical quadrature**..."
- [ ] lines 18–22: **definition** `{label: trapezoidal-rule}` "Trapezoidal Rule" — excerpt: "The Trapezoidal rule is $\int_a^b f(x) dx = \frac{h}{2}(f(x_0) + f(x_1))$..."
- [ ] lines 24–32: **definition** `{label: simpsons-rule}` "Simpson's Rule" — excerpt: "Simpson's rule uses three points and is..."
- [ ] line 34: **definition** `{label: newton-cotes}` "Newton-Cotes Formulas" — excerpt: "integrating Lagrange interpolating polynomials and there error terms give us **Newton-Cotes** formulas" (refs: @trapezoidal-rule, @simpsons-rule)
- [ ] lines 40–42: **definition** `{label: composite-simpsons-rule}` "Composite Simpson's Rule" — excerpt: "the **Composite Simpson's rule** breaks an interval down into $n$ subintervals..." (refs: @simpsons-rule, @newton-cotes)
- [ ] lines 45–47: **theorem** `{label: composite-simpsons-error}` "Composite Simpson's Rule Error" — excerpt: "Let $f \in C^4[a,b], n$ be even, $h = (b - a)/n$..." (refs: @composite-simpsons-rule)
- [ ] lines 78–80: **theorem** `{label: composite-trapezoidal-error}` "Composite Trapezoidal Rule" — excerpt: "Let $f \in C^2[a,b], h = (b - a)/n$..." (refs: @trapezoidal-rule)
- [ ] lines 82–86: **theorem** `{label: composite-midpoint-error}` "Composite Midpoint Rule" — excerpt: "Let $f \in C^2[a, b],$ $n$ be even, $h = (b - a)/(n + 2)$..."
- [ ] lines 88–96: **definition** `{label: gaussian-quadrature}` "Gaussian Quadrature" — excerpt: "Gaussian quadrature picks the optimal nodes $x_1, x_2,\dots,x_n$..." (refs: @newton-cotes)
- [ ] lines 98–128: **example** `{label: gaussian-quadrature-example}` "Two-Point Gaussian Quadrature on [-1,1]" — excerpt: "let's say we want to determine $c_1, c_2, x_1,$ and $x_2$ so that..." (refs: @gaussian-quadrature)
- [ ] lines 134–146: **definition** `{label: legendre-polynomials}` "Legendre Polynomials" — excerpt: "a collection of orthogonal polynomials called the **Legendre Polynomials**..." (refs: @gaussian-quadrature)

### content/applied-math/numerical-analysis/root-approximation.md
- [ ] lines 12–14: **definition** `{label: bisection-method}` "Bisection Method" — excerpt: "Let's say $f$ is a continuous function on the interval $[a, b]$ and that $f(a)$ and $f(b)$ have opposite sign..." (refs: @intermediate-value-theorem)
- [ ] lines 16–18: **theorem** `{label: bisection-error-bound}` "Bisection Method Convergence" — excerpt: "Suppose that $f \in C[a, b]$ and $f(a) \cdot f(b) < 0.$ The Bisection Method generates a sequence..." (refs: @bisection-method)
- [ ] lines 55–62: **remark** `{label: bisection-limitations}` — excerpt: "The bisection method has some limitations: Slow convergence..."
- [ ] lines 64–82: **definition** `{label: newtons-method}` "Newton's Method (derivation)" — excerpt: "Newton's method can be derived using a Taylor polynomial. Consider $f \in C^2[a,b]$..." (refs: @taylor-polynomial)
- [ ] line 84: **theorem** `{label: newtons-method-convergence}` "Newton's Method Convergence" — excerpt: "Let $f \in C^2[a, b].$ If $p \in (a, b)$ such that $f(p) = 0$ and $f'(p) \neq 0$..." (refs: @newtons-method)
- [ ] lines 108–114: **remark** `{label: newtons-method-limitations}` — excerpt: "Newton's method has some limitations: Requires a good initial guess..."

### content/applied-math/numerical-analysis/rounding-errors.md
- [ ] lines 10–14: **definition** `{label: error-measures}` "Actual, Absolute, and Relative Error" — excerpt: "Given a real number $p$ and an approximation for it $p*$... The **actual error** is..."
- [ ] lines 18–28: **example** `{label: nesting-technique}` "Nesting Technique" — excerpt: "We can use a nesting technique to reduce rounding errors for some calculations..."

### content/applied-math/physics/coulombs-law.md
- [ ] lines 10–18: **definition** (or axiom) `{label: coulombs-law}` "Coulomb's Law" — excerpt: "Coulomb's Law gives the equaton for electrostatic forces acting on two particles..." (refs: @permittivity-constant)
- [ ] lines 20–22: **definition** `{label: coulomb-unit}` "The Coulomb" — excerpt: "A coulumb is defined as the charge that flows from 1 ampere of current in one second"

### content/applied-math/physics/electric-fields.md
- [ ] lines 10–20: **definition** `{label: electric-field}` "Electric Field" — excerpt: "The electric field is a vector field that gives the force due to a charged particle..." (refs: @coulombs-law)
- [ ] line 22: **note** `{label: electric-field-superposition}` — excerpt: "Electric fields follow the principle of superposition..."
- [ ] lines 25–31: **definition** `{label: electric-dipole}` "Electric Dipole / Dipole Moment" — excerpt: "An electric dipole consists of two particles with charges of equal magnitude $q$ but opposite signs..."
- [ ] lines 33–41: **definition** `{label: dipole-torque}` "Torque on a Dipole" — excerpt: "The torque on a dipole in an electric field depends on the moment of the dipole..." (refs: @electric-dipole)

### content/applied-math/physics/electric-potential.md
- [ ] lines 10–15: **definition** `{label: electric-potential}` "Electric Potential" — excerpt: "The electric potential $V$ due to a particle of charge $q$ at any radial distance $r$..." (refs: @electric-field)
- [ ] lines 17–19: **note** `{label: equipotential-properties}` — excerpt: "Electric fields point from higher potential to lower potential. Electric fields are always perpendicular..."
- [ ] lines 21–32: **definition** `{label: field-as-negative-gradient}` "E as Negative Gradient of Potential" — excerpt: "the electric field $\vec{E}$ is the negative gradient of the electric potential..." (refs: @electric-field; see math-errors queue re: line 32)
- [ ] lines 36–38: **definition** `{label: electric-potential-energy}` "Potential Energy U = qV" — excerpt: "If a particle with a charge $q$ is placed at a point where the electric potential..."

### content/applied-math/physics/gauss-law.md
- [ ] lines 11–17: **definition** `{label: electric-flux}` "Electric Flux" — excerpt: "The electric flux $\Phi$ through a surface is the amount of electric field that pierces the surface..."
- [ ] lines 31–41: **theorem** (or law/axiom) `{label: gauss-law}` "Gauss's Law" — excerpt: "Gauss' law relates the electric field at points on a (closed) Gaussian surface to the net charge..." (refs: @electric-flux)
- [ ] lines 57–75: **example** `{label: gauss-derive-coulomb}` "Deriving Coulomb's Law from Gauss's Law" — excerpt: "Consider at point charge $Q$ located at a point in space. Assume a spherical Gaussian surface..." (refs: @gauss-law, @coulombs-law)
- [ ] lines 77–89: **proposition** `{label: gauss-standard-fields}` "Fields for Line/Sheet/Conductor" — excerpt: "The electric field at a point near an infinite line of charge..." (refs: @gauss-law)
- [ ] lines 91–105: **example** `{label: charged-sheets-problem}` "Parallel Charged Sheets" — excerpt: "Here we have large, parallel, uniformly charged non-conducting (plastic) sheets..." (refs: @electric-field-superposition)

### content/applied-math/physics/gravitation.md
- [ ] lines 12–16: **definition** (law) `{label: newtons-law-of-gravitation}` "Newton's Law of Gravitation" — excerpt: "Any particle in the universe attracts any other particle with a gravitational force..."
- [ ] lines 19–23: **definition** `{label: gravitational-acceleration}` "Acceleration Due to Gravity" — excerpt: "Acceleration due to gravity at any distance from earth is then given as..." (refs: @newtons-law-of-gravitation)
- [ ] line 26: **theorem** `{label: shell-theorem-interior}` "Shell Theorem (interior)" — excerpt: "A uniform shell of matter exerts no net gravitational force on a particle located inside it."

### content/applied-math/physics/motion.md
- [ ] line 14: **definition** (law) `{label: newtons-second-law}` "Newton's Second Law" — excerpt: "Newton's second law: $F = ma$"
- [ ] lines 19–30: **definition** `{label: conservative-force}` "Conservative Force" — excerpt: "A force is **conservative** if the work done by the force on an object moving it..."
- [ ] lines 35–37: **definition** `{label: kinetic-energy}` "Kinetic Energy" — excerpt: "Kinetic Energy - scalar quantity, unit is joules..."
- [ ] lines 41–48: **definition** `{label: work}` "Work" — excerpt: "Work in a straight line, unit is joules, $f(x)$ is a potentially displacement varying force..."
- [ ] lines 50–56: **definition** `{label: hookes-law}` "Hooke's Law" — excerpt: "Hooke's law for springs. $F_s$ is the spring force (in newtons)..." (see math-errors queue re: lines 50, 56)
- [ ] line 60: **definition** `{label: work-energy-principle}` "Work-Energy Principle" — excerpt: "Work Energy Principle: $W_n = \Delta K + \Delta U = \Delta E$"
- [ ] lines 63–69: **definition** `{label: momentum}` "Momentum" — excerpt: "Momentum - vector quantity, unit is $\frac{kg \cdot m}{s}$..."
- [ ] lines 73–91: **definition** `{label: friction}` "Static and Kinetic Friction" — excerpt: "There are two types of friction to consider, depending on if an object is moving or not..." (see math-errors queue re: line 77)
- [ ] lines 93–105: **definition** `{label: centripetal-acceleration}` "Radial/Centripetal Acceleration" — excerpt: "Radial acceleration, also known as centripetal acceleration), is acceleration directed towards the center..."
- [ ] lines 108–119: **definition** `{label: tangential-acceleration}` "Tangential Acceleration" — excerpt: "Tangential acceleration is acceleration along the path of the circle..."
- [ ] lines 121–128: **definition** `{label: moment-of-inertia}` "Moment of Inertia" — excerpt: "Moment of inertia, or rotational inertia, is a measure of an object's resistance..."
- [ ] lines 130–132: **definition** `{label: rotational-kinetic-energy}` "Kinetic Energy of Rotation" — excerpt: "The kinetic energy of rotation is given by the formula..." (refs: @moment-of-inertia)
- [ ] lines 134–152: **definition** `{label: torque}` "Torque" — excerpt: "Torque is a turning or twisting action on a body about a rotation axis..."
- [ ] lines 154–176: **definition** `{label: angular-momentum}` "Angular Momentum" — excerpt: "The angular momentum $\vec{\ell}$ of a particle with linear momentum $\vec{p}$..." (refs: @momentum, @torque, @moment-of-inertia)

### content/applied-math/physics/simple-harmonic-motion.md
- [ ] lines 12–24: **definition** `{label: simple-harmonic-motion}` "Simple Harmonic Motion" — excerpt: "Simple Harmonic Motion is sinusoidal periodic motion that repeats perfectly..." (refs: @hookes-law, @angular-frequency; see math-errors queue re: line 22) (note: ODE lesson-28 also defines simple harmonic motion — coordinate labels)
- [ ] lines 26–34: **definition** `{label: torsion-pendulum}` "Torsion Pendulum" — excerpt: "A torsion pendulum is an angular simple harmonic oscilator..." (refs: @hookes-law, @moment-of-inertia)
- [ ] lines 36–56: **definition** `{label: simple-pendulum}` "Simple Pendulum" — excerpt: "A simple pendulum is a pendulum with the following simplifying assumptions made..."
- [ ] lines 58–66: **definition** `{label: damped-shm}` "Damped Simple Harmonic Motion" — excerpt: "If we have damping force that is proportional to the velocity of an object..." (refs: @simple-harmonic-motion)

### content/applied-math/physics/static-equilibrium.md
- [ ] lines 10–18: **definition** `{label: static-equilibrium}` "Static Equilibrium of a Rigid Body" — excerpt: "In order for a rigid body to be in static equilibrium, it has to be static..." (refs: @torque)
- [ ] lines 20–38: **example** `{label: static-equilibrium-beam}` "Beam on Two Supports" — excerpt: "Here, we have a static body weighing $240 N$ resting on two points..." (refs: @static-equilibrium)

### content/applied-math/physics/waves.md
- [ ] lines 10–12: **definition** `{label: transverse-longitudinal}` "Transverse and Longitudinal Waves" — excerpt: "Transverse - motion of particles is perpindicular to the direction of the wave's motion"
- [ ] lines 14–34: **definition** `{label: sinusoidal-wave}` "Sinusoidal Wave" — excerpt: "A sinusoidal wave moving in the positive direction of an $x$ axis has the form..."
- [ ] lines 40–42: **theorem** `{label: wave-interference}` "Interference of Two Waves" — excerpt: "Two sinusoidal waves on the same string exhibit interference, adding or canceling..."
- [ ] line 44: **definition** `{label: standing-wave-resonance}` "Standing Wave Resonant Frequencies" — excerpt: "A standing wave on a string can only occur at resonant frequencies..."
- [ ] lines 46–56: **definition** `{label: bulk-modulus}` "Bulk Modulus" — excerpt: "The elastic property is then called the **bulk modulus** $B$..."
- [ ] lines 58–68: **definition** `{label: sound-wave}` "Sound / Longitudinal Wave Equations" — excerpt: "Sound is a longitudinal wave, and so the speed of sound in a medium is..." (refs: @bulk-modulus)
- [ ] lines 78–86: **definition** `{label: sound-intensity}` "Intensity of Sound" — excerpt: "The intensity of a sound wave at a surface is the average rate per unit area..."
- [ ] lines 90–94: **definition** `{label: decibel}` "Decibels / Sound Level" — excerpt: "Decibels are a logarithmic scale for sound level, given by the relation..."
- [ ] lines 96–100: **definition** `{label: mach-cone}` "Mach Cone Half-Angle" — excerpt: "The half-angle $\theta$ of the Mach cone is given by..."

## Typos
- [ ] numerical-analysis/gaussian-elimination.md:28 — "stragies" → "strategies"
- [ ] numerical-analysis/gaussian-elimination.md:30 — "symbolicly" → "symbolically"
- [ ] numerical-analysis/gaussian-elimination.md:34 — "dividing each rows leading value" → "each row's leading value"
- [ ] numerical-analysis/interpolation-and-polynomial-approximation.md:23 — "Morever" → "Moreover"
- [ ] numerical-analysis/interpolation-and-polynomial-approximation.md:61 — "$L_{n,k}{x_k} = 1$" → "$L_{n,k}(x_k) = 1$" (missing parentheses / malformed LaTeX)
- [ ] numerical-analysis/interpolation-and-polynomial-approximation.md:65 — "contian" → "contain"
- [ ] numerical-analysis/interpolation-and-polynomial-approximation.md:88 — "but it be written in multiple forms" → "but it can be written in multiple forms"; same line "divided differences... are used to express" → "...is used to express" (subject/verb)
- [ ] numerical-analysis/interpolation-and-polynomial-approximation.md:134 — "psuedocode" → "pseudocode"
- [ ] numerical-analysis/interpolation-and-polynomial-approximation.md:138 — `assert(len(xs) = len(ys))` uses assignment `=`; should be `==`
- [ ] numerical-analysis/interpolation-and-polynomial-approximation.md:154 — `as[i][i] = F[i][i]` indexes 2D but `as` was declared 1D (`float as[n+1]`) on line 143 (code inconsistency/bug)
- [ ] numerical-analysis/interpolation-and-polynomial-approximation.md:177 — "Particualarly" → "Particularly"
- [ ] numerical-analysis/interpolation-and-polynomial-approximation.md:181 — "has a major disadvantage in there is no differentiability" → "in that there is"; same line "phsyical" → "physical"
- [ ] numerical-analysis/numerical-differentiation.md:22 — "traeoffs" → "tradeoffs"
- [ ] numerical-analysis/numerical-differentiation.md:28 — "otherwise, there an additional error term" → "there is an additional error term"
- [ ] numerical-analysis/numerical-integration.md:34 — "there error terms" → "their error terms"
- [ ] numerical-analysis/numerical-integration.md:49 — "psuedocode" → "pseudocode"
- [ ] numerical-analysis/numerical-integration.md:68 — `XI1 += f(x)` uses lowercase `x`; loop variable is `X` (and missing semicolon) — should be `XI1 += f(X);`
- [ ] numerical-analysis/numerical-integration.md:96 — "polynomials up of up to degree $n$" → "polynomials of up to degree $n$"; same line "approximatie" → "approximate"
- [ ] numerical-analysis/numerical-integration.md:100 — "$\int_{-1}^{1} f(x) dx = \approx c_1 f(x_1) + c_2 f(x_2)$" → remove the stray `=` (should be just `\approx`)
- [ ] numerical-analysis/numerical-integration.md:102 — "gives the exact result whenver" → "whenever"
- [ ] numerical-analysis/numerical-integration.md:112 — "we neeed a formula" → "need"; same line "That us, we need" → "That is, we need"
- [ ] numerical-analysis/numerical-integration.md:120 — "system of $4$ unknowns an $4$ equations" → "and $4$ equations"
- [ ] numerical-analysis/numerical-integration.md:128 — "which as degree of precision three, meaining" → "which has degree of precision three, meaning"
- [ ] numerical-analysis/numerical-integration.md:144 — "using a the roots" → "using the roots"
- [ ] numerical-analysis/root-approximation.md:10 — "approximate roots or an equation" → "roots of an equation"
- [ ] numerical-analysis/root-approximation.md:86,89 — "psuedocode" → "pseudocode"; function name "approximateRootByNewtownsMethod" → "...NewtonsMethod"
- [ ] numerical-analysis/rounding-errors.md:12 — inconsistent/malformed notation: "$p - p\*$" and "$\|p - p\*\|$" — use "$p - p^*$" and "$|p - p^*|$"
- [ ] numerical-analysis/rounding-errors.md:28 — "$f(x) = (x - 6.1)x + 3.2)x + 1.5$" is unbalanced; correct Horner form is "$f(x) = ((x - 6.1)x + 3.2)x + 1.5$"
- [ ] physics/coulombs-law.md:10 — "equaton" → "equation"; "electostatic" → "electrostatic"
- [ ] physics/coulombs-law.md:14 — "permittivitiy" → "permittivity"
- [ ] physics/coulombs-law.md:20 — "coulumb" → "coulomb"
- [ ] physics/electric-fields.md:27 — "The electric dipole moment $\vec{p}$ had magnitude $qd$" → "has magnitude"
- [ ] physics/electric-fields.md:35 — "$\tau = \vec{p} \times \vec{E}$" uses scalar $\tau$ for a vector equation; should be $\vec{\tau}$
- [ ] physics/electric-potential.md:15 — "drops of proportional to the first power" → "drops off proportional to"
- [ ] physics/electric-potential.md:21 — "the electric potential $phi$" → "$\phi$" (missing backslash)
- [ ] physics/electric-potential.md:40–42 — inconsistent symbols: prose says "$\delta s$" but formula uses "$\Delta s$"; formula uses lowercase "$\Delta v$" where potential is $V$ elsewhere
- [ ] physics/gauss-law.md:11 — "Typically the surface is in a convenient way to solve a problem" → "Typically the surface is chosen in a convenient way..."
- [ ] physics/gauss-law.md:59 — "Consider at point charge $Q$" → "Consider a point charge $Q$"
- [ ] physics/gauss-law.md:65 — "$E \times 4 \pi r^2 = \frac{Q}{\epsilon_0} $$" — mismatched math delimiters (opens with single `$`, closes with `$$`)
- [ ] physics/gauss-law.md:104 — "contribtues" → "contributes"
- [ ] physics/motion.md:91 — "cofficient" → "coefficient"
- [ ] physics/motion.md:95 — "Radial acceleration, also known as centripetal acceleration)," — unbalanced/stray closing paren; should be "(also known as centripetal acceleration)"
- [ ] physics/motion.md:138 — "toruqe" → "torque"
- [ ] physics/motion.md:142 — "perpindicular" → "perpendicular"
- [ ] physics/motion.md:174 — "ridig axis" → "rigid axis"
- [ ] physics/simple-harmonic-motion.md:28 — "oscilator" → "oscillator"; "it will oscilate" → "oscillate"
- [ ] physics/static-equilibrium.md:27 — unbalanced parenthesis (the "(although we could pick any point..." is never closed); also "because lies in the same vertical line" → "because it lies"
- [ ] physics/waves.md:10 — "perpindicular" → "perpendicular"
- [ ] physics/waves.md:18 — "of the wave k." — trailing stray "k" (leftover); sentence should end "of the wave."
- [ ] physics/waves.md:36 — "sinsoidal" → "sinusoidal"
- [ ] physics/waves.md:42 — "$y\prime (x,t)$" — bare `\prime`; should be "$y'(x,t)$"
- [ ] physics/waves.md:70 — unbalanced parenthesis: "(said to be $\Delta L = \left \| L_2 - L_1 \right \|$ units apart," is never closed
- [ ] physics/waves.md:76 — "frequences" → "frequencies"; "beat frequencey" → "beat frequency"

(All paths relative to content/applied-math/.)
