# Exact Differential Equations

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

***Definition 9.27*** The differential equation

$$ \tag{9.28} P(x,y)dx + Q(x,y)dy = 0 $$

is called **exact** if there exists a function $f(x,y)$ such that its partial derivative with respect to $x$ is $P(x,y)$ and its partial derivative with respect to $y$ is $Q(x,y)$. In symbolic notation, the definition says that (9.28) is an **exact differential equation** if there exists a function $f(x,y)$ such that:

$$ \tag{9.29} \frac{\partial}{\partial x}f(x,y) = P(x,y), \frac{\partial}{\partial y}f(x,y) = Q(x,y) $$

A 1-parameter family of solutions of the exact differential equation (9.28) is then

$$ \tag{9.291} f(x,y) = c $$

## Necessary and Sufficient Condition for Exactness and Method of Solving an Exact Differential Equation

***Theorem 9.3*** *A necessary and sufficient condition that the differential equation*

$$ \tag{9.31} P(x,y)dx + Q(x,y)dx = 0 $$

*be exact is that*

$$ \tag{9.32} \frac{\partial}{\partial y}P(x,y) = \frac{\partial}{\partial x}Q(x,y) $$

*where the functions defined by P(x,y) and Q(x,y), the partial derivatives in (9.32) and* $\partial P(x,y)/\partial x, \partial Q(x,y)/\partial y$ *exist and are continuous in a simply connected region R*.

***Proof of necessary condition*** To summarize an already brief proof, recall from Calculus 3 that the order of partial derivatives doesn't matter, i.e. that $F_xy(x,y) == F_yx(x,y)$. Thus, if such a function $f(x,y)$ whose partial derivatives with respect to $x$ and $y$ are $P(x,y)$ and $Q(x,y)$, respectively, then the second partial derivatives of those functions with respect to $y$ and $x$ must also be equal.

***Solution from proof of sufficient condition*** This proof takes several pages in the book and I won't reproduce it here. It does give a method of finding the function which is a solution, and I'll instead talk about how to find that function.

Following the proof in the book we find we can take either of two functions as solutions.

$$ \tag{9.45} f(x,y) = \int_{x_0}^x P(x,y)dx + \int_{y_0}^yQ(x_0,y)dy = c $$

or

$$ \tag{9.47} f(x,y) = \int_{x_0}^x Q(x,y)dy + \int_{y_0}^yP(x,y_0)dy = c $$

where $(x_0,y_0)$ is a point in $R$ and the rectangle determined by the lines joining the points $(x_0,y_0)$, $(x,y_0)$, $(x_0,y_0)$, and $(x_0,y)$ lies entirely in $R$.

We can pick which function to used based on which is easier to compute with, which may require some experimentation. One handy effect is picking $0$ for $x_0$ and taking the first function with $Q(x_0,y)$ causes all terms of $x$ in $Q$ to vanish, and similarly taking $y_0$ as $0$ when we use the second function.

Using this formulaic approach, we setup the integral, integrate, and have our solution.

***Solution from Definition***

An alternative approach, and one preferred by the authors (and by me), is to instead construct a solution from definition.

*jmh: what follows is my own and has some weird notation I made up and maybe some shakey ideas. The book
didn't do this; it used an specific function, and that may be more useful to look at.*

Given a differential equation of the form:

$$ \tag{s.1} P(x,y)dx + Q(x,y)dy = 0 $$

first test for exactness. If it's exact, we know by definition (9.27) there is a $f(x,y)$ where:

$$ \tag{s.2} \frac{\partial}{\partial x} f(x,y) = P(x,y). $$

Then, by integration, we have:

$$ \tag{s.3} f(x,y) = P_{-x}(x,y) + R(y) $$

*jmh: * $P_{-1}$ here is my notation for the antiderivative of* $P(x,y)$ * with respect to x without any constant of integration, since that's what* $R(Y)$ *is. Not sure what the convention is here. The book shows this by example rather than abstractly.*

where $R(y)$ is the arbitrary constant of integration (in this case an unknown function of $y$ since we integrated with respect to $x$)

we can then differentiate with respect to y to obtain

$$ \tag{s.4} \frac{\partial}{\partial y} f(x,y) = \frac{\partial}{\partial y}( P_{-x}(x,y) + R(y)) = P_{-x,y}(x,y) + R'(y) $$ 

where $P_{-x,y}$ is the antiderivative of $P$ with respect to $x$ subsequently partially differentiated by $y$.

but by definition (9.27) we also have

$$ \tag{s.5} \frac{\partial}{\partial y} f(x,y) = Q(x,y) $$

Setting the right-most expression of (s.4) equal to the right-most expression of (s.5) we get:

$$ \tag{s.6} P_{-x,y}(x,y) + R'(y) = Q(x,y) $$

$P_{-x,y}$ and $Q(x,y)$ will be almost equivalent, with just some constant or function of $y$ left between them, let's call that $W(y)$ - but be clear that $W(y)$ is a *known* function (because both $P_{-x,y}(x,y)$ and $Q(x,y)$ are known, so is their difference where $R'(y)$ is unknown still (as it's the derivative of an unknown arbitrary constant of integration).

To find $R(y)$ integrate to get

$$ \tag{s.7} R(Y) = \int R'(y) dy = \int W(y) dy $$

Then substituting (s.7) into (s.3) we get

$$ \tag{s.8} f(x,y) = P_{-x}(x,y) + \int W(y) dy $$

which is the function we seek.
