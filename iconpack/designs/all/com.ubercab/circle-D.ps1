# Uber 圆形 D：原图标圆形遮罩（src-img/uber-circle.png）+ circle-D.svg 立体叠加层 → circle-D.png
Add-Type -AssemblyName System.Drawing
$D = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$D\..\render.ps1" -Dir $D -Filter circle-D.svg | Out-Null
$base = [System.Drawing.Bitmap]::FromFile((Resolve-Path "$D\..\..\src-img\uber-circle.png"))
$over = [System.Drawing.Bitmap]::FromFile("$D\circle-D.png")
$bm = New-Object System.Drawing.Bitmap 256, 256, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bm)
$g.DrawImage($base, 0, 0, 256, 256)
$g.DrawImage($over, 0, 0, 256, 256)
$g.Dispose(); $base.Dispose(); $over.Dispose()
$bm.Save("$D\circle-D.png", [System.Drawing.Imaging.ImageFormat]::Png); $bm.Dispose()
"OK circle-D.png"
