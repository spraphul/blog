---
title : Generating Handwritten Sequences Using LSTMs and Mixed Density Networks
---

As everyone comes up with a resolution at the start of the year, I would be trying to be more infrequent in my blog postings😀. As it has been over a month, I thought of spilling some words here 😀. In this blog, we will be discussing about an interesting paper on handwriting synthesis proposed by Alex Graves(DeepMind). I will also be implementing the paper using Tensorflow and Keras. 

#### Problem Definition 
The dataset here is in the form of mathematical representation of handwritten strokes. So a point in the stroke sequence is a vector of length=3. First value is a binary digit denoting whether the pen lifts in the air at the point or not. Second value is the offset of the x coodinate relative to the previous x-value in the sequence and similarly the third value is the offset in the y coordinate. The problem is, given the dataset, we need a model which can generate handwritten strokes unconditionally(randomly by giving a seed value, just like GANs).

#### Mixed Density Networks
Before moving into the implementation part, I would like to discuss about a special kind of network called MDNs or Mixed Density Networks. The goal of a supervised problem is to model a generator or a joint probability distribution over the features and the labels. But in most of the cases the distributions are considered to be time-invariant such as in the cases of image or text classification. But when the probability distribution itself is non-stationary as in cases like handwritten strokes or say path coordinates of a car, normal neural networks perform very badly there. Mixed Density Networks assume the dataset to be a mixture of various distributions and tends to learn the statistical parameters of those distributions resulting in better performance. **CONFUSED?** 

![nkdsj](https://media2.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif)

Okay fine, we are going to get into more details. 




![slkd](https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQyD1d8mt2DJV2gTX877-Oo4JtdbAmePYhLEyxnaaQS9YvIaAk0)
