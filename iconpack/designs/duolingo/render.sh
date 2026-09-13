#!/bin/sh
D="C:/Users/zyc9/AppData/Local/Temp/claude/D--Others-Github-smartisan-icon/96ad576b-019e-4b24-9b2c-0b5b12824130/scratchpad/designs/duolingo"
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
for o in A B C; do
  printf '<html><body style="margin:0;background:transparent"><img src="opt-%s.svg" width="256" height="256" style="display:block"></body></html>' "$o" > "$D/wrap-$o.html"
  "$CH" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=256,256 --screenshot="$D/opt-$o.png" "file:///$D/wrap-$o.html" 2>/dev/null
done
# preview sheet: each at 256 on grey + small sizes
cat > "$D/preview.html" <<EOF
<html><body style="margin:0;background:#8a8a8a;width:900px;height:420px">
<div style="display:flex;gap:10px;padding:10px">
<img src="opt-A.png"><img src="opt-B.png"><img src="opt-C.png"></div>
<div style="display:flex;gap:40px;padding:10px 10px 0 10px;align-items:end;background:#fff">
<img src="opt-A.png" width="96"><img src="opt-B.png" width="96"><img src="opt-C.png" width="96">
<img src="opt-A.png" width="48"><img src="opt-B.png" width="48"><img src="opt-C.png" width="48"><img src="file:///D:/Others-Github/smartisan_icon/iconpack/overrides/icons/com.bilibili.app.in.png" width="96"></div>
</body></html>
EOF
"$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=900,420 --screenshot="$D/preview.png" "file:///$D/preview.html" 2>/dev/null
