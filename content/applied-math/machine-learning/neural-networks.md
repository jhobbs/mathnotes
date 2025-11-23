---
layout: page
title: Neural Networks
---

# Simple Example

## Digit Classification
Let's talk about an example. We have $28 \times 28$ pixel greyscale input image and we want to predict which digit of 0-9 it is.

Each of our pixels are represented by a value from 0 to 255 representing the intensity of the greyscale pixel, with 0 being black and 255 being white.

At the most basic level, we want to make a function

$$ F_{\beta} : M(\mathbb{Z}_{255})_{24,24} \to \mathbb{Z}_{10} $$

i.e. $F_{\beta}$ takes in a $24 \times 24$ matrix of integers between $0$ and $255$ and outputs an integer between $0$ and $9,$ the predicted digit represented by the image.

## As A Neural Network


Let's start by defining a neuron.

:::definition "Neuron"
In a neural network, a **neuron** $N$ is a computation unit that takes $n$ input values, applies an @affine-transformation, then a typically non-linear activation function, and returns a single value.

That is, it is a function of the form

$$ N: \mathbb{R}^n \to \mathbb{R}, \quad N(\vec{x}) = \phi(\vec{w} \cdot \vec{x} + b), $$

where

* $n$ is the number of inputs to the neuron

* $\vec{w} \in \mathbb{R}^n$ is a vector of weights,

* $b \in \mathbb{R}$ is a bias value, and

* $\phi : \mathbb{R} \to \mathbb{R}$ is an activation function.
:::

:::definition "Layer"
A **layer** in a neural network is a collections of @neurons that operate in parallel on the same input @vector.

A layer with $n_{\ell - 1}$ inputs and $n_{\ell}$ @neurons defines a @function

$$ F_{\ell} : \mathbb{R}^{\ell - 1} \to \mathbb{R}^{\ell} $$

of the form

$$ F_{\ell}(\vec{x}) = \phi_{\ell} \left ( W_{\ell} \vec{x} + \vec{b}_{\ell} \right ), $$

where:

* $W_{\ell} \in \mathbb{R}^{n_{\ell} \times n_{\ell - 1}}$ is the weight matrix (with the $i$th row representing the weights for the inputs to the $i$th @neuron in the layer),

* $\vec{b}_{\ell} \in \mathbb{R}^{n_{\ell}}$ is the bias vector (with the $i$th entry representing the bias on the $i$th @neuron in the layer,

* $\phi_{\ell} : \mathbb{R} \to \mathbb{R} $ is an activation function, applied @componentwise, 

* each coordinate of $F_{\ell}(\vec{x})$ is the output of a single @neuron in that layer.

A layer takes an input @vector, applies the same @affine-transformation to all @neurons (via a shared weight @matrix and bias @vector), and then applies an @activation-function to each neuron's output.

Its output is the @vector of all @neuron outputs in that layer, and in this way, we can view a layer as a @vector of @neurons.
:::

Finally we'll define neural network itself!

:::definition "Neural Network"
A **neural network** is a function obtained by @composing @finitely-many @neurons arranged in layers:

$$ F(\vec{x}) = (\phi_L \circ A_L) \circ \cdots \circ (\phi_1 \circ A_1)(\vec{x}), $$

where each

* $A_{\ell}(\vec{x}) = W_{\ell} \vec{x} + \vec{b}_{\ell}$ is an @affine-transformation,

* $\phi_{\ell}$ is an @activation-function applied @componentwise,

* and $W_{\ell}, \vec{b}_{\ell}$ are learnable parameters. 
:::

Our pixels are represented by a value from 0 to 1 that represents intensity, with 0 being 
