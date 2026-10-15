local qrencode = dofile(pandoc.path.join({ pandoc.path.directory(PANDOC_SCRIPT_FILE), "qrencode.lua" }))

local QUIET = 4

local function svg(matrix)
  local n = #matrix
  local size = n + 2 * QUIET
  local rects = {}
  for x = 1, n do
    for y = 1, n do
      if matrix[x][y] > 0 then
        rects[#rects + 1] = string.format("M%d %dh1v1h-1z", x - 1 + QUIET, y - 1 + QUIET)
      end
    end
  end
  return string.format(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" shape-rendering="crispEdges">'
      .. '<rect width="100%%" height="100%%" fill="#fff"/><path fill="#000" d="%s"/></svg>',
    size, size, table.concat(rects)
  )
end

local function site_url()
  local f = io.open(pandoc.path.join({ quarto.project.directory, "_quarto.yaml" }), "r")
  if not f then return nil end
  local meta = pandoc.read("---\n" .. f:read("a") .. "\n---\n", "markdown").meta
  f:close()
  return meta.website and meta.website["site-url"]
end

local function deck_url()
  local site = site_url()
  if not site then return nil end
  site = pandoc.utils.stringify(site):gsub("/+$", "")
  local rel = pandoc.path.make_relative(quarto.doc.input_file, quarto.project.directory)
  rel = rel:gsub("\\", "/"):gsub("%.%w+$", ".html")
  return site .. "/" .. rel
end

function Meta(meta)
  if not quarto.doc.is_format("revealjs") then return end
  local url = deck_url()
  if not url then
    quarto.log.warning("qr.lua: no website.site-url; skipping QR code")
    return
  end
  local ok, matrix = qrencode.qrcode(url)
  if not ok then
    quarto.log.warning("qr.lua: " .. tostring(matrix))
    return
  end
  quarto.doc.include_text("in-header", [[
<style>
.deck-qr { position: fixed; right: 12px; bottom: 12px; width: 96px; height: 96px; z-index: 30; }
.deck-qr svg { display: block; width: 100%; height: 100%; }
</style>]])
  quarto.doc.include_text("after-body", string.format(
    '<a class="deck-qr" href="%s" title="%s">%s</a>', url, url, svg(matrix)
  ))
end
