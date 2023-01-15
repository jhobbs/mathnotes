Notes are from *Ordinary Differential Equations* by Tenenbaum and Pollard

# Ordinary Differential Equations

## Lesson 3 - The Differential Equation

***Definition 3.1 - Ordinary Differential Equation***

Let $f(x)$ define a function of $x$ on an interval $I: a < x < b$. By an **ordinary differential equation** we mean an equation involving $x$, the function $f(x)$ and one or more of its derivatives.

**Note.** It's customary to replace $f(x)$ by $y$.

***Definition 3.2 - Order of a Differential Equation***

The order of a differential equation is the order of the highest derivative involved in the equation.

For example, the differential equation $y' = e^x$ is of the first order, and the differential equation $y'' + y' = 3y$ is  of the second order.

***Definition 3.4 - Explicit Solution***
Let $y = f(x)$ define $y$ as a function of $x$ on an interval $I: a < x < b$. We say that the function $f(x)$ is an explict solution or simply a solution of an ordinary differential equation involving $x$, $f(x)$, and its derivatives, if it satisfies th equation for *every* $x$ in $I$, i.e., if we replace $y$ by $f(x)$, $y'$ by $f'(x)$, $y''$ by $f''(x)$, $\cdots$, $y^{(n)}$ by $f^{(n)}(x)$, the differential equation reduces to an identity in $x$. In mathematical symbols, the definition says: the function $f(x)$ is a solution of the differential equation:

$$F(x,y,y',\cdots,y^{(n)} = 0$$

if 

$$F[x,f(x),f'(x),\cdots,f^{(n)}(x)] = 0$$

In more plain english, $f(x)$ is a solution of $F(\ldots) = 0$ if we replace all of the occurences of $y$ and its derivatives in $F(...)$ with the $f(x)$ and its respective derivatives and the result is a valid equation of only $x$.
