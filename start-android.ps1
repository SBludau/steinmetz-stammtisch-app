# Steinmetz App - Android Dev Starter
Write-Host "=== Steinmetz App - Android Emulator ===" -ForegroundColor Cyan

# Java aus Android Studio verwenden (korrekte JAVA_HOME)
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Android SDK
$env:ANDROID_HOME = "C:\Users\Sebastian Bludau\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:PATH"

# Prüfung
Write-Host "Java: $(& java -version 2>&1 | Select-Object -First 1)" -ForegroundColor Green
Write-Host "ADB:  $(& adb version 2>&1 | Select-Object -First 1)" -ForegroundColor Green
Write-Host ""
Write-Host "Hinweis: Development-APK muss einmalig auf dem Emulator installiert sein." -ForegroundColor Yellow
Write-Host "Danach verbindet sich die App automatisch mit diesem Metro-Server." -ForegroundColor Yellow
Write-Host ""
Write-Host "Starte Metro-Bundler (npx expo start -c) ..." -ForegroundColor Cyan
Write-Host "  Druecke 'a' um den Android-Emulator zu verbinden" -ForegroundColor White
Write-Host "  Druecke 'r' um die App neu zu laden" -ForegroundColor White
Write-Host "  Druecke Ctrl+C um zu beenden" -ForegroundColor White
Write-Host ""

cd "F:\GitHub\steinmetz-stammtisch-app"
npx expo start -c
