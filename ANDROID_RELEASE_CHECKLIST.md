
## v2.3 Audio Mastering
- Final FFmpeg audio enhancement: high/low-pass, conservative noise reduction, compressor.
- Export Modal passes the enhancement flag to the server renderer.
- SFX remains grouped with accompaniment unless a future multi-stem separator provides a dedicated SFX stem.
# Android Release Checklist — Khmer Drama Translator v2.4

- [ ] Install Node.js 20+
- [ ] Install Android Studio + SDK
- [ ] Install JDK 17
- [ ] Deploy backend over HTTPS
- [ ] Install FFmpeg on backend
- [ ] Set `VITE_API_BASE_URL` in `.env`
- [ ] Run `npm install`
- [ ] Run `npx cap add android` once
- [ ] Run `npm run android:sync`
- [ ] Test `npm run android:apk` on a real Android phone
- [ ] Verify video picker, translation, TTS, timeline and MP4 export
- [ ] Configure Gradle signing for release
- [ ] Run `npm run android:release-apk`

- [ ] Run `npm run android:check` before building
- [ ] Run `npm run android:setup` if the `android/` folder does not exist
