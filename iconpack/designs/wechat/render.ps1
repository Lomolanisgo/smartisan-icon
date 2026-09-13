$D = Split-Path -Parent $MyInvocation.MyCommand.Path
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$u = "file:///" + ($D -replace '\\','/')
foreach ($o in 'A','B','C') {
  Set-Content -Encoding utf8 "$D\r-$o.html" "<html><body style='margin:0;background:transparent'><img src='opt-$o.svg' width='256' height='256' style='display:block'></body></html>"
  & $chrome --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=256,256 "--screenshot=$D\opt-$o.png" "$u/r-$o.html" 2>$null | Out-Null
}
Set-Content -Encoding utf8 "$D\small.html" "<html><body style='margin:0;background:#9aa0a6'><div style='padding:8px'><img src='opt-A.png' width='64'> <img src='opt-B.png' width='64'> <img src='opt-C.png' width='64'></div><div style='padding:8px;background:#fff'><img src='opt-A.png' width='64'> <img src='opt-B.png' width='64'> <img src='opt-C.png' width='64'></div></body></html>"
& $chrome --headless=new --disable-gpu --hide-scrollbars --window-size=240,170 "--screenshot=$D\small-check.png" "$u/small.html" 2>$null | Out-Null
Add-Type -AssemblyName System.Drawing
foreach ($o in 'A','B','C') { $b=[System.Drawing.Bitmap]::FromFile("$D\opt-$o.png"); "$o $($b.Width)x$($b.Height) corner=$($b.GetPixel(0,0))"; $b.Dispose() }
