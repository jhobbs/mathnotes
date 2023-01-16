# Lesson 4 - The General Solution of a Differential Equation

***Multiplicity of Solutions of a Differential Equation***

Recall that when integrating, we get a constant of integration, i.e. integrating

$$ y' = e^x $$

results in:

$$ y = e^x + c $$
latex
and integrating twice:

$$ y'' = e^x $$

results in: 

$$ y = e^x + c_1x + c_2 $$

For a large class of differential equations, the solution a diffrential equation of order $n$ has $n$ arbitrary constants. However, this isn't always true.

Because all solutions to differential equations involve at least one arbitrary constant, any differential equation that has a solution has *infinitely many solutions*.

***Definition 4.3 - n-parameter family of solutions***

The functions defined by 

(4.31)

$$ y = f(x,c_1,c_2,\cdots,c_n) $$

of the $n + 1$ variables, $x, c_1, c_2, \cdots, c_n$ will be called an **n-parameter family of solutions** of the $n$th order differential equation

(4.32)

$$ F(x,y,y',\cdots,y^{(n)} = 0 $$ 

if for each choice of a set of values $c_1, c_2, \cdots, c_n$, the resultion *function* $f(x)$ defined by (4.31) (it will now define a function of $x$ alone) satisfies (4.32), i.e. if

(4.33)

$$ F(x,f',f'',\cdots,f^{(n)}) = 0 $$

For the classes of differential equations we shall consider, we can now assert: *a differential equation of the *n*th order has an *n*-parameter family of solutions*.

***Finding a Differential Equation from its n-Parameter family of solutions***

While an $n$-parameter family of solutions contains $n$ arbitrary constants, the differential equation it is a solution of will contain no constants.

The approach to find the differential equation, then, is to differentiate the $n$-parameter family of solutions and then eliminate any constants remaining.

For example, if we have the 1-parameter family of solutions

$$ \tag{a} y = ccosx+x $$

we can differentiate it to get:

$$ \tag{b} y' = -csinx + 1 $$

We can now solve for $c$:

$$ \frac{1 + y'}{sinx} = c $$

Then substitute $c$ into (a) to get:

$$ y = \frac{1 + y'}{sinx}cosx+x$$

Simplifying we get:

$$ y' = (x - y)tanx + 1,~x \neq \pm \frac{\pi}{2},\pm\frac{3\pi}{2},\ldots, $$

Which is the required differential equations. There are other ways to solve for $c$ - it's just algebra at this point.

The same thing applies for $2$-parameter families of solutions - we'd just differentiate twice instead. This can, in some cases, such as $y =c_1e^x + c_2e^{-x}$ where we get two equations with two unknowns which can be simultaneously solved.

