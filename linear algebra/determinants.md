---
layout: page
title: Determinants
---

# Determinants

The determinant of an upper triangular matrix is the product of its diagonal entries.

We can find the determinant of a matrix through row reduction. We have to keep track of a multiplier for the determinant of the upper triangular matrix:

* each time we swap a row, multiply the determinant by -1

* each time we multiply a row by a scalar, multiply the determinant by that scalar

* adding a multiple of one row to another doesn't change the determinant.


## Determinants and Cramer's rule

For 2x2 matrices, $\begin{bmatrix} a & b \\\ c & d \end{bmatrix}$, the determinant is $ad - bc$.

For a system of two equations with two unknowns:

$$ a_1 x + b_1 y = q_1, \quad a_2 x + b_2 y = q_2 $$

The unique solution can be given via Cramer's rule as:

$$ x = \frac{\begin{vmatrix} q_1 & b_1 \\\ q_2 & b_2 \end{vmatrix}}{\begin{vmatrix} a_1 & b_1 \\\ a_2 & b_2 \end{vmatrix}}, y = \frac{\begin{vmatrix} a_1 & q_1 \\\ a_2 & q_2 \end{vmatrix}}{\begin{vmatrix} a_1 & b_1 \\\ a_2 & b_2 \end{vmatrix}}  $$


## 3x3 determinant

For the 3x3 matrix:

$$ A = \begin{bmatrix}a & b & c\\d & e & f\\g & h & i\end{bmatrix} $$

the determinant is:

$$ \det{A} = a \begin{vmatrix} e & f \\ h & i\end{vmatrix} - b \begin{vmatrix} d & f \\ g & i\end{vmatrix} + c \begin{vmatrix} d & e \\ g & h\end{vmatrix}$$
