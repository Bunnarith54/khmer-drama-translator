import React from 'react';
import {
  FileAudio,
  Languages,
  Subtitles,
  Mic,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Film,
} from 'lucide-react';
import { ProcessingStep, AppUiLang } from '../types';
import { UI_TEXT } from '../data/translations';

interface ProgressModalProps {
  step: ProcessingStep;
  progressPercent: number;
  errorMessage?: string;
  uiLang: AppUiLang;
  onClose?: () => void;
  onRetry?: () => void;
}

const STEPS_CONFIG = [
  {
    key: 'extracting_audio',
    labelKm: 'ទាញយកសំឡេងពីវីដេអូ',
    labelEn: 'Extracting Audio Track',
    icon: FileAudio,
    pct: 20,
  },
  {
    key: 'speech_recognition',
    labelKm: 'បម្លែងសំឡេងចិនជាអក្សរ (Speech-to-Text)',
    labelEn: 'Chinese Speech Recognition',
    icon: Mic,
    pct: 45,
  },
  {
    key: 'translation',
    labelKm: 'បកប្រែជាភាសាខ្មែរតាមកាលវេលា',
    labelEn: 'Translating Chinese to Khmer',
    icon: Languages,
    pct: 70,
  },
  {
    key: 'generating_subtitles',
    labelKm: 'បង្កើតឯកសារចំណងជើងរង (SRT Sync)',
    labelEn: 'Generating Synchronized Subtitles',
    icon: Subtitles,
    pct: 88,
  },
  {
    key: 'generating_voice',
    labelKm: 'រៀបចំសំឡេងអានខ្មែរ (Khmer Voice)',
    labelEn: 'Preparing Khmer Voiceover',
    icon: Film,
    pct: 98,
  },
];

export const ProgressModal: React.FC<ProgressModalProps> = ({
  step,
  progressPercent,
  errorMessage,
  uiLang,
  onClose,
  onRetry,
}) => {
  const t = UI_TEXT[uiLang];

  if (step === 'idle') return null;

  const isError = step === 'error';
  const isCompleted = step === 'completed';

  const getCurrentStepIndex = () => {
    switch (step) {
      case 'extracting_audio':
        return 0;
      case 'speech_recognition':
        return 1;
      case 'translation':
        return 2;
      case 'generating_subtitles':
        return 3;
      case 'generating_voice':
        return 4;
      case 'completed':
        return 5;
      default:
        return 0;
    }
  };

  const currentStepIdx = getCurrentStepIndex();

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-white/20">
        {/* Decorative ambient gradient */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {isError ? (
          /* Error State */
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-lg">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {uiLang === 'km' ? 'ដំណើរការបរាជ័យ' : 'Processing Failed'}
            </h3>
            <p className="text-xs text-slate-300 mb-6 bg-[#0e1424] p-3 rounded-xl border border-white/10 font-mono">
              {errorMessage || t.errorProcessing}
            </p>
            <div className="flex gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white text-sm transition-all shadow-md shadow-rose-950/50"
                >
                  {uiLang === 'km' ? 'ព្យាយាមម្តងទៀត' : 'Try Again'}
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium text-slate-300 text-sm transition-all border border-white/10"
                >
                  {uiLang === 'km' ? 'បិទ' : 'Close'}
                </button>
              )}
            </div>
          </div>
        ) : isCompleted ? (
          /* Completed State */
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {t.completed}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {uiLang === 'km'
                ? 'ចំណងជើងរង និងសំឡេងអានខ្មែរត្រូវបានបង្កើតដោយជោគជ័យ'
                : 'Khmer subtitles and voice sync are now ready for preview and editing'}
            </p>
            {onClose && (
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-sm transition-all shadow-md shadow-emerald-950/50"
              >
                {uiLang === 'km' ? 'មើល និងកែសម្រួល' : 'Preview & Edit'}
              </button>
            )}
          </div>
        ) : (
          /* Active Processing State */
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  AI Video Workflow
                </span>
                <h3 className="text-base font-bold text-white">
                  {t.translating}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-rose-400 font-mono">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden mb-6 p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Step-by-Step Checklist */}
            <div className="space-y-2.5">
              {STEPS_CONFIG.map((s, idx) => {
                const Icon = s.icon;
                const isStepDone = currentStepIdx > idx;
                const isStepActive = currentStepIdx === idx;

                return (
                  <div
                    key={s.key}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      isStepActive
                        ? 'bg-rose-500/15 border-rose-500/40 text-white'
                        : isStepDone
                        ? 'bg-[#0e1424]/80 border-white/5 text-slate-300'
                        : 'bg-transparent border-transparent text-slate-500 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isStepDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isStepActive
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-900/50'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isStepDone ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isStepActive ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {uiLang === 'km' ? s.labelKm : s.labelEn}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {isStepDone
                          ? 'រួចរាល់ (Done)'
                          : isStepActive
                          ? 'កំពុងដំណើរការ...'
                          : 'រង់ចាំ...'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
