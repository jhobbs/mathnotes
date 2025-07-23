# Demos should take up most of their canvas by default

## Description
The canvas has a high contrast dashed rectangular border of about 2px in with that defines its boundaries. The drawing (any non-white pixels) inside the canvas should approach (within 10% of the size of the dimension, but no more than within 3%), but not meet, the border in at least one place, but ideally in at least two places.

## Remediation
Describe where the drawing comes closest to the border and give a quantitative estimate either in percentage or pixels of how close it comes. Suggest whether or not the entire drawing should be scaled uniformly, the canvas should be shrunk, the drawing should be moved, or what other changes would be appropriate to correct the empty space condition.


# Demos should use tastefully contrasted colors that are easy to distinguish.

We want to be able to distinguish between colors, but we don't need a glaringly high contrast theme. Soft contrast is ok when appropriate, such as for grid lines in a Cartesian plane.
