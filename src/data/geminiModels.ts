export interface GeminiModelInfo {
  id: string;
  name: string;
  generation: string;
  badge: string;
  descriptionKm: string;
  descriptionEn: string;
  isRecommended?: boolean;
  supportsTranslation?: boolean;
}

export interface ModelGenerationGroup {
  generation: string;
  titleKm: string;
  titleEn: string;
  models: GeminiModelInfo[];
}

// Verified against Google's current Gemini API model catalog.
// Translation models are kept separate from image/TTS/live-only models so the
// main video translation workflow cannot accidentally receive an incompatible model.
export const GEMINI_MODEL_GROUPS: ModelGenerationGroup[] = [
  {
    generation: 'Gemini 3.8',
    titleKm: 'Gemini 3.8 — Flagship Flash',
    titleEn: 'Gemini 3.8 — Flagship Flash',
    models: [{
      id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', generation: '3.8', badge: 'Recommended',
      descriptionKm: 'ឆ្លាតវៃ និងលឿន សមស្របសម្រាប់បកប្រែរឿងភាគ និងវីដេអូ',
      descriptionEn: 'Flagship Flash model for fast, intelligent drama and video translation', isRecommended: true, supportsTranslation: true,
    }],
  },
  {
    generation: 'Gemini 3.7 / 3.6 / 3.5',
    titleKm: 'Gemini 3.x — Flash',
    titleEn: 'Gemini 3.x — Flash',
    models: [
      { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', generation: '3.7', badge: 'Fast + Smart', descriptionKm: 'សម្រាប់ការងារស្មុគស្មាញ និងលឿន', descriptionEn: 'Fast model for complex multi-step tasks', supportsTranslation: true },
      { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', generation: '3.6', badge: 'Balanced', descriptionKm: 'តុល្យភាពល្អរវាងល្បឿន និងសមត្ថភាព Multimodal', descriptionEn: 'Balanced speed and multimodal capability', supportsTranslation: true },
      { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', generation: '3.5', badge: 'Stable', descriptionKm: 'សម្រាប់ការងារទូទៅ និងដំណើរការច្រើន', descriptionEn: 'Stable Flash model for routine high-throughput work', supportsTranslation: true },
      { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite', generation: '3.5', badge: 'Low Cost', descriptionKm: 'លឿន និងសន្សំសំចៃ សម្រាប់ការងារច្រើន', descriptionEn: 'Fast, cost-efficient model for high-volume workloads', supportsTranslation: true },
    ],
  },
  {
    generation: 'Gemini 3.1',
    titleKm: 'Gemini 3.1 — Pro & Flash-Lite',
    titleEn: 'Gemini 3.1 — Pro & Flash-Lite',
    models: [
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', generation: '3.1', badge: 'Deep Reasoning', descriptionKm: 'សម្រាប់ការបកប្រែសាច់រឿងស្មុគស្មាញ ពាក្យសំនួន និងបរិបទ', descriptionEn: 'Deep reasoning for nuanced dialogue, context and complex stories', supportsTranslation: true },
      { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', generation: '3.1', badge: 'Ultra Fast', descriptionKm: 'សន្សំសំចៃ និងលឿន សម្រាប់បកប្រែច្រើនៗ', descriptionEn: 'High-throughput, cost-efficient Flash-Lite model', supportsTranslation: true },
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', generation: '3.0', badge: 'Preview', descriptionKm: 'Flash ជំនាន់ 3 សម្រាប់ល្បឿន និងសមត្ថភាពខ្ពស់', descriptionEn: 'Preview Flash model with strong speed and capability', supportsTranslation: true },
    ],
  },
  {
    generation: 'Gemini 2.5',
    titleKm: 'Gemini 2.5 — Stable Alternatives',
    titleEn: 'Gemini 2.5 — Stable Alternatives',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', generation: '2.5', badge: 'High Quality', descriptionKm: 'Reasoning ខ្លាំងសម្រាប់ការងារស្មុគស្មាញ', descriptionEn: 'Advanced reasoning for complex tasks', supportsTranslation: true },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', generation: '2.5', badge: 'Price / Performance', descriptionKm: 'តុល្យភាពល្អសម្រាប់ការងារលឿន និងច្រើន', descriptionEn: 'Strong price-performance for low-latency workloads', supportsTranslation: true },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', generation: '2.5', badge: 'Budget', descriptionKm: 'ជម្រើសសន្សំសំចៃសម្រាប់ការងារច្រើន', descriptionEn: 'Budget-friendly multimodal model', supportsTranslation: true },
    ],
  },
];

export const ALL_GEMINI_MODELS: GeminiModelInfo[] = GEMINI_MODEL_GROUPS.flatMap((group) => group.models);
export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

// Specialized models used by future Audio/Voice features.
export const GEMINI_AUDIO_MODELS = [
  { id: 'gemini-3.5-transcribe', name: 'Gemini 3.5 Transcribe', badge: 'Speech → Text' },
  { id: 'gemini-3.5-transcribe-live', name: 'Gemini 3.5 Transcribe Live', badge: 'Live Speech' },
  { id: 'gemini-3.1-flash-tts-preview', name: 'Gemini 3.1 Flash TTS', badge: 'Text → Speech' },
  { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash TTS', badge: 'Fast TTS' },
  { id: 'gemini-2.5-pro-preview-tts', name: 'Gemini 2.5 Pro TTS', badge: 'High Fidelity TTS' },
  { id: 'gemini-3.1-flash-live-preview', name: 'Gemini 3.1 Flash Live', badge: 'Realtime Audio' },
  { id: 'gemini-3.5-live-translate-preview', name: 'Gemini 3.5 Live Translate', badge: 'Realtime Translation' },
];
