
## v2.3 Audio Mastering
- Final FFmpeg audio enhancement: high/low-pass, conservative noise reduction, compressor.
- Export Modal passes the enhancement flag to the server renderer.
- SFX remains grouped with accompaniment unless a future multi-stem separator provides a dedicated SFX stem.
# Khmer Drama Translator v2.0

Audio Studio update with Voice / Music mixing and an optional real stem-separation backend using Demucs.

## Audio Separation
Install Demucs on the backend to enable true vocal/music separation. Without it, the UI reports the engine as unavailable instead of pretending that a volume slider performs separation.

## Run
```bash
npm install
npm run dev
```

Set `GEMINI_API_KEY` in `.env` or enter a key in the app Settings.


## v1.5 Professional Dubbing Studio
- Dubbing timeline with timestamp ruler
- Voice clip timeline from subtitle segments
- Music track visualization
- Tap-to-seek editing workflow
- Character-aware voice clip coloring


## Android / APK (v1.7)

This version is prepared for Capacitor Android packaging. The Android shell is generated with Capacitor after dependencies are installed.

1. Install Node.js 20+ and Android Studio.
2. Run `npm install`.
3. Copy `.env.android.example` to `.env` and set `VITE_API_BASE_URL` to the deployed backend URL.
4. Run `npm run build`.
5. Run `npx cap add android` (first time only).
6. Run `npm run android:sync`.
7. Run `npm run android:build` to produce a debug APK under `android/app/build/outputs/apk/debug/`.

Important: the APK is the mobile client; Gemini TTS/translation and the optional Demucs/FFmpeg processing still run on the backend. Do not put a private server Gemini key inside the APK.


## v1.8 — Real FFmpeg MP4 Dubbing Engine
- Added `/api/render-dubbed` server-side FFmpeg renderer.
- Generates a real MP4 with original audio (optional) + timed Gemini TTS clips.
- Detects missing FFmpeg and reports a clear error instead of pretending export succeeded.
- Android export button now prefers the server renderer when a backend URL is configured.

### Backend requirement
Install FFmpeg on the backend host and make sure `ffmpeg` is available in PATH. The APK is the client; the heavy MP4 rendering should run on the backend.


## v1.9 — Android APK Release Setup

The project is prepared for a Capacitor Android build with the app name **Khmer Drama Translator** and application ID `com.khmerdramatranslator.app`.

### Build a debug APK
```bash
npm install
npx cap add android   # first time only
cp .env.android.example .env
# edit .env and set VITE_API_BASE_URL to your HTTPS backend
npm run android:apk
```
The copied APK will be `Khmer-Drama-Translator-debug.apk`.

### Build a release APK
```bash
npm run android:release-apk
```
For a Play Store/production APK, configure your own Android signing key in the generated `android/` Gradle project before distributing it.

### Android requirements
- Node.js 20+
- Android Studio + Android SDK
- JDK 17
- A reachable HTTPS backend with Gemini/FFmpeg services

### Important
The APK does **not** contain a private Gemini API key. Keep `GEMINI_API_KEY` on the backend or enter a user's own key in the app. FFmpeg rendering and Demucs separation remain backend workloads.


## v2.0 — Android + FFmpeg deployment foundation
This release includes a Dockerfile that installs FFmpeg in the backend image, a health endpoint reporting FFmpeg availability, and deployment notes for connecting an Android build to an HTTPS backend.

## Android APK (v2.5)
On Windows use `npm run android:windows-debug` for a debug APK or `npm run android:windows-release` for a release build. See `BUILD_APK_WINDOWS.md`.

## Cloud APK build

For a phone-only build, see `CLOUD_BUILD.md`. GitHub Actions can build the debug APK in the cloud and publish it as a downloadable workflow artifact.
