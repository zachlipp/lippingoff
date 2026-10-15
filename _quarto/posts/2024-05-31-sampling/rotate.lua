-- Port of the Hugo `rotate` shortcode: wraps a .rotate-holder div's content in the portrait overlay.
function Div(el)
  if not el.classes:includes("rotate-holder") then
    return nil
  end
  el.content:insert(1, pandoc.RawBlock("html", [[
<div class="rotate"></div>
<img class="rotate-icon" src="rotate-smartphone.png">
<p class="instructions rotate">Please rotate your phone to view this app</p>]]))
  el.content:insert(pandoc.RawBlock("html", [[
<a class="rotate license" href="https://www.flaticon.com/free-icons/mobile-phone" title="mobile phone icons">Mobile phone icons created by Freepik - Flaticon</a>]]))
  return el
end
