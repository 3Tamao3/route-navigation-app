# start-bluestack.ps1
# Restarts ADB server, waits for BlueStacks to register, sets up reverse port forwarding, then starts Expo.

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

# Restart ADB server so BlueStacks registers cleanly as a single device
Write-Host "Restarting ADB server..."
& $adb kill-server
Start-Sleep -Seconds 2
& $adb start-server
Start-Sleep -Seconds 3

$deviceList = & $adb devices
if ($deviceList -notmatch "device") {
    Write-Warning "No device detected. Make sure BlueStacks is running and ADB is enabled:"
    Write-Warning "BlueStacks -> Settings -> Advanced -> Enable Android Debug Bridge (ADB)"
    exit 1
}

Write-Host "Devices connected:"
$deviceList | Write-Host

Write-Host "Setting up reverse port forwarding for ports 8081 and 8082..."
& $adb reverse tcp:8081 tcp:8081
& $adb reverse tcp:8082 tcp:8082

Write-Host ""
Write-Host "Starting Expo Metro bundler (localhost mode)..."
npx expo start --localhost
