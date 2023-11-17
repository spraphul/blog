---
title: Efficient Book Summarization using Large Language Models
---

![book](https://basmo.app/wp-content/uploads/2021/10/how-to-write-a-book-summary-1.gif)

In the realm of summarizing entire books using Large Language Models (LLMs), the challenge of context length emerges as a prominent hurdle. These models, while powerful, are constrained by their capacity to handle only a certain amount of text at a time. Given the extensive nature of books, accommodating the entire context within the model's limitations becomes a formidable task.

Addressing this challenge involves relying on techniques that effectively reduce the context size without compromising the essence of the book. The art of summarization, in this context, becomes a delicate balance between distillation and retention, requiring strategies that make the most out of the available context space.

In the upcoming discussion, I will explain two techniques for summarizing large books. The first technique involves a recursive approach, mirroring a human reading process. The model is tasked with sequentially reading through the book page by page. As it progresses, it stores the previously generated summary in a memory block, conditioning its understanding of the current page on the accumulated summary. This recursive process continues until the model reaches the last page, at which point it outputs the comprehensive summary of the entire book. Despite its alignment with a human reading strategy, this approach can be time-consuming, particularly for books spanning hundreds of pages.

The second technique introduces a pragmatic solution to the time challenge by combining extractive and abstractive summarization. Initially, an extractive summarization process is employed to identify and pull key information from the text. Subsequently, this extractive summary becomes the input for the LLM, enabling it to generate a coherent and well-written abstractive summary. This two-step approach aims to strike a balance between efficiency and comprehensiveness, leveraging the strengths of each summarization method.

## Recursive Approach
