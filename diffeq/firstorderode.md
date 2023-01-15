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

To test if $f(x,y)$ is a solution of a differential equation $F(x, y, y',\cdots,y^{(n)}) = 0$, take the necessary derivatives of $f(x,y)$. Then, in $F$, replace $y$ with $f(x)$, $y'$ with $f'(x)$, and so on, and see if the result is a valid equation of $x$.

***Definition 3.6 - Implicit Solution***
A relation $f(x,y) = 0$ will be called an implicit solution of the differential equation

(3.61) $$F(x,y,y',\codts,y^{(n)}) = 0$$

on the interval $I: a < x < b$, if

1. it defines $y$ as an implict function of $x$ on $I$, i.e. if there exists a function $g(x)$ defined on $I$ such that $f[x,g(x)] = 0$ for *every* $x$ in $I$, and if
2. $g(x)$ satisfies 3.61, i.e. if

$$F[x,g(x),g'(x),\cdots,g^{(n)}(x)] = 0

for *every* $x$ in $I$.

In more plain english, the relation (not function) $f(x,y)$ is an implicit solution if there is some $g(x)$ that can be chosen to make a function $f(x,g(x)) = 0$ from $f(x)$. That is, we can chose a branch of $f(x,y)$ to make a function rather than just a relation, and if that function and its derivatives satisfy 3.61 then $f(x,y)$ is considered an implicit solution of the differential equation.

Note that here was have $f(x,y)$ where for an explicit 
