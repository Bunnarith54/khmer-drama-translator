import React from 'react';
import { Clock3, Mic2, Music2, Wand2 } from 'lucide-react';
import { AppUiLang, DramaCharacter, SubtitleSegment } from '../types';

interface Props {
  uiLang: AppUiLang;
  subtitles: SubtitleSegment[];
  characters: DramaCharacter[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export const DubbingTimeline: React.FC<Props> = ({ uiLang, subtitles, characters, currentTime, duration, onSeek }) => {
  const km = uiLang === 'km';
  const total = Math.max(duration || 1, 1);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const colorFor = (id?: string) => {
    const i = Math.max(0, characters.findIndex(c => c.id === id));
    return ['bg-violet-500/80','bg-cyan-500/80','bg-fuchsia-500/80','bg-emerald-500/80','bg-amber-500/80'][i % 5];
  };
  return <section className="glass-panel rounded-3xl p-4 sm:p-5 border border-violet-500/20 shadow-xl shadow-violet-950/10">
    <div className="flex items-center justify-between mb-3 gap-3">
      <div className="flex items-center gap-2"><Wand2 className="w-4 h-4 text-violet-300"/><h2 className="text-sm font-bold text-white">{km ? 'Dubbing Timeline' : 'Dubbing Timeline'}</h2></div>
      <span className="text-[10px] font-mono text-slate-400">{fmt(currentTime)} / {fmt(duration)}</span>
    </div>
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="relative h-5 text-[9px] text-slate-500 font-mono mb-2">
          {[0,.25,.5,.75,1].map(p => <button key={p} onClick={() => onSeek(total*p)} className="absolute -translate-x-1/2 hover:text-white" style={{left:`${p*100}%`}}>{fmt(total*p)}</button>)}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2"><span className="w-16 text-[10px] text-slate-500 flex items-center gap-1"><Mic2 className="w-3 h-3"/> Voice</span><div className="relative h-8 flex-1 bg-slate-900 rounded-lg overflow-hidden border border-white/5">
            {subtitles.map((s,i)=><button key={s.id} title={s.khmerText} onClick={()=>onSeek(s.startTime)} className={`absolute top-1 bottom-1 rounded-md ${colorFor(s.characterId)} hover:brightness-125 transition-all`} style={{left:`${(s.startTime/total)*100}%`,width:`${Math.max(((s.endTime-s.startTime)/total)*100,.5)}%`}}><span className="block truncate px-1 text-[8px] text-white">{i+1}</span></button>)}
            <div className="absolute top-0 bottom-0 w-px bg-white shadow-[0_0_8px_rgba(255,255,255,.9)]" style={{left:`${Math.min(currentTime/total,1)*100}%`}}/>
          </div></div>
          <div className="flex items-center gap-2"><span className="w-16 text-[10px] text-slate-500 flex items-center gap-1"><Music2 className="w-3 h-3"/> Music</span><div className="relative h-8 flex-1 rounded-lg overflow-hidden border border-white/5 bg-gradient-to-r from-violet-500/10 via-indigo-500/20 to-violet-500/10"><div className="absolute inset-0 opacity-40" style={{backgroundImage:'repeating-linear-gradient(90deg, transparent 0 7px, rgba(167,139,250,.25) 8px, transparent 9px)'}}/></div></div>
        </div>
      </div>
    </div>
    <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500"><Clock3 className="w-3.5 h-3.5"/><span>{km ? 'ចុចលើ Clip ដើម្បីលោតទៅ Timestamp ហើយកែ Subtitle/Voice នៅ Editor។' : 'Tap a clip to jump to its timestamp and edit subtitle or voice.'}</span></div>
  </section>;
};
