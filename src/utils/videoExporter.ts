import { SubtitleSegment, SubtitleStyle } from '../types';

export async function exportVideoWithSubtitles(
  videoElement: HTMLVideoElement,
  subtitles: SubtitleSegment[],
  style: SubtitleStyle,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const originalTime = videoElement.currentTime;
      const originalPaused = videoElement.paused;
      const originalMuted = videoElement.muted;

      const duration = videoElement.duration || 10;
      const width = videoElement.videoWidth || 1280;
      const height = videoElement.videoHeight || 720;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not supported');
      }

      // Prepare audio capture
      let audioStream: MediaStream | null = null;
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(videoElement);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
        audioStream = dest.stream;
      } catch (e) {
        // May fail if already connected or CORS, fallback gracefully
      }

      // Capture stream from canvas
      const canvasStream = canvas.captureStream(30);
      const combinedTracks = [...canvasStream.getVideoTracks()];
      if (audioStream && audioStream.getAudioTracks().length > 0) {
        combinedTracks.push(...audioStream.getAudioTracks());
      }
      const outputStream = new MediaStream(combinedTracks);

      // Choose mime type
      const mimeTypes = [
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];
      let selectedMimeType = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      const recorder = new MediaRecorder(
        outputStream,
        selectedMimeType ? { mimeType: selectedMimeType } : undefined
      );

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Restore original video state
        videoElement.currentTime = originalTime;
        if (originalPaused) {
          videoElement.pause();
        }
        videoElement.muted = originalMuted;

        const finalType = selectedMimeType.includes('mp4') ? 'video/mp4' : 'video/webm';
        const blob = new Blob(chunks, { type: finalType });
        resolve(blob);
      };

      recorder.start(100);

      // Rewind to start
      videoElement.currentTime = 0;
      await videoElement.play();

      const checkInterval = setInterval(() => {
        if (!videoElement || videoElement.ended || videoElement.currentTime >= duration) {
          clearInterval(checkInterval);
          recorder.stop();
          videoElement.pause();
          return;
        }

        const currentTime = videoElement.currentTime;
        if (onProgress) {
          const pct = Math.min(99, Math.round((currentTime / duration) * 100));
          onProgress(pct);
        }

        // 1. Draw video frame
        ctx.drawImage(videoElement, 0, 0, width, height);

        // 2. Find matching subtitle
        const activeSub = subtitles.find(
          (s) => currentTime >= s.startTime && currentTime <= s.endTime
        );

        // Draw subtitle only if user hasn't hidden them to avoid obscuring video
        const shouldDrawKhmer = style.showKhmerSubtitles !== false;
        const shouldDrawSource = style.showSourceSubtitles === true;

        if (activeSub && (shouldDrawKhmer || shouldDrawSource)) {
          drawSubtitle(
            ctx,
            shouldDrawKhmer ? activeSub.khmerText : '',
            shouldDrawSource ? activeSub.sourceText : '',
            style,
            width,
            height
          );
        }
      }, 1000 / 30);

      recorder.onerror = (err) => {
        clearInterval(checkInterval);
        reject(err);
      };
    } catch (err) {
      reject(err);
    }
  });
}

function drawSubtitle(
  ctx: CanvasRenderingContext2D,
  khmerText: string,
  sourceText: string,
  style: SubtitleStyle,
  canvasWidth: number,
  canvasHeight: number
) {
  if (!khmerText && !sourceText) return;

  const scale = canvasWidth / 1280;
  let fontPx = 36 * scale;
  if (style.fontSize === 'sm') fontPx = 28 * scale;
  if (style.fontSize === 'base') fontPx = 36 * scale;
  if (style.fontSize === 'lg') fontPx = 44 * scale;
  if (style.fontSize === 'xl') fontPx = 52 * scale;
  if (style.fontSize === '2xl') fontPx = 60 * scale;

  ctx.save();
  if (style.opacity !== undefined) {
    ctx.globalAlpha = style.opacity;
  }

  // Calculate position
  let y = canvasHeight - 80 * scale; // default bottom
  if (style.position === 'top') {
    y = 90 * scale;
  } else if (style.position === 'center') {
    y = canvasHeight / 2;
  }

  const x = canvasWidth / 2;

  ctx.font = `bold ${Math.round(fontPx)}px 'Kantumruy Pro', 'Plus Jakarta Sans', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const khmerMetrics = khmerText ? ctx.measureText(khmerText) : { width: 0 };
  let sourceFontPx = Math.round(fontPx * 0.65);
  ctx.font = `${sourceFontPx}px 'Plus Jakarta Sans', sans-serif`;
  const sourceMetrics = sourceText ? ctx.measureText(sourceText) : { width: 0 };

  const maxWidth = Math.max(khmerMetrics.width, sourceMetrics.width);
  const paddingX = 24 * scale;
  const paddingY = 12 * scale;

  const totalTextHeight = (khmerText ? fontPx : 0) + (sourceText ? sourceFontPx + 6 * scale : 0);
  const boxHeight = totalTextHeight + paddingY * 2;
  const boxWidth = maxWidth + paddingX * 2;

  // Background box
  if (style.backgroundColor === 'translucent') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.roundRect
      ? ctx.roundRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 8 * scale)
      : ctx.fillRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight);
    ctx.fill();
  } else if (style.backgroundColor === 'solid') {
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight);
  }

  // Draw Khmer Text
  if (khmerText) {
    const textY = sourceText ? y - (sourceFontPx / 2) : y;
    ctx.font = `bold ${Math.round(fontPx)}px 'Kantumruy Pro', 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (style.hasShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 8 * scale;
      ctx.shadowOffsetX = 2 * scale;
      ctx.shadowOffsetY = 2 * scale;
      ctx.lineWidth = 4 * scale;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(khmerText, x, textY);
    }

    ctx.fillStyle = style.textColor || '#ffffff';
    ctx.fillText(khmerText, x, textY);
  }

  // Draw Source Chinese Text
  if (sourceText) {
    const sourceY = khmerText ? y + (fontPx / 2) + 2 * scale : y;
    ctx.font = `${sourceFontPx}px 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (style.hasShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 6 * scale;
      ctx.shadowOffsetX = 1 * scale;
      ctx.shadowOffsetY = 1 * scale;
      ctx.lineWidth = 3 * scale;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(sourceText, x, sourceY);
    }

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(sourceText, x, sourceY);
  }

  ctx.restore();
}
