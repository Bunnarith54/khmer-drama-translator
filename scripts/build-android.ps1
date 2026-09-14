param([ValidateSet('Debug','Release')][string]$Mode='Debug')
$ErrorActionPreference='Stop'
Write-Host "=== Khmer Drama Translator Android $Mode Build ==="
if (!(Test-Path 'node_modules')) { npm install }
if (!(Test-Path 'android')) { npx cap add android }
npm run build
npx cap sync android
if (!(Test-Path 'android\gradlew.bat')) { throw 'Gradle wrapper missing. Run: npx cap add android' }
if ($Mode -eq 'Release') { Push-Location android; .\gradlew.bat assembleRelease; Pop-Location; Write-Host 'APK: android\app\build\outputs\apk\release\app-release-unsigned.apk' }
else { Push-Location android; .\gradlew.bat assembleDebug; Pop-Location; Write-Host 'APK: android\app\build\outputs\apk\debug\app-debug.apk' }
