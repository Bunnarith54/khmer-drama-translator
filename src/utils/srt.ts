import { SubtitleSegment } from '../types';

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
}

export function formatSrtTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${millis.toString().padStart(3, '0')}`;
}

export function formatVttTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

export function generateSrt(subtitles: SubtitleSegment[], includeSource: boolean = false): string {
  return subtitles
    .sort((a, b) => a.startTime - b.startTime)
    .map((sub, index) => {
      const start = formatSrtTime(sub.startTime);
      const end = formatSrtTime(sub.endTime);
      const text = includeSource
        ? `${sub.khmerText}\n(${sub.sourceText})`
        : sub.khmerText;
      return `${index + 1}\n${start} --> ${end}\n${text}\n`;
    })
    .join('\n');
}

export function generateVtt(subtitles: SubtitleSegment[]): string {
  const body = subtitles
    .sort((a, b) => a.startTime - b.startTime)
    .map((sub, index) => {
      const start = formatVttTime(sub.startTime);
      const end = formatVttTime(sub.endTime);
      return `${index + 1}\n${start} --> ${end}\n${sub.khmerText}\n`;
    })
    .join('\n');
  return `WEBVTT\n\n${body}`;
}

export function downloadFile(content: string, filename: string, type: string = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
