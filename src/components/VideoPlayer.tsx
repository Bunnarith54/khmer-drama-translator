import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Mic,
  Film,
  Upload,
  Subtitles,
  EyeOff,
} from 'lucide-react';
import { SubtitleSegment, SubtitleStyle, AppUiLang, DramaCharacter } from '../types';
import { khmerTts } from '../utils/khmerTts';
import { formatTime } from '../utils/srt';
import { CHARACTER_COLOR_CLASSES } from '../data/defaultCharacters';

interface VideoPlayerProps {
  videoUrl: string;
  subtitles: SubtitleSegment[];
  subtitleStyle: SubtitleStyle;
  isKhmerVoiceEnabled: boolean;
  muteOriginalAudio: boolean;
  onToggleMuteOriginal: () => void;
  uiLang: AppUiLang;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  characters?: DramaCharacter[];
  apiKey?: string;
  onTimeUpdate?: (time: number) => void;
  onSeek?: (time: number) => void;
  onSelectVideoPrompt?: () => void;
  onToggleSubtitleVisibility?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  subtitles,
  subtitleStyle,
  isKhmerVoiceEnabled,
  muteOriginalAudio,
  onToggleMuteOriginal,
  uiLang,
  videoRef,
  characters = [],
  apiKey,
  onTimeUpdate,
  onSelectVideoPrompt,
  onToggleSubtitleVisibility,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [activeSubtitle, setActiveSubtitle] = useState<SubtitleSegment | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSpokenSubId = useRef<string | null>(null);

  // Helper to find character profile for a subtitle
  const getSubCharacter = (sub: SubtitleSegment): DramaCharacter | undefined => {
    if (sub.characterId) {
      const found = characters.find((c) => c.id === sub.characterId);
      if (found) return found;
    }
    if (sub.speaker) {
      const found = characters.find((c) => c.name === sub.speaker);
      if (found) return found;
      // Also match partial e.g. "តួឯកប្រុស"
      const partial = characters.find((c) =>
        sub.speaker?.includes(c.name) || c.name.includes(sub.speaker || '')
      );
      if (partial) return partial;
    }
    return undefined;
  };

  // Sync active subtitle based on currentTime
  useEffect(() => {
    const current = subtitles.find(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime
    );
    setActiveSubtitle(current || null);

    // If Khmer Voice is enabled and video is playing, trigger character-specific TTS speech
    if (isKhmerVoiceEnabled && isPlaying && current) {
      if (lastSpokenSubId.current !== current.id) {
        lastSpokenSubId.current = current.id;
        const matchedChar = getSubCharacter(current);
        const pitch = matchedChar ? matchedChar.pitch : 1.0;
        const rate = matchedChar ? matchedChar.rate : 1.0;
        const voiceName = matchedChar?.geminiVoice;
        const gender = matchedChar?.gender || (current.speaker?.includes('ស្រី') ? 'female' : 'male');

        khmerTts.speak({
          text: current.khmerText,
          voiceName,
          gender,
          pitch,
          rate,
          apiKey,
        });
      }
    } else if (!current) {
      lastSpokenSubId.current = null;
    }
  }, [currentTime, subtitles, isKhmerVoiceEnabled, isPlaying, characters, apiKey]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      khmerTts.stop();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);
    if (onTimeUpdate) {
      onTimeUpdate(cur);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-end group"
    >
      {!videoUrl ? (
        /* Empty state when no video is selected */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900/90 via-slate-950 to-black z-20">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 shadow-lg">
            <Film className="w-8 h-8" />
          </div>
          <p className="text-base font-bold text-white mb-1">
            {uiLang === 'km' ? 'មិនទាន់បានជ្រើសរើសវីដេអូនៅឡើយទេ' : 'No Video Selected Yet'}
          </p>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            {uiLang === 'km'
              ? 'សូមជ្រើសរើស ឬទម្លាក់វីដេអូរឿងភាគចិនពីទូរស័ព្ទរបស់អ្នកដើម្បីចាប់ផ្តើម'
              : 'Please select or drop your Chinese drama video file to start translating'}
          </p>
          {onSelectVideoPrompt && (
            <button
              onClick={onSelectVideoPrompt}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-rose-950/50 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{uiLang === 'km' ? 'ជ្រើសរើសវីដេអូរឿងភាគ' : 'Select Drama Video'}</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Video Element */}
          <video
            ref={videoRef as any}
            src={videoUrl}
            className="w-full h-full object-contain cursor-pointer"
            playsInline
            muted={muteOriginalAudio}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              setIsPlaying(false);
              khmerTts.stop();
            }}
            onClick={handlePlayPause}
          />

          {/* Top Status Badges */}
          {isKhmerVoiceEnabled && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none z-10">
              <span className="bg-emerald-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-300 flex items-center gap-1 border border-emerald-500/40 animate-pulse">
                <Mic className="w-3.5 h-3.5" />
                <span>Khmer Voice ON</span>
              </span>
            </div>
          )}

          {/* Active Subtitle Overlay on Video (Hideable to not block video) */}
          {activeSubtitle && (subtitleStyle.showKhmerSubtitles !== false || subtitleStyle.showSourceSubtitles === true) && (
            <div
              className={`absolute left-0 right-0 px-4 sm:px-8 flex justify-center pointer-events-none z-20 transition-all duration-150 ${
                subtitleStyle.position === 'top'
                  ? 'top-8 sm:top-12'
                  : subtitleStyle.position === 'center'
                  ? 'top-1/2 -translate-y-1/2'
                  : 'bottom-16 sm:bottom-20'
              }`}
              style={{
                opacity: subtitleStyle.opacity ?? 1,
              }}
            >
              <div
                className={`max-w-2xl px-4 py-2.5 rounded-2xl text-center backdrop-blur-xs transition-all ${
                  subtitleStyle.backgroundColor === 'none'
                    ? ''
                    : subtitleStyle.backgroundColor === 'solid'
                    ? 'bg-black/95 border border-white/10 shadow-2xl'
                    : 'bg-black/65 border border-white/10 shadow-xl'
                }`}
              >
                {/* Speaker Name Badge */}
                {subtitleStyle.showSpeakerBadge !== false && (speakerProfile || activeSubtitle.speaker) && (
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-xs ${
                        speakerProfile
                          ? (CHARACTER_COLOR_CLASSES[speakerProfile.color] || 'bg-rose-950/80 text-rose-300 border-rose-500/40')
                          : 'bg-slate-800 text-slate-300 border-white/10'
                      }`}
                    >
                      {speakerProfile?.avatarEmoji && <span>{speakerProfile.avatarEmoji}</span>}
                      <span>{speakerProfile?.name || activeSubtitle.speaker}</span>
                    </span>
                  </div>
                )}

                {/* Khmer Subtitle Text */}
                {subtitleStyle.showKhmerSubtitles !== false && activeSubtitle.khmerText && (
                  <p
                    className={`font-semibold tracking-wide leading-relaxed drop-shadow-md select-none ${
                      subtitleStyle.fontSize === 'sm'
                        ? 'text-sm sm:text-base'
                        : subtitleStyle.fontSize === 'base'
                        ? 'text-base sm:text-lg'
                        : subtitleStyle.fontSize === 'xl'
                        ? 'text-xl sm:text-2xl'
                        : subtitleStyle.fontSize === '2xl'
                        ? 'text-2xl sm:text-3xl'
                        : 'text-lg sm:text-xl'
                    }`}
                    style={{
                      color: subtitleStyle.textColor || '#ffffff',
                      textShadow: subtitleStyle.hasShadow !== false ? '0 2px 8px rgba(0,0,0,0.85), 0 0 2px #000' : 'none',
                    }}
                  >
                    {activeSubtitle.khmerText}
                  </p>
                )}

                {/* Chinese Original Text (Optional toggle) */}
                {subtitleStyle.showSourceSubtitles === true && activeSubtitle.sourceText && (
                  <p
                    className="text-xs sm:text-sm text-slate-300/90 mt-1 font-medium select-none"
                    style={{
                      textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                    }}
                  >
                    {activeSubtitle.sourceText}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Center Play Overlay Icon on Hover/Pause */}
          {!isPlaying && (
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl shadow-rose-950/60 hover:scale-110 active:scale-95 transition-all z-10"
            >
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            </button>
          )}

          {/* Bottom Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 pt-6 z-30 transition-opacity">
            {/* Timeline Slider */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-slate-300 min-w-10">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 10}
                step="0.05"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <span className="text-xs font-mono text-slate-400 min-w-10 text-right">
                {formatTime(duration)}
              </span>
            </div>

            {/* Buttons Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={handlePlayPause}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
                <button
                  onClick={() => skip(-5)}
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="-5s"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => skip(5)}
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="+5s"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Subtitles Visibility Toggle (Hide to prevent obscuring video) */}
                {onToggleSubtitleVisibility && (
                  <button
                    onClick={onToggleSubtitleVisibility}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      subtitleStyle.showKhmerSubtitles === false && subtitleStyle.showSourceSubtitles === false
                        ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                    title={
                      subtitleStyle.showKhmerSubtitles === false && subtitleStyle.showSourceSubtitles === false
                        ? (uiLang === 'km' ? 'បើកអក្សររត់ឡើងវិញ' : 'Turn On Subtitles')
                        : (uiLang === 'km' ? 'លុប/បិទអក្សររត់កុំអោយបាំងវីដេអូ' : 'Hide Subtitles (Clear Video)')
                    }
                  >
                    {subtitleStyle.showKhmerSubtitles === false && subtitleStyle.showSourceSubtitles === false ? (
                      <>
                        <EyeOff className="w-4 h-4 text-rose-400" />
                        <span className="hidden sm:inline">{uiLang === 'km' ? 'បានបិទអក្សរ' : 'Subs Hidden'}</span>
                      </>
                    ) : (
                      <>
                        <Subtitles className="w-4 h-4 text-emerald-400" />
                        <span className="hidden sm:inline">{uiLang === 'km' ? 'អក្សររត់' : 'Subtitles'}</span>
                      </>
                    )}
                  </button>
                )}

                {/* Mute Original Video Audio Button */}
                <button
                  onClick={onToggleMuteOriginal}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    muteOriginalAudio
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                  title={muteOriginalAudio ? 'Unmute Original Video' : 'Mute Original Audio (Better for Khmer Dubbing)'}
                >
                  {muteOriginalAudio ? (
                    <>
                      <VolumeX className="w-4 h-4 text-amber-400" />
                      <span className="hidden sm:inline">Muted Original</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Original Audio</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
