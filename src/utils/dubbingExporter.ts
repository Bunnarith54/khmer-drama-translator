import { SubtitleSegment, SubtitleStyle } from '../types';

export interface DubbingClip {
  subtitleId: string;
  audioData: string;
  mimeType?: string;
  rate?: number;
  volume?: number;
  pitch?: number;
  startTime?: number;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
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
  ctx.globalAlpha = style.opacity ?? 1;
  let y = canvasHeight - 80 * scale;
  if (style.position === 'top') y = 90 * scale;
  if (style.position === 'center') y = canvasHeight / 2;
  const x = canvasWidth / 2;
  ctx.font = `bold ${Math.round(fontPx)}px 'Kantumruy Pro', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const khmerWidth = khmerText ? ctx.measureText(khmerText).width : 0;
  const sourceFontPx = Math.round(fontPx * 0.65);
  ctx.font = `${sourceFontPx}px sans-serif`;
  const sourceWidth = sourceText ? ctx.measureText(sourceText).width : 0;
  const boxWidth = Math.max(khmerWidth, sourceWidth) + 48 * scale;
  const boxHeight = (khmerText ? fontPx : 0) + (sourceText ? sourceFontPx + 6 * scale : 0) + 24 * scale;
  if (style.backgroundColor === 'translucent') {
    ctx.fillStyle = 'rgba(0,0,0,.72)';
    ctx.roundRect?.(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 8 * scale);
    if (!ctx.roundRect) ctx.fillRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight);
    ctx.fill();
  } else if (style.backgroundColor === 'solid') {
    ctx.fillStyle = '#09090b';
    ctx.fillRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight);
  }
  if (khmerText) {
    const textY = sourceText ? y - sourceFontPx / 2 : y;
    ctx.font = `bold ${Math.round(fontPx)}px 'Kantumruy Pro', sans-serif`;
    if (style.hasShadow) { ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 8 * scale; ctx.strokeStyle = '#000'; ctx.lineWidth = 4 * scale; ctx.strokeText(khmerText, x, textY); }
    ctx.fillStyle = style.textColor || '#fff';
    ctx.fillText(khmerText, x, textY);
  }
  if (sourceText) {
    const sourceY = khmerText ? y + fontPx / 2 + 2 * scale : y;
    ctx.font = `${sourceFontPx}px sans-serif`;
    if (style.hasShadow) { ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 6 * scale; ctx.strokeStyle = '#000'; ctx.lineWidth = 3 * scale; ctx.strokeText(sourceText, x, sourceY); }
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(sourceText, x, sourceY);
  }
  ctx.restore();
}

export async function exportDubbedVideo(
  videoElement: HTMLVideoElement,
  subtitles: SubtitleSegment[],
  clips: DubbingClip[],
  style: SubtitleStyle,
  muteOriginalAudio: boolean,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) throw new Error('Web Audio API is not supported on this device.');
  const audioCtx = new AudioCtx();
  await audioCtx.resume();

  const originalTime = videoElement.currentTime;
  const originalPaused = videoElement.paused;
  const originalMuted = videoElement.muted;
  const duration = videoElement.duration || 10;
  const width = videoElement.videoWidth || 1280;
  const height = videoElement.videoHeight || 720;
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is unavailable.');

  const source = audioCtx.createMediaElementSource(videoElement);
  const originalGain = audioCtx.createGain();
  originalGain.gain.value = muteOriginalAudio ? 0 : 1;
  source.connect(originalGain);

  const destination = audioCtx.createMediaStreamDestination();
  originalGain.connect(destination);
  originalGain.connect(audioCtx.destination);

  const decoded = await Promise.all(clips.map(async clip => ({
    ...clip,
    buffer: await audioCtx.decodeAudioData(base64ToArrayBuffer(clip.audioData)),
  })));

  const scheduleBase = audioCtx.currentTime + 0.35;
  const nodes: AudioBufferSourceNode[] = [];
  for (const clip of decoded) {
    const sub = subtitles.find(s => s.id === clip.subtitleId);
    if (!sub) continue;
    const node = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    node.buffer = clip.buffer;
    node.playbackRate.value = Math.max(0.75, Math.min(1.5, clip.rate || 1));
    gain.gain.value = 1;
    node.connect(gain);
    gain.connect(destination);
    gain.connect(audioCtx.destination);
    node.start(scheduleBase + Math.max(0, sub.startTime));
    nodes.push(node);
  }

  const canvasStream = canvas.captureStream(30);
  const tracks = [...canvasStream.getVideoTracks(), ...destination.stream.getAudioTracks()];
  const output = new MediaStream(tracks);
  const mimeCandidates = ['video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'];
  const mime = mimeCandidates.find(m => MediaRecorder.isTypeSupported(m)) || '';
  const recorder = new MediaRecorder(output, mime ? { mimeType: mime } : undefined);
  const chunks: Blob[] = [];
  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };

  return await new Promise<Blob>(async (resolve, reject) => {
    const cleanup = () => {
      nodes.forEach(n => { try { n.stop(); } catch {} });
      source.disconnect(); originalGain.disconnect();
      videoElement.currentTime = originalTime;
      videoElement.muted = originalMuted;
      if (originalPaused) videoElement.pause();
      audioCtx.close().catch(() => {});
    };
    recorder.onerror = e => { cleanup(); reject(e); };
    recorder.onstop = () => {
      cleanup();
      const type = mime.includes('mp4') ? 'video/mp4' : 'video/webm';
      resolve(new Blob(chunks, { type }));
    };
    recorder.start(250);
    videoElement.currentTime = 0;
    try {
      await videoElement.play();
    } catch (e) {
      cleanup(); reject(new Error('សូមចុច Play/Allow Audio មុនពេល Export វីដេអូ។'));
      return;
    }
    const timer = window.setInterval(() => {
      const now = videoElement.currentTime;
      onProgress?.(Math.min(99, Math.round((now / duration) * 100)));
      ctx.drawImage(videoElement, 0, 0, width, height);
      const active = subtitles.find(s => now >= s.startTime && now <= s.endTime);
      if (active && (style.showKhmerSubtitles !== false || style.showSourceSubtitles === true)) {
        drawSubtitle(ctx, style.showKhmerSubtitles === false ? '' : active.khmerText, style.showSourceSubtitles ? active.sourceText : '', style, width, height);
      }
      if (videoElement.ended || now >= duration - 0.05) {
        window.clearInterval(timer);
        onProgress?.(100);
        videoElement.pause();
        setTimeout(() => recorder.stop(), 150);
      }
    }, 1000 / 30);
  });
}
