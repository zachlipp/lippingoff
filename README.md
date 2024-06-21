# Lipping Off

Code for my personal blog, written largely in markdown and generated with [hugo](https://gohugo.io/).

## Serving locally

The site and presentations can be viewed locally with `hugo serve`. By default, this serves the site at `localhost:1313`.

## Deploying

I went with Netlify over GitHub Actions for deploying the site. At the time I started this, GitHub Actions did not have a free tier and I did not want to pay for them out of the gate.

## Slides

I use the [reveal-hugo](https://reveal-hugo.dzello.com) plugin to render some markdowns to reveal.js slides. That is, if a markdown file indicates
```yaml
outputs: Reveal
```
in the top level comment, it displays as a presentation instead of a blog post. `reveal-hugo` has a ton of powerful features, so if any of the syntax I use seems confusing, consult the `reveal-hugo` website for a general tutorial.
