---
layout: page
redirect_from:
- calculus/differentiation
title: Differentiation
description: Defines the derivative using limits and proves fundamental differentiation rules including linearity, product rule, quotient rule, and chain rule, plus major theorems like Rolle's Theorem and the Mean Value Theorem.
---

# Differentiation

For $f: (a,b) \to \mathbb{R}, a,b \in \mathbb{R}$, we say the **derivative** of $f$ at $x,$ denoted $f'(x)$ is given by

$$ f'(x) = \lim_{y \to x} \frac{f(y) - f(x)}{y - x}. $$

If this limit exists, the function is said to be differentiable at $x.$ If the limit exists for all $x \in (a,b),$ the function is said to be differentiable on $(a,b).$

Note that this is just the rise-over-run formula for the slope between two points taken to the limit of the two points being infinitesimally near each other.

*Theorem:* If $f$ is differentiable at $x,$ then it is continuous at $x.$

*Proof*: Suppose that $f$ is differentiable at $a.$ We want to show that

$$ \lim_{x -> a} f(x) = f(a). $$

Now,

$$ \begin{aligned}
    \lim_{x \to a}(f(x) - f(a)) & = \lim_{x \to a} \left ( \frac{f(x) - f(a)}{(x - a)}(x - a) \right ) \\
                \dots                   & = \lim_{x \to a} \left ( \frac{f(x) - f(a)}{(x - a)} \right ) \cdot \lim_{x \to a} (x - a) \\
                \dots                    & = f'(a) \cdot 0 \\
    \lim_{x \to a}f(x) - f(a)       & = 0 \\
    \lim_{x \to a} f(x)             & = f(a). \square
    \end{aligned}                               
$$

## Derivative Rules

Let $c$ be a real number, and f and g be functions defined on an open interval and differentiable at a point $x$ in that interval.

Linearity: $(f+cg)' = f'(x) + cg'(x).$

*Proof*:

$$ \begin{aligned}
    (f + cg)'(x) & = \lim_{y \to x} \frac{(f + cg)(y) - (f + cg)(x)}{y - x} \\
                 & = \lim_{y \to x} \frac{f(y) + (cg)(y) - f(x) - (cg)(x)}{y - x} \\
                 & = \lim_{y \to x} \frac{f(y) - f(x)}{y - x} + \lim_{y \to x} \frac{cg(y) - cg(x)}{y - x} \\
                 & = f'(x) + cg'(x). ~ \square
\end{aligned} $$

Product: $(fg)'(x) = f'(x)g(x) +f(x)g'(x).$

*Proof:* The trick here is to subtract and add $f(y)g(x)$ to the numerator on the second line. This allows factoring, and then we just use limit laws.

$$ \begin{aligned}
    (fg)'(x) & = \lim_{y \to x} \frac{(fg)(y) - (fg)(x)}{y - x} \\
             & = \lim_{y \to x} \frac{f(y)g(y) - f(y)g(x) + f(y)g(x) - f(x)g(x)}{y - x} \\
             & = \lim_{y \to x} \frac{(g(y) - g(x))f(y) + (f(y) - f(x))g(x)}{y - x} \\
             & =  \lim_{y \to x} g(x)\frac{f(y) - f(x)}{y - x}  + \lim_{y \to x} f(y)\frac{g(y) - g(x)}{y - x} \\
             & =  \lim_{y \to x} g(x) \cdot \lim_{y \to x}\frac{f(y) - f(x)}{y - x}  + \lim_{y \to x} f(y) \cdot \lim_{y \to x}\frac{g(y) - g(x)}{y - x} \\
             & = f'(x)g(x)+ f(x)g'(x). ~ \square \\
\end{aligned}
$$

Quotient: $(f/g)'(x) = \frac{f'(x)g(x) - f(x)g'(x)}{\[g(x)\]^2}.$

*Proof:* Since division is multiplication by a reciprocal, we use the same trick as for the product rule.

$$
\begin{aligned}
    (f/g)'(x) & = \lim_{y \to x} \frac{(f/g)y - (f/g)x}{y - x} \\
              & = \lim_{y \to x}  \frac{\frac{f(y)}{g(y)} - \frac{f(x)}{g(x)}}{y - x} \\
              & = \lim_{y \to x}  \frac{\frac{f(y)g(x) - f(x)g(y)}{g(y)g(x)}}{y - x} \\
              & = \lim_{y \to x}  \frac{\frac{f(y)g(x) - f(x)g(x) + f(x)g(x) - f(x)g(y)}{g(y)g(x)}}{y - x} \\
              & = \lim_{y \to x}  \frac{\frac{f(y)g(x) - f(x)g(x)}{g(y)g(x)}}{y - x}  - \lim_{y \to x} \left (  \frac{\frac{f(x)g(y) - f(x)g(x)}{g(y)g(x)}}{y - x} \right ) \\
              & = \lim_{y \to x} \left ( \frac{f(y) - f(x)}{y - x}\frac{g(x)}{g(y)g(x)} \right )  - \lim_{y \to x} \left ( \frac{g(y) - g(x)}{y - x}\frac{f(x)}{g(y)g(x)} \right ) \\
              & = \frac{f'(x)g(x) - g'(x)f(x)}{[g(x)]^2}. ~ \square
\end{aligned}
$$ 

Let $h(x) = f(g(x)).$

Chain: $h'(x) = f'(g(x)) \cdot g'(x).$

## Local Extrema
The real valued function on the real line $f$ is said to have a **local maximum** at $c \in \mathbb{R}$ if there exists a $\delta > 0$ such that $f(x) \leq f(c)$ for all $x \in (c - \delta, c + \delta).$

The real valued function on the real line $f$ is said to have a **local minimum** at $c \in \mathbb{R}$ if there exists a $\delta > 0$ such that $f(x) \geq f(c)$ for all $x \in (c - \delta, c + \delta).$

*Derivatives at Local Extrema Theorem (Fermat's Theorem):* Suppose $f$ is defined on an open interval, that $c$ is a number in that interval, and that $f$ has a local maximum or minimum at $c,$ and that $f'(c)$ exists. Then $f'(c) = 0.$

## Other Theorems

*Rolle's Theorem:* Suppose $f$ is continuous on $[a,b]$ and differentiable on $(a,b)$ and that $f(a) = f(b).$ Then there exists a point $c$ in $(a,b)$ such that $f'(c) = 0.$

Simply put, if a differentiable function over an open interval $(a,b)$ has the same value at its boundary points, then at some point in the interval, the function is flat (has a zero derivative).

*Mean Value Theorem:* Suppose $f$ is continuous on $[a,b]$ and differentiable on $(a,b).$ Then there exists a point $c$ in $(a,b)$ such that:

$$ f'(c) = \frac{f(b) - f(a)}{b-a}.$$

This means that for a function continuous on an interval, and differentiable on that interval except maybe at its endpoints, there is a point on the interval where the derivative of the function at that point equals the slope of the function between its endpoints.

*L'Hospital Rule (Theorem)*: Suppose there is a $\delta > 0$ such that $f$ and $g$ are differentiable on $(c  - \delta, c + \delta)$ with $g'(x) \neq 0$ on this interval. Suppose also that

$$ \lim_{x \to c} \frac{f'(x)}{g'(x)} = L. $$

Then if $\lim_{x \to c}f(x) = \lim_{x \to c}g(x) = 0,$ $\lim_{x \to c}f(x) = \lim_{x \to c}g(x) = \infty,$ or $\lim_{x \to c}f(x) = \lim_{x \to c}g(x) = -\infty,$ we have that

$$ \lim_{x \to c} \frac{f(x)}{g(x)} = L. $$

The endpoint $c$ can also be $\pm \infty.$