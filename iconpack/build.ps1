# 构建锤子图标包 APK（不依赖 Gradle：aapt2 打包资源 + apksigner 签名）
# 用法：powershell -ExecutionPolicy Bypass -File iconpack\build.ps1 -SdkRoot <Android SDK 路径>
param(
    [Parameter(Mandatory = $true)][string]$SdkRoot,
    [string]$BuildTools = '35.0.0',
    [string]$Platform = 'android-35'
)
$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$app = Join-Path $here 'app'
$out = Join-Path $here 'build'
$bt = Join-Path $SdkRoot "build-tools\$BuildTools"
$androidJar = Join-Path $SdkRoot "platforms\$Platform\android.jar"

if (-not (Test-Path $bt) -or -not (Test-Path $androidJar)) {
    $sdkmanager = Join-Path $SdkRoot 'cmdline-tools\latest\bin\sdkmanager.bat'
    (1..20 | ForEach-Object { 'y' }) | & $sdkmanager --sdk_root=$SdkRoot --licenses | Out-Null
    & $sdkmanager --sdk_root=$SdkRoot "build-tools;$BuildTools" "platforms;$Platform"
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path "$bt\aapt2.exe") -or -not (Test-Path $androidJar)) {
        throw "sdkmanager 安装失败（许可未接受？先运行：$sdkmanager --sdk_root=$SdkRoot --licenses）"
    }
}

node (Join-Path $here 'scripts\generate.mjs')
if ($LASTEXITCODE -ne 0) { throw '生成资源失败' }

New-Item -ItemType Directory -Force $out | Out-Null
$resZip = Join-Path $out 'res.zip'
$unsigned = Join-Path $out 'unsigned.apk'
$aligned = Join-Path $out 'aligned.apk'
$apk = Join-Path $out 'smartisan-icons.apk'
Remove-Item $resZip, $unsigned, $aligned, $apk -ErrorAction SilentlyContinue

& "$bt\aapt2.exe" compile --dir (Join-Path $app 'res') -o $resZip
if ($LASTEXITCODE -ne 0) { throw 'aapt2 compile 失败' }
& "$bt\aapt2.exe" link -o $unsigned -I $androidJar --manifest (Join-Path $app 'AndroidManifest.xml') -A (Join-Path $app 'assets') --min-sdk-version 26 --target-sdk-version 35 $resZip
if ($LASTEXITCODE -ne 0) { throw 'aapt2 link 失败' }

# 代码（桌面入口的图标浏览）：javac -> d8 -> classes.dex 放进 APK
$classes = Join-Path $out 'classes'
$dexDir = Join-Path $out 'dex'
Remove-Item $classes, $dexDir -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $classes, $dexDir | Out-Null
$sources = Get-ChildItem (Join-Path $app 'src') -Recurse -Filter *.java | ForEach-Object FullName
# --release 8：java.* 用 JDK 的 API（含 lambda 需要的 LambdaMetafactory），android.* 来自 android.jar；d8 负责脱糖
& javac -encoding UTF-8 --release 8 -classpath $androidJar -d $classes $sources
if ($LASTEXITCODE -ne 0) { throw 'javac 失败' }
$classFiles = Get-ChildItem $classes -Recurse -Filter *.class | ForEach-Object FullName
& "$bt\d8.bat" --release --min-api 26 --lib $androidJar --output $dexDir $classFiles
if ($LASTEXITCODE -ne 0) { throw 'd8 失败' }
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::Open($unsigned, 'Update')
try { [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, (Join-Path $dexDir 'classes.dex'), 'classes.dex') }
finally { $zip.Dispose() }
Remove-Item $classes, $dexDir -Recurse -Force
& "$bt\zipalign.exe" -f -p 4 $unsigned $aligned
if ($LASTEXITCODE -ne 0) { throw 'zipalign 失败' }

# 本地签名密钥（首次自动生成，勿提交）
$keystore = Join-Path $here 'release.jks'
if (-not (Test-Path $keystore)) {
    & keytool -genkeypair -keystore $keystore -alias smartisan -keyalg RSA -keysize 2048 -validity 36500 `
        -storepass smartisan -keypass smartisan -dname 'CN=Smartisan Icon Pack'
    if ($LASTEXITCODE -ne 0) { throw 'keytool 失败' }
}
& "$bt\apksigner.bat" sign --ks $keystore --ks-pass pass:smartisan --key-pass pass:smartisan --out $apk $aligned
if ($LASTEXITCODE -ne 0) { throw 'apksigner 失败' }

Remove-Item $resZip, $unsigned, $aligned
"已生成：$apk"
