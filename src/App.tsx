import { apiUrl } from './utils/api';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Film,
  Play,
  RotateCcw,
  Sliders,
  Smartphone,
  HelpCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import {
  SubtitleSegment,
  SubtitleStyle,
  ProcessingStep,
  AppUiLang,
  DramaCharacter,
} from './types';
import { UI_TEXT } from './data/translations';
import { DEFAULT_CHARACTERS } from './data/defaultCharacters';
import { Header } from './components/Header';
import { VideoSelector } from './components/VideoSelector';
import { VideoPlayer } from './components/VideoPlayer';
import { SubtitleEditor } from './components/SubtitleEditor';
import { KhmerVoiceToggle } from './components/KhmerVoiceToggle';
import { SettingsModal, SettingsTab } from './components/SettingsModal';
import { ProgressModal } from './components/ProgressModal';
import { ExportModal } from './components/ExportModal';
import { extractAudioFromVideo } from './utils/audioExtractor';
import { AudioMusicPanel } from './components/AudioMusicPanel';
import { VoiceDubbingPanel } from './components/VoiceDubbingPanel';
import { DubbingClip } from './utils/dubbingExporter';

export default function App() {
  // UI Language
  const [uiLang, setUiLang] = useState<AppUiLang>('km');
  const t = UI_TEXT[uiLang];

  // Gemini API Key & Model Configuration
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('user_gemini_api_key') || '';
    } catch {
      return '';
    }
  });

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    try {
      return localStorage.getItem('user_gemini_model') || 'gemini-3.8-flash';
    } catch {
      return 'gemini-3.8-flash';
    }
  });

  // Translation Languages
  const [sourceLang, setSourceLang] = useState<string>('Chinese');
  const [targetLang, setTargetLang] = useState<string>('Khmer');

  // Speaking Characters (តួអង្គនិយាយ)
  const [characters, setCharacters] = useState<DramaCharacter[]>(DEFAULT_CHARACTERS);

  // Video & File state (Starts empty - user uploads their drama video)
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Subtitles & Styling
  const [subtitles, setSubtitles] = useState<SubtitleSegment[]>([]);
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>({
    fontSize: 'lg',
    position: 'bottom',
    textColor: '#ffffff',
    backgroundColor: 'translucent',
    hasShadow: true,
    showKhmerSubtitles: true,
    showSourceSubtitles: false,
    opacity: 1,
  });

  // Khmer Voice & Dubbing
  const [isKhmerVoiceEnabled, setIsKhmerVoiceEnabled] = useState<boolean>(true);
  const [muteOriginalAudio, setMuteOriginalAudio] = useState<boolean>(false);
  const [dubbingClips, setDubbingClips] = useState<DubbingClip[]>([]);

  // Audio Music controls
  const [musicVolume, setMusicVolume] = useState<number>(75);
  const [voiceVolume, setVoiceVolume] = useState<number>(100);
  const [dubbingVolume, setDubbingVolume] = useState<number>(100);
  const [sfxVolume, setSfxVolume] = useState<number>(100);
  const [isMusicIsolationEnabled, setIsMusicIsolationEnabled] = useState<boolean>(false);
  const [isAudioEnhancementEnabled, setIsAudioEnhancementEnabled] = useState<boolean>(true);
  const [isAudioPreviewing, setIsAudioPreviewing] = useState<boolean>(false);
  const [separationStatus, setSeparationStatus] = useState<'idle' | 'processing' | 'ready' | 'unavailable' | 'error'>('idle');
  const [audioStems, setAudioStems] = useState<{ vocalsData?: string; musicData?: string; mimeType?: string }>({});

  // Processing & Workflow Modal
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [translationNotice, setTranslationNotice] = useState<string>('');
  const [translationEngine, setTranslationEngine] = useState<string>('');

  // Export Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Settings Modal (សំរាប់ផ្ទុកប្រអប់ Gemini API key និង ប្រអប់ characters & voices)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [settingsModalTab, setSettingsModalTab] = useState<SettingsTab>('gemini');

  const handleOpenSettings = (tab: SettingsTab = 'translation') => {
    setSettingsModalTab(tab);
    setIsSettingsModalOpen(true);
  };

  // Handle user uploading custom video from Android gallery
  const handleSelectFile = async (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    // Keep selection separate from processing so users can preview/change settings first.
    setSubtitles([]);
    setDubbingClips([]);
    setTranslationNotice('');
    setTranslationEngine('');
  };

  const handleClearFile = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl('');
    setSubtitles([]);
    setDubbingClips([]);
    setCurrentTime(0);
    setTranslationNotice('');
    setTranslationEngine('');
    setErrorMessage('');
    setProcessingStep('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Main Workflow: Audio extraction -> Speech recognition -> Translation -> Subtitles -> Voice
  const runTranslationWorkflow = async (
    customFile?: File,
    dramaName?: string
  ) => {
    const fileToProcess = customFile || videoFile;
    if (!fileToProcess) {
      setErrorMessage(t.noVideoSelected);
      setProcessingStep('error');
      return;
    }

    if (processingStep !== 'idle' && processingStep !== 'completed' && processingStep !== 'error') return;
    setErrorMessage('');
    setTranslationNotice('');
    setProcessingStep('extracting_audio');
    setProgressPercent(15);

    try {
      let base64Audio = '';
      let duration = 15;

      // 1. Extract audio from uploaded video
      const audioResult = await extractAudioFromVideo(fileToProcess);
      base64Audio = audioResult.base64Audio;
      duration = audioResult.duration || 15;

      // 2. Speech recognition step
      setProcessingStep('speech_recognition');
      setProgressPercent(40);

      // 3. Translation step (call backend /api/translate-video with Gemini)
      setProcessingStep('translation');
      setProgressPercent(65);

      const response = await fetch(apiUrl('/api/translate-video'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Audio,
          sourceLang,
          targetLang,
          videoDuration: duration,
          dramaTitle: dramaName || fileToProcess.name,
          apiKey: apiKey.trim() || undefined,
          model: selectedModel.trim() || undefined,
        }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error('Failed to parse response JSON:', parseErr);
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Server translation request failed');
      }

      // 4. Subtitle generation step
      setProcessingStep('generating_subtitles');
      setProgressPercent(85);

      if (data?.subtitles && Array.isArray(data.subtitles)) {
        setSubtitles(data.subtitles);
      }
      if (data?.warning) {
        setTranslationNotice(data.warning);
      }
      if (data?.engine) {
        setTranslationEngine(data.engine);
      }

      // 5. Voice generation step
      setProcessingStep('generating_voice');
      setProgressPercent(98);

      await new Promise((r) => setTimeout(r, 600));

      // 6. Completed
      setProgressPercent(100);
      setProcessingStep('completed');
    } catch (err: any) {
      console.error('Translation workflow error:', err);
      setErrorMessage(
        err?.message || (uiLang === 'km' ? 'មិនអាចបកប្រែវីដេអូបានទេ សូមសាកល្បងម្តងទៀត។' : 'Could not process audio track. Please try again.')
      );
      setProcessingStep('error');
    }
  };

  const handleSeekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleOpenVideoPicker = () => {
    fileInputRef.current?.click();
  };

  // Character management handlers
  const handleAddCharacter = (newChar: DramaCharacter) => {
    setCharacters((prev) => [...prev, newChar]);
  };

  const handleUpdateCharacter = (updatedChar: DramaCharacter) => {
    setCharacters((prev) => prev.map((c) => (c.id === updatedChar.id ? updatedChar : c)));
    setSubtitles((prev) =>
      prev.map((s) =>
        s.characterId === updatedChar.id ? { ...s, speaker: updatedChar.name } : s
      )
    );
  };

  const handleDeleteCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-12">
      {/* Header */}
      <Header
        uiLang={uiLang}
        onToggleUiLang={setUiLang}
        selectedModel={selectedModel}
        hasCustomApiKey={Boolean(apiKey.trim())}
        characterCount={characters.length}
        onOpenSettings={() => handleOpenSettings('translation')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 sm:py-6 space-y-5">
        {/* 1. Video Selection Section */}
        <VideoSelector
          inputRef={fileInputRef}
          onSelectFile={handleSelectFile}
          onClearFile={handleClearFile}
          currentVideoFile={videoFile}
          uiLang={uiLang}
        />

        {/* 2. Video Preview Player */}
        <div className="space-y-3">
          {translationNotice && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium leading-relaxed">{translationNotice}</p>
              </div>
              <button
                type="button"
                onClick={() => setTranslationNotice('')}
                className="text-amber-400/70 hover:text-amber-300 text-xs underline shrink-0"
              >
                {uiLang === 'km' ? 'បិទ' : 'Dismiss'}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-rose-400" />
              <span>{t.previewPlayer}</span>
            </h3>
            <div className="flex items-center gap-2">
              {translationEngine && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                  {translationEngine}
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">
                {subtitles.length} {uiLang === 'km' ? 'បន្ទាត់' : 'lines'}
              </span>
              <button
                type="button"
                disabled={!videoFile || (processingStep !== 'idle' && processingStep !== 'completed' && processingStep !== 'error')}
                onClick={() => runTranslationWorkflow(videoFile || undefined)}
                className="ml-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-rose-950/50 flex items-center gap-1.5"
                title={t.startTranslation}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.startTranslation}</span>
              </button>
            </div>
          </div>

          <VideoPlayer
            videoUrl={videoUrl}
            subtitles={subtitles}
            subtitleStyle={subtitleStyle}
            isKhmerVoiceEnabled={isKhmerVoiceEnabled}
            muteOriginalAudio={muteOriginalAudio}
          audioStems={audioStems}
          musicVolume={musicVolume}
          voiceVolume={voiceVolume}
            onToggleMuteOriginal={() => setMuteOriginalAudio(!muteOriginalAudio)}
            uiLang={uiLang}
            videoRef={videoRef}
            characters={characters}
            apiKey={apiKey}
            onTimeUpdate={setCurrentTime}
            onSelectVideoPrompt={handleOpenVideoPicker}
            onToggleSubtitleVisibility={() => {
              const allHidden = subtitleStyle.showKhmerSubtitles === false && subtitleStyle.showSourceSubtitles === false;
              setSubtitleStyle({
                ...subtitleStyle,
                showKhmerSubtitles: allHidden ? true : false,
                showSourceSubtitles: false,
              });
            }}
          />
        </div>

        {/* 3. Audio Music */}
        <AudioMusicPanel
          uiLang={uiLang}
          musicVolume={musicVolume}
          voiceVolume={voiceVolume}
          dubbingVolume={dubbingVolume}
          sfxVolume={sfxVolume}
          isolationEnabled={isMusicIsolationEnabled}
          enhancementEnabled={isAudioEnhancementEnabled}
          isPreviewing={isAudioPreviewing}
          onMusicVolumeChange={setMusicVolume}
          onDubbingVolumeChange={setDubbingVolume}
          onSfxVolumeChange={setSfxVolume}
          onVoiceVolumeChange={(value) => {
            setVoiceVolume(value);
            if (videoRef.current && !muteOriginalAudio) {
              videoRef.current.volume = Math.max(0, Math.min(1, value / 100));
            }
          }}
          onToggleIsolation={() => setIsMusicIsolationEnabled((v) => !v)}
          onToggleEnhancement={() => setIsAudioEnhancementEnabled((v) => !v)}
          separationStatus={separationStatus}
          onRunSeparation={async () => {
            if (!videoFile) return;
            setSeparationStatus('processing');
            try {
              const buffer = await videoFile.arrayBuffer();
              let binary = '';
              const bytes = new Uint8Array(buffer);
              const chunk = 0x8000;
              for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
              const response = await fetch(apiUrl('/api/audio-separate'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoData: btoa(binary), mimeType: videoFile.type || 'video/mp4', apiKey: apiKey.trim() || undefined }) });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) throw new Error(data?.error || 'Audio separation unavailable');
              if (!data?.vocalsData || !data?.musicData) throw new Error('Separation engine returned no audio stems.');
              setAudioStems({ vocalsData: data.vocalsData, musicData: data.musicData, mimeType: data.mimeType || 'audio/wav' });
              setSeparationStatus('ready');
              setTranslationNotice(data?.message || (uiLang === 'km' ? 'បានបំបែក Voice និង Music រួចរាល់។' : 'Voice and Music stems are ready.'));
            } catch (e: any) {
              setSeparationStatus(e?.message?.includes('not installed') ? 'unavailable' : 'error');
              setTranslationNotice(e?.message || (uiLang === 'km' ? 'មិនអាចបំបែក Audio បានទេ។' : 'Audio separation failed.'));
            }
          }}
          onResetMix={() => { setMusicVolume(70); setVoiceVolume(100); setDubbingVolume(100); setSfxVolume(100); setIsMusicIsolationEnabled(false); setIsAudioEnhancementEnabled(false); setAudioStems({}); if (videoRef.current) videoRef.current.volume = 1; }}
          onPreview={() => {
            if (!videoRef.current || !videoUrl) return;
            if (videoRef.current.paused) {
              videoRef.current.volume = Math.max(0, Math.min(1, voiceVolume / 100));
              videoRef.current.play().then(() => setIsAudioPreviewing(true)).catch(() => {});
            } else {
              videoRef.current.pause();
              setIsAudioPreviewing(false);
            }
          }}
        />

        {/* 4. AI Voice & Dubbing */}
        <VoiceDubbingPanel
          uiLang={uiLang}
          subtitles={subtitles}
          characters={characters}
          apiKey={apiKey}
          enabled={isKhmerVoiceEnabled}
          onEnabledChange={setIsKhmerVoiceEnabled}
          muteOriginalAudio={muteOriginalAudio}
          audioStems={audioStems}
          musicVolume={musicVolume}
          voiceVolume={voiceVolume}
          onMuteOriginalChange={setMuteOriginalAudio}
          onDubbingReady={setDubbingClips}
          onUpdateCharacter={handleUpdateCharacter}
        />

        {/* 5. Khmer Voiceover Quick Controls */}
        <KhmerVoiceToggle
          isEnabled={isKhmerVoiceEnabled}
          onToggle={setIsKhmerVoiceEnabled}
          muteOriginalAudio={muteOriginalAudio}
          audioStems={audioStems}
          musicVolume={musicVolume}
          voiceVolume={voiceVolume}
          onToggleMuteOriginal={() => setMuteOriginalAudio(!muteOriginalAudio)}
          sampleText={subtitles[0]?.khmerText}
          uiLang={uiLang}
        />

        {/* 6. Subtitle Editor & Timing Adjuster */}
        <SubtitleEditor
          subtitles={subtitles}
          onChangeSubtitles={setSubtitles}
          onSeekTo={handleSeekTo}
          currentTime={currentTime}
          uiLang={uiLang}
          characters={characters}
          apiKey={apiKey}
          onOpenCharacterManager={() => handleOpenSettings('characters')}
        />

        {/* Export Sticky Floating Action Bar for Mobile Android */}
        <div className="sticky bottom-4 z-30 pt-2">
          <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {subtitles.length} {uiLang === 'km' ? 'ចំណងជើងរងរួចរាល់' : 'Subtitles Ready'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {uiLang === 'km' ? 'រក្សាទុកជា SRT ឬ វីដេអូ MP4' : 'Ready to export to phone gallery'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExportModalOpen(true)}
                disabled={subtitles.length === 0}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-600 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.exportSubtitle}</span>
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                disabled={subtitles.length === 0}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold transition-all shadow-lg shadow-rose-950/60 flex items-center gap-1.5"
              >
                <Film className="w-3.5 h-3.5" />
                <span>{t.exportVideo}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Version 0.1 */}
      <footer className="w-full py-4 px-4 border-t border-white/[0.06] text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t.appName}</span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500/80" />
            {uiLang === 'km' ? 'កំណែ 1.6 • Professional Dubbing Studio' : 'Version 1.6 • Professional Dubbing Studio'}
          </span>
        </div>
      </footer>

      {/* Progress Indicator Modal (0% -> 100%) */}
      <ProgressModal
        step={processingStep}
        progressPercent={progressPercent}
        errorMessage={errorMessage}
        uiLang={uiLang}
        onClose={() => setProcessingStep('idle')}
        onRetry={() => runTranslationWorkflow(videoFile || undefined)}
      />

      {/* Export Modal (SRT, VTT, MP4) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        subtitles={subtitles}
        subtitleStyle={subtitleStyle}
        videoElement={videoRef.current}
        videoFile={videoFile}
        dramaTitle={videoFile ? videoFile.name.replace(/\.[^/.]+$/, '') : 'Khmer_Drama'}
        uiLang={uiLang}
        dubbingClips={dubbingClips}
        muteOriginalAudio={muteOriginalAudio}
          audioStems={audioStems}
          musicVolume={musicVolume}
          voiceVolume={voiceVolume}
          dubbingVolume={dubbingVolume}
          audioEnhancementEnabled={isAudioEnhancementEnabled}
      />

      {/* Settings Modal (ផ្ទុកប្រអប់ការកំណត់ការបកប្រែ, Gemini API key និង តួអង្គ & សំឡេង) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        activeTab={settingsModalTab}
        onTabChange={setSettingsModalTab}
        sourceLang={sourceLang}
        targetLang={targetLang}
        onSourceChange={setSourceLang}
        onTargetChange={setTargetLang}
        apiKey={apiKey}
        onChangeApiKey={setApiKey}
        selectedModel={selectedModel}
        onChangeSelectedModel={setSelectedModel}
        characters={characters}
        onAddCharacter={handleAddCharacter}
        onUpdateCharacter={handleUpdateCharacter}
        onDeleteCharacter={handleDeleteCharacter}
        subtitles={subtitles}
        uiLang={uiLang}
      />
    </div>
  );
}
