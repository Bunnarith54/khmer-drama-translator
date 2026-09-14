import React, { useState } from 'react';
import {
  Play,
  Plus,
  Trash2,
  Clock,
  MessageSquare,
  Sparkles,
  Volume2,
  Users,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { SubtitleSegment, AppUiLang, DramaCharacter } from '../types';
import { UI_TEXT } from '../data/translations';
import { formatTime } from '../utils/srt';
import { CHARACTER_COLOR_CLASSES } from '../data/defaultCharacters';
import { khmerTts } from '../utils/khmerTts';

interface SubtitleEditorProps {
  subtitles: SubtitleSegment[];
  onChangeSubtitles: (subtitles: SubtitleSegment[]) => void;
  onSeekTo: (time: number) => void;
  currentTime: number;
  uiLang: AppUiLang;
  characters: DramaCharacter[];
  apiKey?: string;
  onOpenCharacterManager?: () => void;
}

export const SubtitleEditor: React.FC<SubtitleEditorProps> = ({
  subtitles,
  onChangeSubtitles,
  onSeekTo,
  currentTime,
  uiLang,
  characters,
  apiKey,
  onOpenCharacterManager,
}) => {
  const t = UI_TEXT[uiLang];
  const [filterText, setFilterText] = useState('');
  const [selectedCharacterFilter, setSelectedCharacterFilter] = useState<string>('all');
  const [activeDropdownSubId, setActiveDropdownSubId] = useState<string | null>(null);

  const handleUpdateKhmerText = (id: string, text: string) => {
    onChangeSubtitles(
      subtitles.map((s) => (s.id === id ? { ...s, khmerText: text } : s))
    );
  };

  const handleUpdateChineseText = (id: string, text: string) => {
    onChangeSubtitles(
      subtitles.map((s) => (s.id === id ? { ...s, sourceText: text } : s))
    );
  };

  const handleAssignCharacter = (subId: string, char: DramaCharacter) => {
    onChangeSubtitles(
      subtitles.map((s) =>
        s.id === subId
          ? {
              ...s,
              characterId: char.id,
              speaker: char.name,
            }
          : s
      )
    );
    setActiveDropdownSubId(null);
  };

  const handleNudge = (id: string, field: 'startTime' | 'endTime', delta: number) => {
    onChangeSubtitles(
      subtitles.map((s) => {
        if (s.id === id) {
          const newVal = Math.max(0, parseFloat((s[field] + delta).toFixed(2)));
          return { ...s, [field]: newVal };
        }
        return s;
      })
    );
  };

  const handleDelete = (id: string) => {
    onChangeSubtitles(subtitles.filter((s) => s.id !== id));
  };

  const handleAddLine = () => {
    const lastSub = subtitles[subtitles.length - 1];
    const newStart = lastSub ? parseFloat((lastSub.endTime + 0.2).toFixed(2)) : 0;
    const newEnd = parseFloat((newStart + 2.5).toFixed(2));
    const defaultChar = characters[0];
    const newSub: SubtitleSegment = {
      id: Date.now().toString(),
      startTime: newStart,
      endTime: newEnd,
      sourceText: '新台词 (New Line)',
      khmerText: 'អត្ថបទសន្ទនាថ្មី...',
      speaker: defaultChar ? defaultChar.name : 'តួអង្គ (Character)',
      characterId: defaultChar?.id,
    };
    onChangeSubtitles([...subtitles, newSub]);
  };

  const handleAuditionLine = (sub: SubtitleSegment) => {
    const matchedChar = characters.find(
      (c) => c.id === sub.characterId || c.name === sub.speaker
    );
    const pitch = matchedChar ? matchedChar.pitch : 1.0;
    const rate = matchedChar ? matchedChar.rate : 1.0;
    const voiceName = matchedChar?.geminiVoice;
    const gender = matchedChar?.gender || (sub.speaker?.includes('ស្រី') ? 'female' : 'male');

    khmerTts.speak({
      text: sub.khmerText,
      voiceName,
      gender,
      pitch,
      rate,
      apiKey,
    });
  };

  // Find character for a subtitle segment
  const getSubCharacter = (sub: SubtitleSegment): DramaCharacter | undefined => {
    if (sub.characterId) {
      const found = characters.find((c) => c.id === sub.characterId);
      if (found) return found;
    }
    if (sub.speaker) {
      const found = characters.find((c) => c.name === sub.speaker);
      if (found) return found;
    }
    return undefined;
  };

  const filteredSubs = subtitles.filter((s) => {
    const matchesText =
      s.khmerText.toLowerCase().includes(filterText.toLowerCase()) ||
      s.sourceText.toLowerCase().includes(filterText.toLowerCase());

    if (!matchesText) return false;

    if (selectedCharacterFilter === 'all') return true;
    const char = getSubCharacter(s);
    return char?.id === selectedCharacterFilter || s.speaker === selectedCharacterFilter;
  });

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.08]">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-rose-400" />
            <span>{t.subtitleEditor}</span>
            <span className="bg-rose-500/20 text-rose-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-rose-500/30">
              {subtitles.length} {uiLang === 'km' ? 'ជួរ' : 'lines'}
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            {uiLang === 'km'
              ? 'កែសម្រួលអត្ថបទបកប្រែ រើសតួអង្គនិយាយ និងពេលវេលារត់ចំណងជើងរង'
              : 'Edit translation, assign character speakers, and fine-tune timing'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onOpenCharacterManager && (
            <button
              type="button"
              onClick={onOpenCharacterManager}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition-all active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.manageCharacters}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAddLine}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addSubtitle}</span>
          </button>
        </div>
      </div>

      {/* Filter by Character & Search Bar */}
      <div className="space-y-2 mb-3">
        {/* Character filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1 mr-1">
            <Users className="w-3 h-3 text-rose-400" />
            {t.filterByCharacter}:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCharacterFilter('all')}
            className={`text-xs px-2.5 py-1 rounded-lg shrink-0 transition-all ${
              selectedCharacterFilter === 'all'
                ? 'bg-rose-600 text-white font-bold shadow-sm'
                : 'bg-[#0e1320] text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            {t.allCharacters} ({subtitles.length})
          </button>

          {characters.map((char) => {
            const count = subtitles.filter(
              (s) => s.characterId === char.id || s.speaker === char.name
            ).length;
            const isSelected = selectedCharacterFilter === char.id;
            const col = CHARACTER_COLOR_CLASSES[char.color] || CHARACTER_COLOR_CLASSES.blue;

            return (
              <button
                key={char.id}
                type="button"
                onClick={() => setSelectedCharacterFilter(char.id)}
                className={`text-xs px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1.5 transition-all border ${
                  isSelected
                    ? `${col.bg} ${col.text} ${col.border} ring-1 ${col.ring} font-bold`
                    : 'bg-[#0e1320] text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <span>{char.avatarEmoji}</span>
                <span className="truncate max-w-[100px]">{char.name}</span>
                <span className="text-[10px] font-mono opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Text search input */}
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder={uiLang === 'km' ? 'ស្វែងរកអត្ថបទសន្ទនា...' : 'Search dialogue...'}
          className="w-full bg-[#0c101c] text-white text-xs px-3.5 py-2 rounded-xl border border-white/10 focus:border-rose-500 focus:outline-none placeholder:text-slate-500"
        />
      </div>

      {/* Subtitles List */}
      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
        {filteredSubs.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-dashed border-slate-700 text-slate-400 text-sm">
            {uiLang === 'km' ? 'គ្មានចំណងជើងរងត្រូវគ្នានឹងការស្វែងរកទេ' : 'No subtitle lines found.'}
          </div>
        ) : (
          filteredSubs.map((sub, index) => {
            const isActive =
              currentTime >= sub.startTime && currentTime <= sub.endTime;
            const matchedChar = getSubCharacter(sub);
            const col = matchedChar
              ? CHARACTER_COLOR_CLASSES[matchedChar.color] || CHARACTER_COLOR_CLASSES.blue
              : CHARACTER_COLOR_CLASSES.amber;

            return (
              <div
                key={sub.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-[#151d2f] border-rose-500/80 ring-1 ring-rose-500/30 shadow-lg shadow-rose-950/20'
                    : 'bg-[#0d1220]/80 border-white/[0.08] hover:border-white/20'
                }`}
              >
                {/* Row Top: Index, Speaker Selector Dropdown, Timing badges, Controls */}
                <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap relative">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-rose-400 font-mono text-xs font-bold flex items-center justify-center border border-white/10">
                      {index + 1}
                    </span>

                    {/* Character Speaker Selector Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveDropdownSubId(
                            activeDropdownSubId === sub.id ? null : sub.id
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${col.bg} ${col.text} ${col.border} hover:opacity-90 active:scale-95`}
                        title={t.assignSpeaker}
                      >
                        <span>{matchedChar?.avatarEmoji || '👤'}</span>
                        <span className="font-semibold max-w-[130px] truncate">
                          {matchedChar?.name || sub.speaker || t.assignSpeaker}
                        </span>
                        <ChevronDown className="w-3 h-3 opacity-70" />
                      </button>

                      {/* Dropdown Menu to choose speaker */}
                      {activeDropdownSubId === sub.id && (
                        <div className="absolute top-full left-0 mt-1 z-30 w-56 bg-[#0e1424] border border-white/20 rounded-xl p-1.5 shadow-2xl space-y-1 backdrop-blur-xl">
                          <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-white/10 flex items-center justify-between">
                            <span>{t.assignSpeaker}</span>
                            {onOpenCharacterManager && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownSubId(null);
                                  onOpenCharacterManager();
                                }}
                                className="text-rose-400 hover:text-rose-300 font-medium lowercase"
                              >
                                + {uiLang === 'km' ? 'បង្កើតថ្មី' : 'new'}
                              </button>
                            )}
                          </div>
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {characters.map((char) => {
                              const charCol =
                                CHARACTER_COLOR_CLASSES[char.color] ||
                                CHARACTER_COLOR_CLASSES.blue;
                              const isCurrent =
                                sub.characterId === char.id || sub.speaker === char.name;

                              return (
                                <button
                                  key={char.id}
                                  type="button"
                                  onClick={() => handleAssignCharacter(sub.id, char)}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                    isCurrent
                                      ? `${charCol.bg} ${charCol.text} font-bold`
                                      : 'text-slate-200 hover:bg-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span>{char.avatarEmoji}</span>
                                    <span className="truncate">{char.name}</span>
                                  </div>
                                  {isCurrent && <UserCheck className="w-3.5 h-3.5 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-xs font-mono text-slate-300 bg-[#161d2d] px-2.5 py-0.5 rounded-md border border-white/10 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatTime(sub.startTime)} ➔ {formatTime(sub.endTime)}
                    </span>
                  </div>

                  {/* Actions: Audition Line, Play Video, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAuditionLine(sub)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors border border-white/5"
                      title={uiLang === 'km' ? 'ស្តាប់សំឡេងតួអង្គជួរនេះ' : 'Audition character line'}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSeekTo(sub.startTime)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-rose-400 hover:text-white transition-colors border border-white/5"
                      title={t.playFromHere}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(sub.id)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors border border-white/5"
                      title={t.deleteSubtitle}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Chinese Source Text */}
                <div className="mb-2">
                  <label className="block text-[10px] uppercase font-bold text-amber-300/80 mb-1 tracking-wider">
                    {t.chineseText}
                  </label>
                  <input
                    type="text"
                    value={sub.sourceText}
                    onChange={(e) => handleUpdateChineseText(sub.id, e.target.value)}
                    className="w-full bg-[#111728] text-amber-100 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl border border-white/10 focus:border-rose-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Khmer Translation (Primary Edit) */}
                <div className="mb-3">
                  <label className="block text-[10px] uppercase font-bold text-rose-400 mb-1 tracking-wider flex items-center justify-between">
                    <span>{t.khmerText}</span>
                    {matchedChar && (
                      <span className="text-[10px] lowercase opacity-80 text-slate-400">
                        {matchedChar.gender === 'female' ? 'សំឡេងស្រី' : 'សំឡេងប្រុស'} • pitch {matchedChar.pitch}
                      </span>
                    )}
                  </label>
                  <textarea
                    rows={2}
                    value={sub.khmerText}
                    onChange={(e) => handleUpdateKhmerText(sub.id, e.target.value)}
                    className="w-full bg-[#111728] text-white text-xs sm:text-sm font-medium px-3 py-2 rounded-xl border border-white/10 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none resize-none leading-relaxed transition-colors"
                    style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
                  />
                </div>

                {/* Timing Fine-Tuning Controls */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.08]">
                  {/* Start time adjuster */}
                  <div className="flex items-center justify-between bg-[#111728] px-2.5 py-1.5 rounded-xl border border-white/5 text-xs">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider">{t.startSec}:</span>
                    <span className="font-mono text-white font-semibold text-xs">{sub.startTime.toFixed(2)}s</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleNudge(sub.id, 'startTime', -0.1)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] active:scale-95"
                      >
                        -0.1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNudge(sub.id, 'startTime', 0.1)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] active:scale-95"
                      >
                        +0.1
                      </button>
                    </div>
                  </div>

                  {/* End time adjuster */}
                  <div className="flex items-center justify-between bg-[#111728] px-2.5 py-1.5 rounded-xl border border-white/5 text-xs">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider">{t.endSec}:</span>
                    <span className="font-mono text-white font-semibold text-xs">{sub.endTime.toFixed(2)}s</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleNudge(sub.id, 'endTime', -0.1)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] active:scale-95"
                      >
                        -0.1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNudge(sub.id, 'endTime', 0.1)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] active:scale-95"
                      >
                        +0.1
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
