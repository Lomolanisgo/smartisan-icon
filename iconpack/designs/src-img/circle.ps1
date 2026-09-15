# 把用户提供的图直接裁成圆形图标：256×256，圆直径 248（与其他圆形图标同规格）
Add-Type -AssemblyName System.Drawing
$D = Split-Path -Parent $MyInvocation.MyCommand.Path

function Save-Circle($src, $out, [double]$cx, [double]$cy, [double]$r, [string]$fill, [double]$scale = 1.0) {
  $img = [System.Drawing.Bitmap]::FromFile($src)
  $bm = New-Object System.Drawing.Bitmap 256, 256, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bm)
  $g.SmoothingMode = 'AntiAlias'; $g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddEllipse(4, 4, 248, 248)
  if ($fill) { $g.FillPath((New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($fill))), $path) }
  # 源图中 (cx,cy) 半径 r 的圆映射到目标圆；scale<1 时内容缩小、四周用底色补齐
  $k = 124.0 / $r * $scale
  $tb = New-Object System.Drawing.TextureBrush $img
  $tb.WrapMode = 'Clamp'
  $tb.TranslateTransform(128, 128)
  $tb.ScaleTransform($k, $k)
  $tb.TranslateTransform(-$cx, -$cy)
  $g.FillPath($tb, $path)
  $g.Dispose(); $bm.Save($out, [System.Drawing.Imaging.ImageFormat]::Png); $bm.Dispose(); $img.Dispose()
}

# 在源图里找红色圆的外接框
function Find-RedCircle($src) {
  $b = [System.Drawing.Bitmap]::FromFile($src)
  $x0 = $b.Width; $x1 = 0; $y0 = $b.Height; $y1 = 0
  for ($y = 0; $y -lt $b.Height; $y += 1) { for ($x = 0; $x -lt $b.Width; $x += 1) {
    $p = $b.GetPixel($x, $y)
    if ($p.R -gt 120 -and $p.G -lt 80 -and $p.B -lt 80) { if ($x -lt $x0) { $x0 = $x }; if ($x -gt $x1) { $x1 = $x }; if ($y -lt $y0) { $y0 = $y }; if ($y -gt $y1) { $y1 = $y } }
  } }
  $b.Dispose()
  $cx = ($x0 + $x1) / 2.0; $cy = ($y0 + $y1) / 2.0; $r = [Math]::Min($x1 - $x0, $y1 - $y0) / 2.0
  return @($cx, $cy, $r)
}

$t = Find-RedCircle "$D\t-hammer.png"
"t-hammer circle: cx=$($t[0]) cy=$($t[1]) r=$($t[2])"
# 半径内缩 3px，去掉 JPEG 白边
Save-Circle "$D\t-hammer.png" "$D\t-hammer-circle.png" $t[0] $t[1] ($t[2] - 3) $null

$u = [System.Drawing.Bitmap]::FromFile("$D\uber.png"); $uw = $u.Width; $uh = $u.Height; $u.Dispose()
# 黑底方图：字标贴近边缘，缩到 0.8 让字标完整落在圆内
Save-Circle "$D\uber.png" "$D\uber-circle.png" ($uw / 2.0) ($uh / 2.0) ([Math]::Min($uw, $uh) / 2.0) '#000000' 0.8
