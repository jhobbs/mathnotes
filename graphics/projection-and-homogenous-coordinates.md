---
layout: page
title: Projection
---

# Projection

We want to take a set of points on a plane, making an image, and map them to new points to represent some change in perspective.

Let's consider our starting perspective as being orthogonal to the plane and centered over the middle of the plane.

Think of this as a camera being positioned directly above the plane and looking down at it at a 90 degree angle.

Some possible changes (and there are likely others) in perspective are moving the camera closer or further from the plane, changle the angle at which
the camera is pointing to be some other angle, like 45 degrees, moving the camera side to side, or rotating the camera.

This makes it evident that the points and the camera are living in a 3d space, even though the points in our image are all in
the same plane. The effect of changing perspective is to change how the image's plane is projected onto the camera's view port, which
is also a plane - the screen that is being used to display the camera's view.

So, if we have a set of $n$ points in our plane, ${(x_1, y_1), (x_2, y_2), \dots (x_n, y_n)}$, we can pick a distance $z$ from the plane
to the camera to put the points into 3d space as ${(x_1, y_1, z), (x_2, y_2, z), \dots (x_n, y_n, z)}.$ 

Now, in order to use matrix multiplication to apply the types of transformations mentioned above, it would be nice if we were able to use
linear transformations, because any number of successive linear transformations can be combined into a single linear transformation, and
linear transformations can be applied with matrix multiplication, which is convenient and fast on computers.

However, not all the translations mentioned are linear in 3d. Translation, for instance, is affine, and perspective projection is not even
affine. To get around this, we can use [homogenous coordinates](https://en.wikipedia.org/wiki/Homogeneous_coordinates), which add another dimension
(usually denoted as $w$) that acts as a scaling factor for coordinates. This puts our coordinates into projective space, where all the transformations we want to perform are linear, and can thus be combined into a single matrix for application!

We can just use the value of 1 for the new dimension for all of our points to start with. [This page](https://www.tomdalling.com/blog/modern-opengl/explaining-homogenous-coordinates-and-projective-geometry/) talks a bit more about homogenous coordiantes and why 1 makes a fine value.

Now the set of points looks like ${(x_1, y_1, z, 1), (x_2, y_2, z, 1), \dots (x_n, y_n, z, 1)}.$

Now that our points are in this form we can use transformation matrices for homogenous coordinates to manipulate them.

The translation matrix $T$ in homogeneous coordinates that shifts a point by $(t_x, t_y, t_z)$ units is given by:

$$
T = \begin{bmatrix}
1 & 0 & 0 & t_x \\
0 & 1 & 0 & t_y \\
0 & 0 & 1 & t_z \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

Applying $T$ to a point $\mathbf{p} = (x, y, z, 1)$ results in:

$$
\mathbf{p'} = T \mathbf{p} = \begin{bmatrix}
1 & 0 & 0 & t_x \\
0 & 1 & 0 & t_y \\
0 & 0 & 1 & t_z \\
0 & 0 & 0 & 1
\end{bmatrix} \begin{bmatrix}
x \\
y \\
z \\
1
\end{bmatrix} = \begin{bmatrix}
x + t_x \\
y + t_y \\
z + t_z \\
1
\end{bmatrix}
$$

The rotation matrix $R$ around the $x$-axis for an angle $\theta$ in homogeneous coordinates is given by:

$$
R = \begin{bmatrix}
1 & 0 & 0 & 0 \\
0 & \cos \theta & -\sin \theta & 0 \\
0 & \sin \theta & \cos \theta & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

Applying $R$ to a point $\mathbf{p} = (x, y, z, 1)$ results in:

$$
\mathbf{p'} = R \mathbf{p} = \begin{bmatrix}
1 & 0 & 0 & 0 \\
0 & \cos \theta & -\sin \theta & 0 \\
0 & \sin \theta & \cos \theta & 0 \\
0 & 0 & 0 & 1
\end{bmatrix} \begin{bmatrix}
x \\
y \\
z \\
1
\end{bmatrix} = \begin{bmatrix}
x \\
y \cos \theta - z \sin \theta \\
y \sin \theta + z \cos \theta \\
1
\end{bmatrix}
$$

[This page](https://www.brainvoyager.com/bv/doc/UsersGuide/CoordsAndTransforms/SpatialTransformationMatrices.html) has some examples of more transformations.

Finally, to get this to all project properly onto our camera's plane and our computer screen, we need to apply a perspective projection, which for focal length $f$, looks like

$$
T = \begin{bmatrix}
f & 0 & 0 & 0 \\
0 & f & 0 & 0 \\
0 & 0 & 1 & 0 \\
0 & 0 & 1 / f & 0
\end{bmatrix}
$$

and applies the same way the other transformation matrices mentioned above apply. Don't ask me to explain focal lenght - I don't know much about what's going on there yet, other than that this is pin-hole camera focal length, not lens camera focal length.

Because these transformations are linear in projective space, they can be combined by multiplying them, resulting in a single matrix that can then be applied, through matrix-vector multiplication, to the points in the image to find their new locations (which can also be done through matrix multiplication, by packing the vectors for all the point positions into a matrix and multiplying it by the final transformation matrix).

After applying the transformation to a vector in homogenous coordinates, the homogenous coordinates need to be converted back to 3d coordinates by dividing the $x, y, z$ components by
the resulting $w$ component. Because we included the perspective projection transformation, we can also discard the $z$ component and just use the $(x/w, y/w)$ as our 2d coordinates for the image.

The widget below puts all of this together using p5 in 2d mode. All of the '3d' stuff here is happening via [hardcoded matrix transformations done in JS](https://github.com/jhobbs/mathnotes/blob/main/graphics/projection6.js). There is definitely some weird stuff going on here when you rotate or translate far enough - I'm not sure what's going on there yet, but it works pretty well within a certain range.

{% include_relative projection.html %}