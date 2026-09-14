# Khmer Drama Translator v2.3 — Audio Mastering

## Included
- Real FFmpeg final audio mastering switch.
- Conservative high-pass / low-pass filtering.
- `afftdn` noise reduction when enabled.
- Gentle compressor for more consistent dialogue/music levels.
- Export pipeline passes the UI enhancement state to `/api/render-dubbed`.

## Accuracy note
This does not claim independent SFX separation. SFX remains part of the accompaniment/music stem until a dedicated multi-stem model is integrated.
