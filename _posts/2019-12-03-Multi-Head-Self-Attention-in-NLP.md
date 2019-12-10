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

