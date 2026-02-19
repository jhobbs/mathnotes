---
layout: page
title: Weakly Nonlinear Oscillators
---

# Perturbation Theory

:::definition "Weakly Nonlinear Oscillator"
Equations of the form

$$ \dot{x} + x + \epsilon h(x, \dot{x}) = 0 \tag{a} $$

where $0 \leq \epsilon \ll 1$ and $h(x, \dot{x})$ is an arbitrary @smooth @function represent small @perturbations of the @linear @oscillator $\dot{x} + x = 0$ and are therefore called **weakly nonlinear oscillators.**
:::

We can try to find solutions of the weakly nonlinear oscillator defined above in the form of power series:

$$ x(t, \epsilon) = x_0(t) + \epsilon x_1(t) + \epsilon^2 x_2 (t) + \dots, \tag{b} $$

where we have to determine $x_k(t)$ from the original equation and initial conditions. Ideally, we could get a useful solution just truncating to the first few terms and the higher order terms would just be minor corrections. This approach is called **regular perturbation theory.**

However, it runs into problems - the truncation causes secular terms that blow up to infinity too quickly to show up.

We'll just go at this by example because I'm still figuring it out. We'll use the weakly damped linear oscillator as an example:

$$ \dot{x} + 2 \epsilon \dot{x} + x = 0, \quad x(0) = 0, \dot{x} 0 = 1. \tag{c} $$

Solved exactly, the solution is $x(t, \epsilon) = (1 - \epsilon^2)^{-1/2}e^{-st}\sin{[(1-\epsilon^2)^{1/2}t]}. \tag{s}$ Solving it using perturbation theory we have

$$ \frac{d^2}{dt^2} (x_0 + \epsilon x_1 + \dots) + 2 \epsilon \frac{d}{dt} (x_0 + \epsilon x_1 + \dots) + (x_0  + \epsilon x_1 + \dots) = 0. $$

Now, we can group terms according to powers of $\epsilon.$ We get

$$ [\ddot{x}_0 + x_0] + \epsilon[\ddot{x_1} + 2 \dot{x}_0 + x_1] + O(\epsilon^2) = 0. $$ 

We want this equation to hold for all sufficiently small $\epsilon,$ so the coefficients for each power of $\epsilon$ must vanish separately and we have

$$ O(1): \ddot{x}_0 + x_0 = 0. \tag{d} $$

$$ O(\epsilon): \ddot{x_1} + 2 \dot{x_0} + x_1 = 0. \tag{e} $$

We drop $O(\epsilon^2)$ and higher terms as we want an approximation that doesn't require them. Plugging the initial conditions from (c) into (b) we get

$$ x_0(0) = 0, \quad x_1(0) = 0, $$

and a similar approach (differentiate (a) and plug in initial conditions?) gives

$$ \dot{x}_0(0) = 1, \quad \dot{x}_1(0) = 0. $$

Now, we solve the IVP (d) with our initial conditions $x_0(0) = 0, \dot{x}_0(0) = 1,$ to get

$$ x_0(t) = \sin{t}. $$

If we plug this into (e) we get

$$ \ddot{x}_1 + x_1 = -2 \cos{t}. $$

Now this is the trouble, the $-2 \cos{t}$ term is a resonant forcing, and the solution subject to our initial conditions is

$$ x_1(t) = -t \sin{t}, $$

and our overall solution is 

$$ x(t, \epsilon) = \sin{t} - \epsilon t \sin{t} + O(\epsilon^2). $$

Compare this to the actual solution we gave above. While the actual solution decays over time, the solution perturbation theory gives blows up to infinity over time! This leads us to.. two timing!

## Two Timing
Given the weakly nonlinear oscillator

$$ \ddot{x} + x + \varepsilon(x^2 - 1)\dot{x}^3 = 0, \quad 0 < \varepsilon \ll 1, \tag{f} $$

let $\tau = t$ be fast time and $T = \varepsilon t$ be slow time. Then

$$ x(t, \varepsilon) = x_0(\tau,T) + \varepsilon x_1(\tau, T) + O(\varepsilon^2) $$

is a series expansion of a solution of (f). I like operator notation, so let

$$ D_\tau = \frac{\partial}{\partial \tau}, \quad D_T = \frac{\partial}{\partial T}. $$

Now,

$$ \frac{d}{dt} = D_\tau + \varepsilon D_T, \quad \frac{d^2}{dt^2} = (D_\tau + \varepsilon D_T)^2 = D_\tau^2 + 2 \varepsilon D_\tau D_T + \varepsilon^2 D_T^2, $$

so

$$ \dot{x} = (D_\tau + \varepsilon D_T)(x_0 + \varepsilon x_1 + O(\varepsilon^2)) = D_\tau x_0 + \varepsilon D_\tau x_1 + \varepsilon D_T x_0 + O(\varepsilon^2) = D_\tau x_0 + \varepsilon ( D_\tau x_1 + D_T x_0) + O(\varepsilon^2), $$

$$ \begin{aligned}
	\ddot{x} & = (D_\tau^2 + 2 \varepsilon D_\tau D_T + \varepsilon^2 D_T^2)(x_0 + \varepsilon x_1 + O(\varepsilon^2)) \\
	& = D_\tau^2 x_0 + \varepsilon D_\tau^2 x_1 + 2 \varepsilon D_\tau D_T x_0 + O(\varepsilon^2) \\
	& = D_\tau^2 x_0 + \varepsilon( D_\tau^2 x_1 + 2 D_\tau D_T x_0) + O(\varepsilon^2).
\end{aligned} $$

Now, we need to do some more expansion before plugging everything back into our original equation. First, if we look at $\dot{x}^3,$ any terms including $O(\varepsilon^2)$ will be combined so we leave it out for now, and then if we let $a = D_\tau x_0, b = \varepsilon ( D_\tau x_1 + D_T x_0),$ we can use the expansion $(a+b)^3 = a^3 + 3 a^2 b + 3 a b^2  + b^3.$ Any terms with $b^2$ or higher become part of $O(\varepsilon)^2,$ so we end up with

$$ \dot{x}^3 = a^3 + 3a^2 b + O(\varepsilon^2) = (D_\tau x_0)^3 + 3 \varepsilon (D_\tau x_0)^2 (( D_\tau x_1 + D_T x_0)) + O(\varepsilon^2). $$

We'll leave it there without expanding more because all the $\varepsilon$ terms drop out here:

$$ \begin{aligned}
	\varepsilon(x^2 - 1)\dot{x}^3 & = (x^2 -1)(\varepsilon (D_\tau x_0)^3 + 3 \varepsilon^2 (D_\tau x_0)^2 (( D_\tau x_1 + D_T x_0)) + O(\varepsilon^3)) \\
	& = (x^2 -1)(\varepsilon(D_\tau x_0)^3) + O(\varepsilon^2) \\
	& = ((x_0 + \varepsilon x_1 + O(\varepsilon^2))^2 - 1)((\varepsilon(D_\tau x_0)^3) + O(\varepsilon^2)) \\
	& = (x_0^2  + 2 \varepsilon x_0 x_1 -1 + O(\varepsilon^2))((\varepsilon(D_\tau x_0)^3) + O(\varepsilon^2)) \\
	& = (x_0^2  + 2 \varepsilon x_0 x_1 -1)(\varepsilon(D_\tau x_0)^3) + O(\varepsilon^2) \\
	& = \varepsilon (D_\tau x_0)^3 (x_0^2 - 1) + O(\varepsilon^2). \\
\end{aligned} $$

Finally we're ready to write out our expanded version of (f):

$$ \begin{aligned}
\ddot{x} + x + \varepsilon(x^2 - 1)\dot{x}^3 & = 0 \\
	D_\tau^2 x_0 + \varepsilon( D_\tau^2 x_1 + 2 D_\tau D_T x_0) + x_0 + \varepsilon x_1 + \varepsilon (D_\tau x_0)^3 (x_0^2 - 1) + O(\varepsilon^2) & = 0 \\
	D_\tau^2 x_0 + x_0 + \varepsilon( D_\tau^2 x_1 + 2 D_\tau D_T x_0 + x_1 + (D_\tau x_0)^3 (x_0^2 - 1)) + O(\varepsilon^2) & = 0.
\end{aligned} $$

Collecting powers of $\varepsilon$ yields a pair of differential equations (with the second one separating $x_0$ and $x_1$ terms):

$$ \begin{aligned}
	O(1) & : D_\tau^2 x_0 + x_0 = 0 \\
	O(\varepsilon) & : D_\tau^2 x_1 + x_1 = - 2 D_\tau D_T x_0 - (D_\tau x_0)^3 (x_0^2 - 1).
\end{aligned} $$

The general solution for the $O(1)$ equation, whose eigenvalues are $\pm i,$ is $x_0 = c_1(T) e^{i\tau} + c_2(T) e^{-i \tau}, c_1, c_2 \in \mathbb{C}.$ But we have $x$ is real, so $c_1(T) = \overline{c_2(T)},$ and we can write our solution as

$$ x_0 = 2 \Re{(c(T) e^{i \tau})} = 2 \Re{(\rho(T) e^{i\phi(T)} e^{i\tau})} = 2 \rho(T) \Re{(e^{i(\tau + \phi(T))})} = 2 \rho(T) \cos{(\tau + \phi(T))}. $$

Letting $R(T) = 2 \rho(T)$ (and recalling that since $\rho$ is the modulus of a complex number, $\rho \geq 0$) gives us

$$ x_0(\tau, T) = R(T)\cos{(\tau + \phi(T))}. $$

Now we substitute our solution for $x_0$ into the $O(\varepsilon)$ equation:

$$ \begin{aligned}
	D_\tau^2 x_1 + x_1 & = - 2 D_\tau D_T x_0 - (D_\tau x_0)^3 (x_0^2 - 1) \\
	& =  - 2 D_\tau D_T (R(T)\cos{(\tau + \phi(T))}) - (D_\tau (R(T)\cos{(\tau + \phi(T))}))^3 ((R(T)\cos{(\tau + \phi(T))})^2 - 1) \\
	& =  2 D_T (R(T)\sin{(\tau + \phi(T))}) + (R(T)\sin{(\tau + \phi(T))})^3 ((R(T)\cos{(\tau + \phi(T))})^2 - 1).
\end{aligned} $$

To keep things from getting messy we'll just write $R = R(T)$ and $\phi = \phi(T), y = \tau + \phi.$ Proceeding with applying $D_T$ on the RHS we get

$$ \begin{aligned}
	D_\tau^2 x_1 + x_1 & =  2 (R \phi'\cos{y} + R'\sin{y}) + (R^3\sin^3{y})((R^2\cos^2{y}) - 1) \\
	& =  2 (R \phi'\cos{y} + R'\sin{y}) - R^3(1 - (R^2\cos^2{y}))(\sin^3{y}) \\
	& =  2 (R \phi'\cos{y} + R'\sin{y}) - \frac{R^3}{16}((12 - 2R^2)\sin{y} - (4 + R^2)\sin{(3y)} + R^2\sin{(5y)})\\
	& =  2 R\phi' \cos{y} + (2R' - \frac{R^3}{8}(6 - R^2))\sin{y} + \frac{R^3}{16}((4 + R^2)\sin{(3y)} - R^2\sin{(5y)}).\\
\end{aligned} $$

Here, $'$ denotes derivative with respect to $T.$ We want to eliminate the resonant terms $\sin{y}$ and $\cos{y}$; to do so we'll require their coefficients to be zero:

$$ 2R' - \frac{R^3}{8}(6 - R^2)  = 0, \quad 2R\phi'  = 0. $$

Isolating the derivatives gives us

$$ R' = \frac{R^3}{16}(6 - R^2), \quad \phi'  = 0. $$

First consider the $R'$ equation. On the half-line $R \geq 0,$ we have that $R^* = 0$ is an unstable fixed point, and $R^* = \sqrt{6}$ is a stable fixed point. Therefore, $R(T) \to \sqrt{6}$ as $T \to \infty.$ Now, $\phi' = 0$ implies $\phi(T) = \phi_0$ for some constant $\phi_0.$ Hence $x_0(\tau, T) \to \sqrt{6}\cos{(\tau + \phi_0)}$ and therefore

$$ x(t) \to \sqrt{6}\cos{(t + \phi_0)} + O(\varepsilon) $$

as $t \to \infty.$ Thus, all trajectories with $R_0 > 0$ approach an approximately circular stable limit cycle of radius $\sqrt{6} + O(\varepsilon)$ in the $(x, \dot{x})$ plane, traversed at a frequency of $1 + O(\varepsilon)$.

