---
title : Parallel Processing in Python
---

![prl1](https://sebastianraschka.com/images/blog/2014/multiprocessing_intro/multiprocessing_scheme.png)

Parallel Processing is a method to execute a task simultaneously in multiple cores of the same system.

In this blog, we will briefly go through the basics of parallel processing and learn to code it in python.

Note: Just to avoid confusions between multiprocessing and multi-threading here: We have multiple threads in a single process and multi-threading is a process of scheduling multiple threads on a single core.

We will be using the "multiprocessing" module for our purposes.

So, let us find out how many processors does our CPU has:

![prl2](https://1.bp.blogspot.com/-eNihe_Fn9q0/XXN9ECOlHII/AAAAAAAAPAQ/3KmA5HAgnwAJjEnuAW-cxk9cIu_Dup6VgCLcBGAs/s640/Screenshot%2B2019-09-07%2Bat%2B3.18.00%2BPM.png)

**So, my CPU has 4 processors.**

Now let us talk about the two types of processes:
**1. Synchronous <br/>**
**2. Asynchronous <br/>**

### Synchronous Process:
In this process, locking is involved. Meaning, if we have multiple processes running, the next process starts only is the previous process has been executed completely.



### Asynchronous Process:

In these kinds of processes, the order does not matter and hence output can be in a different order than the inputs passed but it can be relatively faster than the previous one.



In the multiprocessing module, there are two classes, Pool and Process. We will prefer using Pool class as it ensures that our processes go into separate cores.


**Lets us do synchronous multi-processing first:**

We will take a simple example in which we have a two-dimensional array. We will traverse through the rows of the array and store the sum of each row in a list.

![prl3](https://1.bp.blogspot.com/-qS_3lgtzaJU/XXODif8FdBI/AAAAAAAAPAc/wYOtlyIcKR0Ge8XO0iHLMuxbgPmTccc5QCLcBGAs/s640/Screenshot%2B2019-09-07%2Bat%2B3.45.46%2BPM.png)

**For synchronous processes, we will be using the 'starmap' method:**

![prl4](https://1.bp.blogspot.com/-X-ZUb4s8eKc/XXOGi-3hbxI/AAAAAAAAPAo/uweBsU-On6EtTSYJSHa3YQ-L1vhuuvd0ACLcBGAs/s640/Screenshot%2B2019-09-07%2Bat%2B3.58.32%2BPM.png)

**Now, let us solve the previous problem in a different way. We will split the input into 4 equal parts and then process them
in separate processors and then merge the outputs of all those.**

![prl5](https://1.bp.blogspot.com/-Idg0h-u6Vm4/XXOJzJ4QBYI/AAAAAAAAPA0/l94BaaqxKUoIuM33UKnLbppT8XqlYJJbwCLcBGAs/s640/Screenshot%2B2019-09-07%2Bat%2B4.12.27%2BPM.png)

**Now, let us see if there is a difference in the results obtained from the two ways:**

![prl6](https://1.bp.blogspot.com/-7COPRjiiK-k/XXOKVRL0X7I/AAAAAAAAPA8/f8OJyyKznHAYm6PLMEr8U6t6QaC_kSzOwCLcBGAs/s640/Screenshot%2B2019-09-07%2Bat%2B4.14.42%2BPM.png)

We can see, there is no difference in the results obtained hence as starmap is a synchronous method. The difference in the 
ways is that we assigned 250 rows to each core at once later while previously, 1 row was assigned to each core. Once four
rows got processed, again 4 rows were assigned and so on.   

**Keep Learning, Keep Sharing😊.**

