---
layout: page
title: Summary of First Order Differential Equations
---

# Summary of First Order Differential Equations

This chapter explores some special types of first order differential equations. It covers how to identify them and how to solve them. These are my (jmh) notes summarizing it.


## Types 
One general form that comes up a lot is:

$$ \tag{a} P(x,y)dx + Q(x,y)dy = 0 $$

The main types that are solvable when written in this form are:

* **Separable** - can be separated so that $P(x,y)$ a function of only $x$ and $Q(x,y)$ is a function of only $y$
* **Homogenous Coffecients** - $P(x,y)$ and $Q(x,y)$ are homogenous, i.e. they have a common factor $x^n$ or $y^n$. These can be made separable by substituting $y = ux$ or $x = uy$.
* **Linear Coefficients** - $P(x,y)$ and $Q(x,y)$ are linear. These can be solved through translation of axes when non-parallel. When parallel, they can be solved by substituting $u = P(x,y),~v = Q(x,y)$, which will lead to an equation with homgenous coefficients.
* **Exact Differential Equations** - These have the property that there is a function $f(x,y)$ such that $\frac{\partial f(x,y)}{\partial x} = P(x,y),~\frac{\partial f(x,y)}{\partial y} = Q(x,y).$ These can be solved from this definition, and identified and also solved by using the fact that $\frac{\partial}{\partial y}P(x,y) = \frac{\partial}{\partial x}Q(x,y)$.
* **Integrable Combinations** - We can sometimes recognize pairs of differential coefficients as integrable combinations, where they are the parts of a total differential. Sometimes a differential equation can have more than one pair of integrable combinations.
* **Inexact Differential Equations** - Sometimes we can make an inexact differential equation exact by finding an integrating factor. There are a few special cases we can find this in - see the notes for details.

Another important form is the *Linear differential equation*, which can be written like this:

$$ \tag{b} \frac{dy}{dx} + P(x)y = Q(x) $$

* **Linear Differential Equation** - Both the dependent variable (usually $y$ but can be $x$) and its derivative are of the first degree. These can be solved easily by letting $h(x) = e^{\int{P(x)}dx}$ and using the fact that $h(x)y = \int{h(x)Q(x)}dx + c$.
* **Bernoulli Equation** - can be written as $\tag{b} \frac{dy}{dx} + P(x)y = Q(x)y^n$. This is not linear but can be made linear by multiplying by $(1-n)y^{-n}$.
* **Ricatti Equation** - An equation of the form $y' = f_0(x) + f_1(x)y + f_2(x)y^2,~f_2(x) \neq 0$. If $y_1(x)$ is a particular solution, we can make a substitution to transform the equation into a first order linear equation.

There are other types of first order differential equations that can be solved, but they don't really fit into classifications nicely.

## A note on substitutions
Several of the methods of solution above involve making substitutions. Keep in mind that when you substitute $y$ for a new value, you must also substitute $dy$ for a new value. For example, if we let $y = ux$, then $dy = udx + xdu$ (via the product rule).

# General Approach to Solving
Many first order differential equations can be solved by more than one method.

First, see if it's separable. If it is, just integrate and you're done. To find if it's separable, put it in the form of $(a)$. You might have to play with some algebra to get this done.

Linear is almost as easy, so one thing to do is to try to put it into the linear form and see if that works. If not, you may be able to put it into the Bernoulli form which, is just one step away from being linear, or into the Ricatti form, which is a couple of steps from being linear.

If linear doesn't work out, put it in the form of $(a)$ above.

See if it's exact; think if there is some function $f(x,y)$ that's partial derivatives match $P(x,y)$ and $Q(x,y)$, or use the test for exactness. If you do the test, you can use the results to find an integrating factor sometimes. You might also recognize some integrable combinations which can be used to reduce the remaining part of the differential equation into separable parts.

If it's not exact, see if it has linear coefficients or if it's homogenous. Neither of these two methods is fun - they're laborious and have many steps to solve, but sometimes there is no other choice.

If none of those approaches work out, you might be out of luck. You can try some substitutions, etc, but you could spend forever and not find a solution. Probably best to use a computer at this point.
