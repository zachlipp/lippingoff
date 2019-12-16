---
title: Cute math trick and some tips for proofs 
author: Zach Lipp
date: '2019-07-14'
slug: abstention-trick
categories: []
tags: []
---

# Cute math trick and some tips for proofs

I had the privilege of attending [ICML 2019](https://icml.cc/Conferences/2019) with some colleagues last month, and I've started working through some of the papers that stood out to me. First on the docket: [*Combating Label Noise in Deep Learning Using Abstention*.](https://arxiv.org/abs/1905.10964) Key idea: When classifying $k$  variables, create a $k+1$ category, codify the extra class as "choosing to abstain", and then train your model to abstain explicitly rather than deriving abstention after the fact based on classification scores.  

## The trick

I was hitting some issues with the very first formula in the paper (I'm new to research if that wasn't obvious), and I wanted to see how the authors coded it up.

The formula

$$
{L}(x_j) = (1 - p_{k+1})(-\sum^{k}_{i=1} t_i \log \frac{p_i}{1 - p_{k+1}}) + \alpha \log \frac{1}{1 - p_{k+1}}
$$

Gets [translated to](https://github.com/thulas/dac-label-noise/blob/542f3cf6442e2095cf1be7215797da5c32c1728a/dac_loss.py#L122)

```python
loss = (1. - p_out_abstain)*h_c - \ self.alpha_var*torch.log(1. - p_out_abstain)
```

This seems okay (log transform on the rightmost term but whatever), but what is [`h_c`](https://github.com/thulas/dac-label-noise/blob/master/dac_loss.py#L76)?

```python
h_c = F.cross_entropy(input_batch[:,0:-1],target_batch,reduce=False)
```

Huh? What happened to $ \log \frac{p_i}{1 - p_{k+1}} $? It took me a few tries to convince myself, but these are actually equivalent.

Even after I was convinced, I had to chew on the proof for a bit. I revisited the problem after a long weekend off, and it's pretty slick. 

$$
\begin{equation}
  \begin{split}
  \frac{p_i}{1 - p_{k+1}}
       &= \frac{\frac{e^v}{\sum^{k+1}_{i=1}e^v}}{1 - p_{k+1}} && \text{given ouput } v \text{, softmax function} \\\\
       &= \frac{e^v}{\sum^{k+1}_{i=1}e^v} \cdot \frac{1}{1 - p_{k+1}} \\\\
       &= \frac{e^v}{\sum^{k+1}_{i=1}e^v} \cdot \frac{1}{\sum^{k}_{j=1}p_j} && \quad\text{(1)   } \\\\
        &= \frac{e^v}{\sum^{k+1}_{i=1}e^v} \cdot \frac{1}{\sum^{k}_{j=1}(\frac{e^v}{\sum^{k+1}_{i=1}e^v})} \\\\
       &= \frac{e^v}{\sum^{k+1}_{i=1}e^v} \cdot \frac{\sum^{k+1}_{i=1}e^v}{\sum^{k}_{j=1}e^v} \\\\
       &= \frac{e^v}{\sum^{k}_{j=1}e^v} \\\\
       &= p_j && \text{by softmax definition}
  \end{split}
\end{equation}
$$

This means that

$$
\begin{equation}
  \begin{split}
    \text{h_c}
      &= -\sum^{k}\_{i=1} t_i \log \frac{p_i}{1 - p_{k+1}} \\\\
      &= -\sum^{k}\_{i=1} t_i \log p_i \\\\
      &= \text{cross_entropy}(v, t) && \text{for outputs, targets } v,\space t
  \end{split}
\end{equation}
$$

Pretty cool stuff, but definitely deserved a comment!

## The tips

As mentioned above, it's been a few years since I tried a proof (and to be honest, I don't think I ever successfully did this much series - apologies to my Calc II teacher). Here are some tips I have for future me the next time I try this, maybe someone else can find them useful, too.

- **Demonstrate, then prove.** When I originally saw `h_c`, I assumed it was a typo or mistake in the calculation. It wasn't until I'd shown for myself that the trick works in practice that I could approach demonstrating why it worked
- **A little understanding goes a long way.** I spent many hours on this little proof. If I had to give a "eureka" moment, it'd definitely be understanding what $1 - p_{k + 1}$ represents (See $\text{(1)}$ in the proof.). It wasn't until I asked myself out lout *Well, what is this?* and answered with *The remaining probability mass of the sum of the first k probabilities* that I saw a path through the proof.
- **Don't stress subscripts at first, just focus on what's a scalar and what's a vector.** This might be a little too specific, but I found labeling the dimension of each term immensely helpful. My first work through of this proof eschewed subscripts entirely Instead, I just noted when each value represented a scalar or a vector. I haven't used many vector-valued functions in proofs, and this explicit labeling approach helped me a lot more than pining for intuition. (Note: This technique was especially helpful, I think, because $p_i$ is overloaded in the paper - see my introduction of $p_k$ in the proof).
