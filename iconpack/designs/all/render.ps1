# 把目录下的 opt-*.svg 渲染成 256×256 透明 PNG（headless Chrome，每次独立配置目录，可并行）
# 用法：powershell -ExecutionPolicy Bypass -File iconpack\designs\all\render.ps1 -Dir <目录> [-Filter opt-*.svg]
param(
    [Parameter(Mandatory = $true)][string]$Dir,
    [string]$Filter = 'opt-*.svg'
)
$ErrorActionPreference = 'Stop'
$chrome = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) { throw '找不到 Chrome 或 Edge' }

$dir = (Resolve-Path $Dir).Path
foreach ($svg in Get-ChildItem $dir -Filter $Filter) {
    $png = [IO.Path]::ChangeExtension($svg.FullName, '.png')
    $html = Join-Path $env:TEMP ("render-" + [guid]::NewGuid() + '.html')
    $profile = Join-Path $env:TEMP ("chrome-" + [guid]::NewGuid())
    $src = 'file:///' + ($svg.FullName -replace '\\', '/')
    Set-Content -Encoding utf8 $html "<!doctype html><html><body style=`"margin:0;background:transparent`"><img src=`"$src`" width=`"256`" height=`"256`" style=`"display:block`"></body></html>"
    Remove-Item $png -ErrorAction SilentlyContinue
    # Chrome 会把“bytes written”写到 stderr，临时放宽错误处理，避免被当成失败
    $ErrorActionPreference = 'Continue'
    & $chrome --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files `
        --user-data-dir="$profile" --default-background-color=00000000 --window-size=256,256 `
        --screenshot="$png" ('file:///' + ($html -replace '\\', '/')) 2>&1 | Out-Null
    $ErrorActionPreference = 'Stop'
    Remove-Item $html -ErrorAction SilentlyContinue
    Remove-Item $profile -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path $png) { "OK  $($svg.Name) -> $([IO.Path]::GetFileName($png))" } else { "FAIL $($svg.Name)" }
}
