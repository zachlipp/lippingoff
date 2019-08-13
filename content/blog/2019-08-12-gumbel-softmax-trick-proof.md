---
title: Gumbel softmax trick proof 
author: Zach Lipp
date: '2019-08-12'
slug: gumbel-softmax-proof
categories: []
tags: []
---

# Proof of the gumbel softmax trick

## Background

I've come across the [gumbel softmax trick]() a few times since I started my machine learning career. For the uninitiated, the trick is that the argmax of  logits with random gumbel noise added to it is equivalent to sampling from the softmax of the logits. This is trick is used in machine learning to substitute discrete distributions (which are nondifferentiable) with softmaxes (which we can differentiate). (For more questions, please read Matthew Ratz's blog post linked above.)

The more I've come across this trick, the more I've wondered why this would work in the first place. That's what we're going to cover here.

## Disclaimer

The rest of this post is working through a proof originally covered on [Ryan Adam's blog](https://lips.cs.princeton.edu/the-gumbel-max-trick-for-discrete-distributions/) in 2013. I'm writing this for two reasons:

1. Since he migrated his blog to Princeton, the latex no longer renders; making his original post hard to grok at first glance.
2. I needed more explicit intermediate steps than he provided, and I thought others may need the same.

With that out of the way, let's dive in.

## Claim

$\operatorname*{argmax} x_k + Gumbel(0, 1) =  \frac{x_k}{\sum^{K}_{k'=1}x_{k'}} = \operatorname*{softmax}x_k $

## Proof

Let $G(\mu, \beta)$ be draws from a normal gumbel distribution (location $\mu$, scale $\beta$). By definition, $PDF(G(x | \mu, \beta)) = \frac{1}{\beta}e^{-\frac{(x-\mu)}{\beta} - e^{-\frac{(x - \mu)}\beta}}$ and $CDF(G(x|\mu, \beta)) = e^{-e^{-(x-\mu)/\beta}}$ by definition. Then, 

$x_k + G(0, 1) = G(x_k, 1)$ by ?? (location param)

Let $G(x_k, 1) = z_k, \forall k \in K$.  Then,

P(k \text{ is largest}|\{x_{k'}\}^K_{k'=1})

P(z_k \text{ is largest} | z_k, \{x_{k'}\}^K_{k'=1}) = \prod_{k' \neq k} e^{-e^{-(z_k - x_{k'})}}$ by the gumbel CDF and

$$ 
$$
\begin{equation}
   \begin{split}
       \operatorname*{argmax}G(x_k, 1) &= P(k \text{ is largest}|\{x_{k'}\}^K_{k'=1})  \\
    &= PDF(G(x_k, 1)) \cdot P(z_k \text{ is largest}| z_k, \{x_{k'}\}^K_{k'=1})
  \end{split}
\end{equation}
$$

