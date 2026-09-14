# Khmer Drama Translator v2.0 — Backend Deployment

v2.0 adds a production-oriented backend container with FFmpeg included. This is important because Android should call a server that actually has FFmpeg available for final MP4 rendering.

## Option A: Docker

```bash
docker build -t khmer-drama-translator:2.0 .
docker run --rm -p 3000:3000 -e GEMINI_API_KEY="YOUR_KEY" khmer-drama-translator:2.0
```

Health check:

```text
GET /api/health
```

The response reports `ffmpegAvailable` so the app can distinguish a working renderer from a backend without FFmpeg.

## HTTPS

For a real Android release, put the backend behind HTTPS and set:

```text
VITE_API_BASE_URL=https://your-backend.example.com
```

Do not put the Gemini server key into the Android APK. Keep `GEMINI_API_KEY` on the backend.

## Android build

After Node/Android SDK/Java are installed:

```bash
npm install
npm run android:sync
npm run android:apk
```

The debug APK is copied to:

```text
Khmer-Drama-Translator-debug.apk
```
