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

### Normal Derivative

:::definition "Normal Derivative"
The **normal derivative** is the @directional-derivative in the @direction of the @normal-vector.
:::

:::remark
The @normal-derivative tells us how the value of a @function changes as we move in the @direction normal (@orthogonal) to a curve or surface.
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

## Hessian

:::definition "Hessian Matrix" {synonyms: "Hessian"}

Suppose $f ~ : ~ \mathbb{R}^n \to \mathbb{R}$ is a @function taking as input a @vector $\vec{x} \in \mathbb{R}^n$ and outputting a @scalar $f(\vec{x}) \in \mathbb{R}.$ If all second-order @partial-derivatives of $f$ exist, then the **Hessian matrix** $\vec{H}$ of $f$ is a square $n \times n$ @matrix, usually defined and arranged as 

$$ 

\mathbf H_f= \begin{bmatrix}
  \dfrac{\partial^2 f}{\partial x_1^2} & \dfrac{\partial^2 f}{\partial x_1\,\partial x_2} & \cdots & \dfrac{\partial^2 f}{\partial x_1\,\partial x_n} \\[2.2ex]
  \dfrac{\partial^2 f}{\partial x_2\,\partial x_1} & \dfrac{\partial^2 f}{\partial x_2^2} & \cdots & \dfrac{\partial^2 f}{\partial x_2\,\partial x_n} \\[2.2ex]
  \vdots & \vdots & \ddots & \vdots \\[2.2ex]
  \dfrac{\partial^2 f}{\partial x_n\,\partial x_1} & \dfrac{\partial^2 f}{\partial x_n\,\partial x_2} & \cdots & \dfrac{\partial^2 f}{\partial x_n^2}
\end{bmatrix}.

$$

That is, the @entry of the $i$th row and the $j$th column is

$$ (\vec{H}_f)_{i,j} = \frac{\partial^2 f}{\partial x_i \partial x_j}. $$

For a @function $f ~ : ~ \mathbb{R}^3 \to \mathbb{R},$ this is

$$ \vec{H} =
\begin{bmatrix}
    \dfrac{\partial^2 f}{\partial x^2} & \dfrac{\partial^2 f}{\partial x \partial y} & \dfrac{\partial^2 f}{\partial x \partial z}\\
    \dfrac{\partial^2 f}{\partial y \partial x} & \dfrac{\partial^2 f}{\partial y^2} & \dfrac{\partial^2 f}{\partial y \partial z}\\
    \dfrac{\partial^2 f}{\partial z \partial x} & \dfrac{\partial^2 f}{\partial z \partial y} & \dfrac{\partial^2 f}{\partial z^2}\\
\end{bmatrix}.
$$
:::

Note that the @Laplacian of $f$ is equal to the @trace of the @Hessian of $f.$ In this way, the @Laplacian is to the @Hessian what @divergence is to the @Jacobian. 

## Jacobian

:::definition "Jacobian Matrix" {synonyms: "Jacobian", "Total Derivative"}

Let $\vec{f} ~ : ~ \mathbb{R}^n \to \mathbb{R}^m$ be a @function such that each of its first-order @partial-derivatives exists on $\mathbb{R}^n.$ This @function takes a point $\vec{x} = (x_1, \dots, x_n) \in \mathbb{R}^n$ as input and produces the @vector $\vec{f}(\vec{x}) = (f_1(\vec{x}), \dots, f_m(\vec{x})) \in \mathbb{R}^m$ as output. Then the **Jacobian matrix** of $\vec{f},$ denoted $\vec{J}_{\vec{f}},$ is the $m \times n$ @matrix whose $(i,j)$ @entry is $\frac{\partial f_i}{\partial x_j};$ explicitly

$$ \begin{bmatrix} \dfrac{\partial \mathbf{f}}{\partial x_1} & \cdots & \dfrac{\partial \mathbf{f}}{\partial x_n}
\end{bmatrix}
= \begin{bmatrix}
  \nabla^{\mathsf{T}} f_1 \\  
  \vdots \\
  \nabla^{\mathsf{T}} f_m   
\end{bmatrix}
= \begin{bmatrix}
    \dfrac{\partial f_1}{\partial x_1} & \cdots & \dfrac{\partial f_1}{\partial x_n}\\
    \vdots                             & \ddots & \vdots\\
    \dfrac{\partial f_m}{\partial x_1} & \cdots & \dfrac{\partial f_m}{\partial x_n}
\end{bmatrix}, $$

where $\nabla^{\mathsf{T}} f_i$ is the @transpose (@row-vector) of the @gradient of the $i$-th @component.
:::

:::remark
For a @vector valued @function,

$$ \vec{F} : \mathbb{R}^n \to \mathbb{R}^m, $$

the @Jacobian $\vec{J}(\vec{x})$ is the @linear-map that best @approximates $\vec{F}$ near $\vec{x}:$

$$ \vec{F}(\vec{x_0} + \vec{\Delta x}) \approx \vec{F(x_0)} + \vec{J(x_0)} \vec{\Delta x}. $$

At a point $x_0 \in \mathbb{R}^n,$ the @directional-derivative of $F$ in the @direction of $\vec{v} \in \mathbb{R}^n$ is

$$ D_{\vec{v}} \vec{F(x_0)} = \vec{J(x_0)} \vec{v}. $$
:::

### Jacobian Related to Gradient

:::remark
Given a @vector-field $F:$

$$
\vec{F} = \begin{bmatrix}
  F_1(x,y,z) \\  
  F_2(x,y,z) \\
  F_3(x,y,z) \\   
\end{bmatrix} : \mathbb{R}^3 \to \mathbb{R}^3,
$$

each component $F_i$ is itself a @scalar-field, and so we can take the @gradient of each one:

$$ \nabla F_1 = \begin{bmatrix}
  \dfrac{\partial F_1}{\partial x} \\  
  \dfrac{\partial F_1}{\partial y}  \\
  \dfrac{\partial F_1}{\partial z}  \\   
\end{bmatrix}, \quad
\nabla F_2 = \begin{bmatrix}
  \dfrac{\partial F_2}{\partial x} \\  
  \dfrac{\partial F_2}{\partial y}  \\
  \dfrac{\partial F_2}{\partial z}  \\   
\end{bmatrix}, \quad
\nabla F_3 = \begin{bmatrix}
  \dfrac{\partial F_3}{\partial x} \\  
  \dfrac{\partial F_3}{\partial y}  \\
  \dfrac{\partial F_3}{\partial z}  \\   
\end{bmatrix}.
$$

Now, the @Jacobian of $\vec{F}$ is the @matrix that contains all of these @gradients:

$$ \vec{J} = \nabla \vec{F} =  
\vec{F} = \begin{bmatrix}
  (\nabla F_1)^\mathsf{T} \\  
  (\nabla F_2)^\mathsf{T} \\  
  (\nabla F_3)^\mathsf{T} \\  
\end{bmatrix} = 
\begin{bmatrix}
    \dfrac{\partial F_1}{\partial x} & \dfrac{\partial F_1}{\partial y} & \dfrac{\partial F_1}{\partial z}\\
    \dfrac{\partial F_2}{\partial x} & \dfrac{\partial F_2}{\partial y} & \dfrac{\partial F_2}{\partial z}\\
    \dfrac{\partial F_3}{\partial x} & \dfrac{\partial F_3}{\partial y} & \dfrac{\partial F_3}{\partial z}\\
\end{bmatrix}.
$$

Here:

* The @rows are the @transposes of @gradients of each @component of $\vec{F}.$

* The @columns tell how each @coordinate @direction affects all @components of $\vec{F}.$

Thus the @Jacobian tells us how each @component of $\vec{F}$ changes with every @coordinate. It can be viewed as the "@gradient of a @vector-field."
:::

### Jacobian Related to Divergence

Given a @vector-field $F:$

$$
\vec{F} = \begin{bmatrix}
  F_1(x,y,z) \\  
  F_2(x,y,z) \\
  F_3(x,y,z) \\   
\end{bmatrix} : \mathbb{R}^3 \to \mathbb{R}^3,
$$

with a @Jacobian


$$ \vec{J} = \nabla \vec{F} =  
\begin{bmatrix}
    \dfrac{\partial F_1}{\partial x} & \dfrac{\partial F_1}{\partial y} & \dfrac{\partial F_1}{\partial z}\\
    \dfrac{\partial F_2}{\partial x} & \dfrac{\partial F_2}{\partial y} & \dfrac{\partial F_2}{\partial z}\\
    \dfrac{\partial F_3}{\partial x} & \dfrac{\partial F_3}{\partial y} & \dfrac{\partial F_3}{\partial z}\\
\end{bmatrix},
$$

@divergence is the @sum of the @diagonal @entries of this @matrix:

$$ \nabla \cdot \vec{F} = \dfrac{\partial F_1}{\partial x} + \dfrac{\partial F_@}{\partial y} + \dfrac{\partial F_3}{\partial z} = \tr{\vec{J}}.$$

So, algebraically, @divergence is the @trace of the @Jacobian.

The **trace** measures how much the @linear-transformation represented by $\vec{J}$ stretches space along its coordinate axes - it's the infinitesimal "net expansion rate."

Geometrically, if we have a very small cube of points centered at $\vec{x_0},$ with a side length of $dx,$ then each corner of that cube corresponds to a slightly different $\vec{x} = \vec{x_0} + \vec{\Delta x}.$ If we take all the points in the box and map them through $\vec{F},$ the cube's image becomes a tiny, possibly deformed box in the $\vec{F}$-space. The way the box stretches, shears and rotates is determined by $\vec{J}.$ The change in volume of that box is determined by $\det{(\vec{J})}$ (the determinant of the Jacobian.)

For an infinitesimally small cube, the @determinant can be expanded as

$$ \det{(\vec{I} + \vec{J} \epsilon)} \approx 1 + \epsilon \tr(\vec{J}), $$

for tiny $\epsilon.$ Here, the @trace of $\vec{J},$

$$ \tr{\vec{J}} = \dfrac{\partial F_1}{\partial x} +  \dfrac{\partial F_2}{\partial y} + \dfrac{\partial F_3}{\partial z} = \nabla \cdot \vec{F} $$

is exactly the @divergence. Each of these terms tells us how much the points in an infinitesimally small box around $\vec{x_0}$ are stretched/compressed in each coordinate direction.

Physically, for example, if $\vec{F}$ represents a velocity field, $\dfrac{\partial F_1}{\partial x}$ says how much the $x$-component of the velocity changes as you move along $x.$ Note that if $F_1$ is constant with respect to $x,$ this term is $0,$ which means there is no stretch/compression along that axis, and if we think of the velocity being that of a fluid, the same amount of fluid will flow into any region in the $x$ direction as flows out in the $x$ direction.

### Jacobian Related to Curl

Given a @vector-field $F:$

$$
\vec{F} = \begin{bmatrix}
  F_1(x,y,z) \\  
  F_2(x,y,z) \\
  F_3(x,y,z) \\   
\end{bmatrix} : \mathbb{R}^3 \to \mathbb{R}^3,
$$

with a @Jacobian


$$ \vec{J} = \nabla \vec{F} =  
\begin{bmatrix}
    \dfrac{\partial F_1}{\partial x} & \dfrac{\partial F_1}{\partial y} & \dfrac{\partial F_1}{\partial z}\\
    \dfrac{\partial F_2}{\partial x} & \dfrac{\partial F_2}{\partial y} & \dfrac{\partial F_2}{\partial z}\\
    \dfrac{\partial F_3}{\partial x} & \dfrac{\partial F_3}{\partial y} & \dfrac{\partial F_3}{\partial z}\\
\end{bmatrix},
$$

We can split $\vec{J}$ into its @symmetric and @antisymmetric  parts:

$$ \vec{J} = \vec{S} + \vec{A}, \quad \vec{S} = \frac{1}{2}(\vec{J} + \vec{J}^{\mathsf{T}}), \quad \vec{A} = \frac{1}{2}(\vec{J} - \vec{J}^\mathsf{T}). $$

Now,

* $\vec{S}$ encodes stretching/shearing.

* $\vec{A}$ encodes local rotation.

The @components of $\vec{A}$ are:

$$ \vec{A} = \frac{1}{2}
\begin{bmatrix}
    0 & \dfrac{\partial F_1}{\partial y} - \dfrac{\partial F_2}{\partial x} & \dfrac{\partial F_1}{\partial z} - \dfrac{\partial F_3}{\partial x} \\
    \dfrac{\partial F_2}{\partial x} - \dfrac{\partial F_1}{\partial y}   & 0 & \dfrac{\partial F_2}{\partial z} - \dfrac{\partial F_3}{\partial y} \\
    \dfrac{\partial F_3}{\partial x} - \dfrac{\partial F_1}{\partial z}  & \dfrac{\partial F_3}{\partial y} - \dfrac{\partial F_2}{\partial z}  & 0 \\
\end{bmatrix}.
$$

If we let $\vec{\omega} = (\omega_x, \omega_y, \omega_z),$ we can write $\vec{A}$ as

$$
\vec{A} =  
\begin{bmatrix}
    0 & - \omega_z & \omega_y \\
    \omega_z & 0 & - \omega_x \\
    - \omega_y & \omega_x & 0 \\
\end{bmatrix}.
$$

Then,

$$ \vec{\omega} = \frac{1}{2} \nabla \times \vec{F}, $$

so @curl is twice the @axial-vector of the @antisymmetric part of the @Jacobian.

Geometrically, if we linearize $\vec{F}$ near some point $\vec{x_0},$

$$ \vec{F}(\vec{x_0} + \vec{\Delta x}) \approx \vec{F(x_0)} + \vec{J(x_0)} \vec{\Delta x}. $$

The matrix $\vec{J}$ is acting on small displacements. When we apply $\vec{A}$ to $\vec{\Delta x},$ we get

$$ \vec{A} \vec{\Delta x} = \vec{\omega} \times \vec{\Delta x}. $$

Then,

* The @direction of $\vec{\omega}}}$ is the axis of rotation (via the right-hand rule).

* The @magnitude $||\omega||$ is the local @angular-velocity (half the @curl @magnitude.)

More visually, if we take a small @ball of @points around $\vec{x_0},$

* The symmetric part $\vec{S}$ of $\vec{J}$ turns the ball into an @ellipsoid (by stretching/shearing it).

* The antisymmetric part $\vec{A}$ spins the ball about the axis $\omega$ without changing its shape or volume.

Thus, @divergence comes from the @trace of $S$ and @curl comes from $A.$ 

Physically, if $F$ is a velocity field of a fluid, then:

$$ \nabla \times \vec{F} = 2 \omega $$

means that the fluid near that point is rotating like a tiny rigid body, with @angular-velocity $\vec{\omega.}$

So, if we dropped a tiny paddle wheel into the flow:

* The wheel's axis aligns with $\nabla \times \vec{F}.$

* Its spin rate is $\frac{1}{2} || \nabla \times \vec{F} ||.$ 


### Jacobian Related to Directional Derivative
This is mostly covered above, so just note that the @Jacobian is a sort of machine for producing @directional-derivatives:

$$ D_\vec{v} F = \vec{J} \vec{v}, $$

where the multiplication on the right is matrix-vector multiplication, i.e. the image of $\vec{J}$ when applied to $\vec{v}.$

### Jacobian Related to Laplacian

Algebraically,

$$ \nabla^2 f  = \nabla \cdot (\nabla f). $$

To unpack that, we're saying that the @Laplacian is the @divergence of the @gradient of $f.$ Now, when we take the @gradient of $f,$ we get a @vector-field that has the first @partial-derivatives of $f.$  Now, if we take the @Jacobian of that @gradient, we get $\nabla (\nabla f)),$ which is the @Hessian of $f.$ Now, if we take the @trace of that @Hessian, we get the @Laplacian, which is the sum of the pure second @derivatives of $f.$

Geometrically, the @Hessian is telling us how the @gradient of $f$ curves near a point, and taking the trace of it tells us the total or average @curvature at that point.

If $\nabla^2 f = 0,$ the gradient's inflow and outflow balance in every direction: the field is @harmonic and locally curvature-neutral. 

## Exterior Derivative



