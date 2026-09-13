D=/c/Users/zyc9/AppData/Local/Temp/claude/D--Others-Github-smartisan-icon/96ad576b-019e-4b24-9b2c-0b5b12824130/scratchpad/designs/edge
W=$(cygpath -m $D)
for f in "$@"; do
echo "<html><body style='margin:0;background:transparent'><img src='$f.svg' width=256 height=256 style='display:block'></body></html>" > $D/_$f.html
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=256,256 --screenshot="$W/$f.png" "file:///$W/_$f.html" 2>/dev/null
done
