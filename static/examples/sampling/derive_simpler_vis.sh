# !/bin/bash
#
# Given the "complete" sketch.js (sampling_3), add comments to derive simpler versions. This gaurantees consistency and saves my poor little fingers some keystrokes...probably.

# 2: Top-K
## JS
cat 3/sketch.js | \
  # //top_p_input -> top_p... (remove comment)
  sed 's|\/\/top_p_input.hide|top_p_input.hide|g' | \
  # delete line
  sed '/Top P/d' > \
  2/sketch.js

## CSS + HTML
cp 3/index.html 3/style.css 2/

# 1: Temperature (cue Sean Paul)
## JS
cat 2/sketch.js | \
  # remove comment on "hide"
  sed 's|\/\/top_k_input.hide|top_k_input.hide|g' | \
  # delete line
  sed '/Top K/d' > \
    1/sketch.js
## CSS + HTML
cp 2/index.html 2/style.css 1/

# 0: Just sampling
## JS
cat 1/sketch.js | \
  # remove comment on "hide"
  sed 's|\/\/temperature_slider.hide|temperature_slider.hide|g' | \
  # delete line
  sed '/Temperature (t)/d' > \
    0/sketch.js
## CSS + HTML
cp 1/index.html 1/style.css 0/
