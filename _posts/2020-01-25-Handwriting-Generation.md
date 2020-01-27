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

Let us take an example shown in the figure below:

![dkjsk](https://1.bp.blogspot.com/-42_9dzRFUmU/Xi6YDF_CQlI/AAAAAAAAQis/5_w4hOE-qmAWyU2cJrpgb8SvOzDhGPEHgCLcBGAsYHQ/s1600/Screenshot%2B2020-01-27%2Bat%2B1.27.03%2BPM.png)

In the first figure, given the Θ1 and Θ2, when asked about predicting the position of robotic arm, we have a unique solution. Now, look at the second figure, the problem has been reversed. Given the x1 and x2, when asked about predicting the Θ parameters, we get two solutions. In most of the cases, we get a problem like the first figure where the data distribution can be assumed to come from a single gaussian distribution. While for the case like the second figure, if we use the conventional neural networks, it does not go down well with the performance. I will tell you why, shortly.

It is not that neural networks having mean squared losses or cross entropy losses do not consider the (mixture of distributions) thing. It considers that thing, but gives a resulting distribution which is the mean of all those mixtures and this [paper](https://publications.aston.ac.uk/id/eprint/373/1/NCRG_94_004.pdf) suggests that we do not need the mean and instead the most probable mixture component to model the statistical parameters. And thus **MDN** comes into picture.

##### How does it look like?










![slkd](https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQyD1d8mt2DJV2gTX877-Oo4JtdbAmePYhLEyxnaaQS9YvIaAk0)
