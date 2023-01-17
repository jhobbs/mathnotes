## Review of Integration Theory

1. Let $f(x)$ be a function of $x$ defined on an interval $I: a \leq x \leq b$. Let $I$ be divided into $n$ subintervals and call $\Delta x_k$ the width of the $k$ th subinterval. Then if

$$ \tag{9.11} \lim_{n \to \infty} \sum\limits_{k=1}^n f(x_k) \Delta x_k $$

exists as the number of subintervals increases in such a manner that the largest subinterval approaches zero, we say that

$$ \tag{9.12} \lim_{n \to \infty} \sum\limits_{k=1}^n f(x_k) \Delta x_k = \int_{a}^{b} f(x)dx. $$

This limit is called the **Riemann intergral** of $f(x)$ over $I$. If this limit does not exist, we say $f(x)$ is not Riemann integrable over $I$.

2. If $f(x)$ is a continuous funtion of $x$ on an interval $I: a \leq x \leq b,$ and

$$ \tag{9.13} F(x) = \int_{x_0}^{x} f(u)du, $$

then by the *fundamental theorem of the calculus*

$$ \tag{9.14} F'(x) = f(x), a < x < b, $$

or equivalently

$$ \tag{9.15} \frac{d}{dx}\int_{x_0}^x f(u)du = f(x). $$

3. Let $P(x,y)$ and $Q(x,y)$ be functions of two independent variables $x,y$ both function being defined on a common domain $D$. If we wish to perform the following integration, the first with respect to $x$ ( $y$ constant), and the second with respect to $y$ ( $x$ constant)

$$ \tag{9.16} \int_{x_0}^x P(x,y)dx + \int_{y_0}^y Q(x,y) dy $$

we must be sure that $(x_0,y_0)$ is a point of $D$ and that the rectangle dtermined by the line segments joining the points $(x_0,y_0)$, $(x,y_0)$, $(x_0,y_0)$, and $(x_0,y)$ lies entirely in $D$. Since domains can be of various shapes, we must exclude domains where this rectangle either crosses regions outside of the domain, or domains with holes inside the rectangle.

***Definition 9.19***
A region is called a **simply connected region** if *every* simple *closed* curve lying entirely in the region *encloses only points of the region*.

To summarize: We can perform the integrations called for in (9.16) only if:

a) The common domain of definition of the functions is a simply connected region $R$.

b) The point $(x_0,y_0)$ is in $R$

c) The rectangle determined by the lines joining the points $(x_0,y_0)$, $(x,y_0)$, $(x_0,y_0)$, and $(x_0,y)$ lies entirely in $D$

## Definition of an Exact Differential and of an Exact Differential Equation

***Definition 9.23***  A differential expression

$$ \tag{9.24} P(x,y)dx + Q(x,y)dy $$

is called an **exact differential** if it is the total differential of a function $f(x,y)$, i.e., if

$$ \tag{9.241} P(x,y) = \frac{\partial}{\partial x}f(x,y) \quad \text{and} \quad Q(x,y) = \frac{\partial}{\partial y}f(x,y). $$



## Necessary and Sufficient Condition for Exactness and Method of Solving an Exact Differential Equation


