---
title : Decision Trees
---

![dt1](https://lh4.googleusercontent.com/v9UQUwaQTAXVH90b-Ugyw2_61_uErfYvTBtG-RNRNB_eHUFq9AmAN_2IOdfOETnbXImnQVN-wPC7_YzDgf7urCeyhyx5UZmuSwV8BVsV8VnHxl1KtgpuxDifJ4pLE23ooYXLlnc)

### Entropy:
The level of uncertainty or randomness in a set is known as its entropy. It describes the distribution of a dataset. If a 
dataset consists of a single class, then its entropy will be zero as it has no uncertainty. If every class in the dataset has 
equal probability then the entropy of the dataset will be maximum. 

Let's try to understand it through an example:

Suppose we have a dataset S having C number of distinct classes. Let p(c) be the probability that a data belongs to class c, 
where c∈(1,2,3,...,C). 

Then the entropy can be defined as follows:

![dt2](https://1.bp.blogspot.com/-8Qk2Y0Ecq90/XWw10i84eDI/AAAAAAAAO78/txHs-1mEcj0sq36ibgX6oxcc4qqKoMFEwCLcBGAs/s320/Screenshot%2B2019-09-02%2Bat%2B2.48.45%2BAM.png)

Now, let's look at a simple decision tree given at the top of the blog:

As we keep going down the tree, we get close to be certain to make a decision. Now at the node of the tree, which is a rule we want maximum certainty, meaning minimum entropy.

In simple words, we want to start with a rule which gives us maximum information gain.

A feature is said to be more informative if, by knowing its value, the entropy of dataset reduces more.

Let us take an example:

**The dataset 'S' contains features{outlook, Temperature,Humidity}. Suppose we split our dataset based on the feature 
Temperature{Hot,Cold}. Now the information gain given the value of Temperature will be:**

![dt3](https://1.bp.blogspot.com/-ArpKXHdS-z4/XW406YVNvtI/AAAAAAAAO8w/oC6_y7yLFZk6X9QZ7o7uue8Rz-BTdrXqwCLcBGAs/s640/Screenshot%2B2019-09-03%2Bat%2B3.09.18%2BPM.png)

where **v∈(Hot, Cold).** Similarly, we calculate the value of IF for other features: Humidity and Outlook and the feature with
maximum information gain will be kept as the root node. We can do a similar process on the splits we got to decide other nodes
in the tree. 

If the entropy of any split becomes zero then, it becomes a pure class and there is no need to split further. But we can have
a threshold for the entropy below which we can stop splitting. Having a threshold greater than 0 helps us get rid of 
overfitting.

We can visualise the effect of information gain on the splits in the figure given below:

![dt4](https://1.bp.blogspot.com/-vi25a_QL9Pk/XW4580thO0I/AAAAAAAAO88/bfkaEoo5s1IV53c2J9_aumdEZRSGBd4fgCLcBGAs/s640/Screenshot%2B2019-09-03%2Bat%2B3.30.47%2BPM.png)

We have learned how to construct a decision tree and we can use it for different but mainly classification purposes.

**Keep Learning, Keep Sharing😊.**
