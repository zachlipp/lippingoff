# Upgrading Quarto

`_quarto/slides/_partials/title-metadata.html` is a copy of Quarto's stock partial with a `recording_url` block added. After upgrading Quarto, re-copy it and re-add the block.

```sh
cp "$(dirname "$(readlink -f "$(which quarto)")")/../share/formats/html/templates/title-metadata.html" _quarto/slides/_partials/title-metadata.html
```

Paste this above `$if(date-modified)$`:

```html
  $if(recording_url)$
  <div>
    <div class="quarto-title-meta-heading">Recording</div>
    <div class="quarto-title-meta-contents">
      <p class="recording"><a href="$recording_url$">$recording_host$</a></p>
    </div>
  </div>
  $endif$
```
