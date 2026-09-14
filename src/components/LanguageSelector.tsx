import React from 'react';
import { ArrowRightLeft, Globe, Sparkles, Check, BookOpen, Volume2 } from 'lucide-react';
import { AppUiLang, LanguageOption } from '../types';
import { UI_TEXT } from '../data/translations';

const SOURCE_LANGUAGES: LanguageOption[] = [
  { code: 'zh', name: 'Chinese', nativeName: '中文 (Mandarin)', flag: '🇨🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'yue', name: 'Cantonese', nativeName: '粵語 / 廣東話', flag: '🇭🇰' },
];

const TARGET_LANGUAGES: LanguageOption[] = [
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ (Cambodia)', flag: '🇰🇭' },
  { code: 'en', name: 'English', nativeName: 'English (US/UK)', flag: '🇬🇧' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (Chinese)', flag: '🇨🇳' },
];

const PRESET_PAIRS = [
  {
    id: 'zh-km',
    source: 'Chinese',
    target: 'Khmer',
    labelKm: 'រឿងភាគចិន ➔ ខ្មែរ',
    labelEn: 'Chinese Drama ➔ Khmer',
    flags: '🇨🇳 ➔ 🇰🇭',
  },
  {
    id: 'ko-km',
    source: 'Korean',
    target: 'Khmer',
    labelKm: 'រឿងភាគកូរ៉េ ➔ ខ្មែរ',
    labelEn: 'Korean Drama ➔ Khmer',
    flags: '🇰🇷 ➔ 🇰🇭',
  },
  {
    id: 'ja-km',
    source: 'Japanese',
    target: 'Khmer',
    labelKm: 'រឿងជប៉ុន / Anime ➔ ខ្មែរ',
    labelEn: 'Japanese ➔ Khmer',
    flags: '🇯🇵 ➔ 🇰🇭',
  },
  {
    id: 'en-km',
    source: 'English',
    target: 'Khmer',
    labelKm: 'ភាពយន្តអង់គ្លេស ➔ ខ្មែរ',
    labelEn: 'English Movie ➔ Khmer',
    flags: '🇬🇧 ➔ 🇰🇭',
  },
  {
    id: 'th-km',
    source: 'Thai',
    target: 'Khmer',
    labelKm: 'រឿងភាគថៃ ➔ ខ្មែរ',
    labelEn: 'Thai Drama ➔ Khmer',
    flags: '🇹🇭 ➔ 🇰🇭',
  },
];

interface LanguageSelectorProps {
  sourceLang: string;
  targetLang: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  uiLang: AppUiLang;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  uiLang,
}) => {
  const t = UI_TEXT[uiLang];

  const handleSwap = () => {
    const temp = sourceLang;
    onSourceChange(targetLang);
    onTargetChange(temp);
  };

  const currentSource =
    SOURCE_LANGUAGES.find((l) => l.name.toLowerCase() === sourceLang.toLowerCase()) ||
    SOURCE_LANGUAGES[0];

  const currentTarget =
    TARGET_LANGUAGES.find((l) => l.name.toLowerCase() === targetLang.toLowerCase()) ||
    TARGET_LANGUAGES[0];

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-xl space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                {uiLang === 'km' ? 'ការកំណត់ការបកប្រែ' : 'Translation Settings'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                {currentSource.flag} {currentSource.code.toUpperCase()} ➔ {currentTarget.flag} {currentTarget.code.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              {uiLang === 'km'
                ? 'កំណត់ភាសាដើមនៃការសន្ទនាក្នុងវីដេអូ និងភាសាគោលដៅសម្រាប់បង្កើតចំណងជើងរង & សំឡេងអាន'
                : 'Configure spoken audio language in video and target subtitle/dubbing language'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Drama Presets */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          {uiLang === 'km' ? 'ជម្រើសគំរូទូទៅ (Quick Presets)' : 'Quick Drama Presets'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {PRESET_PAIRS.map((pair) => {
            const isSelected =
              sourceLang.toLowerCase() === pair.source.toLowerCase() &&
              targetLang.toLowerCase() === pair.target.toLowerCase();

            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => {
                  onSourceChange(pair.source);
                  onTargetChange(pair.target);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-rose-500/20 border-rose-500/60 text-white shadow-md shadow-rose-950/40'
                    : 'bg-[#0e1424] border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between text-base mb-1">
                  <span>{pair.flags}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                </div>
                <span className="text-[11px] font-semibold truncate leading-tight">
                  {uiLang === 'km' ? pair.labelKm : pair.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Source & Target Language Selectors */}
      <div className="bg-[#0e1424] rounded-2xl p-4 border border-white/10 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Source Language Card */}
          <div className="bg-[#090d18] rounded-xl p-3 border border-white/10 focus-within:border-rose-500/60 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>{t.sourceLang}</span>
              </label>
              <span className="text-xl">{currentSource.flag}</span>
            </div>
            <select
              value={sourceLang}
              onChange={(e) => onSourceChange(e.target.value)}
              className="w-full bg-slate-900/90 text-white font-semibold text-xs sm:text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              {SOURCE_LANGUAGES.map((l) => (
                <option key={l.code} value={l.name} className="bg-slate-900 text-white">
                  {l.flag} {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
              {uiLang === 'km'
                ? 'ភាសានិយាយក្នុងរឿងភាគដែល AI ត្រូវស្តាប់ និងបម្លែង'
                : 'Spoken language in the drama to transcribe'}
            </p>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-1 sm:my-0">
            <button
              onClick={handleSwap}
              type="button"
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-rose-600 active:scale-90 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-white/10 shadow-md group"
              title="Swap Languages"
            >
              <ArrowRightLeft className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* Target Language Card */}
          <div className="bg-[#090d18] rounded-xl p-3 border border-rose-500/30 focus-within:border-rose-500 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <span>{t.targetLang}</span>
              </label>
              <span className="text-xl">{currentTarget.flag}</span>
            </div>
            <select
              value={targetLang}
              onChange={(e) => onTargetChange(e.target.value)}
              className="w-full bg-slate-900/90 text-white font-semibold text-xs sm:text-sm rounded-lg px-3 py-2 border border-rose-500/40 focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              {TARGET_LANGUAGES.map((l) => (
                <option key={l.code} value={l.name} className="bg-slate-900 text-white">
                  {l.flag} {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
              {uiLang === 'km'
                ? 'ភាសាដែលត្រូវបង្កើតជាអក្សររត់លើវីដេអូ & សំឡេងអាន'
                : 'Language to generate subtitles and voiceover for'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/20 via-slate-900/40 to-amber-950/20 border border-white/10 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-slate-200">
            {uiLang === 'km'
              ? 'ការបកប្រែសម្រួលន័យរឿងភាគខ្មែរ (Natural Drama Dubbing)'
              : 'Natural Drama Localization'}
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {uiLang === 'km'
              ? 'ម៉ូដែល Gemini នឹងវិភាគកាយវិការ ទឹកមុខ និងបរិបទសាច់រឿង ដើម្បីបកប្រែជាពាក្យពេចន៍ខ្មែរយ៉ាងរស់រវើក មិនមែនបកប្រែពាក្យមួយទល់មួយទេ (ដូចជាការប្រើប្រាស់ពាក្យ បង, អូន, លោកម្ចាស់, មេទ័ព, ព្រះអង្គ...)'
              : 'Gemini analyzes visual and audio context to produce idiomatic, cinematic phrasing suitable for drama narration rather than literal word-by-word translation.'}
          </p>
        </div>
      </div>
    </div>
  );
};

