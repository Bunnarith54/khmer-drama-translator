import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Key,
  Users,
  Sparkles,
  ShieldCheck,
  Cpu,
  Globe,
} from 'lucide-react';
import { AppUiLang, DramaCharacter, SubtitleSegment } from '../types';
import { UI_TEXT } from '../data/translations';
import { GeminiConfigPanel } from './GeminiConfigPanel';
import { CharacterManager } from './CharacterManager';
import { LanguageSelector } from './LanguageSelector';

export type SettingsTab = 'translation' | 'gemini' | 'characters';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: SettingsTab;
  onTabChange?: (tab: SettingsTab) => void;
  // Translation props
  sourceLang: string;
  targetLang: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  // Gemini props
  apiKey: string;
  onChangeApiKey: (key: string) => void;
  selectedModel: string;
  onChangeSelectedModel: (model: string) => void;
  // Character props
  characters: DramaCharacter[];
  onAddCharacter: (char: DramaCharacter) => void;
  onUpdateCharacter: (char: DramaCharacter) => void;
  onDeleteCharacter: (id: string) => void;
  subtitles: SubtitleSegment[];
  uiLang: AppUiLang;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  activeTab = 'translation',
  onTabChange,
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  apiKey,
  onChangeApiKey,
  selectedModel,
  onChangeSelectedModel,
  characters,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  subtitles,
  uiLang,
}) => {
  const t = UI_TEXT[uiLang];
  const [currentTab, setCurrentTab] = useState<SettingsTab>(activeTab);

  useEffect(() => {
    if (activeTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  // Lock body scroll when modal is open and handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectTab = (tab: SettingsTab) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="settings-modal-dialog"
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col glass-panel rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/80 overflow-hidden border border-white/20"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/[0.08] bg-[#090d16]/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-950/50 flex-shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {t.settingsTitle}
                </h2>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-rose-300 border border-rose-500/30">
                  v1.0
                </span>
                {apiKey && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <ShieldCheck className="w-3 h-3" />
                    Key Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {t.settingsDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-white/10 transition-colors"
            title={t.closeSettings}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher Bar */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2.5 bg-[#0a0f1d]/90 border-b border-white/[0.08] flex-shrink-0 overflow-x-auto no-scrollbar">
          {/* Tab 1: Translation Settings (ការកំណត់ការបកប្រែ) */}
          <button
            type="button"
            onClick={() => handleSelectTab('translation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border ${
              currentTab === 'translation'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md'
                : 'bg-[#0e1424] text-slate-400 border-white/5 hover:text-slate-200 hover:border-white/10'
            }`}
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>{t.tabTranslation}</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-300 border border-white/10">
              {sourceLang} ➔ {targetLang}
            </span>
          </button>

          {/* Tab 2: Gemini API & Models */}
          <button
            type="button"
            onClick={() => handleSelectTab('gemini')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border ${
              currentTab === 'gemini'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md'
                : 'bg-[#0e1424] text-slate-400 border-white/5 hover:text-slate-200 hover:border-white/10'
            }`}
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>{t.tabGemini}</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-300 border border-white/10">
              {selectedModel}
            </span>
          </button>

          {/* Tab 3: Characters & Voices */}
          <button
            type="button"
            onClick={() => handleSelectTab('characters')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border ${
              currentTab === 'characters'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md'
                : 'bg-[#0e1424] text-slate-400 border-white/5 hover:text-slate-200 hover:border-white/10'
            }`}
          >
            <Users className="w-4 h-4 text-rose-400" />
            <span>{t.tabCharacters}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              {characters.length}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {currentTab === 'translation' ? (
            <div className="space-y-4">
              <LanguageSelector
                sourceLang={sourceLang}
                targetLang={targetLang}
                onSourceChange={onSourceChange}
                onTargetChange={onTargetChange}
                uiLang={uiLang}
              />
            </div>
          ) : currentTab === 'gemini' ? (
            <div className="space-y-4">
              <GeminiConfigPanel
                apiKey={apiKey}
                onChangeApiKey={onChangeApiKey}
                selectedModel={selectedModel}
                onChangeSelectedModel={onChangeSelectedModel}
                uiLang={uiLang}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <CharacterManager
                characters={characters}
                onAddCharacter={onAddCharacter}
                onUpdateCharacter={onUpdateCharacter}
                onDeleteCharacter={onDeleteCharacter}
                subtitles={subtitles}
                uiLang={uiLang}
                apiKey={apiKey}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-t border-white/[0.08] bg-[#090d16]/95 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline text-[11px]">
              {uiLang === 'km'
                ? 'ការកំណត់ត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិក្នុ Browser របស់អ្នក'
                : 'Settings are auto-saved to your browser storage'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-md shadow-rose-950/40 transition-all active:scale-95"
          >
            {uiLang === 'km' ? 'រួចរាល់' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
