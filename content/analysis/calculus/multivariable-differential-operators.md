---
description: Vector calculus operators including gradient, curl, divergence, and Laplacian
  with geometric interpretations, mathematical definitions, and applications to physics
  and engineering.
layout: page
title: Multivariable Differential Operators
---

# Multivariable Differential Operators

First, some preliminary definitions.


:::definition "Vector Function"
Let $P$ be any @point in a @domain-of-definition. Then we define a **vector function** $\vec{v}$ whose @values are @vectors, that is,

$$ \vec{v} = \vec{v}(P) = [v_1(P), v_2(P), v_3(P)] $$

that depends on points $P$ in space. A @vector-function depends only on the point $P,$ not on the coordinate system chosen to represent its components.
:::

:::definition "Vector Field"
We say that a @vector-function defines a **vector field** in a @domain-of-definition.
:::

:::definition "Scalar Function" {synonyms: "scalar field"}
Let $P$ be any @point in a @domain-of-definition. Then we define a **scalar function** $f,$ whose @values are @scalars, that is,

$$ f = f(p) $$

that depends on $P.$

A scalar function depends only on the point $P,$ not on the coordinate system chosen to represent it. 
:::

:::definition "Component"
Let $\vec{f}$ be a @function that maps an @open @set $E \subset R^n$ into $R^m.$ Let $\{\vec{e}_1, \dots, \vec{e}_n\}$ and $\{\vec{u}_1, \dots, \vec{u}_n\}$ be the standard bases of $R^n$ and $R^m.$ The **components** of $\vec{f}$ are the real @functions $f_1, \dots, f_m$ defined by

$$ \vec{f}(\vec{x}) = \sum_{i=1}^m f_i(\vec{x})\vec{u}_i \quad (\vec{x} \in E), $$

or, equivalently, by $f_i(\vec{x}) = \vec{f}(\vec{x}) \cdot \vec{u}_i, 1 \leq i \leq m. $
:::

:::definition "Partial Derivative"
Using the setup from the definition of @component, for $\vec{x} \in E, 1 \leq i \leq m, 1 \leq j \leq n,$ we define

$$ (D_j f_i)(\vec{x}) = \lim_{t \to 0} \frac{f_i(\vec{x} + t \vec{e}_j) - f_i(\vec{x})}{t}, $$

provided the @limit exists. Writing $f_i(x_1, \dots, x_n)$ in place of $f_i(\vec{x}),$ we see that $D_j f_i$ is the derivative of $f_i$ with respect to $x_j,$ keeping the other variables fixed. The notation

$$ \frac{\partial f_i}{\partial x_j} $$

is therefore often used in place of $D_j f_i,$ and $D_j f_i$ is called a **partial derivative.**
:::

:::definition "Tangent Vector"
For a space curve given parametrically by $\vec{r}(t),$ the **tangent vector** (or specifically, the **unit tangent vector**) at the point $\vec{r}(t)$ is the @unit-vector defined by:

$$ \vec{T}(t) = \frac{\vec{r}'(t)}{||\vec{r}'(t)||} $$
:::

## Differentiation
:::remark
If $f$ is a real @function with @domain-of-definition $(a, b) \subset R^1$ and if $x \in (a,b),$ then $f'(x)$ is usually defined to be the real number

$$ lim_{h \to 0} \frac{(x+h) - f(x)}{h}, $$

provided this limit exists. Thus,

$$ f(x + h) - f(x) = f'(x)h + r(h) \tag{8} $$

where the "remainder" $r(h)$ is small, that is,

$$ \lim_{h \to 0} = \frac{r(h)}{h} = 0. $$

Note that (8) expresses the difference $f(x+h) - f(x)$ as the sum of the linear @function that takes $h$ to $f'(x)h,$ plus a small remainder. We can therefore view the derivative of $f$ at $x$ as the linear operator on $R^1$ that takes $h$ to $f'(x)h.$
:::
:::note
On linearity: every real number $\alpha$ gives rise to a linear operator on $R^1:$

$$ L_\alpha{x} = \alpha x. $$

Conversely, every linear function from $R^1$ to $R^1$ is multiplication by some real number. Thus, we have a $1-1$ correspondence between $R^1$ and $L(R^1)$ (the set of all linear transformations on $R^1$.)
:::
:::remark
Now, consider a @function $\vec{f}$ that maps $(a, b) \subset R^1$ into $R^m.$ Then $\vec{f}'(x)$ is defined to be the @vector $y \in R^m$ (if one exists) for which

$$ \lim_{h \to 0} \left ( \frac{\vec{f}(x+h) - \vec{f}(x)}{h}  - \vec{y} \right ) = 0. $$

This can be rewritten as

$$ \vec{f}(x + h) - \vec{f}(x) = h \vec{y} + \vec{r}(h), $$

where $\vec{r}(h)/h \to \vec{0}$ as $h \to 0.$ Again, the right side is a linear function of $h.$ Every $\vec{y} \in R^m$ gives a linear transformation of $R^1$ into $R^m:$

$$L_\vec{y}{h} = h \vec{y}, $$

which gives us an identification of $R^m$ with $L(R^1, R^m)$ (the set of all linear transformations from $R^1$ to $R^m$,) allowing us to say $\vec{f}'(x) \in L(R^1, R^m)$.

Therefore, if $\vec{f}$ is a @differentiable @function of $(a, b) \subset R^1$ into $R^m,$ and if $x \in (a, b),$ then $\vec{f}'(x)$ is the linear transformation of $R^1$ into $R^m$ that satisfies

$$ \lim_{h \to 0} \frac{\vec{f}(x + h) - \vec{f}(x) - \vec{f}'(x) h}{h} = \vec{0}, $$

or, equivalently,

$$ \lim_{h \to 0} \frac{|\vec{f}(x + h) - \vec{f}(x) - \vec{f}'(x) h|}{|h|} = 0. $$

We can now take on the general $R^n \to R^m$ case.
:::

:::definition "Differentiable"
Suppose $E$ is an @open @set in $R^n,$ $\vec{f} : E \to R^m,$ and $\vec{x} \in E.$ If there exists a linear transformation $A : R^n \to R^m$ such that

$$ \lim_{\vec{h} \to \vec{0}} \frac{|\vec{f}(\vec{x} + \vec{h}) - \vec{f}(\vec{x}) - A\vec{h}|}{|\vec{h}|} = 0, \tag{14} $$

then we say that $\vec{f}$ is **differentiable** at $\vec{x}$ and we write

$$ \vec{f}'(\vec{x}) = A. $$

If $\vec{f}$ is differentiable at every $\vec{x} \in E,$ we say that $\vec{f}$ is **differentiable in** $E.$

Note that in (14), $\vec{h} \in R^n.$ If $|\vec{h}|$ is small enough, then $\vec{x} + \vec{h} \in E,$ because $E$ is @open. Therefore, $\vec{f}(\vec{x} + \vec{h})$ is defined, $\vec{f}(\vec{x} + \vec{h}) \in R^m,$ and since $A \in L(R^n, R^m),$ $A \vec{h} \in R^m.$ Therefore,

$$ \vec{f}(\vec{x} + \vec{h}) - \vec{f}(\vec{x}) - A \vec{h} \in R^m. $$

The norm in the numerator of (14) is that of $R^m,$ while the norm in the denominator is the $R^n$-norm.

We can also rewrite (14) as

$$ \vec{f}(\vec{x} + \vec{h}) - \vec{f}(\vec{x}) = \vec{f}'(\vec{x})\vec{h} + \vec{r}(\vec{h}), \tag{17} $$

where the remainder $\vec{r}(\vec{h})$ satisfies

$$ \lim_{\vec{h} \to \vec{0}} \frac{|\vec{r}(\vec{h})|}{|\vec{h}|} = 0. $$

This means that for a fixed $\vec{x}$ and a small $\vec{h},$ the left side of (17) is approximately equal to $\vec{f}'(\vec{x})\vec{h},$ that is, to the value of a linear transformation applied to $\vec{h}.$
:::

:::definition "Total Derivative" {synonym: differential}
The derivative defined above in @differentiable is called the **total derivative** of $\vec{f}$ at $\vec{f},$ or the **differential** of $\vec{f}$ at $\vec{x}.$
:::

:::theorem "Total derivatives are unique" {label: total-derivatives-are-unique}
Suppose $E$ is an @open @set in $R^n,$ $\vec{f} : E \to R^m,$ and $\vec{x} \in E,$ and that $A_1$ and $A_2$ are @total-derivatives of $\vec{f}$ at $\vec{x}.$  Then, $A_1 = A_2.$
:::

:::definition "Continuously Differentiable"
A @differentiable @function $\vec{f}$ of an @open @set $E \subset R^n$ into $R^m$ is said to be **continuously differentiable** in $E$ if $\vec{f}'$ is a @continuous function of $E$ into $L(R^n, R^m).$ More explicitly, it is required that to every $\vec{x} \in E$ and to every $\epsilon > 0$ corresponds a $\delta > 0$ such that

$$ ||\vec{f}'(\vec{y}) - \vec{f}'(\vec{x})|| < \epsilon $$

if $\vec{y} \in E$ and $|\vec{x} - \vec{y}| < \delta.$

If this is the case, we also say that $\vec{f}$ is a $\mathscr{C}'$-mapping or that $\vec{f} \in \mathscr{C}'(E).$
:::

These are some differential operators that apply to multivariable and/or vector valued functions.

## Vector Differential Operator

:::definition "del" {synonyms: "vector differential operator", nabla}
In Euclidean space $\mathbb{R}^n$ with coordinates $(x_1, \dots, x_n)$ and standard basis $(\vec{e}_1, \dots, \vec{e}_n),$ **del** is a vector operator whose $x_1, \dots, x_n$ components are the partial derivative operators $\frac{\partial}{\partial x_1}, \dots, \frac{\partial}{\partial x_n}; $ that is

$$ \nabla = \sum_{i = 1}^n \vec{e}_i \frac{\partial}{\partial x_i} = \left ( \frac{\partial}{\partial x_1}, \dots, \frac{\partial}{\partial x_n} \right ). $$
:::

## Gradient
:::definition "Gradient"
Given a @scalar-function $f : \mathbb{R}^n \to \mathbb{R}$, the **gradient** of $f$, denoted as $\nabla f$, is defined as the vector of its partial derivatives. Specifically, for a function $f(x_1, x_2, \cdots, x_n)$, the gradient is given by

$$ \nabla f = \begin{bmatrix} \frac{\partial f}{\partial x_1} \\  \frac{\partial f}{\partial x_2} \\\ \vdots \\\ \frac{\partial f}{\partial x_n} \end{bmatrix} $$
:::

:::remark
We can write the @gradient as either a row @vector or a column @vector. Different texts use different conventions. I'll show it here as a row vector, while we used a column vector above, just to mix it up.

In three-dimensional Euclidean space, the @gradient of a function $f,$ if it exists, is given by

$$ \grad{f} = \nabla f = \frac{\partial f}{\partial x} \vec{i} + \frac{\partial f}{\partial y} \vec{j} + \frac{\partial f}{\partial z} \vec{k} = \left [ \frac{\partial f}{\partial x}, \frac{\partial f}{\partial y}, \frac{\partial f}{\partial z} \right ] $$ 
:::

## Directional Derivative
:::definition "Directional Derivative"
Using the setup from the definition of @component, let us fix an $\vec{x} \in E$ (with $E \subset R^n$,) and let $\vec{u} \in R^n$ be a @unit-vector. Then,

$$ \lim_{t \to 0} \frac{f(\vec{x} + t \vec{u}) - f(\vec{x})}{t} = (\nabla f)(\vec{x}) \cdot \vec{u} $$

is called the **directional derivative** of $f$ at $\vec{x}$ in the @direction of the @unit-vector $u$ and is denoted as $D_{\vec{u}}f(\vec{x}).$
:::

:::theorem {label: directional-derivative-is-inner-product-of-vector-and-grad} 
The @directional-derivative of $f$ in the @direction of a @unit-vector $\vec{u}$ is the @inner-product of $\vec{u}$ and $\grad{f},$ that is,

$$ D_{\vec{u}} = \vec{u} \cdot \grad{f}. $$ 
:::

:::theorem
Let $f(P) = f(x,y,z)$ be a @scalar-function having @continuous first @partial-derivatives in some @domain $B$ in space. Then, $\grad{f}$ exists in $B$ and is a @vector, that is, its @length and @direction are independent of the particular choice of Cartesian coordinates. If $\grad{f(P)} \neq \vec{0}$ at some @point $P,$ it has the @direction of maximum increase of $f$ at $P.$

::::proof
The @directional-derivative of $f$ in the direction of some @unit-vector $\vec{u}$ is

$$ D_\vec{u} f = \vec{u} \cdot \grad{f} = |\vec{u}| |\grad{f}| \cos{\theta} \tag{a} $$

where $\theta$ is the angle between $\vec{u}$ and $\grad{f}$ (see @directional-derivative-is-inner-product-of-vector-and-grad and @cos-characterization-of-dot-product). Note that $f$ is a @scalar-function, as is the @directional-derivative of $f.$ Now, $cos{\theta}$ has its maximum @value of $1$ whenever $\theta = 0,$ and since $\vec{u}$ is a @unit-vector with @magnitude of 1, (a) simplifies to

$$ D_{\vec{u}} f = |\grad{f}|, $$

which tells us that that @direction and @magnitude of $\grad{f}$ are independent of the coordinate system chosen. Now, since $\theta = 0$ if and only if $\vec{b}$ and $\grad{f}$ are @parallel, $\grad{f}$ is the direction of maximum increase of $f$ at $P,$ assuming $\grad{f} \neq 0$ at $P.$
::::
:::

:::definition "Level Surface"
Let $S$ be a surface represented by $f(x, y, z) = c,$ where $c$ is constant and $f$ is @differentiable. Such a surface is called a **level surface** of $f,$ and for different $c,$ we get different level surfaces.
:::

:::definition "Tangent Plane"
If $S$ is a @level-surface of a function $f,$ and $P$ is a point of $S,$ then the set of all @tangent-vectors of all curves passing through $P$ will generally form a plane, called the **tangent plane** of $S$ at $P.$
:::

:::definition "Surface Normal"
Given a @tangent-plane to a surface $S$ at $P,$ the normal to this plane (the straight line through $P$ @perpendicular to the @tangent-plane) is called the **surface normal** to $S$ at $P.$
:::

:::definition "Surface Normal Vector"
A @vector in the @direction of the @surface-normal of a surface $S$ at point $P$ is called a **surface normal vector** of $S$ at $P.$
:::

:::theorem {label: gradient-as-surface-normal-vector}
Let $f$ be a @differentiable @scalar-function in space. Let $f(x,y,z) = c$ (with $c$ constant) represent a surface $S.$ Then, if the @gradient of $f$ at a point $P$ of $S$ is not the @zero-vector, it is a @surface-normal-vector of $S$ at $P.$ 

::::proof
Any curve $C$ lying in $S$ can be parameterized as $\vec{r} = [x(t), y(t), z(t)]$ such that

$$ f(x(t), y(t), z(t)) = c. \tag{a} $$

Now, if we differentiate (a) with respect to $t,$ we get

$$ \frac{df}{dt} = \frac{\partial f}{\partial x} x' + \frac{\partial f}{\partial y} y' + \frac{\partial f}{\partial z} z' = (\grad{f}) \cdot \vec{r}' = 0. $$

Therefore, $\grad{f}$ is @orthogonal to all the vectors $\vec{r}'$ in the @tangent-plane of $S$ at $P,$ and is therefore a @surface-normal-vector of $S$ at $P.$
::::
:::

:::definition "Potential Function"
A **potential function** is a @scalar-function whose @gradient is a @vector-field. They allow representing certain @vector-fields in a simpler, more fundamental form.

In other words, given a @vector-field $\vec{F},$ a potential function $\phi$ is a @scalar-function such that

$$ \vec{F} = - \grad{\phi} \quad \text{or} \quad \vec{F} = \grad{\phi}. $$
:::

## Divergence

:::definition "Divergence"
For a @vector-field $\vec{F} = (F_1, F_2, F_3)$ defined in three-dimensional space $\mathbb{R}^3$, the **divergence** is defined as

$$ \div \vec{F} = \nabla \cdot \vec{F} = \frac{\partial F_1}{\partial x} + \frac{\partial F_2}{\partial y} + \frac{\partial F_3}{\partial z}. $$
:::

:::remark
The @divergence of a @vector-field quantifies the extent to which the @vector-field behaves as a source or a sink at a given @point.

@Divergence gives a @scalar @value for each @point, i.e., it is a @scalar-field. A positive value indicates a net flow away from the point, while a negative value indicates a net flow towards a point.
:::

:::theorem "Divergence Theorem, or, Gauss's Theorem"
An important theorem related to divergence is the Divergence Theorem (also known as Gauss's theorem) which connects the flux of a vector field through a closed surface to the divergence of the field inside the volume bounded by the surface:

$$ \iiint_V (\nabla \cdot \vec{F}) dV = \oint_s \vec{F} \cdot d\vec{S} $$ 
:::

:::definition "incompressible"
Let $\vec{v}$ be the velocity @vector of of the motion of particles in a fluid. If $\div{\vec{v}} = 0,$ then the fluid has constant density and is said to be **incompressible.**
:::

## Curl


:::definition "Curl"
For a vector field $\vec{F} = (F_1, F_2, F_3)$ defined in three-dimensional space $\mathbb{R}^3$, with each component function $F_i$ depending on the variables $x$, $y$, and $z$, the curl of $\vec{F}$ is defined as

$$ \curl \vec{F} = \nabla \times \vec{F} = \left ( \frac{\partial F_3}{\partial y} - \frac{\partial F_2}{\partial z} \right ) \mathbf{\vec{i}} + \left ( \frac{\partial F_1}{\partial z} - \frac{\partial F_3}{\partial x} \right ) \mathbf{\vec{j}} + \left ( \frac{\partial F_2}{\partial x} - \frac{\partial F_1}{\partial y} \right ) \mathbf{\vec{k}} $$
:::

:::remark
The curl at a point in the field is represented by a vector whose length and direction denote the magnitude and axis of the maximum circulation. Circulation is the line integral of a vector field around a closed curve.

More intuitively, curl measures the rotation of the vector field at a given point.

Curl can also be expressed as the determinant of a 3x3 matrix involving the unit vectors, partial derivatives, and the components of the vector field:

$$ \nabla \times \vec{F} = \begin{vmatrix} \mathbf{\vec{i}} & \mathbf{\vec{j}} & \mathbf{\vec{k}}  \\\ \frac{\partial}{\partial x} & \frac{\partial}{\partial y} & \frac{\partial}{\partial z} \\\ F_1 & F_2 & F_3  \end{vmatrix} $$
:::

:::definition "Irrotational"
If the @curl of a @vector-field is $\vec{0},$ i.e. if $\curl{\vec{v}} = 0,$ the field is said to be **irrotational.**
:::

:::theorem {label: grad-div-curl-related}
Gradient fields are @irrotational. That is, if a @continuously-differentiable @vector-function is the @gradient of a @scalar-function $f,$ then its @curl is the @zero-vector:

$$ \curl(\grad{f}) = \vec{0}. $$

Furthermore, the @divergence of the @curl of a twice @continuously-differentiable @vector-function $\vec{v}$ is zero:

$$ \div(\curl{\vec{v}}) = 0. $$
:::

:::theorem {label: invariance-of-curl}
$\curl{\vec{v}}$ is a @vector. It has a @length and a @direction that are independent of the particular choice of a Cartesian coordinate system in space.
:::

## Laplacian
:::definition "Laplacian"
The Laplace operator is a second-order differential operator in the $n$-dimensional Euclidean space, defined as the divergence $(\nabla \cdot)$ of the gradient $(\nabla f$). Thus, if $f$ is a twice @differentiable real-valued function, then the Laplacian of $f$ is the real-valued function defined by

$$ \Delta f = \nabla^2 f = \nabla \cdot \nabla f. $$

The Laplacian of $f$ is the sum of all the unmixed second partial derivatives in the Cartesian coordinates $x_i$:

$$ \nabla^2 f = \sum_{i=1}^n \frac{\partial^2 f}{\partial x_i^2}. $$

In two dimensions, using Cartesian coordinates, the Laplace operator is given by

$$ \nabla^2 f = \frac{\partial^2 f}{\partial x^2} + \frac{\partial^2 f}{\partial y^2} $$

and in three dimensions by

$$ \nabla^2 f = \frac{\partial^2 f}{\partial x^2} + \frac{\partial^2 f}{\partial y^2} + \frac{\partial^2 f}{\partial z^2} $$
:::

:::note
Solutions to Laplace's equation $\nabla^2 f = 0$ are called [[harmonic functions|analysis/complex-analysis/module-06-harmonic]].
:::

:::theorem {label: gravitational-potential-is-a-solution-to-laplaces-equation}
The force of attraction

$$ \vec{p} = - \frac{c}{r^3} \vec{r} = -c \left [ \frac{x - x_0}{r^3}, \frac{y - y_0}{r^3}, \frac{z - z_0}{r^3} \right ] $$

between two particles at points $P_0 = (x_0, y_0, z_0)$ and $P = (x, y, z)$ (as given by Newton's law of gravitation) has the @potential-function $f(x, y, z) = c/r,$ where $r > 0$ is the distance between $P_0$ and $P.$

Thus, $\vec{p} = \grad{f} = \grad(c/r).$ This @potential-function $f$ is a solution of Laplace's Equation

$$ \nabla^2 f = \frac{\partial^2 f}{\partial x^2} + \frac{\partial^2 f}{\partial y^2} + \frac{\partial^2 f}{\partial z^2} = 0, $$

that is, $f$ has a @Laplacian of $0.$
:::

## Exterior Derivative

## Jacobian


## Hessian
