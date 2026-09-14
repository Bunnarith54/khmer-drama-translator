import React, { useState } from 'react';
import {
  Download,
  FileText,
  Film,
  Copy,
  Check,
  X,
  Smartphone,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { SubtitleSegment, SubtitleStyle, AppUiLang } from '../types';
import { UI_TEXT } from '../data/translations';
import { generateSrt, generateVtt, downloadFile } from '../utils/srt';
import { exportVideoWithSubtitles } from '../utils/videoExporter';
import { exportDubbedVideo, DubbingClip } from '../utils/dubbingExporter';
import { apiUrl } from '../utils/api';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtitles: SubtitleSegment[];
  subtitleStyle: SubtitleStyle;
  videoElement: HTMLVideoElement | null;
  videoFile?: File | null;
  dramaTitle?: string;
  uiLang: AppUiLang;
  dubbingClips?: DubbingClip[];
  muteOriginalAudio?: boolean;
  audioStems?: { vocalsData?: string; musicData?: string; mimeType?: string };
  musicVolume?: number;
  voiceVolume?: number;
  dubbingVolume?: number;
  audioEnhancementEnabled?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  subtitles,
  subtitleStyle,
  videoElement,
  videoFile = null,
  dramaTitle = 'Khmer_Drama',
  uiLang,
  dubbingClips = [],
  muteOriginalAudio = false,
  audioStems = {},
  musicVolume = 70,
  voiceVolume = 100,
  dubbingVolume = 100,
  audioEnhancementEnabled = false,
}) => {
  const t = UI_TEXT[uiLang];
  const [copied, setCopied] = useState(false);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadSrt = () => {
    const srt = generateSrt(subtitles);
    const cleanTitle = dramaTitle.replace(/\s+/g, '_');
    downloadFile(srt, `${cleanTitle}_Khmer_Subtitles.srt`);
  };

  const handleDownloadVtt = () => {
    const vtt = generateVtt(subtitles);
    const cleanTitle = dramaTitle.replace(/\s+/g, '_');
    downloadFile(vtt, `${cleanTitle}_Khmer_Subtitles.vtt`);
  };

  const handleCopySrt = () => {
    const srt = generateSrt(subtitles);
    navigator.clipboard.writeText(srt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportMp4 = async () => {
    if (!videoElement) return;
    setIsExportingVideo(true);
    setExportProgress(0);
    setExportedVideoUrl(null);

    try {
      const blob = await exportVideoWithSubtitles(
        videoElement,
        subtitles,
        subtitleStyle,
        (pct) => setExportProgress(pct)
      );

      const url = URL.createObjectURL(blob);
      setExportedVideoUrl(url);

      // Auto download for Android
      const cleanTitle = dramaTitle.replace(/\s+/g, '_');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cleanTitle}_Translated_Khmer.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Video export error:', err);
      alert(uiLang === 'km' ? 'មិនអាចបង្កើតវីដេអូបានទេ សូមព្យាយាមម្តងទៀត' : 'Failed to export video, please try again');
    } finally {
      setIsExportingVideo(false);
    }
  };

  const handleServerExportDubbed = async () => {
    if (!videoFile || !dubbingClips.length) return;
    setIsExportingVideo(true); setExportProgress(5); setExportedVideoUrl(null);
    try {
      const buffer = await videoFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
      const response = await fetch(apiUrl('/api/render-dubbed'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoData: btoa(binary), mimeType: videoFile.type || 'video/mp4', muteOriginalAudio,
          clips: dubbingClips.map(c => ({ ...c, startTime: c.startTime ?? subtitles.find(s => s.id === c.subtitleId)?.startTime ?? 0 })),
          separatedVocalsData: audioStems.vocalsData || '',
          separatedMusicData: audioStems.musicData || '',
          originalVolume: Math.max(0, Math.min(2, voiceVolume / 100)),
          musicVolume: Math.max(0, Math.min(2, musicVolume / 100)),
          dubbingVolume: Math.max(0, Math.min(2, dubbingVolume / 100)),
          audioEnhancementEnabled,
        })
      });
      setExportProgress(35);
      if (!response.ok) { const d = await response.json().catch(() => ({})); throw new Error(d?.error || 'Server MP4 render failed'); }
      const blob = await response.blob();
      setExportProgress(100);
      const url = URL.createObjectURL(blob); setExportedVideoUrl(url);
      const cleanTitle = dramaTitle.replace(/\s+/g, '_');
      const a = document.createElement('a'); a.href = url; a.download = `${cleanTitle}_Khmer_Dubbed.mp4`; document.body.appendChild(a); a.click(); a.remove();
    } catch (err: any) {
      console.error('Server dubbed export error:', err);
      alert(uiLang === 'km' ? `Export MP4 មិនបាន៖ ${err?.message || 'សូមពិនិត្យ Backend/FFmpeg'}` : `MP4 export failed: ${err?.message || 'Check backend/FFmpeg'}`);
    } finally { setIsExportingVideo(false); }
  };

  const handleExportDubbed = async () => {
    if (!videoElement || !dubbingClips.length) return;
    setIsExportingVideo(true); setExportProgress(0); setExportedVideoUrl(null);
    try {
      const blob = await exportDubbedVideo(videoElement, subtitles, dubbingClips, subtitleStyle, muteOriginalAudio, setExportProgress);
      const url = URL.createObjectURL(blob); setExportedVideoUrl(url);
      const cleanTitle = dramaTitle.replace(/\s+/g, '_');
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
      const a = document.createElement('a'); a.href=url; a.download=`${cleanTitle}_Khmer_Dubbed.${ext}`; document.body.appendChild(a); a.click(); a.remove();
    } catch (err) { console.error('Dubbed export error:', err); alert(uiLang==='km'?'មិនអាច Export Dubbing បានទេ។ សូមសាកល្បងម្ដងទៀត។':'Failed to export dubbed video.'); }
    finally { setIsExportingVideo(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 shadow-2xl relative border border-white/20">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="mb-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
            Export & Save
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
            {t.exportOptions}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {uiLang === 'km'
              ? 'ទាញយកចំណងជើងរងជាឯកសារ SRT ឬបង្កើតវីដេអូ MP4 សម្រាប់រក្សាទុកក្នុងទូរស័ព្ទ Android'
              : 'Download subtitle files or render an MP4 video with burned-in subtitles for your phone'}
          </p>
        </div>

        {/* Subtitle Export Section */}
        <div className="mb-4 bg-[#0e1424] p-4 rounded-2xl border border-white/10">
          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-rose-400" />
            <span>{t.exportSubtitle}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={handleDownloadSrt}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-white/10 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.downloadSrt}</span>
            </button>
            <button
              onClick={handleDownloadVtt}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-white/10 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.downloadVtt}</span>
            </button>
            <button
              onClick={handleCopySrt}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-white/10 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? t.copied : t.copySrt}</span>
            </button>
          </div>
        </div>

        {/* Video Export Section (MP4) */}
        <div className="bg-gradient-to-br from-rose-950/30 via-[#0e1424] to-[#0c101c] p-4 rounded-2xl border border-rose-500/30">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-rose-400" />
                <span>{t.exportVideo} (MP4)</span>
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {t.exportMp4Desc}
              </p>
              {audioStems.vocalsData && audioStems.musicData && <p className="text-[10px] text-emerald-300 mt-2">✓ AI Voice/Music stems will be used in the final MP4 mix.</p>}
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> Android
            </span>
          </div>

          {isExportingVideo ? (
            <div className="space-y-2 py-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>{t.generatingMp4}</span>
                <span className="font-mono text-rose-400">{exportProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-200"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 justify-center pt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                <span>
                  {uiLang === 'km'
                    ? 'សូមរង់ចាំបន្តិច កំពុងបង្កើនវីដេអូ...'
                    : 'Please wait, rendering frames and burning Khmer subtitles...'}
                </span>
              </p>
            </div>
          ) : (
            <div>
              {dubbingClips.length > 0 && (
                <button onClick={handleServerExportDubbed} className="w-full mb-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-violet-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all">
                  <Sparkles className="w-4 h-4" />
                  <span>{uiLang === 'km' ? `Export MP4 Dubbing (${dubbingClips.length} clips)` : `Export MP4 Dubbing (${dubbingClips.length} clips)`}</span>
                </button>
              )}

              <button
                onClick={handleExportMp4}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:from-rose-500 hover:to-rose-500 active:scale-98 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>
                  {uiLang === 'km' ? 'ទាញយកវីដេអូ MP4 ឥឡូវនេះ' : 'Render & Export MP4 Video'}
                </span>
              </button>

              {exportedVideoUrl && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <p className="text-xs text-emerald-300 font-semibold mb-1">
                    ✓ {uiLang === 'km' ? 'វីដេអូត្រូវបានទាញយករួចរាល់!' : 'Video ready and downloaded!'}
                  </p>
                  <a
                    href={exportedVideoUrl}
                    download={`${dramaTitle}_Khmer_Subtitles.mp4`}
                    className="text-xs text-rose-300 hover:underline font-medium"
                  >
                    {uiLang === 'km' ? 'ចុចទីនេះប្រសិនបើការទាញយកមិនទាន់ចាប់ផ្តើម' : 'Click here if download did not start automatically'}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
