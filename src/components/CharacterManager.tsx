import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Volume2,
  Sparkles,
  Check,
  X,
  Sliders,
  Crown,
} from 'lucide-react';
import { DramaCharacter, AppUiLang, SubtitleSegment } from '../types';
import { UI_TEXT } from '../data/translations';
import { khmerTts } from '../utils/khmerTts';
import { CHARACTER_COLOR_CLASSES } from '../data/defaultCharacters';

interface CharacterManagerProps {
  characters: DramaCharacter[];
  onAddCharacter: (character: DramaCharacter) => void;
  onUpdateCharacter: (character: DramaCharacter) => void;
  onDeleteCharacter: (id: string) => void;
  subtitles: SubtitleSegment[];
  uiLang: AppUiLang;
}

const EMOJI_OPTIONS = ['🤴', '👸', '🌸', '⚔️', '🎙️', '🛡️', '🎀', '🦹', '👴', '👶', '👑', '🎭'];
const COLOR_OPTIONS = ['blue', 'rose', 'emerald', 'amber', 'purple', 'cyan'];

const ROLE_PRESETS: {
  role: DramaCharacter['role'];
  labelKm: string;
  labelEn: string;
  gender: DramaCharacter['gender'];
  pitch: number;
  rate: number;
  color: string;
  emoji: string;
}[] = [
  {
    role: 'male_lead',
    labelKm: 'តួឯកប្រុស (Male Lead)',
    labelEn: 'Male Lead',
    gender: 'male',
    pitch: 0.88,
    rate: 0.98,
    color: 'blue',
    emoji: '🤴',
  },
  {
    role: 'female_lead',
    labelKm: 'តួឯកស្រី (Female Lead)',
    labelEn: 'Female Lead',
    gender: 'female',
    pitch: 1.25,
    rate: 1.02,
    color: 'rose',
    emoji: '👸',
  },
  {
    role: 'villain',
    labelKm: 'តួចិត្តអាក្រក់ (Villain)',
    labelEn: 'Villain',
    gender: 'male',
    pitch: 0.76,
    rate: 0.95,
    color: 'purple',
    emoji: '⚔️',
  },
  {
    role: 'narrator',
    labelKm: 'អ្នកនិទានរឿង (Narrator)',
    labelEn: 'Narrator',
    gender: 'neutral',
    pitch: 1.0,
    rate: 0.92,
    color: 'amber',
    emoji: '🎙️',
  },
  {
    role: 'female_support',
    labelKm: 'តួអង្គរងស្រី (Female Support)',
    labelEn: 'Female Support',
    gender: 'female',
    pitch: 1.15,
    rate: 1.0,
    color: 'emerald',
    emoji: '🌸',
  },
  {
    role: 'male_support',
    labelKm: 'តួអង្គរងប្រុស (Male Support)',
    labelEn: 'Male Support',
    gender: 'male',
    pitch: 0.95,
    rate: 1.0,
    color: 'cyan',
    emoji: '🛡️',
  },
  {
    role: 'elder',
    labelKm: 'មនុស្សចាស់ (Elder / Master)',
    labelEn: 'Elder / Master',
    gender: 'male',
    pitch: 0.8,
    rate: 0.88,
    color: 'amber',
    emoji: '👴',
  },
  {
    role: 'child',
    labelKm: 'កុមារ / កូនតូច (Child)',
    labelEn: 'Child',
    gender: 'female',
    pitch: 1.35,
    rate: 1.05,
    color: 'rose',
    emoji: '👶',
  },
];

export const CharacterManager: React.FC<CharacterManagerProps> = ({
  characters,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  subtitles,
  uiLang,
}) => {
  const t = UI_TEXT[uiLang];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState<DramaCharacter['role']>('male_lead');
  const [gender, setGender] = useState<DramaCharacter['gender']>('male');
  const [pitch, setPitch] = useState<number>(1.0);
  const [rate, setRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [color, setColor] = useState<string>('blue');
  const [avatarEmoji, setAvatarEmoji] = useState<string>('🤴');

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setRole('male_lead');
    setGender('male');
    setPitch(0.9);
    setRate(1.0);
    setVolume(1.0);
    setColor('blue');
    setAvatarEmoji('🤴');
    setIsModalOpen(true);
  };

  const openEditModal = (char: DramaCharacter) => {
    setEditingId(char.id);
    setName(char.name);
    setRole(char.role);
    setGender(char.gender);
    setPitch(char.pitch);
    setRate(char.rate);
    setVolume(char.volume ?? 1.0);
    setColor(char.color);
    setAvatarEmoji(char.avatarEmoji);
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset: typeof ROLE_PRESETS[0]) => {
    setRole(preset.role);
    setGender(preset.gender);
    setPitch(preset.pitch);
    setRate(preset.rate);
    setColor(preset.color);
    setAvatarEmoji(preset.emoji);
    if (!name.trim()) {
      setName(uiLang === 'km' ? preset.labelKm : preset.labelEn);
    }
  };

  const handleTestVoice = (charPitch: number, charRate: number, charName?: string) => {
    const samplePhrase =
      uiLang === 'km'
        ? `ខ្ញុំគឺ ${charName || name || 'តួអង្គនិយាយ'} នេះជាសំឡេងនិយាយក្នុងរឿងភាគ។`
        : `I am ${charName || name || 'the speaker'}, this is my drama voice.`;
    khmerTts.speak(samplePhrase, charRate, charPitch);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || (uiLang === 'km' ? 'តួអង្គថ្មី' : 'New Character');

    if (editingId) {
      onUpdateCharacter({
        id: editingId,
        name: finalName,
        role,
        gender,
        pitch,
        rate,
        volume,
        color,
        avatarEmoji,
      });
    } else {
      const newChar: DramaCharacter = {
        id: `char-${Date.now()}`,
        name: finalName,
        role,
        gender,
        pitch,
        rate,
        volume,
        color,
        avatarEmoji,
      };
      onAddCharacter(newChar);
    }

    setIsModalOpen(false);
  };

  // Calculate lines spoken by each character
  const getLineCount = (char: DramaCharacter) => {
    return subtitles.filter(
      (s) => s.characterId === char.id || s.speaker === char.name
    ).length;
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.08]">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-400" />
            <span>{t.characters}</span>
            <span className="bg-rose-500/20 text-rose-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-rose-500/30">
              {characters.length}
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            {uiLang === 'km'
              ? 'បន្ថែមតួអង្គនិយាយ កំណត់សំឡេង (ប្រុស/ស្រី/គ្រលរ) សម្រាប់អានតាមសាច់រឿង'
              : 'Add speaking characters and tune personalized voices for drama dubbing'}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 active:scale-95 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addCharacter}</span>
        </button>
      </div>

      {/* Characters List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {characters.map((char) => {
          const colorStyles = CHARACTER_COLOR_CLASSES[char.color] || CHARACTER_COLOR_CLASSES.blue;
          const lineCount = getLineCount(char);

          return (
            <div
              key={char.id}
              className="p-3.5 rounded-2xl bg-[#0e1424]/90 border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner ${colorStyles.bg} border ${colorStyles.border}`}
                    >
                      {char.avatarEmoji}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {char.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${colorStyles.bg} ${colorStyles.text} ${colorStyles.border}`}
                        >
                          {char.gender === 'female'
                            ? (uiLang === 'km' ? 'សំឡេងស្រី' : 'Female')
                            : char.gender === 'male'
                            ? (uiLang === 'km' ? 'សំឡេងប្រុស' : 'Male')
                            : (uiLang === 'km' ? 'និទាន' : 'Narrator')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {lineCount} {uiLang === 'km' ? 'បន្ទាត់' : 'lines'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTestVoice(char.pitch, char.rate, char.name)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-rose-400 hover:text-white transition-colors border border-white/5"
                      title={t.testVoice}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(char)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-white/5"
                      title={t.editCharacter}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {characters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteCharacter(char.id)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors border border-white/5"
                        title={uiLang === 'km' ? 'លុបតួអង្គ' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Voice specs */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 bg-[#121829] px-2.5 py-1.5 rounded-xl border border-white/5 font-mono">
                  <span>
                    {uiLang === 'km' ? 'កម្រិត' : 'Pitch'}:{' '}
                    <strong className="text-slate-200">{char.pitch.toFixed(2)}</strong>
                  </span>
                  <span>
                    {uiLang === 'km' ? 'ល្បឿន' : 'Speed'}:{' '}
                    <strong className="text-slate-200">{char.rate.toFixed(2)}x</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Character Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {editingId ? t.editCharacter : t.addCharacter}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick presets */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">
                  {uiLang === 'km' ? 'ជ្រើសរើសគំរូតួនាទីរហ័ស (Quick Role Presets)' : 'Quick Role Presets'}
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {ROLE_PRESETS.map((preset) => (
                    <button
                      key={preset.role}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                        role === preset.role
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500 font-semibold'
                          : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <span>{preset.emoji}</span>
                      <span>{uiLang === 'km' ? preset.labelKm : preset.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Character Name */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1 tracking-wider">
                  {t.characterName} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    uiLang === 'km'
                      ? 'ឧ. លី ស៊ាវឡុង (Li Xiaolong), ព្រះអង្គម្ចាស់...'
                      : 'e.g. Prince Liang, Male Lead, General...'
                  }
                  className="w-full bg-slate-800 text-white text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* Emoji Avatar & Color Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Avatar Emoji */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
                    {uiLang === 'km' ? 'រូបសញ្ញាតំណាង (Avatar Emoji)' : 'Avatar Emoji'}
                  </label>
                  <div className="flex flex-wrap gap-1 bg-slate-800/80 p-2 rounded-xl border border-slate-700/80">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAvatarEmoji(emoji)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-transform ${
                          avatarEmoji === emoji
                            ? 'bg-rose-500 scale-110 shadow-md text-white'
                            : 'hover:bg-slate-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Badge */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
                    {uiLang === 'km' ? 'ពណ៌តំណាង (Badge Color)' : 'Badge Color'}
                  </label>
                  <div className="flex flex-wrap gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 items-center">
                    {COLOR_OPTIONS.map((col) => {
                      const colClass = CHARACTER_COLOR_CLASSES[col];
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setColor(col)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform flex items-center justify-center ${
                            colClass.tagBg
                          } ${
                            color === col ? 'ring-2 ring-white scale-110' : 'border-slate-800 opacity-80'
                          }`}
                        >
                          {color === col && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pitch & Rate Controls */}
              <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/70 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-rose-400" />
                    <span>{uiLang === 'km' ? 'កែសម្រួលសំឡេង (Pitch & Speed)' : 'Voice Tuning'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTestVoice(pitch, rate)}
                    className="px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-[11px] font-bold flex items-center gap-1 border border-rose-500/40"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>{t.testCharacterVoice}</span>
                  </button>
                </div>

                {/* Pitch slider */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>{t.pitch} (គ្រលរទាប ➔ ស្រួចខ្ពស់)</span>
                    <span className="font-mono text-white font-bold">{pitch.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.4"
                    step="0.05"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 mt-0.5 font-mono">
                    <span>0.70 (ជ្រៅ/គ្រលរ)</span>
                    <span>1.00 (ធម្មតា)</span>
                    <span>1.40 (ស្រួច/ក្មេង)</span>
                  </div>
                </div>

                {/* Per-character volume */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>{uiLang === 'km' ? 'កម្រិតសំឡេងតួអង្គ' : 'Character Volume'}</span>
                    <span className="font-mono text-white font-bold">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Rate slider */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>{t.rate} (យឺត ➔ លឿន)</span>
                    <span className="font-mono text-white font-bold">{rate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 font-bold text-white text-xs transition-all shadow-md shadow-rose-950/50 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? (uiLang === 'km' ? 'រក្សាទុកការកែប្រែ' : 'Save Changes') : t.addCharacter}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium text-slate-300 text-xs transition-all"
                >
                  {uiLang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
