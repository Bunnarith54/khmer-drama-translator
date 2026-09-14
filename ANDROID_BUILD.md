# Android Build — Khmer Drama Translator v2.4

## Requirements on the computer
- Node.js 20+
- JDK 17
- Android Studio + Android SDK
- Android SDK Platform Tools (adb)

## 1. Configure backend
Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your HTTPS backend.
Do NOT put the Gemini secret API key in the Android app.

## 2. Install dependencies and create Android project
```bash
npm install
npm run android:setup
```
`android:setup` creates the Capacitor Android project if it does not exist, builds the web app, and syncs it.

## 3. Build debug APK
```bash
npm run android:build
```
APK output:
`android/app/build/outputs/apk/debug/app-debug.apk`

Or:
```bash
npm run android:apk
```
which copies it to `Khmer-Drama-Translator-debug.apk`.

## 4. Release APK
Configure signing in Android Studio/Gradle first, then:
```bash
npm run android:release-apk
```

## 5. Important
The APK is only the Android client. Gemini, FFmpeg rendering, and Demucs separation run on the backend. The backend must be reachable over HTTPS from the phone.
