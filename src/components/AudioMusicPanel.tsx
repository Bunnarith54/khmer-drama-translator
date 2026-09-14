import React from 'react';
import { AudioLines, Music2, Mic2, Sparkles, Play, Pause, Waves, ShieldCheck, Radio, RotateCcw } from 'lucide-react';
import { AppUiLang } from '../types';

interface AudioMusicPanelProps {
  uiLang: AppUiLang;
  musicVolume: number;
  voiceVolume: number;
  dubbingVolume: number;
  sfxVolume: number;
  isolationEnabled: boolean;
  enhancementEnabled: boolean;
  isPreviewing: boolean;
  onMusicVolumeChange: (value: number) => void;
  onVoiceVolumeChange: (value: number) => void;
  onDubbingVolumeChange: (value: number) => void;
  onSfxVolumeChange: (value: number) => void;
  onToggleIsolation: () => void;
  onToggleEnhancement: () => void;
  onPreview: () => void;
  onResetMix?: () => void;
  separationStatus?: 'idle' | 'processing' | 'ready' | 'unavailable' | 'error';
  onRunSeparation?: () => void;
}

export const AudioMusicPanel: React.FC<AudioMusicPanelProps> = ({
  uiLang, musicVolume, voiceVolume, dubbingVolume, sfxVolume, isolationEnabled, enhancementEnabled, isPreviewing,
  onMusicVolumeChange, onVoiceVolumeChange, onDubbingVolumeChange, onSfxVolumeChange, onToggleIsolation, onToggleEnhancement, onPreview, onResetMix, separationStatus = 'idle', onRunSeparation,
}) => {
  const km = uiLang === 'km';
  return (
    <section className="glass-panel rounded-3xl p-4 sm:p-5 border border-indigo-500/20 shadow-xl shadow-indigo-950/10">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-950/50">
            <AudioLines className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{km ? 'Audio Music' : 'Audio Music'}</h2>
            <p className="text-[11px] text-slate-400">{km ? 'រៀបចំសំឡេងភ្លេង សំឡេងតួអង្គ និងគុណភាពសំឡេង' : 'Control music, voice and audio enhancement'}</p>
          </div>
        </div>
        <span className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 font-semibold">AUDIO</span>
      </div>

      <div className="grid gap-3">
        <div className={`rounded-2xl p-3.5 border transition-all ${isolationEnabled ? 'bg-violet-500/10 border-violet-500/40' : 'bg-slate-900/70 border-white/10'}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center"><Music2 className="w-4 h-4 text-violet-300" /></div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{km ? 'Background Music Isolation' : 'Background Music Isolation'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{km ? 'បំបែកភ្លេងចេញពីសំឡេងនិយាយ ដោយ Audio Separation Engine' : 'Separate music from dialogue with an audio separation engine'}</p>
              </div>
            </div>
            <button type="button" onClick={onToggleIsolation} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${isolationEnabled ? 'bg-violet-600' : 'bg-slate-700'}`} aria-label="Toggle music isolation">
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isolationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-amber-300/90 bg-amber-500/5 border border-amber-500/10 rounded-xl px-3 py-2">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{separationStatus === 'ready' ? (km ? 'បានបំបែក Audio Stems រួចរាល់។ អ្នកអាច Mix Voice / Music / SFX បាន។' : 'Audio stems are ready. You can mix Voice / Music / SFX.') : (km ? 'ការបំបែកសំឡេងពិតប្រាកដត្រូវការ Audio Separation Engine នៅ Backend។' : 'True separation requires an Audio Separation Engine on the backend.')}</span>
          </div>
          {isolationEnabled && onRunSeparation && (
            <button type="button" onClick={onRunSeparation} disabled={separationStatus === 'processing'} className="mt-3 w-full py-2.5 rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-200 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {separationStatus === 'processing' ? <Radio className="w-3.5 h-3.5 animate-pulse" /> : <Sparkles className="w-3.5 h-3.5" />}
              {separationStatus === 'processing' ? (km ? 'កំពុងបំបែកសំឡេង…' : 'Separating audio…') : (km ? 'ចាប់ផ្ដើម AI Audio Separation' : 'Run AI Audio Separation')}
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-slate-900/70 rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-slate-200 flex items-center gap-2"><Music2 className="w-3.5 h-3.5 text-violet-300" />{km ? 'Music Volume' : 'Music Volume'}</span><span className="text-[10px] font-mono text-violet-300">{musicVolume}%</span></div>
            <input type="range" min="0" max="100" value={musicVolume} onChange={(e) => onMusicVolumeChange(Number(e.target.value))} className="w-full accent-violet-500" />
          </div>
          <div className="bg-slate-900/70 rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-slate-200 flex items-center gap-2"><Mic2 className="w-3.5 h-3.5 text-cyan-300" />{km ? 'Voice Volume' : 'Voice Volume'}</span><span className="text-[10px] font-mono text-cyan-300">{voiceVolume}%</span></div>
            <input type="range" min="0" max="100" value={voiceVolume} onChange={(e) => onVoiceVolumeChange(Number(e.target.value))} className="w-full accent-cyan-500" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div className="bg-slate-900/70 rounded-2xl p-3.5 border border-white/10"><div className="flex justify-between mb-2"><span className="text-xs font-semibold text-slate-200">🎙️ Dubbing Voice</span><span className="text-[10px] font-mono text-cyan-300">{dubbingVolume}%</span></div><input type="range" min="0" max="100" value={dubbingVolume} onChange={e=>onDubbingVolumeChange(Number(e.target.value))} className="w-full accent-cyan-500" /></div>
          <div className="bg-slate-900/70 rounded-2xl p-3.5 border border-white/10"><div className="flex justify-between mb-2"><span className="text-xs font-semibold text-slate-200">✨ SFX Volume</span><span className="text-[10px] font-mono text-amber-300">{sfxVolume}%</span></div><input type="range" min="0" max="100" value={sfxVolume} onChange={e=>onSfxVolumeChange(Number(e.target.value))} className="w-full accent-amber-500" /></div>
        </div>

        <div className="flex items-center justify-between bg-slate-900/70 rounded-2xl p-3.5 border border-white/10">
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center"><Waves className="w-4 h-4 text-cyan-300" /></div><div><p className="text-sm font-semibold text-white">{km ? 'Audio Enhancement' : 'Audio Enhancement'}</p><p className="text-[10px] text-slate-400">{km ? 'សម្អាត Noise និងបង្កើនភាពច្បាស់' : 'Noise reduction and clarity enhancement'}</p></div></div>
          <button type="button" onClick={onToggleEnhancement} className={`relative w-11 h-6 rounded-full transition-colors ${enhancementEnabled ? 'bg-cyan-600' : 'bg-slate-700'}`}><span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${enhancementEnabled ? 'translate-x-6' : 'translate-x-1'}`} /></button>
        </div>

        <div className="bg-slate-900/70 rounded-2xl p-3.5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><AudioLines className="w-3.5 h-3.5 text-indigo-300" /><span className="text-xs font-semibold text-slate-200">{km ? 'Audio Mix' : 'Audio Mix'}</span></div>
            <button type="button" onClick={onResetMix} className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"><RotateCcw className="w-3 h-3" />{km ? 'កំណត់ឡើងវិញ' : 'Reset'}</button>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400"><span className="w-12">Original</span><div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-cyan-500/80" style={{width: `${voiceVolume}%`}} /></div><span className="w-8 text-right font-mono">{voiceVolume}%</span></div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2"><span className="w-12">Music</span><div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-violet-500/80" style={{width: `${musicVolume}%`}} /></div><span className="w-8 text-right font-mono">{musicVolume}%</span></div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2"><span className="w-12">Dub</span><div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-cyan-500/80" style={{width: `${dubbingVolume}%`}} /></div><span className="w-8 text-right font-mono">{dubbingVolume}%</span></div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2"><span className="w-12">SFX</span><div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-amber-500/80" style={{width: `${sfxVolume}%`}} /></div><span className="w-8 text-right font-mono">{sfxVolume}%</span></div>
          <p className="text-[10px] text-slate-500 mt-3">{km ? 'Mixer Preview អនុវត្តលើសំឡេងដែលមានក្នុងវីដេអូ។ Isolation ពិតប្រាកដត្រូវការ Stem Separation Engine។' : 'Mixer Preview applies to the audio available in the video. True isolation requires a stem separation engine.'}</p>
        </div>

        <button type="button" onClick={onPreview} className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 active:scale-[0.99] transition-all">
          {isPreviewing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPreviewing ? (km ? 'ផ្អាក Preview Audio' : 'Pause Audio Preview') : (km ? 'Preview Audio' : 'Preview Audio')}
          <Sparkles className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>
    </section>
  );
};
