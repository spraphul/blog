---
title : Deploying a ML Model in Django
---

![DMM1](https://1.bp.blogspot.com/-FT1JZ5TlrDE/XbC_EHaZUfI/AAAAAAAAPpI/vtBcRhi0MZcCr-zMSub8dyYZhTQkBcEagCEwYBhgL/s1600/django.png)

While the trend in machine learning has grown so much nowadays, most of the data scientists are busy creating and training various machine learning models to solve different kinds of problems.

**How about having a nice web interface where we can deploy our model to visualise the task we have trained our model to do?**

**In this blog, we will be using Django to deploy a machine learning model.**


To install Django on your machine, simply type the following commands:


**$ pip install django** <br />
**$ pip install djangorestframework**

Now, we will create a project in django. Let us say we want to deploy a text classification model.

**$ django-admin startproject TextClassifier**

**You should see a directory structure like this:**


![DMM2](https://1.bp.blogspot.com/-XT-dq4nY4fY/XbFSpFd4BWI/AAAAAAAAPpk/fxMpnXE5cZ0Q0tcWu1EGwYMKMMIRML7IgCLcBGAsYHQ/s1600/Screenshot%2B2019-10-24%2Bat%2B12.53.52%2BPM.png)


Now, we will have to create a django app. Let us name it as LstmClassifier.

**$ cd TextClassifier** <br />
**$ python manage.py startapp LstmClassifier**

Now, we need to configure the settings.py file in TextClassifier by adding the rest_framework and the LstmClassifier app in the INSTALLED_APPS list.

**The code should look like this:**


![DMM3](https://1.bp.blogspot.com/-j-kfejLuuZI/XbFUsR9zAPI/AAAAAAAAPpw/zZaRrPEmFyswwbajvs-GfLmnQT9hCuxlgCLcBGAsYHQ/s1600/Screenshot%2B2019-10-24%2Bat%2B1.02.55%2BPM.png)

Now, we will create a directory saved_model in the LstmClassifier directory and store our machine learning model there. We will also create a directory named as Data to store our vocab and word2id there which will be used in processing the text data.


Now, we will make some changes in apps.py where we will load the model and the essential data at once.

**Let us do the coding now:**

![DMM4](https://1.bp.blogspot.com/-JVIxTuN0qIg/XbFr3S54-FI/AAAAAAAAPqI/xbCwedMFIdIBSS6rPc1_bwvmBxQjLjZcgCLcBGAsYHQ/s1600/Screenshot%2B2019-10-24%2Bat%2B2.41.26%2BPM.png)

Now, we will have to add the required function to do the job which our endpoint call will be referring to. For that, we need to go to views.py. The code is like the one in the figure below:

<script src="https://gist.github.com/spraphul/cc69aa7b9f36a4b77902e9ad5c13fe07.js"></script>

**Now, we will define a URL for views in urls.py as follows:**

![DMM5](https://1.bp.blogspot.com/-kdWiRfuWLtk/XbFzJe_MwjI/AAAAAAAAPqY/-ohhcyO1DagODAK-M9XBC6LXHUMSiEf4ACLcBGAsYHQ/s1600/Screenshot%2B2019-10-24%2Bat%2B3.12.52%2BPM.png)

By migrating, we enable the changes made to our model into the database. This can be done as follows:

**$ python manage.py makemigrations**<br />
**$ python manage.py migrate**

The above functions can be taken similar to that of
compiling and executing a code.


**Now, its time to run the server:**

**$ python manage.py runserver**


Open any browser and type localhost followed by the port number on which the server is running like:
**http://127.0.0.1:8000/model/?sentence=any_sentence** and hit enter.

You should be getting a json output like this:

**'Class_Predicted' : 'two'**<br />
**'Probabilty' : '0.963'**

Finally, we have created a web app for our model. There is a tensorflow serving API also which does the same job and is 
much easy to use. We just need to convert our model into TensorFlow protobuff format and deploy our model there and it 
automatically gives us an end-point for our predictions.

**Keep Learning, Keep Sharing 😊**
