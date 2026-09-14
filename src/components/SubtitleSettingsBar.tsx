import React from 'react';
import {
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Palette,
  Type,
  Square,
  Eye,
  EyeOff,
  Subtitles,
} from 'lucide-react';
import { SubtitleStyle, SubtitlePosition, SubtitleFontSize, AppUiLang } from '../types';
import { UI_TEXT } from '../data/translations';

interface SubtitleSettingsBarProps {
  style: SubtitleStyle;
  onChangeStyle: (newStyle: SubtitleStyle) => void;
  uiLang: AppUiLang;
}

const FONT_SIZES: { id: SubtitleFontSize; label: string }[] = [
  { id: 'sm', label: 'S' },
  { id: 'base', label: 'M' },
  { id: 'lg', label: 'L' },
  { id: 'xl', label: 'XL' },
  { id: '2xl', label: '2XL' },
];

const COLORS = [
  { hex: '#ffffff', label: 'White' },
  { hex: '#fbbf24', label: 'Gold' },
  { hex: '#38bdf8', label: 'Cyan' },
  { hex: '#4ade80', label: 'Green' },
  { hex: '#f43f5e', label: 'Rose' },
];

export const SubtitleSettingsBar: React.FC<SubtitleSettingsBarProps> = ({
  style,
  onChangeStyle,
  uiLang,
}) => {
  const t = UI_TEXT[uiLang];

  const setPosition = (pos: SubtitlePosition) => {
    onChangeStyle({ ...style, position: pos });
  };

  const setFontSize = (size: SubtitleFontSize) => {
    onChangeStyle({ ...style, fontSize: size });
  };

  const setTextColor = (color: string) => {
    onChangeStyle({ ...style, textColor: color });
  };

  const setBg = (bg: 'none' | 'translucent' | 'solid') => {
    onChangeStyle({ ...style, backgroundColor: bg });
  };

  return (
    <div className="glass-panel rounded-2xl p-3.5 sm:p-4 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-4 h-4 text-rose-400" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
          {uiLang === 'km' ? 'រចនាប័ទ្មអក្សររត់ និងទីតាំង' : 'Subtitle Style & Position'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Position: Top, Center, Bottom */}
        <div className="bg-[#0e1320] p-2.5 rounded-xl border border-white/10">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            {t.position}
          </label>
          <div className="grid grid-cols-3 gap-1 bg-[#151c2e] p-1 rounded-lg">
            <button
              onClick={() => setPosition('top')}
              className={`p-1.5 rounded-md flex justify-center items-center transition-all ${
                style.position === 'top'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={t.posTop}
            >
              <AlignVerticalJustifyStart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPosition('center')}
              className={`p-1.5 rounded-md flex justify-center items-center transition-all ${
                style.position === 'center'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={t.posCenter}
            >
              <AlignVerticalJustifyCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPosition('bottom')}
              className={`p-1.5 rounded-md flex justify-center items-center transition-all ${
                style.position === 'bottom'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={t.posBottom}
            >
              <AlignVerticalJustifyEnd className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Font Size */}
        <div className="bg-[#0e1320] p-2.5 rounded-xl border border-white/10">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            {t.fontSize}
          </label>
          <div className="flex gap-1 bg-[#151c2e] p-1 rounded-lg justify-between">
            {FONT_SIZES.map((f) => (
              <button
                key={f.id}
                onClick={() => setFontSize(f.id)}
                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                  style.fontSize === f.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Color */}
        <div className="bg-[#0e1320] p-2.5 rounded-xl border border-white/10">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            {t.textColor}
          </label>
          <div className="flex items-center gap-1.5 bg-[#151c2e] p-1.5 rounded-lg justify-between">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => setTextColor(c.hex)}
                className={`w-5 h-5 rounded-full transition-transform ${
                  style.textColor === c.hex ? 'scale-125 ring-2 ring-rose-500' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Background Box */}
        <div className="bg-[#0e1320] p-2.5 rounded-xl border border-white/10">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            {t.backgroundStyle}
          </label>
          <div className="grid grid-cols-3 gap-1 bg-[#151c2e] p-1 rounded-lg text-center text-xs">
            <button
              onClick={() => setBg('none')}
              className={`py-1 rounded-md transition-all text-[11px] font-medium ${
                style.backgroundColor === 'none'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Clear
            </button>
            <button
              onClick={() => setBg('translucent')}
              className={`py-1 rounded-md transition-all text-[11px] font-medium ${
                style.backgroundColor === 'translucent'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Box
            </button>
            <button
              onClick={() => setBg('solid')}
              className={`py-1 rounded-md transition-all text-[11px] font-medium ${
                style.backgroundColor === 'solid'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Subtitles Visibility Controls (Prevent obscuring video) */}
      <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Subtitles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">
              {t.subtitlesVisibility}
            </span>
          </div>
          {/* Quick Clear/Hide All Subtitles button */}
          <button
            type="button"
            onClick={() => {
              const allHidden = style.showKhmerSubtitles === false && style.showSourceSubtitles === false;
              onChangeStyle({
                ...style,
                showKhmerSubtitles: allHidden ? true : false,
                showSourceSubtitles: false,
              });
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
              style.showKhmerSubtitles === false && style.showSourceSubtitles === false
                ? 'bg-rose-500/25 text-rose-300 border-rose-500/40 shadow-xs'
                : 'bg-[#151c2e] text-slate-300 border-white/10 hover:border-white/20'
            }`}
          >
            {style.showKhmerSubtitles === false && style.showSourceSubtitles === false ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                <span>{uiLang === 'km' ? 'បានលុបចេញបាំង' : 'Hidden'}</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.hideSubtitles}</span>
              </>
            )}
          </button>
        </div>

        {/* Individual Subtitle Toggles: Khmer & Chinese */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Khmer Subtitle Toggle */}
          <div className="flex items-center justify-between bg-[#0e1320] p-2 rounded-xl border border-white/10">
            <span className="text-slate-300 text-xs">
              {t.showKhmerSub}
            </span>
            <button
              type="button"
              onClick={() =>
                onChangeStyle({
                  ...style,
                  showKhmerSubtitles: style.showKhmerSubtitles === false ? true : false,
                })
              }
              className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all border ${
                style.showKhmerSubtitles !== false
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-white/10'
              }`}
            >
              {style.showKhmerSubtitles !== false ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Chinese Subtitle Toggle */}
          <div className="flex items-center justify-between bg-[#0e1320] p-2 rounded-xl border border-white/10">
            <span className="text-slate-300 text-xs">
              {t.showChineseSub}
            </span>
            <button
              type="button"
              onClick={() =>
                onChangeStyle({
                  ...style,
                  showSourceSubtitles: style.showSourceSubtitles === true ? false : true,
                })
              }
              className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all border ${
                style.showSourceSubtitles === true
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-white/10'
              }`}
            >
              {style.showSourceSubtitles === true ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Subtitle Opacity Slider & Speaker Tag */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
          <div className="flex items-center justify-between bg-[#0e1320] px-2.5 py-1.5 rounded-xl border border-white/10">
            <span className="text-slate-400 text-[11px] font-medium">
              {uiLang === 'km' ? 'ភាពថ្លា (Opacity)' : 'Subtitle Opacity'}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.1"
                value={style.opacity ?? 1}
                onChange={(e) =>
                  onChangeStyle({
                    ...style,
                    opacity: parseFloat(e.target.value),
                  })
                }
                className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <span className="text-[10px] font-mono text-slate-300 w-7 text-right">
                {Math.round((style.opacity ?? 1) * 100)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#0e1320] px-2.5 py-1.5 rounded-xl border border-white/10">
            <span className="text-slate-400 text-[11px] font-medium">
              {t.showSpeakerBadge}
            </span>
            <button
              type="button"
              onClick={() =>
                onChangeStyle({
                  ...style,
                  showSpeakerBadge: style.showSpeakerBadge === false ? true : false,
                })
              }
              className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all border ${
                style.showSpeakerBadge !== false
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-white/10'
              }`}
            >
              {style.showSpeakerBadge !== false ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
