---
title : Multi-Head Self Attention in NLP
---

In this blog, we will be discussing a recent research done by the Google Team bringing state of art results in the area of natural language processing. Till now, we have widely been using LSTMs and GRUs for the sequential data as they seem to capture better positional and semantic informations. Despite of the popularity, the drawback of using them is high computional requirement and complex architecture. So what to do then ?

Not much time has passed since Google released its new research paper, [Attention is all you need](https://arxiv.org/abs/1706.03762) which proposes an alternative way for using RNNs and still getting better results. They have introduced a concept of transformers which is based on **Multi-Head Self Attention** and we will be discussing more about the term here.

![mtt](https://miro.medium.com/max/437/1*5h3HHJh7kgezyOdTcRZc0A.png)


#### Self Attention
We know that attention is a mechanism to find the words of importance for a given query word in a sentence. The mathematical representation for attention mechanism looks like the figure given below:

![atte](https://miro.medium.com/max/469/1*GsLQLch51d7excmuAi4UzQ.png)

So, **X** is the input word sequence and we calculate three values from that which is **Q(Query)**, **K(Key)** and **V(Value)**. So the task is to find the important words from the Keys for the Query word. This is done by passing the query and key to a mathematical function(usually matrix multiplication followed by softmax). The resulting context vector for **Q** is the multiplication of the probability vector obtained by the softmax with the **Value**. 

When the Query and Key and Value, all are generated from the same input sequence X, it is called **Self Attention**. 

![self](https://uploads-ssl.webflow.com/5d97a4cbfecfcd70873a37d1/5daa9f120d705b66e57ee953_aiayn%20self%20attention%20mechanism%20-%20umaneo-FR.svg)


### Multi-Head Self Attention

We have been breaking into the concept word by word so far and the only new term here is **Multi-Head** now. So this is nothing but doing the same thing discussed earlier by different heads(brains 😀). The aim here is to combine the knowledge explored by multiple heads or agents instead of doing it by one as in the traditional case. Mathematically, it relates to attending to not only the different words of the sentence but different segments of the words too. So, the words vectors are divided into a fixed number(h, number of heads) of chunks and then self-attention is applied on the corresponding chunks resulting in **h** context vector for each word. The final context vector is obtained by concatinating all those **h** context vectors.

![mlt](http://jalammar.github.io/images/t/transformer_self-attention_visualization_2.png)

The figure above is a visualization of the outputs upon using two heads. We can see that if the Query word is, **it**, the first head focuses more on the words, **the animal** and the second head focuses more on the word, **tired**. Hence the final context representation will be focusing on all the words, **the, animal and tired** and thus is a superior representation as compared to the traditional way.

### Positional Embeddings

Now that we have understood, self attention and multi-head self attention, we can recall the claim that they can be a way to replace RNNs in a language modelling problem. 

**The question is, HOW?**

This is exactly where we should dicuss about the positional embeddings. They are nothing but a way to capture positional informations of words in a sentence as the usual word2vec or Glove embeddings contains only the semantic meanings and do not tell anything about the positions of the words. We can use a simple one hot vector and do some kind of mathematical computation using the positional one-hot vectors and the word-embeddings to obtain the positional embeddings. But that would be a very naive approach. Google uses the sin and cosine functions to compute the position vectors as it normalises the position between -1 to 1 and thus is a good scaling solution for long sequences. The mathematical formula for computing the same looks as follows:

![pen](https://miro.medium.com/max/1572/1*xCeAOFp17t-NcWWpF2k9Gw.png)

Once we have calculated the positional encodings, we can combine them with the respective word embeddings to get the final **positional word embeddings**. 

![fll](https://i.stack.imgur.com/bFPI9.png)

Hence, the conclusion is that attention alone can work sufficiently as the replacement for the RNN based architectures and besides that using them is quite faster and even produces better results.

AMAZING, isn't it? 🙄

Hope you liked the explanation. **Keep Learning, Keep Sharing**


