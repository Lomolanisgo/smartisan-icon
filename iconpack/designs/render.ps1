$ErrorActionPreference = 'Continue'
$root = 'C:\Users\zyc9\AppData\Local\Temp\claude\D--Others-Github-smartisan-icon\96ad576b-019e-4b24-9b2c-0b5b12824130\scratchpad'
New-Item -ItemType Directory -Force "$root\render" | Out-Null
& node "$root\gen.js"
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
foreach ($n in 'opt-A-douyin','opt-A-tiktok','opt-B-douyin','opt-B-tiktok','opt-C-douyin','opt-C-tiktok') {
  $out = "$root\designs\douyin\$n.png"
  $p = Start-Process -FilePath $chrome -ArgumentList @('--headless=new','--disable-gpu','--hide-scrollbars','--default-background-color=00000000','--window-size=256,256',"--user-data-dir=$root\chrome-prof","--screenshot=$out","file:///$($root -replace '\\','/')/render/$n.html") -Wait -PassThru -WindowStyle Hidden
}
Start-Process -FilePath $chrome -ArgumentList @('--headless=new','--disable-gpu','--hide-scrollbars','--allow-file-access-from-files','--window-size=1300,560',"--user-data-dir=$root\chrome-prof","--screenshot=$root\render\sheet.png","file:///$($root -replace '\\','/')/render/sheet.html") -Wait -WindowStyle Hidden
Get-ChildItem "$root\designs\douyin" | Select-Object Name, Length
