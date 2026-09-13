$D = Split-Path -Parent $MyInvocation.MyCommand.Path
$S = (Split-Path -Parent (Split-Path -Parent $D)) + "\tile-spec"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$u = "file:///" + ($D -replace '\\','/')
$tileD = "M27.06 23H228.94C247.74 23 252.94 28.2 252.94 47V208.93C252.94 227.73 247.74 232.93 228.94 232.93H27.06C8.26 232.93 3.06 227.73 3.06 208.93V47C3.06 28.2 8.26 23 27.06 23Z"

# ---------- A: classic, spec tile + 0.9 bubbles ----------
$a = [IO.File]::ReadAllText("$D\sq-090.svg")
$tileDefs = @"
 <path id="tile" d="$tileD"/>
 <clipPath id="tileClip"><use href="#tile"/></clipPath>
 <linearGradient id="tileFill" x1="0" y1="23" x2="0" y2="233" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F2F2F2"/></linearGradient>
 <linearGradient id="tileRim" x1="0" y1="23" x2="0" y2="233" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#C6C6C6"/><stop offset="0.2" stop-color="#CFCFCF"/><stop offset="0.85" stop-color="#DADADA"/><stop offset="1" stop-color="#D0D0D0"/></linearGradient>
"@
$tileBody = @"
<use href="#tile" fill="url(#tileFill)"/>
<g clip-path="url(#tileClip)" fill="none">
 <use href="#tile" stroke="#000" stroke-opacity="0.05" stroke-width="5"/>
 <use href="#tile" stroke="#000" stroke-opacity="0.07" stroke-width="4" transform="translate(0 -1.5)"/>
 <use href="#tile" stroke="#FFFFFF" stroke-width="2" transform="translate(0 1)"/>
 <use href="#tile" stroke="url(#tileRim)" stroke-width="2"/>
</g>
"@
# drop the old tile gradients/filter and old tile group
$a = [regex]::Replace($a, ' <linearGradient id="tile".*?</linearGradient>\r?\n', '')
$a = [regex]::Replace($a, ' <linearGradient id="tileEdge".*?</linearGradient>\r?\n', '')
$a = [regex]::Replace($a, ' <filter id="drop".*?</filter>\r?\n', '')
$a = $a.Replace("<defs>", "<defs>`n" + $tileDefs.TrimEnd())
$a = [regex]::Replace($a, '(?s)<g filter="url\(#drop\)">.*?</g>\r?\n', $tileBody)
# bubbles: centre group on tile centre (127.97); shadow dy4 -> nudge up 0.5
[IO.File]::WriteAllText("$D\final-classic.svg", $a)

# ---------- B: default, green bubble = spec outline + tail ----------
# tail inserted into bottom edge (right->left): leaves body at x=104, tip at (34,251), rejoins at x=62
$bubD = "M27.06 23H228.94C247.74 23 252.94 28.2 252.94 47V208.93C252.94 227.73 247.74 232.93 228.94 232.93H104C88 240 60 249 34 251.5C47 244 56 238.5 62 232.93H27.06C8.26 232.93 3.06 227.73 3.06 208.93V47C3.06 28.2 8.26 23 27.06 23Z"
$b = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
<defs>
 <path id="bub" d="$bubD"/>
 <clipPath id="bubClip"><use href="#bub"/></clipPath>
 <linearGradient id="fill" x1="0" y1="23" x2="0" y2="252" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7EE352"/><stop offset="0.5" stop-color="#3DC92C"/><stop offset="1" stop-color="#1FA41B"/></linearGradient>
 <linearGradient id="rim" x1="0" y1="23" x2="0" y2="252" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3E9E2B"/><stop offset="0.2" stop-color="#2F9A22"/><stop offset="0.85" stop-color="#1B8416"/><stop offset="1" stop-color="#16750F"/></linearGradient>
 <linearGradient id="gloss" x1="0" y1="23" x2="0" y2="112" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.45"/><stop offset="1" stop-color="#fff" stop-opacity="0.02"/></linearGradient>
 <radialGradient id="dotG" cx="0.5" cy="0.25" r="0.8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dcefd5"/></radialGradient>
 <filter id="dot" x="-40%" y="-40%" width="180%" height="190%"><feFlood flood-color="#0b5a08"/><feComposite operator="in" in2="SourceAlpha"/><feGaussianBlur stdDeviation="2.5"/><feOffset dy="3"/><feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<use href="#bub" fill="url(#fill)"/>
<g clip-path="url(#bubClip)">
 <path d="M3 23H253V100C180 86 76 86 3 100Z" fill="url(#gloss)"/>
 <g fill="none">
  <use href="#bub" stroke="#000" stroke-opacity="0.06" stroke-width="5"/>
  <use href="#bub" stroke="#000" stroke-opacity="0.09" stroke-width="4" transform="translate(0 -1.5)"/>
  <use href="#bub" stroke="#C9F7AE" stroke-opacity="0.85" stroke-width="2" transform="translate(0 1)"/>
  <use href="#bub" stroke="url(#rim)" stroke-width="2"/>
 </g>
 <g filter="url(#dot)" fill="url(#dotG)"><circle cx="92" cy="125" r="20"/><circle cx="164" cy="125" r="20"/></g>
 <g fill="#fff" opacity="0.7"><ellipse cx="88" cy="116" rx="8" ry="4.5"/><ellipse cx="160" cy="116" rx="8" ry="4.5"/></g>
</g>
</svg>
"@
[IO.File]::WriteAllText("$D\final-default.svg", $b)

foreach ($n in 'final-classic','final-default') {
  & "$S\verify.ps1" -Target "$D\$n.svg" -Png "$D\$n.png"
}
$cells = ''
foreach ($n in 'final-default','final-classic') { $cells += "<img src='$n.png' width='256' style='margin:6px'><img src='$n.png' width='48' style='margin:6px'><img src='$n.png' width='48' style='margin:6px;background:#333'>" }
[IO.File]::WriteAllText("$D\final-sheet.html", "<html><body style='margin:0;background:#dfe2e6'>$cells</body></html>")
& $chrome --headless=new --disable-gpu --hide-scrollbars --window-size=760,280 "--screenshot=$D\final-sheet.png" "$u/final-sheet.html" 2>$null | Out-Null
Add-Type -AssemblyName System.Drawing
foreach ($n in 'final-classic','final-default') { $bm=[System.Drawing.Bitmap]::FromFile("$D\$n.png"); "$n $($bm.Width)x$($bm.Height) a(0,0)=$($bm.GetPixel(0,0).A) a(128,10)=$($bm.GetPixel(128,10).A) a(128,245)=$($bm.GetPixel(128,245).A) a(36,250)=$($bm.GetPixel(36,250).A)"; $bm.Dispose() }
