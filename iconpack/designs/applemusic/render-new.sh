#!/bin/sh
D="C:/Users/zyc9/AppData/Local/Temp/claude/D--Others-Github-smartisan-icon/96ad576b-019e-4b24-9b2c-0b5b12824130/scratchpad/designs/applemusic"
C="/c/Program Files/Google/Chrome/Application/chrome.exe"
N="file:///D:/Others-Github/smartisan_icon/iconpack/png/com.netease.cloudmusic.png"
for o in A B C; do
  printf '<html><body style="margin:0;background:transparent"><img src="new-%s.svg" width="256" height="256" style="display:block"></body></html>' "$o" > "$D/_n$o.html"
  "$C" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=256,256 --screenshot="$D/new-$o.png" "file:///$D/_n$o.html" 2>/dev/null
done
row() { printf '<div style="display:flex;gap:14px;padding:10px;align-items:center;background:%s"><img src="%s" width="110"><img src="new-A.png" width="110"><img src="new-B.png" width="110"><img src="new-C.png" width="110"><img src="%s" width="48"><img src="new-A.png" width="48"><img src="new-B.png" width="48"><img src="new-C.png" width="48"></div>' "$1" "$N" "$N"; }
printf '<html><body style="margin:0">%s%s</body></html>' "$(row '#3a3f47')" "$(row '#eeeeee')" > "$D/_sheet-new.html"
"$C" --headless=new --disable-gpu --hide-scrollbars --window-size=720,270 --screenshot="$D/_sheet-new.png" "file:///$D/_sheet-new.html" 2>/dev/null
echo done
