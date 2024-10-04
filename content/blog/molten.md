---
title: 'Comment-delimited Jupyter cells in neovim'
author: Zach
date: 2024-10-04T00:00:00
slug: molten
---

## Introduction
I spent a few minutes last night trying to run a Jupyter notebook in a free-tier Google Colab account. It was a rude reminder of why I paid for a better tier in the past. As these things tend to go, I decided I'd rather spend an order of magnitude more time coming up with a local alternative than resubscribe.

I have appreciated VSCode's ability to execute Python files as if they are Jupyter notebooks - that is, based on a comment delimiter, executing virtual Jupyter cells within a valid Python script. For example:

```python
# I am a valid Python script!
# ---
print("I am a Jupyter cell! I can execute in whatever order I want")
# ---
print(f"I am another Jupyter cell! This is {mood}")
# ---
mood = "great"
# ---
```

This feels to me like the best of both worlds: The adaptability of notebooks without sacrificing simple version control. Because I'm ~~a stubborn old dog that doesn't want to learn new tricks~~ ***privacy-conscious***, I wanted a tool like this within neovim. I got the [`molten.nvim`](https://github.com/benlubas/molten-nvim) package to support this sort of flow after some tinkering. Here's a demo ([view a larger version with syntax highlighting here](https://asciinema.org/a/XQY1dNkzL9RyUWP5mf5uy4vgf)):

<img src="/post/molten/demo.gif" style="max-width: 100%; max-height: 100%">

## Usage
With `\mi`, I start a Jupyter kernel, and with `\m` I run a cell. Moving the cursor out of the cell hides the displayed output, and moving the cursor back into a cell displays it again. If you'd like to try it for yourself, I've made a minimal implementation [here](https://gist.github.com/zachlipp/da4a94237c3b61622510026b9bb0ba72) and provided some instructions for setting up the environment.

## How it works
The key functionality for this already exists in `molten.nvim` in the command `:MoltenEvaluateRange`. The rest of this work comes in two parts: Verifying `molten.nvim` can work and then calculating the values for `:MoltenEvaluateRange`.

### What do you mean *can* work?
Before we can run Jupyter, we need a virtual environment. Operating systems are rolling out [PEP 668](https://peps.python.org/pep-0668/) support by default, which prohibits users from installing Python packages at the system level. (Some containers are even starting to enforce this, see [here](https://github.com/joachimbbp/openvdb_docker/pull/1) for more details). There are a lot of ways to create virtual environments - I'm using `uv venv` for now, but this approach is adaptable to whatever method you prefer. Once you have a virtual environment set up, you'll also need to install `molten.nvim`'s Python dependencies: `pynvim`, `jupyter_client`, and (to make new kernels) `ipykernel`.

Second, we need a Jupyter kernel...sort of. Because we install these three packages, we get to do something cool. Usually `molten.nvim` prompts users to select a Jupyter kernel by hand. ***Boring!*** Instead, we can create and use the kernel on the fly based on the user's virtual environment. Refreshingly true to its name, the kernel is indeed quite small. Each kernel is just a small text file pointing to other programs. We can view the location of our kernels with `jupter kernelspec list`, and, without loss of generality, see how one is constructed:
```json {hl_lines=["3"],linenostart=1,linenos=inline}
{
 "argv": [
  "/Users/zlipp/git/molten-demo/.venv/bin/python3",
  "-Xfrozen_modules=off",
  "-m",
  "ipykernel_launcher",
  "-f",
  "{connection_file}"
 ],
 "display_name": "molten-demo",
 "language": "python",
 "metadata": {
  "debugger": true
 }
}
```

Notice that third line: The kernel is running code from the virtual environment we created for this project. That's all there is to it! Given a virtual environment with the minimal dependencies installed, we can start executing code in asynchronous chunks, still get all the benefits of version control, and save a few bucks along the way.

### About the Lua

As I mentioned, I wrote [some Lua](https://gist.github.com/zachlipp/da4a94237c3b61622510026b9bb0ba72#file-init-lua) to figure out which lines to send to `:MoltenEvaluateRange`. I'm pretty proud of the quick-failing error handling and how the cells break on comments; that is, the comment delimiters aren't considered to be parts of cells themselves.

One more thing I'll note here: I started writing this script using ChatGPT, winding up with something close to useful after a few iterations. That said, you are not seeing that code now. Without exaggeration, I have rewritten **every** line it generated. This is the first time I have ever written Lua.

I'm skeptical of the claim that coding alongside LLMs is especially transformative; this feels exactly like copying and pasting from StackOverflow.

## Next steps
In the medium term, I'd like neovim to fully set up environments in new directories; but I hit enough bumps trying to code it now that I'm going to wait on it. Eventually I'd like to support containerized and remote kernels, too. That said, this is my first ever Lua script! I'm impressed. Now that I've written it and plenty about it, I can get back to writing PyTorch...the Python framework deep learning engineers wrote to avoid writing Lua. Oy.
