# start-bluestack.ps1
# Connects BlueStacks via ADB, sets up reverse port forwarding, then starts Expo.

$adb = $null

$candidatePaths = @(
    "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
    "$env:USERPROFILE\AppData\Local\Android\Sdk\platform-tools\adb.exe",
    "C:\Program Files\Android\Android Studio\sdk\platform-tools\adb.exe",
    "C:\Android\platform-tools\adb.exe"
)

foreach ($p in $candidatePaths) {
    if (Test-Path $p) { $adb = $p; break }
}

if (-not $adb) {
    try { $adb = (Get-Command adb -ErrorAction Stop).Source }
    catch {
        Write-Error "ADB not found. Install Android SDK Platform Tools from https://developer.android.com/tools/releases/platform-tools and add it to your PATH."
        exit 1
    }
}

Write-Host "ADB found: $adb"

Write-Host "Connecting to BlueStacks on 127.0.0.1:5555..."
& $adb connect 127.0.0.1:5555
Start-Sleep -Seconds 2

$deviceList = & $adb devices
if ($deviceList -notmatch "127\.0\.0\.1:5555\s+device") {
    Write-Warning "BlueStacks device not seen as connected."
    Write-Warning "In BlueStacks go to Settings -> Advanced -> Enable Android Debug Bridge (ADB), then re-run this script."
}

Write-Host "Setting up reverse port forwarding: BlueStacks localhost:8081 -> host localhost:8081"
& $adb -s 127.0.0.1:5555 reverse tcp:8081 tcp:8081

Write-Host ""
Write-Host "Starting Expo Metro bundler (localhost mode)..."
npx expo start --localhost
