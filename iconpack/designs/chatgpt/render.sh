#!/bin/bash
# usage: render.sh file.svg [size] ...   renders to file.png at 256 (or given size via html wrapper)
cd "$(dirname "$0")"
W=$(cygpath -m "$PWD")
for f in "$@"; do
  n=${f%.*}
  if [[ $f == *.svg ]]; then
    printf '<html><body style="margin:0;background:transparent"><img src="%s" width="256" height="256" style="display:block"></body></html>' "$f" > "_$n.html"
    src="_$n.html"; size="256,256"
  else
    src="$f"; size="${SIZE:-256,256}"
  fi
  timeout 60 "/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=$size --screenshot="$W/$n.png" "file:///$W/$src" >/dev/null 2>&1
done
