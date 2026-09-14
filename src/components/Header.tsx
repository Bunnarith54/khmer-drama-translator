import React from 'react';
import { Languages, Clapperboard, Sparkles, Smartphone, Key, ShieldCheck, Settings, Users } from 'lucide-react';
import { AppUiLang } from '../types';
import { UI_TEXT } from '../data/translations';

interface HeaderProps {
  uiLang: AppUiLang;
  onToggleUiLang: (lang: AppUiLang) => void;
  selectedModel?: string;
  hasCustomApiKey?: boolean;
  characterCount?: number;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  uiLang,
  onToggleUiLang,
  selectedModel = 'gemini-3.8-flash',
  hasCustomApiKey = false,
  characterCount = 0,
  onOpenSettings,
}) => {
  const t = UI_TEXT[uiLang];

  return (
    <header className="sticky top-0 z-40 bg-[#0c101a]/85 backdrop-blur-xl border-b border-white/[0.08] px-3 sm:px-6 py-2.5 sm:py-3 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/60 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -inset-1 bg-rose-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight leading-tight truncate">
                {t.appName}
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                v1.0
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                <Sparkles className="w-3 h-3 text-rose-400" /> Pro Studio
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-tight truncate">
              {uiLang === 'km' ? 'កម្មវិធីបកប្រែរឿងភាគចិនទៅជាខ្មែរ AI' : 'AI Chinese Drama to Khmer Dubbing'}
            </p>
          </div>
        </div>

        {/* Right Section: Settings Icon Button & UI Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Main Settings Icon Button (សំរាប់ផ្ទុកប្រអប់ Gemini API key និង ប្រអប់ characters & voices) */}
          <button
            id="open-settings-button"
            type="button"
            onClick={onOpenSettings}
            className="group relative flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-rose-500/40 text-slate-200 transition-all shadow-sm active:scale-95"
            title={`${t.settings} (Gemini API Key & Characters)`}
          >
            <div className="relative flex items-center justify-center">
              <Settings className="w-4 h-4 text-rose-400 group-hover:rotate-90 transition-transform duration-500" />
              {hasCustomApiKey && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0c101a]" />
              )}
            </div>

            <span className="text-xs font-semibold tracking-wide hidden sm:inline text-slate-200 group-hover:text-white">
              {t.settings}
            </span>

            {/* Quick Model Badge in Header */}
            <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-black/40 text-rose-300 border border-rose-500/20 max-w-[110px] truncate">
              {selectedModel.replace('gemini-', '')}
            </span>

            {characterCount > 0 && (
              <span className="hidden lg:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                {characterCount} តួ
              </span>
            )}
          </button>

          {/* UI Language Switcher */}
          <div className="bg-slate-900/90 p-1 rounded-xl border border-white/10 flex items-center">
            <button
              onClick={() => onToggleUiLang('km')}
              className={`px-2.5 py-1 text-[11px] sm:text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                uiLang === 'km'
                  ? 'bg-rose-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="ភាសាខ្មែរ"
            >
              <span className="text-xs sm:text-sm">🇰🇭</span>
              <span className="hidden sm:inline">ខ្មែរ</span>
            </button>
            <button
              onClick={() => onToggleUiLang('en')}
              className={`px-2.5 py-1 text-[11px] sm:text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                uiLang === 'en'
                  ? 'bg-rose-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="English"
            >
              <span className="text-xs sm:text-sm">🇬🇧</span>
              <span className="hidden sm:inline">EN</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
