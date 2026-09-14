import { apiUrl } from './api';
// Audio cache & Khmer TTS Engine
// Combines Gemini Studio TTS Voices (Puck, Charon, Kore, Fenrir, Aoede)
// with browser Web Speech API fallback for 100% reliable, natural drama voices.

export interface SpeakOptions {
  text: string;
  voiceName?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede';
  gender?: 'male' | 'female' | 'neutral';
  rate?: number;
  pitch?: number;
  apiKey?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class KhmerTtsEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isMuted: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache = new Map<string, string>(); // cache key => base64 wav
  private isSpeakingFlag = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.warmupBrowserVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.warmupBrowserVoice();
      }
    }
  }

  private warmupBrowserVoice() {
    if (!this.synth) return;
    try {
      this.synth.getVoices();
    } catch {
      // ignore
    }
  }

  // Get best voice match for gender from installed browser voices
  private findBrowserVoice(gender: 'male' | 'female' | 'neutral' = 'male'): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Look for Khmer voice
    const khmerVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes('km') ||
        v.name.toLowerCase().includes('khmer') ||
        v.name.toLowerCase().includes('cambodia')
    );
    if (khmerVoice) return khmerVoice;

    // 2. Gender heuristics for other languages
    const isFemalePreferred = gender === 'female';
    const femaleKeywords = ['female', 'woman', 'girl', 'zira', 'samantha', 'victoria', 'karen', 'ting-ting', 'mei-jia', 'hui-hui', 'xiaoxiao'];
    const maleKeywords = ['male', 'man', 'boy', 'david', 'george', 'mark', 'daniel', 'richard', 'yunxi', 'yunjian', 'kangkang'];

    const targetKeywords = isFemalePreferred ? femaleKeywords : maleKeywords;
    const genderMatch = voices.find((v) =>
      targetKeywords.some((kw) => v.name.toLowerCase().includes(kw))
    );
    if (genderMatch) return genderMatch;

    return voices[0] || null;
  }

  /**
   * Main Speak Method
   * Tries Gemini Cloud Drama Voice first (deep, rich male lead, sweet female lead, narrator),
   * and falls back to Web Speech API instantly if network/offline.
   */
  public async speak(options: SpeakOptions | string, rate: number = 1.0, pitch: number = 1.0): Promise<void> {
    const opts: SpeakOptions =
      typeof options === 'string'
        ? { text: options, rate, pitch }
        : options;

    const trimmedText = opts.text?.trim();
    if (!trimmedText || this.isMuted) {
      opts.onEnd?.();
      return;
    }

    // Stop currently playing audio / utterance
    this.stop();
    this.isSpeakingFlag = true;
    opts.onStart?.();

    // Map gender/role to standard Gemini Voices:
    // Male lead / general male => Puck (natural, expressive, charismatic male)
    // Villain / deep authority => Fenrir (deep, ominous, commanding male)
    // Female lead => Kore (melodic, warm female)
    // Female support / tender => Aoede (gentle, soft female)
    // Narrator => Charon (clear, steady, cinematic narrator)
    let selectedVoice = opts.voiceName;
    if (!selectedVoice) {
      if (opts.gender === 'female') {
        selectedVoice = 'Kore';
      } else if (opts.gender === 'neutral') {
        selectedVoice = 'Charon';
      } else {
        selectedVoice = 'Puck';
      }
    }

    const cacheKey = `${selectedVoice}_${trimmedText}`;
    const cachedAudio = this.audioCache.get(cacheKey);

    // 1. Try playing from cache or requesting from Gemini TTS backend
    if (cachedAudio) {
      try {
        await this.playAudioBase64(cachedAudio);
        this.isSpeakingFlag = false;
        opts.onEnd?.();
        return;
      } catch (err) {
        console.warn('Cache play failed, falling back to speech', err);
      }
    }

    try {
      const response = await fetch(apiUrl('/api/tts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmedText,
          voice: selectedVoice,
          apiKey: opts.apiKey,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioData) {
          this.audioCache.set(cacheKey, data.audioData);
          await this.playAudioBase64(data.audioData, data.mimeType || 'audio/wav');
          this.isSpeakingFlag = false;
          opts.onEnd?.();
          return;
        }
      }
    } catch (apiErr) {
      console.warn('Gemini TTS network call fallback to client speech:', apiErr);
    }

    // 2. Client Web Speech API Fallback (with gender pitch/rate calibration)
    await this.speakViaWebSpeech(trimmedText, opts);
    this.isSpeakingFlag = false;
    opts.onEnd?.();
  }

  private speakViaWebSpeech(text: string, opts: SpeakOptions): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth || typeof window === 'undefined') {
        resolve();
        return;
      }

      try {
        // Cancel any pending speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = this.findBrowserVoice(opts.gender || 'male');
        if (voice) {
          utterance.voice = voice;
        }

        // Apply pitch calibration:
        // For male: lower pitch (0.7 - 0.95) to sound distinctly masculine
        // For female: higher pitch (1.1 - 1.3)
        let finalPitch = opts.pitch ?? 1.0;
        let finalRate = opts.rate ?? 1.0;

        if (opts.gender === 'male' && finalPitch >= 1.0) {
          finalPitch = 0.85;
        } else if (opts.gender === 'female' && finalPitch <= 1.0) {
          finalPitch = 1.2;
        }

        utterance.pitch = Math.max(0.6, Math.min(1.4, finalPitch));
        utterance.rate = Math.max(0.8, Math.min(1.4, finalRate));
        utterance.lang = 'km-KH';

        utterance.onend = () => {
          this.currentUtterance = null;
          resolve();
        };

        utterance.onerror = (e) => {
          console.warn('SpeechSynthesis error:', e);
          this.currentUtterance = null;
          resolve();
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
      } catch (err) {
        console.warn('Browser TTS execution error:', err);
        resolve();
      }
    });
  }

  private playAudioBase64(base64Data: string, mimeType = 'audio/wav'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isMuted) {
        resolve();
        return;
      }

      this.stop();

      try {
        const audio = new Audio(`data:${mimeType};base64,${base64Data}`);
        this.currentAudio = audio;

        audio.onended = () => {
          this.currentAudio = null;
          resolve();
        };

        audio.onerror = (err) => {
          this.currentAudio = null;
          reject(err);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            this.currentAudio = null;
            reject(e);
          });
        }
      } catch (err) {
        this.currentAudio = null;
        reject(err);
      }
    });
  }

  public stop() {
    this.isSpeakingFlag = false;
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingFlag || Boolean(this.synth?.speaking) || Boolean(this.currentAudio && !this.currentAudio.paused);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }
}

export const khmerTts = new KhmerTtsEngine();
