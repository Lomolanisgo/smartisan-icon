$src = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $src
$out = Join-Path $root 'designs\claude'
$spark = (Get-Content -Raw (Join-Path $out 'spark.txt')).Trim()
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$utf8 = New-Object System.Text.UTF8Encoding($false)
foreach ($n in 'A','B','C','D') {
  $t = [IO.File]::ReadAllText((Join-Path $src "opt-$n.svg"))
  $svgPath = Join-Path $out "opt-$n.svg"
  [IO.File]::WriteAllText($svgPath, $t.Replace('SPARK', $spark), $utf8)
  $png = Join-Path $out "opt-$n.png"
  if (Test-Path $png) { Remove-Item $png }
  $uri = 'file:///' + ($svgPath -replace '\\','/')
  $p = Start-Process -FilePath $chrome -ArgumentList @('--headless=new','--disable-gpu','--hide-scrollbars','--default-background-color=00000000','--window-size=256,256',"--screenshot=$png",$uri) -Wait -PassThru -WindowStyle Hidden
  Write-Output "$n -> $(Test-Path $png)"
}
