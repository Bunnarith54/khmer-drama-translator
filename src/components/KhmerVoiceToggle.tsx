import React from 'react';
import { Mic, Volume2, Sparkles, VolumeX } from 'lucide-react';
import { AppUiLang } from '../types';
import { UI_TEXT } from '../data/translations';
import { khmerTts } from '../utils/khmerTts';

interface KhmerVoiceToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  muteOriginalAudio: boolean;
  onToggleMuteOriginal: () => void;
  sampleText?: string;
  uiLang: AppUiLang;
}

export const KhmerVoiceToggle: React.FC<KhmerVoiceToggleProps> = ({
  isEnabled,
  onToggle,
  muteOriginalAudio,
  onToggleMuteOriginal,
  sampleText = 'សួស្តី! នេះគឺជាការសាកល្បងសំឡេងអានខ្មែរសម្រាប់រឿងភាគចិន។',
  uiLang,
}) => {
  const t = UI_TEXT[uiLang];

  const handleTestVoice = () => {
    khmerTts.speak(sampleText);
  };

  return (
    <div className="glass-panel rounded-2xl p-3.5 sm:p-4 shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Toggle Switch & Label */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggle(!isEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 focus:outline-none shrink-0 ${
              isEnabled ? 'bg-emerald-500 shadow-sm shadow-emerald-950' : 'bg-slate-800 border border-white/10'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Mic className={`w-4 h-4 ${isEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
                {t.khmerVoice}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-white/5'
                }`}
              >
                {isEnabled ? t.voiceOn : t.voiceOff}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.voiceDesc}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {isEnabled && (
            <button
              onClick={onToggleMuteOriginal}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                muteOriginalAudio
                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                  : 'bg-slate-800/80 border-white/10 text-slate-300 hover:bg-slate-700'
              }`}
              title="Mute original Chinese audio while Khmer voice is speaking"
            >
              {muteOriginalAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{muteOriginalAudio ? 'Muted Video Sound' : 'Video Sound Active'}</span>
            </button>
          )}

          <button
            onClick={handleTestVoice}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 transition-all flex items-center gap-1.5 border border-white/10 hover:border-rose-500/30"
          >
            <Volume2 className="w-3.5 h-3.5 text-rose-400" />
            <span>{t.testVoice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
