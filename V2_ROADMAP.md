
## v2.3 Audio Mastering
- Final FFmpeg audio enhancement: high/low-pass, conservative noise reduction, compressor.
- Export Modal passes the enhancement flag to the server renderer.
- SFX remains grouped with accompaniment unless a future multi-stem separator provides a dedicated SFX stem.
# v2.x Roadmap

- v2.0: Android release foundation + FFmpeg-enabled backend deployment
- v2.1: real Demucs stem files returned/stored and connected to the mixer
- v2.2: multipart uploads for large videos (avoid huge base64 JSON payloads)
- v2.3: persistent job queue/progress for long renders
- v2.4: signed release APK/AAB and Play Store configuration
