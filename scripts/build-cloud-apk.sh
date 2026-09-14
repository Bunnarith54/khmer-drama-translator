#!/usr/bin/env bash
set -euo pipefail
npm install
node scripts/setup-android.mjs
cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon
cp app/build/outputs/apk/debug/app-debug.apk ../Khmer-Drama-Translator-debug.apk
echo "APK: Khmer-Drama-Translator-debug.apk"
