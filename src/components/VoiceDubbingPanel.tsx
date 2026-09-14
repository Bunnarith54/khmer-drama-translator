import { apiUrl } from '../utils/api';
import React, { useMemo, useState } from 'react';
import { Mic2, Play, Loader2, Volume2, SlidersHorizontal, Sparkles, Wand2 } from 'lucide-react';
import { AppUiLang, DramaCharacter, SubtitleSegment } from '../types';
import { DubbingClip } from '../utils/dubbingExporter';

interface Props {
  uiLang: AppUiLang;
  subtitles: SubtitleSegment[];
  characters: DramaCharacter[];
  apiKey: string;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  muteOriginalAudio: boolean;
  onMuteOriginalChange: (v: boolean) => void;
  onDubbingReady?: (clips: DubbingClip[]) => void;
  onUpdateCharacter?: (character: DramaCharacter) => void;
  audioStems?: { vocalsData?: string; musicData?: string; mimeType?: string };
  musicVolume?: number;
  voiceVolume?: number;
}

export const VoiceDubbingPanel: React.FC<Props> = ({ uiLang, subtitles, characters, apiKey, enabled, onEnabledChange, muteOriginalAudio, onMuteOriginalChange, onDubbingReady, onUpdateCharacter }) => {
  const [voice, setVoice] = useState('Puck');
  const [ttsModel, setTtsModel] = useState('gemini-3.1-flash-tts-preview');
  const [style, setStyle] = useState('natural');
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(100);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [generatedCount, setGeneratedCount] = useState(0);

  const firstText = useMemo(() => subtitles.find(s => s.khmerText)?.khmerText || 'សួស្តី! នេះជាសំឡេងសាកល្បងសម្រាប់ Khmer Drama Translator។', [subtitles]);
  const voices = [['Puck','ប្រុស • Natural'],['Charon','ប្រុស • Deep'],['Kore','ស្រី • Soft'],['Fenrir','ប្រុស • Strong'],['Aoede','ស្រី • Warm']];

  const requestTts = async (text: string, selectedVoice: string) => {
    const r = await fetch(apiUrl('/api/tts'), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text, voice:selectedVoice, model:ttsModel, style, apiKey:apiKey.trim() || undefined }) });
    const d = await r.json();
    if (!r.ok) throw new Error(d?.error || 'TTS request failed');
    if (!d.audioData) throw new Error('Gemini TTS did not return audio.');
    return d;
  };

  const testVoice = async () => {
    setLoading(true); setStatus(uiLang==='km'?'កំពុងបង្កើតសំឡេងសាកល្បង...':'Generating voice sample...');
    try {
      const d = await requestTts(firstText, voice);
      const url = `data:${d.mimeType || 'audio/wav'};base64,${d.audioData}`;
      setAudioUrl(url);
      const a = new Audio(url); a.volume=volume/100; a.playbackRate=speed; await a.play();
      setStatus(uiLang==='km'?'សាកល្បងសំឡេងរួចរាល់':'Voice sample ready');
    } catch(e:any) { setStatus(e?.message || (uiLang==='km'?'បង្កើតសំឡេងមិនបាន':'Voice generation failed')); }
    finally { setLoading(false); }
  };

  const generateFullDubbing = async () => {
    if (!subtitles.length) return;
    setLoading(true); setGeneratedCount(0); setStatus(uiLang==='km'?'កំពុងបង្កើតសំឡេងតាមរាល់ subtitle...':'Generating timed dubbing for every subtitle...');
    try {
      const clips: DubbingClip[] = [];
      for (let i=0;i<subtitles.length;i++) {
        const sub = subtitles[i];
        const character = characters.find(c => c.id === sub.characterId || c.name === sub.speaker);
        const selectedVoice = character?.geminiVoice || voice;
        const d = await requestTts(sub.khmerText, selectedVoice);
        clips.push({ subtitleId: sub.id, audioData:d.audioData, mimeType:d.mimeType, rate: character?.rate || speed, volume: (character?.volume ?? 1) * (volume / 100), pitch: character?.pitch || pitch, startTime: sub.startTime });
        setGeneratedCount(i+1);
      }
      onDubbingReady?.(clips);
      setStatus(uiLang==='km' ? `បានបង្កើតសំឡេង ${clips.length} បន្ទាត់រួចរាល់ ✓` : `${clips.length} timed voice clips generated ✓`);
    } catch(e:any) { setStatus(e?.message || (uiLang==='km'?'បង្កើត Dubbing មិនបាន':'Full dubbing failed')); }
    finally { setLoading(false); }
  };

  return <section className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 shadow-lg">
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg"><Mic2 className="w-5 h-5"/></div><div><h3 className="font-bold text-white text-sm sm:text-base">AI Voice & Dubbing</h3><p className="text-[11px] text-slate-400">{uiLang==='km'?'បង្កើតសំឡេងខ្មែរ និងដាក់តាម timestamp':'Generate Khmer voices and sync them to timestamps'}</p></div></div>
      <button onClick={()=>onEnabledChange(!enabled)} className={`w-12 h-6 rounded-full p-0.5 transition ${enabled?'bg-emerald-500':'bg-slate-700'}`}><span className={`block w-5 h-5 rounded-full bg-white transition ${enabled?'translate-x-6':''}`}/></button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="rounded-xl bg-slate-950/50 border border-white/10 p-3"><label className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-2"><Mic2 className="w-3.5 h-3.5"/> AI Voice</label><select value={voice} onChange={e=>setVoice(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none">{voices.map(([id,label])=><option key={id} value={id}>{id} — {label}</option>)}</select></div>
      <div className="rounded-xl bg-slate-950/50 border border-white/10 p-3"><label className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-2"><Wand2 className="w-3.5 h-3.5"/> TTS Model</label><select value={ttsModel} onChange={e=>setTtsModel(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"><option value="gemini-3.1-flash-tts-preview">Gemini 3.1 Flash TTS • Recommended</option><option value="gemini-2.5-flash-preview-tts">Gemini 2.5 Flash TTS • Fast</option><option value="gemini-2.5-pro-preview-tts">Gemini 2.5 Pro TTS • Quality</option></select></div>
    </div>
    <div className="mt-3 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-950/50 border border-white/10 p-3"><label className="text-[11px] text-slate-400 mb-2 block">Voice Style</label><select value={style} onChange={e=>setStyle(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"><option value="natural">Natural</option><option value="dramatic">Dramatic</option><option value="soft">Soft / Warm</option></select></div><div className="rounded-xl bg-slate-950/50 border border-white/10 p-3"><label className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-2"><Volume2 className="w-3.5 h-3.5"/> Original Audio</label><button onClick={()=>onMuteOriginalChange(!muteOriginalAudio)} className={`w-full rounded-lg px-3 py-2 text-xs font-bold border ${muteOriginalAudio?'bg-amber-500/15 text-amber-300 border-amber-500/30':'bg-slate-800 text-slate-300 border-white/10'}`}>{muteOriginalAudio?'🔇 Mute Original':'🔊 Keep Original'}</button></div></div>
    <div className="mt-3 rounded-xl bg-slate-950/50 border border-white/10 p-3">
      <div className="flex items-center justify-between gap-2 mb-3"><div className="flex items-center gap-2 text-xs font-bold text-white"><SlidersHorizontal className="w-4 h-4 text-cyan-400"/> Character Voice Map</div><span className="text-[10px] text-slate-500">{characters.length} speakers</span></div>
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {characters.map((c) => <div key={c.id} className="grid grid-cols-[1fr_auto] gap-2 items-center rounded-xl border border-white/5 bg-slate-900/60 px-2.5 py-2">
          <div className="min-w-0"><div className="text-xs font-semibold text-white truncate">{c.avatarEmoji} {c.name}</div><div className="text-[9px] text-slate-500">Rate {c.rate.toFixed(2)} • Pitch {c.pitch.toFixed(2)} • Vol {Math.round((c.volume ?? 1) * 100)}%</div></div>
          <select value={c.geminiVoice || voice} onChange={e=>onUpdateCharacter?.({...c, geminiVoice:e.target.value as DramaCharacter['geminiVoice']})} className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white">{voices.map(([id,label])=><option key={id} value={id}>{id}</option>)}</select>
        </div>)}
      </div>
      <p className="text-[9px] text-slate-500 mt-2">{uiLang==='km'?'តួអង្គនីមួយៗអាចប្រើ Voice ខុសគ្នា។':'Each character can use a different Gemini voice.'}</p>
    </div>
    <div className="mt-3 rounded-xl bg-slate-950/50 border border-white/10 p-3"><div className="flex items-center gap-2 text-xs font-bold text-white mb-3"><SlidersHorizontal className="w-4 h-4 text-cyan-400"/> Voice Settings</div><div className="grid grid-cols-3 gap-3">{[['speed',speed,setSpeed,0.7,1.3],['pitch',pitch,setPitch,0.7,1.4],['volume',volume,setVolume,0,100]].map(([key,val,setter,min,max]:any)=><label key={key} className="text-[10px] text-slate-400 capitalize">{key}<input type="range" min={min} max={max} step={key==='volume'?1:0.05} value={val} onChange={e=>setter(Number(e.target.value))} className="w-full accent-violet-500"/><span className="text-white font-mono">{key==='volume'?`${val}%`:Number(val).toFixed(2)}</span></label>)}</div></div>
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2"><button disabled={loading} onClick={testVoice} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2"><Sparkles className="w-4 h-4"/>{loading?'កំពុងបង្កើត...':'សាកល្បង AI Voice'}</button><button disabled={loading || !subtitles.length} onClick={generateFullDubbing} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-2"><Wand2 className="w-4 h-4"/>Generate Full Dubbing</button></div>
    {loading && subtitles.length>0 && <div className="mt-2 text-[10px] text-cyan-300">{generatedCount}/{subtitles.length} clips</div>}
    {status && <div className="mt-2 text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-2">{status}</div>}
    {audioUrl && <audio controls src={audioUrl} className="w-full mt-3 h-9"/>}
  </section>;
};
