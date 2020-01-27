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

So MDN is nothing but a neural network predicting the statistical parameters instead the probabilities for the classes or values for a regression problem. Let us assume the data to be a mixture of **M** normal distributions, so the final prediction will be **M** probabilities weights for the mixtures, **M** mean values and **M** variances. And while sampling we take the parameters of the most probable mixture component. We will talk more about the structure and implementations later.


#### Long Short Term Memory Networks
![skn](https://www.researchgate.net/profile/Ron_Hoory/publication/267154161/figure/download/fig2/AS:614220395737088@1523452962264/LSTM-gate-with-peephole-connections-showing-the-internal-structure-and-relation-between.png)

While it is not a new thing, I may expect some new people. So I will give a basic idea about LSTMs here. So, LSTMs are nothing but a special kind of neural network having three gates, input, foget and output gates respectively. The most important thing in a LSTM cell is its memory C shown in the figure above.

**Forget Gate:** A LSTM cell will output the hidden state and the memory of its cell which fed to the cell next to it. A forget gate decides the amount of the information from the previous memory to be passed into the current cell. It basically takes the previous output and current input and outputs a forget probability.


**Input Gate:** It takes the same inputs as the forget gate and outputs a probability which decides the amount of information of the cell state which contributes to its memory.

**Output Gate:** It again takes the same inputs as above and gives a probability which predicts a probability to decide the amount of information to be passes to its next cell.

LSTMs are quite good at handling sequential inputs like texts, time-series datasets or stroke datasets discussed earlier and give a robust feature vector for a sample data sequence. Alex Graves thus proposes to use them for the handwritten strokes to find a feature vector for a stroke sequence which is then fed to a MDN network to find the statistical parameters as shown in the figure below:

![sdj](https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSeMnFwFRfMNTSxP4gaEML7zf0yHCgKKmKr4nRCbwaQ91Txq3kO)


I hope we are now good to get into the implementation part. I will use Keras to create the network and Tensorflow at its backend to define the loss function.

It is assumed that the x and y point offsets follow mixture of bivariate normal distributions and the penlifts follow a bernoulli distribution(obvious, right?). I will demostrate the solution using a mixture of 2 bivariate normal distributions and bernoulli distribution can be parametrized by a single probability value, right? 

Oh! I forgot to tell you about the loss function. It is defined by the equation given below:

![wskdk](https://1.bp.blogspot.com/-lojawOMZYVk/Xi6sZ5ewj9I/AAAAAAAAQi4/IhkcFJBnmrwchxcPa0NiZLj1FWVwiOIHgCLcBGAsYHQ/s1600/Screenshot%2B2020-01-27%2Bat%2B2.54.14%2BPM.png)

where π is the probability of mixture components and e is the probability of the end of stroke which parametrizes the bernoulli distribution.

Now let us do the task we are hired for 😮....🤫....😃 Code Code Code:

The input will be a sequence of 3 length vectors and output of each point is the next point in the stroke sequence like shown in the figure below:

![wsld](https://image.slidesharecdn.com/rnnerica-180423124525/95/rnn-and-its-applications-31-638.jpg?cb=1524487703)


#### Model(LSTM + MDN)
```python
import numpy as np
import numpy
import tensorflow as tf
import tensorflow.keras as keras
import tensorflow.keras.backend as K
import keras.layers.Input as Input
import keras.layers.LSTM as LSTM
from tensorflow.keras.models import Model

# nout = 1 eos + 2 mixture weights + 2*2 means \
# + 2*2 variances + 2 correlations for bivariates

def build_model(ninp=3, nmix=2, nout=13):
    inp = Input(shape=(None, ninp), dtype='float32')
    l,h,c = LSTM(400, return_sequences=True, \
    return_state=True)(inp)
    l1 ,_,_= LSTM(400, return_sequences=True, \
    return_state=True)(l, initial_state=[h,c])
    
    output = keras.layers.Dense(13)(l1)
    model = Model(inp,output)
    
    return model
```


#### Loss Function



