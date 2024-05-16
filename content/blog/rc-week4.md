---
title: Recurse Center Week 4
author: Zach
date: 2024-04-22
slug: rc-week-4
tags: ["unlisted"]
---


## Vibes of the week

I have missed my self-imposed deadline of writing these on Sundays by a few hours. I do not mind much.

This week marked the meat of the ARENA study group at RC: Transformers and an introduction to mechanistic interpretability. This also meant a philosophical shift for me. As I wrote in the RC chat:

> I didn't know what *mechanistic interpretability* was a month ago. I decided to do ARENA just for the pytorch experience. Now that we reached the mech interp work, I am questioning my motivations. Do I just want more jobs that look like jobs I used to have? Or do I instead want to pull on the research thread? Or maybe for a smaller question, do I want to work on a mech interp project during the rest of my batch? I don't know yet. I feel like prometheus just came down from olympus and handed me fire, and I don't want it because I'm so used to the dark (did the titans live up there too? I'm bad at geography)

This week, I'm pulling in more pairing sessions and Crafting Interpreters work. I'm excited to explore a bit.

## Firsts of the week

**Hugo filter written!** I decided to remove these weekly reflection posts from the `/blog` route of my website. I don't like the pressure I've been feeling around these. So for now, Real Zach Heads (and Zulip bots [;) can get them from the RSS feed.

Let's look at this filter more closely. I understood each blog post may have multiple tags, and that I wanted to exclude posts matching one tag. The pseudocode for that looks something like:

```
for post in posts:
  display = True
  for tag in post.tags:
    if tag == "hide-me":
      display = False
  if display:
    display(page)
```

The syntax I needed wound up being:

```
{{ range .Data.Pages.ByPublishDate.Reverse }}
{{ if not (in .Params.tags "hide-me" ) }}
...
{{ end }}
{{ end }}
```

if. not. PAREN. in. params dot tags. tag name. PAREN.

Yuck.

I tried a half dozen permutations before this solution, scouring Hugo forms for about 30 minutes. I gave up and asked ChatGPT and this was its first suggestion. ChatGPT excels at this. When I have an operation I want to do, but I don't know how the framework I'm using does it, it can come to my rescue. We'll see how well it does five years from now when the tools have changed and the internet is full of AI-generated cruft.

**Transformer built from scratch!** I understand attention now. Woohoo!

**Circuits investigated!** When my hand is held, I can find out what particular attention heads in shallow models are doing. It remains to be seen whether I'm ready to walk on my own two feet.

## Show and tell of the week

Just that rough Hugo filter for this week. I will put together something ARENA-y before long, though.

## Coolest thing I learned of the week

It's got to be *[A Mathematical Framework for Transfomer Circuits](https://transformer-circuits.pub/2021/framework/index.html)*. I want to read this like every week until it's written on my heart.

## Side quest of the week

My cousin Dani has been visiting! We've kept extremely busy (part of why I'm writing this late). It's been great to have a friendly face around and to have an excuse to get out and about more.

## Things I want to do better next week

I am so excited to have more time to pair program.

## Flowers of the week

I think I've got to give the shoutout to [Neal Nanda](https://www.neelnanda.io/) and [Callum McDougall](https://www.perfectlynormal.co.uk/) for the incredibly rich learning materials and tools they've built and shared for mechanistic interpretability.

## Quote of the week

n/a. I originally meant for this to be a bit where every week was just a quote from Nike's Chris Bennett. That fell apart after week 1, but the thought was still there. I even got for a short run with coach this weekend, but I didn't make a note of any of the script. I better run it again soon to refresh what I missed.
