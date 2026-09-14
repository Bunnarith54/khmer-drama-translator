# v2.2 — Character Voice Studio

- Per-character Gemini voice selection.
- Per-character pitch, speed/rate and volume.
- FFmpeg renderer applies clip gain, pitch and timing before mixing.
- Global Dubbing Volume now controls final dubbing gain.
- Pitch is implemented with FFmpeg `asetrate` + `aresample` + compensating `atempo`; extreme values may sound more processed.
- Music/voice stems remain optional; SFX is not a separate stem in this release.
