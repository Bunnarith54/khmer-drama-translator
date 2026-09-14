# Build APK on Windows

## Requirements
- Node.js 20+
- JDK 17+
- Android Studio with Android SDK installed
- Android SDK Platform-Tools and an Android platform/build-tools compatible with the Capacitor project

## 1. Install dependencies
```powershell
npm install
```

## 2. Configure Backend
Copy `.env.android.example` to `.env` and set your deployed HTTPS backend URL. Do not put the Gemini API key in the APK.

## 3. Create/sync Android project
```powershell
npm run android:setup
```

## 4. Check environment
```powershell
npm run android:doctor
```

## 5. Build Debug APK
```powershell
npm run android:windows-debug
```
Output:
`android/app/build/outputs/apk/debug/app-debug.apk`

## 6. Build Release APK
```powershell
npm run android:windows-release
```
The unsigned release APK is produced under:
`android/app/build/outputs/apk/release/app-release-unsigned.apk`

For Google Play, configure a signing key in Gradle/Android Studio and build a signed AAB/APK.
