---
title: Aligning LLMs using Human Edits
---

* TOC
{:toc}

There has been some cool progress in Aligning Large Language Models to human preferences, and guess what? It has been found that getting feedback from humans makes model-generated text way better. Now, let's talk about a part of this research: Human Edits. I am going to talk about a technique called Sequence Alignment (un)Likelihood Training (SALT), where they mix both what humans say(through edits int the model's response) and what the machine comes up with during training. They also introduce something called Imitation Edits, where they kind of pretend to have human-edited data by using real summaries from existing training data. This trick helps save on needing a ton of human-edited samples. SALT makes summaries better when you mix what changes humans want in them through edits. Although there has already been some work on aligning LLMs like using RLHF(Reinforcement Learning using Human Feedback) and DPO(Direct Preference Optimization), this method takes an alternate approach of using human edits to align the models.

Before we talk about SALT specifically, lets talk briefly about techniques like RLHF and DPO and what changes SALT brings in them.

Reinforcement Learning from Human Feedback (RLHF) is an approach that uses human feedback to train summarization models. RLHF involves training the model to maximize the expected reward, which is calculated based on human feedback. The model generates summaries, and the human feedback is used to calculate the reward signal. However, RLHF requires separate reward models to be trained, which in turn requires a large amount of ranking data. This can be a significant bottleneck in the RLHF approach.

Direct Preference Optimization (DPO) is an improvement to RLHF that addresses this bottleneck by implicitly making the Language Models (LLMs) a reward model for itself. DPO involves presenting the model with two summaries, a chosen summary and a rejected summary, and calculating the loss based on the direct preference between them. The model is then updated based on the loss, with the goal of improving the quality of the generated summaries. However, both RLHF and DPO can suffer from catastrophic forgetting, where the model forgets previously learned information when trained on new data.

SALT aims to address the bottlenecks in both RLHF and DPO by incorporating samples from the original dataset into the training process on the new human-edited dataset. This approach leverages replay-based methods to improve the overall quality of summarization models when fine-tuning on new human-edited data. By combining the Maximum Likelihood Estimation (MLE) loss for the original dataset with the SALT loss for the new human-edited dataset, SALT aims to retain important knowledge and enhance the model's performance on both datasets. This approach mitigates the impact of catastrophic forgetting and improves the overall quality of summarization models.

## Understanding SALT Loss Function

SALT utilizes both human-edited and model-generated data in the training loop by incorporating them into the loss function. Specifically, SALT uses the unlikelihood objective, which encourages the model to generate summaries that are different from a negative distribution, in addition to the likelihood objective that maximizes the probability of generating the human-edited summary. This way, SALT can make good use of the model-generated data while also improving the utilization of human-edited data. Additionally, SALT can manipulate the model's behavior by changing the loss weights for specific tokens in the likelihood training, which can increase or decrease the emphasis of the model on certain tokens. Let's take a deep dive into the actual loss function.

![and](https://media.licdn.com/dms/image/D5612AQH4MJSGBLGIrA/article-inline_image-shrink_1500_2232/0/1706929795183?e=1727308800&v=beta&t=98Xpgaicg_g4zfmJ_mgYHw0-hXrqldhuNiLYEFtq2ZY)

The loss function above consists of two components: the likelihood loss (Lp) and the unlikelihood loss (Lr). These losses are used to train the summarization model with both the AI-generated summary (SAI) and the human-edited summary (SE).

### Likelihood Loss (\(L_p\))

The likelihood loss (\(L_p\)) is a measure of how well the model is able to generate the tokens in a human-edited summary (\(S_E\)). It is calculated using the negative log likelihood and is defined by the following formula:

\[ L_p(x, t) = - \log(1 - p_{\theta}(x_t | x_{<t}, U)) \]

- \(x\): Represents the token sequence.
- \(t\): Represents the token position.
- \(p_{\theta}(x_t | x_{<t}, U)\): Is the probability of generating token \(x_t\) given the preceding tokens \(x_{<t}\) and the utterance cluster \(U\).

In simpler terms, \(L_p\) penalizes the model when it fails to generate the correct token in the human-edited summary, encouraging the model to improve its likelihood of generating accurate tokens.

### Unlikelihood Loss (\(L_r\))

The unlikelihood loss (\(L_r\)) is a measure of how well the model avoids generating tokens that are not present in the human-edited summary (\(S_E\)). It is calculated using the negative log likelihood and is defined by the following formula:

\[ L_r(x, t) = - \log p_{\theta}(x_t | x_{<t}, U) \]

- \(x\): Represents the token sequence.
- \(t\): Represents the token position.
- \(p_{\theta}(x_t | x_{<t}, U)\): Is the probability of generating token \(x_t\) given the preceding tokens \(x_{<t}\) and the utterance cluster \(U\).

In simpler terms, \(L_r\) penalizes the model when it generates tokens that are not part of the human-edited summary, encouraging the model to be more selective and avoid generating irrelevant tokens.

### Additionally

- \(1_{AI-C}\) and \(1_{AI-NC}\) represent tokens that are changed and not changed when aligning \(S_{AI}\) and \(S_E\) sequences.
- \(1_{E-C}\) and \(1_{E-NC}\) represent tokens that are changed and not changed in \(S_E\).
- \(w_{AI-C}\), \(w_{AI-NC}\), \(w_{E-C}\), and \(w_{E-NC}\) are loss weights for different token categories.

### Example

Let's take an example to understand the process of calculating the indicator vectors:

- **\(S_{AI}\)**: "patient takes one aspirin daily"
- **\(S_E\)**: "patient doesn't want to take aspirin"

The alignment between these two sentences is represented as follows:

patient - - - takes one aspirin daily

patient doesn't want to take - aspirin -

C         I       I   I   S  D   C     D



In this alignment representation:
- "C" stands for "Correspondence" (Unchanged tokens)
- "I" stands for "Inserted" tokens. (Changed)
- "D" stands for "Deleted" tokens (Changed)
- "S" stands for "Substituted" tokens (Changed)

For the word list in \(S_{AI}\) \([patient, takes, one, aspirin, daily]\), the corresponding indicator functions are:
- \(1_{AI-C}(t) = [0, 1, 1, 0, 1]\)
- \(1_{AI-NC}(t) = [1, 0, 0, 1, 0]\)

For the word list in \(S_E\) \([patient, doesn't, want, to, take, aspirin]\), the corresponding indicator functions are:
- \(1_{E-C}(t) = [0, 1, 1, 1, 1, 0]\)
- \(1_{E-NC}(t) = [1, 0, 0, 0, 0, 1]\)

### Catastrophic Forgetting Issue

Catastrophic forgetting can occur when training a model using the SALT approach due to the model's tendency to excessively adapt to new data while forgetting previously learned information. In this context, the model is trained to align its output with human-edited summaries, which involves adjusting its parameters based on the specific modifications made by humans. However, as the model undergoes iterative training with new human-edit feedback data, there is a risk that it may overly prioritize the most recent feedback, leading to a degradation in performance on previously learned tasks or datasets. This phenomenon occurs because the model's optimization process may excessively focus on minimizing the discrepancy between the AI-generated and human-edited summaries in the new training data, potentially overshadowing the previously learned knowledge or patterns. As a result, catastrophic forgetting can manifest as a significant decline in the model's performance on earlier tasks or datasets, highlighting the challenge of balancing adaptation to new feedback with the retention of previously acquired knowledge.

### The Concept of Imitation Edits

Imitation Edits, represented by the edited summary \(S_I\), offer a valuable approach to enhancing models in the absence of actual Human Edits. By leveraging pre-existing ground-truth summaries as \(S_I\), even though they were not explicitly written as edits to the original summaries (\(S_{AI}\)), several advantages are realized. This includes the potential to increase the available data for unlikelihood training, enabling the use of SALT without human-edit data or new annotations. Additionally, the combination of Human Edits and Imitation Edits can further improve the model's performance, as both provide effective data points for training. Additionally, Imitation Edits can be utilized to address the forgetting problem during SALT training with \(S_{AI}\) and \(S_E\), showcasing their significance in enhancing the training process and overall model performance.

### Solution

To mitigate the forgetting issue, traditional Replay-based methods are employed. This approach involves sampling a subset of data from the familiar dataset (e.g., CC) and integrating it with the unfamiliar dataset (e.g., CCUser) to mitigate the effects of catastrophic forgetting.

### Leveraging RSALT for Effective Training

A loss function is formulated to handle both the sampled seen data (\(S_I(seen)\)) and the human-edit data (\(S_E(unseen)\)). By utilizing Maximum Likelihood Estimation, the model \(M\) is trained on both types of data to maintain performance consistency across datasets. The RSALT technique plays a crucial role in this process by combining the loss functions for unseen data (\(L_{SALT}\)) and seen data (\(L_{RSALT}\)) to ensure a comprehensive training approach.

### Strategic Training Methodology

Building on the principles outlined in the previous sections, the training strategy involves utilizing both unseen data (\(S_{AI(unseen)}\) and \(S_E(unseen)\)) and previously seen data (\(S_{AI(seen)}\) and \(S_I(seen)\)) for SALT training. This comprehensive approach aims to optimize the model's performance by addressing the distribution variances between datasets effectively.

In summary, the integration of RSALT into the training framework offers a strategic solution to mitigate catastrophic forgetting and enhance the model's adaptability to varying datasets. By incorporating both seen and unseen data into the training process, the model can maintain performance consistency and improve its overall summarization capabilities.

### SALT vs DPO/RLHF

The comparison between SALT and RLHF/DPO sheds light on the significance of Human Edits as a natural and scalable method for gathering feedback from users refining AI-generated text within their workflow. This approach is particularly advantageous in domains requiring expert knowledge and nuanced user objectives, emphasizing the importance of collecting feedback directly linked to experts' daily tasks for improved model training.

In the experimentation with DPO and SALT using a human edit feedback dataset, it is observed that DPO outperforms SALT\(_l\) (with only likelihood loss) but lags behind SALT\(_l+u\) (with both likelihood and unlikelihood losses). The limitation of DPO penalizing the entire rejected summary, despite the similarity between words in the rejected and chosen summaries, suggests a challenge in effectively learning implicit rewards without considering the detailed token relationships.

### Conclusion

Moreover, the comparisons in the paper highlight that SALT achieves higher Reward Accuracy than DPO, despite not explicitly maximizing log probabilities like DPO. The original design of DPO for comparisons rather than human edit feedback indicates a need for modifications to enhance its performance in this context. Proposing a potential adjustment to the loss function focusing on "negative tokens" in the rejected summary aligns more closely with SALT's principles, suggesting a pathway for improving DPO's effectiveness in leveraging human edit feedback for language model training.
