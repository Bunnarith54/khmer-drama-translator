export interface DramaCharacter {
  id: string;
  name: string;
  role: 'male_lead' | 'female_lead' | 'male_support' | 'female_support' | 'villain' | 'narrator' | 'elder' | 'child' | 'custom';
  gender: 'male' | 'female' | 'neutral';
  pitch: number;      // 0.7 - 1.4
  rate: number;       // 0.8 - 1.3
  volume?: number;    // 0 - 1.5 (per-character gain)
  color: string;      // Tailwind color identifier e.g. "blue", "rose", "emerald", "amber", "purple", "cyan"
  avatarEmoji: string;
  geminiVoice?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede';
}

export interface SubtitleSegment {
  id: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  sourceText: string;
  khmerText: string;
  speaker?: string;
  characterId?: string;
}

export type SubtitlePosition = 'top' | 'center' | 'bottom';
export type SubtitleFontSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';

export interface SubtitleStyle {
  fontSize: SubtitleFontSize;
  position: SubtitlePosition;
  textColor: string;
  backgroundColor: 'none' | 'translucent' | 'solid';
  hasShadow: boolean;
  showSpeakerBadge?: boolean;
  showKhmerSubtitles?: boolean;   // Control showing Khmer subtitles on video
  showSourceSubtitles?: boolean;  // Control showing original Chinese subtitles on video
  opacity?: number;               // 0.2 - 1.0 subtitle opacity
}

export type ProcessingStep =
  | 'idle'
  | 'extracting_audio'
  | 'speech_recognition'
  | 'translation'
  | 'generating_subtitles'
  | 'generating_voice'
  | 'completed'
  | 'error';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export type AppUiLang = 'km' | 'en';
