---
layout: page
title: Gaussian Elimination
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