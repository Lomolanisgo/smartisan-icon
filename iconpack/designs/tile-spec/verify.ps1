param([string]$Target = "$PSScriptRoot\tile.svg", [string]$Png = "$PSScriptRoot\tile.png")
Add-Type -AssemblyName System.Drawing
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$uri = 'file:///' + $Target.Replace([char]92, [char]47)
Start-Process $chrome -ArgumentList @('--headless=new','--disable-gpu','--hide-scrollbars','--default-background-color=00000000','--window-size=256,256',"--screenshot=$Png",$uri) -Wait -WindowStyle Hidden

function Edges($path) {
  $bm = [System.Drawing.Bitmap]::FromFile($path)
  $rows = @{}
  for ($y = 0; $y -lt 256; $y++) {
    $l = 0.0; $r = 0.0
    for ($x = 0; $x -lt 128; $x++) { $l += $bm.GetPixel($x, $y).A / 255.0 }
    for ($x = 128; $x -lt 256; $x++) { $r += $bm.GetPixel($x, $y).A / 255.0 }
    $rows[$y] = @((128 - $l), (128 + $r))
  }
  $t = 0.0; $bt = 0.0
  for ($y = 0; $y -lt 128; $y++) { $t += $bm.GetPixel(128, $y).A / 255.0 }
  for ($y = 128; $y -lt 256; $y++) { $bt += $bm.GetPixel(128, $y).A / 255.0 }
  $bm.Dispose()
  return @{ rows = $rows; top = 128 - $t; bottom = 128 + $bt }
}
$ref = Edges "D:\Others-Github\smartisan_icon\iconpack\overrides\icons\com.bilibili.app.in.png"
$me = Edges $Png
$err = 0.0; $k = 0; $max = 0.0; $maxY = -1
for ($y = 23; $y -le 232; $y++) {
  for ($i = 0; $i -lt 2; $i++) {
    $d = [math]::Abs($ref.rows[$y][$i] - $me.rows[$y][$i]); $err += $d * $d; $k++
    if ($d -gt $max) { $max = $d; $maxY = $y }
  }
}
"{0}: row-edge rms={1:N3}px max={2:N3}px (row {3}); top ref/me {4:N2}/{5:N2}; bottom ref/me {6:N2}/{7:N2}" -f (Split-Path -Leaf $Png), [math]::Sqrt($err / $k), $max, $maxY, $ref.top, $me.top, $ref.bottom, $me.bottom
# Per-row corner detail (top-left)
"corner rows y:ref/me " + ((23..44 | ForEach-Object { "{0}:{1:N2}/{2:N2}" -f $_, $ref.rows[$_][0], $me.rows[$_][0] }) -join ' ')
