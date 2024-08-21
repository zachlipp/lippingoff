---
title: 'A minimal nonsense guide to using highlight.js with Anki'
author: Zach
date: 2024-08-20T00:00:00
slug: highlight-js-anki
---

I've been using the flashcard program Anki religiously to study programming concepts. It's been even less exciting than it sounds because I haven't had syntax highlighting; all my code has looked like this:

![leetcode hard png](/post/anki-syntax-highlighting/leetcode_hard.png)

After a few fits and starts, I figured out a way to highlight code blocks that doesn't rely on Anki's add-on system, which isn't supported by its mobile apps. This post is more synthesis than genesis - I found a lot of useful information online, but nothing that put everything together. Here's my attempt to do so.

## Configuring Anki to use `highlight.js`
- Download [highlight.js](https://highlightjs.org/). You'll likely only need `highlight.min.js` and the themes you want to use (as a tall, pale dude from the Midwest, I'm all-in on `nord.css`). See the documentation to verify your target language is supported.
- You'll need to add `highlight.min.js` and your css file to your Anki installation's `collection.media` directory. On Mac, this is located at `~/Library/Application Support/Anki2/User 1/collection.media`. `User 1` here is my Anki username and the default username in Anki; this will change if you have updated your username in Anki. By default, Anki will consider these files unused media if a user uses `Tools > Check Media`, and it will therefore suggest we remove them. We can prevent this by prefixing the files with an underscore. I suggest renaming them to `_highlight.min.js` and `_nord.css` (or the like).
- Create a new file in the `collection.media` named something like `_my_highlight.js`. This file should include the following:
```js
document.querySelectorAll('pre code').forEach((block) => {
    // Replace HTML <br> with newline characters
    // https://stackoverflow.com/a/37815205/4738478
    block.innerHTML = block.innerHTML.replace(/<br\s*\/?>/gi,'\n');
    // Use highlight.js
    hljs.highlightElement(block);
});
```
- Open the Anki card template where you want to enable syntax highlighting (I get there with `Browse -> Cards`. Edit the card to include the following:
```
<link rel="stylesheet" href="_nord.css">
<script>
    if (typeof hljs === "undefined") {
        var script = document.createElement('script');
        script.src = "_highlight.min.js";
        script.async = false;
        document.head.appendChild(script);
    }

    var script = document.createElement('script');
    script.src = '_my_highlight.js';
    script.async = false;
    document.head.appendChild(script);
    document.head.removeChild(script);
</script>

<pre>
<code>
{{MyCodeField}}
</code>
</pre>
```
Where `{{MyCodeField}}` is the name of the code field on your card. (Mine is `{{Solution}}`).

You should now see your rendered code in your card preview.

![leetcode_medium dot png](/post/anki-syntax-highlighting/leetcode_medium.png)

- Close your Anki app to sync your changes.

Congrats, that's it! This gives you:
- Syntax highlighting in whatever theme you want
- Automatic language discovery through `highlight.js`. (Languages can be set manually with `class="code-python">` if you prefer)
- Mac, web, and iOS support, at least (if any Android Anki-ers (Ankis? Ank-ers?) read this, I'd love to see if it works for you, too)
- Offline availability. You have to love some local JavaScript.
- Your data preserved. You don't have to modify your card data to use this highlighting (unlike some add-ons). Remove this code, and your card is just as it was before.

## Useful links
- [Loading highlight JS with Anki](https://www.reddit.com/r/Anki/comments/bk82ov/comment/emf8q6c/) Note: This comment is almost everything I needed, but I had to replace the `<br>` tags in my code with newlines and you may have to, too.
- [Loading external JS with Anki](https://forums.ankiweb.net/t/how-to-include-external-files-in-your-template-js-css-etc-guide)
- [Anki add-ons not supported on mobile](https://ankiweb.net/shared/info/1415523481)
- [Running the Anki QT app with logs](https://addon-docs.ankiweb.net/console-output.html#console-output)
- [Anki + the DOM](https://forums.ankiweb.net/t/this-piece-of-javascript-does-not-seem-to-work-hint-button/9627/4)
