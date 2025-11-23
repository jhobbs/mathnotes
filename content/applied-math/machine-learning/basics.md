---
layout: page
title: Machine Learning Basics
---

:::definition "Class" {synonyms: category, type, kind}
A **class** is a collection of individuals or individual objects. A class can be defined either by extension (specifying members) or by intension (specifying conditions).
:::

:::definition "Classification"
**Classification** is the activity of assigning objects to some pre-existing classes or categories.
:::
:::remark
This is distinct from establishing the classes themselves, for example, through cluster analysis.
:::

:::definition "Binary Classification"
**Binary Classification** is the task of putting things into one of two categories (each called a @class.)
:::

:::definition "Target Class"
In @binary-classification, the task is to determine whether or not an object belongs to a @class, which we call the **target class**.
:::

:::definition "Multiclass Classification" {synonyms: "multinomial classification"}
**Multiclass classification** is the task of putting things into one of three or more classes.
:::

:::remark
Deciding whether a piece of fruit is a banana, a peach, or an apple is @multiclass-classification. Deciding if a piece of fruit is an apple or not is @binary-classification.
:::

## Binary Classification

We can think of the task of @binary-classification as the operation of a @function

$$ f : \mathbb{R}^n \to {0,1}, $$

where the domain is a @vector $\vec{x} = \{x_1, x_2, \dots, x_n\}$ of real numbers representing @features of an object, and ${0,1}$ represents whether or not that object belongs to the target class. This assume we've turned @categorical data into numerical features, while we can use numerical features as is, or that we've produced new features from our data.

Now, each object in our training dataset can be thought of as being composed of an $\vec{x}$ component and a $y$ component. In @binary-classification, the $y$ component is just a boolean value - $0$ or $1$. The training set then looks like a @sequence of @feature vectors and @labels

$$ {(\vec{x}^{(0)}, y^{(0)}), (\vec{x}^{(1)}, \vec{y}^{(1)}), \dots, (\vec{x}^{(n)}, y^{(n)})}. $$


We can think of a perfect function $f$ as always making the correct @label assignment (based on some @ground-truths or in all future cases,) but we're generally stuck with $f$ being an approximation.

If we think of $f_\theta(x)$ as a parameterized function, $\theta$ represents the parameters (weights, coefficients, etc) that determine the shape of the function. In a regression model or neural network, these might be weights and biases, for example.

:::definition "Model Training" {synonyms: learning}
Then, the job of machine learning in binary classification is to produce a good function $f.$ This is called **model training** or **learning.** More formally, if $f_\theta(x) : \mathbb{R}^n \to {0,1}$ is a parameterized function, model training is the task of minimizing loss, that is, we want to find the set of parameters $\theta$ that minimizes

$$ \sum_{i=1}^m L \left ( f_\theta(x^{(i)}), y^{(i)} \right ) $$

where $L$ is a loss function, for example, @cross-entropy loss.
:::

Once $f_\theta$ has been trained (i.e., we've selected values for our parameters $\theta$), we can use $f_\theta$ to predict the classification of unseen $\vec{x}$ values.

:::definition "Inference" {synonyms: prediction}
Applying a trained model $f_\theta$ to an unseen $\vec{x}$ to produce a predicted @label is called **inference** or **prediction**.
:::

When a trained model $f_\theta$ is applied to each $x^{(i)}$ it produces a prediction

$$ \hat{y}^{(1)} = f_\theta(x^{(1)}), \hat{y}^{(2)} = f_\theta(x^{(2)}), \dots, \hat{y}^{(n)} = f_\theta(x^{(n)}). $$

| Symbol | Meaning | Common names |
|:--------|:----------|:--------------|
| $y^{(i)}$ | True value for object $i$ | label, target, ground truth |
| $\hat{y}^{(i)}$ | Model's output | prediction, estimated label, classification |
| $\{y^{(i)}\}_{i=1}^m$ | All true values | label vector, target vector |
| $\{\hat{y}^{(i)}\}_{i=1}^m$ | All predicted values | predicted label vector, sequence of classifications |

:::definition "Model pipeline" {synonyms: "classifier pipeline"}
This overall process of preparing features, training $f_\theta ,$ and evaluating results is called a **classifier pipeline** or **model pipeline.**
:::

### Summary of Stages
The stages of the @model-pipeline can be summarized as follows:

| Stage | Description | Common term |
|:-------|:-------------|:-------------|
| Choose features | Represent each object as a vector $\vec{x} = (x_1, x_2, \dots, x_n)$ | Feature engineering |
| Choose function form | Select the model family (e.g., linear model, decision tree, neural network) | Model selection |
| Adjust parameters to fit data | Find parameters $\theta$ that minimize the loss $L(f_\theta(\vec{x}), y)$ | Training / fitting |
| Use $f_\theta(x)$ on new data | Generate predictions $\hat{y}$ for unseen inputs | Inference / prediction |

### Evaluating Loss

The "perfect" loss evaluation for a binary classifier is its Hamming Loss, which is derived from Hamming Distance.

:::definition "Hamming Distance"
Given a string of $m$ symbols, the Hamming Loss is the number of positions for which the symbols differ. For binary strings, this is

$$ d_H{(\hat{y}, y)} = \sum_{i=1}^{m} \big|\, \hat{y}^{(i)} - y^{(i)} \,\big|. $$
:::

:::definition "Hamming Loss"

The **Hamming Loss** is the @Hamming-Distance divided by the length of the strings being compared. For strings of length $m,$ it is

$$ L_{\text{Hamming}} = \frac{1}{m} d_h{(\hat{y}, y)}. $$
:::

Hamming Loss is great way to evaluate the performance of a binary classifier once it's trained, but it doesn't make a good way to evaluate during training, because it's not @differentiable. It's not @differentiable because there is not a @continuous transition from $0$ to $1$ in the model's output - there is just a step function there. In reality, we're likely to have some stage of our model that outputs a value in $[0,1]$ - the probability of our object being in our @target-class, and then apply a threshold to that to get our final binary value, i.e. if the probability is over $p = 0.5,$ set $\hat{y}$ to $1.$ This is a @smooth @function from $\mathbb{R}^n$ to $[0,1]$ and is thus likely to be @differentiable. We want a @differentiable @function because it allows us to perform gradient loss and similar operations.

However, after a model is trained, @hamming-loss really is the perfect way to evaluate its performance.

## Bias vs Variance


