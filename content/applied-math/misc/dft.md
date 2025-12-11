---
layout: page
title: Discrete Fourier Transform
---

1. Take a closed contour $C.$

2. Take $N$ sample points along it, separated evenly by arc length.

3. Calculate the Fourier coefficient $c_n$ at each of the $N$ points. These correspond to the frequencies $n = -[N/2], \dots, [N/2].$ We're basically measuring how much of each frequency the contour has at each of the $N$ different points.

We calculate the Fourier Coefficient $c_n$ as

$$ c_n = \frac{1}{N} \sum_{k=0}^{N-1} z_k e^{-2 \pi i n k / N} $$

4. Only about half of these are unique because the frequency $N - m, m < N$ is the same as $-m$ (just like moving back 2 hours from 12 on a clock to 10 it the same as moving forward by 10 hours).

5. Each $c_n$ represents a vector in the complex plane with:

* length = $|c_n|$

* phase angle = $\Arg(c_n)$

* rotation speed = $n$ 
