lint-css:
    #!/usr/bin/env bash
    set -euo pipefail
    [ -d _site ] || { echo "_site missing; run quarto render" >&2; exit 1; }
    find _quarto -name '*.css' -not -path '_quarto/.quarto/*' | while read -r f; do
        echo "== $f"
        npx -y purgecss --css "$f" --content '_site/**/*.html' '_site/**/*.js' --rejected | jq -r '.[].rejected[]'
    done
