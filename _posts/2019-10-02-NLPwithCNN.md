---
title : Convolutional Neural Networks for NLP
---

In this blog, we will be implementing a convolutional neural network-based deep learning model for text classification.

Before jumping into the coding part, let us understand our approach briefly.

We will be using 1-D convolution which operates as shown in the diagram below:

![cnnlp1](https://1.bp.blogspot.com/-_fJE_gS9F2g/XamNbt-SSQI/AAAAAAAAPe4/p2kNrHTRkuw9hxJter56RhOIKipXLWl-QCLcBGAsYHQ/s1600/1_aBN2Ir7y2E-t2AbekOtEIw.png)

In the example, we can see that our sentence consists of 9 words and the kernel size of the convolutional filter is 2. 
Hence two words are taken at a time with a stride=1 and convolved. In 1-D CNN, the kernel length is by default assumed to be 
equal to the length of the word embedding dimension. 

The kernel size is nothing but the context length taken at a time. We will use various context lengths(kernel sizes) and 
concatenate all the sentence representations for computing the final sentence vector. Then the classification is done by 
normally passing the final sentence vector to a classifier such as softmax.


Let's code the model in TensorFlow keras:

<script src="https://gist.github.com/spraphul/f3263a847f6a583af7a3fa282d05937c.js"></script>

Finally, we are ready with the model that can be trained for a simple text classification problem. We can add a lot of things to increase the complexity of the model. 
But the main focus of this blog was to be able to use a CNN for text classifications.

**Keep Learning, Keep Sharing 😊.**
