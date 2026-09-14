#!/usr/bin/env bash
set -euo pipefail
MODE="${1:-Debug}"
if [ ! -d node_modules ]; then npm install; fi
if [ ! -d android ]; then npx cap add android; fi
npm run build
npx cap sync android
cd android
if [ "$MODE" = "Release" ]; then ./gradlew assembleRelease; else ./gradlew assembleDebug; fi
