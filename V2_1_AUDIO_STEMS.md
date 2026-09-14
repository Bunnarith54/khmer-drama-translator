# v2.1 — Real Audio Stems

The Audio Separation endpoint now returns the actual Demucs `vocals.wav` and `no_vocals.wav` stems. The app keeps them in memory for the current project and sends them to the FFmpeg MP4 renderer.

## Backend requirement
Install Demucs on the backend:

```bash
pip install demucs
```

FFmpeg must also be installed and available on PATH.

## What the mixer does
- Original Voice = Demucs vocals stem
- Music = Demucs accompaniment (`no_vocals`) stem
- Dubbing = generated Gemini TTS clips
- SFX = currently part of the accompaniment stem; a separate SFX stem is not claimed

If Demucs is unavailable, the app reports the engine as unavailable rather than pretending isolation worked.
