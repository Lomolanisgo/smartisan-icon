#!/bin/sh
D="C:/Users/zyc9/AppData/Local/Temp/claude/D--Others-Github-smartisan-icon/96ad576b-019e-4b24-9b2c-0b5b12824130/scratchpad/designs/applemusic"
for o in A B C; do
  printf '<html><body style="margin:0;background:transparent"><img src="opt-%s.svg" width="256" height="256" style="display:block"></body></html>' "$o" > "$D/_w$o.html"
  "/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=256,256 --screenshot="$D/opt-$o.png" "file:///$D/_w$o.html" 2>/dev/null
done
printf '<html><body style="margin:0;background:#3a3f47">%s</body></html>' '<div style="display:flex;gap:14px;padding:10px;align-items:center"><img src="opt-A.png" width="96"><img src="opt-B.png" width="96"><img src="opt-C.png" width="96"><img src="opt-A.png" width="48"><img src="opt-B.png" width="48"><img src="opt-C.png" width="48"></div><div style="display:flex;gap:14px;padding:10px;background:#eee;align-items:center"><img src="opt-A.png" width="96"><img src="opt-B.png" width="96"><img src="opt-C.png" width="96"><img src="opt-A.png" width="48"><img src="opt-B.png" width="48"><img src="opt-C.png" width="48"></div>' > "$D/_sheet.html"
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --window-size=560,240 --screenshot="$D/_sheet.png" "file:///$D/_sheet.html" 2>/dev/null
ls -la "$D"
