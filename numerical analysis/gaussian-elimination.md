---
layout: page
title: Gaussian Elimination
description: Matrix row operations for solving linear systems, including pivoting strategies and LU factorization for efficient multiple-solve scenarios.
---

# Gaussian Elimination

Gaussian elimination transforms a matrix into row echelon form, which is an upper triangular form where:

* All nonzero rows are above any rows of all zeros.

* The leading coefficient (also called the pivot) of a nonzero row is always to the right of the leading coefficient of the row above it.

* The entries below each pivot are zero.

It's a common method for solving linear systems of equations.

This is accomplished by performing three types of operations on rows, which transform the system of linear equations into a simpler system with the same solutions:

* Row $r_i$ can be replaced by $\lambda r_i,$ where $\lambda$ is any non-zero constant.

* Row $r_i$ can be replaced with $r_i + \lambda r_j,$ where $\lambda$ is any non-zero constant.

* Row $r_i$ and row $r_j$ can be swapped.

There are a lot more details but that's the gist of it. Here, we'll talk about some stragies for improving the numerical stability of this algorithm.

The first non-zero entry in any row is called a **pivot.** When considering Gaussian elimination purely symbolicly without concern for numerical stability, we swap rows only when necessary to ensure that the pivot is also the last non-zero value in its column. However, it's sometimes advantageous to do so for numerical stability, because it helps avoid dividing relatively large numbers by very small numbers, which is problematic for floating point computation on computers.

We use **partial pivoting** to help reduce this. Before each round of eliminating values below a pivot, we first see which row in the submatrix (the matrix to the right and below the pivot) has the leading entry with the largest magnitude, and if it's not the pivot row, we swap it with the pivot row and then proceed with elimination.

A slight variation is **scaled partial pivoting.** Here, we account for the small divisor effect on the other columns too by first picking a scaling value for each row, which is the entry in each row that has the largest magnitude, dividing each rows leading value by its respective scaling factor, and then swapping the pivot row for the row with the largest scaled leading value (if it's not already the pivot row.)

## LU Factorization

Solving linear systems of the form $A \vec{x} = \vec{b}$ can be computationally expensive - it requires $O(n^3/3)$ operations for a matrix with $n$ rows and $n$ columns. If we need to solve for multiple vectors $\vec{b},$ we can save computation by first factoring $A$ into the form $A = LU,$ (which is $O(n^3/3)$ operations) and then solving for $\vec{x}$ given any $\vec{b},$ which is now just $O(2n^2)$ operations. For even moderately large values of $n$ this leads to a giant reduction in cost.

When doing $LU$‑factorization, you write

$$ A = LU $$

where $L$ is lower triangular (with 1’s on the diagonal) and $U$ is upper triangular. The multipliers used during Gaussian elimination become the entries of $L$. In other words, we perform Gaussian elimination as usual to get $U,$ but we also leave breadcrumbs of which operations we used to do this to get $L.$

We start with $L$ as the identity matrix.

Let's say our pivot is at $E_{j,1}$ and we want to eliminate the entry at $E_{j+1, 1}.$ We find the multiplier $m_{j+1, 1}$ such that

$$ E_{j+1, 1} - m_{j+1, 1} E_{j, 1} = 0 $$

and then we record that $m_{j+1,1}$ in $L$ as $L_{j+1, 1}.$

**3×3 example:**

Suppose

$$
A = \begin{pmatrix}
2 & 1 & 1 \\
4 & -6 & 0 \\
-2 & 7 & 2
\end{pmatrix}.
$$

First, Eliminate below the first pivot ($2$):

- Multiplier for row 2:  
     
$$ m_{21} = \frac{4}{2} = 2. $$

- Multiplier for row 3:

$$ m_{31} = \frac{-2}{2} = -1.  $$

   Apply:

$$
   R_2 \leftarrow R_2 - m_{21} R_1,
   \qquad
   R_3 \leftarrow R_3 - m_{31} R_1.
$$

You get

$$
   U^{(1)} = \begin{pmatrix}
   2 & 1 & 1 \\
   0 & -8 & -2 \\
   0 & 8 & 3
   \end{pmatrix}.
$$

Next, Eliminate below the second pivot ($-8$):

- Multiplier for row 3:  

$$ m_{32} = \frac{8}{-8} = -1. $$

Apply:

$$ R_3 \leftarrow R_3 - m_{32} R_2. $$

This yields the final upper triangular matrix

$$
   U = \begin{pmatrix}
   2 & 1 & 1 \\
   0 & -8 & -2 \\
   0 & 0 & 1
   \end{pmatrix}.
$$

Finally, Collect the multipliers into $L$ (with 1’s on the diagonal):

$$
L = \begin{pmatrix}
1 & 0 & 0 \\
m_{21} & 1 & 0 \\
m_{31} & m_{32} & 1
\end{pmatrix}
=
\begin{pmatrix}
1 & 0 & 0 \\
2 & 1 & 0 \\
-1 & -1 & 1
\end{pmatrix}.
$$

We can verify:

$$
LU
=
\begin{pmatrix}
1 & 0 & 0 \\
2 & 1 & 0 \\
-1 & -1 & 1
\end{pmatrix}
\begin{pmatrix}
2 & 1 & 1 \\
0 & -8 & -2 \\
0 & 0 & 1
\end{pmatrix}
=
\begin{pmatrix}
2 & 1 & 1 \\
4 & -6 & 0 \\
-2 & 7 & 2
\end{pmatrix}
= A.
$$

Now we'll go over how to solve for an unknown $\vec{x}$ given $\vec{b}.$

Given

$$
A = \begin{pmatrix}
2 & 1 & 1 \\
4 & -6 & 0 \\
-2 & 7 & 2
\end{pmatrix},
\quad
L = \begin{pmatrix}
1 & 0 & 0 \\
2 & 1 & 0 \\
-1 & -1 & 1
\end{pmatrix},
\quad
U = \begin{pmatrix}
2 & 1 & 1 \\
0 & -8 & -2 \\
0 & 0 & 1
\end{pmatrix}.
$$

Let

$$
b = \begin{pmatrix} 5 \\ -2 \\ 9 \end{pmatrix}.
$$

We solve $LU \vec{x} = \vec{b}$ by first solving $L \vec{y} = \vec{b}$:

Row 1:

$$y_1 = b_1 = 5.$$

Row 2:

$$2\,y_1 + y_2 = b_2 \implies y_2 = b_2 - 2\,y_1 = -2 - 2\cdot5 = -12.$$

Row 3:  

$$-y_1 - y_2 + y_3 = b_3 \implies y_3 = b_3 + y_1 + y_2 = 9 + 5 + (-12) = 2.$$

Thus

$$
\vec{y} = \begin{pmatrix} 5 \\ -12 \\ 2 \end{pmatrix}.
$$

Next solve $U\vec{x} = \vec{y}$ by back‑substitution:

Row 3:  

$$x_3 = y_3 = 2.$$

Row 2:  

$$-8\,x_2 - 2\,x_3 = y_2 \implies -8\,x_2 - 2\cdot2 = -12 \implies x_2 = 1.$$

Row 1:  

$$2\,x_1 + x_2 + x_3 = y_1 \implies 2\,x_1 + 1 + 2 = 5 \implies x_1 = 1.$$

Hence

$$
\vec{x} = \begin{pmatrix} 1 \\ 1 \\ 2 \end{pmatrix}.
$$

You can verify $A \vec{x} = \vec{b}$:

$$
A \vec{x} = \begin{pmatrix}
2 & 1 & 1 \\
4 & -6 & 0 \\
-2 & 7 & 2
\end{pmatrix}
\begin{pmatrix} 1 \\ 1 \\ 2 \end{pmatrix}
=
\begin{pmatrix} 5 \\ -2 \\ 9 \end{pmatrix}
= \vec{b}.
$$