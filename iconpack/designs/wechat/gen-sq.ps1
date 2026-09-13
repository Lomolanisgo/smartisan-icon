$D = Split-Path -Parent $MyInvocation.MyCommand.Path
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$u = "file:///" + ($D -replace '\\','/')
$inv = [Globalization.CultureInfo]::InvariantCulture
function F($v) { ([math]::Round($v,2)).ToString($inv) }

foreach ($s in 1.0, 0.9, 0.8, 0.7) {
  $c0 = 130; $cy = 127.5
  $Y = { param($v) F ($cy + ($v - $c0) * $s) }
  $ts = [math]::Sqrt($s)
  $T = { param($anchor,$v) F ($cy + ($anchor - $c0) * $s + ($v - $anchor) * $ts) }
  $name = "sq-{0:000}" -f [int]($s*100)

  $green = "M104 $(&$Y 50) C142 $(&$Y 50) 170 $(&$Y 75) 170 $(&$Y 107) C170 $(&$Y 139) 142 $(&$Y 164) 104 $(&$Y 164) C95 $(&$Y 164) 87 $(&$Y 163) 79 $(&$Y 160) L53 $(&$T 157 174) L59 $(&$Y 150) C45 $(&$Y 140) 38 $(&$Y 124) 38 $(&$Y 107) C38 $(&$Y 75) 66 $(&$Y 50) 104 $(&$Y 50) Z"
  $gGloss = "M104 $(F ((&$Y 50) -as [double]) ) Z" # placeholder replaced below
  $top = [double](&$Y 50)
  $gGloss = "M104 $(F ($top+4)) C139 $(F ($top+4)) 164 $(&$Y 75) 164 $(&$Y 98) C140 $(&$Y 88) 70 $(&$Y 88) 44 $(&$Y 98) C46 $(&$Y 74) 70 $(F ($top+4)) 104 $(F ($top+4)) Z"
  $white = "M158 $(&$Y 102) C192 $(&$Y 102) 216 $(&$Y 124) 216 $(&$Y 152) C216 $(&$Y 167) 209 $(&$Y 180) 197 $(&$Y 189) L202 $(&$T 194 210) L180 $(&$Y 198) C173 $(&$Y 200) 166 $(&$Y 202) 158 $(&$Y 202) C124 $(&$Y 202) 100 $(&$Y 180) 100 $(&$Y 152) C100 $(&$Y 124) 124 $(&$Y 102) 158 $(&$Y 102) Z"
  $wtop = [double](&$Y 102)
  $wGloss = "M158 $(F ($wtop+4)) C186 $(F ($wtop+4)) 208 $(&$Y 122) 211 $(&$Y 142) C190 $(&$Y 134) 126 $(&$Y 134) 105 $(&$Y 142) C109 $(&$Y 122) 130 $(F ($wtop+4)) 158 $(F ($wtop+4)) Z"
  $r1 = 9; $r2 = 8
  if ($s -lt 0.75) { $r1 = 8.5; $r2 = 7.5 }

  $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
<defs>
 <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6e7e9"/></linearGradient>
 <linearGradient id="tileEdge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4d6d9"/><stop offset="1" stop-color="#b9bcc0"/></linearGradient>
 <filter id="drop" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur in="SourceAlpha" stdDeviation="3"/><feOffset dy="3"/><feComponentTransfer><feFuncA type="linear" slope="0.35"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="bub" x="-30%" y="-40%" width="160%" height="190%"><feGaussianBlur in="SourceAlpha" stdDeviation="3.5"/><feOffset dy="4"/><feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <linearGradient id="green" gradientUnits="userSpaceOnUse" x1="0" y1="$(&$Y 50)" x2="0" y2="$(&$Y 175)"><stop offset="0" stop-color="#8ee85a"/><stop offset="0.55" stop-color="#3fcb2e"/><stop offset="1" stop-color="#1fae1c"/></linearGradient>
 <linearGradient id="white" gradientUnits="userSpaceOnUse" x1="0" y1="$(&$Y 100)" x2="0" y2="$(&$Y 212)"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dcdfe2"/></linearGradient>
 <radialGradient id="eyeG" cx="0.5" cy="0.35" r="0.6"><stop offset="0" stop-color="#1c6e12"/><stop offset="1" stop-color="#0f5009"/></radialGradient>
 <radialGradient id="eyeW" cx="0.5" cy="0.35" r="0.6"><stop offset="0" stop-color="#6f7479"/><stop offset="1" stop-color="#4a4f54"/></radialGradient>
 <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<g filter="url(#drop)">
 <rect x="6" y="24" width="244" height="208" rx="26" fill="url(#tileEdge)"/>
 <rect x="7" y="25" width="242" height="206" rx="25" fill="url(#tile)"/>
 <rect x="8.5" y="26.5" width="239" height="203" rx="24" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.9"/>
</g>
<g filter="url(#bub)">
 <path d="$green" fill="url(#green)" stroke="#23a31c" stroke-width="1.2" stroke-linejoin="round"/>
 <path d="$gGloss" fill="url(#gloss)"/>
 <circle cx="84" cy="$(&$Y 96)" r="$r1" fill="url(#eyeG)"/><circle cx="124" cy="$(&$Y 96)" r="$r1" fill="url(#eyeG)"/>
</g>
<g filter="url(#bub)">
 <path d="$white" fill="url(#white)" stroke="#c7cacd" stroke-width="1.2" stroke-linejoin="round"/>
 <path d="$wGloss" fill="url(#gloss)" opacity="0.9"/>
 <circle cx="141" cy="$(&$Y 143)" r="$r2" fill="url(#eyeW)"/><circle cx="175" cy="$(&$Y 143)" r="$r2" fill="url(#eyeW)"/>
</g>
</svg>
"@
  [IO.File]::WriteAllText("$D\$name.svg", $svg)
  [IO.File]::WriteAllText("$D\r-$name.html", "<html><body style='margin:0;background:transparent'><img src='$name.svg' width='256' height='256' style='display:block'></body></html>")
  & $chrome --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=256,256 "--screenshot=$D\$name.png" "$u/r-$name.html" 2>$null | Out-Null
}
$cells = ''
foreach ($n in 'sq-100','sq-090','sq-080','sq-070') {
  $cells += "<div style='display:inline-block;text-align:center;margin:6px;font:12px sans-serif;color:#333'><img src='$n.png' width='256' height='256' style='display:block'><img src='$n.png' width='48' height='48' style='display:block;margin:6px auto'>$($n.Substring(3,1)).$($n.Substring(4,1))</div>"
}
[IO.File]::WriteAllText("$D\sheet.html", "<html><body style='margin:0;background:#dfe2e6;white-space:nowrap'>$cells</body></html>")
& $chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1100,340 "--screenshot=$D\sq-sheet.png" "$u/sheet.html" 2>$null | Out-Null
"done"
